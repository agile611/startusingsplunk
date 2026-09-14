# Sesión 2: búsquedas y lenguaje SPL

Esta sesión está dedicada al lenguaje **SPL**, utilizado para buscar,
filtrar, transformar y analizar los eventos almacenados en Splunk.

## Objetivos

- Comprender la estructura de una consulta SPL.
- Filtrar eventos por campos y tiempo.
- Presentar y ordenar resultados.
- Generar estadísticas.
- Crear campos calculados.
- Extraer nuevos campos.
- Aplicar buenas prácticas de rendimiento.

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
| stats count as errores by client_ip
| sort - errores
| head 10
```

## Resultado esperado

Al finalizar la sesión podrás convertir eventos sin procesar en
información útil para operaciones, seguridad y monitorización.
