# Enlaces

Listado útil de sitios, documentación oficial y recursos externos.

Este documento reúne los enlaces que se utilizarán durante el curso y el proyecto
final de monitorización de una aplicación web con Splunk Enterprise.

Los enlaces se han organizado por temática para que los asistentes puedan encontrar
rápidamente la referencia adecuada durante una práctica o una actividad de
troubleshooting.

La documentación principal debe consultarse siempre junto con las pruebas
realizadas en la instancia del laboratorio.

---

## 1. Información del entorno de referencia

El laboratorio utiliza como referencia:

- Splunk Enterprise 10.4.3.
- Ubuntu 24.04.5 LTS.
- Arquitectura mononodo.
- Splunk Web en `http://localhost:8000`.
- Índice principal: `curso`.
- Usuario de configuración: `admin`.
- Dataset principal: eventos web.

Las rutas, menús y capacidades pueden variar según:

- versión de Splunk;
- tipo de dashboard;
- permisos del usuario;
- sistema operativo;
- método de ingesta;
- aplicación desde la que se crean los objetos;
- configuración de seguridad;
- topología de la plataforma.

Antes de aplicar una instrucción, comprueba que es compatible con la versión del
laboratorio.

---

# 2. Documentación oficial de Splunk

La documentación oficial de Splunk debe ser la primera fuente de consulta para
resolver dudas sobre configuración, SPL, dashboards, alertas y permisos.

## Splunk Enterprise Documentation

Documentación general del producto.

Incluye información sobre:

- administración;
- búsquedas;
- indexación;
- entradas de datos;
- dashboards;
- alertas;
- seguridad;
- usuarios;
- aplicaciones;
- API REST;
- troubleshooting.

- [Splunk Enterprise Documentation](https://docs.splunk.com/Documentation/Splunk)

## Splunk Help

Portal de ayuda con documentación organizada por producto, versión y área
funcional.

- [Splunk Help](https://help.splunk.com/)

## Splunk Enterprise 10.4

Página de referencia de la documentación correspondiente a la rama 10.4.

- [Splunk Enterprise 10.4 Documentation](https://help.splunk.com/en/splunk-enterprise)

## Notas de versión

Antes de aplicar una configuración, revisa las notas de versión si sospechas que
existe una diferencia de comportamiento entre versiones.

- [Splunk Enterprise Release Notes](https://help.splunk.com/en/splunk-enterprise/release-notes)

Las notas de versión pueden incluir información sobre:

- nuevas funcionalidades;
- cambios de comportamiento;
- problemas conocidos;
- funcionalidades obsoletas;
- requisitos del sistema;
- cambios de seguridad;
- problemas de compatibilidad.

---

# 3. Búsqueda y lenguaje SPL

Estas referencias son esenciales para las prácticas de búsqueda, cálculo de
métricas y creación de resultados para dashboards.

## Search Manual

Manual general sobre búsquedas en Splunk.

- [Splunk Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchapp)

Utilízalo para comprender:

- cómo funciona Search & Reporting;
- cómo se selecciona un intervalo temporal;
- cómo se ejecutan las búsquedas;
- cómo se guardan búsquedas;
- cómo se interpretan los resultados;
- cómo se utilizan campos;
- cómo se investigan eventos.

## Search Reference

Referencia técnica de comandos, funciones y operadores SPL.

- [Splunk Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)

Resulta especialmente útil para consultar:

- `stats`;
- `eval`;
- `where`;
- `search`;
- `table`;
- `fields`;
- `sort`;
- `head`;
- `tail`;
- `timechart`;
- `chart`;
- `eventstats`;
- `streamstats`;
- `rex`;
- `spath`;
- `dedup`;
- `rename`;
- `lookup`;
- `fieldsummary`.

## Comando `stats`

- [`stats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Stats)

Ejemplo:

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

Ejemplo agrupado:

```spl
index=curso earliest=0 latest=now
| stats count as peticiones by host
| sort - peticiones
```

Ejemplo con varias métricas:

```spl
index=curso earliest=0 latest=now
| stats
    count as peticiones
    count(eval(status=500)) as errores_500
    dc(uri) as uri_distintas
```

## Comando `eval`

- [`eval`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Eval)

Ejemplo de conversión numérica:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
```

Ejemplo de clasificación:

```spl
index=curso earliest=0 latest=now
| eval clase_http=case(
    status_num>=500, "5xx",
    status_num>=400, "4xx",
    status_num>=300, "3xx",
    status_num>=200, "2xx",
    true(), "otro"
)
```

## Comando `where`

- [`where`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Where)

Ejemplo:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
```

`where` resulta especialmente útil después de crear un campo calculado.

## Comando `timechart`

- [`timechart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart)

Ejemplo:

```spl
index=curso earliest=0 latest=now
| timechart span=1m count as peticiones
```

Ejemplo separando respuestas correctas y errores:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval resultado=if(status_num>=400, "Error", "Correcta")
| timechart span=1m count by resultado
```

## Comando `fieldsummary`

- [`fieldsummary`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fieldsummary)

Ejemplo:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Utiliza esta búsqueda cuando no conozcas los nombres reales de los campos del
dataset.

## Búsqueda optimizada

- [Search Optimization](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutsearchoptimization)

Buenas prácticas:

- indica el índice;
- utiliza un intervalo temporal;
- filtra pronto;
- evita `index=*` salvo diagnóstico;
- evita `table *`;
- limita resultados cuando proceda;
- no ejecutes búsquedas históricas muy amplias sin necesidad;
- documenta búsquedas utilizadas por alertas;
- comprueba el coste de reportes programados.

---

# 4. Ingesta y entrada de datos

Estas referencias ayudan a entender cómo se incorporan eventos a Splunk.

## Get Data In

- [Get Data In](https://docs.splunk.com/Documentation/Splunk/latest/Get started/Getdatain)

Utiliza esta referencia para estudiar:

- carga de archivos;
- monitorización de directorios;
- entradas de red;
- fuentes de datos;
- selección de índice;
- selección de `sourcetype`;
- revisión de la vista previa.

## How Splunk Processes Data

- [How Splunk Processes Data](https://docs.splunk.com/Documentation/Splunk/latest/Data/HowSplunkprocessesdata)

Explica el recorrido general:

```text
Entrada
    ↓
Parsing
    ↓
Asignación de metadatos
    ↓
Indexación
    ↓
Búsqueda
```

Esta referencia resulta útil para diagnosticar por qué un archivo existe en
Ubuntu, pero todavía no aparece en Splunk.

## Monitor Files and Directories

- [Monitor Files and Directories](https://docs.splunk.com/Documentation/Splunk/latest/Data/Monitorfilesanddirectories)

Ejemplo de entrada monitorizada:

```text
/var/log/splunk-curso/eventos_web.csv
```

Ejemplo conceptual de configuración:

```ini
[monitor:///var/log/splunk-curso/eventos_web.csv]
disabled = false
index = curso
sourcetype = web:csv
host = web-lab
```

Antes de configurar una monitorización, comprueba:

```bash
ls -ld /var/log/splunk-curso
ls -l /var/log/splunk-curso/eventos_web.csv
```

## Source Types

- [About Source Types](https://docs.splunk.com/Documentation/Splunk/latest/Data/ABoutsourcetypes)

Los `sourcetypes` ayudan a indicar cómo debe interpretar Splunk una fuente.

Ejemplos utilizados en el curso:

```text
web:csv
web:csv:extended
curso_web_csv
```

El nombre debe ser consistente entre:

- entrada;
- documentación;
- búsquedas;
- reportes;
- dashboards;
- alertas.

## Inputs

- [Inputs.conf](https://help.splunk.com/en/data-management/splunk-enterprise-admin-manual/10.4/configuration-file-reference/10.4.0-configuration-file-reference/inputs.conf)

Esta referencia es útil cuando el asistente debe revisar o crear una entrada de
monitorización mediante configuración.

Ejemplo:

```ini
[monitor:///var/log/splunk-curso/eventos_incrementales.csv]
disabled = false
index = curso
sourcetype = web:csv
host = web-lab
```

No modifiques una configuración de producción sin revisar previamente:

- aplicación;
- contexto de configuración;
- permisos;
- prioridad de archivos;
- necesidad de reinicio o recarga;
- impacto sobre otras entradas.

---

# 5. Índices y almacenamiento

## About Indexes

- [About Indexes](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)

Utiliza esta referencia para comprender:

- índices;
- almacenamiento;
- retención;
- buckets;
- hot, warm, cold y frozen;
- permisos;
- configuración general;
- diferencias entre índices internos y de datos.

## Indexes.conf

- [Indexes.conf](https://help.splunk.com/en/data-management/splunk-enterprise-admin-manual/10.4/configuration-file-reference/10.4.0-configuration-file-reference/indexes.conf)

Referencia de configuración del archivo `indexes.conf`.

Ejemplo de consulta para revisar el índice:

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

## Buenas prácticas para el índice del curso

Utiliza un índice específico:

```text
curso
```

Evita almacenar datos de prácticas en índices no relacionados.

Documenta:

- nombre;
- finalidad;
- propietario;
- retención;
- permisos;
- fuentes;
- `sourcetypes`;
- usuarios autorizados.

## Consultar varios índices

Durante el troubleshooting puede utilizarse:

```spl
index=curso OR index=_internal
```

No utilices esta consulta como búsqueda normal de los dashboards del proyecto.

---

# 6. Dashboards y visualizaciones

## Dashboards

- [Splunk Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)

Referencia general para trabajar con dashboards y visualizaciones.

## Dashboard Studio

- [Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/IntroFrame)

Dashboard Studio permite crear dashboards con controles, visualizaciones y
configuración más flexible.

Utilízalo para estudiar:

- paneles;
- controles;
- tokens;
- filtros;
- layouts;
- visualizaciones;
- interacción entre componentes.

## Classic Dashboards

- [Classic Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/PanelreferenceforSimplifiedXML)

Referencia útil si el laboratorio utiliza dashboards clásicos o XML simplificado.

## Selección de visualizaciones

| Necesidad | Visualización recomendada |
|---|---|
| Total de eventos | Single value |
| Porcentaje de error | Single value o gauge |
| Evolución temporal | Línea |
| Errores por código | Barras o columnas |
| URI con más errores | Tabla o barras |
| Host con más errores | Barras o tabla |
| Últimos eventos | Tabla |
| Distribución de métodos | Barras o donut |
| Latencia por URI | Tabla o barras |
| Comparación entre métricas | Gráfico combinado |

## Ejemplo de panel de errores por código

```spl
index=curso earliest=$time.earliest$ latest=$time.latest$
| eval status_num=tonumber(status)
| stats count as errores by status_num
| sort status_num
```

## Ejemplo de panel temporal

```spl
index=curso earliest=$time.earliest$ latest=$time.latest$
| eval status_num=tonumber(status)
| eval resultado=if(status_num>=400, "Error", "Correcta")
| timechart span=1m count by resultado
```

La sintaxis exacta de los tokens depende del tipo de dashboard. Comprueba el
formato utilizado por la instancia.

## Buenas prácticas para dashboards

Un dashboard debe:

- tener un objetivo;
- utilizar títulos comprensibles;
- mostrar primero los indicadores principales;
- permitir investigar el detalle;
- utilizar un intervalo temporal;
- tener filtros probados;
- evitar paneles duplicados;
- mostrar alternativas si faltan campos;
- documentar el comportamiento sin datos;
- ser visible para el usuario final;
- no depender exclusivamente del rol `admin`.

---

# 7. Alertas

## About Alerts

- [About Alerts](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)

Referencia principal para crear, configurar y administrar alertas.

## Ejemplo de alerta del proyecto

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

La condición es:

```text
Cinco o más respuestas HTTP 500 durante los últimos cinco minutos.
```

## Elementos que deben documentarse

- nombre;
- propietario;
- aplicación;
- consulta;
- frecuencia;
- ventana temporal;
- condición;
- acción;
- destinatario;
- throttling;
- resultado de la prueba;
- actuación posterior.

## Prueba histórica

```spl
index=curso earliest="01/01/2026:00:00:00"
          latest="01/01/2026:00:10:00"
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

Esta búsqueda valida la lógica sobre datos históricos.

No debe presentarse como una prueba de funcionamiento en tiempo real.

## Alertas y permisos

- [Alert Permissions](https://help.splunk.com/en/splunk-enterprise/alert-and-respond/alerting-manual/9.0/manage-alert-and-alert-action-permissions)

Los permisos y capacidades determinan quién puede:

- crear una alerta;
- ejecutar una alerta;
- editarla;
- visualizarla;
- modificar sus acciones;
- compartirla.

---

# 8. Usuarios, roles y seguridad

## Role-Based User Access

- [About Configuring Role-Based User Access](https://help.splunk.com/en/splunk-enterprise/administer/manage-users-and-security/10.4/manage-splunk-platform-users-and-roles/about-configuring-role-based-user-access)

Esta referencia explica cómo controlar el acceso a:

- índices;
- dashboards;
- aplicaciones;
- recursos de la plataforma;
- objetos de conocimiento.

## Users and Roles

- [Users and Roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)

## Define Roles and Capabilities

- [Define Roles with Capabilities](https://help.splunk.com/en/splunk-enterprise/administer/manage-users-and-security/10.0/manage-splunk-platform-users-and-roles/define-roles-on-the-splunk-platform-with-capabilities)

## Knowledge Objects

- [Knowledge Objects](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)

Los siguientes objetos deben tratarse como objetos de conocimiento:

- búsquedas guardadas;
- reportes;
- dashboards;
- alertas;
- lookups;
- macros;
- campos calculados;
- event types.

## Principio de mínimo privilegio

En producción:

- no todos los usuarios necesitan `admin`;
- los analistas pueden tener permisos de búsqueda limitados;
- los usuarios finales pueden tener únicamente permisos de lectura;
- los propietarios de objetos deben estar definidos;
- el acceso al índice debe ser explícito;
- las alertas deben tener responsables;
- la modificación de dashboards debe estar controlada.

## Revisar el contexto del usuario

```spl
| rest /services/authentication/current-context
| table username roles
```

## Revisar objetos compartidos

La compartición de un dashboard o reporte debe documentarse junto con:

- aplicación;
- propietario;
- permisos de lectura;
- permisos de escritura;
- audiencia;
- dependencia de búsquedas privadas.

---

# 9. API REST de Splunk

## Splunk REST API Reference

- [Splunk REST API Reference](https://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTprolog)

La API REST puede utilizarse para consultar:

- índices;
- entradas;
- usuarios;
- roles;
- búsquedas guardadas;
- alertas;
- dashboards;
- configuración;
- estado de la plataforma.

## Revisar entradas monitorizadas

```spl
| rest /services/data/inputs/monitor
| table eai:acl.app path index sourcetype disabled
```

## Revisar índices

```spl
| rest /services/data/indexes
| table title disabled totalEventCount currentDBSizeMB
```

## Revisar el usuario actual

```spl
| rest /services/authentication/current-context
| table username roles
```

La API debe utilizarse respetando:

- autenticación;
- autorización;
- certificados;
- protección de credenciales;
- auditoría;
- permisos del usuario.

No incluyes tokens, contraseñas ni credenciales en archivos Markdown,
capturas o scripts compartidos.

---

# 10. Sistema operativo Ubuntu

## Ubuntu Server Documentation

- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)

## Systemd

- [Ubuntu Systemd](https://documentation.ubuntu.com/server/explanation/systemd/)

## Comandos utilizados en el laboratorio

### Estado del servicio

```bash
sudo systemctl status Splunkd
```

### Estado mediante Splunk

```bash
sudo /opt/splunk/bin/splunk status
```

### Versión instalada

```bash
/opt/splunk/bin/splunk version
```

### Puertos abiertos

```bash
sudo ss -lntp | grep -E '8000|8089|9997'
```

### Permisos de una ruta

```bash
ls -ld /var/log/splunk-curso
```

### Permisos de un archivo

```bash
ls -l /var/log/splunk-curso/eventos_web.csv
```

## Qué comprobar en Ubuntu

Cuando Splunk no ingiere un archivo, revisa:

- existencia de la ruta;
- permisos del directorio;
- permisos del archivo;
- usuario que ejecuta Splunk;
- procesos;
- servicio;
- puertos;
- espacio disponible;
- formato del archivo;
- crecimiento del archivo.

---

# 11. Troubleshooting

## Índice de troubleshooting

- [Splunk Troubleshooting](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Aboutthismanual)

## Diagnóstico mediante `_internal`

```spl
index=_internal earliest=-30m latest=now
| search log_level=error OR log_level=warn
| table _time host component log_level message
| sort - _time
```

## Problema: no aparecen eventos

Consulta inicial:

```spl
index=curso earliest=0 latest=now
| stats count
```

Después revisa:

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
```

Y:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

## Problema: el archivo existe, pero no aparece en Splunk

Revisa:

```bash
ls -ld /ruta
ls -l /ruta/archivo.csv
```

Después consulta:

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype disabled
```

## Problema: el timestamp no se reconoce

Revisa:

```spl
index=curso earliest=0 latest=now
| stats min(_time) as inicio max(_time) as fin
```

Compara con:

```spl
index=curso earliest=0 latest=now
| table _time _indextime _raw
| head 20
```

## Problema: el campo no existe

Ejecuta:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Después revisa el evento original:

```spl
index=curso earliest=0 latest=now
| table _raw
| head 20
```

## Problema: la alerta no se dispara

Comprueba:

- existencia de eventos recientes;
- timestamps dentro de los últimos cinco minutos;
- presencia de valores `500`;
- consulta ejecutada manualmente;
- estado habilitado de la alerta;
- frecuencia;
- throttling;
- permisos;
- acción configurada.

Consulta de diagnóstico:

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count as errores_500
```

---

# 12. Observabilidad y monitorización web

Splunk permite analizar eventos, pero una monitorización completa de una aplicación
web suele combinar logs, métricas, trazas y disponibilidad.

## Temas externos recomendados

Busca documentación y artículos sobre:

- observabilidad;
- monitorización de APIs;
- códigos HTTP;
- latencia;
- percentiles;
- disponibilidad;
- errores de aplicación;
- saturación;
- capacidad;
- experiencia de usuario;
- gestión de incidentes;
- detección de anomalías.

## Indicadores habituales

Una aplicación web puede observarse mediante:

- volumen de peticiones;
- tasa de errores;
- latencia;
- disponibilidad;
- códigos HTTP;
- URI problemáticas;
- hosts afectados;
- IP de origen;
- saturación;
- tiempos de respuesta;
- tamaño de respuesta.

## Relación con el proyecto

El proyecto trabaja principalmente con:

```text
Volumen
Errores
Códigos HTTP
URI
Host
IP, si existe
Latencia, si existe
```

No debes confundir:

- volumen con disponibilidad;
- error `4xx` con fallo del servidor;
- error `5xx` con causa raíz demostrada;
- media de latencia con experiencia de todos los usuarios;
- host con IP de cliente.

---

# 13. Recursos externos recomendados

Los recursos externos pueden complementar la documentación oficial, pero deben
utilizarse con criterio.

## Tipos de recursos útiles

- documentación oficial de Ubuntu;
- documentación del servidor web;
- documentación de la aplicación;
- documentación de bases de datos;
- artículos técnicos de observabilidad;
- guías de HTTP;
- publicaciones sobre rendimiento;
- libros de administración de sistemas;
- artículos sobre detección de anomalías;
- documentación de seguridad.

## Criterios para seleccionar un recurso externo

Comprueba:

- autor;
- organización;
- fecha;
- versión;
- propósito;
- reputación de la fuente;
- relación con el problema;
- posibilidad de verificar el contenido;
- compatibilidad con Splunk Enterprise 10.4.3.

Evita utilizar como única fuente:

- fragmentos de buscadores;
- respuestas sin contexto;
- publicaciones sin fecha;
- páginas sin autor;
- ejemplos sin versión;
- contenido que no pueda reproducirse;
- configuraciones copiadas sin comprobar.

## Cómo registrar un recurso externo

```markdown
## Nombre del recurso

- Tipo: artículo, libro, guía o documentación
- Autor:
- Organización:
- Fecha:
- URL:
- Tema:
- Relación con el proyecto:
- Fecha de consulta:
- Observaciones:
```

## Ejemplo

```markdown
## Guía sobre monitorización de aplicaciones web

- Tipo: artículo técnico
- Autor: ____________________
- Organización: ____________________
- Fecha: ____________________
- URL: ____________________
- Tema: latencia y tasa de errores
- Relación con el proyecto: ayuda a interpretar los paneles de rendimiento
- Fecha de consulta: ____________________
- Observaciones: debe contrastarse con los datos reales del laboratorio
```

---

# 14. Enlaces organizados por actividad

## Actividad: preparar el entorno

- [Splunk Enterprise Documentation](https://docs.splunk.com/Documentation/Splunk)
- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)
- [Ubuntu Systemd](https://documentation.ubuntu.com/server/explanation/systemd/)

## Actividad: crear o revisar un índice

- [About Indexes](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Indexes.conf](https://help.splunk.com/en/data-management/splunk-enterprise-admin-manual/10.4/configuration-file-reference/10.4.0-configuration-file-reference/indexes.conf)

## Actividad: ingerir un CSV

- [Get Data In](https://docs.splunk.com/Documentation/Splunk/latest/Get started/Getdatain)
- [Monitor Files and Directories](https://docs.splunk.com/Documentation/Splunk/latest/Data/Monitorfilesanddirectories)
- [Inputs.conf](https://help.splunk.com/en/data-management/splunk-enterprise-admin-manual/10.4/configuration-file-reference/10.4.0-configuration-file-reference/inputs.conf)

## Actividad: explorar datos

- [Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchapp)
- [Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)
- [`fieldsummary`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fieldsummary)

## Actividad: escribir SPL

- [`stats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Stats)
- [`eval`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Eval)
- [`where`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Where)
- [`timechart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart)

## Actividad: crear dashboards

- [Splunk Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)
- [Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/IntroFrame)
- [Classic Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/PanelreferenceforSimplifiedXML)

## Actividad: crear alertas

- [About Alerts](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Alert Permissions](https://help.splunk.com/en/splunk-enterprise/alert-and-respond/alerting-manual/9.0/manage-alert-and-alert-action-permissions)

## Actividad: revisar permisos

- [Role-Based User Access](https://help.splunk.com/en/splunk-enterprise/administer/manage-users-and-security/10.4/manage-splunk-platform-users-and-roles/about-configuring-role-based-user-access)
- [Users and Roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Knowledge Objects](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)

## Actividad: consultar la API

- [Splunk REST API Reference](https://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTprolog)

## Actividad: diagnosticar errores

- [Splunk Troubleshooting](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Aboutthismanual)
- [Search Optimization](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutsearchoptimization)
- [Splunk Enterprise Documentation](https://docs.splunk.com/Documentation/Splunk)

---

# 15. Ejemplos prácticos de uso de los enlaces

## Ejemplo 1: no aparecen datos

### Situación

El asistente ejecuta:

```spl
index=curso earliest=-15m latest=now
```

y no obtiene resultados.

### Enlaces que debe consultar

1. documentación de búsqueda;
2. documentación de entradas;
3. documentación de índices;
4. documentación de troubleshooting.

### Secuencia práctica

```spl
index=curso earliest=0 latest=now
| stats count
```

Después:

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype disabled
```

Y finalmente:

```spl
index=_internal earliest=-30m latest=now
| search log_level=error OR log_level=warn
| table _time component log_level message
| sort - _time
```

### Conclusión esperada

El asistente debe diferenciar entre:

- no hay eventos;
- el rango es incorrecto;
- el índice es incorrecto;
- la entrada está deshabilitada;
- el archivo no tiene permisos;
- el timestamp está fuera de la ventana;
- existe un error de configuración.

---

## Ejemplo 2: el dashboard muestra paneles vacíos

### Situación

El dashboard se abre, pero varios paneles no muestran datos.

### Comprobaciones

1. ejecutar la búsqueda del panel fuera del dashboard;
2. sustituir temporalmente los tokens por valores fijos;
3. ampliar el rango temporal;
4. comprobar el índice;
5. revisar los campos;
6. probar el usuario final;
7. comprobar permisos de la búsqueda guardada.

### Consulta base

```spl
index=curso earliest=0 latest=now
| stats count
```

### Consulta de campos

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

### Conclusión esperada

No debe modificarse el layout antes de comprobar que las consultas funcionan
fuera del dashboard.

---

## Ejemplo 3: la alerta no se activa

### Situación

La alerta de cinco errores HTTP `500` no se dispara.

### Consulta de prueba

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count as errores_500
```

### Comprobaciones

- ¿Hay eventos nuevos?
- ¿El timestamp está dentro de los últimos cinco minutos?
- ¿El valor es realmente `500`?
- ¿La alerta está habilitada?
- ¿La frecuencia es correcta?
- ¿El usuario puede ejecutar la alerta?
- ¿Existe throttling?
- ¿La acción está configurada?

### Documentación esperada

La entrega debe indicar si la alerta:

- se probó con eventos históricos;
- se probó con eventos recientes;
- se probó en tiempo real;
- no pudo probarse por falta de datos;
- necesita un archivo incremental.

---

## Ejemplo 4: falta el campo de IP

### Situación

El proyecto solicita identificar la IP con más errores, pero el dataset solo
contiene:

```text
timestamp,host,method,status,uri
```

### Consulta

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

### Decisión correcta

Documentar:

> El dataset no contiene una IP de origen. Por tanto, no se puede realizar un
> análisis fiable por cliente. Se utiliza un análisis alternativo por host y se
> propone añadir `clientip` en una futura versión de la fuente.

### Consulta alternativa

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| sort - errores
```

---

# 16. Cómo citar los enlaces en los entregables

Cuando una fuente se utilice para justificar una decisión, registra:

- número o nombre de referencia;
- título;
- enlace;
- parte del proyecto relacionada;
- fecha de consulta.

## Ejemplo

```markdown
La configuración de la entrada de monitorización se basó en la documentación
oficial de `inputs.conf`.

Referencia:
- Splunk, `inputs.conf`.
- https://help.splunk.com/en/data-management/splunk-enterprise-admin-manual/10.4/configuration-file-reference/10.4.0-configuration-file-reference/inputs.conf
- Consultada el: ____________________
```

## No sustituir la prueba por una referencia

La documentación explica cómo debería funcionar una capacidad.

La práctica debe demostrar que funciona en la instancia del curso.

Por ejemplo:

- una referencia puede explicar cómo crear una alerta;
- la evidencia debe mostrar que la alerta se creó y se probó;
- una referencia puede explicar `timechart`;
- la evidencia debe mostrar una búsqueda ejecutada;
- una referencia puede explicar roles;
- la evidencia debe mostrar los permisos configurados.

---

# 17. Lista de comprobación de enlaces

## Documentación oficial

- [ ] Se ha consultado la documentación general de Splunk.
- [ ] Se ha consultado Search Manual.
- [ ] Se ha consultado Search Reference.
- [ ] Se ha revisado la documentación de ingesta.
- [ ] Se ha revisado la documentación de índices.
- [ ] Se ha consultado la documentación de dashboards.
- [ ] Se ha consultado la documentación de alertas.
- [ ] Se ha consultado la documentación de usuarios y roles.
- [ ] Se ha consultado la documentación de REST si se utilizó la API.
- [ ] Se ha consultado la documentación de Ubuntu si se modificó el sistema.

## Compatibilidad

- [ ] El enlace corresponde con el producto utilizado.
- [ ] La versión está documentada.
- [ ] Se han revisado las diferencias de versión.
- [ ] Se han comprobado los ejemplos en el laboratorio.
- [ ] No se han copiado configuraciones sin validarlas.

## Entrega

- [ ] Las fuentes utilizadas están identificadas.
- [ ] Los enlaces se pueden abrir.
- [ ] La fecha de consulta está registrada.
- [ ] Cada fuente tiene una utilidad concreta.
- [ ] Las fuentes externas están contrastadas.
- [ ] No se han incluido credenciales.
- [ ] No se han incluido tokens privados.
- [ ] Las capturas no exponen información sensible.

---

# 18. Referencias oficiales principales

- [Splunk Enterprise Documentation](https://docs.splunk.com/Documentation/Splunk)
- [Splunk Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchapp)
- [Splunk Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)
- [How Splunk Processes Data](https://docs.splunk.com/Documentation/Splunk/latest/Data/HowSplunkprocessesdata)
- [Monitor Files and Directories](https://docs.splunk.com/Documentation/Splunk/latest/Data/Monitorfilesanddirectories)
- [About Indexes](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Splunk Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)
- [Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/IntroFrame)
- [About Alerts](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Users and Roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Knowledge Objects](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)
- [Splunk REST API Reference](https://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTprolog)
- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)
- [Ubuntu Systemd](https://documentation.ubuntu.com/server/explanation/systemd/)