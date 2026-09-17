# Datasets

Recursos y ejemplos de datos para prácticas del curso.

Este documento explica cómo preparar, ingerir, validar y utilizar datasets en
Splunk Enterprise. El objetivo es que los asistentes no se limiten a cargar un
archivo, sino que comprendan todo el recorrido de los datos:

```text
Archivo o fuente
    ↓
Entrada de datos
    ↓
Índice
    ↓
Source y sourcetype
    ↓
Parsing y extracción de campos
    ↓
Timestamp
    ↓
Búsqueda SPL
    ↓
Reporte, dashboard o alerta
```

La práctica se realizará preferentemente sobre el índice:

```text
curso
```

Las consultas de este documento utilizan ese índice. Si se utiliza otro, por
ejemplo `proyecto_web`, debe sustituirse de forma coherente en todas las búsquedas
y documentarse el cambio.

---

## 1. Objetivos de aprendizaje

Al trabajar con los datasets del curso, el asistente aprenderá a:

- reconocer diferentes formatos de datos;
- preparar un archivo CSV para Splunk;
- diferenciar eventos y campos;
- identificar el índice de destino;
- seleccionar un `sourcetype`;
- revisar `source`, `host` y `_time`;
- comprobar si los campos se han extraído correctamente;
- detectar errores de timestamp;
- analizar códigos HTTP;
- calcular volumen y tasas de error;
- crear series temporales;
- analizar URI, host e IP;
- estudiar tiempos de respuesta;
- crear búsquedas reutilizables;
- preparar datos para dashboards;
- probar una alerta;
- diagnosticar problemas de ingesta;
- documentar limitaciones del dataset.

---

## 2. Entorno de referencia

El laboratorio utiliza como referencia:

- Producto: Splunk Enterprise.
- Versión de referencia: Splunk Enterprise 10.4.3.
- Sistema operativo: Ubuntu 24.04.5 LTS.
- Arquitectura: instancia mononodo.
- Splunk Web: `http://localhost:8000`.
- Índice recomendado: `curso`.
- Usuario de configuración: `admin` o capacidades equivalentes.

### Diferencia entre rol de Splunk y permisos de Ubuntu

El rol `admin` controla la administración de Splunk, pero no concede
automáticamente permisos sobre el sistema operativo.

| Área | Ejemplo | Qué controla |
|---|---|---|
| Splunk | Rol `admin` | Índices, búsquedas, dashboards y alertas |
| Ubuntu | `sudo` | Servicios, procesos y archivos del sistema |
| Sistema de archivos | Permiso de lectura | Acceso de Splunk a una fuente |
| Dataset | CSV o log | Estructura y calidad de los eventos |

Para cargar un archivo desde Splunk Web normalmente no necesitas utilizar
`sudo`. Para monitorizar un archivo situado en Ubuntu, el proceso de Splunk debe
poder leer la ruta.

---

## 3. Datasets incluidos en la práctica

El curso utiliza principalmente eventos de una aplicación web.

Se recomienda trabajar con tres niveles de dataset:

1. Dataset mínimo.
2. Dataset ampliado.
3. Dataset de troubleshooting.

---

## 4. Dataset mínimo de eventos web

El dataset mínimo contiene los campos necesarios para realizar el análisis básico
de peticiones HTTP:

```text
timestamp,host,method,status,uri
```

### Campos del dataset mínimo

| Campo | Descripción | Ejemplo |
|---|---|---|
| `timestamp` | Fecha y hora del evento | `2026-01-01 10:00:00` |
| `host` | Host que genera el evento | `web-01` |
| `method` | Método HTTP | `GET` |
| `status` | Código HTTP | `200` |
| `uri` | Recurso solicitado | `/index.html` |

### Capacidades del dataset mínimo

Con este dataset puedes analizar:

- número de peticiones;
- peticiones por host;
- peticiones por método;
- peticiones por URI;
- códigos HTTP;
- errores `4xx`;
- errores `5xx`;
- respuestas HTTP `500`;
- evolución temporal;
- URI con más errores;
- host con más errores.

### Limitaciones del dataset mínimo

No puedes realizar de forma fiable:

- análisis por IP de origen;
- identificación de clientes;
- ranking de URL más lentas;
- media de latencia;
- percentil 95 de tiempo de respuesta.

Si se necesita alguno de esos análisis, utiliza el dataset ampliado.

---

## 5. Dataset ampliado de eventos web

El dataset ampliado añade campos de origen, rendimiento y contexto:

```text
timestamp,host,method,status,uri,clientip,response_time,user_agent,bytes,referer
```

### Campos del dataset ampliado

| Campo | Descripción | Ejemplo |
|---|---|---|
| `timestamp` | Fecha y hora del evento | `2026-01-01 10:00:00` |
| `host` | Servidor que procesa la petición | `web-01` |
| `method` | Método HTTP | `GET` |
| `status` | Código de respuesta | `200` |
| `uri` | Ruta solicitada | `/api/users` |
| `clientip` | IP de origen | `192.0.2.25` |
| `response_time` | Tiempo de respuesta en milisegundos | `245` |
| `user_agent` | Cliente utilizado | `Mozilla/5.0` |
| `bytes` | Bytes transferidos | `1024` |
| `referer` | Página de procedencia | `/login` |

### Capacidades adicionales

Con el dataset ampliado puedes analizar:

- IP con más errores;
- porcentaje de error por IP;
- URL más lentas;
- tiempo medio de respuesta;
- mediana;
- percentil 95;
- bytes transferidos;
- agentes de usuario;
- referers;
- relación entre URI y latencia;
- relación entre IP y errores.

### Unidad de `response_time`

En este curso, el campo `response_time` se expresa en milisegundos.

Ejemplo:

```text
response_time=250
```

significa aproximadamente:

```text
250 milisegundos
```

Si el dataset utiliza segundos, microsegundos u otra unidad, documenta la
conversión antes de crear visualizaciones o alertas de rendimiento.

---

## 6. Dataset de troubleshooting

Este dataset está diseñado para practicar problemas habituales de ingesta y
extracción.

Puede contener:

- timestamps con formatos diferentes;
- códigos HTTP como texto;
- campos vacíos;
- URI con espacios;
- líneas incompletas;
- valores de latencia ausentes;
- registros duplicados;
- eventos con host inesperado;
- archivos con delimitadores incorrectos.

Ejemplo:

```text
timestamp,host,method,status,uri,clientip,response_time
2026-01-01 10:00:00,web-01,GET,200,/,192.0.2.10,120
2026-01-01 10:00:01,web-01,POST,500,/api/login,192.0.2.11,800
2026-01-01 10:00:02,web-01,GET,abc,/error,192.0.2.12,
2026-01-01 10:00:03,web-01,GET,404,,192.0.2.13,50
```

Este dataset permite practicar:

- conversión con `tonumber`;
- tratamiento de campos nulos;
- identificación de códigos inválidos;
- detección de eventos incompletos;
- búsqueda de valores ausentes;
- documentación de limitaciones.

---

# 7. Generar un dataset de laboratorio

Si no dispones de un archivo, puedes crear uno en Ubuntu.

> Ejecuta los comandos únicamente en una ruta autorizada para el laboratorio.

## 7.1 Crear un directorio de práctica

```bash
sudo mkdir -p /var/log/splunk-curso
```

Concede permisos de lectura al usuario o grupo que ejecute Splunk.

Una opción habitual, que debe adaptarse a tu entorno, es:

```bash
sudo chmod 755 /var/log/splunk-curso
```

Comprueba la ruta:

```bash
ls -ld /var/log/splunk-curso
```

El usuario que ejecuta Splunk debe poder atravesar los directorios y leer los
archivos.

## 7.2 Crear un CSV mínimo

```bash
sudo tee /var/log/splunk-curso/eventos_web.csv > /dev/null <<'EOF'
timestamp,host,method,status,uri
2026-01-01 10:00:00,web-01,GET,200,/
2026-01-01 10:00:01,web-01,GET,200,/index.html
2026-01-01 10:00:02,web-01,GET,404,/favicon.ico
2026-01-01 10:00:03,web-01,POST,201,/api/users
2026-01-01 10:00:04,web-01,GET,500,/api/users
2026-01-01 10:00:05,web-02,GET,200,/
2026-01-01 10:00:06,web-02,GET,503,/api/orders
2026-01-01 10:00:07,web-02,GET,200,/products
2026-01-01 10:00:08,web-02,POST,400,/api/login
2026-01-01 10:00:09,web-01,GET,500,/api/users
EOF
```

Comprueba el archivo:

```bash
sudo head /var/log/splunk-curso/eventos_web.csv
```

Comprueba los permisos:

```bash
sudo ls -l /var/log/splunk-curso/eventos_web.csv
```

## 7.3 Crear un CSV ampliado

```bash
sudo tee /var/log/splunk-curso/eventos_web_ampliados.csv > /dev/null <<'EOF'
timestamp,host,method,status,uri,clientip,response_time,user_agent,bytes,referer
2026-01-01 10:00:00,web-01,GET,200,/,192.0.2.10,120,Mozilla/5.0,1024,-
2026-01-01 10:00:01,web-01,GET,200,/index.html,192.0.2.11,180,Mozilla/5.0,4096,/
2026-01-01 10:00:02,web-01,GET,404,/favicon.ico,192.0.2.12,40,Mozilla/5.0,512,/
2026-01-01 10:00:03,web-01,POST,201,/api/users,192.0.2.13,320,curl/8.0,2048,/register
2026-01-01 10:00:04,web-01,GET,500,/api/users,192.0.2.14,850,curl/8.0,256,/users
2026-01-01 10:00:05,web-02,GET,200,/,192.0.2.15,100,Mozilla/5.0,1024,-
2026-01-01 10:00:06,web-02,GET,503,/api/orders,192.0.2.16,2400,Mozilla/5.0,128,/orders
2026-01-01 10:00:07,web-02,GET,200,/products,192.0.2.17,210,Mozilla/5.0,8192,/
2026-01-01 10:00:08,web-02,POST,400,/api/login,192.0.2.18,90,curl/8.0,512,/login
2026-01-01 10:00:09,web-01,GET,500,/api/users,192.0.2.19,920,Mozilla/5.0,256,/users
EOF
```

Comprueba el número de líneas:

```bash
wc -l /var/log/splunk-curso/eventos_web_ampliados.csv
```

La primera línea corresponde a la cabecera. El número de eventos será el total de
líneas menos una.

---

# 8. Cargar un dataset mediante Splunk Web

La carga mediante Splunk Web es apropiada para:

- datasets pequeños;
- prácticas puntuales;
- archivos históricos;
- ejercicios reproducibles;
- pruebas iniciales de parsing.

## Procedimiento general

1. Accede a Splunk Web.
2. Abre la aplicación de búsqueda o administración de datos.
3. Selecciona la opción para añadir datos.
4. Elige la carga de un archivo.
5. Selecciona el CSV.
6. Revisa la vista previa.
7. Comprueba el delimitador.
8. Revisa la separación de eventos.
9. Selecciona el índice `curso`.
10. Selecciona o crea un `sourcetype`.
11. Revisa la extracción de timestamps.
12. Confirma la carga.
13. Ejecuta una búsqueda de validación.

## Recomendaciones durante la vista previa

Comprueba:

- que el delimitador es una coma;
- que la cabecera se interpreta correctamente;
- que cada línea representa un evento;
- que las comillas se manejan correctamente;
- que el timestamp está reconocido;
- que las columnas no se han desplazado;
- que no hay varias líneas fusionadas;
- que el índice de destino es `curso`;
- que el `sourcetype` es coherente.

## Nombres recomendados

Para el dataset mínimo:

```text
web:csv
```

Para el dataset ampliado:

```text
web:csv:extended
```

También puedes utilizar un nombre simple como:

```text
curso_web_csv
```

El nombre debe documentarse y mantenerse consistente.

---

# 9. Monitorizar un archivo desde Splunk

La monitorización de un archivo o directorio es apropiada para:

- eventos que llegan continuamente;
- simulaciones de producción;
- generación progresiva de logs;
- pruebas de alertas;
- ejercicios de ingestión incremental.

## Requisitos

Antes de monitorizar una ruta, confirma:

- que el archivo existe;
- que la ruta es correcta;
- que el proceso de Splunk puede leerla;
- que el archivo no está siendo modificado por otro proceso de forma inesperada;
- que el índice de destino existe;
- que el `sourcetype` es adecuado.

## Validar permisos en Ubuntu

```bash
ls -ld /var/log/splunk-curso
ls -l /var/log/splunk-curso/eventos_web.csv
```

Si el proceso de Splunk no puede atravesar la ruta o leer el archivo, la entrada
puede existir pero no generar eventos.

## Crear una entrada de monitorización

La configuración puede realizarse mediante Splunk Web o mediante archivos de
configuración.

En Splunk Web, utiliza la sección de entradas de datos y selecciona una entrada
de tipo monitor.

Configura:

```text
Ruta:
    /var/log/splunk-curso/eventos_web.csv

Índice:
    curso

Sourcetype:
    web:csv

Host:
    web-lab
```

## Ejemplo conceptual de `inputs.conf`

```ini
[monitor:///var/log/splunk-curso/eventos_web.csv]
disabled = false
index = curso
sourcetype = web:csv
host = web-lab
```

No sobrescribas archivos de configuración de producción sin revisar la estructura
existente. En un entorno administrado, utiliza una aplicación propia.

## Recargar la configuración

Después de modificar una entrada, puede ser necesario recargar la configuración
o reiniciar el servicio según el método utilizado.

Comprueba el estado:

```bash
sudo /opt/splunk/bin/splunk status
```

Revisa la configuración desde Splunk Web o mediante una búsqueda REST:

```spl
| rest /services/data/inputs/monitor
| table eai:acl.app path index sourcetype disabled
```

---

# 10. Simular la llegada de eventos

Para probar una entrada monitorizada y una alerta, puedes añadir eventos
progresivamente a un archivo.

> No edites un archivo histórico ya ingerido si deseas medir exactamente qué
> eventos nuevos llegan. Utiliza un archivo de prueba separado.

## Crear un archivo para datos incrementales

```bash
sudo touch /var/log/splunk-curso/eventos_incrementales.csv
```

Añade la cabecera:

```bash
echo "timestamp,host,method,status,uri" | \
sudo tee /var/log/splunk-curso/eventos_incrementales.csv
```

Añade eventos correctos:

```bash
echo "2026-09-17 18:00:00,web-01,GET,200,/" | \
sudo tee -a /var/log/splunk-curso/eventos_incrementales.csv
```

Añade eventos de error:

```bash
echo "2026-09-17 18:00:01,web-01,GET,500,/api/users" | \
sudo tee -a /var/log/splunk-curso/eventos_incrementales.csv
```

Repite la operación para probar el umbral de cinco errores `500`.

## Buscar los eventos recientes

```spl
index=curso earliest=-15m latest=now
| table _time host method status uri
| sort - _time
```

Si los eventos no aparecen:

1. comprueba el índice;
2. comprueba el rango temporal;
3. comprueba el timestamp;
4. comprueba la entrada;
5. comprueba los permisos;
6. revisa `_internal`.

---

# 11. Validar la ingesta

La validación debe realizarse antes de crear dashboards o alertas.

## Número de eventos

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

## Primer y último evento

```spl
index=curso earliest=0 latest=now
| stats min(_time) as inicio max(_time) as fin
| eval inicio=strftime(inicio, "%Y-%m-%d %H:%M:%S")
| eval fin=strftime(fin, "%Y-%m-%d %H:%M:%S")
```

## Metadatos

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
| sort - count
```

## Eventos recientes

```spl
index=curso earliest=-24h latest=now
| table _time host source sourcetype method status uri
| head 20
```

## Campos disponibles

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

## Revisar eventos originales

```spl
index=curso earliest=0 latest=now
| table _time _raw
| head 20
```

## Revisar tiempo de evento e indexación

```spl
index=curso earliest=0 latest=now
| eval retraso_ingesta=_indextime-_time
| table _time _indextime retraso_ingesta host status uri
| head 20
```

Un retraso grande puede deberse a que el archivo contiene eventos históricos.

---

# 12. Validar la extracción de campos

## Revisar códigos HTTP

```spl
index=curso earliest=0 latest=now
| stats count by status
| sort - count
```

## Convertir el código HTTP a número

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count by status status_num
| sort status
```

## Detectar códigos inválidos

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where isnull(status_num)
| table _time host status uri _raw
| head 20
```

## Revisar URI vacías

```spl
index=curso earliest=0 latest=now
| where isnull(uri) OR uri=""
| table _time host method status uri _raw
| head 20
```

## Revisar host vacío

```spl
index=curso earliest=0 latest=now
| where isnull(host) OR host=""
| table _time method status uri host _raw
| head 20
```

## Revisar latencias no numéricas

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(response_time) AND isnull(tiempo_ms)
| table _time uri response_time _raw
| head 20
```

---

# 13. Búsquedas prácticas sobre el dataset

## 13.1 Total de peticiones

```spl
index=curso earliest=0 latest=now
| stats count as total_peticiones
```

## 13.2 Peticiones por host

```spl
index=curso earliest=0 latest=now
| stats count as peticiones by host
| sort - peticiones
```

## 13.3 Peticiones por método

```spl
index=curso earliest=0 latest=now
| stats count as peticiones by method
| sort - peticiones
```

## 13.4 Peticiones por URI

```spl
index=curso earliest=0 latest=now
| stats count as peticiones by uri
| sort - peticiones
| head 10
```

## 13.5 Distribución por código HTTP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count as peticiones by status_num
| sort status_num
```

## 13.6 Clasificación por familia HTTP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval clase_http=case(
    status_num>=500, "5xx",
    status_num>=400, "4xx",
    status_num>=300, "3xx",
    status_num>=200, "2xx",
    true(), "otro"
)
| stats count as peticiones by clase_http
| sort clase_http
```

## 13.7 Porcentaje de error

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats
    count as total
    count(eval(status_num>=400)) as errores
| eval porcentaje_error=if(
    total>0,
    round(errores*100/total, 2),
    0
)
```

## 13.8 Errores por host

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| sort - errores
```

## 13.9 Errores por URI

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

## 13.10 Errores HTTP 500

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count as errores_500 by host uri
| sort - errores_500
```

## 13.11 Evolución por minuto

```spl
index=curso earliest=0 latest=now
| timechart span=1m count as peticiones
```

## 13.12 Peticiones correctas frente a errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval resultado=if(status_num>=400, "Error", "Correcta")
| timechart span=1m count by resultado
```

---

# 14. Análisis por IP

Este apartado requiere un campo como `clientip` o `src_ip`.

## IP con más errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by clientip
| sort - errores
| head 10
```

## Peticiones y porcentaje de error por IP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval es_error=if(status_num>=400, 1, 0)
| stats
    count as peticiones
    sum(es_error) as errores
    by clientip
| eval porcentaje_error=if(
    peticiones>0,
    round(errores*100/peticiones, 2),
    0
)
| sort - porcentaje_error
```

## IP con cinco o más errores en cinco minutos

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by clientip
| where errores>=5
| sort - errores
```

Si no existe `clientip`, documenta:

> No se pudo realizar el análisis por IP porque el dataset no contiene una
> dirección de origen. Se utilizó un análisis alternativo por host.

---

# 15. Análisis de tiempos de respuesta

Este apartado requiere un campo como `response_time`, `duration` o `latency`.

## Media y percentil 95 por URI

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(tiempo_ms)
| stats
    count as peticiones
    avg(tiempo_ms) as media_ms
    median(tiempo_ms) as mediana_ms
    perc95(tiempo_ms) as p95_ms
    max(tiempo_ms) as maximo_ms
    by uri
| sort - p95_ms
```

## URI más lenta

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(tiempo_ms)
| stats
    count as peticiones
    avg(tiempo_ms) as media_ms
    perc95(tiempo_ms) as p95_ms
    by uri
| sort - p95_ms
| head 10
```

## Latencia por código HTTP

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| eval status_num=tonumber(status)
| where isnotnull(tiempo_ms)
| stats
    avg(tiempo_ms) as media_ms
    perc95(tiempo_ms) as p95_ms
    by status_num
| sort status_num
```

## Documentar la ausencia de latencia

Si el campo no existe, utiliza esta explicación:

> El dataset utilizado no contiene una medida de duración o latencia. Por tanto,
> no es posible determinar qué URL es más lenta. El análisis se sustituye por un
> ranking de URI con más errores, que mide fiabilidad y no rendimiento.

---

# 16. Crear un dashboard con el dataset

Un dashboard mínimo puede incluir:

| Panel | Consulta |
|---|---|
| Total de peticiones | `stats count` |
| Total de errores | `count(eval(status_num>=400))` |
| Porcentaje de error | `stats` y `eval` |
| Peticiones por minuto | `timechart` |
| Errores por código | `stats by status_num` |
| Host con más errores | `stats by host` |
| URI con más errores | `stats by uri` |
| URL más lentas | `stats` sobre latencia, si existe |

## Panel de total de peticiones

```spl
index=curso earliest=$time.earliest$ latest=$time.latest$
| stats count as peticiones
```

## Panel de errores

```spl
index=curso earliest=$time.earliest$ latest=$time.latest$
| eval status_num=tonumber(status)
| stats count(eval(status_num>=400)) as errores
```

## Panel temporal

```spl
index=curso earliest=$time.earliest$ latest=$time.latest$
| timechart span=1m count as peticiones
```

La sintaxis de tokens puede variar según el tipo de dashboard. Debes adaptar
`$time.earliest$` y `$time.latest$` al mecanismo utilizado.

---

# 17. Crear una alerta con el dataset

La alerta del proyecto detecta cinco o más respuestas HTTP `500` en cinco minutos.

## Búsqueda de la alerta

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

## Probar la consulta con datos históricos

```spl
index=curso earliest="01/01/2026:00:00:00"
          latest="01/01/2026:00:10:00"
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

## Consultar errores recientes

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count as errores_500 by host uri
| sort - errores_500
```

Para probar una alerta en tiempo real, utiliza un archivo monitorizado y añade
eventos nuevos con timestamps recientes.

---

# 18. Troubleshooting de datasets

## Problema: no aparecen eventos

Comprueba:

```spl
index=curso earliest=0 latest=now
| stats count
```

Después revisa:

- índice;
- rango temporal;
- estado de Splunk;
- permisos de la ruta;
- entrada configurada;
- `source`;
- `sourcetype`;
- timestamp.

## Problema: el archivo existe, pero Splunk no lo lee

Comprueba los permisos:

```bash
ls -ld /var/log/splunk-curso
ls -l /var/log/splunk-curso/eventos_web.csv
```

Comprueba la configuración:

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype disabled
```

## Problema: los eventos aparecen en otro índice

Revisa:

- configuración de la entrada;
- `inputs.conf`;
- selección realizada en Splunk Web;
- aplicación desde la que se configuró la entrada;
- permisos del objeto.

## Problema: todos los eventos tienen el mismo timestamp

Revisa:

- nombre del campo de fecha;
- formato de fecha;
- zona horaria;
- configuración de extracción;
- cabecera CSV;
- separación de eventos.

## Problema: `status` no se puede comparar numéricamente

Utiliza:

```spl
| eval status_num=tonumber(status)
```

Después revisa los valores inválidos:

```spl
| where isnull(status_num)
| table status _raw
```

## Problema: las columnas aparecen desplazadas

Revisa:

- delimitador;
- comillas;
- comas dentro de los valores;
- cabecera;
- saltos de línea;
- valores con caracteres especiales.

## Problema: no aparece el campo `clientip`

Comprueba:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Si no existe, documenta la limitación. No crees un panel de IP con valores
inventados.

## Problema: la alerta no se dispara

Comprueba:

1. si hay eventos recientes;
2. si `_time` está dentro de los últimos cinco minutos;
3. si `status_num=500` existe;
4. si la consulta devuelve resultados manualmente;
5. si la alerta está habilitada;
6. si la frecuencia está configurada;
7. si el usuario puede ejecutar la alerta;
8. si el throttling está ocultando nuevas ejecuciones.

---

# 19. Laboratorios prácticos

## Laboratorio 1: identificar la estructura del dataset

### Objetivo

Conocer los campos y metadatos del dataset.

### Pasos

Ejecuta:

```spl
index=curso earliest=0 latest=now
| head 20
```

Después:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Finalmente:

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
```

### Evidencia

Entrega:

- captura de los eventos;
- lista de campos;
- host;
- source;
- sourcetype;
- rango temporal.

---

## Laboratorio 2: validar códigos HTTP

### Objetivo

Comprobar que `status` contiene valores utilizables.

### Consulta

```spl
index=curso earliest=0 latest=now
| stats count by status
| sort - count
```

Después:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count by status status_num
| sort status
```

### Preguntas

- ¿Existen valores no numéricos?
- ¿Hay códigos `4xx`?
- ¿Hay códigos `5xx`?
- ¿Existe algún valor vacío?
- ¿Cuál es el código más frecuente?

---

## Laboratorio 3: investigar errores

### Objetivo

Localizar dónde se concentran los errores.

### Consulta

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host uri status_num
| sort - errores
```

### Preguntas

- ¿Qué host tiene más errores?
- ¿Qué URI aparece con mayor frecuencia?
- ¿Predominan `4xx` o `5xx`?
- ¿Qué investigación adicional recomendarías?

---

## Laboratorio 4: construir una serie temporal

### Objetivo

Observar la evolución del tráfico y los errores.

### Consulta

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval tipo=if(status_num>=400, "Error", "Correcta")
| timechart span=1m count by tipo
```

### Preguntas

- ¿Hay picos?
- ¿Hay intervalos sin eventos?
- ¿Los errores coinciden con aumento de tráfico?
- ¿La muestra es suficientemente grande para extraer conclusiones?

---

## Laboratorio 5: analizar IP

### Objetivo

Identificar IP con mayor volumen de errores.

### Consulta

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by clientip
| sort - errores
| head 10
```

### Si no existe `clientip`

Ejecuta:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Documenta la ausencia y utiliza:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| sort - errores
```

---

## Laboratorio 6: analizar latencia

### Objetivo

Identificar URI con mayor tiempo de respuesta.

### Consulta

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(tiempo_ms)
| stats
    avg(tiempo_ms) as media_ms
    perc95(tiempo_ms) as p95_ms
    by uri
| sort - p95_ms
```

### Preguntas

- ¿Qué URI tiene mayor `p95_ms`?
- ¿La media y el percentil 95 son parecidos?
- ¿Hay valores extremos?
- ¿Está documentada la unidad?
- ¿Hay suficientes eventos para que el resultado sea representativo?

---

## Laboratorio 7: crear la alerta

### Objetivo

Configurar una alerta para cinco o más HTTP `500` en cinco minutos.

### Consulta

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

### Pasos

1. Ejecuta la búsqueda manualmente.
2. Comprueba el rango temporal.
3. Guarda la búsqueda.
4. Configúrala como alerta.
5. Define frecuencia.
6. Define acción.
7. Define destinatario.
8. Configura throttling.
9. Prueba la condición.
10. Documenta el resultado.

---

# 20. Dataset de prueba para cinco errores HTTP 500

Para probar la alerta, crea cinco eventos recientes.

Ejemplo:

```text
timestamp,host,method,status,uri
2026-09-17 18:00:00,web-01,GET,500,/api/users
2026-09-17 18:00:01,web-01,GET,500,/api/users
2026-09-17 18:00:02,web-01,GET,500,/api/users
2026-09-17 18:00:03,web-01,GET,500,/api/users
2026-09-17 18:00:04,web-01,GET,500,/api/users
```

Si el reloj actual no coincide con la fecha del ejemplo, utiliza timestamps
recientes. Una consulta con `earliest=-5m` solo encontrará eventos cuyo `_time`
esté dentro de esa ventana.

Después comprueba:

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count as errores_500
```

La alerta debe devolver un resultado cuando:

```text
errores_500 >= 5
```

---

# 21. Buenas prácticas con datasets

## Utiliza nombres claros

Recomendados:

```text
eventos_web.csv
eventos_web_ampliados.csv
eventos_incrementales.csv
```

Evita nombres ambiguos:

```text
datos.csv
prueba2.csv
nuevo.csv
final-final.csv
```

## Conserva una copia original

Antes de modificar un archivo:

```bash
cp eventos_web.csv eventos_web.original.csv
```

## Documenta la versión del dataset

Ejemplo:

```text
Dataset: eventos_web_ampliados.csv
Versión: 1.0
Fecha de creación: 2026-09-17
Campos: 10
Eventos: 1.000
```

## No cargues repetidamente el mismo archivo sin control

Si cargas varias veces el mismo dataset, puedes generar duplicados.

Antes de repetir una carga, documenta:

- índice;
- source;
- sourcetype;
- momento de carga;
- número de eventos;
- motivo de la nueva carga.

## Evita mezclar datasets

No mezcles en la misma búsqueda:

- eventos mínimos;
- eventos ampliados;
- datos de troubleshooting;

sin documentar las diferencias de campos.

---

# 22. Entregables del trabajo con datasets

Para cada dataset utilizado, entrega:

- nombre del archivo;
- descripción;
- formato;
- delimitador;
- cabecera;
- número de eventos;
- periodo temporal;
- índice;
- source;
- sourcetype;
- método de ingesta;
- campos disponibles;
- campos ausentes;
- limitaciones;
- búsquedas de validación;
- captura de los primeros eventos;
- resultado de la extracción.

## Plantilla

```markdown
## Dataset: eventos_web_ampliados.csv

### Descripción

Eventos HTTP de una aplicación web de laboratorio.

### Formato

CSV separado por comas.

### Índice

curso

### Sourcetype

web:csv:extended

### Número de eventos

Completar con el resultado real.

### Periodo temporal

Completar con el primer y último `_time`.

### Campos

- timestamp
- host
- method
- status
- uri
- clientip
- response_time
- user_agent
- bytes
- referer

### Método de ingesta

Carga mediante Splunk Web o monitorización de archivo.

### Limitaciones

Indicar si los datos son sintéticos, históricos o incompletos.
```

---

# 23. Lista de comprobación

## Preparación

- [ ] El archivo existe.
- [ ] La cabecera está revisada.
- [ ] El delimitador está confirmado.
- [ ] El número de columnas es coherente.
- [ ] Los timestamps tienen un formato consistente.
- [ ] Los valores obligatorios no están vacíos.
- [ ] Se ha guardado una copia original.

## Ingesta

- [ ] El índice `curso` existe.
- [ ] El índice está habilitado.
- [ ] El archivo se ha cargado o monitorizado.
- [ ] El `source` está documentado.
- [ ] El `sourcetype` está documentado.
- [ ] Los permisos de lectura están comprobados.
- [ ] No existen cargas duplicadas sin documentar.

## Validación

- [ ] Hay eventos.
- [ ] `_time` es razonable.
- [ ] `_indextime` se ha revisado.
- [ ] `host` existe.
- [ ] `status` existe.
- [ ] `uri` existe.
- [ ] `method` existe o se ha documentado su ausencia.
- [ ] IP se ha comprobado.
- [ ] Latencia se ha comprobado.
- [ ] Se han revisado códigos inválidos.
- [ ] Se han revisado valores vacíos.

## Análisis

- [ ] Se ha calculado el volumen.
- [ ] Se han clasificado los códigos HTTP.
- [ ] Se ha calculado la tasa de error.
- [ ] Se han analizado URI.
- [ ] Se han analizado hosts.
- [ ] Se ha analizado IP si existe.
- [ ] Se ha analizado latencia si existe.
- [ ] Se ha creado una serie temporal.
- [ ] Se ha probado la alerta.

## Documentación

- [ ] Dataset descrito.
- [ ] Fuente documentada.
- [ ] Índice documentado.
- [ ] Sourcetype documentado.
- [ ] Campos documentados.
- [ ] Limitaciones documentadas.
- [ ] Consultas SPL incluidas.
- [ ] Capturas incluidas.
- [ ] Resultados explicados.
- [ ] La solución puede reproducirse.

---

# 24. Referencias oficiales

- [Splunk Enterprise Documentation](https://docs.splunk.com/Documentation/Splunk)
- [How Splunk processes data](https://docs.splunk.com/Documentation/Splunk/latest/Data/HowSplunkprocessesdata)
- [Monitor files and directories](https://docs.splunk.com/Documentation/Splunk/latest/Data/Monitorfilesanddirectories)
- [About indexes](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Get data in](https://docs.splunk.com/Documentation/Splunk/latest/Get started/Getdatain)
- [Splunk Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchapp)
- [Splunk Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)
- [`stats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Stats)
- [`eval`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Eval)
- [`timechart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart)
- [`fieldsummary`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fieldsummary)
- [Splunk REST API Reference](https://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTprolog)
- [Splunk Alerts](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Splunk Users and Roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
```

## Observaciones prácticas

### Dataset mínimo

Utilízalo para los primeros ejercicios:

```text
timestamp,host,method,status,uri
```

Es suficiente para enseñar:

- ingesta;
- campos;
- códigos HTTP;
- errores;
- `stats`;
- `eval`;
- `timechart`;
- dashboards básicos.

### Dataset ampliado

Utilízalo cuando el asistente ya domine las búsquedas básicas:

```text
timestamp,host,method,status,uri,clientip,response_time,user_agent,bytes,referer
```

Permite trabajar con:

- IP;
- latencia;
- percentiles;
- usuarios;
- volumen de bytes;
- análisis más cercano a un entorno real.

### Dataset de troubleshooting

Utilízalo para evaluar la capacidad de diagnóstico:

- campos ausentes;
- valores inválidos;
- errores de parsing;
- timestamps incorrectos;
- permisos;
- alertas que no se disparan.

## Fuentes utilizadas

Las referencias principales se han seleccionado para cubrir el ciclo completo de
entrada, indexación, consulta, visualización y alertas:

- La documentación de `inputs.conf` ayuda a entender la configuración de entradas
  de monitorización. [1]
- La documentación de `indexes.conf` sirve para revisar la configuración de
  índices y sus parámetros. [2]
- La documentación de `transforms.conf` resulta útil cuando el laboratorio
  necesita transformaciones o enrutamiento avanzado. [3]
- La documentación de `limits.conf` permite consultar límites relevantes del
  procesamiento y de las búsquedas. [4]

La documentación oficial general de Splunk, Search Reference, dashboards y alertas
debe utilizarse junto con las pruebas realizadas en la instancia, especialmente
cuando la interfaz o la sintaxis puedan variar entre versiones.