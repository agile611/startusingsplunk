# Glosario

Términos comunes de Splunk y administración de logs.

Este glosario está orientado al laboratorio práctico de monitorización de
aplicaciones web con Splunk Enterprise.

El entorno de referencia utiliza:

- Splunk Enterprise 10.4.3.
- Ubuntu 24.04.5 LTS.
- Índice principal: `curso`.
- Aplicación web accesible mediante Splunk Web.
- Usuario de configuración: `admin`.
- Eventos web con campos como `timestamp`, `host`, `method`, `status` y `uri`.

Las definiciones se acompañan de ejemplos prácticos para que el asistente pueda
relacionar cada término con una tarea real de administración, búsqueda,
visualización o troubleshooting.

---

# 1. Cómo utilizar este glosario

Cada término puede contener:

- definición;
- explicación práctica;
- ejemplo SPL;
- comando de Ubuntu;
- diferencia con otros conceptos;
- relación con el proyecto;
- referencia oficial.

Cuando un campo o concepto no exista en el dataset, debe documentarse la
limitación. No se deben inventar valores ni crear análisis que los datos no
permitan justificar.

---

# 2. Conceptos fundamentales

## Admin

Rol administrativo de Splunk con capacidades elevadas sobre la plataforma.

Un usuario con rol `admin` puede realizar tareas como:

- administrar usuarios y roles;
- crear y modificar índices;
- configurar entradas;
- crear dashboards;
- crear alertas;
- cambiar permisos;
- revisar objetos de conocimiento;
- consultar configuraciones;
- ejecutar búsquedas administrativas;
- utilizar determinados endpoints REST.

### Comprobar el usuario actual

```spl
| rest /services/authentication/current-context
| table username roles
```

### Importante

Tener el rol `admin` en Splunk no significa disponer automáticamente de permisos
`sudo` en Ubuntu.

Son dos niveles diferentes:

| Nivel | Ejemplo | Finalidad |
|---|---|---|
| Splunk | Rol `admin` | Administrar la plataforma |
| Ubuntu | `sudo` | Gestionar servicios y archivos del sistema |

---

## Administración de logs

Conjunto de procesos utilizados para:

- generar logs;
- transportarlos;
- almacenarlos;
- indexarlos;
- buscar eventos;
- controlar su retención;
- proteger su acceso;
- investigar incidentes;
- generar alertas.

En un entorno real deben definirse:

- fuentes;
- formato;
- frecuencia;
- retención;
- propietarios;
- permisos;
- sensibilidad;
- procedimiento de revisión;
- tratamiento de errores.

---

## Aplicación

Sistema que genera eventos, métricas o trazas.

En este proyecto, la aplicación es una aplicación web que produce eventos HTTP.

Ejemplo de evento:

```text
2026-01-01 10:00:00,web-01,GET,500,/api/users
```

La aplicación puede generar datos sobre:

- peticiones;
- errores;
- autenticación;
- latencia;
- acceso a bases de datos;
- excepciones;
- operaciones de negocio.

---

## Aplicación de Splunk

Espacio lógico que agrupa búsquedas, dashboards, reportes, alertas y otros objetos
de conocimiento.

Ejemplos de aplicaciones:

- Search & Reporting;
- una aplicación propia del curso;
- una aplicación de monitorización web;
- una aplicación de seguridad.

La aplicación influye en:

- visibilidad de objetos;
- permisos;
- contexto de configuración;
- ubicación de búsquedas guardadas;
- organización del contenido.

---

## Aplicación web

Sistema accesible mediante HTTP o HTTPS.

Sus eventos suelen incluir:

- método HTTP;
- URI;
- código de respuesta;
- host;
- IP de cliente;
- agente de usuario;
- duración;
- bytes transferidos;
- referer.

Ejemplo de análisis:

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| stats
    count as peticiones
    count(eval(status_num>=400)) as errores
    by host
```

---

## API

Interfaz que permite que dos sistemas se comuniquen.

Una API web suele utilizar:

- `GET`;
- `POST`;
- `PUT`;
- `PATCH`;
- `DELETE`.

Ejemplo de URI:

```text
/api/users
```

Consulta práctica:

```spl
index=curso earliest=0 latest=now
| where like(uri, "/api/%")
| stats count as peticiones_api by method
```

---

# 3. Datos y eventos

## Campo

Atributo extraído de un evento.

Ejemplos:

```text
host=web-01
method=GET
status=500
uri=/api/users
```

Un campo puede ser:

- automático;
- extraído durante la indexación;
- extraído durante la búsqueda;
- calculado con `eval`;
- añadido mediante un lookup;
- creado mediante una expresión regular.

### Revisar campos disponibles

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

### Crear un campo calculado

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
```

---

## Campo calculado

Campo creado durante una búsqueda.

Ejemplo:

```spl
| eval resultado=if(status_num>=400, "Error", "Correcta")
```

El campo calculado no modifica necesariamente los eventos almacenados. Se crea
en los resultados de la búsqueda.

---

## Campo interno

Campo generado por Splunk para facilitar la búsqueda y administración.

Ejemplos:

- `_time`;
- `_raw`;
- `_indextime`;
- `host`;
- `source`;
- `sourcetype`;
- `index`.

Consulta práctica:

```spl
index=curso earliest=0 latest=now
| table _time _indextime host source sourcetype index _raw
| head 20
```

---

## Campo multivalor

Campo que contiene varios valores en un mismo evento.

Ejemplo conceptual:

```text
metodos=GET
metodos=POST
metodos=DELETE
```

Funciones relacionadas:

```spl
mvcount()
mvindex()
mvjoin()
mvappend()
mvsort()
```

Ejemplo:

```spl
index=curso earliest=0 latest=now
| eval partes_uri=split(uri, "/")
| eval primer_elemento=mvindex(partes_uri, 1)
| table uri partes_uri primer_elemento
```

---

## Evento

Unidad individual de información que Splunk indexa y permite buscar.

Ejemplo:

```text
2026-01-01 10:00:00,web-01,GET,200,/
```

Un evento puede representar:

- una petición web;
- un error;
- una autenticación;
- una transacción;
- una línea de log;
- una excepción;
- un mensaje de sistema.

### Contar eventos

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

---

## Evento de varias líneas

Evento compuesto por varias líneas de texto.

Puede aparecer en:

- excepciones;
- trazas de aplicaciones;
- errores Java;
- mensajes con stack trace;
- registros JSON formateados.

Es importante que Splunk no divida incorrectamente un único evento en varios
eventos.

### Revisar el número de líneas

```spl
index=curso earliest=0 latest=now
| table _time linecount _raw
| head 20
```

---

## Evento sintético

Evento generado artificialmente para practicar o probar una configuración.

Ejemplo:

```text
2026-09-17 18:00:00,web-01,GET,500,/api/users
```

Los datos sintéticos son útiles para:

- probar alertas;
- practicar búsquedas;
- validar dashboards;
- simular errores;
- entrenar a los asistentes.

Deben identificarse como sintéticos y no confundirse con datos de producción.

---

## Evento histórico

Evento cuyo `_time` pertenece al pasado.

Puede proceder de:

- un archivo antiguo;
- una exportación;
- un dataset de formación;
- una migración;
- una prueba de laboratorio.

Un evento histórico puede no aparecer en una búsqueda como:

```spl
earliest=-5m latest=now
```

aunque haya sido indexado correctamente.

---

## Evento reciente

Evento cuyo `_time` está dentro del intervalo consultado.

Ejemplo:

```spl
index=curso earliest=-15m latest=now
```

Para probar alertas en tiempo real, los eventos deben tener timestamps recientes y
la entrada debe estar recibiendo datos.

---

# 4. Tiempo y fechas

## `_time`

Campo interno que representa el tiempo asignado al evento.

Se utiliza para:

- filtros temporales;
- series temporales;
- alertas;
- ordenación;
- agrupaciones;
- cálculo de antigüedad.

### Revisar el tiempo

```spl
index=curso earliest=0 latest=now
| table _time host status uri
| head 20
```

### Formatear el tiempo

```spl
index=curso earliest=0 latest=now
| eval fecha=strftime(_time, "%Y-%m-%d %H:%M:%S")
| table fecha host status uri
```

---

## `_indextime`

Momento en que Splunk indexó el evento.

Puede utilizarse para estudiar retrasos de ingesta.

```spl
index=curso earliest=0 latest=now
| eval retraso=_indextime-_time
| table _time _indextime retraso host uri
| head 20
```

Un retraso elevado puede ser correcto si se cargan datos históricos.

También puede indicar:

- retraso de transporte;
- error de zona horaria;
- timestamp mal interpretado;
- fuente desconectada;
- proceso de ingesta atrasado.

---

## Epoch

Representación numérica de una fecha y hora.

Splunk utiliza valores epoch para muchas operaciones temporales.

### Convertir texto a epoch

```spl
| eval fecha_epoch=strptime(
    "2026-01-01 10:00:00",
    "%Y-%m-%d %H:%M:%S"
)
```

### Convertir epoch a texto

```spl
| eval fecha_legible=strftime(_time, "%Y-%m-%d %H:%M:%S")
```

---

## Intervalo temporal

Periodo utilizado por una búsqueda.

Ejemplos:

```spl
earliest=-15m latest=now
```

```spl
earliest=-24h latest=now
```

```spl
earliest="01/01/2026:00:00:00"
latest="01/01/2026:01:00:00"
```

La selección del intervalo debe coincidir con el objetivo de la búsqueda.

---

## Zona horaria

Configuración que determina cómo se interpretan y presentan las fechas.

Los errores de zona horaria pueden provocar:

- eventos desplazados;
- búsquedas vacías;
- alertas que no se disparan;
- agrupaciones temporales incorrectas;
- discrepancias entre sistemas.

Si los datos parecen estar varias horas adelantados o atrasados, revisa:

- zona horaria del origen;
- zona horaria de Splunk;
- formato del timestamp;
- configuración del sistema operativo.

---

## Retraso de ingesta

Diferencia entre el momento del evento y el momento de indexación.

```spl
index=curso earliest=0 latest=now
| eval retraso_segundos=_indextime-_time
| stats
    avg(retraso_segundos) as media_retraso
    max(retraso_segundos) as maximo_retraso
```

---

# 5. Metadatos de Splunk

## Host

Entidad que genera o se asocia al evento.

Ejemplos:

```text
web-01
web-02
app-01
```

`host` no debe confundirse con:

- IP de cliente;
- hostname de la aplicación;
- servidor de indexación;
- nombre del archivo.

### Peticiones por host

```spl
index=curso earliest=0 latest=now
| stats count as peticiones by host
| sort - peticiones
```

### Errores por host

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| sort - errores
```

---

## Source

Indica el origen del evento.

Puede ser:

- una ruta de archivo;
- una entrada de red;
- una fuente lógica;
- un origen configurado en Splunk.

Ejemplo:

```text
/var/log/splunk-curso/eventos_web.csv
```

### Revisar sources

```spl
index=curso earliest=0 latest=now
| stats count by source
| sort - count
```

---

## Sourcetype

Describe el tipo de datos y ayuda a Splunk a interpretar los eventos.

Ejemplos:

```text
web:csv
web:csv:extended
access_combined
json
syslog
```

### Revisar sourcetypes

```spl
index=curso earliest=0 latest=now
| stats count by sourcetype
| sort - count
```

### Por qué es importante

Un `sourcetype` coherente facilita:

- parsing;
- extracción de campos;
- búsquedas;
- dashboards;
- alertas;
- administración;
- troubleshooting.

No utilices nombres diferentes para el mismo formato sin una razón documentada.

[1]

---

## Índice

Repositorio lógico donde Splunk almacena eventos.

En el laboratorio se utiliza:

```text
curso
```

### Buscar en un índice

```spl
index=curso earliest=0 latest=now
| stats count
```

### Consultar información del índice

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

---

## Índice interno

Índice utilizado por Splunk para almacenar información propia de la plataforma.

Ejemplo:

```text
_internal
```

Se utiliza para diagnosticar:

- errores;
- advertencias;
- rendimiento;
- ejecución de búsquedas;
- problemas de configuración;
- actividad del sistema.

### Consultar errores internos

```spl
index=_internal earliest=-30m latest=now
| search log_level=error OR log_level=warn
| table _time host component log_level message
| sort - _time
```

No utilices índices internos como sustituto de los índices de negocio.

---

## `_raw`

Contenido original del evento.

```spl
index=curso earliest=0 latest=now
| table _raw
| head 20
```

Es fundamental para investigar:

- campos no extraídos;
- separadores incorrectos;
- valores inesperados;
- timestamps;
- eventos incompletos;
- parsing.

---

# 6. Ingesta de datos

## Ingesta

Proceso mediante el cual Splunk recibe y procesa datos.

Flujo general:

```text
Fuente
    ↓
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

---

## Entrada

Configuración que permite que Splunk reciba datos.

Ejemplos:

- monitorización de un archivo;
- entrada TCP;
- entrada UDP;
- HTTP Event Collector;
- carga manual;
- forwarder.

### Revisar entradas monitorizadas

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype disabled
```

---

## Monitor

Entrada que observa un archivo o directorio.

Ejemplo conceptual:

```ini
[monitor:///var/log/splunk-curso/eventos_web.csv]
disabled = false
index = curso
sourcetype = web:csv
host = web-lab
```

Antes de monitorizar:

```bash
ls -ld /var/log/splunk-curso
ls -l /var/log/splunk-curso/eventos_web.csv
```

Splunk debe poder leer la ruta y atravesar los directorios.

---

## Forwarder

Componente que recopila y envía datos a otra instancia de Splunk.

Tipos habituales:

- Universal Forwarder;
- Heavy Forwarder.

En un laboratorio mononodo puede no utilizarse un forwarder, porque la propia
instancia recibe y procesa los datos.

---

## HTTP Event Collector

Mecanismo para enviar eventos a Splunk mediante HTTP o HTTPS.

Suele utilizarse para:

- aplicaciones;
- microservicios;
- scripts;
- servicios cloud;
- automatizaciones;
- plataformas que generan JSON.

No deben incluirse tokens reales en documentación compartida.

---

## Parsing

Proceso mediante el cual Splunk interpreta los datos entrantes.

Incluye aspectos como:

- separación de eventos;
- identificación del timestamp;
- asignación de host;
- asignación de source;
- asignación de sourcetype;
- transformaciones;
- extracción inicial.

Un error de parsing puede causar:

- múltiples líneas fusionadas;
- un evento dividido en varias partes;
- timestamps incorrectos;
- campos ausentes;
- valores desplazados.

---

## Indexación

Proceso mediante el cual Splunk almacena los eventos en un índice para que puedan
ser buscados.

Un evento indexado correctamente debe poder localizarse mediante una búsqueda
como:

```spl
index=curso earliest=0 latest=now
| stats count
```

---

## Reindexación

Proceso de volver a ingerir datos después de corregir una configuración.

Debe realizarse con cuidado porque puede provocar:

- duplicados;
- resultados inflados;
- alertas repetidas;
- costes innecesarios;
- confusión sobre el número de eventos.

Documenta siempre:

- qué archivo se reingirió;
- cuándo;
- en qué índice;
- con qué `sourcetype`;
- cuántos eventos se esperaban;
- si se eliminaron datos anteriores.

---

# 7. Almacenamiento e índices

## Bucket

Unidad física o lógica de almacenamiento de eventos dentro de un índice.

Los buckets tienen diferentes estados durante su ciclo de vida.

Conceptualmente:

```text
Hot → Warm → Cold → Frozen
```

La configuración concreta depende de la política de almacenamiento.

---

## Hot bucket

Bucket que recibe eventos nuevos o está siendo escrito.

---

## Warm bucket

Bucket que ya no recibe eventos nuevos, pero sigue disponible para búsquedas
frecuentes.

---

## Cold bucket

Bucket trasladado a almacenamiento secundario o menos activo.

---

## Frozen data

Datos que han alcanzado una fase de retención avanzada y pueden archivarse o
eliminarse según la configuración.

La retención debe definirse de acuerdo con:

- capacidad;
- requisitos legales;
- negocio;
- auditoría;
- seguridad;
- coste.

---

## Retención

Periodo durante el cual los eventos deben conservarse.

Ejemplo documental:

```text
Índice: curso
Retención: definida para el laboratorio
Finalidad: prácticas formativas
```

No extrapoles automáticamente la política del laboratorio a producción.

---

## `indexes.conf`

Archivo de configuración relacionado con índices.

Referencia práctica:

```text
$SPLUNK_HOME/etc/system/local/indexes.conf
```

En entornos organizados es preferible utilizar una aplicación propia en lugar de
modificar directamente configuraciones sin control.

---

# 8. SPL y búsquedas

## SPL

Lenguaje de búsqueda de Splunk.

Permite:

- localizar eventos;
- filtrar;
- transformar;
- calcular;
- agrupar;
- extraer;
- ordenar;
- crear series temporales;
- preparar alertas.

Ejemplo:

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
```

---

## Comando SPL

Instrucción que transforma los resultados.

Ejemplos:

```spl
search
where
eval
stats
table
sort
timechart
rex
dedup
```

---

## Función SPL

Operación utilizada dentro de un comando.

Ejemplos:

```spl
tonumber()
coalesce()
if()
case()
round()
strftime()
```

Ejemplo:

```spl
| eval porcentaje=round(errores*100/total, 2)
```

---

## Pipe o tubería

Carácter que conecta comandos SPL:

```text
|
```

Ejemplo:

```spl
index=curso
| search status=500
| stats count
```

Cada comando recibe los resultados del comando anterior.

---

## `search`

Filtra eventos o resultados.

```spl
index=curso earliest=0 latest=now
| search status=500
```

---

## `where`

Filtra utilizando expresiones.

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
```

---

## `eval`

Crea o transforma campos.

```spl
index=curso earliest=0 latest=now
| eval resultado=if(status>=400, "Error", "Correcta")
```

---

## `stats`

Agrega resultados.

```spl
index=curso earliest=0 latest=now
| stats count by host
```

---

## `timechart`

Crea series temporales.

```spl
index=curso earliest=-24h latest=now
| timechart span=1m count as peticiones
```

---

## `eventstats`

Calcula estadísticas y las añade a cada evento, conservando el detalle.

```spl
index=curso earliest=0 latest=now
| eventstats count as total_eventos
| table _time host uri total_eventos
```

---

## `streamstats`

Calcula estadísticas acumuladas según el orden de los eventos.

```spl
index=curso earliest=0 latest=now
| sort 0 _time
| streamstats count as contador
| table _time contador host uri
```

---

## `rex`

Extrae datos mediante expresiones regulares.

```spl
index=curso earliest=0 latest=now
| rex field=uri "^/(?<recurso>[^/]+)"
| stats count by recurso
```

---

## `spath`

Extrae campos de estructuras JSON o XML compatibles.

```spl
index=curso earliest=0 latest=now
| spath
| table request.method response.status
```

---

## `dedup`

Elimina resultados duplicados según uno o varios campos.

```spl
index=curso earliest=0 latest=now
| dedup host uri status
```

Debe utilizarse con cuidado. Dos eventos con los mismos campos visibles no son
necesariamente duplicados reales.

---

## `lookup`

Añade información externa a los eventos.

```spl
index=curso earliest=0 latest=now
| lookup activos.csv host OUTPUT owner environment
| stats count by environment owner
```

---

## `fieldsummary`

Resume información sobre los campos disponibles.

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Es una herramienta especialmente útil al comenzar a trabajar con un dataset.

---

# 9. Análisis de eventos web

## Método HTTP

Indica la operación solicitada al servidor.

Métodos frecuentes:

- `GET`;
- `POST`;
- `PUT`;
- `PATCH`;
- `DELETE`;
- `HEAD`;
- `OPTIONS`.

### Analizar métodos

```spl
index=curso earliest=0 latest=now
| eval metodo=upper(trim(method))
| stats count as peticiones by metodo
| sort - peticiones
```

---

## URI

Ruta solicitada por el cliente.

Ejemplos:

```text
/
/index.html
/api/users
/login
/products?id=10
```

### URI con más errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

---

## Código HTTP

Código numérico que indica el resultado de una petición.

Familias:

| Familia | Significado |
|---|---|
| `1xx` | Información |
| `2xx` | Éxito |
| `3xx` | Redirección |
| `4xx` | Error del cliente |
| `5xx` | Error del servidor |

### Distribución de códigos

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count as peticiones by status_num
| sort status_num
```

---

## HTTP 200

Indica una respuesta correcta habitual.

No implica necesariamente que la aplicación esté completamente sana. Puede haber
problemas de latencia, contenido incorrecto o errores funcionales no reflejados
en el código.

---

## HTTP 201

Indica que se ha creado un recurso.

Suele aparecer en peticiones como:

```text
POST /api/users
```

---

## HTTP 301 y 302

Indican redirecciones.

Pueden ser correctas o indicar configuraciones no deseadas, bucles o cambios de
URL.

---

## HTTP 400

Petición incorrecta.

Puede deberse a:

- parámetros inválidos;
- JSON incorrecto;
- campos obligatorios ausentes;
- formato no válido.

---

## HTTP 401

Autenticación requerida o fallida.

---

## HTTP 403

Acceso prohibido.

La identidad puede ser conocida, pero no tiene permisos suficientes.

---

## HTTP 404

Recurso no encontrado.

Puede deberse a:

- URL incorrecta;
- recurso eliminado;
- enlace obsoleto;
- ruta no publicada;
- ataque de exploración.

---

## HTTP 429

Demasiadas solicitudes.

Puede indicar:

- rate limiting;
- abuso;
- cliente mal configurado;
- tráfico elevado;
- política de protección activa.

---

## HTTP 500

Error interno del servidor.

Es uno de los códigos principales del proyecto para practicar alertas.

Consulta:

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count as errores_500
```

---

## HTTP 502

Gateway o proxy recibió una respuesta inválida.

---

## HTTP 503

Servicio no disponible.

Puede asociarse con:

- mantenimiento;
- saturación;
- dependencia caída;
- health check fallido;
- capacidad insuficiente.

---

## HTTP 504

Timeout de gateway.

Puede indicar que una dependencia tardó demasiado en responder.

---

# 10. Rendimiento y observabilidad

## Latencia

Tiempo que tarda una operación en completarse.

En el dataset puede aparecer como:

- `response_time`;
- `duration`;
- `latency`;
- `elapsed_ms`.

### Media de latencia

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(tiempo_ms)
| stats avg(tiempo_ms) as media_ms
```

---

## Media

Promedio aritmético.

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| stats avg(tiempo_ms) as media_ms by uri
```

La media puede verse afectada por valores extremos.

---

## Mediana

Valor central de un conjunto ordenado.

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| stats median(tiempo_ms) as mediana_ms by uri
```

La mediana suele representar mejor el comportamiento típico cuando hay outliers.

---

## Percentil 95

Valor por debajo del cual se encuentra aproximadamente el 95 % de las
observaciones.

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| stats perc95(tiempo_ms) as p95_ms by uri
```

---

## Outlier

Valor que se aleja considerablemente del comportamiento habitual.

Ejemplo:

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| eventstats perc95(tiempo_ms) as p95_global
| where tiempo_ms>p95_global
| table _time uri tiempo_ms p95_global
```

---

## Disponibilidad

Porcentaje de tiempo durante el cual un servicio está operativo.

Los logs de peticiones pueden aportar información, pero no siempre son suficientes
para medir disponibilidad real. También pueden ser necesarios:

- health checks;
- monitores sintéticos;
- métricas;
- pruebas de conexión;
- trazas.

---

## Tasa de error

Porcentaje de peticiones consideradas erróneas.

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats
    count as total
    count(eval(status_num>=400)) as errores
| eval tasa_error=if(
    total>0,
    round(errores*100/total, 2),
    0
)
```

La definición de error debe documentarse. No siempre deben tratarse `4xx` y `5xx`
de la misma forma.

---

## Volumen

Número de eventos o peticiones durante un periodo.

```spl
index=curso earliest=-24h latest=now
| stats count as peticiones
```

---

## Throughput

Cantidad de eventos procesados por unidad de tiempo.

```spl
index=curso earliest=-1h latest=now
| timechart span=1m count as peticiones_por_minuto
```

---

## Saturación

Grado en que un recurso se aproxima a su capacidad máxima.

Puede estudiarse con:

- CPU;
- memoria;
- conexiones;
- colas;
- latencia;
- peticiones;
- errores;
- capacidad de almacenamiento.

Un aumento de errores `5xx` puede coincidir con saturación, pero no demuestra por
sí solo la causa raíz.

---

## Observabilidad

Capacidad de comprender el estado interno de un sistema a partir de sus señales.

Señales habituales:

- logs;
- métricas;
- trazas;
- eventos;
- perfiles;
- disponibilidad.

El proyecto trabaja principalmente con logs estructurados y métricas calculadas
sobre eventos.

---

# 11. Dashboards, reportes y alertas

## Dashboard

Vista visual compuesta por paneles.

Puede mostrar:

- indicadores;
- tablas;
- gráficos;
- series temporales;
- filtros;
- detalles;
- estados operativos.

### Panel de peticiones

```spl
index=curso earliest=-24h latest=now
| stats count as peticiones
```

### Panel de errores

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num>=400)) as errores
```

---

## Panel

Componente individual de un dashboard.

Ejemplos:

- total de peticiones;
- errores HTTP;
- peticiones por minuto;
- host con más errores;
- URI con más errores;
- latencia p95.

---

## Filtro

Control que modifica el intervalo o los resultados de un dashboard.

Filtros habituales:

- tiempo;
- host;
- status;
- método;
- URI;
- aplicación;
- entorno.

---

## Token

Variable utilizada para transmitir el valor seleccionado por un control.

Ejemplo conceptual:

```spl
index=curso earliest=$time.earliest$ latest=$time.latest$
```

La sintaxis exacta depende del tipo de dashboard y de la configuración utilizada.

---

## Reporte

Búsqueda guardada que puede ejecutarse manualmente o de forma programada.

Un reporte debe documentar:

- finalidad;
- consulta;
- propietario;
- frecuencia;
- intervalo;
- destinatarios;
- permisos;
- dependencia de campos.

---

## Búsqueda guardada

Consulta SPL almacenada para reutilizarla.

Puede utilizarse como:

- reporte;
- alerta;
- panel;
- búsqueda operativa;
- investigación repetible.

---

## Alerta

Búsqueda configurada para detectar una condición y ejecutar una acción.

### Alerta del proyecto

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

La alerta debe documentar:

- condición;
- frecuencia;
- intervalo;
- acción;
- destinatario;
- throttling;
- prueba;
- procedimiento posterior.

---

## Throttling

Mecanismo para evitar alertas repetitivas durante un periodo.

Es especialmente importante cuando:

- la condición permanece activa;
- los eventos llegan continuamente;
- se ejecuta una búsqueda con mucha frecuencia;
- se notifica por correo o webhook.

---

## Acción de alerta

Respuesta que se ejecuta cuando una alerta se activa.

Ejemplos:

- correo;
- webhook;
- script;
- registro;
- integración externa;
- creación de incidente.

Las acciones deben probarse en un entorno controlado.

---

# 12. Seguridad y permisos

## Capacidad

Permiso granular que permite realizar una acción concreta en Splunk.

Ejemplos conceptuales:

- ejecutar búsquedas;
- crear alertas;
- administrar índices;
- modificar usuarios;
- compartir objetos;
- acceder a determinados recursos.

---

## Rol

Conjunto de capacidades y restricciones asignadas a un usuario.

Ejemplos:

- `admin`;
- `power`;
- `user`;
- rol personalizado.

---

## Acceso basado en roles

Modelo en el que los permisos se conceden mediante roles.

Consulta práctica:

```spl
| rest /services/authentication/current-context
| table username roles
```

---

## Objeto de conocimiento

Elemento reutilizable de Splunk.

Ejemplos:

- búsqueda guardada;
- dashboard;
- reporte;
- alerta;
- lookup;
- macro;
- campo calculado;
- event type.

---

## Propietario

Usuario o entidad responsable de un objeto de conocimiento.

El propietario debe poder:

- mantener el objeto;
- corregir errores;
- revisar permisos;
- actualizar la documentación;
- responder ante fallos.

---

## Compartición

Alcance con el que un objeto está disponible.

Puede ser:

- privado;
- compartido con el usuario;
- compartido con una aplicación;
- compartido globalmente.

---

## Mínimo privilegio

Principio según el cual un usuario debe tener únicamente los permisos necesarios
para realizar su función.

En el laboratorio se utiliza `admin` para simplificar la configuración, pero en
producción se recomienda separar:

- administración;
- análisis;
- operación;
- visualización;
- gestión de alertas.

---

## Datos sensibles

Información que requiere protección especial.

Ejemplos:

- contraseñas;
- tokens;
- direcciones personales;
- información médica;
- datos financieros;
- identificadores personales;
- cookies;
- cabeceras de autenticación.

No incluyas datos sensibles en:

- datasets compartidos;
- capturas;
- Markdown;
- ejemplos públicos;
- repositorios;
- búsquedas guardadas visibles.

---

## Enmascaramiento

Proceso de ocultar o transformar información sensible.

Ejemplo conceptual:

```spl
| rex mode=sed field=_raw "s/\b[0-9]{16}\b/REDACTED/g"
```

Las expresiones de enmascaramiento deben validarse cuidadosamente para evitar
exponer información o destruir datos necesarios para la investigación.

---

# 13. Configuración en Splunk

## `inputs.conf`

Define entradas de datos.

Ejemplo:

```ini
[monitor:///var/log/splunk-curso/eventos_web.csv]
disabled = false
index = curso
sourcetype = web:csv
host = web-lab
```

---

## `props.conf`

Archivo relacionado con parsing, timestamps, campos y comportamiento de fuentes.

Puede utilizarse para configurar:

- separación de eventos;
- timestamp;
- formato;
- reglas de parsing;
- transformaciones;
- extracción de campos.

---

## `transforms.conf`

Archivo utilizado para transformaciones avanzadas y enrutamiento de datos.

Puede intervenir en:

- redacción;
- enrutamiento;
- extracción;
- sustitución;
- clasificación.

---

## `indexes.conf`

Archivo de configuración relacionado con índices.

Debe gestionarse con cuidado y documentarse por aplicación o entorno.

---

## `server.conf`

Archivo de configuración de aspectos del servidor Splunk.

Su uso depende de la topología y del componente de Splunk.

---

## Aplicación de configuración

Conjunto de archivos y objetos que permiten encapsular una configuración.

Ejemplo conceptual:

```text
$SPLUNK_HOME/etc/apps/curso_monitorizacion/
```

Una aplicación propia ayuda a separar la configuración del proyecto de la
configuración global del sistema.

---

## Recarga

Proceso mediante el cual Splunk vuelve a leer una configuración sin reiniciar
completamente todos los componentes.

La posibilidad de recargar depende del tipo de configuración.

---

## Reinicio

Reinicio del servicio de Splunk.

Comando de referencia:

```bash
sudo /opt/splunk/bin/splunk restart
```

No reinicies un entorno compartido sin valorar el impacto.

---

# 14. Ubuntu y sistema operativo

## `systemd`

Sistema de gestión de servicios utilizado por Ubuntu.

### Revisar Splunk

```bash
sudo systemctl status Splunkd
```

### Consultar logs del servicio

```bash
sudo journalctl -u Splunkd
```

### Consultar logs recientes

```bash
sudo journalctl -u Splunkd --since "30 minutes ago"
```

---

## `sudo`

Permite ejecutar comandos con privilegios elevados.

Ejemplo:

```bash
sudo systemctl status Splunkd
```

El uso de `sudo` debe limitarse a las tareas necesarias.

---

## Puerto

Punto de comunicación de un servicio.

Puertos habituales del entorno:

| Puerto | Uso habitual |
|---|---|
| `8000` | Splunk Web |
| `8089` | Management/API |
| `9997` | Recepción de forwarders |

### Revisar puertos

```bash
sudo ss -lntp | grep -E '8000|8089|9997'
```

---

## Proceso

Programa en ejecución en Ubuntu.

### Buscar procesos de Splunk

```bash
ps aux | grep splunk
```

---

## Permiso de archivo

Controla quién puede leer, escribir o ejecutar un archivo.

### Revisar permisos

```bash
ls -l /var/log/splunk-curso/eventos_web.csv
```

Para monitorizar un archivo, el proceso de Splunk necesita permisos de lectura.

---

## Espacio en disco

El almacenamiento insuficiente puede impedir la ingesta o afectar al servicio.

### Revisar espacio

```bash
df -h
```

### Revisar tamaño de un directorio

```bash
du -sh /var/log/splunk-curso
```

---

# 15. Troubleshooting

## Troubleshooting

Proceso sistemático de diagnóstico y resolución de problemas.

Flujo recomendado:

```text
Índice
  ↓
Tiempo
  ↓
Eventos
  ↓
Campos
  ↓
Metadatos
  ↓
Permisos
  ↓
SPL
  ↓
Objeto
```

---

## Diagnóstico: índice

```spl
index=curso earliest=0 latest=now
| stats count
```

---

## Diagnóstico: rango temporal

```spl
index=curso earliest=0 latest=now
| stats min(_time) as inicio max(_time) as fin
```

---

## Diagnóstico: eventos

```spl
index=curso earliest=0 latest=now
| table _time _raw
| head 20
```

---

## Diagnóstico: campos

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

---

## Diagnóstico: metadatos

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
```

---

## Diagnóstico: retraso

```spl
index=curso earliest=0 latest=now
| eval retraso=_indextime-_time
| stats
    avg(retraso) as media
    max(retraso) as maximo
```

---

## Diagnóstico: configuración de entrada

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype disabled
```

---

## Diagnóstico: logs internos

```spl
index=_internal earliest=-30m latest=now
| search log_level=error OR log_level=warn
| table _time host component log_level message
| sort - _time
```

---

## Problema: no hay resultados

Causas posibles:

- índice incorrecto;
- rango temporal incorrecto;
- evento histórico;
- entrada deshabilitada;
- archivo ilegible;
- timestamp mal interpretado;
- permisos insuficientes;
- búsqueda mal escrita;
- filtro demasiado restrictivo.

---

## Problema: el campo no existe

Comprueba:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Después:

```spl
index=curso earliest=0 latest=now
| table _raw
| head 20
```

No crees un análisis basado en un campo que no existe sin documentar una
alternativa.

---

## Problema: los códigos HTTP no se pueden comparar

Utiliza:

```spl
| eval status_num=tonumber(status)
```

Después:

```spl
| where status_num>=400
```

---

## Problema: todos los eventos tienen el mismo tiempo

Revisa:

- campo de timestamp;
- formato;
- zona horaria;
- separación de eventos;
- configuración de parsing;
- cabecera del CSV.

---

## Problema: se han duplicado los eventos

Puede deberse a:

- carga repetida;
- monitorización duplicada;
- archivo copiado a una ruta monitorizada;
- reindexación;
- varias entradas apuntando al mismo archivo.

Consulta:

```spl
index=curso earliest=0 latest=now
| stats count by source sourcetype host
| sort - count
```

---

# 16. Métricas y análisis

## Cardinalidad

Número de valores distintos de un campo.

```spl
index=curso earliest=0 latest=now
| stats dc(uri) as uri_distintas
```

Una cardinalidad elevada puede afectar al rendimiento y a la interpretación de
algunas visualizaciones.

---

## Conteo distinto

Función `dc()` utilizada para contar valores únicos.

```spl
| stats dc(clientip) as clientes_distintos
```

---

## Porcentaje

Proporción de un subconjunto respecto al total.

```spl
| eval porcentaje=round(subconjunto*100/total, 2)
```

Protege siempre el caso de total igual a cero:

```spl
| eval porcentaje=if(
    total>0,
    round(subconjunto*100/total, 2),
    0
)
```

---

## Umbral

Valor a partir del cual se toma una decisión.

Ejemplo:

```text
Cinco errores HTTP 500 en cinco minutos.
```

Consulta:

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

---

## Baseline

Comportamiento normal de referencia.

Una alerta es más útil cuando el umbral se compara con:

- histórico;
- volumen esperado;
- franjas horarias;
- días laborables;
- estacionalidad;
- comportamiento por host.

---

## Anomalía

Comportamiento que se desvía de lo esperado.

Ejemplos:

- aumento inesperado de `5xx`;
- caída repentina de peticiones;
- latencia superior al patrón;
- nuevo host;
- nueva URI;
- aumento de `401`;
- número anormal de peticiones de una IP.

---

## Falso positivo

Alerta activada sin que exista un problema real.

Puede producirse por:

- umbral demasiado bajo;
- datos de prueba;
- errores esperados;
- mantenimiento;
- duplicación de eventos;
- ausencia de contexto.

---

## Falso negativo

Problema real que no activa la alerta.

Puede producirse por:

- umbral demasiado alto;
- rango incorrecto;
- eventos fuera de tiempo;
- campo mal extraído;
- alerta deshabilitada;
- permisos insuficientes.

---

## Ruido

Alertas o eventos que dificultan identificar problemas relevantes.

El throttling, los filtros y los umbrales ayudan a reducir el ruido.

---

# 17. Referencias y documentación

## Documentación oficial

La documentación oficial de Splunk debe ser la fuente principal para comprobar:

- sintaxis;
- capacidades;
- configuración;
- permisos;
- comportamiento;
- diferencias de versión.

- [Splunk Enterprise Documentation](https://docs.splunk.com/Documentation/Splunk)
- [Splunk Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchapp)
- [Splunk Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)
- [Get Data In](https://docs.splunk.com/Documentation/Splunk/latest/Get started/Getdatain)
- [About Indexes](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Splunk Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)
- [About Alerts](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Users and Roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Knowledge Objects](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)
- [Splunk REST API Reference](https://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTprolog)

---

## Documentación de Ubuntu

- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)
- [Systemd en Ubuntu](https://documentation.ubuntu.com/server/explanation/systemd/)

---

# 18. Glosario rápido

| Término | Significado breve |
|---|---|
| Admin | Rol administrativo de Splunk |
| Campo | Atributo extraído de un evento |
| Dashboard | Vista visual con paneles |
| Evento | Unidad individual de información |
| Host | Sistema asociado al evento |
| Índice | Repositorio lógico de eventos |
| Ingesta | Entrada y procesamiento de datos |
| Latencia | Tiempo de respuesta |
| Lookup | Fuente externa para enriquecer eventos |
| Panel | Componente de un dashboard |
| Reporte | Búsqueda guardada, normalmente programada |
| Rol | Conjunto de capacidades y restricciones |
| Source | Origen del evento |
| Sourcetype | Tipo de datos de una fuente |
| SPL | Lenguaje de búsqueda de Splunk |
| Timestamp | Marca temporal del evento |
| URI | Recurso solicitado por HTTP |
| Alerta | Búsqueda que activa una acción |
| Throttling | Control de repetición de alertas |
| `_raw` | Evento original |
| `_time` | Tiempo asignado al evento |
| `_indextime` | Momento de indexación |

---

# 19. Ejercicio final de vocabulario aplicado

## Objetivo

Utilizar varios conceptos del glosario en una investigación sencilla.

## Situación

El equipo de operaciones informa de un aumento de errores en la aplicación web.

## Paso 1: revisar el índice

```spl
index=curso earliest=-24h latest=now
| stats count as total_eventos
```

## Paso 2: revisar el rango temporal

```spl
index=curso earliest=0 latest=now
| stats min(_time) as inicio max(_time) as fin
```

## Paso 3: clasificar códigos HTTP

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| eval familia=case(
    status_num>=500, "5xx",
    status_num>=400, "4xx",
    status_num>=300, "3xx",
    status_num>=200, "2xx",
    true(), "otro"
)
| stats count by familia
```

## Paso 4: identificar hosts afectados

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| sort - errores
```

## Paso 5: identificar URI afectadas

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

## Paso 6: observar la evolución temporal

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| eval resultado=if(status_num>=400, "Error", "Correcta")
| timechart span=5m count by resultado
```

## Paso 7: redactar una conclusión

La conclusión debe indicar:

- volumen de eventos;
- periodo analizado;
- porcentaje de error;
- familia HTTP predominante;
- host más afectado;
- URI más afectada;
- evolución temporal;
- limitaciones;
- siguiente acción recomendada.

No debe afirmar una causa raíz si las consultas solo muestran correlación.

---

# 20. Lista de comprobación

## Datos

- [ ] Se ha identificado el índice.
- [ ] Se ha comprobado el rango temporal.
- [ ] Se han revisado los eventos originales.
- [ ] Se han revisado los campos.
- [ ] Se han comprobado host, source y sourcetype.
- [ ] Se ha revisado `_time`.
- [ ] Se ha revisado `_indextime`.

## SPL

- [ ] Las búsquedas incluyen índice.
- [ ] Las búsquedas incluyen rango temporal.
- [ ] Los campos numéricos se convierten.
- [ ] Se han tratado los valores nulos.
- [ ] Se han protegido las divisiones entre cero.
- [ ] Se han documentado los resultados.

## Monitorización

- [ ] Se ha calculado el volumen.
- [ ] Se ha calculado la tasa de error.
- [ ] Se han analizado códigos HTTP.
- [ ] Se han analizado hosts.
- [ ] Se han analizado URI.
- [ ] Se ha revisado latencia si existe.
- [ ] Se ha revisado IP si existe.
- [ ] Se ha documentado la ausencia de campos.

## Seguridad

- [ ] No se han incluido credenciales.
- [ ] No se han incluido tokens.
- [ ] No se han expuesto datos sensibles.
- [ ] Los permisos están documentados.
- [ ] Se distingue `admin` de usuario final.
- [ ] Se aplica el principio de mínimo privilegio cuando procede.

## Entrega

- [ ] Los términos se utilizan correctamente.
- [ ] Las consultas pueden reproducirse.
- [ ] Las limitaciones están explicadas.
- [ ] Las fuentes están enlazadas.
- [ ] La versión de Splunk está documentada.
- [ ] Las pruebas se han realizado en la instancia.
```

## Referencias principales incorporadas

- **Source types y campos predeterminados:** ayudan a explicar la diferencia entre
  `host`, `source`, `sourcetype` y otros metadatos de eventos. [1]
- **Procesamiento de fuentes:** el `sourcetype` determina cómo interpreta Splunk
  el flujo de datos y cómo separa los eventos. [2]
- **Seguridad basada en roles:** los roles controlan el acceso a recursos como
  índices, dashboards y aplicaciones. [3]
- **Protección de datos sensibles:** el filtrado por roles puede utilizarse para
  ocultar o redactar información confidencial dentro de los eventos. [4]