# Comandos SPL

Listado de comandos útiles para búsquedas y análisis.

Este documento sirve como guía práctica para aprender y utilizar el lenguaje SPL
en Splunk Enterprise.

Los ejemplos están adaptados al laboratorio del curso, que utiliza preferentemente:

```spl
index=curso
```

Las búsquedas deben ejecutarse desde:

```text
Search & Reporting
```

---

#### 1. Qué es SPL

SPL es el lenguaje de búsqueda de Splunk. Permite:

- localizar eventos;
- filtrar resultados;
- transformar campos;
- calcular métricas;
- agrupar eventos;
- crear series temporales;
- extraer información;
- comparar valores;
- preparar datos para dashboards;
- construir alertas;
- investigar incidentes.

Una búsqueda SPL suele comenzar con una búsqueda de eventos y continuar con una
cadena de comandos separados por el carácter de tubería:

```text
|
```

Ejemplo:

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
```

El flujo de esta búsqueda es:

```text
Buscar eventos
    ↓
Convertir status a número
    ↓
Filtrar errores
    ↓
Agrupar por URI
    ↓
Ordenar de mayor a menor
```

---

#### 2. Estructura general de una búsqueda

Una búsqueda suele tener estas partes:

```spl
index=curso
earliest=-24h
latest=now
| comando1
| comando2
| comando3
```

###### Índice

Indica dónde buscar:

```spl
index=curso
```

###### Tiempo inicial

Indica desde cuándo buscar:

```spl
earliest=-24h
```

###### Tiempo final

Indica hasta cuándo buscar:

```spl
latest=now
```

###### Comandos posteriores

Transforman o filtran los resultados:

```spl
| stats count by host
```

###### Ejemplo completo

```spl
index=curso earliest=-24h latest=now
| stats count as peticiones by host
| sort - peticiones
```

---

#### 3. Reglas básicas antes de empezar

Todas las búsquedas del proyecto deben:

- indicar el índice;
- definir un intervalo temporal;
- utilizar nombres reales de campos;
- evitar `index=*` salvo diagnóstico;
- convertir los valores numéricos cuando sea necesario;
- documentar el objetivo;
- ser reproducibles;
- explicar sus limitaciones.

###### Ejemplo recomendado

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host uri
| sort - errores
```

###### Ejemplo poco recomendable

```spl
index=*
| search error
| table *
```

Problemas del segundo ejemplo:

- busca en todos los índices;
- no define un rango temporal;
- depende de una palabra genérica;
- puede devolver demasiados eventos;
- no indica qué pregunta responde;
- puede utilizar muchos recursos;
- no permite interpretar fácilmente el resultado.

---

## 4. Búsqueda inicial de eventos

#### Ver eventos del índice

```spl
index=curso
```

#### Ver los primeros eventos

```spl
index=curso
| head 20
```

#### Ver eventos recientes

```spl
index=curso earliest=-15m latest=now
| head 20
```

#### Ver eventos históricos

```spl
index=curso earliest=0 latest=now
| head 20
```

El valor:

```spl
earliest=0
```

permite buscar eventos históricos disponibles en el índice.

No utilices `earliest=0` habitualmente en dashboards operativos si no es necesario.
Para un dashboard suele ser preferible un rango más limitado.

#### Mostrar el evento original

```spl
index=curso earliest=0 latest=now
| table _raw
| head 20
```

#### Mostrar campos internos importantes

```spl
index=curso earliest=0 latest=now
| table _time _indextime host source sourcetype _raw
| head 20
```

---

## 5. Campos internos de Splunk

Splunk añade campos internos a los eventos.

| Campo | Descripción |
|---|---|
| `_time` | Tiempo asignado al evento |
| `_indextime` | Momento en que el evento fue indexado |
| `_raw` | Evento original |
| `host` | Host asociado al evento |
| `source` | Fuente del evento |
| `sourcetype` | Tipo de fuente |
| `index` | Índice donde se encuentra el evento |
| `linecount` | Número de líneas del evento, cuando aplica |

#### Revisar el tiempo del evento

```spl
index=curso earliest=0 latest=now
| table _time _raw
| head 20
```

#### Comparar `_time` e `_indextime`

```spl
index=curso earliest=0 latest=now
| eval retraso_ingesta=_indextime-_time
| table _time _indextime retraso_ingesta host uri status
| head 20
```

Un retraso elevado puede ser normal si se cargan archivos históricos.

También puede indicar:

- retraso de entrega;
- problema de zona horaria;
- parsing incorrecto;
- datos generados antes de ser ingeridos.

#### Formatear `_time`

```spl
index=curso earliest=0 latest=now
| eval fecha=strftime(_time, "%Y-%m-%d %H:%M:%S")
| table fecha host method status uri
| head 20
```

---

## 6. Comando `search`

El comando `search` filtra eventos.

#### Filtrar por código HTTP

```spl
index=curso earliest=0 latest=now
| search status=500
```

#### Filtrar por host

```spl
index=curso earliest=0 latest=now
| search host=web-01
```

#### Filtrar por URI

```spl
index=curso earliest=0 latest=now
| search uri="/api/users"
```

#### Combinar condiciones

```spl
index=curso earliest=0 latest=now
| search status=500 host=web-01
```

#### Utilizar `OR`

```spl
index=curso earliest=0 latest=now
| search status=500 OR status=503
```

#### Utilizar paréntesis

```spl
index=curso earliest=0 latest=now
| search (status=500 OR status=503) host=web-01
```

#### Buscar una palabra

```spl
index=curso earliest=0 latest=now
| search "timeout"
```

#### Buscar en un campo concreto

```spl
index=curso earliest=0 latest=now
| search uri="/api/*"
```

Cuando sea posible, es preferible utilizar filtros específicos de campo.

---

## 7. Comando `where`

`where` filtra resultados utilizando expresiones.

Es especialmente útil después de crear campos con `eval`.

#### Filtrar códigos superiores o iguales a 400

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
```

#### Filtrar errores HTTP 500

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num=500
```

#### Filtrar por duración

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| where tiempo_ms>1000
```

#### Filtrar valores no nulos

```spl
index=curso earliest=0 latest=now
| where isnotnull(uri)
```

#### Filtrar valores nulos

```spl
index=curso earliest=0 latest=now
| where isnull(response_time)
```

#### Combinar condiciones

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=500 AND host="web-01"
```

#### Diferencia entre `search` y `where`

Utiliza `search` para filtros sencillos sobre eventos:

```spl
| search status=500
```

Utiliza `where` cuando necesites expresiones o cálculos:

```spl
| eval status_num=tonumber(status)
| where status_num>=400
```

---

## 8. Comando `table`

`table` selecciona los campos que quieres mostrar.

#### Mostrar campos concretos

```spl
index=curso earliest=0 latest=now
| table _time host method status uri
```

#### Mostrar campos calculados

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| table _time host status status_num uri
```

#### Tabla de eventos recientes

```spl
index=curso earliest=-1h latest=now
| table _time host method status uri
| sort - _time
| head 20
```

Evita utilizar:

```spl
| table *
```

cuando no sea necesario.

Una tabla con todos los campos puede ser difícil de leer y consumir más recursos.

---

## 9. Comando `fields`

`fields` incluye o excluye campos.

#### Mantener campos concretos

```spl
index=curso earliest=0 latest=now
| fields _time host status uri
```

#### Excluir un campo

```spl
index=curso earliest=0 latest=now
| fields - _raw
```

#### Diferencia entre `table` y `fields`

`table` está orientado a presentar una tabla final.

`fields` se utiliza para controlar los campos disponibles durante la búsqueda y
puede ayudar a reducir el volumen de datos procesados.

---

## 10. Comando `head`

`head` devuelve los primeros resultados.

#### Primeros diez eventos

```spl
index=curso earliest=0 latest=now
| head 10
```

#### Primeros resultados después de ordenar

```spl
index=curso earliest=0 latest=now
| stats count as errores by uri
| sort - errores
| head 10
```

En este caso, `head` devuelve las diez URI con más errores.

---

## 11. Comando `tail`

`tail` devuelve los últimos resultados.

```spl
index=curso earliest=0 latest=now
| sort _time
| tail 10
```

Para ver los eventos más recientes, suele ser más claro:

```spl
index=curso earliest=-1h latest=now
| sort - _time
| head 10
```

---

## 12. Comando `sort`

`sort` ordena resultados.

#### Orden ascendente

```spl
index=curso earliest=0 latest=now
| stats count as peticiones by host
| sort peticiones
```

#### Orden descendente

```spl
index=curso earliest=0 latest=now
| stats count as peticiones by host
| sort - peticiones
```

#### Ordenar por varios campos

```spl
index=curso earliest=0 latest=now
| stats count as errores by host uri
| sort - errores host uri
```

#### Ordenar por latencia

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| stats avg(tiempo_ms) as media_ms by uri
| sort - media_ms
```

---

## 13. Comando `eval`

`eval` crea campos calculados y transforma valores.

#### Convertir un campo a número

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
```

#### Crear una bandera de error

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval es_error=if(status_num>=400, 1, 0)
```

#### Crear una bandera de HTTP 500

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval es_500=if(status_num=500, 1, 0)
```

#### Crear una clasificación HTTP

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
```

#### Crear una clasificación sencilla

```spl
index=curso earliest=0 latest=now
| eval resultado=if(status_num>=400, "Error", "Correcta")
```

#### Calcular porcentaje

```spl
index=curso earliest=0 latest=now
| stats
    count as total
    count(eval(status>=400)) as errores
| eval porcentaje=round(errores*100/total, 2)
```

Es más seguro convertir primero el campo:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats
    count as total
    count(eval(status_num>=400)) as errores
| eval porcentaje=if(
    total>0,
    round(errores*100/total, 2),
    0
)
```

#### Formatear fechas

```spl
index=curso earliest=0 latest=now
| eval fecha=strftime(_time, "%Y-%m-%d")
| stats count by fecha
```

#### Calcular segundos desde el evento

```spl
index=curso earliest=0 latest=now
| eval antiguedad=now()-_time
| table _time antiguedad host uri
```

---

## 14. Funciones habituales de `eval`

#### `if`

```spl
| eval tipo=if(status_num>=400, "Error", "Correcta")
```

#### `case`

```spl
| eval clase=case(
    status_num>=500, "Error de servidor",
    status_num>=400, "Error de cliente",
    status_num>=300, "Redirección",
    status_num>=200, "Correcta",
    true(), "Desconocida"
)
```

#### `coalesce`

Devuelve el primer campo no nulo.

```spl
| eval ip_origen=coalesce(clientip, src_ip, source_ip)
```

#### `isnull`

```spl
| eval falta_latencia=if(isnull(response_time), 1, 0)
```

#### `isnotnull`

```spl
| where isnotnull(uri)
```

#### `len`

```spl
| eval longitud_uri=len(uri)
```

#### `lower`

```spl
| eval uri_normalizada=lower(uri)
```

#### `upper`

```spl
| eval metodo_mayusculas=upper(method)
```

#### `round`

```spl
| eval media_redondeada=round(media_ms, 2)
```

#### `tonumber`

```spl
| eval tiempo_ms=tonumber(response_time)
```

#### `tostring`

```spl
| eval estado_texto=tostring(status_num)
```

---

## 15. Comando `stats`

`stats` calcula agregaciones sobre los eventos.

#### Contar eventos

```spl
index=curso earliest=0 latest=now
| stats count
```

#### Contar con alias

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

#### Contar por host

```spl
index=curso earliest=0 latest=now
| stats count as peticiones by host
```

#### Contar por código HTTP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count as peticiones by status_num
```

#### Contar por host y URI

```spl
index=curso earliest=0 latest=now
| stats count as peticiones by host uri
```

#### Calcular varias métricas

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats
    count as peticiones
    count(eval(status_num>=400)) as errores
    dc(uri) as uri_distintas
    dc(host) as hosts_distintos
```

#### Media de latencia

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| stats avg(tiempo_ms) as media_ms
```

#### Mínimo y máximo

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| stats
    min(tiempo_ms) as minimo_ms
    max(tiempo_ms) as maximo_ms
```

#### Mediana y percentiles

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| stats
    median(tiempo_ms) as mediana_ms
    perc95(tiempo_ms) as p95_ms
    perc99(tiempo_ms) as p99_ms
```

#### Errores por URI

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
```

---

## 16. Funciones estadísticas condicionales

Puedes utilizar `count(eval(...))` dentro de `stats`.

#### Contar errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num>=400)) as errores
```

#### Contar HTTP 500

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
```

#### Comparar correctas y errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats
    count as total
    count(eval(status_num<400)) as correctas
    count(eval(status_num>=400)) as errores
```

#### Calcular tasa de error

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats
    count as total
    count(eval(status_num>=400)) as errores
| eval tasa_error=if(
    total>0,
    round(errores/total*100, 2),
    0
)
```

---

## 17. Comando `timechart`

`timechart` crea series temporales.

#### Peticiones por minuto

```spl
index=curso earliest=0 latest=now
| timechart span=1m count as peticiones
```

#### Peticiones por cinco minutos

```spl
index=curso earliest=0 latest=now
| timechart span=5m count as peticiones
```

#### Errores por minuto

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| timechart span=1m count as errores
```

#### Correctas frente a errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval tipo=if(status_num>=400, "Error", "Correcta")
| timechart span=1m count by tipo
```

#### HTTP 500 por minuto

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num=500
| timechart span=1m count as errores_500
```

#### Evolución por host

```spl
index=curso earliest=0 latest=now
| timechart span=1m count by host
```

#### Evolución por código HTTP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| timechart span=1m count by status_num
```

#### Interpretación

Busca:

- picos de tráfico;
- aumento de errores;
- periodos sin eventos;
- hosts con comportamiento diferente;
- coincidencia entre volumen elevado y errores;
- aparición repentina de HTTP `5xx`.

Una serie temporal muestra cuándo ocurre algo, pero no necesariamente por qué.

---

## 18. Comando `chart`

`chart` crea tablas o gráficos agrupados por uno o dos campos.

#### Peticiones por host y método

```spl
index=curso earliest=0 latest=now
| chart count over host by method
```

#### Errores por host y código

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| chart count over host by status_num
```

Utiliza `chart` cuando quieras comparar categorías.

Utiliza `timechart` cuando el eje principal sea el tiempo.

---

## 19. Comando `eventstats`

`eventstats` calcula estadísticas y las añade a cada evento sin eliminar el
detalle original.

#### Añadir el total de eventos a cada evento

```spl
index=curso earliest=0 latest=now
| eventstats count as total_eventos
| table _time host status uri total_eventos
| head 20
```

#### Añadir el total por host

```spl
index=curso earliest=0 latest=now
| eventstats count as peticiones_host by host
| table _time host uri peticiones_host
| head 20
```

#### Calcular porcentaje de cada host

```spl
index=curso earliest=0 latest=now
| eventstats count as total_eventos
| eventstats count as eventos_host by host
| eval porcentaje_host=round(eventos_host*100/total_eventos, 2)
| table _time host uri eventos_host total_eventos porcentaje_host
| head 20
```

---

## 20. Comando `streamstats`

`streamstats` calcula valores acumulados respetando el orden de los eventos.

#### Contador acumulado

```spl
index=curso earliest=0 latest=now
| sort 0 _time
| streamstats count as numero_evento
| table _time numero_evento host status uri
```

#### Errores acumulados

```spl
index=curso earliest=0 latest=now
| sort 0 _time
| eval status_num=tonumber(status)
| eval es_error=if(status_num>=400, 1, 0)
| streamstats sum(es_error) as errores_acumulados
| table _time status uri errores_acumulados
```

El orden temporal es importante. Si utilizas `streamstats`, comprueba que los
eventos están ordenados como necesitas.

---

## 21. Comando `dedup`

`dedup` elimina eventos duplicados según uno o varios campos.

#### Eliminar URI repetidas

```spl
index=curso earliest=0 latest=now
| dedup uri
| table _time host status uri
```

#### Eliminar duplicados por varios campos

```spl
index=curso earliest=0 latest=now
| dedup host method status uri
```

#### Mantener una muestra por host

```spl
index=curso earliest=0 latest=now
| dedup host
| table _time host status uri
```

Utiliza `dedup` con cuidado. Que dos eventos compartan los mismos campos visibles
no significa necesariamente que sean duplicados reales.

---

## 22. Comando `rename`

`rename` cambia el nombre de un campo en los resultados.

#### Renombrar un campo

```spl
index=curso earliest=0 latest=now
| rename uri as recurso
| table _time host status recurso
```

#### Renombrar métricas

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
| rename total_eventos as peticiones
```

Los nombres deben ser claros para los usuarios del dashboard.

---

## 23. Comando `rex`

`rex` extrae o transforma valores mediante expresiones regulares.

#### Extraer el recurso principal de una URI

```spl
index=curso earliest=0 latest=now
| rex field=uri "^/(?<recurso>[^/]+)"
| stats count by recurso
```

Para una URI como:

```text
/api/users
```

el campo `recurso` podría contener:

```text
api
```

#### Extraer un identificador de una URI

```spl
index=curso earliest=0 latest=now
| rex field=uri "/users/(?<user_id>[0-9]+)"
| table uri user_id
```

#### Extraer un código desde `_raw`

```spl
index=curso earliest=0 latest=now
| rex field=_raw "status=(?<status_extraido>[0-9]{3})"
| table _raw status_extraido
```

Utiliza `rex` cuando el campo no exista o cuando necesites extraer una parte
concreta de una cadena.

No utilices expresiones regulares complejas si el campo ya está disponible.

---

## 24. Comando `spath`

`spath` extrae campos de estructuras JSON o XML compatibles.

#### Ejemplo conceptual con JSON

Si un evento contiene:

```json
{
  "request": {
    "method": "GET",
    "uri": "/api/users"
  },
  "response": {
    "status": 200
  }
}
```

Puedes utilizar:

```spl
index=curso earliest=0 latest=now
| spath
| table request.method request.uri response.status
```

#### Extraer un campo concreto

```spl
index=curso earliest=0 latest=now
| spath input=_raw path=response.status output=status_json
| table status_json
```

La sintaxis exacta depende de la estructura real del evento.

---

## 25. Comando `lookup`

`lookup` permite enriquecer eventos con información externa.

Ejemplo conceptual:

```spl
index=curso earliest=0 latest=now
| lookup activos.csv host OUTPUT owner environment
| stats count by environment owner
```

El lookup podría contener:

```text
host,owner,environment
web-01,Equipo Web,produccion
web-02,Equipo Web,pruebas
```

#### Uso práctico

Puedes utilizar un lookup para añadir:

- propietario del host;
- entorno;
- aplicación;
- ubicación;
- criticidad;
- equipo responsable.

Documenta siempre:

- nombre del lookup;
- ubicación;
- campos de unión;
- campos añadidos;
- propietario;
- fecha de actualización.

---

## 26. Comando `fillnull`

`fillnull` sustituye valores nulos.

#### Sustituir nulos de `host`

```spl
index=curso earliest=0 latest=now
| fillnull value="desconocido" host
| stats count by host
```

#### Sustituir nulos de latencia

```spl
index=curso earliest=0 latest=now
| fillnull value=0 response_time
```

Utiliza `fillnull` con cuidado. Un cero puede significar “sin dato” y no
necesariamente “duración cero”.

En muchos casos es mejor conservar el valor nulo y documentar su significado.

---

## 27. Comando `replace`

`replace` sustituye valores de un campo.

#### Normalizar métodos

```spl
index=curso earliest=0 latest=now
| replace "get" with "GET" in method
| stats count by method
```

#### Normalizar nombres de host

```spl
index=curso earliest=0 latest=now
| replace "WEB-01" with "web-01" in host
```

Utilízalo únicamente cuando conozcas la equivalencia correcta.

---

## 28. Comando `format`

`format` convierte resultados en una expresión de búsqueda.

Ejemplo conceptual:

```spl
index=curso earliest=0 latest=now
| stats count by host
| where count>100
| fields host
| format
```

Es un comando avanzado. Úsalo solo si entiendes la consulta generada.

---

## 29. Comando `return`

`return` devuelve valores concretos de los resultados.

Ejemplo conceptual:

```spl
index=curso earliest=0 latest=now
| stats values(host) as hosts
| return $hosts
```

Su uso suele aparecer en búsquedas encadenadas o subsearches.

---

## 30. Subsearches

Una subsearch está delimitada por corchetes:

```spl
[
    búsqueda_interna
]
```

#### Ejemplo conceptual

Buscar eventos de los hosts que hayan generado HTTP `500`:

```spl
index=curso earliest=0 latest=now
[
    search index=curso earliest=0 latest=now status=500
    | fields host
    | format
]
```

Las subsearches pueden ser útiles, pero también pueden aumentar la complejidad y
el coste de una búsqueda.

Para los ejercicios iniciales, suele ser preferible una búsqueda directa y clara.

---

## 31. Análisis de códigos HTTP

#### Distribución por código

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count as peticiones by status_num
| sort status_num
```

#### Clasificación por familia

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval familia=case(
    status_num>=500, "5xx",
    status_num>=400, "4xx",
    status_num>=300, "3xx",
    status_num>=200, "2xx",
    true(), "otro"
)
| stats count as peticiones by familia
| sort familia
```

#### Errores por host

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| sort - errores
```

#### Errores por URI

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

#### HTTP 500 por minuto

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num=500
| timechart span=1m count as errores_500
```

---

## 32. Análisis de porcentaje de error

#### Porcentaje global

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

#### Porcentaje por host

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

#### Porcentaje por URI

```spl
index=curso earliest=0 latest=now
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

Un ranking por errores absolutos y un ranking por porcentaje pueden ser diferentes.
Ambos deben interpretarse con cuidado.

---

## 33. Análisis de latencia

Este análisis requiere un campo como `response_time`, `duration` o `latency`.

#### Convertir la latencia

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
```

#### Latencia media por URI

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(tiempo_ms)
| stats avg(tiempo_ms) as media_ms by uri
| sort - media_ms
```

#### Percentil 95 por URI

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(tiempo_ms)
| stats
    avg(tiempo_ms) as media_ms
    median(tiempo_ms) as mediana_ms
    perc95(tiempo_ms) as p95_ms
    by uri
| sort - p95_ms
```

#### Respuestas superiores a un segundo

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| where tiempo_ms>1000
| stats count as respuestas_lentas by uri
| sort - respuestas_lentas
```

Si no existe el campo de latencia, documenta la limitación y no utilices un panel
titulado “URL más lentas”.

---

## 34. Análisis por IP

Este análisis requiere `clientip`, `src_ip` o un campo equivalente.

#### IP con más errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by clientip
| sort - errores
| head 10
```

#### Peticiones y errores por IP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats
    count as peticiones
    count(eval(status_num>=400)) as errores
    by clientip
| eval porcentaje_error=if(
    peticiones>0,
    round(errores*100/peticiones, 2),
    0
)
| sort - errores
```

#### IP con actividad elevada en cinco minutos

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by clientip
| where errores>=5
| sort - errores
```

Si no existe IP, utiliza `host` como alternativa, pero cambia el título y documenta
la limitación.

---

## 35. Comando `transaction`

`transaction` agrupa eventos relacionados.

Ejemplo conceptual:

```spl
index=curso earliest=0 latest=now
| transaction clientip maxspan=5m
| table clientip duration eventcount
```

`transaction` puede consumir muchos recursos, especialmente con grandes volúmenes.

Antes de utilizarlo, considera si puedes resolver el problema mediante:

- `stats`;
- `streamstats`;
- `eventstats`;
- `transaction` con campos de agrupación precisos;
- un identificador de correlación.

No utilices `transaction` como primera opción en un dashboard de producción sin
justificarlo.

---

## 36. Comando `search` con comodines

#### URI que comienza por `/api`

```spl
index=curso earliest=0 latest=now
| search uri="/api/*"
```

#### Hosts de una familia

```spl
index=curso earliest=0 latest=now
| search host="web-*"
```

#### Métodos concretos

```spl
index=curso earliest=0 latest=now
| search method IN ("GET", "POST")
```

Comprueba que los valores reales coinciden exactamente con el patrón utilizado.

---

## 37. Comando `IN`

`IN` permite comprobar varios valores.

#### Códigos concretos

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num IN (400, 401, 403, 404)
```

#### Hosts concretos

```spl
index=curso earliest=0 latest=now
| search host IN ("web-01", "web-02")
```

#### Métodos concretos

```spl
index=curso earliest=0 latest=now
| search method IN ("GET", "POST")
```

---

## 38. Comando `like`

`like` permite comparar patrones.

```spl
index=curso earliest=0 latest=now
| where like(uri, "/api/%")
```

En expresiones `like`:

```text
%
```

representa una secuencia de caracteres.

---

## 39. Diagnóstico de campos ausentes

#### Revisar campos disponibles

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

#### Revisar eventos originales

```spl
index=curso earliest=0 latest=now
| table _raw
| head 20
```

#### Comprobar IP

```spl
index=curso earliest=0 latest=now
| table clientip src_ip source_ip
| head 20
```

#### Comprobar latencia

```spl
index=curso earliest=0 latest=now
| table response_time duration latency
| head 20
```

#### Comprobar campos nulos

```spl
index=curso earliest=0 latest=now
| eval falta_ip=if(isnull(clientip), 1, 0)
| eval falta_latencia=if(isnull(response_time), 1, 0)
| stats
    sum(falta_ip) as eventos_sin_ip
    sum(falta_latencia) as eventos_sin_latencia
```

---

## 40. Diagnóstico de una búsqueda sin resultados

Si esta búsqueda no devuelve resultados:

```spl
index=curso status=500 earliest=-5m latest=now
```

sigue este orden.

#### Paso 1: comprobar que el índice contiene eventos

```spl
index=curso earliest=0 latest=now
| stats count
```

#### Paso 2: comprobar el rango temporal

```spl
index=curso earliest=0 latest=now
| stats min(_time) as inicio max(_time) as fin
```

#### Paso 3: comprobar los valores de `status`

```spl
index=curso earliest=0 latest=now
| stats count by status
```

#### Paso 4: convertir el campo

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count by status status_num
```

#### Paso 5: realizar el filtro

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count
```

#### Paso 6: revisar permisos

Comprueba que el usuario puede leer el índice `curso`.

#### Paso 7: revisar logs internos

```spl
index=_internal earliest=-30m latest=now
| search log_level=error OR log_level=warn
| table _time host component log_level message
| sort - _time
```

---

## 41. Búsquedas para dashboards

#### Panel de total de peticiones

```spl
index=curso earliest=-24h latest=now
| stats count as peticiones
```

#### Panel de total de errores

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num>=400)) as errores
```

#### Panel de porcentaje de error

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

#### Panel de peticiones por minuto

```spl
index=curso earliest=-24h latest=now
| timechart span=1m count as peticiones
```

#### Panel de errores por código

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| stats count as errores by status_num
| sort status_num
```

#### Panel de URI con más errores

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

#### Panel de host con más errores

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| sort - errores
| head 10
```

---

## 42. Búsquedas para alertas

#### Cinco HTTP 500 en cinco minutos

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

#### Cinco errores de cualquier tipo en cinco minutos

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num>=400)) as errores
| where errores>=5
```

#### Host con cinco errores

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| where errores>=5
```

#### URI con cinco errores

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| where errores>=5
```

Documenta siempre:

- por qué se eligió el umbral;
- por qué se eligió la ventana;
- con qué frecuencia se ejecuta;
- qué acción se realiza;
- cómo se evita la repetición de avisos.

---

## 43. Buenas prácticas de rendimiento

#### Filtrar por índice y tiempo

Recomendado:

```spl
index=curso earliest=-24h latest=now
| search status=500
```

Menos recomendable:

```spl
index=*
| search status=500
```

#### Filtrar pronto

Recomendado:

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count by uri
```

#### Evitar campos innecesarios

Recomendado:

```spl
index=curso earliest=-24h latest=now
| fields _time host status uri
| table _time host status uri
```

#### Limitar rankings

```spl
| sort - errores
| head 10
```

#### Evitar `table *`

Utiliza solo los campos necesarios:

```spl
| table _time host status uri
```

#### Evitar `transaction` sin necesidad

Considera primero:

```spl
| stats
```

o:

```spl
| streamstats
```

#### Revisar búsquedas programadas

Los reportes y alertas frecuentes pueden consumir recursos. Documenta:

- frecuencia;
- intervalo;
- cantidad aproximada de eventos;
- necesidad operativa;
- posible solapamiento;
- acción.

---

## 44. Ejercicios progresivos

#### Ejercicio 1: contar eventos

```spl
index=curso earliest=0 latest=now
| stats count
```

Preguntas:

- ¿Cuántos eventos existen?
- ¿Qué rango temporal tienen?
- ¿El número coincide con el archivo original?

#### Ejercicio 2: contar por host

```spl
index=curso earliest=0 latest=now
| stats count by host
| sort - count
```

Preguntas:

- ¿Qué host tiene más eventos?
- ¿Hay hosts inesperados?
- ¿Qué implicación tendría un host sin datos?

#### Ejercicio 3: clasificar códigos

```spl
index=curso earliest=0 latest=now
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

Preguntas:

- ¿Qué familia domina?
- ¿Hay respuestas `5xx`?
- ¿Hay valores `otro`?

#### Ejercicio 4: URI con más errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

Preguntas:

- ¿Qué URI requiere investigación?
- ¿Se trata de `4xx` o `5xx`?
- ¿La URI tiene mucho tráfico total?

#### Ejercicio 5: evolución temporal

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval resultado=if(status_num>=400, "Error", "Correcta")
| timechart span=1m count by resultado
```

Preguntas:

- ¿Cuándo aparecen los errores?
- ¿Coinciden con un pico de tráfico?
- ¿Hay intervalos sin actividad?

#### Ejercicio 6: error relativo por URI

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats
    count as peticiones
    count(eval(status_num>=400)) as errores
    by uri
| eval porcentaje_error=round(errores*100/peticiones, 2)
| sort - porcentaje_error
```

Preguntas:

- ¿La URI con más errores absolutos es también la de mayor porcentaje?
- ¿Qué métrica es más útil para priorizar?
- ¿Qué volumen mínimo necesitarías para confiar en el porcentaje?

#### Ejercicio 7: alerta

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

Preguntas:

- ¿Se puede probar con datos históricos?
- ¿Qué ocurre si los eventos tienen timestamps antiguos?
- ¿Cómo evitarías avisos repetidos?

---

## 45. Plantilla para documentar una búsqueda

Utiliza esta plantilla en los entregables:

```markdown
#### Nombre de la búsqueda

###### Objetivo

Describir la pregunta operativa que responde.

###### SPL

```spl
index=curso earliest=-24h latest=now
| stats count by host
```

###### Índice

```text
curso
```

###### Intervalo temporal

```text
Últimas 24 horas
```

###### Campos utilizados

- host

###### Resultado esperado

Describir el resultado.

###### Resultado observado

Completar con el resultado real.

###### Interpretación

Explicar qué significa.

###### Limitaciones

Indicar qué no puede demostrarse.

###### Fecha de validación

Completar la fecha.
```

---

## 46. Errores habituales de los asistentes

#### Error: no indicar el índice

Incorrecto:

```spl
| stats count
```

Correcto:

```spl
index=curso earliest=-24h latest=now
| stats count
```

#### Error: comparar texto con números

Poco recomendable:

```spl
| where status>=400
```

Recomendado:

```spl
| eval status_num=tonumber(status)
| where status_num>=400
```

#### Error: utilizar datos históricos con tiempo relativo

Si los eventos son del 1 de enero de 2026, esta búsqueda puede no devolver datos:

```spl
index=curso earliest=-5m latest=now
```

Utiliza para la práctica:

```spl
index=curso earliest="01/01/2026:00:00:00"
          latest="01/01/2026:00:10:00"
```

#### Error: tratar `host` como IP

`host` y `clientip` representan entidades diferentes.

#### Error: afirmar que una URI es lenta sin latencia

Sin `response_time`, `duration` o `latency`, no puedes calcular rendimiento.

#### Error: crear una alerta sin probar la consulta

Ejecuta primero la búsqueda manualmente y documenta el resultado.

#### Error: utilizar `table *`

Selecciona únicamente los campos necesarios.

#### Error: confiar únicamente en una visualización

Un gráfico no sustituye la validación de la consulta.

---

## 47. Checklist de SPL

#### Antes de ejecutar

- [ ] El índice es correcto.
- [ ] El intervalo temporal es correcto.
- [ ] Los campos existen.
- [ ] Los campos numéricos se convierten.
- [ ] La consulta responde una pregunta concreta.
- [ ] El usuario tiene permisos.

#### Después de ejecutar

- [ ] El resultado tiene sentido.
- [ ] El número de eventos es razonable.
- [ ] No hay valores inesperados.
- [ ] Se han revisado los campos nulos.
- [ ] La consulta puede reutilizarse.
- [ ] Se han documentado las limitaciones.

#### Antes de guardar

- [ ] El nombre es claro.
- [ ] La descripción está completa.
- [ ] La aplicación es correcta.
- [ ] Los permisos son adecuados.
- [ ] El propietario está documentado.
- [ ] La consulta no depende de valores temporales incorrectos.

---

## 48. Referencias oficiales

- [Splunk Enterprise Documentation](https://docs.splunk.com/Documentation/Splunk)
- [Splunk Help](https://help.splunk.com/)
- [Splunk Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchapp)
- [Splunk Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)
- [`stats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Stats)
- [`eval`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Eval)
- [`where`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Where)
- [`timechart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart)
- [`fieldsummary`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fieldsummary)
- [`rex`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Rex)
- [`eventstats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Eventstats)
- [`streamstats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Streamstats)
- [Search Optimization](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutsearchoptimization)
- [Splunk Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)
- [Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/IntroFrame)
- [About Alerts](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Users and Roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Knowledge Objects](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)
- [Splunk REST API Reference](https://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTprolog)
- [Ubuntu Systemd](https://documentation.ubuntu.com/server/explanation/systemd/)