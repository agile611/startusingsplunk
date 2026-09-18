# Plantillas de consultas

Ejemplos de consultas reutilizables para distintos escenarios.

Este documento contiene plantillas SPL preparadas para el laboratorio de
monitorización de aplicaciones web con Splunk Enterprise.

Las consultas utilizan como referencia:

```spl
index=curso
```

y los campos habituales:

```text
_time
host
source
sourcetype
method
status
uri
clientip
response_time
user_agent
bytes
referer
```

No todos los datasets contienen todos los campos. Antes de utilizar una plantilla,
comprueba la estructura real de los eventos:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

---

## 1. Cómo utilizar estas plantillas

Una plantilla debe adaptarse antes de guardarse como búsqueda, reporte, panel o
alerta.

Revisa siempre:

- índice;
- intervalo temporal;
- nombres de campos;
- unidades;
- umbrales;
- visualización;
- permisos;
- volumen de datos;
- limitaciones.

#### Estructura recomendada

```spl
index=curso earliest=-24h latest=now
| comando
| transformación
| agregación
| ordenación
```

#### Ejemplo

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

Esta consulta:

1. busca datos del índice `curso`;
2. limita el periodo a las últimas 24 horas;
3. convierte el código HTTP en número;
4. filtra errores;
5. agrupa por URI;
6. ordena de mayor a menor;
7. devuelve las diez URI principales.

---

## 2. Variables que deben sustituirse

Las plantillas utilizan valores que debes adaptar.

| Variable | Ejemplo | Uso |
|---|---|---|
| `<INDICE>` | `curso` | Índice de búsqueda |
| `<HOST>` | `web-01` | Host concreto |
| `<STATUS>` | `500` | Código HTTP |
| `<URI>` | `/api/users` | Recurso concreto |
| `<CAMPO_IP>` | `clientip` | IP de origen |
| `<CAMPO_LATENCIA>` | `response_time` | Tiempo de respuesta |
| `<INTERVALO>` | `-24h` | Tiempo inicial |
| `<UMBRAL>` | `5` | Valor para alertas |
| `<SPAN>` | `1m` | Agrupación temporal |

Ejemplo genérico:

```spl
index=<INDICE> earliest=<INTERVALO> latest=now
| stats count by host
```

Ejemplo adaptado:

```spl
index=curso earliest=-24h latest=now
| stats count by host
```

---

## 3. Plantilla de validación inicial

Antes de realizar análisis, ejecuta estas consultas.

---

#### 3.1 Comprobar que existen eventos

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

###### Interpretación

- Si `total_eventos` es mayor que cero, el índice contiene eventos.
- Si el resultado es cero, revisa índice, tiempo e ingesta.
- Si el resultado es inesperadamente alto, revisa posibles duplicados.

---

#### 3.2 Comprobar el rango temporal

```spl
index=curso earliest=0 latest=now
| stats min(_time) as inicio max(_time) as fin
| eval inicio=strftime(inicio, "%Y-%m-%d %H:%M:%S")
| eval fin=strftime(fin, "%Y-%m-%d %H:%M:%S")
```

###### Interpretación

Esta consulta permite comprobar:

- primer evento;
- último evento;
- si el dataset es histórico;
- si los eventos están dentro del periodo esperado;
- si todos los eventos tienen el mismo timestamp.

---

#### 3.3 Revisar metadatos

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
| sort - count
```

###### Objetivo

Confirmar que los eventos llegan desde la fuente y el tipo de datos esperados.

---

#### 3.4 Revisar campos disponibles

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

###### Campos mínimos esperados

- `host`;
- `method`;
- `status`;
- `uri`.

###### Campos opcionales

- `clientip`;
- `src_ip`;
- `response_time`;
- `duration`;
- `user_agent`;
- `bytes`;
- `referer`.

---

#### 3.5 Revisar eventos originales

```spl
index=curso earliest=0 latest=now
| table _time _raw
| head 20
```

Esta consulta es imprescindible cuando los campos no aparecen como esperabas.

---

#### 3.6 Comprobar el retraso de ingesta

```spl
index=curso earliest=0 latest=now
| eval retraso_segundos=_indextime-_time
| stats
    avg(retraso_segundos) as media_retraso
    median(retraso_segundos) as mediana_retraso
    max(retraso_segundos) as maximo_retraso
```

Un retraso elevado puede ser normal si se cargan datos históricos.

---

## 4. Plantillas de volumen

---

#### 4.1 Volumen total de eventos

```spl
index=curso earliest=-24h latest=now
| stats count as total_eventos
```

###### Uso

- panel de total de eventos;
- validación rápida;
- indicador principal;
- comprobación de ingesta.

---

#### 4.2 Peticiones por host

```spl
index=curso earliest=-24h latest=now
| stats count as peticiones by host
| sort - peticiones
```

###### Preguntas que responde

- ¿Qué host genera más tráfico?
- ¿Hay hosts sin actividad?
- ¿Existe un host inesperado?
- ¿La distribución es equilibrada?

---

#### 4.3 Peticiones por método

```spl
index=curso earliest=-24h latest=now
| eval metodo=upper(trim(method))
| stats count as peticiones by metodo
| sort - peticiones
```

###### Uso

Permite identificar la distribución entre:

- `GET`;
- `POST`;
- `PUT`;
- `PATCH`;
- `DELETE`;
- otros métodos.

---

#### 4.4 Peticiones por URI

```spl
index=curso earliest=-24h latest=now
| stats count as peticiones by uri
| sort - peticiones
| head 10
```

###### Uso

- ranking de recursos;
- identificación de endpoints más utilizados;
- selección de URI para investigación.

---

#### 4.5 Peticiones por minuto

```spl
index=curso earliest=-24h latest=now
| timechart span=1m count as peticiones
```

###### Variantes de intervalo

```spl
| timechart span=1m count
```

```spl
| timechart span=5m count
```

```spl
| timechart span=1h count
```

Selecciona el intervalo según el volumen de datos y la duración del análisis.

---

#### 4.6 Peticiones por host y minuto

```spl
index=curso earliest=-24h latest=now
| timechart span=1m count by host
```

###### Uso

Permite detectar:

- hosts con menor actividad;
- caídas parciales;
- distribución desigual;
- picos localizados.

---

## 5. Plantillas de códigos HTTP

---

#### 5.1 Distribución de códigos

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(trim(status))
| stats count as peticiones by status_num
| sort status_num
```

---

#### 5.2 Clasificar por familia HTTP

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(trim(status))
| eval familia_http=case(
    status_num>=500, "5xx",
    status_num>=400, "4xx",
    status_num>=300, "3xx",
    status_num>=200, "2xx",
    true(), "otro"
)
| stats count as peticiones by familia_http
| sort familia_http
```

---

#### 5.3 Solo respuestas correctas

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=200 AND status_num<400
| stats count as respuestas_correctas
```

---

#### 5.4 Todos los errores HTTP

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores
```

---

#### 5.5 Errores `4xx`

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400 AND status_num<500
| stats count as errores_4xx
```

---

#### 5.6 Errores `5xx`

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=500 AND status_num<600
| stats count as errores_5xx
```

---

#### 5.7 Códigos HTTP concretos

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num IN (400, 401, 403, 404)
| stats count as errores by status_num
| sort - errores
```

---

#### 5.8 Respuestas HTTP 500

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count as errores_500 by host uri
| sort - errores_500
```

---

## 6. Plantillas de errores

---

#### 6.1 Porcentaje de error global

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| stats
    count as total
    count(eval(status_num>=400)) as errores
| eval porcentaje_error=if(
    total>0,
    round(errores*100/total, 2),
    0
)
| table total errores porcentaje_error
```

###### Interpretación

El porcentaje se calcula como:

```text
errores / total de peticiones × 100
```

La definición de error debe documentarse. En esta plantilla, `4xx` y `5xx` se
consideran errores.

---

#### 6.2 Porcentaje de errores `5xx`

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| stats
    count as total
    count(eval(status_num>=500 AND status_num<600)) as errores_5xx
| eval porcentaje_5xx=if(
    total>0,
    round(errores_5xx*100/total, 2),
    0
)
| table total errores_5xx porcentaje_5xx
```

---

#### 6.3 Errores por host

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| sort - errores
```

---

#### 6.4 Errores por URI

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

---

#### 6.5 Porcentaje de error por host

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| stats
    count as peticiones
    count(eval(status_num>=400)) as errores
    by host
| eval porcentaje_error=if(
    peticiones>0,
    round(errores*100/peticiones, 2),
    0
)
| sort - porcentaje_error
```

###### Interpretación

No confundas:

- número absoluto de errores;
- porcentaje de error.

Un host con más tráfico puede tener más errores absolutos, pero un porcentaje menor.

---

#### 6.6 Porcentaje de error por URI

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| stats
    count as peticiones
    count(eval(status_num>=400)) as errores
    by uri
| eval porcentaje_error=if(
    peticiones>0,
    round(errores*100/peticiones, 2),
    0
)
| sort - porcentaje_error
| head 10
```

Conviene añadir el volumen total para no sobreinterpretar porcentajes calculados
sobre una muestra muy pequeña.

---

#### 6.7 Evolución de errores

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| timechart span=1m count as errores
```

---

#### 6.8 Correctas frente a errores

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| eval resultado=if(status_num>=400, "Error", "Correcta")
| timechart span=1m count by resultado
```

---

#### 6.9 Evolución de familias HTTP

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| eval familia_http=case(
    status_num>=500, "5xx",
    status_num>=400, "4xx",
    status_num>=300, "3xx",
    status_num>=200, "2xx",
    true(), "otro"
)
| timechart span=5m count by familia_http
```

---

## 7. Plantillas de URI y endpoints

---

#### 7.1 URI con más peticiones

```spl
index=curso earliest=-24h latest=now
| stats count as peticiones by uri
| sort - peticiones
| head 10
```

---

#### 7.2 URI con más errores `5xx`

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=500
| stats count as errores_5xx by uri
| sort - errores_5xx
| head 10
```

---

#### 7.3 URI de API

```spl
index=curso earliest=-24h latest=now
| where like(uri, "/api/%")
| stats count as peticiones_api by uri
| sort - peticiones_api
| head 10
```

---

#### 7.4 URI fuera de la API

```spl
index=curso earliest=-24h latest=now
| where NOT like(uri, "/api/%")
| stats count as peticiones_web by uri
| sort - peticiones_web
| head 10
```

---

#### 7.5 Eliminar parámetros de consulta

Para agrupar:

```text
/search?q=splunk
/search?q=linux
```

como el mismo recurso:

```spl
index=curso earliest=-24h latest=now
| eval uri_base=replace(uri, "\?.*$", "")
| stats count as peticiones by uri_base
| sort - peticiones
| head 10
```

---

#### 7.6 Extraer el primer nivel de la URI

```spl
index=curso earliest=-24h latest=now
| rex field=uri "^/(?<recurso_principal>[^/]+)"
| stats count as peticiones by recurso_principal
| sort - peticiones
```

---

#### 7.7 URI con códigos específicos

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num IN (401, 403, 404)
| stats count as errores by uri status_num
| sort - errores
```

---

#### 7.8 Comparar peticiones y errores por URI

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| stats
    count as peticiones
    count(eval(status_num>=400)) as errores
    by uri
| eval porcentaje_error=if(
    peticiones>0,
    round(errores*100/peticiones, 2),
    0
)
| sort - errores
| head 10
```

---

## 8. Plantillas de host

---

#### 8.1 Hosts activos

```spl
index=curso earliest=-24h latest=now
| stats count as peticiones by host
| sort - peticiones
```

---

#### 8.2 Hosts con errores

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| sort - errores
```

---

#### 8.3 Hosts con HTTP 500

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count as errores_500 by host
| sort - errores_500
```

---

#### 8.4 Comparativa de hosts

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| stats
    count as peticiones
    count(eval(status_num>=400)) as errores
    count(eval(status_num=500)) as errores_500
    by host
| eval porcentaje_error=if(
    peticiones>0,
    round(errores*100/peticiones, 2),
    0
)
| sort - porcentaje_error
```

---

#### 8.5 Host concreto

```spl
index=curso earliest=-24h latest=now
| search host="web-01"
| stats count as peticiones
```

---

#### 8.6 Comparar varios hosts

```spl
index=curso earliest=-24h latest=now
| search host IN ("web-01", "web-02")
| stats count as peticiones by host
```

---

#### 8.7 Evolución por host

```spl
index=curso earliest=-24h latest=now
| timechart span=5m count by host
```

---

## 9. Plantillas por IP

Estas consultas requieren un campo como `clientip`, `src_ip` o equivalente.

---

#### 9.1 Normalizar el campo de IP

```spl
index=curso earliest=-24h latest=now
| eval ip_origen=coalesce(clientip, src_ip, source_ip)
| stats count as peticiones by ip_origen
| sort - peticiones
```

---

#### 9.2 IP con más errores

```spl
index=curso earliest=-24h latest=now
| eval ip_origen=coalesce(clientip, src_ip, source_ip)
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by ip_origen
| sort - errores
| head 10
```

---

#### 9.3 Peticiones, errores y porcentaje por IP

```spl
index=curso earliest=-24h latest=now
| eval ip_origen=coalesce(clientip, src_ip, source_ip)
| eval status_num=tonumber(status)
| stats
    count as peticiones
    count(eval(status_num>=400)) as errores
    by ip_origen
| eval porcentaje_error=if(
    peticiones>0,
    round(errores*100/peticiones, 2),
    0
)
| sort - porcentaje_error
```

---

#### 9.4 IP con cinco o más errores en cinco minutos

```spl
index=curso earliest=-5m latest=now
| eval ip_origen=coalesce(clientip, src_ip, source_ip)
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by ip_origen
| where errores>=5
| sort - errores
```

---

#### 9.5 IP con muchos HTTP 500

```spl
index=curso earliest=-24h latest=now
| eval ip_origen=coalesce(clientip, src_ip, source_ip)
| eval status_num=tonumber(status)
| where status_num=500
| stats count as errores_500 by ip_origen
| sort - errores_500
```

---

#### 9.6 Ausencia de IP

Si no existe ningún campo de IP:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Documenta:

> El dataset no contiene una IP de origen. No se puede construir un ranking fiable
> por cliente. Como alternativa, se utiliza `host`.

Consulta alternativa:

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| sort - errores
```

---

## 10. Plantillas de latencia

Estas consultas requieren un campo como `response_time`, `duration` o `latency`.

---

#### 10.1 Normalizar el campo de latencia

```spl
index=curso earliest=-24h latest=now
| eval tiempo_ms=coalesce(
    tonumber(response_time),
    tonumber(duration),
    tonumber(latency)
)
| table _time uri tiempo_ms
| head 20
```

Si los campos utilizan unidades diferentes, no los combines sin convertirlos.

---

#### 10.2 Latencia media por URI

```spl
index=curso earliest=-24h latest=now
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(tiempo_ms)
| stats avg(tiempo_ms) as media_ms by uri
| eval media_ms=round(media_ms, 2)
| sort - media_ms
```

---

#### 10.3 Mediana y percentiles

```spl
index=curso earliest=-24h latest=now
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(tiempo_ms)
| stats
    avg(tiempo_ms) as media_ms
    median(tiempo_ms) as mediana_ms
    perc95(tiempo_ms) as p95_ms
    perc99(tiempo_ms) as p99_ms
    max(tiempo_ms) as maximo_ms
    by uri
| eval media_ms=round(media_ms, 2)
| eval mediana_ms=round(mediana_ms, 2)
| eval p95_ms=round(p95_ms, 2)
| eval p99_ms=round(p99_ms, 2)
| sort - p95_ms
```

---

#### 10.4 Respuestas superiores a un segundo

```spl
index=curso earliest=-24h latest=now
| eval tiempo_ms=tonumber(response_time)
| where tiempo_ms>1000
| stats count as respuestas_lentas by uri
| sort - respuestas_lentas
```

---

#### 10.5 Evolución de la latencia

```spl
index=curso earliest=-24h latest=now
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(tiempo_ms)
| timechart
    span=5m
    avg(tiempo_ms) as media_ms
    perc95(tiempo_ms) as p95_ms
```

---

#### 10.6 URI por encima del percentil 95 global

```spl
index=curso earliest=-24h latest=now
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(tiempo_ms)
| eventstats perc95(tiempo_ms) as p95_global
| where tiempo_ms>p95_global
| table _time host uri tiempo_ms p95_global
| sort - tiempo_ms
```

---

#### 10.7 Ausencia de latencia

Si no existe un campo de latencia, utiliza:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Documenta:

> No se dispone de un campo de duración. No es posible determinar qué URI es
> más lenta. Se utiliza como alternativa la URI con mayor número de errores.

---

## 11. Plantillas de calidad de datos

---

#### 11.1 Códigos HTTP no numéricos

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(trim(status))
| where isnull(status_num)
| table _time host status uri _raw
```

---

#### 11.2 Códigos HTTP fuera de rango

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(trim(status))
| where status_num<100 OR status_num>599
| table _time host status status_num uri
```

---

#### 11.3 URI vacía

```spl
index=curso earliest=-24h latest=now
| where isnull(uri) OR trim(uri)=""
| table _time host method status uri _raw
```

---

#### 11.4 Método vacío

```spl
index=curso earliest=-24h latest=now
| where isnull(method) OR trim(method)=""
| table _time host method status uri _raw
```

---

#### 11.5 Latencia no numérica

```spl
index=curso earliest=-24h latest=now
| eval tiempo_ms=tonumber(trim(response_time))
| where isnotnull(response_time) AND isnull(tiempo_ms)
| table _time uri response_time _raw
```

---

#### 11.6 Resumen de calidad

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(trim(status))
| eval tiempo_ms=tonumber(trim(response_time))
| eval falta_uri=if(isnull(uri) OR trim(uri)="", 1, 0)
| eval falta_method=if(isnull(method) OR trim(method)="", 1, 0)
| eval status_invalido=if(
    isnull(status_num) OR status_num<100 OR status_num>599,
    1,
    0
)
| eval latencia_invalida=if(
    isnotnull(response_time) AND isnull(tiempo_ms),
    1,
    0
)
| stats
    count as total_eventos
    sum(falta_uri) as eventos_sin_uri
    sum(falta_method) as eventos_sin_method
    sum(status_invalido) as eventos_status_invalido
    sum(latencia_invalida) as eventos_latencia_invalida
```

---

#### 11.7 Porcentaje de registros incompletos

```spl
index=curso earliest=-24h latest=now
| eval incompleto=if(
    isnull(host)
    OR isnull(method)
    OR isnull(status)
    OR isnull(uri),
    1,
    0
)
| stats
    count as total
    sum(incompleto) as incompletos
| eval porcentaje_incompletos=if(
    total>0,
    round(incompletos*100/total, 2),
    0
)
```

---

## 12. Plantillas para dashboards

Los tokens exactos pueden variar según el tipo de dashboard. Las consultas
siguientes muestran la lógica de los paneles.

---

#### 12.1 Total de peticiones

```spl
index=curso earliest=-24h latest=now
| stats count as peticiones
```

Visualización recomendada:

```text
Single value
```

---

#### 12.2 Total de errores

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num>=400)) as errores
```

---

#### 12.3 Porcentaje de error

```spl
index=curso earliest=-24h latest=now
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

---

#### 12.4 Tráfico temporal

```spl
index=curso earliest=-24h latest=now
| timechart span=1m count as peticiones
```

---

#### 12.5 Errores por código

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by status_num
| sort status_num
```

---

#### 12.6 Host con más errores

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| sort - errores
| head 10
```

---

#### 12.7 URI con más errores

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

---

#### 12.8 Panel de últimos eventos

```spl
index=curso earliest=-15m latest=now
| table _time host method status uri
| sort - _time
| head 25
```

---

#### 12.9 Filtro por host

Consulta conceptual:

```spl
index=curso earliest=$time.earliest$ latest=$time.latest$
host="$host$"
| stats count as peticiones
```

Si se implementa una opción `Todos`, la consulta debe configurarse para no
restringir los resultados cuando el token tenga ese valor.

---

## 13. Plantillas para reportes

---

#### 13.1 Reporte de errores por URI

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats
    count as errores
    dc(host) as hosts_afectados
    values(status_num) as codigos
    by uri
| sort - errores
| head 20
```

###### Documentación recomendada

```text
Nombre:
    Errores por URI

Audiencia:
    Equipo de operaciones y desarrollo

Frecuencia:
    Cada 15 minutos / según el diseño del laboratorio

Intervalo:
    Últimas 24 horas

Finalidad:
    Identificar recursos con mayor concentración de errores
```

---

#### 13.2 Reporte de evolución del tráfico

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| eval resultado=if(status_num>=400, "Error", "Correcta")
| timechart span=5m count by resultado
```

###### Documentación recomendada

```text
Nombre:
    Evolución del tráfico y errores

Audiencia:
    Operaciones

Frecuencia:
    Cada hora / según el diseño del laboratorio

Finalidad:
    Observar volumen y evolución de errores
```

---

#### 13.3 Reporte de hosts degradados

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| stats
    count as peticiones
    count(eval(status_num>=400)) as errores
    by host
| eval porcentaje_error=if(
    peticiones>0,
    round(errores*100/peticiones, 2),
    0
)
| where porcentaje_error>=5
| sort - porcentaje_error
```

---

## 14. Plantillas para alertas

---

#### 14.1 Cinco HTTP 500 en cinco minutos

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

Esta es la alerta principal del proyecto.

---

#### 14.2 Cinco errores de servidor en cinco minutos

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num>=500)) as errores_5xx
| where errores_5xx>=5
```

---

#### 14.3 Host con demasiados errores

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| where errores>=5
| sort - errores
```

---

#### 14.4 URI con demasiados errores

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| where errores>=5
| sort - errores
```

---

#### 14.5 Porcentaje de error elevado

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats
    count as total
    count(eval(status_num>=400)) as errores
| eval porcentaje_error=if(
    total>0,
    round(errores*100/total, 2),
    0
)
| where porcentaje_error>=10
```

El umbral del 10 % es didáctico. Debe ajustarse según el comportamiento esperado.

---

#### 14.6 Percentil 95 de latencia elevado

```spl
index=curso earliest=-5m latest=now
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(tiempo_ms)
| stats perc95(tiempo_ms) as p95_ms
| where p95_ms>1000
```

Esta alerta solo es válida si:

- existe `response_time`;
- la unidad está documentada;
- hay suficientes eventos;
- el umbral está justificado.

---

## 15. Plantillas de troubleshooting

---

#### 15.1 El índice no devuelve eventos

```spl
index=curso earliest=0 latest=now
| stats count
```

Si el resultado es cero, ejecuta:

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype disabled
```

Después revisa:

```spl
index=_internal earliest=-30m latest=now
| search log_level=error OR log_level=warn
| table _time host component log_level message
| sort - _time
```

---

#### 15.2 Revisar fuentes activas

```spl
index=curso earliest=0 latest=now
| stats count by source sourcetype
| sort - count
```

---

#### 15.3 Revisar hosts inesperados

```spl
index=curso earliest=0 latest=now
| stats count by host
| sort - count
```

---

#### 15.4 Revisar eventos recientes

```spl
index=curso earliest=-15m latest=now
| table _time host method status uri source sourcetype
| sort - _time
| head 50
```

---

#### 15.5 Revisar timestamps anómalos

```spl
index=curso earliest=0 latest=now
| stats
    min(_time) as minimo
    max(_time) as maximo
    dc(strftime(_time, "%Y-%m-%d")) as dias_distintos
```

---

#### 15.6 Revisar valores de `status`

```spl
index=curso earliest=0 latest=now
| stats count by status
| sort - count
```

---

#### 15.7 Revisar duplicados potenciales

```spl
index=curso earliest=0 latest=now
| stats count as repeticiones by _time host method status uri
| where repeticiones>1
| sort - repeticiones
```

Esta consulta detecta posibles repeticiones, pero no demuestra que los eventos
sean duplicados reales.

---

#### 15.8 Comprobar permisos del usuario

```spl
| rest /services/authentication/current-context
| table username roles
```

---

## 16. Plantillas de comparación temporal

---

#### 16.1 Comparar tráfico por hora

```spl
index=curso earliest=-24h latest=now
| eval hora=strftime(_time, "%H")
| stats count as peticiones by hora
| sort hora
```

---

#### 16.2 Comparar errores por hora

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| eval hora=strftime(_time, "%H")
| stats count as errores by hora
| sort hora
```

---

#### 16.3 Evolución diaria

```spl
index=curso earliest=-7d latest=now
| timechart span=1d count as peticiones
```

---

#### 16.4 Evolución diaria de errores

```spl
index=curso earliest=-7d latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| timechart span=1d count as errores
```

---

## 17. Plantillas de indicadores operativos

---

#### 17.1 Estado global de la aplicación

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| stats
    count as peticiones
    count(eval(status_num>=400)) as errores
| eval porcentaje_error=if(
    peticiones>0,
    round(errores*100/peticiones, 2),
    0
)
| eval estado=case(
    porcentaje_error>=10, "Crítico",
    porcentaje_error>=5, "Degradado",
    true(), "Normal"
)
| table peticiones errores porcentaje_error estado
```

---

#### 17.2 Estado por host

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| stats
    count as peticiones
    count(eval(status_num>=400)) as errores
    by host
| eval porcentaje_error=if(
    peticiones>0,
    round(errores*100/peticiones, 2),
    0
)
| eval estado=case(
    porcentaje_error>=10, "Crítico",
    porcentaje_error>=5, "Degradado",
    true(), "Normal"
)
| sort - porcentaje_error
```

---

#### 17.3 Resumen operativo por URI

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| stats
    count as peticiones
    count(eval(status_num>=400)) as errores
    count(eval(status_num=500)) as errores_500
    by uri
| eval porcentaje_error=if(
    peticiones>0,
    round(errores*100/peticiones, 2),
    0
)
| sort - errores
| head 20
```

---

## 18. Plantilla de consulta histórica para pruebas

Cuando el dataset contiene datos históricos, utiliza fechas absolutas.

```spl
index=curso
earliest="01/01/2026:00:00:00"
latest="01/01/2026:01:00:00"
| stats count by status
```

No utilices una ventana relativa si los eventos no son recientes:

```spl
index=curso earliest=-5m latest=now
```

La búsqueda relativa solo funcionará si `_time` de los eventos está dentro de los
últimos cinco minutos.

---

## 19. Plantilla de consulta operativa en tiempo real

Para búsquedas operativas o alertas:

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| where status_num>=500
| stats count as errores_5xx
```

La consulta debe ejecutarse con una frecuencia coherente con el intervalo.

Ejemplo:

```text
Intervalo analizado: 5 minutos
Frecuencia de ejecución: cada 1 minuto
```

Evita intervalos y frecuencias que generen huecos o duplicación excesiva.

---

## 20. Plantilla de búsqueda con filtros opcionales

#### Filtro por host

```spl
index=curso earliest=-24h latest=now
| search host="$host$"
| stats count as peticiones
```

Esta versión requiere que el token siempre tenga un valor válido.

#### Filtro con opción `Todos`

Una estrategia habitual consiste en aplicar el filtro solo si el valor no es
`Todos`:

```spl
index=curso earliest=-24h latest=now
| where "$host$"="Todos" OR host="$host$"
| stats count as peticiones
```

La implementación concreta depende de cómo se haya creado el control del
dashboard.

---

## 21. Plantilla con múltiples filtros

```spl
index=curso earliest=$time.earliest$ latest=$time.latest$
| where "$host$"="Todos" OR host="$host$"
| where "$status$"="Todos" OR status="$status$"
| stats count as peticiones
```

Antes de guardar esta consulta, prueba:

- host `Todos`;
- un host concreto;
- status `Todos`;
- status `500`;
- combinación sin resultados;
- rango temporal amplio;
- rango temporal corto.

---

## 22. Plantilla con clasificación de resultados

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| eval resultado=case(
    status_num=500, "Error interno",
    status_num>=500, "Error servidor",
    status_num>=400, "Error cliente",
    status_num>=300, "Redirección",
    status_num>=200, "Correcta",
    true(), "Desconocida"
)
| stats count as peticiones by resultado
| sort - peticiones
```

---

## 23. Plantilla de consulta documentada

Utiliza este formato en los entregables.

```markdown
#### Nombre de la consulta

###### Objetivo

Describir la pregunta que se quiere responder.

###### Índice

```text
curso
```

###### Intervalo temporal

```text
Últimas 24 horas
```

###### SPL

```spl
index=curso earliest=-24h latest=now
| stats count by host
```

###### Campos utilizados

- host

###### Resultado esperado

Una tabla con el número de eventos por host.

###### Interpretación

Explicar qué significa el resultado.

###### Limitaciones

Indicar campos ausentes, muestra pequeña o posibles sesgos.

###### Uso previsto

- búsqueda;
- reporte;
- dashboard;
- alerta.

###### Fecha de validación

Completar.
```

---

## 24. Plantilla de consulta para un reporte

```markdown
#### Reporte: errores por URI

###### Finalidad

Identificar los recursos que concentran más errores.

###### Consulta

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 20
```

###### Audiencia

Equipo de operaciones y desarrollo.

###### Frecuencia

Cada 15 minutos.

###### Retención

Completar.

###### Permisos

Lectura para usuarios operativos.
Edición limitada al propietario o administrador.

###### Limitaciones

El número absoluto de errores no representa por sí solo el porcentaje de error.
```

---

## 25. Plantilla de consulta para un panel

```markdown
#### Panel: errores HTTP por código

###### Objetivo

Mostrar la distribución de códigos HTTP erróneos.

###### SPL

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by status_num
| sort status_num
```

###### Visualización

Gráfico de barras.

###### Eje horizontal

status_num

###### Eje vertical

errores

###### Filtro temporal

Sí.

###### Resultado esperado

Una barra por cada código HTTP con errores.

###### Limitaciones

No muestra la causa raíz de los errores.
```

---

## 26. Plantilla de consulta para una alerta

```markdown
#### Alerta: cinco HTTP 500 en cinco minutos

###### Objetivo

Detectar un incremento de errores internos del servidor.

###### SPL

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

###### Condición

```text
errores_500 >= 5
```

###### Frecuencia

Completar.

###### Acción

Completar.

###### Throttling

Completar.

###### Prueba histórica

Completar.

###### Prueba reciente

Completar.

###### Limitaciones

- retraso de ingesta;
- duplicados;
- volumen sintético;
- timestamp histórico;
- datos insuficientes.
```

---

## 27. Ejercicios prácticos

#### Ejercicio 1: volumen

Ejecuta:

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

Documenta:

- número total;
- primer evento;
- último evento;
- periodo analizado.

---

#### Ejercicio 2: errores por URI

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
```

Responde:

- ¿Qué URI tiene más errores?
- ¿Qué código aparece con mayor frecuencia?
- ¿La URI también tiene muchas peticiones correctas?

---

#### Ejercicio 3: porcentaje por host

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats
    count as peticiones
    count(eval(status_num>=400)) as errores
    by host
| eval porcentaje_error=if(
    peticiones>0,
    round(errores*100/peticiones, 2),
    0
)
| sort - porcentaje_error
```

Responde:

- ¿Qué host tiene mayor porcentaje?
- ¿Qué host tiene más errores absolutos?
- ¿Coinciden ambos rankings?

---

#### Ejercicio 4: evolución temporal

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval tipo=if(status_num>=400, "Error", "Correcta")
| timechart span=1m count by tipo
```

Responde:

- ¿Cuándo aparecen los errores?
- ¿Coinciden con mayor volumen?
- ¿Hay periodos sin datos?

---

#### Ejercicio 5: calidad de datos

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval falta_uri=if(isnull(uri) OR trim(uri)="", 1, 0)
| eval status_invalido=if(
    isnull(status_num) OR status_num<100 OR status_num>599,
    1,
    0
)
| stats
    count as total
    sum(falta_uri) as sin_uri
    sum(status_invalido) as status_invalidos
```

Responde:

- ¿Hay campos ausentes?
- ¿Hay códigos inválidos?
- ¿El dataset es adecuado para crear la alerta?

---

#### Ejercicio 6: alerta

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

Responde:

- ¿La búsqueda devuelve resultados?
- ¿Los eventos son recientes?
- ¿Se ha probado la alerta de forma manual?
- ¿Qué mecanismo de throttling utilizarías?

---

## 28. Buenas prácticas para reutilizar consultas

#### Mantener el índice explícito

Recomendado:

```spl
index=curso earliest=-24h latest=now
```

Evita:

```spl
index=*
```

salvo en tareas de diagnóstico.

#### Mantener el tiempo explícito

No dependas exclusivamente del selector visual de tiempo si la consulta se va a
guardar como reporte o alerta.

#### Convertir los valores numéricos

```spl
| eval status_num=tonumber(status)
```

```spl
| eval tiempo_ms=tonumber(response_time)
```

#### Proteger las divisiones

```spl
| eval porcentaje=if(total>0, errores*100/total, 0)
```

#### Evitar campos inexistentes

Comprueba:

```spl
| fieldsummary
```

#### Utilizar nombres claros

Recomendado:

```spl
errores_500
porcentaje_error
tiempo_ms
p95_ms
```

Evita:

```spl
x
y
resultado1
```

#### Limitar rankings

```spl
| sort - errores
| head 10
```

#### Documentar unidades

Indica si la latencia está expresada en:

- milisegundos;
- segundos;
- microsegundos.

#### Validar antes de guardar

Ejecuta primero la búsqueda manualmente y revisa:

- resultados;
- volumen;
- errores;
- campos;
- tiempo de respuesta;
- interpretación.

---

## 29. Checklist de consultas

#### Preparación

- [ ] El índice es correcto.
- [ ] El rango temporal es adecuado.
- [ ] Los campos existen.
- [ ] Las unidades están documentadas.
- [ ] Se conocen las limitaciones.

#### Construcción

- [ ] La búsqueda responde una pregunta concreta.
- [ ] Los campos numéricos se convierten.
- [ ] Los valores nulos se tratan.
- [ ] Las divisiones entre cero están protegidas.
- [ ] Los nombres son descriptivos.
- [ ] Se limita la cantidad de resultados cuando procede.

#### Validación

- [ ] La consulta se ejecuta manualmente.
- [ ] Los resultados son razonables.
- [ ] Se ha comprobado el rango temporal.
- [ ] Se han revisado eventos de ejemplo.
- [ ] Se han comparado los resultados con el dataset original.

#### Publicación

- [ ] Tiene título claro.
- [ ] Tiene descripción.
- [ ] Tiene propietario.
- [ ] Tiene permisos adecuados.
- [ ] Se ha indicado si es búsqueda, reporte, panel o alerta.
- [ ] Se han documentado las limitaciones.

---

## 30. Referencias oficiales

- [Splunk Enterprise Documentation](https://docs.splunk.com/Documentation/Splunk)
- [Splunk Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchapp)
- [Splunk Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)
- [Comando `stats`](https://help.splunk.com/en/splunk-cloud-platform/spl-search-reference/10.5.2605/search-commands/stats)
- [Comando `timechart`](https://help.splunk.com/en/splunk-cloud-platform/spl-search-reference/10.5.2605/search-commands/timechart)
- [Comando `eval`](https://docs.splunk.com/Documentation/Splunk/9.3.2/SearchReference/Eval)
- [Get Data In](https://docs.splunk.com/Documentation/Splunk/latest/Get%20started/Getdatain)
- [Monitor Files and Directories](https://docs.splunk.com/Documentation/Splunk/latest/Data/Monitorfilesanddirectories)
- [About Indexes](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Splunk Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)
- [About Alerts](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Users and Roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Splunk REST API Reference](https://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTprolog)
- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)