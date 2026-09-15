# Requisitos

Antes de comenzar, prepara una máquina con **Ubuntu 24.04.5 LTS**. El curso
utiliza una instalación manual de **Splunk Enterprise 10.4.3** mediante un
paquete `.deb` para arquitectura de 64 bits.

## Requisitos técnicos

- Ubuntu 24.04.5 LTS actualizado.
- Arquitectura `x86_64` o `amd64`.
- Mínimo recomendado de 4 núcleos de CPU.
- 16 GB de RAM recomendados para trabajar con comodidad.
- Al menos 20 GB libres para Splunk y los datos del laboratorio.
- Conexión a Internet para descargar el instalador y consultar la
  documentación oficial.
- Acceso a la [página oficial de descarga de Splunk Enterprise](https://www.splunk.com/en_us/download/splunk-enterprise.html),
  que ofrece un trial gratuito de 60 días.
- Cuenta de Splunk con acceso al portal de descargas.
- Usuario con permisos `sudo`.
- Navegador web actualizado.

La máquina puede ser física o virtual. Si se utiliza una máquina virtual,
asigna recursos suficientes y comprueba que la red permite acceder a Splunk
Web.

## Conocimientos recomendados

Conviene tener conocimientos básicos de:

- Sistemas operativos Linux.
- Redes y servicios.
- Archivos de log y monitorización.
- Trabajo con la línea de comandos.
- Formatos CSV y datos estructurados.

No es necesario conocer SPL ni haber administrado Splunk anteriormente.

## Comprobaciones previas

Antes de la sesión, verifica:

```bash
uname -m
lsb_release -a
df -h /
free -h
```

El resultado de `uname -m` debe ser `x86_64`. También debes poder ejecutar:

```bash
sudo apt update
```

Ten preparado un navegador para abrir `http://localhost:8000` después de la
instalación. La guía completa de instalación, verificación, puertos y arranque
automático está en [Instalación en Ubuntu](../preparacion/instalacion-ubuntu.md).

## Material del curso

- Paquete de Splunk Enterprise 10.4.3 para Linux `.deb`, descargado durante el
  trial gratuito de 60 días.
- Archivos CSV y otros datos de laboratorio.
- Credenciales administrativas creadas durante el primer arranque.
- Documentación del curso y acceso a la terminal de Ubuntu.
