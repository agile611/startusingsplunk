# Preparación

Esta sección reúne las comprobaciones y decisiones necesarias antes de iniciar el
laboratorio.

El entorno de referencia es una instalación manual de:

- **Splunk Enterprise 10.4.3**;
- **Ubuntu 24.04.5 LTS**;
- arquitectura mononodo;
- índice de prácticas `curso`;
- dataset de laboratorio basado en eventos web;
- acceso administrativo a Splunk Web.

Si Splunk ya está instalado, no es necesario repetir la instalación. En ese caso,
la preparación se centra en validar que:

- el servicio está activo;
- Splunk Web responde;
- el usuario puede iniciar sesión;
- el usuario tiene el rol `admin`;
- el índice `curso` existe;
- los datos de laboratorio están disponibles;
- los timestamps y campos son correctos;
- el entorno está preparado para ejecutar búsquedas, dashboards y alertas.

Completa esta preparación antes de comenzar la
[Sesión 1](../sesion-1/index.md).

Si todavía no tienes la máquina preparada, consulta primero los
[requisitos generales del curso](../curso/requisitos.md).

---

# 1. Objetivo de esta sección

Al terminar la preparación debes poder responder afirmativamente a estas
preguntas:

- ¿Qué versión de Splunk Enterprise está instalada?
- ¿Está activo el proceso `splunkd`?
- ¿Responde Splunk Web?
- ¿Qué puerto utiliza Splunk Web?
- ¿Tengo permisos `admin` dentro de Splunk?
- ¿Existe el índice `curso`?
- ¿Hay eventos disponibles?
- ¿Qué intervalo temporal contienen los eventos?
- ¿Qué campos se han extraído?
- ¿Dónde está el dataset de laboratorio?
- ¿Puedo ejecutar una búsqueda SPL?
- ¿Sé distinguir un problema de Splunk de un problema de Ubuntu?

La preparación no consiste únicamente en abrir Splunk Web. El objetivo es
confirmar que toda la cadena funciona:

```text
Ubuntu
    ↓
Servicio Splunk
    ↓
Splunk Web
    ↓
Usuario y permisos
    ↓
Entrada de datos
    ↓
Índice curso
    ↓
Eventos
    ↓
Campos y timestamps
    ↓
Búsquedas SPL
```

---

# 2. Requisitos de permisos

Durante el laboratorio se utilizan dos niveles de permisos diferentes.

## 2.1 Permisos dentro de Splunk

El usuario con rol `admin` podrá realizar, según la configuración de la
instancia, actividades como:

- consultar eventos;
- revisar índices;
- crear entradas de datos;
- crear reportes;
- crear dashboards;
- configurar alertas;
- revisar usuarios y roles;
- administrar objetos de conocimiento.

## 2.2 Permisos en Ubuntu

El rol `admin` de Splunk no concede automáticamente permisos administrativos
sobre Ubuntu.

Para algunas comprobaciones puede ser necesario utilizar:

```bash
sudo systemctl status Splunkd --no-pager
```

```bash
sudo ss -ltnp | grep -E ':8000|:8089'
```

La diferencia es importante:

| Acción | Contexto | Permiso necesario |
|---|---|---|
| Ejecutar una búsqueda | Splunk | Acceso al índice |
| Crear un dashboard | Splunk | Permisos sobre objetos |
| Crear una alerta | Splunk | Capacidades y permisos de alertas |
| Consultar el servicio | Ubuntu | Permisos del sistema |
| Leer un archivo protegido | Ubuntu | Permisos sobre el archivo |
| Modificar el firewall | Ubuntu | `sudo` o equivalente |
| Reiniciar Splunk | Ubuntu/Splunk | Permisos sobre el servicio |

Durante el curso se utiliza `admin` para simplificar el laboratorio. En un
entorno real, los dashboards, reportes y alertas deben probarse también con el
rol operativo que los utilizará.

---

# 3. Temas

1. [Requisitos de hardware](requisitos-hardware.md): recursos mínimos y
   recomendaciones para una máquina física o virtual.
2. [Comprobaciones previas](comprobaciones-previas.md): validaciones del sistema
   antes de instalar o comenzar las prácticas.
3. [Arquitectura y componentes](arquitectura.md): componentes principales de la
   instancia mononodo.
4. [Instalación de Splunk Enterprise 10.4.3](instalacion.md): descarga,
   instalación y validación del paquete `.deb`.
5. [Arquitectura del laboratorio](arquitectura-laboratorio.md): componentes,
   puertos y recorrido de los datos.
6. [Datos del laboratorio](datos-laboratorio.md): datasets, índice de destino y
   reglas para cargar los archivos.

---

# 4. Orden recomendado

Sigue este orden para evitar problemas difíciles de diagnosticar:

1. Confirma los recursos de Ubuntu en
   [Requisitos de hardware](requisitos-hardware.md).
2. Comprende la topología en
   [Arquitectura del laboratorio](arquitectura-laboratorio.md).
3. Revisa los archivos disponibles en
   [Datos del laboratorio](datos-laboratorio.md).
4. Ejecuta la lista de
   [Comprobaciones previas](comprobaciones-previas.md).
5. Si Splunk no está instalado, realiza la
   [instalación detallada](instalacion.md).
6. Si Splunk ya está instalado, ejecuta las comprobaciones de esta página.
7. Confirma el acceso desde
   [Splunk Web](../sesion-1/03-splunk-web.md).
8. Configura o valida la
   [ingesta de datos](../sesion-1/04-ingesta-datos.md).
9. Comprueba el índice `curso`.
10. Continúa con la Sesión 1.

No avances a dashboards o alertas hasta confirmar que los eventos y campos son
correctos. Un dashboard construido sobre datos mal indexados solo produce
resultados incorrectos con una apariencia muy convincente.

---

# 5. Comprobaciones de Ubuntu

Ejecuta estas comprobaciones desde una terminal.

## 5.1 Arquitectura

```bash
uname -m
```

El resultado esperado es:

```text
x86_64
```

También puedes comprobar la arquitectura de paquetes:

```bash
dpkg --print-architecture
```

El resultado esperado es:

```text
amd64
```

## 5.2 Versión del sistema operativo

```bash
lsb_release -a
```

Si `lsb_release` no está instalado:

```bash
cat /etc/os-release
```

Comprueba que el sistema corresponde a Ubuntu 24.04 LTS.

## 5.3 CPU

```bash
nproc
```

Información ampliada:

```bash
lscpu
```

## 5.4 Memoria

```bash
free -h
```

La memoria debe ser suficiente para ejecutar simultáneamente:

- Splunk Enterprise;
- Splunk Web;
- el navegador;
- las herramientas de terminal;
- los datos del laboratorio.

## 5.5 Espacio de disco

```bash
df -h /
```

Si Splunk está instalado bajo `/opt`, comprueba también:

```bash
df -h /opt
```

Revisa los inodos:

```bash
df -i /
```

Un sistema puede tener espacio libre y, aun así, quedarse sin inodos. Para un
laboratorio pequeño no suele ser un problema, pero conviene conocer la
comprobación.

## 5.6 Fecha y zona horaria

```bash
timedatectl
```

Comprueba:

- fecha;
- hora;
- zona horaria;
- sincronización del reloj.

La hora del sistema puede afectar a:

- rangos temporales;
- alertas;
- certificados;
- `_time`;
- `_indextime`;
- interpretación de eventos históricos.

---

# 6. Comprobaciones de Splunk Enterprise

## 6.1 Consultar la versión

La ruta habitual de instalación es:

```bash
/opt/splunk/bin/splunk version
```

También puedes ejecutar:

```bash
/opt/splunk/bin/splunk status
```

Documenta la versión obtenida. Para este curso se utiliza como referencia:

```text
Splunk Enterprise 10.4.3
```

## 6.2 Comprobar el servicio

Si Splunk está integrado con `systemd`:

```bash
sudo systemctl status Splunkd --no-pager
```

También puedes utilizar el comando propio de Splunk:

```bash
sudo /opt/splunk/bin/splunk status
```

El nombre exacto de la unidad puede variar. Si `Splunkd` no existe como
servicio de `systemd`, utiliza el comando propio de Splunk y revisa la
configuración de arranque.

## 6.3 Comprobar el proceso

```bash
ps aux | grep '[s]plunkd'
```

El resultado debe mostrar el proceso principal de Splunk.

## 6.4 Comprobar los puertos

```bash
sudo ss -ltnp | grep -E ':8000|:8089'
```

Los puertos habituales son:

| Puerto | Función |
|---:|---|
| `8000` | Splunk Web |
| `8089` | Management port y API REST |
| `9997` | Recepción desde forwarders |
| `8088` | HTTP Event Collector, si está configurado |

La configuración del laboratorio puede utilizar puertos diferentes. Si no
aparece el puerto `8000`, consulta la configuración de la instancia.

## 6.5 Comprobar Splunk Web

Desde la propia máquina:

```bash
curl -I http://127.0.0.1:8000
```

También puedes probar:

```bash
curl -I http://localhost:8000
```

Después abre el navegador en:

```text
http://localhost:8000
```

Si accedes desde otro equipo, utiliza la dirección IP de Ubuntu:

```text
http://DIRECCION_IP:8000
```

Una respuesta `HTTP 200` o una redirección `HTTP 3xx` confirma que existe un
servicio web respondiendo. Todavía será necesario comprobar que el inicio de
sesión funciona correctamente.

---

# 7. Validar el usuario administrativo

Inicia sesión en Splunk Web con el usuario de laboratorio y ejecuta:

```spl
| rest /services/authentication/current-context
| table username roles
```

Comprueba que:

- aparece el nombre de usuario esperado;
- el rol `admin` está presente;
- la búsqueda se ejecuta sin errores de permisos.

También puedes revisar los usuarios desde:

```text
Settings → Access controls → Users
```

La ubicación exacta de los menús puede variar ligeramente según la versión y
la configuración de Splunk Web.

## 7.1 Prueba funcional

Ejecuta:

```spl
| makeresults
| eval estado="Splunk responde correctamente"
```

Resultado esperado:

```text
estado = Splunk responde correctamente
```

Esta búsqueda no consulta el índice `curso`. Sirve para comprobar que el motor
de búsquedas funciona.

---

# 8. Validar el índice `curso`

El índice principal del laboratorio es:

```text
curso
```

## 8.1 Comprobar que el índice existe

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

Comprueba especialmente:

- que el índice existe;
- que no está deshabilitado;
- que contiene eventos, si ya se han ingerido datos.

## 8.2 Comprobar el número de eventos

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

## 8.3 Localizar el intervalo temporal

```spl
index=curso earliest=0 latest=now
| stats
    count as total_eventos
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

## 8.4 Revisar metadatos

```spl
index=curso earliest=0 latest=now
| stats count by source sourcetype host
| sort - count
```

## 8.5 Revisar eventos individuales

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

---

# 9. Validar los campos

Ejecuta:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Este comando ayuda a identificar:

- nombres de campos;
- número de valores;
- valores nulos;
- tipos observados;
- campos que realmente existen.

Los campos mínimos esperados pueden incluir:

```text
timestamp
host
method
status
uri
```

Los campos opcionales pueden incluir:

```text
client_ip
response_time
user_agent
bytes
referer
```

No asumas que los campos opcionales existen. Si un campo no está disponible,
documenta la limitación:

```text
El dataset no contiene response_time. No se puede calcular latencia.
```

Revisar los campos antes de crear una consulta evita errores como:

- utilizar un nombre incorrecto;
- calcular estadísticas sobre un campo vacío;
- crear una alerta que nunca se dispara;
- presentar una métrica que el dataset no puede respaldar.

---

# 10. Validar el rango temporal

Los datos de laboratorio pueden ser históricos. Por eso esta búsqueda puede
devolver cero resultados:

```spl
index=curso earliest=-24h latest=now
| stats count
```

Durante la validación inicial utiliza:

```spl
index=curso earliest=0 latest=now
| stats count
```

Después identifica el intervalo real de los eventos:

```spl
index=curso earliest=0 latest=now
| stats
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

Recuerda la diferencia:

- `_time`: momento asociado al evento;
- `_indextime`: momento en que Splunk indexó el evento.

Un archivo cargado hoy puede contener eventos generados semanas o meses atrás.

Puedes comparar ambos tiempos:

```spl
index=curso earliest=0 latest=now
| eval fecha_evento=strftime(
    _time,
    "%Y-%m-%d %H:%M:%S"
)
| eval fecha_ingesta=strftime(
    _indextime,
    "%Y-%m-%d %H:%M:%S"
)
| table fecha_evento fecha_ingesta _time _indextime
| head 20
```

---

# 11. Revisar los datos del laboratorio

Consulta:

[Datos del laboratorio](datos-laboratorio.md)

Antes de ingerir un archivo CSV, comprueba su contenido desde Ubuntu:

```bash
head -n 5 ruta/al/eventos_web.csv
```

Comprueba también:

```bash
file ruta/al/eventos_web.csv
```

```bash
wc -l ruta/al/eventos_web.csv
```

Revisa:

- nombre del archivo;
- cabecera;
- separador;
- número de columnas;
- formato del timestamp;
- nombres de los campos;
- caracteres especiales;
- existencia de datos sensibles.

Si el archivo tiene una cabecera como esta:

```text
timestamp,host,method,status,uri
```

los nombres deben coincidir con los campos que utilices posteriormente en SPL.

Evita cargar varias veces el mismo archivo sin una razón clara. Las cargas
duplicadas pueden alterar:

- el número total de eventos;
- porcentajes;
- rankings;
- gráficos;
- alertas;
- conclusiones del laboratorio.

---

# 12. Primera búsqueda completa

Cuando Splunk Web y el índice estén disponibles, ejecuta:

```spl
index=curso earliest=0 latest=now
| stats
    count as total_eventos
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

Esta búsqueda valida simultáneamente:

- acceso al índice;
- existencia de eventos;
- rango temporal;
- volumen de datos;
- primer evento;
- último evento.

El resultado debe documentarse con el siguiente formato:

```markdown
## Validación inicial

- Índice: curso
- Usuario:
- Total de eventos:
- Primer evento:
- Último evento:
- Source:
- Sourcetype:
- Host:
- Campos disponibles:
- Observaciones:
```

---

# 13. Flujo de diagnóstico

Si una práctica no funciona, sigue este orden:

```text
Sistema operativo
    ↓
Servicio Splunk
    ↓
Splunk Web
    ↓
Usuario y permisos
    ↓
Entrada de datos
    ↓
Índice
    ↓
Rango temporal
    ↓
Evento original
    ↓
Campos
    ↓
Búsqueda SPL
    ↓
Dashboard o alerta
```

No modifiques varias capas al mismo tiempo. Si cambias la entrada, el índice, el
timestamp y la búsqueda a la vez, será difícil saber qué corrección ha
resuelto el problema.

## 13.1 Splunk no inicia

Consulta:

[Splunk no inicia](../troubleshooting/splunk-no-inicia.md)

Ejecuta:

```bash
sudo systemctl status Splunkd --no-pager
```

## 13.2 Splunk Web no responde

Consulta:

[No funciona el acceso web](../troubleshooting/acceso-web.md)

Ejecuta:

```bash
curl -I http://127.0.0.1:8000
```

```bash
sudo ss -ltnp | grep ':8000'
```

## 13.3 No aparecen eventos

Consulta:

[Los datos no aparecen](../troubleshooting/datos-no-aparecen.md)

Ejecuta primero:

```spl
index=curso earliest=0 latest=now
| stats count
```

Después comprueba el índice:

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount
```

## 13.4 Los campos son incorrectos

Consulta:

[Los campos son incorrectos](../troubleshooting/campos-incorrectos.md)

Ejecuta:

```spl
index=curso earliest=0 latest=now
| table _raw host source sourcetype status uri
| head 20
```

Después:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

---

# 14. Criterio de preparación completada

Puedes comenzar el laboratorio cuando se cumplan todos estos puntos.

## Sistema operativo

- [ ] Ubuntu está instalado.
- [ ] La arquitectura es `x86_64` o `amd64`.
- [ ] Hay CPU suficiente.
- [ ] Hay memoria suficiente.
- [ ] Hay espacio libre suficiente.
- [ ] La fecha y la zona horaria son correctas.
- [ ] Puedes abrir una terminal.
- [ ] Puedes ejecutar `sudo`, si es necesario.

## Splunk Enterprise

- [ ] Splunk Enterprise está instalado.
- [ ] La versión está documentada.
- [ ] `splunkd` está activo.
- [ ] Splunk Web responde.
- [ ] El puerto `8000` está disponible.
- [ ] El puerto `8089` está disponible, si corresponde.
- [ ] Puedes iniciar sesión.
- [ ] Tu usuario tiene el rol `admin`.

## Datos

- [ ] El índice `curso` existe.
- [ ] El índice no está deshabilitado.
- [ ] El dataset está disponible.
- [ ] Los eventos se pueden consultar.
- [ ] El número de eventos es conocido.
- [ ] El primer y último evento están identificados.
- [ ] `source`, `sourcetype` y `host` están documentados.
- [ ] Los campos principales están comprobados.
- [ ] El rango temporal real está identificado.
- [ ] No se han creado duplicados accidentalmente.

## Prácticas

- [ ] La búsqueda `makeresults` funciona.
- [ ] Una búsqueda sobre `index=curso` funciona.
- [ ] Puedes revisar eventos individuales.
- [ ] Puedes utilizar `stats`.
- [ ] Puedes utilizar `fieldsummary`.
- [ ] Puedes documentar resultados.
- [ ] Conoces la ruta de troubleshooting adecuada.

---

# 15. Orden recomendado para la primera práctica

Utiliza exactamente esta secuencia:

## Paso 1: comprobar Splunk Web

```text
http://localhost:8000
```

## Paso 2: ejecutar una búsqueda mínima

```spl
| makeresults
| eval estado="OK"
```

## Paso 3: comprobar el índice

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount
```

## Paso 4: localizar eventos

```spl
index=curso earliest=0 latest=now
| stats count
```

## Paso 5: localizar el intervalo temporal

```spl
index=curso earliest=0 latest=now
| stats earliest(_time) latest(_time)
```

## Paso 6: revisar los campos

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

## Paso 7: revisar eventos individuales

```spl
index=curso earliest=0 latest=now
| table _time host source sourcetype method status uri _raw
| head 20
```

Cuando todos estos pasos funcionen, puedes comenzar la Sesión 1.

---

# 16. Referencias internas

- [Requisitos de hardware](requisitos-hardware.md)
- [Comprobaciones previas](comprobaciones-previas.md)
- [Arquitectura y componentes](arquitectura.md)
- [Instalación de Splunk Enterprise](instalacion.md)
- [Arquitectura del laboratorio](arquitectura-laboratorio.md)
- [Datos del laboratorio](datos-laboratorio.md)
- [Sesión 1](../sesion-1/index.md)
- [Navegación por Splunk Web](../sesion-1/03-splunk-web.md)
- [Ingesta de datos](../sesion-1/04-ingesta-datos.md)
- [Gestión de índices](../sesion-1/05-indices.md)
- [Solución de problemas](../troubleshooting/index.md)
- [Splunk no inicia](../troubleshooting/splunk-no-inicia.md)
- [Acceso web](../troubleshooting/acceso-web.md)
- [Datos no aparecen](../troubleshooting/datos-no-aparecen.md)
- [Campos incorrectos](../troubleshooting/campos-incorrectos.md)

---

# 17. Referencias oficiales

## Splunk Enterprise

- [Documentación de Splunk Enterprise](https://docs.splunk.com/Documentation/Splunk)
- [Splunk Enterprise Help](https://help.splunk.com/en/splunk-enterprise)
- [Notas de versión](https://docs.splunk.com/Documentation/Splunk/latest/ReleaseNotes)
- [Página oficial de descarga](https://www.splunk.com/en_us/download/splunk-enterprise.html)

## Datos, fuentes e índices

- [Cómo procesa Splunk los datos](https://docs.splunk.com/Documentation/Splunk/latest/Data/HowSplunkprocessesdata)
- [Fuentes de datos](https://docs.splunk.com/Documentation/Splunk/latest/Data/Whatissource)
- [Monitorización de archivos y directorios](https://docs.splunk.com/Documentation/Splunk/latest/Data/Monitorfilesanddirectories)
- [Índices](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [`inputs.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Inputsconf)
- [`indexes.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Indexesconf)
- [`props.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Propsconf)

## Búsquedas SPL

- [Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/WhatsInThisManual)
- [Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Overview)
- [Modificadores temporales](https://docs.splunk.com/Documentation/Splunk/latest/Search/Specifytimemodifiersinyoursearch)
- [`stats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Stats)
- [`fieldsummary`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fieldsummary)
- [`eval`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Eval)

## Ubuntu

- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)
- [Systemd en Ubuntu](https://documentation.ubuntu.com/server/explanation/systemd/)
- [Gestión del firewall en Ubuntu](https://documentation.ubuntu.com/server/how-to/security/firewalls/)

---

# 18. Resultado final

La preparación está completada cuando dispones de esta cadena funcional:

```text
Ubuntu validado
    +
Splunk Enterprise instalado
    +
splunkd activo
    +
Splunk Web accesible
    +
Usuario admin validado
    +
Índice curso disponible
    +
Eventos consultables
    +
Campos comprobados
    +
Rango temporal identificado