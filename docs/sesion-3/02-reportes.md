# 2. Reportes

Un reporte es una búsqueda guardada preparada para comunicar resultados de forma
periódica o reutilizable. Puede mostrar una tabla, un gráfico o un resumen de
indicadores para que otros perfiles consulten la información sin tener que
escribir la SPL desde cero.

Un reporte no sustituye la validación de la búsqueda. Antes de compartirlo debes
comprobar el índice, el tiempo, los campos, la calidad de los datos, los
permisos y el coste de ejecución.

## Diferencia entre búsqueda guardada y reporte

Una búsqueda guardada conserva principalmente una consulta para reutilizarla.
Un reporte añade una intención de comunicación:

- qué pregunta responde;
- qué periodo analiza;
- qué visualización utiliza;
- con qué frecuencia se actualiza;
- quién puede verlo;
- qué decisión ayuda a tomar.

La misma SPL puede ser la base de una búsqueda guardada, un reporte, un panel o
una alerta, pero cada objeto necesita una configuración y una validación
distintas.

## Ejemplo práctico: errores por URI

Para un informe operativo del laboratorio puedes utilizar:

```spl
index=curso status>=400 earliest=-24h latest=now
| stats count as errores by host, uri
| sort - errores
| head 10
```

Para reproducir el informe con los datos del CSV del curso, utiliza un rango
absoluto que incluya el 1 de enero de 2026:

```spl
index=curso status>=400 earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| stats count as errores by host, uri
| sort - errores
| head 10
```

La primera versión es adecuada para una revisión diaria si la fuente recibe
datos continuamente. La segunda es adecuada para una práctica reproducible.
No mezcles ambas intenciones sin documentar el rango temporal.

## Elegir la salida adecuada

La visualización debe corresponder a la pregunta:

| Pregunta | Consulta o salida recomendada |
|---|---|
| ¿Cuántos eventos hay? | `stats count` y un indicador. |
| ¿Qué URI tiene más errores? | Tabla ordenada con `stats` y `sort`. |
| ¿Cómo cambia el volumen? | `timechart` de líneas o columnas. |
| ¿Qué códigos HTTP aparecen? | Tabla o gráfico de barras por `status`. |
| ¿Qué proporción son errores? | `stats` con porcentaje y un indicador. |

Ejemplo de tendencia temporal:

```spl
index=curso
| timechart span=1m count by status
```

Ejemplo de indicadores generales:

```spl
index=curso
| stats count as total
					count(eval(status>=400)) as errores
| eval porcentaje_error=if(total=0, 0, round(errores * 100 / total, 2))
```

No elijas un gráfico solo porque sea visualmente llamativo. Una tabla puede ser
mejor que un gráfico si el usuario necesita identificar exactamente la URI y el
host afectados.

## Crear un reporte desde Splunk Web

El flujo habitual es:

1. Abrir **Search & Reporting**.
2. Escribir y validar la búsqueda SPL.
3. Seleccionar **Save As > Report**.
4. Definir un nombre y una descripción.
5. Elegir la visualización y comprobar la vista previa.
6. Configurar el intervalo temporal.
7. Definir permisos y aplicación.
8. Guardar y abrir el reporte desde **Reports**.

Un nombre útil podría ser:

```text
Curso - Errores HTTP por host y URI
```

La descripción debería indicar el índice, la definición de error, el rango
temporal previsto y la audiencia.

## Programar un reporte

Un reporte puede ejecutarse bajo demanda o con una planificación. Antes de
programarlo, define:

- frecuencia: cada hora, diariamente o semanalmente;
- rango de cada ejecución: por ejemplo, últimos 60 minutos o día anterior;
- zona horaria;
- formato de salida;
- destinatarios o ubicación de publicación;
- comportamiento cuando no haya resultados.

Evita programar cada cinco minutos una consulta que revisa meses de datos. La
ventana temporal y la frecuencia deben ser coherentes:

```spl
index=curso status>=400 earliest=-60m latest=now
| stats count as errores by host, uri
| sort - errores
```

Para informes diarios, considera una ventana cerrada como `earliest=-24h
latest=-1h` si quieres evitar que los últimos minutos todavía estén llegando.
Documenta la decisión para que el lector entienda posibles diferencias.

## Compartir y proteger un reporte

Desde **Settings > Searches, reports, and alerts** puedes revisar el propietario,
la aplicación y los permisos del reporte. Como administrador, comprueba:

- quién puede leerlo;
- quién puede modificarlo o eliminarlo;
- qué índices y campos expone;
- si el contexto de la aplicación es el correcto;
- si todos los destinatarios pueden ejecutar la búsqueda;
- si un lookup o una extracción depende de permisos adicionales.

No compartas todos los reportes con `Everyone` por comodidad. Publica el
resultado en el ámbito mínimo necesario y prueba el acceso con el rol real del
usuario final.

## Validación antes de distribuirlo

Antes de enviar o publicar un reporte:

1. Ejecuta la SPL con un rango conocido.
2. Confirma el total de eventos y el periodo cubierto.
3. Compara una muestra de eventos con el resumen.
4. Revisa valores nulos, duplicados y campos ausentes.
5. Comprueba la zona horaria.
6. Revisa Job Inspector si la consulta es costosa.
7. Verifica la visualización en escritorio y en la interfaz que usará el grupo.
8. Prueba los permisos con un usuario no administrador.

Consulta de control:

```spl
index=curso
| stats count as total earliest(_time) as primer_evento latest(_time) as ultimo_evento
```

Si el reporte muestra cero resultados, no concluyas que no hay actividad hasta
revisar el rango temporal, el índice, los permisos y la extracción de campos.

## Exportación y distribución

Según la configuración de Splunk, los resultados pueden exportarse o enviarse
en formatos como CSV, JSON, XML o PDF. Antes de distribuir una exportación:

- comprueba que no contiene campos sensibles;
- confirma que el intervalo temporal aparece en el nombre o en la descripción;
- verifica que el formato conserva la información necesaria;
- evita enviar datos a destinatarios que no tienen autorización;
- documenta si el archivo representa una fotografía puntual o un histórico.

Una exportación no reemplaza el reporte original: puede quedar desactualizada y
perder el contexto de la consulta que la generó.

## Reportes y rendimiento

Un reporte programado puede ejecutarse muchas veces y afectar a los recursos de
la instancia. Aplica estas medidas:

- indica siempre `index` y un rango temporal;
- filtra antes de agregar;
- evita `index=*` y campos innecesarios;
- limita las filas con `head` cuando la pregunta lo permita;
- revisa `join`, `transaction`, subbúsquedas y expresiones regulares;
- utiliza una consulta agregada para gráficos en lugar de exportar eventos
	completos;
- revisa el Job Inspector antes de aumentar la frecuencia.

## Errores habituales

| Síntoma | Causa posible | Comprobación |
|---|---|---|
| El reporte aparece vacío | Rango temporal, índice o permisos incorrectos. | Ejecutar la SPL con rango explícito. |
| Los números cambian entre ejecuciones | Rango relativo o datos que llegan tarde. | Documentar ventana y zona horaria. |
| El gráfico no representa la pregunta | Visualización o agrupación incorrecta. | Comparar con una tabla `stats`. |
| El reporte tarda demasiado | Consulta amplia o planificación excesiva. | Revisar Job Inspector y reducir volumen. |
| Un usuario no puede abrirlo | Objeto privado o aplicación incorrecta. | Revisar permisos y contexto. |
| La exportación contiene datos sensibles | Campos o audiencia no revisados. | Limitar campos y destinatarios. |
| El total no coincide con los eventos | Filtros, duplicados o tiempo distintos. | Ejecutar consulta de control. |

## Buenas prácticas para administradores

- Define una pregunta y una audiencia antes de crear el reporte.
- Usa nombres, descripciones y rangos temporales explícitos.
- Elige tabla, indicador o gráfico según la decisión que deba facilitar.
- Valida los resultados con una consulta independiente.
- Revisa permisos, aplicación, propietario y dependencias.
- Programa una frecuencia proporcional al volumen y a la urgencia.
- Revisa el coste antes de publicar o aumentar la frecuencia.
- Retira reportes duplicados, obsoletos o sin propietario claro.

## Referencias oficiales

- [Crear y gestionar reportes](https://docs.splunk.com/Documentation/Splunk/latest/Report/ManageReports)
- [Guardar búsquedas como reportes](https://docs.splunk.com/Documentation/Splunk/latest/Search/Saveandrecallsearches)
- [Visualizaciones en Splunk Web](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutvisualizations)
- [Permisos de objetos de conocimiento](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Knowledgeobjectpermissions)
- [Job Inspector](https://docs.splunk.com/Documentation/Splunk/latest/Search/JobInspector)
- [Buenas prácticas de búsquedas](https://docs.splunk.com/Documentation/Splunk/latest/Search/Writebetterqueries)

## Siguiente paso

Cuando puedas crear un reporte reproducible y elegir su visualización,
continúa con [Visualizaciones](03-visualizaciones.md) para profundizar en cómo
comunicar tendencias, comparaciones y excepciones.
