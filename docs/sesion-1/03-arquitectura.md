# 3. Arquitectura

La arquitectura de Splunk distribuye las responsabilidades de recopilación,
procesamiento, almacenamiento y búsqueda. En una instalación pequeña todas
esas responsabilidades pueden ejecutarse en una misma máquina; en un entorno
grande se separan en varios componentes.

El laboratorio del curso utiliza una arquitectura **mononodo**:

```text
Ubuntu 24.04.5 LTS
└── Splunk Enterprise 10.0.1
		├── Recepción de datos
		├── Procesamiento e indexación
		├── Almacenamiento
		├── Búsqueda
		└── Splunk Web
```

Esta topología es suficiente para aprender el flujo completo y simplifica la
instalación manual. Los conceptos son los mismos que se aplican en una
arquitectura distribuida.

## Componentes principales

### Forwarder

Un **forwarder** recopila datos en una máquina y los envía a otro componente
de Splunk. Es útil cuando los logs están repartidos entre muchos servidores y
no se quiere instalar una instancia completa de Enterprise en cada uno.

El **Universal Forwarder** es una versión ligera orientada principalmente a la
recopilación y el envío. En el laboratorio no es obligatorio: los datos de
prácticas pueden cargarse directamente en la instancia local.

Flujo típico con un forwarder:

```text
Servidor con logs -> Universal Forwarder -> Indexer -> Search Head
```

El puerto habitual para recibir datos de un forwarder es `9997`. Solo debe
abrirse y configurarse si el laboratorio utiliza realmente ese mecanismo.

### Indexer

El **indexer** recibe eventos, los procesa, crea estructuras de índice y los
almacena. También ejecuta parte del trabajo necesario para responder a las
búsquedas.

En la instalación mononodo, el indexer forma parte de la instancia de Splunk
Enterprise instalada en `/opt/splunk`. El índice de prácticas `curso` se
almacenará en esa instancia.

Responsabilidades habituales del indexer:

- Recibir eventos desde entradas locales o remotas.
- Determinar límites y timestamps de los eventos.
- Asignar metadatos como `host`, `source` y `sourcetype`.
- Escribir datos y metadatos en el índice.
- Responder a las partes de búsqueda que afectan a sus datos.
- Aplicar las políticas de retención configuradas.

### Search head

El **search head** es el componente que coordina las búsquedas y presenta los
resultados. En una arquitectura distribuida envía las consultas a uno o más
indexers, combina sus respuestas y muestra el resultado al usuario.

En una instalación mononodo, el search head y el indexer se ejecutan en la
misma instancia. Esto evita configurar comunicación entre varios servidores,
pero no elimina la separación conceptual entre buscar y almacenar.

### Splunk Web

**Splunk Web** es la interfaz de usuario accesible por HTTP. En este curso se
utiliza el puerto `8000`:

```text
http://localhost:8000
```

Desde el navegador, Splunk Web permite iniciar búsquedas, administrar índices,
configurar entradas y consultar el estado de la instancia.

### splunkd

`splunkd` es el servicio principal de Splunk. Gestiona buena parte de las
funciones internas, incluida la comunicación, la administración, el
procesamiento de datos y las búsquedas.

El puerto de administración y API más habitual es `8089`. No debe exponerse a
Internet sin una configuración de seguridad adecuada.

## Flujo de datos

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

Este diagnóstico por etapas es más eficaz que reinstalar Splunk cada vez que
una búsqueda no devuelve resultados.

## Arquitectura mononodo del curso

La máquina preparada para el curso cumple simultáneamente varias funciones:

| Función | Implementación en el laboratorio |
|---|---|
| Sistema operativo | Ubuntu 24.04.5 LTS |
| Producto | Splunk Enterprise 10.0.1 |
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

## Arquitectura distribuida

Cuando el volumen de datos o el número de usuarios crece, una sola máquina
puede dejar de ser suficiente. Una arquitectura distribuida separa funciones:

```text
Fuentes -> Forwarders -> Indexers agrupados -> Search Head(s) -> Usuarios
```

Ventajas habituales:

- Escalar el almacenamiento añadiendo indexers.
- Repartir el trabajo de búsqueda.
- Aislar la recopilación de los sistemas de análisis.
- Mejorar la disponibilidad mediante redundancia.
- Aplicar permisos y responsabilidades por componente.

La distribución introduce complejidad adicional: certificados, comunicación
entre nodos, sincronización, licencias, roles, búsquedas distribuidas y
monitorización. Por ese motivo no se utiliza como requisito para este curso
introductorio.

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

Un puerto abierto no garantiza que los datos estén correctamente indexados; es
solo una comprobación de conectividad. La validación completa requiere revisar
la entrada, el índice y una búsqueda.

## Seguridad básica

Incluso en un laboratorio local, aplica estas medidas:

- Utiliza una contraseña administrativa única y robusta.
- No publiques los puertos de administración en Internet.
- Limita el acceso del firewall a las redes necesarias.
- No ejecutes operaciones habituales con `root` si no son necesarias.
- Conserva las credenciales fuera de los documentos públicos del curso.
- Revisa los permisos de los archivos que contengan datos sensibles.

La cuenta administrativa de Splunk controla la aplicación y no debe confundirse
con la cuenta utilizada para iniciar sesión en Ubuntu.

## Resumen

En el laboratorio, una única instalación de Splunk Enterprise desempeña las
funciones de indexer, search head y servidor de Splunk Web. También puede
recibir datos mediante entradas locales, sin necesidad de instalar un
Universal Forwarder. Comprender esta arquitectura mononodo permite seguir el
flujo de los datos y prepara el salto posterior a entornos distribuidos.
