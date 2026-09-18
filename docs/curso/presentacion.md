# Presentación

Este curso es una introducción práctica a **Splunk Enterprise** para aprender a
recibir, indexar, buscar y analizar datos de máquina.

El recorrido combina explicaciones breves con ejercicios realizados sobre una
instancia local, de forma que cada concepto pueda comprobarse inmediatamente
mediante:

- Splunk Web;
- búsquedas SPL;
- comandos de Ubuntu;
- revisión de eventos;
- validación de campos;
- visualizaciones;
- reportes;
- dashboards;
- alertas;
- documentación técnica.

El objetivo no es memorizar comandos aislados. El objetivo es comprender el
recorrido completo de los datos:

```text
Fuente
    ↓
Entrada de datos
    ↓
Parsing
    ↓
Índice
    ↓
Timestamp
    ↓
Campos y metadatos
    ↓
Búsqueda SPL
    ↓
Resultado
    ↓
Dashboard, reporte o alerta
    ↓
Decisión operativa
```

---

## 1. Entorno de referencia

El entorno de referencia del curso es una instalación manual de:

- **Splunk Enterprise 10.4.3**;
- **Ubuntu 24.04.5 LTS**;
- arquitectura local de un solo nodo;
- acceso administrativo a Splunk durante las prácticas;
- índice principal denominado `curso`.

La instancia se ejecuta como un laboratorio mononodo: el mismo equipo proporciona:

- recepción de datos;
- indexación;
- almacenamiento;
- búsquedas;
- alertas;
- reportes;
- Splunk Web.

Esta arquitectura es suficiente para aprender los conceptos fundamentales sin
añadir inicialmente la complejidad de varios indexers, search heads o forwarders.

#### 1.1 Componentes principales

###### `splunkd`

Es el proceso principal de Splunk Enterprise. Gestiona, entre otras funciones:

- indexación;
- búsquedas;
- API de administración;
- entradas de datos;
- alertas;
- configuración;
- comunicación interna.

###### Splunk Web

Es la interfaz web desde la que se realizan las tareas del curso.

Habitualmente se accede mediante:

```text
http://localhost:8000
```

La URL y el protocolo pueden variar si se ha configurado HTTPS o un puerto
diferente.

###### Índice

El índice es el destino lógico donde Splunk almacena los eventos.

En este curso se utiliza principalmente:

```text
curso
```

###### SPL

SPL es el lenguaje de búsqueda de Splunk. Permite:

- filtrar eventos;
- transformar campos;
- calcular estadísticas;
- agrupar resultados;
- crear series temporales;
- preparar datos para visualizaciones;
- definir condiciones de alerta.

---

## 2. Qué aprenderás

Durante el curso aprenderás a:

- reconocer eventos, campos, fuentes, `sourcetype` e índices;
- entender el recorrido de los datos desde una fuente hasta una búsqueda;
- instalar y verificar Splunk Enterprise en Ubuntu;
- comprobar el estado del servicio;
- diferenciar Splunk Web de `splunkd`;
- acceder a Splunk Web;
- comprobar los puertos principales;
- crear y validar el índice `curso`;
- ingerir un archivo CSV;
- revisar la entrada de datos;
- interpretar `source`, `sourcetype` y `host`;
- comprender `_raw`, `_time` e `_indextime`;
- utilizar rangos temporales relativos y absolutos;
- escribir búsquedas SPL progresivamente más precisas;
- filtrar eventos por campos;
- convertir valores de texto a números;
- calcular estadísticas con `stats`;
- crear series temporales con `timechart`;
- extraer campos con `rex`;
- revisar campos con `fieldsummary`;
- calcular porcentajes;
- analizar códigos HTTP;
- identificar URI con más errores;
- comparar tráfico entre hosts;
- crear reportes;
- crear visualizaciones;
- diseñar dashboards;
- configurar filtros y tokens;
- configurar alertas;
- utilizar throttling;
- comprobar permisos;
- diagnosticar problemas de ingesta;
- diagnosticar campos ausentes o incorrectos;
- analizar problemas de acceso web;
- documentar resultados, limitaciones y evidencias.

---

## 3. Objetivo práctico del curso

Al terminar el curso, deberás ser capaz de construir una solución básica de
monitorización web.

La solución utilizará datos del índice:

```text
curso
```

y deberá responder preguntas como:

- ¿Cuántas peticiones se han recibido?
- ¿Qué porcentaje de peticiones ha terminado en error?
- ¿Qué URI concentra más errores?
- ¿Cuántos errores HTTP 500 se han producido?
- ¿Cómo evoluciona el tráfico en el tiempo?
- ¿Qué host genera más errores?
- ¿Existe información de latencia?
- ¿Qué condición debe activar una alerta?
- ¿Qué usuario puede consultar los resultados?

La respuesta debe estar respaldada por:

- una consulta SPL;
- un rango temporal;
- campos conocidos;
- un resultado verificable;
- una interpretación;
- una explicación de las limitaciones.

---

## 4. Dataset de prácticas

El dataset básico del curso es:

```text
eventos_web.csv
```

Se encuentra disponible en:

```text
downloads/eventos_web.csv
```

También puede consultarse la documentación de:

```text
recursos/datasets.md
```

#### 4.1 Campos básicos

El dataset mínimo contiene:

```text
timestamp
host
method
status
uri
```

Ejemplo:

```text
timestamp,host,method,status,uri
2026-01-01T00:00:00Z,web-01,GET,200,/login
2026-01-01T00:01:00Z,web-01,GET,404,/missing
2026-01-01T00:02:00Z,web-02,POST,500,/api/users
```

#### 4.2 Campos opcionales

Algunas actividades pueden utilizar una fuente ampliada con:

```text
client_ip
response_time
user_agent
bytes
referer
```

No debes asumir que estos campos existen en el dataset básico.

Comprueba primero:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

También puedes revisar un evento:

```spl
index=curso earliest=0 latest=now
| table _raw host method status uri client_ip response_time
| head 20
```

#### 4.3 Limitaciones del dataset

Si el campo `client_ip` no existe, documenta:

> El dataset básico no contiene una IP de cliente. No es posible realizar un
> análisis fiable por origen. Como alternativa se utiliza `host`.

Si el campo `response_time` no existe, documenta:

> El dataset básico no contiene tiempo de respuesta. No es posible calcular
> latencia por URI. Se analiza, como alternativa, el volumen o los errores por
> URI.

No inventes resultados para campos que no están presentes. Una limitación
documentada es mejor que una métrica aparentemente precisa pero incorrecta.

#### 4.4 Timestamp del dataset

El dataset de referencia contiene eventos del:

```text
1 de enero de 2026
```

Por tanto, esta búsqueda puede no devolver resultados si se ejecuta fuera de ese
periodo:

```spl
index=curso earliest=-24h latest=now
| stats count
```

Para una comprobación amplia:

```spl
index=curso earliest=0 latest=now
| stats count
```

Para un intervalo absoluto:

```spl
index=curso
earliest="01/01/2026:00:00:00"
latest="01/01/2026:23:59:59"
| stats count
```

La fecha del evento debe validarse mediante `_time`, no únicamente observando la
fecha de carga del archivo.

---

## 5. Método de trabajo

Cada bloque sigue este ciclo:

1. Presentar el concepto y su vocabulario.
2. Mostrar un ejemplo sobre datos de laboratorio.
3. Ejecutar la práctica en Splunk Web o en la terminal de Ubuntu.
4. Validar el resultado mediante una búsqueda SPL.
5. Interpretar el resultado.
6. Relacionar lo aprendido con un caso de operaciones, seguridad o soporte.
7. Documentar la consulta y sus limitaciones.

#### 5.1 Preguntas que debes hacerte siempre

Antes de aceptar un resultado, comprueba:

- ¿Qué índice utiliza la búsqueda?
- ¿Qué intervalo temporal se está aplicando?
- ¿Cuántos eventos forman el resultado?
- ¿Qué campos se han utilizado?
- ¿Los campos existen realmente?
- ¿Los valores son numéricos o de texto?
- ¿El usuario tiene permisos suficientes?
- ¿La consulta es reproducible?
- ¿El resultado responde a la pregunta original?
- ¿Qué limitaciones tiene el dataset?

#### 5.2 Flujo mínimo de validación

Utiliza este orden:

```text
Servicio
    ↓
Acceso web
    ↓
Entrada
    ↓
Índice
    ↓
Tiempo
    ↓
Evento original
    ↓
Campos
    ↓
SPL
    ↓
Visualización
    ↓
Alerta o acción
```

No construyas primero el dashboard y compruebes los datos después. El dashboard
puede mostrar una visualización correcta desde el punto de vista técnico, pero
basada en un rango temporal equivocado o en campos mal extraídos.

---

## 6. Primer contacto con la instancia

#### 6.1 Comprobar la versión

En Ubuntu:

```bash
/opt/splunk/bin/splunk version
```

#### 6.2 Comprobar el servicio

```bash
sudo systemctl status Splunkd --no-pager
```

#### 6.3 Comprobar Splunk Web

```bash
curl -I http://127.0.0.1:8000
```

Después accede desde el navegador:

```text
http://localhost:8000
```

#### 6.4 Comprobar los puertos

```bash
sudo ss -ltnp | grep -E ':8000|:8089'
```

Los puertos habituales son:

| Puerto | Uso |
|---:|---|
| `8000` | Splunk Web |
| `8089` | Management port y API REST |
| `9997` | Recepción de forwarders, si se utiliza |
| `8088` | HTTP Event Collector, si se utiliza |

La ausencia de respuesta web no siempre significa que toda la instancia esté
detenida. Puede estar funcionando `splunkd` mientras exista un problema
específico de Splunk Web, TLS, puerto o proxy.

---

## 7. Primera búsqueda

Cuando Splunk Web esté disponible, ejecuta:

```spl
| makeresults
| eval estado="Splunk responde"
```

Esta búsqueda no consulta el índice `curso`. Sirve para comprobar que el motor de
búsqueda está operativo.

Después ejecuta:

```spl
index=curso earliest=0 latest=now
| stats
    count as total_eventos
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

#### 7.1 Interpretación

| Resultado | Interpretación |
|---|---|
| `makeresults` funciona y `curso` devuelve eventos | La instancia y la ingesta básica funcionan |
| `makeresults` funciona, pero `curso` está vacío | Revisar índice, entrada, tiempo o permisos |
| Ninguna búsqueda funciona | Revisar servicio, sesión, permisos o acceso web |
| Hay eventos, pero faltan campos | Revisar parsing y extracciones |
| Hay eventos, pero los filtros no coinciden | Revisar valores y tipos de datos |

#### 7.2 Revisar eventos

```spl
index=curso earliest=0 latest=now
| table
    _time
    _indextime
    host
    source
    sourcetype
    method
    status
    uri
    _raw
| head 20
```

---

## 8. Conceptos fundamentales

#### 8.1 Evento

Un evento es una unidad de información indexada por Splunk.

Puede representar:

- una petición web;
- una línea de log;
- una autenticación;
- una alerta;
- una transacción;
- un mensaje de aplicación.

#### 8.2 `_raw`

Contiene el evento original tal como lo recibió Splunk.

Es especialmente importante para diagnosticar:

- campos ausentes;
- delimitadores incorrectos;
- formatos inesperados;
- errores de parsing;
- valores que no coinciden con la consulta.

Consulta:

```spl
index=curso earliest=0 latest=now
| table _raw
| head 20
```

#### 8.3 `_time`

Es la marca temporal asignada al evento.

El selector temporal de Splunk utiliza principalmente `_time`.

#### 8.4 `_indextime`

Es el momento en que el evento se indexó.

Un dataset histórico puede tener:

- `_time` en enero de 2026;
- `_indextime` en la fecha actual.

Consulta ambos:

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
| table fecha_evento fecha_ingesta _time _indextime
| head 20
```

#### 8.5 `source`

Identifica el origen del evento, como un archivo o una entrada.

#### 8.6 `sourcetype`

Describe el tipo de datos y ayuda a aplicar reglas de interpretación.

#### 8.7 `host`

Identifica el sistema o entidad asociada al evento.

---

## 9. Administración durante el laboratorio

El curso utiliza acceso administrativo a Splunk para facilitar:

- creación de índices;
- configuración de entradas;
- creación de reportes;
- creación de dashboards;
- configuración de alertas;
- validación de permisos.

Sin embargo, ser `admin` dentro de Splunk no equivale automáticamente a ser
administrador de Ubuntu.

#### 9.1 Diferencia de permisos

| Contexto | Ejemplo | Qué controla |
|---|---|---|
| Splunk | Rol `admin` | Índices, búsquedas, objetos y configuración de Splunk |
| Ubuntu | `sudo` | Servicios, procesos y archivos del sistema |
| Filesystem | Permisos Unix | Lectura y escritura de archivos |
| Red | Firewall y puertos | Comunicaciones entrantes y salientes |

Para ejecutar comandos como:

```bash
sudo systemctl status Splunkd
```

se necesitan permisos de Ubuntu, no solo el rol `admin` de Splunk.

#### 9.2 Principio de mínimo privilegio

En un entorno real, no todos los usuarios deben ser `admin`.

El curso muestra cómo diferenciar:

- administrador;
- analista;
- operador;
- usuario de visualización;
- propietario de alertas.

Una solución no está completamente validada si solo funciona con `admin` y falla
con el rol operativo previsto.

---

## 10. Prácticas principales

#### Práctica 1: validar la instancia

Objetivo:

- comprobar que Splunk está activo;
- comprobar que Splunk Web responde;
- ejecutar `makeresults`.

Comandos:

```bash
/opt/splunk/bin/splunk version
```

```bash
sudo systemctl status Splunkd --no-pager
```

```bash
curl -I http://127.0.0.1:8000
```

Búsqueda:

```spl
| makeresults
| eval estado="Splunk responde"
```

---

#### Práctica 2: validar el índice

Objetivo:

- comprobar que existe `curso`;
- confirmar su estado;
- revisar si contiene eventos.

Consulta:

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

Búsqueda:

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

---

#### Práctica 3: revisar el rango temporal

Objetivo:

- localizar el primer y último evento;
- diferenciar rangos relativos y absolutos.

Consulta:

```spl
index=curso earliest=0 latest=now
| stats
    count as total_eventos
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

Después utiliza el intervalo real del dataset.

---

#### Práctica 4: revisar los campos

Objetivo:

- comprobar qué campos existen;
- identificar campos opcionales;
- revisar los valores reales.

Consulta:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Consulta adicional:

```spl
index=curso earliest=0 latest=now
| stats count by status
| sort - count
```

---

#### Práctica 5: normalizar códigos HTTP

Objetivo:

- convertir `status` en un valor numérico;
- distinguir respuestas correctas y errores.

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| eval familia_http=case(
    status_num>=200 AND status_num<300, "2xx",
    status_num>=300 AND status_num<400, "3xx",
    status_num>=400 AND status_num<500, "4xx",
    status_num>=500 AND status_num<600, "5xx",
    true(), "Otros"
)
| stats count by familia_http
| sort familia_http
```

---

#### Práctica 6: errores por URI

Objetivo:

- identificar las URI que concentran respuestas de error;
- preparar una tabla para un reporte o dashboard.

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

---

#### Práctica 7: evolución temporal

Objetivo:

- observar la evolución del tráfico;
- identificar periodos con mayor actividad.

```spl
index=curso earliest=0 latest=now
| timechart span=1m count as peticiones
```

Por código HTTP:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| timechart span=1m count by status_num
```

---

## 11. Documentación de las prácticas

Para cada práctica utiliza este formato:

```markdown
#### Nombre de la práctica

###### Objetivo

Describir qué se quiere comprobar.

###### Índice

```text
curso
```

###### Rango temporal

Describir el intervalo utilizado.

###### SPL

```spl
Pegar aquí la consulta.
```

###### Resultado esperado

Describir qué debería mostrar.

###### Resultado observado

Describir qué ha ocurrido realmente.

###### Interpretación

Explicar el significado operativo.

###### Limitaciones

Indicar campos ausentes, datos históricos o restricciones.

###### Evidencia

Añadir captura o referencia a la ejecución.
```

Una captura sin contexto no es suficiente. Debe poder saberse:

- qué búsqueda se ejecutó;
- con qué usuario;
- en qué índice;
- con qué intervalo;
- en qué momento;
- qué resultado se obtuvo.

---

## 12. Cómo actuar cuando algo no funciona

No recargues inmediatamente el archivo ni añadas filtros complejos.

Sigue este orden:

```text
Servicio
    ↓
Acceso web
    ↓
Entrada
    ↓
Índice
    ↓
Rango temporal
    ↓
Evento original
    ↓
Campos
    ↓
Consulta
    ↓
Permisos
```

#### 12.1 Splunk no inicia

Consulta:

```text
troubleshooting/splunk-no-inicia.md
```

#### 12.2 Splunk Web no abre

Consulta:

```text
troubleshooting/acceso-web.md
```

#### 12.3 No aparecen eventos

Consulta:

```text
troubleshooting/datos-no-aparecen.md
```

#### 12.4 Los campos son incorrectos

Consulta:

```text
troubleshooting/campos-incorrectos.md
```

#### 12.5 Búsqueda mínima para troubleshooting

```spl
index=curso earliest=0 latest=now
| stats count
```

Si esta búsqueda no devuelve eventos, todavía no investigues:

- `rex`;
- `join`;
- `transaction`;
- dashboards;
- alertas;
- expresiones regulares complejas.

Primero confirma que los datos son visibles.

---

## 13. Resultado final

Al finalizar tendrás:

- una instancia funcional;
- acceso validado a Splunk Web;
- un índice de prácticas;
- un dataset consultable;
- búsquedas SPL documentadas;
- estadísticas sobre las peticiones;
- análisis de errores;
- visualizaciones;
- reportes;
- un dashboard;
- una alerta;
- una metodología básica de troubleshooting;
- criterios para documentar limitaciones;
- una comprensión del flujo completo de los datos.

El resultado más importante no es una pantalla concreta. Es la capacidad de
explicar cómo se ha obtenido cada métrica y cómo se validaría si dejara de
funcionar.

---

## 14. Criterios de finalización

Se considera que una persona ha completado correctamente esta introducción cuando
puede:

- explicar la función de `splunkd`;
- explicar la función de Splunk Web;
- identificar el índice `curso`;
- localizar la entrada de datos;
- distinguir `source`, `sourcetype` y `host`;
- explicar la diferencia entre `_time` e `_indextime`;
- utilizar un rango temporal adecuado;
- inspeccionar `_raw`;
- comprobar campos con `fieldsummary`;
- normalizar `status` con `tonumber`;
- contar eventos con `stats`;
- crear una serie temporal con `timechart`;
- analizar errores por URI;
- crear una visualización;
- crear un reporte;
- crear un dashboard;
- crear una alerta;
- probar los resultados con el usuario previsto;
- documentar los datos que no están disponibles;
- localizar la guía de troubleshooting adecuada.

---

## 15. Siguiente paso

Comienza por la preparación del entorno:

[Preparar el laboratorio](../preparacion/index.md)

Después continúa con:

- [Sesión 1: fundamentos e ingestión](../sesion-1/index.md)
- [Sesión 2: lenguaje SPL](../sesion-2/index.md)
- [Sesión 3: dashboards y alertas](../sesion-3/index.md)
- [Proyecto final](../proyecto/index.md)
- [Solución de problemas](../troubleshooting/index.md)

---

## 16. Referencias del curso

- [Preparación del laboratorio](../preparacion/index.md)
- [Arquitectura de Splunk](../preparacion/arquitectura.md)
- [Datos del laboratorio](../preparacion/datos-laboratorio.md)
- [Ingesta de datos](../sesion-1/04-ingesta-datos.md)
- [Gestión de índices](../sesion-1/05-indices.md)
- [Gestión del tiempo](../sesion-2/03-gestion-tiempo.md)
- [Estadísticas](../sesion-2/06-estadisticas.md)
- [Extracción de campos](../sesion-2/08-extraccion-campos.md)
- [Reportes](../sesion-3/02-reportes.md)
- [Dashboards](../sesion-3/04-dashboards.md)
- [Alertas](../sesion-3/06-alertas.md)
- [Proyecto final](../proyecto/index.md)
- [Troubleshooting](../troubleshooting/index.md)

---

## 17. Referencias oficiales

#### Documentación general

- [Documentación de Splunk Enterprise](https://docs.splunk.com/Documentation/Splunk)
- [Splunk Enterprise en Help](https://help.splunk.com/en/splunk-enterprise)
- [Notas de versión](https://docs.splunk.com/Documentation/Splunk/latest/ReleaseNotes)

#### Búsqueda y SPL

- [Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/WhatsInThisManual)
- [Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Overview)
- [Funciones de evaluación](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/CommonEvalFunctions)
- [Comando `stats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Stats)
- [Comando `timechart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart)
- [Comando `rex`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Rex)
- [Comando `fieldsummary`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fieldsummary)

#### Ingesta e índices

- [Introducción a la entrada de datos](https://docs.splunk.com/Documentation/Splunk/latest/Data/Whatissource)
- [Monitorización de archivos](https://docs.splunk.com/Documentation/Splunk/latest/Data/Monitorfilesanddirectories)
- [Índices](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Cómo procesa Splunk los datos](https://docs.splunk.com/Documentation/Splunk/latest/Data/HowSplunkprocessesdata)
- [`inputs.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Inputsconf)
- [`indexes.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Indexesconf)
- [`props.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Propsconf)

#### Dashboards, reportes y alertas

- [Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/AboutDashboards)
- [Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/IntroFrame)
- [Visualizaciones](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)
- [Alertas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Búsquedas programadas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Definescheduledalerts)
- [Throttling de alertas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/ThrottleAlerts)

#### Seguridad y permisos

- [Roles y capacidades](https://docs.splunk.com/Documentation/Splunk/latest/Security/Rolesandcapabilities)
- [Usuarios y roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Objetos de conocimiento](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)

#### Troubleshooting

- [Troubleshooting general](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Abouttroubleshooting)
- [Troubleshooting de datos](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Troubleshootingyourdata)
- [Monitoring Console](https://docs.splunk.com/Documentation/Splunk/latest/Monitor/MonitoringConsole)
- [Job Inspector](https://docs.splunk.com/Documentation/Splunk/latest/Search/Viewsearchjobproperties)

#### Ubuntu

- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)
- [Systemd en Ubuntu](https://documentation.ubuntu.com/server/explanation/systemd/)
- [Firewall en Ubuntu](https://documentation.ubuntu.com/server/how-to/security/firewalls/)