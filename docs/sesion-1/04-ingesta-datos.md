# 4. Ingesta de datos

La ingesta es el punto de entrada de todos los datos que después Splunk
indexará, consultará y relacionará. En términos prácticos, es el proceso por el
cual un archivo, un flujo de red, un socket o una aplicación envía eventos a la
instancia de Splunk para que sean disponibles en la búsqueda.

Si ya tienes Splunk Enterprise instalado y permisos de administrador, esta
sección es especialmente importante porque es donde se diferencia un entorno que
solo parece funcionar de uno que realmente está recibiendo, procesando y
validando datos correctamente.

## ¿Qué significa ingerir datos?

Ingerir datos en Splunk no es solo copiar un archivo a un directorio. El
proceso real implica:

1. identificar la fuente de datos,
2. definir cómo Splunk la va a leer,
3. asignar metadatos como `host`, `source` y `sourcetype`,
4. decidir el índice de destino,
5. validar que los eventos llegan con el timestamp y el formato esperados.

Sin esta capa, Splunk puede tener servicio activo y aún así no ver nada útil.

## Fuentes de datos típicas

En un entorno real, las fuentes pueden ser muy variadas. En este curso, y en la
mayoría de ejercicios prácticos, se usan datos de laboratorio de tipo local,
como por ejemplo:

- archivos CSV,
- ficheros de log de texto plano,
- archivos de eventos generados por scripts,
- flujos enviados por una aplicación o servicio,
- fuentes remotas si se usa un forwarder.

Splunk puede consumir datos desde:

- ficheros locales monitorizados,
- directorios completos,
- sockets TCP o UDP,
- entrada modular de datos,
- aplicaciones que envían eventos,
- forwarders en entornos distribuidos,
- APIs o scripts personalizados.

Cada fuente tiene una lógica distinta, pero todas terminan convirtiéndose en
eventos indexados que luego se pueden consultar con SPL.

## Modelo de ingesta en Splunk

El recorrido típico es:

```text
Fuente de datos
    -> Entrada de Splunk
    -> Parsing y reconocimento del formato
    -> Asignación de timestamp, host, source y sourcetype
    -> Índice
    -> Búsqueda y análisis
```

Eso significa que, antes de nada, debes responder preguntas como:

- ¿la fuente existe realmente?
- ¿está en el path correcto?
- ¿Splunk la está monitorizando?
- ¿el índice seleccionado es el adecuado?
- ¿el `sourcetype` está bien identificado?
- ¿el evento llega con el tiempo correcto?

## Cómo se configura una entrada

Desde Splunk Web, la parte de administración y configuraciones te permite
añadir datos a la instancia. En general, para una fuente local debes comprobar:

- el tipo de fuente,
- el path del archivo o directorio,
- el índice de destino,
- la forma de parsing o `sourcetype`,
- si la entrada debe monitorizar cambios en tiempo real.

Cuando se configura una entrada, Splunk no solo la guarda; empieza a vigilarla y
a enviar los eventos al índice. Ese es el momento en el que se debe validar que
la información llega como se espera.

## Validación de la ingesta

La validación es tan importante como la configuración. Después de añadir una
fuente, no debes asumir que está funcionando solo porque la entrada fue creada.
Debes comprobar:

```spl
index=curso
```

```spl
index=curso | stats count
```

```spl
index=curso | stats count by sourcetype
```

También puedes revisar rápidamente si el evento tiene `host`, `source`,
`timestamp` y campos esperados. Si no aparecen, normalmente el problema está en
uno de estos puntos:

- la entrada no está apuntando al archivo correcto,
- la fuente no está siendo monitorizada,
- el archivo no tiene formato compatible,
- el tiempo del evento no está en el rango de búsqueda,
- el `sourcetype` impide que los campos se interpreten bien,
- el índice es distinto al que se está consultando.

## Tipos de errores comunes en ingesta

Estos son los fallos más habituales que aparecen al trabajar con datos en
Splunk:

### 1. La entrada existe pero no llega nada

Puede deberse a:

- archivo con permisos incorrectos,
- ruta equivocada,
- configuración de monitorización incompleta,
- falta de permisos del usuario que ejecuta Splunk,
- índice erróneo o no existente.

### 2. Los eventos llegan, pero no se entienden bien

Puede deberse a:

- `sourcetype` incorrecto,
- archivo con formato no estándar,
- timestamps ambiguos o inexistentes,
- eventos multilinea sin configuración adecuada.

### 3. Hay eventos, pero no aparecen en la búsqueda

Puede deberse a:

- rango temporal incorrecto,
- índice distinto del que se consulta,
- búsqueda demasiado restrictiva,
- un filtro que elimina todos los resultados.

## Recomendación de flujo de trabajo

Cuando agregues una fuente de datos, sigue este flujo práctico:

1. Revisar el archivo o la fuente.
2. Confirmar formato y contenido.
3. Definir la entrada en Splunk.
4. Seleccionar el índice correcto.
5. Ajustar `sourcetype` si es necesario.
6. Validar en Search & Reporting con una consulta simple.
7. Revisar `host`, `source`, `timestamp` y campos.
8. Continuar con estadísticas, alertas y paneles.

Este orden evita perder tiempo intentando buscar un error de visualización
cuando el problema real está en la ingesta.

## Ingesta local vs. forwarder

En entornos pequeños, la ingesta local suele ser suficiente. En entornos más
grandes, se suele separar la recopilación con forwarders para que un nodo se
ocupe de recoger eventos y otro de indexarlos.

En este curso, por simplicidad, se usa una arquitectura mononodo, pero la
lógica sigue siendo la misma:

- recibe eventos,
- los procesa,
- les asigna metadatos,
- los envía al índice,
- los deja listos para la búsqueda.

## Archivos de ejemplo y práctica

El curso incluye archivos de práctica dentro del repositorio, como:

- [Eventos web](../downloads/eventos_web.csv)
- [Consultas SPL](../downloads/consultas-spl.txt)

Estos datasets están diseñados para que el asistente pueda validar:

- cómo se cargan los eventos,
- cómo se interpretan los campos,
- cómo se comprueba que la ingesta funciona,
- cómo se pasa del dato bruto a un análisis útil.

## Referencias y recursos recomendados

Para profundizar en la ingesta y la configuración de datos en Splunk:

- [Conceptos básicos de ingesta y fuentes](https://docs.splunk.com/Documentation/Splunk/latest/Data/Whatissource)
- [Documentación sobre tipos de entrada](https://docs.splunk.com/Documentation/Splunk/latest/Data/Aboutdatainputs)
- [Guía de configuración de índices y fuentes](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Configurationoverview)
- [Administración general](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Welcome-to-Admin)

También te puede resultar útil conectar esta parte con otros contenidos:

- [Introducción](01-introduccion.md)
- [Conceptos fundamentales](02-conceptos-fundamentales.md)
- [Splunk Web](03-splunk-web.md)
- [Gestión de índices](05-indices.md)
- [Datos del laboratorio](../preparacion/datos-laboratorio.md)

## Resumen

La ingesta es la base de todo el flujo operativo de Splunk. Sin una entrada bien
configurada y validada, ninguna búsqueda tendrá valor. Para un asistente con un
Splunk Enterprise funcionando y permisos de administrador, la clave está en:

- validar la fuente,
- confirmar el índice de destino,
- revisar los metadatos,
- comprobar el rango temporal,
- evitar asumir que la entrada está funcionando solo porque fue creada.

La parte más importante no es “hacer aparecer datos”, sino asegurarse de que
los datos que aparecen son fiables, útiles y realmente representan el origen que
se espera.