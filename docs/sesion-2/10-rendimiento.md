# 10. Rendimiento

El rendimiento de una búsqueda depende de cuánto dato debe leer Splunk, qué
parte puede filtrar pronto y qué transformaciones aplica después. Una consulta
correcta puede ser demasiado costosa si busca en muchos índices, cubre un
periodo enorme o utiliza comandos que deben reunir todos los resultados antes
de continuar.

Como administrador, el objetivo no es optimizar a ciegas. Primero debes medir,
identificar la etapa lenta y después cambiar una sola cosa cada vez.

## Las tres preguntas iniciales

Antes de modificar una consulta, responde:

1. ¿Estoy buscando en el índice correcto?
2. ¿El intervalo temporal es tan pequeño como permite la pregunta?
3. ¿Necesito todos los eventos y todos los campos?

Una base razonable para el laboratorio es:

```spl
index=curso earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| stats count by status
```

Es más fácil optimizar una consulta con un índice y un intervalo explícitos que
una búsqueda abierta como `index=*`.

## El orden recomendado de una búsqueda

Una búsqueda eficiente suele seguir este orden:

```text
Índice y tiempo -> filtros selectivos -> campos necesarios -> transformación -> presentación
```

Por ejemplo:

```spl
index=curso status>=400 earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| fields _time host method status uri
| stats count as errores by host, uri
| sort - errores
| head 10
```

Los filtros del inicio reducen los eventos que deben procesarse. `fields`
limita el conjunto de campos después de haber validado la fuente. La agregación
se realiza antes de ordenar y limitar la salida.

## Comparar una búsqueda amplia y una acotada

Una búsqueda de exploración demasiado amplia podría ser:

```spl
index=*
| rex field=_raw "status=(?<codigo>\\d+)"
| sort - _time
| table _time host source codigo _raw
```

Para la pregunta «¿qué URI tiene más errores en el laboratorio?» es preferible:

```spl
index=curso status>=400 earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| fields host uri status
| stats count as errores by host, uri
| sort - errores
| head 10
```

La segunda consulta expresa mejor la intención y evita procesar fuentes que no
forman parte de la pregunta.

## Limitar índice y tiempo

Evita estas formas en búsquedas habituales:

```spl
index=*
```

```spl
index=curso earliest=0
```

Pueden revisar un volumen enorme y dificultar tanto la búsqueda como el
diagnóstico. Usa el índice real y un intervalo ajustado:

```spl
index=curso earliest=-1h latest=now
```

Para el CSV de prácticas, utiliza un intervalo absoluto porque sus eventos son
del 1 de enero de 2026. El rango debe incluir los datos reales, pero no tiene
que cubrir toda la retención disponible.

## Filtrar pronto y agregar pronto

Filtra antes de comandos que deban revisar muchos eventos:

```spl
index=curso status>=400
| stats count by host, uri
```

Evita transformar todo el evento antes de descartar lo que no necesitas:

```spl
index=curso
| rex field=_raw "status=(?<codigo>\\d+)"
| eval categoria=if(codigo>=400, "error", "ok")
| search categoria=error
```

Si el campo `status` ya existe, esta alternativa suele ser más directa:

```spl
index=curso status>=400
| stats count by host, uri
```

Usa `rex`, `eval` y `regex` cuando sean necesarios, pero no como sustitutos de
un campo que ya está correctamente extraído.

## Reducir campos sin perder contexto

Durante el diagnóstico conserva `_time`, `host`, `source` y `sourcetype`. Una
vez validada la fuente, conserva solo lo que la consulta necesita:

```spl
index=curso
| fields _time host status uri
| table _time host status uri
```

No elimines `_raw` antes de comprobar una extracción defectuosa. Tampoco uses
`table` demasiado pronto si todavía necesitas campos para filtrar o calcular.

## Elegir comandos adecuados

Algunos comandos requieren más memoria o trabajo que otros:

| Necesidad | Primera opción | Precaución |
|---|---|---|
| Contar y agrupar | `stats` | Agrupar por campos de alta cardinalidad puede generar muchas filas. |
| Tendencia temporal | `timechart` | Elegir un `span` adecuado. |
| Añadir una métrica a eventos | `eventstats` | Repite la métrica en cada evento. |
| Comparar eventos consecutivos | `streamstats` | Ordenar antes de usarlo. |
| Enriquecer con una tabla | `lookup` | Validar tamaño, permisos y calidad del lookup. |
| Relacionar búsquedas | `join` | Tiene límites y puede ser costoso. |
| Agrupar sesiones | `transaction` | Puede consumir muchos recursos. |
| Extraer texto | `rex` | Evitar expresiones sobre volúmenes innecesarios. |

Siempre que una consulta con `join` o `transaction` pueda expresarse con
`stats`, `eventstats` o una búsqueda base más precisa, compara ambas opciones.

## `tstats` para metadatos y campos indexados

`tstats` puede ser muy rápido cuando trabaja con campos y estructuras que
Splunk tiene disponibles en sus índices o en modelos de datos acelerados. Para
metadatos básicos del laboratorio puedes probar:

```spl
| tstats count where index=curso by host, sourcetype
```

No todos los campos de búsqueda están disponibles de la misma manera para
`tstats`. Si un campo extraído en tiempo de búsqueda no funciona, utiliza una
búsqueda normal o configura la estructura necesaria. No sustituyas `stats` por
`tstats` sin validar que el resultado representa el mismo conjunto de eventos.

## `metadata` para una comprobación rápida

Para revisar actividad de fuentes y tipos de fuente, `metadata` puede ser útil:

```spl
| metadata type=sourcetypes index=curso
```

Este comando devuelve metadatos, no el detalle completo de cada evento. Úsalo
para una primera comprobación de actividad y vuelve a una búsqueda normal cuando
necesites analizar los campos del evento.

## Medir el rendimiento con Job Inspector

Splunk Web incluye **Job Inspector** en los resultados de búsqueda. Úsalo para
revisar:

- tiempo total de ejecución;
- tiempo dedicado a recuperar eventos;
- cantidad de eventos escaneados y devueltos;
- comandos que consumen más tiempo;
- advertencias de ejecución;
- uso de memoria cuando esté disponible.

Procedimiento práctico:

1. Ejecuta la consulta original y anota tiempo y resultados.
2. Abre **Job > Inspect Job** o **Job Inspector**.
3. Identifica la fase o comando más costoso.
4. Cambia solo una parte de la búsqueda.
5. Repite con el mismo índice y rango temporal.
6. Compara resultado y tiempo, no solo la velocidad.

Una consulta más rápida que devuelve datos distintos no es una optimización
correcta.

## Búsquedas guardadas, dashboards y alertas

Una búsqueda aceptable para una exploración puntual puede ser inadecuada para
un dashboard que se ejecuta muchas veces al día. Antes de publicar una consulta:

- fija o documenta el intervalo temporal;
- evita `index=*` si no es imprescindible;
- revisa subbúsquedas, `join`, `transaction` y expresiones regulares;
- limita el número de filas mostradas;
- usa una consulta base común si varios paneles consultan lo mismo;
- prueba con el rol real de los asistentes;
- revisa el coste con Job Inspector.

En una alerta, considera además la frecuencia de ejecución, la ventana de
tiempo y la posibilidad de contar dos veces los mismos eventos.

## Método práctico de optimización

Aplica este método a una consulta lenta:

1. Guarda la consulta original sin modificarla.
2. Ejecuta una versión con un intervalo pequeño.
3. Revisa si el índice y el tiempo son correctos.
4. Mueve filtros selectivos al principio.
5. Sustituye texto libre por filtros de campo cuando sea posible.
6. Elimina campos que no se usan.
7. Sustituye `join` o `transaction` si una agregación resuelve la pregunta.
8. Compara con Job Inspector.
9. Verifica que los resultados siguen siendo equivalentes.
10. Documenta el cambio y su motivo.

## Diagnóstico de búsquedas lentas

| Síntoma | Causa probable | Acción |
|---|---|---|
| La búsqueda tarda desde el inicio | Índice o rango demasiado amplios. | Limitar `index` y `earliest`/`latest`. |
| Hay muchos eventos escaneados y pocos resultados | Filtro aplicado demasiado tarde. | Mover condiciones al inicio. |
| `rex` consume mucho tiempo | Patrón complejo sobre `_raw`. | Filtrar antes y validar el `sourcetype`. |
| `join` tarda o pierde coincidencias | Clave no única, límites o conjuntos grandes. | Probar `stats` o `eventstats`. |
| `transaction` consume mucha memoria | `maxspan` amplio o clave de alta cardinalidad. | Reducir intervalo o usar agregación. |
| El dashboard se degrada con el tiempo | Consulta ejecutada con demasiada frecuencia o sobre más datos. | Fijar ventanas y revisar paneles con Job Inspector. |
| La búsqueda optimizada cambia el total | Se eliminaron eventos o se alteró el rango. | Comparar resultados antes de publicar. |

## Buenas prácticas para administradores

- Mide antes de optimizar.
- Especifica índice y tiempo en búsquedas compartidas.
- Filtra pronto y agrega antes de ordenar grandes volúmenes.
- Evita `index=*` y rangos históricos sin una razón concreta.
- No uses comandos costosos si una agregación sencilla responde la pregunta.
- Conserva contexto durante el diagnóstico y reduce campos después.
- Revisa Job Inspector antes de publicar dashboards y alertas.
- Documenta el resultado esperado, el intervalo y los permisos utilizados.

## Referencias oficiales

- [Buenas prácticas para escribir búsquedas](https://docs.splunk.com/Documentation/Splunk/latest/Search/Writebetterqueries)
- [Job Inspector](https://docs.splunk.com/Documentation/Splunk/latest/Search/JobInspector)
- [Comando `tstats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Tstats)
- [Comando `metadata`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Metadata)
- [Comando `stats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Stats)
- [Comando `timechart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart)
- [Monitorización de búsquedas](https://docs.splunk.com/Documentation/Splunk/latest/Monitor/MonitoringConsole)
