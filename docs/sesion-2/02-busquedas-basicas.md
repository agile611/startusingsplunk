# 2. Búsquedas básicas

Las búsquedas básicas son el punto de entrada al trabajo diario con Splunk.
Permiten localizar eventos, limitar los resultados a una condición y mostrar
solo la información necesaria para responder una pregunta operativa.

En esta parte no buscamos todavía construir consultas complejas. El objetivo es
aprender una secuencia fiable: empezar por el índice, añadir un filtro,
comprobar el resultado y solo después ordenar o resumir la información.

## La búsqueda más sencilla

Una búsqueda puede consistir únicamente en el índice:

```spl
index=curso
```

Esta consulta devuelve los eventos del índice `curso` dentro del intervalo
temporal seleccionado en Splunk Web. El índice debe aparecer desde el
principio, especialmente cuando tienes permisos de administrador y puedes
acceder a muchos índices. Así evitas mezclar datos del laboratorio con eventos
de otros entornos.

Después de ejecutarla, revisa algunos eventos y confirma que los metadatos son
coherentes:

- `_time`: momento que Splunk utiliza para ordenar y filtrar el evento;
- `host`: equipo o sistema que origina el dato;
- `source`: archivo, entrada o fuente concreta;
- `sourcetype`: tipo de datos y reglas de extracción asociadas;
- `index`: índice donde se ha almacenado el evento.

## Buscar texto y buscar campos

Un texto sin nombre de campo busca coincidencias en el contenido indexado:

```spl
index=curso error
```

Es mejor usar un campo cuando sabes qué quieres comprobar:

```spl
index=curso status=404
index=curso method=GET
index=curso host=web-01
```

La forma `campo=valor` es más precisa y normalmente ayuda a Splunk a reducir
el trabajo de búsqueda. Si el valor contiene espacios o caracteres especiales,
utiliza comillas:

```spl
index=curso uri="/api/login"
```

No confundas el nombre de un campo con el valor que contiene. `status=404`
filtra por el campo `status`; escribir solamente `404` busca el texto y puede
producir resultados diferentes.

## Operadores booleanos y comparaciones

Puedes combinar condiciones para describir el caso que quieres investigar:

```spl
index=curso method=GET status=404
```

Cuando necesitas expresar alternativas, usa `OR` y agrupa la condición con
paréntesis:

```spl
index=curso (status=404 OR status=500)
```

Para excluir resultados utiliza `NOT` o el operador `!=`:

```spl
index=curso status!=200
index=curso NOT method=HEAD
```

Las comparaciones numéricas son útiles para códigos HTTP o medidas extraídas
como número:

```spl
index=curso status>=400
index=curso status<500
```

Si una comparación no devuelve lo esperado, verifica que el campo tenga el
tipo correcto y que realmente se haya extraído en los eventos. Un campo que no
existe no equivale automáticamente a un valor cero.

## Comodines y existencia de campos

El comodín `*` representa una secuencia de caracteres. Por ejemplo:

```spl
index=curso uri="/api/*"
```

Para comprobar que un campo está presente, utiliza:

```spl
index=curso method=*
```

Esto es especialmente útil cuando una fuente cambia de formato o cuando
quieres verificar si la extracción de campos está funcionando. Para localizar
eventos sin un campo, puedes usar:

```spl
index=curso NOT uri=*
```

Usa los comodines con moderación. Una búsqueda demasiado abierta puede devolver
muchos resultados y ocultar la pregunta que realmente quieres responder.

## Limitar y presentar resultados

Una búsqueda devuelve los eventos completos, pero durante una investigación no
siempre necesitas todas sus columnas. Estos comandos ayudan a trabajar con una
salida manejable.

### `table`: seleccionar campos

```spl
index=curso
| table _time host method status uri
```

`table` es útil para revisar eventos y preparar una tabla para un ejercicio.
Recuerda incluir `_time` mientras estés validando los datos.

### `fields`: conservar o eliminar campos

```spl
index=curso
| fields _time host status uri
```

También puedes eliminar campos que no necesitas:

```spl
index=curso
| fields - _raw
```

### `sort`: ordenar resultados

```spl
index=curso
| sort - _time
```

El signo `-` ordena de forma descendente. Para ordenar por el código HTTP o
por un campo calculado, indica ese campo:

```spl
index=curso
| sort status, uri
```

### `head` y `tail`: limitar el número de eventos

```spl
index=curso
| sort - _time
| head 10
```

`head` conserva los primeros resultados y `tail` los últimos resultados de la
salida actual. Ordénalos antes si el orden importa.

### `dedup`: eliminar duplicados visibles

```spl
index=curso
| dedup uri
| table _time host status uri
```

`dedup` sirve para inspecciones rápidas, pero no debe usarse para calcular
volúmenes sin entender su efecto: elimina eventos de la salida y puede hacer
que los recuentos dejen de representar el total real.

## Procedimiento práctico de búsqueda

Usa este procedimiento cada vez que recibas una petición de análisis:

1. Escribe el índice y selecciona un intervalo temporal razonable.
2. Ejecuta la búsqueda sin filtros para confirmar que hay eventos.
3. Añade una sola condición de campo.
4. Comprueba si el número de resultados y los eventos son los esperados.
5. Selecciona los campos relevantes con `table` o `fields`.
6. Ordena y limita la salida solo cuando conozcas qué estás observando.
7. Guarda la consulta junto con su objetivo y el intervalo temporal.

Por ejemplo, para investigar respuestas `404` del laboratorio:

```spl
index=curso
```

```spl
index=curso status=404
```

```spl
index=curso status=404
| table _time host method uri
| sort - _time
| head 20
```

Si el primer paso no devuelve eventos, el problema probablemente no está en el
filtro `status=404`. Comprueba el rango temporal, el índice, la entrada de
datos, el `sourcetype` y los permisos antes de cambiar la sintaxis.

## Prácticas sobre los datos del curso

### Peticiones de un host

```spl
index=curso host=web-01
| table _time method status uri
| sort _time
```

### Peticiones que no son satisfactorias

```spl
index=curso status!=200
| table _time host status uri
```

Ten en cuenta que `status!=200` puede no incluir eventos en los que `status` no
exista. Si quieres identificar tanto los errores como los eventos incompletos,
haz explícita la condición de ausencia:

```spl
index=curso (status!=200 OR NOT status=*)
| table _time host status uri
```

### URI de acceso o autenticación

```spl
index=curso uri="/login"
| table _time host method status uri
```

Estas consultas son de inspección. Para contar, agrupar o calcular porcentajes
utilizarás `stats` y `eval` en los capítulos siguientes.

## Diagnóstico de resultados inesperados

| Síntoma | Comprobación recomendada |
|---|---|
| Cero resultados | Revisa índice, permisos, rango temporal y existencia de eventos. |
| Demasiados resultados | Añade el índice, un campo y un intervalo más pequeño. |
| `status=404` no encuentra eventos | Inspecciona un evento y confirma el nombre y el tipo del campo. |
| Falta `uri` o `method` | Revisa la extracción del `sourcetype` y el formato de entrada. |
| Los eventos parecen antiguos | Comprueba `_time` y la interpretación del timestamp. |
| `dedup` muestra pocos eventos | Recuerda que elimina duplicados de la salida. |

Como administrador puedes revisar la entrada desde **Settings > Data inputs** y
el índice desde **Settings > Indexes**, pero la comprobación más rápida suele
ser observar un evento real en los resultados y revisar sus campos.

## Buenas prácticas

- Empieza siempre por `index=...`.
- Usa nombres de campo explícitos en lugar de texto libre cuando sea posible.
- Añade una condición cada vez para saber qué cambio altera el resultado.
- Mantén `_time` visible durante la validación.
- No uses `head` antes de comprobar que el orden de los eventos es relevante.
- No uses `dedup` para sustituir un recuento estadístico.
- Documenta el objetivo, el índice y el rango temporal de las consultas útiles.
- No pruebes consultas amplias sobre todos los índices si el objetivo solo
	necesita los datos del laboratorio.

## Referencias oficiales

- [Manual de búsqueda de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Search/WhatsInThisManual)
- [Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Overview)
- [Comando `search`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Search)
- [Comando `table`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Table)
- [Comando `fields`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fields)
- [Comando `sort`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Sort)
- [Comando `dedup`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Dedup)

## Siguiente paso

Cuando puedas localizar eventos, filtrar por campos y presentar una salida
legible, continúa con [Gestión del tiempo](03-gestion-tiempo.md). El tiempo es
parte de la búsqueda, no un detalle posterior: una consulta perfecta sobre un
intervalo incorrecto también produce un diagnóstico incorrecto.
