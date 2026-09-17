# Curso práctico de Splunk

Bienvenido al curso de **Splunk Enterprise**, orientado al análisis, la
monitorización y la visualización de datos operativos.

El curso está pensado para trabajar sobre una instancia real de Splunk
Enterprise con acceso administrativo durante el laboratorio. Aprenderás a
validar la plataforma, cargar datos, escribir búsquedas SPL y convertirlas en
objetos reutilizables para operaciones:

- búsquedas guardadas;
- reportes;
- visualizaciones;
- dashboards;
- alertas;
- documentación técnica;
- procedimientos de troubleshooting.

El objetivo no es únicamente aprender comandos SPL. El objetivo es comprender
cómo se transforma una fuente de datos en una decisión operativa:

```text
Fuente
    ↓
Ingesta
    ↓
Índice
    ↓
Tiempo del evento
    ↓
Campos y metadatos
    ↓
Búsqueda SPL
    ↓
Resultado
    ↓
Visualización o acción
```

Una consulta no debe considerarse correcta solo porque devuelva resultados o
muestre un gráfico. Debes comprobar:

- qué eventos utiliza;
- de qué índice proceden;
- qué rango temporal se aplica;
- qué campos están extraídos;
- qué tipo de datos tienen;
- qué permisos utiliza el usuario;
- qué limitaciones tiene el dataset;
- si el resultado responde realmente a una pregunta operativa.

---

# 1. Información general del curso

## 1.1 Duración

El curso tiene una duración total de **18 horas**, distribuidas en:

- 3 sesiones;
- 6 horas por sesión;
- laboratorios guiados;
- ejercicios individuales;
- retos de análisis;
- proyecto final.

| Sesión | Tema principal | Duración |
|---|---|---:|
| Sesión 1 | Fundamentos, plataforma e ingestión | 6 horas |
| Sesión 2 | Búsquedas, comandos y funciones SPL | 6 horas |
| Sesión 3 | Reportes, dashboards, alertas y proyecto | 6 horas |

---

## 1.2 Nivel recomendado

El curso está orientado a personas con conocimientos básicos de:

- sistemas Linux;
- archivos de texto y CSV;
- redes y puertos;
- aplicaciones web;
- códigos HTTP;
- conceptos básicos de monitorización;
- uso de terminal;
- interpretación de tablas y gráficos.

No es necesario conocer SPL antes de comenzar.

---

## 1.3 Entorno de trabajo

Los laboratorios están diseñados para ejecutarse sobre:

- Ubuntu 24.04.5 LTS;
- Splunk Enterprise 10.4.3;
- una instalación local o de laboratorio;
- acceso a Splunk Web;
- permisos administrativos durante la configuración;
- un índice de trabajo denominado `curso`.

La ruta habitual de instalación utilizada en los ejemplos es:

```text
/opt/splunk
```

Los puertos habituales son:

| Puerto | Uso |
|---:|---|
| `8000` | Splunk Web |
| `8089` | Management port y API REST |
| `9997` | Recepción de forwarders, si se utiliza |
| `8088` | HTTP Event Collector, si se utiliza |

La instalación real puede utilizar otros puertos, usuarios o rutas. Los asistentes
deben comprobar los valores reales de su entorno antes de aplicar una corrección.

---

# 2. Objetivos del curso

Al finalizar la formación podrás:

- comprender la arquitectura básica de Splunk;
- explicar la diferencia entre Splunk Web y `splunkd`;
- identificar los puertos principales;
- comprobar el estado de Splunk Enterprise;
- distinguir el rol `admin` de los permisos de Ubuntu;
- instalar o validar Splunk Enterprise 10.4.3 en Ubuntu 24.04.5 LTS;
- crear y administrar índices;
- incorporar archivos y logs;
- configurar entradas de datos;
- revisar `source`, `sourcetype` y `host`;
- validar `_time` e `_indextime`;
- realizar búsquedas mediante SPL;
- filtrar eventos;
- crear campos calculados;
- convertir campos numéricos;
- extraer campos con `rex`;
- analizar estructuras JSON con `spath`;
- crear estadísticas con `stats`;
- crear series temporales con `timechart`;
- identificar errores HTTP;
- analizar hosts, URI e IP cuando existan;
- calcular porcentajes y tasas;
- analizar latencia cuando exista el campo correspondiente;
- crear búsquedas guardadas;
- crear reportes programados;
- crear visualizaciones;
- diseñar dashboards interactivos;
- configurar filtros temporales y categóricos;
- configurar alertas;
- aplicar throttling;
- comprobar permisos;
- resolver problemas básicos de funcionamiento;
- documentar resultados y limitaciones;
- distinguir hechos observados de hipótesis operativas.

---

# 3. Cómo trabajar en el curso

Usa siempre este flujo:

```text
Fuente
    ↓
Ingesta
    ↓
Índice
    ↓
Tiempo
    ↓
Metadatos
    ↓
Campos
    ↓
SPL
    ↓
Resultado
    ↓
Objeto reutilizable
    ↓
Acción operativa
```

## 3.1 Validación antes del análisis

Antes de construir un dashboard o una alerta, comprueba:

1. que Splunk está activo;
2. que los datos han llegado;
3. que el índice es correcto;
4. que el rango temporal contiene eventos;
5. que `_time` es válido;
6. que los campos existen;
7. que los tipos son correctos;
8. que el usuario tiene permisos;
9. que la consulta produce resultados razonables.

## 3.2 No empezar por la consulta final

No empieces directamente con una consulta compleja como:

```spl
index=curso status=500 sourcetype=web:csv uri="/api/users"
| eval status_num=tonumber(status)
| timechart span=1m count by host
```

Primero valida:

```spl
index=curso earliest=0 latest=now
| stats count
```

Después:

```spl
index=curso earliest=0 latest=now
| table _time _raw host source sourcetype method status uri
| head 20
```

A continuación añade condiciones una a una.

## 3.3 Reproducibilidad

Cada consulta del curso debe documentar:

- objetivo;
- índice;
- intervalo temporal;
- campos utilizados;
- SPL;
- resultado esperado;
- resultado observado;
- interpretación;
- limitaciones;
- usuario o rol utilizado;
- fecha de validación.

---

# 4. El dataset del curso

En el laboratorio se utiliza principalmente el índice:

```text
curso
```

El dataset básico se denomina:

```text
eventos_web.csv
```

## 4.1 Campos mínimos

El dataset mínimo contiene:

```text
timestamp
host
method
status
uri
```

Ejemplo:

```text
timestamp,host,method,status,uri
2026-01-01T00:00:00Z,web-01,GET,200,/login
2026-01-01T00:01:00Z,web-01,GET,404,/missing
2026-01-01T00:02:00Z,web-02,POST,500,/api/users
```

## 4.2 Campos ampliados

Algunas actividades requieren una fuente ampliada con:

```text
client_ip
response_time
user_agent
bytes
referer
```

Ejemplo:

```text
timestamp,host,method,status,uri,client_ip,response_time,user_agent,bytes,referer
2026-01-01T00:00:00Z,web-01,GET,200,/,192.0.2.10,120,Mozilla,1536,-
2026-01-01T00:01:00Z,web-01,GET,404,/missing,192.0.2.11,85,Mozilla,512,-
2026-01-01T00:02:00Z,web-02,POST,500,/api/users,192.0.2.12,2100,curl,256,-
```

## 4.3 Limitaciones del dataset

No se deben inventar métricas que los datos no permitan calcular.

Si no existe `client_ip`, documenta:

> El dataset no contiene una IP de origen. No es posible realizar un análisis
> fiable por cliente. Se utiliza `host` como dimensión alternativa.

Si no existe `response_time`, documenta:

> El dataset no contiene un tiempo de respuesta. No es posible determinar qué URI
> es más lenta. Se utiliza como alternativa la URI con más errores.

## 4.4 Fechas del dataset

El dataset de referencia contiene eventos del:

```text
1 de enero de 2026
```

Por tanto, una búsqueda relativa como:

```spl
index=curso earliest=-24h latest=now
```

puede no devolver resultados si se ejecuta después de esa fecha.

Para validar el dataset histórico, utiliza:

```spl
index=curso
earliest="01/01/2026:00:00:00"
latest="01/01/2026:23:59:59"
| stats count
```

O, para una primera comprobación controlada:

```spl
index=curso earliest=0 latest=now
| stats count
```

---

# 5. Flujo principal de trabajo

Utiliza esta secuencia en todas las prácticas:

## Paso 1: plataforma

Comprueba que Splunk está instalado y activo.

```bash
/opt/splunk/bin/splunk version
```

```bash
sudo systemctl status Splunkd
```

## Paso 2: acceso web

Comprueba que Splunk Web responde:

```bash
curl -I http://127.0.0.1:8000
```

## Paso 3: índice

Confirma que existe `curso`:

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

## Paso 4: eventos

Ejecuta una búsqueda mínima:

```spl
index=curso earliest=0 latest=now
| stats
    count as total
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

## Paso 5: campos y metadatos

```spl
index=curso earliest=0 latest=now
| table
    _time
    _indextime
    host
    source
    sourcetype
    method
    status
    uri
    _raw
| head 20
```

## Paso 6: análisis

Solo después de validar los datos, empieza a crear búsquedas de:

- volumen;
- errores;
- tráfico;
- URI;
- hosts;
- latencia;
- IP;
- alertas.

## Paso 7: objetos

Convierte las búsquedas en:

- reportes;
- dashboards;
- alertas;
- búsquedas guardadas.

## Paso 8: permisos y documentación

Prueba con el rol final y documenta las limitaciones.

---

# 6. Programa detallado

## Sesión 1: fundamentos e ingestión

### Objetivo

Comprender cómo funciona la plataforma y cómo llegan los datos a Splunk.

### Contenidos

- Arquitectura básica.
- Splunk Web y `splunkd`.
- Puertos principales.
- Usuarios y roles.
- Diferencia entre Admin de Splunk y `sudo`.
- Índices.
- Fuentes.
- `source`.
- `sourcetype`.
- `host`.
- Eventos.
- `_raw`.
- `_time`.
- `_indextime`.
- Ingesta mediante archivo.
- Monitorización de archivos.
- Validación de permisos.
- Troubleshooting inicial.

### Prácticas

1. Comprobar la versión de Splunk.
2. Revisar el estado del servicio.
3. Acceder a Splunk Web.
4. Crear o revisar el índice `curso`.
5. Preparar `eventos_web.csv`.
6. Cargar el dataset.
7. Revisar los eventos.
8. Validar metadatos.
9. Comprobar el rango temporal.
10. Documentar la ingesta.

### Búsqueda inicial

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

### Evidencias

El asistente debe conservar:

- versión;
- estado del servicio;
- nombre del índice;
- ruta del archivo;
- `source`;
- `sourcetype`;
- `host`;
- primer evento;
- último evento;
- número total de eventos.

---

## Sesión 2: búsquedas, comandos y funciones SPL

### Objetivo

Construir búsquedas reproducibles y convertir eventos en información operativa.

### Contenidos

- Sintaxis SPL.
- Comando `search`.
- Comando `where`.
- Comando `eval`.
- Comando `stats`.
- Comando `eventstats`.
- Comando `streamstats`.
- Comando `timechart`.
- Comando `table`.
- Comando `sort`.
- Comando `head`.
- Comando `rex`.
- Comando `spath`.
- Comando `fieldsummary`.
- Funciones de texto.
- Funciones numéricas.
- Funciones condicionales.
- Funciones temporales.
- Conversión de tipos.
- Valores nulos.
- Campos multivalor.
- Calidad de datos.
- Optimización básica.

### Prácticas

1. Contar eventos.
2. Contar peticiones por host.
3. Contar peticiones por método.
4. Clasificar códigos HTTP.
5. Calcular errores.
6. Calcular porcentaje de error.
7. Analizar errores por URI.
8. Crear series temporales.
9. Probar campos opcionales.
10. Documentar limitaciones.

### Consulta de ejemplo

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| eval resultado=if(
    status_num>=400,
    "Error",
    "Correcta"
)
| stats count as peticiones by resultado
```

### Regla de normalización

Convierte los campos numéricos antes de compararlos:

```spl
| eval status_num=tonumber(status)
```

```spl
| eval tiempo_ms=tonumber(response_time)
```

---

## Sesión 3: reportes, dashboards, alertas y proyecto

### Objetivo

Convertir las búsquedas en objetos reutilizables y operativos.

### Contenidos

- Búsquedas guardadas.
- Reportes.
- Programación.
- Dashboard Studio.
- Paneles.
- Single values.
- Gráficos de líneas.
- Tablas.
- Filtros temporales.
- Filtros por host.
- Filtros por status.
- Tokens.
- Alertas.
- Condiciones.
- Frecuencia.
- Throttling.
- Acciones.
- Permisos.
- Validación con usuarios finales.
- Documentación del proyecto.

### Prácticas

1. Crear un reporte de errores por URI.
2. Crear un reporte de tráfico por host.
3. Crear el dashboard de monitorización.
4. Añadir selector temporal.
5. Añadir filtro por `host` o `status`.
6. Crear la alerta de HTTP 500.
7. Probar la alerta con datos históricos.
8. Probar la alerta con datos recientes.
9. Revisar permisos.
10. Presentar el proyecto final.

---

# 7. Metodología

Cada sesión combina:

- explicaciones conceptuales;
- demostraciones del instructor;
- laboratorios guiados;
- ejercicios individuales;
- retos de análisis;
- revisión de resultados;
- documentación técnica;
- proyecto final.

## 7.1 Demostración

El instructor mostrará:

- el objetivo;
- la consulta;
- el resultado;
- la interpretación;
- los errores habituales;
- la forma de validar.

## 7.2 Laboratorio guiado

Los asistentes repetirán el procedimiento en su propia instancia.

Cada práctica debe dejar una evidencia.

## 7.3 Ejercicio individual

El asistente modificará una consulta o resolverá un caso de forma autónoma.

## 7.4 Reto de análisis

Se plantea una pregunta operativa sin proporcionar directamente la consulta.

Ejemplo:

> ¿Qué URI concentra más errores HTTP 500 durante el periodo analizado?

El asistente debe:

1. identificar los campos;
2. elegir el rango;
3. construir la consulta;
4. validar el resultado;
5. explicar las limitaciones.

---

# 8. Convenciones del curso

## 8.1 Índice

Utiliza principalmente:

```spl
index=curso
```

Evita utilizar:

```spl
index=*
```

salvo para una investigación justificada.

## 8.2 Rango temporal

Incluye un rango explícito en búsquedas guardadas:

```spl
earliest=-24h latest=now
```

Para datasets históricos:

```spl
earliest=0 latest=now
```

o un intervalo absoluto.

## 8.3 Campos numéricos

Normaliza:

```spl
| eval status_num=tonumber(status)
```

```spl
| eval response_time_num=tonumber(response_time)
```

## 8.4 Nombres claros

Utiliza nombres como:

```text
total_peticiones
errores_500
porcentaje_error
tiempo_ms
p95_ms
```

Evita nombres ambiguos como:

```text
x
y
resultado1
```

## 8.5 Campos originales

Durante la investigación, conserva los valores originales:

```spl
| eval status_num=tonumber(status)
```

No sustituyas inmediatamente `status` por el valor convertido.

## 8.6 División entre cero

Protege las divisiones:

```spl
| eval porcentaje_error=if(
    total>0,
    round(errores*100/total, 2),
    0
)
```

## 8.7 Límites en rankings

Limita los resultados:

```spl
| sort - errores
| head 10
```

---

# 9. Búsquedas iniciales

## 9.1 Contar eventos

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

## 9.2 Revisar el rango temporal

```spl
index=curso earliest=0 latest=now
| stats
    min(_time) as inicio
    max(_time) as fin
```

## 9.3 Revisar eventos

```spl
index=curso earliest=0 latest=now
| table _time _raw
| head 20
```

## 9.4 Revisar metadatos

```spl
index=curso earliest=0 latest=now
| stats count by source sourcetype host
| sort - count
```

## 9.5 Revisar campos

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

## 9.6 Revisar códigos HTTP

```spl
index=curso earliest=0 latest=now
| stats count by status
| sort - count
```

## 9.7 Normalizar códigos HTTP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| stats count by status_num
| sort status_num
```

---

# 10. Entregables del curso

## 10.1 Entregables de la sesión 1

- [ ] Estado de Splunk documentado.
- [ ] Versión documentada.
- [ ] Índice `curso` validado.
- [ ] Dataset cargado.
- [ ] Entrada documentada.
- [ ] `source` validado.
- [ ] `sourcetype` validado.
- [ ] `host` validado.
- [ ] Primer y último evento documentados.
- [ ] Problemas de ingesta documentados, si existen.

## 10.2 Entregables de la sesión 2

- [ ] Búsqueda de volumen.
- [ ] Búsqueda de errores.
- [ ] Porcentaje de error.
- [ ] Errores por URI.
- [ ] Errores HTTP 500.
- [ ] Evolución temporal.
- [ ] Consulta de calidad de datos.
- [ ] Normalización de campos.
- [ ] Interpretación de resultados.
- [ ] Limitaciones documentadas.

## 10.3 Entregables de la sesión 3

- [ ] Reporte de errores por URI.
- [ ] Reporte de tráfico por host.
- [ ] Dashboard con seis o más paneles.
- [ ] Selector temporal.
- [ ] Filtro por host o status.
- [ ] Alerta de cinco HTTP 500 en cinco minutos.
- [ ] Throttling documentado.
- [ ] Pruebas de la alerta.
- [ ] Permisos revisados.
- [ ] Proyecto final entregado.

---

# 11. Proyecto final

## 11.1 Contexto

La empresa ficticia `WebCorp` necesita monitorizar sus servidores web para detectar
fallos y analizar el comportamiento de sus aplicaciones.

El asistente debe implementar una solución básica de observabilidad en Splunk.

## 11.2 Requisitos funcionales

La solución debe incluir:

### Cinco búsquedas SPL

1. Volumen total de peticiones.
2. Porcentaje de error.
3. Errores por URI.
4. Errores HTTP 500.
5. Evolución temporal del tráfico.

### Dos reportes

1. Reporte de errores por URI.
2. Reporte de tráfico por host.

### Un dashboard

Debe contener al menos:

1. Total de peticiones.
2. Total de errores.
3. Porcentaje de error.
4. Peticiones por minuto.
5. Errores HTTP.
6. Host o IP con más errores.
7. URI con más errores.
8. Latencia por URI, solo si existe el campo.

### Una alerta

Debe detectar:

```text
Cinco o más errores HTTP 500 en cinco minutos.
```

Consulta de referencia:

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

## 11.3 Requisitos de documentación

Cada elemento debe incluir:

- nombre;
- objetivo;
- SPL;
- índice;
- rango temporal;
- campos;
- resultado esperado;
- interpretación;
- limitaciones;
- propietario;
- permisos;
- evidencia de validación.

---

# 12. Criterios de calidad

Una solución de calidad debe ser:

## Reproducible

Otra persona debe poder repetir:

- la ingesta;
- las búsquedas;
- la configuración;
- las pruebas;
- la interpretación.

## Trazable

Debe poder saberse:

- de qué fuente procede el dato;
- en qué índice se almacena;
- qué `sourcetype` utiliza;
- qué consulta lo transforma;
- qué panel lo visualiza;
- qué alerta lo utiliza.

## Interpretable

Los resultados deben utilizar:

- títulos claros;
- nombres descriptivos;
- unidades;
- rangos temporales;
- leyendas;
- explicaciones;
- contexto operativo.

## Segura

No debe exponer:

- credenciales;
- tokens;
- claves privadas;
- datos personales;
- cookies;
- cabeceras de autenticación;
- información de producción.

## Honesta

La documentación debe diferenciar entre:

- hecho observado;
- inferencia;
- hipótesis;
- limitación;
- causa raíz demostrada.

Un aumento de HTTP 500 indica un problema observado, pero no demuestra por sí
solo que la causa sea CPU, memoria, base de datos o red.

---

# 13. Troubleshooting durante el curso

Cuando algo falle, sigue este orden:

```text
Servicio
    ↓
Red
    ↓
Entrada
    ↓
Índice
    ↓
Tiempo
    ↓
Eventos
    ↓
Campos
    ↓
SPL
    ↓
Objeto
    ↓
Permisos
```

## 13.1 Si Splunk no inicia

Consulta:

```text
troubleshooting/splunk-no-inicia.md
```

Comandos iniciales:

```bash
sudo systemctl status Splunkd
```

```bash
sudo tail -n 100 \
  /opt/splunk/var/log/splunk/splunkd.log
```

## 13.2 Si Splunk Web no abre

Consulta:

```text
troubleshooting/acceso-web.md
```

Comandos iniciales:

```bash
sudo ss -ltnp | grep -E ':8000|:8089'
```

```bash
curl -I http://127.0.0.1:8000
```

## 13.3 Si no aparecen eventos

Consulta:

```text
troubleshooting/datos-no-aparecen.md
```

Búsqueda inicial:

```spl
index=curso earliest=0 latest=now
| stats count
```

## 13.4 Si los campos son incorrectos

Consulta:

```text
troubleshooting/campos-incorrectos.md
```

Búsqueda inicial:

```spl
index=curso earliest=0 latest=now
| table _raw host source sourcetype status uri
| head 20
```

## 13.5 Si una consulta es lenta

Utiliza:

- Job Inspector;
- Monitoring Console;
- intervalo temporal menor;
- filtros más específicos;
- selección de campos;
- revisión de comandos costosos.

---

# 14. Diferencia entre Admin de Splunk y administrador de Ubuntu

Tener el rol `admin` de Splunk no implica tener automáticamente permisos de
`sudo` en Ubuntu.

| Nivel | Ejemplo | Finalidad |
|---|---|---|
| Splunk | Rol `admin` | Gestionar índices, búsquedas, usuarios y objetos |
| Ubuntu | `sudo` | Gestionar servicios y archivos del sistema |
| Filesystem | Permiso de lectura | Permitir que Splunk lea un archivo |
| Red | Firewall y puertos | Permitir comunicaciones |

Durante el curso se utilizará `admin` para facilitar la configuración, pero se
debe explicar cómo funcionaría una separación real entre:

- administrador;
- analista;
- operador;
- usuario de visualización;
- propietario de alertas.

No concedas `admin` como solución para:

- leer un índice;
- ver un dashboard;
- ejecutar una búsqueda;
- consultar un campo;
- recibir un reporte.

---

# 15. Validación con usuarios y roles

Una configuración no está terminada cuando funciona solo con `admin`.

Comprueba el contexto del usuario:

```spl
| rest /services/authentication/current-context
| table username roles
```

Después prueba con el rol final:

```spl
index=curso earliest=0 latest=now
| stats count
```

Comprueba:

- acceso al índice;
- aplicación activa;
- permisos de lectura;
- visibilidad de dashboards;
- visibilidad de reportes;
- capacidad de ejecutar búsquedas;
- acceso a alertas;
- objetos compartidos.

---

# 16. Estructura recomendada de los ficheros

La documentación del curso se organiza de la siguiente forma:

```text
curso-splunk/
├── index.md
├── preparacion/
│   ├── index.md
│   ├── requisitos.md
│   ├── instalacion.md
│   ├── puertos-directorios.md
│   └── datasets.md
├── sesion-1/
│   ├── index.md
│   ├── arquitectura.md
│   ├── usuarios-roles.md
│   ├── ingesta-datos.md
│   ├── indices.md
│   └── validacion-datos.md
├── sesion-2/
│   ├── index.md
│   ├── introduccion-spl.md
│   ├── gestion-tiempo.md
│   ├── comandos-spl.md
│   ├── funciones-spl.md
│   ├── extraccion-campos.md
│   └── ejercicios.md
├── sesion-3/
│   ├── index.md
│   ├── reportes.md
│   ├── dashboards.md
│   ├── alertas.md
│   ├── permisos-objetos.md
│   └── proyecto.md
├── referencia/
│   ├── index.md
│   ├── comandos-spl.md
│   ├── funciones-spl.md
│   ├── plantillas-consultas.md
│   ├── glosario.md
│   ├── puertos-directorios.md
│   └── bibliografia.md
├── proyecto/
│   ├── index.md
│   ├── requisitos.md
│   ├── caso-practico.md
│   ├── entregables.md
│   └── evaluacion.md
└── troubleshooting/
    ├── index.md
    ├── splunk-no-inicia.md
    ├── acceso-web.md
    ├── datos-no-aparecen.md
    └── campos-incorrectos.md
```

La estructura exacta puede variar, pero los enlaces deben mantenerse coherentes
con las rutas reales del repositorio.

---

# 17. Convenciones de nombres

## Ficheros

Utiliza nombres en minúsculas y separados por guiones:

```text
datos-no-aparecen.md
campos-incorrectos.md
plantillas-consultas.md
```

## Búsquedas

Utiliza nombres descriptivos:

```text
Curso - Volumen total de peticiones
Curso - Porcentaje de errores
Curso - Errores por URI
Curso - HTTP 500 en cinco minutos
```

## Campos calculados

Utiliza nombres claros:

```text
status_num
porcentaje_error
errores_500
tiempo_ms
p95_ms
resultado
familia_http
```

## Índices y objetos

El índice principal del laboratorio es:

```text
curso
```

Los objetos creados para el proyecto deberían utilizar una aplicación propia,
por ejemplo:

```text
curso_monitorizacion
```

---

# 18. Evidencias del curso

Cada asistente debe conservar evidencias de:

- versión de Splunk;
- estado del servicio;
- índice `curso`;
- entrada de datos;
- archivo de origen;
- `source`;
- `sourcetype`;
- `host`;
- primer y último evento;
- búsquedas SPL;
- resultados;
- reportes;
- dashboard;
- filtros;
- alerta;
- pruebas;
- permisos;
- troubleshooting realizado.

Una evidencia debe incluir:

- fecha;
- usuario;
- contexto;
- consulta o configuración;
- resultado;
- interpretación.

Antes de compartir capturas o archivos, elimina:

- contraseñas;
- tokens;
- claves privadas;
- datos personales;
- información de producción.

---

# 19. Criterios de finalización

Al terminar deberías poder:

- comprobar que Splunk está activo y accesible;
- explicar dónde están los datos;
- explicar cómo se ingirieron;
- buscar en el índice correcto;
- utilizar un rango temporal válido;
- validar `_time`;
- validar `_indextime`;
- interpretar `host`;
- interpretar `source`;
- interpretar `sourcetype`;
- revisar `_raw`;
- comprobar campos;
- crear consultas SPL con filtros;
- utilizar `stats`;
- utilizar `timechart`;
- transformar campos con `eval`;
- extraer campos con `rex` o `spath`;
- crear rankings;
- calcular porcentajes;
- diseñar un dashboard operativo;
- configurar filtros;
- crear reportes;
- configurar una alerta;
- evitar ruido innecesario;
- revisar permisos;
- probar con el rol final;
- diagnosticar problemas de acceso;
- diagnosticar problemas de ingesta;
- diagnosticar problemas de tiempo;
- diagnosticar problemas de campos;
- documentar limitaciones;
- utilizar Job Inspector cuando corresponda;
- explicar qué significa cada resultado.

---

# 20. Acceso rápido

- [Preparar el laboratorio](preparacion/index.md)
- [Requisitos](curso/requisitos.md)
- [Instalación](preparacion/instalacion.md)
- [Puertos y directorios](referencia/puertos-directorios.md)
- [Datasets](recursos/datasets.md)
- [Comenzar la sesión 1](sesion-1/index.md)
- [Comenzar la sesión 2](sesion-2/index.md)
- [Comenzar la sesión 3](sesion-3/index.md)
- [Consultar comandos SPL](referencia/comandos-spl.md)
- [Consultar funciones SPL](referencia/funciones-spl.md)
- [Consultar plantillas de consultas](referencia/plantillas-consultas.md)
- [Consultar el glosario](referencia/glosario.md)
- [Revisar el proyecto final](proyecto/index.md)
- [Revisar los entregables](proyecto/entregables.md)
- [Revisar la evaluación](proyecto/evaluacion.md)
- [Solucionar problemas](troubleshooting/index.md)
- [Splunk no inicia](troubleshooting/splunk-no-inicia.md)
- [Problemas de acceso web](troubleshooting/acceso-web.md)
- [Datos no aparecen](troubleshooting/datos-no-aparecen.md)
- [Campos incorrectos](troubleshooting/campos-incorrectos.md)

---

# 21. Inicio rápido

## Paso 1: comprobar el servicio

```bash
sudo systemctl status Splunkd
```

## Paso 2: comprobar Splunk Web

```bash
curl -I http://127.0.0.1:8000
```

Comprueba en el navegador:

```text
http://localhost:8000
```

Si la instancia utiliza HTTPS, utiliza la URL y el puerto configurados en el
entorno.

## Paso 3: confirmar el índice

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

## Paso 4: cargar el dataset

Carga:

```text
eventos_web.csv
```

Selecciona:

- índice `curso`;
- `sourcetype` coherente;
- timestamp correcto;
- formato adecuado;
- ruta o método de ingesta documentado.

## Paso 5: seleccionar el intervalo correcto

El dataset de referencia contiene eventos del 1 de enero de 2026.

Para una validación amplia:

```spl
index=curso earliest=0 latest=now
| stats count
```

Para un intervalo absoluto:

```spl
index=curso
earliest="01/01/2026:00:00:00"
latest="01/01/2026:23:59:59"
| stats count
```

## Paso 6: ejecutar una búsqueda mínima

```spl
index=curso
| stats
    count as total
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

## Paso 7: revisar un evento

```spl
index=curso
| table
    _time
    _indextime
    host
    source
    sourcetype
    method
    status
    uri
    _raw
| head 20
```

## Paso 8: continuar con la sesión correspondiente

- Si estás preparando el entorno, continúa con `preparacion/index.md`.
- Si estás aprendiendo ingestión, continúa con `sesion-1/index.md`.
- Si estás trabajando con SPL, continúa con `sesion-2/index.md`.
- Si estás creando objetos operativos, continúa con `sesion-3/index.md`.
- Si estás resolviendo un problema, continúa con `troubleshooting/index.md`.

Si no aparecen resultados, consulta [Datos no aparecen](troubleshooting/datos-no-aparecen.md)
antes de añadir filtros complejos o volver a cargar el archivo.

---

# 22. Referencias oficiales

## Documentación general

- [Documentación general de Splunk](https://docs.splunk.com/Documentation/Splunk)
- [Splunk Enterprise Documentation](https://help.splunk.com/en/splunk-enterprise)
- [Notas de versión de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/ReleaseNotes)
- [Splunk Answers](https://community.splunk.com/)
- [Splunk Lantern](https://lantern.splunk.com/)

## Búsquedas y SPL

- [Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/WhatsInThisManual)
- [Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Overview)
- [Comandos de búsqueda](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)
- [Funciones SPL](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/CommonEvalFunctions)
- [Operaciones en tiempo de búsqueda](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Searchtimeoperations)
- [Extracción de campos](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Extractfields)
- [Comando `rex`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Rex)
- [Comando `spath`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Spat h)
- [Comando `fieldsummary`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fieldsummary)

## Ingesta e índices

- [Introducción a la entrada de datos](https://docs.splunk.com/Documentation/Splunk/latest/Data/Whatissource)
- [Monitorizar archivos y directorios](https://docs.splunk.com/Documentation/Splunk/latest/Data/Monitorfilesanddirectories)
- [Índices](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Cómo procesa Splunk los datos](https://docs.splunk.com/Documentation/Splunk/latest/Data/HowSplunkprocessesdata)
- [Referencia de `inputs.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Inputsconf)
- [Referencia de `indexes.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Indexesconf)
- [Referencia de `props.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Propsconf)
- [Referencia de `transforms.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Transformsconf)

## Dashboards y visualización

- [Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/AboutDashboards)
- [Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/IntroFrame)
- [Visualizaciones](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)

## Alertas y reportes

- [Alertas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Crear alertas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Definescheduledalerts)
- [Throttling de alertas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/ThrottleAlerts)
- [Búsquedas guardadas](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Definesearches)

## Seguridad y permisos

- [Roles y capacidades](https://docs.splunk.com/Documentation/Splunk/latest/Security/Rolesandcapabilities)
- [Usuarios y roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Objetos de conocimiento](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)
- [Permisos de objetos](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Manageknowledgeobjects)

## Troubleshooting

- [Troubleshooting de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Abouttroubleshooting)
- [Troubleshooting de datos](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Troubleshootingyourdata)
- [Monitoring Console](https://docs.splunk.com/Documentation/Splunk/latest/Monitor/MonitoringConsole)
- [Job Inspector](https://docs.splunk.com/Documentation/Splunk/latest/Search/Viewsearchjobproperties)
- [Índice de auditoría](https://docs.splunk.com/Documentation/Splunk/latest/Security/Auditindex)

## Ubuntu

- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)
- [Systemd en Ubuntu](https://documentation.ubuntu.com/server/explanation/systemd/)
- [Firewall en Ubuntu](https://documentation.ubuntu.com/server/how-to/security/firewalls/)

---

# 23. Nota sobre licencias y versiones

La disponibilidad de funciones, límites y opciones puede depender de:

- versión de Splunk;
- tipo de licencia;
- sistema operativo;
- arquitectura;
- aplicaciones instaladas;
- configuración del entorno;
- permisos del usuario.

La información del curso utiliza Splunk Enterprise 10.4.3 como referencia. Si la
instancia utiliza otra versión, comprueba la documentación correspondiente antes
de aplicar comandos de configuración.

La disponibilidad de una licencia de evaluación o trial depende de las
condiciones actuales de Splunk y de la modalidad de descarga. No debe asumirse
que todas las instalaciones tienen exactamente la misma duración, límites o
capacidades. Verifica siempre la licencia y los términos aplicables en la fuente
oficial.

---

# 24. Resultado esperado del curso

Al finalizar, cada asistente debe ser capaz de explicar el recorrido completo de
un evento:

```text
Archivo o fuente
    ↓
Entrada de Splunk
    ↓
Parsing
    ↓
Asignación de host, source y sourcetype
    ↓
Timestamp y _time
    ↓
Índice curso
    ↓
Búsqueda SPL
    ↓
Estadística o visualización
    ↓
Reporte, dashboard o alerta
    ↓
Decisión operativa
```

También debe ser capaz de responder:

- ¿de dónde procede este evento?
- ¿en qué índice está?
- ¿cuándo ocurrió?
- ¿cuándo se indexó?
- ¿qué campos contiene?
- ¿qué tipo de datos tienen?
- ¿qué usuario puede verlo?
- ¿qué consulta lo utiliza?
- ¿qué panel lo muestra?
- ¿qué alerta depende de él?
- ¿qué limitaciones existen?
- ¿cómo se diagnosticaría si dejara de aparecer?

La documentación y el resultado técnico forman parte de la solución. Una consulta
sin contexto puede producir un número; una solución documentada permite operar,
validar y mantener ese número.