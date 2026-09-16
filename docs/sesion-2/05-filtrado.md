# 5. Filtrado

Filtrar consiste en conservar únicamente los eventos que cumplen una condición.
Es una de las tareas más frecuentes en Splunk: localizar errores, aislar un
host, investigar una URI o separar una ventana de tiempo concreta.

Un filtro correcto debe responder a una pregunta clara y utilizar campos que
hayas validado previamente. Si un filtro devuelve cero eventos, no asumas
inmediatamente que la condición es incorrecta: comprueba también el índice, el
rango temporal, el nombre del campo y los permisos de lectura.

## Filtrar desde la búsqueda base

La forma más directa es añadir condiciones después del índice:

```spl
index=curso status=404
```

También puedes combinar varios campos. En este caso deben cumplirse todos:

```spl
index=curso host=web-01 method=GET status=404
```

El filtro inicial es especialmente importante en un entorno con permisos de
administrador, porque reduce el volumen de datos que debe revisar Splunk y deja
claro qué índice y qué condiciones forman parte de la búsqueda.

## `search` después de un comando

El comando `search` permite añadir condiciones a los resultados que ya produce
la búsqueda:

```spl
index=curso
| search status=404
| table _time host method status uri
```

Para filtros sencillos, estas dos formas suelen ser equivalentes:

```spl
index=curso status=404
```

```spl
index=curso
| search status=404
```

Como buena práctica, coloca los filtros de índice y de campos conocidos al
principio. Usa `search` después de un comando cuando necesites filtrar una
salida intermedia o hacer más legible la progresión de la consulta.

## Operadores booleanos

### `AND`

En una búsqueda con varios términos, el espacio suele representar una
conjunción. También puedes escribir `AND` explícitamente:

```spl
index=curso method=GET AND status=404
```

Usa la forma explícita cuando ayude a leer una consulta larga.

### `OR`

`OR` permite buscar alternativas:

```spl
index=curso status=404 OR status=500
```

Agrupa las alternativas para evitar ambigüedades, especialmente cuando hay más
condiciones:

```spl
index=curso method=GET (status=404 OR status=500)
```

### `NOT` y `!=`

Puedes excluir un valor concreto:

```spl
index=curso status!=200
```

O excluir una condición completa:

```spl
index=curso NOT method=HEAD
```

Recuerda que `status!=200` no necesariamente incluye eventos en los que
`status` no existe. Si la ausencia también es relevante, exprésala:

```spl
index=curso (status!=200 OR NOT status=*)
```

## Comparaciones y valores

Las comparaciones son útiles cuando el campo contiene valores numéricos, como
los códigos HTTP:

```spl
index=curso status>=400
index=curso status>=400 status<600
```

Si un valor incluye espacios o caracteres especiales, ponlo entre comillas:

```spl
index=curso uri="/api/login"
```

Para coincidencias parciales puedes utilizar `*`:

```spl
index=curso uri="/api/*"
```

El comodín no sustituye una validación del campo. Si `uri` no se ha extraído,
la consulta no encontrará coincidencias aunque el texto aparezca en `_raw`.

## Filtrar por existencia de campos

Para conservar eventos que tienen un campo:

```spl
index=curso method=*
```

Para localizar eventos sin ese campo:

```spl
index=curso NOT method=*
```

Este patrón es útil para detectar cambios de formato o problemas de extracción.
Combínalo con `_raw` para comprobar si el dato existe en el evento original:

```spl
index=curso NOT uri=*
| table _time _raw host source sourcetype
```

## `where`: filtrar con expresiones

`where` evalúa una expresión sobre los resultados y es útil para comparar
campos entre sí o usar funciones:

```spl
index=curso
| where status >= 400
| table _time host status uri
```

También permite comparar dos campos:

```spl
index=curso
| where host!=""
| table _time host status uri
```

Una diferencia importante es que `where` trabaja sobre campos que ya están
disponibles en ese punto de la tubería. No lo uses como sustituto automático de
un filtro inicial: para una condición sencilla sobre el índice, es preferible
aplicarla cuanto antes.

## `regex`: filtrar con expresiones regulares

Cuando una condición de texto es más específica que un comodín, puedes usar
`regex`:

```spl
index=curso
| regex uri="^/api/"
| table _time host status uri
```

Este ejemplo conserva las URI que empiezan por `/api/`. Las expresiones
regulares distinguen detalles como el inicio (`^`), el final (`$`) y los
caracteres especiales. Pruébalas con pocos eventos y documenta el patrón,
porque una expresión demasiado amplia o demasiado restrictiva puede ocultar
datos.

## Secuencia práctica de filtrado

Para investigar errores HTTP en el dataset del curso, añade condiciones de una
en una:

### 1. Confirma que hay eventos

```spl
index=curso
| head 20
```

### 2. Aísla los errores

```spl
index=curso status>=400
```

### 3. Limita el host y la operación

```spl
index=curso host=web-01 method=GET status>=400
```

### 4. Presenta los campos relevantes

```spl
index=curso host=web-01 method=GET status>=400
| table _time host method status uri
| sort - _time
```

### 5. Investiga una URI concreta

```spl
index=curso status>=400 uri="/missing"
| table _time host method status uri
```

Si una etapa devuelve cero resultados, vuelve a la etapa anterior. Así sabrás
qué condición elimina los eventos y no tendrás que depurar una consulta entera
a ciegas.

## Filtros y rendimiento

Un filtro temprano suele reducir el número de eventos que deben procesarse:

```spl
index=curso status>=400
| fields _time host method status uri
| sort - _time
```

Evita empezar con `index=*` o aplicar una expresión regular sobre todos los
índices si la pregunta solo afecta al índice `curso`. Limitar índice, tiempo y
campos ayuda a que la búsqueda sea más rápida y más fácil de revisar.

No elimines `_raw` ni los metadatos antes de validar un problema de ingesta.
Para una búsqueda final o una tabla de presentación sí puedes conservar solo
los campos necesarios.

## Casos prácticos para asistentes

### Peticiones de autenticación con error

```spl
index=curso uri="/login" status>=400
| table _time host method status uri
| sort - _time
```

### Eventos de una familia de URI

```spl
index=curso
| regex uri="^/api/"
| table _time host method status uri
```

### Revisar eventos incompletos

```spl
index=curso (NOT host=* OR NOT status=* OR NOT uri=*)
| table _time _raw host source sourcetype status uri
```

Esta consulta sirve para detectar problemas de calidad, pero no sustituye la
revisión del formato de la fuente ni de la configuración de extracción.

## Diagnóstico de filtros que no funcionan

| Síntoma | Posible causa | Acción |
|---|---|---|
| Cero resultados desde el principio | Índice, tiempo o permisos incorrectos. | Probar `index=curso` con un rango amplio. |
| Cero resultados al añadir un campo | Campo mal escrito o no extraído. | Revisar el evento y `fieldsummary`. |
| Aparecen eventos inesperados | Condiciones sin agrupar o filtro demasiado amplio. | Añadir paréntesis y probar cada parte. |
| `status>=400` no funciona como esperas | El campo puede ser texto o estar ausente. | Revisar valores reales y el `sourcetype`. |
| `regex` no encuentra coincidencias | Patrón incorrecto o campo vacío. | Probar primero el campo con `table` y pocos eventos. |
| `NOT campo=*` parece incompleto | La búsqueda no incluye todos los eventos visibles. | Revisar rango temporal y existencia real del campo. |

Como administrador, revisa **Settings > Data inputs** y el `sourcetype` cuando
el problema afecte a muchos eventos. No corrijas una extracción global solo para
resolver una consulta aislada sin confirmar el impacto en otras búsquedas.

## Buenas prácticas

- Empieza por el índice y el intervalo temporal.
- Añade un filtro cada vez y comprueba el número de resultados.
- Agrupa las alternativas con paréntesis.
- Distingue entre campo ausente, campo vacío y valor diferente.
- Usa `where` para expresiones y comparaciones posteriores a la búsqueda base.
- Reserva `regex` para patrones que un filtro normal o un comodín no expresan.
- Conserva `_raw`, `_time` y los metadatos mientras diagnosticas.
- Documenta la pregunta que responde cada filtro guardado.

## Referencias oficiales

- [Comando `search`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Search)
- [Comando `where`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Where)
- [Comando `regex`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Regex)
- [Operadores de búsqueda](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/SearchTimeOperations)
- [Operadores booleanos](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/BooleanExpressions)
- [Buenas prácticas de rendimiento](https://docs.splunk.com/Documentation/Splunk/latest/Search/Writebetterqueries)

## Siguiente paso

Cuando puedas acotar eventos de forma reproducible, continúa con
[Estadísticas](06-estadisticas.md). Allí aprenderás a convertir los eventos
filtrados en recuentos, agrupaciones y tendencias sin perder de vista el
intervalo temporal utilizado.
