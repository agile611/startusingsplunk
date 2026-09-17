# Requisitos

Este curso utiliza una instancia local de **Splunk Enterprise 10.4.3** sobre
**Ubuntu 24.04.5 LTS**.

La instancia puede estar instalada previamente. En ese caso, no es necesario
repetir la instalación: antes de comenzar se debe comprobar que el servicio,
Splunk Web, el acceso administrativo y el índice de laboratorio funcionan
correctamente.

El curso se desarrolla sobre una arquitectura mononodo:

```text
Ubuntu
  └── Splunk Enterprise
        ├── splunkd
        ├── Splunk Web
        ├── índice curso
        ├── búsquedas SPL
        ├── dashboards
        └── alertas
```

---

# 1. Requisitos mínimos para participar

Antes de comenzar, el asistente debe disponer de:

- una máquina física o virtual con Ubuntu;
- Splunk Enterprise instalado;
- acceso a Splunk Web;
- un usuario con rol `admin` dentro de Splunk;
- acceso a una terminal de Ubuntu;
- el dataset de laboratorio;
- espacio suficiente para los datos;
- un navegador web actualizado;
- permisos `sudo`, si se van a realizar comprobaciones del sistema;
- conectividad local con el puerto de Splunk Web.

## 1.1 Si Splunk ya está instalado

En ese caso, los requisitos de descarga e instalación del paquete `.deb` son
opcionales.

La prioridad será validar:

1. la versión instalada;
2. el estado del servicio;
3. la respuesta de Splunk Web;
4. el acceso del usuario administrativo;
5. la existencia del índice `curso`;
6. la disponibilidad de los datos de laboratorio.

La guía detallada de instalación se encuentra en:

[Instalación de Splunk](../preparacion/instalacion.md)

---

# 2. Requisitos técnicos recomendados

| Recurso | Recomendación |
|---|---|
| Sistema operativo | Ubuntu 24.04.5 LTS |
| Arquitectura | `x86_64` o `amd64` |
| CPU | 4 núcleos o más |
| Memoria | 16 GB de RAM recomendados |
| Espacio libre | Al menos 20 GB para Splunk y el laboratorio |
| Red | Acceso local a Splunk Web |
| Navegador | Versión actual de Firefox, Chrome, Edge o equivalente |
| Puerto web | `8000`, salvo configuración diferente |
| Management port | `8089`, salvo configuración diferente |
| Usuario Splunk | Rol `admin` durante el laboratorio |
| Usuario Ubuntu | `sudo` para tareas del sistema |

Estas cifras son adecuadas para el laboratorio del curso. No constituyen una
recomendación de dimensionamiento para entornos de producción.

En un entorno real habría que analizar también:

- volumen diario de ingesta;
- retención;
- concurrencia de búsquedas;
- almacenamiento;
- rendimiento de disco;
- crecimiento de índices;
- copias de seguridad;
- alta disponibilidad;
- número de usuarios;
- arquitectura distribuida.

---

# 3. Arquitectura admitida

La práctica puede realizarse en:

- una máquina física;
- una máquina virtual;
- un equipo de laboratorio;
- un servidor Ubuntu accesible por red.

## 3.1 Máquina virtual

Si se utiliza una máquina virtual, asigna recursos suficientes y verifica:

- que Ubuntu tiene acceso a Internet, si se necesita descargar documentación;
- que el disco virtual tiene espacio disponible;
- que la hora del sistema es correcta;
- que el navegador puede acceder al puerto `8000`;
- que la red permite acceder a la dirección de Splunk;
- que no existe un conflicto con otro servicio que utilice el puerto `8000`.

Para trabajar exclusivamente desde la propia máquina virtual:

```text
http://localhost:8000
```

Si se accede desde otro equipo, utiliza la dirección IP de Ubuntu:

```text
http://DIRECCION_IP:8000
```

El acceso remoto puede requerir revisar:

- la configuración de red de la máquina virtual;
- el firewall;
- la dirección de escucha;
- las reglas de seguridad de la red.

---

# 4. Permisos necesarios

El curso utiliza dos tipos de permisos diferentes.

## 4.1 Permisos dentro de Splunk

El usuario con rol `admin` podrá realizar, según la configuración de la
instancia, actividades como:

- consultar eventos;
- crear o revisar índices;
- configurar entradas;
- guardar búsquedas;
- crear reportes;
- crear dashboards;
- configurar alertas;
- revisar usuarios y roles;
- modificar objetos de conocimiento.

## 4.2 Permisos en Ubuntu

Los comandos del sistema dependen de los permisos del sistema operativo.

Para algunas prácticas puede ser necesario ejecutar:

```bash
sudo systemctl status Splunkd --no-pager
```

o:

```bash
sudo ss -ltnp | grep -E ':8000|:8089'
```

Tener el rol `admin` en Splunk **no concede automáticamente permisos `sudo` en
Ubuntu**.

| Acción | Permiso necesario |
|---|---|
| Ejecutar búsquedas | Acceso al índice y permisos de búsqueda |
| Crear dashboards | Permisos sobre objetos de conocimiento |
| Crear alertas | Capacidades y permisos de alertas |
| Consultar `Splunkd` | Permisos del sistema operativo |
| Leer archivos protegidos | Permisos del sistema de archivos |
| Cambiar el firewall | Permisos administrativos de Ubuntu |
| Reiniciar el servicio | Permisos sobre `systemd` |

Durante el laboratorio se utiliza `admin` para simplificar la configuración. En
una organización real, los objetos deben probarse también con el rol operativo
que los utilizará.

---

# 5. Conocimientos recomendados

Conviene tener conocimientos básicos de:

- sistemas operativos Linux;
- procesos y servicios;
- redes y puertos;
- archivos de log;
- monitorización;
- resolución de incidencias;
- línea de comandos;
- permisos de archivos;
- formatos CSV;
- datos estructurados;
- fechas y horas;
- conceptos básicos de HTTP.

No es necesario:

- conocer SPL;
- haber administrado Splunk;
- conocer expresiones regulares;
- haber creado dashboards;
- haber configurado alertas;
- administrar una arquitectura distribuida;
- conocer Splunk Enterprise Security.

Los conceptos se introducen progresivamente y se practican sobre datos
preparados.

---

# 6. Comprobaciones del sistema operativo

Realiza estas comprobaciones desde una terminal de Ubuntu.

## 6.1 Arquitectura

```bash
uname -m
```

Resultado esperado:

```text
x86_64
```

También puedes comprobar la arquitectura de paquetes:

```bash
dpkg --print-architecture
```

Resultado esperado:

```text
amd64
```

## 6.2 Versión de Ubuntu

Si está disponible:

```bash
lsb_release -a
```

Alternativa independiente de `lsb_release`:

```bash
cat /etc/os-release
```

Comprueba que el sistema corresponde a Ubuntu 24.04 LTS.

## 6.3 CPU

```bash
nproc
```

Para obtener información ampliada:

```bash
lscpu
```

## 6.4 Memoria

```bash
free -h
```

Comprueba que existe memoria suficiente para ejecutar Splunk y el navegador
simultáneamente.

## 6.5 Espacio de disco

```bash
df -h /
```

También es útil revisar el espacio de la ruta donde está instalada la
instancia:

```bash
df -h /opt
```

Si `/opt` forma parte de la misma partición raíz, ambas salidas serán similares.

## 6.6 Inodos

Un disco puede tener espacio libre y, aun así, quedarse sin inodos:

```bash
df -i /
```

Para el laboratorio, evita trabajar con una partición prácticamente llena.

## 6.7 Hora del sistema

La interpretación temporal es importante en Splunk:

```bash
timedatectl
```

Comprueba:

- fecha;
- hora;
- zona horaria;
- sincronización NTP.

Una hora incorrecta puede afectar a:

- el acceso;
- los certificados;
- las alertas;
- los rangos temporales;
- la interpretación de `_time` e `_indextime`.

---

# 7. Comprobaciones de Splunk

## 7.1 Versión instalada

La ruta habitual es:

```bash
/opt/splunk/bin/splunk version
```

También puede utilizarse:

```bash
/opt/splunk/bin/splunk status
```

El resultado debe indicar la versión instalada y el estado del servicio.

## 7.2 Estado de `Splunkd`

Si la instalación utiliza `systemd`:

```bash
sudo systemctl status Splunkd --no-pager
```

También puedes consultar directamente el estado de Splunk:

```bash
sudo /opt/splunk/bin/splunk status
```

El nombre exacto de la unidad puede variar según la configuración. Si
`Splunkd` no existe como unidad, utiliza el comando propio de Splunk.

## 7.3 Proceso activo

```bash
ps aux | grep '[s]plunkd'
```

Esta comprobación permite confirmar si el proceso principal está ejecutándose.

## 7.4 Puertos

Comprueba los puertos habituales:

```bash
sudo ss -ltnp | grep -E ':8000|:8089'
```

| Puerto | Uso habitual |
|---:|---|
| `8000` | Splunk Web |
| `8089` | Management port y API REST |
| `9997` | Recepción desde forwarders |
| `8088` | HTTP Event Collector, si está configurado |

Los puertos pueden ser diferentes si la instancia se ha personalizado.

## 7.5 Respuesta de Splunk Web

Desde la propia máquina:

```bash
curl -I http://127.0.0.1:8000
```

También puedes probar:

```bash
curl -I http://localhost:8000
```

La respuesta puede ser una redirección o una respuesta HTTP válida. Lo
importante es que exista un servicio respondiendo en el puerto.

Accede después desde el navegador:

```text
http://localhost:8000
```

---

# 8. Comprobación del acceso administrativo

Inicia sesión en Splunk Web con el usuario administrativo y ejecuta:

```spl
| rest /services/authentication/current-context
| table username roles
```

Esta búsqueda permite comprobar el usuario y sus roles actuales.

También puedes revisar las capacidades del usuario desde:

```text
Settings → Access controls → Users
```

El nombre de los menús puede variar ligeramente según la versión y la
configuración de Splunk Web.

## 8.1 Comprobación funcional

Ejecuta:

```spl
| makeresults
| eval usuario="usuario de laboratorio"
| eval estado="búsqueda ejecutada correctamente"
```

Resultado esperado:

- la búsqueda finaliza;
- aparece una fila;
- el usuario puede consultar el buscador;
- no se muestra un error de permisos.

---

# 9. Comprobación del índice de laboratorio

El curso utiliza principalmente el índice:

```text
curso
```

## 9.1 Comprobar que existe

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

## 9.2 Comprobar eventos

```spl
index=curso earliest=0 latest=now
| stats
    count as total_eventos
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

## 9.3 Revisar los campos

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

## 9.4 Revisar metadatos

```spl
index=curso earliest=0 latest=now
| stats count by source sourcetype host
| sort - count
```

## 9.5 Revisar eventos individuales

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

El asistente debe conocer:

- cuántos eventos existen;
- cuándo se produjeron;
- cuándo se indexaron;
- qué `source` tienen;
- qué `sourcetype` tienen;
- qué `host` tienen;
- qué campos están disponibles.

---

# 10. Rango temporal del dataset

El dataset de laboratorio puede contener eventos históricos. Por ello, la
búsqueda siguiente puede no mostrar resultados si los eventos no pertenecen a
las últimas 24 horas:

```spl
index=curso earliest=-24h latest=now
| stats count
```

Durante la validación inicial utiliza:

```spl
index=curso earliest=0 latest=now
| stats count
```

Después identifica el intervalo real:

```spl
index=curso earliest=0 latest=now
| stats
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

La diferencia entre `_time` e `_indextime` es importante:

- `_time`: momento asignado al evento;
- `_indextime`: momento en que Splunk lo indexó.

Una carga realizada hoy puede contener eventos generados en una fecha anterior.

---

# 11. Material del curso

El asistente debe tener disponible:

- documentación del curso;
- acceso a la terminal de Ubuntu;
- navegador web;
- dataset `eventos_web.csv`;
- archivos adicionales de laboratorio;
- credenciales administrativas de Splunk;
- acceso al índice `curso`;
- documentación oficial de Splunk;
- espacio para guardar consultas y evidencias.

El dataset puede encontrarse en:

```text
docs/downloads/eventos_web.csv
```

o en la ruta definida por la configuración del laboratorio.

Antes de ingerirlo, verifica su contenido:

```bash
head -n 5 ruta/al/eventos_web.csv
```

Comprueba:

- cabecera;
- separador;
- número de columnas;
- formato de fecha;
- nombres de campos;
- ausencia de credenciales o datos sensibles.

---

# 12. Validación de los archivos de laboratorio

Antes de cargar un archivo:

```bash
file ruta/al/eventos_web.csv
```

```bash
wc -l ruta/al/eventos_web.csv
```

```bash
head -n 3 ruta/al/eventos_web.csv
```

Si el archivo contiene una cabecera CSV, confirma que los nombres coinciden con
los que utilizarás en las búsquedas:

```text
timestamp
host
method
status
uri
```

No asumas que existen campos opcionales como:

```text
client_ip
response_time
user_agent
bytes
```

Comprueba primero los campos indexados:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Si un campo no existe, documenta la limitación en lugar de construir una métrica
sobre datos que no están disponibles.

---

# 13. Requisitos de conectividad

Para el laboratorio local se necesita, como mínimo, conectividad con:

```text
http://localhost:8000
```

Si se accede desde otro equipo:

```text
http://DIRECCION_IP:8000
```

Para descargar el paquete o consultar documentación se necesita salida a
Internet. Si Splunk ya está instalado y los materiales se encuentran
disponibles localmente, la conexión a Internet no es imprescindible para todas
las prácticas.

## 13.1 Comprobaciones básicas

```bash
ip addr
```

```bash
ip route
```

```bash
ping -c 3 127.0.0.1
```

Para probar resolución de nombres:

```bash
getent hosts splunk.com
```

El comando `ping` puede estar bloqueado por la red y no siempre demuestra que
HTTP funcione. Para Splunk Web es más representativo utilizar:

```bash
curl -I http://127.0.0.1:8000
```

---

# 14. Descarga del instalador

Si fuera necesario instalar o reinstalar Splunk Enterprise, utiliza únicamente
fuentes oficiales:

[Descarga de Splunk Enterprise](https://www.splunk.com/en_us/download/splunk-enterprise.html)

!!! warning "Descarga directa del instalador para Debian / Ubuntu"

    Comprueba que la URL corresponde a la versión y arquitectura correctas.

    ```bash
    wget https://download.splunk.com/products/splunk/releases/10.4.3/linux/splunk-10.4.3-4174a2deda5d-linux-amd64.deb
    ```

El acceso al instalador puede requerir:

- una cuenta de Splunk;
- aceptación de los términos correspondientes;
- una licencia o modalidad de evaluación;
- acceso al portal de descargas.

Las condiciones de evaluación, disponibilidad de versiones y requisitos de
descarga pueden cambiar. Comprueba siempre la información vigente en el portal
oficial.

Para un paquete `.deb` descargado localmente:

```bash
ls -lh splunk-*.deb
```

Comprueba la arquitectura del paquete:

```bash
dpkg-deb -f splunk-*.deb Architecture
```

La arquitectura debe ser compatible con el sistema, normalmente:

```text
amd64
```

No es necesario reinstalar Splunk si la versión ya está instalada y supera las
comprobaciones del curso.

---

# 15. Criterios de aceptación antes de la primera sesión

La máquina está preparada cuando se cumplen estos puntos:

## Sistema

- [ ] Ubuntu corresponde a la versión prevista.
- [ ] La arquitectura es compatible.
- [ ] Hay al menos 4 núcleos disponibles.
- [ ] Existe memoria suficiente.
- [ ] Hay espacio libre suficiente.
- [ ] La fecha y la zona horaria son correctas.

## Splunk

- [ ] Splunk Enterprise está instalado.
- [ ] La versión está documentada.
- [ ] `splunkd` está activo.
- [ ] Splunk Web responde.
- [ ] El puerto `8000` está disponible.
- [ ] El usuario puede iniciar sesión.
- [ ] El usuario tiene el rol `admin`.

## Datos

- [ ] El índice `curso` existe.
- [ ] El dataset está disponible.
- [ ] Los eventos se pueden consultar.
- [ ] El rango temporal se ha identificado.
- [ ] `_raw` contiene datos válidos.
- [ ] Los campos principales se han comprobado.
- [ ] No se han producido duplicados durante la carga.

## Laboratorio

- [ ] El navegador funciona.
- [ ] La terminal está disponible.
- [ ] Se puede utilizar `sudo`, si es necesario.
- [ ] El asistente puede guardar evidencias.
- [ ] Las guías del curso son accesibles.

---

# 16. Diagnóstico rápido

## Splunk Web no responde

Comprueba:

```bash
sudo systemctl status Splunkd --no-pager
```

```bash
sudo ss -ltnp | grep ':8000'
```

```bash
curl -I http://127.0.0.1:8000
```

Consulta:

[Problemas de acceso web](../troubleshooting/acceso-web.md)

## No aparecen eventos

Ejecuta:

```spl
index=curso earliest=0 latest=now
| stats count
```

Después comprueba:

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount
```

Consulta:

[Los datos no aparecen](../troubleshooting/datos-no-aparecen.md)

## Los campos no son correctos

Revisa:

```spl
index=curso earliest=0 latest=now
| table _raw host source sourcetype status uri
| head 20
```

Y:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Consulta:

[Los campos son incorrectos](../troubleshooting/campos-incorrectos.md)

## El servicio no inicia

Consulta:

[Splunk no inicia](../troubleshooting/splunk-no-inicia.md)

Recuerda que un problema de servicio, un problema de red, un problema de
permisos y un problema de datos son situaciones diferentes. Diagnostícalas por
separado.

---

# 17. Referencias del curso

- [Instalación de Splunk](../preparacion/instalacion.md)
- [Preparación del laboratorio](../preparacion/index.md)
- [Arquitectura y componentes](../preparacion/arquitectura.md)
- [Datos del laboratorio](../preparacion/datos-laboratorio.md)
- [Ingesta de datos](../sesion-1/04-ingesta-datos.md)
- [Gestión de índices](../sesion-1/05-indices.md)
- [Gestión del tiempo](../sesion-2/03-gestion-tiempo.md)
- [Campos y resultados](../sesion-2/04-campos-resultados.md)
- [Troubleshooting](../troubleshooting/index.md)

---

# 18. Referencias oficiales

## Splunk Enterprise

- [Documentación de Splunk Enterprise](https://docs.splunk.com/Documentation/Splunk)
- [Splunk Enterprise Help](https://help.splunk.com/en/splunk-enterprise)
- [Página oficial de descarga](https://www.splunk.com/en_us/download/splunk-enterprise.html)
- [Notas de versión](https://docs.splunk.com/Documentation/Splunk/latest/ReleaseNotes)

## Datos e índices

- [Cómo procesa Splunk los datos](https://docs.splunk.com/Documentation/Splunk/latest/Data/HowSplunkprocessesdata)
- [Introducción a las fuentes de datos](https://docs.splunk.com/Documentation/Splunk/latest/Data/Whatissource)
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
- [`timechart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart)
- [`eval`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Eval)
- [`fieldsummary`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fieldsummary)

## Seguridad y sistema

- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)
- [Systemd en Ubuntu](https://documentation.ubuntu.com/server/explanation/systemd/)
- [Roles y capacidades de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Security/Rolesandcapabilities)
- [Usuarios y roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)