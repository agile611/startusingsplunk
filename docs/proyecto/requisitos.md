# Requisitos del proyecto final

Este documento define los requisitos técnicos, funcionales y de calidad necesarios
para completar el proyecto final de monitorización de una aplicación web en Splunk
Enterprise.

El proyecto debe demostrar que el participante puede:

- preparar un entorno de trabajo;
- comprobar que Splunk está operativo;
- ingerir un dataset;
- validar un índice;
- revisar timestamps y campos;
- escribir búsquedas SPL reproducibles;
- crear reportes;
- construir un dashboard;
- configurar filtros;
- crear una alerta;
- documentar resultados y limitaciones;
- comprobar permisos;
- explicar qué debe investigarse a continuación.

La solución debe ser reproducible. Otra persona debería poder revisar la
documentación, ejecutar las búsquedas y comprender el funcionamiento general sin
necesitar modificar manualmente la SPL.

---

# 1. Requisitos de plataforma

## 1.1 Producto y sistema operativo

El proyecto requiere:

- Splunk Enterprise instalado.
- Splunk Enterprise operativo.
- Ubuntu 24.04.5 LTS como sistema de referencia.
- Splunk Web accesible.
- Navegador web actualizado.
- Acceso a la terminal de Ubuntu para comprobaciones del entorno.
- Permisos suficientes para consultar y configurar los objetos del proyecto.

La solución está pensada para una instancia local o de laboratorio. En un entorno
real podrían ser necesarios componentes adicionales, como:

- Universal Forwarder;
- Heavy Forwarder;
- indexers adicionales;
- Search Heads;
- almacenamiento externo;
- gestión centralizada de identidades;
- certificados TLS;
- integración con correo, webhook o sistemas de tickets.

Estos componentes no son obligatorios para el laboratorio, salvo que se indiquen
expresamente en la actividad.

---

## 1.2 Acceso a Splunk Web

Comprueba que Splunk Web responde en:

```text
http://localhost:8000
```

Si la instancia utiliza otro nombre de host o puerto, documenta el valor real.

Ejemplo:

```text
http://splunk-lab:8000
```

El acceso a Splunk Web debe permitir, como mínimo:

- abrir Search & Reporting;
- ejecutar búsquedas;
- consultar el índice `curso`;
- guardar búsquedas;
- crear reportes;
- crear dashboards;
- configurar filtros;
- crear una alerta;
- revisar los permisos de los objetos.

---

## 1.3 Usuario y permisos

El proyecto recomienda utilizar un usuario con rol `admin` o con capacidades
equivalentes durante la fase de preparación.

Sin embargo, el rol `admin` no debe considerarse el modelo recomendado para un
usuario final de producción.

El usuario de trabajo debe poder realizar, según las necesidades del laboratorio:

- consultar el índice `curso`;
- crear índices si fuera necesario;
- configurar entradas de datos;
- guardar búsquedas;
- crear reportes;
- crear dashboards;
- crear alertas;
- compartir objetos;
- revisar usuarios y roles;
- comprobar permisos de lectura y modificación.

### Diferencia entre los permisos de Ubuntu y Splunk

El rol de Splunk y los permisos del sistema operativo son independientes.

| Ámbito | Ejemplo | Función |
|---|---|---|
| Ubuntu | `sudo` | Gestionar servicios y configuración del sistema |
| Splunk | Rol `admin` | Gestionar búsquedas, índices y objetos |
| Sistema de archivos | Permiso de lectura | Permitir que Splunk lea una fuente |
| Aplicación de Splunk | Compartición de objetos | Determinar quién puede utilizar un dashboard o reporte |

Tener el rol `admin` en Splunk no concede automáticamente permisos `sudo` en
Ubuntu.

Tener permisos `sudo` en Ubuntu tampoco concede automáticamente acceso
administrativo dentro de Splunk.

---

# 2. Comprobación de la instancia

Antes de comenzar el proyecto, comprueba que el servicio de Splunk está disponible.

## 2.1 Comprobar la versión

Desde la terminal de Ubuntu:

```bash
/opt/splunk/bin/splunk version
```

La salida debe mostrar la versión instalada de Splunk Enterprise.

Documenta la versión utilizada en el resumen técnico del proyecto.

Ejemplo:

```text
Splunk Enterprise 10.4.3
```

## 2.2 Comprobar el servicio mediante systemd

```bash
sudo systemctl status Splunkd
```

El servicio debe aparecer como activo.

Si la instalación no utiliza una unidad `systemd` con ese nombre, utiliza:

```bash
sudo /opt/splunk/bin/splunk status
```

## 2.3 Comprobar Splunk Web

Desde la terminal:

```bash
curl -I http://localhost:8000
```

Desde el navegador:

```text
http://localhost:8000
```

La respuesta debe indicar que Splunk Web está disponible.

## 2.4 Comprobar el puerto de administración

```bash
sudo ss -lntp | grep -E '8000|8089|9997'
```

Los puertos tienen el siguiente uso habitual:

| Puerto | Uso |
|---:|---|
| `8000` | Splunk Web |
| `8089` | API y puerto de administración |
| `9997` | Recepción desde forwarders, si está configurada |

El puerto `9997` no es necesario para la ingesta local del laboratorio si los datos
se cargan mediante Splunk Web o mediante una entrada local.

El puerto `8089` se utiliza para la API de administración y para determinadas
operaciones internas de Splunk.

---

# 3. Comprobación del usuario en Splunk

El proyecto debe documentar el usuario o rol utilizado para configurar y validar
la solución.

Puedes revisar el contexto del usuario mediante REST:

```spl
| rest /services/authentication/current-context
| table username roles
```

Si la consulta no devuelve resultados, revisa el usuario desde:

```text
Settings > Access controls > Users
```

También puedes revisar los roles y sus capacidades desde:

```text
Settings > Access controls > Roles
```

No utilices permisos administrativos para ocultar problemas de acceso.

El proyecto debe distinguir entre:

- permiso para iniciar sesión;
- permiso para ver Splunk Web;
- permiso para buscar un índice;
- permiso para utilizar una aplicación;
- permiso para abrir un dashboard;
- permiso para modificar un dashboard;
- permiso para ejecutar una alerta;
- permiso para editar una alerta;
- permiso para administrar la plataforma.

---

# 4. Índice del proyecto

## 4.1 Índice recomendado

El proyecto utiliza preferentemente el índice:

```text
curso
```

El uso de este nombre permite mantener la compatibilidad con las búsquedas y
ejemplos del resto del curso.

Las búsquedas deberán utilizar el índice de forma explícita:

```spl
index=curso
```

No se recomienda utilizar `index=*` salvo para diagnósticos puntuales y
documentados.

## 4.2 Índice alternativo

Si creas otro índice, por ejemplo:

```text
proyecto_web
```

debes utilizarlo de forma consistente en:

- búsquedas;
- reportes;
- dashboards;
- filtros;
- alertas;
- capturas;
- documentación;
- pruebas de permisos.

No mezcles:

```spl
index=curso
```

con:

```spl
index=proyecto_web
```

sin explicar la razón.

## 4.3 Información que debe documentarse

Si utilizas un índice distinto de `curso`, documenta:

- nombre;
- motivo de creación;
- propietario;
- aplicación;
- retención;
- permisos;
- entrada de datos que lo utiliza;
- tipo de eventos que almacena;
- fecha de creación;
- capacidad de consulta del usuario final.

## 4.4 Comprobar que el índice existe

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

Comprueba:

- que el índice aparece;
- que no está deshabilitado;
- que tiene eventos;
- que el usuario puede consultarlo.

Desde Splunk Web también puedes revisar:

```text
Settings > Indexes
```

El índice debe estar disponible y habilitado.

---

# 5. Requisitos del dataset

## 5.1 Contenido mínimo

El dataset debe contener eventos web suficientes para practicar:

- peticiones HTTP;
- códigos de respuesta;
- URI o URL;
- host;
- fecha y hora;
- método HTTP.

Estructura mínima recomendada:

```text
timestamp,host,method,status,uri
```

Con esta estructura se pueden realizar los análisis básicos de:

- volumen;
- métodos;
- códigos HTTP;
- hosts;
- URI;
- errores;
- evolución temporal.

## 5.2 Estructura ampliada

Para completar todos los análisis recomendados, se aconseja añadir:

```text
timestamp,host,method,status,uri,clientip,response_time
```

La estructura ampliada permite analizar:

- IP de origen;
- tiempo de respuesta;
- URI con mayor latencia;
- IP con más errores;
- relación entre error y cliente.

## 5.3 Campos opcionales

Los siguientes campos son recomendables, pero no son obligatorios para que el
proyecto sea válido:

```text
clientip
response_time
user_agent
bytes
referer
```

El participante no debe inventar valores para campos que no existan.

Si el dataset no contiene IP o latencia, se debe documentar la limitación y utilizar
una alternativa válida.

## 5.4 Equivalencia de nombres

Si el archivo utiliza otros nombres, documenta la equivalencia:

| Concepto | Posibles nombres |
|---|---|
| Timestamp | `timestamp`, `_time`, `event_time` |
| Host | `host`, `server`, `hostname` |
| Método HTTP | `method`, `http_method`, `request_method` |
| IP de cliente | `clientip`, `src_ip`, `source_ip` |
| Tiempo de respuesta | `response_time`, `duration`, `latency` |
| URI | `uri`, `url`, `request_uri` |
| Código HTTP | `status`, `status_code`, `http_status` |
| Agente de usuario | `user_agent`, `http_user_agent` |

## 5.5 Campos necesarios para análisis específicos

Los campos `clientip` y `response_time` no son obligatorios para la validación
básica del proyecto.

Son necesarios para realizar específicamente:

- análisis por IP;
- identificación de IP con más errores;
- análisis de tiempos de respuesta;
- identificación de URL más lentas;
- cálculo de percentiles de latencia.

Si no existen:

- no presentes un análisis por IP como si fuera válido;
- no presentes un ranking de URL lentas;
- utiliza un análisis alternativo;
- documenta la ausencia del campo.

### Alternativa si no existe IP

Utiliza:

```text
Host con más errores
```

Consulta de ejemplo:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| sort - errores
| head 10
```

### Alternativa si no existe latencia

Utiliza:

```text
URI con más errores
```

Consulta de ejemplo:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

---

# 6. Ingesta del dataset

El dataset debe estar disponible en Splunk y ser consultable mediante:

```spl
index=curso earliest=0 latest=now
```

La forma concreta de ingerir los datos puede variar según el laboratorio:

- carga manual mediante Splunk Web;
- monitorización de un archivo;
- entrada local;
- recepción desde un forwarder;
- importación de un archivo CSV;
- entrada de datos preparada por el instructor.

Documenta el método utilizado.

## 6.1 Información que debe documentarse

- nombre del archivo;
- ubicación de la fuente;
- tipo de archivo;
- índice de destino;
- `source`;
- `sourcetype`;
- método de ingesta;
- usuario que configuró la entrada;
- fecha de carga;
- rango temporal de los eventos;
- número de eventos ingeridos.

## 6.2 Validación básica de la ingesta

```spl
index=curso earliest=0 latest=now
| stats count min(_time) as inicio max(_time) as fin
```

## 6.3 Validación de metadatos

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
| sort - count
```

## 6.4 Validación del contenido

```spl
index=curso earliest=0 latest=now
| table _time host method status uri
| head 20
```

## 6.5 Validación de campos opcionales

```spl
index=curso earliest=0 latest=now
| table clientip src_ip response_time duration latency
| head 20
```

---

# 7. Validación inicial de los datos

Antes de crear búsquedas guardadas, reportes, dashboards o alertas, debes validar
los datos.

## 7.1 Número de eventos

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

## 7.2 Primer y último evento

```spl
index=curso earliest=0 latest=now
| stats min(_time) as primer_evento max(_time) as ultimo_evento
| eval primer_evento=strftime(primer_evento, "%Y-%m-%d %H:%M:%S")
| eval ultimo_evento=strftime(ultimo_evento, "%Y-%m-%d %H:%M:%S")
```

## 7.3 Comparar `_time` e `_indextime`

```spl
index=curso earliest=0 latest=now
| eval retraso_ingesta=_indextime-_time
| table _time _indextime retraso_ingesta host status uri
| head 20
```

Esta comprobación es especialmente importante cuando se utilizan datos históricos.

## 7.4 Metadatos de ingesta

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
| sort - count
```

## 7.5 Campos principales

```spl
index=curso earliest=0 latest=now
| table _time host source sourcetype method status uri
| head 20
```

## 7.6 Resumen de campos

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

## 7.7 Valores del código HTTP

```spl
index=curso earliest=0 latest=now
| stats count by status
| sort - count
```

## 7.8 Conversión numérica del código HTTP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count by status status_num
| sort status
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
9. servicio de Splunk;
10. archivo de origen.

---

# 8. Requisitos funcionales

El proyecto debe incluir los siguientes elementos funcionales.

---

## 8.1 Índice

Utiliza un índice específico para el proyecto:

```text
curso
```

Si creas otro índice, documenta:

- nombre;
- motivo;
- propietario;
- retención;
- permisos;
- entrada que lo utiliza;
- aplicación;
- usuario que lo administra.

Comprueba que existe:

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

---

## 8.2 Dataset ingerido

El dataset debe estar disponible en Splunk y ser consultable mediante:

```spl
index=curso earliest=0 latest=now
```

Debes validar:

```spl
index=curso earliest=0 latest=now
| stats count min(_time) as inicio max(_time) as fin
```

También debes documentar:

- número de eventos;
- primer evento;
- último evento;
- host;
- source;
- sourcetype;
- campos disponibles;
- campos ausentes;
- método de ingesta.

---

## 8.3 Cinco búsquedas SPL

Cada búsqueda debe incluir:

- objetivo;
- nombre;
- SPL;
- índice;
- intervalo temporal;
- campos utilizados;
- resultado esperado;
- resultado observado;
- explicación;
- limitaciones;
- fecha de validación.

Se recomienda incluir estas cinco búsquedas:

1. volumen total de peticiones;
2. porcentaje de error;
3. errores por URI;
4. errores HTTP `500`;
5. evolución temporal.

### Búsqueda recomendada: volumen

```spl
index=curso earliest=0 latest=now
| stats count as total_peticiones
```

### Búsqueda recomendada: porcentaje de error

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

### Búsqueda recomendada: errores por URI

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

### Búsqueda recomendada: errores HTTP 500

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count as errores_500 by host uri
| sort - errores_500
```

### Búsqueda recomendada: evolución temporal

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval clase=if(status_num>=400, "Error", "Correcta")
| timechart span=1m count by clase
```

---

## 8.4 Dos reportes

Los reportes deben tener:

- nombre;
- descripción;
- objetivo;
- consulta;
- visualización;
- frecuencia;
- audiencia;
- propietario;
- permisos;
- interpretación;
- limitaciones.

### Reporte recomendado 1: errores por URI

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host uri status_num
| sort - errores
| head 10
```

### Reporte recomendado 2: evolución de peticiones y errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval tipo=if(status_num>=400, "Error", "Correcta")
| timechart span=1m count by tipo
```

---

## 8.5 Dashboard

El dashboard debe tener como mínimo seis paneles.

Paneles recomendados:

1. Total de peticiones.
2. Total de errores.
3. Porcentaje de error.
4. Peticiones por minuto.
5. Errores por código HTTP.
6. IP con más errores o host con más errores si no existe IP.
7. URL más lentas o URI con más errores si no existe latencia.
8. Eventos HTTP `500`.
9. Últimos eventos.
10. Distribución de métodos HTTP.

Cada panel debe documentar:

- título;
- objetivo;
- consulta;
- visualización;
- campos utilizados;
- intervalo temporal;
- comportamiento sin datos;
- limitaciones.

---

## 8.6 Dos filtros

Debes incluir al menos:

- un filtro temporal;
- un filtro por host, código HTTP, URI, método o IP.

### Filtro temporal

Debe permitir analizar diferentes intervalos.

Ejemplos:

```text
Últimos 5 minutos
Última hora
Últimas 24 horas
Intervalo absoluto del laboratorio
```

### Filtro adicional

Puede ser:

- host;
- código HTTP;
- método;
- URI;
- IP;
- familia HTTP.

Ejemplo conceptual:

```spl
index=curso host="$host_token$"
| stats count by status
```

Debes documentar cómo se representa la opción “todos”.

Los tokens no son un mecanismo de seguridad. Solo cambian los valores de una
consulta y no conceden acceso a índices, aplicaciones ni objetos.

---

## 8.7 Una alerta

La alerta debe detectar:

```text
cinco o más errores HTTP 500 en cinco minutos
```

Consulta mínima:

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

Debes documentar:

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
- resultado de la prueba;
- actuación posterior.

---

## 8.8 Explicación

La documentación debe explicar:

- qué se ha observado;
- qué significa;
- qué no puede concluirse;
- qué acción recomendarías;
- qué limitaciones tiene el dataset;
- qué información adicional sería necesaria;
- cómo se ha validado la solución.

Ejemplo:

> Durante el intervalo analizado se observaron 120 peticiones. 14 devolvieron
> respuestas de error, lo que representa un 11,67 %. La URI `/api/login`
> concentró la mayor parte de los errores `4xx`. No se pudo realizar análisis por
> IP porque el dataset no contenía un campo de dirección de origen. Se recomienda
> revisar los logs de autenticación y comprobar si las peticiones fallidas
> corresponden a usuarios legítimos o a tráfico automatizado.

---

# 9. Dataset histórico y datos en tiempo real

Durante el laboratorio puede utilizarse un rango absoluto:

```spl
earliest="01/01/2026:00:00:00"
latest="01/01/2026:00:10:00"
```

Este rango resulta útil para reproducir búsquedas sobre datos históricos.

Para una alerta operativa deben utilizarse rangos relativos:

```spl
earliest=-5m latest=now
```

No mezcles ambos escenarios sin documentarlo.

## 9.1 Búsqueda histórica

Una búsqueda histórica sirve para:

- reproducir ejercicios;
- analizar un dataset ya cargado;
- validar consultas;
- probar visualizaciones;
- demostrar la lógica de una alerta.

## 9.2 Alerta operativa

Una alerta operativa necesita:

- eventos que lleguen continuamente;
- timestamps dentro de la ventana consultada;
- una frecuencia de ejecución;
- una condición;
- una acción;
- un destinatario;
- una política para evitar duplicados.

## 9.3 Diferencia práctica

Esta búsqueda:

```spl
index=curso earliest="01/01/2026:00:00:00"
          latest="01/01/2026:00:10:00"
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

permite validar la lógica sobre datos históricos.

Esta búsqueda:

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

está orientada a datos recientes y continuos.

Si el dataset es únicamente histórico, documenta que no ha sido posible verificar
el comportamiento en tiempo real.

---

# 10. Requisitos de calidad de las búsquedas

Todas las búsquedas del proyecto deben:

- indicar el índice;
- utilizar un intervalo temporal;
- evitar `index=*` salvo diagnóstico;
- normalizar valores numéricos cuando sea necesario;
- utilizar nombres de campos reales;
- evitar comandos innecesariamente costosos;
- incluir una explicación;
- ser reproducibles por otra persona;
- documentar campos opcionales;
- indicar qué ocurre si no hay resultados;
- evitar conclusiones que los datos no puedan respaldar.

## Ejemplo adecuado

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host uri
| sort - errores
```

Esta consulta:

- especifica el índice;
- define el rango temporal;
- convierte el código HTTP;
- filtra los errores;
- agrupa por host y URI;
- ordena el resultado.

## Ejemplo poco recomendable

```spl
index=*
| search error
| table *
```

Problemas de este ejemplo:

- consulta todos los índices;
- no define claramente el periodo;
- depende de una palabra genérica;
- puede devolver demasiados eventos;
- utiliza `table *`;
- no indica qué pregunta responde;
- puede generar resultados difíciles de interpretar;
- puede incluir datos no relacionados con el proyecto.

## Recomendaciones de rendimiento

Siempre que sea posible:

- filtra por índice desde el inicio;
- utiliza un intervalo temporal concreto;
- evita búsquedas globales;
- limita los resultados cuando proceda;
- utiliza `head` solo después de obtener un conjunto relevante;
- evita `table *`;
- evita comandos innecesarios;
- comprueba que los reportes programados no ejecuten búsquedas excesivamente
  amplias;
- documenta búsquedas utilizadas por alertas.

---

# 11. Comprobación de calidad antes de entregar

Antes de entregar, verifica las siguientes búsquedas.

## Número total de eventos

```spl
index=curso earliest=0 latest=now
| stats count
```

## Metadatos

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
```

## Campos disponibles

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

## Códigos HTTP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count by status_num
| sort status_num
```

## Primer y último evento

```spl
index=curso earliest=0 latest=now
| stats min(_time) as inicio max(_time) as fin
| eval inicio=strftime(inicio, "%Y-%m-%d %H:%M:%S")
| eval fin=strftime(fin, "%Y-%m-%d %H:%M:%S")
```

## Errores HTTP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by status_num
| sort - errores
```

## Eventos HTTP 500

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num=500
| table _time host method status uri
| sort - _time
```

Si alguna búsqueda devuelve cero resultados, documenta si la causa es:

- ausencia real de eventos;
- intervalo temporal;
- nombre incorrecto del campo;
- falta de permisos;
- datos históricos;
- extracción incorrecta;
- alerta no validable en tiempo real.

---

# 12. Requisitos de documentación

La documentación debe contener:

- objetivo;
- escenario;
- plataforma;
- versión de Splunk;
- sistema operativo;
- índice;
- dataset;
- rango temporal;
- búsquedas SPL;
- reportes;
- dashboard;
- filtros;
- alerta;
- resultados;
- capturas;
- permisos;
- limitaciones;
- recomendaciones.

Cada búsqueda debe incluir:

```markdown
## Nombre

### Objetivo

Qué pregunta responde.

### SPL

```spl
consulta
```

### Índice y tiempo

Qué índice y qué rango utiliza.

### Campos

Qué campos necesita.

### Resultado esperado

Qué debería aparecer.

### Resultado observado

Qué apareció realmente.

### Interpretación

Qué significa.

### Limitaciones

Qué no puede concluirse.
```

---

# 13. Requisitos de permisos

La solución debe distinguir entre:

- permisos para iniciar sesión;
- permisos para consultar el índice;
- permisos para utilizar la aplicación;
- permisos para ejecutar búsquedas;
- permisos para modificar búsquedas;
- permisos para abrir el dashboard;
- permisos para editar el dashboard;
- permisos para ver la alerta;
- permisos para editar la alerta;
- capacidades administrativas.

Siempre que sea posible, prueba la solución con un usuario que no tenga rol
`admin`.

Documenta:

- usuario de prueba;
- roles;
- índice visible;
- aplicación visible;
- dashboard visible;
- posibilidad de modificar;
- posibilidad de editar alertas;
- resultado de las pruebas.

Si no puedes crear un usuario adicional, documenta la limitación:

> La validación se realizó únicamente con el usuario administrador debido a las
> restricciones del entorno de laboratorio. No se pudo confirmar el comportamiento
> del dashboard con un usuario final de permisos restringidos.

---

# 14. Criterios mínimos de aceptación

El proyecto se considera técnicamente válido cuando cumple como mínimo:

- existe un índice consultable;
- existe un dataset ingerido;
- hay eventos disponibles;
- el timestamp permite buscar los datos;
- se han documentado los campos;
- existen cinco búsquedas SPL;
- existen dos reportes;
- existe un dashboard;
- el dashboard tiene al menos seis paneles;
- existen dos filtros;
- existe una alerta;
- la alerta está documentada;
- se explican los resultados;
- se documentan las limitaciones;
- la SPL está disponible en formato editable;
- se puede demostrar el funcionamiento de la solución.

La ausencia de IP o de latencia no invalida el proyecto si:

- se comprueba que el campo no existe;
- se documenta correctamente;
- se utiliza una alternativa;
- el dashboard no presenta afirmaciones incorrectas;
- el análisis explica qué información falta.

---

# 15. Lista de comprobación de requisitos

## Plataforma

- [ ] Splunk Enterprise está instalado.
- [ ] Splunk Enterprise está operativo.
- [ ] Ubuntu está disponible para las comprobaciones necesarias.
- [ ] Splunk Web responde en la URL documentada.
- [ ] El navegador está actualizado.
- [ ] La versión de Splunk está registrada.

## Servicio

- [ ] Se ha comprobado el estado de `Splunkd`.
- [ ] Se ha comprobado el puerto `8000`.
- [ ] Se ha comprobado el puerto `8089`.
- [ ] Se ha revisado el puerto `9997` si se utiliza un forwarder.
- [ ] Se ha documentado cualquier diferencia respecto al entorno estándar.

## Usuario

- [ ] El usuario puede iniciar sesión.
- [ ] El usuario puede acceder a Search & Reporting.
- [ ] El usuario puede consultar el índice.
- [ ] El usuario puede crear búsquedas guardadas.
- [ ] El usuario puede crear reportes.
- [ ] El usuario puede crear dashboards.
- [ ] El usuario puede crear alertas.
- [ ] Los permisos están documentados.
- [ ] Se ha distinguido entre rol `admin` y usuario final.

## Índice

- [ ] El índice `curso` existe.
- [ ] El índice está habilitado.
- [ ] El índice contiene eventos.
- [ ] El índice utilizado aparece en todas las búsquedas.
- [ ] Si se ha creado otro índice, está documentado.
- [ ] Los permisos sobre el índice están revisados.

## Dataset

- [ ] El dataset está preparado.
- [ ] La fuente está identificada.
- [ ] El método de ingesta está documentado.
- [ ] Los eventos tienen timestamp.
- [ ] Existe host.
- [ ] Existe código HTTP.
- [ ] Existe URI o URL.
- [ ] Existe método HTTP o se documenta su ausencia.
- [ ] Se ha comprobado si existe IP.
- [ ] Se ha comprobado si existe latencia.
- [ ] Los campos alternativos están documentados.

## Ingesta

- [ ] Hay eventos consultables.
- [ ] Se ha validado el número de eventos.
- [ ] Se ha validado el primer evento.
- [ ] Se ha validado el último evento.
- [ ] Se han revisado `host`, `source` y `sourcetype`.
- [ ] Se han revisado los campos extraídos.
- [ ] Se ha revisado la diferencia entre `_time` e `_indextime`.
- [ ] Los problemas de ingesta están documentados.

## Búsquedas

- [ ] Hay cinco búsquedas SPL.
- [ ] Todas indican el índice.
- [ ] Todas indican el intervalo temporal.
- [ ] Todas utilizan campos reales.
- [ ] Se han utilizado conversiones numéricas cuando son necesarias.
- [ ] Cada búsqueda tiene un objetivo.
- [ ] Cada búsqueda tiene un resultado esperado.
- [ ] Cada búsqueda tiene una interpretación.
- [ ] Cada búsqueda tiene limitaciones documentadas.
- [ ] La SPL está disponible como texto editable.

## Reportes

- [ ] Hay dos reportes.
- [ ] Cada reporte tiene nombre.
- [ ] Cada reporte tiene descripción.
- [ ] Cada reporte tiene consulta.
- [ ] Cada reporte tiene visualización.
- [ ] Se ha documentado la frecuencia.
- [ ] Se ha documentado la audiencia.
- [ ] Se han revisado los permisos.
- [ ] Se ha explicado qué decisión ayuda a tomar.

## Dashboard

- [ ] Existe un dashboard.
- [ ] Tiene al menos seis paneles.
- [ ] Tiene panel de total de peticiones.
- [ ] Tiene panel de total de errores.
- [ ] Tiene panel temporal.
- [ ] Tiene panel de códigos HTTP.
- [ ] Tiene panel por IP o alternativa por host.
- [ ] Tiene panel de latencia o alternativa por URI.
- [ ] Los títulos son claros.
- [ ] Las consultas están validadas.
- [ ] El comportamiento sin datos está documentado.
- [ ] La captura completa está incluida.
- [ ] El intervalo temporal inicial está documentado.

## Filtros

- [ ] Existe un filtro temporal.
- [ ] Existe un segundo filtro.
- [ ] El filtro temporal afecta a los paneles.
- [ ] El segundo filtro afecta a los paneles.
- [ ] La opción “todos” está definida.
- [ ] Se ha probado un valor concreto.
- [ ] Se ha probado un valor sin resultados.
- [ ] Se ha probado un intervalo diferente.
- [ ] Se ha documentado el comportamiento con datos vacíos.
- [ ] Se ha explicado que los tokens no conceden permisos.

## Alerta

- [ ] Existe una alerta.
- [ ] La alerta detecta cinco o más HTTP `500`.
- [ ] La ventana es de cinco minutos.
- [ ] La consulta ha sido validada.
- [ ] La frecuencia está documentada.
- [ ] La acción está documentada.
- [ ] El destinatario está documentado.
- [ ] El throttling está documentado.
- [ ] Se ha realizado una prueba.
- [ ] Se ha explicado la diferencia entre histórico y tiempo real.
- [ ] Se ha revisado el riesgo de alertas repetidas.

## Documentación

- [ ] Existe resumen técnico.
- [ ] Existe análisis de resultados.
- [ ] Se incluyen capturas.
- [ ] Se incluyen búsquedas editables.
- [ ] Se documentan los reportes.
- [ ] Se documenta el dashboard.
- [ ] Se documentan los filtros.
- [ ] Se documenta la alerta.
- [ ] Se explican las limitaciones.
- [ ] Se incluyen recomendaciones.
- [ ] La solución puede ser reproducida por otra persona.

---

# 16. Referencias oficiales

- [Splunk Enterprise Documentation](https://docs.splunk.com/Documentation/Splunk)
- [About indexes](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Monitor files and directories](https://docs.splunk.com/Documentation/Splunk/latest/Data/Monitorfilesanddirectories)
- [Splunk REST API Reference](https://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTprolog)
- [Administer Splunk Enterprise](https://docs.splunk.com/Documentation/Splunk/latest/Admin/AbouttheAdminManual)
- [Splunk Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchapp)
- [Splunk Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)
- [Splunk Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)
- [Splunk Alerts](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Splunk Users and Roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)