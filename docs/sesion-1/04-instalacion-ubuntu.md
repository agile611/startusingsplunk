# 4. Instalación en Ubuntu

Esta guía describe una instalación manual de **Splunk Enterprise 10.0.1**
sobre **Ubuntu 24.04.5 LTS**. Se utiliza una versión fija para que todos los
participantes trabajen con los mismos menús, comandos y comportamiento durante
el curso.

## Requisitos previos

Antes de comenzar, comprueba lo siguiente:

- Ubuntu 24.04.5 LTS actualizado.
- Arquitectura de 64 bits (`amd64`).
- Al menos 4 núcleos de CPU y 16 GB de RAM recomendados.
- Al menos 20 GB libres para la instalación y los datos del laboratorio.
- Una cuenta de Splunk para descargar el instalador.
- Acceso a una terminal con permisos `sudo`.

Actualiza el sistema y comprueba la arquitectura:

```bash
sudo apt update
sudo apt upgrade -y
uname -m
lsb_release -a
```

El resultado de `uname -m` debe ser `x86_64`.

## Descarga manual del instalador

1. Accede al portal oficial de descargas de Splunk.
2. Selecciona **Splunk Enterprise 10.0.1**.
3. Descarga el paquete para **Linux**, formato **`.deb`** y arquitectura
   **64-bit**.
4. Guarda el archivo en el directorio `Descargas` de Ubuntu.

El nombre exacto del archivo puede variar. Comprueba que el paquete existe:

```bash
cd ~/Descargas
ls -lh splunk-*.deb
```

Si el navegador guarda el archivo con otro nombre o en otro directorio,
adapta el comando `cd` y el nombre del archivo a tu instalación.

## Verificación del archivo

Antes de instalarlo, calcula la suma SHA-256 del paquete:

```bash
sha256sum splunk-10.0.1-*.deb
```

Compara el resultado con la suma publicada por Splunk para ese mismo archivo.
No continúes si la suma no coincide o si la descarga está incompleta.

## Instalación del paquete

Instala el paquete descargado con `dpkg`:

```bash
sudo dpkg -i splunk-10.0.1-*.deb
```

Comprueba que el directorio de instalación se ha creado correctamente:

```bash
ls -ld /opt/splunk
sudo /opt/splunk/bin/splunk version
```

La salida debe indicar Splunk Enterprise 10.0.1.

Si `dpkg` informa de dependencias pendientes, corrígelas y repite la
comprobación:

```bash
sudo apt --fix-broken install -y
sudo dpkg -i splunk-10.0.1-*.deb
```

## Primer inicio y licencia

Inicia Splunk aceptando la licencia. En el primer arranque se solicitará crear
la cuenta administrativa local:

```bash
sudo /opt/splunk/bin/splunk start --accept-license
```

Define un usuario administrador y una contraseña segura. Estas credenciales
se utilizarán para acceder a Splunk Web y no son necesariamente las mismas que
las del usuario de Ubuntu.

Cuando el arranque termine, comprueba el estado del servicio:

```bash
sudo /opt/splunk/bin/splunk status
```

## Acceso a Splunk Web

Desde el navegador de la máquina, abre:

```text
http://localhost:8000
```

Si accedes desde otra máquina, sustituye `localhost` por la dirección IP del
servidor:

```bash
hostname -I
```

El primer acceso puede tardar unos segundos mientras se inicializan los
componentes de Splunk.

## Activar el inicio automático

Configura Splunk para que arranque automáticamente con Ubuntu. El parámetro
`-user` hace que el servicio se ejecute con un usuario dedicado en lugar de
utilizar `root`:

```bash
sudo /opt/splunk/bin/splunk enable boot-start -user splunk
```

Reinicia la máquina para comprobar el comportamiento real del servicio:

```bash
sudo reboot
```

Después del reinicio, verifica que Splunk está activo:

```bash
sudo /opt/splunk/bin/splunk status
```

## Puertos utilizados

Los puertos principales de esta instalación son:

| Puerto | Uso |
|---:|---|
| 8000 | Splunk Web |
| 8089 | API y administración interna |
| 9997 | Recepción de datos de Universal Forwarder, si se utiliza |

Comprueba los puertos que están escuchando con:

```bash
sudo ss -ltnp | grep -E ':8000|:8089|:9997'
```

No abras el puerto `9997` si el laboratorio no utiliza un Universal Forwarder.

## Comprobación final

La instalación se considera correcta cuando se cumplen todas estas
condiciones:

- `splunk version` muestra la versión 10.0.1.
- `splunk status` indica que Splunk está ejecutándose.
- Splunk Web responde en el puerto 8000.
- Es posible iniciar sesión con la cuenta administrativa creada durante el
  primer arranque.
- El servicio vuelve a iniciarse después de reiniciar Ubuntu.

## Problemas habituales

### El puerto 8000 no responde

Comprueba el estado y revisa el registro principal:

```bash
sudo /opt/splunk/bin/splunk status
sudo tail -n 50 /opt/splunk/var/log/splunk/splunkd.log
```

### El paquete no se puede instalar

Confirma que has descargado el paquete `.deb` para Linux de 64 bits y revisa
las dependencias:

```bash
dpkg --print-architecture
sudo apt --fix-broken install
```

### Se ha olvidado la contraseña de Splunk

No elimines archivos de configuración ni reinstales el producto sin guardar
antes los datos del laboratorio. Detén Splunk y sigue el procedimiento oficial
de recuperación de credenciales de la versión instalada.
