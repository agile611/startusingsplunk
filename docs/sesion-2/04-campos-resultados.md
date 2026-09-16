# 4. Campos y resultados

Los campos permiten convertir un evento de texto en información que se puede
filtrar, comparar, agrupar y presentar. Un campo es un nombre asociado a uno o
varios valores, por ejemplo `host=web-01` o `status=404`.

Para un administrador, trabajar con campos significa responder preguntas como:

- ¿Se ha extraído correctamente el dato que necesito?
- ¿El campo tiene el nombre y el valor esperados?
- ¿Está presente en todos los eventos o solo en algunos?
- ¿La búsqueda está devolviendo eventos completos o resultados transformados?

## Evento, campos y resultados

Conviene distinguir tres conceptos:

1. **Evento**: unidad original almacenada en Splunk.
2. **Campo**: dato identificado dentro del evento o añadido por Splunk.
3. **Resultado**: salida que genera la búsqueda después de filtrar o transformar.

Un evento puede contener texto original y metadatos, mientras que una búsqueda
con `stats` ya no devuelve el mismo tipo de resultado que una búsqueda de
eventos. Por ejemplo:

```spl
index=curso
```

devuelve eventos, pero:

```spl
index=curso
| stats count by status
```

devuelve filas agrupadas por `status`. Después de `stats`, los campos que no se
incluyan en la agregación dejan de estar disponibles en esa salida.

## Tipos de campos que debes reconocer

### Campos internos

Splunk crea campos internos para describir el evento y su contexto:

| Campo | Uso habitual |
|---|---|
| `_raw` | Texto original completo del evento. |
| `_time` | Tiempo del evento utilizado en las búsquedas. |
| `_indextime` | Momento en que Splunk indexó el evento. |
| `host` | Equipo o sistema asociado al evento. |
| `source` | Fuente concreta, como un archivo o entrada. |
| `sourcetype` | Tipo de datos y reglas de extracción. |
| `index` | Índice donde se almacenó el evento. |

Estos campos son muy útiles para diagnosticar una ingesta. No todos aparecen
siempre como columnas visibles hasta que los seleccionas explícitamente.

### Campos extraídos

Son campos obtenidos del contenido del evento o definidos por una configuración
de extracción. En el CSV del curso esperamos encontrar:

```text
timestamp,host,method,status,uri
```

El campo `timestamp` puede utilizarse para calcular `_time`, mientras que
`host`, `method`, `status` y `uri` deben poder utilizarse en búsquedas y tablas.
La existencia de una columna en el archivo no garantiza por sí sola que el
campo se haya extraído correctamente.

### Campos calculados

Una búsqueda puede crear campos temporales con `eval`:

```spl
index=curso
| eval tipo_respuesta=if(status>=400, "error", "correcta")
| table _time host status tipo_respuesta uri
```

Los campos calculados existen en los resultados de esa búsqueda. No modifican
los eventos almacenados ni quedan disponibles en otras búsquedas salvo que
guardes la lógica en una configuración reutilizable.

## Inspeccionar los campos de un evento

Empieza por observar eventos reales, no por asumir que la fuente está bien
formada:

```spl
index=curso
| head 5
```

En Splunk Web puedes abrir un evento y revisar sus campos. También puedes
seleccionar los datos importantes explícitamente:

```spl
index=curso
| table _time _raw host source sourcetype index timestamp method status uri
```

`_raw` conserva el texto original y permite comparar lo que llegó con lo que
Splunk extrajo. Esta comparación es el primer paso cuando un campo falta o
tiene un valor inesperado.

## Descubrir y validar campos

### Ver los valores observados

```spl
index=curso
| stats count by host
```

Repite la consulta con `source`, `sourcetype`, `method`, `status` o `uri` para
comprobar la distribución de valores:

```spl
index=curso
| stats count by sourcetype, source
```

### Revisar un resumen de campos

```spl
index=curso
| fieldsummary
```

`fieldsummary` ayuda a identificar campos presentes, valores distintos y
posibles campos vacíos. Es una herramienta de exploración; para una búsqueda de
producción conviene seleccionar solo los campos necesarios.

### Comprobar campos ausentes

Para buscar eventos que tienen un campo:

```spl
index=curso method=*
```

Para buscar eventos en los que falta:

```spl
index=curso NOT method=*
```

La ausencia de un campo no es lo mismo que un campo con una cadena vacía. Si la
fuente puede contener ambos casos, revisa el evento original en `_raw` y define
una regla explícita para tratarlos.

## Seleccionar y renombrar campos

### `table` para una salida legible

```spl
index=curso
| table _time host method status uri
```

Es apropiado para inspección y para mostrar una tabla final. Durante el
diagnóstico conserva también `source` y `sourcetype` para no perder contexto.

### `fields` para controlar el conjunto de datos

```spl
index=curso
| fields _time host status uri
```

Puedes excluir el evento original cuando ya no necesitas revisarlo:

```spl
index=curso
| fields - _raw
```

Hazlo después de validar la extracción. Eliminar `_raw` demasiado pronto puede
dificultar la investigación de un campo incorrecto.

### `rename` para mejorar el significado

```spl
index=curso
| rename uri as recurso
| table _time host status recurso
```

El cambio afecta a los resultados de la búsqueda. No cambia el nombre del
campo en los eventos almacenados ni en la configuración de la entrada.

## Valores vacíos, nulos y tipos

Los datos pueden tener campos ausentes, vacíos o con valores que no son del tipo
esperado. Antes de comparar o calcular, comprueba ejemplos reales:

```spl
index=curso
| table status
| head 20
```

Si necesitas presentar un valor alternativo en la salida, puedes usar
`fillnull`:

```spl
index=curso
| fillnull value="sin_valor" uri method status
| table _time host method status uri
```

`fillnull` transforma los resultados de la búsqueda. No corrige la fuente ni
garantiza que el campo faltante se extraiga correctamente en futuras cargas.

Cuando un campo numérico llega como texto, una comparación o un cálculo puede
dar resultados inesperados. Comprueba el formato antes de convertirlo con
`eval` y las funciones de la siguiente sección.

## Campos multivalor y datos estructurados

Algunos eventos contienen varios valores en un mismo campo o estructuras JSON.
No debes tratar automáticamente esos valores como una cadena simple. En datos
JSON, `spath` puede extraer una ruta concreta:

```spl
index=curso sourcetype=json
| spath input=_raw path=request.uri output=uri
| table _time uri
```

Este ejemplo solo es aplicable si el evento realmente contiene JSON con esa
estructura. Para el CSV del curso, utiliza los campos extraídos por la entrada
y no añadas `spath` sin necesidad.

## Cuando un campo no aparece

Sigue esta secuencia antes de modificar la consulta:

1. Abre un evento y revisa `_raw`.
2. Comprueba si el nombre del campo coincide exactamente, incluida la escritura.
3. Revisa `source` y `sourcetype`.
4. Confirma que el rango temporal contiene eventos de esa fuente.
5. Comprueba si el campo aparece en otros eventos del mismo tipo.
6. Revisa la configuración de extracción en Splunk Web.
7. Solo entonces modifica el parsing o crea una extracción nueva.

Como administrador, puedes revisar la entrada en **Settings > Data inputs** y
la configuración relacionada con el `sourcetype`. Haz una prueba con pocos
eventos después de cualquier cambio y documenta el resultado.

## Errores habituales

| Síntoma | Causa posible | Comprobación |
|---|---|---|
| La tabla no muestra un campo | El campo no existe o tiene otro nombre. | Revisar `_raw` y `fieldsummary`. |
| `stats` pierde campos | Los campos no incluidos en la agregación dejan de estar en la salida. | Revisar la lista de campos de `stats`. |
| Un valor parece vacío | Campo ausente, cadena vacía o extracción incorrecta. | Comparar el evento con `_raw`. |
| El código no se puede comparar | El valor se extrajo con un formato inesperado. | Inspeccionar varios valores antes de usar `eval`. |
| El resultado tiene menos contexto | Se usó `fields` o `table` demasiado pronto. | Conservar metadatos durante el diagnóstico. |
| El campo JSON aparece como texto | Falta una extracción estructurada. | Confirmar el `sourcetype` y valorar `spath`. |

## Buenas prácticas para asistentes y administradores

- Comprueba los campos en eventos reales antes de diseñar un dashboard.
- Conserva `_time`, `host`, `source` y `sourcetype` durante el diagnóstico.
- Usa nombres de salida descriptivos con `rename` o `as`.
- Diferencia los campos almacenados de los campos calculados en una búsqueda.
- No corrijas un campo ausente ocultándolo con `fillnull` sin investigar la causa.
- Evita seleccionar `_raw` en salidas finales muy grandes si ya has validado los
	datos.
- Documenta qué `sourcetype` y qué configuración producen cada campo.
- Prueba las consultas con un intervalo pequeño antes de aplicarlas a todo el
	histórico.

## Referencias oficiales

- [Campos en Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutfields)
- [Campos internos](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/ExplicitFields)
- [Comando `fieldsummary`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fieldsummary)
- [Comando `table`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Table)
- [Comando `fields`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fields)
- [Comando `rename`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Rename)
- [Comando `fillnull`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fillnull)
- [Comando `spath`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Spath)

## Siguiente paso

Cuando puedas identificar y validar los campos de un evento, continúa con
[Filtrado de eventos](05-filtrado.md). El filtrado será más preciso si sabes
qué campo estás utilizando, de dónde procede y qué valores puede contener.
