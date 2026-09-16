# 7. Repaso

El repaso final de la sesión sirve para comprobar si el asistente ha asimilado
la lógica práctica del entorno y no solo conceptos aislados. En un entorno con
Splunk Enterprise instalado y permisos administrativos, el objetivo ya no es
recordar definiciones, sino validar que se sabe operar con criterio.

La máxima esta sesión es la siguiente: no basta con saber que existe un índice,
una fuente, un `sourcetype` o un dashboard. Hay que saber reconocer cuándo algo
está bien configurado, cuándo no está llegando y cómo validar cada punto del
flujo.

## Qué has aprendido en esta sesión

A lo largo de esta sesión se han abordado conceptos que forman la base de la
operación en Splunk:

- la arquitectura de una instalación local y la diferencia entre roles,
- la interfaz de Splunk Web y cómo navegar por ella,
- la ingesta de datos desde una fuente hacia el índice,
- el papel de `host`, `source`, `sourcetype`, `timestamp` e `index`,
- la relación entre datos, búsqueda y análisis,
- la importancia de la validación de la fuente antes de seguir con más trabajo.

Si entiendes esto, ya puedes diagnosticar muchas incidencias sin necesidad de
reinstalar la plataforma ni suponer que el problema es de software.

## Checklist operativo de la sesión

Como administrador, esta es la comprobación mínima que debes poder hacer al
finalizar la sesión:

- La instancia de Splunk está ejecutándose.
- Splunk Web responde en `http://localhost:8000`.
- La cuenta administrativa puede iniciar sesión.
- La fuente de datos está bien configurada.
- El índice correcto está definido y visible.
- Los datos aparecen en la búsqueda con el rango temporal correcto.
- La metadata del evento es coherente: `host`, `source`, `timestamp` y
  `sourcetype`.
- El usuario puede consultar los resultados con los permisos adecuados.

Si agregas estos puntos a tu criterio operativo, ya tienes una base sólida para
cualquier sesión posterior.

## Modelo de diagnóstico que debes recordar

Cuando algo fallara en la sesión, la forma correcta de salir del problema es
seguir este orden:

1. Revisar la fuente.
2. Revisar la entrada de datos.
3. Revisar el índice y los permisos.
4. Revisar el `sourcetype` y la extracción de campos.
5. Revisar el rango temporal de la búsqueda.
6. Revisar el evento real en Splunk Web.
7. Solo entonces ampliar la consulta o el análisis.

Esta secuencia ayuda a evitar errores típicos como buscar en un índice equivocado,
usar un intervalo temporal erróneo o asumir que un archivo ya está processado
solo porque existe en el disco.

## Preguntas clave para comprobar si has entendido la sesión

Ponte estas preguntas en cada ejercicio:

- ¿la fuente genera datos reales?
- ¿Splunk los está escuchando?
- ¿van al índice que creo?
- ¿el evento tiene timestamp correcto?
- ¿el `host` y el `source` son los esperados?
- ¿los campos se extraen de forma útil?
- ¿la búsqueda está en el rango correcto?
- ¿el usuario tiene permisos suficientes para ver los resultados?

Si eres capaz de responderlas sin mirar la documentación, significa que has
avanzado más allá de la teoría y estás operando con criterio práctico.

## Errores habituales que ya no deberías repetir

- buscar solo por texto libre sin validar la fuente,
- asumir que la entrada está funcionando porque la configuración fue creada,
- usar un rango temporal incorrecto,
- consultar un índice distinto al que está recibiendo datos,
- ignorar `host`, `source` y `sourcetype`,
- perder tiempo haciendo búsquedas complejas sin comprobar primero la capa
  básica,
- olvidar revisar permisos del usuario.

Estos errores son muy comunes, pero con la práctica se vuelven fácilmente
identificables.

## Conexión con las siguientes sesiones

La primera sesión sienta la base para todo lo que sigue en el curso:

- la ingesta te prepara para el manejo de datos reales,
- los índices y los metadatos te preparan para buscar con precisión,
- Splunk Web te da la observabilidad necesaria para validar resultados,
- en la siguiente sesión empezarás a profundizar en SPL y en búsquedas más
  avanzadas.

Por eso este repaso no es un cierre simple: es la base que te permitirá abordar
las siguientes sesiones con estructura y criterio.

## Referencias útiles para reforzar lo aprendido

- [Documentación general de Splunk](https://docs.splunk.com/Documentation/Splunk)
- [Búsqueda y uso de Splunk Web](https://docs.splunk.com/Documentation/Splunk/latest/User/UsingSplunkWeb)
- [Documentación de ingesta y fuentes](https://docs.splunk.com/Documentation/Splunk/latest/Data/Whatissource)
- [Documentación sobre índices](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Administración general](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Welcome-to-Admin)

También conviene recorrer otra vez estas páginas del curso:

- [Introducción](01-introduccion.md)
- [Conceptos fundamentales](02-conceptos-fundamentales.md)
- [Splunk Web](03-splunk-web.md)
- [Ingesta de datos](04-ingesta-datos.md)
- [Índices](05-indices.md)
- [Laboratorios](06-laboratorios.md)
- [Datos del laboratorio](../preparacion/datos-laboratorio.md)

## Resumen final

La primera sesión ha sido una introducción práctica a la operación real de
Splunk. No se trata solo de entender qué es un evento, un índice o una
búsqueda. Se trata de poder validar que los datos llegan, que se guardan donde
corresponde y que se pueden consultar con precisión.

Si eres capaz de comprobar la fuente, el índice, el tiempo y los permisos, ya
has dado el paso más importante: pasar de “usar Splunk” a “operar Splunk con
criterio”.
