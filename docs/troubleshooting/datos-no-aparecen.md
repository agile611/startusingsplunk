# Datos no aparecen

Cuando una búsqueda no devuelve eventos, no reinstales Splunk ni vuelvas a cargar
el archivo inmediatamente.

Primero separa estas situaciones:

1. La fuente no está llegando a Splunk.
2. Los eventos están en otro índice.
3. Los eventos existen, pero quedan fuera del intervalo temporal.
4. El usuario no tiene permisos para leerlos.
5. El `source` o `sourcetype` no es el esperado.
6. Un campo, filtro o condición elimina los resultados.
7. Los eventos están duplicados o se han ingerido con una configuración incorrecta.

El flujo recomendado es:

```text
Servicio
    ↓
Entrada
    ↓
Archivo o fuente
    ↓
Índice
    ↓
Rango temporal
    ↓
Permisos
    ↓
Campos
    ↓
Filtros
    ↓
Dashboard, reporte o alerta
```

Cargar varias veces el mismo dataset puede crear duplicados y complicar el
diagnóstico. Antes de repetir una ingesta, demuestra dónde está el problema.

---

## 1. Objetivos de la práctica

Al finalizar esta guía, el asistente podrá:

- comprobar que Splunk está activo;
- validar una búsqueda mínima;
- localizar eventos sin filtros complejos;
- ampliar correctamente el rango temporal;
- comprobar `_time` e `_indextime`;
- identificar índice, `source`, `sourcetype` y `host`;
- revisar una entrada de datos;
- comprobar permisos de archivos;
- revisar permisos de Splunk;
- consultar índices mediante REST;
- revisar entradas monitorizadas;
- comparar `_raw` con campos extraídos;
- añadir filtros progresivamente;
- identificar problemas de timestamp;
- detectar duplicados potenciales;
- revisar logs internos;
- documentar una causa raíz;
- cerrar una incidencia con evidencias reproducibles.

---

## 2. Entorno de referencia

El laboratorio utiliza:

- Splunk Enterprise 10.4.3.
- Ubuntu 24.04.5 LTS.
- Índice principal: `curso`.
- Instalación habitual: `/opt/splunk`.
- Dataset de aplicación web.
- Usuario de configuración: `admin`.
- Usuario de validación: un rol con permisos limitados.

El dataset mínimo tiene una estructura similar a:

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

---

## 3. Regla principal: empieza con la búsqueda mínima

No comiences con:

```spl
index=curso status=404 sourcetype=web:csv uri="/missing"
```

Esa consulta puede ocultar el origen del problema porque combina demasiadas
condiciones.

Empieza con:

```spl
index=curso earliest=0 latest=now
| head 20
```

Después:

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

Si estas búsquedas no devuelven resultados, todavía no investigues:

- `status`;
- `uri`;
- `rex`;
- `spath`;
- dashboards;
- alertas;
- expresiones regulares.

Primero demuestra que existen eventos visibles.

---

## 4. Paso 1: confirmar que Splunk está activo

#### 4.1 Revisar el servicio con systemd

```bash
sudo systemctl status Splunkd
```

Resultado esperado:

```text
Active: active (running)
```

#### 4.2 Revisar el estado mediante el binario

Si Splunk se ejecuta como usuario `splunk`:

```bash
sudo -u splunk /opt/splunk/bin/splunk status
```

Si se ejecuta como `root`:

```bash
sudo /opt/splunk/bin/splunk status --run-as-root
```

El comando debe ser coherente con el usuario propietario de la instalación.

#### 4.3 Identificar el usuario del proceso

```bash
ps -eo user,pid,ppid,cmd | grep -i '[s]plunk'
```

Comprobar el propietario de la instalación:

```bash
stat -c '%U:%G %n' /opt/splunk
```

#### 4.4 Si Splunk no está activo

Revisa:

```bash
sudo journalctl -u Splunkd --since "30 minutes ago" --no-pager
```

Y:

```bash
sudo tail -n 100 /opt/splunk/var/log/splunk/splunkd.log
```

Si Splunk Web responde, pero no hay datos, el problema puede estar en:

- entrada;
- índice;
- rango temporal;
- permisos;
- parsing;
- consulta.

No confundas disponibilidad de Splunk Web con disponibilidad de los datos.

---

## 5. Paso 2: validar el índice

#### 5.1 Buscar en el índice del laboratorio

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

#### 5.2 Consultar la existencia del índice

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

#### 5.3 Interpretar el resultado

| Resultado | Significado probable |
|---|---|
| No existe `curso` | El índice no se ha creado o el usuario no puede verlo |
| `disabled=1` | El índice está deshabilitado |
| `totalEventCount=0` | No hay eventos indexados o el contador aún no se ha actualizado |
| Hay eventos, pero la búsqueda no devuelve datos | Rango, permisos o filtros |
| El índice existe con otro nombre | La entrada puede apuntar a otro índice |

#### 5.4 Revisar índices visibles para el usuario

```spl
| rest /services/data/indexes
| table title disabled
| sort title
```

La respuesta depende de los permisos del usuario.

#### 5.5 No utilizar `index=*` como primera prueba

Evita empezar con:

```spl
index=*
| stats count
```

Puede:

- recorrer muchos índices;
- mezclar fuentes;
- tardar demasiado;
- ocultar el índice correcto;
- generar resultados difíciles de interpretar.

Utiliza una búsqueda amplia solo cuando exista una razón de diagnóstico concreta
y el intervalo esté limitado.

---

## 6. Paso 3: revisar el rango temporal

Una búsqueda puede estar funcionando correctamente y devolver cero resultados
porque los eventos están fuera del intervalo seleccionado.

#### 6.1 Buscar en todo el tiempo

Para una primera comprobación controlada:

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

En Splunk Web también puedes seleccionar:

```text
Todo el tiempo
```

No mantengas un rango ilimitado como consulta operativa habitual. Úsalo para
diagnóstico y después reduce el intervalo.

#### 6.2 Consultar el primer y último evento

```spl
index=curso earliest=0 latest=now
| stats
    count as total_eventos
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

Formatear las fechas:

```spl
index=curso earliest=0 latest=now
| stats
    count as total_eventos
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

#### 6.3 Dataset histórico

Si el archivo contiene eventos del 1 de enero de 2026, una búsqueda como esta:

```spl
index=curso earliest=-24h latest=now
```

puede no encontrar nada si se ejecuta meses después.

Prueba un intervalo absoluto:

```spl
index=curso
earliest="01/01/2026:00:00:00"
latest="01/01/2026:00:10:00"
| table _time host method status uri
```

Adapta la zona horaria al entorno real.

#### 6.4 Diferencia entre rango relativo y absoluto

###### Rango relativo

```spl
earliest=-15m latest=now
```

Busca eventos relativos al momento actual.

###### Rango absoluto

```spl
earliest="01/01/2026:00:00:00"
latest="01/01/2026:01:00:00"
```

Busca un periodo concreto del calendario.

#### 6.5 El selector temporal no corrige `_time`

Cambiar a `Todo el tiempo` puede encontrar los eventos, pero no corrige:

- timestamp mal interpretado;
- zona horaria incorrecta;
- fecha de origen ausente;
- formato incompatible;
- eventos asignados a una fecha inesperada.

---

## 7. Paso 4: comparar `_time` e `_indextime`

Un archivo puede contener eventos antiguos e indexarse en el momento actual.

#### 7.1 Revisar ambos tiempos

```spl
index=curso earliest=0 latest=now
| table
    _time
    _indextime
    source
    host
    status
    uri
| sort 0 _time
```

#### 7.2 Mostrar fechas legibles

```spl
index=curso earliest=0 latest=now
| eval tiempo_evento=strftime(
    _time,
    "%Y-%m-%d %H:%M:%S"
)
| eval tiempo_ingesta=strftime(
    _indextime,
    "%Y-%m-%d %H:%M:%S"
)
| eval retraso_segundos=_indextime-_time
| table
    tiempo_evento
    tiempo_ingesta
    retraso_segundos
    source
    host
    status
    uri
| head 30
```

#### 7.3 Significado

- `_time`: momento asignado al evento y utilizado por el rango temporal.
- `_indextime`: momento en que Splunk indexó el evento.
- `retraso_segundos`: diferencia entre ambos.

#### 7.4 Diagnóstico

| Observación | Posible explicación |
|---|---|
| `_time` es antiguo y `_indextime` reciente | Dataset histórico cargado ahora |
| `_time` está en el futuro | Zona horaria o timestamp incorrecto |
| Todos los eventos tienen el mismo `_time` | Parsing del timestamp defectuoso |
| `_time` no coincide con la fuente | Formato o campo de fecha incorrecto |
| `_indextime` cambia, pero `_time` no | La ingesta funciona; revisar parsing temporal |

---

## 8. Paso 5: revisar `source`, `sourcetype` y `host`

#### 8.1 Revisar metadatos

```spl
index=curso earliest=0 latest=now
| stats count by index source sourcetype host
| sort - count
```

Comprueba que:

- `index` es `curso`;
- `source` corresponde al archivo o entrada esperada;
- `sourcetype` es coherente con el formato;
- `host` identifica correctamente el origen.

#### 8.2 Distribución por `source`

```spl
index=curso earliest=0 latest=now
| stats count by source
| sort - count
```

#### 8.3 Distribución por `sourcetype`

```spl
index=curso earliest=0 latest=now
| stats count by sourcetype
| sort - count
```

#### 8.4 Distribución por `host`

```spl
index=curso earliest=0 latest=now
| stats count by host
| sort - count
```

#### 8.5 Diferencia entre metadatos

###### `index`

Lugar lógico donde se almacenan los eventos.

###### `source`

Origen del evento, por ejemplo:

```text
/var/log/splunk-curso/eventos_web.csv
```

###### `sourcetype`

Tipo de datos y reglas de interpretación, por ejemplo:

```text
web:csv
```

###### `host`

Sistema o entidad asociada al evento, por ejemplo:

```text
web-01
```

No confundas una fuente incorrecta con un índice vacío.

---

## 9. Paso 6: comprobar la entrada de datos

Desde Splunk Web revisa:

```text
Settings → Add Data
```

o:

```text
Settings → Data inputs
```

La ubicación exacta puede depender de la aplicación y versión.

Confirma:

- ruta absoluta;
- existencia del archivo en el servidor;
- permisos de lectura;
- índice de destino;
- `host`;
- `sourcetype`;
- estado de la entrada;
- si la entrada monitoriza cambios;
- si el archivo fue cargado una sola vez;
- si existe otra entrada para el mismo archivo.

#### 9.1 Revisar entradas monitorizadas mediante REST

```spl
| rest /services/data/inputs/monitor
| table
    path
    index
    sourcetype
    host
    disabled
| sort path
```

#### 9.2 Revisar entradas TCP

```spl
| rest /services/data/inputs/tcp
| table port index sourcetype disabled
```

#### 9.3 Revisar entradas UDP

```spl
| rest /services/data/inputs/udp
| table port index sourcetype disabled
```

#### 9.4 Revisar la configuración efectiva

```bash
sudo /opt/splunk/bin/splunk btool inputs list --debug
```

Filtrar por el índice del curso:

```bash
sudo /opt/splunk/bin/splunk btool inputs list --debug \
  | grep -A 15 -B 3 'index = curso'
```

El parámetro `--debug` ayuda a identificar qué archivo de configuración aporta
cada valor.

---

## 10. Paso 7: comprobar el archivo en Ubuntu

En una fuente local, que el archivo exista en el ordenador del asistente no
significa que exista en el servidor donde se ejecuta Splunk.

#### 10.1 Comprobar la ruta

```bash
ls -l /var/log/splunk-curso/eventos_web.csv
```

#### 10.2 Comprobar directorio

```bash
ls -ld /var/log/splunk-curso
```

#### 10.3 Comprobar el contenido

```bash
head -n 10 /var/log/splunk-curso/eventos_web.csv
```

#### 10.4 Mostrar caracteres especiales

```bash
cat -A /var/log/splunk-curso/eventos_web.csv | head -n 10
```

Esto puede revelar:

- saltos de línea inesperados;
- caracteres de retorno de carro;
- separadores incorrectos;
- espacios;
- codificación problemática.

#### 10.5 Comprobar el tipo de archivo

```bash
file /var/log/splunk-curso/eventos_web.csv
```

#### 10.6 Comprobar que el usuario de Splunk puede leerlo

```bash
sudo -u splunk test -r \
  /var/log/splunk-curso/eventos_web.csv \
  && echo "Archivo legible" \
  || echo "Archivo no legible"
```

Si Splunk se ejecuta con otro usuario, sustitúyelo.

#### 10.7 Comprobar todos los directorios de la ruta

```bash
namei -l /var/log/splunk-curso/eventos_web.csv
```

El proceso debe poder atravesar cada directorio y leer el archivo.

---

## 11. Paso 8: revisar permisos de Splunk

Si `admin` ve eventos y otro usuario no, no concedas `admin` automáticamente.

#### 11.1 Revisar el contexto del usuario

```spl
| rest /services/authentication/current-context
| table username roles
```

#### 11.2 Ejecutar la búsqueda mínima con el usuario afectado

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

#### 11.3 Revisar el índice

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

#### 11.4 Comprobar posibles causas

- el rol no incluye el índice;
- existe una exclusión de índice;
- la aplicación activa no es la misma;
- el dashboard es privado;
- el objeto de conocimiento no está compartido;
- el rango temporal es diferente;
- el usuario no puede ejecutar la búsqueda guardada.

#### 11.5 Principio de mínimo privilegio

El usuario debe recibir:

- acceso al índice necesario;
- capacidad de búsqueda;
- acceso a la aplicación requerida;
- lectura del dashboard o reporte;

pero no capacidades administrativas completas si no las necesita.

---

## 12. Paso 9: revisar `_raw` y los campos

Cuando aparecen eventos, pero una consulta concreta no devuelve datos, muestra el
evento original.

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

Para el CSV de referencia deberían poder validarse:

- `host`;
- `method`;
- `status`;
- `uri`.

Si el valor aparece en `_raw`, pero no como campo, consulta:

```text
campos-incorrectos.md
```

#### 12.1 Revisar campos disponibles

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

#### 12.2 Revisar valores de un campo

```spl
index=curso earliest=0 latest=now
| stats count by status
| sort - count
```

#### 12.3 Revisar el `sourcetype`

```spl
index=curso earliest=0 latest=now
| stats count by sourcetype
| sort - count
```

Un campo mal extraído no significa necesariamente que los datos no hayan
llegado.

---

## 13. Paso 10: añadir filtros progresivamente

Construye la consulta incrementando una condición cada vez.

#### 13.1 Búsqueda base

```spl
index=curso earliest=0 latest=now
| stats count
```

#### 13.2 Añadir código HTTP

```spl
index=curso earliest=0 latest=now
| search status=404
| stats count
```

#### 13.3 Añadir URI

```spl
index=curso earliest=0 latest=now
| search status=404 uri="/missing"
| stats count
```

#### 13.4 Añadir host

```spl
index=curso earliest=0 latest=now
| search status=404 uri="/missing" host="web-01"
| stats count
```

#### 13.5 Interpretación

| Consulta | Resultado | Conclusión |
|---|---|---|
| Índice sin filtros | Cero | Revisar ingesta, índice, tiempo o permisos |
| Índice funciona, `status=404` falla | Campo o valor incorrecto | Revisar extracción y valores |
| `status=404` funciona, URI falla | URI distinta o no extraída | Revisar `_raw` y normalización |
| Todo funciona hasta `host` | Host incorrecto | Revisar metadato `host` |
| Todo funciona, pero el dashboard no | Tokens o permisos | Probar la búsqueda fuera del objeto |

No añadas inicialmente:

- `rex`;
- `eval`;
- `join`;
- `transaction`;
- subsearches;
- macros complejas.

Primero demuestra que la búsqueda base encuentra el conjunto correcto.

---

## 14. Revisar tipos de datos durante el filtrado

Un campo como `status` puede ser texto.

#### 14.1 Revisar valores

```spl
index=curso earliest=0 latest=now
| table status
| head 30
```

#### 14.2 Convertir temporalmente

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| where status_num=404
| table _time host status status_num uri
```

#### 14.3 Detectar valores no convertibles

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| where isnotnull(status) AND isnull(status_num)
| table _time status uri _raw
```

Si la consulta textual funciona, pero la comparación numérica no, revisa el tipo
del campo antes de modificar la extracción.

---

## 15. Revisar `_time` e `_indextime` en detalle

#### 15.1 Mostrar ambos campos

```spl
index=curso earliest=0 latest=now
| eval fecha_evento=strftime(
    _time,
    "%Y-%m-%d %H:%M:%S"
)
| eval fecha_ingesta=strftime(
    _indextime,
    "%Y-%m-%d %H:%M:%S"
)
| table
    fecha_evento
    fecha_ingesta
    _time
    _indextime
    source
    host
    status
    uri
| sort 0 _time
```

#### 15.2 Calcular retraso

```spl
index=curso earliest=0 latest=now
| eval retraso_segundos=_indextime-_time
| stats
    avg(retraso_segundos) as retraso_medio
    median(retraso_segundos) as retraso_mediano
    max(retraso_segundos) as retraso_maximo
```

#### 15.3 Eventos con tiempo futuro

```spl
index=curso earliest=0 latest=now
| where _time>now()
| table _time _indextime source host _raw
```

Si aparecen eventos futuros, revisa:

- reloj del origen;
- zona horaria;
- formato del timestamp;
- parsing;
- generación del dataset.

---

## 16. Revisar la zona horaria

Una zona horaria incorrecta puede hacer que los eventos aparezcan varias horas
antes o después de lo esperado.

Revisa:

```bash
date
```

```bash
timedatectl
```

Comprobar la hora UTC:

```bash
date -u
```

Compara:

- hora del servidor;
- hora del origen;
- formato del evento;
- zona horaria configurada;
- hora mostrada en Splunk Web.

Cambiar el selector temporal puede encontrar el evento, pero no corrige la causa
del desplazamiento.

---

## 17. Revisar logs del servidor

Si la entrada no produce eventos, revisa los logs de Splunk.

#### 17.1 `splunkd.log`

```bash
sudo tail -n 100 \
  /opt/splunk/var/log/splunk/splunkd.log
```

#### 17.2 Buscar mensajes relacionados con la ingesta

```bash
sudo grep -iE \
  'error|failed|permission|monitor|input|index|parsing|timestamp' \
  /opt/splunk/var/log/splunk/splunkd.log \
  | tail -n 100
```

#### 17.3 Ver errores desde `_internal`

```spl
index=_internal earliest=-30m latest=now
| search
    log_level=error
    OR log_level=warn
    OR message="*permission*"
    OR message="*monitor*"
    OR message="*input*"
| table _time host component log_level message
| sort - _time
```

#### 17.4 Revisar eventos internos recientes

```spl
index=_internal earliest=-15m latest=now
| table _time host component log_level message
| sort - _time
| head 100
```

Conserva el contexto temporal del error. No borres logs ni reinicies la instancia
repetidamente sin conocer el motivo.

---

## 18. Comprobar duplicados potenciales

Cargar o monitorizar varias veces el mismo archivo puede generar duplicados.

#### 18.1 Revisar volumen por fuente

```spl
index=curso earliest=0 latest=now
| stats count by source sourcetype host
| sort - count
```

#### 18.2 Revisar combinaciones repetidas

```spl
index=curso earliest=0 latest=now
| stats
    count as repeticiones
    by _time host method status uri
| where repeticiones>1
| sort - repeticiones
```

Esta consulta identifica repeticiones potenciales, pero no demuestra por sí sola
que sean duplicados. Dos peticiones reales pueden tener los mismos valores.

#### 18.3 Revisar `_raw` repetido

```spl
index=curso earliest=0 latest=now
| stats count as repeticiones by _raw
| where repeticiones>1
| sort - repeticiones
| head 50
```

#### 18.4 Revisar entradas duplicadas

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype host disabled
| sort path
```

Si el mismo archivo aparece varias veces, revisa:

- entradas repetidas;
- aplicaciones diferentes;
- rutas equivalentes;
- enlaces simbólicos;
- copias del archivo;
- reingestas manuales.

No vuelvas a cargar el archivo hasta saber si ya está indexado.

---

## 19. Revisar fuentes alternativas

Si no aparecen datos en `curso`, puede que estén en otro índice.

Como administrador, puedes realizar una exploración limitada:

```spl
| metadata type=sources index=curso
```

También puedes revisar índices visibles:

```spl
| rest /services/data/indexes
| table title disabled totalEventCount
| sort title
```

Para explorar un conjunto reducido de índices conocidos:

```spl
(index=curso OR index=web OR index=training)
earliest=0 latest=now
| stats count by index sourcetype source
| sort - count
```

No uses indiscriminadamente:

```spl
index=*
```

Si necesitas localizar eventos en toda la plataforma, limita:

- índices conocidos;
- intervalo temporal;
- campos;
- finalidad de la investigación.

---

## 20. Caso práctico: eventos en otro índice

#### Situación

La búsqueda no devuelve resultados:

```spl
index=curso earliest=0 latest=now
| stats count
```

Pero la entrada parece activa.

#### Diagnóstico

Consulta los índices disponibles:

```spl
| rest /services/data/indexes
| table title disabled totalEventCount
```

Revisa las entradas:

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype disabled
```

Si la entrada apunta a:

```text
index=web
```

la búsqueda correcta podría ser:

```spl
index=web earliest=0 latest=now
| stats count
```

#### Corrección

No cambies la consulta final sin documentar si el índice correcto debe ser:

- `curso`;
- `web`;
- otro índice definido por la arquitectura.

El índice obligatorio del laboratorio es `curso`, por lo que una entrada que envíe
datos a otro índice debe corregirse o justificarse.

---

## 21. Caso práctico: datos históricos

#### Situación

Esta búsqueda no devuelve eventos:

```spl
index=curso earliest=-24h latest=now
| stats count
```

#### Diagnóstico

Amplía el intervalo:

```spl
index=curso earliest=0 latest=now
| stats
    count
    earliest(_time)
    latest(_time)
```

#### Resultado

Si los eventos pertenecen al 1 de enero de 2026, prueba:

```spl
index=curso
earliest="01/01/2026:00:00:00"
latest="01/01/2026:23:59:59"
| stats count
```

#### Conclusión

La ingesta puede ser correcta. El problema era que la búsqueda relativa no incluía
los timestamps del dataset.

---

## 22. Caso práctico: Admin ve datos y otro usuario no

#### Situación

El administrador ejecuta:

```spl
index=curso earliest=0 latest=now
| stats count
```

y obtiene eventos.

El usuario operativo no obtiene resultados.

#### Diagnóstico

Con el usuario operativo:

```spl
| rest /services/authentication/current-context
| table username roles
```

Después:

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount
```

Y:

```spl
index=curso earliest=0 latest=now
| stats count
```

#### Posibles causas

- el rol no tiene acceso a `curso`;
- el rol utiliza un conjunto de índices permitido diferente;
- la búsqueda está en una aplicación no accesible;
- el usuario utiliza un intervalo distinto;
- el objeto es privado;
- el usuario no tiene permisos de lectura.

#### Corrección

Concede únicamente:

- acceso de búsqueda al índice;
- acceso a la aplicación;
- lectura del objeto necesario.

No concedas `admin` como solución.

---

## 23. Caso práctico: el evento existe, pero el filtro falla

#### Situación

Esta búsqueda devuelve eventos:

```spl
index=curso earliest=0 latest=now
| stats count
```

Esta no:

```spl
index=curso earliest=0 latest=now status=404
| stats count
```

#### Diagnóstico

Revisa los valores reales:

```spl
index=curso earliest=0 latest=now
| stats count by status
| sort - count
```

Puede que los valores sean:

```text
404
"404 "
HTTP/1.1 404
status=404
```

#### Probar normalización

```spl
index=curso earliest=0 latest=now
| eval status_limpio=trim(status)
| eval status_num=tonumber(status_limpio)
| where status_num=404
| stats count
```

Si todavía no funciona, revisa `_raw`:

```spl
index=curso earliest=0 latest=now
| table _raw status
| head 20
```

---

## 24. Caso práctico: el campo está en `_raw`, pero no se extrae

#### Situación

`_raw` contiene:

```text
2026-01-01T00:01:00Z,web-01,GET,404,/missing
```

pero `status` aparece vacío.

#### Diagnóstico temporal

```spl
index=curso earliest=0 latest=now
| rex field=_raw
    "^[^,]+,[^,]+,[^,]+,(?<status_temp>[0-9]+),"
| table _raw status status_temp
| head 20
```

#### Interpretación

Si `status_temp` contiene `404`, el evento llegó correctamente. El problema está
en:

- parsing;
- configuración CSV;
- `sourcetype`;
- extracción de campos.

Consulta:

```text
campos-incorrectos.md
```

---

## 25. Caso práctico: la entrada existe, pero no lee el archivo

#### Situación

La entrada está configurada, pero no hay eventos.

#### Comprobaciones

```bash
ls -l /var/log/splunk-curso/eventos_web.csv
```

```bash
namei -l /var/log/splunk-curso/eventos_web.csv
```

```bash
ps -eo user,pid,cmd | grep -i '[s]plunk'
```

```bash
sudo -u splunk test -r \
  /var/log/splunk-curso/eventos_web.csv \
  && echo "Legible" \
  || echo "No legible"
```

#### Posibles causas

- archivo inexistente;
- ruta incorrecta;
- permisos del directorio;
- permisos del archivo;
- usuario de proceso diferente;
- archivo montado en otra máquina;
- entrada deshabilitada;
- archivo excluido por configuración.

---

## 26. Caso práctico: el dataset se cargó, pero se modificó después

Una carga puntual y una entrada monitorizada no se comportan igual.

#### Carga puntual

Splunk ingiere el contenido disponible durante la carga.

#### Monitorización

Splunk observa una ruta y puede ingerir nuevos datos según la configuración.

Comprueba si la entrada monitorizada está activa:

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype disabled
```

Si añadiste líneas al archivo después de una carga puntual, esas líneas pueden no
haberse ingerido porque la entrada no está monitorizando el archivo.

No vuelvas a subir el archivo completo sin considerar duplicados.

---

## 27. Revisar el estado de los datos con `metadata`

Para una comprobación rápida de fuentes:

```spl
| metadata type=sources index=curso
```

Para hosts:

```spl
| metadata type=hosts index=curso
```

Para `sourcetypes`:

```spl
| metadata type=sourcetypes index=curso
```

`metadata` es útil para una visión resumida, pero no sustituye la búsqueda de
eventos ni muestra todos los campos de cada evento.

---

## 28. Revisar la capacidad de almacenamiento

La falta de espacio puede impedir la ingesta o afectar al servicio.

#### 28.1 Espacio en disco

```bash
df -h
```

#### 28.2 Inodos

```bash
df -ih
```

#### 28.3 Tamaño de Splunk

```bash
sudo du -sh /opt/splunk
```

#### 28.4 Tamaño de los datos indexados

```bash
sudo du -h --max-depth=1 \
  /opt/splunk/var/lib/splunk \
  | sort -h
```

#### 28.5 Logs internos relacionados

```spl
index=_internal earliest=-1h latest=now
| search
    message="*disk*"
    OR message="*space*"
    OR message="*bucket*"
    OR message="*full*"
| table _time host component log_level message
| sort - _time
```

No elimines manualmente buckets ni archivos de índice para liberar espacio.

---

## 29. Revisión de configuración con `btool`

#### 29.1 Entradas

```bash
sudo /opt/splunk/bin/splunk btool inputs list --debug
```

#### 29.2 Índices

```bash
sudo /opt/splunk/bin/splunk btool indexes list --debug
```

#### 29.3 Parsing

```bash
sudo /opt/splunk/bin/splunk btool props list --debug
```

#### 29.4 Transformaciones

```bash
sudo /opt/splunk/bin/splunk btool transforms list --debug
```

#### 29.5 Filtrar por aplicación o índice

```bash
sudo /opt/splunk/bin/splunk btool inputs list --debug \
  | grep -A 20 -B 3 'curso'
```

El resultado debe interpretarse junto con:

- aplicación;
- archivo de origen;
- prioridad;
- contexto;
- versión;
- entrada concreta.

---

## 30. Qué no hacer durante el diagnóstico

Evita estas acciones prematuras:

#### No reinstalar Splunk

La ausencia de datos suele deberse a tiempo, índice, permisos o entrada, no a una
instalación dañada.

#### No volver a cargar el archivo inmediatamente

Puedes crear duplicados.

#### No cambiar el índice sin documentarlo

Podrías ocultar el problema en lugar de resolverlo.

#### No usar `index=*` sin límite temporal

Puede producir búsquedas lentas y resultados confusos.

#### No empezar con una expresión regular

Primero demuestra que existen eventos y que `_raw` contiene el dato.

#### No conceder `admin`

Un problema de acceso al índice no se corrige con privilegios excesivos.

#### No borrar el archivo monitorizado

Podrías perder evidencia necesaria para investigar.

#### No reiniciar repetidamente

Un reinicio puede borrar el contexto temporal del problema y no corregir la
causa.

#### No modificar `props.conf` o `transforms.conf` globalmente sin pruebas

Una configuración puede afectar a varias fuentes y aplicaciones.

---

## 31. Procedimiento completo de diagnóstico

#### Paso 1: comprobar el servicio

```bash
sudo systemctl status Splunkd
```

#### Paso 2: comprobar la entrada

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype host disabled
```

#### Paso 3: buscar en el índice sin filtros

```spl
index=curso earliest=0 latest=now
| stats count
```

#### Paso 4: revisar el rango temporal

```spl
index=curso earliest=0 latest=now
| stats earliest(_time) latest(_time) count
```

#### Paso 5: revisar metadatos

```spl
index=curso earliest=0 latest=now
| stats count by index source sourcetype host
```

#### Paso 6: revisar permisos del archivo

```bash
ls -l /ruta/al/archivo
sudo -u splunk test -r /ruta/al/archivo
```

#### Paso 7: revisar permisos de Splunk

```spl
| rest /services/authentication/current-context
| table username roles
```

#### Paso 8: revisar `_raw`

```spl
index=curso earliest=0 latest=now
| table _time _raw
| head 20
```

#### Paso 9: añadir filtros uno a uno

```spl
index=curso status=404
```

```spl
index=curso status=404 uri="/missing"
```

#### Paso 10: revisar logs

```bash
sudo tail -n 100 \
  /opt/splunk/var/log/splunk/splunkd.log
```

#### Paso 11: revisar duplicados potenciales

```spl
index=curso earliest=0 latest=now
| stats count by source sourcetype host
```

#### Paso 12: documentar y validar

Registra:

- causa;
- corrección;
- pruebas;
- usuario;
- rango;
- índice;
- resultado posterior.

---

## 32. Tabla de síntomas

| Síntoma | Causa probable | Acción |
|---|---|---|
| `index=curso` no devuelve nada | Índice, tiempo, permisos o ingesta | Probar `earliest=0`, revisar entrada y permisos |
| La búsqueda absoluta sí devuelve datos | Rango relativo incorrecto | Ajustar `earliest` y `latest` |
| Admin ve datos y otro usuario no | Rol sin acceso al índice | Revisar permisos, no conceder `admin` |
| `source` no es el esperado | Ruta o entrada incorrecta | Revisar Data inputs y `btool` |
| `sourcetype` no coincide | Entrada mal configurada | Revisar asignación y parsing |
| Eventos en `_raw`, campos ausentes | Extracción incorrecta | Revisar `sourcetype` y extracción |
| Solo falla un filtro | Campo, valor o tipo incorrecto | Añadir condiciones una a una |
| Se duplican eventos | Archivo recargado o monitorizado varias veces | Revisar entradas y fuentes |
| `_time` está fuera del intervalo | Timestamp o zona horaria incorrectos | Revisar parsing temporal |
| No se puede leer el archivo | Permisos de usuario o directorio | Usar `namei` y `test -r` |
| Splunk está activo, pero no ingiere | Entrada, archivo, parsing o disco | Revisar REST, logs y capacidad |
| Dashboard sin datos, búsqueda con datos | Token, permiso u objeto | Ejecutar la búsqueda fuera del dashboard |
| Alerta no se activa | Ventana temporal o `_time` incorrecto | Probar manualmente con eventos recientes |

---

## 33. Ejercicio práctico 1: búsqueda mínima

#### Objetivo

Determinar si el índice contiene eventos.

Ejecuta:

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

Después:

```spl
index=curso earliest=0 latest=now
| head 20
```

Documenta:

- número de eventos;
- primer evento visible;
- último evento visible;
- rango temporal utilizado;
- usuario y rol.

---

## 34. Ejercicio práctico 2: localizar el periodo real

Ejecuta:

```spl
index=curso earliest=0 latest=now
| stats
    count as total
    earliest(_time) as inicio
    latest(_time) as fin
```

Después realiza una búsqueda absoluta para el periodo encontrado.

Documenta:

- rango real del dataset;
- rango que no devolvía datos;
- motivo;
- búsqueda correcta.

---

## 35. Ejercicio práctico 3: comprobar la entrada

Ejecuta:

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype host disabled
```

Después comprueba en Ubuntu:

```bash
ls -l /ruta/al/archivo
```

```bash
namei -l /ruta/al/archivo
```

```bash
sudo -u splunk test -r /ruta/al/archivo
```

Documenta:

- ruta;
- índice;
- `sourcetype`;
- estado;
- usuario de Splunk;
- legibilidad;
- conclusión.

---

## 36. Ejercicio práctico 4: filtros progresivos

Ejecuta las consultas en orden:

```spl
index=curso earliest=0 latest=now
| stats count
```

```spl
index=curso earliest=0 latest=now
| search status=404
| stats count
```

```spl
index=curso earliest=0 latest=now
| search status=404 uri="/missing"
| stats count
```

```spl
index=curso earliest=0 latest=now
| search status=404 uri="/missing" host="web-01"
| stats count
```

Documenta en qué paso desaparecen los resultados y qué hipótesis explica el
comportamiento.

---

## 37. Ejercicio práctico 5: permisos

Con el usuario administrador:

```spl
| rest /services/authentication/current-context
| table username roles
```

Ejecuta:

```spl
index=curso earliest=0 latest=now
| stats count
```

Repite con un usuario de validación.

Compara:

- usuario;
- roles;
- índice visible;
- resultado;
- aplicación;
- intervalo temporal.

Documenta una corrección basada en mínimo privilegio.

---

## 38. Ejercicio práctico 6: eventos duplicados

Ejecuta:

```spl
index=curso earliest=0 latest=now
| stats count by source sourcetype host
| sort - count
```

Después:

```spl
index=curso earliest=0 latest=now
| stats count as repeticiones by _raw
| where repeticiones>1
| sort - repeticiones
| head 20
```

Documenta:

- fuentes encontradas;
- número de repeticiones;
- si son duplicados confirmados o solo coincidencias;
- entradas que podrían estar causando la repetición.

---

## 39. Ejercicio práctico 7: revisar `_time` e `_indextime`

Ejecuta:

```spl
index=curso earliest=0 latest=now
| eval fecha_evento=strftime(
    _time,
    "%Y-%m-%d %H:%M:%S"
)
| eval fecha_ingesta=strftime(
    _indextime,
    "%Y-%m-%d %H:%M:%S"
)
| eval retraso_segundos=_indextime-_time
| table
    fecha_evento
    fecha_ingesta
    retraso_segundos
    source
    host
    status
    uri
| head 30
```

Responde:

- ¿los eventos son históricos?
- ¿hay retrasos grandes?
- ¿hay timestamps futuros?
- ¿la hora del evento coincide con el archivo?

---

## 40. Plantilla de informe de diagnóstico

```markdown
## Informe: datos no aparecen

#### Fecha y hora

Completar.

#### Instancia

Completar.

#### Versión de Splunk

Completar.

#### Usuario y rol

Completar.

#### Índice consultado

curso

#### Rango temporal

Completar.

#### Búsqueda mínima

```spl
Completar.
```

#### Resultado de la búsqueda mínima

Completar.

#### Primer y último evento

Completar.

#### Source

Completar.

#### Sourcetype

Completar.

#### Host

Completar.

#### Entrada de datos

Completar.

#### Archivo o fuente

Completar.

#### Permisos del archivo

Completar.

#### Usuario del proceso Splunk

Completar.

#### `_time`

Completar.

#### `_indextime`

Completar.

#### Logs revisados

Completar.

#### Filtros probados

Completar.

#### Causa raíz

Indicar una causa concreta.

#### Corrección aplicada

Describir el cambio realizado.

#### Validación posterior

Indicar la búsqueda y el resultado.

#### Riesgo de duplicación

Indicar si se volvió a cargar el dataset.

#### Limitaciones

Completar.
```

---

## 41. Criterios para considerar resuelta la incidencia

La incidencia está resuelta cuando:

- la fuente está identificada;
- la entrada está activa;
- el índice correcto recibe eventos;
- el rango temporal es conocido;
- el usuario previsto puede consultar los datos;
- los campos necesarios están disponibles;
- la consulta mínima funciona;
- los filtros se comportan de forma esperada;
- no se han creado duplicados;
- la corrección está documentada;
- el dashboard o alerta funciona si aplica;
- no se han concedido permisos excesivos.

Una búsqueda que funciona únicamente con `admin` no debe considerarse una solución
terminada si el objetivo es que la utilice un rol operativo.

---

## 42. Buenas prácticas

- Empieza con la consulta más pequeña posible.
- Confirma índice y tiempo antes de investigar campos.
- Utiliza `earliest=0 latest=now` solo para diagnóstico controlado.
- Después reduce el rango temporal.
- Compara `_time` e `_indextime`.
- Revisa `source`, `sourcetype` y `host`.
- Comprueba la entrada mediante REST y `btool`.
- Verifica los permisos del archivo desde Ubuntu.
- Repite las pruebas con el usuario final.
- Añade filtros uno a uno.
- Conserva `_raw` durante la investigación.
- No recargues el archivo sin revisar duplicados.
- No uses `index=*` como primera respuesta.
- No cambies el índice para ocultar el problema.
- No concedas `admin` como solución de permisos.
- No borres logs ni datos como primera medida.
- Documenta la causa y la corrección.
- Valida la solución después del cambio.
- Explica las limitaciones del dataset.
- Conserva evidencias sin incluir secretos.

---

## 43. Referencias oficiales

- [Troubleshooting de datos en Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Troubleshootingyourdata)
- [Introducción a la entrada de datos](https://docs.splunk.com/Documentation/Splunk/latest/Data/Whatissource)
- [Monitorizar archivos y directorios](https://docs.splunk.com/Documentation/Splunk/latest/Data/Monitorfilesanddirectories)
- [Índices](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Modificadores temporales](https://docs.splunk.com/Documentation/Splunk/latest/Search/Specifytimemodifiersinyoursearch)
- [Campos y extracción](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Extractfields)
- [Operaciones en tiempo de búsqueda](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Searchtimeoperations)
- [Roles y capacidades](https://docs.splunk.com/Documentation/Splunk/latest/Security/Rolesandcapabilities)
- [Usuarios y roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Referencia de `metadata`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Metadata)
- [Referencia de la REST API](https://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTprolog)
- [Monitoring Console](https://docs.splunk.com/Documentation/Splunk/latest/Monitor/MonitoringConsole)
- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)
- [Systemd en Ubuntu](https://documentation.ubuntu.com/server/explanation/systemd/)

---

## 44. Lista de comprobación final

#### Servicio

- [ ] Splunk está activo.
- [ ] Se conoce el usuario del proceso.
- [ ] No hay errores recientes de arranque.
- [ ] El servicio de indexación está operativo.

#### Entrada

- [ ] La entrada existe.
- [ ] Está habilitada.
- [ ] La ruta es correcta.
- [ ] El archivo existe en el servidor.
- [ ] El usuario de Splunk puede leerlo.
- [ ] No hay entradas duplicadas.

#### Índice

- [ ] Existe el índice `curso`.
- [ ] Está habilitado.
- [ ] La entrada utiliza el índice correcto.
- [ ] El usuario puede buscarlo.
- [ ] Hay capacidad de almacenamiento.

#### Tiempo

- [ ] Se ha probado `earliest=0 latest=now`.
- [ ] Se conoce el primer evento.
- [ ] Se conoce el último evento.
- [ ] `_time` es correcto.
- [ ] `_indextime` se ha revisado.
- [ ] La zona horaria es coherente.

#### Eventos

- [ ] Se ha revisado `_raw`.
- [ ] `source` es correcto.
- [ ] `sourcetype` es correcto.
- [ ] `host` es correcto.
- [ ] Los campos esperados existen.
- [ ] Los tipos de datos son adecuados.

#### Consulta

- [ ] Se ha probado la consulta mínima.
- [ ] Los filtros se han añadido uno a uno.
- [ ] No se han añadido comandos complejos prematuramente.
- [ ] Se han revisado valores y nombres exactos.
- [ ] Se han documentado las limitaciones.

#### Permisos

- [ ] Se ha probado con el usuario final.
- [ ] El rol tiene acceso al índice.
- [ ] El usuario puede acceder a la aplicación.
- [ ] Los objetos necesarios están compartidos.
- [ ] No se ha concedido `admin` innecesariamente.

#### Cierre

- [ ] Se ha identificado la causa raíz.
- [ ] Se ha aplicado una corrección.
- [ ] Se ha validado la corrección.
- [ ] No se han creado duplicados.
- [ ] Se han conservado evidencias.
- [ ] El informe está completo.