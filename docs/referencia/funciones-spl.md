# Funciones SPL

Funciones estándar para cálculo, transformación y comparación.

Este documento explica las funciones SPL más utilizadas en el laboratorio de
Splunk Enterprise.

Las funciones se utilizan normalmente dentro de comandos como:

- `eval`;
- `where`;
- `stats`;
- `eventstats`;
- `streamstats`;
- `timechart`;
- `chart`;
- `fieldformat`.

Los ejemplos utilizan el índice:

```spl
index=curso
```

y los campos habituales del dataset web:

```text
_time
host
method
status
uri
clientip
response_time
user_agent
bytes
referer
```

No todos los datasets contienen todos los campos. Antes de utilizar una función,
comprueba que el campo existe:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

---

#### 1. Qué es una función SPL

Una función SPL recibe uno o varios valores y devuelve un resultado.

Ejemplo:

```spl
| eval status_num=tonumber(status)
```

En este caso:

- `tonumber()` es la función;
- `status` es el argumento;
- `status_num` es el nuevo campo;
- el resultado es una versión numérica de `status`.

Otro ejemplo:

```spl
| eval uri_longitud=len(uri)
```

La función `len()` cuenta la longitud del campo `uri`.

---

#### 2. Estructura general

La estructura habitual es:

```spl
| eval nuevo_campo=funcion(campo)
```

Ejemplo:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| table status status_num
```

También se pueden combinar funciones:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
```

En este caso:

1. `trim(status)` elimina espacios exteriores.
2. `tonumber(...)` convierte el resultado en número.

---

#### 3. Funciones y tipos de datos

Las funciones SPL trabajan principalmente con:

- cadenas de texto;
- números;
- fechas representadas como epoch;
- valores booleanos;
- valores nulos;
- listas multivalor.

###### Texto

Ejemplo:

```text
/api/users
```

###### Número

Ejemplo:

```text
500
```

###### Tiempo epoch

Ejemplo conceptual:

```text
1770000000
```

###### Booleano

En SPL suele representarse mediante expresiones que devuelven:

```text
true()
false()
```

###### Valor nulo

Indica que un campo no tiene valor.

Se puede comprobar con:

```spl
isnull(campo)
```

---

## 4. Funciones de conversión

Las funciones de conversión son fundamentales cuando los datos llegan como texto,
pero deben utilizarse en cálculos numéricos.

---

#### 4.1 `tonumber`

Convierte un valor en número.

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| table status status_num
```

###### Ejemplo con latencia

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| table uri response_time tiempo_ms
```

###### Detectar valores que no se pueden convertir

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where isnull(status_num)
| table _time status uri _raw
```

###### Buenas prácticas

Utiliza un nombre nuevo en lugar de sobrescribir el campo original:

```spl
| eval status_num=tonumber(status)
```

Es preferible a:

```spl
| eval status=tonumber(status)
```

porque conserva el valor original para diagnosticar problemas de parsing.

---

#### 4.2 `tostring`

Convierte un valor en texto.

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval status_text=tostring(status_num)
| table status status_num status_text
```

Puede utilizarse para preparar valores para una presentación, aunque Splunk
normalmente realiza conversiones automáticas cuando son compatibles.

---

#### 4.3 `printf`

Formatea valores utilizando una plantilla.

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| eval tiempo_formateado=printf("%.2f ms", tiempo_ms)
| table uri tiempo_ms tiempo_formateado
```

Otro ejemplo:

```spl
index=curso earliest=0 latest=now
| eval porcentaje=printf("%.2f%%", porcentaje_error)
```

El carácter `%` debe escaparse como `%%` dentro del formato.

---

## 5. Funciones de valores nulos

Los datos reales suelen tener campos vacíos, ausentes o incompletos.

---

#### 5.1 `isnull`

Comprueba si un campo es nulo.

```spl
index=curso earliest=0 latest=now
| where isnull(response_time)
| table _time host uri response_time
```

###### Crear una bandera de campo ausente

```spl
index=curso earliest=0 latest=now
| eval falta_latencia=if(isnull(response_time), 1, 0)
| stats sum(falta_latencia) as eventos_sin_latencia
```

---

#### 5.2 `isnotnull`

Comprueba si un campo tiene valor.

```spl
index=curso earliest=0 latest=now
| where isnotnull(uri)
| table _time host uri
```

###### Analizar únicamente eventos con latencia

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(tiempo_ms)
| stats avg(tiempo_ms) as media_ms by uri
```

---

#### 5.3 `coalesce`

Devuelve el primer valor no nulo de una lista de campos.

Es útil cuando varias fuentes utilizan nombres diferentes para el mismo dato.

```spl
index=curso earliest=0 latest=now
| eval ip_origen=coalesce(clientip, src_ip, source_ip)
| table _time ip_origen uri status
```

Otro ejemplo:

```spl
index=curso earliest=0 latest=now
| eval latencia=coalesce(response_time, duration, latency)
```

###### Ventaja práctica

Puedes utilizar una misma búsqueda con datasets que tengan nombres de campos
diferentes, siempre que representen el mismo concepto.

---

#### 5.4 `null`

Devuelve un valor nulo.

```spl
index=curso earliest=0 latest=now
| eval campo_temporal=null()
```

Su uso es avanzado y suele ser útil al construir lógica condicional.

---

#### 5.5 Diferencia entre campo nulo y campo vacío

Un campo puede:

- no existir;
- existir con valor nulo;
- existir como cadena vacía;
- contener espacios;
- contener el texto `NULL`;
- contener el texto `-`.

Estas situaciones no son idénticas.

###### Comprobar varios casos

```spl
index=curso earliest=0 latest=now
| where isnull(uri) OR uri="" OR trim(uri)=""
| table _time uri _raw
```

###### Detectar valores textuales utilizados como ausencia

```spl
index=curso earliest=0 latest=now
| where uri="-" OR uri="NULL" OR uri="null"
| table _time uri _raw
```

La interpretación debe documentarse según el formato de la fuente.

---

## 6. Funciones condicionales

---

#### 6.1 `if`

Devuelve un valor cuando la condición es verdadera y otro cuando es falsa.

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval resultado=if(status_num>=400, "Error", "Correcta")
| stats count by resultado
```

###### Clasificar eventos lentos

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| eval rendimiento=if(
    tiempo_ms>1000,
    "Lento",
    "Normal"
)
| stats count by rendimiento
```

###### Evitar divisiones entre cero

```spl
index=curso earliest=0 latest=now
| stats
    count as total
    count(eval(status>=400)) as errores
| eval porcentaje_error=if(
    total>0,
    round(errores*100/total, 2),
    0
)
```

---

#### 6.2 `case`

Evalúa varias condiciones en orden.

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval familia_http=case(
    status_num>=500, "5xx",
    status_num>=400, "4xx",
    status_num>=300, "3xx",
    status_num>=200, "2xx",
    true(), "otro"
)
| stats count by familia_http
```

La primera condición verdadera determina el resultado.

###### Clasificar latencia

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| eval nivel_latencia=case(
    tiempo_ms>2000, "Crítica",
    tiempo_ms>1000, "Alta",
    tiempo_ms>500, "Media",
    isnull(tiempo_ms), "Sin dato",
    true(), "Baja"
)
| stats count by nivel_latencia
```

###### Importancia del orden

Incorrecto:

```spl
| eval clase=case(
    status_num>=200, "2xx",
    status_num>=500, "5xx"
)
```

Los códigos `500` cumplen también `status_num>=200`, por lo que serían clasificados
incorrectamente.

Correcto:

```spl
| eval clase=case(
    status_num>=500, "5xx",
    status_num>=400, "4xx",
    status_num>=300, "3xx",
    status_num>=200, "2xx",
    true(), "otro"
)
```

---

#### 6.3 `validate`

Devuelve el valor asociado a la primera condición falsa.

Puede utilizarse para validar datos.

```spl
index=curso earliest=0 latest=now
| eval validacion=validate(
    isnotnull(status),
    "Falta status",
    tonumber(status)>=100 AND tonumber(status)<=599,
    "Status inválido"
)
| table status validacion
```

Si todas las condiciones son verdaderas, devuelve un valor nulo.

Una alternativa más explícita para principiantes es utilizar `case()`.

---

#### 6.4 `true`

Devuelve el valor booleano verdadero.

Se utiliza habitualmente como condición final de `case()`:

```spl
| eval resultado=case(
    status_num>=500, "Servidor",
    status_num>=400, "Cliente",
    true(), "No error"
)
```

La última condición actúa como caso por defecto.

---

#### 6.5 `false`

Devuelve el valor booleano falso.

```spl
| eval disponible=false()
```

Su uso es menos frecuente que `true()`.

---

## 7. Funciones de texto

---

#### 7.1 `len`

Devuelve la longitud de una cadena.

```spl
index=curso earliest=0 latest=now
| eval longitud_uri=len(uri)
| table uri longitud_uri
```

###### Detectar URI demasiado largas

```spl
index=curso earliest=0 latest=now
| eval longitud_uri=len(uri)
| where longitud_uri>200
| table _time uri longitud_uri
```

---

#### 7.2 `lower`

Convierte el texto a minúsculas.

```spl
index=curso earliest=0 latest=now
| eval metodo_normalizado=lower(method)
| stats count by metodo_normalizado
```

---

#### 7.3 `upper`

Convierte el texto a mayúsculas.

```spl
index=curso earliest=0 latest=now
| eval metodo_normalizado=upper(method)
| stats count by metodo_normalizado
```

###### Normalizar métodos HTTP

```spl
index=curso earliest=0 latest=now
| eval method_norm=upper(trim(method))
| stats count by method_norm
```

---

#### 7.4 `trim`

Elimina espacios al principio y al final.

```spl
index=curso earliest=0 latest=now
| eval uri_limpia=trim(uri)
| table uri uri_limpia
```

###### Limpiar campos antes de convertirlos

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
```

---

#### 7.5 `ltrim`

Elimina espacios iniciales.

```spl
index=curso earliest=0 latest=now
| eval uri_limpia=ltrim(uri)
```

---

#### 7.6 `rtrim`

Elimina espacios finales.

```spl
index=curso earliest=0 latest=now
| eval uri_limpia=rtrim(uri)
```

---

#### 7.7 `substr`

Extrae una parte de una cadena.

```spl
index=curso earliest=0 latest=now
| eval prefijo_uri=substr(uri, 1, 4)
| table uri prefijo_uri
```

###### Extraer una versión inicial

```spl
index=curso earliest=0 latest=now
| eval inicio_uri=substr(uri, 1, 10)
```

La posición inicial y la longitud deben probarse con datos reales.

---

#### 7.8 `replace`

Sustituye coincidencias en una cadena.

```spl
index=curso earliest=0 latest=now
| eval uri_sin_api=replace(uri, "^/api", "")
| table uri uri_sin_api
```

###### Normalizar separadores

```spl
index=curso earliest=0 latest=now
| eval uri_normalizada=replace(uri, "//+", "/")
```

`replace()` utiliza expresiones regulares. Prueba siempre la expresión con una
muestra antes de aplicarla a un dashboard o alerta.

---

#### 7.9 `match`

Comprueba si una cadena coincide con una expresión regular.

```spl
index=curso earliest=0 latest=now
| eval es_api=if(match(uri, "^/api/"), 1, 0)
| stats sum(es_api) as peticiones_api
```

###### Detectar URI de administración

```spl
index=curso earliest=0 latest=now
| where match(uri, "^/(admin|management)")
| table _time host uri status
```

###### Validar una IP de forma básica

```spl
index=curso earliest=0 latest=now
| eval parece_ip=match(
    clientip,
    "^[0-9]{1,3}(\.[0-9]{1,3}){3}$"
)
| where parece_ip=1
| table clientip
```

Esta expresión comprueba el formato general, pero no valida que cada octeto esté
entre `0` y `255`.

---

#### 7.10 `like`

Compara un texto con un patrón.

```spl
index=curso earliest=0 latest=now
| where like(uri, "/api/%")
```

El carácter `%` representa una secuencia de caracteres.

###### Detectar métodos de consulta

```spl
index=curso earliest=0 latest=now
| where like(method, "GET%")
```

Para patrones complejos, suele ser más flexible `match()`.

---

#### 7.11 `split`

Divide una cadena y devuelve un campo multivalor.

```spl
index=curso earliest=0 latest=now
| eval partes_uri=split(uri, "/")
| table uri partes_uri
```

###### Obtener componentes de una URI

```spl
index=curso earliest=0 latest=now
| eval partes_uri=split(uri, "/")
| eval primer_componente=mvindex(partes_uri, 1)
| table uri primer_componente
```

---

#### 7.12 `mvjoin`

Une valores multivalor en una cadena.

```spl
index=curso earliest=0 latest=now
| eval partes_uri=split(uri, "/")
| eval uri_reconstruida=mvjoin(partes_uri, "/")
| table uri uri_reconstruida
```

---

#### 7.13 `urldecode`

Decodifica valores codificados en una URL.

```spl
index=curso earliest=0 latest=now
| eval uri_decodificada=urldecode(uri)
| table uri uri_decodificada
```

Su disponibilidad y comportamiento deben comprobarse en la versión instalada.

---

#### 7.14 `printf`

Formatea texto y números.

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| eval resumen=printf(
    "%s respondió en %.0f ms",
    uri,
    tiempo_ms
)
| table resumen
```

---

## 8. Funciones numéricas

---

#### 8.1 `abs`

Devuelve el valor absoluto.

```spl
index=curso earliest=0 latest=now
| eval diferencia=abs(response_time-1000)
| table response_time diferencia
```

---

#### 8.2 `ceil`

Redondea hacia arriba.

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| eval segundos=ceil(tiempo_ms/1000)
| table tiempo_ms segundos
```

---

#### 8.3 `floor`

Redondea hacia abajo.

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| eval segundos=floor(tiempo_ms/1000)
| table tiempo_ms segundos
```

---

#### 8.4 `round`

Redondea un número.

```spl
index=curso earliest=0 latest=now
| eval porcentaje=round(errores*100/total, 2)
```

Ejemplo sobre latencia:

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| eval tiempo_redondeado=round(tiempo_ms, 0)
```

---

#### 8.5 `sqrt`

Calcula la raíz cuadrada.

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| eval raiz=sqrt(tiempo_ms)
| table uri tiempo_ms raiz
```

Es una función matemática de uso menos frecuente en el análisis operativo.

---

#### 8.6 `pow`

Eleva un número a una potencia.

```spl
index=curso earliest=0 latest=now
| eval resultado=pow(2, 3)
```

Resultado esperado:

```text
8
```

---

#### 8.7 `exp`

Calcula la función exponencial.

```spl
| eval resultado=exp(1)
```

---

#### 8.8 `log`

Calcula un logaritmo.

```spl
| eval resultado=log(100)
```

Comprueba la base y el comportamiento en la versión instalada antes de usarlo
para un análisis técnico.

---

#### 8.9 `max`

Devuelve el máximo entre valores.

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| eval maximo=if(tiempo_ms>1000, tiempo_ms, 1000)
| table uri tiempo_ms maximo
```

En agregaciones, `max()` también se utiliza dentro de `stats`:

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| stats max(tiempo_ms) as maxima_latencia by uri
```

---

#### 8.10 `min`

Devuelve el mínimo entre valores.

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| stats min(tiempo_ms) as minima_latencia by uri
```

---

## 9. Funciones de fecha y hora

Los tiempos de Splunk suelen representarse internamente como segundos desde epoch.

---

#### 9.1 `now`

Devuelve el momento actual.

```spl
index=curso earliest=0 latest=now
| eval antiguedad_segundos=now()-_time
| table _time antiguedad_segundos
```

###### Eventos con más de una hora

```spl
index=curso earliest=0 latest=now
| eval antiguedad=now()-_time
| where antiguedad>3600
| table _time antiguedad host uri
```

---

#### 9.2 `relative_time`

Calcula un tiempo relativo.

```spl
| eval hace_una_hora=relative_time(now(), "-1h")
```

###### Filtrar dentro de `where`

```spl
index=curso earliest=0 latest=now
| where _time>=relative_time(now(), "-1h")
```

###### Redondear al inicio de la hora

```spl
| eval inicio_hora=relative_time(_time, "@h")
```

Modificadores habituales:

```text
-1h       una hora antes
-5m       cinco minutos antes
@h        inicio de la hora
@d        inicio del día
@w        inicio de la semana
@mon      inicio del mes
```

---

#### 9.3 `strftime`

Convierte epoch en texto legible.

```spl
index=curso earliest=0 latest=now
| eval fecha=strftime(_time, "%Y-%m-%d %H:%M:%S")
| table fecha host uri
```

###### Formato de fecha

```text
%Y  año con cuatro cifras
%m  mes
%d  día
%H  hora
%M  minuto
%S  segundo
```

---

#### 9.4 `strptime`

Convierte una fecha textual en epoch.

```spl
| eval fecha_epoch=strptime(
    "2026-01-01 10:00:00",
    "%Y-%m-%d %H:%M:%S"
)
```

###### Convertir un campo de fecha propio

```spl
index=curso earliest=0 latest=now
| eval fecha_epoch=strptime(
    timestamp,
    "%Y-%m-%d %H:%M:%S"
)
| table timestamp fecha_epoch
```

No sobrescribas `_time` sin comprobar antes el resultado.

---

#### 9.5 `time`

Devuelve el tiempo asociado al evento.

En la práctica, el campo utilizado habitualmente es:

```spl
_time
```

Ejemplo:

```spl
index=curso earliest=0 latest=now
| eval fecha=strftime(_time, "%d/%m/%Y")
```

---

#### 9.6 Extraer componentes de fecha

```spl
index=curso earliest=0 latest=now
| eval
    año=strftime(_time, "%Y"),
    mes=strftime(_time, "%m"),
    dia=strftime(_time, "%d"),
    hora=strftime(_time, "%H")
| table _time año mes dia hora
```

También puedes utilizar estas funciones dentro de agrupaciones si están
disponibles en la versión correspondiente:

```spl
| eval hora_num=tonumber(strftime(_time, "%H"))
| stats count by hora_num
```

---

## 10. Funciones multivalor

Los campos multivalor contienen más de un valor.

---

#### 10.1 `mvcount`

Cuenta los valores de un campo multivalor.

```spl
index=curso earliest=0 latest=now
| eval partes_uri=split(uri, "/")
| eval numero_partes=mvcount(partes_uri)
| table uri partes_uri numero_partes
```

---

#### 10.2 `mvindex`

Obtiene un valor por posición.

```spl
index=curso earliest=0 latest=now
| eval partes_uri=split(uri, "/")
| eval primer_elemento=mvindex(partes_uri, 0)
| table uri partes_uri primer_elemento
```

###### Obtener el último elemento

```spl
index=curso earliest=0 latest=now
| eval partes_uri=split(uri, "/")
| eval ultimo_elemento=mvindex(partes_uri, -1)
| table uri ultimo_elemento
```

---

#### 10.3 `mvjoin`

Une valores multivalor.

```spl
index=curso earliest=0 latest=now
| eval partes_uri=split(uri, "/")
| eval ruta=mvjoin(partes_uri, " > ")
| table uri ruta
```

---

#### 10.4 `mvfind`

Busca un valor dentro de un campo multivalor.

```spl
index=curso earliest=0 latest=now
| eval metodos=split("GET,POST,DELETE", ",")
| eval posicion=mvfind(metodos, "POST")
| table metodos posicion
```

---

#### 10.5 `mvappend`

Combina valores en una lista multivalor.

```spl
| eval estados=mvappend("200", "404", "500")
```

---

#### 10.6 `mvsort`

Ordena valores multivalor.

```spl
| eval valores=mvappend("500", "200", "404")
| eval valores_ordenados=mvsort(valores)
| table valores valores_ordenados
```

---

#### 10.7 `mvdedup`

Elimina duplicados de un campo multivalor.

```spl
| eval valores=mvappend("GET", "POST", "GET")
| eval valores_unicos=mvdedup(valores)
| table valores valores_unicos
```

---

## 11. Funciones de comparación

---

#### 11.1 `in`

Comprueba si un valor pertenece a una lista.

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where in(status_num, 400, 401, 403, 404)
```

También puede utilizarse en una expresión:

```spl
index=curso earliest=0 latest=now
| eval es_error_cliente=if(
    in(tonumber(status), 400, 401, 403, 404),
    1,
    0
)
```

---

#### 11.2 `match`

Comprueba una expresión regular.

```spl
index=curso earliest=0 latest=now
| eval es_api=match(uri, "^/api/")
| where es_api=1
```

---

#### 11.3 `like`

Compara utilizando comodines.

```spl
index=curso earliest=0 latest=now
| where like(uri, "/api/%")
```

---

#### 11.4 `case`

Permite comparar rangos y categorías.

```spl
index=curso earliest=0 latest=now
| eval criticidad=case(
    status_num>=500, "alta",
    status_num>=400, "media",
    true(), "baja"
)
```

---

## 12. Funciones de agregación estadística

Estas funciones suelen utilizarse dentro de `stats`, `eventstats`, `streamstats` y
`timechart`.

---

#### 12.1 `count`

Cuenta eventos o valores.

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

###### Conteo por host

```spl
index=curso earliest=0 latest=now
| stats count by host
```

---

#### 12.2 `dc`

Cuenta valores distintos.

```spl
index=curso earliest=0 latest=now
| stats dc(uri) as uri_distintas
```

###### Hosts distintos

```spl
index=curso earliest=0 latest=now
| stats dc(host) as hosts_distintos
```

###### Clientes distintos

```spl
index=curso earliest=0 latest=now
| stats dc(clientip) as clientes_distintos
```

`dc()` es útil para cardinalidad, pero no equivale a contar eventos.

---

#### 12.3 `values`

Devuelve valores distintos en formato multivalor.

```spl
index=curso earliest=0 latest=now
| stats values(status) as estados by uri
```

---

#### 12.4 `list`

Devuelve una lista de valores, pudiendo conservar repeticiones.

```spl
index=curso earliest=0 latest=now
| stats list(status) as estados by uri
```

Utiliza `list()` con precaución en datasets grandes.

---

#### 12.5 `sum`

Suma valores numéricos.

```spl
index=curso earliest=0 latest=now
| eval bytes_num=tonumber(bytes)
| stats sum(bytes_num) as bytes_totales
```

---

#### 12.6 `avg`

Calcula la media.

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| stats avg(tiempo_ms) as latencia_media
```

---

#### 12.7 `median`

Calcula la mediana.

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| stats median(tiempo_ms) as latencia_mediana
```

---

#### 12.8 `min`

Calcula el valor mínimo.

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| stats min(tiempo_ms) as minimo_ms by uri
```

---

#### 12.9 `max`

Calcula el valor máximo.

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| stats max(tiempo_ms) as maximo_ms by uri
```

---

#### 12.10 `range`

Calcula la diferencia entre el máximo y el mínimo.

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| stats range(tiempo_ms) as rango_ms by uri
```

---

#### 12.11 `stdev`

Calcula la desviación estándar.

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| stats stdev(tiempo_ms) as desviacion_ms by uri
```

Una desviación elevada puede indicar variabilidad en los tiempos de respuesta.

---

#### 12.12 `var`

Calcula la varianza.

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| stats var(tiempo_ms) as varianza_ms by uri
```

---

#### 12.13 `perc95`

Calcula el percentil 95.

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| stats perc95(tiempo_ms) as p95_ms by uri
```

El percentil 95 indica un valor por debajo del cual se encuentra
aproximadamente el 95 % de las observaciones.

---

#### 12.14 `perc99`

Calcula el percentil 99.

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| stats perc99(tiempo_ms) as p99_ms by uri
```

El percentil 99 es útil para estudiar la cola de respuestas más lentas.

---

#### 12.15 `exactperc95`

Cuando se necesita un cálculo exacto del percentil, puede existir una función
específica según la versión y el contexto de Splunk.

Comprueba la documentación de la versión instalada antes de utilizarla en un
informe formal.

---

## 13. Funciones estadísticas condicionales

---

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

#### Contar eventos con latencia alta

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| stats count(eval(tiempo_ms>1000)) as respuestas_lentas
```

#### Contar por host

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats
    count as total
    count(eval(status_num>=400)) as errores
    by host
```

#### Tasa de error por host

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats
    count as total
    count(eval(status_num>=400)) as errores
    by host
| eval tasa_error=if(
    total>0,
    round(errores*100/total, 2),
    0
)
| sort - tasa_error
```

---

## 14. Funciones para análisis de rendimiento

Este apartado requiere un campo de latencia o duración.

---

#### 14.1 Clasificar la latencia

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| eval clase_latencia=case(
    tiempo_ms>2000, "Muy lenta",
    tiempo_ms>1000, "Lenta",
    tiempo_ms>500, "Moderada",
    isnull(tiempo_ms), "Sin datos",
    true(), "Rápida"
)
| stats count by clase_latencia
```

---

#### 14.2 Calcular métricas por URI

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(tiempo_ms)
| stats
    count as peticiones
    avg(tiempo_ms) as media_ms
    median(tiempo_ms) as mediana_ms
    perc95(tiempo_ms) as p95_ms
    perc99(tiempo_ms) as p99_ms
    max(tiempo_ms) as maximo_ms
    by uri
| eval media_ms=round(media_ms, 2)
| eval mediana_ms=round(mediana_ms, 2)
| eval p95_ms=round(p95_ms, 2)
| sort - p95_ms
```

---

#### 14.3 Detectar valores extremos

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| eventstats perc95(tiempo_ms) as p95_global
| where tiempo_ms>p95_global
| table _time uri tiempo_ms p95_global host
| sort - tiempo_ms
```

Esta búsqueda identifica eventos por encima del percentil 95 global.

---

## 15. Funciones de análisis de datos web

---

#### 15.1 Identificar URI de API

```spl
index=curso earliest=0 latest=now
| eval tipo_uri=if(match(uri, "^/api/"), "API", "Web")
| stats count by tipo_uri
```

---

#### 15.2 Extraer el primer nivel de una URI

```spl
index=curso earliest=0 latest=now
| rex field=uri "^/(?<nivel_1>[^/]+)"
| stats count by nivel_1
| sort - count
```

---

#### 15.3 Normalizar parámetros de consulta

Si las URI contienen parámetros:

```text
/search?q=splunk
/search?q=linux
```

puedes eliminar la parte de consulta:

```spl
index=curso earliest=0 latest=now
| eval uri_base=replace(uri, "\?.*$", "")
| stats count by uri_base
| sort - count
```

---

#### 15.4 Agrupar métodos HTTP

```spl
index=curso earliest=0 latest=now
| eval metodo=upper(trim(method))
| stats count by metodo
| sort - count
```

---

#### 15.5 Analizar agentes de usuario

```spl
index=curso earliest=0 latest=now
| stats count as peticiones by user_agent
| sort - peticiones
| head 10
```

Si el campo no existe:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Documenta la ausencia en lugar de fabricar una visualización.

---

## 16. Funciones para validar calidad de datos

---

#### 16.1 Validar el código HTTP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| eval status_valido=if(
    status_num>=100 AND status_num<=599,
    "Válido",
    "Inválido"
)
| stats count by status_valido
```

---

#### 16.2 Detectar URI vacías

```spl
index=curso earliest=0 latest=now
| eval uri_limpia=trim(uri)
| where isnull(uri_limpia) OR uri_limpia=""
| table _time host status uri _raw
```

---

#### 16.3 Detectar métodos desconocidos

```spl
index=curso earliest=0 latest=now
| eval metodo=upper(trim(method))
| where NOT in(metodo, "GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS")
| stats count by metodo
```

---

#### 16.4 Detectar latencias inválidas

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(trim(response_time))
| where isnotnull(response_time) AND isnull(tiempo_ms)
| table _time uri response_time _raw
```

---

#### 16.5 Resumen de calidad

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval tiempo_ms=tonumber(response_time)
| eval falta_uri=if(isnull(uri) OR trim(uri)="", 1, 0)
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
    sum(status_invalido) as eventos_status_invalido
    sum(latencia_invalida) as eventos_latencia_invalida
```

---

## 17. Funciones para construir indicadores

---

#### 17.1 Indicador global de salud

Ejemplo didáctico:

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
| eval estado=case(
    porcentaje_error>=10, "Crítico",
    porcentaje_error>=5, "Degradado",
    true(), "Normal"
)
| table total errores porcentaje_error estado
```

Los umbrales deben justificarse y adaptarse al contexto real.

---

#### 17.2 Indicador por host

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| stats
    count as peticiones
    count(eval(status_num>=400)) as errores
    avg(tonumber(response_time)) as latencia_media
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
| table host peticiones errores porcentaje_error latencia_media estado
```

---

#### 17.3 Indicador temporal

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| eval resultado=if(status_num>=400, "Error", "Correcta")
| timechart span=5m count by resultado
```

Para calcular una tasa temporal:

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| bin _time span=5m
| stats
    count as total
    count(eval(status_num>=400)) as errores
    by _time
| eval porcentaje_error=if(
    total>0,
    round(errores*100/total, 2),
    0
)
| sort _time
```

---

## 18. Funciones en `where`

Las funciones pueden utilizarse directamente dentro de `where`.

#### Filtrar URI largas

```spl
index=curso earliest=0 latest=now
| where len(uri)>100
```

#### Filtrar métodos concretos

```spl
index=curso earliest=0 latest=now
| where upper(method)="POST"
```

#### Filtrar por latencia

```spl
index=curso earliest=0 latest=now
| where tonumber(response_time)>1000
```

#### Filtrar por patrón

```spl
index=curso earliest=0 latest=now
| where match(uri, "^/admin/")
```

#### Filtrar valores de una lista

```spl
index=curso earliest=0 latest=now
| where in(tonumber(status), 401, 403, 404)
```

---

## 19. Funciones en `stats`

Las funciones se pueden combinar con agregaciones.

#### Ejemplo completo

```spl
index=curso earliest=0 latest=now
| stats
    count as total
    dc(host) as hosts
    dc(uri) as recursos
    avg(tonumber(response_time)) as latencia_media
    max(tonumber(response_time)) as latencia_maxima
```

#### Estadísticas por host

```spl
index=curso earliest=0 latest=now
| stats
    count as peticiones
    dc(uri) as uri_distintas
    dc(clientip) as clientes_distintos
    avg(tonumber(response_time)) as media_ms
    perc95(tonumber(response_time)) as p95_ms
    by host
```

Si `clientip` o `response_time` no existen, la consulta debe adaptarse.

---

## 20. Diferencia entre funciones de `eval` y funciones estadísticas

#### Funciones de evaluación

Se aplican normalmente evento a evento:

```spl
| eval status_num=tonumber(status)
```

Cada evento recibe su propio valor de `status_num`.

#### Funciones estadísticas

Agregan muchos eventos:

```spl
| stats avg(response_time) as media_ms
```

El resultado ya no representa cada evento individual, sino una agregación.

#### Comparación

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| stats avg(tiempo_ms) as media_ms by uri
```

Flujo:

1. convertir `response_time` evento a evento;
2. agrupar por `uri`;
3. calcular una media por grupo.

---

## 21. Errores frecuentes

#### Comparar texto con número

Poco recomendable:

```spl
| where status>=400
```

Recomendado:

```spl
| eval status_num=tonumber(status)
| where status_num>=400
```

---

#### Dividir entre cero

Problemático:

```spl
| eval porcentaje=errores*100/total
```

Recomendado:

```spl
| eval porcentaje=if(
    total>0,
    round(errores*100/total, 2),
    0
)
```

---

#### Calcular latencia sobre valores vacíos

Problemático:

```spl
| stats avg(response_time)
```

Recomendado:

```spl
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(tiempo_ms)
| stats avg(tiempo_ms)
```

---

#### Sobrescribir el valor original

Poco recomendable:

```spl
| eval status=tonumber(status)
```

Recomendado:

```spl
| eval status_num=tonumber(status)
```

---

#### Orden incorrecto en `case`

Problemático:

```spl
| eval familia=case(
    status_num>=200, "2xx",
    status_num>=500, "5xx"
)
```

Correcto:

```spl
| eval familia=case(
    status_num>=500, "5xx",
    status_num>=400, "4xx",
    status_num>=200, "2xx",
    true(), "otro"
)
```

---

#### No distinguir cero de ausencia

Estos valores no siempre significan lo mismo:

```text
0
-
NULL
vacío
campo inexistente
```

Documenta el significado de cada uno.

---

#### Usar una función que requiere un campo inexistente

Antes de ejecutar:

```spl
| eval tiempo_ms=tonumber(response_time)
```

comprueba:

```spl
| fieldsummary
```

---

## 22. Ejercicios prácticos

#### Ejercicio 1: conversión de código HTTP

###### Objetivo

Convertir `status` a número y detectar valores inválidos.

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| eval resultado=if(
    status_num>=100 AND status_num<=599,
    "Válido",
    "Inválido"
)
| stats count by resultado
```

###### Preguntas

- ¿Hay valores inválidos?
- ¿Hay valores vacíos?
- ¿El campo original estaba almacenado como texto?

---

#### Ejercicio 2: clasificación HTTP

###### Objetivo

Agrupar respuestas por familia.

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
| stats count as total by familia
| sort - total
```

###### Preguntas

- ¿Qué familia es predominante?
- ¿Hay respuestas `5xx`?
- ¿Hay valores `otro`?

---

#### Ejercicio 3: porcentaje de error

###### Objetivo

Calcular la tasa global de errores.

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

###### Preguntas

- ¿Cuál es el porcentaje?
- ¿El porcentaje se calcula sobre todos los eventos?
- ¿Qué ocurre si no hay eventos?

---

#### Ejercicio 4: porcentaje por host

###### Objetivo

Comparar hosts con diferente volumen.

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

###### Preguntas

- ¿El host con más errores es también el de mayor porcentaje?
- ¿Qué métrica utilizarías para priorizar una investigación?
- ¿Hay suficientes eventos por host?

---

#### Ejercicio 5: análisis de latencia

###### Objetivo

Calcular métricas de rendimiento por URI.

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
| eval media_ms=round(media_ms, 2)
| sort - p95_ms
```

###### Preguntas

- ¿Qué URI tiene mayor `p95_ms`?
- ¿La media es superior o inferior a la mediana?
- ¿Existen valores extremos?
- ¿La unidad está documentada?

---

#### Ejercicio 6: calidad del dataset

###### Objetivo

Medir campos ausentes o inválidos.

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval tiempo_ms=tonumber(response_time)
| eval falta_uri=if(isnull(uri) OR trim(uri)="", 1, 0)
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
    count as total
    sum(falta_uri) as sin_uri
    sum(status_invalido) as status_invalidos
    sum(latencia_invalida) as latencias_invalidas
```

---

#### Ejercicio 7: normalizar métodos

###### Objetivo

Detectar métodos escritos con diferencias de mayúsculas o espacios.

```spl
index=curso earliest=0 latest=now
| eval metodo_original=method
| eval metodo_normalizado=upper(trim(method))
| stats count by metodo_original metodo_normalizado
```

###### Preguntas

- ¿Hay valores como `get`, `GET` o ` GET `?
- ¿La normalización cambia el resultado?
- ¿Debe corregirse el origen?

---

#### Ejercicio 8: construir un indicador operativo

###### Objetivo

Crear un estado de salud sencillo.

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
| eval estado=case(
    porcentaje_error>=10, "Crítico",
    porcentaje_error>=5, "Degradado",
    true(), "Normal"
)
| table total errores porcentaje_error estado
```

###### Importante

Los umbrales utilizados son didácticos. En producción deben basarse en:

- histórico;
- acuerdos de nivel de servicio;
- criticidad;
- comportamiento normal;
- volumen;
- impacto empresarial.

---

## 23. Ejemplos para dashboards

#### Indicador de porcentaje de error

```spl
index=curso earliest=$time.earliest$ latest=$time.latest$
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

#### Latencia p95 por URI

```spl
index=curso earliest=$time.earliest$ latest=$time.latest$
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(tiempo_ms)
| stats perc95(tiempo_ms) as p95_ms by uri
| sort - p95_ms
| head 10
```

#### Distribución por familia HTTP

```spl
index=curso earliest=$time.earliest$ latest=$time.latest$
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

Los tokens exactos dependen del tipo de dashboard utilizado.

---

## 24. Ejemplos para alertas

#### HTTP 500

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

#### Porcentaje de error elevado

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats
    count as total
    count(eval(status_num>=400)) as errores
| eval porcentaje_error=if(
    total>0,
    errores*100/total,
    0
)
| where porcentaje_error>=10
```

#### Latencia elevada

```spl
index=curso earliest=-5m latest=now
| eval tiempo_ms=tonumber(response_time)
| stats perc95(tiempo_ms) as p95_ms
| where p95_ms>1000
```

Estas alertas deben validarse con datos recientes y con datos históricos de
prueba.

---

## 25. Buenas prácticas

#### Utiliza nombres descriptivos

Recomendado:

```spl
| eval status_num=tonumber(status)
| eval porcentaje_error=...
| eval tiempo_ms=tonumber(response_time)
```

Evita:

```spl
| eval x=...
| eval y=...
| eval z=...
```

#### Conserva los campos originales

Recomendado:

```spl
| eval method_norm=upper(trim(method))
```

Así puedes comparar:

```spl
| table method method_norm
```

#### Comprueba valores nulos

Antes de calcular:

```spl
| where isnotnull(response_time)
```

#### Protege las divisiones

```spl
| eval ratio=if(total>0, errores/total, 0)
```

#### Documenta unidades

Si `response_time` está en milisegundos, utiliza nombres como:

```text
media_ms
p95_ms
maximo_ms
```

Si está en segundos, utiliza:

```text
media_s
p95_s
```

#### Comprueba la versión de Splunk

La disponibilidad de algunas funciones y el comportamiento de ciertas
expresiones puede variar entre versiones.

#### Prueba con pocos eventos

Comienza con:

```spl
| head 20
```

Después amplía el rango y elimina el límite cuando la lógica sea correcta.

---

## 26. Plantilla para documentar una función

```markdown
#### Función: nombre_funcion

###### Finalidad

Explicar qué problema resuelve.

###### Sintaxis

```spl
funcion(argumento)
```

###### Ejemplo

```spl
index=curso earliest=0 latest=now
| eval nuevo_campo=funcion(campo)
```

###### Resultado esperado

Describir el resultado.

###### Campos necesarios

- campo

###### Limitaciones

Indicar qué ocurre con valores nulos, inválidos o ausentes.

###### Uso en el proyecto

Explicar si se utiliza en una búsqueda, dashboard o alerta.
```

---

## 27. Lista de comprobación

#### Antes de utilizar una función

- [ ] El campo existe.
- [ ] El campo tiene el tipo de dato esperado.
- [ ] Se han comprobado los valores nulos.
- [ ] Se conocen las unidades.
- [ ] Se ha probado la función con pocos eventos.
- [ ] El resultado es interpretable.

#### Para funciones numéricas

- [ ] Se ha usado `tonumber()` cuando era necesario.
- [ ] Se han protegido las divisiones entre cero.
- [ ] Se han identificado valores inválidos.
- [ ] Se ha indicado la unidad.
- [ ] Se han redondeado los resultados para presentación.

#### Para funciones de texto

- [ ] Se ha comprobado el formato real.
- [ ] Se ha probado la expresión regular.
- [ ] Se han documentado los valores transformados.
- [ ] Se conserva el campo original cuando es útil.

#### Para funciones de tiempo

- [ ] Se ha comprobado la zona horaria.
- [ ] `_time` representa el momento correcto.
- [ ] El formato de fecha está documentado.
- [ ] El intervalo de búsqueda es adecuado.

#### Para funciones estadísticas

- [ ] Se ha seleccionado el campo correcto.
- [ ] Se han excluido valores no válidos.
- [ ] El volumen es suficiente.
- [ ] La métrica elegida responde a la pregunta.
- [ ] Se distingue entre media, mediana y percentiles.

---

## 28. Referencias oficiales

- [Splunk Enterprise Documentation](https://docs.splunk.com/Documentation/Splunk)
- [Splunk Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchapp)
- [Splunk Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)
- [Eval command](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Eval)
- [Eval functions](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/CommonEvalFunctions)
- [Statistical functions](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Statisticalfunctions)
- [Time functions](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Dateandtimefunctions)
- [Multivalue eval functions](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/MultivalueEvalFunctions)
- [`stats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Stats)
- [`eventstats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Eventstats)
- [`streamstats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Streamstats)
- [`timechart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart)
- [`rex`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Rex)
- [`fieldsummary`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fieldsummary)
- [Search Optimization](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutsearchoptimization)
- [Splunk Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)
- [Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/IntroFrame)
- [About Alerts](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Splunk REST API Reference](https://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTprolog)