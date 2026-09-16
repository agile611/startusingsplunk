# Splunk no inicia

Si Splunk no inicia, sigue las comprobaciones en este orden. No reinstales
inmediatamente: primero hay que saber si el problema es el usuario, los
permisos, los puertos o la configuración.

El objetivo es distinguir entre estos casos:

```text
Comando incorrecto -> usuario/permisos -> recursos -> puerto -> configuración -> datos dañados
```

No ejecutes varias correcciones a la vez. Conserva el primer mensaje de error y
anota qué comando lo produjo.

## 1. Comprobar el usuario de ejecución

Si Splunk se configuró con el usuario recomendado:

```bash
sudo -u splunk /opt/splunk/bin/splunk status
```

Si se inició como `root`, utiliza explícitamente:

```bash
sudo /opt/splunk/bin/splunk status --run-as-root
```

No mezcles ambos modos. El mensaje `Running Splunk Enterprise as root is
deprecated` es una advertencia: Splunk puede funcionar, pero se recomienda
migrar al usuario `splunk`.

## 2. Revisar el log

Consulta las últimas líneas del log principal:

```bash
sudo tail -n 100 /opt/splunk/var/log/splunk/splunkd.log
```

## 8. Comprobar recursos y configuración

Si el servicio se detiene durante el arranque, revisa espacio, inodos y memoria:

```bash
df -h /opt/splunk
df -i /opt/splunk
free -h
ps aux | grep '[s]plunk'
```

Un disco lleno o sin inodos puede impedir que Splunk escriba logs, pid,
configuración o datos. No borres manualmente directorios de índices para
liberar espacio: identifica primero el consumo y aplica una política de
retención o mantenimiento aprobada.

Revisa también cambios recientes en `server.conf`, `web.conf`,
`indexes.conf`, `inputs.conf` y certificados. Durante el primer diagnóstico no
edites archivos `.conf`; relaciona el primer error del log con el último cambio
realizado.

## 9. Propiedad y permisos de la instalación

Comprueba la propiedad sin modificarla:

```bash
stat -c '%U:%G %a %n' /opt/splunk /opt/splunk/var /opt/splunk/var/log/splunk
```

Si se ejecutó primero como `root` y después como `splunk`, pueden existir
archivos que el usuario de servicio no pueda leer o escribir. Detén Splunk antes
de corregir la propiedad y utiliza `chown -R` solo después de confirmar que
toda la instalación debe pertenecer a `splunk`.

Conserva una copia o un registro del cambio. No mezcles arranques como `root` y
`splunk` en la misma sesión de diagnóstico.

## 10. Arranque automático

Si el arranque manual funciona, pero Splunk no inicia después de reiniciar el
servidor, revisa el mecanismo de boot-start:

```bash
sudo /opt/splunk/bin/splunk enable boot-start -user splunk
```

El mecanismo puede variar según la versión y la distribución. Revisa el mensaje
del comando y el estado del servicio:

```bash
systemctl status Splunkd --no-pager
systemctl list-units --type=service | grep -i splunk
```

No configures varios mecanismos de arranque a la vez: pueden producir estados
duplicados o difíciles de diagnosticar.

## 11. Validación funcional

Cuando `splunkd` aparezca activo, comprueba también Splunk Web:

```bash
curl -I http://127.0.0.1:8000
```

Después valida desde el navegador la URL y el puerto correctos. Una instancia
puede tener `splunkd` activo y Splunk Web detenido; son componentes distintos.

En Splunk Web, ejecuta una búsqueda mínima:

```spl
| makeresults
| eval estado="Splunk responde"
```

Si esta búsqueda funciona pero no aparecen datos del curso, el problema ya no
es el arranque: continúa con [Datos no aparecen](datos-no-aparecen.md).

## 12. Tabla de síntomas

| Síntoma | Causa probable | Primera acción |
|---|---|---|
| `splunkd is not running` | Servicio detenido o arranque fallido. | `status` y `splunkd.log`. |
| `Permission denied` | Usuario o propiedad incorrecta. | Revisar usuario y permisos. |
| Puerto ocupado | Otro proceso usa `8000` o `8089`. | Identificarlo con `ss` o `lsof`. |
| Arranque muy lento | Disco, memoria o recuperación pendiente. | Revisar recursos y logs. |
| No inicia tras reiniciar | Boot-start ausente o unidad incorrecta. | Revisar `systemctl`. |
| Web no responde, `splunkd` sí | Splunk Web, TLS o puerto 8000. | `web_service.log` y `curl`. |
| No se escriben logs | Disco lleno, permisos o sistema de archivos. | Revisar `df` y permisos. |
| Funciona como root, no como splunk | Archivos propiedad de root. | Corregir propiedad de forma controlada. |

## 13. Evidencias para pedir ayuda

Recoge la información siguiente sin incluir contraseñas, claves privadas ni
tokens:

```bash
/opt/splunk/bin/splunk version
getent passwd splunk
ls -ld /opt/splunk /opt/splunk/var
df -h /opt/splunk
sudo ss -ltnp | grep -E ':8000|:8089|:8065|:8191'
sudo tail -n 100 /opt/splunk/var/log/splunk/splunkd.log
sudo tail -n 100 /opt/splunk/var/log/splunk/web_service.log
```

Añade la hora del intento, el usuario utilizado, el comando ejecutado y el
primer mensaje de error. Esa información es más útil que indicar únicamente
que Splunk no arranca.

## 14. Cuándo no reinstalar

No reinstales mientras no hayas descartado:

- usuario de ejecución incorrecto;
- permisos heredados de una ejecución como `root`;
- disco o memoria insuficientes;
- conflicto de puertos;
- boot-start incorrecto;
- certificado o configuración inválida;
- proceso pendiente de una ejecución anterior;
- error documentado en `splunkd.log`.

Una reinstalación puede borrar contexto, romper configuraciones y no resolver
un problema de red, permisos o recursos.

## Referencias oficiales

- [Iniciar y detener Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Admin/StartandstopSplunk)
- [Configurar el arranque automático](https://docs.splunk.com/Documentation/Splunk/latest/Admin/ConfigureSplunkforautostart)
- [Archivos de logs de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/WhatSplunklogsareavailable)
- [Solución de problemas de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Abouttroubleshooting)
- [Puertos de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Installation/Ports)
- [Ejecución como usuario no root](https://docs.splunk.com/Documentation/Splunk/latest/Installation/RunSplunkasadifferentornon-rootuser)

## Siguiente paso

Cuando el servicio esté activo, continúa con [Problemas de acceso web](acceso-web.md)
para validar el puerto, TLS, navegador y autenticación. Si Splunk Web funciona
pero no hay eventos, consulta [Datos no aparecen](datos-no-aparecen.md).

Para mostrar solo mensajes sospechosos:

```bash
sudo grep -iE 'error|fatal|failed|cannot' \
  /opt/splunk/var/log/splunk/splunkd.log | tail -n 30
```

## 3. Comprobar los puertos

```bash
sudo ss -ltnp | grep -E ':8000|:8089|:8065|:8191'
```

Los puertos ocupados por otro programa pueden impedir el arranque. Si aparece
un conflicto, identifica el proceso antes de detenerlo.

## 4. Corregir permisos tras usar `root`

Si primero se ejecutó Splunk como `root` y después como `splunk`, puede haber
archivos que el usuario de servicio no pueda leer o modificar:

```bash
sudo /opt/splunk/bin/splunk stop --run-as-root
sudo chown -R splunk:splunk /opt/splunk
sudo -u splunk /opt/splunk/bin/splunk start
```

Comprueba:

```bash
sudo -u splunk /opt/splunk/bin/splunk status
```

## 5. No confundir mensajes con comandos

Durante el arranque pueden aparecer mensajes como `Checking prerequisites`,
`writing RSA key`, `Copying` o `Splunk web interface is at ...`. Son textos que
Splunk imprime en pantalla. No los copies de nuevo en la terminal. Solo ejecuta
las líneas que comienzan por un comando, por ejemplo `/opt/splunk/bin/splunk`.

## 6. Aviso de Python 3.7

El mensaje sobre la ruta:

```text
/opt/splunk/lib/python3.7/site-packages
```

no significa que falte Python 3.7 en Ubuntu. Splunk incluye su propio entorno y
esa comprobación puede buscar una ruta que no exista. Si la instalación termina
con `complete`, comprueba la versión y continúa:

```bash
/opt/splunk/bin/splunk version
```

## 7. Consultar el estado del sistema

Si el problema continúa, recoge esta información antes de pedir ayuda:

```bash
/opt/splunk/bin/splunk version
getent passwd splunk
ls -ld /opt/splunk
sudo ss -ltnp | grep -E ':8000|:8089|:8065|:8191'
sudo tail -n 100 /opt/splunk/var/log/splunk/splunkd.log
```
