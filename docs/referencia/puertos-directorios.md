# Puertos y directorios

Resumen de puertos y ubicaciones relevantes del entorno.

Este documento describe los puertos, rutas y directorios más importantes de un
entorno con Splunk Enterprise instalado en Ubuntu.

El objetivo es que los asistentes puedan:

- identificar qué servicio utiliza cada puerto;
- comprobar si un puerto está escuchando;
- diferenciar Splunk Web de `splunkd`;
- localizar la instalación;
- revisar configuraciones;
- encontrar logs;
- comprobar permisos;
- localizar aplicaciones;
- diagnosticar problemas de ingesta;
- verificar el acceso desde Splunk Web y desde la terminal.

---

## 1. Entorno de referencia

El laboratorio utiliza como referencia:

- Splunk Enterprise 10.4.3.
- Ubuntu 24.04.5 LTS.
- Instalación habitual en `/opt/splunk`.
- Splunk Web en `http://localhost:8000`.
- Puerto de administración y API en `8089`.
- Puerto habitual de recepción de forwarders en `9997`.
- Índice de trabajo: `curso`.

La ruta de instalación puede cambiar. Antes de utilizar los ejemplos, comprueba
el valor real de `SPLUNK_HOME`.

```bash
echo "$SPLUNK_HOME"
```

Si la variable no está definida, comprueba la instalación habitual:

```bash
ls -ld /opt/splunk
```

También puedes localizar el ejecutable:

```bash
command -v splunk
```

o:

```bash
readlink -f "$(command -v splunk)"
```

---

## 2. Diferencia entre puertos y servicios

Un puerto es un punto de comunicación utilizado por un proceso.

En Splunk suelen intervenir dos componentes principales:

#### Splunk Web

Interfaz web utilizada por los usuarios.

Ejemplo:

```text
http://localhost:8000
```

#### `splunkd`

Proceso principal de Splunk Enterprise.

Se encarga, entre otras tareas, de:

- búsquedas;
- indexación;
- administración;
- API REST;
- comunicación interna;
- recepción de datos;
- gestión de configuraciones;
- ejecución de alertas.

El servicio `splunkd` utiliza normalmente el puerto `8089` para la interfaz de
administración y API.

---

## 3. Tabla de puertos principales

| Puerto | Servicio o función habitual | Protocolo | Uso |
|---:|---|---|---|
| `8000` | Splunk Web | HTTP/HTTPS | Acceso de usuarios |
| `8089` | Management port | HTTPS | API REST y administración |
| `9997` | Receiving port | TCP | Recepción desde forwarders |
| `8088` | HTTP Event Collector | HTTP/HTTPS | Ingesta mediante HEC |
| `514` | Syslog tradicional | UDP/TCP | Recepción de syslog, si se configura |
| `1514` | Syslog alternativo | UDP/TCP | Evitar privilegios del puerto 514 |
| `9998` | Puerto de ejemplo | TCP | Debe configurarse expresamente |
| `9999` | Puerto de ejemplo | TCP | Debe configurarse expresamente |

Los puertos `9997`, `8088`, `514`, `1514`, `9998` y `9999` no deben darse por
habilitados automáticamente. Deben comprobarse en la configuración de la
instancia.

---

## 4. Puerto 8000: Splunk Web

#### Finalidad

El puerto `8000` se utiliza habitualmente para acceder a la interfaz web.

URL habitual:

```text
http://localhost:8000
```

Si se utiliza HTTPS:

```text
https://localhost:8000
```

La configuración concreta puede utilizar otro puerto.

#### Comprobar desde el navegador

Abre:

```text
http://localhost:8000
```

#### Comprobar desde Ubuntu

```bash
sudo ss -lntp | grep ':8000'
```

Otra opción:

```bash
sudo lsof -nP -iTCP:8000 -sTCP:LISTEN
```

#### Comprobar con `curl`

```bash
curl -I http://localhost:8000
```

La respuesta puede indicar:

- `200 OK`;
- `302 Found`;
- redirección a login;
- error de conexión;
- error de certificado si se utiliza HTTPS.

#### Problemas habituales

###### El navegador no conecta

Comprueba:

```bash
sudo systemctl status Splunkd
```

Después:

```bash
sudo ss -lntp | grep ':8000'
```

Posibles causas:

- Splunk no está iniciado;
- Splunk Web utiliza otro puerto;
- el firewall bloquea el puerto;
- el servicio solo escucha en `127.0.0.1`;
- existe un error de configuración;
- el navegador utiliza un protocolo incorrecto.

###### El puerto escucha, pero no se puede acceder desde otro equipo

Comprueba la dirección de escucha:

```bash
sudo ss -lntp | grep ':8000'
```

Resultados habituales:

```text
127.0.0.1:8000
```

Solo accesible desde el propio equipo.

```text
0.0.0.0:8000
```

Escucha en todas las interfaces IPv4, sujeto a firewall.

```text
[::]:8000
```

Escucha mediante IPv6.

No expongas Splunk Web a redes no confiables sin aplicar controles de seguridad.

---

## 5. Puerto 8089: Management port

#### Finalidad

El puerto `8089` se utiliza habitualmente para:

- API REST;
- administración;
- comunicación interna;
- gestión de búsquedas;
- configuración;
- consultas administrativas;
- comunicación entre componentes Splunk.

Normalmente utiliza HTTPS.

#### Comprobar el puerto

```bash
sudo ss -lntp | grep ':8089'
```

```bash
sudo lsof -nP -iTCP:8089 -sTCP:LISTEN
```

#### Probar la API localmente

```bash
curl -k https://localhost:8089/services/server/info
```

La opción `-k` desactiva la validación del certificado. Utilízala únicamente en
el laboratorio y no como práctica general de producción.

#### Consultar con autenticación

No escribas contraseñas directamente en el historial de shell.

Ejemplo didáctico:

```bash
curl -k -u admin https://localhost:8089/services/server/info
```

`curl` solicitará la contraseña de forma interactiva en algunos entornos.

Una alternativa es utilizar un token con las medidas de seguridad adecuadas:

```bash
curl -k \
  -H "Authorization: Bearer <TOKEN>" \
  https://localhost:8089/services/server/info
```

No incluyas el token en:

- capturas;
- Markdown;
- repositorios;
- scripts compartidos;
- entregas del curso.

#### Consultar la API desde SPL

Comprobar el contexto del usuario:

```spl
| rest /services/authentication/current-context
| table username roles
```

Consultar índices:

```spl
| rest /services/data/indexes
| table title disabled totalEventCount currentDBSizeMB
```

Consultar entradas monitorizadas:

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype disabled
```

#### Problemas habituales

Si `8089` no escucha:

- `splunkd` puede estar detenido;
- existe un error de configuración;
- el puerto se ha cambiado;
- otro proceso utiliza el puerto;
- la instancia no ha terminado de iniciar.

Revisa:

```bash
sudo systemctl status Splunkd
```

```bash
sudo journalctl -u Splunkd --since "30 minutes ago"
```

Y los logs internos:

```spl
index=_internal earliest=-30m latest=now
| search log_level=error OR log_level=warn
| table _time host component log_level message
| sort - _time
```

---

## 6. Puerto 9997: recepción desde forwarders

#### Finalidad

El puerto `9997` se utiliza habitualmente para recibir datos enviados por
forwarders.

Este puerto solo estará operativo si se ha configurado una entrada de recepción.

#### Comprobar si escucha

```bash
sudo ss -lntp | grep ':9997'
```

```bash
sudo lsof -nP -iTCP:9997 -sTCP:LISTEN
```

Si no aparece, es posible que el receiving port no esté configurado.

#### Diferencia entre forwarder y monitor local

###### Monitor local

Splunk lee un archivo de la propia máquina:

```text
/var/log/splunk-curso/eventos_web.csv
```

###### Forwarder

Un agente instalado en otro equipo envía los datos a Splunk mediante TCP.

```text
Forwarder → TCP 9997 → Splunk Enterprise
```

#### Comprobar entradas de recepción

Desde Splunk Web revisa la configuración de entradas de recepción.

También puedes utilizar la API REST:

```spl
| rest /services/data/inputs/tcp
| table port index sourcetype disabled
```

#### Comprobar conectividad desde otro equipo

Desde el equipo que actúa como forwarder:

```bash
nc -vz <IP_SPLUNK> 9997
```

o:

```bash
timeout 5 bash -c '</dev/tcp/<IP_SPLUNK>/9997' \
  && echo "Puerto accesible" \
  || echo "Puerto no accesible"
```

Una conexión TCP correcta no demuestra que los datos estén siendo indexados. Debes
comprobar también:

- configuración del forwarder;
- índice;
- `sourcetype`;
- permisos;
- eventos recibidos.

---

## 7. Puerto 8088: HTTP Event Collector

#### Finalidad

El puerto `8088` suele utilizarse para HTTP Event Collector, conocido como HEC.

HEC permite enviar eventos mediante HTTP o HTTPS desde:

- aplicaciones;
- scripts;
- microservicios;
- plataformas cloud;
- automatizaciones;
- agentes;
- herramientas externas.

#### Comprobar si está configurado

```bash
sudo ss -lntp | grep ':8088'
```

Desde Splunk puede consultarse la configuración relacionada con HEC mediante la
administración de entradas y tokens.

#### Ejemplo conceptual de envío

No utilices tokens reales en ejercicios compartidos.

```bash
curl -k https://localhost:8088/services/collector \
  -H "Authorization: Splunk <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"event":{"host":"web-01","status":500,"uri":"/api/users"}}'
```

#### Buenas prácticas

- utilizar HTTPS;
- proteger el token;
- limitar el acceso de red;
- asignar el índice correcto;
- validar el formato JSON;
- controlar el tamaño de los eventos;
- monitorizar errores de autenticación;
- no incluir secretos en los eventos.

---

## 8. Puertos 514 y 1514: syslog

#### Puerto 514

El puerto `514` se utiliza tradicionalmente para syslog.

Los puertos inferiores a `1024` pueden requerir privilegios especiales en Linux.

#### Puerto 1514

El puerto `1514` se utiliza a menudo como alternativa para evitar ciertas
limitaciones del puerto `514`.

Ninguno de estos puertos debe considerarse habilitado sin comprobar la
configuración.

#### Comprobar puertos

```bash
sudo ss -lunp | grep -E ':514|:1514'
```

Para TCP:

```bash
sudo ss -lntp | grep -E ':514|:1514'
```

#### Consideraciones

- UDP no confirma que el receptor haya procesado el mensaje;
- TCP permite una conexión más controlada;
- syslog puede requerir parsing específico;
- documenta el formato;
- revisa la pérdida de paquetes;
- valida `source`, `host` y `sourcetype`.

---

## 9. Comprobar todos los puertos habituales

```bash
sudo ss -lntup | grep -E ':8000|:8088|:8089|:9997|:514|:1514'
```

Para mostrar procesos:

```bash
sudo ss -lntup
```

Para consultar solo puertos TCP:

```bash
sudo ss -lntp
```

Para consultar solo puertos UDP:

```bash
sudo ss -lunp
```

#### Utilizando `netstat`

Si está instalado:

```bash
sudo netstat -lntup
```

`ss` suele estar disponible de forma predeterminada en instalaciones modernas de
Ubuntu.

#### Utilizando `lsof`

```bash
sudo lsof -nP -i
```

Solo procesos que escuchan:

```bash
sudo lsof -nP -iTCP -sTCP:LISTEN
```

---

## 10. Comprobar el proceso de Splunk

#### Estado mediante systemd

```bash
sudo systemctl status Splunkd
```

#### Iniciar Splunk

```bash
sudo systemctl start Splunkd
```

#### Detener Splunk

```bash
sudo systemctl stop Splunkd
```

#### Reiniciar Splunk

```bash
sudo systemctl restart Splunkd
```

No reinicies Splunk en un entorno compartido sin evaluar el impacto.

#### Estado mediante el binario de Splunk

```bash
sudo /opt/splunk/bin/splunk status
```

#### Versión

```bash
sudo /opt/splunk/bin/splunk version
```

#### Procesos

```bash
ps aux | grep -i splunk
```

Una búsqueda más específica:

```bash
pgrep -af splunk
```

---

## 11. Directorio principal: `SPLUNK_HOME`

`SPLUNK_HOME` es la ruta raíz de la instalación de Splunk.

En este laboratorio se espera:

```text
/opt/splunk
```

#### Comprobar la variable

```bash
echo "$SPLUNK_HOME"
```

Si está definida:

```bash
ls -ld "$SPLUNK_HOME"
```

Si no está definida:

```bash
ls -ld /opt/splunk
```

#### Estructura general

```text
/opt/splunk/
├── bin/
├── etc/
├── lib/
├── share/
└── var/
```

---

## 12. `/opt/splunk/bin`

Contiene ejecutables y herramientas de administración.

Ruta habitual:

```text
/opt/splunk/bin
```

#### Comandos importantes

```bash
/opt/splunk/bin/splunk status
```

```bash
/opt/splunk/bin/splunk version
```

```bash
/opt/splunk/bin/splunk start
```

```bash
/opt/splunk/bin/splunk stop
```

```bash
/opt/splunk/bin/splunk restart
```

#### Comprobar ayuda

```bash
/opt/splunk/bin/splunk help
```

#### Comprobar el ejecutable

```bash
ls -l /opt/splunk/bin/splunk
```

No ejecutes comandos de modificación de configuración sin comprender el impacto.

---

## 13. `/opt/splunk/etc`

Contiene configuración de Splunk.

Ruta:

```text
/opt/splunk/etc
```

Incluye, entre otros:

- configuración del sistema;
- aplicaciones;
- autenticación;
- usuarios;
- búsquedas guardadas;
- archivos de configuración;
- certificados;
- configuraciones locales.

#### Listar contenido

```bash
sudo ls -la /opt/splunk/etc
```

#### Subdirectorios importantes

```text
/opt/splunk/etc/apps
/opt/splunk/etc/system
/opt/splunk/etc/auth
```

---

## 14. `/opt/splunk/etc/apps`

Contiene aplicaciones de Splunk.

Ruta:

```text
/opt/splunk/etc/apps
```

Cada aplicación puede incluir:

- dashboards;
- búsquedas;
- alertas;
- configuraciones;
- assets;
- archivos de localización;
- permisos;
- macros;
- lookups.

#### Listar aplicaciones

```bash
sudo find /opt/splunk/etc/apps -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort
```

#### Ejemplo de aplicación propia

```text
/opt/splunk/etc/apps/curso_monitorizacion/
```

#### Estructura conceptual

```text
curso_monitorizacion/
├── appserver/
├── default/
├── local/
├── metadata/
├── static/
└── README/
```

#### Aplicación para el laboratorio

Es recomendable separar los objetos del curso en una aplicación propia.

Ejemplo:

```text
curso_monitorizacion
```

Esto facilita:

- exportación;
- control de cambios;
- permisos;
- documentación;
- separación de configuraciones;
- reproducción en otra instancia.

---

## 15. `/opt/splunk/etc/apps/<app>/default`

Contiene configuración predeterminada de una aplicación.

Ejemplo:

```text
/opt/splunk/etc/apps/curso_monitorizacion/default
```

Los archivos ubicados en `default` sirven como valores base.

No se recomienda modificar configuraciones de aplicaciones de fabricante sin
documentarlo.

---

## 16. `/opt/splunk/etc/apps/<app>/local`

Contiene configuraciones locales que sobrescriben valores predeterminados.

Ejemplo:

```text
/opt/splunk/etc/apps/curso_monitorizacion/local
```

Uso habitual:

```text
default/props.conf
local/props.conf
```

La configuración de `local` suele tener prioridad sobre `default`.

#### Regla práctica

- `default`: valores base de la aplicación;
- `local`: personalizaciones del entorno;
- `system/local`: cambios globales del sistema.

No copies configuraciones a `local` sin revisar su precedencia y alcance.

---

## 17. `/opt/splunk/etc/system`

Contiene configuración del sistema.

Subdirectorios habituales:

```text
/opt/splunk/etc/system/default
/opt/splunk/etc/system/local
```

#### `system/default`

Contiene valores predeterminados proporcionados por Splunk.

No modifiques directamente estos archivos.

```text
/opt/splunk/etc/system/default
```

#### `system/local`

Contiene configuraciones globales personalizadas.

```text
/opt/splunk/etc/system/local
```

Los cambios realizados aquí pueden afectar a toda la instancia.

Antes de modificar un archivo:

```bash
sudo cp archivo.conf archivo.conf.bak
```

Aun así, para un proyecto reproducible es preferible utilizar una aplicación
propia cuando sea posible.

---

## 18. Archivos de configuración habituales

#### `inputs.conf`

Define entradas de datos.

Ejemplo conceptual:

```ini
[monitor:///var/log/splunk-curso/eventos_web.csv]
disabled = false
index = curso
sourcetype = web:csv
host = web-lab
```

#### `props.conf`

Puede intervenir en:

- parsing;
- separación de eventos;
- timestamps;
- extracción;
- comportamiento de fuentes.

#### `transforms.conf`

Puede utilizarse para:

- transformaciones;
- redacción;
- enrutamiento;
- sustituciones;
- extracción avanzada.

#### `indexes.conf`

Define aspectos relacionados con índices.

#### `server.conf`

Contiene configuraciones de servidor y componentes.

#### `web.conf`

Contiene configuraciones relacionadas con Splunk Web.

#### `authentication.conf`

Contiene configuraciones relacionadas con autenticación.

No almacenes contraseñas ni secretos en documentación del curso.

---

## 19. Comprobar la configuración efectiva con `btool`

`btool` permite revisar la configuración efectiva teniendo en cuenta la
precedencia de archivos.

#### Revisar `inputs.conf`

```bash
sudo /opt/splunk/bin/splunk btool inputs list --debug
```

#### Revisar una entrada concreta

```bash
sudo /opt/splunk/bin/splunk btool inputs list monitor --debug
```

#### Revisar `props.conf`

```bash
sudo /opt/splunk/bin/splunk btool props list --debug
```

#### Revisar `indexes.conf`

```bash
sudo /opt/splunk/bin/splunk btool indexes list --debug
```

#### Filtrar resultados

```bash
sudo /opt/splunk/bin/splunk btool inputs list --debug | grep -A 10 -B 2 curso
```

El parámetro `--debug` muestra el archivo que aporta cada valor, lo que ayuda a
identificar problemas de precedencia.

---

## 20. `/opt/splunk/var`

Contiene datos de ejecución, logs, índices internos y archivos de trabajo.

Ruta:

```text
/opt/splunk/var
```

Subdirectorios relevantes:

```text
/opt/splunk/var/log/splunk
/opt/splunk/var/lib/splunk
/opt/splunk/var/run/splunk
```

---

## 21. `/opt/splunk/var/log/splunk`

Contiene logs internos de Splunk.

Ruta:

```text
/opt/splunk/var/log/splunk
```

#### Listar logs

```bash
sudo ls -lh /opt/splunk/var/log/splunk
```

#### Ver los logs más recientes

```bash
sudo find /opt/splunk/var/log/splunk \
  -type f \
  -printf '%TY-%Tm-%Td %TH:%TM %s %p\n' \
  | sort -r \
  | head -20
```

#### Revisar `splunkd.log`

```bash
sudo tail -n 100 /opt/splunk/var/log/splunk/splunkd.log
```

#### Buscar errores

```bash
sudo grep -iE 'error|warn|failed|fatal' \
  /opt/splunk/var/log/splunk/splunkd.log \
  | tail -50
```

#### Revisar desde SPL

```spl
index=_internal earliest=-30m latest=now
| search log_level=error OR log_level=warn
| table _time host component log_level message
| sort - _time
```

No todos los mensajes internos tienen exactamente los mismos campos. Comprueba
la estructura real cuando sea necesario.

---

## 22. `/opt/splunk/var/lib/splunk`

Contiene datos persistentes de Splunk, incluidos datos relacionados con índices.

Ruta:

```text
/opt/splunk/var/lib/splunk
```

#### Revisar tamaño

```bash
sudo du -sh /opt/splunk/var/lib/splunk
```

#### Revisar subdirectorios grandes

```bash
sudo du -h --max-depth=1 /opt/splunk/var/lib/splunk | sort -h
```

No borres manualmente contenido de este directorio.

La eliminación directa puede provocar:

- pérdida de eventos;
- corrupción;
- inconsistencias;
- problemas de arranque;
- pérdida de metadatos.

Gestiona la retención mediante la configuración adecuada de Splunk.

---

## 23. `/opt/splunk/var/run/splunk`

Contiene archivos de ejecución y estado temporal.

Ruta:

```text
/opt/splunk/var/run/splunk
```

#### Revisar contenido

```bash
sudo ls -la /opt/splunk/var/run/splunk
```

No elimines archivos de ejecución mientras Splunk esté activo salvo que exista un
procedimiento documentado para ello.

---

## 24. Directorios de Ubuntu relacionados

#### `/etc/systemd/system`

Puede contener unidades personalizadas de systemd.

```bash
sudo ls -la /etc/systemd/system
```

Buscar referencias a Splunk:

```bash
sudo grep -Ril splunk /etc/systemd/system 2>/dev/null
```

#### `/lib/systemd/system`

Puede contener unidades proporcionadas por paquetes.

```bash
sudo ls -la /lib/systemd/system | grep -i splunk
```

#### `/var/log`

Directorio general de logs del sistema y servicios.

```bash
sudo ls -la /var/log
```

#### `/var/log/syslog`

Puede contener mensajes generales del sistema, según la configuración de Ubuntu.

```bash
sudo tail -n 100 /var/log/syslog
```

#### `/var/log/auth.log`

Puede contener eventos relacionados con autenticación del sistema.

```bash
sudo tail -n 100 /var/log/auth.log
```

El acceso a estos archivos depende de los permisos del usuario.

#### `journalctl`

Consultar eventos del servicio:

```bash
sudo journalctl -u Splunkd
```

Consultar los últimos 30 minutos:

```bash
sudo journalctl -u Splunkd --since "30 minutes ago"
```

Seguir eventos en tiempo real:

```bash
sudo journalctl -u Splunkd -f
```

---

## 25. Directorio de datasets del laboratorio

Se recomienda utilizar una ruta separada para los archivos de práctica.

Ejemplo:

```text
/var/log/splunk-curso
```

Crear el directorio:

```bash
sudo mkdir -p /var/log/splunk-curso
```

Comprobar permisos:

```bash
sudo ls -ld /var/log/splunk-curso
```

Crear un archivo de ejemplo:

```bash
sudo tee /var/log/splunk-curso/eventos_web.csv > /dev/null <<'EOF'
timestamp,host,method,status,uri
2026-01-01 10:00:00,web-01,GET,200,/
2026-01-01 10:00:01,web-01,GET,404,/favicon.ico
2026-01-01 10:00:02,web-01,GET,500,/api/users
EOF
```

Comprobar el contenido:

```bash
sudo cat /var/log/splunk-curso/eventos_web.csv
```

Comprobar tamaño:

```bash
sudo du -sh /var/log/splunk-curso
```

---

## 26. Permisos de directorios y archivos

Para que Splunk monitorice un archivo, el usuario del proceso debe poder:

1. atravesar los directorios de la ruta;
2. leer el archivo;
3. acceder al contenido mientras crece;
4. mantener el acceso después de rotaciones, si existen.

#### Revisar el usuario del proceso

```bash
ps -eo user,pid,cmd | grep -i '[s]plunk'
```

#### Revisar permisos de la ruta completa

```bash
namei -l /var/log/splunk-curso/eventos_web.csv
```

Este comando muestra los permisos de cada componente del camino.

#### Revisar archivo

```bash
ls -l /var/log/splunk-curso/eventos_web.csv
```

#### Revisar directorio

```bash
ls -ld /var/log/splunk-curso
```

#### Comprobar lectura como usuario de Splunk

Sustituye `<USUARIO_SPLUNK>` por el usuario real:

```bash
sudo -u <USUARIO_SPLUNK> \
  head /var/log/splunk-curso/eventos_web.csv
```

Si falla, la entrada monitorizada puede no ingerir datos.

#### Importante

No otorgues permisos excesivos como:

```bash
chmod 777
```

Utiliza el mínimo permiso necesario para la práctica.

---

## 27. Comprobación de espacio en disco

#### Espacio disponible

```bash
df -h
```

#### Inodos disponibles

```bash
df -ih
```

#### Tamaño de la instalación

```bash
sudo du -sh /opt/splunk
```

#### Tamaño por subdirectorio

```bash
sudo du -h --max-depth=1 /opt/splunk | sort -h
```

#### Dataset del curso

```bash
sudo du -h --max-depth=1 /var/log/splunk-curso | sort -h
```

El espacio insuficiente puede causar:

- errores de escritura;
- interrupciones;
- problemas de indexación;
- comportamiento inesperado;
- pérdida de datos;
- alertas relacionadas con capacidad.

---

## 28. Comprobación de firewall

#### Estado de UFW

```bash
sudo ufw status verbose
```

#### Permitir Splunk Web desde una red concreta

Ejemplo conceptual:

```bash
sudo ufw allow from <RED_AUTORIZADA> to any port 8000 proto tcp
```

#### Permitir management port desde una red concreta

```bash
sudo ufw allow from <RED_AUTORIZADA> to any port 8089 proto tcp
```

#### Permitir receiving port desde una red concreta

```bash
sudo ufw allow from <RED_FORWARDERS> to any port 9997 proto tcp
```

No abras estos puertos a Internet sin una justificación y controles adecuados.

#### Consultar reglas

```bash
sudo ufw status numbered
```

---

## 29. Comprobar conectividad local

#### Web

```bash
curl -I http://127.0.0.1:8000
```

#### Management

```bash
curl -k -I https://127.0.0.1:8089
```

#### HEC

```bash
curl -k -I https://127.0.0.1:8088
```

La respuesta puede ser `401 Unauthorized` o similar si el servicio existe pero
requiere autenticación. Eso es diferente de un error de conexión.

---

## 30. Comprobar conectividad remota

Desde otro equipo:

```bash
nc -vz <IP_SPLUNK> 8000
```

```bash
nc -vz <IP_SPLUNK> 8089
```

```bash
nc -vz <IP_SPLUNK> 9997
```

Interpretación:

| Resultado | Significado posible |
|---|---|
| `succeeded` | El puerto es accesible |
| `connection refused` | No hay servicio escuchando o se rechaza la conexión |
| `timed out` | Firewall, ruta o filtrado |
| `no route to host` | Problema de red o dirección |

La conectividad TCP no demuestra que la autenticación, la configuración de índice
ni la ingesta funcionen correctamente.

---

## 31. Consultar puertos configurados desde Splunk

#### Entradas TCP

```spl
| rest /services/data/inputs/tcp
| table port index sourcetype disabled
```

#### Entradas UDP

```spl
| rest /services/data/inputs/udp
| table port index sourcetype disabled
```

#### Entradas monitor

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype host disabled
```

#### Información del servidor

```spl
| rest /services/server/info
| table version build serverName os_name os_version
```

#### Información de Web

```spl
| rest /services/server/info
| table version serverName
```

Los endpoints REST disponibles dependen de los permisos y de la versión.

---

## 32. Relación entre puertos y objetivos del laboratorio

| Objetivo | Puerto o ruta |
|---|---|
| Acceder a Splunk Web | `8000` |
| Ejecutar consultas administrativas | `8089` |
| Recibir datos de forwarders | `9997` |
| Recibir eventos HEC | `8088` |
| Revisar logs de Splunk | `/opt/splunk/var/log/splunk` |
| Revisar configuración | `/opt/splunk/etc` |
| Revisar aplicaciones | `/opt/splunk/etc/apps` |
| Revisar índices almacenados | `/opt/splunk/var/lib/splunk` |
| Cargar datasets locales | `/var/log/splunk-curso` |
| Revisar servicio Ubuntu | `systemctl` y `journalctl` |
| Revisar configuraciones efectivas | `splunk btool` |

---

## 33. Flujo de diagnóstico por síntomas

#### Síntoma: Splunk Web no responde

1. Comprobar el servicio:

```bash
sudo systemctl status Splunkd
```

2. Comprobar el puerto:

```bash
sudo ss -lntp | grep ':8000'
```

3. Probar localmente:

```bash
curl -I http://localhost:8000
```

4. Revisar logs:

```bash
sudo journalctl -u Splunkd --since "30 minutes ago"
```

5. Revisar logs internos:

```spl
index=_internal earliest=-30m latest=now
| search log_level=error OR log_level=warn
| table _time component log_level message
| sort - _time
```

---

#### Síntoma: la API REST no responde

1. Comprobar `8089`:

```bash
sudo ss -lntp | grep ':8089'
```

2. Probar HTTPS:

```bash
curl -k -I https://localhost:8089
```

3. Comprobar estado:

```bash
sudo /opt/splunk/bin/splunk status
```

4. Revisar autenticación y permisos.

---

#### Síntoma: no se reciben datos desde un forwarder

1. Comprobar el puerto `9997`:

```bash
sudo ss -lntp | grep ':9997'
```

2. Revisar el receiving port en Splunk.
3. Comprobar conectividad desde el forwarder:

```bash
nc -vz <IP_SPLUNK> 9997
```

4. Revisar el índice:

```spl
index=curso earliest=0 latest=now
| stats count
```

5. Revisar metadatos:

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
```

---

#### Síntoma: una entrada monitorizada no ingiere archivos

1. Comprobar la ruta:

```bash
ls -l /var/log/splunk-curso/eventos_web.csv
```

2. Comprobar cada directorio:

```bash
namei -l /var/log/splunk-curso/eventos_web.csv
```

3. Comprobar el usuario de Splunk:

```bash
ps -eo user,pid,cmd | grep -i '[s]plunk'
```

4. Probar la lectura como ese usuario:

```bash
sudo -u <USUARIO_SPLUNK> \
  head /var/log/splunk-curso/eventos_web.csv
```

5. Revisar la entrada:

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype disabled
```

6. Revisar configuración efectiva:

```bash
sudo /opt/splunk/bin/splunk btool inputs list --debug
```

7. Revisar logs internos:

```spl
index=_internal earliest=-30m latest=now
| search log_level=error OR log_level=warn
| table _time component log_level message
| sort - _time
```

---

#### Síntoma: el disco se llena

1. Revisar espacio:

```bash
df -h
```

2. Revisar inodos:

```bash
df -ih
```

3. Revisar instalación:

```bash
sudo du -h --max-depth=1 /opt/splunk | sort -h
```

4. Revisar logs:

```bash
sudo du -h --max-depth=1 /opt/splunk/var/log/splunk | sort -h
```

5. Revisar índices:

```bash
sudo du -h --max-depth=1 /opt/splunk/var/lib/splunk | sort -h
```

No elimines buckets ni logs manualmente sin un procedimiento validado.

---

## 34. Ejercicios prácticos

#### Ejercicio 1: identificar los puertos

Ejecuta:

```bash
sudo ss -lntup
```

Documenta:

- puerto;
- dirección de escucha;
- proceso;
- protocolo;
- finalidad;
- si es local o accesible remotamente.

---

#### Ejercicio 2: validar Splunk Web

Ejecuta:

```bash
curl -I http://localhost:8000
```

Después:

```bash
sudo ss -lntp | grep ':8000'
```

Responde:

- ¿el puerto escucha?
- ¿qué proceso lo utiliza?
- ¿responde HTTP?
- ¿hay redirección?
- ¿el servicio escucha en localhost o en todas las interfaces?

---

#### Ejercicio 3: validar el management port

Ejecuta:

```bash
curl -k -I https://localhost:8089
```

Después:

```spl
| rest /services/server/info
| table version serverName os_name os_version
```

Documenta:

- versión;
- nombre del servidor;
- sistema operativo;
- respuesta del puerto;
- necesidad de autenticación.

---

#### Ejercicio 4: localizar directorios

Ejecuta:

```bash
ls -ld /opt/splunk
```

```bash
find /opt/splunk/etc/apps -mindepth 1 -maxdepth 1 -type d
```

```bash
ls -la /opt/splunk/var/log/splunk
```

Documenta:

- raíz de instalación;
- aplicaciones;
- logs;
- archivos de configuración;
- directorio de datasets.

---

#### Ejercicio 5: revisar permisos del dataset

Ejecuta:

```bash
namei -l /var/log/splunk-curso/eventos_web.csv
```

Después:

```bash
ps -eo user,pid,cmd | grep -i '[s]plunk'
```

Responde:

- ¿qué usuario ejecuta Splunk?
- ¿puede atravesar la ruta?
- ¿puede leer el archivo?
- ¿qué cambio aplicarías si no pudiera leerlo?

---

#### Ejercicio 6: revisar configuración efectiva

Ejecuta:

```bash
sudo /opt/splunk/bin/splunk btool inputs list --debug
```

Localiza:

- entrada monitorizada;
- índice;
- `sourcetype`;
- estado;
- archivo que aporta la configuración.

---

#### Ejercicio 7: relacionar puerto y búsqueda

Ejecuta:

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype disabled
```

Después:

```spl
index=curso earliest=0 latest=now
| stats count by source sourcetype
```

Explica la relación entre:

- entrada;
- archivo;
- `source`;
- `sourcetype`;
- índice;
- eventos.

---

## 35. Buenas prácticas de seguridad

#### No exponer innecesariamente Splunk Web

Limita el acceso al puerto `8000` a las redes autorizadas.

#### Proteger el puerto 8089

El management port no debe exponerse públicamente sin controles estrictos.

#### Restringir el puerto 9997

Solo los forwarders autorizados deben poder conectarse.

#### Utilizar HTTPS

Especialmente para:

- autenticación;
- API;
- HEC;
- administración remota.

#### No utilizar `curl -k` como práctica de producción

`-k` es útil en un laboratorio con certificados no confiables, pero oculta
problemas de validación de certificados.

#### No guardar contraseñas en comandos

Evita:

```bash
curl -u admin:contraseña ...
```

porque puede aparecer en:

- historial;
- lista de procesos;
- registros;
- capturas.

#### No utilizar permisos excesivos

Evita:

```bash
chmod 777
```

Aplica el mínimo permiso necesario.

#### No modificar archivos `default`

Utiliza:

- una aplicación propia;
- archivos `local`;
- control de cambios;
- copias de seguridad;
- documentación.

#### No borrar manualmente datos de índices

No elimines contenido directamente de:

```text
/opt/splunk/var/lib/splunk
```

---

## 36. Checklist de puertos

- [ ] Se ha comprobado el puerto de Splunk Web.
- [ ] Se ha comprobado el puerto `8089`.
- [ ] Se ha verificado si `9997` está configurado.
- [ ] Se ha verificado si HEC utiliza `8088`.
- [ ] Se han revisado puertos syslog si aplican.
- [ ] Se ha identificado el proceso asociado.
- [ ] Se ha comprobado la dirección de escucha.
- [ ] Se ha revisado el firewall.
- [ ] Se ha probado la conectividad local.
- [ ] Se ha probado la conectividad remota cuando procede.
- [ ] No se han abierto puertos innecesarios.

---

## 37. Checklist de directorios

- [ ] Se ha identificado `SPLUNK_HOME`.
- [ ] Se ha localizado `/opt/splunk/bin`.
- [ ] Se ha localizado `/opt/splunk/etc`.
- [ ] Se han revisado las aplicaciones.
- [ ] Se han localizado configuraciones `local`.
- [ ] Se han localizado los logs internos.
- [ ] Se ha localizado el almacenamiento de índices.
- [ ] Se ha creado una ruta de datasets.
- [ ] Se han revisado los permisos.
- [ ] Se ha comprobado el espacio en disco.
- [ ] Se ha revisado el servicio systemd.
- [ ] No se han modificado archivos críticos sin copia.

---

## 38. Referencias oficiales

#### Splunk

- [Splunk Enterprise Documentation](https://docs.splunk.com/Documentation/Splunk)
- [Splunk Enterprise Admin Manual](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Aboutthismanual)
- [Get Data In](https://docs.splunk.com/Documentation/Splunk/latest/Get started/Getdatain)
- [Monitor Files and Directories](https://docs.splunk.com/Documentation/Splunk/latest/Data/Monitorfilesanddirectories)
- [About Indexes](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Splunk REST API Reference](https://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTprolog)
- [Splunk Troubleshooting](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Aboutthismanual)
- [`inputs.conf`](https://help.splunk.com/en/data-management/splunk-enterprise-admin-manual/10.4/configuration-file-reference/10.4.0-configuration-file-reference/inputs.conf)
- [`indexes.conf`](https://help.splunk.com/en/data-management/splunk-enterprise-admin-manual/10.4/configuration-file-reference/10.4.0-configuration-file-reference/indexes.conf)
- [`props.conf`](https://help.splunk.com/en/data-management/splunk-enterprise-admin-manual/10.4/configuration-file-reference/10.4.0-configuration-file-reference/props.conf)
- [`transforms.conf`](https://help.splunk.com/en/data-management/splunk-enterprise-admin-manual/10.4/configuration-file-reference/10.4.0-configuration-file-reference/transforms.conf)

#### Ubuntu

- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)
- [Systemd en Ubuntu](https://documentation.ubuntu.com/server/explanation/systemd/)
- [Ubuntu Firewall Documentation](https://documentation.ubuntu.com/server/how-to/security/firewalls/)

---

## 39. Nota sobre puertos y versiones

Los puertos indicados en este documento son valores habituales, no una garantía de
que todas las instancias utilicen exactamente esa configuración.

Antes de realizar una práctica, verifica:

- puerto configurado;
- protocolo;
- dirección de escucha;
- firewall;
- autenticación;
- certificado;
- entrada habilitada;
- índice de destino;
- permisos.

Una instancia puede utilizar:

- un puerto Web diferente;
- HTTPS en lugar de HTTP;
- un puerto HEC distinto;
- un receiving port personalizado;
- una dirección de escucha limitada;
- reglas de red específicas.

La comprobación real de la instancia siempre tiene prioridad sobre una lista
genérica de puertos.