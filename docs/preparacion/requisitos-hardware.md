# Requisitos de hardware

La máquina del laboratorio ejecutará en el mismo nodo:

- Ubuntu 24.04.5 LTS;
- Splunk Enterprise 10.4.3;
- Splunk Web;
- el índice de prácticas `curso`;
- los datasets del laboratorio;
- búsquedas SPL;
- reportes, dashboards y alertas.

Por este motivo, los recursos deben cubrir el sistema operativo, el servicio de
Splunk, el navegador y el almacenamiento de los índices.

> Estas recomendaciones son adecuadas para un laboratorio didáctico. No deben
> utilizarse para dimensionar un entorno de producción.

---

# 1. Perfil del laboratorio

El curso utiliza una arquitectura mononodo:

```text
Ubuntu
  └── Splunk Enterprise
        ├── splunkd
        ├── Splunk Web
        ├── índice curso
        ├── datos de laboratorio
        ├── búsquedas
        ├── dashboards
        └── alertas
```

Esta arquitectura es suficiente para aprender:

- fundamentos de Splunk;
- ingesta de datos;
- índices;
- búsquedas SPL;
- estadísticas;
- visualizaciones;
- dashboards;
- alertas;
- troubleshooting.

No representa una arquitectura de producción con varios indexers, search heads,
forwarders o mecanismos de alta disponibilidad.

---

# 2. Recomendaciones de recursos

| Recurso | Recomendación para el laboratorio | Observaciones |
|---|---:|---|
| CPU | 4 núcleos o más | Adecuado para Splunk, navegador y prácticas |
| Memoria RAM | 16 GB recomendados | Permite trabajar con comodidad |
| Memoria mínima | 8 GB | Puede ser suficiente para prácticas ligeras, pero con menos margen |
| Espacio libre inicial | 20 GB como punto de partida | Debe existir espacio adicional para crecimiento |
| Disco | SSD recomendado | Mejora el arranque y las búsquedas |
| Red | Conectividad estable | Necesaria para descarga, documentación y acceso web |
| Arquitectura | `x86_64` o `amd64` | Compatible con el paquete `.deb` del curso |

Los valores anteriores están pensados para un dataset pequeño y un uso educativo.
El consumo real depende de:

- número de eventos;
- tamaño de los eventos;
- frecuencia de ingesta;
- número de búsquedas;
- retención;
- logs internos;
- número de usuarios;
- número de dashboards;
- cantidad de datos almacenados.

---

# 3. CPU

Se recomiendan al menos cuatro núcleos de CPU:

```text
4 vCPU o más
```

Splunk puede utilizar CPU para:

- indexar eventos;
- ejecutar búsquedas;
- generar resultados estadísticos;
- construir visualizaciones;
- actualizar dashboards;
- ejecutar alertas;
- comprimir y mantener datos;
- realizar tareas internas.

## 3.1 Comprobar la CPU

Ejecuta:

```bash
nproc
```

Para obtener información ampliada:

```bash
lscpu
```

Comprueba especialmente:

- número de CPUs;
- arquitectura;
- modelo;
- frecuencia;
- virtualización, si se utiliza una máquina virtual.

## 3.2 Interpretación para el laboratorio

| Resultado | Interpretación |
|---:|---|
| 1–2 núcleos | Puede funcionar, pero habrá poca capacidad para búsquedas y navegador |
| 4 núcleos | Recomendación adecuada para el curso |
| 8 o más núcleos | Mayor margen para búsquedas y prácticas simultáneas |

El número de núcleos no garantiza por sí solo un buen rendimiento. También
influyen la velocidad del disco, la memoria disponible y el volumen de datos.

---

# 4. Memoria RAM

Se recomiendan:

```text
16 GB de RAM
```

La memoria se utiliza entre otros componentes por:

- Ubuntu;
- `splunkd`;
- Splunk Web;
- procesos de búsqueda;
- navegador;
- cachés;
- scripts;
- herramientas de diagnóstico.

## 4.1 Comprobar la memoria

```bash
free -h
```

También puedes consultar:

```bash
cat /proc/meminfo | head -n 10
```

Revisa especialmente:

- memoria total;
- memoria disponible;
- memoria utilizada;
- swap disponible.

## 4.2 Interpretación

| Memoria | Uso recomendado |
|---:|---|
| 8 GB | Laboratorio básico y pocas tareas simultáneas |
| 16 GB | Recomendación para trabajar con comodidad |
| 32 GB o más | Más margen para datasets grandes y múltiples usuarios |

La memoria disponible puede disminuir durante búsquedas o actualizaciones del
dashboard. No evalúes el sistema únicamente justo después de iniciar Ubuntu.

## 4.3 Swap

Comprueba si existe swap:

```bash
swapon --show
```

La swap puede ayudar a evitar que el sistema finalice procesos cuando falta
memoria, pero **no sustituye a la RAM**. Un uso intenso de swap puede provocar
un rendimiento muy bajo, especialmente durante búsquedas o tareas de indexación.

---

# 5. Almacenamiento

Splunk utiliza disco para almacenar:

- eventos indexados;
- índices;
- metadatos;
- buckets;
- logs internos;
- configuraciones;
- resultados temporales;
- archivos de búsqueda;
- datos del laboratorio.

El consumo aumenta con:

- número de eventos;
- tamaño de los eventos;
- número de cargas del mismo dataset;
- retención configurada;
- logs generados;
- búsquedas concurrentes;
- cantidad de aplicaciones y objetos.

## 5.1 Espacio recomendado

Para el laboratorio se recomienda:

```text
20 GB libres como punto de partida
```

Esta cifra debe interpretarse como espacio inicial para:

- la instalación;
- los datasets;
- los índices;
- los logs;
- los resultados temporales;
- el crecimiento del laboratorio.

No conviene dejar la partición al límite. Reserva espacio adicional si se van a
cargar varios datasets o repetir muchas prácticas de ingesta.

## 5.2 Comprobar el espacio de la partición raíz

```bash
df -h /
```

## 5.3 Comprobar `/opt`

La instalación habitual se encuentra en `/opt/splunk`:

```bash
df -h /opt
```

Si `/opt` pertenece a la misma partición que `/`, las dos salidas pueden ser
similares.

## 5.4 Comprobar el uso de Splunk

```bash
sudo du -sh /opt/splunk 2>/dev/null
```

Para ver los subdirectorios principales:

```bash
sudo du -h -d 1 /opt/splunk 2>/dev/null | sort -h
```

El tiempo de ejecución de este comando puede aumentar si hay muchos datos.

## 5.5 Comprobar inodos

```bash
df -i /
```

Un sistema puede tener espacio libre en gigabytes y, aun así, quedarse sin
inodos. Esto puede impedir crear nuevos archivos.

## 5.6 Disco recomendado

Un SSD es preferible a un disco mecánico porque mejora:

- el arranque de Splunk;
- la escritura de eventos;
- la lectura de índices;
- la ejecución de búsquedas;
- la respuesta de Splunk Web.

## 5.7 No eliminar archivos manualmente

No borres manualmente subdirectorios de:

```text
/opt/splunk/var/lib/splunk
```

ni de:

```text
/opt/splunk/var/log/splunk
```

La eliminación manual puede provocar pérdida de datos, inconsistencias o
problemas de arranque.

La gestión de índices, retención y almacenamiento debe realizarse mediante la
configuración adecuada y siguiendo la documentación de Splunk.

Consulta:

[Gestión de índices](../sesion-1/05-indices.md)

---

# 6. Sistema de archivos

Comprueba el tipo de sistema de archivos:

```bash
findmnt -T /opt/splunk
```

También puedes consultar:

```bash
lsblk -f
```

El objetivo es conocer:

- dispositivo;
- punto de montaje;
- sistema de archivos;
- espacio disponible;
- opciones de montaje.

Evita colocar los datos de Splunk en una partición temporal o con un límite
demasiado pequeño.

Si utilizas una máquina virtual, revisa también:

- tamaño máximo del disco virtual;
- crecimiento dinámico;
- espacio libre del equipo anfitrión;
- rendimiento del almacenamiento;
- snapshots antiguos.

Los snapshots pueden consumir mucho espacio y degradar el rendimiento de la
máquina virtual.

---

# 7. Máquina física o virtual

El laboratorio puede ejecutarse en:

- un equipo físico;
- una máquina virtual local;
- un servidor Ubuntu;
- un entorno de laboratorio.

## 7.1 Máquina virtual

Si utilizas una máquina virtual:

- asigna al menos 4 vCPU;
- asigna 16 GB de RAM cuando sea posible;
- utiliza un disco virtual con espacio suficiente;
- evita sobreasignar excesivamente la memoria;
- habilita la virtualización asistida por hardware;
- revisa la sincronización horaria;
- comprueba el modo de red;
- verifica el acceso al puerto `8000`.

## 7.2 Modos de red

| Modo | Acceso habitual |
|---|---|
| NAT | Normalmente permite salida a Internet; puede requerir redirección de puertos |
| Bridge | La máquina virtual obtiene presencia en la red local |
| Host-only | Permite comunicación con el host, pero no necesariamente Internet |
| Red interna | Comunicación únicamente con otras máquinas de la red virtual |

Para acceder desde el propio Ubuntu:

```text
http://localhost:8000
```

Para acceder desde otro equipo:

```text
http://DIRECCION_IP_DE_UBUNTU:8000
```

En ese segundo caso, revisa:

- dirección IP;
- ruta de red;
- firewall;
- reglas de la máquina virtual;
- dirección de escucha de Splunk Web.

## 7.3 Comprobar la dirección IP

```bash
ip addr
```

Para revisar las rutas:

```bash
ip route
```

---

# 8. Arquitectura y compatibilidad

## 8.1 Comprobar la arquitectura

```bash
uname -m
```

Resultado esperado:

```text
x86_64
```

También puedes ejecutar:

```bash
dpkg --print-architecture
```

Resultado esperado:

```text
amd64
```

La arquitectura debe ser compatible con el paquete `.deb` utilizado en el curso.

## 8.2 Comprobar la versión de Ubuntu

```bash
cat /etc/os-release
```

O, si está disponible:

```bash
lsb_release -a
```

El entorno de referencia es:

```text
Ubuntu 24.04.5 LTS
```

La versión instalada debe ser compatible con la versión de Splunk utilizada.
Comprueba siempre la matriz oficial de compatibilidad para entornos que no sean
el laboratorio del curso.

---

# 9. Red y puertos

Los puertos principales de una instalación mononodo son:

| Puerto | Uso | Necesario en el laboratorio |
|---:|---|---|
| `8000` | Splunk Web | Sí |
| `8089` | API de administración y comunicación interna | Sí |
| `9997` | Recepción desde Universal Forwarder | Solo si se configura |
| `8088` | HTTP Event Collector | Solo si se configura |

## 9.1 Comprobar puertos

```bash
sudo ss -ltnp | grep -E ':8000|:8089|:9997|:8088'
```

Para comprobar únicamente Splunk Web:

```bash
sudo ss -ltnp | grep ':8000'
```

## 9.2 Comprobar Splunk Web

```bash
curl -I http://127.0.0.1:8000
```

Después abre:

```text
http://localhost:8000
```

## 9.3 Acceso remoto

Si accedes desde otro equipo, utiliza:

```text
http://DIRECCION_IP:8000
```

El puerto `8000` debe estar permitido entre el equipo cliente y Ubuntu.

No expongas Splunk Web directamente a Internet para realizar este laboratorio.
Utiliza una red controlada, VPN o acceso local.

## 9.4 Firewall

Si el firewall está activo:

```bash
sudo ufw status verbose
```

En un laboratorio local, evita abrir puertos innecesarios. Si necesitas acceso
desde otra máquina, permite únicamente el origen y el puerto requeridos, de
acuerdo con la política de tu entorno.

---

# 10. Recursos cuando Splunk ya está instalado

Si Splunk Enterprise ya está instalado, no es necesario descargar de nuevo el
paquete. Centra la comprobación en:

1. versión;
2. servicio;
3. puertos;
4. acceso web;
5. usuario;
6. índice;
7. datos;
8. almacenamiento.

## 10.1 Comprobar la versión

```bash
/opt/splunk/bin/splunk version
```

## 10.2 Comprobar el servicio

```bash
sudo systemctl status Splunkd --no-pager
```

## 10.3 Comprobar el espacio

```bash
df -h /
```

```bash
sudo du -sh /opt/splunk 2>/dev/null
```

## 10.4 Comprobar el índice

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

## 10.5 Comprobar eventos

```spl
index=curso earliest=0 latest=now
| stats
    count as total_eventos
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

---

# 11. Comprobación del rendimiento inicial

Estas comprobaciones no sustituyen una prueba de rendimiento formal, pero
permiten detectar problemas evidentes.

## 11.1 Carga del sistema

```bash
uptime
```

```bash
top
```

Si está instalado:

```bash
htop
```

Observa:

- carga media;
- consumo de CPU;
- consumo de memoria;
- procesos de Splunk;
- uso de swap.

## 11.2 Prueba de búsqueda básica

```spl
| makeresults
| eval estado="OK"
```

## 11.3 Prueba sobre el índice

```spl
index=curso earliest=0 latest=now
| stats count
```

## 11.4 Interpretación

Una búsqueda lenta puede deberse a:

- exceso de datos;
- rango temporal demasiado amplio;
- disco lento;
- memoria insuficiente;
- demasiadas búsquedas simultáneas;
- consulta poco optimizada;
- problemas de recursos del sistema.

Durante la exploración, utiliza búsquedas acotadas y selecciona únicamente los
campos necesarios:

```spl
index=curso earliest=0 latest=now
| fields _time host status uri
| head 20
```

---

# 12. Comprobaciones de fecha y hora

La configuración temporal es importante para Splunk y para las alertas.

Comprueba:

```bash
timedatectl
```

Revisa:

- fecha;
- hora;
- zona horaria;
- estado de sincronización;
- servidor NTP, si procede.

Desde Splunk, compara el tiempo del evento y el tiempo de indexación:

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

Un dataset histórico puede no aparecer con:

```spl
index=curso earliest=-24h latest=now
```

Durante la validación utiliza:

```spl
index=curso earliest=0 latest=now
```

---

# 13. Criterios de aceptación del hardware

La máquina cumple los requisitos del laboratorio cuando:

## CPU y memoria

- [ ] Tiene al menos 4 núcleos.
- [ ] Tiene 16 GB de RAM recomendados o una configuración suficiente para las prácticas.
- [ ] No utiliza swap de forma constante.
- [ ] La carga del sistema es razonable.

## Almacenamiento

- [ ] Hay al menos 20 GB libres como punto de partida.
- [ ] La partición de `/opt/splunk` tiene espacio suficiente.
- [ ] Existe espacio para los datasets y logs.
- [ ] Se han revisado los inodos.
- [ ] No se han borrado manualmente archivos de Splunk.

## Sistema

- [ ] La arquitectura es `x86_64` o `amd64`.
- [ ] Ubuntu es compatible con el laboratorio.
- [ ] La hora del sistema es correcta.
- [ ] La red funciona.
- [ ] El usuario puede ejecutar las comprobaciones necesarias.

## Splunk

- [ ] Splunk Enterprise está instalado.
- [ ] La versión está documentada.
- [ ] `splunkd` está activo.
- [ ] Splunk Web responde.
- [ ] El puerto `8000` está disponible.
- [ ] El puerto `8089` está disponible para la administración interna.
- [ ] El índice `curso` está disponible.
- [ ] Las búsquedas de prueba funcionan.

---

# 14. Lista de comprobación rápida

Ejecuta:

```bash
printf '%s\n' '--- Arquitectura ---'
uname -m
dpkg --print-architecture

printf '%s\n' '--- CPU ---'
nproc

printf '%s\n' '--- Memoria ---'
free -h

printf '%s\n' '--- Disco ---'
df -h /
df -h /opt 2>/dev/null || true

printf '%s\n' '--- Inodos ---'
df -i /

printf '%s\n' '--- Hora ---'
timedatectl

printf '%s\n' '--- Splunk ---'
/opt/splunk/bin/splunk version

printf '%s\n' '--- Puertos ---'
sudo ss -ltnp | grep -E ':8000|:8089' || true
```

Después comprueba desde Splunk Web:

```spl
| makeresults
| eval estado="Splunk Web y el buscador funcionan"
```

Y:

```spl
index=curso earliest=0 latest=now
| stats
    count as total_eventos
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

---

# 15. Problemas frecuentes

## 15.1 Hay poco espacio en disco

Comprueba:

```bash
df -h
```

Y:

```bash
sudo du -h -d 1 /opt/splunk 2>/dev/null | sort -h
```

No elimines carpetas de índices manualmente. Revisa la retención y la
configuración siguiendo la documentación de Splunk.

## 15.2 Splunk utiliza demasiada memoria

Comprueba:

```bash
free -h
```

```bash
top
```

Reduce durante el laboratorio:

- búsquedas simultáneas;
- rangos temporales innecesariamente amplios;
- dashboards con muchos paneles;
- cargas repetidas del mismo dataset.

## 15.3 El navegador no puede abrir Splunk Web

Comprueba:

```bash
sudo ss -ltnp | grep ':8000'
```

```bash
curl -I http://127.0.0.1:8000
```

Si funciona desde Ubuntu pero no desde otro equipo, revisa la red y el firewall.

Consulta:

[Acceso web](../troubleshooting/acceso-web.md)

## 15.4 La máquina virtual funciona lentamente

Comprueba:

- memoria asignada;
- número de vCPU;
- espacio del disco del host;
- snapshots;
- modo de almacenamiento;
- sobreasignación de recursos;
- consumo de swap.

## 15.5 Las búsquedas no devuelven eventos

Primero utiliza:

```spl
index=curso earliest=0 latest=now
| stats count
```

Después comprueba el rango temporal real:

```spl
index=curso earliest=0 latest=now
| stats earliest(_time) latest(_time)
```

Consulta:

[Datos no aparecen](../troubleshooting/datos-no-aparecen.md)

---

# 16. Referencias del curso

- [Preparación del laboratorio](index.md)
- [Comprobaciones previas](comprobaciones-previas.md)
- [Arquitectura y componentes](arquitectura.md)
- [Instalación de Splunk](instalacion.md)
- [Arquitectura del laboratorio](arquitectura-laboratorio.md)
- [Datos del laboratorio](datos-laboratorio.md)
- [Gestión de índices](../sesion-1/05-indices.md)
- [Gestión del tiempo](../sesion-2/03-gestion-tiempo.md)
- [Rendimiento](../sesion-2/10-rendimiento.md)
- [Acceso web](../troubleshooting/acceso-web.md)
- [Splunk no inicia](../troubleshooting/splunk-no-inicia.md)

---

# 17. Referencias oficiales

## Splunk Enterprise

- [Documentación de Splunk Enterprise](https://docs.splunk.com/Documentation/Splunk)
- [Splunk Enterprise Help](https://help.splunk.com/en/splunk-enterprise)
- [Notas de versión](https://docs.splunk.com/Documentation/Splunk/latest/ReleaseNotes)
- [Requisitos de plataforma](https://docs.splunk.com/Documentation/Splunk/latest/Installation/Systemrequirements)

## Almacenamiento e índices

- [Índices de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [`indexes.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Indexesconf)
- [Gestión del almacenamiento](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Manageindexes)
- [Retención de datos](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Setaretentionpolicy)

## Búsqueda y rendimiento

- [Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/WhatsInThisManual)
- [Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Overview)
- [Job Inspector](https://docs.splunk.com/Documentation/Splunk/latest/Search/Viewsearchjobproperties)
- [Buenas prácticas de búsqueda](https://docs.splunk.com/Documentation/Splunk/latest/Search/Specifytimemodifiersinyoursearch)

## Ubuntu

- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)
- [Systemd en Ubuntu](https://documentation.ubuntu.com/server/explanation/systemd/)
- [Gestión del firewall](https://documentation.ubuntu.com/server/how-to/security/firewalls/)
- [Gestión de almacenamiento](https://documentation.ubuntu.com/server/how-to/storage/)

---

# 18. Resumen

La máquina está preparada desde el punto de vista de recursos cuando:

```text
Ubuntu compatible
    +
Arquitectura x86_64/amd64
    +
4 núcleos o más
    +
16 GB de RAM recomendados
    +
20 GB libres como punto de partida
    +
Disco con margen de crecimiento
    +
Red funcional
    +
Puerto 8000 accesible
    +
splunkd activo
    +
Índice curso disponible
```

Estos requisitos son suficientes para realizar el laboratorio, pero no definen
el tamaño de una instalación de producción.

En producción se deben analizar además:

- volumen de ingesta;
- retención;
- búsquedas simultáneas;
- usuarios;
- crecimiento;
- disponibilidad;
- rendimiento de disco;
- copias de seguridad;
- seguridad;
- arquitectura distribuida.