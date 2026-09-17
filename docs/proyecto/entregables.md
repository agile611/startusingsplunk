## Objetivo de la entrega

El proyecto debe demostrar que puedes transformar datos web ingeridos en Splunk en
una solución básica de monitorización.

El resultado debe seguir este flujo:

```text
Dataset ingerido
    ↓
Validación de los eventos
    ↓
Búsquedas SPL
    ↓
Búsquedas guardadas
    ↓
Reportes
    ↓
Dashboard
    ↓
Filtros interactivos
    ↓
Alerta
    ↓
Análisis y recomendaciones
```

La documentación debe explicar tanto lo que funciona como aquello que no puede
demostrarse con los datos disponibles.

Por ejemplo:

- si no existe una IP, no debes afirmar qué IP genera más errores;
- si no existe un campo de latencia, no debes afirmar qué URL es más lenta;
- si los eventos son históricos, debes indicar que la alerta no se ha validado en
  tiempo real;
- si todos los usuarios han utilizado el rol `admin`, debes indicarlo como
  limitación de la prueba de permisos.

---

## Estructura general de los entregables

La entrega debe incluir los siguientes elementos:

1. Resumen técnico.
2. Evidencia de la ingesta.
3. Cinco búsquedas SPL documentadas.
4. Dos reportes.
5. Un dashboard con seis paneles como mínimo.
6. Dos filtros interactivos.
7. Una alerta.
8. Un análisis escrito.
9. Una validación con otro usuario, cuando sea posible.
10. Lista de limitaciones y recomendaciones.
11. Capturas y archivos editables.

---

# Entregable 1: resumen técnico

Incluye un documento breve con la información básica del entorno y del proyecto.

Debe contener:

- nombre del proyecto;
- nombre del participante;
- fecha;
- versión de Splunk;
- sistema operativo;
- arquitectura del laboratorio;
- índice utilizado;
- dataset utilizado;
- periodo temporal analizado;
- descripción del objetivo;
- usuario utilizado;
- limitaciones conocidas.

## Plantilla recomendada

```markdown
# Resumen técnico

## Proyecto

Nombre: Monitorización de una aplicación web

## Participante

Nombre: ______________________________

## Fecha

Fecha de entrega: ____________________

## Plataforma

Producto: Splunk Enterprise 10.4.3
Sistema operativo: Ubuntu 24.04.5 LTS
Arquitectura: Mononodo
URL de Splunk Web: http://localhost:8000

## Datos

Índice: curso
Dataset: eventos_web.csv
Periodo analizado: ____________________
Número de eventos: ____________________

## Objetivo

Describir en dos o tres frases qué problema se pretende analizar.

## Limitaciones

Enumerar los campos o pruebas que no hayan podido validarse.
```

## Ejemplo

```text
Producto: Splunk Enterprise 10.4.3
Sistema: Ubuntu 24.04.5 LTS
Arquitectura: Mononodo
Índice: curso
Dataset: eventos_web.csv
Periodo: 1 de enero de 2026, 00:00–00:10
Objetivo: monitorizar errores HTTP y volumen de tráfico web
Usuario de validación: admin
Limitaciones: el dataset no incluye IP ni tiempo de respuesta
```

No inventes valores. Si no conoces la cantidad exacta de eventos o el rango
temporal, obtén esos valores mediante una búsqueda SPL.

---

# Entregable 2: validación de la ingesta

Incluye las búsquedas utilizadas para demostrar que los datos existen, que se
encuentran en el índice correcto y que tienen metadatos coherentes.

No es suficiente indicar que el archivo está en el sistema de archivos. Debes
demostrar que los eventos están disponibles en Splunk.

## Número de eventos

```spl
index=curso earliest=0 latest=now
| stats count as eventos
```

Documenta:

- número de eventos;
- intervalo consultado;
- índice utilizado;
- fecha de ejecución.

## Rango temporal

```spl
index=curso earliest=0 latest=now
| stats min(_time) as inicio max(_time) as fin
| eval inicio=strftime(inicio, "%Y-%m-%d %H:%M:%S")
| eval fin=strftime(fin, "%Y-%m-%d %H:%M:%S")
```

Documenta:

- primer evento;
- último evento;
- zona horaria, si se conoce;
- diferencia entre el rango de `_time` y la fecha de carga.

## Comparación entre tiempo del evento y tiempo de indexación

```spl
index=curso earliest=0 latest=now
| eval retraso_ingesta=_indextime-_time
| table _time _indextime retraso_ingesta host status uri
| head 20
```

Esta consulta ayuda a explicar por qué un evento histórico puede haberse indexado
en una fecha posterior.

## Metadatos

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
| sort - count
```

Documenta:

- `host`;
- `source`;
- `sourcetype`;
- número de eventos por combinación;
- posibles valores inesperados.

## Campos

```spl
index=curso earliest=0 latest=now
| table _time host method status uri clientip response_time
| head 20
```

Si el dataset utiliza nombres diferentes, documenta la correspondencia.

Por ejemplo:

| Concepto | Campo encontrado |
|---|---|
| Código HTTP | `status_code` |
| IP de origen | `src_ip` |
| Tiempo de respuesta | `duration` |
| URI | `request_uri` |

## Resumen de campos

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Documenta especialmente si existen:

- `status`;
- `uri`;
- `host`;
- `clientip` o `src_ip`;
- `response_time`, `duration` o `latency`;
- campos con valores nulos;
- campos con tipos inesperados.

## Campos no disponibles

Documenta cualquier campo que no exista.

Ejemplo:

> El dataset contiene `timestamp`, `host`, `method`, `status` y `uri`, pero no
> contiene un campo de IP de origen. Por este motivo, el proyecto utiliza un panel
> de host con más errores como alternativa al análisis por IP.

Otro ejemplo:

> El dataset no contiene una medida de duración o latencia. No se puede construir
> un ranking fiable de URL más lentas. Se incluye en su lugar un ranking de URI con
> más errores.

---

# Entregable 3: cinco búsquedas SPL

Cada búsqueda debe entregarse con la siguiente estructura:

```markdown
## Nombre de la búsqueda

### Objetivo

Describe la pregunta que responde.

### SPL

```spl
consulta
```

### Índice y tiempo

Indica el índice y el rango utilizados.

### Campos utilizados

Enumera los campos necesarios.

### Resultado esperado

Describe qué debería aparecer.

### Resultado observado

Indica qué resultado se obtuvo realmente.

### Interpretación

Explica qué significa el resultado.

### Limitaciones

Indica qué no puede concluirse.
```

La consulta debe ser reproducible por otra persona. Evita entregar únicamente una
captura de la pantalla.

---

## Búsqueda recomendada 1: volumen total

### Objetivo

Determinar cuántas peticiones se han observado durante el intervalo seleccionado.

### SPL

```spl
index=curso earliest=0 latest=now
| stats count as total_peticiones
```

### Resultado esperado

Una única fila con el total de peticiones.

### Interpretación

Esta métrica representa el volumen de eventos observados. No demuestra por sí sola
que la aplicación esté funcionando correctamente.

### Limitaciones

El resultado depende del intervalo temporal y de que todos los eventos esperados
hayan sido ingeridos.

---

## Búsqueda recomendada 2: porcentaje de error

### Objetivo

Calcular el porcentaje de eventos cuyo código HTTP es igual o superior a `400`.

### SPL

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval es_error=if(status_num>=400, 1, 0)
| stats count as total sum(es_error) as errores
| eval porcentaje_error=if(
    total>0,
    round(errores*100/total, 2),
    0
)
```

### Resultado esperado

Una fila con:

- total de peticiones;
- total de errores;
- porcentaje de error.

### Interpretación

El porcentaje permite comparar la proporción de errores con el volumen total.

### Limitaciones

La métrica depende de que `status` esté correctamente extraído y contenga códigos
HTTP válidos.

---

## Búsqueda recomendada 3: errores por URI

### Objetivo

Identificar las URI que concentran más respuestas de error.

### SPL

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

### Resultado esperado

Una tabla ordenada de mayor a menor número de errores por URI.

### Interpretación

Las URI situadas en las primeras posiciones pueden requerir una investigación
prioritaria.

### Limitaciones

Una URI con muchos errores puede tener también un volumen de tráfico muy alto. Para
interpretar correctamente el resultado conviene comparar errores absolutos y
porcentaje de error por URI.

Una versión ampliada es:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval es_error=if(status_num>=400, 1, 0)
| stats
    count as peticiones
    sum(es_error) as errores
    by uri
| eval porcentaje_error=if(
    peticiones>0,
    round(errores*100/peticiones, 2),
    0
)
| sort - porcentaje_error
| head 10
```

---

## Búsqueda recomendada 4: errores HTTP 500

### Objetivo

Localizar respuestas HTTP `500` y conocer los hosts y URI afectados.

### SPL

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count as errores_500 by host uri
| sort - errores_500
```

### Resultado esperado

Una tabla agrupada por host y URI.

### Interpretación

Las respuestas `500` indican que el servidor o la aplicación no pudo completar
correctamente la petición. El resultado debe utilizarse como punto de partida para
una investigación adicional.

### Limitaciones

El evento web por sí solo no demuestra la causa del error. Puede ser necesario
correlacionarlo con:

- logs de aplicación;
- eventos de base de datos;
- logs del sistema;
- métricas de infraestructura;
- eventos de despliegue.

---

## Búsqueda recomendada 5: evolución temporal

### Objetivo

Observar cómo varían las peticiones correctas y los errores a lo largo del tiempo.

### SPL

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval clase=if(status_num>=400, "Error", "Correcta")
| timechart span=1m count by clase
```

### Resultado esperado

Una serie temporal con una línea o serie para eventos correctos y otra para
errores.

### Interpretación

Busca:

- picos de errores;
- periodos con ausencia de tráfico;
- aumentos coincidentes de tráfico y errores;
- intervalos en los que predominan los errores.

### Limitaciones

Una serie temporal muestra cuándo ocurre el comportamiento, pero no explica por sí
sola su causa.

---

## Búsqueda opcional: tiempos de respuesta

Si existen tiempos de respuesta, sustituye o añade una búsqueda como esta:

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(tiempo_ms)
| stats
    count as peticiones
    avg(tiempo_ms) as media_ms
    perc95(tiempo_ms) as p95_ms
    by uri
| sort - p95_ms
```

Si el campo se llama `duration`:

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(duration)
| where isnotnull(tiempo_ms)
| stats
    count as peticiones
    avg(tiempo_ms) as media_ms
    perc95(tiempo_ms) as p95_ms
    by uri
| sort - p95_ms
```

Documenta siempre la unidad:

```text
La duración está expresada en milisegundos.
```

No utilices el título `URL más lentas` si no existe un campo de latencia.

---

## Búsqueda opcional: IP con más errores

Si existe `clientip`:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by clientip
| sort - errores
| head 10
```

Si existe `src_ip`:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by src_ip
| sort - errores
| head 10
```

Si no existe una IP, sustituye el análisis por:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| sort - errores
| head 10
```

El panel y la documentación deben llamarse `Host con más errores`, no `IP con más
errores`.

---

# Entregable 4: reportes

Entrega dos reportes documentados.

Cada reporte debe incluir:

- nombre;
- objetivo;
- descripción;
- consulta;
- visualización;
- periodo temporal;
- frecuencia;
- aplicación;
- propietario;
- permisos;
- interpretación;
- acción que facilita tomar;
- limitaciones.

---

## Reporte 1: errores por URI

### Objetivo

Mostrar las URI que concentran más errores HTTP.

### SPL

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host uri status_num
| sort - errores
| head 10
```

### Visualización recomendada

- tabla;
- barras horizontales;
- ranking ordenado.

### Configuración que debe documentarse

- nombre;
- descripción;
- visualización;
- periodo temporal;
- frecuencia;
- aplicación;
- propietario;
- permisos;
- fecha de validación.

### Decisión que ayuda a tomar

Este reporte ayuda a priorizar qué URI debe investigarse primero.

### Limitaciones

El número absoluto de errores no indica necesariamente qué URI tiene la mayor
tasa de fallo. Para ese análisis se necesita calcular errores respecto al total de
peticiones por URI.

---

## Reporte 2: evolución de peticiones y errores

### Objetivo

Mostrar la evolución temporal del tráfico y separar eventos correctos de errores.

### SPL

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval tipo=if(status_num>=400, "Error", "Correcta")
| timechart span=1m count by tipo
```

### Visualización recomendada

- gráfico de líneas;
- gráfico de áreas;
- columnas temporales.

### Decisión que ayuda a tomar

El reporte ayuda a localizar intervalos en los que los errores aumentan y permite
relacionarlos con cambios de tráfico.

### Limitaciones

El reporte no identifica automáticamente la causa del aumento. Es necesario
investigar otros datos de aplicación o infraestructura.

---

## Periodicidad de los reportes

La periodicidad debe corresponder al objetivo:

| Objetivo | Periodicidad orientativa |
|---|---|
| Revisión de laboratorio | Bajo demanda |
| Informe diario | Una vez al día |
| Supervisión operativa | Cada hora |
| Análisis casi en tiempo real | Según volumen y capacidad |

No programes reportes frecuentes sin justificar el coste de ejecución.

---

# Entregable 5: dashboard

El dashboard debe incluir como mínimo:

1. Total de peticiones.
2. Total de errores.
3. Peticiones por minuto.
4. Errores por código HTTP.
5. IP con más errores o host con más errores si no hay IP.
6. URL más lentas o URI con más errores si no hay latencia.

Incluye:

- captura completa;
- nombre del dashboard;
- aplicación;
- descripción;
- paneles;
- consultas utilizadas;
- visualización de cada panel;
- filtros configurados;
- intervalo temporal inicial;
- comportamiento cuando no existen resultados;
- usuario que realizó la validación.

---

## Panel 1: total de peticiones

```spl
index=curso earliest=0 latest=now
| stats count as peticiones
```

Visualización recomendada:

```text
Single value
```

Título recomendado:

```text
Total de peticiones
```

---

## Panel 2: total de errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num>=400)) as errores
```

Visualización recomendada:

```text
Single value
```

Título recomendado:

```text
Total de errores HTTP
```

---

## Panel 3: peticiones por minuto

```spl
index=curso earliest=0 latest=now
| timechart span=1m count as peticiones
```

Visualización recomendada:

```text
Line chart
```

Título recomendado:

```text
Evolución de peticiones por minuto
```

---

## Panel 4: errores por código HTTP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count as errores by status_num
| sort status_num
```

Visualización recomendada:

```text
Column chart
```

Título recomendado:

```text
Distribución de códigos HTTP
```

---

## Panel 5: IP con más errores

Si existe `clientip`:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by clientip
| sort - errores
| head 10
```

Título recomendado:

```text
IP con más errores
```

Si existe `src_ip`:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by src_ip
| sort - errores
| head 10
```

Si no existe un campo de IP, utiliza:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| sort - errores
| head 10
```

Título alternativo:

```text
Host con más errores
```

Documenta claramente que el panel alternativo no representa un análisis por IP.

---

## Panel 6: URL más lentas

Si existe `response_time`:

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(tiempo_ms)
| stats
    count as peticiones
    avg(tiempo_ms) as media_ms
    perc95(tiempo_ms) as p95_ms
    by uri
| sort - p95_ms
| head 10
```

Si existe `duration`:

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(duration)
| where isnotnull(tiempo_ms)
| stats
    count as peticiones
    avg(tiempo_ms) as media_ms
    perc95(tiempo_ms) as p95_ms
    by uri
| sort - p95_ms
| head 10
```

Título recomendado:

```text
URL con mayor latencia
```

Si no existe ningún campo de latencia, utiliza:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

Título alternativo:

```text
URI con más errores
```

---

## Panel adicional recomendado: porcentaje de error

```spl
index=curso earliest=0 latest=now
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

Visualización recomendada:

```text
Single value
```

---

## Panel adicional recomendado: eventos HTTP 500

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num=500
| table _time host method status uri
| sort - _time
```

Visualización recomendada:

```text
Table
```

---

## Descripción de cada panel

Para cada panel, incluye:

```markdown
## Nombre del panel

### Objetivo

Qué pregunta responde.

### Consulta

```spl
consulta
```

### Visualización

Tipo de gráfico utilizado.

### Campos

Campos necesarios.

### Interpretación

Qué significa el resultado.

### Comportamiento sin datos

Qué debe mostrar el panel si no existen resultados.

### Limitaciones

Qué no puede concluirse.
```

---

# Entregable 6: filtros

Debes documentar al menos dos filtros.

Los filtros deben probarse con:

- un valor específico;
- la opción equivalente a “todos”;
- un valor sin resultados;
- un intervalo temporal diferente.

---

## Filtro temporal

Explica:

- valor inicial;
- rango permitido;
- paneles afectados;
- comportamiento cuando no hay datos;
- diferencia entre rango relativo y absoluto.

### Rango histórico de laboratorio

```text
1 de enero de 2026, 00:00–00:10
```

### Rango relativo para datos continuos

```text
Últimos 5 minutos
```

No utilices un rango relativo para validar eventos históricos si esos eventos están
fuera de la ventana actual.

---

## Filtro adicional

Puede ser:

- host;
- código HTTP;
- método;
- URI;
- IP;
- familia de código HTTP.

Ejemplo conceptual por host:

```spl
index=curso host="$host_token$"
| stats count by status
```

Una versión que permite representar “todos” podría ser:

```spl
index=curso
| where "$host_token$"="*" OR host="$host_token$"
| stats count by status
```

La sintaxis concreta dependerá del tipo de dashboard y del control utilizado.

Documenta:

- nombre del token;
- control que lo genera;
- valor inicial;
- valores permitidos;
- opción “todos”;
- paneles afectados;
- comportamiento con valores sin resultados.

No consideres los tokens un mecanismo de seguridad. Los filtros solo cambian los
valores de la consulta; no conceden acceso a índices ni objetos.

---

# Entregable 7: alerta

La alerta debe detectar cinco o más respuestas HTTP `500` durante una ventana de
cinco minutos.

## Consulta mínima

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

La búsqueda devuelve una fila solo cuando se cumple la condición.

## Consulta con contexto

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count as errores_500 by host uri
| where errores_500>=5
| sort - errores_500
```

Esta variante ayuda a identificar dónde se concentran los errores.

## Documentación obligatoria

Documenta:

- nombre;
- propietario;
- aplicación;
- frecuencia;
- condición;
- acción;
- destinatario;
- throttling;
- ventana temporal;
- prueba realizada;
- resultado de la prueba;
- actuación esperada.

## Prueba con datos históricos

```spl
index=curso earliest="01/01/2026:00:00:00"
          latest="01/01/2026:00:10:00"
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

La consulta histórica sirve para comprobar la lógica con el dataset del curso.

La consulta operativa utiliza:

```spl
earliest=-5m latest=now
```

La diferencia debe quedar documentada.

## Riesgo de alertas repetidas

Una alerta que se ejecuta cada pocos minutos sobre una ventana móvil puede detectar
varias veces los mismos eventos.

Documenta:

- frecuencia;
- periodo de throttling;
- condición de recuperación;
- agrupación por host o URI;
- destinatario responsable;
- acción posterior.

---

# Entregable 8: análisis escrito

Incluye entre media página y dos páginas con:

- resumen de los hallazgos;
- volumen de peticiones;
- proporción de errores;
- códigos más frecuentes;
- URI o host más problemático;
- IP con actividad anormal, si existe;
- latencias observadas, si existe el campo;
- explicación de la alerta;
- limitaciones;
- recomendaciones.

Utiliza afirmaciones respaldadas por búsquedas.

No escribas únicamente una descripción genérica como:

> La aplicación presenta problemas.

Relaciona cada conclusión con una evidencia:

> La búsqueda de errores por código muestra 14 respuestas HTTP `500` durante el
> intervalo analizado. Estas respuestas representan el 11,67 % de las 120
> peticiones observadas. La URI `/api/login` concentra la mayor parte de los
> errores `4xx`. No se pudo realizar análisis por IP porque el dataset no contenía
> un campo de dirección de origen.

## Plantilla recomendada

```markdown
# Análisis del proyecto

## Resumen ejecutivo

Describe en pocas líneas el estado observado.

## Volumen

Indica el total de peticiones y el intervalo utilizado.

## Errores

Indica el total de errores y su porcentaje.

## Códigos HTTP

Explica qué códigos predominan.

## Concentración

Indica qué URI, host o IP concentra más actividad.

## Evolución temporal

Explica cuándo aparecen los errores.

## Rendimiento

Describe la latencia si existe.
Si no existe, documenta la limitación.

## Alerta

Explica qué condición se ha configurado y por qué.

## Limitaciones

Indica qué datos o pruebas no están disponibles.

## Recomendaciones

Propón los pasos siguientes.
```

---

# Entregable 9: validación con otro usuario

Siempre que sea posible, prueba el dashboard con un usuario que no tenga rol
`admin`.

El objetivo es comprobar que la solución funciona para su audiencia final y no
únicamente para quien la creó.

## Registra si el usuario puede:

- abrir el dashboard;
- ejecutar las búsquedas;
- consultar `curso`;
- visualizar los paneles;
- utilizar los filtros;
- modificar el dashboard;
- ver la alerta;
- editar objetos;
- acceder a configuraciones administrativas.

## Tabla de validación

| Comprobación | Resultado | Observaciones |
|---|---|---|
| Puede iniciar sesión | | |
| Puede consultar `curso` | | |
| Puede abrir el dashboard | | |
| Puede ejecutar los paneles | | |
| Puede utilizar los filtros | | |
| Puede editar el dashboard | | |
| Puede ver la alerta | | |
| Puede modificar la alerta | | |
| Puede administrar índices | | |

Si no puedes crear un usuario adicional, documenta que la validación se realizó
solo con el usuario administrador y explica la limitación.

Ejemplo:

> No fue posible crear un usuario de pruebas en el entorno disponible. El
> dashboard se validó únicamente con el rol `admin`, por lo que no se pudo
> confirmar el comportamiento con un perfil de permisos restringidos.

---

# Formato recomendado de entrega

Organiza la entrega de esta forma:

```text
proyecto-final/
├── README.md
├── resumen/
│   └── resumen-tecnico.md
├── busquedas/
│   ├── 01-volumen.spl
│   ├── 02-porcentaje-error.spl
│   ├── 03-errores-uri.spl
│   ├── 04-errores-500.spl
│   ├── 05-evolucion-temporal.spl
│   └── 06-latencia-opcional.spl
├── reportes/
│   ├── reporte-errores.md
│   └── reporte-evolucion.md
├── dashboard/
│   ├── captura-dashboard.png
│   ├── descripcion-dashboard.md
│   └── paneles.md
├── filtros/
│   └── filtros-dashboard.md
├── alertas/
│   └── alerta-http-500.md
├── analisis/
│   └── analisis-resultados.md
└── evidencias/
    ├── validacion-ingesta.png
    ├── rango-temporal.png
    ├── campos.png
    ├── dashboard-completo.png
    ├── filtros.png
    ├── alerta.png
    └── prueba-permisos.png
```

---

## Contenido recomendado de `README.md`

El archivo `README.md` debe incluir:

- nombre del proyecto;
- autor;
- fecha;
- versión de Splunk;
- sistema operativo;
- índice;
- dataset;
- estructura de carpetas;
- instrucciones de reproducción;
- limitaciones;
- referencias.

Ejemplo:

```markdown
# Proyecto final: monitorización web

## Entorno

- Splunk Enterprise 10.4.3
- Ubuntu 24.04.5 LTS
- Índice: curso
- Dataset: eventos_web.csv

## Reproducción

1. Confirmar que existe el índice `curso`.
2. Ejecutar las búsquedas de `busquedas/`.
3. Revisar los reportes.
4. Abrir el dashboard.
5. Probar los filtros.
6. Revisar la alerta.

## Limitaciones

El dataset no contiene IP ni tiempo de respuesta.
```

---

# Requisitos para cada búsqueda

Cada búsqueda debe incluir:

- nombre;
- objetivo;
- SPL;
- índice;
- rango temporal;
- campos utilizados;
- resultado esperado;
- resultado observado;
- interpretación;
- limitaciones;
- fecha de validación.

Ejemplo:

```markdown
## Búsqueda: errores por URI

### Objetivo

Identificar las diez URI con más respuestas HTTP de error.

### SPL

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

### Índice y tiempo

Índice: `curso`

Periodo: todos los eventos históricos disponibles durante la validación.

### Campos utilizados

- `status`
- `uri`

### Resultado esperado

Tabla ordenada de mayor a menor número de errores.

### Resultado observado

Completar con el resultado real.

### Interpretación

Completar con la interpretación.

### Limitaciones

El resultado cuenta errores absolutos y no calcula el porcentaje de error por URI.
```

---

# Capturas

Las capturas deben mostrar, cuando sea posible:

- nombre de la búsqueda;
- intervalo temporal;
- consulta;
- tabla o gráfico;
- resultado;
- dashboard completo;
- configuración de la alerta;
- usuario que está realizando la prueba.

Evita capturas recortadas en las que no se pueda identificar el contexto.

Una captura del dashboard debe permitir comprobar:

- título;
- paneles;
- filtros;
- rango temporal;
- valores mostrados.

Una captura de una búsqueda debe permitir comprobar:

- índice;
- periodo;
- SPL;
- resultados.

---

# Archivos editables

Entrega siempre la SPL como texto editable.

Una imagen permite ver el resultado, pero no permite:

- reutilizar fácilmente la consulta;
- corregirla;
- revisar su sintaxis;
- comparar versiones;
- documentar cambios;
- comprobar el índice y el tiempo.

Los archivos `.spl` son apropiados para las búsquedas. Los archivos `.md` son
apropiados para las explicaciones y evidencias.

---

# Criterios de reproducibilidad

Otra persona debe poder repetir la práctica siguiendo la documentación.

Para que la entrega sea reproducible:

- utiliza nombres claros;
- especifica el índice;
- especifica el intervalo temporal;
- indica los campos requeridos;
- documenta los tokens;
- documenta el propietario y la aplicación;
- indica qué hacer si no hay resultados;
- incluye la consulta completa;
- evita depender de valores que solo existan en tu sesión;
- indica si los datos son históricos o en tiempo real.

---

# Lista final de comprobación

## Entorno

- [ ] Splunk Enterprise está operativo.
- [ ] Splunk Web responde.
- [ ] El usuario puede acceder a Search & Reporting.
- [ ] El índice está confirmado.
- [ ] El usuario puede consultar el índice.

## Datos

- [ ] Dataset ingerido.
- [ ] Eventos disponibles.
- [ ] Timestamp validado.
- [ ] Rango temporal documentado.
- [ ] Campos revisados.
- [ ] `host` documentado.
- [ ] `source` documentado.
- [ ] `sourcetype` documentado.
- [ ] IP comprobada.
- [ ] Latencia comprobada.
- [ ] Campos ausentes documentados.

## Búsquedas SPL

- [ ] Cinco búsquedas documentadas.
- [ ] Cada búsqueda tiene un objetivo.
- [ ] Cada búsqueda incluye índice.
- [ ] Cada búsqueda incluye intervalo temporal.
- [ ] Las comparaciones numéricas utilizan `tonumber` cuando es necesario.
- [ ] Los resultados están documentados.
- [ ] Las limitaciones están documentadas.
- [ ] La SPL está incluida en texto editable.

## Reportes

- [ ] Dos reportes creados.
- [ ] Reporte de errores documentado.
- [ ] Reporte de evolución documentado.
- [ ] Visualización seleccionada.
- [ ] Frecuencia documentada.
- [ ] Audiencia documentada.
- [ ] Permisos revisados.

## Dashboard

- [ ] Dashboard creado.
- [ ] Total de peticiones incluido.
- [ ] Total de errores incluido.
- [ ] Peticiones por minuto incluido.
- [ ] Errores por código HTTP incluido.
- [ ] Panel de IP o alternativa por host incluido.
- [ ] Panel de latencia o alternativa por URI incluido.
- [ ] Seis paneles funcionando.
- [ ] Títulos claros.
- [ ] Consultas documentadas.
- [ ] Captura completa incluida.
- [ ] Comportamiento sin datos documentado.

## Filtros

- [ ] Filtro temporal creado.
- [ ] Segundo filtro creado.
- [ ] Valor inicial documentado.
- [ ] Opción “todos” probada.
- [ ] Valor específico probado.
- [ ] Valor sin resultados probado.
- [ ] Paneles afectados documentados.
- [ ] Tokens no utilizados como mecanismo de seguridad.

## Alerta

- [ ] Alerta creada.
- [ ] Consulta validada.
- [ ] Umbral documentado.
- [ ] Ventana temporal documentada.
- [ ] Frecuencia documentada.
- [ ] Acción documentada.
- [ ] Destinatario documentado.
- [ ] Throttling documentado.
- [ ] Prueba realizada.
- [ ] Resultado de la prueba documentado.
- [ ] Diferencia entre histórico y tiempo real explicada.

## Análisis

- [ ] Resumen de hallazgos incluido.
- [ ] Volumen explicado.
- [ ] Porcentaje de errores explicado.
- [ ] Códigos HTTP interpretados.
- [ ] URI o host problemático identificado.
- [ ] IP analizada o limitación documentada.
- [ ] Latencia analizada o limitación documentada.
- [ ] Alerta explicada.
- [ ] Recomendaciones incluidas.
- [ ] Limitaciones documentadas.

## Permisos

- [ ] Se ha probado otro usuario, si era posible.
- [ ] El acceso al índice está documentado.
- [ ] El acceso al dashboard está documentado.
- [ ] La capacidad de editar objetos está documentada.
- [ ] La limitación de usar únicamente `admin` está documentada, si aplica.

---

## Resultado mínimo de la entrega

La entrega final debe demostrar, como mínimo, que:

1. los eventos están en el índice esperado;
2. el timestamp permite buscar los datos;
3. las búsquedas devuelven resultados coherentes;
4. las métricas están correctamente calculadas;
5. el dashboard responde a preguntas operativas;
6. los filtros actualizan los paneles;
7. la alerta se ha creado y probado;
8. las limitaciones están documentadas;
9. la SPL está disponible en formato editable;
10. otra persona puede entender y reproducir la solución.

---

## Recomendación final

Antes de entregar, revisa la solución con esta pregunta:

> ¿Podría otra persona abrir mi documentación, ejecutar las búsquedas, comprender
> mis paneles, probar los filtros y explicar cuándo se dispara la alerta sin
> preguntarme qué he querido hacer?

Si la respuesta es negativa, completa la documentación antes de entregar el proyecto.

---

## Referencias oficiales

- [Splunk Knowledge Objects](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)
- [Splunk Reports](https://docs.splunk.com/Documentation/Splunk/latest/Report/Reportsintro)
- [Splunk Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)
- [Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/IntroFrame)
- [Splunk Alerts](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Splunk Users and Roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Splunk Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchapp)
- [Splunk Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)