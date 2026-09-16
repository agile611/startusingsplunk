# 3. Splunk Web

**Splunk Web** es la interfaz gráfica de Splunk y es donde la mayoría de los
usuarios interactúan con la plataforma. A través de ella se pueden lanzar
búsquedas, revisar eventos, crear dashboards, gestionar fuentes de datos,
configurar índices y revisar el estado de la instancia.

Si ya tienes Splunk Enterprise instalado y cuentas con permisos de
administrador, Splunk Web no es solo una capa visual: es la herramienta de
operación diaria para verificar la salud del entorno, diagnosticar ingestas,
controlar accesos y revisar actividad.

## Qué es Splunk Web

Splunk Web es la capa de usuario de la aplicación. Está construida sobre el
motor de Splunk y conecta la interfaz con los servicios internos como
`splunkd`, los índices y los componentes de búsqueda.

Desde la interfaz puedes acceder a secciones como:

- **Search & Reporting**: ejecutar búsquedas SPL y validar eventos reales.
- **Data**: revisar entradas, fuentes, `sourcetype`, monitorización y archivos.
- **Monitoring Console**: estado general de la instancia.
- **Settings**: configuración de usuarios, permisos, roles y propiedades.
- **Dashboards**: crear paneles para visualizaciones de negocio o operación.
- **Alerts**: definir alertas basadas en condiciones de búsqueda.

En un entorno local, la URL habitual es:

```text
http://localhost:8000
```

## Primeros pasos al abrir Splunk Web

Cuando arrancas la instancia correctamente, la primera cosa que debes comprobar
es que esta funcionando y que tienes acceso correcto al entorno.

### Validación básica

1. Abre la URL `http://localhost:8000`.
2. Inicia sesión con la cuenta administrativa.
3. Confirma que la instancia responde en el puerto `8000`.
4. Revisa que el usuario actual tiene permisos suficientes para crear, editar y
   consultar fuentes de datos.
5. Verifica que puedes navegar a Search & Reporting y a la gestión de datos.

Si la UI carga pero no ve datos, el problema puede estar desde la ingestión,
los permisos del usuario, el intervalo temporal de la búsqueda o la falta de
fuentes monitorizadas.

## Navegación principal

La interfaz de Splunk Web está organizada para facilitar tres tipos de tareas:

### 1. Exploración de datos

La sección de búsqueda permite:

- consultar eventos reales,
- inspeccionar campos,
- filtrar por `host`, `source`, `sourcetype`, `index`,
- cambiar rangos temporales,
- visualizar resultados en tablas o gráficos,
- guardar búsquedas útiles.

### 2. Administración del entorno

Desde la parte de configuración puedes revisar aspectos clave como:

- usuarios y roles,
- permisos de acceso,
- índices,
- entradas de datos,
- tipos de fuentes,
- licencias y configuración de la instancia.

### 3. Operación y supervisión

La consola de monitorización y la administración de la instancia permiten ver:

- estado del servicio,
- rendimiento de la búsqueda,
- espacio de almacenamiento,
- eventos relevantes del sistema,
- potenciales problemas en los componentes de Splunk.

## Cómo usar Search & Reporting

La parte más importante para una persona que ya tiene Splunk instalado es
saber cómo preguntar correctamente por los datos.

### Búsqueda simple

```spl
index=curso
```

Esta consulta devuelve los eventos del índice `curso` en el rango temporal
seleccionado.

### Ver campos y metadatos

Puedes elegir un evento y revisar específicamente:

- `host`
- `source`
- `sourcetype`
- `index`
- `timestamp`
- campos extraídos automáticamente

Esta revisión es crítica porque ayuda a distinguir si el problema está en el
evento, el parsing o la búsqueda.

### Filtrando por campos

```spl
index=curso status=404
```

```spl
index=curso host=web-01
```

```spl
index=curso source="/var/log/nginx/access.log"
```

Cuando usas campos ya normalizados, las consultas son más robustas que buscar
texto libre en todo el evento.

## Intervalo temporal

Uno de los errores más comunes en Splunk Web es utilizar un rango temporal
incorrecto. La búsqueda puede estar bien escrita, pero si el rango no incluye el
momento del evento no aparecerá nada.

Es recomendable comprobar siempre:

- el rango temporal activo,
- la zona horaria del entorno,
- si la fecha del evento está correcta,
- si el evento fue ingerido con una hora distinta a la que se esperaba.

## Administración desde la UI

Como administrador, Splunk Web te permite tareas clave:

- crear y gestionar índices,
- revisar las fuentes de datos,
- comprobar cuánta información está entrando,
- revisar roles y accesos,
- revisar eventos de las entradas,
- crear dashboards y alertas.

Esto hace que la interfaz sea útil tanto para la operación diaria como para el
análisis técnico.

## Diagnóstico práctico desde Splunk Web

Cuando una búsqueda no devuelve resultados, el flujo recomendado es:

1. Revisar el rango temporal.
2. Confirmar el índice correcto.
3. Ver si el `source` y `sourcetype` son los esperados.
4. Comprobar si el evento realmente llega al sistema.
5. Validar si el campo que se busca existe en los eventos.
6. Revisar permisos del usuario.

En otras palabras: no empieces por una búsqueda compleja; empieza por la capa
más básica y avanza hacia arriba.

## Casos de uso reales para asistentes

Los asistentes suelen usar Splunk Web para los siguientes escenarios:

- confirmar que una ingesta está funcionando,
- buscar un evento concreto en un rango de tiempo,
- comparar el mismo patrón entre varios hosts,
- detectar errores de aplicación,
- revisar accesos sospechosos o intentos fallidos,
- construir un dashboard para la operación diaria,
- crear una alerta cuando algo supera un umbral.

La interfaz es especialmente útil para estas tareas porque hace visible todo el
flujo: buscar, filtrar, resumir, analizar y compartir resultados.

## Referencias y recursos recomendados

Para profundizar en la interfaz y en la práctica de administración de Splunk,
estas son referencias oficiales útiles:

- Información general sobre Splunk Web:
  https://docs.splunk.com/Documentation/Splunk/latest/User/UsingSplunkWeb
- Guía de búsqueda y análisis:
  https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Overview
- Configuración y administración:
  https://docs.splunk.com/Documentation/Splunk/latest/Admin/Welcome-to-Admin
- Monitorización y estado de la instancia:
  https://docs.splunk.com/Documentation/Splunk/latest/Admin/MonitoringConsole

También puedes relacionar este documento con:

- [Introducción](01-introduccion.md)
- [Conceptos fundamentales](02-conceptos-fundamentales.md)
- [Arquitectura del laboratorio](../preparacion/arquitectura-laboratorio.md)
- [Datos del laboratorio](../preparacion/datos-laboratorio.md)
- [Ingesta de datos](04-ingesta-datos.md)

## Resumen

Splunk Web es la capa de interacción principal de Splunk. A través de ella se
pueden consultar eventos, revisar campos, crear dashboards, administrar fuentes
y comprobar el estado del entorno. Para un administrador, su valor real está en
la capacidad de detectar rápidamente dónde falla el flujo de datos y validar si
la información que ve es fiable.

En una instalación real, la UI no sustituye la comprensión del sistema: la
verdadera competencia está en combinar navegación, consultas SPL, conocimiento
de índices y capacidad para diagnosticar el origen del problema.
