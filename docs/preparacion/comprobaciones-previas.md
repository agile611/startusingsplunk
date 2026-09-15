# Comprobaciones previas

Antes de iniciar la [instalación manual](04-instalacion-ubuntu.md),
valida el sistema operativo, los recursos, la conectividad y los materiales.
Estas comprobaciones evitan confundir un problema de Ubuntu con un problema de
Splunk o de los datos ingeridos.

## Sistema operativo y recursos

Ejecuta:

```bash
uname -m
lsb_release -a
nproc
free -h
df -h /
```

Comprueba que:

- La arquitectura es `x86_64`.
- El sistema es Ubuntu 24.04.5 LTS.
- Hay al menos 4 núcleos disponibles.
- Hay 16 GB de RAM recomendados.
- Hay al menos 20 GB libres o el espacio definido para el laboratorio.

Los valores y su interpretación están detallados en [Requisitos de
hardware](requisitos-hardware.md).

## Red y permisos

Comprueba que la máquina puede actualizar paquetes y que tu usuario puede usar
`sudo`:

```bash
sudo apt update
sudo -v
hostname -I
```

Si utilizas una máquina virtual, confirma que la red permite descargar el
paquete y acceder a `http://localhost:8000` desde el navegador de Ubuntu.

## Materiales

Confirma que tienes:

- Acceso al portal de descargas de Splunk.
- El paquete Splunk Enterprise 10.4.3 para Linux `.deb`.
- El archivo [eventos_web.csv](../downloads/eventos_web.csv).
- Las [consultas SPL de referencia](../downloads/consultas-spl.txt).
- Las credenciales que crearás durante el primer inicio.

La descripción completa de los datasets está en [Datos del laboratorio](datos-laboratorio.md).

## Después de instalar Splunk

Cuando completes la instalación, ejecuta:

```bash
sudo /opt/splunk/bin/splunk version
sudo /opt/splunk/bin/splunk status
sudo ss -ltnp | grep -E ':8000|:8089|:9997'
```

Si la instalación se realizó como `root`, el comando de estado debe incluir
`--run-as-root`:

```bash
sudo /opt/splunk/bin/splunk status --run-as-root
```

Si la instalación ya se ha cambiado al usuario de servicio, utiliza:

```bash
sudo -u splunk /opt/splunk/bin/splunk status
```

El resultado esperado es Splunk Enterprise 10.4.3 en ejecución y los puertos
8000 y 8089 escuchando. El puerto 9997 solo debe aparecer si se ha configurado
un Universal Forwarder.

Después abre:

```text
http://localhost:8000
```

Inicia sesión con la cuenta administrativa creada durante el primer arranque.

## Checklist final

- [ ] Ubuntu 24.04.5 LTS está actualizado.
- [ ] La arquitectura es `x86_64`.
- [ ] Los recursos y el espacio cumplen las recomendaciones.
- [ ] El usuario puede ejecutar comandos con `sudo`.
- [ ] El paquete `.deb` de Splunk Enterprise 10.4.3 está disponible.
- [ ] El servicio Splunk está iniciado.
- [ ] Splunk Web responde en el puerto 8000.
- [ ] El archivo `eventos_web.csv` está disponible.
- [ ] El índice `curso` está creado o preparado para la ingesta.

El aviso sobre `/opt/splunk/lib/python3.7/site-packages` durante la instalación
no impide continuar si `dpkg` termina con `complete` y `splunk version` muestra
10.4.3. No instales Python 3.7 solo por ese mensaje.

## Si una comprobación falla

No continúes con la ingesta hasta resolver el problema básico. Consulta la
sección de [solución de problemas](../troubleshooting/index.md) y, según el
caso, revisa [Splunk no inicia](../troubleshooting/splunk-no-inicia.md), [el
acceso web](../troubleshooting/acceso-web.md) o [los datos no aparecen](../troubleshooting/datos-no-aparecen.md).
