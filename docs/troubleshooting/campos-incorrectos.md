# Campos incorrectos

Cuando un campo falta, tiene otro nombre o contiene valores inesperados, no
empieces modificando la consulta final. Primero determina si el problema está en
el evento original, en la extracción, en el tipo de dato, en la transformación
o en los permisos del usuario.

El flujo recomendado es:

```text
_raw -> sourcetype -> extracción -> tipo de valor -> SPL -> objeto compartido
```

Una búsqueda puede funcionar para un evento y fallar para otro si la fuente
contiene varias formas de registro. Por eso debes probar ejemplos
representativos y no solo el primer resultado.

## Síntomas habituales

- `status=404` no encuentra eventos, pero `404` aparece en `_raw`.
- El campo aparece con otro nombre o con mayúsculas diferentes.
- `stats`, `sort` o comparaciones numéricas producen resultados extraños.
- El campo está presente en unos eventos y ausente en otros.
- El administrador ve campos que otro usuario no ve.
- Un campo creado con `eval` desaparece al ejecutar otra búsqueda.

Cada síntoma apunta a una comprobación distinta. No confundas un campo ausente
con un rango temporal vacío o con un índice sin permisos.

## 1. Confirmar índice y tiempo

Empieza con una búsqueda mínima:

```spl
index=curso
| stats count as total earliest(_time) as primer_evento latest(_time) as ultimo_evento
```

Si no devuelve resultados:

1. Selecciona **Todo el tiempo** temporalmente.
2. Revisa que el índice sea realmente `curso`.
3. Comprueba los permisos del usuario.
4. Revisa la ingesta en [Datos no aparecen](datos-no-aparecen.md).

No investigues la extracción hasta confirmar que existen eventos visibles.

## 2. Comparar `_raw` con los campos

Observa el evento original y los valores extraídos juntos:

```spl
index=curso
| table _time _raw host source sourcetype timestamp method status uri
| head 20
```

El CSV del curso debería contener:

```text
timestamp,host,method,status,uri
2026-01-01T00:00:00Z,web-01,GET,200,/login
2026-01-01T00:01:00Z,web-01,GET,404,/missing
```

Si el valor está en `_raw` pero no en la columna del campo, la extracción no
está funcionando. Si tampoco está en `_raw`, el problema está en la fuente o
en el evento recibido, no en la consulta.

## 3. Revisar los campos disponibles

Usa `fieldsummary` para explorar campos presentes y valores observados:

```spl
index=curso
| fieldsummary
```

Y revisa la distribución de un campo:

```spl
index=curso
| stats count by host, method, status, uri
| sort - count
```

Comprueba la escritura exacta. `client_ip`, `clientip` y `src_ip` pueden
representar el mismo concepto en distintas fuentes, pero Splunk los trata como
campos diferentes.

## 4. Campos ausentes y valores vacíos

Para localizar eventos que tienen un campo:

```spl
index=curso status=*
```

Para buscar eventos en los que falta:

```spl
index=curso NOT status=*
| table _time _raw host source sourcetype
```

Un campo ausente no es necesariamente igual a una cadena vacía. Revisa `_raw`
antes de decidir cómo normalizarlo. Puedes crear una etiqueta temporal para
investigar:

```spl
index=curso
| eval estado_campo=if(isnull(status), "ausente", if(status="", "vacío", "con valor"))
| stats count by estado_campo
```

No utilices `fillnull` para ocultar un problema de ingesta sin documentar la
causa y el impacto.

## 5. Tipos de datos incorrectos

Un código HTTP puede llegar como texto. Comprueba varios valores antes de
compararlo o hacer cálculos:

```spl
index=curso
| table status
| head 20
```

Si es necesario, crea una conversión temporal:

```spl
index=curso
| eval status_num=tonumber(status)
| where status_num>=400
| table _time host status status_num uri
```

Compara el campo original y el convertido antes de cambiar una extracción
permanente. Un valor no convertible puede quedar nulo y desaparecer de una
comparación.

## 6. Extracción incorrecta en CSV

Si todo el CSV aparece como una sola columna, revisa:

- delimitador configurado;
- uso de cabeceras;
- comillas y comas internas;
- saltos de línea;
- `sourcetype` asignado;
- índice y entrada utilizados.

Para una prueba temporal sobre un CSV simple puedes usar `rex`:

```spl
index=curso
| rex field=_raw "^(?<timestamp_temp>[^,]+),(?<host_temp>[^,]+),(?<method_temp>[^,]+),(?<status_temp>\\d+),(?<uri_temp>[^,]+)$"
| table _raw timestamp_temp host_temp method_temp status_temp uri_temp
| head 20
```

Este patrón no sustituye una configuración correcta para CSV con comillas,
delimitadores complejos o varias líneas por evento. Para una solución
reutilizable, sigue [Extracción de campos](../sesion-2/08-extraccion-campos.md).

## 7. JSON y estructuras anidadas

Si el evento es JSON y un valor aparece dentro de una estructura, comprueba el
`sourcetype` y utiliza `spath` cuando corresponda:

```spl
index=curso sourcetype=json
| spath input=_raw path=response.status output=status_json
| table _raw status_json
```

No uses `spath` sobre un CSV o texto plano como solución genérica. El comando
debe corresponder al formato real de la fuente.

## 8. Diferenciar `eval` de extracción

`eval` crea un campo durante una búsqueda:

```spl
index=curso
| eval categoria=if(status>=400, "error", "correcto")
| table status categoria
```

Ese campo no queda almacenado ni aparece automáticamente en otra búsqueda. Si
el campo debe existir para muchos usuarios y búsquedas, revisa una extracción
reutilizable asociada al `sourcetype`.

## 9. Revisar `sourcetype` y configuración

El `sourcetype` influye en el parsing y en las extracciones. Agrupa los eventos
para encontrar variantes:

```spl
index=curso
| stats count by sourcetype, source, host
| sort - count
```

Si el mismo archivo llega con varios `sourcetype`, compara `_raw` y campos por
cada grupo. Como administrador, revisa la entrada y los objetos de conocimiento
antes de cambiar `props.conf` o `transforms.conf`.

No modifiques parsing global para arreglar una consulta aislada sin probar el
impacto en otras fuentes y aplicaciones.

## 10. Comprobar permisos y contexto

Los campos extraídos mediante objetos de conocimiento pueden depender de la
aplicación, del propietario y de los permisos. Si Admin ve un campo y otro
usuario no:

1. Ejecuta la misma búsqueda con el rol final.
2. Comprueba índice, tiempo y `sourcetype`.
3. Revisa el ámbito de la extracción.
4. Comprueba permisos de lectura del objeto.
5. Verifica que el usuario está en la aplicación correcta.

No concedas `admin` como solución permanente.

## Procedimiento de corrección

Aplica este orden:

1. Guarda un ejemplo de `_raw` y la consulta que demuestra el problema.
2. Identifica fuente, índice y `sourcetype`.
3. Confirma si el dato existe en el evento original.
4. Prueba una extracción temporal con `rex` o `spath`.
5. Valida cobertura, valores y tipos.
6. Decide si hace falta una configuración reutilizable.
7. Publica el cambio con permisos y aplicación adecuados.
8. Repite la prueba con varios eventos y el rol final.
9. Documenta el formato esperado y una muestra válida.

## Tabla de diagnóstico

| Síntoma | Causa probable | Acción |
|---|---|---|
| Campo no existe | No hay extracción o el nombre es incorrecto. | Revisar `_raw`, `fieldsummary` y `sourcetype`. |
| Campo aparece en `_raw` pero no se puede filtrar | Extracción ausente o mal configurada. | Probar `rex` y revisar la entrada. |
| Comparación numérica incorrecta | Campo textual, vacío o con valores mixtos. | Inspeccionar y usar `tonumber` temporalmente. |
| Solo algunos eventos tienen campo | Variantes de formato o fuentes distintas. | Comparar por `source` y `sourcetype`. |
| CSV queda en una sola columna | Delimitador o parsing incorrecto. | Revisar configuración de la entrada. |
| JSON no se separa | Ruta o `sourcetype` incorrectos. | Confirmar estructura y probar `spath`. |
| Admin ve el campo y otro usuario no | Objeto privado o ámbito incorrecto. | Revisar aplicación y permisos. |
| Campo calculado desaparece | Se creó con `eval` en otra búsqueda. | Repetir `eval` o configurar extracción reutilizable. |

## Buenas prácticas

- Compara siempre `_raw` con los campos extraídos.
- Valida índice, tiempo y `sourcetype` antes de cambiar parsing.
- Prueba con varios eventos y variantes de formato.
- Usa `rex` o `spath` como diagnóstico temporal antes de publicar cambios.
- Conserva campos originales durante la investigación.
- Diferencia campos ausentes, vacíos y con tipo incorrecto.
- Prueba configuraciones reutilizables con el rol final.
- Documenta el patrón, la fuente y el alcance del cambio.
- No ocultes errores de ingesta con transformaciones de presentación.

## Referencias oficiales

- [Extracción de campos](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Extractfields)
- [Campos en tiempo de búsqueda](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Searchtimeoperations)
- [Comando `rex`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Rex)
- [Comando `spath`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Spath)
- [Comando `fieldsummary`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fieldsummary)
- [Referencia de `props.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Propsconf)
- [Referencia de `transforms.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Transformsconf)
- [Solución de problemas de ingesta](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Troubleshootingyourdata)
