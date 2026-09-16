# 12. Reto

Este reto final reúne los conceptos de la sesión en un caso de operación web.
Tendrás que investigar los datos, construir consultas reproducibles y explicar
qué puede afirmarse con evidencia y qué no puede concluirse por falta de datos.

No se evalúa únicamente que la SPL devuelva una tabla. También se evalúa que
hayas elegido bien el índice y el tiempo, que entiendas los campos, que valides
los resultados y que puedas diagnosticar un problema si la búsqueda falla.

## Escenario

El equipo de operaciones sospecha que una aplicación web está generando
respuestas HTTP erróneas. Te pide un análisis inicial para responder:

- ¿Cuántas peticiones se han observado?
- ¿Cuántos errores hay y qué porcentaje representan?
- ¿Qué hosts y URI concentran los errores?
- ¿Cómo se distribuyen las respuestas a lo largo del tiempo?
- ¿Los campos están correctamente extraídos?
- ¿La consulta está preparada para reutilizarse en un dashboard o una alerta?

Trabajarás con el índice `curso` y el dataset `eventos_web.csv`, cuyos campos
de referencia son:

```text
timestamp,host,method,status,uri
```

La muestra mínima contiene un evento `200` para `/login` y un evento `404` para
`/missing`, ambos del host `web-01`. Si has cargado más eventos, utiliza todos
los disponibles y documenta el volumen real.

## Reglas del reto

- Indica `index=curso` en todas las búsquedas.
- Usa un intervalo temporal explícito o documenta el selector de Splunk Web.
- No utilices `index=*` salvo que justifiques por escrito por qué es necesario.
- No cambies los eventos ni la configuración global durante el análisis.
- Puedes crear campos temporales con `eval` y probar extracciones con `rex`.
- Debes conservar las consultas y explicar la finalidad de cada una.
- Si el dataset no permite responder una pregunta, debes indicarlo claramente.

## Preparación

Antes de investigar:

1. Comprueba que Splunk Enterprise está iniciado.
2. Inicia sesión con tu cuenta administrativa.
3. Confirma que el índice `curso` existe.
4. Selecciona un intervalo que incluya el 1 de enero de 2026.
5. Ejecuta una búsqueda de validación:

```spl
index=curso
| stats count as total earliest(_time) as primer_evento latest(_time) as ultimo_evento
```

6. Revisa un evento con `_raw`, `host`, `source`, `sourcetype`, `status` y
	 `uri` antes de construir indicadores.

Si la búsqueda no devuelve eventos, resuelve primero el problema de índice,
tiempo, ingesta o permisos. Un reto de análisis no debe empezar modificando
consultas a ciegas.

## Parte 1: validar los datos

Entrega una consulta que muestre los eventos y permita comprobar sus campos:

```spl
index=curso
| table _time _indextime host source sourcetype status method uri _raw
| head 20
```

Explica en tu documento:

- qué valor tiene `_time` y si coincide con el archivo;
- qué `host`, `source` y `sourcetype` aparecen;
- si `status`, `method` y `uri` están disponibles como campos;
- si hay eventos con campos ausentes o valores inesperados.

## Parte 2: construir indicadores

Crea una consulta que devuelva al menos:

- total de peticiones;
- total de errores con `status>=400`;
- porcentaje de error con dos decimales;
- número de hosts distintos;
- número de URI distintas.

Puedes utilizar este patrón como punto de partida, pero debes adaptarlo y
explicar cada métrica:

```spl
index=curso
| stats count as total
					count(eval(status>=400)) as errores
					dc(host) as hosts_distintos
					dc(uri) as uri_distintas
| eval porcentaje_error=if(total=0, 0, round(errores * 100 / total, 2))
```

Comprueba que el denominador representa el mismo conjunto de eventos que el
numerador. No presentes un porcentaje sin indicar el índice y el intervalo.

## Parte 3: localizar el problema

Prepara una tabla ordenada con los errores por host y URI:

```spl
index=curso status>=400
| stats count as errores by host, uri
| sort - errores
```

Después responde con evidencia:

1. ¿Qué host tiene más errores?
2. ¿Qué URI tiene más errores?
3. ¿Qué método HTTP aparece en esos eventos?
4. ¿Puedes afirmar que se trata de una incidencia general? ¿Por qué?

Si solo existe un host o una muestra muy pequeña, indícalo como limitación. No
conviertas una observación local en una conclusión sobre toda la plataforma.

## Parte 4: analizar la evolución temporal

Construye una serie temporal de peticiones por código HTTP:

```spl
index=curso
| timechart span=1m count by status
```

Incluye en el análisis:

- el rango temporal utilizado;
- el tamaño del intervalo (`span`);
- los momentos con actividad o ausencia de eventos;
- si el volumen permite identificar una tendencia real.

Si el dataset contiene muy pocos eventos, explica que el gráfico sirve para
validar la distribución temporal, pero no para inferir una tendencia robusta.

## Parte 5: clasificar las respuestas

Crea una clasificación con `eval` y resume sus resultados:

```spl
index=curso
| eval familia_status=case(
		status>=500, "5xx - error servidor",
		status>=400, "4xx - error cliente",
		status>=300, "3xx - redirección",
		status>=200, "2xx - correcto",
		true(), "otro"
	)
| stats count as eventos by familia_status
| sort - eventos
```

Explica qué sucede con valores fuera del rango esperado y cómo comprobarías un
evento clasificado como `otro`.

## Parte 6: validar una extracción

Comprueba si la fuente ya extrae los campos esperados:

```spl
index=curso
| fieldsummary
```

Si un campo no existe pero aparece en `_raw`, realiza una extracción temporal
con `rex`, valida su cobertura y explica si la solución debería convertirse en
un objeto de conocimiento. No publiques cambios globales como parte del reto.

Tu entrega debe diferenciar entre:

- un campo correctamente extraído durante la ingesta;
- un campo creado temporalmente con `rex` o `eval`;
- una extracción reutilizable que requeriría configuración administrativa.

## Parte 7: optimizar y justificar

Prepara una versión optimizada de una consulta del reto. Debe incluir:

- índice y tiempo explícitos;
- filtro selectivo al principio;
- solo los campos necesarios;
- agregación antes de ordenar una gran cantidad de filas;
- ausencia de `join`, `transaction` o `rex` si no son necesarios.

Abre **Job Inspector** y compara la versión inicial con la optimizada. Entrega
el tiempo observado, el número de eventos y una explicación de por qué el
resultado conserva el mismo significado.

## Entregable

Entrega un informe breve con:

1. Descripción del problema y limitaciones de los datos.
2. Índice, rango temporal y usuario o rol utilizado.
3. Consultas SPL finales y objetivo de cada una.
4. Tabla de indicadores generales.
5. Tabla de errores por host y URI.
6. Serie temporal y explicación del `span`.
7. Clasificación creada con `eval`.
8. Resultado de la validación de campos.
9. Comparación de rendimiento mediante Job Inspector.
10. Diagnóstico aplicado si alguna consulta devolvía cero resultados.

No hace falta incluir capturas de cada paso si las consultas y los resultados
están documentados de forma reproducible.

## Criterios de evaluación

| Área | Puntos | Qué se espera |
|---|---:|---|
| Validación de datos | 20 | Índice, tiempo, metadatos y campos comprobados. |
| Consultas SPL | 25 | Sintaxis correcta, filtros claros y comandos adecuados. |
| Indicadores | 20 | Totales, errores, porcentajes y agrupaciones coherentes. |
| Diagnóstico | 15 | Método reproducible ante cero resultados o campos incorrectos. |
| Rendimiento | 10 | Mejora justificada sin cambiar el significado. |
| Comunicación | 10 | Conclusiones, limitaciones y evidencia bien explicadas. |

Se penalizará presentar como certeza una conclusión que los datos no permitan
demostrar, así como omitir el rango temporal o el índice de las consultas.

## Extensiones opcionales

Si terminas antes, elige una extensión:

- crear una búsqueda que compare errores `4xx` y `5xx` por minuto;
- añadir un lookup de hosts y documentar sus permisos;
- diseñar una alerta para detectar errores HTTP;
- preparar un panel con total, porcentaje de error y URI más problemática;
- comparar una solución con `stats` frente a una solución con `eventstats`;
- explicar qué datos adicionales necesitarías para medir latencia o usuarios.

Estas extensiones deben mantener las mismas reglas de índice, tiempo,
validación y documentación.

## Pistas de diagnóstico

Si algo falla, sigue este orden:

1. `index=curso` con **Todo el tiempo**.
2. Revisión de `_time` y `_indextime`.
3. Revisión de `source`, `sourcetype` e índice.
4. Comprobación de permisos de búsqueda.
5. Consulta mínima con un filtro.
6. Añadir comandos uno a uno.
7. Revisar Job Inspector si la consulta tarda demasiado.

No reinstales Splunk ni cambies la configuración global para resolver un error
de sintaxis o un rango temporal incorrecto.

## Referencias oficiales

- [Search Manual de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Search/WhatsInThisManual)
- [Comando `stats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Stats)
- [Comando `eval`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Eval)
- [Comando `timechart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart)
- [Comando `rex`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Rex)
- [Job Inspector](https://docs.splunk.com/Documentation/Splunk/latest/Search/JobInspector)
- [Buenas prácticas de búsquedas](https://docs.splunk.com/Documentation/Splunk/latest/Search/Writebetterqueries)

## Siguiente paso

Después de este reto, utiliza el [proyecto final](../proyecto/index.md) para
aplicar el mismo método a un caso más amplio, con entregables y evaluación
independientes.
