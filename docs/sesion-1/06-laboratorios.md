# 6. Laboratorios

Los laboratorios de esta sesión tienen una función muy clara: convertir la
teoría de Splunk en trabajo real con datos, índices, entrada de información y
búsquedas válidas. En lugar de quedarse en definiciones, el objetivo es que el
asistente verifique que la instancia funciona, que los datos entran en el
sistema y que la búsqueda devuelve información útil.

Si ya tienes Splunk Enterprise instalado y permisos de administrador, este tipo
de ejercicios es especialmente valioso porque te obligan a operar de forma
práctica: revisar la configuración, validar fuentes, comprobar índices y
resolver problemas reales de ingestión o búsqueda.

## Objetivo de los laboratorios

Los ejercicios están diseñados para consolidar cuatro capacidades:

1. comprobar que la instancia de Splunk está funcionando,
2. configurar o validar la ingesta de eventos,
3. entender cómo los datos se indexan y se presentan,
4. resolver problemas comunes sin depender de suposiciones.

Esto implica trabajar con la misma lógica que se usaría en un entorno real de
operación, aunque con un dataset controlado y accesible para aprendizaje.

## Qué se espera practicar

Dentro de esta sesión, los laboratorios suelen centrarse en:

- revisar la arquitectura del entorno,
- comprobar que Splunk Web responde en el puerto `8000`,
- validar que el servicio `splunkd` está ejecutándose,
- comprobar que el índice `curso` está listo,
- cargar datos de prueba,
- ejecutar consultas simples para verificar la ingestión,
- inspeccionar `host`, `source`, `sourcetype`, `timestamp` y campos,
- detectar errores en la entrada o la búsqueda.

Además, suelen ayudar a entender una verdad central: un archivo puede estar en
al disco y aun así no ser útil si Splunk no lo está monitorizando, si el índice
es incorrecto o si el rango temporal de la búsqueda no coincide.

## Flujo recomendado para cada laboratorio

Cada ejercicio práctico debería seguir este procedimiento:

1. Revisar la fuente o archivo de datos.
2. Confirmar el formato y el contenido.
3. Comprobar la configuración de la entrada.
4. Seleccionar el índice adecuado.
5. Ejecutar una búsqueda simple para validar.
6. Comprobar metadatos y campos.
7. Resolver errores en la ingestión o la búsqueda.
8. Continuar con análisis más avanzados.

Este flujo es mucho mejor que “probar una consulta enorme” sin confirmar antes
que los datos están realmente en el sistema.

## Ejemplos de validación práctica

Tras cargar un dataset, primero se recomienda una comprobación mínima:

```spl
index=curso
```

```spl
index=curso | stats count
```

```spl
index=curso | stats count by sourcetype
```

```spl
index=curso | top host
```

Si estas búsquedas no devuelven datos esperados, conviene revisar:

- el intervalo temporal activo,
- si el índice usado es el correcto,
- si el archivo se cargó en la fuente correcta,
- si la entrada de datos está activa,
- si hay permisos del usuario para consultar esos datos,
- si el `sourcetype` es el adecuado.

## Errores típicos del laboratorio

Algunos de los fallos más frecuentes en esta sesión son:

- buscar en el índice equivocado,
- ejecutar la búsqueda en un rango temporal demasiado pequeño,
- cargar el archivo varias veces sin limpiar la prueba,
- asumir que un archivo en disco significa que ya está en Splunk,
- no revisar `host`, `source` ni `sourcetype` antes de sacar conclusiones,
- interpretar mal la diferencia entre texto del evento y campo extraído.

Estos errores son precisamente los que mejor se resuelven con una metodología
ordenada y con la comprobación de cada etapa del flujo.

## Entregables y resultados esperados

Cada laboratorio suele tener como objetivo final alguno de estos resultados:

- un archivo de datos cargado correctamente,
- eventos visibles en el índice `curso`,
- búsqueda validada con `count` o `stats`,
- identificación de campos relevantes,
- ejemplos de visualización o resumen,
- documentación de la prueba realizada.

La idea no es solo “hacer la tarea”, sino saber explicar qué salió bien, qué se
revisó y por qué el resultado final es correcto.

## Buenas prácticas para asistentes

- Haz siempre una validación mínima antes de profundizar en análisis complejos.
- Usa el índice explícito en todas las búsquedas de laboratorio.
- Revisa el rango temporal antes de hacer filtrado avanzado.
- Guarda una nota con la fuente cargada, el índice usado y el intervalo temporal.
- Comprueba la UI y los resultados antes de asumir que la ingesta está bien.
- Si falla algo, prueba una causa posible y valida una sola hipótesis a la vez.

## Referencias y recursos recomendados

Para complementar los laboratorios de Splunk, estas referencias son útiles:

- [Manual de administración general](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Welcome-to-Admin)
- [Documentación sobre búsqueda y análisis](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Overview)
- [Conceptos de fuentes y entradas](https://docs.splunk.com/Documentation/Splunk/latest/Data/Whatissource)
- [Documentación sobre índices](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Introducción a la interfaz web de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/User/UsingSplunkWeb)

También es recomendable revisar estas páginas del curso:

- [Introducción](01-introduccion.md)
- [Conceptos fundamentales](02-conceptos-fundamentales.md)
- [Splunk Web](03-splunk-web.md)
- [Ingesta de datos](04-ingesta-datos.md)
- [Índices](05-indices.md)
- [Datos del laboratorio](../preparacion/datos-laboratorio.md)

## Resumen

Los laboratorios de esta sesión tienen un objetivo claro: convertir la teoría en
práctica operativa. Para un asistente con una instancia de Splunk Enterprise
funcionando y permisos de administrador, la clave no es responder rápido a una
consulta, sino verificar correctamente cada capa del flujo: entrada, indexación,
metadatos, tiempo y acceso.

Cuando se hacen bien, los laboratorios no solo consolidan conocimientos, sino
que desarrollan la capacidad de diagnosticar y resolver problemas reales en
Splunk con método y criterio.
