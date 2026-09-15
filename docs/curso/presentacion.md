# Presentación

Este curso es una introducción práctica a **Splunk Enterprise** para aprender a
recibir, indexar, buscar y analizar datos de máquina. El recorrido combina
explicaciones breves con ejercicios realizados sobre una instancia local para
que cada concepto se pueda comprobar inmediatamente.

El entorno de referencia del curso es una instalación manual de **Splunk
Enterprise 10.0.1** sobre **Ubuntu 24.04.5 LTS**. La instancia se ejecuta como
un laboratorio mononodo: el mismo equipo proporciona la recepción de datos, la
indexación, las búsquedas y Splunk Web.

## Qué aprenderás

Durante el curso aprenderás a:

- Reconocer eventos, campos, fuentes, `sourcetype` e índices.
- Entender el recorrido de los datos desde una fuente hasta una búsqueda.
- Instalar y verificar Splunk Enterprise en Ubuntu.
- Acceder a Splunk Web y comprobar el estado de la instancia.
- Ingerir un archivo CSV y almacenar sus eventos en el índice `curso`.
- Escribir búsquedas SPL progresivamente más precisas.
- Resumir datos con estadísticas, funciones y series temporales.
- Crear reportes, visualizaciones y dashboards.
- Configurar alertas y justificar decisiones de monitorización.

## Método de trabajo

Cada bloque sigue este ciclo:

1. Presentar el concepto y su vocabulario.
2. Mostrar un ejemplo sobre datos de laboratorio.
3. Ejecutar la práctica en Splunk Web o en la terminal de Ubuntu.
4. Validar el resultado mediante una búsqueda SPL.
5. Relacionar lo aprendido con un caso de operaciones, seguridad o soporte.

No se requiere disponer de un entorno distribuido. La arquitectura mononodo
permite centrarse en el flujo de datos sin añadir la complejidad de varios
indexers o search heads.

## Resultado final

Al finalizar tendrás una instancia funcional, un índice de prácticas con datos
consultables y los conocimientos necesarios para construir una solución básica
de análisis y monitorización en Splunk.
