# Problemas de acceso web

Cuando Splunk Web no se abre, no empieces reinstalando ni cambiando la
contraseña. Primero identifica en qué capa falla el acceso:

```text
Servicio -> puerto -> red/proxy -> TLS -> navegador -> autenticación -> autorización
```

Una conexión rechazada indica un problema distinto de una página que carga pero
devuelve `401`, `403` o un mensaje de credenciales. Sigue el orden para no
mezclar síntomas diferentes.

## 1. Confirmar el servicio

Desde el servidor donde está instalado Splunk:

```bash
sudo -u splunk /opt/splunk/bin/splunk status
```

Si Splunk se ejecutó como `root`, utiliza explícitamente:

```bash
sudo /opt/splunk/bin/splunk status --run-as-root
```

El modo de ejecución debe ser coherente con el usuario propietario de la
instalación. Si `splunkd` no está activo, consulta [Splunk no inicia](splunk-no-inicia.md)
antes de investigar el navegador.

Revisa los logs recientes:

```bash
sudo tail -n 100 /opt/splunk/var/log/splunk/splunkd.log
sudo tail -n 100 /opt/splunk/var/log/splunk/web_service.log
```

Busca mensajes relacionados con puertos, certificados, permisos o inicio de
Splunk Web:

```bash
sudo grep -iE 'error|fatal|failed|certificate|ssl|port' \
	/opt/splunk/var/log/splunk/web_service.log | tail -n 50
```

## 2. Confirmar el puerto local

En la instalación de laboratorio, el acceso web suele utilizar el puerto `8000`
y la API de administración el `8089`:

```bash
sudo ss -ltnp | grep -E ':8000|:8089'
```

También puedes usar `lsof` si está disponible:

```bash
sudo lsof -nP -iTCP:8000 -sTCP:LISTEN
```

Interpretación rápida:

- **No aparece `8000`**: Splunk Web no está escuchando o utiliza otro puerto.
- **Escucha en `127.0.0.1:8000`**: solo acepta conexiones desde el propio
	servidor.
- **Escucha en `0.0.0.0:8000` o una IP concreta**: puede aceptar conexiones
	remotas, siempre condicionadas por firewall y red.
- **Otro proceso usa el puerto**: existe un conflicto que debe investigarse.

No abras `8089` al exterior para resolver un problema de navegador. Es el puerto
de administración y debe protegerse con firewall y red de gestión.

## 3. Probar desde el propio servidor

Comprueba primero el acceso local:

```bash
curl -I http://127.0.0.1:8000
```

Una respuesta HTTP, aunque sea `302`, `401` o `403`, demuestra que hay un
servicio respondiendo. `Connection refused` indica que no hay un proceso
aceptando en esa dirección y puerto.

Si Splunk Web está configurado con HTTPS, prueba:

```bash
curl -vk https://127.0.0.1:8000
```

El parámetro `-k` sirve para diagnosticar un certificado no confiable; no debe
utilizarse como solución permanente de seguridad.

## 4. Probar desde el equipo cliente

Desde el ordenador del asistente, utiliza el nombre o IP reales del servidor:

```bash
curl -I http://NOMBRE_O_IP:8000
```

Si funciona en el servidor pero no desde el cliente, el problema suele estar en
una de estas capas:

- firewall del servidor;
- firewall de la máquina virtual o hipervisor;
- red entre cliente y servidor;
- proxy corporativo;
- DNS o nombre de host incorrecto;
- Splunk Web escuchando solo en localhost.

Comprueba la resolución del nombre:

```bash
getent hosts NOMBRE_O_IP
```

Y la conectividad TCP:

```bash
nc -vz NOMBRE_O_IP 8000
```

No confundas un fallo de DNS con un fallo de Splunk. Prueba la IP y el nombre
por separado y documenta cuál de los dos funciona.

## 5. Firewall y red

Comprueba las reglas del sistema operativo y de la red de laboratorio. Por
ejemplo, en Ubuntu con `ufw`:

```bash
sudo ufw status verbose
```

Si necesitas abrir el acceso, limita el origen a la red o equipo de formación y
no a todo Internet. La regla exacta depende de la topología del laboratorio.

Antes de cambiar el firewall, confirma que el proceso escucha en el puerto y
que la dirección de escucha es correcta. Abrir un puerto que no tiene servicio
no resolverá el problema.

## 6. HTTP, HTTPS y certificados

El esquema debe coincidir con la configuración:

```text
http://NOMBRE_O_IP:8000
https://NOMBRE_O_IP:8000
```

Síntomas habituales:

| Síntoma | Posible causa |
|---|---|
| El navegador dice que el certificado no es válido | Certificado autofirmado, nombre no coincidente o certificado caducado. |
| `wrong version number` con `curl` | Se está usando HTTPS contra un puerto HTTP o al contrario. |
| Redirecciones repetidas | Configuración incoherente de proxy o TLS. |
| Carga parcial de la página | Proxy, recursos bloqueados o error de Splunk Web. |

En un laboratorio, un certificado autofirmado puede generar un aviso del
navegador. Verifica que el nombre y la dirección son los esperados antes de
aceptar una excepción. En producción, utiliza certificados emitidos y renovados
según la política de la organización.

No copies certificados ni claves privadas en tickets, repositorios o mensajes.

## 7. Proxy del navegador

Un proxy puede impedir el acceso a una IP privada o redirigir la conexión. Si
el acceso local funciona pero el navegador no:

1. Revisa si el sistema utiliza proxy.
2. Añade la red de laboratorio a la lista de excepciones solo si está aprobado.
3. Prueba otro navegador o una ventana privada.
4. Compara el resultado con `curl` desde el mismo equipo.
5. Revisa la consola del navegador si la página carga parcialmente.

No desactives permanentemente el proxy o las protecciones del navegador para
resolver una práctica puntual.

## 8. Credenciales y autenticación

Si aparece la pantalla de login, la conectividad web ya funciona. En ese caso,
separa estos problemas:

- usuario o contraseña incorrectos;
- cuenta bloqueada o deshabilitada;
- método de autenticación configurado de forma distinta;
- permisos insuficientes después del login;
- cookies o sesión antigua del navegador.

Prueba una ventana privada y confirma que utilizas la URL y la instancia
correctas. No introduzcas contraseñas en comandos, capturas ni documentos.

Si el login es correcto pero no puedes buscar o administrar, revisa el rol y la
aplicación. Autenticarse no implica tener acceso al índice `curso` ni a todos
los objetos de conocimiento.

## 9. Caché, cookies y sesión

Cuando Splunk Web muestra una página antigua, redirecciones extrañas o un error
después de cambiar la configuración:

1. Cierra la sesión.
2. Abre una ventana privada.
3. Borra las cookies del host de Splunk si es necesario.
4. Prueba otro navegador.
5. Comprueba que no hay varias instancias usando el mismo nombre o marcador.

El navegador no debe ser la primera hipótesis si `curl` tampoco puede conectar.

## 10. Procedimiento completo de diagnóstico

Recoge estas evidencias sin exponer credenciales:

```bash
/opt/splunk/bin/splunk version
sudo -u splunk /opt/splunk/bin/splunk status
sudo ss -ltnp | grep -E ':8000|:8089'
curl -I http://127.0.0.1:8000
sudo tail -n 50 /opt/splunk/var/log/splunk/splunkd.log
sudo tail -n 50 /opt/splunk/var/log/splunk/web_service.log
```

Interpreta el resultado así:

1. Si el servicio no está activo, revisa el arranque.
2. Si no escucha en `8000`, revisa Splunk Web y sus logs.
3. Si responde localmente pero no remotamente, revisa red y firewall.
4. Si responde pero hay aviso TLS, revisa esquema y certificado.
5. Si muestra login, revisa credenciales y sesión.
6. Si entra pero no ve datos, revisa rol, índice y rango temporal.

## Tabla rápida de síntomas

| Síntoma | Diagnóstico inicial | Siguiente comprobación |
|---|---|---|
| `Connection refused` | No hay servicio en esa IP y puerto. | `status`, `ss` y `web_service.log`. |
| `Timeout` | Red, firewall, proxy o ruta incorrecta. | `nc`, IP, DNS y reglas de red. |
| `404` | URL, ruta o proxy incorrectos. | Probar la URL base y revisar redirecciones. |
| `502` o `503` | Proxy o Splunk Web no disponible. | Probar localmente y revisar logs. |
| Aviso de certificado | TLS autofirmado, caducado o nombre incorrecto. | Esquema, certificado y nombre usado. |
| `401` | Autenticación fallida o sesión inválida. | Ventana privada y credenciales. |
| `403` | Acceso o rol insuficiente. | Permisos del usuario, aplicación e índice. |
| Login correcto sin datos | Tiempo, índice o permisos de búsqueda. | `index=curso`, rango y rol. |

## Buenas prácticas

- Comprueba servicio y puerto antes de tocar el navegador.
- Prueba primero desde el servidor y después desde el cliente.
- Distingue HTTP, HTTPS, red, autenticación y autorización.
- Protege `8089` y limita el acceso a `8000` a la red necesaria.
- No desactives TLS, firewall o proxy como solución permanente.
- No compartas contraseñas, certificados privados ni tokens.
- Conserva logs y comandos de diagnóstico, pero elimina datos sensibles.
- Consulta [Splunk no inicia](splunk-no-inicia.md) si el servicio no está activo.

## Referencias oficiales

- [Puertos de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Installation/Ports)
- [Configurar Splunk Web](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Serverconf)
- [Configurar SSL en Splunk Web](https://docs.splunk.com/Documentation/Splunk/latest/Security/SecureSplunkWeb)
- [Autenticación y usuarios](https://docs.splunk.com/Documentation/Splunk/latest/Security/Configureusers)
- [Roles y capacidades](https://docs.splunk.com/Documentation/Splunk/latest/Security/Rolesandcapabilities)
- [Solución de problemas de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Abouttroubleshooting)
