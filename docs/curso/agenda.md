# Agenda del curso

El curso se desarrolla en **tres sesiones de seis horas** y sigue un recorrido
práctico sobre una instancia mononodo de **Splunk Enterprise 10.0.1** instalada
manualmente en **Ubuntu 24.04.5 LTS**.

## Sesión 1: fundamentos, instalación e ingestión

| Bloque | Duración |
|---|---:|
| Presentación e introducción a Splunk | 45 minutos |
| Conceptos fundamentales | 45 minutos |
| Arquitectura y componentes | 60 minutos |
| Instalación en Ubuntu | 90 minutos |
| Navegación por Splunk Web | 30 minutos |
| Ingesta de datos e índices | 60 minutos |
| Laboratorio y repaso | 30 minutos |

### Resultados de aprendizaje

Al terminar la sesión podrás:

- Explicar qué es un evento en Splunk.
- Identificar los principales componentes.
- Instalar e iniciar Splunk Enterprise.
- Acceder a Splunk Web.
- Crear un índice.
- Incorporar un archivo CSV.
- Validar los datos indexados.

La instalación se realiza con el paquete `.deb`, se verifica la versión y se
comprueba el acceso a Splunk Web en el puerto `8000`. Los datos de prácticas se
organizan en el índice `curso`.

## Sesión 2: búsquedas y lenguaje SPL

| Bloque | Duración |
|---|---:|
| Introducción a SPL | 45 minutos |
| Búsquedas y filtros | 60 minutos |
| Gestión del tiempo y campos | 45 minutos |
| Estadísticas y agregaciones | 75 minutos |
| `eval`, funciones y extracciones | 75 minutos |
| Rendimiento y buenas prácticas | 30 minutos |
| Laboratorio y reto | 30 minutos |

### Resultados de aprendizaje

Al terminar la sesión podrás:

- Buscar eventos por índice y campo.
- Utilizar operadores booleanos.
- Filtrar y ordenar resultados.
- Crear estadísticas.
- Generar series temporales.
- Calcular campos mediante `eval`.
- Extraer campos mediante `rex`.
- Optimizar búsquedas básicas.

Las búsquedas se ejecutan inicialmente sobre `index=curso` y se validan
utilizando los campos y timestamps reconocidos durante la ingesta.

## Sesión 3: reportes, dashboards y alertas

| Bloque | Duración |
|---|---:|
| Búsquedas guardadas y reportes | 60 minutos |
| Visualizaciones | 45 minutos |
| Dashboards | 75 minutos |
| Filtros y tokens | 45 minutos |
| Alertas | 60 minutos |
| Proyecto final | 60 minutos |
| Evaluación y cierre | 15 minutos |

### Resultados de aprendizaje

Al terminar la sesión podrás:

- Guardar y compartir búsquedas.
- Crear reportes.
- Seleccionar visualizaciones adecuadas.
- Construir dashboards.
- Añadir filtros interactivos.
- Configurar alertas.
- Presentar una solución de monitorización.

El resultado final combina una búsqueda, una visualización o dashboard y una
alerta justificadas a partir de los datos de laboratorio.

## Secuencia de trabajo

Cada sesión conecta con la siguiente:

1. **Sesión 1:** preparar Ubuntu, instalar Splunk, ingerir datos y validar el
   índice `curso`.
2. **Sesión 2:** buscar y transformar esos eventos mediante SPL.
3. **Sesión 3:** convertir las búsquedas en reportes, dashboards y alertas.

La distribución temporal es orientativa. Las comprobaciones de instalación y
la validación de datos tienen prioridad sobre avanzar a un bloque posterior.
