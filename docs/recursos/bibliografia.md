# Bibliografía

Libros, artículos y documentación recomendada para profundizar en Splunk
Enterprise, el lenguaje SPL, la monitorización de aplicaciones web, la gestión de
alertas, los dashboards y la administración segura de la plataforma.

La bibliografía se organiza por categorías para que el participante pueda localizar
rápidamente la documentación relacionada con cada parte del proyecto.

---

## 1. Documentación oficial de Splunk

La documentación oficial debe ser la referencia principal para comprobar la
sintaxis, las capacidades disponibles y el comportamiento de Splunk Enterprise.

### Splunk Enterprise Documentation

Documentación general del producto, sus componentes y sus procedimientos de
administración.

- [Splunk Enterprise Documentation](https://docs.splunk.com/Documentation/Splunk)

### Splunk Search Manual

Manual de referencia para comprender el funcionamiento de las búsquedas, los
rangos temporales, la exploración de eventos y las buenas prácticas de búsqueda.

- [Splunk Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchapp)

### Splunk Search Reference

Referencia técnica de comandos y funciones SPL.

- [Splunk Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)

Esta referencia resulta especialmente útil para consultar:

- `stats`;
- `eval`;
- `where`;
- `timechart`;
- `table`;
- `sort`;
- `head`;
- `fieldsummary`;
- funciones estadísticas;
- funciones de conversión;
- funciones de fecha y hora.

---

## 2. Referencias sobre SPL

El proyecto utiliza SPL para transformar eventos en indicadores y resultados
operativos.

### Comando `stats`

Se utiliza para realizar agregaciones, recuentos, medias, sumas, máximos,
mínimos y percentiles.

- [`stats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Stats)

Ejemplos de uso:

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

```spl
index=curso earliest=0 latest=now
| stats count by host
```

### Comando `eval`

Se utiliza para crear campos calculados y transformar valores.

- [`eval`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Eval)

Ejemplo:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
```

### Comando `timechart`

Se utiliza para crear series temporales.

- [`timechart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart)

Ejemplo:

```spl
index=curso earliest=0 latest=now
| timechart span=1m count as peticiones
```

### Comando `where`

Se utiliza para filtrar resultados después de realizar cálculos o crear campos.

- [`where`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Where)

Ejemplo:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
```

### Comando `fieldsummary`

Se utiliza para explorar los campos disponibles en los resultados de una búsqueda.

- [`fieldsummary`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fieldsummary)

Ejemplo:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

---

## 3. Ingesta y gestión de datos

Estas referencias ayudan a comprender cómo Splunk recibe, interpreta, procesa y
almacena los eventos.

### How Splunk processes data

Explica el flujo general de procesamiento de datos desde la entrada hasta la
indexación y la búsqueda.

- [How Splunk processes data](https://docs.splunk.com/Documentation/Splunk/latest/Data/HowSplunkprocessesdata)

### Monitor files and directories

Referencia para configurar la monitorización de archivos y directorios.

- [Monitor files and directories](https://docs.splunk.com/Documentation/Splunk/latest/Data/Monitorfilesanddirectories)

### About indexes

Explica el funcionamiento de los índices, su configuración y su administración.

- [About indexes](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)

### Source types

Los `sourcetypes` permiten indicar a Splunk cómo debe interpretar una fuente de
datos.

- [About source types](https://docs.splunk.com/Documentation/Splunk/latest/Data/ABoutsourcetypes)

### Data inputs

Referencia general sobre las entradas de datos disponibles en Splunk Enterprise.

- [Get data in](https://docs.splunk.com/Documentation/Splunk/latest/Get started/Getdatain)

---

## 4. Dashboards y visualizaciones

Estas referencias ayudan a diseñar dashboards orientados a la operación y no
únicamente a la presentación visual.

### Dashboards en Splunk Enterprise

- [About dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)

### Dashboard Studio

Referencia para crear dashboards mediante Dashboard Studio.

- [Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/IntroFrame)

### Visualizaciones

La documentación permite seleccionar una visualización adecuada según la pregunta
que se desea responder.

Se recomienda utilizar:

| Necesidad | Visualización recomendada |
|---|---|
| Mostrar una cifra principal | Single value |
| Comparar códigos HTTP | Barras o columnas |
| Mostrar evolución temporal | Línea temporal |
| Presentar eventos concretos | Tabla |
| Mostrar un ranking | Barras o tabla ordenada |
| Comparar métricas | Gráfico combinado |
| Analizar latencia | Tabla con media y percentiles |

### Buenas prácticas para dashboards

Un dashboard debe:

- tener un objetivo definido;
- utilizar títulos claros;
- evitar paneles redundantes;
- presentar primero los indicadores principales;
- permitir investigar los detalles;
- incluir un intervalo temporal;
- informar cuando no existen resultados;
- documentar las consultas utilizadas;
- tener filtros probados;
- utilizar permisos coherentes.

---

## 5. Alertas y monitorización

Estas referencias ayudan a crear alertas que sean útiles y accionables.

### Alertas en Splunk Enterprise

- [About alerts](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)

### Búsquedas guardadas y alertas

- [Saved searches](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgemanagement)

### Buenas prácticas para alertas

Una alerta debe definir:

- condición;
- consulta;
- intervalo temporal;
- frecuencia;
- acción;
- destinatario;
- throttling;
- procedimiento posterior;
- criterio de recuperación;
- impacto esperado.

Ejemplo de alerta del proyecto:

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

La alerta debe probarse antes de activarse.

También se debe diferenciar entre:

- una búsqueda histórica utilizada para validar la lógica;
- una alerta que consulta eventos recientes;
- una alerta que recibe datos continuamente;
- una alerta que puede generar repetición de avisos.

---

## 6. Seguridad, usuarios y roles

Estas referencias ayudan a gestionar el acceso a índices, aplicaciones, dashboards,
reportes y alertas.

### Usuarios y roles

- [Users and roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)

### Control de acceso

- [About authentication, authorization and audit](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutsecurity)

### Objetos de conocimiento

Los dashboards, reportes, búsquedas guardadas y alertas son objetos de conocimiento
que pueden tener propietarios y permisos diferentes.

- [Knowledge objects](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)

### Principio de mínimo privilegio

En un entorno real:

- no todos los usuarios deben tener rol `admin`;
- los analistas deberían tener permisos de búsqueda limitados;
- los usuarios finales deberían poder consultar los dashboards necesarios;
- los propietarios no deberían modificar objetos fuera de su responsabilidad;
- el acceso al índice debe concederse de forma explícita;
- las alertas deben tener responsables identificados.

El proyecto utiliza `admin` como ayuda para el laboratorio, pero debe documentar
que este no es necesariamente el modelo adecuado para producción.

---

## 7. API REST y administración

La API REST permite consultar y administrar diferentes recursos de Splunk.

### Splunk REST API Reference

- [Splunk REST API Reference](https://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTprolog)

Ejemplo utilizado durante el proyecto:

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

Ejemplo para revisar el contexto del usuario:

```spl
| rest /services/authentication/current-context
| table username roles
```

La API debe utilizarse respetando los permisos y las medidas de seguridad del
entorno.

---

## 8. Documentación del sistema operativo

El laboratorio utiliza Ubuntu como sistema de referencia. Estas fuentes permiten
comprobar el estado del servicio, los puertos y los procesos relacionados.

### Systemd en Ubuntu

- [Ubuntu Systemd](https://documentation.ubuntu.com/server/explanation/systemd/)

### Gestión de servicios

Comandos utilizados en el laboratorio:

```bash
sudo systemctl status Splunkd
```

```bash
sudo /opt/splunk/bin/splunk status
```

### Revisión de puertos

```bash
sudo ss -lntp | grep -E '8000|8089|9997'
```

Estas comprobaciones ayudan a diferenciar un problema de Splunk Web de un problema
del servicio, del puerto o del sistema operativo.

---

## 9. Logs internos de Splunk

Los índices internos permiten investigar problemas de la propia plataforma.

### Búsqueda de errores recientes

```spl
index=_internal earliest=-30m latest=now
| search log_level=error OR log_level=warn
| table _time host component log_level message
| sort - _time
```

### Usos habituales

Los logs internos pueden ayudar a investigar:

- errores de configuración;
- problemas de entradas;
- fallos de búsqueda;
- problemas de permisos;
- errores de ejecución;
- alertas que no se ejecutan;
- problemas de comunicación;
- advertencias del servicio.

El acceso a los índices internos depende de los permisos del usuario.

---

## 10. Observabilidad de aplicaciones web

Aunque el proyecto se centra en eventos web, es útil conocer conceptos generales
de monitorización de aplicaciones.

### Indicadores principales

Se recomienda observar:

- volumen de peticiones;
- tasa de errores;
- latencia;
- disponibilidad;
- códigos HTTP;
- URI problemáticas;
- hosts afectados;
- IP o clientes con actividad anormal;
- evolución temporal.

### Relación entre indicadores

Un único indicador puede llevar a conclusiones incompletas.

Por ejemplo:

- muchas peticiones no significan necesariamente buena salud;
- pocos errores absolutos pueden representar una tasa elevada si el volumen es bajo;
- una media de latencia baja puede ocultar valores extremos;
- muchos errores `4xx` no implican necesariamente un fallo del servidor;
- los errores `5xx` pueden requerir correlación con otros logs.

### Percentiles de latencia

Cuando existe una métrica de duración, el percentil 95 puede resultar más útil que
la media para localizar respuestas lentas.

Ejemplo:

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(tiempo_ms)
| stats
    avg(tiempo_ms) as media_ms
    median(tiempo_ms) as mediana_ms
    perc95(tiempo_ms) as p95_ms
    max(tiempo_ms) as maximo_ms
    by uri
| sort - p95_ms
```

Esta consulta solo debe utilizarse si `response_time` existe y su unidad está
documentada.

---

## 11. Libros y formación complementaria

Los libros pueden ayudar a comprender la administración, la búsqueda y la
monitorización más allá del ejercicio concreto.

Antes de utilizar una edición, comprueba:

- año de publicación;
- versión de Splunk utilizada;
- compatibilidad con Splunk Enterprise;
- actualización de los ejemplos;
- diferencias entre dashboards clásicos y Dashboard Studio;
- cambios en la sintaxis o en las capacidades del producto.

### Temas recomendados para profundizar

- administración de Splunk Enterprise;
- gestión de índices;
- monitorización de archivos;
- lenguaje SPL;
- creación de dashboards;
- alertas;
- control de acceso;
- búsqueda distribuida;
- optimización de búsquedas;
- troubleshooting;
- observabilidad de aplicaciones;
- monitorización de servicios web.

Las ediciones antiguas pueden ser útiles para comprender conceptos, pero siempre
deben contrastarse con la documentación oficial de la versión instalada en el
laboratorio.

---

## 12. Artículos y recursos técnicos

Para ampliar el proyecto, se pueden consultar artículos técnicos sobre:

- diseño de indicadores operativos;
- observabilidad;
- análisis de logs;
- detección de anomalías;
- monitorización de APIs;
- rendimiento web;
- gestión de incidentes;
- análisis de errores HTTP;
- seguridad de aplicaciones;
- control de acceso;
- automatización de alertas.

Al utilizar un artículo técnico, documenta:

- título;
- autor o autores;
- organización o publicación;
- fecha;
- enlace;
- tema relacionado;
- utilidad para el proyecto;
- fecha de consulta.

### Plantilla para artículos

```markdown
## Título del artículo

- Autor:
- Organización:
- Fecha:
- Enlace:
- Tema:
- Relación con el proyecto:
- Fecha de consulta:
```

No se recomienda utilizar una publicación como única fuente para justificar una
decisión técnica. Contrasta la información con la documentación oficial y con las
pruebas realizadas en el laboratorio.

---

## 13. Formato recomendado de las referencias

Para mantener una bibliografía homogénea, registra cada fuente con esta estructura:

```markdown
## Nombre de la fuente

- Tipo: documentación oficial, libro, artículo o recurso técnico
- Autor u organización:
- Año o fecha:
- Título:
- Enlace:
- Tema:
- Utilidad para el proyecto:
- Fecha de consulta:
```

### Ejemplo

```markdown
## Splunk Search Reference

- Tipo: documentación oficial
- Autor u organización: Splunk
- Año o fecha: documentación en línea
- Título: Splunk Search Reference
- Enlace: https://docs.splunk.com/Documentation/Splunk/latest/SearchReference
- Tema: lenguaje SPL
- Utilidad para el proyecto: consultar comandos y funciones utilizadas en las búsquedas
- Fecha de consulta: ____________________
```

---

## 14. Criterios para seleccionar fuentes

Una fuente bibliográfica debe ser:

- relevante para el objetivo;
- suficientemente actual;
- identificable;
- accesible;
- técnicamente verificable;
- relacionada con la versión utilizada;
- útil para justificar una decisión.

Prioriza:

1. documentación oficial de Splunk;
2. documentación oficial de Ubuntu;
3. documentación del fabricante de la tecnología;
4. libros técnicos reconocidos;
5. artículos de organizaciones especializadas;
6. publicaciones académicas o profesionales;
7. blogs técnicos con autoría y fecha claramente identificadas.

Evita utilizar como referencia principal:

- fragmentos sin autor;
- foros sin contexto;
- resultados de buscador sin fuente;
- capturas de pantalla;
- contenido sin fecha;
- páginas que no indiquen la versión del producto;
- ejemplos copiados sin comprobarlos en el laboratorio.

---

## 15. Relación entre bibliografía y proyecto

Cada parte del proyecto puede relacionarse con una o más fuentes:

| Parte del proyecto | Fuentes recomendadas |
|---|---|
| Índices | Documentación de Indexer y Admin |
| Ingesta | Data Management y Monitor files |
| SPL | Search Manual y Search Reference |
| Dashboards | Dashboards y Dashboard Studio |
| Alertas | Alerting Manual |
| Usuarios y permisos | Security y Users and Roles |
| API REST | REST API Reference |
| Servicio de Ubuntu | Documentación de Systemd |
| Diagnóstico | Search Manual, logs internos y troubleshooting |
| Rendimiento web | Recursos de observabilidad y monitorización |

La bibliografía debe servir para apoyar decisiones concretas. No es necesario
incluir fuentes que no tengan relación con la solución implementada.

---

## 16. Fuentes utilizadas en este proyecto

Completa esta sección con las fuentes que realmente hayas consultado.

```markdown
## Fuentes consultadas

1. Splunk Search Manual
   - Uso: comprender la ejecución y el diseño de búsquedas.
   - Enlace: https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchapp

2. Splunk Search Reference
   - Uso: consultar comandos como `stats`, `eval` y `timechart`.
   - Enlace: https://docs.splunk.com/Documentation/Splunk/latest/SearchReference

3. Splunk Dashboards
   - Uso: diseñar los paneles y seleccionar visualizaciones.
   - Enlace: https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual

4. Splunk Alerts
   - Uso: configurar y probar la alerta de errores HTTP `500`.
   - Enlace: https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts

5. Splunk Users and Roles
   - Uso: revisar permisos del índice, dashboard y objetos.
   - Enlace: https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles
```

---

## 17. Bibliografía mínima recomendada

La entrega debe incluir, como mínimo:

- una referencia general de Splunk Enterprise;
- una referencia del Search Manual;
- una referencia del Search Reference;
- una referencia de dashboards;
- una referencia de alertas;
- una referencia de usuarios y roles;
- una referencia del sistema operativo;
- cualquier artículo o libro utilizado para justificar decisiones adicionales.

### Lista mínima

- [Splunk Enterprise Documentation](https://docs.splunk.com/Documentation/Splunk)
- [Splunk Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchapp)
- [Splunk Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)
- [Splunk Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)
- [Splunk Alerts](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Splunk Users and Roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Ubuntu Systemd](https://documentation.ubuntu.com/server/explanation/systemd/)

---

## 18. Lista de comprobación bibliográfica

- [ ] La bibliografía tiene un título claro.
- [ ] Las fuentes están agrupadas por tema.
- [ ] Se incluyen fuentes oficiales.
- [ ] Se incluye documentación de SPL.
- [ ] Se incluye documentación de dashboards.
- [ ] Se incluye documentación de alertas.
- [ ] Se incluye documentación de seguridad.
- [ ] Se incluye documentación de Ubuntu.
- [ ] Cada enlace corresponde con el tema descrito.
- [ ] Las fuentes realmente utilizadas están identificadas.
- [ ] Se ha indicado la utilidad de cada fuente.
- [ ] Se ha indicado la fecha de consulta cuando procede.
- [ ] Se han evitado fuentes sin autor o contexto.
- [ ] Se han contrastado las fuentes con pruebas del laboratorio.
- [ ] Las referencias son coherentes con la versión de Splunk utilizada.

---

## 19. Nota sobre la versión del producto

La documentación de Splunk puede cambiar entre versiones. Antes de aplicar una
configuración, comprueba que la referencia corresponde a la versión instalada en
el laboratorio.

El proyecto utiliza como referencia:

```text
Splunk Enterprise 10.4.3
```

Si la documentación consultada pertenece a otra versión, documenta cualquier
diferencia relevante.

Las diferencias pueden afectar a:

- Dashboard Studio;
- permisos;
- comandos SPL;
- configuración de alertas;
- endpoints REST;
- administración de índices;
- nombres de menús;
- capacidades disponibles.

---

## 20. Referencias oficiales principales

- [Splunk Enterprise Documentation](https://docs.splunk.com/Documentation/Splunk)
- [Splunk Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchapp)
- [Splunk Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)
- [Splunk Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)
- [Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/IntroFrame)
- [Splunk Alerts](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Splunk Users and Roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Splunk Knowledge Objects](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)
- [Splunk REST API Reference](https://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTprolog)
- [Ubuntu Systemd](https://documentation.ubuntu.com/server/explanation/systemd/)