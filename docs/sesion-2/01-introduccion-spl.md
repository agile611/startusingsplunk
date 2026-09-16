# 1. Introducción a SPL

SPL (*Search Processing Language*) es el lenguaje de búsqueda de Splunk. Se
utiliza para localizar eventos, filtrar resultados, transformar campos,
calcular estadísticas y presentar información útil para operaciones,
seguridad y análisis.

SPL no modifica los eventos almacenados. Una búsqueda lee los datos accesibles
para el usuario y construye un resultado temporal. Por eso es apropiado para
investigar una incidencia sin alterar la fuente original.

Si tienes Splunk Enterprise instalado y permisos de administrador, debes
aprender SPL como una herramienta operativa, no solo como una sintaxis. Una
consulta debe ayudarte a responder una pregunta concreta y a comprobar que el
resultado es fiable.

## Qué problema resuelve SPL

Los eventos suelen llegar como registros individuales: una petición HTTP, un
error de aplicación, un inicio de sesión o un cambio de configuración. SPL
permite pasar de esos eventos a una conclusión:

```text
Eventos sin procesar -> filtros -> campos -> estadísticas -> decisión
```

Por ejemplo, ante un aumento de errores web puedes:

1. Confirmar que existen eventos en el índice correcto.
2. Limitar la búsqueda al intervalo en el que apareció el problema.
3. Filtrar las respuestas HTTP de error.
4. Contar los errores por host o por URI.
5. Comparar el resultado con el comportamiento habitual.

## Anatomía de una búsqueda

Una búsqueda SPL se ejecuta de izquierda a derecha. El carácter `|` enlaza
comandos: la salida de un comando se convierte en la entrada del siguiente.

```spl
index=curso status>=400
| stats count as errores by host, uri
| sort - errores
| head 10
```

En este ejemplo:

- `index=curso` limita la búsqueda al índice del laboratorio.
- `status>=400` conserva las respuestas HTTP de error.
- `stats` agrupa y cuenta los eventos.
- `sort - errores` ordena de mayor a menor.
- `head 10` muestra solo los diez primeros resultados.

La primera parte de la búsqueda suele ser una búsqueda base. Los comandos
posteriores transforman sus resultados:

```spl
index=curso
| search method=GET
| table _time host method status uri
```

En búsquedas sencillas, `index=curso method=GET` suele ser preferible a
empezar con `search`, porque deja el filtro principal visible desde el inicio.

## Primer flujo de trabajo

Antes de escribir una consulta compleja, sigue esta secuencia:

### 1. Confirma el índice y el intervalo temporal

Empieza indicando el índice y un intervalo que contenga los datos. Si el
selector temporal de Splunk Web está fuera de la fecha de los eventos, una
búsqueda correcta devolverá cero resultados.

```spl
index=curso earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
```

Para una primera comprobación también puedes usar el selector **Todo el
tiempo** de Splunk Web, pero en consultas compartidas conviene especificar el
tiempo en SPL o documentar el rango utilizado.

### 2. Comprueba que existen eventos

```spl
index=curso
| head 20
```

Revisa `_time`, `host`, `source`, `sourcetype` e `index`. Estos metadatos suelen
explicar rápidamente si el problema está en la ingesta, en el índice o en la
consulta.

### 3. Comprueba el volumen y la distribución

```spl
index=curso
| stats count as total by host, sourcetype
```

Si no aparecen resultados, no empieces todavía a añadir `eval`, expresiones
regulares o visualizaciones. Revisa primero la fuente, el índice, el rango
temporal y los permisos de lectura.

### 4. Formula una pregunta concreta

Una buena búsqueda comienza por una pregunta operativa:

- ¿Cuántos eventos han llegado?
- ¿Qué hosts generan más errores?
- ¿Qué URI responde con más códigos `404`?
- ¿Qué porcentaje de peticiones devuelve un error?

La pregunta determina si necesitas eventos individuales (`table`), grupos
(`stats`) o una serie temporal (`timechart`).

## Consultas prácticas del laboratorio

El archivo `eventos_web.csv` contiene los campos `timestamp`, `host`, `method`,
`status` y `uri`. Después de cargarlo en el índice `curso`, puedes practicar
con estas consultas.

### Ver eventos recientes

```spl
index=curso
| table _time host method status uri
| sort - _time
| head 20
```

### Resumir códigos HTTP

```spl
index=curso
| stats count as peticiones by status
| sort - peticiones
```

### Encontrar las URI con más errores

```spl
index=curso status>=400
| stats count as errores by uri
| sort - errores
| head 10
```

### Comparar el tráfico en el tiempo

```spl
index=curso
| timechart span=1m count by status
```

Si un campo no se extrae como esperas, inspecciona primero un evento real y
comprueba el `sourcetype`. No asumas que el nombre de la columna del CSV se ha
convertido automáticamente en un campo usable: la extracción depende de la
configuración de la entrada y del tipo de datos.

## Qué significa tener permisos de administrador

El rol de administrador facilita la configuración de índices, entradas,
usuarios y aplicaciones, pero no elimina la necesidad de validar el contexto
de la búsqueda. Antes de diagnosticar un resultado inesperado, comprueba:

- que estás en la instancia y aplicación correctas;
- que la cuenta puede buscar en el índice `curso`;
- que el índice y la entrada apuntan al mismo entorno;
- que el rango temporal incluye la fecha real de los eventos;
- que la búsqueda no está ocultando resultados mediante un filtro;
- que el usuario no está limitado por una búsqueda restringida o por su rol.

Para revisar la configuración desde Splunk Web, utiliza **Settings > Indexes**
y **Settings > Data inputs**. Para la operación diaria, evita conceder permisos
administrativos a todos los usuarios: el acceso de búsqueda y la capacidad de
configuración son responsabilidades distintas.

## Buenas prácticas desde el primer día

- Especifica siempre el índice en las búsquedas del curso.
- Limita el intervalo temporal antes de analizar grandes volúmenes.
- Empieza con una búsqueda mínima y añade un comando cada vez.
- Usa nombres descriptivos con `as`, como `errores` o `peticiones`.
- Comprueba el resultado de cada etapa antes de continuar.
- Evita `index=*` en búsquedas habituales: puede incluir datos irrelevantes y
	aumentar el coste de búsqueda.
- Guarda la consulta junto con el índice, el intervalo temporal y el objetivo.
- No confundas cero resultados con ausencia de datos: verifica también los
	permisos, el `sourcetype`, `_time` y la fuente.

## Relación con el resto de la sesión

Este documento presenta el modelo general. Para profundizar, continúa con:

- [Búsquedas básicas](02-busquedas-basicas.md)
- [Gestión del tiempo](03-gestion-tiempo.md)
- [Campos y resultados](04-campos-resultados.md)
- [Filtrado de eventos](05-filtrado.md)
- [Estadísticas](06-estadisticas.md)
- [Eval y funciones](07-eval-funciones.md)
- [Extracción de campos](08-extraccion-campos.md)
- [Comandos avanzados](09-comandos-avanzados.md)
- [Rendimiento](10-rendimiento.md)

## Referencias oficiales

- [Search Manual de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Search/WhatsInThisManual)
- [Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Overview)
- [SPL2 Search Reference](https://docs.splunk.com/Documentation/SCS/latest/SearchReference)
- [Comando `stats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Stats)
- [Comando `timechart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart)
- [Buenas prácticas de rendimiento](https://docs.splunk.com/Documentation/Splunk/latest/Search/Writebetterqueries)

## Resultado esperado

Al terminar esta introducción deberías poder escribir una búsqueda que indique
el índice, use un intervalo temporal válido, compruebe la existencia de eventos
y responda una pregunta concreta. También deberías saber distinguir entre un
problema de SPL y un problema de datos, tiempo, permisos o configuración.
