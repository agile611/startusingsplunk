# Campos incorrectos

Cuando un campo falta, tiene otro nombre o contiene valores inesperados, no
empieces modificando la consulta final.

Primero determina en qué capa está el problema:

```text
Índice
  ↓
Tiempo
  ↓
Evento original (_raw)
  ↓
Source y sourcetype
  ↓
Parsing y extracción
  ↓
Tipo y calidad del valor
  ↓
Transformación SPL
  ↓
Objeto compartido y permisos
```

Una búsqueda puede funcionar para un evento y fallar para otro si la fuente
contiene varias formas de registro. Por eso debes probar ejemplos representativos
y no solo el primer resultado.

---

# 1. Objetivos de la práctica

Al finalizar esta guía, el asistente podrá:

- confirmar que existen eventos antes de investigar campos;
- comparar `_raw` con los campos extraídos;
- localizar campos mediante `fieldsummary`;
- distinguir un campo ausente de uno vacío;
- detectar nombres alternativos;
- normalizar campos con `coalesce`;
- convertir valores de texto a números;
- identificar valores no convertibles;
- probar extracciones temporales con `rex`;
- extraer valores JSON con `spath`;
- analizar problemas de CSV;
- comprobar `source` y `sourcetype`;
- diferenciar `eval` de una extracción reutilizable;
- comprobar el alcance y permisos de un objeto;
- probar una corrección con varios eventos;
- documentar limitaciones y decisiones técnicas.

---

# 2. Dataset de referencia

El laboratorio utiliza principalmente:

```text
index=curso
```

La estructura mínima esperada es:

```text
timestamp,host,method,status,uri
```

Ejemplo:

```text
timestamp,host,method,status,uri
2026-01-01T00:00:00Z,web-01,GET,200,/login
2026-01-01T00:01:00Z,web-01,GET,404,/missing
2026-01-01T00:02:00Z,web-02,POST,500,/api/users
```

El dataset ampliado puede contener:

```text
timestamp,host,method,status,uri,clientip,response_time,user_agent,bytes,referer
```

Ejemplo:

```text
timestamp,host,method,status,uri,clientip,response_time,user_agent,bytes,referer
2026-01-01T00:00:00Z,web-01,GET,200,/,192.0.2.10,120,Mozilla,1536,-
2026-01-01T00:01:00Z,web-01,GET,404,/missing,192.0.2.11,85,Mozilla,512,-
2026-01-01T00:02:00Z,web-02,POST,500,/api/users,192.0.2.12,2100,curl,256,-
```

Antes de utilizar un campo opcional, comprueba que realmente existe.

---

# 3. Síntomas habituales

Los siguientes síntomas requieren diagnósticos diferentes:

- `status=404` no encuentra eventos, pero `404` aparece en `_raw`;
- el campo aparece con otro nombre;
- `Status`, `status` y `HTTP_status` representan conceptos parecidos;
- `stats`, `sort` o las comparaciones numéricas producen resultados extraños;
- el campo está presente en unos eventos y ausente en otros;
- el campo aparece vacío;
- el administrador ve un campo que otro usuario no ve;
- un campo creado con `eval` desaparece al ejecutar otra búsqueda;
- el CSV se muestra como una única cadena;
- el JSON contiene datos, pero no aparecen como campos;
- una extracción funciona en una aplicación y no en otra.

No confundas:

- campo ausente;
- campo vacío;
- valor nulo;
- nombre incorrecto;
- tipo incorrecto;
- rango temporal vacío;
- índice sin eventos;
- índice sin permisos.

---

# 4. Primer diagnóstico: índice y tiempo

Antes de investigar campos, confirma que existen eventos visibles.

## 4.1 Búsqueda mínima

```spl
index=curso earliest=0 latest=now
| stats
    count as total
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

Formatear las fechas:

```spl
index=curso earliest=0 latest=now
| stats
    count as total
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
| eval primer_evento=strftime(
    primer_evento,
    "%Y-%m-%d %H:%M:%S"
)
| eval ultimo_evento=strftime(
    ultimo_evento,
    "%Y-%m-%d %H:%M:%S"
)
```

## 4.2 Si no devuelve resultados

Comprueba, en este orden:

1. que el índice sea realmente `curso`;
2. que el rango temporal incluya los eventos;
3. que los eventos no sean históricos;
4. que el usuario tenga acceso al índice;
5. que la entrada esté habilitada;
6. que el `sourcetype` sea el esperado;
7. que la ingesta haya terminado correctamente.

Búsqueda de diagnóstico:

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
```

Si sigue sin haber resultados, consulta:

```text
datos-no-aparecen.md
```

No investigues la extracción de campos hasta confirmar que hay eventos visibles.

---

# 5. Comparar `_raw` con los campos extraídos

La comparación entre el evento original y los campos es la prueba más importante.

```spl
index=curso earliest=0 latest=now
| table
    _time
    _raw
    host
    source
    sourcetype
    timestamp
    method
    status
    uri
| head 20
```

## 5.1 Interpretación

### El valor aparece en `_raw` y también como campo

La extracción funciona.

### El valor aparece en `_raw`, pero no como campo

Existe un problema de extracción, parsing o nombre del campo.

### El valor no aparece en `_raw`

El problema está probablemente en:

- fuente original;
- evento enviado;
- generación del dataset;
- transformación previa a la indexación;
- archivo incompleto.

### El campo aparece, pero con otro valor

Puede existir:

- extracción duplicada;
- prioridad incorrecta;
- transformación;
- conflicto entre fuentes;
- campo multivalor;
- valor calculado posterior.

## 5.2 Mostrar más eventos representativos

No utilices solo `head 1`.

```spl
index=curso earliest=0 latest=now
| table _time host source sourcetype _raw status uri
| sort 0 _time
| head 50
```

Para seleccionar eventos de varios hosts:

```spl
index=curso earliest=0 latest=now
| stats
    count
    values(status) as valores_status
    values(uri) as ejemplos_uri
    by host source sourcetype
```

---

# 6. Revisar los campos disponibles

## 6.1 Utilizar `fieldsummary`

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

La salida ayuda a revisar:

- nombre del campo;
- número de valores;
- cantidad de valores distintos;
- valores más frecuentes;
- presencia de nulos;
- cobertura aproximada.

## 6.2 Revisar nombres de campos

```spl
index=curso earliest=0 latest=now
| fieldsummary
| table field count distinct_count values
| sort field
```

La estructura exacta de la salida puede variar según la versión y el contexto.

## 6.3 Revisar campos concretos

```spl
index=curso earliest=0 latest=now
| table host method status uri
| head 20
```

## 6.4 Revisar la distribución de valores

```spl
index=curso earliest=0 latest=now
| stats count by host method status uri
| sort - count
```

Para una investigación más legible:

```spl
index=curso earliest=0 latest=now
| stats count by status
| sort status
```

```spl
index=curso earliest=0 latest=now
| stats count by method
| sort - count
```

```spl
index=curso earliest=0 latest=now
| stats count by uri
| sort - count
| head 20
```

---

# 7. Diferencias de nombres

Splunk trata estos nombres como campos distintos:

```text
clientip
client_ip
src_ip
source_ip
remote_addr
```

También son distintos:

```text
status
Status
STATUS
http_status
status_code
```

## 7.1 Detectar nombres alternativos

```spl
index=curso earliest=0 latest=now
| fieldsummary
| search
    field IN (
        "clientip",
        "client_ip",
        "src_ip",
        "source_ip",
        "remote_addr"
    )
```

## 7.2 Normalizar temporalmente con `coalesce`

```spl
index=curso earliest=0 latest=now
| eval ip_origen=coalesce(
    clientip,
    client_ip,
    src_ip,
    source_ip,
    remote_addr
)
| stats count by ip_origen
| sort - count
```

`coalesce` devuelve el primer valor no nulo de la lista.

## 7.3 Normalizar el estado HTTP

```spl
index=curso earliest=0 latest=now
| eval status_original=coalesce(
    status,
    Status,
    STATUS,
    http_status,
    status_code
)
| eval status_num=tonumber(status_original)
| stats count by status_original status_num
```

No publiques una normalización permanente hasta comprobar que:

- los nombres representan el mismo concepto;
- las unidades coinciden;
- los valores son compatibles;
- no se pierde información;
- se han revisado todas las fuentes.

---

# 8. Campos ausentes, vacíos y nulos

Un campo ausente no es exactamente lo mismo que un campo vacío.

## 8.1 Eventos en los que existe el campo

```spl
index=curso earliest=0 latest=now
| search status=*
| stats count
```

## 8.2 Eventos en los que no existe

```spl
index=curso earliest=0 latest=now
| search NOT status=*
| table _time _raw host source sourcetype
| head 20
```

## 8.3 Clasificación temporal del campo

```spl
index=curso earliest=0 latest=now
| eval estado_campo=case(
    isnull(status), "ausente",
    trim(status)="", "vacío",
    true(), "con valor"
)
| stats count by estado_campo
```

## 8.4 Revisar valores con espacios

```spl
index=curso earliest=0 latest=now
| eval status_limpio=trim(status)
| table status status_limpio
| head 30
```

## 8.5 Revisar caracteres invisibles

```spl
index=curso earliest=0 latest=now
| eval longitud_original=len(status)
| eval longitud_limpia=len(trim(status))
| where longitud_original!=longitud_limpia
| table status longitud_original longitud_limpia _raw
```

## 8.6 Revisar valores literales inesperados

```spl
index=curso earliest=0 latest=now
| search status IN ("NULL", "null", "N/A", "-", "unknown")
| table _time status uri _raw
```

No asumas que una cadena como `NULL` equivale automáticamente a un valor nulo.

---

# 9. `fillnull`: utilidad y riesgo

`fillnull` puede ser útil para presentar resultados, pero no debe utilizarse para
ocultar un problema de ingesta.

## 9.1 Ejemplo de presentación

```spl
index=curso earliest=0 latest=now
| stats count by host status
| fillnull value="sin_valor" status
```

## 9.2 Riesgo

Si utilizas:

```spl
| fillnull value=0 response_time
```

puedes hacer que parezca que los eventos sin latencia tienen una latencia de
cero milisegundos. Eso sería incorrecto desde el punto de vista operativo.

## 9.3 Uso recomendado

Utiliza `fillnull` solo cuando:

- conozcas el significado de la ausencia;
- la finalidad sea presentación o agrupación;
- se documente la sustitución;
- no se confunda ausencia con un valor real.

---

# 10. Tipos de datos incorrectos

Un código HTTP puede llegar como texto:

```text
"404"
```

Para comparaciones numéricas, conviértelo de forma explícita.

## 10.1 Revisar valores originales

```spl
index=curso earliest=0 latest=now
| table status
| head 30
```

## 10.2 Convertir temporalmente

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| table _time host status status_num uri
| head 30
```

## 10.3 Filtrar errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| where status_num>=400
| table _time host status status_num uri
```

## 10.4 Detectar valores no convertibles

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| where isnotnull(status) AND isnull(status_num)
| table _time status status_num uri _raw
```

## 10.5 Validar códigos HTTP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| where
    isnull(status_num)
    OR status_num<100
    OR status_num>599
| table _time status status_num uri _raw
```

## 10.6 Latencia como número

```spl
index=curso earliest=0 latest=now
| eval response_time_num=tonumber(trim(response_time))
| where isnotnull(response_time)
| table _time response_time response_time_num uri
| head 30
```

Si la latencia incluye unidades:

```text
120ms
2.5s
```

`tonumber` puede no interpretarla correctamente. Es necesario limpiar o convertir
la unidad antes de calcular.

Ejemplo para valores terminados en `ms`:

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(
    replace(response_time, "ms$", "")
)
| table response_time tiempo_ms
```

Ejemplo para valores terminados en segundos:

```spl
index=curso earliest=0 latest=now
| rex field=response_time
    "^(?<segundos>[0-9.]+)s$"
| eval tiempo_ms=tonumber(segundos)*1000
| table response_time segundos tiempo_ms
```

No mezcles milisegundos y segundos sin normalización.

---

# 11. CSV mal interpretado

Si todo el CSV aparece como una sola columna, revisa:

- delimitador;
- uso de cabecera;
- comillas;
- comas internas;
- saltos de línea;
- codificación;
- `sourcetype`;
- configuración de la entrada;
- archivo realmente ingerido;
- `source` e índice.

## 11.1 Evento correcto

```text
timestamp,host,method,status,uri
2026-01-01T00:00:00Z,web-01,GET,200,/login
```

## 11.2 Evento problemático

```text
timestamp,host,method,status,uri 2026-01-01T00:00:00Z web-01 GET 200 /login
```

Posibles problemas:

- delimitador diferente;
- archivo no es CSV;
- cabecera y datos mezclados;
- parsing incorrecto.

## 11.3 Inspeccionar el archivo en Ubuntu

```bash
head -n 10 /var/log/splunk-curso/eventos_web.csv
```

Mostrar caracteres especiales:

```bash
cat -A /var/log/splunk-curso/eventos_web.csv | head -n 10
```

Comprobar tipo de archivo:

```bash
file /var/log/splunk-curso/eventos_web.csv
```

Comprobar número de columnas con `awk`:

```bash
awk -F',' '{print NF}' \
  /var/log/splunk-curso/eventos_web.csv \
  | sort | uniq -c
```

Si el número de columnas cambia, puede haber:

- comas dentro de valores;
- comillas mal cerradas;
- líneas corruptas;
- registros con estructura variable.

## 11.4 Extracción temporal con `rex`

Para un CSV simple sin comas internas:

```spl
index=curso earliest=0 latest=now
| rex field=_raw
    "^(?<timestamp_temp>[^,]+),(?<host_temp>[^,]+),(?<method_temp>[^,]+),(?<status_temp>[0-9]+),(?<uri_temp>[^,]+)$"
| table
    _raw
    timestamp_temp
    host_temp
    method_temp
    status_temp
    uri_temp
| head 20
```

Esta técnica sirve para diagnosticar, no para sustituir automáticamente una
configuración correcta de CSV complejo.

## 11.5 Comparar extracción temporal con campos originales

```spl
index=curso earliest=0 latest=now
| rex field=_raw
    "^(?<timestamp_temp>[^,]+),(?<host_temp>[^,]+),(?<method_temp>[^,]+),(?<status_temp>[0-9]+),(?<uri_temp>[^,]+)$"
| table
    _raw
    host
    host_temp
    status
    status_temp
    uri
    uri_temp
| head 30
```

---

# 12. Problemas con cabeceras CSV

Algunos archivos contienen una cabecera:

```text
timestamp,host,method,status,uri
```

Otros no:

```text
2026-01-01T00:00:00Z,web-01,GET,200,/login
```

Antes de configurar la extracción, determina:

- si existe cabecera;
- si se está indexando como evento;
- si la cabecera aparece repetida;
- si la cabecera se está tratando como un evento normal.

## Detectar cabeceras repetidas

```spl
index=curso earliest=0 latest=now
| search _raw="timestamp,host,method,status,uri"
| stats count
```

## Excluir temporalmente la cabecera

```spl
index=curso earliest=0 latest=now
| where NOT match(
    _raw,
    "^timestamp,host,method,status,uri$"
)
| stats count
```

La exclusión en SPL no corrige la entrada. Es únicamente una solución temporal para
el análisis.

---

# 13. JSON y estructuras anidadas

Si el evento es JSON, comprueba primero el `sourcetype` y el contenido original.

Ejemplo:

```json
{
  "timestamp": "2026-01-01T00:00:00Z",
  "request": {
    "method": "GET",
    "uri": "/api/users"
  },
  "response": {
    "status": 500,
    "duration_ms": 1200
  }
}
```

## 13.1 Revisar el evento

```spl
index=curso earliest=0 latest=now
| table _raw sourcetype
| head 10
```

## 13.2 Extraer campos con `spath`

```spl
index=curso sourcetype=json earliest=0 latest=now
| spath input=_raw path=request.method output=method_json
| spath input=_raw path=request.uri output=uri_json
| spath input=_raw path=response.status output=status_json
| spath input=_raw path=response.duration_ms output=duration_json
| table
    method_json
    uri_json
    status_json
    duration_json
```

## 13.3 Intentar parsear JSON inválido

```spl
index=curso sourcetype=json earliest=0 latest=now
| spath
| table _raw
| head 20
```

Si no se extraen campos, comprueba:

- JSON válido;
- comillas;
- llaves;
- encoding;
- `sourcetype`;
- estructura;
- múltiples objetos por evento.

## 13.4 No utilizar `spath` como solución universal

No utilices:

```spl
| spath
```

sobre:

- CSV;
- texto plano;
- logs separados por espacios;
- eventos con sintaxis no JSON.

El comando debe corresponder al formato real de la fuente.

---

# 14. Extracción temporal con `rex`

`rex` es útil para verificar rápidamente si un patrón puede extraerse.

## 14.1 Extraer código HTTP

```spl
index=curso earliest=0 latest=now
| rex field=_raw
    "(?<status_temp>\b[1-5][0-9]{2}\b)"
| table _raw status_temp
| head 20
```

## 14.2 Extraer una URI

```spl
index=curso earliest=0 latest=now
| rex field=_raw
    "(?<uri_temp>/[A-Za-z0-9_./?-]+)"
| table _raw uri_temp
| head 20
```

## 14.3 Extraer desde texto clave-valor

Para un evento como:

```text
method=GET status=500 uri=/api/users host=web-01
```

usa:

```spl
index=curso earliest=0 latest=now
| rex field=_raw "method=(?<method_temp>\S+)"
| rex field=_raw "status=(?<status_temp>\d+)"
| rex field=_raw "uri=(?<uri_temp>\S+)"
| rex field=_raw "host=(?<host_temp>\S+)"
| table method_temp status_temp uri_temp host_temp
```

## 14.4 Comparar varios patrones

```spl
index=curso earliest=0 latest=now
| rex field=_raw "status=(?<status_kv>\d+)"
| rex field=_raw
    "^[^,]+,[^,]+,[^,]+,(?<status_csv>\d+),"
| table _raw status_kv status_csv
| head 30
```

La comparación ayuda a detectar si la fuente contiene más de un formato.

---

# 15. Diferenciar `eval` de una extracción reutilizable

## 15.1 Campo creado con `eval`

```spl
index=curso earliest=0 latest=now
| eval categoria=if(
    tonumber(status)>=400,
    "error",
    "correcto"
)
| table status categoria
```

`categoria` solo existe dentro de los resultados de esta búsqueda.

Si ejecutas otra búsqueda independiente:

```spl
index=curso earliest=0 latest=now
| table categoria
```

es posible que no aparezca.

## 15.2 Cuándo utilizar `eval`

Utiliza `eval` para:

- cálculos específicos;
- prototipos;
- paneles;
- búsquedas puntuales;
- normalización temporal;
- clasificación de resultados.

## 15.3 Cuándo considerar una extracción reutilizable

Considera una extracción reutilizable cuando:

- muchos usuarios necesitan el campo;
- varias búsquedas repiten el mismo patrón;
- el campo forma parte del modelo de datos;
- el formato de la fuente es estable;
- el campo debe estar disponible en dashboards y alertas;
- el patrón se ha probado con suficientes eventos.

## 15.4 No convertir automáticamente todo `eval` en configuración

Antes de publicar una extracción:

1. verifica el formato;
2. prueba variantes;
3. revisa rendimiento;
4. determina el alcance;
5. documenta el `sourcetype`;
6. prueba con el rol final;
7. valida en la aplicación adecuada.

---

# 16. `sourcetype`, `source` y `host`

Estos metadatos son esenciales para localizar la causa del problema.

## 16.1 Revisar distribución

```spl
index=curso earliest=0 latest=now
| stats count by sourcetype source host
| sort - count
```

## 16.2 Comparar campos por `sourcetype`

```spl
index=curso earliest=0 latest=now
| stats
    count
    dc(status) as status_distintos
    dc(uri) as uri_distintas
    values(method) as metodos
    by sourcetype
```

## 16.3 Comparar `_raw` por fuente

```spl
index=curso earliest=0 latest=now
| stats
    count
    values(sourcetype) as sourcetypes
    values(_raw) as ejemplos
    by source
```

## 16.4 El mismo archivo con varios `sourcetype`

```spl
index=curso earliest=0 latest=now
| stats count by source sourcetype
| sort source - count
```

Si una misma fuente llega con varios `sourcetype`, pueden producirse:

- extracciones diferentes;
- parsing diferente;
- campos presentes en unos eventos y ausentes en otros;
- resultados incoherentes.

---

# 17. Revisar la configuración efectiva

Como administrador, puedes revisar las configuraciones con `btool`.

## 17.1 Revisar `props.conf`

```bash
sudo /opt/splunk/bin/splunk btool props list --debug
```

Filtrar por el `sourcetype` del curso:

```bash
sudo /opt/splunk/bin/splunk btool props list web:csv --debug
```

## 17.2 Revisar `transforms.conf`

```bash
sudo /opt/splunk/bin/splunk btool transforms list --debug
```

## 17.3 Revisar entradas

```bash
sudo /opt/splunk/bin/splunk btool inputs list --debug
```

## 17.4 Buscar una configuración concreta

```bash
sudo /opt/splunk/bin/splunk btool props list --debug \
  | grep -iE 'web:csv|REPORT-|EXTRACT-|FIELDALIAS'
```

El parámetro `--debug` ayuda a saber qué archivo aporta cada valor.

No modifiques parsing global para arreglar una consulta aislada sin comprobar el
impacto en otras fuentes y aplicaciones.

---

# 18. Tipos de extracción reutilizable

Según el caso, una extracción puede implementarse mediante:

- configuración de `props.conf`;
- configuración de `transforms.conf`;
- extracción desde Splunk Web;
- alias de campos;
- campos calculados;
- macros;
- conocimiento asociado a una aplicación;
- conocimiento asociado a un `sourcetype`.

La elección depende de:

- formato;
- etapa de extracción;
- reutilización;
- rendimiento;
- permisos;
- mantenimiento;
- necesidad de almacenar o no el campo.

## 18.1 Diferencia entre alias y extracción

### Alias

Utiliza varios nombres para el mismo concepto.

Ejemplo conceptual:

```text
client_ip → clientip
```

### Extracción

Obtiene un valor desde `_raw` o desde la estructura del evento.

Ejemplo:

```text
status=500
```

extraído desde:

```text
method=GET status=500 uri=/api/users
```

No utilices un alias para resolver un campo que nunca se ha extraído.

---

# 19. Comprobar permisos y contexto

Los campos creados como objetos de conocimiento pueden depender de:

- aplicación;
- propietario;
- ámbito;
- permisos de lectura;
- `sourcetype`;
- usuario;
- rol.

## 19.1 Revisar el usuario actual

```spl
| rest /services/authentication/current-context
| table username roles
```

## 19.2 Comparar con un usuario final

Ejecuta la misma búsqueda con:

- usuario administrador;
- usuario operativo;
- usuario de visualización.

Documenta:

```text
Usuario:
Rol:
Aplicación:
Índice:
Sourcetype:
Campo visible:
Resultado:
```

## 19.3 Síntoma: Admin ve el campo y otro usuario no

Comprueba:

1. que ambos utilizan el mismo índice;
2. que ambos utilizan el mismo rango temporal;
3. que ambos están en la misma aplicación;
4. que el objeto está compartido;
5. que el objeto permite lectura;
6. que el `sourcetype` coincide;
7. que el usuario puede ejecutar la extracción;
8. que no depende de una búsqueda privada.

No concedas `admin` como solución permanente. El objetivo es corregir el alcance
del objeto o el rol necesario.

---

# 20. Campos calculados y objetos compartidos

Un campo puede estar definido como:

- extracción de búsqueda;
- campo calculado;
- alias;
- objeto privado;
- objeto compartido con una aplicación;
- objeto global.

## 20.1 Problemas habituales

- funciona para el propietario, pero no para otros usuarios;
- funciona en Search, pero no en un dashboard;
- funciona en una aplicación, pero no en otra;
- funciona en una búsqueda guardada, pero no en una alerta;
- está definido en `local`, pero no en el entorno esperado.

## 20.2 Lista de comprobación del objeto

Comprueba:

- propietario;
- aplicación;
- permisos;
- estado activo;
- `sourcetype`;
- patrón;
- campo de origen;
- campo de destino;
- dependencia de otros objetos;
- alcance temporal de la prueba.

---

# 21. Campos multivalor

A veces un campo contiene varios valores.

Ejemplo conceptual:

```text
status=200 status=404
```

## 21.1 Revisar el tipo de contenido

```spl
index=curso earliest=0 latest=now
| table _time status uri
| head 20
```

## 21.2 Contar valores

```spl
index=curso earliest=0 latest=now
| eval cantidad_status=mvcount(status)
| table _time status cantidad_status
```

## 21.3 Seleccionar un valor

```spl
index=curso earliest=0 latest=now
| eval primer_status=mvindex(status, 0)
| table status primer_status
```

## 21.4 Unir valores

```spl
index=curso earliest=0 latest=now
| eval status_texto=mvjoin(status, ",")
| table status status_texto
```

No apliques `tonumber` a un campo multivalor sin decidir antes qué valor debe
utilizarse.

---

# 22. Errores frecuentes con `table`

`table` puede ocultar información durante la investigación.

## 22.1 Consulta demasiado limitada

```spl
index=curso earliest=0 latest=now
| table status uri
```

Si el problema está en `source`, `sourcetype` o `_raw`, no los verás.

## 22.2 Consulta recomendada para diagnóstico

```spl
index=curso earliest=0 latest=now
| table
    _time
    _raw
    index
    host
    source
    sourcetype
    method
    status
    uri
| head 30
```

Durante la investigación, conserva contexto. Después puedes reducir los campos para
el panel o el reporte final.

---

# 23. Diagnóstico de campos con una consulta unificada

La siguiente búsqueda resume varios problemas de calidad:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| eval status_ausente=if(isnull(status), 1, 0)
| eval status_vacio=if(
    isnotnull(status) AND trim(status)="",
    1,
    0
)
| eval status_no_numerico=if(
    isnotnull(status)
    AND trim(status)!=""
    AND isnull(status_num),
    1,
    0
)
| eval uri_ausente=if(isnull(uri), 1, 0)
| eval uri_vacia=if(
    isnotnull(uri) AND trim(uri)="",
    1,
    0
)
| stats
    count as total_eventos
    sum(status_ausente) as status_ausente
    sum(status_vacio) as status_vacio
    sum(status_no_numerico) as status_no_numerico
    sum(uri_ausente) as uri_ausente
    sum(uri_vacia) as uri_vacia
```

Esta consulta no corrige la fuente. Solo ayuda a medir el problema.

---

# 24. Procedimiento de corrección

Aplica este orden:

## Paso 1: guardar evidencia

Conserva:

- consulta;
- `_raw`;
- `source`;
- `sourcetype`;
- `_time`;
- usuario;
- aplicación;
- resultado observado.

## Paso 2: confirmar el origen

```spl
index=curso earliest=0 latest=now
| stats count by index source sourcetype host
```

## Paso 3: verificar si el dato existe

```spl
index=curso earliest=0 latest=now
| table _raw
| head 20
```

## Paso 4: probar una extracción temporal

Utiliza:

```spl
| rex
```

o:

```spl
| spath
```

según el formato real.

## Paso 5: validar cobertura

Prueba:

- evento correcto;
- evento con error;
- host diferente;
- URI diferente;
- evento incompleto;
- variante de formato;
- valores nulos;
- valor con espacios.

## Paso 6: validar el tipo

```spl
| eval status_num=tonumber(status)
```

## Paso 7: decidir si hace falta una configuración reutilizable

Solo publícala si el patrón es estable y suficientemente probado.

## Paso 8: publicar con alcance correcto

Define:

- aplicación;
- propietario;
- permisos;
- `sourcetype`;
- documentación;
- procedimiento de rollback.

## Paso 9: repetir la prueba con el rol final

No pruebes únicamente con `admin`.

## Paso 10: documentar el cambio

Indica:

- problema;
- causa;
- corrección;
- archivos u objetos modificados;
- pruebas;
- limitaciones;
- fecha;
- responsable.

---

# 25. Tabla de diagnóstico

| Síntoma | Causa probable | Acción |
|---|---|---|
| Campo no existe | No hay extracción o el nombre es incorrecto | Revisar `_raw`, `fieldsummary` y `sourcetype` |
| Valor aparece en `_raw`, pero no se puede filtrar | Extracción ausente o incorrecta | Probar `rex` y revisar configuración |
| Campo tiene otro nombre | Fuentes con esquemas diferentes | Usar `coalesce` temporalmente y documentar |
| Comparación numérica incorrecta | Campo textual o con valores mixtos | Aplicar `tonumber` y revisar nulos |
| Solo algunos eventos tienen campo | Variantes de formato | Comparar `source`, `sourcetype` y `_raw` |
| Campo aparece vacío | Cadena vacía, separador o parsing incorrecto | Comparar `isnull`, `trim` y `_raw` |
| CSV queda en una sola columna | Delimitador o parsing incorrecto | Revisar archivo y entrada |
| JSON no se separa | Ruta o formato incorrecto | Confirmar JSON y usar `spath` |
| `eval` funciona solo en una búsqueda | Campo temporal | Repetir `eval` o crear extracción reutilizable |
| Admin ve el campo y otro usuario no | Objeto privado o ámbito incorrecto | Revisar aplicación y permisos |
| Campo multivalor genera cálculos extraños | Se trata como escalar | Usar `mvindex`, `mvcount` o `mvjoin` |
| Campo desaparece en un panel | Token, aplicación o extracción no compartida | Probar la búsqueda fuera del dashboard |
| Campo aparece con datos antiguos | Caché, objeto no actualizado o rango incorrecto | Revisar tiempo, búsqueda y configuración efectiva |

---

# 26. Ejercicio práctico 1: comparar `_raw` y campos

## Objetivo

Determinar si el problema está en el evento o en la extracción.

## Consulta

```spl
index=curso earliest=0 latest=now
| table
    _time
    _raw
    host
    source
    sourcetype
    method
    status
    uri
| head 30
```

## Preguntas

- ¿aparece `status` en `_raw`?
- ¿aparece también como campo?
- ¿coinciden los valores?
- ¿todos los eventos tienen la misma estructura?
- ¿existen varias fuentes o `sourcetype`?

---

# 27. Ejercicio práctico 2: detectar campos ausentes y vacíos

## Consulta

```spl
index=curso earliest=0 latest=now
| eval estado_status=case(
    isnull(status), "ausente",
    trim(status)="", "vacío",
    true(), "con valor"
)
| stats count by estado_status
```

## Extensión

```spl
index=curso earliest=0 latest=now
| eval estado_uri=case(
    isnull(uri), "ausente",
    trim(uri)="", "vacío",
    true(), "con valor"
)
| stats count by estado_uri
```

## Entrega

Documenta el número de eventos en cada categoría y explica si el problema parece
de fuente, parsing o calidad de datos.

---

# 28. Ejercicio práctico 3: normalizar nombres alternativos

## Consulta

```spl
index=curso earliest=0 latest=now
| eval ip_origen=coalesce(
    clientip,
    client_ip,
    src_ip,
    source_ip
)
| stats
    count as peticiones
    dc(ip_origen) as ips_distintas
    by host
| sort - peticiones
```

## Preguntas

- ¿qué nombre existe realmente?
- ¿hay eventos con más de un nombre?
- ¿hay eventos sin IP?
- ¿la normalización oculta diferencias entre fuentes?

---

# 29. Ejercicio práctico 4: detectar tipos incorrectos

## Consulta

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| eval tipo_status=case(
    isnull(status), "ausente",
    trim(status)="", "vacío",
    isnull(status_num), "no_numérico",
    status_num<100 OR status_num>599, "fuera_de_rango",
    true(), "válido"
)
| stats count by tipo_status
```

## Preguntas

- ¿hay valores no numéricos?
- ¿hay códigos fuera de rango?
- ¿la alerta de HTTP 500 podría omitir eventos?
- ¿qué impacto tendría corregir el campo?

---

# 30. Ejercicio práctico 5: probar `rex`

## Consulta

```spl
index=curso earliest=0 latest=now
| rex field=_raw
    "^(?<timestamp_temp>[^,]+),(?<host_temp>[^,]+),(?<method_temp>[^,]+),(?<status_temp>[0-9]+),(?<uri_temp>[^,]+)$"
| table
    _raw
    host
    host_temp
    status
    status_temp
    uri
    uri_temp
| head 30
```

## Interpretación

Si `host_temp`, `status_temp` y `uri_temp` aparecen correctamente, pero los
campos originales no, el problema está en la extracción reutilizable o en el
parsing asociado a la fuente.

---

# 31. Ejercicio práctico 6: probar `spath`

## Consulta

```spl
index=curso sourcetype=json earliest=0 latest=now
| spath input=_raw path=request.method output=method_json
| spath input=_raw path=request.uri output=uri_json
| spath input=_raw path=response.status output=status_json
| table _raw method_json uri_json status_json
| head 20
```

## Preguntas

- ¿el evento es JSON válido?
- ¿las rutas son correctas?
- ¿el `sourcetype` es correcto?
- ¿los nombres de las claves coinciden?
- ¿el valor está anidado en otra ruta?

---

# 32. Ejercicio práctico 7: comprobar permisos

## Objetivo

Comprobar si el problema depende del usuario.

## Con el administrador

```spl
| rest /services/authentication/current-context
| table username roles
```

Ejecuta:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Después repite las mismas búsquedas con un usuario final.

## Documenta

```text
Usuario administrador:
Roles:
Aplicación:
Índice:
Campos visibles:

Usuario final:
Roles:
Aplicación:
Índice:
Campos visibles:

Diferencia observada:
```

No conviertas el usuario final en `admin` para ocultar una mala configuración de
permisos.

---

# 33. Plantilla de documentación del problema

```markdown
# Incidencia de campo

## Fecha

Completar.

## Usuario

Completar.

## Aplicación

Completar.

## Índice

curso

## Sourcetype

Completar.

## Source

Completar.

## Campo afectado

Completar.

## Síntoma

Describir el comportamiento.

## Consulta original

```spl
Completar.
```

## Evento `_raw`

```text
Completar sin datos sensibles.
```

## Campo extraído

```text
Completar.
```

## Diagnóstico

Indicar si el problema está en:

- fuente;
- evento;
- parsing;
- extracción;
- tipo;
- transformación;
- permisos.

## Prueba temporal

```spl
Completar.
```

## Corrección aplicada

Describirla.

## Aplicación y alcance

Completar.

## Permisos

Completar.

## Validación con varios eventos

Describirla.

## Validación con el rol final

Describirla.

## Limitaciones

Completar.

## Rollback

Describir cómo deshacer el cambio.
```

---

# 34. Buenas prácticas

- Compara siempre `_raw` con los campos extraídos.
- Confirma índice y tiempo antes de investigar la extracción.
- Comprueba `source`, `sourcetype` y `host`.
- Prueba varios eventos y varias variantes de formato.
- Distingue campos ausentes, vacíos y nulos.
- Utiliza `trim` para detectar espacios no visibles.
- Utiliza `tonumber` antes de realizar comparaciones numéricas.
- Detecta valores no convertibles antes de filtrar.
- Utiliza `coalesce` como normalización temporal y documentada.
- Usa `rex` o `spath` para diagnosticar antes de publicar cambios.
- Conserva los campos originales durante la investigación.
- No uses `fillnull` para ocultar errores de ingesta.
- No utilices `spath` sobre formatos que no son JSON.
- No trates una extracción temporal como solución definitiva.
- Revisa la configuración efectiva con `btool`.
- Prueba los objetos con el rol final.
- No concedas `admin` como solución permanente.
- Define correctamente aplicación, propietario y permisos.
- Documenta el formato esperado de la fuente.
- Valida el cambio después de publicarlo.
- Prepara un rollback antes de modificar configuración global.

---

# 35. Referencias oficiales

- [Extracción de campos](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Extractfields)
- [Operaciones de búsqueda en tiempo de búsqueda](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Searchtimeoperations)
- [Comando `rex`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Rex)
- [Comando `spath`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Spath)
- [Comando `fieldsummary`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fieldsummary)
- [Comando `eval`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Eval)
- [Comando `fillnull`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fillnull)
- [Comando `coalesce`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/CommonEvalFunctions)
- [Referencia de `props.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Propsconf)
- [Referencia de `transforms.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Transformsconf)
- [Búsqueda y extracción de campos](https://help.splunk.com/en/splunk-enterprise/search/search-manual/10.0/fields-and-lookups/about-fields)
- [Knowledge Objects](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)
- [Usuarios, roles y capacidades](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Referencia de la REST API](https://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTprolog)

---

# 36. Lista de comprobación final

## Existencia de eventos

- [ ] El índice es correcto.
- [ ] El rango temporal contiene eventos.
- [ ] El usuario puede buscar el índice.
- [ ] Se ha comprobado `_raw`.

## Extracción

- [ ] El dato existe en `_raw`.
- [ ] El `sourcetype` es correcto.
- [ ] El nombre del campo coincide.
- [ ] Se han revisado `source` y `host`.
- [ ] Se han probado varios eventos.
- [ ] Se han comparado variantes de formato.

## Calidad

- [ ] Se han detectado campos ausentes.
- [ ] Se han detectado campos vacíos.
- [ ] Se han detectado valores no numéricos.
- [ ] Se han revisado unidades.
- [ ] Se han validado códigos HTTP.
- [ ] Se han tratado los valores nulos.

## Corrección

- [ ] Se ha probado `rex` o `spath` temporalmente.
- [ ] Se ha validado la cobertura.
- [ ] Se ha decidido si hace falta una extracción reutilizable.
- [ ] Se ha revisado `btool`.
- [ ] Se ha definido el alcance.
- [ ] Se ha definido el propietario.
- [ ] Se han revisado los permisos.
- [ ] Se ha preparado rollback.

## Validación

- [ ] La prueba funciona con varios eventos.
- [ ] Funciona para todas las fuentes previstas.
- [ ] Funciona con el rol final.
- [ ] Funciona en el dashboard o alerta correspondiente.
- [ ] La documentación está actualizada.
- [ ] Las limitaciones están explicadas.