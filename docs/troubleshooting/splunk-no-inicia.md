# Splunk no inicia

Esta guía ayuda a diagnosticar problemas de arranque de Splunk Enterprise sin
reinstalar ni cambiar permisos a ciegas.

El objetivo es identificar la capa que falla:

```text
Comando
    ↓
Usuario y permisos
    ↓
Servicio systemd
    ↓
Logs de arranque
    ↓
Recursos del sistema
    ↓
Puertos
    ↓
Configuración
    ↓
Certificados
    ↓
Datos o estado persistente
```

No ejecutes varias correcciones a la vez. Conserva:

- el primer mensaje de error;
- el comando que lo produjo;
- el usuario utilizado;
- la fecha y hora;
- el último cambio realizado;
- el resultado después de cada modificación.

---

# 1. Objetivos

Al finalizar esta práctica, el asistente podrá:

- comprobar la versión de Splunk;
- identificar el usuario de ejecución;
- revisar el estado de `splunkd`;
- distinguir `splunkd` de Splunk Web;
- consultar logs mediante `journalctl` y archivos propios;
- detectar problemas de propiedad y permisos;
- revisar espacio, inodos y memoria;
- identificar conflictos de puertos;
- revisar el arranque automático;
- utilizar `btool` para consultar configuración efectiva;
- detectar configuraciones modificadas recientemente;
- validar Splunk Web después del arranque;
- diferenciar un problema de arranque de un problema de ingesta;
- documentar la causa raíz y la corrección.

---

# 2. Entorno de referencia

El laboratorio utiliza como referencia:

- Splunk Enterprise 10.4.3.
- Ubuntu 24.04.5 LTS.
- Instalación habitual: `/opt/splunk`.
- Usuario recomendado del servicio: `splunk`.
- Splunk Web: puerto `8000`.
- Management port: puerto `8089`.
- Índice del curso: `curso`.

La ruta, el usuario y los puertos pueden cambiar según la instalación. Comprueba
los valores reales antes de aplicar una corrección.

---

# 3. Diferenciar los componentes

## `splunkd`

Es el proceso principal de Splunk Enterprise.

Gestiona, entre otras funciones:

- indexación;
- búsquedas;
- API REST;
- administración;
- entradas de datos;
- alertas;
- comunicación interna;
- parte de los servicios web.

## Splunk Web

Es la interfaz web accesible normalmente mediante:

```text
http://localhost:8000
```

Puede ocurrir que:

- `splunkd` esté activo y Splunk Web no responda;
- Splunk Web responda, pero no existan datos;
- el proceso esté activo, pero no pueda leer una entrada;
- la API `8089` funcione, pero el puerto `8000` tenga un problema.

Por eso no basta con comprobar que existe un proceso llamado `splunkd`.

---

# 4. Regla de diagnóstico

Sigue siempre este orden:

```text
1. Comando correcto
2. Usuario correcto
3. Estado del servicio
4. Primer error del log
5. Recursos del sistema
6. Puertos
7. Configuración
8. Propiedad y permisos
9. Arranque automático
10. Validación funcional
```

No empieces por:

- reinstalar;
- borrar índices;
- ejecutar como `root`;
- cambiar todos los permisos;
- abrir todos los puertos;
- modificar varios archivos `.conf`;
- recargar el dataset.

---

# 5. Paso 1: comprobar el comando y la instalación

## 5.1 Comprobar la ruta

```bash
ls -ld /opt/splunk
```

Si la instalación está en otra ruta, utiliza el valor real.

## 5.2 Comprobar el ejecutable

```bash
ls -l /opt/splunk/bin/splunk
```

## 5.3 Comprobar la variable `SPLUNK_HOME`

```bash
echo "$SPLUNK_HOME"
```

Si está definida:

```bash
ls -ld "$SPLUNK_HOME"
```

## 5.4 Comprobar la versión

```bash
/opt/splunk/bin/splunk version
```

Si requiere privilegios:

```bash
sudo /opt/splunk/bin/splunk version
```

Resultado esperado:

```text
Splunk version: ...
```

Si el ejecutable no existe:

- la ruta puede ser incorrecta;
- la instalación puede estar incompleta;
- se está utilizando otro usuario o entorno;
- el paquete puede estar instalado en otra ubicación.

Localizar el ejecutable:

```bash
command -v splunk
```

```bash
sudo find /opt /usr/local -type f -name splunk 2>/dev/null
```

---

# 6. Paso 2: comprobar el usuario de ejecución

No mezcles arranques como `root` y `splunk` durante la misma sesión de
diagnóstico.

## 6.1 Identificar el usuario del proceso

```bash
ps -eo user,pid,ppid,cmd | grep -i '[s]plunk'
```

## 6.2 Revisar el propietario de la instalación

```bash
stat -c '%U:%G %a %n' \
  /opt/splunk \
  /opt/splunk/bin \
  /opt/splunk/var
```

## 6.3 Comprobar si existe el usuario `splunk`

```bash
getent passwd splunk
```

## 6.4 Ejecutar como `splunk`

Si la instalación pertenece a `splunk`:

```bash
sudo -u splunk /opt/splunk/bin/splunk status
```

También:

```bash
sudo -u splunk /opt/splunk/bin/splunk start
```

## 6.5 Ejecutar como `root`

Si la instalación está configurada para ejecutarse como `root`, utiliza
explícitamente:

```bash
sudo /opt/splunk/bin/splunk status --run-as-root
```

o:

```bash
sudo /opt/splunk/bin/splunk start --run-as-root
```

La ejecución como `root` no debe utilizarse como solución automática. Puede ocultar
problemas de propiedad y crear archivos que después el usuario `splunk` no pueda
modificar.

## 6.6 Advertencia sobre `root`

El mensaje:

```text
Running Splunk Enterprise as root is deprecated
```

es una advertencia de seguridad y operación.

No significa necesariamente que el arranque haya fallado, pero indica que conviene
migrar a un usuario de servicio dedicado cuando la instalación lo permita.

---

# 7. Paso 3: comprobar systemd

## 7.1 Estado del servicio

```bash
sudo systemctl status Splunkd --no-pager
```

Resultado esperado:

```text
Active: active (running)
```

## 7.2 Consultar si la unidad existe

```bash
systemctl list-unit-files | grep -i splunk
```

```bash
systemctl list-units --type=service | grep -i splunk
```

## 7.3 Consultar el estado de forma breve

```bash
sudo systemctl is-active Splunkd
```

```bash
sudo systemctl is-enabled Splunkd
```

Interpretación:

| Resultado | Significado |
|---|---|
| `active` | El servicio está ejecutándose |
| `inactive` | Está detenido |
| `failed` | El último arranque terminó con error |
| `enabled` | Está configurado para iniciar con systemd |
| `disabled` | No está configurado para arranque automático |

## 7.4 Consultar logs de systemd

```bash
sudo journalctl -u Splunkd --no-pager
```

Últimos 30 minutos:

```bash
sudo journalctl -u Splunkd \
  --since "30 minutes ago" \
  --no-pager
```

Seguir en tiempo real:

```bash
sudo journalctl -u Splunkd -f
```

Mostrar solo errores:

```bash
sudo journalctl -u Splunkd \
  -p warning..alert \
  --since "1 hour ago" \
  --no-pager
```

---

# 8. Paso 4: detener posibles procesos residuales

Antes de iniciar, comprueba si ya existen procesos de Splunk:

```bash
pgrep -af splunk
```

o:

```bash
ps aux | grep -i '[s]plunk'
```

Puede existir una instancia parcialmente iniciada o un proceso pendiente de una
ejecución anterior.

No mates procesos automáticamente. Documenta primero:

- PID;
- usuario;
- tiempo de ejecución;
- comando;
- estado;
- proceso padre.

Para consultar un proceso concreto:

```bash
ps -fp <PID>
```

Si existe un procedimiento operativo aprobado para detener Splunk:

```bash
sudo systemctl stop Splunkd
```

Después verifica:

```bash
pgrep -af splunk
```

No elimines manualmente archivos PID o locks sin comprender su origen.

---

# 9. Paso 5: revisar los logs de Splunk

## 9.1 Log principal

```bash
sudo tail -n 100 \
  /opt/splunk/var/log/splunk/splunkd.log
```

## 9.2 Buscar errores relevantes

```bash
sudo grep -iE \
  'error|fatal|failed|cannot|permission|denied|port|bind|certificate|ssl' \
  /opt/splunk/var/log/splunk/splunkd.log \
  | tail -n 100
```

## 9.3 Log de Splunk Web

```bash
sudo tail -n 100 \
  /opt/splunk/var/log/splunk/web_service.log
```

## 9.4 Buscar errores de Web y TLS

```bash
sudo grep -iE \
  'error|fatal|failed|certificate|ssl|port|bind|listen' \
  /opt/splunk/var/log/splunk/web_service.log \
  | tail -n 100
```

## 9.5 Revisar el log completo con contexto

No te quedes únicamente con una línea aislada:

```bash
sudo grep -n -iE \
  'error|fatal|failed|cannot|permission|denied' \
  /opt/splunk/var/log/splunk/splunkd.log \
  | tail -n 30
```

Después consulta un rango alrededor de la línea relevante:

```bash
sudo sed -n '1200,1250p' \
  /opt/splunk/var/log/splunk/splunkd.log
```

Sustituye las líneas por el rango real.

## 9.6 Seguir el log durante un arranque

Terminal 1:

```bash
sudo tail -f \
  /opt/splunk/var/log/splunk/splunkd.log
```

Terminal 2:

```bash
sudo systemctl start Splunkd
```

Guarda el primer error relevante, no solo el último mensaje mostrado.

---

# 10. Paso 6: comprobar espacio, inodos y memoria

Un disco lleno o sin inodos puede impedir que Splunk escriba:

- logs;
- PID;
- archivos temporales;
- configuración;
- buckets;
- metadatos.

## 10.1 Espacio disponible

```bash
df -h /opt/splunk
```

Revisar todos los sistemas de archivos:

```bash
df -h
```

## 10.2 Inodos

```bash
df -i /opt/splunk
```

```bash
df -ih
```

## 10.3 Memoria

```bash
free -h
```

## 10.4 Procesos y consumo

```bash
ps aux --sort=-%mem | head -20
```

```bash
ps aux --sort=-%cpu | head -20
```

## 10.5 Tamaño de la instalación

```bash
sudo du -sh /opt/splunk
```

## 10.6 Directorios de mayor tamaño

```bash
sudo du -h --max-depth=1 /opt/splunk | sort -h
```

Revisar logs:

```bash
sudo du -h --max-depth=1 \
  /opt/splunk/var/log/splunk \
  | sort -h
```

Revisar almacenamiento de índices:

```bash
sudo du -h --max-depth=1 \
  /opt/splunk/var/lib/splunk \
  | sort -h
```

## 10.7 No borrar índices manualmente

No elimines directamente:

```text
/opt/splunk/var/lib/splunk
```

ni sus subdirectorios para liberar espacio.

Antes de actuar:

1. identifica qué consume espacio;
2. revisa la política de retención;
3. comprueba si los datos son de laboratorio;
4. documenta la acción;
5. aplica un procedimiento aprobado.

---

# 11. Paso 7: comprobar los puertos

Los puertos habituales son:

- `8000`: Splunk Web;
- `8089`: Management port;
- `9997`: recepción de forwarders;
- `8088`: HTTP Event Collector;
- `8065` y `8191`: pueden aparecer en algunas arquitecturas o componentes.

## 11.1 Revisar puertos

```bash
sudo ss -ltnp | grep -E \
  ':8000|:8089|:8065|:8191|:9997|:8088'
```

## 11.2 Revisar un puerto concreto

```bash
sudo lsof -nP -iTCP:8000 -sTCP:LISTEN
```

```bash
sudo lsof -nP -iTCP:8089 -sTCP:LISTEN
```

## 11.3 Detectar conflictos

Si otro proceso utiliza `8000`:

```bash
sudo lsof -nP -iTCP:8000
```

Identifica:

- proceso;
- PID;
- usuario;
- servicio;
- finalidad.

No detengas el proceso antes de saber qué servicio proporciona.

## 11.4 Probar disponibilidad del puerto

```bash
nc -vz 127.0.0.1 8000
```

Para la API:

```bash
nc -vz 127.0.0.1 8089
```

Una conexión correcta no demuestra que Splunk funcione completamente, pero sí que
existe un servicio TCP accesible.

---

# 12. Paso 8: comprobar configuración efectiva

No edites archivos `.conf` durante el primer diagnóstico. Primero revisa la
configuración efectiva y relaciónala con el primer error del log.

## 12.1 Revisar configuración de Web

```bash
sudo /opt/splunk/bin/splunk btool web list --debug
```

Filtrar valores relevantes:

```bash
sudo /opt/splunk/bin/splunk btool web list --debug \
  | grep -iE \
  'httpport|enableSplunkWeb|mgmtHostPort|ssl|privKeyPath|serverCert'
```

## 12.2 Revisar configuración del servidor

```bash
sudo /opt/splunk/bin/splunk btool server list --debug
```

## 12.3 Revisar índices

```bash
sudo /opt/splunk/bin/splunk btool indexes list --debug
```

## 12.4 Revisar entradas

```bash
sudo /opt/splunk/bin/splunk btool inputs list --debug
```

## 12.5 Revisar propiedades y transformaciones

```bash
sudo /opt/splunk/bin/splunk btool props list --debug
```

```bash
sudo /opt/splunk/bin/splunk btool transforms list --debug
```

## 12.6 Qué aporta `--debug`

El modo `--debug` ayuda a saber:

- qué archivo define un valor;
- qué configuración tiene prioridad;
- si un valor está en `default`;
- si una aplicación lo sobrescribe en `local`;
- si existe una configuración global inesperada.

---

# 13. Paso 9: revisar cambios recientes

Si Splunk dejó de iniciar después de un cambio, identifica:

- archivo modificado;
- hora del cambio;
- usuario que lo realizó;
- valor anterior;
- valor nuevo;
- componente afectado.

## 13.1 Revisar archivos modificados recientemente

```bash
sudo find /opt/splunk/etc \
  -type f \
  -name '*.conf' \
  -mtime -2 \
  -printf '%TY-%Tm-%Td %TH:%TM %p\n' \
  | sort -r
```

## 13.2 Revisar certificados modificados

```bash
sudo find /opt/splunk/etc \
  -type f \
  \( -name '*.pem' -o -name '*.crt' -o -name '*.key' \) \
  -mtime -7 \
  -printf '%TY-%Tm-%Td %TH:%TM %p\n' \
  | sort -r
```

## 13.3 Revisar permisos de certificados

```bash
sudo stat -c '%U:%G %a %n' \
  /ruta/al/certificado \
  /ruta/a/la/clave
```

Una clave privada debe estar protegida y ser legible por el usuario que ejecuta
el componente correspondiente.

No compartas:

- claves privadas;
- tokens;
- certificados internos completos;
- contraseñas;
- archivos de autenticación.

---

# 14. Paso 10: revisar propiedad y permisos

## 14.1 Comprobar la instalación

```bash
stat -c '%U:%G %a %n' \
  /opt/splunk \
  /opt/splunk/bin \
  /opt/splunk/etc \
  /opt/splunk/var \
  /opt/splunk/var/log/splunk
```

## 14.2 Comprobar la ruta completa

```bash
namei -l /opt/splunk/bin/splunk
```

## 14.3 Detectar archivos propiedad de `root`

```bash
sudo find /opt/splunk \
  -user root \
  -ls \
  | head -50
```

La existencia de archivos propiedad de `root` no demuestra por sí sola que sean
incorrectos. Debes valorar:

- qué archivo es;
- si lo necesita `splunkd`;
- cuándo se creó;
- si la instalación se ejecutó anteriormente como `root`;
- si el usuario de servicio puede leerlo y modificarlo.

## 14.4 Comprobar escritura como usuario de servicio

```bash
sudo -u splunk test -r /opt/splunk \
  && echo "Puede leer la instalación" \
  || echo "No puede leer la instalación"
```

Para una prueba de escritura, utiliza únicamente un directorio temporal aprobado:

```bash
sudo -u splunk test -w /opt/splunk/var \
  && echo "Puede escribir en var" \
  || echo "No puede escribir en var"
```

## 14.5 Corregir una instalación que se ejecutó como `root`

Si se ha confirmado que toda la instalación debe pertenecer a `splunk`:

1. detén la instancia usando el mismo modo con el que se inició;
2. realiza una copia o documenta el estado;
3. cambia la propiedad de forma controlada;
4. inicia como `splunk`;
5. valida logs, puertos y Web.

Ejemplo:

```bash
sudo /opt/splunk/bin/splunk stop --run-as-root
```

Después, solo si está aprobado:

```bash
sudo chown -R splunk:splunk /opt/splunk
```

Iniciar:

```bash
sudo -u splunk /opt/splunk/bin/splunk start
```

Comprobar:

```bash
sudo -u splunk /opt/splunk/bin/splunk status
```

`chown -R` es una operación amplia. No la ejecutes sin confirmar:

- usuario y grupo correctos;
- ruta correcta;
- ausencia de otras aplicaciones dentro de la ruta;
- copia o procedimiento de recuperación;
- impacto en certificados;
- política de la organización.

---

# 15. Paso 11: revisar certificados y TLS

Si `splunkd` inicia, pero Splunk Web no responde, revisa `web_service.log` y la
configuración TLS.

## 15.1 Probar HTTP

```bash
curl -vI http://127.0.0.1:8000
```

## 15.2 Probar HTTPS

```bash
curl -vkI https://127.0.0.1:8000
```

## 15.3 Inspeccionar el certificado

```bash
openssl s_client \
  -connect 127.0.0.1:8000 \
  -servername localhost \
  </dev/null
```

Mostrar sujeto, emisor y fechas:

```bash
openssl s_client \
  -connect 127.0.0.1:8000 \
  -servername localhost \
  </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

## 15.4 Problemas habituales

- certificado caducado;
- nombre no incluido en el certificado;
- clave privada ilegible;
- certificado en una ruta incorrecta;
- cadena incompleta;
- HTTP utilizado contra un puerto HTTPS;
- HTTPS utilizado contra un puerto HTTP.

No desactives TLS permanentemente para ocultar un problema de certificados.

---

# 16. Paso 12: revisar el arranque automático

Si el arranque manual funciona, pero Splunk no se inicia después de reiniciar
Ubuntu, revisa systemd y boot-start.

## 16.1 Comprobar si está habilitado

```bash
sudo systemctl is-enabled Splunkd
```

```bash
sudo systemctl status Splunkd --no-pager
```

## 16.2 Revisar la unidad

```bash
systemctl cat Splunkd
```

## 16.3 Revisar dependencias y errores de arranque

```bash
sudo journalctl -b -u Splunkd --no-pager
```

## 16.4 Configurar boot-start

La forma exacta depende de la versión y de la instalación. En un entorno que
utilice el usuario `splunk`, el comando habitual es:

```bash
sudo /opt/splunk/bin/splunk enable boot-start -user splunk
```

Después comprueba:

```bash
sudo systemctl daemon-reload
sudo systemctl enable Splunkd
sudo systemctl status Splunkd --no-pager
```

No configures simultáneamente:

- una unidad systemd personalizada;
- un script antiguo de init;
- cron;
- otro mecanismo de arranque.

Podrían iniciar varias instancias o producir estados inconsistentes.

---

# 17. Paso 13: iniciar y validar de forma controlada

## 17.1 Iniciar mediante systemd

```bash
sudo systemctl start Splunkd
```

## 17.2 Comprobar estado

```bash
sudo systemctl status Splunkd --no-pager
```

## 17.3 Comprobar procesos

```bash
pgrep -af splunk
```

## 17.4 Comprobar puertos

```bash
sudo ss -ltnp | grep -E ':8000|:8089'
```

## 17.5 Probar Splunk Web

HTTP:

```bash
curl -I http://127.0.0.1:8000
```

HTTPS:

```bash
curl -kI https://127.0.0.1:8000
```

## 17.6 Probar la API local

```bash
curl -kI https://127.0.0.1:8089
```

Una respuesta `401` puede indicar que la API está disponible, pero requiere
autenticación. Eso es distinto de que el puerto esté cerrado.

## 17.7 Validar una búsqueda mínima

Después de iniciar sesión en Splunk Web:

```spl
| makeresults
| eval estado="Splunk responde"
```

Si funciona, valida el índice del curso:

```spl
index=curso earliest=0 latest=now
| stats count
```

Si `makeresults` funciona, pero `curso` no devuelve eventos, el problema ya no es
el arranque. Consulta:

```text
datos-no-aparecen.md
```

---

# 18. Tabla de síntomas

| Síntoma | Causa probable | Primera acción |
|---|---|---|
| `splunkd is not running` | Servicio detenido o arranque fallido | `systemctl status` y `splunkd.log` |
| `Permission denied` | Usuario o propiedad incorrecta | Revisar proceso, propietario y permisos |
| Puerto ocupado | Otro proceso usa `8000` o `8089` | `ss`, `lsof` y `ps` |
| Arranque muy lento | Disco, memoria, recuperación o configuración | Revisar recursos y logs |
| No inicia tras reiniciar | Boot-start ausente o unidad incorrecta | Revisar `systemctl` y `journalctl -b` |
| Web no responde, `splunkd` sí | Web, TLS, puerto `8000` o proxy | `web_service.log`, `curl`, `ss` |
| No se escriben logs | Disco lleno, permisos o filesystem | `df`, `df -i` y permisos |
| Funciona como `root`, no como `splunk` | Archivos creados por `root` | Revisar propiedad antes de corregir |
| `Address already in use` | Conflicto de puerto | Identificar el proceso ocupante |
| Error de certificado | TLS o clave privada incorrectos | `openssl`, `web_service.log` |
| `Too many open files` | Límite de descriptores | Revisar `ulimit` y logs |
| Servicio se detiene después de iniciar | Error posterior de configuración o recursos | Seguir logs en tiempo real |
| `makeresults` funciona, pero no hay datos | Problema de ingesta, índice o tiempo | Consultar `datos-no-aparecen.md` |

---

# 19. Comprobación de límites del sistema

Algunos errores de arranque o rendimiento pueden estar relacionados con límites del
sistema.

## 19.1 Límites del shell actual

```bash
ulimit -a
```

## 19.2 Descriptores abiertos del proceso

Primero identifica el PID:

```bash
pgrep -xo splunkd
```

Después:

```bash
sudo ls /proc/<PID>/fd | wc -l
```

## 19.3 Límites del servicio systemd

```bash
sudo systemctl show Splunkd \
  | grep -E 'LimitNOFILE|LimitNPROC|User|Group'
```

Si aparece un error como:

```text
Too many open files
```

no cambies límites de forma improvisada. Documenta:

- PID;
- límite actual;
- mensaje del log;
- número de descriptores;
- configuración de systemd;
- cambio propuesto.

---

# 20. Comprobar el reloj del sistema

Un reloj incorrecto puede afectar a:

- TLS;
- logs;
- alertas;
- timestamps;
- autenticación;
- correlación temporal.

```bash
date
```

```bash
date -u
```

```bash
timedatectl
```

Revisa:

- zona horaria;
- sincronización NTP;
- hora local;
- hora UTC;
- diferencia respecto a la fuente de datos.

---

# 21. No confundir mensajes de instalación con comandos

Durante un arranque o instalación pueden aparecer mensajes como:

```text
Checking prerequisites
writing RSA key
Copying
Splunk web interface is at ...
```

Son mensajes que Splunk imprime en pantalla. No deben copiarse de nuevo en la
terminal.

Ejecuta únicamente comandos completos, por ejemplo:

```bash
/opt/splunk/bin/splunk status
```

No ejecutes fragmentos de mensajes como si fueran comandos.

---

# 22. Avisos relacionados con Python

Durante algunas operaciones pueden aparecer referencias a rutas internas como:

```text
/opt/splunk/lib/python3.7/site-packages
```

Una referencia a una ruta incluida en el entorno de Splunk no significa
automáticamente que falte esa versión de Python en Ubuntu.

Comprueba primero:

```bash
/opt/splunk/bin/splunk version
```

y el resultado final de la operación.

Distingue entre:

- advertencia;
- error recuperable;
- error fatal;
- instalación incompleta;
- problema de compatibilidad real.

No instales manualmente paquetes de Python del sistema para corregir una ruta
interna de Splunk sin una instrucción específica y compatible con la versión.

---

# 23. Evidencias para pedir ayuda

Recoge la información siguiente sin incluir secretos:

```bash
date
/opt/splunk/bin/splunk version
getent passwd splunk
ps -eo user,pid,ppid,cmd | grep -i '[s]plunk'
sudo systemctl status Splunkd --no-pager
sudo ss -ltnp | grep -E ':8000|:8089|:8065|:8191'
df -h /opt/splunk
df -i /opt/splunk
free -h
sudo tail -n 100 /opt/splunk/var/log/splunk/splunkd.log
sudo tail -n 100 /opt/splunk/var/log/splunk/web_service.log
```

Añade:

- hora del intento;
- usuario utilizado;
- comando ejecutado;
- primer mensaje de error;
- último cambio aplicado;
- si el problema ocurre tras un reinicio;
- si el arranque manual funciona.

Antes de compartir la salida, elimina:

- contraseñas;
- tokens;
- claves privadas;
- datos personales;
- nombres sensibles;
- direcciones internas innecesarias.

---

# 24. Cuándo no reinstalar

No reinstales mientras no hayas descartado:

- comando o ruta incorrecta;
- usuario de ejecución incorrecto;
- propiedad heredada de una ejecución como `root`;
- espacio insuficiente;
- inodos agotados;
- memoria insuficiente;
- conflicto de puertos;
- boot-start incorrecto;
- certificado inválido;
- configuración incorrecta;
- proceso pendiente;
- error en `splunkd.log`;
- error en `web_service.log`;
- límites del sistema;
- permisos del filesystem.

Una reinstalación puede:

- borrar contexto;
- romper configuraciones;
- eliminar evidencias;
- generar pérdida de datos;
- no resolver un problema de red;
- no resolver un problema de permisos;
- no corregir un conflicto de puertos.

---

# 25. Ejercicio práctico 1: diagnóstico básico

## Objetivo

Identificar si el problema está en el comando, servicio o puerto.

Ejecuta:

```bash
/opt/splunk/bin/splunk version
```

```bash
sudo systemctl status Splunkd --no-pager
```

```bash
sudo ss -ltnp | grep -E ':8000|:8089'
```

Documenta:

- versión;
- estado;
- usuario;
- puertos;
- proceso asociado;
- primer error encontrado.

---

# 26. Ejercicio práctico 2: usuario y permisos

## Objetivo

Comprobar si Splunk funciona con el usuario previsto.

Ejecuta:

```bash
getent passwd splunk
```

```bash
ps -eo user,pid,cmd | grep -i '[s]plunk'
```

```bash
stat -c '%U:%G %a %n' \
  /opt/splunk \
  /opt/splunk/var \
  /opt/splunk/var/log/splunk
```

Después comprueba:

```bash
sudo -u splunk /opt/splunk/bin/splunk status
```

Documenta:

- propietario;
- grupo;
- usuario del proceso;
- resultado del comando;
- si existen archivos propiedad de `root`.

---

# 27. Ejercicio práctico 3: conflicto de puertos

## Objetivo

Identificar si otro servicio impide el arranque.

Ejecuta:

```bash
sudo ss -ltnp | grep -E ':8000|:8089'
```

Después:

```bash
sudo lsof -nP -iTCP:8000
```

Documenta:

- puerto;
- PID;
- proceso;
- usuario;
- servicio;
- acción recomendada.

No detengas el proceso sin confirmar su función.

---

# 28. Ejercicio práctico 4: recursos

## Objetivo

Determinar si el sistema tiene capacidad suficiente.

Ejecuta:

```bash
df -h /opt/splunk
```

```bash
df -i /opt/splunk
```

```bash
free -h
```

```bash
sudo du -h --max-depth=1 /opt/splunk | sort -h
```

Documenta:

- espacio libre;
- porcentaje utilizado;
- inodos libres;
- memoria disponible;
- directorio de mayor tamaño;
- riesgo operativo.

---

# 29. Ejercicio práctico 5: validación funcional

Cuando Splunk aparezca activo:

```bash
curl -I http://127.0.0.1:8000
```

Después, en Splunk Web:

```spl
| makeresults
| eval estado="Splunk responde"
```

Y finalmente:

```spl
index=curso earliest=0 latest=now
| stats count
```

Interpreta:

| Resultado | Conclusión |
|---|---|
| Web no responde | Revisar acceso web |
| Web responde y `makeresults` funciona | Splunk está operativo |
| `makeresults` funciona, `curso` no | Revisar datos, índice, tiempo o permisos |
| Todo funciona | El problema inicial ha sido corregido |

---

# 30. Plantilla de informe

```markdown
# Informe: Splunk no inicia

## Fecha y hora

Completar.

## Zona horaria

Completar.

## Servidor

Completar.

## Versión de Splunk

Completar.

## Ruta de instalación

Completar.

## Usuario de ejecución esperado

Completar.

## Usuario de ejecución observado

Completar.

## Estado de systemd

```text
Completar.
```

## Comando ejecutado

```bash
Completar.
```

## Primer error observado

```text
Completar.
```

## `splunkd.log`

Resumen del mensaje relevante.

## `web_service.log`

Resumen del mensaje relevante.

## Recursos

```text
Espacio:
Inodos:
Memoria:
CPU:
```

## Puertos

```text
8000:
8089:
9997:
8088:
```

## Configuración revisada

```text
Archivos o comandos utilizados:
```

## Propiedad y permisos

Completar.

## Causa raíz

Describir una causa concreta.

## Corrección aplicada

Describir un único cambio cada vez.

## Validación

```bash
Completar.
```

```spl
Completar.
```

## Resultado posterior

Completar.

## Rollback

Describir cómo revertir la corrección.

## Limitaciones

Completar.

## Responsable

Completar.
```

---

# 31. Criterios de resolución

El problema se considera resuelto cuando:

- el servicio aparece activo;
- no existen errores nuevos relacionados;
- el usuario de ejecución es el previsto;
- los permisos son coherentes;
- los puertos esperados están escuchando;
- Splunk Web responde;
- `makeresults` funciona;
- la búsqueda de `curso` funciona si existen eventos;
- no se han creado duplicados;
- no se han borrado datos como primera medida;
- la corrección está documentada;
- existe un procedimiento de reversión;
- la validación se ha realizado con el usuario previsto.

Una solución que funciona únicamente como `root` no debe considerarse terminada
si la configuración objetivo utiliza el usuario `splunk`.

---

# 32. Buenas prácticas

- Ejecuta cada comando con el usuario correcto.
- No mezcles arranques como `root` y `splunk`.
- Guarda el primer mensaje de error.
- Revisa `journalctl` además de los logs de Splunk.
- Comprueba recursos antes de modificar configuración.
- Identifica conflictos de puertos antes de detener procesos.
- Usa `btool` para revisar configuración efectiva.
- No edites archivos `default`.
- No uses `chown -R` sin una decisión documentada.
- No borres índices manualmente.
- No reinstales ante el primer error.
- Valida primero `splunkd` y después Splunk Web.
- Utiliza `makeresults` para separar arranque de ingesta.
- Protege certificados y claves privadas.
- Documenta todo cambio.
- Prueba un único cambio cada vez.
- Mantén un rollback claro.
```

# Referencias oficiales

- [Iniciar y detener Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Admin/StartandstopSplunk)
- [Configurar el arranque automático](https://docs.splunk.com/Documentation/Splunk/latest/Admin/ConfigureSplunkforautostart)
- [Logs disponibles de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/WhatSplunklogsareavailable)
- [Troubleshooting de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Abouttroubleshooting)
- [Puertos de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Installation/Ports)
- [Ejecutar Splunk como usuario no root](https://docs.splunk.com/Documentation/Splunk/latest/Installation/RunSplunkasadifferentornon-rootuser)
- [Referencia de `server.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Serverconf)
- [Referencia de `web.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Webconf)
- [Referencia de `indexes.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Indexesconf)
- [Referencia de `inputs.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Inputsconf)
- [Referencia de `btool`](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Usebtooltotroubleshootconfigurations)
- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)
- [Systemd en Ubuntu](https://documentation.ubuntu.com/server/explanation/systemd/)