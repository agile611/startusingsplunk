# 2. Conceptos fundamentales

Para trabajar con Splunk es importante utilizar un vocabulario común. Un
archivo de log, un evento indexado y un resultado de búsqueda están
relacionados, pero no son el mismo objeto.

Esta página utiliza el entorno del curso como referencia: **Splunk Enterprise
10.4.3**, instalado manualmente en **Ubuntu 24.04.5 LTS**, con los datos de
prácticas almacenados en el índice `curso`.

Si ya tienes Splunk Enterprise instalado y acceso de administrador, este tema es
especialmente importante porque te va a permitir diagnosticar problemas con
criterio: no solo buscar datos, sino saber qué parte del flujo está fallando.

## Datos de máquina

Splunk trabaja principalmente con datos de máquina, es decir, información
generada automáticamente por sistemas y aplicaciones. Algunos ejemplos son:

- Registros de acceso de un servidor web.
- Mensajes de autenticación de Ubuntu.
- Excepciones de una aplicación.
- Eventos de un firewall.
- Respuestas de una API.
- Datos enviados por un Universal Forwarder.

Estos datos pueden estar en texto plano, CSV, JSON, XML u otros formatos. La
calidad de las búsquedas dependerá de que la fuente tenga timestamps fiables,
un formato consistente y suficiente contexto.

En un entorno real, no todos los logs salen “bonitos”. Un dato puede venir sin
fecha correcta, sin codificación estable, en varias líneas o mal serializado.
El papel de Splunk es tomar ese flujo y convertirlo en eventos explotables.

## Evento

Un **evento** es una unidad individual de información que Splunk puede
almacenar y buscar. Normalmente corresponde a una línea de log, aunque un
evento también puede ocupar varias líneas o representar un objeto estructurado.

Ejemplo de evento:

```text
2026-09-15 10:23:41,web-01,404,/login,GET,203.0.113.25
```

Este texto contiene una fecha, un host, un código HTTP, una ruta, un método y
una dirección IP. Tras la ingesta, Splunk intenta separar esos valores en
campos para poder analizarlos.

Un evento suele tener estas características:

- Un timestamp propio o un timestamp asignado durante la ingesta.
- Texto original conservado para poder revisarlo.
- Metadatos de origen, host, fuente y tipo de fuente.
- Campos extraídos automáticamente o definidos por configuración.
- Un identificador interno dentro del índice.

Cuando estás revisando un evento en Splunk, puedes distinguir claramente entre
el texto original y los campos extraídos. Eso es esencial para diagnosticar
por qué una búsqueda no está devolviendo resultados esperados.

## Timestamp

El timestamp indica cuándo ocurrió el evento, no necesariamente cuándo se
ingestó. Esta distinción es importante si un archivo se carga horas después de
haberse generado.

Splunk utiliza el tiempo para filtrar búsquedas. Si el intervalo temporal no
incluye la fecha del evento, una consulta correcta puede devolver cero
resultados.

En una investigación, comprueba siempre:

1. La zona horaria de la máquina que generó el dato.
2. El formato de fecha presente en el evento.
3. El timestamp que Splunk ha reconocido.
4. El intervalo seleccionado en Splunk Web.

Es un error muy habitual asumir que el tiempo del sistema es igual al del
evento. Si la fuente está en UTC y la instancia está en otra zona horaria, las
búsquedas por tiempo pueden fallar aunque los datos sí estén en el sistema.

## Host, source y sourcetype

Splunk añade metadatos que describen el origen del evento:

| Campo | Significado |
|---|---|
| `host` | Equipo o sistema que generó o envió el evento. |
| `source` | Archivo, puerto, URL o mecanismo concreto de procedencia. |
| `sourcetype` | Clasificación del formato y significado de los datos. |
| `index` | Ubicación lógica donde se almacenó el evento. |

Por ejemplo, un evento podría tener:

```text
index=curso host=web-01 source=/var/log/nginx/access.log sourcetype=access_combined
```

Estos valores no son necesariamente campos escritos dentro del texto original.
Son metadatos que permiten acotar la búsqueda y distinguir fuentes diferentes.

Como administrador, estos valores son cruciales porque te permiten responder a
preguntas como: ¿está el dato llegando desde la fuente correcta?, ¿está
registrado exactamente en el índice que esperamos?, ¿estamos observando el host
correcto?

## Campo

Un **campo** es un nombre asociado a un valor. En el evento anterior podrían
existir campos como `status`, `uri`, `method`, `clientip` y `host`.

Los campos pueden proceder de varias fuentes:

- Metadatos internos de Splunk.
- Extracción automática basada en el `sourcetype`.
- Pares `clave=valor` presentes en el evento.
- Expresiones regulares o configuraciones de extracción.
- Comandos SPL como `rex`, `eval` o `spath`.

Los campos hacen posible escribir búsquedas más precisas. No es lo mismo
buscar el texto `404` en todos los eventos que buscar `status=404` en un campo
interpretado como código HTTP.

La diferencia entre “texto” y “campo” es enorme en Splunk. Un texto puede ser
fácil de buscar, pero un campo te permite hacer agregaciones, filtros y
análisis estadísticos con mucho más valor operativo.

## Fuente de datos

Una fuente de datos es el lugar o mecanismo desde el que Splunk recibe los
eventos. En el laboratorio usaremos principalmente archivos preparados, pero
Splunk también puede recibir datos desde:

- Archivos y directorios monitorizados.
- Puertos TCP o UDP.
- Scripts y entradas de datos.
- APIs y aplicaciones.
- Universal Forwarders.
- Otros componentes de Splunk.

La fuente determina qué datos entran en el sistema; el índice determina dónde
se almacenan para su búsqueda.

Cuando una fuente está bien configurada, el problema no suele estar en la
señal sino en algún detalle del flujo: que no se esté monitorizando el archivo
correcto, que el `sourcetype` no sea el esperado o que el índice no sea el
adecuado.

## Índice

Un **índice** es un repositorio lógico de eventos. Splunk organiza los datos
indexados en estructuras que permiten recuperarlos de forma eficiente.

En este curso utilizaremos el índice `curso` para separar los datos de las
prácticas de otros datos del sistema. Una búsqueda acotada sería:

```spl
index=curso
```

Si no se indica un índice, el resultado dependerá de los índices a los que
tenga acceso el usuario y del índice predeterminado de la aplicación. Indicar
el índice explícitamente facilita las prácticas y evita confundir datos.

Un índice no es lo mismo que una carpeta visible del sistema. Aunque Splunk
utiliza almacenamiento en disco, se debe administrar desde Splunk y no mover
manualmente sus archivos internos.

En operaciones reales, una gran parte de los errores “la búsqueda no devuelve
nada” se resuelven revisando primero el índice correcto y el rango de tiempo.

## Ingesta e indexación

La **ingesta** es el proceso de recibir y preparar datos. La **indexación** es
el proceso de escribirlos en las estructuras internas que utilizarán las
búsquedas.

El flujo simplificado es:

```text
Entrada -> Parsing -> Metadatos -> Índice -> Búsqueda
```

Durante el procesamiento, Splunk puede determinar límites de eventos, extraer
el tiempo, asignar host y fuente, aplicar un sourcetype y escribir los datos en
el índice seleccionado.

Por eso, que un archivo exista en Ubuntu no significa que sus eventos ya estén
disponibles en Splunk. Hay que configurar o ejecutar una entrada y comprobar
que el destino, el tiempo y el formato son correctos.

Un dato puede estar literalmente en el disco y aún así no ser visible en
Splunk si la entrada no está activa o si no está asociado al índice correcto.

## Búsqueda y SPL

Las búsquedas de Splunk se escriben con **Search Processing Language (SPL)**.
Una búsqueda sencilla para el laboratorio es:

```spl
index=curso
```

Después se pueden encadenar comandos con el carácter `|`:

```spl
index=curso
| stats count by sourcetype
```

La primera parte selecciona eventos y `stats` resume los resultados. En la
sesión 2 se estudiarán con detalle los comandos SPL, los tiempos, los campos y
las funciones.

Cuando trabajas como administrador, la búsqueda no solo sirve para ver qué hay,
sino para comprobar la calidad de datos: cuántos eventos entran, qué tipo de
registros pasan y si los campos aparecen con el nombre esperado.

## Retención y disponibilidad

Los eventos no permanecen indefinidamente por defecto. La retención depende
del tamaño disponible, la configuración del índice y las políticas definidas
por el administrador.

Para el laboratorio conviene:

- Vigilar el espacio libre de Ubuntu.
- Evitar cargar repetidamente el mismo archivo sin necesidad.
- Utilizar el intervalo temporal adecuado.
- Confirmar el índice de destino antes de ingerir datos.
- No borrar manualmente directorios internos de `/opt/splunk`.

En un entorno de producción, la retención y la gestión del espacio se vuelven
muy importantes, especialmente con fuentes de alta frecuencia o índices con
mucha actividad.

## Diagnóstico rápido con estos conceptos

Si una búsqueda no devuelve resultados, una forma útil de diagnosticar es ir
pasando por esta secuencia:

1. ¿La fuente está generando datos?
2. ¿Splunk está leyendo la entrada correcta?
3. ¿El evento tiene timestamp reconocido?
4. ¿El host, source y sourcetype son los esperados?
5. ¿El evento está en el índice correcto?
6. ¿La búsqueda usa el intervalo temporal y los campos adecuados?
7. ¿El usuario tiene permisos suficientes para verlo?

Este procedimiento convierte el vocabulario de Splunk en una metodología real de
resolución de incidencias.

## Referencias y recursos recomendados

Para ampliar estos conceptos y comprobar la terminología con la documentación
oficial de Splunk, estas referencias son útiles:

- [Conceptos básicos de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Overview)
- [Documentación sobre índices](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Documentación sobre sourcetype y metadatos](https://docs.splunk.com/Documentation/Splunk/latest/Data/Configurecustomsourcetypes)
- [Guía de configuración general](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Configurationoverview)
- [Administración y mantenimiento general](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Welcome-to-Admin)

También conviene relacionar este archivo con el resto del curso:

- [Introducción](01-introduccion.md)
- [Arquitectura del laboratorio](../preparacion/arquitectura-laboratorio.md)
- [Datos del laboratorio](../preparacion/datos-laboratorio.md)
- [Ingesta de datos](04-ingesta-datos.md)
- [Gestión de índices](05-indices.md)

## Glosario de conceptos

| Concepto | Pregunta que responde |
|---|---|
| Evento | ¿Qué ocurrió? |
| Timestamp | ¿Cuándo ocurrió? |
| Host | ¿En qué equipo ocurrió? |
| Source | ¿De qué archivo o entrada procede? |
| Sourcetype | ¿Qué formato o tipo de dato tiene? |
| Campo | ¿Qué valor concreto podemos analizar? |
| Índice | ¿Dónde se almacenó? |
| SPL | ¿Cómo lo buscamos y resumimos? |

Cuando una práctica falle, utiliza esta tabla para localizar el punto que falta
en el recorrido desde la fuente hasta la búsqueda.

En la práctica real, entender estos conceptos es lo que diferencia a alguien
que simplemente “ejecuta consultas” de alguien que sabe diagnosticar el flujo de
los datos en Splunk.