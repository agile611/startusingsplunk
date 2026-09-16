# 6. Alertas

Las alertas permiten detectar una condición relevante y ejecutar una acción,
como enviar una notificación, registrar un resultado o iniciar una respuesta
operativa. Una alerta no es simplemente una búsqueda que devuelve resultados:
debe definir qué se considera importante, con qué frecuencia se comprueba y
qué debe hacer el equipo cuando se dispara.

Una alerta mal diseñada produce ruido, notificaciones repetidas y pérdida de
confianza. Una alerta útil es específica, reproducible, accionable y tiene un
responsable claro.

## Diseñar una alerta antes de crearla

Define estas preguntas:

- ¿Qué condición indica un problema?
- ¿En qué índice y periodo se buscará?
- ¿Cuántas veces puede dispararse?
- ¿Quién debe recibir la notificación?
- ¿Qué información necesita esa persona para investigar?
- ¿Qué ocurre si no hay resultados o si el servicio de notificación falla?

Para el laboratorio web, una condición sencilla puede ser: “hay una o más
respuestas HTTP `4xx` o `5xx` durante los últimos cinco minutos”.

## Ejemplo: alerta de errores HTTP

Consulta para una comprobación programada:

```spl
index=curso status>=400 earliest=-5m latest=now
| stats count as errores by host, uri
| where errores > 0
| sort - errores
```

La búsqueda devuelve filas solo cuando existen errores. En la configuración de
la alerta, la condición puede ser **número de resultados mayor que 0**.

Para obtener un único resultado con contexto resumido:

```spl
index=curso status>=400 earliest=-5m latest=now
| stats count as errores dc(host) as hosts_afectados values(uri) as uris
| where errores > 0
```

Esta segunda forma es útil para una notificación breve, pero controla el tamaño
de `values(uri)` si la fuente tiene muchas URI distintas.

En el CSV histórico del curso, `earliest=-5m` solo funcionará si el reloj actual
está cerca de la fecha de los eventos. Para probar la lógica con esos datos,
utiliza primero un intervalo absoluto:

```spl
index=curso status>=400 earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| stats count as errores by host, uri
| where errores > 0
```

Después, para una alerta operativa sobre datos que llegan continuamente, vuelve
a una ventana relativa y documenta la frecuencia de ejecución.

## Alertas programadas y en tiempo real

### Alerta programada

Splunk ejecuta la búsqueda según una frecuencia, por ejemplo cada cinco
minutos. Es adecuada para métricas, errores y condiciones agregadas.

La ventana de búsqueda debe coordinarse con la frecuencia. Si se ejecuta cada
cinco minutos, una ventana de cinco minutos reduce solapamientos; una ventana
mayor puede ser válida si está diseñada para detectar tendencias, pero aumenta
el riesgo de notificar repetidamente el mismo evento.

### Alerta en tiempo real

Evalúa los eventos mientras llegan y puede reaccionar con rapidez. No siempre
es necesaria y puede consumir más recursos. Utilízala solo cuando la latencia
de detección justifique su coste y la condición no pueda resolverse bien con una
búsqueda programada.

Para datos históricos de un CSV, una alerta en tiempo real no es adecuada. Usa
una búsqueda histórica para validar la SPL y una alerta programada solo cuando
exista una fuente continua.

## Condición de disparo

Al configurar una alerta, el disparador debe corresponder al resultado de la
búsqueda:

- **Número de resultados mayor que 0**: útil cuando la SPL devuelve solo las
	condiciones incumplidas.
- **Umbral numérico**: útil para total de errores, porcentaje o volumen.
- **Expresión sobre un campo**: útil cuando la búsqueda devuelve una métrica
	como `porcentaje_error`.

Ejemplo de umbral de porcentaje:

```spl
index=curso earliest=-5m latest=now
| stats count as total count(eval(status>=400)) as errores
| eval porcentaje_error=if(total=0, 0, round(errores * 100 / total, 2))
| where porcentaje_error >= 5
```

El umbral debe tener sentido con el volumen. Un 100% de error sobre un único
evento no tiene la misma relevancia que un 5% sobre miles de peticiones.

## Configurar una alerta desde Splunk Web

El flujo general es:

1. Validar la búsqueda en **Search & Reporting**.
2. Seleccionar **Save As > Alert**.
3. Definir nombre, descripción y aplicación.
4. Elegir ejecución programada o en tiempo real.
5. Configurar el intervalo y el rango temporal.
6. Definir la condición de disparo.
7. Configurar acciones y destinatarios.
8. Definir supresión o throttling si procede.
9. Guardar, probar y documentar el resultado.

Un nombre descriptivo puede ser:

```text
Curso - Errores HTTP en los últimos 5 minutos
```

La descripción debe indicar índice, condición, ventana, umbral, responsable y
acción esperada.

## Acciones

Una alerta puede ejecutar acciones como:

- enviar un correo;
- registrar o mostrar el resultado;
- llamar a un webhook si la integración está aprobada;
- ejecutar una acción de respuesta disponible en la instalación.

La acción debe contener suficiente contexto para iniciar la investigación:

- nombre de la alerta;
- momento del disparo;
- índice y ventana temporal;
- total o porcentaje observado;
- host, URI o código afectado;
- enlace o referencia a la búsqueda.

No envíes `_raw` completo a todos los destinatarios por defecto. Puede contener
datos sensibles y generar mensajes demasiado grandes. Envía un resumen y deja
el detalle en Splunk con permisos adecuados.

## Evitar ruido y duplicados

El throttling o la supresión evita repetir la misma notificación durante un
periodo. Úsalo cuando varias ejecuciones puedan detectar la misma incidencia.

Antes de activarlo, define:

- qué campo identifica la misma condición, por ejemplo `host` o `uri`;
- cuánto tiempo debe durar la supresión;
- cuándo debe volver a notificarse;
- cómo se sabrá que el problema se ha resuelto.

No suprimas alertas críticas durante tanto tiempo que ocultes una recuperación y
una nueva caída. Prueba el comportamiento con eventos consecutivos.

## Probar una alerta sin causar notificaciones

Antes de publicarla:

1. Ejecuta la SPL manualmente con un intervalo que contenga datos.
2. Comprueba que dispara cuando debe.
3. Prueba un intervalo sin errores.
4. Verifica que no dispara cuando la condición no se cumple.
5. Revisa el contenido de la acción con un destinatario de prueba.
6. Comprueba permisos y aplicación con el usuario responsable.
7. Documenta la hora, la condición y el resultado de la prueba.

Para el CSV mínimo, la búsqueda con intervalo absoluto debe encontrar el evento
`404`. Esto permite comprobar la lógica sin esperar a que llegue tráfico real.

## Permisos y seguridad

Una alerta puede exponer datos o ejecutar acciones. Como administrador, revisa:

- propietario y aplicación del objeto;
- roles que pueden verla, modificarla o eliminarla;
- permisos sobre el índice y los campos consultados;
- destinatarios y canales externos;
- credenciales o secretos de integraciones;
- permisos de ejecución de acciones.

El hecho de que una alerta funcione como `admin` no garantiza que el usuario
responsable pueda modificarla o consultar sus resultados. Concede el mínimo
necesario y prueba con el rol real.

## Rendimiento de alertas

Las alertas se ejecutan repetidamente, por lo que una búsqueda aceptable una
vez puede ser costosa si se ejecuta cada minuto. Aplica estas prácticas:

- indica el índice;
- utiliza una ventana temporal ajustada;
- filtra antes de agregar;
- evita `index=*`;
- evita `join`, `transaction` y `rex` sobre `_raw` si no son necesarios;
- limita campos y valores de salida;
- revisa Job Inspector;
- coordina frecuencia y ventana temporal.

Una alerta que tarda más que su intervalo de ejecución puede solaparse y generar
resultados o notificaciones inesperadas.

## Diagnóstico de alertas que no funcionan

| Síntoma | Causa posible | Comprobación |
|---|---|---|
| Nunca se dispara | Tiempo, índice, condición o permisos incorrectos. | Ejecutar la SPL manualmente con datos conocidos. |
| Se dispara continuamente | Ventana solapada o condición demasiado amplia. | Revisar frecuencia, rango y throttling. |
| El correo no llega | Acción, destinatario o configuración de correo. | Probar una acción de prueba y revisar registros. |
| La alerta funciona para Admin pero no para otro usuario | Permisos del objeto o del índice. | Probar con el rol responsable. |
| El mensaje no permite investigar | Falta contexto en la acción. | Añadir métrica, host, URI, tiempo y enlace. |
| Tarda demasiado | Consulta amplia o comando costoso. | Revisar Job Inspector y reducir datos. |
| Repite la misma incidencia | Falta supresión o clave de throttling. | Configurar y probar la ventana de supresión. |

## Buenas prácticas

- Crea alertas solo para condiciones accionables.
- Define índice, tiempo, umbral y responsable.
- Prueba disparo y no disparo antes de publicar.
- Coordina frecuencia, ventana temporal y supresión.
- Incluye contexto suficiente, pero limita datos sensibles.
- Revisa permisos de lectura, modificación y acciones.
- Mide el coste de la búsqueda antes de ejecutarla frecuentemente.
- Documenta qué significa una alerta activa y cómo se cierra.
- Revisa periódicamente alertas obsoletas o con demasiado ruido.

## Referencias oficiales

- [Alertas en Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Crear alertas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Definescheduledalerts)
- [Alertas en tiempo real](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Configuringreal-timealerts)
- [Acciones de alerta](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Emailnotification)
- [Throttling de alertas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/ThrottleAlerts)
- [Permisos de objetos de conocimiento](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Knowledgeobjectpermissions)
- [Job Inspector](https://docs.splunk.com/Documentation/Splunk/latest/Search/JobInspector)

## Siguiente paso

Cuando puedas crear y probar una alerta con una condición clara, continúa con
[Administración y seguridad](07-seguridad.md) para revisar permisos, roles y
responsabilidades de los objetos que acabas de publicar.
