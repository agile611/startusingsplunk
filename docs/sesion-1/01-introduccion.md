# 1. Introducción

Splunk Enterprise es una plataforma para recopilar, indexar, buscar y analizar
datos generados por sistemas, aplicaciones, redes y dispositivos. En lugar de
revisar cada archivo de registro por separado, Splunk centraliza los eventos y
permite investigarlos mediante búsquedas, tablas, gráficos, dashboards y
alertas.

En este curso trabajaremos con una instalación local de **Splunk Enterprise
10.4.3** sobre **Ubuntu 24.04.5 LTS**. La instalación se realizará manualmente
con el paquete `.deb`, tal como se explica en [Instalación en Ubuntu](../preparacion/instalacion-ubuntu.md).

## Objetivos de esta introducción

Al finalizar esta página podrás:

- Explicar qué problema resuelve Splunk.
- Diferenciar un evento de un archivo, una fuente de datos y un índice.
- Describir el recorrido de los datos desde su origen hasta una búsqueda.
- Identificar los usos habituales de Splunk Enterprise.
- Entender qué se va a construir durante la primera sesión.

## ¿Qué problema resuelve Splunk?

Los sistemas producen información constantemente: accesos web, errores de
aplicaciones, conexiones de red, cambios de configuración, inicios de sesión
y métricas de infraestructura. Esa información suele estar distribuida en
servidores y formatos diferentes.

Sin una plataforma centralizada, una investigación suele requerir:

1. Localizar el servidor que contiene el dato.
2. Acceder a la máquina y buscar en uno o varios archivos.
3. Convertir fechas y formatos para comparar resultados.
4. Relacionar manualmente sucesos procedentes de sistemas distintos.
5. Repetir el proceso cada vez que aparece un nuevo incidente.

Splunk reduce ese trabajo mediante un flujo común:

```text
Fuentes de datos -> Ingesta -> Indexación -> Búsqueda -> Análisis y acción
```

La plataforma no sustituye el conocimiento del sistema que se está analizando,
pero proporciona un punto central para encontrar evidencias y relacionarlas.

## Casos de uso

Splunk puede utilizarse en diferentes áreas:

| Área | Ejemplo |
|---|---|
| Operaciones | Detectar errores y revisar la disponibilidad de un servicio. |
| Seguridad | Investigar accesos sospechosos o varios intentos fallidos. |
| Aplicaciones | Localizar excepciones y medir tiempos de respuesta. |
| Redes | Analizar conexiones, tráfico y cambios de estado. |
| Cumplimiento | Conservar y consultar evidencias de actividad. |
| Soporte | Reconstruir qué ocurrió antes de un problema comunicado por un usuario. |

En el curso utilizaremos datos de laboratorio controlados. Esto permite
aprender el flujo completo sin depender de los logs de un entorno de producción.

## Splunk Enterprise y Splunk Web

**Splunk Enterprise** es el producto que se ejecuta en Ubuntu y procesa los
datos. Incluye los servicios necesarios para recibir eventos, almacenarlos y
ejecutar búsquedas.

**Splunk Web** es la interfaz accesible desde el navegador. En la instalación
del curso se publicará en:

```text
http://localhost:8000
```

Desde Splunk Web se pueden realizar las tareas principales del curso:

- Consultar eventos con Search & Reporting.
- Revisar campos extraídos.
- Crear índices y fuentes de datos.
- Guardar búsquedas y crear reportes.
- Construir visualizaciones y dashboards.
- Configurar alertas.

La interfaz web utiliza los servicios internos de Splunk. Por eso, si Splunk
no está iniciado, el navegador no podrá mostrar la aplicación aunque Ubuntu
funcione correctamente.

## Qué construiremos en la sesión

La sesión sigue un recorrido práctico y acumulativo:

1. Preparar Ubuntu y comprobar los requisitos.
2. Comprender eventos, campos, fuentes e índices.
3. Revisar la arquitectura de Splunk.
4. Instalar manualmente Splunk Enterprise 10.4.3.
5. Acceder a Splunk Web y verificar la instancia.
6. Crear o utilizar el índice de laboratorio `curso`.
7. Incorporar datos de prueba.
8. Buscar eventos y validar sus campos.

El resultado esperado es una instancia local operativa con datos suficientes
para practicar búsquedas y análisis en las sesiones siguientes.

## Modelo mental inicial

Para orientarte durante el curso, piensa en Splunk como una cadena de cinco
responsabilidades:

1. **Recibir:** obtener datos desde archivos, puertos, aplicaciones o
	forwarders.
2. **Interpretar:** reconocer timestamps, hosts, fuentes y tipos de evento.
3. **Indexar:** organizar los datos para que puedan localizarse con rapidez.
4. **Buscar:** ejecutar consultas SPL sobre los eventos disponibles.
5. **Presentar:** mostrar resultados en tablas, gráficos, dashboards o alertas.

Cada página de esta sesión profundiza en una parte de esa cadena. Si una
búsqueda no devuelve resultados, este modelo ayuda a preguntar en qué etapa se
ha producido el problema: ¿el dato llegó?, ¿se indexó?, ¿se está buscando el
índice correcto? o ¿el intervalo temporal es adecuado?

## Resumen

Splunk Enterprise centraliza datos de máquina y los convierte en información
consultable. En nuestro laboratorio se ejecutará como una instalación local
mononodo en Ubuntu 24.04.5 LTS, con Splunk Enterprise 10.4.3 instalado de forma
manual. A partir de aquí, los conceptos de eventos, campos, índices y búsquedas
serán la base de todas las prácticas.
