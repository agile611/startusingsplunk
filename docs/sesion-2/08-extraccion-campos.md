# 8. Extracción de campos

La extracción de campos convierte partes del evento original en valores que
Splunk puede buscar, filtrar, agrupar y mostrar. Es necesaria cuando el dato
existe en `_raw`, pero Splunk todavía no lo reconoce con un nombre de campo.

Por ejemplo, un evento puede contener:

```text
2026-01-01T00:01:00Z,web-01,GET,404,/missing
```

Si la fuente no está configurada para separar sus columnas, una búsqueda por
`status=404` no funcionará aunque el texto `404` esté presente. Primero revisa
el formato y después elige el mecanismo de extracción adecuado.

## Dónde se produce la extracción

En Splunk conviene distinguir estos momentos:

- **Durante la ingesta**: se interpreta el evento, se asignan metadatos y se
	determina el timestamp.
- **En tiempo de búsqueda**: una extracción como `rex` crea campos al ejecutar
	la consulta.
- **Como conocimiento reutilizable**: una extracción asociada a un `sourcetype`
	puede estar disponible para muchas búsquedas y usuarios.

Una extracción en tiempo de búsqueda no modifica los eventos almacenados ni
repara la configuración de la entrada. Si muchos usuarios necesitan el mismo
campo, como administrador debes valorar una configuración mantenida y probada
en lugar de copiar el mismo `rex` en cada dashboard.

## Flujo de trabajo recomendado

Antes de crear una expresión regular:

1. Confirma el índice y el rango temporal.
2. Abre varios eventos y revisa `_raw`.
3. Comprueba si el campo ya existe con `table` o `fieldsummary`.
4. Identifica si la fuente es CSV, texto libre, JSON u otro formato.
5. Prueba la extracción sobre pocos eventos.
6. Compara el campo nuevo con el texto original.
7. Valida los valores y la tasa de eventos extraídos.
8. Decide si la extracción será temporal o reutilizable.

Consulta inicial:

```spl
index=curso
| table _time _raw host source sourcetype
| head 10
```

No empieces creando una extracción si el problema real es un índice incorrecto,
un rango temporal vacío o una entrada que no está leyendo la fuente.

## `rex`: extraer con expresiones regulares

El comando `rex` crea campos a partir de grupos con nombre. En un log de texto:

```spl
index=curso
| rex field=_raw "status=(?<status_extraido>\\d+)"
| table _time status status_extraido _raw
```

`(?<status_extraido>...)` es el grupo capturado y su nombre se convierte en el
campo. `\\d+` busca uno o más dígitos.

Para una línea CSV como la del laboratorio, puedes probar una extracción
temporal si la entrada no separa las columnas automáticamente:

```spl
index=curso
| rex field=_raw "^(?<timestamp_extraido>[^,]+),(?<host_extraido>[^,]+),(?<method_extraido>[^,]+),(?<status_extraido>\\d+),(?<uri_extraida>[^,]+)$"
| table _time timestamp_extraido host_extraido method_extraido status_extraido uri_extraida
```

Este patrón depende de que el evento tenga exactamente cinco columnas, sin
comas escapadas dentro de los valores. Para un CSV real con comillas, saltos de
línea o delimitadores complejos, configura correctamente la entrada en lugar de
ampliar indefinidamente la expresión regular.

### Validar una extracción `rex`

```spl
index=curso
| rex field=_raw "status=(?<status_extraido>\\d+)"
| stats count as eventos count(status_extraido) as extraidos by sourcetype
```

Compara `eventos` y `extraidos`. Si no coinciden, revisa ejemplos de `_raw` y
comprueba si el patrón solo cubre una variante del formato.

### Errores habituales con expresiones regulares

- El grupo no tiene nombre y no crea el campo esperado.
- El patrón exige un orden fijo que la fuente no garantiza.
- No se escapan correctamente caracteres como `.`, `?`, `(` o `[`.
- El patrón funciona con un evento, pero no con otras variantes.
- Se extraen valores parciales porque faltan los anclajes `^` o `$`.

## `spath`: extraer datos estructurados

Para eventos JSON, `spath` permite obtener valores siguiendo una ruta:

```spl
index=curso sourcetype=json
| spath input=_raw path=request.uri output=uri_extraida
| spath input=_raw path=response.status output=status_extraido
| table _time uri_extraida status_extraido
```

Si el JSON es sencillo, Splunk puede extraer automáticamente algunos campos.
Usa `spath` de forma explícita cuando necesites controlar la ruta o el nombre
de salida. No apliques este ejemplo al CSV del curso sin confirmar antes el
formato real.

## Datos delimitados y CSV

La configuración de la entrada debe reconocer el delimitador, las cabeceras y
el tratamiento de comillas. Para el laboratorio:

```text
timestamp,host,method,status,uri
2026-01-01T00:00:00Z,web-01,GET,200,/login
2026-01-01T00:01:00Z,web-01,GET,404,/missing
```

Después de cargar el archivo, valida los campos así:

```spl
index=curso
| table _time timestamp host method status uri
| head 20
```

Si `host`, `method`, `status` o `uri` no aparecen, revisa la entrada y el
`sourcetype` antes de crear un `rex` permanente. Una extracción correcta en la
entrada evita repetir lógica en cada búsqueda.

## Extracción mediante Splunk Web

Como administrador, puedes revisar los objetos de conocimiento desde **Settings
> Fields** y configurar extracciones asociadas a un `sourcetype`. El flujo
general es:

1. Seleccionar la aplicación y el contexto adecuados.
2. Crear o revisar la extracción de campos.
3. Asociarla al `sourcetype` correcto.
4. Definir quién puede verla y utilizarla.
5. Probarla con eventos reales.
6. Documentar el patrón y el motivo del cambio.

El contexto de aplicación y los permisos importan: una extracción creada en un
ámbito privado puede funcionar para el administrador y no para los asistentes.
Prueba la búsqueda con el mismo rol que utilizará el resto del grupo.

## Configuración reutilizable

En entornos administrados, las extracciones pueden mantenerse mediante objetos
de conocimiento o configuración como `props.conf` y `transforms.conf`. No
modifiques archivos de configuración sin una copia, una prueba y un plan de
reversión.

| Necesidad | Mecanismo recomendado |
|---|---|
| Probar una hipótesis | `rex` en la búsqueda. |
| Extraer para un tipo de evento | Objeto de conocimiento asociado al `sourcetype`. |
| Normalizar una fuente | Configuración de parsing administrada. |
| Corregir un formato de origen | Revisar la fuente o la entrada. |

Una extracción reutilizable debe tener nombre descriptivo, alcance claro,
aplicación definida y una prueba documentada.

## Validación operativa

Después de extraer un campo, comprueba algo más que su existencia:

```spl
index=curso
| rex field=_raw "status=(?<status_extraido>\\d+)"
| stats count as eventos count(status_extraido) as con_campo dc(status_extraido) as valores_distintos
```

Comprueba también sus valores:

```spl
index=curso
| rex field=_raw "status=(?<status_extraido>\\d+)"
| stats count by status_extraido
| sort status_extraido
```

Si el campo se utilizará en un dashboard o alerta, valida varios intervalos,
hosts y variantes del `sourcetype`. Una extracción que funciona con un evento
no está necesariamente preparada para operación diaria.

## Diagnóstico de campos que no se extraen

| Síntoma | Causa posible | Comprobación |
|---|---|---|
| El campo no existe | No hay extracción o el nombre es incorrecto. | Revisar `_raw` y `fieldsummary`. |
| `rex` no devuelve valores | El patrón no coincide con el formato real. | Mostrar `_raw` y probar un patrón más pequeño. |
| Solo algunos eventos tienen campo | Hay variantes de formato. | Comparar eventos por `source` y `sourcetype`. |
| JSON aparece como texto | Falta una ruta `spath` o el tipo no es JSON. | Confirmar `sourcetype` y estructura. |
| CSV queda en una sola columna | Delimitador o configuración incorrectos. | Revisar la entrada y el parsing. |
| Funciona para Admin pero no para asistentes | Contexto o permisos del objeto. | Probar con el rol y aplicación del usuario. |
| El campo aparece vacío | El grupo captura una cadena vacía o falta el dato. | Validar valores y variantes de `_raw`. |

Como administrador, no corrijas una extracción global para resolver una consulta
aislada sin confirmar el impacto en otras búsquedas y aplicaciones.

## Buenas prácticas

- Revisa `_raw` antes de escribir una expresión regular.
- Prefiere extracciones configuradas correctamente frente a `rex` repetidos.
- Usa grupos con nombre en `rex`.
- Prueba patrones con eventos representativos.
- Valida porcentaje de extracción, valores y campos ausentes.
- Asocia las extracciones al `sourcetype` correcto.
- Controla aplicación, propietario y permisos de los objetos de conocimiento.
- No modifiques parsing global sin probar el impacto en otros datos.
- Documenta el formato esperado y un ejemplo de evento válido.

## Referencias oficiales

- [Comando `rex`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Rex)
- [Comando `spath`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Spath)
- [Extracción de campos en Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Extractfields)
- [Campos en tiempo de búsqueda](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Searchtimeoperations)
- [Objetos de conocimiento](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)
- [Referencia de `props.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Propsconf)
- [Referencia de `transforms.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Transformsconf)