# 3. Visualizaciones

Las visualizaciones convierten los resultados de una búsqueda en una forma
rápida de comparar, detectar tendencias y comunicar una conclusión. Una buena
visualización no sustituye a la SPL: depende de una consulta correcta, de un
rango temporal conocido y de campos bien extraídos.

La elección debe partir de la pregunta, no del tipo de gráfico que resulte más
llamativo. En un entorno operativo, una tabla clara suele ser más útil que un
gráfico decorativo si el usuario necesita localizar exactamente un host o una
URI.

## Elegir la visualización según la pregunta

| Pregunta | Visualización recomendada | Forma habitual de la SPL |
|---|---|---|
| ¿Cuántos eventos hay? | Single value o indicador. | `stats count`. |
| ¿Qué valores tienen más actividad? | Barras o tabla ordenada. | `stats count by campo`. |
| ¿Cómo cambia con el tiempo? | Línea o columnas temporales. | `timechart`. |
| ¿Qué proporción representa cada categoría? | Barras o sectores con pocas categorías. | `stats` por categoría. |
| ¿Qué eventos concretos debo investigar? | Tabla. | Búsqueda de eventos con `table`. |
| ¿Qué relación hay entre dos valores? | Barras agrupadas o tabla cruzada. | `chart` o `stats`. |

No utilices un gráfico circular con muchas categorías ni un indicador único para
ocultar una distribución importante. Si el número total sube, el porcentaje de
error puede seguir siendo estable; muestra ambas métricas cuando la decisión lo
requiera.

## Preparar la SPL para visualizar

Una visualización necesita resultados con una estructura clara. Primero limita
índice, tiempo y filtros; después agrupa y asigna nombres legibles:

```spl
index=curso status>=400 earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| stats count as errores by uri
| sort - errores
| head 10
```

El resultado tiene dos columnas: `uri` y `errores`. Por eso puede representarse
como una tabla o como barras. Si la consulta devuelve eventos completos, primero
decide qué campos y qué agregación necesita el gráfico.

## Indicadores y single value

Un indicador es adecuado para una cifra principal, como el total de peticiones:

```spl
index=curso
| stats count as peticiones
```

Para mostrar total y porcentaje de error en una sola salida:

```spl
index=curso
| stats count as total count(eval(status>=400)) as errores
| eval porcentaje_error=if(total=0, 0, round(errores * 100 / total, 2))
| table total errores porcentaje_error
```

No presentes un número sin unidad, periodo o definición. El lector debe saber
si `errores` representa respuestas `4xx`, `5xx` o todos los códigos superiores
o iguales a `400`.

## Tablas para investigación

Las tablas son la mejor opción cuando el usuario debe actuar sobre elementos
concretos:

```spl
index=curso status>=400
| table _time host method status uri
| sort - _time
```

Para una tabla resumida:

```spl
index=curso
| stats count as peticiones by host, status, uri
| sort - peticiones
| head 20
```

Incluye `_time`, `host`, `source` o `sourcetype` durante el diagnóstico. En una
tabla final puedes eliminar campos técnicos si no ayudan a la decisión.

## Gráficos de barras

Las barras funcionan bien para comparar categorías:

```spl
index=curso
| stats count as peticiones by status
| sort - peticiones
```

Para comparar errores por URI:

```spl
index=curso status>=400
| stats count as errores by uri
| sort - errores
| head 10
```

Limita el número de categorías cuando haya muchos valores. Mostrar cientos de
URI en un gráfico dificulta la lectura; una tabla paginada o un `head` razonable
puede ser más apropiado.

## Series temporales

Usa `timechart` para observar volumen y evolución:

```spl
index=curso
| timechart span=1m count
```

Para comparar códigos HTTP:

```spl
index=curso
| timechart span=1m count by status
```

El `span` debe corresponder al periodo analizado. Un intervalo demasiado pequeño
puede crear ruido y huecos; uno demasiado grande puede ocultar un pico.

Con los datos del laboratorio, fija el rango temporal:

```spl
index=curso earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| timechart span=1m count by status
```

Si hay pocos eventos, la serie sirve para comprobar su distribución, pero no
permite afirmar una tendencia estadística robusta. Documenta esa limitación.

## Gráficos combinados y comparaciones

Para comparar dos dimensiones puedes utilizar `chart`:

```spl
index=curso
| chart count over host by status
```

Otra alternativa más explícita es:

```spl
index=curso
| stats count as peticiones by host, status
| sort host, - peticiones
```

Elige la primera si necesitas una matriz compacta y la segunda si quieres una
salida fácil de reutilizar en otros comandos o componentes.

## Crear una visualización desde Splunk Web

El flujo habitual es:

1. Abrir **Search & Reporting**.
2. Escribir y ejecutar la búsqueda.
3. Revisar primero los resultados en **Events** o **Statistics**.
4. Abrir la pestaña **Visualization**.
5. Elegir el tipo de gráfico.
6. Configurar ejes, series, unidades y formato.
7. Comprobar que la visualización representa la tabla de resultados.
8. Guardarla como búsqueda, reporte o panel según el objetivo.

No configures el gráfico antes de comprobar la tabla. Si la tabla contiene una
agrupación incorrecta, cambiar colores o etiquetas no arreglará el análisis.

## Escalas, unidades y etiquetas

Revisa siempre:

- que el eje temporal utiliza la zona horaria esperada;
- que los números tienen unidades claras;
- que los nombres de las series son comprensibles;
- que los valores no se redondean de forma engañosa;
- que el eje empieza y termina de forma razonable;
- que el título indica métrica y periodo.

Evita comparar visualmente series con escalas incompatibles sin indicarlo. Para
porcentajes, utiliza una salida que deje claro el rango de `0` a `100` cuando
corresponda.

## Validar una visualización

Antes de compartirla:

1. Ejecuta la SPL con un rango temporal conocido.
2. Revisa la tabla que sirve de base al gráfico.
3. Comprueba que el total coincide con una consulta de control.
4. Verifica que no hay valores nulos o categorías ocultas.
5. Comprueba el número de series y la legibilidad de las etiquetas.
6. Prueba el resultado con el rol que lo utilizará.
7. Revisa el rendimiento con Job Inspector si se ejecutará con frecuencia.

Consulta de control:

```spl
index=curso
| stats count as total
```

Si el gráfico muestra una suma distinta, revisa filtros, tiempo, duplicados y
la agregación utilizada.

## Visualizaciones para operación diaria

Una página de monitorización web podría incluir:

1. Total de peticiones.
2. Porcentaje de error.
3. Errores por URI.
4. Peticiones por minuto.
5. Distribución de códigos HTTP.
6. Tabla de eventos de error recientes.

Cada panel debe responder a una pregunta y utilizar una búsqueda con índice,
tiempo y permisos adecuados. No dupliques consultas pesadas sin necesidad:
valora una búsqueda base o un reporte reutilizable cuando varios componentes
compartan el mismo filtro.

## Errores habituales

| Síntoma | Causa posible | Comprobación |
|---|---|---|
| Gráfico vacío | Tiempo, índice o permisos incorrectos. | Revisar la tabla y el rango temporal. |
| El gráfico contradice la tabla | Agregación o configuración incorrecta. | Comparar resultados antes de visualizar. |
| Demasiadas categorías | Campo de alta cardinalidad. | Usar `head`, tabla o agrupar valores. |
| Las líneas tienen huecos | No hubo eventos o el `span` no es adecuado. | Revisar tiempo, fuente y granularidad. |
| Los valores parecen exagerados | Duplicados o suma aplicada incorrectamente. | Comparar con `stats count`. |
| El texto no se lee | Etiquetas largas o demasiadas series. | Reducir categorías y ajustar formato. |
| Funciona para Admin pero no para usuarios | Permisos o contexto de aplicación. | Probar con el rol real. |

## Buenas prácticas

- Empieza por la pregunta y el resultado, no por el tipo de gráfico.
- Valida la tabla antes de abrir **Visualization**.
- Usa nombres de campos y unidades descriptivos.
- Limita categorías y series para preservar la legibilidad.
- Documenta el rango temporal, zona horaria y definición de cada métrica.
- No uses gráficos para ocultar datos ausentes o resultados incompletos.
- Mantén una tabla de detalle para investigar las excepciones.
- Revisa rendimiento y permisos antes de publicar la visualización.

## Referencias oficiales

- [Visualizaciones en Splunk Web](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutvisualizations)
- [Tipos de visualización](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Visualizationreference)
- [Comando `timechart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart)
- [Comando `chart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Chart)
- [Comando `stats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Stats)
- [Job Inspector](https://docs.splunk.com/Documentation/Splunk/latest/Search/JobInspector)