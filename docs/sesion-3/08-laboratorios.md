# 8. Laboratorios

Estos laboratorios reúnen los contenidos de la sesión 3 en un flujo operativo:
crear búsquedas reutilizables, convertirlas en paneles, añadir filtros,
configurar una alerta y comprobar que todo funciona con los permisos del usuario
final.

El resultado será un dashboard llamado **Monitorización de aplicación web**
basado en el índice `curso` y en el dataset `eventos_web.csv`.

## Entorno y datos

El CSV de referencia contiene:

```text
timestamp,host,method,status,uri
```

La muestra mínima incluye:

- un evento `200` para `/login`;
- un evento `404` para `/missing`;
- el host `web-01`;
- eventos del 1 de enero de 2026.

Si has cargado más datos, documenta el volumen real y no esperes exactamente
los mismos totales de la muestra mínima.

## Preparación

Antes de empezar:

1. Comprueba que Splunk Enterprise está iniciado.
2. Accede a Splunk Web con tu cuenta administrativa.
3. Confirma que el índice `curso` existe.
4. Carga el CSV siguiendo [Ingesta de datos](../sesion-1/04-ingesta-datos.md).
5. Selecciona un intervalo que incluya el 1 de enero de 2026.
6. Comprueba los campos con:

```spl
index=curso
| table _time _indextime host source sourcetype method status uri
| head 20
```

Si no aparecen eventos, revisa primero el índice, el tiempo, la fuente y los
permisos. No construyas el dashboard sobre una consulta que todavía no has
validado.

## Laboratorio 1: búsqueda base

### Objetivo

Crear una búsqueda guardada que sirva como punto de partida para la
monitorización.

### Consulta

```spl
index=curso earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| stats count as peticiones
```

Guárdala como:

```text
Curso - Total de peticiones
```

Documenta índice, rango, propietario, aplicación y permisos.

## Laboratorio 2: indicadores principales

### Objetivo

Preparar los indicadores que ocuparán la primera fila del dashboard.

### Consulta

```spl
index=curso earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| stats count as total count(eval(status>=400)) as errores
| eval porcentaje_error=if(total=0, 0, round(errores * 100 / total, 2))
| table total errores porcentaje_error
```

Comprueba que el porcentaje usa el mismo índice, rango y conjunto de eventos
que el total. Crea indicadores o un reporte con nombres descriptivos.

## Laboratorio 3: evolución y distribución

### Objetivo

Crear paneles para observar cuándo ocurre el problema y qué códigos HTTP lo
forman.

### Peticiones por minuto

```spl
index=curso earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| timechart span=1m count
```

### Distribución de códigos

```spl
index=curso earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| stats count as peticiones by status
| sort - peticiones
```

Usa un gráfico temporal para la primera consulta y barras o tabla para la
segunda. Valida primero la pestaña **Statistics**.

## Laboratorio 4: errores por URI y detalle

### Objetivo

Permitir que el operador pase del indicador a los elementos concretos.

### Errores por host y URI

```spl
index=curso status>=400 earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| stats count as errores by host, uri
| sort - errores
| head 10
```

### Eventos recientes

```spl
index=curso status>=400 earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| table _time host method status uri source sourcetype
| sort - _time
| head 20
```

Añade ambas búsquedas al dashboard con títulos que expliquen la métrica y el
intervalo utilizado.

## Laboratorio 5: selector temporal y token de host

### Objetivo

Hacer que el dashboard responda a una selección del usuario.

1. Añade un selector temporal global.
2. Crea una lista de hosts a partir de:

```spl
index=curso
| stats count by host
| sort host
```

3. Define un token, por ejemplo `host_token`.
4. Utilízalo en un panel:

```spl
index=curso host="$host_token$" status>=400
| stats count as errores by uri
| sort - errores
```

5. Define un estado inicial y prueba el valor `web-01`.
6. Prueba una selección sin resultados y limpia el filtro.

El token debe modificar el panel sin permitir acceso a índices que el rol no
tiene autorizados.

## Laboratorio 6: construir el dashboard

### Objetivo

Organizar los componentes en una vista útil para operaciones.

Orden recomendado:

1. Total de peticiones.
2. Total y porcentaje de errores.
3. Peticiones por minuto.
4. Distribución de códigos HTTP.
5. URI con más errores.
6. Tabla de eventos recientes.

Usa el nombre:

```text
Monitorización de aplicación web
```

Añade una descripción con índice, audiencia, definición de error y rango
temporal. Comprueba que todos los paneles responden al mismo periodo.

## Laboratorio 7: alerta de errores HTTP

### Objetivo

Crear una alerta que detecte errores en una ventana de cinco minutos.

Para validar la lógica con el CSV histórico:

```spl
index=curso status>=400 earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| stats count as errores by host, uri
| where errores > 0
```

Para una fuente continua, utiliza la ventana relativa:

```spl
index=curso status>=400 earliest=-5m latest=now
| stats count as errores by host, uri
| where errores > 0
```

Configura una ejecución programada coherente con la ventana, una condición de
disparo por número de resultados y un destinatario de prueba. Añade throttling
si la misma incidencia puede generar notificaciones repetidas.

Prueba tanto el disparo como el caso sin errores antes de activar una acción
real. No uses una alerta en tiempo real para el CSV estático.

## Laboratorio 8: permisos y seguridad

### Objetivo

Comprobar que el dashboard y la alerta funcionan con el rol final.

1. Comparte el dashboard con el ámbito mínimo necesario.
2. Revisa propietario, aplicación y permisos.
3. Prueba lectura con un usuario no administrador.
4. Comprueba que puede buscar `index=curso`.
5. Comprueba que no puede editar objetos si no debe hacerlo.
6. Verifica que la alerta solo envía información a destinatarios autorizados.
7. Revisa que ningún token se esté utilizando como autorización.

Si el usuario no ve datos, compara índice, tiempo, rol y objeto antes de
conceder capacidades administrativas.

## Laboratorio 9: validar rendimiento

### Objetivo

Medir el coste del dashboard antes de publicarlo.

1. Abre **Job Inspector** para los paneles principales.
2. Anota tiempo, eventos procesados y resultados.
3. Prueba el rango más amplio y el filtro “todos”.
4. Comprueba si algún panel utiliza una búsqueda costosa.
5. Limita campos, tiempo o categorías cuando sea posible.
6. Repite la medición y verifica que los resultados no han cambiado.

No aumentes el refresco para compensar un panel lento. Primero optimiza la
consulta o reduce la frecuencia.

## Entregable

Entrega un informe con:

- nombre y objetivo del dashboard;
- consultas SPL de cada panel;
- índice y rangos temporales;
- captura o descripción de la distribución de paneles;
- tokens y valores iniciales;
- configuración de la alerta y prueba de disparo;
- propietario, aplicación y permisos;
- resultados de Job Inspector;
- incidencias encontradas y diagnóstico aplicado.

## Criterios de superación

El laboratorio se considera completado cuando puedes:

- construir un dashboard con indicadores, evolución y detalle;
- conectar un filtro a varios paneles;
- definir estados sin resultados y valores iniciales;
- configurar y probar una alerta sin generar ruido innecesario;
- justificar permisos para un usuario no administrador;
- medir y mejorar el coste de las búsquedas;
- explicar las limitaciones del dataset y del intervalo temporal.

## Errores habituales

| Síntoma | Causa posible | Acción |
|---|---|---|
| Todos los paneles están vacíos | Tiempo o índice incorrectos. | Ejecutar una búsqueda base con rango explícito. |
| Solo falla un panel | SPL, token o permiso específico. | Probar su búsqueda fuera del dashboard. |
| El filtro no actualiza resultados | Token mal nombrado o sin valor inicial. | Revisar control, token y estado de borrado. |
| La alerta no dispara | Condición, ventana o datos incorrectos. | Probar la SPL manualmente con datos conocidos. |
| Hay demasiadas notificaciones | Frecuencia y ventana solapadas. | Revisar programación y throttling. |
| Admin funciona y el usuario no | Índice u objeto no compartido. | Revisar rol, aplicación y permisos. |
| El dashboard tarda demasiado | Paneles o búsquedas costosas. | Revisar Job Inspector y reducir el volumen. |

## Referencias oficiales

- [Dashboards en Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Viz/AboutDashboards)
- [Tokens en dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/tokens)
- [Alertas en Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Throttling de alertas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/ThrottleAlerts)
- [Permisos de objetos de conocimiento](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Knowledgeobjectpermissions)
- [Job Inspector](https://docs.splunk.com/Documentation/Splunk/latest/Search/JobInspector)