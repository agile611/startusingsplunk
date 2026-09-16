# 3. Arquitectura

La arquitectura de Splunk se basa en separar claramente cuatro tareas
fundamentales: recibir datos, procesarlos, almacenarlos y consultarlos.
Dependiendo del tamaño del entorno, estas funciones pueden ejecutarse en una
sola máquina o distribuirse entre varios nodos especializados. En este curso
se utiliza una arquitectura mononodo para simplificar la instalación y permitir
centrarse en cómo fluye la información dentro de Splunk.

La idea esencial es que Splunk no solo “guarda logs”: primero recibe eventos,
los identifica, los normaliza, les asigna metadatos y luego los pone a
disposición de búsquedas y paneles. Por eso, aunque el usuario vea una
interfaz muy intuitiva, detrás hay un motor de ingestión, indexación y
consultas bastante más complejo.

El laboratorio del curso usa esta topología:

```text
Ubuntu 24.04.5 LTS
└── Splunk Enterprise 10.4.3
        ├── Recepción de datos
        ├── Procesamiento e indexación
        ├── Almacenamiento
        ├── Búsqueda
        └── Splunk Web
```

Esta topología es suficiente para aprender el flujo completo sin añadir la
complejidad de certificados, públicos de red y sincronización entre nodos. Los
conceptos son exactamente los mismos que se aplican en una arquitectura
realmente distribuida, solo que en un entorno más sencillo.

## ¿Por qué Splunk separa funciones?

En sistemas de observabilidad y seguridad, la cantidad de eventos puede crecer
muchísimo en poco tiempo. Si todas las tareas fueran las mismas, una sola
máquina tendría que hacer simultáneamente:

- recopilar datos desde muchos origenes,
- analizar cada evento,
- escribirlos en disco,
- responder a búsquedas de varios usuarios,
- ejecutar reglas de alertas y paneles.

Con el tiempo, esto genera cuellos de botella. Por eso Splunk diseña la
arquitectura en componentes especializados: los forwarders recogen eventos, los
indexers los procesan y guardan, y los search heads coordinan la consulta y la
presentación de resultados.

Aunque en este curso todo se ejecute sobre una sola máquina, conviene pensar en
las responsabilidades como si estuvieran separadas conceptual y funcionalmente.
Ese pensamiento facilita la resolución de problemas cuando algo no aparece en
las búsquedas o un índice no está recibiendo datos.

## Componentes principales

### Forwarder

Un **forwarder** es un componente ligero que recopila eventos en una máquina y
los envía a otra instancia de Splunk. Se usa mucho cuando hay cientos o miles
de servidores generando logs y no conviene instalar una copia completa de
Splunk Enterprise en cada uno de ellos.

El tipo más habitual es el **Universal Forwarder**, que se centra en dos tareas:

- recoger los datos de archivos, sockets o aplicaciones locales,
- enviarlos al siguiente nivel, normalmente a un indexer.

En el laboratorio no es obligatorio usar un forwarder: los datos de prácticas
pueden cargarse directamente en la instancia local, y eso nos permite aprender
la lógica de Splunk sin añadir una capa de infraestructura extra.

Flujo típico con un forwarder:

```text
Servidor con logs -> Universal Forwarder -> Indexer -> Search Head
```

El puerto habitual para recibir datos desde un forwarder es `9997`. Solo debe
abrirse si realmente se va a usar este mecanismo de envío. En un entorno de
laboratorio local, puede ser innecesario y añadir complejidad sin aportar valor
didáctico.

Un forwarder no “interpreta” la lógica de negocio de los eventos; su función es
ser una vía confiable y eficiente de transporte y recopilación.

### Indexer

El **indexer** es el corazón del almacenamiento y el procesamiento de eventos.
Recibe datos desde entradas locales o remotas, decide dónde termina cada evento,
extrae metadatos, crea estructuras para buscar por tiempo y contenido, y
almacena los datos en un índice.

En una instalación mononodo, el indexer forma parte de la misma instancia de
Splunk Enterprise instalada en `/opt/splunk`. El índice de prácticas `curso` se
almacenará en esa instalación local.

Responsabilidades habituales del indexer:

- Recibir eventos desde entradas locales o remotas.
- Determinar límites del evento y su timestamp.
- Asignar metadatos como `host`, `source` y `sourcetype`.
- Construir y mantener los datos de índice para facilitar la búsqueda.
- Responder a las partes de la búsqueda que afectan a sus eventos.
- Aplicar políticas de retención y almacenamiento.

En términos prácticos, si un evento no llega al indexer, no existe para la
búsqueda. Si el parsing es incorrecto, Splunk puede indexarlo, pero no
“entenderlo” bien. Ese es el motivo por el que el diagnóstico de problemas en
Splunk suele hacerse por etapas: entrada, parsing, metadatos, índice y búsqueda.

### Search head

El **search head** es el componente que coordina la búsqueda y presenta los
resultados al usuario. En una arquitectura distribuida, el usuario no consulta
el indexer directamente; en su lugar el search head distribuye la consulta,
reúne las respuestas y las presenta en una vista unificada.

En una instalación mononodo, el search head y el indexer suelen vivir en la
misma instancia. Eso facilita el aprendizaje, pero no elimina la diferencia
conceptual entre “buscar” y “almacenar”. Así, aunque los procesos se ejecuten
juntos, seguimos hablando de dos roles distintos.

Una búsqueda en Splunk puede funcionar sobre uno o varios índices, aplicar
filtros, campos calculados, funciones estadísticas, visualizaciones y alertas.
Todo eso se ejecuta en torno a la relación entre search head e indexer.

### Splunk Web

**Splunk Web** es la capa de interfaz de usuario, accesible a través de HTTP.
En este curso se usa normalmente el puerto `8000`:

```text
http://localhost:8000
```

Desde el navegador se puede:

- lanzar búsquedas SPL,
- revisar índices y fuentes,
- crear dashboards y visualizaciones,
- administrar entradas de datos,
- consultar estado y actividad de la instancia.

La interfaz es cómoda, pero la parte más importante sigue estando en el motor
subyacente de Splunk y en los datos indexados.

### splunkd

`splunkd` es el servicio principal de Splunk. Es el componente que hace
funcionar la mayor parte de la plataforma: gestión interna, comunicación,
proceso de eventos, búsquedas, indexación, API, seguridad y coordinación entre
módulos.

El puerto de administración más habitual es `8089`. No debe exponerse a
Internet sin una configuración de seguridad apropiada. En un entorno de
laboratorio local puede verse como un punto de control interno de la
instancia, no como un servicio público.

## Flujo de datos: de la fuente al resultado

El recorrido de un evento puede resumirse así:

```text
Fuente
    -> Entrada de datos
    -> Parsing y extracción de tiempo
    -> Asignación de host, source y sourcetype
    -> Índice
    -> Consulta SPL
    -> Resultado en Splunk Web
```

Cada etapa responde a una pregunta diferente:

| Etapa | Pregunta de diagnóstico |
|---|---|
| Fuente | ¿El archivo, aplicación o sistema está generando datos? |
| Entrada | ¿Splunk está leyendo o recibiendo la fuente? |
| Parsing | ¿Reconoce correctamente cada evento y su timestamp? |
| Metadatos | ¿El host, source y sourcetype son los esperados? |
| Índice | ¿El evento se ha escrito en `curso`? |
| Búsqueda | ¿La consulta y el intervalo temporal son correctos? |
| Presentación | ¿El usuario tiene permisos para ver los resultados? |

Este enfoque por etapas es muy útil porque evita caer en la idea de que
"Splunk no funciona" cuando en realidad el problema puede estar en la entrada,
las propiedades del evento o el intervalo temporal de la búsqueda. Es mucho más
rápido diagnosticar por capas que reinstalar la instalación o repetir comandos
sin sentido.

## Qué ocurre realmente con cada evento

Cuando Splunk recibe un evento, no lo trata como una línea cualquiera. Lo
procesa con una lógica específica:

1. La fuente genera datos: un archivo log, un servicio, un sistema operativo,
   un registro de red o datos cargados manualmente.
2. La entrada define cómo Splunk va a leer esa fuente: monitorización de un
   archivo, TCP/UDP, scripts, archivos en remoto o carga desde la interfaz.
3. El parsing identifica el formato del evento y separa la parte útil del
   contenido.
4. Se extraen metadatos como la hora, el host, la ubicación exacta de origen y
   el tipo del dato.
5. Se almacena en un índice para que luego pueda consultarse por tiempo,
   contenido y campos extraídos.
6. Cuando un usuario ejecuta una búsqueda, Splunk redistribuye la consulta y
   devuelve los resultados conforme a los permisos y el acceso disponible.

Este flujo explica por qué Splunk puede ser tan potente para análisis de
incident response, seguridad, operaciones y monitorización: transforma datos
crudos en eventos estructurados y fácilmente consultables.

## Arquitectura mononodo del curso

La máquina preparada para el curso cumple simultáneamente varias funciones:

| Función | Implementación en el laboratorio |
|---|---|
| Sistema operativo | Ubuntu 24.04.5 LTS |
| Producto | Splunk Enterprise 10.4.3 |
| Interfaz | Splunk Web en el puerto 8000 |
| Administración | API y servicio en el puerto 8089 |
| Almacenamiento | Índice local `curso` |
| Recopilación | Entradas locales o carga de archivos de laboratorio |
| Acceso | Usuario administrador creado en el primer arranque |

La guía de instalación configura el servicio en `/opt/splunk` y habilita el
arranque automático con:

```bash
sudo /opt/splunk/bin/splunk enable boot-start -user splunk
```

Tras reiniciar Ubuntu, se debe comprobar el estado con:

```bash
sudo /opt/splunk/bin/splunk status
```

La razón de usar esta topología es pedagógica: permite ver el ciclo completo de
los datos sin distraernos con la complejidad de un entorno distribuido. Esto es
especialmente útil para principiantes, ya que la lógica de ingestión, indexación
y búsqueda se entiende mejor cuando todo ocurre en una sola máquina.

## Arquitectura distribuida

Cuando el volumen de datos o el número de usuarios crece, una sola máquina puede
quedar corta. Una arquitectura distribuida separa funciones y añade redundancia,
escalabilidad y aislamiento:

```text
Fuentes -> Forwarders -> Indexers agrupados -> Search Head(s) -> Usuarios
```

Ventajas habituales:

- Escalar el almacenamiento añadiendo indexers.
- Repartir el trabajo de búsqueda entre varios search heads.
- Aislar la recopilación de los sistemas de análisis.
- Mejorar la disponibilidad mediante redundancia.
- Aplicar permisos y responsabilidades por componente.

El coste es que aparece una nueva capa de complejidad: certificados,
comunicación entre nodos, sincronización, licencias, despliegue, roles de
seguridad, configuración de redes y monitorización. Por eso, en un curso
introductorio, se prefiere una instalación mononodo para mantener el foco en el
aprendizaje de Splunk y no en la operativa de un entorno distribuido.

## Puertos principales

| Puerto | Componente o función | Uso en el curso |
|---:|---|---|
| 8000 | Splunk Web | Sí, acceso desde el navegador. |
| 8089 | API y administración de `splunkd` | Sí, funcionamiento interno. |
| 9997 | Recepción desde Universal Forwarder | Solo si se configura un forwarder. |

Comprueba los puertos activos con:

```bash
sudo ss -ltnp | grep -E ':8000|:8089|:9997'
```

Es importante que el puerto abierto no se interprete como garantía de que los
datos están bien indexados. Un servicio puede estar escuchando, pero aún así
haber problemas en la entrada, el parsing, la configuración del índice o la
consulta de búsqueda. Por eso la validación completa requiere revisar la fuente,
la entrada y el resultado buscado.

## Seguridad básica

Incluso en un laboratorio local, es recomendable aplicar estas medidas:

- Utiliza una contraseña administrativa única y robusta.
- No publiques los puertos de administración en Internet.
- Limita el acceso del firewall a las redes necesarias.
- Evita ejecutar operaciones habituales como `root` si no son necesarias.
- Conserva las credenciales fuera de los documentos públicos del curso.
- Revisa los permisos de cualquier archivo que contenga datos sensibles.

La cuenta administrativa de Splunk controla la aplicación y no debe confundirse
con la cuenta utilizada para iniciar sesión en Ubuntu.

## Diagnóstico rápido de arquitectura

Cuando algo falla, una forma útil de actuar es seguir este orden:

1. Verifica que la fuente existe y genera eventos.
2. Comprueba que Splunk está monitorizando la entrada correcta.
3. Revisa si el evento llega con el timestamp y el formato esperados.
4. Confirma que el host, source y sourcetype son los adecuados.
5. Asegúrate de que el dato ha llegado al índice correcto.
6. Ejecuta la búsqueda con el intervalo temporal adecuado.
7. Comprueba permisos y visibilidad en la interfaz.

Este flujo convierte la arquitectura en una herramienta de diagnóstico, no solo
de almacenamiento.

## Referencias y recursos recomendados

Para ampliar la teoría y contrastar la práctica del curso, estas son
referencias oficiales de Splunk útiles:

- [Documentación de Splunk sobre indexers](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexers)
- [Documentación sobre search heads](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutsearchheads)
- [Documentación sobre forwarders](https://docs.splunk.com/Documentation/Splunk/latest/Forwarding/Aboutforwarding)
- [Visión general de configuración de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Configurationoverview)
- [Guía de administración general](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Welcome-to-Admin)

Además de la documentación oficial, el curso sigue una progresión práctica que
irá conectando estos conceptos con:

- ingestión de datos,
- parsing y extracción de campos,
- búsquedas SPL,
- estadísticas y visualización,
- alertas y paneles.

## Resumen

En el laboratorio, una sola instalación de Splunk Enterprise desempeña las
funciones de indexer, search head y servidor de Splunk Web. También puede
recibir datos locales sin necesidad de instalar un Universal Forwarder. Aunque
la arquitectura sea mononodo, el modelo mental debe seguir siendo el de un
sistema distribuido en capas: origen, entrada, procesamiento, indexación,
búsqueda y presentación.

Comprender esta arquitectura permite no solo usar Splunk, sino diagnosticarlo,
expandirlo y mantenerlo con criterio cuando la carga de datos o el número de
usuarios crece.