# 6. Estadísticas

Las estadísticas convierten muchos eventos en un resumen que se puede comparar
y utilizar para tomar decisiones. En lugar de revisar cada petición HTTP,
puedes contar peticiones por host, medir la proporción de errores o detectar
qué URI concentra más actividad.

En Splunk, el comando principal para este trabajo es `stats`. La idea clave es
que una búsqueda estadística cambia la forma del resultado: deja de devolver
eventos individuales y devuelve filas agregadas.

## Del evento al resumen

Una búsqueda de eventos conserva el detalle:

```spl
index=curso status>=400
| table _time host status uri
```

Una búsqueda estadística resume esos eventos:

```spl
index=curso status>=400
| stats count as errores by host
```

El resultado contiene una fila por `host` y el número de eventos de cada grupo.
Después de `stats`, los campos que no se hayan agrupado o agregado ya no forman
parte del resultado. Si necesitas revisar el evento original, hazlo antes de
resumir o utiliza `eventstats`.

## Sintaxis de `stats`

La estructura habitual es:

```spl
... | stats función(campo) [as nombre] [by campo1, campo2]
```

Ejemplos:

```spl
index=curso
| stats count
```

```spl
index=curso
| stats count as peticiones by status
```

```spl
index=curso
| stats count as peticiones by host, method
```

La cláusula `by` define la dimensión de agrupación. Añadir más campos crea
grupos más específicos y normalmente más filas.

## Funciones básicas de agregación

### `count`

Cuenta eventos o valores:

```spl
index=curso
| stats count as total_eventos
```

Para contar por código HTTP:

```spl
index=curso
| stats count as peticiones by status
| sort - peticiones
```

### `dc`

`dc` calcula el número de valores distintos. Por ejemplo, hosts diferentes:

```spl
index=curso
| stats dc(host) as hosts_distintos, dc(uri) as uri_distintas
```

Es útil para saber si una fuente está recibiendo datos de un solo sistema o de
varios.

### `values` y `list`

`values` devuelve valores únicos y `list` conserva la lista de valores
observados. Para una inspección por host:

```spl
index=curso
| stats values(status) as codigos, values(uri) as recursos by host
```

No uses estas funciones sin controlar el volumen: una lista de valores muy
grande puede ser difícil de leer y costosa de manejar.

### `min`, `max`, `avg` y `sum`

Estas funciones requieren un campo numérico o convertible en número:

```spl
index=curso
| stats min(status) as codigo_minimo max(status) as codigo_maximo avg(status) as codigo_medio
```

Aunque calcular el promedio de un código HTTP puede servir para una práctica de
funciones, normalmente es más útil agrupar por `status` o calcular porcentajes
de éxito y error.

En una fuente que tenga un campo de duración, por ejemplo `response_ms`, podrías
calcular:

```spl
index=curso
| stats avg(response_ms) as media_ms
```

Si el dataset no contiene ese campo, la consulta no producirá una métrica útil.
Primero comprueba siempre los campos disponibles.

## Métricas operativas del laboratorio

### Total, errores y porcentaje de error

```spl
index=curso
| stats count as total
	count(eval(status>=400)) as errores
| eval porcentaje_error=round(errores * 100 / total, 2)
```

El resultado permite responder cuántas peticiones se han observado y qué
porcentaje ha devuelto un error. La expresión `count(eval(...))` cuenta solo los
eventos que cumplen la condición.

Para evitar una división problemática en una búsqueda reutilizable, añade una
comprobación del total:

```spl
index=curso
| stats count as total count(eval(status>=400)) as errores
| eval porcentaje_error=if(total=0, 0, round(errores * 100 / total, 2))
```

### Errores por host y URI

```spl
index=curso status>=400
| stats count as errores by host, uri
| sort - errores
| head 10
```

Este patrón es útil para priorizar una investigación: primero muestra dónde se
concentra el problema y después permite volver a los eventos concretos.

### Métodos HTTP por host

```spl
index=curso
| stats count as peticiones by host, method
| sort host, - peticiones
```

La salida sirve para detectar cambios de comportamiento o una fuente que solo
está enviando un tipo de petición.

## `timechart`: estadísticas a lo largo del tiempo

`timechart` agrupa automáticamente por intervalos temporales y es apropiado
para detectar tendencias:

```spl
index=curso
| timechart span=1m count
```

Para comparar códigos HTTP:

```spl
index=curso
| timechart span=1m count by status
```

El `span` debe corresponder a la escala de la pregunta. Un intervalo demasiado
pequeño crea ruido o muchos huecos; uno demasiado grande puede ocultar picos.
El rango temporal se selecciona en Splunk Web o mediante `earliest` y `latest`.

Para analizar el archivo de prácticas:

```spl
index=curso earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| timechart span=1m count by status
```

## `chart`, `top` y `rare`

`chart` permite crear una tabla de resultados cruzados:

```spl
index=curso
| chart count over host by status
```

`top` identifica los valores más frecuentes de un campo:

```spl
index=curso
| top limit=10 uri
```

`rare` muestra los valores menos frecuentes:

```spl
index=curso
| rare limit=10 uri
```

Estos comandos son prácticos para exploración. Para búsquedas operativas que
deben documentarse con precisión, `stats` suele hacer más explícita la lógica y
el nombre de las métricas.

## Mantener el detalle con `eventstats`

`eventstats` calcula una estadística y la añade a cada evento sin colapsar la
salida. Esto permite comparar cada evento con el total o con el promedio de su
grupo:

```spl
index=curso
| eventstats count as total_por_host by host
| table _time host status uri total_por_host
```

La búsqueda sigue mostrando eventos individuales, pero cada uno incluye el
total de eventos de su `host`.

## Cálculos acumulados con `streamstats`

`streamstats` calcula valores progresivos según el orden de los resultados:

```spl
index=curso
| sort 0 _time
| streamstats count as numero_acumulado
| table _time host status uri numero_acumulado
```

Ordena los eventos antes de usarlo si el orden temporal es importante. Si no
especificas un orden fiable, el acumulado puede no representar la secuencia que
esperas.

## Validar una estadística antes de compartirla

Una cifra no es automáticamente correcta. Antes de incluirla en un informe o
dashboard, comprueba:

1. El índice utilizado.
2. El rango temporal y la zona horaria.
3. Los filtros aplicados antes de `stats`.
4. La presencia y calidad del campo agrupado.
5. El número total de eventos de referencia.
6. Si los permisos del usuario permiten ver todo el conjunto.

Puedes comparar el resumen con una inspección de eventos:

```spl
index=curso status>=400
| table _time host status uri
| head 20
```

Si el total no coincide con lo esperado, revisa el filtro y los eventos antes
de cambiar la función estadística.

## Errores habituales

| Síntoma | Causa posible | Acción |
|---|---|---|
| `stats` devuelve una sola fila | No se indicó `by`. | Añadir el campo de agrupación. |
| Faltan campos después de `stats` | No se incluyeron en la agregación. | Añadirlos a `by` o usar `eventstats`. |
| El porcentaje es incorrecto | El denominador no representa el mismo conjunto. | Aplicar el mismo filtro antes de contar. |
| `avg` o `sum` no dan resultados útiles | El campo falta o no es numérico. | Inspeccionar valores y tipo del campo. |
| Hay demasiadas filas | Se agrupa por demasiados campos o por un campo de alta cardinalidad. | Reducir dimensiones y rango temporal. |
| El gráfico tiene huecos | No hubo eventos o el rango no coincide. | Revisar `_time`, intervalo y fuente. |
| La cifra cambia entre usuarios | Rango temporal o permisos distintos. | Fijar `earliest`/`latest` y documentar el rol. |

## Buenas prácticas para administradores

- Filtra por índice y tiempo antes de agregar.
- Da nombres descriptivos a las métricas con `as`.
- Incluye la dimensión `by` solo cuando responda a la pregunta.
- Evita agrupar por campos de cardinalidad muy alta sin necesidad.
- Comprueba el total de referencia antes de calcular porcentajes.
- Usa `eventstats` si necesitas mantener los eventos originales.
- Usa `timechart` para tendencias y `stats` para resúmenes tabulares.
- Documenta índice, rango, filtros, campos y permisos de la búsqueda.

## Referencias oficiales

- [Comando `stats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Stats)
- [Comando `eventstats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Eventstats)
- [Comando `streamstats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Streamstats)
- [Comando `timechart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart)
- [Comando `chart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Chart)
- [Comando `top`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Top)
- [Funciones estadísticas](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Statisticalfunctions)

## Siguiente paso

Cuando puedas resumir eventos y validar las métricas obtenidas, continúa con
[Eval y funciones](07-eval-funciones.md). Allí aprenderás a crear campos
calculados y a preparar expresiones más avanzadas para tus estadísticas.
