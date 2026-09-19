# Curso práctico de Splunk

Bienvenido al curso de **Splunk Enterprise**, orientado al análisis, la
monitorización y la visualización de datos operativos.

El curso está pensado para trabajar sobre una instancia real de Splunk
Enterprise con acceso administrativo durante el laboratorio. Aprenderás a
validar la plataforma, cargar datos, escribir búsquedas SPL y convertirlas en
objetos reutilizables para operaciones:

- búsquedas guardadas;
- reportes;
- visualizaciones;
- dashboards;
- alertas;
- documentación técnica;
- procedimientos de troubleshooting.

El objetivo no es únicamente aprender comandos SPL. El objetivo es comprender
cómo se transforma una fuente de datos en una decisión operativa:

```text
Fuente
    ↓
Ingesta
    ↓
Índice
    ↓
Tiempo del evento
    ↓
Campos y metadatos
    ↓
Búsqueda SPL
    ↓
Resultado
    ↓
Visualización o acción
```

Una consulta no debe considerarse correcta solo porque devuelva resultados o
muestre un gráfico. Debes comprobar:

- qué eventos utiliza;
- de qué índice proceden;
- qué rango temporal se aplica;
- qué campos están extraídos;
- qué tipo de datos tienen;
- qué permisos utiliza el usuario;
- qué limitaciones tiene el dataset;
- si el resultado responde realmente a una pregunta operativa.

---

## 1. Información general del curso

#### 1.1 Duración

El curso tiene una duración total de **18 horas**, distribuidas en:

- 3 sesiones;
- 6 horas por sesión;
- laboratorios guiados;
- ejercicios individuales;
- retos de análisis;
- proyecto final.

| Sesión | Tema principal | Duración |
|---|---|---:|
| Sesión 1 | Fundamentos, plataforma e ingestión | 6 horas |
| Sesión 2 | Búsquedas, comandos y funciones SPL | 6 horas |
| Sesión 3 | Reportes, dashboards, alertas y proyecto | 6 horas |

---

#### 1.2 Nivel recomendado

El curso está orientado a personas con conocimientos básicos de:

- sistemas Linux;
- archivos de texto y CSV;
- redes y puertos;
- aplicaciones web;
- códigos HTTP;
- conceptos básicos de monitorización;
- uso de terminal;
- interpretación de tablas y gráficos.

No es necesario conocer SPL antes de comenzar.

---

#### 1.3 Entorno de trabajo

Los laboratorios están diseñados para ejecutarse sobre:

- Ubuntu 24.04.5 LTS;
- Splunk Enterprise 10.4.3;
- una instalación local o de laboratorio;
- acceso a Splunk Web;
- permisos administrativos durante la configuración;
- un índice de trabajo denominado `curso`.

La ruta habitual de instalación utilizada en los ejemplos es:

```text
/opt/splunk
```

Los puertos habituales son:

| Puerto | Uso |
|---:|---|
| `8000` | Splunk Web |
| `8089` | Management port y API REST |
| `9997` | Recepción de forwarders, si se utiliza |
| `8088` | HTTP Event Collector, si se utiliza |

La instalación real puede utilizar otros puertos, usuarios o rutas. Los asistentes
deben comprobar los valores reales de su entorno antes de aplicar una corrección.

---

## 2. Objetivos del curso

Al finalizar la formación podrás:

- comprender la arquitectura básica de Splunk;
- explicar la diferencia entre Splunk Web y `splunkd`;
- identificar los puertos principales;
- comprobar el estado de Splunk Enterprise;
- distinguir el rol `admin` de los permisos de Ubuntu;
- instalar o validar Splunk Enterprise 10.4.3 en Ubuntu 24.04.5 LTS;
- crear y administrar índices;
- incorporar archivos y logs;
- configurar entradas de datos;
- revisar `source`, `sourcetype` y `host`;
- validar `_time` e `_indextime`;
- realizar búsquedas mediante SPL;
- filtrar eventos;
- crear campos calculados;
- convertir campos numéricos;
- extraer campos con `rex`;
- analizar estructuras JSON con `spath`;
- crear estadísticas con `stats`;
- crear series temporales con `timechart`;
- identificar errores HTTP;
- analizar hosts, URI e IP cuando existan;
- calcular porcentajes y tasas;
- analizar latencia cuando exista el campo correspondiente;
- crear búsquedas guardadas;
- crear reportes programados;
- crear visualizaciones;
- diseñar dashboards interactivos;
- configurar filtros temporales y categóricos;
- configurar alertas;
- aplicar throttling;
- comprobar permisos;
- resolver problemas básicos de funcionamiento;
- documentar resultados y limitaciones;
- distinguir hechos observados de hipótesis operativas.

---

## 3. Cómo trabajar en el curso

Usa siempre este flujo:

```text
Fuente
    ↓
Ingesta
    ↓
Índice
    ↓
Tiempo
    ↓
Metadatos
    ↓
Campos
    ↓
SPL
    ↓
Resultado
    ↓
Objeto reutilizable
    ↓
Acción operativa
```

#### 3.1 Validación antes del análisis

Antes de construir un dashboard o una alerta, comprueba:

1. que Splunk está activo;
2. que los datos han llegado;
3. que el índice es correcto;
4. que el rango temporal contiene eventos;
5. que `_time` es válido;
6. que los campos existen;
7. que los tipos son correctos;
8. que el usuario tiene permisos;
9. que la consulta produce resultados razonables.

#### 3.2 No empezar por la consulta final

No empieces directamente con una consulta compleja como:

```spl
index=curso status=500 sourcetype=web:csv uri="/api/users"
| eval status_num=tonumber(status)
| timechart span=1m count by host
```

Primero valida:

```spl
index=curso earliest=0 latest=now
| stats count
```

Después:

```spl
index=curso earliest=0 latest=now
| table _time _raw host source sourcetype method status uri
| head 20
```

A continuación añade condiciones una a una.

#### 3.3 Reproducibilidad

Cada consulta del curso debe documentar:

- objetivo;
- índice;
- intervalo temporal;
- campos utilizados;
- SPL;
- resultado esperado;
- resultado observado;
- interpretación;
- limitaciones;
- usuario o rol utilizado;
- fecha de validación.

---

## 4. Flujo principal de trabajo

Utiliza esta secuencia en todas las prácticas:

#### Paso 1: plataforma

Comprueba que Splunk está instalado y activo.

```bash
/opt/splunk/bin/splunk version
```

```bash
sudo systemctl status Splunkd
```

#### Paso 2: acceso web

Comprueba que Splunk Web responde:

```bash
curl -I http://127.0.0.1:8000
```

#### Paso 3: índice

Confirma que existe `curso`:

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

#### Paso 4: eventos

Ejecuta una búsqueda mínima:

```spl
index=curso earliest=0 latest=now
| stats
    count as total
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

#### Paso 5: campos y metadatos

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

#### Paso 6: análisis

Solo después de validar los datos, empieza a crear búsquedas de:

- volumen;
- errores;
- tráfico;
- URI;
- hosts;
- latencia;
- IP;
- alertas.

#### Paso 7: objetos

Convierte las búsquedas en:

- reportes;
- dashboards;
- alertas;
- búsquedas guardadas.

#### Paso 8: permisos y documentación

Prueba con el rol final y documenta las limitaciones.

---

## 5. Programa detallado

#### Sesión 1: fundamentos e ingestión

###### Objetivo

Comprender cómo funciona la plataforma y cómo llegan los datos a Splunk.

###### Contenidos

- Arquitectura básica.
- Splunk Web y `splunkd`.
- Puertos principales.
- Usuarios y roles.
- Diferencia entre Admin de Splunk y `sudo`.
- Índices.
- Fuentes.
- `source`.
- `sourcetype`.
- `host`.
- Eventos.
- `_raw`.
- `_time`.
- `_indextime`.
- Ingesta mediante archivo.
- Monitorización de archivos.
- Validación de permisos.
- Troubleshooting inicial.

###### Prácticas

1. Comprobar la versión de Splunk.
2. Revisar el estado del servicio.
3. Acceder a Splunk Web.
4. Crear o revisar el índice `curso`.
5. Preparar `eventos_web.csv`.
6. Cargar el dataset.
7. Revisar los eventos.
8. Validar metadatos.
9. Comprobar el rango temporal.
10. Documentar la ingesta.

###### Búsqueda inicial

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

###### Evidencias

El asistente debe conservar:

- versión;
- estado del servicio;
- nombre del índice;
- ruta del archivo;
- `source`;
- `sourcetype`;
- `host`;
- primer evento;
- último evento;
- número total de eventos.

---

#### Sesión 2: búsquedas, comandos y funciones SPL

###### Objetivo

Construir búsquedas reproducibles y convertir eventos en información operativa.

###### Contenidos

- Sintaxis SPL.
- Comando `search`.
- Comando `where`.
- Comando `eval`.
- Comando `stats`.
- Comando `eventstats`.
- Comando `streamstats`.
- Comando `timechart`.
- Comando `table`.
- Comando `sort`.
- Comando `head`.
- Comando `rex`.
- Comando `spath`.
- Comando `fieldsummary`.
- Funciones de texto.
- Funciones numéricas.
- Funciones condicionales.
- Funciones temporales.
- Conversión de tipos.
- Valores nulos.
- Campos multivalor.
- Calidad de datos.
- Optimización básica.

###### Prácticas

1. Contar eventos.
2. Contar peticiones por host.
3. Contar peticiones por método.
4. Clasificar códigos HTTP.
5. Calcular errores.
6. Calcular porcentaje de error.
7. Analizar errores por URI.
8. Crear series temporales.
9. Probar campos opcionales.
10. Documentar limitaciones.

###### Consulta de ejemplo

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| eval resultado=if(
    status_num>=400,
    "Error",
    "Correcta"
)
| stats count as peticiones by resultado
```

###### Regla de normalización

Convierte los campos numéricos antes de compararlos:

```spl
| eval status_num=tonumber(status)
```

```spl
| eval tiempo_ms=tonumber(response_time)
```

---

#### Sesión 3: reportes, dashboards, alertas y proyecto

###### Objetivo

Convertir las búsquedas en objetos reutilizables y operativos.

###### Contenidos

- Búsquedas guardadas.
- Reportes.
- Programación.
- Dashboard Studio.
- Paneles.
- Single values.
- Gráficos de líneas.
- Tablas.
- Filtros temporales.
- Filtros por host.
- Filtros por status.
- Tokens.
- Alertas.
- Condiciones.
- Frecuencia.
- Throttling.
- Acciones.
- Permisos.
- Validación con usuarios finales.
- Documentación del proyecto.

###### Prácticas

1. Crear un reporte de errores por URI.
2. Crear un reporte de tráfico por host.
3. Crear el dashboard de monitorización.
4. Añadir selector temporal.
5. Añadir filtro por `host` o `status`.
6. Crear la alerta de HTTP 500.
7. Probar la alerta con datos históricos.
8. Probar la alerta con datos recientes.
9. Revisar permisos.
10. Presentar el proyecto final.

---

## 6. Metodología

Cada sesión combina:

- explicaciones conceptuales;
- demostraciones del instructor;
- laboratorios guiados;
- ejercicios individuales;
- retos de análisis;
- revisión de resultados;
- documentación técnica;
- proyecto final.

#### 6.1 Demostración

El instructor mostrará:

- el objetivo;
- la consulta;
- el resultado;
- la interpretación;
- los errores habituales;
- la forma de validar.

#### 6.2 Laboratorio guiado

Los asistentes repetirán el procedimiento en su propia instancia.

Cada práctica debe dejar una evidencia.

#### 6.3 Ejercicio individual

El asistente modificará una consulta o resolverá un caso de forma autónoma.

#### 6.4 Reto de análisis

Se plantea una pregunta operativa sin proporcionar directamente la consulta.

Ejemplo:

> ¿Qué URI concentra más errores HTTP 500 durante el periodo analizado?

El asistente debe:

1. identificar los campos;
2. elegir el rango;
3. construir la consulta;
4. validar el resultado;
5. explicar las limitaciones.

---

## 7. Referencias oficiales

#### Documentación general

- [Documentación general de Splunk](https://docs.splunk.com/Documentation/Splunk)
- [Splunk Enterprise Documentation](https://help.splunk.com/en/splunk-enterprise)
- [Notas de versión de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/ReleaseNotes)
- [Splunk Answers](https://community.splunk.com/)
- [Splunk Lantern](https://lantern.splunk.com/)

#### Búsquedas y SPL

- [Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/WhatsInThisManual)
- [Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Overview)
- [Comandos de búsqueda](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)
- [Funciones SPL](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/CommonEvalFunctions)
- [Operaciones en tiempo de búsqueda](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Searchtimeoperations)
- [Extracción de campos](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Extractfields)
- [Comando `rex`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Rex)
- [Comando `spath`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Spat h)
- [Comando `fieldsummary`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fieldsummary)

#### Ingesta e índices

- [Introducción a la entrada de datos](https://docs.splunk.com/Documentation/Splunk/latest/Data/Whatissource)
- [Monitorizar archivos y directorios](https://docs.splunk.com/Documentation/Splunk/latest/Data/Monitorfilesanddirectories)
- [Índices](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Cómo procesa Splunk los datos](https://docs.splunk.com/Documentation/Splunk/latest/Data/HowSplunkprocessesdata)
- [Referencia de `inputs.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Inputsconf)
- [Referencia de `indexes.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Indexesconf)
- [Referencia de `props.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Propsconf)
- [Referencia de `transforms.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Transformsconf)

#### Dashboards y visualización

- [Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/AboutDashboards)
- [Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/IntroFrame)
- [Visualizaciones](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)

#### Alertas y reportes

- [Alertas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Crear alertas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Definescheduledalerts)
- [Throttling de alertas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/ThrottleAlerts)
- [Búsquedas guardadas](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Definesearches)

#### Seguridad y permisos

- [Roles y capacidades](https://docs.splunk.com/Documentation/Splunk/latest/Security/Rolesandcapabilities)
- [Usuarios y roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Objetos de conocimiento](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)
- [Permisos de objetos](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Manageknowledgeobjects)

#### Troubleshooting

- [Troubleshooting de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Abouttroubleshooting)
- [Troubleshooting de datos](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Troubleshootingyourdata)
- [Monitoring Console](https://docs.splunk.com/Documentation/Splunk/latest/Monitor/MonitoringConsole)
- [Job Inspector](https://docs.splunk.com/Documentation/Splunk/latest/Search/Viewsearchjobproperties)
- [Índice de auditoría](https://docs.splunk.com/Documentation/Splunk/latest/Security/Auditindex)

#### Ubuntu

- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)
- [Systemd en Ubuntu](https://documentation.ubuntu.com/server/explanation/systemd/)
- [Firewall en Ubuntu](https://documentation.ubuntu.com/server/how-to/security/firewalls/)

---

## 8. Nota sobre licencias y versiones

La disponibilidad de funciones, límites y opciones puede depender de:

- versión de Splunk;
- tipo de licencia;
- sistema operativo;
- arquitectura;
- aplicaciones instaladas;
- configuración del entorno;
- permisos del usuario.

La información del curso utiliza Splunk Enterprise 10.4.3 como referencia. Si la
instancia utiliza otra versión, comprueba la documentación correspondiente antes
de aplicar comandos de configuración.

La disponibilidad de una licencia de evaluación o trial depende de las
condiciones actuales de Splunk y de la modalidad de descarga. No debe asumirse
que todas las instalaciones tienen exactamente la misma duración, límites o
capacidades. Verifica siempre la licencia y los términos aplicables en la fuente
oficial.

---

## 9. Resultado esperado del curso

Al finalizar, cada asistente debe ser capaz de explicar el recorrido completo de
un evento:

```text
Archivo o fuente
    ↓
Entrada de Splunk
    ↓
Parsing
    ↓
Asignación de host, source y sourcetype
    ↓
Timestamp y _time
    ↓
Índice curso
    ↓
Búsqueda SPL
    ↓
Estadística o visualización
    ↓
Reporte, dashboard o alerta
    ↓
Decisión operativa
```

También debe ser capaz de responder:

- ¿de dónde procede este evento?
- ¿en qué índice está?
- ¿cuándo ocurrió?
- ¿cuándo se indexó?
- ¿qué campos contiene?
- ¿qué tipo de datos tienen?
- ¿qué usuario puede verlo?
- ¿qué consulta lo utiliza?
- ¿qué panel lo muestra?
- ¿qué alerta depende de él?
- ¿qué limitaciones existen?
- ¿cómo se diagnosticaría si dejara de aparecer?

La documentación y el resultado técnico forman parte de la solución. Una consulta
sin contexto puede producir un número; una solución documentada permite operar,
validar y mantener ese número.