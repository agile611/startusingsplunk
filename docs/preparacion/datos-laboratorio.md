# Datos del laboratorio

Los datos del laboratorio están preparados para practicar el ciclo completo de
trabajo en Splunk:

```text
Archivo original
    ↓
Entrada de datos
    ↓
Evento indexado
    ↓
Metadatos
    ↓
Campos extraídos
    ↓
Búsqueda SPL
    ↓
Estadísticas
    ↓
Visualización
    ↓
Dashboard o alerta
```

El laboratorio utiliza una instancia local de **Splunk Enterprise 10.4.3** sobre
**Ubuntu 24.04.5 LTS**. Los datos se consultan principalmente desde el índice:

```text
curso
```

El objetivo no es únicamente conseguir que un archivo aparezca en Splunk. El
asistente debe comprobar que:

- los eventos se han indexado;
- el índice de destino es correcto;
- el timestamp se ha interpretado correctamente;
- `host`, `source` y `sourcetype` son coherentes;
- los campos esperados existen;
- los valores tienen el tipo adecuado;
- las búsquedas utilizan el rango temporal correcto;
- los resultados pueden reproducirse.

---

## 1. Objetivos de aprendizaje

Al trabajar con los datasets del curso, el asistente aprenderá a:

- revisar un archivo antes de ingerirlo;
- seleccionar una estrategia de entrada;
- elegir el índice correcto;
- identificar el `sourcetype`;
- validar la extracción de campos;
- comprobar el timestamp;
- distinguir `_time` de `_indextime`;
- analizar eventos individuales;
- calcular estadísticas;
- crear series temporales;
- identificar errores;
- construir dashboards;
- configurar alertas;
- diagnosticar problemas de ingesta.

El dataset debe utilizarse como una oportunidad para comprender cómo transforma
Splunk los datos originales en información consultable.

---

## 2. Dataset principal

El dataset principal del laboratorio es:

```text
eventos_web.csv
```

El archivo contiene eventos web simulados para practicar análisis operativo y de
seguridad.

Los campos principales esperados son:

| Campo | Descripción | Ejemplo |
|---|---|---|
| `timestamp` | Fecha y hora original del evento | `2026-01-15 10:30:00` |
| `host` | Equipo o servicio que genera el evento | `web-01` |
| `method` | Método HTTP utilizado | `GET` |
| `status` | Código de respuesta HTTP | `200`, `404`, `500` |
| `uri` | Ruta solicitada | `/api/users` |

La disponibilidad exacta de los campos depende de la configuración de ingesta y
de la estructura real del archivo. Por eso siempre se deben comprobar los
eventos después de cargarlos.

---

## 3. Archivos disponibles

El repositorio incluye los siguientes recursos:

- [Eventos web](../downloads/eventos_web.csv): dataset principal de ingesta.
- [Consultas SPL](../downloads/consultas-spl.txt): ejemplos y plantillas de
  búsqueda.

Los archivos se encuentran dentro de:

```text
docs/downloads/
```

La ruta del archivo dentro del repositorio no tiene por qué coincidir con el
valor de `source` que Splunk mostrará después de la ingesta.

Por ejemplo, el archivo puede encontrarse localmente en:

```text
docs/downloads/eventos_web.csv
```

pero Splunk podría registrar como `source`:

```text
/var/lib/splunk-inputs/eventos_web.csv
```

o:

```text
eventos_web.csv
```

El valor de `source` depende de cómo se haya configurado la entrada.

---

## 4. Revisión del archivo antes de ingerirlo

Antes de cargar el archivo, revísalo desde Ubuntu.

#### 4.1 Comprobar que existe

Desde la raíz del proyecto:

```bash
ls -lh docs/downloads/eventos_web.csv
```

#### 4.2 Identificar el tipo de archivo

```bash
file docs/downloads/eventos_web.csv
```

#### 4.3 Comprobar el número de líneas

```bash
wc -l docs/downloads/eventos_web.csv
```

El número de líneas incluye normalmente la cabecera. Por tanto, no debe
interpretarse automáticamente como el número exacto de eventos indexados.

#### 4.4 Revisar la cabecera y algunas filas

```bash
head -n 5 docs/downloads/eventos_web.csv
```

Comprueba:

- nombres de las columnas;
- separador utilizado;
- número de valores por fila;
- formato de fecha;
- presencia de valores vacíos;
- caracteres especiales;
- campos duplicados;
- datos sensibles.

#### 4.5 Revisar las últimas líneas

```bash
tail -n 5 docs/downloads/eventos_web.csv
```

Esto ayuda a detectar:

- filas incompletas;
- saltos de línea inesperados;
- registros truncados;
- problemas al final del archivo.

#### 4.6 Buscar líneas vacías

```bash
grep -n '^$' docs/downloads/eventos_web.csv
```

Una línea vacía no siempre representa un error, pero debe conocerse antes de
cargar el archivo.

---

## 5. Seguridad y datos sensibles

Los datasets del curso están diseñados para utilizarse en un entorno
didáctico. Aun así, aplica estas reglas:

- no cargues logs reales de producción sin autorización;
- no incluyas contraseñas;
- no incluyas tokens;
- no incluyas claves API;
- no incluyas direcciones personales;
- no incluyas información personal innecesaria;
- no subas datos del laboratorio a repositorios públicos si contienen
  información sensible;
- conserva una copia del archivo original;
- utiliza una copia de trabajo para las modificaciones controladas.

Antes de ingerir un archivo externo, revisa una muestra:

```bash
head -n 20 ruta/al/archivo
```

La presencia de información confidencial en `_raw` significa que el dato puede
quedar almacenado en el índice y ser visible para usuarios con permisos de
búsqueda.

---

## 6. Índice de destino

El índice recomendado para todas las prácticas es:

```text
curso
```

Las búsquedas principales utilizarán:

```spl
index=curso
```

Antes de cargar los datos, comprueba que el índice existe:

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

Comprueba especialmente:

- que el índice existe;
- que no está deshabilitado;
- que su nombre está escrito exactamente como `curso`;
- que el contador de eventos es coherente;
- que el tamaño utilizado no crece de forma inesperada.

#### 6.1 Crear el índice

Si el índice no existe, créalo desde Splunk Web:

```text
Settings → Indexes → New Index
```

Utiliza:

```text
Nombre: curso
Tipo: Events
```

Mantén la configuración de almacenamiento definida por el laboratorio, salvo que
la práctica indique otra cosa.

Como usuario `admin`, puedes administrar el índice. Sin embargo, recuerda que
la capacidad de crear un índice dentro de Splunk no equivale a tener permisos
para crear carpetas o modificar archivos en Ubuntu.

---

## 7. Estrategias de ingesta

El archivo puede cargarse mediante varios métodos.

#### 7.1 Upload desde Splunk Web

Es el método más sencillo para una práctica inicial.

Flujo habitual:

```text
Settings → Add Data → Upload
```

Después:

1. selecciona el archivo;
2. revisa la vista previa;
3. comprueba el separador;
4. revisa el timestamp;
5. selecciona el índice `curso`;
6. confirma el `sourcetype`;
7. completa la carga;
8. ejecuta una búsqueda de validación.

#### 7.2 Monitor de archivo

El método `Monitor` resulta más apropiado para simular una entrada persistente.

El archivo debe encontrarse en una ruta accesible para el proceso de Splunk,
por ejemplo:

```text
/var/lib/splunk-inputs/eventos_web.csv
```

La configuración debe definir:

- ruta monitorizada;
- índice `curso`;
- `sourcetype`;
- reglas de timestamp;
- comportamiento ante archivos existentes;
- permisos de lectura.

#### 7.3 Carga desde configuración

En un entorno administrado, la entrada puede configurarse mediante una app de
Splunk y archivos como:

```text
inputs.conf
```

La configuración debe mantenerse dentro de la estructura de aplicaciones de
Splunk y no editarse de forma improvisada en varias ubicaciones.

Consulta la guía de:

[Ingesta de datos](../sesion-1/04-ingesta-datos.md)

---

## 8. Consideraciones sobre el CSV

Un CSV no es automáticamente un evento por fila en todas las situaciones. La
forma en que Splunk interpreta el archivo depende de:

- configuración de la entrada;
- saltos de línea;
- comillas;
- separador;
- encabezados;
- reglas de ruptura de eventos;
- configuración de `props.conf`;
- formato del timestamp.

Durante la vista previa, comprueba:

- que cada fila se convierte en un evento;
- que la cabecera no se indexa como un evento;
- que las columnas se separan correctamente;
- que no se unen varias filas en un solo evento;
- que los valores entre comillas se interpretan bien;
- que el timestamp se reconoce.

Si la cabecera aparece como evento, los campos pueden no extraerse como se
espera. Si varias filas aparecen unidas, revisa la configuración de ruptura de
eventos.

---

## 9. Timestamp y tiempo de los eventos

El timestamp es una de las comprobaciones más importantes.

Splunk utiliza principalmente:

```text
_time
```

para ordenar eventos, aplicar rangos temporales y construir series temporales.

El archivo puede contener un campo original denominado:

```text
timestamp
```

Después de la ingesta pueden existir ambos:

```text
timestamp
_time
```

No deben confundirse:

- `timestamp`: campo original del archivo, si se conserva;
- `_time`: tiempo interno que Splunk asigna al evento;
- `_indextime`: momento en que Splunk indexa el evento.

#### 9.1 Comprobar el intervalo temporal

```spl
index=curso earliest=0 latest=now
| stats
    count as total_eventos
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

#### 9.2 Comparar tiempo del evento e ingesta

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
| table timestamp fecha_evento fecha_ingesta _time _indextime
| head 20
```

#### 9.3 Dataset histórico

Si los eventos son históricos, esta búsqueda puede no devolver resultados:

```spl
index=curso earliest=-24h latest=now
| stats count
```

Durante la validación inicial utiliza:

```spl
index=curso earliest=0 latest=now
| stats count
```

Después selecciona un rango temporal que contenga los eventos reales.

---

## 10. Validación de la ingesta

Después de cargar el archivo, no continúes directamente con un dashboard.
Primero valida el resultado.

#### 10.1 Comprobar si hay eventos

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

#### 10.2 Revisar metadatos

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
| sort - count
```

#### 10.3 Revisar eventos individuales

```spl
index=curso earliest=0 latest=now
| table
    _time
    _indextime
    host
    source
    sourcetype
    timestamp
    method
    status
    uri
    _raw
| head 20
```

#### 10.4 Revisar campos

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

#### 10.5 Revisar valores de campos principales

```spl
index=curso earliest=0 latest=now
| stats
    count
    dc(host) as hosts_distintos
    dc(method) as metodos_distintos
    dc(status) as estados_distintos
    dc(uri) as uris_distintas
```

#### 10.6 Comprobar valores vacíos

```spl
index=curso earliest=0 latest=now
| eval campos_vacios=
    if(isnull(host) OR host="", 1, 0)
    + if(isnull(method) OR method="", 1, 0)
    + if(isnull(status) OR status="", 1, 0)
    + if(isnull(uri) OR uri="", 1, 0)
| stats sum(campos_vacios) as eventos_con_campos_vacios
```

Esta consulta es una comprobación inicial. Para un diagnóstico detallado,
conviene revisar cada campo por separado.

---

## 11. Validación de `host`, `source` y `sourcetype`

Estos metadatos ayudan a identificar el origen y el tipo de los eventos.

#### 11.1 `host`

Representa normalmente el equipo o contexto asociado al evento.

```spl
index=curso earliest=0 latest=now
| stats count by host
| sort - count
```

#### 11.2 `source`

Representa el origen del dato, normalmente el archivo, entrada o endpoint que
lo produjo.

```spl
index=curso earliest=0 latest=now
| stats count by source
| sort - count
```

El valor de `source` puede incluir una ruta completa. No supongas que siempre
coincidirá con la ruta del repositorio.

#### 11.3 `sourcetype`

Ayuda a describir la estructura y el tipo de los eventos.

```spl
index=curso earliest=0 latest=now
| stats count by sourcetype
| sort - count
```

Un `sourcetype` incorrecto puede provocar:

- interpretación temporal incorrecta;
- extracción de campos inesperada;
- separación incorrecta de eventos;
- búsquedas difíciles de reutilizar;
- resultados inconsistentes.

---

## 12. Validación de tipos de datos

Los valores procedentes de un CSV pueden llegar a Splunk como texto. Por ejemplo,
`status` puede aparecer como:

```text
"200"
```

Para realizar comparaciones numéricas, conviértelo explícitamente:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| stats count by status_num
| sort status_num
```

#### 12.1 Distribución de códigos HTTP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| stats count as total by status_num
| sort status_num
```

#### 12.2 Clasificación de respuestas

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| eval categoria=case(
    status_num>=500, "5xx - error del servidor",
    status_num>=400, "4xx - error del cliente",
    status_num>=300, "3xx - redirección",
    status_num>=200, "2xx - éxito",
    true(), "otros"
)
| stats count by categoria
| sort - count
```

La conversión evita comparaciones lexicográficas incorrectas y hace más claras
las condiciones de las búsquedas.

---

## 13. Búsquedas iniciales

Estas consultas sirven como punto de partida.

#### 13.1 Consultar eventos

```spl
index=curso earliest=0 latest=now
```

#### 13.2 Limitar la muestra

```spl
index=curso earliest=0 latest=now
| table _time host method status uri
| head 20
```

#### 13.3 Eventos por `sourcetype`

```spl
index=curso earliest=0 latest=now
| stats count by sourcetype
| sort - count
```

#### 13.4 Eventos por host y source

```spl
index=curso earliest=0 latest=now
| stats count by host source
| sort - count
```

#### 13.5 Eventos por código HTTP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| stats count by status_num
| sort status_num
```

#### 13.6 Eventos por método HTTP

```spl
index=curso earliest=0 latest=now
| stats count by method
| sort - count
```

#### 13.7 URI más solicitadas

```spl
index=curso earliest=0 latest=now
| stats count as peticiones by uri
| sort - peticiones
| head 10
```

#### 13.8 URI con errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

#### 13.9 Evolución temporal

```spl
index=curso earliest=0 latest=now
| timechart span=1h count as peticiones
```

Si el dataset cubre un periodo corto, utiliza un intervalo menor:

```spl
index=curso earliest=0 latest=now
| timechart span=1m count as peticiones
```

La granularidad debe corresponder al periodo real de los datos.

---

## 14. Métricas prácticas

#### 14.1 Porcentaje de errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| stats
    count as total
    count(eval(status_num>=400)) as errores
| eval porcentaje_error=round((errores/total)*100, 2)
```

#### 14.2 Porcentaje de errores por URI

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| stats
    count as total
    count(eval(status_num>=400)) as errores
    by uri
| eval porcentaje_error=round((errores/total)*100, 2)
| sort - porcentaje_error
```

#### 14.3 Hosts con mayor volumen

```spl
index=curso earliest=0 latest=now
| stats count as eventos by host
| sort - eventos
```

#### 14.4 Métodos y códigos de respuesta

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| stats count by method status_num
| sort - count
```

#### 14.5 Alertas potenciales

Antes de crear una alerta, prueba primero la búsqueda:

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(trim(status))
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

Esta búsqueda debe devolver resultados únicamente cuando se cumpla la
condición. Después puedes configurar la alerta desde Splunk Web.

---

## 15. Control de duplicados

La carga repetida del mismo archivo puede producir eventos duplicados. Esto
altera los resultados de las prácticas.

#### 15.1 Revisar posibles duplicados

Si el archivo tiene un identificador único, utilízalo:

```spl
index=curso earliest=0 latest=now
| stats count as apariciones by event_id
| where apariciones>1
| sort - apariciones
```

Si no existe `event_id`, puedes revisar combinaciones de campos:

```spl
index=curso earliest=0 latest=now
| eval firma=md5(
    coalesce(timestamp, "")
    . coalesce(host, "")
    . coalesce(method, "")
    . coalesce(status, "")
    . coalesce(uri, "")
)
| stats count as apariciones by firma
| where apariciones>1
| sort - apariciones
```

Esta consulta no demuestra por sí sola que todos los resultados sean
duplicados: dos peticiones legítimas pueden tener los mismos valores. Utilízala
como indicio y contrástala con `_raw`, `_time` y el archivo original.

#### 15.2 Buenas prácticas

- registra cuándo se cargó el archivo;
- utiliza una carpeta de entrada controlada;
- evita monitorizar dos veces la misma ruta;
- no cargues el archivo desde Upload y Monitor sin una razón;
- documenta el `source` utilizado;
- comprueba el contador de eventos antes y después de la carga.

---

## 16. Comparar archivo y eventos indexados

Cuando el número de eventos no coincide con el número de filas del archivo,
investiga antes de continuar.

Las diferencias pueden deberse a:

- cabecera;
- líneas vacías;
- filas inválidas;
- varias líneas interpretadas como un evento;
- archivos cargados previamente;
- eventos rechazados;
- reglas de ruptura;
- duplicados;
- filtros de la entrada.

Utiliza:

```bash
wc -l docs/downloads/eventos_web.csv
```

Y en Splunk:

```spl
index=curso earliest=0 latest=now
| stats count
```

No esperes necesariamente una igualdad exacta sin conocer las reglas de
procesamiento.

---

## 17. Criterios de validación antes de continuar

Antes de pasar a estadísticas, dashboards o alertas, confirma:

- [ ] Los eventos aparecen en `index=curso`.
- [ ] El nombre del índice es correcto.
- [ ] El `source` corresponde a la entrada utilizada.
- [ ] El `sourcetype` es coherente.
- [ ] El `host` es el esperado.
- [ ] `_time` contiene fechas razonables.
- [ ] `_indextime` permite conocer cuándo se indexaron.
- [ ] El rango temporal real está documentado.
- [ ] Los campos principales están disponibles.
- [ ] `status` puede convertirse a número.
- [ ] `uri` contiene valores coherentes.
- [ ] No se han cargado duplicados accidentalmente.
- [ ] Las búsquedas iniciales devuelven resultados reproducibles.

El resultado de una búsqueda no debe aceptarse solo porque contiene filas. Debe
responder a la pregunta planteada y ser coherente con el archivo original.

---

## 18. Registro de la ingesta

Documenta cada carga mediante una plantilla como esta:

```markdown
#### Registro de ingesta

- Archivo:
- Fecha de carga:
- Usuario:
- Método de ingesta:
- Ruta de origen:
- Índice:
- Source:
- Sourcetype:
- Host:
- Número de filas del archivo:
- Número de eventos indexados:
- Primer `_time`:
- Último `_time`:
- Campos detectados:
- Observaciones:
```

Este registro es especialmente útil cuando:

- se repite una práctica;
- se cambia el `sourcetype`;
- se recarga el dataset;
- se comparan resultados entre asistentes;
- se investiga una diferencia de conteo.

---

## 19. Problemas frecuentes

#### 19.1 No aparecen eventos

Ejecuta:

```spl
index=curso earliest=0 latest=now
| stats count
```

Después comprueba:

- índice;
- rango temporal;
- entrada;
- permisos;
- `source`;
- `sourcetype`;
- estado de `splunkd`.

Consulta:

[Los datos no aparecen](../troubleshooting/datos-no-aparecen.md)

#### 19.2 Solo aparecen eventos recientes o ninguno

El dataset puede ser histórico. Utiliza:

```spl
index=curso earliest=0 latest=now
| stats earliest(_time) latest(_time)
```

Después selecciona un rango temporal adecuado.

#### 19.3 El timestamp es incorrecto

Revisa:

- formato de fecha;
- zona horaria;
- configuración de la entrada;
- reglas de `props.conf`;
- campo utilizado como timestamp;
- valores de `_time` y `_indextime`.

#### 19.4 Los campos no se extraen

Comprueba:

```spl
index=curso earliest=0 latest=now
| table _raw timestamp host method status uri
| head 20
```

Después:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Si los datos están en `_raw`, pero no aparecen como campos, revisa la
configuración de extracción.

#### 19.5 Varias filas se convierten en un evento

Revisa:

- saltos de línea;
- reglas de ruptura;
- configuración del `sourcetype`;
- opción de eventos multilínea;
- contenido entre comillas.

#### 19.6 El número de eventos es demasiado alto

Posibles causas:

- archivo monitorizado más de una vez;
- carga repetida;
- duplicación de la entrada;
- copia del archivo en una ruta monitorizada;
- dataset ya indexado previamente.

Revisa:

```spl
index=curso earliest=0 latest=now
| stats count by source host sourcetype
| sort - count
```

#### 19.7 La búsqueda por `status` no funciona correctamente

Convierte el valor:

```spl
| eval status_num=tonumber(trim(status))
```

Después utiliza `status_num` en las comparaciones.

---

## 20. Buenas prácticas para los asistentes

- conserva el archivo original;
- trabaja con una copia cuando sea necesario;
- revisa el archivo antes de importarlo;
- utiliza siempre el índice `curso`;
- documenta el método de ingesta;
- comprueba el timestamp;
- comprueba `source`, `sourcetype` y `host`;
- utiliza `earliest=0 latest=now` durante la validación inicial;
- cambia después al rango temporal real;
- convierte los campos numéricos explícitamente;
- limita los resultados durante la exploración;
- no cargues el mismo archivo varias veces sin control;
- no borres manualmente índices ni archivos internos;
- documenta las limitaciones del dataset;
- no construyas métricas sobre campos que no existen;
- valida primero la búsqueda y después crea el dashboard o la alerta.

Una consulta correcta y reproducible es más importante que una visualización
llamativa. El dashboard puede esperar; el dato bien entendido, no tanto.

---

## 21. Referencias del curso

- [Preparación del laboratorio](index.md)
- [Requisitos de hardware](requisitos-hardware.md)
- [Comprobaciones previas](comprobaciones-previas.md)
- [Arquitectura del laboratorio](arquitectura-laboratorio.md)
- [Ingesta de datos](../sesion-1/04-ingesta-datos.md)
- [Gestión de índices](../sesion-1/05-indices.md)
- [Búsquedas básicas](../sesion-2/02-busquedas-basicas.md)
- [Gestión del tiempo](../sesion-2/03-gestion-tiempo.md)
- [Campos y resultados](../sesion-2/04-campos-resultados.md)
- [Estadísticas](../sesion-2/06-estadisticas.md)
- [Visualizaciones](../sesion-3/03-visualizaciones.md)
- [Dashboards](../sesion-3/04-dashboards.md)
- [Alertas](../sesion-3/06-alertas.md)
- [Datos no aparecen](../troubleshooting/datos-no-aparecen.md)
- [Campos incorrectos](../troubleshooting/campos-incorrectos.md)

---

## 22. Referencias oficiales

#### Datos e ingesta

- [Cómo procesa Splunk los datos](https://docs.splunk.com/Documentation/Splunk/latest/Data/HowSplunkprocessesdata)
- [Fuentes de datos](https://docs.splunk.com/Documentation/Splunk/latest/Data/Whatissource)
- [Monitorización de archivos y directorios](https://docs.splunk.com/Documentation/Splunk/latest/Data/Monitorfilesanddirectories)
- [Configuración de entradas](https://docs.splunk.com/Documentation/Splunk/latest/Data/CollectFileandDirectoryData)
- [Configuración de `inputs.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Inputsconf)
- [Configuración de `props.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Propsconf)
- [Configuración de `transforms.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Transformsconf)

#### Índices

- [Acerca de los índices](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Configuración de `indexes.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Indexesconf)
- [Administración de índices](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Manageindexes)

#### Búsquedas SPL

- [Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/WhatsInThisManual)
- [Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Overview)
- [`stats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Stats)
- [`timechart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart)
- [`eval`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Eval)
- [`where`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Where)
- [`fieldsummary`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fieldsummary)
- [`tonumber`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Tonumber)
- [Modificadores temporales](https://docs.splunk.com/Documentation/Splunk/latest/Search/Specifytimemodifiersinyoursearch)

#### Administración y seguridad

- [Manual de administración](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Welcome-to-Admin)
- [Usuarios y roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Roles y capacidades](https://docs.splunk.com/Documentation/Splunk/latest/Security/Rolesandcapabilities)
- [Objetos de conocimiento](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)

---

## 23. Resultado esperado

El dataset está correctamente preparado cuando se puede demostrar la siguiente
cadena:

```text
Archivo revisado
    +
Entrada configurada
    +
Índice curso seleccionado
    +
Eventos indexados
    +
Timestamp validado
    +
Metadatos comprobados
    +
Campos disponibles
    +
Búsqueda reproducible
```

La búsqueda mínima de validación es:

```spl
index=curso earliest=0 latest=now
| stats
    count as total_eventos
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

A partir de este punto, el asistente puede continuar con:

- estadísticas;
- análisis de códigos HTTP;
- errores por URI;
- tendencias temporales;
- dashboards;
- alertas;
- proyecto final.

La calidad de las prácticas dependerá de la calidad de esta validación inicial.
Si el evento está bien ingerido, el resto del análisis resulta mucho más
sencillo y, sobre todo, reproducible.

#### Observación importante sobre el contenido original

El archivo menciona varios tipos de datos:

- logs web;
- eventos de acceso;
- errores de aplicación;
- datos de seguridad.

Sin embargo, los archivos enlazados actualmente parecen centrarse en
`eventos_web.csv`. Para evitar expectativas incorrectas, conviene presentar esos
otros tipos como **escenarios que se pueden practicar o ampliar**, salvo que
existan datasets adicionales dentro de `docs/downloads/`.

También es recomendable mantener la validación con:

```spl
index=curso earliest=0 latest=now
```

durante la fase inicial. Usar únicamente el selector temporal de “últimas 24
horas” puede ocultar eventos históricos y hacer pensar, erróneamente, que la
ingesta falló.