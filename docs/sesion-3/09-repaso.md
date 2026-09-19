# 9. Repaso

Este repaso comprueba que puedes convertir búsquedas SPL en componentes
reutilizables de operación: búsquedas guardadas, reportes, visualizaciones,
dashboards, tokens y alertas. El objetivo no es recordar dónde está cada botón,
sino poder justificar una solución y diagnosticarla cuando deje de funcionar.

## Modelo operativo de la sesión

El flujo completo es:

```text
Pregunta -> SPL validada -> resultado -> visualización -> publicación -> revisión
```

En cada etapa debes poder responder:

- ¿qué índice y rango temporal se están consultando?
- ¿qué campos sostienen el resultado?
- ¿qué significa la métrica?
- ¿quién puede ver o modificar el objeto?
- ¿qué ocurre si no hay datos?
- ¿cuánto cuesta ejecutar la búsqueda?

## Qué debe saber hacer un asistente

### Búsquedas guardadas

Debes poder crear una búsqueda con nombre, descripción, índice, tiempo y
permisos claros. Antes de compartirla, valida que funciona para el rol final y
que no depende de campos, lookups o aplicaciones privadas.

### Reportes

Debes poder convertir una búsqueda en una salida periódica y elegir entre tabla,
indicador o gráfico según la pregunta. Un reporte debe explicar su audiencia,
frecuencia, rango temporal y acción esperada.

### Visualizaciones

Debes poder distinguir entre:

- un indicador para una cifra principal;
- una tabla para investigar elementos concretos;
- barras para comparar categorías;
- una serie temporal para observar evolución.

Primero valida la tabla de resultados y después configura el gráfico.

### Dashboards

Debes poder organizar un dashboard con una secuencia de resumen, evolución,
distribución y detalle. Cada panel debe responder a una pregunta y compartir el
mismo contexto temporal cuando los resultados deban compararse.

### Tokens

Debes poder conectar un selector temporal, un host o un código HTTP con los
paneles. También debes saber definir valores iniciales, estados vacíos y
limpiar selecciones antiguas.

Un token modifica una consulta; no concede permisos. La autorización siempre se
controla con roles, índices y permisos de objetos.

### Alertas

Debes poder definir una condición accionable, una frecuencia, una ventana
temporal, una acción y un responsable. Prueba tanto el disparo como el caso sin
disparo y configura throttling si una misma incidencia puede repetirse.

### Seguridad

Debes poder explicar la diferencia entre propietario, aplicación, lectura,
escritura y permisos sobre índices. Que un objeto funcione para `admin` no
demuestra que esté publicado correctamente.

## Checklist de validación

Antes de dar por terminada la sesión, comprueba:

- [ ] El índice `curso` contiene eventos.
- [ ] El rango temporal coincide con los datos.
- [ ] `_time`, `host`, `source` y `sourcetype` son coherentes.
- [ ] Las búsquedas tienen nombres y descripciones útiles.
- [ ] Los reportes muestran una métrica con unidad y periodo.
- [ ] Las visualizaciones corresponden a la pregunta.
- [ ] El dashboard tiene paneles de resumen, evolución y detalle.
- [ ] Los tokens tienen valores iniciales y estados vacíos definidos.
- [ ] La alerta tiene condición, frecuencia, acción y responsable.
- [ ] Los permisos se han probado con un usuario no administrador.
- [ ] Job Inspector no muestra un coste injustificado.
- [ ] Las conclusiones están limitadas a lo que los datos permiten afirmar.

## Prueba práctica de cinco minutos

Ejecuta estas consultas y explica el resultado:

### 1. ¿Cuántos eventos hay?

```spl
index=curso
| stats count as total
```

### 2. ¿Cuántos errores hay por URI?

```spl
index=curso status>=400
| stats count as errores by uri
| sort - errores
```

### 3. ¿Cuándo ocurrieron?

```spl
index=curso
| timechart span=1m count by status
```

### 4. ¿Qué usuario puede ver los resultados?

Comprueba el rol, los índices permitidos y los permisos del objeto, no solo la
apariencia del dashboard.

### 5. ¿Qué harías si no hay resultados?

Sigue este orden:

1. índice;
2. rango temporal;
3. `_time`;
4. `source` y `sourcetype`;
5. campos y filtros;
6. permisos;
7. rendimiento y dependencias.

## Preguntas de autoevaluación

1. ¿Qué diferencia hay entre una búsqueda guardada y un reporte?
2. ¿Por qué una tabla debe validarse antes de crear un gráfico?
3. ¿Qué ocurre si un token está vacío?
4. ¿Por qué un token no es un mecanismo de seguridad?
5. ¿Qué diferencia hay entre una alerta programada y una en tiempo real?
6. ¿Qué datos necesitas para justificar un porcentaje de errores?
7. ¿Por qué una búsqueda que funciona como `admin` puede fallar para otro rol?
8. ¿Qué revisarías en Job Inspector si un panel tarda demasiado?
9. ¿Cuándo usarías `stats` en lugar de `transaction`?
10. ¿Qué campos faltan en el CSV del curso para medir IP de cliente o latencia?

## Limitaciones del dataset del curso

El CSV de referencia contiene `timestamp`, `host`, `method`, `status` y `uri`.
No contiene necesariamente:

- `client_ip`;
- duración o tiempo de respuesta;
- usuario autenticado;
- identificador de sesión;
- mensaje de error detallado.

Por tanto, no debes afirmar que puedes medir IP con más actividad, URL más
lentas o tiempo medio de respuesta si esos campos no existen. Debes indicar la
limitación y explicar qué campo o fuente adicional necesitarías.

Esta comprobación es parte de la competencia operativa: una métrica no es válida
solo porque sea fácil de dibujar.

## Criterios para pasar al proyecto final

Estás preparado para el [proyecto final](../proyecto/index.md) si puedes:

- construir una búsqueda reproducible;
- convertirla en reporte o panel con una finalidad concreta;
- añadir un filtro sin romper la consulta;
- crear una alerta que no genere ruido innecesario;
- revisar permisos con un rol distinto de `admin`;
- medir y justificar el rendimiento;
- documentar resultados, limitaciones y decisiones.

## Errores habituales en la evaluación

| Problema | Qué indica | Corrección |
|---|---|---|
| Se entrega solo una captura | No se puede reproducir el resultado. | Añadir SPL, índice y rango. |
| El gráfico es correcto pero responde otra pregunta | Falta de definición de la métrica. | Explicar objetivo y unidad. |
| La alerta se dispara constantemente | Ventana o condición mal diseñadas. | Revisar frecuencia y throttling. |
| Solo funciona con `admin` | Permisos no validados. | Probar con el rol final. |
| Se afirma una métrica ausente | Se ignoraron las limitaciones del dataset. | Documentar campos disponibles. |
| Dashboard lento | Consultas no optimizadas o demasiados paneles. | Revisar Job Inspector. |

## Referencias oficiales

- [Objetos de conocimiento](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)
- [Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/AboutDashboards)
- [Tokens](https://docs.splunk.com/Documentation/Splunk/latest/Viz/tokens)
- [Alertas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Roles y capacidades](https://docs.splunk.com/Documentation/Splunk/latest/Security/Rolesandcapabilities)
- [Job Inspector](https://docs.splunk.com/Documentation/Splunk/latest/Search/JobInspector)
- [Buenas prácticas de búsquedas](https://docs.splunk.com/Documentation/Splunk/latest/Search/Writebetterqueries)