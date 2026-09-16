# Preparación

Esta sección reúne las comprobaciones y decisiones necesarias antes de iniciar
el laboratorio. El entorno de referencia es una instalación manual de
**Splunk Enterprise 10.4.3** sobre **Ubuntu 24.04.5 LTS**, ejecutada como un
laboratorio mononodo.

Completa esta preparación antes de comenzar la [sesión 1](../sesion-1/index.md).
Si todavía no tienes la máquina preparada, consulta primero los [requisitos
generales del curso](../curso/requisitos.md).

## Temas

1. [Requisitos de hardware](requisitos-hardware.md): recursos mínimos y
   recomendaciones para una máquina física o virtual.
2. [Comprobaciones previas](comprobaciones-previas.md): lista de validaciones
   antes de instalar y comenzar las prácticas.
3. [Arquitectura y componentes](arquitectura.md): componentes principales
   de la instancia mononodo.
4. [Instalación de Splunk Enterprise 10.4.3](instalar-splunk.md): guía
   completa de descarga, instalación y validación del trial de 60 días.
5. [Arquitectura del laboratorio](arquitectura-laboratorio.md): componentes,
   puertos y recorrido de los datos.
6. [Datos del laboratorio](datos-laboratorio.md): datasets, índice de destino y
   reglas para cargar los archivos.

## Orden recomendado

1. Confirma los recursos de Ubuntu en [Requisitos de hardware](requisitos-hardware.md).
2. Comprende la topología en [Arquitectura del laboratorio](arquitectura-laboratorio.md).
3. Revisa los archivos disponibles en [Datos del laboratorio](datos-laboratorio.md).
4. Ejecuta la lista de [Comprobaciones previas](comprobaciones-previas.md).
5. Realiza la [instalación detallada de Splunk Enterprise](instalar-splunk.md).
6. Continúa con la [navegación por Splunk Web](../sesion-1/03-splunk-web.md) y la
   [ingesta de datos](../sesion-1/04-splunk-web.md).

## Criterio de preparación completada

Puedes empezar el laboratorio cuando Ubuntu responde, tienes espacio para los
datos, puedes abrir Splunk Web en `http://localhost:8000` después de instalarlo
y sabes que los archivos de prueba se cargarán en el índice `curso`.