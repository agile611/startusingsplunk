# Requisitos de hardware

La máquina del laboratorio ejecutará Splunk Enterprise 10.0.1, Splunk Web y
los datos de práctica en el mismo nodo. Por ello, los recursos deben cubrir
tanto el sistema operativo como el servicio de Splunk y el almacenamiento de
los índices.

## Recomendaciones

- CPU con al menos 4 núcleos.
- 16 GB de RAM recomendados para trabajar con comodidad.
- 20 GB libres como punto de partida para la instalación y los datasets.
- Disco con espacio adicional para el crecimiento de los índices.
- Conexión de red estable para descargar el paquete y acceder a Splunk Web.

Estos valores son adecuados para el laboratorio didáctico. No deben
interpretarse como una dimensionación para producción, donde el volumen de
eventos, la retención, la concurrencia y la arquitectura distribuida requieren
un cálculo específico.

## Máquina física o virtual

El laboratorio puede ejecutarse en una máquina física o en una máquina virtual.
En una máquina virtual asigna los recursos de forma fija cuando sea posible y
evita que el disco se quede sin espacio por un límite demasiado pequeño.

Comprueba los recursos asignados desde Ubuntu:

```bash
nproc
free -h
df -h /
uname -m
```

El resultado de `uname -m` debe ser `x86_64`. La arquitectura se corresponde
con el paquete `.deb` de Linux de 64 bits utilizado en la [instalación manual
de Splunk](../sesion-1/04-instalacion-ubuntu.md).

## Almacenamiento

Splunk utiliza disco para guardar los eventos indexados, metadatos, logs
internos y archivos de configuración. El espacio consumido aumenta con:

- El número de eventos ingeridos.
- El tamaño de los eventos.
- El número de veces que se cargan los datasets.
- El periodo de retención del índice.
- Los logs generados por la propia instancia.

Antes de importar los datos, revisa el espacio disponible:

```bash
df -h /
du -sh /opt/splunk 2>/dev/null
```

No borres manualmente subdirectorios de `/opt/splunk`. La administración de
índices y retención se estudia en [Gestión de índices](../sesion-1/07-indices.md).

## Red y puertos

La instalación utiliza estos puertos principales:

| Puerto | Uso | Necesario en el laboratorio |
|---:|---|---|
| 8000 | Splunk Web | Sí |
| 8089 | API y administración interna | Sí, para el funcionamiento de Splunk |
| 9997 | Recepción desde Universal Forwarder | Solo si se configura uno |

Para acceder desde la misma máquina se utilizará `localhost`. Si se accede
desde otro equipo, será necesario permitir el puerto 8000 en la red y utilizar
la dirección IP de Ubuntu. La [arquitectura del laboratorio](arquitectura-laboratorio.md)
explica cuándo se necesita cada puerto.

## Resumen

La máquina está lista desde el punto de vista de recursos cuando tiene Ubuntu
24.04.5 LTS, arquitectura `x86_64`, al menos 4 núcleos, 16 GB de RAM
recomendados, espacio libre suficiente y conectividad para descargar Splunk y
abrir Splunk Web.
