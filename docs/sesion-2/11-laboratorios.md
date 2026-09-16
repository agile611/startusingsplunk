# 11. Laboratorios

Estos laboratorios convierten los conceptos de SPL en un flujo de trabajo
completo. Trabajarás como administrador de una instancia de Splunk Enterprise:
primero comprobarás que los datos existen, después los explorarás, filtrarás y
resumirás, y finalmente validarás el coste y la calidad de tus búsquedas.

El objetivo no es memorizar comandos aislados. Es poder explicar qué pregunta
responde cada consulta, por qué el resultado es fiable y qué comprobarías si la
búsqueda no devolviera datos.

## Entorno del laboratorio

Usa la instancia local del curso y el índice `curso`. El dataset de referencia
es `eventos_web.csv`, con estas columnas:

```text
timestamp,host,method,status,uri
```

El archivo de ejemplo contiene eventos del 1 de enero de 2026. Si solo has
cargado las dos filas de muestra, los mínimos esperados son:

- 2 eventos en total;
- 1 respuesta `200`;
- 1 respuesta `404`;
- 1 evento con `status>=400`;
- 1 host: `web-01`.

Si has cargado más datos, los resultados serán superiores. En ese caso, valida
la estructura y los campos, no solo estos números concretos.

## Preparación

Antes de empezar:

1. Comprueba que Splunk Enterprise está iniciado.
2. Accede a Splunk Web con tu cuenta administrativa.
3. Confirma que el índice `curso` existe y que puedes buscarlo.
4. Carga el CSV siguiendo [Ingesta de datos](../sesion-1/04-ingesta-datos.md).
5. Selecciona un intervalo que incluya el 1 de enero de 2026.
6. Abre una búsqueda nueva y guarda tus consultas con un objetivo descriptivo.

Si no tienes eventos, revisa [Datos del laboratorio](../preparacion/datos-laboratorio.md)
y [Gestión del tiempo](03-gestion-tiempo.md) antes de continuar.

## Laboratorio 1: validar la ingesta

### Objetivo

Confirmar que el índice contiene eventos y que los metadatos y campos básicos
son coherentes.

### Consulta

```spl
index=curso earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| table _time _indextime host source sourcetype index _raw
| head 20
```

### Comprueba

- El intervalo de `_time` coincide con la fecha del archivo.
- `host`, `source`, `sourcetype` e `index` tienen valores.
- `_raw` contiene el evento original.
- El número de eventos es razonable para el archivo cargado.

Si no aparece nada, prueba primero `index=curso` con **Todo el tiempo** y
revisa el `_time` real de un evento. No empieces modificando la consulta sin
confirmar el rango temporal.

## Laboratorio 2: explorar los campos

### Objetivo

Verificar que las columnas del CSV se han extraído como campos utilizables.

### Consultas

```spl
index=curso
| table _time timestamp host method status uri
| head 20
```

```spl
index=curso
| fieldsummary
```

### Comprueba

- `host` contiene `web-01` en los datos de referencia.
- `method` contiene `GET`.
- `status` contiene `200` y `404` en la muestra.
- `uri` contiene `/login` y `/missing`.

Si los campos no aparecen, abre `_raw`, revisa el `sourcetype` y consulta
[Extracción de campos](08-extraccion-campos.md). No uses `eval` para ocultar una
extracción que debería corregirse en la entrada.

## Laboratorio 3: filtrar eventos

### Objetivo

Practicar filtros progresivos y comprobar qué condición cambia el resultado.

### Consultas

```spl
index=curso status=404
| table _time host method status uri
```

```spl
index=curso method=GET status>=400
| table _time host method status uri
```

```spl
index=curso (status=404 OR status=500)
| table _time host status uri
```

### Comprueba

Con la muestra mínima, la primera y la segunda consulta devuelven un evento.
La tercera devuelve los eventos que tengan `404` o `500`; si solo has cargado
la muestra, devuelve el evento `404`.

Añade una condición cada vez. Si una consulta pasa de resultados a cero,
comprueba el nombre del campo, el tipo de valor y el intervalo temporal.

## Laboratorio 4: generar estadísticas

### Objetivo

Convertir eventos en indicadores que puedan utilizarse en un informe.

### Consultas

```spl
index=curso
| stats count as peticiones by status
| sort - peticiones
```

```spl
index=curso status>=400
| stats count as errores by host, uri
| sort - errores
```

```spl
index=curso
| stats count as total count(eval(status>=400)) as errores
| eval porcentaje_error=if(total=0, 0, round(errores * 100 / total, 2))
```

### Comprueba

La suma de los grupos de `status` debe ser coherente con el total de eventos
del intervalo. Si el porcentaje no coincide con tu expectativa, revisa que el
numerador y el denominador usen el mismo índice, tiempo y filtros.

## Laboratorio 5: clasificar con `eval`

### Objetivo

Crear una categoría reutilizable en la consulta sin modificar los eventos.

### Consulta

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

### Comprueba

La muestra debe producir una categoría `2xx - correcto` y una categoría
`4xx - error cliente`. Si la consulta no clasifica un evento, inspecciona el
valor original de `status` antes de ampliar el `case`.

## Laboratorio 6: analizar el tiempo

### Objetivo

Observar la distribución temporal y detectar huecos o picos.

### Consultas

```spl
index=curso earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| timechart span=1m count by status
```

```spl
index=curso
| stats earliest(_time) as primer_evento latest(_time) as ultimo_evento count as total
```

### Comprueba

El primer y el último evento deben quedar dentro del intervalo seleccionado.
Los huecos del gráfico pueden significar que no hubo eventos o que la fuente
no está dentro del rango: comprueba ambas hipótesis.

## Laboratorio 7: extraer un campo temporalmente

### Objetivo

Probar una extracción sin modificar la configuración global de Splunk.

Este ejemplo solo es válido si `_raw` contiene una línea con formato CSV simple
y todavía no existen los campos separados:

```spl
index=curso
| rex field=_raw "^(?<marca_tiempo>[^,]+),(?<equipo>[^,]+),(?<verbo>[^,]+),(?<codigo>\\d+),(?<recurso>[^,]+)$"
| table _time marca_tiempo equipo verbo codigo recurso
| head 20
```

### Comprueba

Compara los campos nuevos con `_raw`. Si los campos originales ya existen, no
necesitas esta extracción para el laboratorio habitual. Para una extracción
reutilizable, sigue [Extracción de campos](08-extraccion-campos.md) y prueba el
resultado con otros eventos y usuarios.

## Laboratorio 8: optimizar una búsqueda

### Objetivo

Comparar una búsqueda amplia con una búsqueda acotada y medir la diferencia.

Versión de exploración:

```spl
index=curso
| table _time host method status uri
| sort - _time
```

Versión específica para errores:

```spl
index=curso status>=400 earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| fields _time host status uri
| stats count as errores by host, uri
| sort - errores
```

Abre **Job Inspector** y anota el tiempo, el número de eventos y el resultado.
La consulta optimizada solo es correcta si sigue respondiendo a la misma
pregunta y no ha eliminado datos necesarios.

## Laboratorio 9: diagnóstico como administrador

Simula que una búsqueda devuelve cero resultados y sigue este orden:

1. Ejecuta `index=curso` con **Todo el tiempo**.
2. Revisa `_time` y `_indextime` en un evento.
3. Comprueba el índice y el `sourcetype`.
4. Revisa que el usuario pueda buscar en `curso`.
5. Añade de nuevo el intervalo absoluto.
6. Añade un único filtro de campo.
7. Compara con la consulta anterior que sí funcionaba.

Documenta la causa encontrada y la comprobación que la demostró. El objetivo es
aprender a separar un error de SPL de un error de ingesta, tiempo o permisos.

## Entregable del laboratorio

Guarda un documento o nota con:

- objetivo de cada búsqueda;
- consulta SPL utilizada;
- índice y rango temporal;
- resultado observado;
- campos y comandos principales;
- problema encontrado y diagnóstico aplicado;
- captura o referencia al Job Inspector cuando hayas optimizado una consulta.

## Criterios de superación

El laboratorio se considera completado cuando puedes:

- demostrar que los eventos están en el índice correcto;
- validar `_time`, `host`, `source` y `sourcetype`;
- filtrar por `status`, `method` y `uri`;
- generar un recuento y un porcentaje de errores;
- crear una clasificación con `eval`;
- explicar una extracción temporal con `rex`;
- justificar una optimización sin cambiar el significado del resultado;
- diagnosticar cero resultados siguiendo un orden reproducible.

## Referencias oficiales

- [Search Manual de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Search/WhatsInThisManual)
- [Comando `stats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Stats)
- [Comando `eval`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Eval)
- [Comando `rex`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Rex)
- [Comando `timechart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart)
- [Buenas prácticas de búsquedas](https://docs.splunk.com/Documentation/Splunk/latest/Search/Writebetterqueries)
- [Job Inspector](https://docs.splunk.com/Documentation/Splunk/latest/Search/JobInspector)

## Siguiente paso

Cuando hayas completado estos ejercicios, continúa con el [Reto
práctico](12-reto.md). Allí tendrás que decidir por ti mismo qué consultas,
campos y validaciones necesitas para resolver un caso completo.
