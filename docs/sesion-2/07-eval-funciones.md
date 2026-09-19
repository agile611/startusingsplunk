# 7. Eval y funciones

El comando `eval` permite crear campos calculados y transformar valores durante
una búsqueda. Es útil cuando el dato original no tiene exactamente la forma que
necesitas para filtrar, agrupar, medir o presentar resultados.

`eval` no modifica los eventos almacenados ni la configuración de la entrada.
El campo que crea existe únicamente en los resultados de esa ejecución, salvo
que guardes la lógica en una búsqueda, una extracción o una configuración
reutilizable.

## Sintaxis básica

La forma general es:

```spl
... | eval nombre_campo=expresión
```

Por ejemplo, clasificar las respuestas HTTP:

```spl
index=curso
| eval tipo_respuesta=if(status>=400, "error", "correcta")
| table _time host status tipo_respuesta uri
```

La expresión de la derecha puede usar campos existentes, valores literales,
operadores y funciones. Puedes crear varios campos en el mismo comando:

```spl
index=curso
| eval es_error=if(status>=400, 1, 0),
				ruta=uri,
				metodo_mayusculas=upper(method)
| table _time host method metodo_mayusculas status es_error ruta
```

Usa nombres descriptivos y evita sobrescribir un campo original hasta haber
validado el resultado. Si haces `eval status=...`, pierdes la posibilidad de
compararlo con su valor original en los pasos posteriores de la búsqueda.

## Condiciones con `if` y `case`

### `if`

`if` devuelve un valor si se cumple una condición y otro si no se cumple:

```spl
index=curso
| eval resultado=if(status>=400, "error", "ok")
| stats count by resultado
```

También puede clasificar una condición concreta:

```spl
index=curso
| eval es_login=if(uri="/login", "sí", "no")
| table _time uri es_login status
```

### `case`

`case` es apropiado cuando hay más de dos categorías. Las condiciones se
evalúan en orden, por lo que debes colocar primero las más específicas:

```spl
index=curso
| eval familia_status=case(
		status>=500, "5xx - error servidor",
		status>=400, "4xx - error cliente",
		status>=300, "3xx - redirección",
		status>=200, "2xx - correcto",
		true(), "otro"
	)
| stats count by familia_status
```

La condición `true()` funciona como caso final. Sin ella, algunos eventos
pueden quedarse sin clasificación.

## Crear indicadores para estadísticas

Un patrón muy útil es crear un indicador numérico y agregarlo con `stats`:

```spl
index=curso
| eval es_error=if(status>=400, 1, 0)
| stats count as total sum(es_error) as errores
```

Para calcular el porcentaje:

```spl
index=curso
| eval es_error=if(status>=400, 1, 0)
| stats count as total sum(es_error) as errores
| eval porcentaje_error=if(total=0, 0, round(errores * 100 / total, 2))
```

Este patrón hace explícito el numerador y el denominador. Comprueba siempre
que ambos se calculan sobre el mismo intervalo, índice y conjunto de filtros.

## Conversión de tipos y redondeo

Los valores que llegan desde una fuente pueden estar representados como texto.
Antes de comparar o calcular, revisa varios eventos y convierte solo cuando sea
necesario:

```spl
index=curso
| eval status_num=tonumber(status)
| where status_num>=400
| table _time host status status_num uri
```

`round` limita los decimales de una métrica:

```spl
index=curso
| stats avg(status) as media_status
| eval media_status=round(media_status, 2)
```

En el dataset del curso `status` es un código HTTP, por lo que normalmente es
mejor contar cada código o familia que calcular su media.

## Funciones de texto

### `lower` y `upper`

Normalizan valores para comparar o presentar resultados:

```spl
index=curso
| eval metodo=upper(method), recurso=lower(uri)
| table _time metodo recurso status
```

### `len`

Calcula la longitud de una cadena:

```spl
index=curso
| eval longitud_uri=len(uri)
| table uri longitud_uri
| sort - longitud_uri
```

### `substr`

Extrae una parte de un texto. La posición inicial de `substr` comienza en 1:

```spl
index=curso
| eval prefijo_uri=substr(uri, 1, 5)
| table uri prefijo_uri
```

### `replace` y `match`

`replace` devuelve un texto transformado y `match` devuelve verdadero o falso:

```spl
index=curso
| eval uri_sin_barra=replace(uri, "^/", "")
| eval es_api=if(match(uri, "^/api/"), 1, 0)
| table uri uri_sin_barra es_api
```

Para un filtro sencillo, `search` o `regex` pueden ser más fáciles de leer. Usa
estas funciones cuando necesites conservar el campo calculado para otros pasos.

## Valores nulos y campos ausentes

Cuando una fuente es irregular, utiliza `coalesce` para elegir el primer valor
disponible:

```spl
index=curso
| eval recurso=coalesce(uri, "sin_uri")
| table _time host recurso status
```

`isnull` y `isnotnull` ayudan a identificar valores nulos:

```spl
index=curso
| eval falta_uri=if(isnull(uri), 1, 0)
| stats sum(falta_uri) as eventos_sin_uri
```

Un campo ausente y una cadena vacía no siempre se comportan igual. Si la
calidad del dato es importante, revisa `_raw` y el `sourcetype` antes de
normalizar el valor.

## Funciones de fecha y hora

`strftime` convierte un timestamp Unix en texto legible:

```spl
index=curso
| eval fecha_hora=strftime(_time, "%Y-%m-%d %H:%M:%S")
| table fecha_hora host status uri
```

Puedes extraer una parte de la fecha para agruparla o mostrarla:

```spl
index=curso
| eval dia=strftime(_time, "%Y-%m-%d"), hora=strftime(_time, "%H:%M")
| stats count by dia, hora
```

Para búsquedas temporales, sigue utilizando `earliest`, `latest` y `timechart`.
No conviertas `_time` en texto antes de terminar las operaciones que necesitan
el valor temporal original.

## Combinar `eval`, `where` y `stats`

Una secuencia habitual para un indicador operativo es:

```spl
index=curso
| eval categoria=case(
		status>=500, "crítico",
		status>=400, "error",
		true(), "normal"
	)
| where categoria!="normal"
| stats count as eventos by host, categoria
| sort - eventos
```

Primero se crea el campo, después se filtran sus valores y finalmente se
agrupan los resultados. Si puedes expresar una condición directamente en la
búsqueda base, hazlo al principio para reducir el volumen procesado.

## Diferencia entre `eval` y configuración permanente

`eval` es ideal para probar una transformación o construir una métrica dentro
de una búsqueda. No es lo mismo que configurar una extracción de campos,
calcular un campo persistente o modificar el parsing de una entrada.

Como administrador, decide según el objetivo:

- **Investigación puntual**: usa `eval` en la búsqueda.
- **Consulta reutilizable**: guarda la búsqueda y documenta la lógica.
- **Campo común para muchos usuarios**: valora una extracción o configuración
	mantenida en la aplicación adecuada.
- **Corrección de datos de origen**: revisa la entrada y el `sourcetype`, no solo
	el resultado visual.

No uses `eval` para ocultar un problema de ingesta que debería corregirse en la
fuente o en la configuración de parsing.

## Diagnóstico de expresiones

Si una expresión no produce lo esperado:

1. Ejecuta la búsqueda sin `eval` y revisa los valores originales.
2. Comprueba la escritura exacta de los nombres de campo.
3. Añade un único campo calculado.
4. Muestra el campo original y el calculado con `table`.
5. Comprueba valores ausentes, tipos y mayúsculas/minúsculas.
6. Solo después combina varias funciones o agrega con `stats`.

Ejemplo de inspección:

```spl
index=curso
| eval status_num=tonumber(status)
| table status status_num uri
| head 20
```

## Buenas prácticas

- No sobrescribas campos originales durante la fase de aprendizaje.
- Da nombres descriptivos a los campos calculados.
- Usa `case` cuando existan más de dos categorías.
- Comprueba tipos antes de hacer operaciones numéricas.
- Trata explícitamente los campos ausentes y los valores nulos.
- Aplica filtros de índice y tiempo antes de transformaciones costosas.
- Mantén `_time` como timestamp hasta terminar el análisis temporal.
- Valida la expresión con pocos eventos antes de compartirla o guardarla.
- Documenta si el campo es temporal, calculado o resultado de una extracción.

## Referencias oficiales

- [Comando `eval`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Eval)
- [Funciones de evaluación](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Evalfunctions)
- [Funciones condicionales](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/ConditionalFunctions)
- [Funciones de texto](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/TextFunctions)
- [Funciones de fecha y hora](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Dateandtimefunctions)
- [Funciones matemáticas](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/MathematicalFunctions)
- [Comando `where`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Where)