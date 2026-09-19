# 1. Búsquedas guardadas

Las búsquedas guardadas son objetos de conocimiento que almacenan una consulta
SPL para poder reutilizarla, compartirla o convertirla posteriormente en un
reporte, un panel o una alerta.

Guardar una búsqueda no la convierte automáticamente en una métrica fiable.
Antes de compartirla debes comprobar el índice, el intervalo temporal, los
campos, los permisos y el coste de ejecución. Una consulta útil para el
administrador debe ser reproducible por otro usuario y tener un objetivo claro.

## Cuándo guardar una búsqueda

Guarda una búsqueda cuando:

- responde a una pregunta operativa frecuente;
- utiliza un filtro y un conjunto de campos bien definidos;
- puede ser reutilizada por otras personas o componentes;
- tiene un intervalo temporal documentado;
- se ha validado con eventos reales;
- su tiempo de ejecución es razonable.

No guardes una búsqueda solo para conservar una prueba provisional. Durante la
investigación puedes trabajar en **Search**, validar el resultado y guardarla
cuando conozcas su finalidad.

## Ejemplo práctico del laboratorio

Esta búsqueda localiza las URI con más respuestas HTTP de error:

```spl
index=curso status>=400
| stats count as errores by host, uri
| sort - errores
| head 10
```

Antes de guardarla, comprueba:

1. Que el índice `curso` contiene eventos.
2. Que `status`, `host` y `uri` están extraídos.
3. Que el rango temporal seleccionado contiene la fecha de los datos.
4. Que los errores están definidos como `status>=400` para este caso.
5. Que el resultado no necesita campos que se hayan eliminado en `stats`.

Para hacerla reproducible sobre el CSV del curso, puedes fijar el tiempo:

```spl
index=curso status>=400 earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| stats count as errores by host, uri
| sort - errores
| head 10
```

En una monitorización diaria suele ser más adecuado usar un rango relativo,
como `earliest=-15m latest=now`, siempre que la frecuencia de ejecución y el
objetivo estén documentados.

## Crear y guardar desde Splunk Web

El flujo habitual es:

1. Abrir **Search & Reporting**.
2. Escribir y ejecutar la consulta.
3. Seleccionar **Save As > Saved search**.
4. Introducir un nombre descriptivo.
5. Añadir una descripción con objetivo, índice y tiempo.
6. Elegir la aplicación y el ámbito de uso.
7. Configurar permisos de lectura y escritura.
8. Guardar y probar la búsqueda desde el listado de búsquedas guardadas.

Los nombres deben permitir identificar la finalidad sin abrir la SPL. Por
ejemplo:

```text
Curso - Errores HTTP por URI
```

Evita nombres genéricos como `Prueba 1` o `Búsqueda nueva`, especialmente si
el objeto se va a compartir con otros asistentes.

## Tiempo de una búsqueda guardada

El tiempo puede proceder del selector de Splunk Web o de modificadores SPL. Una
búsqueda guardada debe dejar claro cuál de estas opciones utiliza:

```spl
earliest=-15m latest=now
```

```spl
earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
```

El primer caso es apropiado para monitorización relativa. El segundo facilita
la reproducción de una práctica o de una investigación histórica.

Si una búsqueda devuelve cero resultados a otro usuario, comprueba primero el
selector temporal y el contexto de la aplicación. Muchas diferencias entre
usuarios no son errores de SPL, sino rangos de tiempo distintos.

## Propietario, aplicación y permisos

Una búsqueda guardada es un objeto administrable. Sus propiedades principales
son:

- **Propietario**: usuario que la creó o gestiona.
- **Aplicación**: contexto donde se publica y se utiliza.
- **Permisos**: usuarios o roles que pueden verla o modificarla.
- **SPL**: lógica de la búsqueda.
- **Programación**: si se ejecuta automáticamente.

Desde **Settings > Searches, reports, and alerts** puedes revisar estos objetos
y su configuración. Como administrador, no compartas automáticamente todos los
objetos con `Everyone`. Concede el acceso mínimo necesario y verifica la
visibilidad con el rol real de los asistentes.

Una búsqueda compartida puede exponer información sensible aunque la SPL no
contenga credenciales. Revisa el índice consultado, los campos mostrados y la
aplicación donde se publica.

## Búsqueda guardada, reporte, dashboard y alerta

Estos conceptos están relacionados, pero no son equivalentes:

| Objeto | Finalidad |
|---|---|
| Búsqueda guardada | Reutilizar una consulta SPL. |
| Reporte | Presentar resultados, normalmente con una visualización o tabla. |
| Dashboard | Organizar varios paneles y controles en una vista. |
| Alerta | Ejecutar una condición y producir una acción o notificación. |

La misma SPL puede servir como base para varios objetos, pero cada uso necesita
su propio tiempo, permisos y validación. Una consulta exploratoria no debería
publicarse directamente como alerta sin revisar duplicados, frecuencia y
condición de disparo.

## Validar una búsqueda antes de compartirla

Usa esta lista:

1. Ejecuta la consulta con un intervalo pequeño.
2. Comprueba que el índice está indicado.
3. Confirma que los campos utilizados existen.
4. Revisa el primer y el último evento del rango.
5. Comprueba que los nombres de salida son comprensibles.
6. Revisa el número de eventos y filas devueltos.
7. Abre **Job Inspector** para valorar el coste.
8. Prueba la búsqueda con el rol que la utilizará.
9. Documenta el resultado esperado y las limitaciones.

Para validar el rango y el volumen:

```spl
index=curso
| stats count as total earliest(_time) as primer_evento latest(_time) as ultimo_evento
```

Para validar los campos principales:

```spl
index=curso
| stats count by host, status, uri
| sort - count
```

## Errores habituales

| Síntoma | Causa posible | Comprobación |
|---|---|---|
| La búsqueda guardada no muestra datos | Tiempo, índice o permisos incorrectos. | Ejecutar la SPL con rango explícito. |
| Funciona para Admin pero no para otro usuario | Objeto privado o índice no autorizado. | Revisar permisos y rol. |
| El resultado cambia cada vez | Rango relativo o datos nuevos. | Documentar el tiempo de ejecución. |
| El nombre no describe la consulta | Objeto creado sin criterio de nomenclatura. | Renombrar y añadir descripción. |
| El dashboard tarda demasiado | SPL amplia o búsqueda repetida muchas veces. | Revisar Job Inspector y rendimiento. |
| Se comparte información que no corresponde | Permisos demasiado amplios o campos sensibles. | Revisar aplicación, roles y salida. |
| La búsqueda deja de funcionar tras cambiar la fuente | Campo o `sourcetype` modificados. | Validar extracción y metadatos. |

## Buenas prácticas para administradores

- Usa nombres descriptivos y descripciones completas.
- Indica índice y tiempo siempre que la búsqueda se comparta.
- Mantén una versión sencilla y validada antes de añadir comandos avanzados.
- Evita publicar búsquedas costosas sin revisar Job Inspector.
- Separa objetos de pruebas, formación y operación real.
- Concede permisos según roles y necesidad de uso.
- Revisa periódicamente propietarios y búsquedas que ya no se utilizan.
- Documenta dependencias como lookups, campos calculados o aplicaciones.
- No confundas guardar una búsqueda con corregir la ingesta de datos.

## Referencias oficiales

- [Búsquedas guardadas y objetos de conocimiento](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)
- [Gestionar búsquedas, informes y alertas](https://docs.splunk.com/Documentation/Splunk/latest/Report/ManageReports)
- [Crear búsquedas guardadas](https://docs.splunk.com/Documentation/Splunk/latest/Search/Saveandrecallsearches)
- [Permisos de objetos de conocimiento](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Knowledgeobjectpermissions)
- [Job Inspector](https://docs.splunk.com/Documentation/Splunk/latest/Search/JobInspector)
- [Buenas prácticas de búsquedas](https://docs.splunk.com/Documentation/Splunk/latest/Search/Writebetterqueries)