# Splunk no inicia

Si Splunk no inicia, sigue las comprobaciones en este orden. No reinstales
inmediatamente: primero hay que saber si el problema es el usuario, los
permisos, los puertos o la configuración.

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
