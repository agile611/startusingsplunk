# 3. Gestión del tiempo

El tiempo es parte de la lógica de una búsqueda SPL. Splunk no busca en todos
los eventos cada vez que ejecutas una consulta: aplica un intervalo temporal y
devuelve los eventos cuyo tiempo de búsqueda está dentro de ese intervalo.

Una consulta puede tener una sintaxis correcta y devolver cero resultados si el
rango seleccionado no coincide con la fecha de los eventos. Por eso, antes de
concluir que una fuente no funciona, comprueba siempre el índice, `_time`, el
rango temporal y los permisos.

## Qué tiempo utiliza Splunk

El campo `_time` representa el momento del evento y es el tiempo principal que
Splunk usa para buscar, ordenar y construir gráficos. En el dataset del curso,
la columna `timestamp` se utiliza para calcular ese valor durante la ingesta.

También existe `_indextime`, que indica cuándo Splunk indexó el evento. Estos
dos tiempos pueden ser diferentes: un archivo puede contener eventos antiguos,
puede llegar con retraso o puede procesarse después de haber sido generado.

```spl
index=curso
| table _time _indextime host status uri
| sort _time
```

Si `_time` no coincide con la fecha del archivo, el problema suele estar en la
interpretación del timestamp durante la entrada, no en la consulta.

## El selector temporal de Splunk Web

En Splunk Web, el selector temporal se aplica a la búsqueda aunque no escribas
`earliest` o `latest` en la barra SPL. Puedes usar opciones como:

- **15 minutos**, **1 hora** o **24 horas** para una comprobación rápida;
- **Hoy**, **Ayer** o **Esta semana** para periodos de calendario;
- **Tiempo real** para observar eventos que llegan continuamente;
- **Personalizado** para indicar fechas y horas concretas;
- **Todo el tiempo** para una primera inspección controlada.

El selector es cómodo para explorar, pero una consulta guardada o compartida
debe documentar su rango. De lo contrario, dos asistentes pueden ejecutar la
misma búsqueda y obtener resultados distintos.

## `earliest` y `latest`

Puedes fijar el intervalo directamente en SPL:

```spl
index=curso earliest=-24h latest=now
```

Este ejemplo busca desde las últimas 24 horas hasta el momento actual. Otros
rangos relativos habituales son:

```spl
index=curso earliest=-15m latest=now
index=curso earliest=-7d@d latest=now
index=curso earliest=-1h@h latest=now
```

El sufijo `@` redondea el tiempo a una unidad. Por ejemplo, `-1h@h` empieza
en el comienzo de la hora calculada, mientras que `-7d@d` empieza al comienzo
del día de hace siete días.

Para investigar un intervalo concreto, usa fechas absolutas:

```spl
index=curso earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
```

El CSV del laboratorio contiene eventos del 1 de enero de 2026. Si estás
trabajando con esos datos y utilizas **Últimas 24 horas** en una fecha posterior,
es posible que no veas nada aunque la ingesta sea correcta. Para este caso,
selecciona **Personalizado** o especifica el intervalo absoluto anterior.

## Elegir el rango adecuado

El rango depende de la pregunta que quieres responder:

| Pregunta | Rango recomendado |
|---|---|
| ¿Está llegando información ahora? | Últimos 15 minutos o 1 hora. |
| ¿Cuándo ocurrió una incidencia? | Intervalo absoluto alrededor de la hora conocida. |
| ¿Qué pasó durante el día? | Desde el inicio hasta el final del día. |
| ¿Hay una tendencia semanal? | Últimos 7 días, agrupados por tiempo. |
| ¿Qué contiene un archivo de laboratorio? | Intervalo absoluto de la fecha del archivo. |

Empieza con un intervalo pequeño si conoces la hora. Amplíalo gradualmente solo
si no encuentras resultados; buscar demasiado tiempo desde el principio puede
añadir ruido y aumentar el coste de la consulta.

## Consultas prácticas

### Encontrar el primer y el último evento

```spl
index=curso
| stats earliest(_time) as primer_evento latest(_time) as ultimo_evento count as total
```

Esta consulta permite comprobar rápidamente si los eventos están dentro del
periodo esperado y cuántos se han indexado.

### Comparar tiempo del evento y de indexación

```spl
index=curso
| eval retraso_segundos=_indextime-_time
| table _time _indextime retraso_segundos host source
| sort - retraso_segundos
| head 20
```

Un retraso puede ser normal en una fuente que procesa archivos o reenvía datos,
pero un valor inesperado ayuda a investigar problemas de parsing, colas o
retrasos de entrada.

### Ver eventos por minuto

```spl
index=curso earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| timechart span=1m count
```

Los huecos de la serie indican que no hubo eventos en ese intervalo o que la
consulta no puede verlos. Para distinguir ambas posibilidades, revisa también
la fuente, el rango y los permisos.

### Comparar éxito y error en el tiempo

```spl
index=curso earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| eval resultado=if(status>=400, "error", "correcto")
| timechart span=1m count by resultado
```

Esta consulta usa `eval` solo para etiquetar los eventos. La explicación
detallada de `eval` y sus funciones se encuentra en [Eval y funciones](07-eval-funciones.md).

## Tiempo, zona horaria y formato

Los timestamps pueden incluir una zona horaria o estar expresados en UTC. La
interfaz de Splunk muestra las fechas según la zona horaria configurada para el
usuario o para la instancia, mientras que los datos pueden haber sido
generados en otra zona.

Cuando un evento parece desplazado varias horas:

1. Observa el valor original del evento.
2. Compara `timestamp` con `_time`.
3. Comprueba la zona horaria de la fuente y del usuario.
4. Revisa la configuración de parsing de la entrada.
5. Repite la búsqueda con un intervalo absoluto amplio.

No corrijas un desplazamiento cambiando arbitrariamente el rango temporal. El
problema debe resolverse en la interpretación del timestamp o documentarse como
una diferencia de zona horaria.

## Tiempo en búsquedas en tiempo real

Las búsquedas en tiempo real sirven para observar datos que llegan de forma
continua, por ejemplo durante una práctica de ingesta. No son la opción
adecuada para analizar históricos ni para todas las alertas.

Para comprobar una entrada activa puedes empezar con:

```spl
index=curso earliest=-15m latest=now
| stats count by host, source, sourcetype
```

Si el volumen es alto, limita el intervalo y el número de campos. En un
laboratorio basado en un CSV estático, una búsqueda histórica es más apropiada
que una búsqueda en tiempo real.

## Diagnóstico cuando no aparecen eventos

Sigue este orden, sin ampliar la consulta al azar:

1. Ejecuta `index=curso` con **Todo el tiempo**.
2. Revisa el `_time` de un evento si aparece alguno.
3. Busca con un intervalo absoluto que incluya esa fecha.
4. Comprueba que la entrada utiliza el índice `curso`.
5. Revisa `source`, `sourcetype` y `_indextime`.
6. Confirma que el usuario puede leer el índice.
7. Solo después revisa la extracción del timestamp.

Una consulta sin intervalo explícito hereda el selector temporal de Splunk Web.
Por ello, guardar una búsqueda sin documentar el rango puede dificultar la
reproducción de un diagnóstico.

## Buenas prácticas para administradores

- Documenta siempre el intervalo usado en una investigación.
- Usa `earliest` y `latest` en búsquedas compartidas o reproducibles.
- Empieza con rangos pequeños y amplíalos de forma controlada.
- Usa `_time` para el momento del evento y `_indextime` para investigar retrasos.
- Comprueba la zona horaria antes de modificar una configuración de parsing.
- No uses **Todo el tiempo** como solución permanente en búsquedas pesadas.
- Alinea el rango con la retención disponible y con la fecha real de la fuente.
- Distingue entre ausencia de datos y datos fuera del intervalo seleccionado.

## Referencias oficiales

- [Time modifiers de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Search/Specifytimemodifiersinyoursearch)
- [Time range picker](https://docs.splunk.com/Documentation/Splunk/latest/Search/TimeRangePicker)
- [Búsquedas en tiempo real](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutrealtimesearches)
- [Comando `timechart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart)
- [Configuración del timestamp](https://docs.splunk.com/Documentation/Splunk/latest/Data/Configuretimestamp)
- [Referencia de campos de tiempo](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timefield)

## Siguiente paso

Cuando puedas seleccionar un intervalo fiable y demostrar dónde están los
eventos, continúa con [Campos y resultados](04-campos-resultados.md). El
análisis será útil solo si los campos se interpretan dentro del periodo
correcto.
