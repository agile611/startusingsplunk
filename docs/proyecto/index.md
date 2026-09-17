# Proyecto final: monitorización de una aplicación web

El proyecto final consiste en construir una solución básica de monitorización sobre
Splunk Enterprise. La solución debe partir de un dataset correctamente ingerido y
terminar en un conjunto de búsquedas, reportes, visualizaciones, filtros y alertas
que permitan analizar el comportamiento de una aplicación web.

El objetivo no es crear un dashboard decorativo. El objetivo es demostrar que puedes:

- preparar y validar los datos;
- formular preguntas operativas;
- escribir búsquedas SPL reproducibles;
- convertir resultados en indicadores;
- detectar comportamientos anómalos;
- documentar limitaciones;
- configurar una alerta accionable;
- explicar qué significan los resultados;
- diferenciar entre una observación y una conclusión;
- comprobar que otra persona puede utilizar la solución.

El proyecto se realiza sobre una instancia local de Splunk Enterprise con permisos
administrativos y utiliza preferentemente el índice:

```spl
index=curso
```

El rol `admin` se utilizará para preparar y validar el laboratorio. Sin embargo,
el proyecto debe tener en cuenta que en un entorno real los usuarios finales
deberían trabajar con roles limitados y con acceso únicamente a los índices,
aplicaciones y objetos que necesitan.

---

## Escenario

La organización dispone de una aplicación web y necesita conocer su estado
operativo a partir de los eventos generados por las peticiones HTTP.

El equipo de operaciones quiere responder a estas preguntas:

- ¿Cuántas peticiones recibe la aplicación?
- ¿Cómo evoluciona el tráfico con el tiempo?
- ¿Qué códigos HTTP aparecen con mayor frecuencia?
- ¿Qué hosts, IP o URL concentran los errores?
- ¿Se observan respuestas HTTP `500`?
- ¿Qué URL presentan mayor tiempo de respuesta?
- ¿Existen patrones que justifiquen una alerta?
- ¿Puede otra persona utilizar el dashboard sin modificar la SPL?
- ¿Qué información adicional sería necesaria para investigar el problema?
- ¿Qué conclusiones pueden defenderse con los datos disponibles?

La solución debe ayudar a pasar de los eventos individuales a una interpretación
operativa.

```text
Eventos web
    ↓
Ingesta en Splunk
    ↓
Validación de campos y timestamps
    ↓
Búsquedas SPL
    ↓
Reportes y visualizaciones
    ↓
Dashboard
    ↓
Filtros interactivos
    ↓
Alerta y acción operativa
```

El proyecto no debe presentar como hechos aquellas conclusiones que el dataset no
permita demostrar. Por ejemplo:

- si no existe una IP de origen, no se puede afirmar qué IP genera más errores;
- si no existe un campo de duración, no se puede afirmar qué URL es más lenta;
- si los datos son históricos, no se puede afirmar que la alerta esté funcionando
  en tiempo real;
- si solo existe un host, no se puede comparar el comportamiento entre varios
  servidores.

---

## Prerrequisitos

Antes de comenzar, confirma que dispones de:

- Splunk Enterprise iniciado.
- Acceso a Splunk Web.
- Usuario con rol `admin` o capacidades equivalentes.
- Acceso al índice `curso`.
- Dataset de laboratorio disponible.
- Permiso para crear búsquedas guardadas, reportes, dashboards y alertas.
- Acceso a la terminal de Ubuntu si necesitas revisar archivos o servicios.
- Navegador web actualizado.
- Tiempo suficiente para documentar las pruebas y los resultados.

URL habitual de Splunk Web:

```text
http://localhost:8000
```

El rol `admin` de Splunk no equivale necesariamente a disponer de `sudo` en
Ubuntu. Son dos ámbitos de permisos diferentes:

| Ámbito | Ejemplo | Función |
|---|---|---|
| Ubuntu | `sudo`, permisos sobre archivos | Gestionar sistema, servicio y ficheros |
| Splunk | Rol `admin` | Gestionar búsquedas, índices y objetos |
| Sistema de archivos | Lectura sobre el CSV | Permitir que Splunk lea la fuente |
| Aplicación de Splunk | Acceso a `Search` o a una app | Determinar dónde se pueden utilizar los objetos |

Si el dataset se carga mediante Splunk Web y no mediante una entrada de archivo
monitorizado, es posible que el participante no necesite acceso `sudo` durante
toda la práctica. Aun así, la terminal resulta útil para comprobar el servicio,
los puertos y los permisos del sistema.

---

## Comprobaciones iniciales del entorno

Antes de comenzar el análisis, comprueba que la plataforma está disponible.

### Comprobar la versión de Splunk

Desde la terminal de Ubuntu:

```bash
/opt/splunk/bin/splunk version
```

La salida debe mostrar la versión de Splunk Enterprise instalada en el laboratorio.

### Comprobar el servicio

```bash
sudo systemctl status Splunkd
```

Si la instalación no utiliza una unidad `systemd` con ese nombre, utiliza:

```bash
sudo /opt/splunk/bin/splunk status
```

### Comprobar Splunk Web

Desde el navegador:

```text
http://localhost:8000
```

Desde la terminal:

```bash
curl -I http://localhost:8000
```

### Comprobar puertos habituales

```bash
sudo ss -lntp | grep -E '8000|8089|9997'
```

Los puertos habituales son:

| Puerto | Uso |
|---:|---|
| `8000` | Splunk Web |
| `8089` | API y administración de Splunk |
| `9997` | Recepción desde forwarders, si se ha configurado |

El puerto `9997` no es necesario para cargar un archivo local desde Splunk Web.
Solo debe utilizarse si el laboratorio incluye un Universal Forwarder o una entrada
de recepción configurada.

---

## Dataset de referencia

El dataset mínimo utilizado durante el curso contiene normalmente:

```text
timestamp,host,method,status,uri
```

Este conjunto mínimo permite analizar:

- fecha y hora;
- host;
- método HTTP;
- código de respuesta;
- URI o ruta solicitada.

Dependiendo de la versión del archivo, también puede incluir:

```text
clientip,response_time,user_agent,bytes,referer
```

o nombres equivalentes:

```text
src_ip,duration,latency,http_user_agent
```

Los campos adicionales son recomendables, pero no deben considerarse obligatorios
si no forman parte del dataset entregado.

### Relación entre conceptos y campos

| Concepto | Campos posibles |
|---|---|
| Timestamp del evento | `timestamp`, `_time` |
| Host | `host` |
| Método HTTP | `method`, `http_method` |
| Código HTTP | `status`, `status_code`, `http_status` |
| URI | `uri`, `url`, `request_uri` |
| IP de cliente | `clientip`, `src_ip`, `source_ip` |
| Tiempo de respuesta | `response_time`, `duration`, `latency` |
| Agente de usuario | `user_agent`, `http_user_agent` |

Antes de construir el proyecto, comprueba los campos realmente disponibles.

### Explorar eventos

```spl
index=curso earliest=0 latest=now
| head 20
```

### Revisar el contenido original

```spl
index=curso earliest=0 latest=now
| table _time _indextime _raw
| head 20
```

### Revisar campos habituales

```spl
index=curso earliest=0 latest=now
| table _time host method status uri clientip src_ip response_time duration latency
| head 20
```

### Revisar el resumen de campos

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

### Revisar los nombres de campos observados

```spl
index=curso earliest=0 latest=now
| stats count by host method status uri
```

Para revisar si existen posibles campos de IP o latencia:

```spl
index=curso earliest=0 latest=now
| table clientip src_ip response_time duration latency uri status
| head 20
```

No inventes resultados para campos que no estén presentes. Si el dataset no incluye
IP o duración, debes documentarlo y explicar cómo ampliarías la fuente en un
entorno real.

---

## Requisitos mínimos y campos opcionales

Para que el proyecto pueda realizarse, el dataset debe permitir como mínimo:

- contar eventos;
- identificar una fecha o timestamp;
- identificar un host;
- identificar un código HTTP;
- identificar una URI o recurso;
- identificar, preferentemente, el método HTTP.

Los siguientes campos son opcionales:

- IP de origen;
- tiempo de respuesta;
- agente de usuario;
- bytes transferidos;
- referer;
- usuario;
- información adicional de aplicación.

### Si falta la IP

Si no existe `clientip`, `src_ip` o un campo equivalente:

- no crees un panel titulado `IP con más errores`;
- utiliza un panel titulado `Host con más errores`;
- documenta que no se ha podido realizar el análisis por IP;
- indica qué campo debería añadirse en una fuente real.

### Si falta la latencia

Si no existe `response_time`, `duration` o `latency`:

- no crees un panel titulado `URL más lentas`;
- utiliza un panel alternativo de `URI con más errores`;
- documenta que no se puede calcular el rendimiento;
- indica qué campo debería añadirse en una fuente real.

---

## Validación inicial

Antes de crear cualquier objeto, valida el índice, el volumen y el rango temporal.

### Número de eventos

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

El resultado debe contener una única fila con el número total de eventos.

### Primer y último evento

```spl
index=curso earliest=0 latest=now
| stats min(_time) as primer_evento max(_time) as ultimo_evento
| eval primer_evento=strftime(primer_evento, "%Y-%m-%d %H:%M:%S")
| eval ultimo_evento=strftime(ultimo_evento, "%Y-%m-%d %H:%M:%S")
```

### Comparar tiempo del evento y tiempo de indexación

```spl
index=curso earliest=0 latest=now
| eval retraso_ingesta=_indextime-_time
| table _time _indextime retraso_ingesta host status uri
| head 20
```

El campo `_time` representa el tiempo asignado al evento.

El campo `_indextime` representa el momento en que Splunk indexó el evento.

Estos valores pueden ser diferentes si:

- el archivo contiene datos históricos;
- la ingesta se produjo después de generar los eventos;
- existe una diferencia de zona horaria;
- el timestamp no se interpretó correctamente;
- la fuente llegó con retraso.

### Metadatos de ingesta

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
| sort - count
```

### Comprobación de campos principales

```spl
index=curso earliest=0 latest=now
| table _time host source sourcetype method status uri
| head 20
```

### Comprobación de campos opcionales

```spl
index=curso earliest=0 latest=now
| table clientip src_ip response_time duration latency
| head 20
```

Si estas consultas no devuelven resultados, no continúes con el dashboard. Revisa:

1. índice;
2. intervalo temporal;
3. permisos;
4. entrada de datos;
5. `source`;
6. `sourcetype`;
7. extracción de campos;
8. timestamp;
9. estado del servicio.

---

## Objetivos del proyecto

Al completar el proyecto podrás:

- comprobar la disponibilidad de una fuente de datos;
- trabajar con un índice específico;
- interpretar eventos web;
- calcular indicadores operativos;
- agrupar eventos por campos;
- construir series temporales;
- localizar errores HTTP;
- clasificar respuestas por familias `2xx`, `3xx`, `4xx` y `5xx`;
- analizar IP, URI y tiempos de respuesta cuando existan;
- crear búsquedas guardadas;
- crear reportes;
- diseñar un dashboard;
- añadir filtros interactivos;
- configurar una alerta;
- probar permisos con un usuario no administrativo;
- explicar limitaciones y decisiones técnicas;
- diferenciar datos históricos de datos en tiempo real;
- documentar qué debe investigarse a continuación.

---

## Entregables mínimos

El proyecto debe incluir:

- un índice específico para la práctica;
- un dataset ingerido correctamente;
- cinco búsquedas SPL documentadas;
- dos reportes;
- un dashboard con al menos seis paneles;
- dos filtros interactivos;
- una alerta;
- una explicación de los resultados;
- una prueba de validación;
- una breve sección de limitaciones.

El índice recomendado para mantener la compatibilidad con el resto del curso es:

```text
curso
```

Aunque el curso recomienda `curso`, el requisito importante es que los datos del
proyecto estén separados y puedan identificarse de forma clara.

Si creas otro índice, por ejemplo:

```text
proyecto_web
```

debes utilizarlo de forma consistente en:

- las búsquedas;
- los reportes;
- los dashboards;
- la alerta;
- la documentación;
- las evidencias.

No mezcles `index=curso` e `index=proyecto_web` sin explicar por qué.

---

## Búsquedas SPL obligatorias

Las cinco búsquedas SPL deben responder a preguntas distintas.

Se recomienda incluir:

1. volumen total de peticiones;
2. porcentaje de errores;
3. errores por URI;
4. errores HTTP `500`;
5. evolución temporal.

Cada búsqueda debe documentar:

- nombre;
- objetivo;
- índice;
- intervalo temporal;
- SPL;
- campos utilizados;
- resultado esperado;
- interpretación;
- limitaciones.

### Ejemplo de búsqueda de volumen

```spl
index=curso earliest=0 latest=now
| stats count as total_peticiones
```

### Ejemplo de porcentaje de errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval es_error=if(status_num>=400, 1, 0)
| stats count as total sum(es_error) as errores
| eval porcentaje_error=if(
    total>0,
    round(errores*100/total, 2),
    0
)
```

### Ejemplo de errores por URI

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

### Ejemplo de errores HTTP 500

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count as errores_500 by host uri
| sort - errores_500
```

### Ejemplo de evolución temporal

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval resultado=if(status_num>=400, "Error", "Correcta")
| timechart span=1m count by resultado
```

---

## Dashboard mínimo

El dashboard debe contener como mínimo estos paneles:

| Panel | Visualización recomendada | Requisito |
|---|---|---|
| Total de peticiones | Single value | Obligatorio |
| Total de errores | Single value | Obligatorio |
| Peticiones por minuto | Línea temporal | Obligatorio |
| Errores por código HTTP | Barras | Obligatorio |
| IP con más errores | Tabla, si existe IP | Condicional |
| URL más lentas | Tabla, si existe latencia | Condicional |

Cuando los campos opcionales no existan, deben utilizarse paneles alternativos.

### Alternativa al panel de IP

Si no existe un campo de IP, utiliza:

```text
Host con más errores
```

Consulta:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| sort - errores
| head 10
```

### Alternativa al panel de URL lentas

Si no existe un campo de tiempo de respuesta, utiliza:

```text
URI con más errores
```

Consulta:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

### Panel de total de peticiones

```spl
index=curso earliest=0 latest=now
| stats count as peticiones
```

### Panel de total de errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num>=400)) as errores
```

### Panel de peticiones por minuto

```spl
index=curso earliest=0 latest=now
| timechart span=1m count as peticiones
```

### Panel de errores por código HTTP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count as errores by status_num
| sort status_num
```

### Panel de porcentaje de error

Este panel es recomendable aunque no forme parte del mínimo:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats
    count as peticiones
    count(eval(status_num>=400)) as errores
| eval porcentaje_error=if(
    peticiones>0,
    round(errores*100/peticiones, 2),
    0
)
```

Puedes añadir paneles adicionales:

- porcentaje de error;
- distribución de métodos HTTP;
- errores por host;
- últimos eventos;
- top de URI;
- eventos HTTP `500`;
- volumen por código de respuesta;
- evolución de respuestas `4xx` y `5xx`;
- latencia media;
- percentil 95 de latencia;
- errores por IP;
- errores por aplicación o servicio.

Cada panel debe tener:

- título claro;
- descripción;
- búsqueda validada;
- visualización adecuada;
- intervalo temporal;
- comportamiento documentado cuando no hay resultados.

---

## Dos filtros interactivos

El dashboard debe incluir al menos dos filtros interactivos.

### Filtro temporal

El usuario debe poder seleccionar:

- últimos minutos;
- última hora;
- últimas 24 horas;
- intervalo absoluto del laboratorio.

El filtro temporal debe afectar a los paneles que analizan eventos.

### Segundo filtro

El segundo filtro puede ser:

- host;
- código HTTP;
- método HTTP;
- URI;
- IP, si existe.

Ejemplo conceptual por host:

```spl
index=curso
| where "$host_token$"="*" OR host="$host_token$"
| stats count as peticiones by status
```

El token no concede permisos adicionales. Solamente sustituye un valor de la
consulta. El usuario seguirá limitado por los índices y objetos a los que tiene
acceso.

La configuración concreta del token puede variar según se utilice Dashboard Studio
o un dashboard clásico. Debes comprobar que:

- el token tiene un valor inicial;
- la opción “todos” funciona;
- un valor específico filtra correctamente;
- un valor sin resultados no rompe el panel;
- ningún panel conserva datos antiguos de forma engañosa.

---

## Alerta mínima

La alerta debe detectar cinco o más respuestas HTTP `500` durante una ventana de
cinco minutos.

Consulta recomendada:

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

Esta consulta está pensada para datos que llegan de forma continua.

La consulta devuelve resultados únicamente cuando se cumple la condición:

```text
errores_500 >= 5
```

### Prueba con datos históricos

Para probar la lógica con datos históricos del laboratorio, utiliza un intervalo
absoluto:

```spl
index=curso earliest="01/01/2026:00:00:00"
          latest="01/01/2026:00:10:00"
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

La alerta no debe configurarse sin probar antes la búsqueda en Search & Reporting.

### Aspectos que deben documentarse

- nombre de la alerta;
- propietario;
- aplicación;
- consulta;
- frecuencia;
- intervalo temporal;
- condición;
- acción;
- destinatario;
- throttling;
- procedimiento de prueba;
- resultado de la prueba;
- actuación esperada después de recibir la alerta.

### Diferencia entre prueba histórica y alerta real

Una búsqueda con:

```spl
earliest="01/01/2026:00:00:00"
latest="01/01/2026:00:10:00"
```

sirve para comprobar la lógica sobre datos históricos.

Una alerta operativa normalmente utilizará:

```spl
earliest=-5m latest=now
```

La segunda opción solo detectará datos que se encuentren dentro de los últimos
cinco minutos respecto al reloj actual.

---

## Evidencias

La entrega debe incluir:

- búsquedas SPL;
- nombre y descripción de las búsquedas guardadas;
- capturas del dashboard;
- configuración de los filtros;
- configuración de la alerta;
- intervalo temporal utilizado;
- índice consultado;
- usuario o rol utilizado para la validación;
- explicación de los resultados;
- limitaciones del dataset;
- problemas encontrados y solución aplicada;
- evidencia de que los paneles se actualizan;
- evidencia de que la alerta se ha probado.

### Evidencia de existencia de eventos

```spl
index=curso earliest=0 latest=now
| stats count as eventos
```

### Evidencia de metadatos

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
```

### Evidencia de rango temporal

```spl
index=curso earliest=0 latest=now
| stats min(_time) as inicio max(_time) as fin
```

### Evidencia de campos

```spl
index=curso earliest=0 latest=now
| table _time host method status uri
| head 20
```

### Evidencia de errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by status_num uri
| sort - errores
```

### Evidencia del dashboard

La captura debe mostrar, cuando sea posible:

- título del dashboard;
- intervalo temporal;
- indicadores;
- gráficos;
- tablas;
- filtros;
- resultados;
- fecha de la prueba.

### Evidencia de la alerta

La documentación debe mostrar:

- nombre;
- consulta;
- frecuencia;
- condición;
- acción;
- destinatario;
- resultado de la prueba.

---

## Limitaciones del proyecto

La entrega debe incluir una sección específica de limitaciones.

Ejemplos:

- el dataset no contiene IP;
- el dataset no contiene tiempo de respuesta;
- los eventos son históricos;
- la muestra tiene pocos registros;
- no hay suficiente volumen de errores `500`;
- no se pudo probar una alerta en tiempo real;
- todos los usuarios utilizaron el rol `admin`;
- no se pudo validar el dashboard con un usuario final;
- los timestamps no incluyen zona horaria;
- la extracción de campos es parcial;
- el dataset representa una simulación y no producción.

Ejemplo de redacción:

> El dataset contiene los campos `timestamp`, `host`, `method`, `status` y `uri`,
> pero no incluye una dirección IP de origen ni una duración de respuesta. Por
> tanto, el proyecto puede identificar hosts y URI con más errores, pero no puede
> demostrar qué cliente genera más errores ni qué URL presenta mayor latencia.

Documentar una limitación es mejor que presentar como válido un análisis que los
datos no permiten realizar.

---

## Criterio de éxito

El proyecto se considera funcional cuando:

1. los eventos están en el índice esperado;
2. el timestamp permite buscar los datos;
3. las búsquedas devuelven resultados coherentes;
4. las métricas están correctamente calculadas;
5. el dashboard responde a preguntas operativas;
6. los filtros actualizan los paneles;
7. la alerta se dispara cuando se cumple la condición;
8. otro usuario puede consultar el resultado con los permisos previstos;
9. los campos opcionales se han tratado correctamente;
10. las limitaciones están documentadas;
11. las conclusiones se pueden relacionar con búsquedas concretas.

El proyecto no se considera completo si el dashboard funciona únicamente porque el
usuario tiene permisos de administrador, pero no puede utilizarlo el perfil final
previsto.

---

## Flujo de diagnóstico

Cuando algo no funcione, sigue este orden:

```text
1. Fuente de datos
2. Permisos del archivo
3. Entrada configurada
4. Índice de destino
5. Host, source y sourcetype
6. Timestamp
7. Campos extraídos
8. Rango temporal
9. Búsqueda SPL
10. Permisos del usuario
11. Dashboard o alerta
```

No empieces modificando el dashboard si todavía no has demostrado que la búsqueda
base devuelve datos.

### Búsqueda base de diagnóstico

```spl
index=curso earliest=0 latest=now
| stats count
```

### Diagnóstico de campos

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

### Diagnóstico de códigos HTTP

```spl
index=curso earliest=0 latest=now
| stats count by status
| sort - count
```

### Diagnóstico de valores numéricos

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count by status status_num
| sort status
```

### Diagnóstico de errores internos

```spl
index=_internal earliest=-30m latest=now
| search log_level=error OR log_level=warn
| table _time host component log_level message
| sort - _time
```

---

## Presentación final

Durante la presentación debes poder explicar:

- qué pregunta responde cada búsqueda;
- en qué índice se encuentran los datos;
- qué intervalo temporal se utilizó;
- cómo se validó la ingesta;
- qué representa `_time`;
- qué campos utiliza cada panel;
- cómo se calcula el porcentaje de error;
- por qué se seleccionó cada visualización;
- qué ocurre cuando no hay resultados;
- cómo funciona cada filtro;
- cuándo se dispara la alerta;
- cómo se evitan alertas repetidas;
- qué permisos necesita el usuario final;
- qué limitaciones tiene el dataset;
- qué mejorarías en un entorno de producción.

La presentación debe distinguir claramente entre:

```text
Dato observado
    ↓
Consulta que lo demuestra
    ↓
Interpretación
    ↓
Acción recomendada
```

Ejemplo:

> La búsqueda muestra 18 respuestas HTTP `500` en cinco minutos. Esto demuestra
> que existieron errores del servidor durante ese intervalo. La siguiente acción
> recomendada es revisar los logs de aplicación y comprobar si los errores se
> concentran en una URI o en un host concreto.

---

## Checklist final

### Entorno

- [ ] Splunk Enterprise está iniciado.
- [ ] Splunk Web responde.
- [ ] El usuario puede acceder a Search & Reporting.
- [ ] El índice existe.
- [ ] El usuario puede consultar el índice.

### Datos

- [ ] El dataset está ingerido.
- [ ] Existen eventos.
- [ ] El rango temporal está validado.
- [ ] `host` está disponible.
- [ ] `status` está disponible.
- [ ] `uri` está disponible.
- [ ] El timestamp es razonable.
- [ ] Se han revisado `source` y `sourcetype`.
- [ ] Se han comprobado los campos opcionales.

### SPL

- [ ] Existe una búsqueda de volumen.
- [ ] Existe una búsqueda de porcentaje de error.
- [ ] Existe una búsqueda de errores por URI.
- [ ] Existe una búsqueda de HTTP `500`.
- [ ] Existe una búsqueda temporal.
- [ ] Las comparaciones numéricas utilizan `tonumber` cuando es necesario.
- [ ] Las consultas tienen índice y tiempo.
- [ ] Las consultas están documentadas.

### Dashboard

- [ ] Existe el panel de total de peticiones.
- [ ] Existe el panel de total de errores.
- [ ] Existe el panel temporal.
- [ ] Existe el panel de códigos HTTP.
- [ ] Existe el panel de IP o el panel alternativo de host.
- [ ] Existe el panel de latencia o el panel alternativo de URI con errores.
- [ ] Los títulos son claros.
- [ ] Las visualizaciones corresponden a las preguntas.
- [ ] Los paneles se actualizan correctamente.

### Filtros

- [ ] Existe un filtro temporal.
- [ ] Existe un segundo filtro.
- [ ] La opción “todos” funciona.
- [ ] Un valor específico funciona.
- [ ] Un valor sin resultados no rompe el dashboard.
- [ ] Los tokens no se utilizan como mecanismo de seguridad.

### Alerta

- [ ] La búsqueda de la alerta ha sido validada.
- [ ] La ventana temporal está documentada.
- [ ] La condición es clara.
- [ ] La frecuencia está configurada.
- [ ] La acción está documentada.
- [ ] El destinatario está definido.
- [ ] Se ha revisado el riesgo de duplicados.
- [ ] La alerta se ha probado con datos históricos o en tiempo real.

### Documentación

- [ ] Se han incluido las búsquedas SPL.
- [ ] Se han incluido capturas.
- [ ] Se han documentado los reportes.
- [ ] Se han documentado los filtros.
- [ ] Se ha documentado la alerta.
- [ ] Se han explicado los resultados.
- [ ] Se han documentado las limitaciones.
- [ ] Se ha indicado qué mejoraría en producción.

---

## Referencias oficiales

- [Splunk Enterprise Documentation](https://docs.splunk.com/Documentation/Splunk)
- [Splunk Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)
- [Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchapp)
- [`stats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Stats)
- [`eval`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Eval)
- [`timechart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart)
- [`where`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Where)
- [`fieldsummary`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fieldsummary)
- [Search optimization](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutsearchoptimization)
- [Splunk Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)
- [Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/IntroFrame)
- [Splunk Alerts](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Splunk Access Controls](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Splunk Knowledge Objects](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)