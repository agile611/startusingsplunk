# 5. Índices

Un **índice** en Splunk es el contenedor lógico donde se almacenan los eventos
que han sido ingeridos y procesados. Es la pieza central que permite que los
datos sean consultables, resumibles y comparables por tiempo, campo o origen.

Si tienes Splunk Enterprise instalado y permisos de administrador, entender los
índices es clave porque gran parte de la operación real gira alrededor de dos
preguntas:

- ¿dónde están entrando mis datos?
- ¿estoy buscando en el índice correcto?

Aunque el usuario vea una sola interfaz, detrás hay varios índices, rutas de
almacenamiento, políticas de retención y permisos de acceso que moldean la
experiencia de búsqueda.

## Qué es un índice en Splunk

Un índice no es solo una carpeta. Es una estructura de almacenamiento que
Splunk administra internamente para mantener los eventos ordenados por tiempo,
facilitar la búsqueda y optimizar la recuperación.

Cuando importas un archivo o configuras una fuente, puedes decidir el índice de
destino. Eso importa porque el contenido de un evento solo puede consultarse
si se encuentra en el índice correcto y si el usuario tiene permisos para
leerlo.

## ¿Por qué usar índices?

Los índices permiten:

- separar tipos de datos por origen o propósito,
- limitar el alcance de una búsqueda,
- reducir ruido y confusión entre distintas fuentes,
- controlar retención y espacio,
- aplicar políticas de acceso y administración,
- facilitar la operación y la monitorización.

En un entorno real, un administrador puede tener índices para:

- accesos web,
- logs de seguridad,
- eventos del sistema,
- métricas,
- archivos de aplicación,
- datos de laboratorio o pruebas.

## Índice del curso

En este curso se recomienda usar el índice `curso` para separar los datos de
prácticas del resto de información del sistema.

```spl
index=curso
```

Esto permite que las búsquedas sean más claras y que todo el material del curso
se mantenga homogéneo. Si un asistente hace una búsqueda sin indicar el índice,
puede obtener resultados de otros datos o incluso cero resultados si no tiene
acceso a los índices relevantes.

## Qué debe revisar un administrador

Cuando llega una nueva fuente de datos, un administrador debe comprobar al menos
estos elementos:

1. que el índice exista,
2. que la entrada esté apuntando al índice correcto,
3. que los eventos estén llegando realmente,
4. que el timestamp sea el esperado,
5. que el `host`, `source` y `sourcetype` sean coherentes,
6. que los permisos permitan consultar el contenido.

Si se pasa por alto alguno de estos puntos, la ingestión puede parecer correcta
pero la búsqueda puede no devolver nada útil.

## Diagnóstico rápido de índices

Cuando una búsqueda no devuelve resultados, lo primero que debes comprobar es
si estás mirando el índice correcto. Un flujo útil es:

```spl
index=curso
```

```spl
index=curso | stats count
```

```spl
index=curso | top source
```

```spl
index=curso | stats count by host
```

Si estas consultas no devuelven eventos, revisa:

- el rango temporal de la búsqueda,
- el nombre del índice,
- la fuente de entrada,
- el timestamp del evento,
- los permisos del usuario,
- si la fuente realmente está escribiendo en el sistema.

## Diferencia entre índice y source

Es fácil mezclar estos dos conceptos:

- `source` indica de dónde vienen los datos.
- `index` indica dónde se almacenan.

Por ejemplo:

```text
source=/var/log/nginx/access.log
index=curso
```

Esto significa que el contenido del archivo de log está llegando a Splunk y el
sistema lo está almacenando en el índice `curso`, pero la fuente original sigue
siendo el archivo de acceso web.

## Retención y espacio

Los índices tienen implicaciones de almacenamiento. Si un archivo genera muchos
eventos, el índice puede crecer rápidamente. Por eso es importante:

- controlar el tamaño de los índices,
- revisar el espacio libre del sistema,
- evitar cargar datos duplicados,
- definir políticas de retención adecuadas,
- mantener una separación clara entre datos de laboratorio y datos productivos.

En un entorno real, el administrador debe revisar estos aspectos con frecuencia.

## Buenas prácticas de administración

- Usa índices específicos para cada tipo de dato o entorno.
- Evita mezclar pruebas y producción en un mismo índice.
- Documenta qué fuente va a cada índice.
- Comprueba los eventos con una búsqueda simple antes de pasar a análisis
  complejos.
- Mantén el tamaño y la retención bajo control.
- No modifiques manualmente archivos internos de Splunk si no es necesario.

## Referencias y recursos recomendados

Para ampliar la administración de índices en Splunk, estas referencias oficiales
son útiles:

- [Documentación sobre índices](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Conceptos de indexación y almacenamiento](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Howindexingworks)
- [Administración general](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Welcome-to-Admin)
- [Guía de configuración y mantenimiento](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Configurationoverview)

También puedes relacionar esta parte con:

- [Introducción](01-introduccion.md)
- [Conceptos fundamentales](02-conceptos-fundamentales.md)
- [Splunk Web](03-splunk-web.md)
- [Ingesta de datos](04-ingesta-datos.md)
- [Datos del laboratorio](../preparacion/datos-laboratorio.md)