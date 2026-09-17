# Evaluación del proyecto final

La evaluación comprueba tanto el resultado técnico como la capacidad para explicar,
validar y mantener la solución.

No se evaluará únicamente que el dashboard tenga buena apariencia. También se
tendrá en cuenta si:

- los datos son correctos;
- la SPL es reproducible;
- las consultas responden preguntas concretas;
- los objetos están bien configurados;
- la alerta es accionable;
- los permisos son coherentes;
- el participante puede diagnosticar problemas;
- las limitaciones del dataset están documentadas;
- otra persona podría entender y reutilizar la solución.

El proyecto se evalúa sobre una puntuación total de **100 puntos**.

---

## Principios de evaluación

La solución debe demostrar este flujo:

```text
Datos ingeridos
    ↓
Validación de la fuente
    ↓
Búsqueda SPL
    ↓
Resultado comprobable
    ↓
Reporte o visualización
    ↓
Dashboard
    ↓
Filtro
    ↓
Alerta
    ↓
Acción operativa
```

La calidad del proyecto no depende únicamente del número de paneles o búsquedas.
Una solución con menos elementos, pero correctamente validada y explicada, puede
obtener una valoración superior a otra con muchos objetos sin una finalidad clara.

Se valorará especialmente que el participante pueda distinguir entre:

- un dato observado;
- una interpretación;
- una hipótesis;
- una conclusión demostrada;
- una recomendación de investigación.

### Ejemplo

Observación:

> Se identificaron 12 respuestas HTTP `500` durante el intervalo analizado.

Interpretación:

> Los errores del servidor se concentran en una ventana temporal concreta.

Hipótesis:

> Puede existir un problema en la aplicación, una dependencia externa o una
> limitación de capacidad.

Conclusión que todavía no puede demostrarse únicamente con estos datos:

> La base de datos fue la causa del incidente.

Para demostrar esta última afirmación sería necesario relacionar los eventos web
con logs de aplicación, base de datos o infraestructura.

---

## Puntuación total

| Área | Puntos |
|---|---:|
| Validación del entorno y la ingesta | 15 |
| Calidad de las búsquedas SPL | 20 |
| Reportes y visualizaciones | 10 |
| Dashboard | 20 |
| Filtros y tokens | 10 |
| Alerta | 10 |
| Seguridad y permisos | 5 |
| Documentación y explicación | 10 |
| **Total** | **100** |

---

# 1. Validación del entorno y la ingesta — 15 puntos

Esta sección evalúa que el participante pueda demostrar que los datos existen,
están en el índice esperado y tienen metadatos razonables.

## Evidencias mínimas esperadas

### Existencia de eventos

```spl
index=curso earliest=0 latest=now
| stats count as eventos
```

### Metadatos de origen

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
| sort - count
```

### Rango temporal

```spl
index=curso earliest=0 latest=now
| stats min(_time) as inicio max(_time) as fin
| eval inicio=strftime(inicio, "%Y-%m-%d %H:%M:%S")
| eval fin=strftime(fin, "%Y-%m-%d %H:%M:%S")
```

### Campos disponibles

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

### Revisión de eventos

```spl
index=curso earliest=0 latest=now
| table _time host source sourcetype method status uri
| head 20
```

## 15 puntos

El participante:

- confirma que el índice existe;
- demuestra que el dataset está correctamente ingerido;
- encuentra eventos consultables;
- utiliza un intervalo temporal válido;
- identifica `host`, `source` y `sourcetype`;
- revisa los campos extraídos;
- identifica posibles campos ausentes;
- explica la diferencia entre `_time` y `_indextime`;
- sabe describir el flujo desde la fuente hasta la búsqueda;
- puede diagnosticar qué revisar si una consulta devuelve cero resultados.

## 10 puntos

Los eventos están disponibles, pero:

- falta documentar algún metadato;
- el rango temporal no está claramente explicado;
- la validación depende de búsquedas demasiado amplias;
- no se documentan todos los campos disponibles;
- no se explica completamente el flujo de ingesta.

## 5 puntos

La ingesta funciona parcialmente, pero:

- hay campos sin validar;
- el timestamp no está comprobado;
- el índice no está claramente documentado;
- existen dudas sobre la calidad de los metadatos;
- la solución funciona, pero el participante no puede explicar bien por qué.

## 0 puntos

- No existen eventos consultables.
- No se puede demostrar que el dataset haya sido ingerido.
- El participante no identifica el índice.
- No puede explicar qué fuente se está utilizando.

## Criterios adicionales

No se penalizará que el dataset no contenga IP o latencia, siempre que esa ausencia
esté documentada correctamente.

Sí se penalizará presentar como válidos análisis que dependen de campos inexistentes.

### Ejemplo

Si el dataset no tiene `clientip`, el participante puede obtener la puntuación
completa de esta sección si demuestra que:

1. revisó los campos;
2. confirmó que la IP no existe;
3. documentó la limitación;
4. sustituyó el análisis por host o URI;
5. no presentó el resultado como un análisis por IP.

---

# 2. Calidad de las búsquedas SPL — 20 puntos

Esta sección evalúa si las búsquedas responden a preguntas concretas y si pueden
ser reutilizadas por otra persona.

## Se valorará que las consultas:

- utilicen el índice explícitamente;
- definan el periodo temporal;
- usen campos reales;
- normalicen valores numéricos;
- respondan preguntas concretas;
- sean legibles;
- sean reproducibles;
- incluyan una explicación;
- documenten sus supuestos;
- utilicen filtros razonablemente selectivos;
- eviten comandos innecesariamente costosos;
- indiquen sus limitaciones.

## Requisitos mínimos

El participante debe entregar al menos cinco búsquedas SPL documentadas.

Se recomienda que incluyan:

1. volumen total;
2. porcentaje de error;
3. errores por URI;
4. errores HTTP `500`;
5. evolución temporal.

## Búsqueda de volumen

```spl
index=curso earliest=0 latest=now
| stats count as total_peticiones
```

## Búsqueda de porcentaje de error

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

## Búsqueda de errores por URI

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

## Búsqueda de errores HTTP 500

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count as errores_500 by host uri
| sort - errores_500
```

## Búsqueda de evolución temporal

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval clase=if(status_num>=400, "Error", "Correcta")
| timechart span=1m count by clase
```

## Niveles de valoración

### 20 puntos: excelente

Las búsquedas:

- son precisas;
- utilizan índice y tiempo;
- emplean campos válidos;
- convierten correctamente los datos numéricos;
- responden preguntas claras;
- están documentadas;
- son legibles;
- pueden reutilizarse en reportes, dashboards o alertas;
- tienen un coste razonable;
- incluyen limitaciones cuando procede.

### 15 puntos: correcto

Las búsquedas funcionan y responden a las preguntas principales, pero presentan
alguna carencia menor:

- falta documentar alguna consulta;
- algún intervalo temporal no está explicado;
- existe alguna repetición;
- faltan pequeñas mejoras de legibilidad;
- alguna búsqueda podría optimizarse.

### 10 puntos: básico

Las consultas devuelven resultados, pero:

- no siempre especifican el índice;
- utilizan rangos temporales poco claros;
- no normalizan correctamente los campos;
- mezclan exploración y análisis;
- no explican las limitaciones;
- dependen excesivamente de valores concretos del laboratorio.

### 5 puntos: insuficiente

Hay búsquedas, pero:

- varias no devuelven resultados;
- los campos utilizados no coinciden con el dataset;
- se realizan comparaciones numéricas incorrectas;
- no se puede explicar qué responde cada consulta;
- las búsquedas no son reproducibles.

### 0 puntos

No se entregan búsquedas funcionales o no se puede demostrar que respondan a
preguntas sobre los datos.

## Errores frecuentes

Se consideran errores importantes:

- utilizar `index=*` sin motivo;
- comparar un campo textual como si fuera numérico;
- buscar `status=500` cuando el campo real es `status_code`;
- utilizar `earliest=-5m` con datos históricos;
- no validar los campos antes de ejecutar `stats`;
- utilizar `host` como si fuera una IP;
- presentar una URL como lenta sin disponer de un campo de latencia;
- crear consultas que funcionan solo con el usuario `admin`;
- utilizar un filtro que rompe la búsqueda cuando el valor es “todos”.

---

# 3. Reportes y visualizaciones — 10 puntos

Esta sección evalúa si el participante selecciona una salida adecuada para la
pregunta que desea responder.

## Se valorará:

- elección correcta de la visualización;
- nombre claro;
- descripción;
- audiencia definida;
- periodo temporal documentado;
- resultado interpretable;
- ausencia de gráficos innecesarios;
- relación entre consulta y visualización;
- documentación de la frecuencia;
- explicación de la acción que facilita tomar.

## Ejemplos de selección

| Necesidad | Salida adecuada |
|---|---|
| Una cifra principal | Single value |
| Comparar códigos | Barras |
| Ver evolución | Línea temporal |
| Localizar eventos | Tabla |
| Mostrar ranking | Barras o tabla ordenada |
| Analizar latencia por URI | Tabla o barras |
| Comparar errores por host | Barras o tabla |
| Ver distribución temporal | Línea o columnas |

## Reporte de errores por URI

Consulta de ejemplo:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host uri status_num
| sort - errores
| head 10
```

La salida recomendada es una tabla o un ranking de barras.

## Reporte de evolución

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval tipo=if(status_num>=400, "Error", "Correcta")
| timechart span=1m count by tipo
```

La salida recomendada es un gráfico temporal.

## Niveles de valoración

### 10 puntos: excelente

- Cada visualización responde a una pregunta concreta.
- Las consultas están validadas.
- Los títulos son claros.
- Se documenta la audiencia.
- Se indica el periodo.
- Se explica qué decisión facilita cada reporte.
- No se utilizan gráficos decorativos o confusos.

### 7 puntos: correcto

- Las visualizaciones son adecuadas.
- Los reportes funcionan.
- Falta documentar algún aspecto de la audiencia, frecuencia o interpretación.

### 4 puntos: básico

- Los reportes funcionan, pero la selección de gráficos es poco justificada.
- Hay títulos ambiguos.
- La relación con las preguntas operativas no está clara.

### 0 puntos

- Los reportes no funcionan.
- Las visualizaciones no corresponden a los resultados.
- Se presentan gráficos sin datos o con consultas incorrectas.

Un gráfico visualmente atractivo, pero basado en una consulta incorrecta, no obtiene
una valoración alta.

---

# 4. Dashboard — 20 puntos

El dashboard debe presentar la información en un orden útil para operaciones.

## Debe incluir:

- al menos seis paneles;
- títulos claros;
- consultas validadas;
- orden lógico;
- intervalo temporal;
- comportamiento documentado sin datos;
- visualizaciones adecuadas;
- descripción de la finalidad;
- consultas disponibles en la entrega.

## Paneles mínimos

1. Total de peticiones.
2. Total de errores.
3. Peticiones por minuto.
4. Errores por código HTTP.
5. IP con más errores o host con más errores si no hay IP.
6. URL más lentas o URI con más errores si no hay latencia.

## Orden recomendado

1. Resumen de peticiones.
2. Resumen de errores.
3. Porcentaje de error.
4. Evolución temporal.
5. Distribución de códigos HTTP.
6. Detalle por URI, host o IP.
7. Latencia, si existe.
8. Eventos recientes.

## Ejemplos de paneles

### Total de peticiones

```spl
index=curso earliest=0 latest=now
| stats count as peticiones
```

### Total de errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num>=400)) as errores
```

### Porcentaje de error

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

### Peticiones por minuto

```spl
index=curso earliest=0 latest=now
| timechart span=1m count as peticiones
```

### Errores por código HTTP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count as errores by status_num
| sort status_num
```

### Host con más errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| sort - errores
| head 10
```

### URI con más errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

### URL con mayor latencia

Solo si existe un campo de duración:

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

## Evaluación por niveles

| Nivel | Características |
|---|---|
| Excelente | Responde rápidamente a las preguntas operativas, permite investigar, utiliza paneles coherentes y documenta sus dependencias |
| Correcto | Incluye los paneles mínimos y funciona de forma estable |
| Básico | Tiene paneles, pero falta orden, explicación o validación |
| Insuficiente | Muestra datos sin relación, paneles vacíos o resultados incorrectos |

## 20 puntos: excelente

- El dashboard tiene al menos seis paneles funcionales.
- El orden sigue un flujo operativo.
- Las consultas están validadas.
- Los títulos permiten interpretar cada panel.
- Las visualizaciones son apropiadas.
- Los filtros funcionan.
- Se documenta el comportamiento sin datos.
- Se incluyen alternativas cuando faltan IP o latencia.
- El dashboard ha sido probado con el usuario final o se documenta la limitación.
- Se puede utilizar para investigar, no solo para observar indicadores.

## 15 puntos: correcto

- Incluye los paneles mínimos.
- Los paneles muestran datos coherentes.
- Existe una estructura razonable.
- Falta alguna explicación o prueba con otro usuario.

## 10 puntos: básico

- El dashboard funciona parcialmente.
- Hay paneles repetidos o poco útiles.
- El orden no facilita la investigación.
- Algunos paneles dependen de búsquedas no documentadas.

## 5 puntos: insuficiente

- Hay paneles vacíos.
- Los títulos no corresponden con la consulta.
- Las visualizaciones no representan los datos.
- No se puede explicar el propósito del dashboard.

## 0 puntos

No existe dashboard funcional o no puede demostrarse su relación con el proyecto.

---

# 5. Filtros y tokens — 10 puntos

Esta sección evalúa si el dashboard permite cambiar el contexto de análisis sin
editar manualmente las consultas.

## Se valorará que:

- existan al menos dos filtros;
- el selector temporal afecte a los paneles;
- el segundo filtro funcione con valores diferentes;
- exista una opción equivalente a “todos”;
- no se rompan las búsquedas con valores vacíos;
- se explique que los tokens no conceden permisos;
- los valores del filtro estén controlados;
- se prueben casos con resultados y sin resultados.

## Filtros mínimos

### Filtro temporal

Debe permitir seleccionar un intervalo temporal.

Documenta:

- valor inicial;
- rango permitido;
- paneles afectados;
- formato del token;
- comportamiento cuando no hay datos;
- diferencia entre rango histórico y relativo.

### Segundo filtro

Puede ser:

- host;
- código HTTP;
- método;
- URI;
- IP;
- familia de código HTTP.

## Ejemplo conceptual de filtro por host

```spl
index=curso
| where "$host_token$"="*" OR host="$host_token$"
| stats count as peticiones by status
```

La sintaxis exacta puede variar según se utilice Dashboard Studio o dashboards
clásicos.

## Pruebas obligatorias

El participante debe probar al menos:

- un valor concreto;
- la opción “todos”;
- un valor sin resultados;
- un valor vacío, si el control lo permite;
- un cambio de intervalo temporal.

## Niveles de valoración

### 10 puntos: excelente

- Los dos filtros funcionan correctamente.
- La opción “todos” funciona.
- Los paneles se actualizan.
- Se han probado valores con y sin resultados.
- Los tokens están documentados.
- Se entiende que no son un mecanismo de autorización.
- No aparecen errores de sintaxis ni resultados antiguos engañosos.

### 7 puntos: correcto

- Los filtros funcionan en los casos habituales.
- Falta documentar alguna prueba o el comportamiento sin datos.

### 4 puntos: básico

- Existe al menos un filtro funcional.
- El segundo filtro funciona parcialmente.
- La opción “todos” no está claramente resuelta.

### 0 puntos

- Los filtros no funcionan.
- Rompen las búsquedas.
- Se utilizan como mecanismo para conceder permisos.
- No se puede demostrar qué paneles afectan.

## Nota sobre los permisos

Un token únicamente cambia el valor que recibe una consulta. No concede acceso a:

- índices;
- aplicaciones;
- dashboards;
- reportes;
- alertas;
- configuraciones administrativas.

---

# 6. Alerta — 10 puntos

La alerta debe detectar cinco o más respuestas HTTP `500` durante una ventana de
cinco minutos.

## Consulta mínima

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

## La alerta debe incluir:

- condición clara;
- consulta validada;
- ventana temporal definida;
- frecuencia configurada;
- acción documentada;
- destinatario;
- prueba realizada;
- prevención razonable de duplicados;
- procedimiento posterior.

## Consulta con contexto adicional

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count as errores_500 by host uri
| where errores_500>=5
| sort - errores_500
```

Esta consulta permite conocer dónde se concentran los errores.

## Prueba con datos históricos

```spl
index=curso earliest="01/01/2026:00:00:00"
          latest="01/01/2026:00:10:00"
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

Debe explicarse que esta consulta sirve para probar la lógica sobre eventos
históricos, pero no representa necesariamente una alerta operativa en tiempo real.

## Se valorará especialmente

- diferencia entre datos históricos y datos en tiempo real;
- explicación del intervalo;
- existencia de throttling;
- destinatario definido;
- acción posterior documentada;
- prueba de la condición verdadera;
- prueba de la condición falsa;
- tratamiento de ausencia de datos.

## Niveles de valoración

### 10 puntos: excelente

- La alerta funciona.
- La consulta está validada.
- El umbral está justificado.
- La ventana temporal es coherente.
- La frecuencia está documentada.
- La acción es accionable.
- Existe destinatario responsable.
- Se ha configurado o explicado el throttling.
- Se ha probado la condición.
- Se diferencia claramente entre histórico y tiempo real.

### 7 puntos: correcto

- La alerta funciona.
- La condición está clara.
- Falta documentar algún aspecto de frecuencia, acción o throttling.

### 4 puntos: básico

- La consulta existe, pero no se ha probado suficientemente.
- El intervalo temporal no está bien explicado.
- La acción es genérica.
- No se justifica el umbral.

### 0 puntos

- No existe alerta.
- La condición no funciona.
- Se presenta una alerta histórica como si fuera tiempo real.
- No se puede explicar cuándo se dispara.

## Alertas repetidas

Una alerta que se ejecuta cada pocos minutos sobre una ventana móvil puede producir
varios avisos para los mismos eventos.

Una alerta que genera avisos repetidos sin control puede perder hasta la mitad de
los puntos de esta sección aunque la condición sea técnicamente correcta.

Documenta:

- frecuencia;
- periodo de throttling;
- criterio de recuperación;
- agrupación por host o URI;
- responsable;
- acción posterior.

---

# 7. Seguridad y permisos — 5 puntos

Esta sección evalúa si el participante entiende que tener rol `admin` es útil para
el laboratorio, pero no debe ser el modelo de producción.

## Se valorará que el participante:

- no utilice `admin` como solución permanente;
- revise quién puede ver el índice;
- compruebe quién puede modificar el dashboard;
- documente la aplicación y la compartición;
- pruebe el objeto con un usuario final cuando sea posible;
- diferencie permisos de lectura y modificación;
- documente las limitaciones de la prueba.

## Debe distinguir entre:

- permisos para iniciar sesión;
- permisos sobre índices;
- permisos sobre aplicaciones;
- permisos sobre objetos;
- capacidades administrativas;
- permisos para ejecutar búsquedas;
- permisos para modificar búsquedas;
- permisos para utilizar alertas;
- permisos para administrar la plataforma.

## Ejemplo de niveles de acceso

| Ámbito | Ejemplo de pregunta |
|---|---|
| Autenticación | ¿Puede iniciar sesión? |
| Índice | ¿Puede buscar `index=curso`? |
| Aplicación | ¿Puede abrir la aplicación del curso? |
| Dashboard | ¿Puede consultar el dashboard? |
| Objeto | ¿Puede modificar la búsqueda? |
| Administración | ¿Puede crear índices o usuarios? |

## Niveles de valoración

### 5 puntos: excelente

- Se prueba el dashboard con un usuario final.
- Se documentan los permisos.
- Se diferencia entre visualizar y editar.
- Se explica la diferencia entre `admin` y el rol final.
- Se identifican las limitaciones del entorno.

### 3 puntos: correcto

- Se documentan los permisos principales.
- Se reconoce que `admin` no debe utilizarse como modelo de producción.
- No se pudo realizar una prueba completa con otro usuario.

### 1 punto: básico

- Se indica únicamente que se utilizó `admin`.
- No se documentan permisos de objetos o índices.

### 0 puntos

- Se ignoran los permisos.
- Se asume que todos los usuarios tienen el mismo acceso.
- Se utiliza la administración como solución para cualquier problema de búsqueda.

---

# 8. Documentación y explicación — 10 puntos

La documentación debe permitir que otra persona reproduzca el proyecto.

Debe incluir:

- objetivo;
- escenario;
- dataset;
- índice;
- rango temporal;
- SPL;
- resultados;
- capturas;
- decisiones;
- limitaciones;
- recomendaciones;
- usuarios y permisos;
- configuración de reportes;
- configuración del dashboard;
- configuración de la alerta.

## Estructura recomendada

```markdown
# Análisis del proyecto

## Resumen ejecutivo

Describe en pocas líneas el resultado principal.

## Entorno

Indica versión, sistema, índice y dataset.

## Datos

Indica cantidad de eventos, rango temporal y campos disponibles.

## Búsquedas

Incluye las cinco consultas SPL y su explicación.

## Reportes

Describe las consultas, visualizaciones y frecuencia.

## Dashboard

Describe los paneles y los filtros.

## Alerta

Explica condición, intervalo, frecuencia y acción.

## Limitaciones

Indica los campos o pruebas que no están disponibles.

## Recomendaciones

Propón los pasos siguientes.
```

## Limitaciones que deben declararse

Por ejemplo:

- el dataset no contiene IP;
- no existe campo de tiempo de respuesta;
- la muestra es demasiado pequeña;
- los datos son históricos;
- no se puede validar una alerta en tiempo real;
- todos los usuarios utilizaron el rol `admin`;
- no se dispuso de tráfico suficiente para probar el umbral de cinco errores `500`;
- el timestamp no incluye zona horaria;
- no se pudo confirmar la extracción de todos los campos;
- no se pudo probar la solución con un usuario final;
- el laboratorio utiliza una única instancia mononodo.

Documentar una limitación es mejor que presentar como válido un análisis que los
datos no permiten realizar.

## Niveles de valoración

### 10 puntos: excelente

- La documentación es completa.
- Otra persona puede reproducir el proyecto.
- Las capturas tienen contexto.
- La SPL se entrega como texto editable.
- Las decisiones están justificadas.
- Las limitaciones son explícitas.
- Las conclusiones se relacionan con evidencias.
- Las recomendaciones son razonables.

### 7 puntos: correcto

- La documentación permite entender la solución.
- Faltan algunos detalles menores.
- La mayoría de las decisiones están explicadas.

### 4 puntos: básico

- La documentación describe el resultado, pero no el proceso.
- Faltan consultas, rangos o evidencias.
- Las limitaciones son escasas.

### 0 puntos

- No existe documentación suficiente.
- Solo se entrega una captura.
- No se puede reconstruir la solución.
- Las conclusiones no están respaldadas por búsquedas.

---

# Rúbrica resumida

| Área | Excelente | Correcto | Básico | Insuficiente |
|---|---|---|---|---|
| Ingesta | Datos y metadatos totalmente validados | Datos disponibles con pequeños faltantes | Validación parcial | No se demuestra la ingesta |
| SPL | Precisa, eficiente y reproducible | Funcional con mejoras menores | Funciona parcialmente | Incorrecta o ausente |
| Reportes | Salidas adecuadas y justificadas | Reportes funcionales | Visualización poco justificada | Reportes incorrectos |
| Dashboard | Operativo, claro y orientado a investigación | Cumple mínimos | Desordenado o incompleto | Vacío o incoherente |
| Filtros | Funcionan en todos los casos probados | Funcionan en casos habituales | Funcionan parcialmente | No funcionan |
| Alerta | Probada, accionable y con control de ruido | Funcional con pequeños faltantes | Poco documentada | Incorrecta o ausente |
| Seguridad | Validada con usuario final | Permisos documentados | Solo se utiliza `admin` | Se ignoran permisos |
| Documentación | Reproducible y bien justificada | Comprensible | Incompleta | Insuficiente |

---

# Defensa práctica

Durante la presentación, el participante debe poder responder:

1. ¿En qué índice están los eventos?
2. ¿Qué rango temporal utilizaste?
3. ¿Cómo sabes que la ingesta fue correcta?
4. ¿Qué significa `_time`?
5. ¿Qué diferencia hay entre `_time` y `_indextime`?
6. ¿Qué campos utiliza cada panel?
7. ¿Cómo calculaste el porcentaje de error?
8. ¿Por qué elegiste esa visualización?
9. ¿Qué ocurre si no hay datos?
10. ¿Cómo funciona el filtro?
11. ¿Qué valor representa “todos”?
12. ¿Cuándo se dispara la alerta?
13. ¿Cómo evitarías alertas repetidas?
14. ¿Qué permisos necesita el usuario final?
15. ¿Qué diferencia existe entre el rol `admin` y el rol final?
16. ¿Qué limitaciones tiene el dataset?
17. ¿Qué mejorarías en producción?
18. ¿Qué buscarías a continuación para confirmar la causa del problema?

## Respuesta esperada

No es suficiente responder:

> Porque lo dice la consulta.

La respuesta debe explicar:

- qué eventos se consultan;
- qué filtros se aplican;
- qué transformación se realiza;
- qué resultado se obtiene;
- qué significa;
- qué no demuestra;
- qué acción se recomienda.

---

# Prueba de diagnóstico

Se puede solicitar al participante que resuelva uno de estos problemas:

- índice incorrecto;
- rango temporal vacío;
- campo `status` con otro nombre;
- `status` tratado como texto;
- dashboard sin permisos;
- alerta basada en datos históricos;
- archivo ingerido dos veces;
- campo de latencia inexistente;
- campo de IP inexistente;
- `source` inesperado;
- `sourcetype` incorrecto;
- eventos con timestamp fuera del intervalo;
- filtro que devuelve un token vacío;
- panel que utiliza una búsqueda privada;
- usuario final sin acceso al índice.

## Orden de diagnóstico obligatorio

El participante debe seguir este orden:

```text
Índice
    ↓
Tiempo
    ↓
Eventos
    ↓
Campos
    ↓
Metadatos
    ↓
Permisos
    ↓
SPL
    ↓
Objeto de conocimiento
```

## Ejemplo de diagnóstico

Si esta búsqueda no devuelve resultados:

```spl
index=curso status=500 earliest=-5m latest=now
```

El participante debe comprobar:

### 1. Que existen eventos

```spl
index=curso earliest=0 latest=now
| stats count
```

### 2. Qué valores tiene `status`

```spl
index=curso earliest=0 latest=now
| stats count by status
| sort - count
```

### 3. Si el valor puede convertirse a número

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count by status status_num
| sort status
```

### 4. Qué rango temporal tienen los datos

```spl
index=curso earliest=0 latest=now
| stats min(_time) as inicio max(_time) as fin
```

### 5. Si la búsqueda histórica funciona

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count
```

### 6. Si el usuario puede consultar el índice

Debe probarse con el usuario final o revisarse la configuración del rol.

---

# Prueba práctica final

Además de la entrega documental, el instructor puede solicitar una demostración
práctica.

El participante debe:

1. abrir Splunk Web;
2. ejecutar una búsqueda de validación;
3. demostrar que existen eventos;
4. mostrar el rango temporal;
5. ejecutar una búsqueda de errores;
6. abrir el dashboard;
7. utilizar el selector temporal;
8. utilizar el segundo filtro;
9. mostrar un panel de resultados;
10. explicar la alerta;
11. describir una limitación;
12. indicar el siguiente paso de investigación.

## Criterio de la demostración

La demostración no debe ser una navegación mecánica por menús. El participante
debe explicar qué está comprobando en cada paso.

---

# Resultado de la evaluación

| Puntuación | Resultado |
|---:|---|
| 90–100 | Solución completa, reproducible y bien documentada |
| 75–89 | Solución funcional con mejoras menores |
| 60–74 | Cumple parcialmente; requiere correcciones |
| Menos de 60 | No demuestra todavía una solución operativa completa |

## Condiciones recomendadas para superar el proyecto

Para superar el proyecto se recomienda obtener al menos **60 puntos** y cumplir
obligatoriamente estos elementos:

- dataset consultable;
- cinco búsquedas SPL;
- dashboard;
- dos filtros;
- alerta documentada;
- explicación de las limitaciones;
- evidencia de resultados;
- SPL disponible en texto editable.

## Elementos obligatorios aunque falten campos opcionales

La ausencia de IP o latencia no impide superar el proyecto si:

- se comprueba que los campos no existen;
- se documenta la limitación;
- se utiliza una alternativa válida;
- el dashboard no presenta información incorrecta;
- el análisis explica qué información falta.

---

# Lista de comprobación del evaluador

## Entorno e ingesta

- [ ] El índice está identificado.
- [ ] Hay eventos consultables.
- [ ] El intervalo temporal está documentado.
- [ ] `host` está revisado.
- [ ] `source` está revisado.
- [ ] `sourcetype` está revisado.
- [ ] Los campos principales están disponibles.
- [ ] Los campos ausentes están documentados.

## Búsquedas SPL

- [ ] Hay cinco búsquedas.
- [ ] Todas utilizan el índice.
- [ ] Todas tienen intervalo temporal.
- [ ] Las comparaciones numéricas son correctas.
- [ ] Las búsquedas responden preguntas concretas.
- [ ] La SPL está documentada.
- [ ] Las limitaciones están explicadas.
- [ ] Las búsquedas pueden reutilizarse.

## Reportes y visualizaciones

- [ ] Hay dos reportes.
- [ ] La visualización corresponde a la pregunta.
- [ ] El periodo está documentado.
- [ ] La audiencia está definida.
- [ ] La frecuencia está documentada.
- [ ] La interpretación es correcta.

## Dashboard

- [ ] Tiene al menos seis paneles.
- [ ] Los títulos son claros.
- [ ] El orden es lógico.
- [ ] Las consultas están validadas.
- [ ] El comportamiento sin datos está documentado.
- [ ] Se han utilizado alternativas si faltan IP o latencia.
- [ ] La captura completa está incluida.

## Filtros

- [ ] Existe un filtro temporal.
- [ ] Existe un segundo filtro.
- [ ] La opción “todos” funciona.
- [ ] Un valor concreto funciona.
- [ ] Un valor sin resultados ha sido probado.
- [ ] Los tokens no se utilizan para conceder permisos.

## Alerta

- [ ] La consulta funciona.
- [ ] El umbral está documentado.
- [ ] La ventana temporal está documentada.
- [ ] La frecuencia está documentada.
- [ ] La acción está documentada.
- [ ] El destinatario está definido.
- [ ] Se ha revisado el ruido.
- [ ] Se ha probado la condición.
- [ ] Se diferencia histórico de tiempo real.

## Seguridad

- [ ] Se ha revisado el acceso al índice.
- [ ] Se ha revisado el acceso al dashboard.
- [ ] Se ha distinguido leer de modificar.
- [ ] Se ha probado otro usuario cuando fue posible.
- [ ] Se han documentado las limitaciones del uso de `admin`.

## Documentación

- [ ] Existe resumen técnico.
- [ ] Existe análisis escrito.
- [ ] Se incluyen capturas.
- [ ] Se incluye la SPL editable.
- [ ] Se explican las decisiones.
- [ ] Se explican las limitaciones.
- [ ] Se incluyen recomendaciones.
- [ ] La solución puede reproducirse.

---

# Referencias oficiales

- [Splunk Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchapp)
- [Splunk Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)
- [Search optimization](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutsearchoptimization)
- [Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/IntroFrame)
- [Classic Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/PanelreferenceforSimplifiedXML)
- [Splunk Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)
- [Alerts](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Users and roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Knowledge objects](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)
- [Splunk Reports](https://docs.splunk.com/Documentation/Splunk/latest/Report/Reportsintro)

Las referencias oficiales complementan la evaluación, pero no sustituyen la
evidencia práctica. La puntuación debe basarse en el comportamiento real de la
solución, la calidad de las búsquedas y la capacidad del participante para explicar
sus decisiones.