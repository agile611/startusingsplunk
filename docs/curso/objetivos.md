# Objetivos

## Objetivos generales

- Comprender el modelo de datos y la arquitectura de Splunk Enterprise.
- Instalar y poner en funcionamiento Splunk Enterprise 10.0.1 en Ubuntu
  24.04.5 LTS.
- Ingerir datos de laboratorio y comprobar que quedan disponibles en el índice
  `curso`.
- Crear búsquedas SPL para localizar, filtrar y resumir eventos.
- Construir visualizaciones, reportes y dashboards útiles.
- Configurar alertas básicas y aplicar buenas prácticas de operación y
  seguridad.

## Objetivos específicos

Al terminar el curso podrás:

### Preparar el entorno

- Comprobar arquitectura, recursos, espacio en disco y conectividad de Ubuntu.
- Instalar manualmente el paquete `.deb` de Splunk Enterprise.
- Aceptar la licencia y crear la cuenta administrativa local.
- Verificar la versión instalada y el estado de `splunkd`.
- Acceder a Splunk Web en el puerto `8000`.

### Comprender los datos

- Diferenciar eventos, fuentes, hosts, `sourcetype`, campos e índices.
- Explicar la diferencia entre ingesta e indexación.
- Identificar por qué un timestamp o un intervalo temporal incorrecto puede
  ocultar resultados.
- Reconocer el recorrido desde una fuente hasta una búsqueda.

### Buscar y analizar

- Buscar eventos por índice y campo.
- Utilizar operadores booleanos, filtros y rangos temporales.
- Ordenar resultados y seleccionar campos relevantes.
- Usar `stats`, `timechart`, `eval` y `rex` en búsquedas básicas.
- Interpretar resultados y detectar datos incompletos o mal extraídos.

### Presentar y actuar

- Guardar búsquedas como reportes.
- Elegir una visualización adecuada para una pregunta concreta.
- Construir dashboards con paneles y filtros.
- Configurar una alerta con una condición comprensible.
- Documentar los resultados y las decisiones tomadas.

## Evidencias de aprendizaje

El aprendizaje se comprobará mediante una secuencia de resultados:

1. Instancia local operativa en Ubuntu.
2. Índice `curso` con datos de laboratorio.
3. Búsquedas que validen eventos, campos y timestamps.
4. Un reporte o visualización basada en los datos.
5. Un dashboard con al menos un filtro.
6. Una alerta o propuesta de alerta justificada.
