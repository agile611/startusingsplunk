# Sesión 1: fundamentos e ingestión

En esta sesión prepararemos el laboratorio y estudiaremos cómo Splunk recibe,
procesa, indexa y presenta los datos. Esta primera sesión es esencial porque
establece el modelo mental que se usará durante todo el curso: origen del dato,
entrada, parsing, metadatos, índice, consulta y análisis.

Si ya tienes **Splunk Enterprise** instalado y permisos de administrador,
esta sesión debe leerse como una guía de trabajo real para validar el entorno y
operar con criterio. No se trata solo de “ver cómo se usa Splunk”, sino de
asegurarte de que la instancia está funcionando, que los datos están entrando y
que los resultados son fiables.

## Objetivos

- Comprender los conceptos fundamentales de Splunk.
- Reconocer sus componentes principales.
- Preparar el laboratorio para trabajar con Splunk Enterprise 10.4.3.
- Utilizar Splunk Web con un enfoque práctico.
- Crear y revisar índices.
- Incorporar datos de laboratorio y validarlos.
- Diagnosticar fallos comunes de ingesta, indexación y búsqueda.
- Entender qué debe comprobar un administrador antes de empezar a analizar.

## Contenidos

1. [Introducción a Splunk](01-introduccion.md)
2. [Conceptos fundamentales](02-conceptos-fundamentales.md)
3. [Navegación por Splunk Web](03-splunk-web.md)
4. [Ingesta de datos](04-ingesta-datos.md)
5. [Gestión de índices](05-indices.md)
6. [Laboratorios](06-laboratorios.md)
7. [Repaso](07-repaso.md)

## Qué debe comprobar un administrador al inicio

Antes de analizar datos, conviene validar la base del entorno:

- La instancia está arrancada y responde correctamente.
- Splunk Web está accesible en `http://localhost:8000`.
- Los puertos de servicio y administración responden como se espera.
- El usuario tiene permisos suficientes para consultar y administrar datos.
- El índice de laboratorio `curso` está disponible.
- La fuente de datos está monitorizada o configurada correctamente.
- La búsqueda por rango temporal es coherente con los datos del archivo.

Este tipo de comprobación evita perder tiempo en consultas complejas cuando la
causa real del problema está en la ingestión o en la configuración del entorno.

## Flujo operativo recomendado

La sesión sigue una lógica práctica:

```text
Instalación y validación -> Fuentes -> Entrada -> Parsing -> Índice -> Búsqueda -> Análisis
```

Este flujo es muy útil porque cada etapa responde a una pregunta concreta:

- ¿la fuente genera datos?
- ¿Splunk la está leyendo?
- ¿el evento tiene timestamp correcto?
- ¿se está asignando el índice adecuado?
- ¿la búsqueda está consultando el intervalo y los campos correctos?
- ¿el usuario tiene acceso para ver los resultados?

## Resultado esperado

Al finalizar la sesión tendrás una instancia de Splunk, previamente preparada,
con un conjunto de eventos disponible en el índice `curso`. Lo importante no es
solo “tener datos”, sino poder comprobar que esos datos llegan, se indexan y se
pueden consultar de forma fiable.

## Consejos prácticos para asistentes

- Usa una búsqueda mínima antes de probar consultas complejas.
- Indica explícitamente el índice en tus búsquedas.
- Comprueba el rango temporal antes de buscar campos concretos.
- Revisa `host`, `source`, `sourcetype` y `timestamp` cuando algo falle.
- Si una búsqueda devuelve cero resultados, revisa primero la ingestión y la
  configuración del índice.
- Guarda una nota de qué archivo cargaste, qué índice usaste y qué rango de
  tiempo consultaste.

## Referencias y recursos recomendados

- [Documentación general de Splunk](https://docs.splunk.com/Documentation/Splunk)
- [Guía de administración general](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Welcome-to-Admin)
- [Documentación sobre fuentes y entradas](https://docs.splunk.com/Documentation/Splunk/latest/Data/Whatissource)
- [Documentación sobre índices](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Guía de uso de Splunk Web](https://docs.splunk.com/Documentation/Splunk/latest/User/UsingSplunkWeb)

## Recomendación final

!!! tip "Recomendación"
    Comprueba el espacio en disco, la salud de la instancia y los puertos antes
    de iniciar una carga masiva de datos. Splunk disfruta de los datos; el disco
    lleno, bastante menos.