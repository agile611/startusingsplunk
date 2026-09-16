///PER ARREGLAR

# Requisitos

# Requisitos del proyecto final

## Requisitos técnicos

Para realizar el proyecto necesitas:

- Splunk Enterprise instalado y operativo.
- Acceso a Splunk Web.
- Usuario con rol `admin` o permisos equivalentes.
- Índice `curso` creado y visible.
- Dataset web disponible.
- Navegador actualizado.
- Acceso a la terminal de Ubuntu para comprobaciones del entorno.
- Capacidad para crear búsquedas guardadas, dashboards y alertas.

Comprueba que Splunk Web responde en:

```text
http://localhost:8000
```

---

## Comprobación de la instancia

Desde la terminal de Ubuntu:

```bash
/opt/splunk/bin/splunk version
```

Comprueba el servicio:

```bash
sudo systemctl status Splunkd
```

Comprueba que Splunk Web responde:

```bash
curl -I http://localhost:8000
```

Comprueba el puerto de administración:

```bash
sudo ss -lntp | grep -E '8000|8089|9997'
```

Los puertos tienen el siguiente uso habitual:

| Puerto | Uso |
|---:|---|
| `8000` | Splunk Web |
| `8089` | API y puerto de administración |
| `9997` | Recepción desde forwarders, si está configurada |

El puerto `9997` no es necesario para la ingesta local del laboratorio.

---

## Comprobación de permisos en Splunk

El proyecto asume que puedes:

- consultar el índice `curso`;
- crear índices si fuera necesario;
- configurar entradas de datos;
- guardar búsquedas;
- crear reportes;
- crear dashboards;
- crear alertas;
- compartir objetos;
- revisar usuarios y roles.

Puedes revisar el contexto del usuario mediante REST:

```spl
| rest /services/authentication/current-context
| table username roles
```

Si la consulta no devuelve resultados, revisa el usuario desde:

```text
Settings > Access controls > Users
```

No utilices permisos administrativos para ocultar problemas de acceso. El proyecto
debe distinguir entre:

- permiso para ver Splunk;
- permiso para buscar un índice;
- permiso para utilizar un dashboard;
- permiso para modificar un objeto;
- permiso para administrar la plataforma.

---

## Requisitos del dataset

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

Estructura ampliada recomendada:

```text
timestamp,host,method,status,uri,clientip,response_time
```

Los campos `clientip` y `response_time` son necesarios para cumplir
respectivamente los análisis de IP y tiempos de respuesta.

Si el archivo utiliza otros nombres, documenta la equivalencia:

| Concepto | Posibles nombres |
|---|---|
| IP de cliente | `clientip`, `src_ip`, `source_ip` |
| Tiempo de respuesta | `response_time`, `duration`, `latency` |
| URI | `uri`, `url`, `request_uri` |
| Código HTTP | `status`, `status_code`, `http_status` |

---

## Requisitos funcionales

El proyecto debe incluir:

### 1. Índice

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
- entrada que lo utiliza.

Comprueba que existe:

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

### 2. Dataset ingerido

El dataset debe estar disponible en Splunk y ser consultable mediante:

```spl
index=curso earliest=0 latest=now
```

Debes validar:

```spl
index=curso earliest=0 latest=now
| stats count min(_time) as inicio max(_time) as fin
```

### 3. Cinco búsquedas SPL

Cada búsqueda debe incluir:

- objetivo;
- SPL;
- índice;
- intervalo temporal;
- campos utilizados;
- resultado esperado;
- explicación;
- limitaciones.

### 4. Dos reportes

Los reportes deben tener:

- nombre;
- descripción;
- consulta;
- visualización;
- frecuencia;
- audiencia;
- permisos;
- interpretación.

### 5. Dashboard

El dashboard debe tener como mínimo seis paneles.

### 6. Dos filtros

Debes incluir al menos:

- un filtro temporal;
- un filtro por host, código HTTP, URI o método.

### 7. Una alerta

La alerta debe detectar:

```text
cinco o más errores HTTP 500 en cinco minutos
```

### 8. Explicación

La documentación debe explicar:

- qué se ha observado;
- qué significa;
- qué no puede concluirse;
- qué acción recomendarías;
- qué limitaciones tiene el dataset.

---

## Dataset histórico y datos en tiempo real

Durante el laboratorio puede utilizarse un rango absoluto:

```spl
earliest="01/01/2026:00:00:00"
latest="01/01/2026:00:10:00"
```

Para una alerta operativa deben utilizarse rangos relativos:

```spl
earliest=-5m latest=now
```

No mezcles ambos escenarios.

Una búsqueda histórica sirve para reproducir los ejercicios. Una alerta operativa
necesita que los eventos lleguen continuamente y que sus timestamps estén dentro
de la ventana que se está consultando.

---

## Comprobación de calidad

Antes de entregar, verifica:

```spl
index=curso earliest=0 latest=now
| stats count
```

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
```

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(status)
| stats count by status_num
```

---

## Requisitos de calidad de las búsquedas

Todas las búsquedas del proyecto deben:

- indicar el índice;
- utilizar un intervalo temporal;
- evitar `index=*` salvo diagnóstico;
- normalizar valores numéricos cuando sea necesario;
- utilizar nombres de campos reales;
- evitar comandos innecesariamente costosos;
- incluir una explicación;
- ser reproducibles por otra persona.

Ejemplo adecuado:

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num>=400
| stats count as errores by host uri
| sort - errores
```

Ejemplo poco recomendable:

```spl
index=*
| search error
| table *
```

---

## Referencias oficiales

- [Splunk Enterprise Documentation](https://docs.splunk.com/Documentation/Splunk)
- [About indexes](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Monitor files and directories](https://docs.splunk.com/Documentation/Splunk/latest/Data/Monitorfilesanddirectories)
- [Splunk REST API Reference](https://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTprolog)
- [Administer Splunk Enterprise](https://docs.splunk.com/Documentation/Splunk/latest/Admin/AbouttheAdminManual)

## Plataforma

El proyecto requiere:

- Splunk Enterprise instalado.
- Ubuntu 24.04.5 LTS como sistema de referencia.
- Splunk Web accesible.
- Usuario con rol `admin`.
- Navegador web actualizado.
- Acceso al índice `curso`.
- Dataset web preparado.
- Permiso para crear objetos de conocimiento.

## Comprobaciones

```bash
/opt/splunk/bin/splunk version
sudo systemctl status Splunkd
curl -I http://localhost:8000
```

En Splunk Web, comprueba:

```text
Settings > Indexes
```

El índice debe estar disponible y habilitado.

## Dataset

El dataset debe contener al menos:

```text
timestamp,host,method,status,uri
```

Para completar todos los análisis recomendados, se aconseja añadir:

```text
clientip,response_time
```

Si los nombres son diferentes, documenta la equivalencia.

## Requisitos de búsqueda

Todas las búsquedas deben:

- usar índice;
- usar tiempo;
- comprobar campos;
- evitar conclusiones no respaldadas;
- estar documentadas;
- poder ejecutarse por otro usuario autorizado.

## Requisitos de objetos

Debes crear:

- cinco búsquedas;
- dos reportes;
- un dashboard;
- dos filtros;
- una alerta.

## Requisito de alerta

La alerta debe detectar:

```text
5 o más respuestas HTTP 500 en 5 minutos
```

Consulta:

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

## Referencias

- [Splunk Enterprise Documentation](https://docs.splunk.com/Documentation/Splunk)
- [About indexes](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Splunk Alerts](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)