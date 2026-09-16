///PER ARREGLAR

# Entregables del proyecto final

La entrega debe demostrar que la solución funciona y que las decisiones tomadas
pueden ser explicadas por otra persona.

No es suficiente entregar únicamente una captura del dashboard. Deben entregarse
las búsquedas, la configuración de los objetos, las evidencias de validación y una
explicación de los resultados.

---

## Entregable 1: resumen técnico

Incluye un documento breve con:

- nombre del proyecto;
- nombre del participante;
- fecha;
- versión de Splunk;
- sistema operativo;
- índice utilizado;
- dataset utilizado;
- periodo temporal analizado;
- descripción del objetivo;
- limitaciones conocidas.

Ejemplo:

```text
Producto: Splunk Enterprise 10.4.3
Sistema: Ubuntu 24.04.5 LTS
Índice: curso
Dataset: eventos_web.csv
Periodo: 1 de enero de 2026, 00:00–00:10
Objetivo: monitorizar errores HTTP y volumen de tráfico web
```

---

## Entregable 2: validación de la ingesta

Incluye las siguientes búsquedas y sus resultados.

### Número de eventos

```spl
index=curso earliest=0 latest=now
| stats count as eventos
```

### Rango temporal

```spl
index=curso earliest=0 latest=now
| stats min(_time) as inicio max(_time) as fin
| eval inicio=strftime(inicio, "%Y-%m-%d %H:%M:%S")
| eval fin=strftime(fin, "%Y-%m-%d %H:%M:%S")
```

### Metadatos

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
```

### Campos

```spl
index=curso earliest=0 latest=now
| table _time host method status uri clientip response_time
| head 20
```

Documenta cualquier campo que no exista.

---

## Entregable 3: cinco búsquedas SPL

Cada búsqueda debe entregarse con esta estructura:

```markdown
## Nombre de la búsqueda

### Objetivo

Describe la pregunta que responde.

### SPL

```spl
consulta
```

### Índice y tiempo

Indica el índice y el rango utilizados.

### Resultado esperado

Describe qué debería aparecer.

### Interpretación

Explica qué significa el resultado.

### Limitaciones

Indica qué no puede concluirse.
```

### Búsqueda recomendada 1: volumen

```spl
index=curso earliest=0 latest=now
| stats count as total_peticiones
```

### Búsqueda recomendada 2: porcentaje de error

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval es_error=if(status_num>=400, 1, 0)
| stats count as total sum(es_error) as errores
| eval porcentaje_error=round(errores*100/total, 2)
```

### Búsqueda recomendada 3: errores por URI

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

### Búsqueda recomendada 4: errores HTTP 500

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count as errores_500 by host uri
| sort - errores_500
```

### Búsqueda recomendada 5: evolución temporal

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval clase=if(status_num>=400, "Error", "Correcta")
| timechart span=1m count by clase
```

Si existen tiempos de respuesta, sustituye o añade una búsqueda como esta:

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(tiempo_ms)
| stats avg(tiempo_ms) as media_ms perc95(tiempo_ms) as p95_ms by uri
| sort - p95_ms
```

---

## Entregable 4: reportes

Entrega dos reportes documentados.

### Reporte 1: errores por URI

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host uri status_num
| sort - errores
| head 10
```

Configuración que debe documentarse:

- nombre;
- descripción;
- visualización;
- periodo temporal;
- frecuencia;
- aplicación;
- permisos.

### Reporte 2: evolución de peticiones y errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval tipo=if(status_num>=400, "Error", "Correcta")
| timechart span=1m count by tipo
```

El reporte debe explicar qué decisión ayuda a tomar.

---

## Entregable 5: dashboard

El dashboard debe incluir como mínimo:

1. Total de peticiones.
2. Total de errores.
3. Peticiones por minuto.
4. Errores por código HTTP.
5. IP con más errores o host con más errores si no hay IP.
6. URL más lentas o URI con más errores si no hay latencia.

Incluye:

- captura completa;
- nombre del dashboard;
- aplicación;
- descripción;
- paneles;
- consultas utilizadas;
- visualización de cada panel;
- filtros configurados;
- intervalo temporal inicial.

---

## Entregable 6: filtros

Debes documentar al menos dos filtros.

### Filtro temporal

Explica:

- valor inicial;
- rango permitido;
- paneles afectados;
- comportamiento cuando no hay datos.

### Filtro adicional

Puede ser:

- host;
- código HTTP;
- método;
- URI.

Ejemplo conceptual:

```spl
index=curso host="$host_token$"
| stats count by status
```

Documenta el valor utilizado para representar “todos”.

No consideres los tokens un mecanismo de seguridad. Los filtros solo cambian los
valores de la consulta; no conceden acceso a índices ni objetos.

---

## Entregable 7: alerta

Consulta mínima:

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

Documenta:

- nombre;
- propietario;
- aplicación;
- frecuencia;
- condición;
- acción;
- destinatario;
- throttling;
- ventana temporal;
- prueba realizada;
- resultado de la prueba.

Para probar con datos históricos:

```spl
index=curso earliest="01/01/2026:00:00:00"
          latest="01/01/2026:00:10:00"
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

---

## Entregable 8: análisis escrito

Incluye entre media página y dos páginas con:

- resumen de los hallazgos;
- volumen de peticiones;
- proporción de errores;
- códigos más frecuentes;
- URI o host más problemático;
- IP con actividad anormal, si existe;
- latencias observadas, si existe el campo;
- explicación de la alerta;
- limitaciones;
- recomendaciones.

Utiliza afirmaciones respaldadas por búsquedas.

Ejemplo:

> Durante el intervalo analizado se observaron 120 peticiones. 14 devolvieron
> respuestas de error, lo que representa un 11,67 %. La URI `/api/login`
> concentró la mayor parte de los errores `4xx`. No se pudo realizar análisis por
> IP porque el dataset no contenía un campo de dirección de origen.

---

## Entregable 9: validación con otro usuario

Siempre que sea posible, prueba el dashboard con un usuario que no tenga rol
`admin`.

Registra:

- si puede abrir el dashboard;
- si puede ejecutar las búsquedas;
- si puede consultar `curso`;
- si puede modificar el dashboard;
- si puede ver la alerta;
- si puede editar objetos.

Si no puedes crear un usuario adicional, documenta que la validación se realizó
solo con el usuario administrador y explica la limitación.

---

## Lista final de comprobación

- [ ] Índice confirmado.
- [ ] Dataset ingerido.
- [ ] Timestamp validado.
- [ ] Campos revisados.
- [ ] Cinco búsquedas documentadas.
- [ ] Dos reportes creados.
- [ ] Dashboard creado.
- [ ] Seis paneles funcionando.
- [ ] Dos filtros funcionando.
- [ ] Alerta creada.
- [ ] Alerta probada.
- [ ] Permisos revisados.
- [ ] Limitaciones documentadas.
- [ ] Capturas incluidas.
- [ ] SPL incluida en texto editable.

La entrega final debe ser reproducible, legible y suficiente para que otra persona
pueda reconstruir la solución en Splunk.

No se aceptará únicamente una captura de pantalla del dashboard. La entrega debe
contener la SPL, la configuración y la explicación de los resultados.

## Lista de entregables

- [ ] Resumen técnico.
- [ ] Evidencia de la ingesta.
- [ ] Cinco búsquedas SPL.
- [ ] Dos reportes.
- [ ] Un dashboard con seis paneles.
- [ ] Dos filtros.
- [ ] Una alerta.
- [ ] Capturas de resultados.
- [ ] Explicación del caso.
- [ ] Limitaciones documentadas.
- [ ] Validación de permisos.

## Formato recomendado

Organiza la entrega de esta forma:

```text
proyecto-final/
├── README.md
├── busquedas/
│   ├── 01-volumen.spl
│   ├── 02-errores.spl
│   ├── 03-tiempo.spl
│   ├── 04-uri.spl
│   └── 05-alerta.spl
├── reportes/
│   ├── reporte-errores.md
│   └── reporte-evolucion.md
├── dashboard/
│   ├── captura-dashboard.png
│   └── descripcion-dashboard.md
├── alertas/
│   └── alerta-http-500.md
└── evidencias/
    ├── validacion-ingesta.png
    ├── paneles.png
    └── prueba-permisos.png
```

## Cada búsqueda debe incluir

- nombre;
- objetivo;
- SPL;
- índice;
- rango temporal;
- campos utilizados;
- resultado esperado;
- resultado observado;
- interpretación;
- limitaciones.

## Capturas

Las capturas deben mostrar, cuando sea posible:

- nombre de la búsqueda;
- intervalo temporal;
- consulta;
- tabla o gráfico;
- resultado;
- dashboard completo;
- configuración de la alerta.

Evita capturas recortadas en las que no se pueda identificar el contexto.

## Recomendación

Entrega siempre la SPL como texto editable. Una imagen permite ver el resultado, pero
no permite reutilizar ni revisar fácilmente la consulta.

## Referencias

- [Splunk Knowledge Objects](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)
- [Splunk Reports](https://docs.splunk.com/Documentation/Splunk/latest/Report/Reportsintro)
- [Splunk Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)