# Comprobaciones previas

Antes de iniciar el laboratorio, valida el sistema operativo, los recursos, la
conectividad, el servicio de Splunk, los permisos y los materiales.

Estas comprobaciones permiten separar correctamente los distintos tipos de
problema:

```text
Ubuntu
  ↓
Servicio Splunk
  ↓
Splunk Web
  ↓
Usuario y permisos
  ↓
Índice
  ↓
Datos
  ↓
Campos
  ↓
Búsquedas SPL
```

La instalación de Splunk Enterprise se considera un requisito previo para este
curso. Si Splunk ya está instalado, no es necesario repetir la instalación:
debes verificar que la instancia funciona y que está preparada para las
prácticas.

La instalación manual completa se encuentra en
[Instalación de Splunk](instalacion.md).

---

## 1. Objetivos de la comprobación

Al finalizar esta validación debes poder confirmar:

- que Ubuntu utiliza una arquitectura compatible;
- que los recursos disponibles son suficientes;
- que el usuario puede ejecutar comandos autorizados con `sudo`;
- que Splunk Enterprise está instalado;
- que la versión instalada es la esperada;
- que el servicio `splunkd` está activo;
- que Splunk Web responde;
- que el usuario puede iniciar sesión;
- que el usuario tiene el rol `admin` en Splunk;
- que el índice `curso` existe o está preparado;
- que el dataset de laboratorio está disponible;
- que los eventos pueden consultarse;
- que el rango temporal de los eventos es conocido.

No continúes con la ingesta ni con la creación de dashboards si una de estas
comprobaciones básicas falla.

---

## 2. Sistema operativo y recursos

Ejecuta los siguientes comandos desde una terminal de Ubuntu:

```bash
uname -m
```

```bash
cat /etc/os-release
```

```bash
nproc
```

```bash
free -h
```

```bash
df -h /
```

```bash
df -i /
```

#### 2.1 Resultados esperados

Comprueba que:

- la arquitectura es `x86_64`;
- el sistema operativo corresponde a Ubuntu 24.04 LTS;
- hay al menos 4 núcleos disponibles;
- existen aproximadamente 16 GB de RAM recomendados;
- hay al menos 20 GB libres como punto de partida;
- la partición no está próxima a quedarse sin inodos.

La información detallada sobre los recursos está disponible en
[Requisitos de hardware](requisitos-hardware.md).

#### 2.2 Comprobar la arquitectura de paquetes

```bash
dpkg --print-architecture
```

El resultado esperado es:

```text
amd64
```

La arquitectura del sistema debe ser compatible con el paquete `.deb` utilizado
por el laboratorio.

---

## 3. Fecha, hora y zona horaria

Splunk utiliza la información temporal para ordenar eventos, aplicar filtros y
ejecutar alertas.

Comprueba la configuración del sistema:

```bash
timedatectl
```

Revisa:

- fecha;
- hora;
- zona horaria;
- estado de sincronización;
- disponibilidad de NTP.

Una hora incorrecta puede provocar que:

- los eventos parezcan estar en el futuro;
- los eventos no aparezcan en el rango seleccionado;
- las alertas se ejecuten en momentos inesperados;
- `_time` y `_indextime` resulten difíciles de interpretar.

---

## 4. Red y conectividad

Comprueba la configuración de red:

```bash
hostname -I
```

```bash
ip addr
```

```bash
ip route
```

Si necesitas verificar la resolución de nombres:

```bash
getent hosts splunk.com
```

Comprueba que Ubuntu puede actualizar los índices de paquetes:

```bash
sudo apt update
```

Este comando no instala paquetes. Actualiza la información local de los
repositorios configurados.

#### 4.1 Acceso local

Si trabajarás desde la misma máquina, Splunk Web debe estar disponible en:

```text
http://localhost:8000
```

También puedes utilizar:

```text
http://127.0.0.1:8000
```

#### 4.2 Acceso remoto

Si el navegador se encuentra en otro equipo, utiliza la dirección IP de Ubuntu:

```text
http://DIRECCION_IP:8000
```

En este caso, comprueba además:

- que Ubuntu tiene una dirección IP accesible;
- que la máquina virtual utiliza una red adecuada;
- que el firewall permite el acceso;
- que el puerto `8000` no está bloqueado;
- que Splunk Web escucha en una dirección accesible desde la red.

No expongas Splunk Web directamente a Internet para realizar este laboratorio.
Utiliza una red controlada, acceso local o una VPN autorizada.

---

## 5. Permisos del sistema operativo

Comprueba que tu usuario puede utilizar `sudo`:

```bash
sudo -v
```

Si el comando termina sin errores, la credencial de `sudo` es válida para la
sesión actual.

Consulta el usuario actual:

```bash
whoami
```

Consulta sus grupos:

```bash
groups
```

El permiso `admin` de Splunk y el permiso `sudo` de Ubuntu son diferentes:

| Permiso | Ámbito | Ejemplo |
|---|---|---|
| `admin` | Splunk Enterprise | Crear índices, dashboards o alertas |
| `sudo` | Ubuntu | Consultar servicios, puertos o archivos protegidos |

Tener el rol `admin` dentro de Splunk no concede automáticamente permisos
administrativos sobre Ubuntu.

---

## 6. Materiales del laboratorio

Confirma que tienes disponibles:

- documentación del curso;
- acceso a una terminal de Ubuntu;
- navegador web actualizado;
- dataset `eventos_web.csv`;
- consultas SPL de referencia;
- credenciales de Splunk;
- acceso al índice `curso`;
- permisos suficientes para crear objetos de laboratorio.

Los materiales principales son:

- [eventos_web.csv](../downloads/eventos_web.csv);
- [consultas SPL de referencia](../downloads/consultas-spl.txt);
- [Datos del laboratorio](datos-laboratorio.md).

#### 6.1 Comprobar el archivo CSV

Si el archivo está disponible en `docs/downloads`, puedes revisarlo desde la
raíz del proyecto:

```bash
ls -lh docs/downloads/eventos_web.csv
```

```bash
file docs/downloads/eventos_web.csv
```

```bash
wc -l docs/downloads/eventos_web.csv
```

```bash
head -n 5 docs/downloads/eventos_web.csv
```

Comprueba:

- que el archivo existe;
- que tiene un tamaño razonable;
- que contiene una cabecera;
- que el separador es el esperado;
- que las columnas son coherentes;
- que no contiene credenciales ni datos sensibles.

No cargues varias veces el mismo archivo sin comprobar antes si ya fue
indexado. Una carga duplicada puede alterar los resultados de:

- conteos;
- porcentajes;
- rankings;
- gráficos;
- alertas.

---

## 7. Comprobar la instalación de Splunk

La ruta habitual de instalación es:

```text
/opt/splunk
```

Comprueba que existe:

```bash
ls -ld /opt/splunk
```

Comprueba la versión:

```bash
sudo /opt/splunk/bin/splunk version
```

Resultado esperado:

```text
Splunk Enterprise 10.4.3
```

Si el binario pertenece a un usuario de servicio y no requiere `sudo`, también
puedes ejecutar:

```bash
/opt/splunk/bin/splunk version
```

#### 7.1 Comprobar el espacio utilizado

```bash
sudo du -sh /opt/splunk 2>/dev/null
```

No borres manualmente directorios de Splunk para liberar espacio. La eliminación
directa puede producir pérdida de datos o problemas de arranque.

---

## 8. Comprobar el servicio Splunk

El método depende de cómo se haya configurado la instalación.

#### 8.1 Instalación gestionada por `systemd`

```bash
sudo systemctl status Splunkd --no-pager
```

Para comprobar si se inicia automáticamente:

```bash
sudo systemctl is-enabled Splunkd
```

#### 8.2 Instalación gestionada por el comando de Splunk

```bash
sudo /opt/splunk/bin/splunk status
```

Si la instancia se instaló o se ejecuta como `root`, puede ser necesario:

```bash
sudo /opt/splunk/bin/splunk status --run-as-root
```

Si se utiliza un usuario de servicio denominado `splunk`:

```bash
sudo -u splunk /opt/splunk/bin/splunk status
```

Elige el comando que corresponda a la forma en que está configurada la
instancia. No ejecutes indistintamente comandos con usuarios diferentes, porque
puedes obtener errores de permisos o crear archivos con propietarios
inadecuados.

#### 8.3 Comprobar el proceso

```bash
ps aux | grep '[s]plunkd'
```

Debe aparecer el proceso principal `splunkd`.

---

## 9. Comprobar los puertos

Consulta los puertos habituales:

```bash
sudo ss -ltnp | grep -E ':8000|:8089|:9997|:8088'
```

Los puertos tienen estas funciones:

| Puerto | Uso | Necesario |
|---:|---|---|
| `8000` | Splunk Web | Sí |
| `8089` | API de administración y comunicación interna | Sí |
| `9997` | Recepción desde Universal Forwarder | Solo si se configura |
| `8088` | HTTP Event Collector | Solo si se configura |

Para el laboratorio mononodo, los puertos `8000` y `8089` son los más
importantes.

El puerto `9997` no tiene que aparecer si no se ha configurado un Universal
Forwarder.

El puerto `8088` no tiene que aparecer si no se utiliza HTTP Event Collector.

---

## 10. Comprobar Splunk Web

Desde Ubuntu ejecuta:

```bash
curl -I http://127.0.0.1:8000
```

También puedes probar:

```bash
curl -I http://localhost:8000
```

Una respuesta HTTP `200` o una redirección `3xx` indica que existe un servicio
web respondiendo.

Después abre el navegador en:

```text
http://localhost:8000
```

Inicia sesión con la cuenta administrativa creada durante el primer arranque.

Si accedes desde otro equipo:

```text
http://DIRECCION_IP:8000
```

Si `curl` funciona en Ubuntu, pero el acceso remoto falla, revisa la red y el
firewall antes de modificar la configuración de Splunk.

---

## 11. Validar el usuario `admin` en Splunk

Desde Splunk Web, abre **Search & Reporting** y ejecuta:

```spl
| rest /services/authentication/current-context
| table username roles
```

Comprueba que:

- aparece el usuario esperado;
- el rol `admin` está presente;
- la consulta finaliza sin errores.

También puedes revisar los usuarios desde:

```text
Settings → Access controls → Users
```

La ubicación exacta de los menús puede variar ligeramente según la versión y la
configuración de Splunk Web.

#### 11.1 Prueba básica de búsqueda

Ejecuta:

```spl
| makeresults
| eval estado="Splunk responde correctamente"
```

Esta búsqueda no utiliza el índice `curso`. Sirve para comprobar que el motor de
búsqueda y Splunk Web funcionan.

---

## 12. Comprobar el índice `curso`

El curso utiliza principalmente el índice:

```text
curso
```

#### 12.1 Comprobar si existe

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

Comprueba:

- que el índice existe;
- que no está deshabilitado;
- que el contador de eventos es coherente;
- que el tamaño del índice no es inesperado.

#### 12.2 Si el índice todavía no existe

No crees un índice nuevo sin revisar primero:

- [Datos del laboratorio](datos-laboratorio.md);
- [Gestión de índices](../sesion-1/05-indices.md);
- la configuración prevista del curso.

El nombre debe ser exactamente:

```text
curso
```

Splunk distingue los nombres de índice utilizados en las búsquedas. Una
diferencia como `Curso`, `curso-lab` o `curso_lab` puede provocar que las
búsquedas no devuelvan resultados.

---

## 13. Comprobar los eventos

Ejecuta una búsqueda amplia durante la validación inicial:

```spl
index=curso earliest=0 latest=now
| stats
    count as total_eventos
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

Esta consulta permite conocer:

- número total de eventos;
- fecha del primer evento;
- fecha del último evento.

#### 13.1 Revisar los metadatos

```spl
index=curso earliest=0 latest=now
| stats count by source sourcetype host
| sort - count
```

#### 13.2 Revisar eventos individuales

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

#### 13.3 Revisar los campos disponibles

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

No supongas que todos los campos existen. Comprueba primero el dataset.

Los campos principales pueden incluir:

```text
timestamp
host
method
status
uri
```

Los campos adicionales pueden incluir:

```text
client_ip
response_time
user_agent
bytes
referer
```

Si un campo no existe, no construyas una métrica sobre él. Documenta la
limitación del dataset.

---

## 14. Comprobar el rango temporal

Los eventos pueden ser históricos aunque se hayan indexado recientemente.

Esta búsqueda utiliza todo el intervalo disponible:

```spl
index=curso earliest=0 latest=now
| stats earliest(_time) latest(_time)
```

La siguiente búsqueda solo consulta las últimas 24 horas:

```spl
index=curso earliest=-24h latest=now
| stats count
```

Si la segunda búsqueda devuelve cero eventos, no significa necesariamente que la
ingesta haya fallado. Puede indicar que el dataset contiene eventos históricos.

Recuerda:

- `_time`: tiempo asignado al evento;
- `_indextime`: momento en que Splunk indexó el evento.

Puedes comparar ambos valores:

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

## 15. Comprobación completa de aceptación

Ejecuta la siguiente secuencia.

#### Paso 1: comprobar el sistema

```bash
uname -m
nproc
free -h
df -h /
```

#### Paso 2: comprobar Splunk

```bash
sudo /opt/splunk/bin/splunk version
sudo /opt/splunk/bin/splunk status
```

Utiliza `--run-as-root` o `sudo -u splunk` si corresponde a tu instalación.

#### Paso 3: comprobar los puertos

```bash
sudo ss -ltnp | grep -E ':8000|:8089'
```

#### Paso 4: comprobar Splunk Web

```bash
curl -I http://127.0.0.1:8000
```

#### Paso 5: comprobar el motor de búsqueda

```spl
| makeresults
| eval estado="OK"
```

#### Paso 6: comprobar el índice

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount
```

#### Paso 7: comprobar los datos

```spl
index=curso earliest=0 latest=now
| stats
    count as total_eventos
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

#### Paso 8: comprobar los campos

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

---

## 16. Checklist final

#### Sistema operativo

- [ ] Ubuntu 24.04.5 LTS está instalado.
- [ ] La arquitectura es `x86_64`.
- [ ] La arquitectura de paquetes es `amd64`.
- [ ] Hay al menos 4 núcleos disponibles.
- [ ] Hay 16 GB de RAM recomendados.
- [ ] Hay al menos 20 GB libres o el espacio definido para el laboratorio.
- [ ] La fecha y la zona horaria son correctas.
- [ ] El usuario puede ejecutar comandos con `sudo`.

#### Splunk Enterprise

- [ ] Splunk Enterprise está instalado.
- [ ] La versión instalada está documentada.
- [ ] El servicio `splunkd` está activo.
- [ ] El puerto `8000` está escuchando.
- [ ] El puerto `8089` está escuchando.
- [ ] Splunk Web responde.
- [ ] El usuario puede iniciar sesión.
- [ ] El usuario tiene el rol `admin`.

#### Datos

- [ ] El archivo `eventos_web.csv` está disponible.
- [ ] El archivo ha sido revisado antes de cargarlo.
- [ ] El índice `curso` existe o está preparado.
- [ ] Se conoce el número de eventos.
- [ ] Se conoce el primer y último timestamp.
- [ ] Se han comprobado `source`, `sourcetype` y `host`.
- [ ] Se han revisado los campos disponibles.
- [ ] No se han creado duplicados por cargas repetidas.

#### Laboratorio

- [ ] La búsqueda `makeresults` funciona.
- [ ] Una búsqueda sobre `index=curso` funciona.
- [ ] Se pueden revisar eventos individuales.
- [ ] Se puede utilizar `stats`.
- [ ] Se puede utilizar `fieldsummary`.
- [ ] Se conoce la ruta adecuada de troubleshooting.

---

## 17. Mensajes de instalación que no bloquean el laboratorio

Durante la instalación o la ejecución de Splunk pueden aparecer avisos
relacionados con rutas internas de Python, por ejemplo:

```text
/opt/splunk/lib/python3.7/site-packages
```

Ese aviso no implica necesariamente un error de instalación.

Si se cumplen estas condiciones:

- `dpkg` termina correctamente;
- el paquete aparece instalado;
- `/opt/splunk/bin/splunk version` muestra la versión esperada;
- el servicio puede iniciarse;
- Splunk Web responde;

no instales Python 3.7 únicamente por ese mensaje.

La versión de Python utilizada internamente por Splunk forma parte de la
distribución de Splunk y no debe sustituirse manualmente sin seguir la
documentación oficial.

---

## 18. Si una comprobación falla

No continúes con la ingesta hasta resolver el problema básico.

#### Splunk no inicia

Revisa:

[Splunk no inicia](../troubleshooting/splunk-no-inicia.md)

Comandos iniciales:

```bash
sudo systemctl status Splunkd --no-pager
```

```bash
sudo /opt/splunk/bin/splunk status
```

#### Splunk Web no responde

Revisa:

[Acceso web](../troubleshooting/acceso-web.md)

Comandos iniciales:

```bash
curl -I http://127.0.0.1:8000
```

```bash
sudo ss -ltnp | grep ':8000'
```

#### No aparecen eventos

Revisa:

[Datos no aparecen](../troubleshooting/datos-no-aparecen.md)

Empieza con:

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

#### Los campos no son correctos

Revisa:

[Campos incorrectos](../troubleshooting/campos-incorrectos.md)

Ejecuta:

```spl
index=curso earliest=0 latest=now
| table
    _raw
    host
    source
    sourcetype
    status
    uri
| head 20
```

Después:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

---

## 19. Registro de resultados

Documenta los resultados de la preparación utilizando esta plantilla:

```markdown
#### Registro de comprobaciones previas

###### Sistema

- Sistema operativo:
- Arquitectura:
- CPU:
- RAM:
- Espacio libre:
- Zona horaria:

###### Splunk

- Versión:
- Ruta de instalación:
- Método de arranque:
- Estado del servicio:
- Puerto web:
- Management port:

###### Usuario

- Usuario de Splunk:
- Rol:
- Usuario de Ubuntu:
- Permisos `sudo`:

###### Datos

- Índice:
- Total de eventos:
- Primer evento:
- Último evento:
- Source:
- Sourcetype:
- Host:
- Campos principales:

###### Observaciones

-
```

Este registro permite comparar el estado inicial y detectar cambios durante las
prácticas.

---

## 20. Criterio para comenzar el curso

La preparación está completada cuando:

```text
Ubuntu validado
    +
Recursos suficientes
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
```

La búsqueda siguiente debe ejecutarse sin errores:

```spl
index=curso earliest=0 latest=now
| stats
    count as total_eventos
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

A partir de ese momento puedes continuar con:

- [Sesión 1](../sesion-1/index.md);
- [Navegación por Splunk Web](../sesion-1/03-splunk-web.md);
- [Ingesta de datos](../sesion-1/04-ingesta-datos.md);
- [Gestión de índices](../sesion-1/05-indices.md).

---

## 21. Referencias oficiales

#### Splunk Enterprise

- [Documentación de Splunk Enterprise](https://docs.splunk.com/Documentation/Splunk)
- [Splunk Enterprise Help](https://help.splunk.com/en/splunk-enterprise)
- [Notas de versión](https://docs.splunk.com/Documentation/Splunk/latest/ReleaseNotes)
- [Requisitos del sistema](https://docs.splunk.com/Documentation/Splunk/latest/Installation/Systemrequirements)

#### Servicio y administración

- [Administración de Splunk Enterprise](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Aboutconfigurationfiles)
- [Usuarios y roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Roles y capacidades](https://docs.splunk.com/Documentation/Splunk/latest/Security/Rolesandcapabilities)
- [Puertos de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/InheritedDeployment/Ports)

#### Datos e índices

- [Cómo procesa Splunk los datos](https://docs.splunk.com/Documentation/Splunk/latest/Data/HowSplunkprocessesdata)
- [Índices](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [`inputs.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Inputsconf)
- [`indexes.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Indexesconf)
- [Referencia de `props.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Propsconf)

#### Ubuntu

- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)
- [Systemd en Ubuntu](https://documentation.ubuntu.com/server/explanation/systemd/)
- [Gestión del firewall](https://documentation.ubuntu.com/server/how-to/security/firewalls/)
- [Gestión del almacenamiento](https://documentation.ubuntu.com/server/how-to/storage/)