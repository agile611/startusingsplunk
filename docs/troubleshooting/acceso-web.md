# Problemas de acceso web

Cuando Splunk Web no se abre, no empieces reinstalando ni cambiando la contraseña.

Primero identifica en qué capa falla el acceso:

```text
Servicio → puerto → red/proxy → TLS → navegador → autenticación → autorización
```

Cada síntoma apunta a una capa diferente.

Por ejemplo:

| Síntoma | Capa más probable |
|---|---|
| `Connection refused` | Servicio o puerto |
| `Timeout` | Red, firewall o proxy |
| Página en blanco | Splunk Web, navegador o proxy |
| Aviso de certificado | TLS |
| Pantalla de login | La conectividad web funciona |
| `401 Unauthorized` | Autenticación |
| `403 Forbidden` | Autorización o permisos |
| Login correcto, pero sin datos | Índice, tiempo, rol o búsqueda |

No mezcles problemas diferentes. Una contraseña incorrecta no explica un puerto
cerrado, y abrir un puerto no corrige un rol sin acceso al índice `curso`.

---

# 1. Objetivos de la práctica

Al finalizar esta guía, el asistente podrá:

- comprobar si Splunk Enterprise está activo;
- identificar el usuario que ejecuta Splunk;
- verificar el puerto de Splunk Web;
- diferenciar HTTP de HTTPS;
- probar el acceso local y remoto;
- revisar la resolución DNS;
- comprobar la conectividad TCP;
- analizar firewall y proxy;
- interpretar códigos HTTP;
- investigar certificados;
- distinguir autenticación de autorización;
- comprobar permisos y roles;
- revisar los logs de `splunkd` y Splunk Web;
- documentar evidencias;
- diagnosticar sin reinstalar innecesariamente.

---

# 2. Entorno de referencia

El laboratorio utiliza como referencia:

- Splunk Enterprise 10.4.3.
- Ubuntu 24.04.5 LTS.
- Instalación habitual en `/opt/splunk`.
- Splunk Web en el puerto `8000`.
- Management port y API REST en el puerto `8089`.
- Índice de prácticas: `curso`.
- Usuario de laboratorio con rol `admin`.

La instalación real puede utilizar otras rutas, puertos o usuarios. Comprueba
siempre los valores de la instancia antes de aplicar una corrección.

---

# 3. Principio de diagnóstico por capas

La secuencia recomendada es:

```text
1. Servicio
2. Puerto
3. Acceso local
4. Red y firewall
5. Proxy
6. HTTP o HTTPS
7. Certificado
8. Navegador
9. Autenticación
10. Autorización
11. Índice y datos
```

## 3.1 Servicio

Pregunta:

> ¿Está ejecutándose Splunk y está activo `splunkd`?

## 3.2 Puerto

Pregunta:

> ¿Existe un proceso escuchando en el puerto esperado?

## 3.3 Acceso local

Pregunta:

> ¿La propia máquina puede conectarse a Splunk Web?

## 3.4 Red

Pregunta:

> ¿El equipo cliente puede alcanzar el servidor?

## 3.5 Proxy

Pregunta:

> ¿Existe un proxy que intercepte o bloquee la conexión?

## 3.6 TLS

Pregunta:

> ¿El cliente utiliza el protocolo correcto y confía en el certificado?

## 3.7 Navegador

Pregunta:

> ¿El problema depende de cookies, caché, extensiones o configuración local?

## 3.8 Autenticación

Pregunta:

> ¿El usuario puede iniciar sesión?

## 3.9 Autorización

Pregunta:

> ¿El usuario tiene permisos para realizar la operación?

## 3.10 Datos

Pregunta:

> ¿El usuario autenticado puede acceder al índice, aplicación y objetos
> necesarios?

---

# 4. Recopilar información inicial

Antes de cambiar configuraciones, recopila datos básicos.

## 4.1 Identificar la versión

```bash
/opt/splunk/bin/splunk version
```

Si el comando necesita privilegios:

```bash
sudo /opt/splunk/bin/splunk version
```

## 4.2 Identificar la ruta de instalación

```bash
echo "$SPLUNK_HOME"
```

Si la variable no está definida:

```bash
ls -ld /opt/splunk
```

## 4.3 Identificar el usuario del proceso

```bash
ps -eo user,pid,ppid,cmd | grep -i '[s]plunk'
```

Otra opción:

```bash
pgrep -af splunk
```

## 4.4 Identificar el servicio systemd

```bash
systemctl list-units --type=service | grep -i splunk
```

En muchas instalaciones el servicio se denomina:

```text
Splunkd
```

Comprueba el estado:

```bash
sudo systemctl status Splunkd
```

## 4.5 Guardar información sin exponer secretos

Puedes guardar una evidencia técnica:

```bash
{
  date
  /opt/splunk/bin/splunk version
  sudo systemctl status Splunkd --no-pager
  sudo ss -ltnp | grep -E ':8000|:8089'
} 2>&1 | tee /tmp/diagnostico-splunk-web.txt
```

Revisa el archivo antes de compartirlo. Elimina:

- nombres sensibles;
- direcciones internas;
- tokens;
- contraseñas;
- rutas confidenciales;
- información de usuarios.

---

# 5. Confirmar el servicio

Desde el servidor donde está instalado Splunk, comprueba el estado.

## 5.1 Método preferente: systemd

```bash
sudo systemctl status Splunkd
```

Resultado esperado:

```text
Active: active (running)
```

## 5.2 Método mediante el binario de Splunk

Si la instalación pertenece al usuario `splunk`:

```bash
sudo -u splunk /opt/splunk/bin/splunk status
```

Si Splunk se ejecutó como `root`, utiliza explícitamente:

```bash
sudo /opt/splunk/bin/splunk status --run-as-root
```

El modo de ejecución debe ser coherente con el propietario real de la
instalación.

## 5.3 Descubrir el propietario de la instalación

```bash
stat -c '%U:%G %n' /opt/splunk
```

Revisar el ejecutable:

```bash
stat -c '%U:%G %n' /opt/splunk/bin/splunk
```

Revisar el proceso:

```bash
ps -eo user,pid,cmd | grep -i '[s]plunkd'
```

No asumas que el usuario siempre se llama `splunk`. Puede variar según la forma
en que se instaló la plataforma.

## 5.4 Si el servicio no está activo

Consulta primero:

```bash
sudo journalctl -u Splunkd --since "30 minutes ago" --no-pager
```

Después revisa:

```bash
sudo tail -n 100 /opt/splunk/var/log/splunk/splunkd.log
```

Y:

```bash
sudo tail -n 100 /opt/splunk/var/log/splunk/web_service.log
```

Si `splunkd` no está activo, consulta:

```text
splunk-no-inicia.md
```

No continúes investigando el navegador hasta resolver el estado del servicio.

---

# 6. Revisar los logs del servicio

## 6.1 `splunkd.log`

```bash
sudo tail -n 100 /opt/splunk/var/log/splunk/splunkd.log
```

Buscar mensajes relevantes:

```bash
sudo grep -iE \
  'error|fatal|failed|certificate|ssl|port|permission|web' \
  /opt/splunk/var/log/splunk/splunkd.log \
  | tail -n 100
```

## 6.2 `web_service.log`

```bash
sudo tail -n 100 /opt/splunk/var/log/splunk/web_service.log
```

Buscar errores de Web y TLS:

```bash
sudo grep -iE \
  'error|fatal|failed|certificate|ssl|port|permission|bind|listen' \
  /opt/splunk/var/log/splunk/web_service.log \
  | tail -n 100
```

## 6.3 Ver logs en tiempo real

```bash
sudo tail -f /opt/splunk/var/log/splunk/web_service.log
```

En otra terminal, realiza una petición:

```bash
curl -I http://127.0.0.1:8000
```

Observa si aparece una nueva entrada relacionada con la petición.

Para detener `tail`:

```text
Ctrl+C
```

## 6.4 Revisar logs desde Splunk

Si la instancia está disponible para realizar búsquedas:

```spl
index=_internal earliest=-30m latest=now
| search
    (component=Web OR component=web_service)
    OR
    (log_level=error OR log_level=warn)
| table _time host component log_level message
| sort - _time
```

La estructura exacta de los campos puede variar. Si no aparecen resultados,
consulta una muestra de `_internal`:

```spl
index=_internal earliest=-30m latest=now
| head 20
| table _time host component log_level message _raw
```

---

# 7. Confirmar el puerto local

En la instalación de laboratorio, Splunk Web suele utilizar el puerto `8000` y
la API de administración el `8089`.

```bash
sudo ss -ltnp | grep -E ':8000|:8089'
```

También puedes utilizar `lsof`:

```bash
sudo lsof -nP -iTCP:8000 -sTCP:LISTEN
```

Para el puerto de administración:

```bash
sudo lsof -nP -iTCP:8089 -sTCP:LISTEN
```

## 7.1 Interpretación

### No aparece `8000`

Posibles causas:

- Splunk Web no está activo;
- el puerto es diferente;
- el servicio no terminó de iniciar;
- existe un error de configuración;
- otro proceso impide la apertura;
- el proceso escucha en otra dirección o protocolo.

### Escucha en `127.0.0.1:8000`

Solo acepta conexiones desde el propio servidor.

```text
127.0.0.1:8000
```

Una conexión desde otro equipo no funcionará directamente.

### Escucha en `0.0.0.0:8000`

Puede aceptar conexiones IPv4 en las interfaces disponibles, siempre condicionado
por el firewall y la configuración de red.

### Escucha en una IP concreta

Solo acepta conexiones dirigidas a esa interfaz.

### Otro proceso utiliza `8000`

Comprueba el proceso:

```bash
sudo lsof -nP -iTCP:8000
```

No mates el proceso automáticamente. Primero identifica:

- nombre;
- PID;
- propietario;
- servicio;
- finalidad.

---

# 8. Confirmar el puerto configurado

No asumas que Splunk Web utiliza siempre `8000`.

## 8.1 Revisar configuración mediante `btool`

```bash
sudo /opt/splunk/bin/splunk btool web list settings --debug
```

Si el comando requiere ejecución como root:

```bash
sudo /opt/splunk/bin/splunk btool web list settings \
  --debug \
  --run-as-root
```

La sintaxis disponible puede variar según la versión y el modo de ejecución.

## 8.2 Buscar referencias al puerto

```bash
sudo /opt/splunk/bin/splunk btool web list --debug \
  | grep -iE 'httpport|mgmtHostPort|enableSplunkWeb'
```

## 8.3 Revisar archivos de configuración

Busca configuraciones relacionadas:

```bash
sudo grep -RniE \
  'httpport|enableSplunkWeb|mgmtHostPort|ssl' \
  /opt/splunk/etc/system/local \
  /opt/splunk/etc/apps \
  2>/dev/null | head -100
```

No edites directamente un archivo solo porque contiene el valor buscado.
Primero identifica:

- archivo;
- aplicación;
- prioridad;
- contexto;
- configuración efectiva.

---

# 9. Probar desde el propio servidor

Comprueba primero el acceso local. Esta prueba elimina muchos problemas de red.

## 9.1 HTTP

```bash
curl -I http://127.0.0.1:8000
```

También puedes solicitar el contenido:

```bash
curl -v http://127.0.0.1:8000/
```

## 9.2 HTTPS

Si Splunk Web está configurado con HTTPS:

```bash
curl -vk https://127.0.0.1:8000/
```

El parámetro `-k` permite diagnosticar certificados no confiables. No debe ser la
solución permanente de seguridad.

## 9.3 Qué significa una respuesta HTTP

Una respuesta como cualquiera de las siguientes demuestra que existe un servicio
respondiendo:

```text
200 OK
302 Found
401 Unauthorized
403 Forbidden
404 Not Found
```

En cambio:

```text
Connection refused
```

suele indicar que no hay un proceso aceptando conexiones en esa dirección y
puerto.

Un:

```text
Connection timed out
```

apunta más frecuentemente a red, firewall o ruta.

## 9.4 Ver cabeceras y redirecciones

```bash
curl -vkI http://127.0.0.1:8000
```

Seguir redirecciones:

```bash
curl -vkIL http://127.0.0.1:8000
```

No compartas las cabeceras si contienen información sensible.

---

# 10. Probar desde el equipo cliente

Desde el ordenador del asistente, utiliza el nombre o IP reales del servidor.

```bash
curl -I http://NOMBRE_O_IP:8000
```

Si se utiliza HTTPS:

```bash
curl -k -I https://NOMBRE_O_IP:8000
```

## 10.1 Comparar acceso local y remoto

| Prueba | Resultado | Interpretación |
|---|---|---|
| `localhost:8000` funciona | Remoto falla | Red, firewall, proxy o bind local |
| Local falla | Remoto falla | Servicio, puerto o configuración |
| Local y remoto responden | Navegador falla | Proxy, TLS, cookies o navegador |
| Login aparece | Web accesible | Investigar autenticación |
| Login correcto, sin datos | Web y autenticación funcionan | Investigar roles, índice o tiempo |

## 10.2 Resolver el nombre

```bash
getent hosts NOMBRE_O_IP
```

También:

```bash
nslookup NOMBRE_O_IP
```

o:

```bash
dig NOMBRE_O_IP
```

Si el nombre no resuelve, prueba directamente con la IP:

```bash
curl -I http://IP_DEL_SERVIDOR:8000
```

No confundas un error DNS con un problema de Splunk.

## 10.3 Probar conectividad TCP

```bash
nc -vz NOMBRE_O_IP 8000
```

Para el puerto de administración:

```bash
nc -vz NOMBRE_O_IP 8089
```

Si el equipo cliente no tiene `nc`, utiliza:

```bash
timeout 5 bash -c \
  '</dev/tcp/NOMBRE_O_IP/8000' \
  && echo "Puerto accesible" \
  || echo "Puerto no accesible"
```

Una conexión TCP correcta no demuestra que:

- el certificado sea válido;
- el usuario pueda autenticarse;
- el usuario tenga permisos;
- el índice `curso` sea visible.

---

# 11. Interpretar errores de red

## `Connection refused`

Significa normalmente que:

- no hay un servicio escuchando;
- el servicio escucha en otro puerto;
- el firewall rechaza activamente la conexión;
- existe una dirección de destino incorrecta.

Comprobaciones:

```bash
sudo ss -ltnp | grep ':8000'
```

```bash
sudo systemctl status Splunkd
```

## `Connection timed out`

Significa normalmente que:

- un firewall descarta la conexión;
- no existe una ruta de red;
- el proxy interfiere;
- la IP no es accesible;
- el proceso escucha únicamente localmente;
- existe un problema de virtualización.

Comprobaciones:

```bash
getent hosts NOMBRE_O_IP
```

```bash
nc -vz NOMBRE_O_IP 8000
```

```bash
sudo ufw status verbose
```

## `No route to host`

Indica un problema de red, enrutamiento o direccionamiento.

Comprueba:

```bash
ip addr
```

```bash
ip route
```

Desde el cliente:

```bash
ip route get IP_DEL_SERVIDOR
```

## `Could not resolve host`

Indica un problema de resolución de nombres.

Prueba:

```bash
getent hosts NOMBRE_O_IP
```

y luego utiliza directamente la IP para separar DNS de Splunk.

---

# 12. Firewall y red

Comprueba las reglas del sistema operativo y de la red del laboratorio.

## 12.1 Estado de UFW

```bash
sudo ufw status verbose
```

## 12.2 Reglas numeradas

```bash
sudo ufw status numbered
```

## 12.3 Revisar nftables

Ubuntu puede utilizar nftables como infraestructura de filtrado:

```bash
sudo nft list ruleset
```

Utiliza esta consulta con precaución y respeta las políticas del entorno.

## 12.4 Abrir Splunk Web de forma limitada

Si necesitas abrir el acceso desde una red de formación:

```bash
sudo ufw allow from <RED_AUTORIZADA> to any port 8000 proto tcp
```

Ejemplo conceptual:

```bash
sudo ufw allow from 192.168.56.0/24 to any port 8000 proto tcp
```

No abras el puerto a todo Internet para resolver una práctica:

```bash
sudo ufw allow 8000/tcp
```

La regla exacta depende de la topología y de la política del laboratorio.

## 12.5 Proteger el puerto 8089

No abras `8089` al exterior como solución a un problema de navegador.

Es un puerto de administración y debe limitarse a:

- localhost;
- red de administración;
- equipos autorizados;
- túnel seguro;
- firewall controlado.

## 12.6 Abrir el puerto 9997 solo si se utilizan forwarders

```bash
sudo ufw allow from <RED_FORWARDERS> to any port 9997 proto tcp
```

---

# 13. HTTP, HTTPS y TLS

El esquema utilizado debe coincidir con la configuración:

```text
http://NOMBRE_O_IP:8000
```

o:

```text
https://NOMBRE_O_IP:8000
```

## 13.1 Probar HTTP

```bash
curl -v http://NOMBRE_O_IP:8000/
```

## 13.2 Probar HTTPS

```bash
curl -vk https://NOMBRE_O_IP:8000/
```

## 13.3 Error `wrong version number`

Este error suele aparecer cuando:

- se utiliza HTTPS contra un puerto HTTP;
- se utiliza HTTP contra un puerto HTTPS;
- existe un proxy mal configurado;
- el puerto no corresponde con el servicio esperado.

Prueba los dos esquemas por separado:

```bash
curl -v http://127.0.0.1:8000/
```

```bash
curl -vk https://127.0.0.1:8000/
```

## 13.4 Error de certificado no confiable

Puede deberse a:

- certificado autofirmado;
- autoridad certificadora no instalada;
- nombre no incluido en el certificado;
- certificado caducado;
- cadena incompleta.

En laboratorio, `curl -k` sirve para separar conectividad de validación de
certificado:

```bash
curl -vk https://127.0.0.1:8000/
```

No copies claves privadas ni certificados sensibles en el material del curso.

## 13.5 Inspeccionar un certificado

```bash
openssl s_client \
  -connect NOMBRE_O_IP:8000 \
  -servername NOMBRE_O_IP \
  </dev/null
```

Para mostrar fechas y sujeto:

```bash
openssl s_client \
  -connect NOMBRE_O_IP:8000 \
  -servername NOMBRE_O_IP \
  </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

Comprueba:

- `subject`;
- `issuer`;
- `notBefore`;
- `notAfter`;
- nombres alternativos;
- cadena de confianza.

## 13.6 Causas de nombre no coincidente

El navegador puede advertir si se accede mediante:

```text
https://192.168.1.20:8000
```

pero el certificado solo contiene:

```text
splunk.lab.example
```

En ese caso, el nombre utilizado y el certificado no coinciden.

---

# 14. Tabla de síntomas TLS

| Síntoma | Posible causa | Comprobación |
|---|---|---|
| Certificado no válido | Autofirmado o CA no confiable | `openssl s_client` |
| Nombre no coincidente | URL distinta del SAN del certificado | Revisar `subjectAltName` |
| Certificado caducado | Fechas fuera de vigencia | `openssl x509 -dates` |
| `wrong version number` | HTTP/HTTPS incorrecto | Probar ambos esquemas |
| Error de cadena | Falta una CA intermedia | Revisar configuración de certificados |
| Redirecciones repetidas | Proxy o TLS incoherente | `curl -vkIL` |
| Página parcialmente cargada | Recursos bloqueados o esquema mixto | Consola del navegador |

---

# 15. Proxy del navegador

Un proxy puede impedir el acceso a una IP privada, cambiar el esquema o
redirigir la conexión.

Si el acceso local funciona pero el navegador no:

1. revisa la configuración de proxy;
2. confirma si la red de laboratorio debe excluirse;
3. prueba desde una ventana privada;
4. compara el resultado con `curl`;
5. prueba otro navegador;
6. revisa la consola de desarrollador;
7. comprueba si los recursos se cargan desde otro hostname.

## 15.1 Variables de proxy en Linux

```bash
env | grep -i proxy
```

Variables habituales:

```text
HTTP_PROXY
HTTPS_PROXY
ALL_PROXY
NO_PROXY
```

## 15.2 Probar sin proxy

En un entorno controlado:

```bash
curl --noproxy '*' -I http://NOMBRE_O_IP:8000
```

Si esta prueba funciona y la normal no, el proxy es una hipótesis relevante.

No desactives permanentemente el proxy corporativo.

## 15.3 Excepción de laboratorio

La excepción debe aplicarse únicamente:

- a la red autorizada;
- durante el tiempo necesario;
- conforme a la política de la organización;
- sin deshabilitar controles globales.

---

# 16. Navegador, caché y cookies

Cuando Splunk Web muestra:

- una página antigua;
- redirecciones extrañas;
- un error después de cambiar TLS;
- un login que no termina;
- una sesión que parece bloqueada;

sigue esta secuencia:

1. cierra la sesión;
2. abre una ventana privada;
3. prueba la URL completa;
4. comprueba HTTP frente a HTTPS;
5. borra las cookies del host si es necesario;
6. prueba otro navegador;
7. revisa extensiones;
8. revisa la consola de desarrollador;
9. compara con `curl`.

El navegador no debe ser la primera hipótesis si `curl` tampoco puede conectar.

---

# 17. Autenticación

Si aparece la pantalla de login, la conectividad web ya funciona.

A partir de ese momento, separa:

- usuario incorrecto;
- contraseña incorrecta;
- cuenta bloqueada;
- cuenta deshabilitada;
- método de autenticación incorrecto;
- sesión o cookies inválidas;
- problema de autorización posterior al login.

## 17.1 Probar una sesión limpia

- abre una ventana privada;
- utiliza la URL correcta;
- no reutilices una sesión antigua;
- verifica que no estás entrando en otra instancia;
- confirma el nombre o IP del servidor.

## 17.2 No introducir secretos en la terminal

Evita:

```bash
curl -u admin:MiContraseña ...
```

La contraseña puede quedar en:

- historial;
- lista de procesos;
- logs;
- capturas;
- herramientas de auditoría.

## 17.3 Revisar contexto del usuario desde SPL

Después de iniciar sesión:

```spl
| rest /services/authentication/current-context
| table username roles
```

## 17.4 Diferencia entre autenticación y autorización

### Autenticación

Responde:

> ¿Quién eres?

### Autorización

Responde:

> ¿Qué puedes hacer?

Un usuario puede autenticarse correctamente y no tener acceso a:

- el índice `curso`;
- una aplicación;
- un dashboard;
- una búsqueda guardada;
- una alerta;
- una acción administrativa.

---

# 18. Autorización y permisos

## 18.1 Usuario autenticado, pero sin datos

Prueba una búsqueda mínima:

```spl
index=curso earliest=0 latest=now
| stats count
```

Si no devuelve eventos, comprueba:

- que el índice existe;
- que el rol puede buscarlo;
- que el intervalo temporal es correcto;
- que los eventos realmente están indexados.

## 18.2 Revisar roles

```spl
| rest /services/authentication/current-context
| table username roles
```

## 18.3 Revisar el índice

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

## 18.4 Revisar objetos de conocimiento

Los dashboards, reportes y alertas pueden tener permisos propios.

Comprueba:

- propietario;
- aplicación;
- permisos de lectura;
- permisos de escritura;
- dependencia de búsquedas privadas;
- acceso al índice utilizado.

## 18.5 Síntoma `403`

Un `403 Forbidden` suele indicar:

- rol insuficiente;
- objeto no compartido;
- aplicación no autorizada;
- endpoint restringido;
- política de seguridad;
- acceso denegado por proxy.

No lo trates como un problema de contraseña sin revisar los permisos.

---

# 19. Tabla de códigos HTTP

| Código | Interpretación habitual | Siguiente acción |
|---:|---|---|
| `200` | Petición procesada correctamente | Revisar contenido si el problema persiste |
| `301` / `302` | Redirección | Revisar destino y esquema |
| `400` | Petición incorrecta | Revisar URL, cabeceras y parámetros |
| `401` | Autenticación requerida o fallida | Revisar sesión y credenciales |
| `403` | Acceso prohibido | Revisar roles, permisos o proxy |
| `404` | Recurso no encontrado | Revisar URL y ruta |
| `408` | Timeout de petición | Revisar cliente y red |
| `429` | Demasiadas solicitudes | Revisar limitación de tasa |
| `500` | Error interno | Revisar logs de Splunk Web y `splunkd` |
| `502` | Gateway inválido | Revisar proxy y servicio destino |
| `503` | Servicio no disponible | Revisar servicio y capacidad |
| `504` | Timeout del gateway | Revisar proxy, red y backend |

---

# 20. Procedimiento completo de diagnóstico

Ejecuta las comprobaciones en orden.

## Paso 1: versión

```bash
/opt/splunk/bin/splunk version
```

## Paso 2: usuario del proceso

```bash
ps -eo user,pid,cmd | grep -i '[s]plunkd'
```

## Paso 3: estado del servicio

```bash
sudo systemctl status Splunkd --no-pager
```

## Paso 4: puertos

```bash
sudo ss -ltnp | grep -E ':8000|:8089'
```

## Paso 5: prueba local HTTP

```bash
curl -vI http://127.0.0.1:8000
```

## Paso 6: prueba local HTTPS

```bash
curl -vkI https://127.0.0.1:8000
```

## Paso 7: prueba desde cliente

```bash
curl -vI http://NOMBRE_O_IP:8000
```

## Paso 8: resolución de nombre

```bash
getent hosts NOMBRE_O_IP
```

## Paso 9: conectividad TCP

```bash
nc -vz NOMBRE_O_IP 8000
```

## Paso 10: firewall

```bash
sudo ufw status verbose
```

## Paso 11: logs del servicio

```bash
sudo tail -n 100 /opt/splunk/var/log/splunk/splunkd.log
```

## Paso 12: logs de Web

```bash
sudo tail -n 100 /opt/splunk/var/log/splunk/web_service.log
```

## Paso 13: autenticación

Después de llegar a la pantalla de login, prueba una sesión limpia.

## Paso 14: autorización

```spl
| rest /services/authentication/current-context
| table username roles
```

## Paso 15: datos

```spl
index=curso earliest=0 latest=now
| stats count
```

---

# 21. Interpretación rápida

## Caso A: no hay servicio ni puerto

```text
systemctl: inactive
ss: sin 8000
curl: connection refused
```

Diagnóstico probable:

```text
Splunkd o Splunk Web no están activos.
```

Siguiente paso:

```text
Consultar splunk-no-inicia.md y los logs de arranque.
```

---

## Caso B: servicio activo, pero no hay puerto `8000`

```text
systemctl: active
ss: no aparece 8000
curl: connection refused
```

Diagnóstico probable:

- Splunk Web deshabilitado;
- puerto diferente;
- error de binding;
- fallo durante el inicio de Web.

Siguiente paso:

```bash
sudo /opt/splunk/bin/splunk btool web list --debug
```

Y revisar:

```bash
sudo tail -n 100 /opt/splunk/var/log/splunk/web_service.log
```

---

## Caso C: local funciona, remoto falla

```text
curl local: 200 o 302
curl remoto: timeout
```

Diagnóstico probable:

- firewall;
- red;
- proxy;
- escucha local;
- dirección IP incorrecta;
- red de virtualización.

Siguiente paso:

```bash
sudo ss -ltnp | grep ':8000'
sudo ufw status verbose
nc -vz IP_DEL_SERVIDOR 8000
```

---

## Caso D: navegador muestra aviso TLS

```text
curl -k: responde
curl sin -k: error de certificado
```

Diagnóstico probable:

- certificado autofirmado;
- CA no confiable;
- nombre no coincidente;
- certificado caducado.

Siguiente paso:

```bash
openssl s_client \
  -connect NOMBRE_O_IP:8000 \
  -servername NOMBRE_O_IP \
  </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

---

## Caso E: login funciona, pero no aparecen datos

```text
Splunk Web: accesible
Login: correcto
Búsqueda: sin resultados
```

Diagnóstico probable:

- intervalo temporal;
- índice incorrecto;
- permisos;
- datos históricos;
- eventos no ingeridos;
- rol sin acceso al índice.

Siguiente paso:

```spl
| rest /services/authentication/current-context
| table username roles
```

Después:

```spl
index=curso earliest=0 latest=now
| stats count
```

---

# 22. Ejercicio práctico 1: diagnóstico local

## Objetivo

Determinar si el problema está en el servicio, el puerto o el navegador.

## Pasos

```bash
sudo systemctl status Splunkd --no-pager
```

```bash
sudo ss -ltnp | grep -E ':8000|:8089'
```

```bash
curl -vI http://127.0.0.1:8000
```

## Entrega

Documenta:

- estado de `Splunkd`;
- puerto encontrado;
- proceso asociado;
- código HTTP;
- cabeceras relevantes;
- conclusión de la capa afectada.

---

# 23. Ejercicio práctico 2: diagnóstico desde cliente

## Objetivo

Diferenciar DNS, red y servicio.

## Pasos

Desde el equipo cliente:

```bash
getent hosts NOMBRE_O_IP
```

```bash
nc -vz NOMBRE_O_IP 8000
```

```bash
curl -vI http://NOMBRE_O_IP:8000
```

Después repite utilizando la IP:

```bash
curl -vI http://IP_DEL_SERVIDOR:8000
```

## Preguntas

- ¿resuelve el nombre?
- ¿funciona la IP?
- ¿funciona el nombre?
- ¿el puerto es accesible?
- ¿el navegador presenta el mismo resultado?
- ¿el proxy modifica la respuesta?

---

# 24. Ejercicio práctico 3: HTTP frente a HTTPS

## Objetivo

Identificar el esquema correcto.

## Pasos

```bash
curl -vI http://127.0.0.1:8000
```

```bash
curl -vkI https://127.0.0.1:8000
```

## Interpretación

- Si HTTP responde y HTTPS falla, probablemente el puerto utiliza HTTP.
- Si HTTPS responde y HTTP falla, probablemente el puerto utiliza HTTPS.
- Si ambos fallan, revisa servicio, puerto y logs.
- Si ambos responden de forma extraña, revisa proxy y redirecciones.

---

# 25. Ejercicio práctico 4: permisos y autorización

## Objetivo

Separar login correcto de acceso a datos.

## Pasos

Después de iniciar sesión:

```spl
| rest /services/authentication/current-context
| table username roles
```

Comprueba el índice:

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

Ejecuta una búsqueda:

```spl
index=curso earliest=0 latest=now
| stats count
```

## Preguntas

- ¿qué usuario está conectado?
- ¿qué roles tiene?
- ¿el índice existe?
- ¿está habilitado?
- ¿hay eventos?
- ¿el usuario puede buscarlos?

---

# 26. Ejercicio práctico 5: elaborar un informe de diagnóstico

Utiliza la siguiente plantilla:

```markdown
# Informe de diagnóstico de Splunk Web

## Fecha

Completar.

## Servidor

Completar.

## Versión de Splunk

Completar.

## Usuario del proceso

Completar.

## Estado de Splunkd

Completar.

## Puerto de Splunk Web

Completar.

## Dirección de escucha

Completar.

## Prueba local

Completar.

## Prueba remota

Completar.

## Esquema utilizado

HTTP o HTTPS.

## Resultado TLS

Completar.

## Resolución DNS

Completar.

## Conectividad TCP

Completar.

## Firewall

Completar.

## Proxy

Completar.

## Autenticación

Completar.

## Autorización

Completar.

## Índice `curso`

Completar.

## Evidencias

Indicar comandos y capturas utilizadas.

## Diagnóstico final

Indicar la capa en la que se encontró el problema.

## Acción aplicada

Describir el cambio realizado.

## Validación posterior

Describir cómo se comprobó la solución.

## Limitaciones

Indicar cualquier aspecto no validado.
```

---

# 27. Buenas prácticas

- Comprueba el servicio antes de cambiar credenciales.
- Comprueba el puerto antes de modificar el navegador.
- Prueba localmente antes de investigar la red remota.
- Compara nombre de host e IP.
- Diferencia timeout de conexión rechazada.
- Diferencia autenticación de autorización.
- Protege el puerto `8089`.
- Limita el acceso al puerto `8000`.
- No desactives permanentemente TLS.
- No desactives permanentemente el firewall.
- No copies claves privadas ni tokens.
- No incluyas contraseñas en comandos.
- Revisa el usuario real de la instalación.
- Utiliza los logs como evidencia.
- Documenta cada cambio.
- Valida la solución después de aplicarla.
- No reinstales hasta descartar servicio, configuración, permisos y red.

---

# 28. Tabla rápida de diagnóstico

| Síntoma | Comprobación inicial | Siguiente acción |
|---|---|---|
| `Connection refused` | `ss`, `systemctl`, `curl` local | Revisar servicio y puerto |
| `Timeout` | `nc`, `ip route`, firewall | Revisar red y proxy |
| El nombre no resuelve | `getent hosts` | Revisar DNS o usar IP |
| Local funciona, remoto falla | `ss`, `ufw`, `nc` remoto | Revisar bind, firewall y red |
| HTTP responde, HTTPS falla | `curl -v` y `curl -vk` | Revisar esquema y TLS |
| Aviso de certificado | `openssl s_client` | Revisar CA, nombre y vigencia |
| `401` | Ventana privada y login | Revisar autenticación |
| `403` | Roles y permisos | Revisar autorización |
| Login correcto sin datos | `index=curso`, `context` | Revisar índice, tiempo y rol |
| Página incompleta | Consola del navegador | Revisar proxy, cookies y recursos |
| Splunk no inicia | `systemctl`, `journalctl` | Consultar `splunk-no-inicia.md` |

---

# 29. Referencias oficiales

## Splunk

- [Puertos de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Installation/Ports)
- [Configuración del servidor](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Serverconf)
- [Proteger Splunk Web](https://docs.splunk.com/Documentation/Splunk/latest/Security/SecureSplunkWeb)
- [Configurar usuarios](https://docs.splunk.com/Documentation/Splunk/latest/Security/Configureusers)
- [Roles y capacidades](https://docs.splunk.com/Documentation/Splunk/latest/Security/Rolesandcapabilities)
- [Troubleshooting de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Abouttroubleshooting)
- [Splunk Enterprise Documentation](https://docs.splunk.com/Documentation/Splunk)
- [Splunk REST API Reference](https://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTprolog)
- [Usuarios y roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Knowledge Objects](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)

## Ubuntu

- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)
- [Systemd en Ubuntu](https://documentation.ubuntu.com/server/explanation/systemd/)
- [Firewall en Ubuntu](https://documentation.ubuntu.com/server/how-to/security/firewalls/)