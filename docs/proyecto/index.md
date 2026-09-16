///PER ARREGLAR


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
- configurar una alerta accionable.

El proyecto se realiza sobre una instancia local de Splunk Enterprise con permisos
administrativos y utiliza preferentemente el índice:

```spl
index=curso
```

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
Alerta y acción operativa
```

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

---

## Dataset de referencia

El dataset mínimo utilizado durante el curso contiene normalmente:

```text
timestamp,host,method,status,uri
```

Dependiendo de la versión del archivo, también puede incluir:

```text
clientip,response_time,user_agent,bytes,referer
```

o nombres equivalentes:

```text
src_ip,duration,latency,http_user_agent
```

Antes de construir el proyecto, comprueba los campos realmente disponibles:

```spl
index=curso earliest=0 latest=now
| head 20
```

Después ejecuta:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Y revisa los nombres de campos observados:

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

## Validación inicial

Antes de crear cualquier objeto, valida el índice, el volumen y el rango temporal.

### Número de eventos

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

### Primer y último evento

```spl
index=curso earliest=0 latest=now
| stats min(_time) as primer_evento max(_time) as ultimo_evento
| eval primer_evento=strftime(primer_evento, "%Y-%m-%d %H:%M:%S")
| eval ultimo_evento=strftime(ultimo_evento, "%Y-%m-%d %H:%M:%S")
```

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

Si estas consultas no devuelven resultados, no continúes con el dashboard. Revisa:

1. índice;
2. intervalo temporal;
3. permisos;
4. entrada de datos;
5. `source`;
6. `sourcetype`;
7. extracción de campos.

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
- analizar IP, URI y tiempos de respuesta cuando existan;
- crear búsquedas guardadas;
- crear reportes;
- diseñar un dashboard;
- añadir filtros interactivos;
- configurar una alerta;
- probar permisos con un usuario no administrativo;
- explicar limitaciones y decisiones técnicas.

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

Si creas otro índice, por ejemplo `proyecto_web`, debes utilizarlo de forma
consistente en todas las búsquedas y documentar la decisión.

---

## Dashboard mínimo

El dashboard debe contener como mínimo estos paneles:

| Panel | Visualización recomendada |
|---|---|
| Total de peticiones | Single value |
| Total de errores | Single value |
| Peticiones por minuto | Línea temporal |
| Errores por código HTTP | Barras |
| IP con más errores | Tabla |
| URL más lentas | Tabla |

Puedes añadir paneles adicionales:

- porcentaje de error;
- distribución de métodos HTTP;
- errores por host;
- últimos eventos;
- top de URI;
- eventos HTTP `500`;
- volumen por código de respuesta.

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
- problemas encontrados y solución aplicada.

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
8. otro usuario puede consultar el resultado con los permisos previstos.

---

## Referencias oficiales

- [Splunk Enterprise Documentation](https://docs.splunk.com/Documentation/Splunk)
- [Splunk Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)
- [Splunk Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)
- [Splunk Alerts](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Splunk Access Controls](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)