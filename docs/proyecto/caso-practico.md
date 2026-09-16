# Caso práctico: monitorización de una aplicación web

## Descripción

El equipo de operaciones sospecha que una aplicación web está experimentando
problemas intermitentes. Se han observado peticiones fallidas, posibles respuestas
lentas y un aumento de errores HTTP.

Tu misión es utilizar Splunk Enterprise para construir una solución básica de
monitorización que permita investigar el comportamiento de la aplicación y
presentar los resultados a un equipo técnico.

El trabajo se realiza sobre el índice:

```spl
index=curso
```

El caso debe resolverse mediante:

- búsquedas SPL;
- búsquedas guardadas;
- reportes;
- visualizaciones;
- un dashboard;
- filtros interactivos;
- una alerta;
- una explicación técnica de los resultados.

La solución debe basarse en evidencias observables en Splunk. No se deben realizar
afirmaciones que los datos no permitan demostrar.

---

## Pregunta principal

La pregunta central del caso es:

> ¿La aplicación web está funcionando correctamente y existen evidencias de errores,
> concentración de actividad o degradación del rendimiento?

Para responderla, tendrás que analizar:

- volumen total de peticiones;
- evolución temporal;
- códigos HTTP;
- hosts;
- IP de origen, si está disponible;
- URI;
- errores HTTP `4xx` y `5xx`;
- tiempos de respuesta, si están disponibles;
- distribución de métodos HTTP;
- posibles concentraciones anómalas;
- comportamiento de la aplicación durante el intervalo analizado.

La respuesta final no debe limitarse a indicar que “hay errores”. Debe explicar:

1. cuántos eventos se observaron;
2. qué proporción representa cada tipo de respuesta;
3. dónde se concentran los errores;
4. cuándo aparecen;
5. qué campos permiten respaldar la conclusión;
6. qué información no está disponible;
7. qué debería investigar el equipo de operaciones.

---

## Objetivos del caso práctico

Al finalizar este caso podrás:

- comprobar que los datos del laboratorio están disponibles;
- confirmar el índice y el intervalo temporal;
- identificar los metadatos de los eventos;
- analizar el volumen de peticiones;
- calcular errores HTTP;
- clasificar respuestas en familias `2xx`, `3xx`, `4xx` y `5xx`;
- construir series temporales;
- identificar hosts o URI con más errores;
- analizar IP de origen cuando exista ese campo;
- calcular tiempos de respuesta cuando exista una métrica de latencia;
- preparar indicadores para un dashboard;
- definir una condición de alerta;
- documentar las limitaciones del dataset;
- presentar conclusiones respaldadas por búsquedas SPL.

---

## Entorno de trabajo

El caso se desarrolla sobre una instancia local de Splunk Enterprise ya instalada.

### Datos de referencia

- Producto: Splunk Enterprise.
- Arquitectura: mononodo.
- Sistema operativo: Ubuntu 24.04.5 LTS.
- Interfaz: Splunk Web.
- URL habitual: `http://localhost:8000`.
- Índice principal: `curso`.
- Dataset: eventos web de laboratorio.
- Usuario de prácticas: cuenta con rol `admin`.

El rol `admin` facilita la configuración del laboratorio, pero no debe interpretarse
como el modelo recomendado para producción. En un entorno real conviene utilizar
roles personalizados y el principio de mínimo privilegio.

### Diferencia entre permisos Splunk y permisos Ubuntu

Tener el rol `admin` en Splunk no concede automáticamente permisos sobre el sistema
de archivos de Ubuntu.

| Ámbito | Ejemplo | Qué controla |
|---|---|---|
| Splunk | Rol `admin` | Búsquedas, índices, dashboards y alertas |
| Ubuntu | `sudo` | Servicios, procesos y configuración del sistema |
| Sistema de archivos | Permiso de lectura | Acceso de Splunk al CSV o log |
| Aplicación | Compartición de objetos | Quién puede utilizar búsquedas y dashboards |

---

## Flujo de trabajo

El caso práctico seguirá este flujo:

```text
Comprobar la instancia
        ↓
Conocer el dataset
        ↓
Validar índice y timestamps
        ↓
Analizar volumen
        ↓
Analizar códigos HTTP
        ↓
Analizar evolución temporal
        ↓
Investigar hosts, IP y URI
        ↓
Analizar latencia
        ↓
Construir visualizaciones
        ↓
Configurar dashboard
        ↓
Crear alerta
        ↓
Documentar conclusiones
```

No se debe construir el dashboard antes de validar las búsquedas. Un panel visual
no corrige una consulta incorrecta; solamente presenta sus resultados con más
colores y, a veces, con más confianza de la que merece.

---

# Fase 0: comprobaciones previas

Antes de iniciar el análisis, comprueba que la instancia está disponible.

## Comprobar la versión desde Ubuntu

```bash
/opt/splunk/bin/splunk version
```

La salida debe mostrar la versión instalada de Splunk Enterprise.

## Comprobar el servicio

```bash
sudo systemctl status Splunkd
```

Si la instalación no utiliza una unidad `systemd` con ese nombre, comprueba el
estado mediante el comando de Splunk:

```bash
sudo /opt/splunk/bin/splunk status
```

## Comprobar Splunk Web

Abre en el navegador:

```text
http://localhost:8000
```

También puedes comprobar la respuesta HTTP desde la terminal:

```bash
curl -I http://localhost:8000
```

## Comprobar puertos habituales

```bash
sudo ss -lntp | grep -E '8000|8089|9997'
```

En el laboratorio, los puertos suelen tener estas funciones:

| Puerto | Uso |
|---:|---|
| `8000` | Splunk Web |
| `8089` | API y administración de Splunk |
| `9997` | Recepción desde forwarders, si se ha configurado |

El puerto `9997` no es necesario para cargar un archivo local mediante Splunk Web
o para utilizar una entrada local.

---

# Fase 1: conocer los datos

Antes de interpretar los eventos, revisa la estructura real del dataset.

No debes asumir que todos los archivos tienen exactamente los mismos campos. La
documentación del curso puede utilizar nombres de referencia, pero la búsqueda debe
adaptarse a los campos que existan realmente en tu instancia.

## Primera búsqueda de exploración

Ejecuta:

```spl
index=curso earliest=0 latest=now
| head 20
```

Esta consulta permite comprobar rápidamente si existen eventos.

El uso de `earliest=0` es útil durante la validación porque amplía la búsqueda a
eventos históricos. No significa que debas utilizar siempre ese intervalo en
producción.

## Revisar el contenido original

```spl
index=curso earliest=0 latest=now
| table _time _indextime _raw
| head 20
```

Comprueba:

- el texto original del evento;
- el timestamp reconocido;
- el momento de indexación;
- el formato general de la fuente.

## Comprobar los campos principales

```spl
index=curso earliest=0 latest=now
| table _time host method status uri clientip src_ip response_time duration latency
| head 20
```

Esta consulta puede mostrar campos vacíos si no existen en el dataset. Eso no es
necesariamente un error de la búsqueda: puede indicar que la fuente no contiene
esa información.

## Revisar los campos disponibles

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

`fieldsummary` permite obtener información sobre los campos presentes en los
resultados. Úsalo como herramienta de exploración inicial y no como sustituto de
una validación detallada de cada campo.

## Consultar metadatos de origen

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
| sort - count
```

Debes identificar:

- qué host aparece;
- qué `source` se ha utilizado;
- qué `sourcetype` tiene el evento;
- cuántos eventos aporta cada combinación.

## Calcular el rango temporal

```spl
index=curso earliest=0 latest=now
| stats min(_time) as inicio max(_time) as fin
| eval inicio=strftime(inicio, "%Y-%m-%d %H:%M:%S")
| eval fin=strftime(fin, "%Y-%m-%d %H:%M:%S")
```

También puedes comparar el tiempo del evento con el tiempo de indexación:

```spl
index=curso earliest=0 latest=now
| eval retraso_ingesta=_indextime-_time
| table _time _indextime retraso_ingesta host status uri
| head 20
```

El retraso puede deberse a:

- carga posterior de un archivo histórico;
- diferencia de zona horaria;
- retraso real en la entrega;
- interpretación incorrecta del timestamp;
- datos generados previamente y enviados después.

### Resultado esperado de la fase 1

Debes poder documentar:

- cantidad aproximada de eventos;
- fecha del primer evento;
- fecha del último evento;
- hosts presentes;
- `source`;
- `sourcetype`;
- campos disponibles;
- existencia o ausencia de IP;
- existencia o ausencia de duración;
- posibles problemas de timestamp.

No continúes con conclusiones operativas hasta completar esta revisión.

---

# Fase 2: volumen de peticiones

El primer indicador operativo es el volumen de eventos observados.

## Total de peticiones

```spl
index=curso earliest=0 latest=now
| stats count as total_peticiones
```

El resultado debe contener una única fila con el total de eventos encontrados.

## Peticiones por host

```spl
index=curso earliest=0 latest=now
| stats count as peticiones by host
| sort - peticiones
```

Esta consulta permite detectar si un host concentra la actividad.

## Peticiones por método HTTP

```spl
index=curso earliest=0 latest=now
| stats count as peticiones by method
| sort - peticiones
```

Esta consulta ayuda a conocer la distribución entre `GET`, `POST`, `PUT`,
`DELETE` u otros métodos.

## Peticiones por URI

```spl
index=curso earliest=0 latest=now
| stats count as peticiones by uri
| sort - peticiones
| head 20
```

## Peticiones por host y URI

```spl
index=curso earliest=0 latest=now
| stats count as peticiones by host uri
| sort - peticiones
| head 20
```

### Interpretación

El volumen total indica cuántas peticiones se han observado en el intervalo
seleccionado. No demuestra por sí solo que la aplicación esté sana.

Una aplicación puede recibir muchas peticiones y presentar una tasa de errores
elevada. Por eso el volumen debe analizarse junto con:

- códigos HTTP;
- porcentaje de errores;
- distribución temporal;
- tiempo de respuesta;
- concentración por URI;
- concentración por host o IP.

### Ejemplo de interpretación

> Se observaron 1.250 eventos durante el intervalo analizado. La mayor parte de
> las peticiones corresponde al método `GET` y la URI `/login` concentra el mayor
> número de accesos. Este resultado describe el volumen, pero todavía no permite
> afirmar que la aplicación funcione correctamente.

---

# Fase 3: códigos HTTP

Los códigos HTTP permiten clasificar el resultado de cada petición.

Antes de realizar comparaciones, normaliza el campo. Esto es importante porque un
valor procedente de un CSV puede haberse extraído como texto.

## Distribución por código HTTP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count as peticiones by status_num
| sort status_num
```

## Clasificación por familia HTTP

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

La clasificación debe interpretarse como:

- `2xx`: respuestas correctas;
- `3xx`: redirecciones;
- `4xx`: errores asociados normalmente a la petición o al cliente;
- `5xx`: errores asociados normalmente al servidor o a la aplicación;
- `otro`: valores ausentes, inválidos o fuera del rango esperado.

## Porcentaje de errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval es_error=if(status_num>=400, 1, 0)
| stats count as total sum(es_error) as errores
| eval porcentaje_error=round(errores*100/total, 2)
```

## Porcentaje de errores con protección contra división por cero

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval es_error=if(status_num>=400, 1, 0)
| stats count as total sum(es_error) as errores
| eval porcentaje_error=if(total>0, round(errores*100/total, 2), 0)
```

## Errores por host

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| sort - errores
```

## Errores por URI

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

## Errores por código y URI

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by status_num uri
| sort - errores
| head 20
```

## Errores HTTP 500

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count as errores_500 by host uri
| sort - errores_500
```

## Eventos con código HTTP ausente o inválido

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where isnull(status_num)
| table _time host method status uri _raw
| head 20
```

Esta consulta es útil para detectar problemas de extracción o registros
incompletos.

### Interpretación

Un porcentaje elevado de `4xx` no significa necesariamente que el servidor esté
fallando. Puede indicar:

- URL inexistentes;
- autenticación fallida;
- permisos insuficientes;
- peticiones mal formadas;
- clientes que utilizan rutas antiguas.

Los `5xx` requieren normalmente una investigación prioritaria porque indican que el
servidor o la aplicación no pudo completar la petición correctamente.

---

# Fase 4: evolución temporal

Una distribución global puede ocultar el momento exacto en el que empezó un
problema. Por eso debes analizar la evolución temporal.

## Tráfico por minuto

```spl
index=curso earliest=0 latest=now
| timechart span=1m count as peticiones
```

## Peticiones correctas y errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval resultado=if(status_num>=400, "Error", "Correcta")
| timechart span=1m count by resultado
```

## Evolución por familia HTTP

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
| timechart span=1m count by clase_http
```

## Respuestas HTTP 500 por minuto

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num=500
| timechart span=1m count as errores_500
```

## Errores por host a lo largo del tiempo

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| timechart span=1m count by host
```

### Interpretación

Busca:

- picos de actividad;
- periodos sin eventos;
- incrementos repentinos de errores;
- coincidencia temporal entre tráfico elevado y respuestas `5xx`;
- errores concentrados en una franja concreta;
- un host cuyo comportamiento difiera del resto;
- errores que aparezcan después de un aumento de tráfico.

Una serie temporal no explica por sí sola la causa del problema. Sirve para
identificar cuándo investigar y qué otros campos relacionar.

### Ejemplo de interpretación

> Los errores `5xx` se concentran entre las 10:05 y las 10:07, coincidiendo con un
> incremento del volumen total de peticiones. Este patrón justifica revisar los
> logs de aplicación y la capacidad del servicio en esa ventana, pero no demuestra
> por sí solo que la causa sea saturación.

---

# Fase 5: análisis por IP

Utiliza el nombre de campo que exista realmente en el dataset.

No confundas:

- `host`: sistema que genera o envía el evento;
- `clientip`: IP del cliente;
- `src_ip`: IP de origen;
- `source`: origen técnico de la entrada.

## Si existe `clientip`

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by clientip
| sort - errores
| head 10
```

## Si existe `src_ip`

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by src_ip
| sort - errores
| head 10
```

## Peticiones totales y errores por IP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval es_error=if(status_num>=400, 1, 0)
| stats
    count as peticiones
    sum(es_error) as errores
    by clientip
| eval porcentaje_error=round(errores*100/peticiones, 2)
| sort - errores
```

## IP con muchos errores en una ventana temporal

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by clientip
| where errores>=5
| sort - errores
```

## Si el campo no está disponible

Documenta la limitación:

> El dataset utilizado no contiene una dirección IP de origen. Por tanto, no es
> posible identificar qué IP genera más errores. Para realizar este análisis sería
> necesario incorporar un campo como `clientip` o `src_ip` durante la ingesta.

No sustituyas una IP por `host` sin indicarlo. Un host y una IP de cliente
representan entidades diferentes.

## Sustitución didáctica por host

Si no existe IP, puedes utilizar `host` como análisis alternativo:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| sort - errores
```

El título del panel debe ser entonces:

```text
Host con más errores
```

No debe llamarse:

```text
IP con más errores
```

---

# Fase 6: análisis de tiempos de respuesta

Utiliza el nombre real del campo de latencia.

Los valores de duración pueden estar expresados en:

- milisegundos;
- segundos;
- microsegundos;
- unidades propias de la aplicación.

Antes de calcular indicadores, documenta la unidad utilizada.

## Si existe `response_time` en milisegundos

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

## Si existe `duration`

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(duration)
| where isnotnull(tiempo_ms)
| stats
    count as peticiones
    avg(tiempo_ms) as media_ms
    perc95(tiempo_ms) as p95_ms
    by uri
| sort - p95_ms
```

## URL con mayor tiempo de respuesta

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
    count as peticiones
    avg(tiempo_ms) as media_ms
    perc95(tiempo_ms) as p95_ms
    by status_num
| sort status_num
```

El percentil 95 suele ser más informativo que la media cuando existen unas pocas
respuestas extremadamente lentas.

## Si no existe ningún campo de latencia

Documenta la limitación:

> El dataset no contiene una duración o latencia de respuesta. No es posible
> calcular URL más lentas de forma fiable. El dashboard puede incluir un panel
> alternativo de URI con más errores, pero no debe etiquetarse como rendimiento.

### Panel alternativo

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

El título recomendado sería:

```text
URI con más errores
```

---

# Fase 7: búsqueda de comportamiento anormal

Una posible definición de comportamiento anormal es una IP con un volumen elevado
de errores durante una ventana temporal.

## Anomalía por IP

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by clientip
| where errores>=5
| sort - errores
```

## Anomalía por host

Si no existe `clientip`:

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| where errores>=5
| sort - errores
```

## URI con concentración de errores

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| where errores>=5
| sort - errores
```

## Código HTTP 500 como condición prioritaria

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count as errores_500 by host uri
| where errores_500>=5
| sort - errores_500
```

Estas consultas deben interpretarse como reglas iniciales de detección. En un
entorno real, el umbral debe ajustarse al volumen normal de la aplicación.

---

# Fase 8: diagnóstico operativo

Si una búsqueda no devuelve resultados, sigue este orden:

1. Confirmar el índice.
2. Ampliar temporalmente el rango.
3. Confirmar que existen eventos.
4. Revisar el nombre del campo.
5. Comprobar el tipo del campo.
6. Revisar `source` y `sourcetype`.
7. Revisar permisos.
8. Consultar logs internos.
9. Revisar la configuración del dashboard o la alerta.

## Búsqueda amplia de diagnóstico

```spl
index=curso earliest=0 latest=now
| stats count
```

## Comprobación de eventos recientes

```spl
index=curso earliest=-24h latest=now
| head 20
```

## Comprobación de campos

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

## Comprobación del contenido original

```spl
index=curso earliest=0 latest=now
| table _time _raw
| head 20
```

## Comprobación de valores del campo `status`

```spl
index=curso earliest=0 latest=now
| stats count by status
| sort - count
```

## Comprobación de valores convertibles a número

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count by status status_num
| sort status
```

## Revisión de eventos internos recientes

```spl
index=_internal earliest=-30m latest=now
| search log_level=error OR log_level=warn
| table _time host component log_level message
| sort - _time
```

## Diagnóstico de una búsqueda vacía

Una búsqueda como esta:

```spl
index=curso status=500 earliest=-5m latest=now
```

puede devolver cero resultados por varios motivos:

- no existen eventos `500`;
- los datos son históricos;
- el campo no se llama `status`;
- el valor está extraído como otro tipo;
- el índice es incorrecto;
- el usuario no tiene acceso;
- la entrada no ha ingerido datos nuevos.

La secuencia de comprobación debe ser:

```spl
index=curso earliest=0 latest=now
| stats count
```

Después:

```spl
index=curso earliest=0 latest=now
| stats count by status
```

Y finalmente:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count by status_num
```

---

# Fase 9: búsquedas para el dashboard

Las siguientes búsquedas pueden utilizarse como base para los paneles del
dashboard.

## Panel 1: total de peticiones

```spl
index=curso earliest=0 latest=now
| stats count as peticiones
```

Visualización recomendada:

```text
Single value
```

## Panel 2: total de errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num>=400)) as errores
```

Visualización recomendada:

```text
Single value
```

## Panel 3: porcentaje de errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats
    count as peticiones
    count(eval(status_num>=400)) as errores
| eval porcentaje_error=if(
    peticiones>0,
    round(errores*100/peticiones, 2),
    0
)
```

Visualización recomendada:

```text
Single value
```

## Panel 4: peticiones por minuto

```spl
index=curso earliest=0 latest=now
| timechart span=1m count as peticiones
```

Visualización recomendada:

```text
Line chart
```

## Panel 5: errores por código HTTP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count as errores by status_num
| sort status_num
```

Visualización recomendada:

```text
Column chart
```

## Panel 6: URI con más errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

Visualización recomendada:

```text
Bar chart o tabla
```

## Panel 7: IP con más errores

Si existe `clientip`:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by clientip
| sort - errores
| head 10
```

Si no existe, utiliza un panel de host:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| sort - errores
| head 10
```

## Panel 8: URL más lentas

Si existe `response_time`:

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

Si no existe, utiliza:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

En ese caso, el panel debe llamarse `URI con más errores`, no `URL más lentas`.

---

# Fase 10: configuración de la alerta

La alerta mínima debe detectar cinco o más errores HTTP `500` durante cinco
minutos.

## Consulta para datos en tiempo real

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

La consulta devuelve un resultado únicamente cuando se cumple la condición.

## Consulta con contexto adicional

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats
    count as errores_500
    dc(host) as hosts_afectados
    values(uri) as uri_afectadas
```

Si la cantidad de URI es muy elevada, evita acumular demasiados valores con
`values(uri)` o limita la consulta:

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count as errores_500 by host uri
| sort - errores_500
| head 10
```

## Consulta para datos históricos

Si el dataset contiene eventos del 1 de enero de 2026, utiliza:

```spl
index=curso earliest="01/01/2026:00:00:00"
          latest="01/01/2026:00:10:00"
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

Esta consulta sirve para probar la lógica. No representa una alerta operativa en
tiempo real si los eventos no están llegando actualmente.

## Configuración que debe documentarse

- nombre de la alerta;
- propietario;
- aplicación;
- consulta;
- frecuencia;
- intervalo;
- condición;
- acción;
- destinatario;
- throttling;
- resultado de la prueba;
- procedimiento posterior.

## Riesgo de alertas repetidas

Una alerta que consulta continuamente los últimos cinco minutos puede dispararse
varias veces mientras los mismos eventos siguen dentro de la ventana.

Para reducir el ruido, documenta:

- frecuencia de ejecución;
- duración del throttling;
- agrupación por host o URI;
- responsable de la investigación;
- criterio de recuperación.

Una alerta técnicamente correcta, pero excesivamente ruidosa, pierde valor
operativo.

---

# Fase 11: interpretación de resultados

La interpretación debe diferenciar entre observación y conclusión.

## Observación

> Se observaron 20 respuestas HTTP `500` entre las 10:05 y las 10:07.

## Conclusión prudente

> Existe una concentración temporal de respuestas HTTP `500` que justifica revisar
> los logs de aplicación y la disponibilidad del servicio durante ese intervalo.

## Conclusión no demostrada

> La base de datos provocó el incidente.

La última afirmación no puede realizarse únicamente con el dataset web, salvo que
también existan eventos de base de datos que permitan relacionar ambos hechos.

## Plantilla de análisis final

```markdown
### Volumen

Se observaron __ eventos durante el intervalo __.

### Errores

Se identificaron __ errores, equivalentes al __ % del total.

### Concentración

La URI/host/IP con mayor número de errores fue __.

### Evolución temporal

Los errores se concentraron entre __ y __.

### Rendimiento

El tiempo medio fue __ y el percentil 95 fue __.
Si no existe latencia, indicar que no se pudo calcular.

### Alerta

La condición configurada detecta __ errores HTTP 500 en __ minutos.

### Limitaciones

El dataset no contiene __, por lo que no se puede concluir __.

### Recomendación

El siguiente paso recomendado es __.
```

---

# Fase 12: entregables del caso

Debes presentar:

- búsquedas SPL utilizadas;
- búsquedas guardadas;
- dos reportes;
- dashboard;
- filtros;
- configuración de la alerta;
- capturas;
- explicación de los resultados;
- limitaciones;
- problemas encontrados;
- soluciones aplicadas.

## Evidencias mínimas

### Evidencia 1: datos disponibles

```spl
index=curso earliest=0 latest=now
| stats count
```

### Evidencia 2: metadatos

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
```

### Evidencia 3: rango temporal

```spl
index=curso earliest=0 latest=now
| stats min(_time) as inicio max(_time) as fin
```

### Evidencia 4: análisis de errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by status_num uri
| sort - errores
```

### Evidencia 5: dashboard

Captura en la que se vean:

- indicadores;
- gráficos;
- tablas;
- filtros;
- intervalo temporal.

### Evidencia 6: alerta

Captura o documentación de:

- nombre;
- consulta;
- frecuencia;
- condición;
- acción;
- prueba realizada.

---

# Resultado esperado

Al finalizar el caso debes poder responder:

- cuántas peticiones se observaron;
- qué códigos HTTP predominan;
- qué porcentaje de eventos son errores;
- qué URI concentra más errores;
- qué host concentra más errores;
- qué IP genera más errores, si el campo existe;
- qué URL es más lenta, si existe un campo de duración;
- cuándo aparecen los errores;
- qué condición justifica una alerta;
- qué información adicional necesita el equipo para continuar la investigación.

Toda conclusión debe estar respaldada por una búsqueda SPL.

El resultado no tiene que afirmar que la aplicación está completamente sana o
completamente fallida. Debe explicar qué muestran los datos, qué no muestran y cuál
es la siguiente acción razonable.

---

# Criterios de finalización

El caso se considera completado cuando:

- [ ] Se ha confirmado el índice.
- [ ] Se ha validado la ingesta.
- [ ] Se ha revisado el rango temporal.
- [ ] Se han comprobado los campos.
- [ ] Se ha calculado el volumen.
- [ ] Se han analizado los códigos HTTP.
- [ ] Se ha creado una serie temporal.
- [ ] Se han investigado URI y hosts.
- [ ] Se ha analizado IP si existe.
- [ ] Se ha analizado latencia si existe.
- [ ] Se han creado búsquedas reutilizables.
- [ ] Se han creado reportes.
- [ ] Se ha construido el dashboard.
- [ ] Se han añadido filtros.
- [ ] Se ha configurado la alerta.
- [ ] Se han documentado las limitaciones.
- [ ] Se han presentado conclusiones basadas en evidencia.

---

# Referencias oficiales

- [Splunk Enterprise Documentation](https://docs.splunk.com/Documentation/Splunk)
- [Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchapp)
- [Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)
- [`stats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Stats)
- [`eval`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Eval)
- [`timechart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart)
- [`where`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Where)
- [`fieldsummary`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fieldsummary)
- [Search optimization](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutsearchoptimization)
- [Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)
- [Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/IntroFrame)
- [Alerts](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Users and roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Knowledge objects](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)