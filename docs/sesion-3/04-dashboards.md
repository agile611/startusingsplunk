# 4. Dashboards

Un dashboard reúne indicadores, gráficos, tablas y controles en una vista
orientada a una tarea. No debe ser una colección de paneles sin relación: cada
elemento debe ayudar a detectar una situación, entender su alcance o decidir
qué investigar a continuación.

En este curso construirás un dashboard de **Monitorización de aplicación web**
con el índice `curso`. El enfoque es práctico para administradores: cada panel
debe tener una búsqueda validada, un rango temporal conocido, permisos correctos
y un coste razonable.

## Objetivo y audiencia

Antes de crear el dashboard, define:

- quién lo utilizará;
- qué decisión debe facilitar;
- qué periodo temporal necesita;
- qué significa un error;
- qué acción se espera ante una anomalía.

Para este laboratorio, la audiencia es un equipo de operaciones que necesita
responder rápidamente:

- ¿están llegando peticiones?
- ¿ha aumentado el porcentaje de errores?
- ¿qué URI o host concentra el problema?
- ¿cuándo empezó y cuánto dura?
- ¿qué eventos concretos debo revisar?

No diseñes el dashboard para mostrar todo lo que existe en Splunk. Diseñalo
para responder estas preguntas con el menor ruido posible.

## Flujo de construcción

1. Valida cada búsqueda en **Search & Reporting**.
2. Comprueba la tabla de resultados antes de elegir el gráfico.
3. Define un nombre y una descripción para cada panel.
4. Crea el dashboard y añade los paneles en orden operativo.
5. Añade el selector temporal y otros tokens solo cuando sean necesarios.
6. Configura refresco, permisos y aplicación.
7. Prueba el dashboard con un usuario que no sea administrador.
8. Revisa rendimiento y resultados con Job Inspector.

## Estructura recomendada

Coloca los paneles de arriba abajo según el flujo de diagnóstico:

1. **Resumen**: total de peticiones, errores y porcentaje de error.
2. **Evolución**: peticiones y errores por minuto.
3. **Distribución**: códigos HTTP y errores por URI.
4. **Detalle**: host, método, URI y eventos recientes.

Esta estructura evita que el usuario tenga que empezar por una tabla extensa
para saber si existe una incidencia.

## Panel 1: total de peticiones

Consulta:

```spl
index=curso
| stats count as peticiones
```

Visualización recomendada: **Single value**. El título debe indicar la métrica y
el contexto, por ejemplo `Peticiones en el intervalo seleccionado`.

## Panel 2: errores y porcentaje

Consulta:

```spl
index=curso
| stats count as total count(eval(status>=400)) as errores
| eval porcentaje_error=if(total=0, 0, round(errores * 100 / total, 2))
| table total errores porcentaje_error
```

Puedes mostrar el porcentaje como indicador y conservar `total` y `errores` en
una tabla de apoyo. Define claramente si `4xx` y `5xx` forman parte de la misma
métrica.

## Panel 3: peticiones por minuto

Consulta:

```spl
index=curso
| timechart span=1m count
```

Visualización recomendada: gráfico de líneas o columnas. El `span` debe
adaptarse al rango: un minuto puede ser útil para una ventana corta, pero puede
ser demasiado detallado para un histórico de varios días.

## Panel 4: distribución de códigos HTTP

Consulta:

```spl
index=curso
| stats count as peticiones by status
| sort - peticiones
```

Visualización recomendada: barras o tabla. Evita un gráfico circular si hay
muchos códigos o si necesitas comparar valores muy parecidos.

## Panel 5: URI con más errores

Consulta:

```spl
index=curso status>=400
| stats count as errores by host, uri
| sort - errores
| head 10
```

Visualización recomendada: barras horizontales o tabla. Conserva `host` y `uri`
para que el resultado sea accionable y no solo una cifra agregada.

## Panel 6: eventos recientes

Consulta:

```spl
index=curso status>=400
| table _time host method status uri source sourcetype
| sort - _time
| head 20
```

Visualización recomendada: tabla. Este panel permite pasar del indicador a la
investigación del evento concreto.

## Tiempo global y tokens

Todos los paneles deben utilizar el mismo intervalo temporal salvo que exista
una razón documentada. Puedes usar el selector temporal global de Splunk Web o
tokens en dashboards para que el usuario elija el periodo.

Una búsqueda reproducible también puede usar modificadores:

```spl
index=curso earliest=$earliest$ latest=$latest$
| stats count by status
```

La sintaxis exacta de los tokens depende del tipo de dashboard y de su
configuración. Antes de publicar, comprueba que un cambio temporal actualiza
todos los paneles y que no quedan búsquedas con un rango diferente.

Los filtros por host, método o código deben probarse con valores que existan:

```spl
index=curso host=$host$ status>=400
| stats count by uri
```

Si un token está vacío, el panel puede devolver cero resultados. Define valores
iniciales, opciones visibles y un comportamiento claro para “todos”.

## Crear el dashboard en Splunk Web

El flujo habitual es:

1. Abrir **Dashboards** y seleccionar **Create New Dashboard**.
2. Definir nombre, descripción y aplicación.
3. Elegir el formato disponible para la instancia.
4. Añadir los paneles desde búsquedas existentes o nuevas búsquedas.
5. Seleccionar la visualización de cada panel.
6. Añadir el selector temporal y filtros necesarios.
7. Guardar y revisar la vista completa.

Elige nombres descriptivos, por ejemplo:

```text
Monitorización de aplicación web
```

La descripción debería indicar índice, audiencia, definición de error y alcance
temporal previsto.

## Diseño y legibilidad

Un dashboard operativo debe poder leerse rápidamente:

- coloca primero los indicadores principales;
- utiliza títulos que expliquen la métrica;
- evita más paneles de los que el usuario puede revisar;
- reserva colores intensos para excepciones;
- no dependas solo del color para comunicar un estado;
- muestra unidades y periodos;
- limita tablas y categorías largas;
- conserva una ruta clara desde el resumen hasta el detalle.

Un panel con muchos elementos, leyendas largas o refresco constante puede ser
menos útil que una vista más pequeña y estable.

## Rendimiento y refresco

Cada panel puede ejecutar una búsqueda. Por eso:

- limita índice y rango temporal;
- filtra antes de agregar;
- evita `index=*`;
- reduce campos y filas;
- no repitas cinco búsquedas casi idénticas si una búsqueda base puede servir;
- revisa `join`, `transaction`, subbúsquedas y `rex` sobre `_raw`;
- configura el refresco según la urgencia real;
- utiliza Job Inspector para identificar paneles costosos.

Un dashboard que se actualiza cada minuto no debería ejecutar búsquedas que
revisan meses de histórico. La frecuencia, la ventana temporal y el coste deben
ser coherentes.

## Permisos y publicación

Desde la gestión de dashboards y objetos de conocimiento revisa:

- propietario;
- aplicación;
- permisos de lectura y escritura;
- índices y campos que se exponen;
- dependencias de lookups o búsquedas guardadas;
- acceso de los roles destinatarios.

Prueba siempre el dashboard con el rol real de los asistentes. Que funcione
como `admin` no demuestra que funcione para un usuario con permisos de búsqueda
más limitados.

No incluyas datos sensibles en tablas o exportaciones solo porque el dashboard
sea interno. El diseño y los permisos forman parte de la seguridad.

## Validación antes de compartir

1. Ejecuta cada SPL fuera del dashboard.
2. Compara la tabla con una consulta de control.
3. Cambia el intervalo temporal y verifica que todos los paneles responden.
4. Prueba valores válidos y vacíos en los filtros.
5. Revisa que los títulos y las unidades sean claros.
6. Comprueba el comportamiento cuando no hay datos.
7. Mide el coste de los paneles con Job Inspector.
8. Prueba lectura y navegación con un usuario no administrador.

Consulta de control:

```spl
index=curso
| stats count as total count(eval(status>=400)) as errores
```

Los paneles de resumen deben ser coherentes con esta consulta para el mismo
índice, periodo y conjunto de permisos.

## Errores habituales

| Síntoma | Causa posible | Comprobación |
|---|---|---|
| Un panel aparece vacío | Tiempo, token, índice o permisos incorrectos. | Ejecutar su SPL fuera del dashboard. |
| Los paneles muestran periodos distintos | Cada búsqueda tiene un rango propio. | Revisar tokens y `earliest`/`latest`. |
| El dashboard tarda demasiado | Demasiados paneles o consultas costosas. | Revisar Job Inspector y reducir búsquedas. |
| Un filtro no cambia los paneles | Token mal definido o no conectado. | Probar el token y su valor inicial. |
| El indicador no coincide con la tabla | Filtros o agregaciones diferentes. | Usar una consulta de control común. |
| Funciona para Admin pero no para asistentes | Permisos de objeto o índice insuficientes. | Probar con el rol real. |
| El usuario no sabe qué hacer con el resultado | Paneles sin contexto o títulos ambiguos. | Revisar la pregunta y la acción asociada. |

## Buenas prácticas

- Diseña alrededor de una tarea operativa concreta.
- Mantén un orden de resumen, evolución, distribución y detalle.
- Valida las búsquedas antes de crear los paneles.
- Usa el mismo tiempo global cuando los paneles deban compararse.
- Define tokens con valores iniciales y opciones seguras.
- Evita saturar el dashboard con paneles o categorías innecesarias.
- Documenta índice, métricas, permisos y dependencias.
- Prueba ausencia de datos, cambios de tiempo y acceso con otros roles.
- Revisa rendimiento antes de aumentar el refresco.

## Referencias oficiales

- [Dashboards en Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Viz/AboutDashboards)
- [Crear dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/CreateDashboards)
- [Visualizaciones](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutvisualizations)
- [Tokens en dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/tokens)
- [Permisos de objetos de conocimiento](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Knowledgeobjectpermissions)
- [Job Inspector](https://docs.splunk.com/Documentation/Splunk/latest/Search/JobInspector)
- [Buenas prácticas de búsquedas](https://docs.splunk.com/Documentation/Splunk/latest/Search/Writebetterqueries)