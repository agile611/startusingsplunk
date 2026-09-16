# 9. Comandos avanzados

Los comandos avanzados permiten combinar resultados, enriquecer eventos,
mantener contexto durante una búsqueda y preparar datos para análisis más
complejos. No deben utilizarse por el hecho de ser más potentes: cada comando
debe resolver una necesidad concreta y estar acompañado de una validación.

Antes de utilizar uno de ellos, confirma el índice, el rango temporal, los
campos disponibles y el volumen de datos. En una instalación mononodo de
laboratorio esto ayuda a entender el comportamiento sin ocultar problemas de
ingesta o de configuración.

## `bin`: agrupar por intervalos

`bin` redondea un campo numérico o temporal a intervalos. Es útil para crear
series temporales con `stats`:

```spl
index=curso
| bin _time span=1m
| stats count as peticiones by _time, status
| sort _time
```

Para gráficos, `timechart` suele ser más directo. `bin` resulta útil cuando
necesitas combinar el intervalo temporal con otras dimensiones o añadir más
transformaciones antes del resumen.

## `eventstats` y `streamstats`

Estos comandos se han presentado junto a las estadísticas, pero son patrones
avanzados porque mantienen el detalle de los eventos.

### Añadir un total al evento con `eventstats`

```spl
index=curso
| eventstats count as total_por_host by host
| eval porcentaje_del_host=round(100 / total_por_host, 2)
| table _time host status uri total_por_host porcentaje_del_host
```

`eventstats` calcula una estadística y la añade a cada evento del grupo. No
confundas el porcentaje del ejemplo con una métrica de negocio: para calcular
una proporción real necesitas un numerador y un denominador definidos.

### Calcular una secuencia con `streamstats`

```spl
index=curso
| sort 0 host, _time
| streamstats count as numero_evento by host
| table _time host numero_evento status uri
```

El orden es importante. Si necesitas comparar eventos consecutivos, ordena
primero y agrupa por la clave correcta.

## `append`: unir resultados de búsquedas

`append` ejecuta una búsqueda adicional y añade sus resultados a la salida:

```spl
index=curso method=GET
| stats count as peticiones_get
| append [ search index=curso status>=400
		  | stats count as errores ]
```

El resultado contiene filas procedentes de dos búsquedas independientes. Es
útil para comparar métricas con estructuras compatibles, pero no sustituye una
agregación bien diseñada.

Las subbúsquedas tienen límites y pueden aumentar el coste de ejecución. Usa
el mismo índice y un intervalo temporal explícito cuando la consulta se vaya a
compartir o guardar.

## `join`: relacionar resultados por una clave

`join` puede combinar resultados que comparten un campo:

```spl
index=curso
| stats count as peticiones by host
| join type=left host [ search index=curso
						| stats dc(uri) as uri_distintas by host ]
```

Este ejemplo añade el número de URI distintas a cada host. `join` puede ser
útil en conjuntos pequeños o cuando necesitas relacionar resultados distintos,
pero tiene límites y puede ser costoso. Siempre que sea posible, prueba antes
una única búsqueda con `stats`, `eventstats` o una combinación por campos.

No utilices `join` como solución automática para relacionar grandes volúmenes.
Valida el número de filas antes y después, y comprueba si la clave realmente es
única en cada lado.

## `lookup`: enriquecer eventos con una tabla

Un lookup añade información externa a partir de una clave. Por ejemplo, si
existe un archivo `hosts.csv` con las columnas `host` y `entorno`:

```spl
index=curso
| lookup hosts.csv host OUTPUT entorno
| table _time host entorno status uri
```

El archivo debe estar disponible como lookup en la aplicación y tener permisos
para los usuarios que ejecutan la búsqueda. Este ejemplo es ilustrativo: el
repositorio del curso no incluye `hosts.csv` por defecto.

Para revisar los datos de un lookup configurado:

```spl
| inputlookup hosts.csv
| table host entorno
```

Como administrador, controla el propietario, la aplicación, los permisos y la
frecuencia de actualización del lookup. Un enriquecimiento incompleto puede
parecer un problema de extracción cuando en realidad falta una fila en la tabla
externa.

## `transaction`: agrupar eventos relacionados

`transaction` agrupa eventos que comparten una clave y cumplen condiciones de
tiempo. Es apropiado para reconstruir una sesión o una secuencia de actividad:

```spl
index=aplicacion session_id=*
| transaction session_id maxspan=10m
| table session_id duration eventcount _time
```

Este ejemplo requiere un campo `session_id` real. No lo apliques directamente
al CSV del curso, que no contiene ese identificador. `transaction` puede
consumir muchos recursos, especialmente si la clave tiene alta cardinalidad o
el intervalo es demasiado amplio. Para muchos casos, `stats` es más eficiente.

## Subbúsquedas con condiciones dinámicas

Una subbúsqueda puede calcular valores para que la búsqueda exterior los use:

```spl
index=curso host=[ search index=curso
				   | stats count by host
				   | sort - count
				   | head 1
				   | return $host ]
| table _time host method status uri
```

Esta consulta intenta buscar los eventos del host con más actividad. Las
subbúsquedas tienen límites y una sintaxis difícil de mantener; para una
solución operativa suele ser mejor guardar primero la métrica o resolverla con
`stats` en una sola búsqueda.

## `foreach` para aplicar una transformación

Cuando varios campos tienen una estructura similar, `foreach` puede aplicar una
operación repetida. Por ejemplo, para revisar campos de texto seleccionados:

```spl
index=curso
| foreach host method uri [ eval <<FIELD>>=lower('<<FIELD>>') ]
| table host method uri
```

Úsalo solo cuando la repetición sea clara. En una búsqueda de aprendizaje, tres
expresiones `eval` explícitas suelen ser más fáciles de revisar y mantener.

## Elegir el comando adecuado

| Necesidad | Primera opción | Precaución |
|---|---|---|
| Agrupar por tiempo | `timechart` o `bin` + `stats` | Elegir un `span` adecuado. |
| Añadir una métrica sin perder eventos | `eventstats` | La métrica se repite en cada evento. |
| Comparar eventos consecutivos | `streamstats` | Ordenar antes y elegir la clave. |
| Añadir resultados independientes | `append` | Límites y estructuras compatibles. |
| Relacionar dos conjuntos por una clave | `join` | Coste, límites y duplicados. |
| Añadir datos externos | `lookup` | Permisos y calidad de la tabla. |
| Reconstruir una sesión | `transaction` | Alto consumo y cardinalidad. |
| Repetir una expresión en muchos campos | `foreach` | Legibilidad y nombres de campo. |

## Secuencia de validación

Antes de guardar un comando avanzado en un dashboard o una alerta:

1. Ejecuta la búsqueda con un rango temporal pequeño.
2. Comprueba el número de eventos antes del comando.
3. Comprueba el número de filas después del comando.
4. Revisa valores vacíos, duplicados y campos inesperados.
5. Compara el resultado con una consulta sencilla basada en `stats`.
6. Evalúa el coste y el tiempo de ejecución.
7. Documenta el índice, el rango, las claves y las dependencias externas.

Ejemplo de comprobación de volumen:

```spl
index=curso
| stats count as eventos_entrada
```

Después de un enriquecimiento o una combinación, comprueba que el resultado no
ha eliminado eventos sin una razón conocida.

## Errores habituales

| Síntoma | Causa posible | Acción |
|---|---|---|
| `join` devuelve menos filas | No hay coincidencia o la clave no es única. | Comparar las claves de ambos lados. |
| `append` mezcla columnas inesperadas | Las búsquedas generan esquemas distintos. | Normalizar nombres y documentar cada fila. |
| `lookup` deja valores vacíos | Falta una clave o una fila en la tabla. | Revisar el lookup con `inputlookup`. |
| `transaction` tarda demasiado | Intervalo o cardinalidad excesivos. | Limitar `maxspan`, filtrar antes o usar `stats`. |
| `streamstats` da una secuencia incorrecta | Los eventos no estaban ordenados. | Usar `sort` y definir la clave. |
| La subbúsqueda no produce el valor esperado | Límite o formato de retorno incorrecto. | Probar la subbúsqueda por separado. |
| El resultado cambia entre usuarios | Dependencias de permisos o aplicación. | Probar con el mismo rol y contexto. |

## Buenas prácticas para administradores

- Prefiere una búsqueda sencilla cuando resuelva la misma pregunta.
- Filtra por índice, tiempo y campos antes de comandos costosos.
- Comprueba volumen y cardinalidad antes de usar `join` o `transaction`.
- Documenta lookups, archivos, propietarios y permisos necesarios.
- Evita depender de archivos externos no versionados sin una validación.
- No ocultes pérdidas de eventos producidas por una combinación.
- Guarda las consultas avanzadas con un objetivo y una explicación breve.
- Revisa el rendimiento antes de convertir una búsqueda en dashboard o alerta.

## Referencias oficiales

- [Comando `bin`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Bin)
- [Comando `append`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Append)
- [Comando `join`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Join)
- [Comando `lookup`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Lookup)
- [Comando `inputlookup`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Inputlookup)
- [Comando `transaction`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Transaction)
- [Comando `foreach`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Foreach)
- [Buenas prácticas de búsquedas](https://docs.splunk.com/Documentation/Splunk/latest/Search/Writebetterqueries)

## Siguiente paso

Cuando puedas elegir el comando adecuado y validar su coste, continúa con
[Rendimiento](10-rendimiento.md). Allí aprenderás a optimizar búsquedas para
que sean rápidas, reproducibles y adecuadas para un entorno administrado.
