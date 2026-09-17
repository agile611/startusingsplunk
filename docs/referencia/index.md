# Referencia

Documentación de apoyo con comandos, funciones y recursos habituales.

Este directorio contiene la documentación práctica del laboratorio de
monitorización de aplicaciones web con Splunk Enterprise.

El material está pensado para asistentes que disponen de una instancia de Splunk
Enterprise instalada y de permisos administrativos durante el laboratorio.

El objetivo no es únicamente aprender la sintaxis de SPL, sino comprender el
ciclo completo:

```text
Preparar el entorno
    ↓
Ingerir datos
    ↓
Validar eventos y campos
    ↓
Crear búsquedas SPL
    ↓
Interpretar resultados
    ↓
Construir reportes y dashboards
    ↓
Configurar alertas
    ↓
Aplicar permisos
    ↓
Documentar y reproducir la solución
```

---

# 1. Objetivos del material

Al finalizar el laboratorio, los asistentes deberían poder:

- comprobar el estado de Splunk Enterprise;
- verificar que el usuario tiene los permisos necesarios;
- crear o revisar el índice `curso`;
- cargar datasets en formato CSV;
- monitorizar archivos de logs;
- comprobar `host`, `source` y `sourcetype`;
- validar timestamps y rangos temporales;
- localizar eventos mediante SPL;
- convertir campos numéricos;
- calcular errores HTTP;
- analizar URI y hosts;
- estudiar IP de origen cuando exista;
- analizar latencia cuando exista;
- crear búsquedas guardadas;
- elaborar reportes;
- construir dashboards;
- configurar filtros;
- crear una alerta de HTTP `500`;
- aplicar permisos a objetos;
- documentar limitaciones;
- realizar troubleshooting de forma ordenada.

---

# 2. Entorno de referencia

El laboratorio utiliza como referencia:

| Elemento | Valor |
|---|---|
| Producto | Splunk Enterprise |
| Versión de referencia | 10.4.3 |
| Sistema operativo | Ubuntu 24.04.5 LTS |
| Arquitectura | Mononodo |
| Splunk Web | `http://localhost:8000` |
| API de administración | Puerto `8089` |
| Forwarders | Puerto `9997`, si se utilizan |
| Índice principal | `curso` |
| Usuario de laboratorio | `admin` |
| Dataset | Eventos de aplicación web |

La versión exacta instalada debe comprobarse en el propio sistema:

```bash
/opt/splunk/bin/splunk version
```

También puede consultarse desde Splunk Web en la información del producto.

---

# 3. Diferencia entre administrador de Splunk y administrador de Ubuntu

El rol `admin` de Splunk concede capacidades administrativas dentro de la
plataforma, pero no equivale automáticamente a tener privilegios `sudo` en
Ubuntu.

| Área | Ejemplo | Permite |
|---|---|---|
| Splunk | Rol `admin` | Gestionar búsquedas, índices, usuarios y objetos |
| Ubuntu | `sudo` | Gestionar servicios y archivos del sistema |
| Sistema de archivos | Permiso de lectura | Permitir que Splunk lea una fuente |
| Red | Puerto abierto | Permitir la comunicación con un servicio |

Comprobar el usuario y sus roles:

```spl
| rest /services/authentication/current-context
| table username roles
```

Comprobar el servicio de Splunk:

```bash
sudo systemctl status Splunkd
```

---

# 4. Estructura de la documentación

La documentación se divide en ficheros temáticos.

## 4.1 Bibliografía

Fichero:

```text
bibliografia.md
```

Contenido:

- documentación oficial;
- libros;
- artículos;
- recursos técnicos;
- criterios para seleccionar fuentes;
- relación entre referencias y proyecto.

Utilízalo cuando necesites justificar una decisión técnica.

---

## 4.2 Datasets

Fichero:

```text
datasets.md
```

Contenido:

- estructura de los datos;
- dataset mínimo;
- dataset ampliado;
- generación de archivos;
- carga mediante Splunk Web;
- monitorización de archivos;
- validación;
- troubleshooting;
- ejercicios prácticos.

Es el punto de partida para preparar los datos del laboratorio.

---

## 4.3 Enlaces

Fichero:

```text
enlaces.md
```

Contenido:

- documentación oficial de Splunk;
- referencias de SPL;
- dashboards;
- alertas;
- usuarios y roles;
- REST API;
- Ubuntu;
- systemd;
- troubleshooting;
- recursos externos.

Utilízalo como catálogo de consulta rápida.

---

## 4.4 Comandos SPL

Fichero:

```text
comandos-spl.md
```

Contenido:

- comandos de búsqueda;
- filtros;
- agregaciones;
- ordenación;
- extracción;
- series temporales;
- dashboards;
- alertas;
- troubleshooting;
- buenas prácticas de rendimiento.

Utilízalo cuando necesites saber **qué comando aplicar**.

---

## 4.5 Funciones SPL

Fichero:

```text
funciones-spl.md
```

Contenido:

- funciones de texto;
- funciones numéricas;
- funciones condicionales;
- funciones de fecha;
- conversión de tipos;
- valores nulos;
- funciones multivalor;
- funciones estadísticas;
- ejercicios.

Utilízalo cuando necesites saber **cómo transformar o calcular un valor**.

---

## 4.6 Glosario

Fichero:

```text
glosario.md
```

Contenido:

- conceptos de Splunk;
- terminología SPL;
- administración de logs;
- HTTP;
- observabilidad;
- seguridad;
- Ubuntu;
- troubleshooting.

Utilízalo cuando aparezca un término técnico que necesites aclarar.

---

## 4.7 Documentación de referencia

Fichero:

```text
index.md
```

Este documento sirve como índice general y guía de navegación del material.

---

# 5. Itinerario recomendado del laboratorio

Se recomienda seguir el orden siguiente.

## Fase 1: preparar el entorno

Antes de ingerir datos, comprueba:

```bash
sudo systemctl status Splunkd
```

```bash
/opt/splunk/bin/splunk version
```

```bash
sudo ss -lntp | grep -E '8000|8089|9997'
```

En Splunk Web:

1. acceder con el usuario de laboratorio;
2. confirmar que la instancia responde;
3. comprobar la aplicación activa;
4. comprobar los permisos;
5. identificar el índice de trabajo.

---

## Fase 2: revisar el índice

Consulta los índices disponibles:

```spl
| rest /services/data/indexes
| table title disabled totalEventCount currentDBSizeMB
| sort title
```

Buscar específicamente el índice `curso`:

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

Si el índice no existe, debe crearse antes de ingerir los datos.

Documenta:

- nombre;
- finalidad;
- propietario;
- retención;
- permisos;
- fuentes esperadas.

---

## Fase 3: preparar el dataset

Consulta:

```text
datasets.md
```

Como mínimo, el dataset web debe contener:

```text
timestamp,host,method,status,uri
```

El dataset ampliado puede contener:

```text
timestamp,host,method,status,uri,clientip,response_time,user_agent,bytes,referer
```

Antes de cargarlo, comprueba:

- que existe la cabecera;
- que el delimitador es correcto;
- que cada línea representa un evento;
- que las fechas son coherentes;
- que los códigos HTTP son válidos;
- que no hay columnas desplazadas;
- que el archivo no contiene credenciales.

---

## Fase 4: ingerir los datos

Se pueden utilizar dos métodos principales.

### Carga mediante Splunk Web

Adecuada para:

- archivos pequeños;
- datos históricos;
- ejercicios puntuales;
- primeras pruebas.

### Monitorización de archivo

Adecuada para:

- datos incrementales;
- pruebas de alertas;
- simulación de producción;
- generación continua de eventos.

Entrada conceptual:

```ini
[monitor:///var/log/splunk-curso/eventos_web.csv]
disabled = false
index = curso
sourcetype = web:csv
host = web-lab
```

Revisar entradas monitorizadas:

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype disabled
```

---

# 6. Primera validación de los datos

Después de ingerir los datos, no crees todavía dashboards ni alertas.

Primero valida la fuente.

## 6.1 Comprobar que existen eventos

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

Resultado esperado:

```text
Una fila con el número total de eventos.
```

Si devuelve cero, revisa:

- índice;
- intervalo temporal;
- entrada;
- permisos;
- timestamp;
- `source`;
- `sourcetype`.

---

## 6.2 Comprobar el rango temporal

```spl
index=curso earliest=0 latest=now
| stats min(_time) as inicio max(_time) as fin
| eval inicio=strftime(inicio, "%Y-%m-%d %H:%M:%S")
| eval fin=strftime(fin, "%Y-%m-%d %H:%M:%S")
```

Esta consulta permite detectar si:

- los eventos son históricos;
- están fuera del intervalo esperado;
- todos tienen el mismo tiempo;
- existe un problema de parsing.

---

## 6.3 Revisar metadatos

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
| sort - count
```

Los valores deben ser coherentes con la entrada configurada.

---

## 6.4 Revisar campos

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Comprueba la existencia de:

- `host`;
- `method`;
- `status`;
- `uri`;
- `clientip`, si aplica;
- `response_time`, si aplica.

---

## 6.5 Revisar eventos originales

```spl
index=curso earliest=0 latest=now
| table _time _raw
| head 20
```

Esta consulta es especialmente útil si:

- faltan campos;
- el CSV se ha interpretado mal;
- existen valores inesperados;
- el timestamp es incorrecto;
- varias columnas aparecen fusionadas.

---

## 6.6 Revisar el retraso de ingesta

```spl
index=curso earliest=0 latest=now
| eval retraso_ingesta=_indextime-_time
| table _time _indextime retraso_ingesta host uri
| head 20
```

Si el dataset es histórico, el retraso puede ser elevado de forma esperada.

---

# 7. Primeras búsquedas SPL

## 7.1 Total de peticiones

```spl
index=curso earliest=0 latest=now
| stats count as total_peticiones
```

## 7.2 Peticiones por host

```spl
index=curso earliest=0 latest=now
| stats count as peticiones by host
| sort - peticiones
```

## 7.3 Peticiones por método

```spl
index=curso earliest=0 latest=now
| stats count as peticiones by method
| sort - peticiones
```

## 7.4 Peticiones por URI

```spl
index=curso earliest=0 latest=now
| stats count as peticiones by uri
| sort - peticiones
| head 10
```

## 7.5 Distribución de códigos HTTP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count as peticiones by status_num
| sort status_num
```

## 7.6 Clasificación por familia HTTP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| eval familia_http=case(
    status_num>=500, "5xx",
    status_num>=400, "4xx",
    status_num>=300, "3xx",
    status_num>=200, "2xx",
    true(), "otro"
)
| stats count as peticiones by familia_http
| sort familia_http
```

---

# 8. Búsquedas requeridas para el proyecto

El proyecto debe contener al menos cinco búsquedas documentadas.

## 8.1 Volumen de peticiones

```spl
index=curso earliest=-24h latest=now
| stats count as total_peticiones
```

### Objetivo

Conocer el volumen total de peticiones en el intervalo seleccionado.

### Interpretación

Un volumen bajo puede significar:

- poca actividad;
- intervalo incorrecto;
- fuente detenida;
- problema de ingesta;
- dataset pequeño.

---

## 8.2 Porcentaje de error

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| stats
    count as total
    count(eval(status_num>=400)) as errores
| eval porcentaje_error=if(
    total>0,
    round(errores*100/total, 2),
    0
)
```

### Objetivo

Medir la proporción de respuestas consideradas erróneas.

### Nota

Debe documentarse si los `4xx` y los `5xx` se consideran errores en el mismo
indicador.

---

## 8.3 Errores por URI

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

### Objetivo

Identificar recursos con mayor concentración de errores.

---

## 8.4 Errores HTTP 500

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count as errores_500 by host uri
| sort - errores_500
```

### Objetivo

Separar los errores internos del servidor de otros códigos HTTP.

---

## 8.5 Evolución temporal

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| eval resultado=if(status_num>=400, "Error", "Correcta")
| timechart span=1m count by resultado
```

### Objetivo

Observar la evolución del tráfico y de los errores.

---

# 9. Análisis opcional por IP y latencia

Estos análisis dependen de los campos disponibles.

## 9.1 IP de origen

Comprobar primero:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Si existe `clientip`:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by clientip
| sort - errores
| head 10
```

Si no existe:

> El dataset no contiene una IP de origen. No es posible realizar un análisis
> fiable por cliente. Se utiliza `host` como dimensión alternativa.

Consulta alternativa:

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| sort - errores
```

---

## 9.2 Latencia

Comprobar primero:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Si existe `response_time`:

```spl
index=curso earliest=0 latest=now
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(tiempo_ms)
| stats
    avg(tiempo_ms) as media_ms
    median(tiempo_ms) as mediana_ms
    perc95(tiempo_ms) as p95_ms
    max(tiempo_ms) as maximo_ms
    by uri
| sort - p95_ms
```

Si no existe, no debe utilizarse un título como:

```text
URL más lenta
```

Una alternativa válida es:

```text
URI con más errores
```

---

# 10. Dashboard recomendado

El dashboard mínimo debe contener al menos seis paneles.

## Panel 1: total de peticiones

```spl
index=curso earliest=-24h latest=now
| stats count as peticiones
```

Visualización recomendada:

```text
Single value
```

---

## Panel 2: total de errores

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num>=400)) as errores
```

Visualización recomendada:

```text
Single value
```

---

## Panel 3: porcentaje de error

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| stats
    count as total
    count(eval(status_num>=400)) as errores
| eval porcentaje_error=if(
    total>0,
    round(errores*100/total, 2),
    0
)
```

Visualización recomendada:

```text
Single value o gauge
```

---

## Panel 4: peticiones por minuto

```spl
index=curso earliest=-24h latest=now
| timechart span=1m count as peticiones
```

Visualización recomendada:

```text
Gráfico de líneas
```

---

## Panel 5: errores por código HTTP

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by status_num
| sort status_num
```

Visualización recomendada:

```text
Barras o columnas
```

---

## Panel 6: host con más errores

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host
| sort - errores
| head 10
```

Visualización recomendada:

```text
Barras o tabla
```

---

## Panel 7: URI con más errores

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

Visualización recomendada:

```text
Tabla o barras
```

---

## Panel 8: latencia por URI

Solo debe añadirse si el dataset contiene `response_time`.

```spl
index=curso earliest=-24h latest=now
| eval tiempo_ms=tonumber(response_time)
| where isnotnull(tiempo_ms)
| stats
    avg(tiempo_ms) as media_ms
    perc95(tiempo_ms) as p95_ms
    by uri
| sort - p95_ms
| head 10
```

---

# 11. Filtros del dashboard

El dashboard debe incluir al menos:

1. un filtro temporal;
2. un filtro categórico.

## Filtro temporal

Ejemplos:

- última hora;
- últimas 24 horas;
- últimos 7 días;
- intervalo personalizado.

## Filtro categórico por host

Valores de ejemplo:

```text
web-01
web-02
Todos
```

Consulta conceptual:

```spl
index=curso earliest=$time.earliest$ latest=$time.latest$
host="$host$"
| stats count
```

Cuando se seleccione la opción `Todos`, la lógica del dashboard debe evitar
excluir todos los eventos.

El comportamiento exacto depende de Dashboard Studio o del tipo de dashboard
utilizado.

## Validación del filtro

Cada filtro debe probarse con:

- opción `Todos`;
- un valor específico;
- un valor sin resultados;
- un rango temporal corto;
- un rango temporal amplio.

Documenta el resultado de cada prueba.

---

# 12. Alerta del proyecto

La alerta requerida detecta cinco o más errores HTTP `500` en cinco minutos.

## Consulta operativa

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

## Configuración recomendada

Documenta:

```text
Nombre:
    Cinco HTTP 500 en cinco minutos

Índice:
    curso

Ventana:
    earliest=-5m latest=now

Condición:
    errores_500 >= 5

Frecuencia:
    Según el diseño del laboratorio

Acción:
    La definida en la práctica

Throttling:
    Configurado para evitar repetición innecesaria

Propietario:
    Completar

Destinatario:
    Completar
```

## Prueba histórica

```spl
index=curso earliest="01/01/2026:00:00:00"
          latest="01/01/2026:00:10:00"
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

Esta búsqueda valida la lógica con datos históricos.

No demuestra por sí sola que la alerta en tiempo real funcione.

## Prueba con datos recientes

Para probar el rango relativo, añade eventos recientes a un archivo monitorizado:

```text
timestamp,host,method,status,uri
2026-09-17 18:00:00,web-01,GET,500,/api/users
2026-09-17 18:00:01,web-01,GET,500,/api/users
2026-09-17 18:00:02,web-01,GET,500,/api/users
2026-09-17 18:00:03,web-01,GET,500,/api/users
2026-09-17 18:00:04,web-01,GET,500,/api/users
```

Los timestamps deben adaptarse a la fecha y hora actuales del laboratorio.

---

# 13. Flujo de troubleshooting

Cuando una búsqueda no devuelve resultados, sigue siempre este orden.

## Paso 1: índice

```spl
index=curso earliest=0 latest=now
| stats count
```

## Paso 2: tiempo

```spl
index=curso earliest=0 latest=now
| stats min(_time) as inicio max(_time) as fin
```

## Paso 3: eventos

```spl
index=curso earliest=0 latest=now
| table _time _raw
| head 20
```

## Paso 4: campos

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

## Paso 5: metadatos

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
```

## Paso 6: permisos

```spl
| rest /services/authentication/current-context
| table username roles
```

## Paso 7: SPL

Reduce la consulta a una versión mínima:

```spl
index=curso earliest=0 latest=now
| stats count
```

Después añade los filtros progresivamente.

## Paso 8: objeto

Si la búsqueda funciona, pero el dashboard o la alerta no:

- ejecuta la búsqueda fuera del objeto;
- revisa tokens;
- revisa permisos;
- revisa propietario;
- revisa aplicación;
- revisa intervalo temporal;
- revisa si el objeto está habilitado.

---

# 14. Plantilla de documentación de una búsqueda

Cada búsqueda debe documentarse siguiendo esta estructura:

```markdown
## Nombre

### Objetivo

Describir la pregunta operativa.

### SPL

```spl
index=curso earliest=-24h latest=now
| stats count by host
```

### Campos utilizados

- host

### Intervalo temporal

Últimas 24 horas.

### Resultado esperado

Una tabla con el número de eventos por host.

### Resultado observado

Completar con el resultado real.

### Interpretación

Explicar qué significa.

### Limitaciones

Indicar qué no puede demostrarse.

### Fecha de validación

Completar.
```

---

# 15. Plantilla de documentación de un panel

```markdown
## Panel: URI con más errores

### Objetivo

Identificar las URI con mayor número de respuestas erróneas.

### Consulta

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

### Visualización

Tabla o gráfico de barras.

### Campos

- uri
- status

### Filtro temporal

Sí.

### Interpretación

Las URI superiores concentran el mayor número absoluto de errores.

### Limitaciones

El resultado no mide latencia ni causa raíz.

### Estado de la prueba

Completar.
```

---

# 16. Plantilla de documentación de una alerta

```markdown
## Alerta: cinco HTTP 500 en cinco minutos

### Objetivo

Detectar un volumen elevado de errores internos del servidor.

### Consulta

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

### Condición

errores_500 >= 5

### Frecuencia

Completar.

### Acción

Completar.

### Throttling

Completar.

### Prueba histórica

Indicar la consulta y el resultado.

### Prueba en tiempo real

Indicar cómo se generaron los eventos.

### Limitaciones

Indicar posibles falsos positivos, duplicados o retrasos de ingesta.
```

---

# 17. Buenas prácticas del laboratorio

## Utilizar siempre el índice correcto

Recomendado:

```spl
index=curso earliest=-24h latest=now
```

Evita:

```spl
index=*
```

salvo durante una investigación de diagnóstico justificada.

---

## Incluir siempre un rango temporal

Recomendado:

```spl
earliest=-24h latest=now
```

o:

```spl
earliest=0 latest=now
```

La elección depende del objetivo.

---

## Convertir los campos numéricos

Recomendado:

```spl
| eval status_num=tonumber(status)
```

```spl
| eval tiempo_ms=tonumber(response_time)
```

---

## No inventar campos

Si no existe `clientip`, documenta la ausencia.

Si no existe `response_time`, no afirmes que una URI es más lenta.

---

## Mantener los nombres originales

Recomendado:

```spl
| eval status_num=tonumber(status)
```

Esto conserva `status` para el diagnóstico.

---

## Evitar búsquedas innecesariamente amplias

No ejecutes búsquedas de años completos si solo necesitas los últimos quince
minutos.

---

## Documentar el contexto

Cada búsqueda guardada debe indicar:

- objetivo;
- índice;
- rango;
- campos;
- resultado;
- limitaciones.

---

## Probar antes de guardar

Una búsqueda debe ejecutarse manualmente antes de utilizarse en:

- dashboard;
- reporte;
- alerta;
- ejercicio evaluable.

---

## Separar laboratorio y producción

Los datasets de práctica deben identificarse claramente.

No envíes alertas reales a destinatarios de producción.

---

# 18. Orden recomendado de las prácticas

## Práctica 1: comprobar el entorno

Objetivo:

- validar servicio;
- validar acceso;
- revisar puertos;
- revisar versión.

## Práctica 2: revisar el índice

Objetivo:

- localizar `curso`;
- comprobar estado;
- revisar eventos.

## Práctica 3: cargar el dataset

Objetivo:

- elegir método de ingesta;
- seleccionar índice;
- configurar `sourcetype`;
- validar la vista previa.

## Práctica 4: validar los eventos

Objetivo:

- comprobar cantidad;
- rango temporal;
- campos;
- metadatos.

## Práctica 5: construir búsquedas

Objetivo:

- utilizar `stats`;
- utilizar `eval`;
- utilizar `where`;
- utilizar `timechart`.

## Práctica 6: analizar errores

Objetivo:

- clasificar códigos;
- calcular porcentaje;
- identificar URI y hosts.

## Práctica 7: crear reportes

Objetivo:

- guardar búsquedas;
- definir frecuencia;
- documentar audiencia.

## Práctica 8: crear el dashboard

Objetivo:

- añadir paneles;
- configurar filtros;
- comprobar visualizaciones.

## Práctica 9: crear la alerta

Objetivo:

- probar la consulta;
- configurar la alerta;
- probar datos históricos y recientes;
- aplicar throttling.

## Práctica 10: permisos y documentación

Objetivo:

- revisar roles;
- compartir objetos;
- validar con un usuario final;
- completar la documentación.

---

# 19. Criterios de calidad

Una solución correcta debe ser:

## Reproducible

Otra persona debe poder repetir:

- la ingesta;
- las búsquedas;
- la configuración;
- las pruebas.

## Interpretable

Los resultados deben incluir:

- nombres claros;
- títulos útiles;
- unidades;
- explicación;
- contexto temporal.

## Operativa

El dashboard y las alertas deben ayudar a responder:

- qué está ocurriendo;
- cuándo ocurre;
- dónde ocurre;
- qué componente está afectado;
- qué acción investigar.

## Honesta

La solución debe diferenciar entre:

- hechos observados;
- inferencias;
- limitaciones;
- hipótesis;
- causa raíz demostrada.

## Segura

No debe exponer:

- credenciales;
- tokens;
- información personal;
- secretos;
- datos de producción;
- configuraciones sensibles.

---

# 20. Evidencias recomendadas

Cada asistente debería conservar evidencias de:

- estado del servicio;
- versión de Splunk;
- existencia del índice;
- número de eventos;
- rango temporal;
- metadatos;
- campos;
- búsquedas ejecutadas;
- reportes;
- dashboard;
- filtros;
- alerta;
- permisos;
- pruebas realizadas.

Una evidencia útil debe incluir:

- fecha;
- contexto;
- consulta o configuración;
- resultado;
- interpretación.

No incluyas secretos ni datos personales en las capturas.

---

# 21. Referencias oficiales

## Splunk

- [Splunk Enterprise Documentation](https://docs.splunk.com/Documentation/Splunk)
- [Splunk Help](https://help.splunk.com/)
- [Splunk Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchapp)
- [Splunk Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)
- [Get Data In](https://docs.splunk.com/Documentation/Splunk/latest/Get started/Getdatain)
- [How Splunk Processes Data](https://docs.splunk.com/Documentation/Splunk/latest/Data/HowSplunkprocessesdata)
- [Monitor Files and Directories](https://docs.splunk.com/Documentation/Splunk/latest/Data/Monitorfilesanddirectories)
- [About Indexes](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Splunk Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)
- [Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/IntroFrame)
- [About Alerts](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Users and Roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Knowledge Objects](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)
- [Splunk REST API Reference](https://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTprolog)
- [Troubleshooting](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Aboutthismanual)

## Ubuntu

- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)
- [Systemd en Ubuntu](https://documentation.ubuntu.com/server/explanation/systemd/)

---

# 22. Referencias de configuración

- [`inputs.conf`](https://help.splunk.com/en/data-management/splunk-enterprise-admin-manual/10.4/configuration-file-reference/10.4.0-configuration-file-reference/inputs.conf)
- [`indexes.conf`](https://help.splunk.com/en/data-management/splunk-enterprise-admin-manual/10.4/configuration-file-reference/10.4.0-configuration-file-reference/indexes.conf)
- [`props.conf`](https://help.splunk.com/en/data-management/splunk-enterprise-admin-manual/10.4/configuration-file-reference/10.4.0-configuration-file-reference/props.conf)
- [`transforms.conf`](https://help.splunk.com/en/data-management/splunk-enterprise-admin-manual/10.4/configuration-file-reference/10.4.0-configuration-file-reference/transforms.conf)

La documentación de configuración debe contrastarse con la versión instalada y con
la estructura de aplicaciones existente.

---

# 23. Lista de comprobación global

## Entorno

- [ ] Splunk está instalado.
- [ ] La versión está documentada.
- [ ] Splunkd está activo.
- [ ] Splunk Web responde.
- [ ] El usuario puede iniciar sesión.
- [ ] Los puertos necesarios están comprobados.
- [ ] Se distingue el rol de Splunk de los permisos de Ubuntu.

## Índice

- [ ] Existe el índice `curso`.
- [ ] Está habilitado.
- [ ] Tiene permisos adecuados.
- [ ] Se conoce su finalidad.
- [ ] Se ha documentado la retención.

## Datos

- [ ] El dataset está disponible.
- [ ] La estructura está documentada.
- [ ] El formato está validado.
- [ ] El timestamp es correcto.
- [ ] Los campos obligatorios existen.
- [ ] Las limitaciones están documentadas.

## Ingesta

- [ ] La entrada está configurada.
- [ ] El archivo es legible.
- [ ] El `source` está documentado.
- [ ] El `sourcetype` está documentado.
- [ ] No hay duplicación de entradas.
- [ ] Los eventos aparecen en el índice.

## SPL

- [ ] Las búsquedas incluyen índice.
- [ ] Las búsquedas incluyen tiempo.
- [ ] Se convierten los campos numéricos.
- [ ] Se comprueban los valores nulos.
- [ ] Las consultas tienen un objetivo.
- [ ] Los resultados están interpretados.

## Dashboard

- [ ] Tiene al menos seis paneles.
- [ ] Incluye una vista temporal.
- [ ] Incluye errores HTTP.
- [ ] Incluye una dimensión de host o IP.
- [ ] Incluye una dimensión URI.
- [ ] Tiene filtros.
- [ ] Se ha probado la opción `Todos`.
- [ ] Se han revisado permisos.

## Alertas

- [ ] La consulta se ha probado manualmente.
- [ ] La ventana temporal es correcta.
- [ ] El umbral está documentado.
- [ ] La alerta está habilitada.
- [ ] La acción está configurada.
- [ ] Se ha probado con datos históricos.
- [ ] Se ha probado con datos recientes.
- [ ] El throttling está documentado.

## Seguridad

- [ ] No se exponen credenciales.
- [ ] No se exponen tokens.
- [ ] No se incluyen datos sensibles.
- [ ] Los objetos tienen propietario.
- [ ] Los permisos están justificados.
- [ ] Se diferencia admin de usuario final.

## Documentación

- [ ] Se incluyen consultas SPL.
- [ ] Se incluyen resultados.
- [ ] Se incluyen limitaciones.
- [ ] Se incluyen referencias.
- [ ] Se indican fechas de consulta.
- [ ] Otra persona puede reproducir la solución.