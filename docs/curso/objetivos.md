# Objetivos

Este documento define qué debe aprender el asistente, qué actividades realizará y
cómo se comprobará que los objetivos se han alcanzado.

El curso no se limita a ejecutar búsquedas SPL. El asistente debe ser capaz de
explicar:

- de dónde proceden los datos;
- cómo llegan a Splunk;
- en qué índice se almacenan;
- qué timestamp utiliza la búsqueda;
- qué campos están disponibles;
- cómo se construye una métrica;
- qué permisos intervienen;
- cómo se valida un resultado;
- qué limitaciones tiene el dataset.

El objetivo general es pasar de una fuente de datos a una solución básica de
análisis y monitorización:

```text
Fuente
    ↓
Entrada
    ↓
Parsing
    ↓
Índice
    ↓
Tiempo y metadatos
    ↓
Campos
    ↓
Búsqueda SPL
    ↓
Visualización
    ↓
Reporte, dashboard o alerta
    ↓
Decisión operativa
```

---

# 1. Contexto del curso

El curso utiliza como entorno de referencia:

- Splunk Enterprise 10.4.3;
- Ubuntu 24.04.5 LTS;
- una instancia local de laboratorio;
- arquitectura mononodo;
- acceso administrativo durante la configuración;
- índice principal `curso`;
- dataset de prácticas `eventos_web.csv`.

El asistente trabajará con eventos de una aplicación web y aprenderá a responder
preguntas operativas como:

- ¿Cuántas peticiones se han recibido?
- ¿Qué porcentaje de peticiones ha terminado en error?
- ¿Qué URI genera más errores?
- ¿Cuántos errores HTTP 500 se han producido?
- ¿Cómo evoluciona el tráfico?
- ¿Qué host concentra más errores?
- ¿Existe información suficiente para analizar latencia?
- ¿Qué condición debería activar una alerta?

---

# 2. Objetivos generales

Al finalizar el curso, el asistente podrá:

- comprender el modelo de datos y la arquitectura de Splunk Enterprise;
- instalar y poner en funcionamiento Splunk Enterprise 10.4.3 en Ubuntu
  24.04.5 LTS;
- diferenciar Splunk Web de `splunkd`;
- identificar los puertos principales de Splunk;
- ingerir datos de laboratorio;
- comprobar que los eventos quedan disponibles en el índice `curso`;
- identificar `source`, `sourcetype` y `host`;
- validar `_time`, `_indextime` y `_raw`;
- crear búsquedas SPL para localizar, filtrar y resumir eventos;
- transformar campos y normalizar valores;
- construir visualizaciones, reportes y dashboards útiles;
- configurar alertas básicas;
- aplicar buenas prácticas de operación y seguridad;
- comprobar permisos con un usuario distinto de `admin`;
- diagnosticar problemas de acceso, ingesta, tiempo y extracción de campos;
- documentar resultados, decisiones y limitaciones.

---

# 3. Resultados de aprendizaje observables

Los objetivos se consideran alcanzados cuando el asistente puede demostrar
cada resultado mediante una práctica o evidencia.

## 3.1 Plataforma

El asistente puede:

- comprobar la versión de Splunk;
- comprobar el estado del servicio;
- identificar el usuario de ejecución;
- verificar el puerto de Splunk Web;
- verificar el puerto de administración;
- acceder a la interfaz web;
- ejecutar una búsqueda mínima;
- distinguir un problema de servicio de un problema de datos.

Comandos de referencia:

```bash
/opt/splunk/bin/splunk version
```

```bash
sudo systemctl status Splunkd --no-pager
```

```bash
sudo ss -ltnp | grep -E ':8000|:8089'
```

Prueba funcional:

```spl
| makeresults
| eval estado="Splunk responde"
```

---

## 3.2 Ingesta

El asistente puede:

- localizar el archivo de laboratorio;
- identificar la entrada utilizada;
- comprobar el índice de destino;
- revisar el `sourcetype`;
- comprobar el `host`;
- verificar que el archivo es legible;
- evitar cargar varias veces el mismo dataset;
- explicar la diferencia entre carga puntual y monitorización.

Consulta de referencia:

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype host disabled
```

Validación del índice:

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

---

## 3.3 Tiempo

El asistente puede:

- explicar qué representa `_time`;
- explicar qué representa `_indextime`;
- utilizar rangos relativos;
- utilizar rangos absolutos;
- localizar el primer y último evento;
- detectar eventos históricos;
- identificar posibles problemas de zona horaria;
- explicar por qué una búsqueda reciente puede no encontrar un dataset antiguo.

Consulta de referencia:

```spl
index=curso earliest=0 latest=now
| stats
    count as total_eventos
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

Comparación de tiempos:

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

---

## 3.4 SPL

El asistente puede:

- construir búsquedas desde lo más simple a lo más complejo;
- utilizar `search`;
- utilizar `where`;
- utilizar `eval`;
- utilizar `stats`;
- utilizar `timechart`;
- utilizar `table`;
- utilizar `sort`;
- utilizar `head`;
- utilizar `rex`;
- utilizar `fieldsummary`;
- combinar condiciones;
- agrupar resultados;
- ordenar rankings;
- controlar valores nulos;
- normalizar campos numéricos.

Consulta de referencia:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

---

## 3.5 Objetos operativos

El asistente puede:

- guardar una búsqueda;
- crear un reporte;
- programar una ejecución;
- crear una visualización;
- crear un dashboard;
- añadir un selector temporal;
- añadir un filtro por `host`;
- añadir un filtro por `status`;
- configurar una alerta;
- probar una alerta;
- revisar permisos del objeto;
- compartir un objeto con el rol adecuado.

---

# 4. Objetivos específicos

## 4.1 Preparar el entorno

El asistente podrá:

- comprobar la arquitectura del equipo;
- revisar memoria disponible;
- revisar espacio en disco;
- revisar inodos;
- comprobar conectividad básica;
- verificar la ruta de instalación;
- instalar manualmente el paquete `.deb` de Splunk Enterprise;
- aceptar la licencia;
- crear la cuenta administrativa local;
- verificar la versión instalada;
- verificar el estado de `splunkd`;
- revisar los logs principales;
- acceder a Splunk Web en el puerto `8000`;
- diferenciar permisos de Splunk y permisos de Ubuntu;
- documentar las características del entorno.

Comandos de referencia:

```bash
uname -m
```

```bash
free -h
```

```bash
df -h
```

```bash
df -i
```

```bash
/opt/splunk/bin/splunk version
```

```bash
sudo systemctl status Splunkd --no-pager
```

Validación web:

```bash
curl -I http://127.0.0.1:8000
```

### Evidencia esperada

El asistente debe conservar:

- versión;
- sistema operativo;
- arquitectura;
- usuario de ejecución;
- ruta de instalación;
- estado del servicio;
- puertos;
- resultado de la prueba web;
- observaciones sobre recursos.

---

## 4.2 Comprender los datos

El asistente podrá:

- diferenciar eventos de campos;
- diferenciar una fuente de un índice;
- explicar la función de `source`;
- explicar la función de `sourcetype`;
- explicar la función de `host`;
- explicar la diferencia entre ingesta e indexación;
- interpretar `_raw`;
- interpretar `_time`;
- interpretar `_indextime`;
- comprobar qué campos se han extraído;
- revisar los valores reales de un campo;
- explicar cómo un timestamp incorrecto puede ocultar resultados;
- reconocer el recorrido desde una fuente hasta una búsqueda.

Consulta de inspección:

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

Consulta de descubrimiento de campos:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Consulta de metadatos:

```spl
index=curso earliest=0 latest=now
| stats count by source sourcetype host
| sort - count
```

---

## 4.3 Buscar y analizar

El asistente podrá:

- buscar eventos por índice;
- añadir rangos temporales;
- filtrar por campos;
- utilizar operadores booleanos;
- utilizar comparaciones numéricas;
- ordenar resultados;
- seleccionar únicamente los campos relevantes;
- contar eventos;
- agrupar eventos;
- calcular porcentajes;
- utilizar `stats`;
- utilizar `timechart`;
- utilizar `eval`;
- utilizar `rex`;
- identificar campos ausentes;
- detectar valores no convertibles;
- interpretar resultados;
- reconocer datos incompletos o mal extraídos.

### Búsqueda mínima

```spl
index=curso earliest=0 latest=now
| stats count as total_peticiones
```

### Filtrado por código HTTP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| where status_num=404
| stats count as errores_404
```

### Errores por URI

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

### Evolución temporal

```spl
index=curso earliest=0 latest=now
| timechart span=1m count as peticiones
```

### Detección de valores no numéricos

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| where isnotnull(status) AND isnull(status_num)
| table _time status uri _raw
```

---

## 4.4 Presentar y actuar

El asistente podrá:

- guardar búsquedas como reportes;
- elegir una visualización adecuada;
- justificar la elección de una tabla, gráfico o single value;
- construir dashboards con paneles;
- añadir filtros;
- utilizar tokens;
- configurar una alerta comprensible;
- justificar la ventana temporal;
- configurar throttling;
- probar la acción de la alerta;
- documentar resultados y decisiones.

### Ejemplo de alerta

Objetivo:

> Detectar cinco o más errores HTTP 500 en cinco minutos.

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(trim(status))
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

La consulta debe probarse de dos formas:

1. con datos recientes;
2. con un intervalo histórico que contenga eventos conocidos.

Una prueba histórica valida la lógica, pero no demuestra por sí sola que la
alerta en tiempo real esté funcionando.

---

# 5. Objetivos organizados por sesiones

## 5.1 Sesión 1: fundamentos e ingestión

Al terminar la sesión 1, el asistente podrá:

- explicar qué es Splunk Enterprise;
- distinguir Splunk Web de `splunkd`;
- identificar los componentes básicos;
- comprobar el estado de la instancia;
- explicar qué es un evento;
- explicar qué es un índice;
- explicar qué es una entrada;
- diferenciar `source`, `sourcetype` y `host`;
- crear o validar el índice `curso`;
- cargar `eventos_web.csv`;
- localizar los eventos;
- revisar el timestamp;
- documentar el proceso de ingesta;
- utilizar la guía de troubleshooting.

### Evidencias de la sesión 1

- [ ] Captura o salida del estado del servicio.
- [ ] Versión de Splunk.
- [ ] Índice `curso` validado.
- [ ] Entrada de datos documentada.
- [ ] Número de eventos.
- [ ] Primer y último evento.
- [ ] `source`, `sourcetype` y `host`.
- [ ] Consulta de validación.
- [ ] Limitaciones observadas.

Referencia:

```markdown
[Sesión 1](../sesion-1/index.md)
```

---

## 5.2 Sesión 2: búsquedas y SPL

Al terminar la sesión 2, el asistente podrá:

- escribir búsquedas básicas;
- utilizar rangos temporales;
- filtrar eventos;
- comprobar valores;
- ordenar resultados;
- seleccionar campos;
- calcular estadísticas;
- utilizar funciones de evaluación;
- convertir textos en números;
- extraer campos;
- crear series temporales;
- analizar errores;
- optimizar consultas básicas;
- explicar por qué una consulta produce un resultado concreto.

### Evidencias de la sesión 2

- [ ] Búsqueda de volumen total.
- [ ] Búsqueda de peticiones por host.
- [ ] Búsqueda de errores por URI.
- [ ] Consulta de códigos HTTP.
- [ ] Consulta temporal.
- [ ] Uso de `tonumber`.
- [ ] Uso de `fieldsummary`.
- [ ] Interpretación escrita.
- [ ] Limitaciones documentadas.

Referencia:

```markdown
[Sesión 2](../sesion-2/index.md)
```

---

## 5.3 Sesión 3: reportes, dashboards y alertas

Al terminar la sesión 3, el asistente podrá:

- guardar una búsqueda;
- crear un reporte;
- programar un reporte;
- elegir una visualización;
- diseñar un dashboard;
- crear paneles;
- utilizar filtros temporales;
- utilizar filtros por `host` o `status`;
- configurar una alerta;
- establecer una condición;
- configurar una frecuencia;
- aplicar throttling;
- revisar permisos;
- validar el objeto con otro usuario;
- presentar el proyecto final.

### Evidencias de la sesión 3

- [ ] Reporte de errores por URI.
- [ ] Reporte de tráfico por host.
- [ ] Dashboard funcional.
- [ ] Selector temporal.
- [ ] Filtro por host o status.
- [ ] Alerta de HTTP 500.
- [ ] Prueba manual de la alerta.
- [ ] Configuración de throttling.
- [ ] Permisos documentados.
- [ ] Capturas o exportación de resultados.

Referencia:

```markdown
[Sesión 3](../sesion-3/index.md)
```

---

# 6. Evidencias de aprendizaje

El aprendizaje se comprobará mediante una secuencia de resultados:

1. Instancia local operativa en Ubuntu.
2. Splunk Web accesible.
3. Índice `curso` creado o validado.
4. Dataset de laboratorio ingerido.
5. Búsqueda mínima con eventos.
6. Campos y timestamps comprobados.
7. Búsquedas SPL documentadas.
8. Un reporte o visualización basada en los datos.
9. Un dashboard con al menos un filtro.
10. Una alerta o propuesta de alerta justificada.
11. Validación de permisos.
12. Informe final con limitaciones y conclusiones.

Cada evidencia debe indicar:

- objetivo;
- fecha;
- usuario;
- índice;
- rango temporal;
- SPL o configuración;
- resultado;
- interpretación;
- limitaciones.

---

# 7. Criterios de logro

## Nivel inicial

El asistente:

- accede a Splunk Web;
- ejecuta búsquedas básicas;
- localiza eventos;
- identifica el índice;
- reconoce los campos principales.

## Nivel operativo

El asistente:

- construye búsquedas reproducibles;
- utiliza rangos temporales;
- normaliza campos;
- calcula estadísticas;
- crea visualizaciones;
- documenta resultados;
- identifica errores de ingesta o parsing.

## Nivel final

El asistente:

- diseña una solución de monitorización;
- crea reportes;
- construye un dashboard;
- configura una alerta;
- revisa permisos;
- prueba con un usuario operativo;
- interpreta limitaciones;
- utiliza troubleshooting;
- explica y defiende sus decisiones técnicas.

---

# 8. Criterios de calidad

Una práctica se considera correcta cuando:

- utiliza el índice esperado;
- incluye un rango temporal;
- utiliza campos existentes;
- normaliza los valores cuando es necesario;
- evita `index=*` sin justificación;
- evita `table *`;
- limita rankings innecesarios;
- documenta el resultado;
- diferencia datos observados de hipótesis;
- indica las limitaciones;
- puede repetirse por otra persona;
- no utiliza permisos excesivos;
- no expone información sensible.

## 8.1 Reproducibilidad

Una consulta reproducible debe indicar:

```markdown
- Índice:
- Rango temporal:
- Usuario:
- SPL:
- Campos:
- Resultado esperado:
- Resultado observado:
- Interpretación:
- Limitaciones:
```

## 8.2 Normalización

Los campos numéricos deben convertirse antes de compararlos:

```spl
| eval status_num=tonumber(trim(status))
```

No se debe asumir que un campo es numérico solo porque contiene valores como
`200`, `404` o `500`.

## 8.3 Limitaciones

Si no existe un campo, debe documentarse:

```text
El dataset no contiene el campo response_time. No se calcula latencia.
```

No se debe presentar una dimensión alternativa como si fuera equivalente.

---

# 9. Actividades prácticas asociadas

## Actividad 1: validar la plataforma

```bash
/opt/splunk/bin/splunk version
```

```bash
sudo systemctl status Splunkd --no-pager
```

```bash
curl -I http://127.0.0.1:8000
```

Resultado esperado:

- versión visible;
- servicio activo;
- respuesta web disponible.

---

## Actividad 2: validar la búsqueda

```spl
| makeresults
| eval estado="Splunk responde"
```

Resultado esperado:

```text
estado = Splunk responde
```

---

## Actividad 3: validar los datos

```spl
index=curso earliest=0 latest=now
| stats
    count as total_eventos
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

Resultado esperado:

- eventos encontrados;
- primer timestamp;
- último timestamp.

---

## Actividad 4: revisar campos

```spl
index=curso earliest=0 latest=now
| table _time _raw host source sourcetype method status uri
| head 20
```

Resultado esperado:

- eventos visibles;
- campos identificables;
- `_raw` disponible para comparación.

---

## Actividad 5: crear una métrica

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| stats count as total_peticiones
```

Resultado esperado:

- una métrica de volumen;
- consulta reproducible;
- rango temporal conocido.

---

## Actividad 6: crear una alerta

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(trim(status))
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

Resultado esperado:

- cero resultados si no se cumple la condición;
- una fila si se detectan cinco o más errores HTTP 500.

---

# 10. Errores que el asistente debe saber evitar

Durante el curso se analizarán estos errores habituales:

- buscar en un índice incorrecto;
- utilizar un rango temporal que no contiene el dataset;
- asumir que todos los campos existen;
- comparar texto como si fuera número;
- utilizar `index=*` como primera consulta;
- cargar varias veces el mismo archivo;
- crear duplicados;
- usar `table *`;
- confiar en un gráfico sin revisar los eventos;
- conceder `admin` para resolver un problema de lectura;
- modificar varias capas al mismo tiempo;
- construir el dashboard antes de validar la SPL;
- probar una alerta únicamente con datos históricos;
- no documentar campos ausentes;
- no comprobar los permisos del usuario final.

---

# 11. Evaluación práctica

La evaluación debe comprobar tanto la ejecución como la comprensión.

## 11.1 Plataforma e ingesta

El asistente debe demostrar que:

- Splunk está activo;
- Splunk Web responde;
- el índice `curso` existe;
- los eventos están disponibles;
- la fuente está documentada.

## 11.2 SPL

El asistente debe demostrar que:

- utiliza un rango temporal;
- normaliza `status`;
- realiza agrupaciones;
- crea una serie temporal;
- interpreta los resultados;
- evita consultas innecesariamente amplias.

## 11.3 Visualización

El asistente debe justificar:

- por qué utiliza una tabla;
- por qué utiliza un gráfico;
- qué representa cada eje;
- qué unidad utiliza;
- qué rango temporal se muestra;
- qué limitación tiene la visualización.

## 11.4 Alertas

El asistente debe explicar:

- qué condición se evalúa;
- con qué frecuencia;
- qué ventana temporal se utiliza;
- qué acción se ejecuta;
- cómo se evita el ruido;
- cómo se prueba la alerta.

## 11.5 Documentación

El asistente debe entregar:

- SPL;
- resultados;
- capturas;
- interpretación;
- limitaciones;
- permisos;
- validación;
- conclusiones.

---

# 12. Relación con la documentación del curso

Estos objetivos se desarrollan mediante los siguientes documentos:

- [Presentación del curso](presentacion.md)
- [Preparación del laboratorio](../preparacion/index.md)
- [Arquitectura de Splunk](../preparacion/arquitectura.md)
- [Datos del laboratorio](../preparacion/datos-laboratorio.md)
- [Sesión 1](../sesion-1/index.md)
- [Sesión 2](../sesion-2/index.md)
- [Sesión 3](../sesion-3/index.md)
- [Proyecto final](../proyecto/index.md)
- [Entregables](../proyecto/entregables.md)
- [Evaluación](../proyecto/evaluacion.md)
- [Troubleshooting](../troubleshooting/index.md)
- [Splunk no inicia](../troubleshooting/splunk-no-inicia.md)
- [Acceso web](../troubleshooting/acceso-web.md)
- [Datos no aparecen](../troubleshooting/datos-no-aparecen.md)
- [Campos incorrectos](../troubleshooting/campos-incorrectos.md)

---

# 13. Lista de comprobación del asistente

## Entorno

- [ ] He comprobado la versión de Splunk.
- [ ] He comprobado el sistema operativo.
- [ ] He comprobado el estado de `splunkd`.
- [ ] He comprobado Splunk Web.
- [ ] He revisado los puertos principales.
- [ ] Sé qué usuario ejecuta Splunk.
- [ ] Distingo el rol `admin` de `sudo`.

## Datos

- [ ] Existe el índice `curso`.
- [ ] La entrada de datos está documentada.
- [ ] El dataset se ha cargado una sola vez.
- [ ] Conozco el `source`.
- [ ] Conozco el `sourcetype`.
- [ ] Conozco el `host`.
- [ ] He revisado `_raw`.
- [ ] He revisado `_time`.
- [ ] He revisado `_indextime`.
- [ ] Sé qué rango temporal contiene los eventos.

## SPL

- [ ] He utilizado un índice explícito.
- [ ] He utilizado un rango temporal.
- [ ] He revisado los nombres de los campos.
- [ ] He convertido `status` con `tonumber`.
- [ ] He utilizado `stats`.
- [ ] He utilizado `timechart`.
- [ ] He probado los filtros progresivamente.
- [ ] He revisado los valores nulos.
- [ ] He documentado la interpretación.

## Objetos

- [ ] He creado una búsqueda guardada.
- [ ] He creado un reporte.
- [ ] He creado una visualización.
- [ ] He creado un dashboard.
- [ ] He añadido un filtro.
- [ ] He creado una alerta.
- [ ] He probado la condición.
- [ ] He revisado los permisos.

## Documentación

- [ ] He indicado el objetivo.
- [ ] He guardado la SPL.
- [ ] He indicado el índice.
- [ ] He indicado el rango temporal.
- [ ] He descrito el resultado esperado.
- [ ] He descrito el resultado observado.
- [ ] He documentado las limitaciones.
- [ ] He conservado evidencias.
- [ ] He validado con el usuario previsto.

---

# 14. Referencias oficiales

## Splunk Enterprise

- [Documentación general de Splunk](https://docs.splunk.com/Documentation/Splunk)
- [Splunk Enterprise Help](https://help.splunk.com/en/splunk-enterprise)
- [Notas de versión](https://docs.splunk.com/Documentation/Splunk/latest/ReleaseNotes)

## Arquitectura, datos e índices

- [Introducción a la entrada de datos](https://docs.splunk.com/Documentation/Splunk/latest/Data/Whatissource)
- [Cómo procesa Splunk los datos](https://docs.splunk.com/Documentation/Splunk/latest/Data/HowSplunkprocessesdata)
- [Índices](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Monitorizar archivos y directorios](https://docs.splunk.com/Documentation/Splunk/latest/Data/Monitorfilesanddirectories)
- [Referencia de `inputs.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Inputsconf)
- [Referencia de `indexes.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Indexesconf)
- [Referencia de `props.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Propsconf)

## SPL y búsqueda

- [Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/WhatsInThisManual)
- [Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Overview)
- [Funciones de evaluación](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/CommonEvalFunctions)
- [`stats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Stats)
- [`timechart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart)
- [`eval`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Eval)
- [`rex`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Rex)
- [`fieldsummary`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fieldsummary)
- [Modificadores temporales](https://docs.splunk.com/Documentation/Splunk/latest/Search/Specifytimemodifiersinyoursearch)

## Dashboards, reportes y alertas

- [Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/AboutDashboards)
- [Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/IntroFrame)
- [Visualizaciones](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)
- [Alertas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Búsquedas programadas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Definescheduledalerts)
- [Throttling de alertas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/ThrottleAlerts)

## Seguridad y permisos

- [Roles y capacidades](https://docs.splunk.com/Documentation/Splunk/latest/Security/Rolesandcapabilities)
- [Usuarios y roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Objetos de conocimiento](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)
- [Gestión de permisos de objetos](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Manageknowledgeobjects)

## Troubleshooting

- [Troubleshooting general](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Abouttroubleshooting)
- [Troubleshooting de datos](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Troubleshootingyourdata)
- [Monitoring Console](https://docs.splunk.com/Documentation/Splunk/latest/Monitor/MonitoringConsole)
- [Job Inspector](https://docs.splunk.com/Documentation/Splunk/latest/Search/Viewsearchjobproperties)

## Ubuntu

- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)
- [Systemd en Ubuntu](https://documentation.ubuntu.com/server/explanation/systemd/)
- [Firewall en Ubuntu](https://documentation.ubuntu.com/server/how-to/security/firewalls/)