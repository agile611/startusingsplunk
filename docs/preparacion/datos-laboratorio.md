# Datos del laboratorio

Los datos del laboratorio están preparados para practicar la ingesta, la
extracción de campos, las estadísticas, las visualizaciones y las alertas sin
utilizar información sensible de producción. Se cargan en la instancia local
de **Splunk Enterprise 10.4.3** y se consultan principalmente desde el índice
`curso`.

La idea principal es que el alumno trabaje con un conjunto de datos realista,
pero seguro y controlado. Eso permite centrarse en conceptos clave como:

- cómo se ingesta la información,
- cómo Splunk identifica campos y metadatos,
- cómo validar que la fuente ha llegado correctamente,
- cómo transformar eventos en estadísticas y paneles.

El conjunto de datos del curso está diseñado para simular un entorno habitual de
observabilidad operativa y seguridad, sin entrar en información privada ni
confidencial.

## Objetivo del dataset

El dataset de laboratorio no es solo una simple tabla. Es un conjunto de
registros que permiten demostrar procesos típicos de Splunk:

- lectura de archivos desde una entrada local,
- asignación automática de `host`, `source` y `sourcetype`,
- identificación del timestamp correcto,
- extracción y análisis de campos estructurados,
- consultas por tiempo, usuario, URL, código HTTP o comportamiento anómalo,
- creación de alertas y paneles a partir de datos reales simulados.

Esto convierte el archivo en una base ideal para practicar no solo la búsqueda,
sino también el diagnóstico de problemas de ingesta y extracción de campos.

## Tipos de datos

- **Logs web:** solicitudes, métodos HTTP, rutas, códigos de respuesta y
  direcciones IP.
- **Eventos de acceso:** inicios de sesión, usuarios, resultados y marcas de
  tiempo.
- **Errores de aplicación:** excepciones, niveles de severidad y mensajes.
- **Datos de seguridad:** actividad sospechosa, bloqueos y eventos de control.

Aunque la dimensión es reducida, cada tipo de evento contiene patrones muy
similares a los que aparecen en entornos reales. Eso ayuda a practicar con
escenarios comunes en seguridad operacional, monitorización y análisis de
incidentes.

## Archivos disponibles

El repositorio incluye varios recursos para las prácticas:

- [Eventos web](../downloads/eventos_web.csv): dataset que se cargará durante la
  práctica de ingesta.
- [Consultas SPL](../downloads/consultas-spl.txt): ejemplos y plantillas de
  búsquedas para reutilizar durante las sesiones.

Los archivos están dentro de `docs/downloads/`, por lo que también se pueden
descargar desde el sitio generado por MkDocs.

La idea es mantener un catálogo de datos simple y reproducible: si se sigue la
misma estructura y se usa el mismo índice, todos los resultados de las prácticas
son comparables entre alumnos y sesiones.

## Destino de los datos

El índice recomendado para los ejercicios es `curso`:

```spl
index=curso
```

Antes de cargar un archivo, confirma el índice de destino y evita importar el
mismo dataset repetidamente. La creación y configuración del índice se explica
en [Gestión de índices](../sesion-1/05-indices.md).

También es recomendable revisar antes de cargar:

- si el archivo tiene cabeceras,
- si el formato es CSV, JSON o texto plano,
- si se espera que Splunk asigne un `sourcetype` fijo,
- si el timestamp de cada evento es útil para la búsqueda por tiempo.

## Flujo de trabajo recomendado

1. Revisa el archivo y su formato.
2. Configura la entrada desde Splunk Web.
3. Selecciona el índice `curso`.
4. Comprueba el `sourcetype`, el `host` y el timestamp.
5. Ejecuta una búsqueda de validación.
6. Continúa con las estadísticas y visualizaciones.

La guía práctica de carga se encuentra en [Ingesta de datos](../sesion-1/04-ingesta-datos.md).

En la práctica, el flujo no termina cuando el archivo aparece en Splunk. Lo
crítico es comprobar que el evento se ha normalizado bien, que el tiempo es
correcto y que los campos extraídos tienen el nombre esperado.

## Búsquedas iniciales

Después de ingerir los datos, utiliza búsquedas pequeñas para validar el
resultado:

```spl
index=curso
```

```spl
index=curso
| stats count by sourcetype
```

```spl
index=curso
| stats count by host source
```

También conviene revisar cambios temporales y tendencias simples:

```spl
index=curso
| timechart span=1h count
```

```spl
index=curso
| stats count by status
```

Si no aparecen eventos, revisa primero el intervalo temporal, el índice, los
permisos y la entrada configurada. La página [Los datos no aparecen](../troubleshooting/datos-no-aparecen.md)
recoge las comprobaciones de diagnóstico.

## Qué validar antes de seguir

Antes de pasar a tareas más avanzadas, conviene confirmar estas condiciones:

- hay eventos en `index=curso`,
- el `timestamp` es el que corresponde al archivo,
- el `source` refleja la ubicación real del archivo,
- el `sourcetype` no está mal asignado,
- los campos esperados existen y tienen valores coherentes,
- la búsqueda por tiempo no está limitada a un intervalo erróneo.

Si una de estas comprobaciones falla, es probable que el problema no sea la
búsqueda sino la ingestión o la configuración del origen de datos.

## Buenas prácticas

- Conserva una copia de los archivos originales.
- No modifiques el CSV antes de comprobar cómo se importa.
- Documenta el índice, `sourcetype` y rango temporal utilizado.
- Evita cargar datos sensibles en el laboratorio.
- No borres manualmente los archivos internos de `/opt/splunk`.
- Usa los mismos datos y nombres de campos en las prácticas para que los
  resultados sean comparables.
- Cuando un ejercicio no devuelve resultados, anota qué archivo se cargó, qué
  índice se usó y qué rango temporal se consultó.

Estas buenas prácticas ayudan a evitar errores comunes que suelen resolverse
mirando el mismo punto varias veces sin diagnosticar bien la causa.

## Referencias y recursos recomendados

Para ampliar el contexto de la ingesta y el uso de datasets de laboratorio, estas
son referencias útiles:

- [Documentación de Splunk sobre entradas de datos](https://docs.splunk.com/Documentation/Splunk/latest/Data/Whatissource)
- [Documentación sobre índices y almacenamientos](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Guía sobre `sourcetype` y campos](https://docs.splunk.com/Documentation/Splunk/latest/Data/Configurecustomsourcetypes)
- [Manual de administración de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Welcome-to-Admin)

También puedes relacionar este contenido con el resto del curso:

- [Ingesta de datos](../sesion-1/04-ingesta-datos.md)
- [Gestión de índices](../sesion-1/05-indices.md)
- [Búsquedas básicas](../sesion-2/02-busquedas-basicas.md)
- [Los datos no aparecen](../troubleshooting/datos-no-aparecen.md)
- [Arquitectura del laboratorio](arquitectura-laboratorio.md)

## Resumen

Los datos del laboratorio están pensados para reproducir escenarios reales de
monitorización e ingesta sin depender de datos sensibles. Su valor principal
está en permitir practicar la lógica completa de Splunk: capturar datos,
validarlos, indexarlos y convertirlos en información útil mediante búsquedas,
estadísticas y visualizaciones.

Entender bien este dataset es clave porque casi todo lo que se hace en Splunk a
partir de aquí se apoya en la misma idea: transformar eventos crudos en
información útil y verificable.
