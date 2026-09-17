# 1. Introducción

Splunk Enterprise es una plataforma para recopilar, indexar, buscar y analizar
datos generados por sistemas, aplicaciones, redes y dispositivos. En lugar de
revisar cada archivo de registro por separado, Splunk centraliza los eventos y
permite investigarlos mediante búsquedas, tablas, gráficos, dashboards y
alertas.

En este curso trabajaremos con una instalación local de **Splunk Enterprise
10.4.3** sobre **Ubuntu 24.04.5 LTS**. La instalación se realizará manualmente
con el paquete `.deb`, tal como se explica en [Instalación de Splunk](../preparacion/instalacion.md).

Si ya tienes Splunk instalado y tienes permisos de administrador, esta primera
página debe leerse como una guía de preparación para operar con criterio y no
solo como una explicación teórica. En la práctica, el valor real de Splunk no
está en la interfaz bonita, sino en la capacidad de validar que los eventos
llegan, se indexan, se interpretan bien y se pueden consultar con rapidez.

## Objetivos de esta introducción

Al finalizar esta página podrás:

- Explicar qué problema resuelve Splunk.
- Diferenciar un evento de un archivo, una fuente de datos y un índice.
- Describir el recorrido de los datos desde su origen hasta una búsqueda.
- Identificar los usos habituales de Splunk Enterprise.
- Entender qué se va a construir durante la primera sesión.
- Realizar una comprobación real del entorno con permisos de administrador.

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

En un entorno real con permisos de administrador, esta diferencia importa mucho:
puedes no solo consultar datos sino validar entradas, revisar fuentes,
configurar índices, ajustar `sourcetype` y comprobar la calidad del flujo de
información en minutos.

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
- Revisar health checks y estado de la instancia.

La interfaz web utiliza los servicios internos de Splunk. Por eso, si Splunk
no está iniciado, el navegador no podrá mostrar la aplicación aunque Ubuntu
funcione correctamente.

## Qué es importante comprobar como administrador

Cuando ya tienes una instancia de Splunk Enterprise instalada y cuentas con
permisos de administrador, el primer objetivo no es solo abrir la UI, sino
comprobar que el equipo está funcionando como debería:

- `splunk status` debe indicar que el servicio está en ejecución.
- `splunk version` debe confirmar la versión instalada.
- Splunk Web debe responder en `http://localhost:8000`.
- El usuario administrativo debe poder iniciar sesión correctamente.
- Los índices relevantes deben estar creados y visibles.
- El historial de ingestión y los errores del sistema deben revisarse si algo no
  aparece en las búsquedas.

Esto es importante porque una instalación puede estar arrancada, pero aun así
no estar ingiriendo datos, no tener el índice correcto o no tener la fuente
añadida. En Splunk, el problema suele estar en una capa concreta del flujo, no
necesariamente en la interfaz.

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
índice correcto?, ¿el intervalo temporal es adecuado? o ¿el usuario tiene
permisos para ver esos datos?

Este enfoque es especialmente útil en entornos reales con permisos de admin,
porque permite aislar rápidamente si el problema es de ingestión, parsing,
indexación o acceso.

## Diagnóstico práctico del entorno

Cuando tienes acceso administrativo, una buena práctica es empezar con una
validación rápida antes de “meterse” en consultas complejas:

```bash
splunk status
splunk version
sudo ss -ltnp | grep -E ':8000|:8089|:9997'
```

Luego, ya dentro de Splunk Web puedes comprobar:

- si la instancia está en estado saludable,
- si los índices existen,
- si hay eventos entrando en la fuente correcta,
- si el rango de tiempo de la búsqueda es el correcto,
- si la instalación de datos tiene un `sourcetype` y metadata coherentes.

Esto evita perder tiempo buscando en la UI antes de confirmar que el sistema
está realmente funcionando.

## Casos típicos que debes resolver como admin

Con permisos administrativos, te vas a encontrar escenarios como estos:

- un archivo no aparece en los resultados aunque está en disco,
- la búsqueda devuelve cero eventos porque se está mirando otro índice,
- el timestamp está desalineado y la búsqueda por tiempo no encuentra nada,
- la fuente está monitorizada pero no llega al índice,
- un `sourcetype` incorrecto impide extraer campos relevantes,
- el usuario ve menos eventos porque no tiene permisos suficientes.

La clave es siempre revisar la ruta del dato, la configuración de entrada, el
índice y el intervalo temporal antes de cambiar nada más.

## Referencias y recursos recomendados

Para profundizar en estos conceptos y contrastar la práctica del curso con la
documentación oficial de Splunk, estas son referencias útiles:

- Documentación general de Splunk:
  https://docs.splunk.com/Documentation/Splunk
- Conceptos de fuentes y entradas:
  https://docs.splunk.com/Documentation/Splunk/latest/Data/Whatsasource
- Documentación sobre índices:
  https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes
- Información sobre search heads:
  https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutsearchheads
- Guía de administración de Splunk:
  https://docs.splunk.com/Documentation/Splunk/latest/Admin/Welcome-to-Admin

También conviene enlazar esta sesión con el resto del curso:

- [Instalación de Splunk](../preparacion/instalacion.md)
- [Arquitectura del laboratorio](../preparacion/arquitectura-laboratorio.md)
- [Datos del laboratorio](../preparacion/datos-laboratorio.md)
- [Ingesta de datos](04-ingesta-datos.md)
- [Gestión de índices](../sesion-1/05-indices.md)

## Resumen

Splunk Enterprise centraliza datos de máquina y los convierte en información
consultable. En nuestro laboratorio se ejecutará como una instalación local
mononodo en Ubuntu 24.04.5 LTS, con Splunk Enterprise 10.4.3 instalado de forma
manual. A partir de aquí, los conceptos de eventos, campos, índices y búsquedas
serán la base de todas las prácticas.

Si ya tienes la instancia funcionando como administrador, el siguiente paso no es
solo “aprender SPL”, sino validar el entorno real en el que vas a operar:
fuentes, índices, metadatos, tiempos y permisos. Esa comprensión es la que te
permitirá resolver problemas reales de forma eficiente en la práctica.