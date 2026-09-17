# Agenda del curso

El curso se desarrolla en **tres sesiones de seis horas**, con un total de
**18 horas lectivas**.

El recorrido está diseñado para trabajar sobre una instancia mononodo de:

- **Splunk Enterprise 10.4.3**;
- **Ubuntu 24.04.5 LTS**;
- índice de laboratorio `curso`;
- dataset web de prácticas;
- acceso administrativo a Splunk;
- entorno local accesible mediante Splunk Web.

El curso tiene un enfoque práctico. Cada bloque combina:

1. explicación breve;
2. demostración;
3. ejecución guiada;
4. validación;
5. interpretación;
6. documentación.

El objetivo no es únicamente ejecutar comandos. El asistente debe comprender
cómo se transforma una fuente de datos en una búsqueda, una métrica, una
visualización, un dashboard o una alerta.

```text
Fuente de datos
    ↓
Entrada
    ↓
Parsing
    ↓
Índice
    ↓
Eventos y campos
    ↓
Búsqueda SPL
    ↓
Estadística o visualización
    ↓
Reporte, dashboard o alerta
    ↓
Decisión operativa
```

---

## 1. Requisitos previos

Antes de comenzar la primera sesión, el asistente debe disponer de:

- Splunk Enterprise instalado;
- acceso a Splunk Web;
- usuario con rol `admin`;
- acceso a una terminal de Ubuntu;
- permisos suficientes para consultar el estado del servicio;
- dataset `eventos_web.csv`;
- índice `curso` creado o autorización para crearlo;
- navegador web actualizado;
- acceso local al puerto `8000`.

### 1.1 Comprobaciones previas

En Ubuntu:

```bash
/opt/splunk/bin/splunk version
```

```bash
sudo systemctl status Splunkd --no-pager
```

```bash
sudo ss -ltnp | grep -E ':8000|:8089'
```

Comprobación de Splunk Web:

```bash
curl -I http://127.0.0.1:8000
```

El acceso habitual es:

```text
http://localhost:8000
```

### 1.2 Nota sobre los permisos

El rol `admin` permite administrar objetos y configuraciones dentro de Splunk,
pero no sustituye automáticamente los permisos de Ubuntu.

Por ejemplo:

| Acción | Permiso habitual |
|---|---|
| Crear un índice desde Splunk Web | Rol de Splunk con capacidad adecuada |
| Crear una alerta | Permisos sobre objetos y alertas |
| Consultar el servicio con `systemctl` | Permisos del sistema, normalmente `sudo` |
| Leer archivos protegidos de Ubuntu | Permisos del sistema de archivos |
| Abrir puertos del firewall | Permisos administrativos de Ubuntu |

Durante el curso se utiliza `admin` para facilitar la configuración. En un
entorno real, los asistentes deben comprobar también la solución con un rol
operativo de menor privilegio.

---

## 2. Metodología de trabajo

Cada bloque sigue el ciclo:

```text
Explicación
    ↓
Demostración
    ↓
Práctica guiada
    ↓
Validación
    ↓
Interpretación
    ↓
Documentación
```

En cada práctica se debe registrar:

- objetivo;
- índice utilizado;
- rango temporal;
- usuario;
- SPL o configuración;
- resultado esperado;
- resultado observado;
- interpretación;
- limitaciones;
- evidencia.

Una búsqueda no se considera completamente validada solo porque devuelva
resultados. También hay que comprobar que:

- utiliza el índice correcto;
- emplea un intervalo temporal adecuado;
- los campos existen;
- los valores están bien interpretados;
- el usuario tiene permisos;
- el resultado responde a la pregunta planteada.

---

## 3. Sesión 1: fundamentos e ingestión

**Duración total: 6 horas**

La primera sesión establece la base operativa del curso. Se comprueba la
instalación, se revisa la arquitectura, se ingieren datos y se valida el índice
`curso`.

### 3.1 Distribución temporal

| Bloque | Duración |
|---|---:|
| Presentación e introducción a Splunk | 45 minutos |
| Conceptos fundamentales | 45 minutos |
| Preparación, arquitectura y componentes | 60 minutos |
| Ingesta de datos e índices | 90 minutos |
| Navegación por Splunk Web | 30 minutos |
| Búsquedas iniciales y validación | 60 minutos |
| Laboratorio y repaso | 30 minutos |
| **Total** | **360 minutos** |

---

### 3.2 Bloque 1: presentación e introducción a Splunk

**Duración: 45 minutos**

### Contenidos

- objetivos del curso;
- flujo general de trabajo;
- casos de uso de Splunk;
- diferencia entre observabilidad, monitorización y análisis;
- visión general de Splunk Enterprise;
- arquitectura mononodo;
- papel de `splunkd`;
- papel de Splunk Web;
- estructura de las sesiones.

### Actividad práctica

Ejecutar una búsqueda mínima:

```spl
| makeresults
| eval estado="Splunk responde"
```

### Resultado esperado

El asistente debe confirmar que:

- la sesión de Splunk Web funciona;
- el motor de búsqueda está disponible;
- puede ejecutar una búsqueda;
- sabe diferenciar una búsqueda de prueba de una búsqueda sobre datos reales.

---

### 3.3 Bloque 2: conceptos fundamentales

**Duración: 45 minutos**

### Contenidos

- eventos;
- fuentes;
- hosts;
- `sourcetype`;
- campos;
- índices;
- `_raw`;
- `_time`;
- `_indextime`;
- diferencia entre ingesta e indexación;
- búsqueda y resultados.

### Actividad práctica

Revisar eventos del índice de laboratorio:

```spl
index=curso earliest=0 latest=now
| table
    _time
    _indextime
    host
    source
    sourcetype
    _raw
| head 20
```

### Preguntas de validación

- ¿Qué representa `_time`?
- ¿Qué representa `_indextime`?
- ¿Dónde se encuentra el evento original?
- ¿Qué diferencia hay entre `source` y `sourcetype`?
- ¿Qué índice contiene los datos?
- ¿El evento se corresponde con el formato esperado?

---

### 3.4 Bloque 3: preparación, arquitectura y componentes

**Duración: 60 minutos**

### Contenidos

- requisitos del laboratorio;
- arquitectura mononodo;
- ubicación de la instalación;
- servicio `Splunkd`;
- Splunk Web;
- puertos principales;
- almacenamiento;
- permisos;
- logs internos;
- diferencias entre administración de Splunk y administración de Ubuntu.

### Comandos de referencia

```bash
/opt/splunk/bin/splunk version
```

```bash
sudo systemctl status Splunkd --no-pager
```

```bash
sudo ss -ltnp | grep -E ':8000|:8089'
```

```bash
df -h
```

```bash
free -h
```

### Puertos habituales

| Puerto | Función |
|---:|---|
| `8000` | Splunk Web |
| `8089` | Management port y API REST |
| `9997` | Recepción desde forwarders |
| `8088` | HTTP Event Collector, si está configurado |

### Evidencia

El asistente debe documentar:

- versión instalada;
- sistema operativo;
- arquitectura;
- estado del servicio;
- ruta de instalación;
- puertos;
- espacio disponible;
- resultado de la comprobación web.

---

### 3.5 Bloque 4: ingesta de datos e índices

**Duración: 90 minutos**

### Contenidos

- creación y validación del índice `curso`;
- carga de un archivo CSV;
- selección del tipo de fuente;
- configuración del timestamp;
- selección del `sourcetype`;
- comprobación de los campos;
- prevención de duplicados;
- diferencia entre carga puntual y monitorización;
- validación de eventos.

### Validar el índice

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

### Validar la entrada de datos

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype host disabled
```

### Validar los eventos

```spl
index=curso earliest=0 latest=now
| stats
    count as total_eventos
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

### Revisar campos

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

### Revisar metadatos

```spl
index=curso earliest=0 latest=now
| stats count by source sourcetype host
| sort - count
```

### Resultado esperado

El asistente debe poder confirmar:

- que el índice `curso` existe;
- que los eventos están disponibles;
- cuántos eventos se han indexado;
- qué fechas tienen los eventos;
- qué `source` y `sourcetype` se han utilizado;
- qué campos están disponibles;
- si existen diferencias entre el dataset esperado y el real.

### Advertencia sobre el rango temporal

El dataset de laboratorio puede contener eventos históricos. Por eso una
búsqueda como esta puede no devolver resultados:

```spl
index=curso earliest=-24h latest=now
| stats count
```

Para localizar todos los eventos disponibles durante la validación:

```spl
index=curso earliest=0 latest=now
| stats count
```

---

### 3.6 Bloque 5: navegación por Splunk Web

**Duración: 30 minutos**

### Contenidos

- barra de aplicaciones;
- Search & Reporting;
- selector temporal;
- pestañas de resultados;
- eventos;
- estadísticas;
- visualizaciones;
- Job Inspector;
- búsquedas guardadas;
- configuración;
- gestión de índices;
- gestión de entradas.

### Actividad práctica

Ejecutar una búsqueda y revisar:

1. eventos;
2. campos;
3. estadísticas;
4. visualización;
5. tiempo de ejecución;
6. Job Inspector.

Consulta de ejemplo:

```spl
index=curso earliest=0 latest=now
| stats count by status
| sort - count
```

### Resultado esperado

El asistente debe poder cambiar entre:

- vista de eventos;
- vista de tabla;
- vista estadística;
- vista gráfica.

También debe identificar si el problema está en:

- la búsqueda;
- los datos;
- el rango temporal;
- los permisos;
- la visualización.

---

### 3.7 Bloque 6: búsquedas iniciales y validación

**Duración: 60 minutos**

### Contenidos

- búsqueda por índice;
- búsqueda por campo;
- rangos temporales;
- `stats`;
- `table`;
- `head`;
- ordenación;
- validación de valores.

### Búsqueda total

```spl
index=curso earliest=0 latest=now
| stats count as total_peticiones
```

### Distribución por método

```spl
index=curso earliest=0 latest=now
| stats count by method
| sort - count
```

### Distribución por estado HTTP

```spl
index=curso earliest=0 latest=now
| stats count by status
| sort status
```

### Distribución por host

```spl
index=curso earliest=0 latest=now
| stats count by host
| sort - count
```

### Resultado esperado

El asistente debe entregar una tabla con:

- consulta;
- resultado;
- interpretación;
- rango temporal;
- campos utilizados.

---

### 3.8 Bloque 7: laboratorio y repaso

**Duración: 30 minutos**

### Actividad

Completar una ficha de validación:

```markdown
## Validación de la sesión 1

- Versión:
- Sistema operativo:
- Estado del servicio:
- Splunk Web:
- Índice:
- Número de eventos:
- Primer evento:
- Último evento:
- Source:
- Sourcetype:
- Host:
- Campos disponibles:
- Problemas detectados:
- Solución aplicada:
```

### Resultados de aprendizaje

Al terminar la sesión 1, el asistente podrá:

- explicar qué es un evento en Splunk;
- identificar los principales componentes;
- verificar una instalación preparada;
- acceder a Splunk Web;
- validar o crear un índice;
- incorporar un archivo CSV;
- identificar el timestamp de los eventos;
- validar los datos indexados;
- documentar la ingesta.

### Referencias internas

- [Preparación del laboratorio](../preparacion/index.md)
- [Arquitectura y componentes](../preparacion/arquitectura.md)
- [Datos del laboratorio](../preparacion/datos-laboratorio.md)
- [Ingesta de datos](../sesion-1/04-ingesta-datos.md)
- [Gestión de índices](../sesion-1/05-indices.md)

---

# 4. Sesión 2: búsquedas y lenguaje SPL

**Duración total: 6 horas**

La segunda sesión transforma los eventos ingeridos en información útil mediante
SPL.

## 4.1 Distribución temporal

| Bloque | Duración |
|---|---:|
| Introducción a SPL | 45 minutos |
| Búsquedas y filtros | 60 minutos |
| Gestión del tiempo y campos | 45 minutos |
| Estadísticas y agregaciones | 75 minutos |
| `eval`, funciones y extracciones | 75 minutos |
| Rendimiento y buenas prácticas | 30 minutos |
| Laboratorio y reto | 30 minutos |
| **Total** | **360 minutos** |

---

## 4.2 Bloque 1: introducción a SPL

**Duración: 45 minutos**

### Contenidos

- estructura de una búsqueda;
- comando inicial;
- tubería `|`;
- resultados intermedios;
- comandos distributivos y transformadores;
- diferencia entre filtrar y transformar;
- legibilidad de las búsquedas.

### Ejemplo

```spl
index=curso earliest=0 latest=now
| fields _time host method status uri
| head 20
```

### Resultado esperado

El asistente debe poder explicar cada parte:

- origen de los datos;
- campos seleccionados;
- límite de resultados;
- intervalo temporal.

---

## 4.3 Bloque 2: búsquedas y filtros

**Duración: 60 minutos**

### Contenidos

- filtros por campo;
- operadores booleanos;
- agrupación de condiciones;
- comodines;
- valores exactos;
- comparación de campos;
- filtros con `search` y `where`.

### Ejemplos

```spl
index=curso earliest=0 latest=now status=500
| table _time host method status uri
```

```spl
index=curso earliest=0 latest=now
(status=404 OR status=500)
| stats count by status
```

```spl
index=curso earliest=0 latest=now
| where host="web-01"
| stats count by status
```

### Actividad

Construir consultas para:

- peticiones `GET`;
- errores `404`;
- errores `500`;
- peticiones de un host;
- URI que contengan una palabra concreta.

---

## 4.4 Bloque 3: gestión del tiempo y campos

**Duración: 45 minutos**

### Contenidos

- selector temporal;
- `earliest`;
- `latest`;
- intervalos relativos;
- intervalos absolutos;
- `_time`;
- `_indextime`;
- campos internos;
- campos ausentes;
- valores nulos.

### Búsqueda de validación temporal

```spl
index=curso earliest=0 latest=now
| stats
    count
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

### Actividad

Comparar el resultado de:

```spl
index=curso earliest=-24h latest=now
| stats count
```

con:

```spl
index=curso earliest=0 latest=now
| stats count
```

### Resultado esperado

El asistente debe poder explicar por qué los resultados pueden ser diferentes
aunque el índice y la SPL sean iguales.

---

## 4.5 Bloque 4: estadísticas y agregaciones

**Duración: 75 minutos**

### Contenidos

- `stats`;
- `count`;
- `dc`;
- `sum`;
- `avg`;
- `min`;
- `max`;
- agrupación por uno o varios campos;
- ordenación de resultados;
- rankings;
- interpretación de tablas.

### Total de peticiones

```spl
index=curso earliest=0 latest=now
| stats count as total_peticiones
```

### Peticiones por host

```spl
index=curso earliest=0 latest=now
| stats count as peticiones by host
| sort - peticiones
```

### Peticiones por método y estado

```spl
index=curso earliest=0 latest=now
| stats count as peticiones by method status
| sort - peticiones
```

### Hosts diferentes

```spl
index=curso earliest=0 latest=now
| stats dc(host) as hosts_distintos
```

### Actividad

Crear una tabla que responda:

- qué host tiene más peticiones;
- qué método se utiliza más;
- qué código HTTP aparece con mayor frecuencia;
- qué combinación de método y estado es más habitual.

---

## 4.6 Bloque 5: `eval`, funciones y extracciones

**Duración: 75 minutos**

### Contenidos

- creación de campos calculados;
- conversión de tipos;
- `tonumber`;
- `trim`;
- `case`;
- `if`;
- `coalesce`;
- `isnull`;
- `isnotnull`;
- `rex`;
- comprobación de conversiones.

### Normalización de `status`

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| table _time status status_num uri
| head 20
```

### Clasificación por familia HTTP

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

### Errores por URI

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

### Detección de valores no numéricos

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| where isnotnull(status) AND isnull(status_num)
| table _time status uri _raw
```

### Nota práctica

No se debe comparar directamente un campo textual como si fuera numérico sin
comprobar su tipo. Para códigos HTTP se recomienda:

```spl
| eval status_num=tonumber(trim(status))
```

---

## 4.7 Bloque 6: rendimiento y buenas prácticas

**Duración: 30 minutos**

### Contenidos

- especificar el índice;
- limitar el rango temporal;
- evitar `index=*`;
- evitar `table *`;
- seleccionar campos necesarios;
- filtrar lo antes posible;
- utilizar `head` durante la exploración;
- revisar Job Inspector;
- distinguir rapidez de corrección;
- documentar búsquedas.

### Ejemplo preferido

```spl
index=curso earliest=0 latest=now
| fields _time host status uri
| where status=500
| stats count by uri
| sort - count
| head 10
```

### Prácticas que deben evitarse

```spl
index=*
| table *
```

La búsqueda anterior es poco específica, puede procesar datos innecesarios y
dificulta la reproducción del resultado.

---

## 4.8 Bloque 7: laboratorio y reto

**Duración: 30 minutos**

### Reto

Crear cinco búsquedas documentadas:

1. volumen total de peticiones;
2. porcentaje de error;
3. errores por URI;
4. detalle de errores HTTP 500;
5. evolución temporal del tráfico.

### Ejemplo de porcentaje de error

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| stats
    count as total
    count(eval(status_num>=400)) as errores
| eval porcentaje_error=round(
    errores * 100 / total,
    2
)
| table total errores porcentaje_error
```

### Evolución temporal

```spl
index=curso earliest=0 latest=now
| timechart span=1m count as peticiones
```

### Resultados de aprendizaje

Al terminar la sesión 2, el asistente podrá:

- buscar eventos por índice y campo;
- utilizar operadores booleanos;
- filtrar y ordenar resultados;
- crear estadísticas;
- generar series temporales;
- calcular campos mediante `eval`;
- extraer campos mediante `rex`;
- convertir valores de texto a números;
- optimizar búsquedas básicas;
- interpretar limitaciones y valores ausentes.

### Referencias internas

- [Introducción a SPL](../sesion-2/01-introduccion-spl.md)
- [Búsquedas básicas](../sesion-2/02-busquedas-basicas.md)
- [Gestión del tiempo](../sesion-2/03-gestion-tiempo.md)
- [Estadísticas](../sesion-2/06-estadisticas.md)
- [Eval y funciones](../sesion-2/07-eval-funciones.md)
- [Extracción de campos](../sesion-2/08-extraccion-campos.md)
- [Rendimiento](../sesion-2/10-rendimiento.md)

---

# 5. Sesión 3: reportes, dashboards y alertas

**Duración total: 6 horas**

La tercera sesión convierte las búsquedas en objetos reutilizables para la
operación diaria: reportes, visualizaciones, dashboards y alertas.

## 5.1 Distribución temporal

| Bloque | Duración |
|---|---:|
| Búsquedas guardadas y reportes | 60 minutos |
| Visualizaciones | 45 minutos |
| Dashboards | 75 minutos |
| Filtros y tokens | 45 minutos |
| Alertas | 60 minutos |
| Proyecto final | 60 minutos |
| Evaluación y cierre | 15 minutos |
| **Total** | **360 minutos** |

---

## 5.2 Bloque 1: búsquedas guardadas y reportes

**Duración: 60 minutos**

### Contenidos

- guardar una búsqueda;
- nombrar objetos;
- añadir descripción;
- definir propietario;
- compartir una búsqueda;
- programar un reporte;
- seleccionar intervalo;
- interpretar resultados;
- evitar duplicación de lógica.

### Reporte de errores por URI

```spl
index=curso earliest=-7d latest=now
| eval status_num=tonumber(trim(status))
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

### Reporte de tráfico por host

```spl
index=curso earliest=-24h latest=now
| stats count as peticiones by host
| sort - peticiones
```

### Validaciones

El asistente debe comprobar:

- que la búsqueda se guarda;
- que la descripción explica el objetivo;
- que el rango temporal es adecuado;
- que el propietario es correcto;
- que el objeto es visible para el usuario previsto;
- que la programación no genera una carga innecesaria.

---

## 5.3 Bloque 2: visualizaciones

**Duración: 45 minutos**

### Contenidos

- tablas;
- single values;
- gráficos de barras;
- gráficos de líneas;
- gráficos de áreas;
- series temporales;
- selección de visualización;
- títulos y unidades;
- interpretación de ejes;
- limitaciones visuales.

### Ejemplos

Single value:

```spl
index=curso earliest=0 latest=now
| stats count as total_peticiones
```

Barras por URI:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

Serie temporal:

```spl
index=curso earliest=0 latest=now
| timechart span=1m count as peticiones
```

### Criterio de selección

La visualización debe responder a la pregunta:

| Pregunta | Visualización recomendada |
|---|---|
| ¿Cuántas peticiones hay? | Single value |
| ¿Qué URI tiene más errores? | Barras o tabla |
| ¿Cómo evoluciona el tráfico? | Línea o área |
| ¿Qué host concentra más peticiones? | Barras |
| ¿Qué estados aparecen? | Barras o tabla |

---

## 5.4 Bloque 3: dashboards

**Duración: 75 minutos**

### Contenidos

- creación de un dashboard;
- Dashboard Studio;
- paneles;
- títulos;
- disposición;
- consultas base;
- reutilización de búsquedas;
- rangos temporales;
- nombres comprensibles;
- coherencia visual;
- validación de paneles.

### Dashboard recomendado

El dashboard del curso debe incluir al menos:

1. total de peticiones;
2. total de errores;
3. peticiones por minuto;
4. distribución de estados HTTP;
5. host con más errores;
6. URI con más errores.

### Total de peticiones

```spl
index=curso earliest=$earliest$ latest=$latest$
| stats count as total_peticiones
```

### Total de errores

```spl
index=curso earliest=$earliest$ latest=$latest$
| eval status_num=tonumber(trim(status))
| stats count(eval(status_num>=400)) as total_errores
```

### Peticiones por minuto

```spl
index=curso earliest=$earliest$ latest=$latest$
| timechart span=1m count as peticiones
```

### Errores por estado

```spl
index=curso earliest=$earliest$ latest=$latest$
| eval status_num=tonumber(trim(status))
| where status_num>=400
| stats count by status_num
| sort - count
```

### URI con más errores

```spl
index=curso earliest=$earliest$ latest=$latest$
| eval status_num=tonumber(trim(status))
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

### Nota sobre los tokens

Los nombres concretos de los tokens dependen de la configuración del dashboard.
La idea general es que los paneles compartan:

- intervalo temporal;
- filtro por host;
- filtro por status.

Antes de validar el dashboard, prueba cada búsqueda por separado.

---

## 5.5 Bloque 4: filtros y tokens

**Duración: 45 minutos**

### Contenidos

- selector temporal;
- filtro por host;
- filtro por status;
- tokens;
- valores por defecto;
- actualización de paneles;
- validación de filtros;
- comportamiento cuando no existen resultados.

### Criterios de validación

Un filtro es funcional cuando:

- modifica al menos un panel;
- utiliza un campo real;
- conserva el rango temporal;
- no rompe la búsqueda;
- permite volver a una selección general;
- muestra un resultado coherente.

### Ejemplo de filtro por host

La lógica de la consulta puede ser:

```spl
index=curso earliest=$earliest$ latest=$latest$ host="$host$"
| stats count as peticiones
```

El nombre del token debe coincidir con el configurado en Dashboard Studio.

---

## 5.6 Bloque 5: alertas

**Duración: 60 minutos**

### Contenidos

- alertas programadas;
- búsquedas basadas en eventos;
- condición de disparo;
- ventana temporal;
- frecuencia;
- acciones;
- correo;
- registro interno;
- throttling;
- falsos positivos;
- pruebas históricas y pruebas en tiempo real.

### Alerta de errores HTTP 500

Objetivo:

> Detectar cinco o más errores HTTP 500 durante los últimos cinco minutos.

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(trim(status))
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

La búsqueda devuelve resultados únicamente cuando se cumple la condición.

### Recomendaciones

- utilizar una ventana temporal explícita;
- utilizar una frecuencia coherente con la ventana;
- evitar enviar una notificación por cada evento;
- configurar throttling;
- documentar la acción;
- probar primero la SPL;
- validar permisos de la alerta;
- comprobar el comportamiento con datos recientes.

### Prueba de la lógica

Para verificar la lógica con datos históricos, adapta temporalmente el rango al
periodo real del dataset. Esta prueba confirma la consulta, pero no sustituye
la validación de la programación en tiempo real.

---

## 5.7 Bloque 6: proyecto final

**Duración: 60 minutos**

### Objetivo

Construir una solución básica de monitorización para una aplicación web.

### Entregables

El asistente debe presentar:

- cinco búsquedas SPL;
- dos reportes;
- un dashboard;
- una alerta;
- una explicación de permisos;
- limitaciones del dataset;
- evidencias de validación.

### Búsquedas mínimas

1. volumen total de peticiones;
2. porcentaje de error;
3. errores por URI;
4. detalle de errores HTTP 500;
5. evolución temporal del tráfico.

### Reportes

1. errores por URI, programado semanalmente;
2. tráfico por host, programado diariamente.

### Dashboard

Debe incluir:

- total de peticiones;
- total de errores;
- peticiones por minuto;
- estados HTTP;
- host con más errores;
- URI con más errores;
- selector temporal;
- filtro por `host` o `status`.

### Alerta

Condición:

```text
cinco o más errores HTTP 500 en cinco minutos
```

Acción:

- correo electrónico, si está disponible; o
- registro documentado en `_internal`.

---

## 5.8 Bloque 7: evaluación y cierre

**Duración: 15 minutos**

### Revisión final

El asistente debe poder explicar:

- de dónde proceden los datos;
- en qué índice se almacenan;
- qué rango temporal se ha utilizado;
- qué campos se han empleado;
- cómo se han calculado las métricas;
- por qué se ha elegido cada visualización;
- cuándo se dispara la alerta;
- qué limitaciones tiene el dataset;
- qué usuario puede acceder a cada objeto;
- cómo diagnosticaría un fallo.

### Resultados de aprendizaje

Al terminar la sesión 3, el asistente podrá:

- guardar y compartir búsquedas;
- crear reportes;
- seleccionar visualizaciones adecuadas;
- construir dashboards;
- añadir filtros interactivos;
- utilizar tokens;
- configurar alertas;
- establecer throttling;
- comprobar permisos;
- presentar una solución básica de monitorización.

### Referencias internas

- [Búsquedas guardadas](../sesion-3/01-busquedas-guardadas.md)
- [Reportes](../sesion-3/02-reportes.md)
- [Visualizaciones](../sesion-3/03-visualizaciones.md)
- [Dashboards](../sesion-3/04-dashboards.md)
- [Filtros y tokens](../sesion-3/05-filtros-tokens.md)
- [Alertas](../sesion-3/06-alertas.md)
- [Administración y seguridad](../sesion-3/07-seguridad.md)
- [Proyecto final](../proyecto/index.md)

---

# 6. Secuencia de trabajo entre sesiones

Cada sesión utiliza los resultados de la anterior:

1. **Sesión 1:** preparar el entorno, validar Splunk, ingerir datos y comprobar
   el índice `curso`.
2. **Sesión 2:** buscar, filtrar, transformar y resumir los eventos mediante SPL.
3. **Sesión 3:** convertir las búsquedas en reportes, visualizaciones,
   dashboards y alertas.
4. **Proyecto final:** integrar todos los elementos en una solución reproducible.

La secuencia puede representarse así:

```text
Sesión 1
Plataforma + datos
    ↓
Sesión 2
SPL + análisis
    ↓
Sesión 3
Dashboards + alertas
    ↓
Proyecto final
Solución documentada
```

La distribución temporal es orientativa. Las comprobaciones de instalación, la
validación de los datos y la corrección de errores tienen prioridad sobre avanzar
a un bloque posterior.

---

# 7. Gestión de incidencias durante el curso

Si una práctica no funciona, utiliza este orden:

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
SPL
    ↓
Permisos
```

## 7.1 Splunk no inicia

Consulta:

- [Splunk no inicia](../troubleshooting/splunk-no-inicia.md)

Comando de referencia:

```bash
sudo systemctl status Splunkd --no-pager
```

## 7.2 Splunk Web no responde

Consulta:

- [No funciona el acceso web](../troubleshooting/acceso-web.md)

Comandos:

```bash
curl -I http://127.0.0.1:8000
```

```bash
sudo ss -ltnp | grep ':8000'
```

## 7.3 No aparecen datos

Consulta:

- [Los datos no aparecen](../troubleshooting/datos-no-aparecen.md)

Búsqueda mínima:

```spl
index=curso earliest=0 latest=now
| stats count
```

## 7.4 Los campos son incorrectos

Consulta:

- [Los campos son incorrectos](../troubleshooting/campos-incorrectos.md)

Búsqueda de diagnóstico:

```spl
index=curso earliest=0 latest=now
| table _time _raw host source sourcetype status uri
| head 20
```

## 7.5 Campos desconocidos

Utiliza:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

No construyas un dashboard o una alerta sobre campos que todavía no has
validado.

---

# 8. Evidencias de aprendizaje

Al finalizar el curso, el asistente debe conservar las siguientes evidencias:

## Plataforma

- [ ] Versión de Splunk.
- [ ] Versión de Ubuntu.
- [ ] Estado de `Splunkd`.
- [ ] Acceso a Splunk Web.
- [ ] Puertos comprobados.

## Ingesta

- [ ] Índice `curso`.
- [ ] Fuente de datos.
- [ ] `sourcetype`.
- [ ] `host`.
- [ ] Número de eventos.
- [ ] Primer y último timestamp.
- [ ] Campos disponibles.

## SPL

- [ ] Consulta de volumen.
- [ ] Consulta de errores.
- [ ] Consulta de errores por URI.
- [ ] Consulta de HTTP 500.
- [ ] Consulta temporal.
- [ ] Uso de `tonumber`.
- [ ] Uso de `stats`.
- [ ] Uso de `timechart`.

## Objetos

- [ ] Búsqueda guardada.
- [ ] Reporte diario.
- [ ] Reporte semanal.
- [ ] Dashboard.
- [ ] Filtro temporal.
- [ ] Filtro por campo.
- [ ] Alerta.
- [ ] Throttling.
- [ ] Permisos documentados.

## Documentación

- [ ] Objetivo de cada práctica.
- [ ] SPL o configuración.
- [ ] Resultado esperado.
- [ ] Resultado observado.
- [ ] Interpretación.
- [ ] Limitaciones.
- [ ] Capturas o evidencias.

---

# 9. Lista de comprobación final

## Sesión 1

- [ ] Splunk está instalado.
- [ ] `Splunkd` está activo.
- [ ] Splunk Web responde.
- [ ] El índice `curso` existe.
- [ ] El dataset se ha ingerido.
- [ ] Los eventos son visibles.
- [ ] El rango temporal es correcto.
- [ ] Los campos están identificados.

## Sesión 2

- [ ] Puedo buscar por índice.
- [ ] Puedo filtrar por campo.
- [ ] Puedo utilizar rangos temporales.
- [ ] Puedo contar eventos.
- [ ] Puedo agrupar resultados.
- [ ] Puedo normalizar `status`.
- [ ] Puedo calcular porcentajes.
- [ ] Puedo generar un `timechart`.
- [ ] Puedo identificar errores por URI.

## Sesión 3

- [ ] Puedo guardar una búsqueda.
- [ ] Puedo crear un reporte.
- [ ] Puedo elegir una visualización.
- [ ] Puedo crear un dashboard.
- [ ] Puedo añadir filtros.
- [ ] Puedo configurar una alerta.
- [ ] Puedo utilizar throttling.
- [ ] Puedo revisar permisos.
- [ ] Puedo presentar las limitaciones.

---

# 10. Referencias del curso

## Documentación interna

- [Presentación](presentacion.md)
- [Objetivos](objetivos.md)
- [Preparación del laboratorio](../preparacion/index.md)
- [Instalación de Splunk](../preparacion/instalacion.md)
- [Arquitectura y componentes](../preparacion/arquitectura.md)
- [Datos del laboratorio](../preparacion/datos-laboratorio.md)
- [Proyecto final](../proyecto/index.md)
- [Entregables](../proyecto/entregables.md)
- [Evaluación](../proyecto/evaluacion.md)
- [Troubleshooting](../troubleshooting/index.md)

## Referencias oficiales de Splunk

- [Documentación de Splunk Enterprise](https://docs.splunk.com/Documentation/Splunk)
- [Splunk Enterprise Help](https://help.splunk.com/en/splunk-enterprise)
- [Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/WhatsInThisManual)
- [Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Overview)
- [Cómo procesa Splunk los datos](https://docs.splunk.com/Documentation/Splunk/latest/Data/HowSplunkprocessesdata)
- [Índices](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Monitorización de archivos](https://docs.splunk.com/Documentation/Splunk/latest/Data/Monitorfilesanddirectories)
- [`stats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Stats)
- [`timechart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart)
- [`eval`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Eval)
- [`rex`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Rex)
- [`fieldsummary`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fieldsummary)
- [Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/IntroFrame)
- [Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/AboutDashboards)
- [Alertas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Throttling de alertas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/ThrottleAlerts)
- [Roles y capacidades](https://docs.splunk.com/Documentation/Splunk/latest/Security/Rolesandcapabilities)
- [Usuarios y roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)

## Referencias de Ubuntu

- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)
- [Systemd en Ubuntu](https://documentation.ubuntu.com/server/explanation/systemd/)
- [Firewall en Ubuntu](https://documentation.ubuntu.com/server/how-to/security/firewalls/)

---

# 11. Resultado final esperado

Al finalizar las tres sesiones, el asistente debe haber pasado de una instancia
instalada a una solución básica y documentada de monitorización:

```text
Instancia operativa
    +
Índice curso
    +
Datos validados
    +
Búsquedas SPL
    +
Reportes
    +
Dashboard
    +
Alerta
    +
Permisos y documentación
```

La solución final debe ser reproducible por otra persona y debe explicar no solo
qué resultado muestra, sino también:

- qué datos utiliza;
- cómo se han procesado;
- qué intervalo temporal se ha aplicado;
- qué campos intervienen;
- qué limitaciones existen;
- qué acción operativa se deriva del resultado.