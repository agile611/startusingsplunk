# Sesión 2: búsquedas y lenguaje SPL

Esta sesión está dedicada al lenguaje **SPL**, utilizado para buscar,
filtrar, transformar y analizar los eventos almacenados en Splunk.

El enfoque es práctico y está pensado para asistentes que ya disponen de una
instancia de **Splunk Enterprise** y permisos de administración. Trabajarás con
el índice `curso` y aprenderás a pasar de una pregunta operativa a una búsqueda
reproducible, validada y suficientemente eficiente.

La sesión sigue este flujo:

```text
Índice y tiempo -> campos -> filtros -> estadísticas -> transformación -> validación
```

No des por correcto un resultado solo porque Splunk devuelve una tabla. Debes
poder explicar de dónde proceden los eventos, qué rango temporal has usado, qué
campos intervienen y qué limitaciones tiene la conclusión.

## Objetivos

- Comprender la estructura de una consulta SPL.
- Filtrar eventos por campos y tiempo.
- Presentar y ordenar resultados.
- Generar estadísticas.
- Crear campos calculados.
- Extraer nuevos campos.
- Aplicar buenas prácticas de rendimiento.
- Diagnosticar problemas de tiempo, campos, permisos e ingesta.
- Documentar búsquedas para que otros usuarios puedan reproducirlas.

## Antes de empezar

Comprueba que:

- Splunk Enterprise está iniciado y Splunk Web responde.
- Puedes acceder con tu cuenta administrativa.
- El índice `curso` existe y es visible para tu usuario.
- El dataset `eventos_web.csv` está cargado.
- Conoces el rango temporal real de los eventos.

Si una búsqueda devuelve cero resultados, empieza por [Gestión del
tiempo](03-gestion-tiempo.md) y [Datos del laboratorio](../preparacion/datos-laboratorio.md).
No amplíes la consulta al azar ni reinstales Splunk antes de revisar índice,
tiempo, fuente, `sourcetype` y permisos.

## Contenidos

1. [Introducción a SPL](01-introduccion-spl.md)
2. [Búsquedas básicas](02-busquedas-basicas.md)
3. [Gestión del tiempo](03-gestion-tiempo.md)
4. [Campos y resultados](04-campos-resultados.md)
5. [Filtrado de eventos](05-filtrado.md)
6. [Estadísticas](06-estadisticas.md)
7. [`eval` y funciones](07-eval-funciones.md)
8. [Extracción de campos](08-extraccion-campos.md)
9. [Comandos avanzados](09-comandos-avanzados.md)
10. [Rendimiento](10-rendimiento.md)
11. [Laboratorios](11-laboratorios.md)
12. [Reto práctico](12-reto.md)

## Consulta de ejemplo

```spl
index=curso status>=400
| stats count as errores by host, uri
| sort - errores
| head 10
```

Esta consulta utiliza campos presentes en el dataset del curso. Si trabajas con
otra fuente que sí tenga `client_ip`, puedes sustituir `host` por ese campo,
pero primero debes confirmar que existe y está correctamente extraído.

## Ruta recomendada

1. Lee la [Introducción a SPL](01-introduccion-spl.md) para entender la
	 estructura de una búsqueda.
2. Practica la sintaxis en [Búsquedas básicas](02-busquedas-basicas.md).
3. Fija rangos reproducibles en [Gestión del tiempo](03-gestion-tiempo.md).
4. Valida los campos en [Campos y resultados](04-campos-resultados.md).
5. Acota eventos con [Filtrado de eventos](05-filtrado.md).
6. Resume resultados en [Estadísticas](06-estadisticas.md).
7. Crea campos calculados con [`eval` y funciones](07-eval-funciones.md).
8. Aprende a extraer datos en [Extracción de campos](08-extraccion-campos.md).
9. Combina resultados con [Comandos avanzados](09-comandos-avanzados.md).
10. Comprueba el coste en [Rendimiento](10-rendimiento.md).
11. Consolida lo aprendido en [Laboratorios](11-laboratorios.md).
12. Resuelve el [Reto práctico](12-reto.md).

## Checklist de finalización

Al terminar la sesión deberías poder:

- indicar el índice y el rango temporal de una búsqueda;
- confirmar que `_time`, `host`, `source` y `sourcetype` son coherentes;
- filtrar por `status`, `method` y `uri`;
- generar totales, errores, porcentajes y agrupaciones;
- crear una clasificación con `eval`;
- probar una extracción temporal con `rex`;
- elegir entre `stats`, `eventstats`, `lookup`, `join` y `transaction` con
	criterio;
- optimizar una consulta sin cambiar el significado del resultado;
- explicar qué comprobarías si el usuario no ve datos.

## Resultado esperado

Al finalizar la sesión podrás convertir eventos sin procesar en información
útil para operaciones, seguridad y monitorización. También podrás justificar
la calidad de una métrica, reproducir una búsqueda y separar un problema de
SPL de un problema de ingesta, tiempo, campos o permisos.

## Referencias oficiales

- [Search Manual de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Search/WhatsInThisManual)
- [Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Overview)
- [Referencia de SPL](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)
- [Buenas prácticas para escribir búsquedas](https://docs.splunk.com/Documentation/Splunk/latest/Search/Writebetterqueries)
- [Job Inspector](https://docs.splunk.com/Documentation/Splunk/latest/Search/JobInspector)
