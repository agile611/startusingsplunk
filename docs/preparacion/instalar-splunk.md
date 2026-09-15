# Instalación de Splunk Enterprise 10.4.3

Esta guía describe la instalación manual completa de **Splunk Enterprise
10.4.3** sobre **Ubuntu 24.04.5 LTS** en una máquina de laboratorio de 64 bits.
El procedimiento parte de una máquina preparada y termina con Splunk Web
disponible, el servicio configurado para iniciarse automáticamente y una serie
de comprobaciones que permiten validar la instalación.

Está escrita para seguirla paso a paso. Las líneas que aparecen dentro de un
bloque como el siguiente son comandos que se ejecutan en la terminal:

```bash
comando-que-se-debe-ejecutar
```

Los mensajes que muestra Splunk, por ejemplo `Checking prerequisites...` o
`Splunk web interface is at ...`, son información de salida. No deben copiarse
de nuevo en la terminal como si fueran comandos.

La instalación se realiza en un único nodo. En esta topología la misma
instancia proporciona el servicio principal de Splunk, el indexer, el search
head, el almacenamiento local y Splunk Web.

## Orden de instalación

Sigue los apartados en este orden. No intentes iniciar Splunk antes de que la
instalación del paquete haya terminado correctamente:

1. Comprobar Ubuntu, la arquitectura, la memoria y el espacio disponible.
2. Descargar el paquete `.deb` de Splunk Enterprise 10.4.3.
3. Verificar el archivo descargado.
4. Entrar como `root` con `sudo su`.
5. Instalar el paquete con `dpkg -i`.
6. Crear o preparar el usuario de servicio `splunk`.
7. Confirmar que el procesador expone AVX si el precheck lo solicita.
8. Aceptar la licencia y crear la cuenta administradora.
9. Comprobar Splunk Web y configurar el inicio automático.
10. Validar los puertos y preparar el índice `curso`.

Las líneas que comienzan por `root@...#` o `curso@...$` son prompts de ejemplo.
No se escriben en la terminal; solo se escribe el comando que aparece después.

## Resultado esperado

Al terminar, se deben cumplir estas condiciones:

- Splunk Enterprise 10.4.3 está instalado en `/opt/splunk`.
- Ubuntu reconoce la arquitectura `x86_64`.
- El servicio principal de Splunk está iniciado.
- Splunk Web responde en `http://localhost:8000`.
- La cuenta administrativa local permite iniciar sesión.
- El servicio se inicia automáticamente después de reiniciar Ubuntu.
- El entorno está preparado para crear el índice `curso` e ingerir los datos
  del laboratorio.

## 1. Requisitos previos

Antes de descargar el instalador, confirma que la máquina cumple los requisitos
descritos en [Requisitos de hardware](requisitos-hardware.md) y en los
[requisitos generales del curso](../curso/requisitos.md).

### Recursos recomendados

- Ubuntu 24.04.5 LTS actualizado.
- Arquitectura de 64 bits (`x86_64` o `amd64`).
- Al menos 4 núcleos de CPU.
- 16 GB de RAM recomendados.
- Al menos 20 GB libres para Splunk y los datos iniciales.
- Conexión a Internet para descargar el paquete.
- Usuario con permisos `sudo`.
- Navegador web actualizado.

### Comprobar Ubuntu

Ejecuta los siguientes comandos:

```bash
uname -m
lsb_release -a
nproc
free -h
df -h /
```

El resultado de `uname -m` debe ser `x86_64`. Comprueba que `df -h /` muestra
espacio libre suficiente antes de comenzar. Splunk necesita espacio no solo
para instalar el producto, sino también para guardar índices, logs internos y
los datos del laboratorio.

Actualiza los paquetes del sistema:

```bash
sudo apt update
sudo apt upgrade -y
```

## 2. Preparar el directorio de descarga

Crea un directorio local para guardar el paquete. Así se separa el instalador
de los archivos de datos que se utilizarán posteriormente:

```bash
mkdir -p ~/Descargas/splunk-10.4.3
cd ~/Descargas/splunk-10.4.3
```

Si Ubuntu utiliza nombres de directorio en inglés, usa `~/Downloads` en lugar
de `~/Descargas`.

## 3. Descargar Splunk Enterprise

La descarga se realiza desde la página oficial de [Splunk Enterprise](https://www.splunk.com/en_us/download/splunk-enterprise.html).
La página ofrece un **trial gratuito de 60 días**, sin necesidad de introducir
una tarjeta de crédito. Durante el registro puede solicitar una cuenta y una
dirección de correo corporativa o profesional.

Este enlace descarga **Splunk Enterprise**, que es el producto necesario para
este curso. No debe confundirse con [Splunk SOAR](https://www.splunk.com/en_us/download/soar-free-trial.html),
que está orientado a playbooks y automatización de respuesta ante incidentes.
SOAR no sustituye a Splunk Enterprise para las prácticas de índices, ingesta,
SPL y dashboards.

También puedes utilizar directamente este enlace al paquete Linux amd64:

[Descargar Splunk Enterprise 10.4.3 para Linux amd64](https://download.splunk.com/products/splunk/releases/10.4.3/linux/splunk-10.4.3-4174a2deda5d-linux-amd64.deb)

1. Abre el portal oficial de descargas de Splunk.
2. Inicia sesión con tu cuenta.
3. Selecciona **Splunk Enterprise**.
4. Selecciona la versión **10.4.3**.
5. Selecciona **Linux** como sistema operativo.
6. Selecciona el paquete **`.deb`** para arquitectura **64-bit**.
7. Acepta las condiciones de licencia si el portal las solicita.
8. Descarga el archivo en `~/Descargas/splunk-10.4.3`.

Como alternativa, descarga el paquete directamente desde la terminal:

```bash
cd ~/Descargas/splunk-10.4.3
wget https://download.splunk.com/products/splunk/releases/10.4.3/linux/splunk-10.4.3-4174a2deda5d-linux-amd64.deb
```

El trial de 60 días es suficiente para realizar el curso completo. Comprueba
la fecha de activación y planifica las prácticas dentro de ese periodo. La
licencia y las condiciones concretas mostradas por Splunk durante el registro
son las que prevalecen sobre esta guía.

El nombre exacto puede incluir el número de compilación. Por eso, no conviene
escribir manualmente un nombre supuesto en los comandos siguientes. Comprueba
qué archivo se ha descargado:

```bash
cd ~/Descargas/splunk-10.4.3
ls -lh
```

Debe aparecer un único paquete `.deb` de Splunk Enterprise. Comprueba también
que el archivo es un paquete Debian válido:

```bash
dpkg-deb --info splunk-*.deb | sed -n '1,20p'
```

La salida debe identificar el paquete de Splunk para Linux de 64 bits. Si no
aparece ningún archivo, revisa la carpeta de descargas o mueve el instalador a
la ruta indicada antes de continuar.

## 4. Entrar como root para la instalación

La instalación del paquete escribe en `/opt`, por lo que necesita permisos de
administrador. Puedes abrir una shell de `root` antes de continuar:

```bash
sudo su
```

Escribe la contraseña de tu usuario de Ubuntu cuando se solicite. El prompt
puede cambiar de algo parecido a:

```text
curso@splunk00:~$
```

a:

```text
root@splunk00:/home/curso/Descargas/splunk-10.4.3#
```

Cuando aparezca `root@...#`, los comandos siguientes se ejecutan como
administrador y no necesitan escribir `sudo` delante. No copies el texto del
prompt (`root@splunk00:...#`); solo escribe el comando que aparece después.

Mantén esta shell abierta durante la instalación. Al terminar, vuelve al
usuario normal con:

```bash
exit
```

> **Importante:** ejecutar Splunk como `root` permite completar la instalación,
> pero el servicio de Splunk muestra una advertencia porque no es la forma
> recomendada para ejecutarlo habitualmente. Más adelante se explica cómo
> utilizar el usuario de servicio `splunk`.

## 5. Verificar la descarga

No instales un archivo descargado incompleto o alterado. Calcula su suma
SHA-256:

```bash
cd ~/Descargas/splunk-10.4.3
sha256sum splunk-*.deb
```

Compara el valor mostrado con la suma SHA-256 publicada por Splunk para la
misma versión, sistema operativo, arquitectura y archivo. La comparación solo
es válida si coinciden todos esos datos.

Si la suma no coincide:

1. Elimina el archivo incompleto.
2. Descarga de nuevo el paquete desde el portal oficial.
3. Calcula otra vez la suma.
4. No continúes hasta obtener una coincidencia.

Para comprobar que el archivo no está vacío:

```bash
stat -c '%n %s bytes' splunk-*.deb
```

## 6. Instalar el paquete `.deb`

Desde el directorio donde está el instalador, ejecuta:

```bash
cd ~/Descargas/splunk-10.4.3
dpkg -i splunk-*.deb
```

El instalador coloca Splunk en:

```text
/opt/splunk
```

Comprueba que la carpeta existe y que el binario responde:

```bash
ls -ld /opt/splunk
/opt/splunk/bin/splunk version
```

La versión mostrada debe ser **10.4.3**.

Durante `dpkg -i` puede aparecer un mensaje parecido a este:

```text
find: '/opt/splunk/lib/python3.7/site-packages': No existe el archivo o el directorio
```

### ¿Hay que instalar Python 3.7?

**No. No es necesario instalar Python 3.7 en Ubuntu para corregir este
mensaje.** Splunk Enterprise 10.4.3 incluye sus propios componentes de Python y
no utiliza el Python del sistema para esta comprobación. La ruta
`/opt/splunk/lib/python3.7/site-packages` pertenece a una comprobación interna
del instalador que puede buscar una ruta antigua que no exista.

No hagas ninguna de estas acciones:

- No instales Python 3.7 manualmente.
- No cambies la versión de Python de Ubuntu.
- No crees `/opt/splunk/lib/python3.7/site-packages` a mano.
- No instales paquetes Python con `pip` dentro de `/opt/splunk`.

Comprueba simplemente si la instalación terminó correctamente:

```bash
sudo /opt/splunk/bin/splunk version
```

Si muestra `Splunk 10.4.3` y `dpkg` terminó con `complete`, el aviso no bloquea
la instalación y puedes continuar con el primer arranque:

```bash
sudo /opt/splunk/bin/splunk start --accept-license
```

Si `splunk version` falla o el proceso de `dpkg` terminó con un error distinto,
revisa ese error concreto antes de instalar nada adicional.

### Resolver dependencias

Si `dpkg` informa de dependencias pendientes, ejecuta:

```bash
apt --fix-broken install -y
```

Después completa la instalación del paquete y vuelve a comprobar la versión:

```bash
cd ~/Descargas/splunk-10.4.3
dpkg -i splunk-*.deb
/opt/splunk/bin/splunk version
```

No borres `/opt/splunk` para resolver un error de dependencias. Primero revisa
el mensaje de `dpkg` y el estado de los paquetes:

```bash
dpkg --print-architecture
dpkg -l | grep -i splunk
```

## 7. Preparar el usuario del servicio

Splunk no debe ejecutarse habitualmente con una cuenta administrativa de
Ubuntu. Comprueba si existe el usuario de servicio `splunk`:

```bash
getent passwd splunk
```

Si el comando no devuelve ninguna línea, créalo como usuario del sistema sin
acceso interactivo:

```bash
sudo useradd --system --home-dir /opt/splunk --shell /usr/sbin/nologin splunk
```

Asigna la propiedad de la instalación a ese usuario:

```bash
sudo chown -R splunk:splunk /opt/splunk
```

Comprueba la propiedad principal:

```bash
stat -c '%U:%G %n' /opt/splunk
```

Debe mostrar `splunk:splunk`. Si la instalación ya creó el usuario o el
paquete utiliza una configuración de permisos diferente, conserva el usuario
indicado por el instalador y no cambies permisos de forma indiscriminada.

### Si Splunk se inició como `root`

Si ejecutas `/opt/splunk/bin/splunk start` como `root`, Splunk puede mostrar:

```text
Running Splunk Enterprise as root is deprecated and will be removed in a future release.
```

No es un error inmediato, pero no es la configuración recomendada. Para una
prueba puntual puedes iniciar explícitamente como `root`:

```bash
sudo /opt/splunk/bin/splunk start --run-as-root
```

Para el curso es mejor utilizar el usuario de servicio `splunk`. Si ya se ha
iniciado una vez como `root`, detén primero la instancia, asigna la instalación
al usuario de servicio y vuelve a iniciarla:

```bash
sudo /opt/splunk/bin/splunk stop --run-as-root
sudo chown -R splunk:splunk /opt/splunk
sudo -u splunk /opt/splunk/bin/splunk start
```

Comprueba el resultado:

```bash
sudo -u splunk /opt/splunk/bin/splunk status
```

No mezcles en cada comando un usuario diferente. Si se inicia como `root`, se
debe utilizar `--run-as-root`; si se inicia como `splunk`, se debe mantener ese
usuario en `start`, `stop` y `status`.

## 8. Comprobar y corregir el requisito AVX

Durante la instalación o una actualización de Splunk puede aparecer este
error:

```text
CPU missing required AVX instruction set for Intel processors
splunk-preinstall upgrade check failed
dpkg: error al procesar el archivo ... (--install)
```

Esto significa que Ubuntu no está viendo la instrucción **AVX** del procesador.
Splunk Enterprise 10.4.3 necesita AVX. No es un problema de Python ni se
soluciona instalando Python 3.7.

### Comprobar si Ubuntu ve AVX

Ejecuta:

```bash
lscpu | grep -iE 'Model name|Flags'
grep -wo avx /proc/cpuinfo | sort -u
```

Si el segundo comando no muestra `avx`, la máquina virtual no está exponiendo
esa capacidad a Ubuntu. Si aparece `avx`, revisa también que el procesador no
esté siendo limitado por la configuración del hipervisor.

### Activar AVX en la máquina virtual

Apaga completamente la máquina virtual y configura un tipo de CPU que exponga
las capacidades del procesador físico:

- En **KVM/QEMU/libvirt**, utiliza el modo `host-passthrough`.
- En **Proxmox**, selecciona el tipo de CPU `host`.
- En **VMware**, habilita la exposición de las instrucciones de CPU del host.
- En **VirtualBox**, utiliza un perfil de procesador moderno y confirma que el
  procesador físico soporta AVX.
- En **Terraform**, configura el recurso de la máquina virtual según el
  proveedor para exponer la CPU del host.

No basta con reiniciar Ubuntu si el hipervisor conserva la configuración
antigua. Apaga la máquina virtual por completo, cambia el tipo de CPU y vuelve
a encenderla.

Después comprueba de nuevo:

```bash
lscpu | grep -i avx
```

La salida debe incluir `avx` en las flags del procesador.

### Repetir la instalación después de corregir AVX

Si `dpkg` terminó con un error, no continúes con el arranque hasta completar
la configuración del paquete:

```bash
cd ~/Descargas/splunk-10.4.3
dpkg --configure -a
dpkg -i splunk-10.4.3-4174a2deda5d-linux-amd64.deb
/opt/splunk/bin/splunk version
```

La salida debe mostrar Splunk Enterprise 10.4.3 y no debe volver a aparecer el
fallo de `splunk-preinstall`.

No utilices esta variable para saltarte la comprobación:

```bash
SPLUNK_SKIP_PREINSTALL_CPU_CHECKS_CORRUPTING_DATA_IF_UNSUPPORTED=1
```

El nombre de la variable ya advierte del riesgo: forzar la instalación en una
CPU no compatible puede provocar errores o corrupción de datos. Solo debe
considerarse en una prueba temporal cuando se haya confirmado que el
procesador sí soporta AVX.

## 9. Primer inicio y aceptación de licencia

Inicia Splunk por primera vez con la cuenta de servicio. El primer arranque
solicitará crear las credenciales administrativas de Splunk:

```bash
root@terraform00:~/Descargas/splunk-10.4.3# /opt/splunk/bin/splunk start --accept-license --run-as-root
```

Durante el proceso:

1. Lee y acepta la licencia cuando se solicite.
2. Escribe un nombre de usuario administrador.
3. Escribe una contraseña robusta.
4. Confirma la contraseña.
5. Espera a que termine la inicialización de Splunk Web.

La contraseña debe tener al menos **8 caracteres ASCII imprimibles**. Los
caracteres no aparecen mientras se escriben, y eso es normal. Puedes utilizar,
por ejemplo, una contraseña de laboratorio que cumpla ese mínimo, pero no la
guardes en el repositorio ni la compartas en documentos públicos.

Si aparece:

```text
ERROR: Password did not meet complexity requirements.
```

vuelve a introducir una contraseña de 8 o más caracteres ASCII imprimibles.
Una contraseña vacía, con menos de 8 caracteres o con caracteres no válidos no
será aceptada.

La cuenta de Splunk es independiente de la cuenta de Ubuntu. No guardes la
contraseña en este repositorio ni en documentos públicos del curso.

Comprueba el estado del servicio:

```bash
sudo -u splunk /opt/splunk/bin/splunk status
```

Si el servicio ya está iniciado, no ejecutes repetidamente `start`; utiliza
`status` para comprobarlo.

Un primer arranque correcto puede mostrar mensajes como `writing RSA key`,
`New certs have been generated` y `Splunk web interface is at ...`. Son pasos
normales de creación de certificados e inicialización. Lo importante es que el
comando termine sin un error fatal y que `status` indique que `splunkd` está en
ejecución.

## 10. Acceder a Splunk Web

En el navegador de la misma máquina abre:

```text
http://localhost:8000
```

Inicia sesión con el usuario y la contraseña creados en el primer arranque.

Si accedes desde otro equipo de la red, consulta la dirección IP de Ubuntu:

```bash
hostname -I
```

Después utiliza:

```text
http://DIRECCION_IP_DE_UBUNTU:8000
```

No publiques Splunk Web en Internet sin configurar adecuadamente firewall,
TLS, autenticación y controles de acceso.

## 11. Configurar el inicio automático

Configura el arranque automático usando el usuario de servicio `splunk`:

```bash
sudo /opt/splunk/bin/splunk enable boot-start -user splunk
```

Comprueba que el comando termina sin errores. Dependiendo de la versión y de la
configuración de Ubuntu, Splunk puede crear una unidad de servicio o integrar
el arranque mediante el mecanismo soportado por el paquete.

Reinicia la máquina para validar el arranque real:

```bash
sudo reboot
```

Después del reinicio, espera unos segundos y comprueba:

```bash
sudo -u splunk /opt/splunk/bin/splunk status
```

Si no se inicia automáticamente, revisa el mensaje mostrado por
`enable boot-start`, el estado del servicio y los logs de Ubuntu antes de
repetir la configuración.

## 12. Comprobar puertos

La instalación utiliza estos puertos:

| Puerto | Uso | Cuándo es necesario |
|---:|---|---|
| 8000 | Splunk Web | Siempre que se utilice la interfaz web. |
| 8089 | API y administración de `splunkd` | Funcionamiento interno de Splunk. |
| 9997 | Entrada TCP desde Universal Forwarder | Solo si se configura un forwarder. |

Comprueba los puertos en escucha:

```bash
sudo ss -ltnp | grep -E ':8000|:8089|:9997'
```

En el laboratorio básico deben aparecer 8000 y 8089. El puerto 9997 no es
necesario para cargar el CSV local y no debe abrirse sin una razón concreta.

## 13. Validación funcional

Ejecuta las comprobaciones siguientes:

```bash
sudo /opt/splunk/bin/splunk version
sudo -u splunk /opt/splunk/bin/splunk status
curl -I http://localhost:8000
```

El resultado esperado es:

- Versión `10.4.3`.
- Estado `splunkd` en ejecución.
- Respuesta HTTP del puerto 8000.
- Acceso correcto a Splunk Web desde el navegador.

También puedes revisar el log principal si hay dudas:

```bash
sudo tail -n 50 /opt/splunk/var/log/splunk/splunkd.log
```

Una salida correcta puede incluir:

```text
Splunk 10.4.3 (build 4174a2deda5d)
The Splunk web interface is at http://NOMBRE_O_IP:8000
```

Si `splunkd is not running`, no significa necesariamente que haya que
reinstalar. Revisa primero el log y el usuario con el que se inició:

```bash
sudo -u splunk /opt/splunk/bin/splunk status
sudo tail -n 100 /opt/splunk/var/log/splunk/splunkd.log
```

## 14. Preparar el laboratorio

Una vez validada la instalación:

1. Consulta los [datos del laboratorio](datos-laboratorio.md).
2. Revisa el archivo [`eventos_web.csv`](../downloads/eventos_web.csv).
3. Sigue la guía de [Ingesta de datos](../sesion-1/06-ingesta-datos.md).
4. Carga los eventos en el índice `curso`.
5. Valida la carga con:

```spl
index=curso
| stats count by sourcetype
```

La configuración del índice se explica en [Gestión de índices](../sesion-1/07-indices.md).

## 15. Errores y soluciones

Esta sección reúne los errores que pueden aparecer durante esta instalación:

| Error o síntoma | Causa habitual | Solución |
|---|---|---|
| `dpkg-reconfigure ... no está instalado` | Se ha usado un archivo `.deb` como si fuera un paquete ya instalado. | Usar `dpkg -i archivo.deb`. |
| `CPU missing required AVX` | La máquina virtual no expone AVX o el procesador no lo soporta. | Activar `host-passthrough` o CPU `host`, apagar y encender la VM, y repetir la instalación. |
| Aviso sobre `python3.7/site-packages` | Comprobación interna de una ruta antigua. | No instalar Python 3.7; comprobar la versión de Splunk. |
| `Password did not meet complexity requirements` | La contraseña tiene menos de 8 caracteres ASCII imprimibles. | Introducir una contraseña válida y confirmarla. |
| `splunkd is not running` | Splunk no se ha iniciado, se ha usado otro usuario o hay un error en la configuración. | Revisar `status`, permisos, puertos y `splunkd.log`. |
| Mensajes como `Please`, `Copying` o `writing` aparecen como comandos. | Se ha pegado la salida de Splunk en la terminal. | Ejecutar solo los comandos de los bloques `bash`. |
| `Running Splunk Enterprise as root is deprecated` | Splunk se ha iniciado como `root`. | Migrar la propiedad a `splunk` y ejecutar el servicio con ese usuario. |
| `rm -rf /opt/splunk/*` | Se ha borrado manualmente el contenido de la instalación. | No repetirlo; revisar el estado del paquete y restaurar una copia si existe. |

Antes de aplicar una solución, conserva el mensaje completo del error. No
borres `/opt/splunk` ni reinstales a ciegas: primero identifica si el problema
está en la CPU, el paquete, los permisos, la contraseña, los puertos o el
servicio.

### `dpkg-reconfigure` indica que el paquete no está instalado

`dpkg-reconfigure` no instala un archivo `.deb`. Este comando solo reconfigura
un paquete que ya está registrado como instalado en la base de datos de `dpkg`.
Por eso, este comando es incorrecto para instalar Splunk:

```bash
dpkg-reconfigure splunk-10.4.3-4174a2deda5d-linux-amd64.deb
```

El nombre del archivo descargado es un archivo, no el nombre del paquete
instalado. Para consultar el contenido del archivo utiliza:

```bash
dpkg --info splunk-10.4.3-4174a2deda5d-linux-amd64.deb
```

Para instalarlo o repetir la instalación utiliza `dpkg -i`:

```bash
cd ~/Descargas/splunk-10.4.3
dpkg -i splunk-10.4.3-4174a2deda5d-linux-amd64.deb
```

Después comprueba si el paquete está registrado:

```bash
dpkg-query -W -f='${Status} ${Version}\n' splunk
```

Una instalación correcta debe mostrar `install ok installed` y la versión
`10.4.3`.

### El precheck de CPU falla y falta AVX

Si aparece:

```text
CPU Info upgrade precheck FAILED
CPU missing required AVX instruction set for Intel processors
splunk-preinstall upgrade check failed
```

la instalación o actualización se ha detenido porque Ubuntu no ve la
instrucción AVX. Sigue la sección [Comprobar y corregir el requisito AVX](#8-comprobar-y-corregir-el-requisito-avx)
antes de volver a ejecutar `dpkg -i`.

No intentes resolverlo con `dpkg-reconfigure`, Python 3.7 ni borrando archivos
de `/opt/splunk`. Hay que exponer AVX desde la configuración del hipervisor o
utilizar una máquina cuyo procesador sea compatible.

### No borrar `/opt/splunk/*` como solución

Este comando es destructivo:

```bash
rm -rf /opt/splunk/*
```

No lo utilices como procedimiento normal. Puede eliminar configuraciones,
índices, credenciales, certificados, aplicaciones y datos del laboratorio. En
una actualización fallida, el paquete puede seguir registrado en `dpkg` aunque
la instalación no haya terminado correctamente; borrar el contenido no corrige
el requisito AVX.

Si ya se ha ejecutado, no vuelvas a lanzar comandos destructivos. Conserva la
salida del error y comprueba primero el estado del paquete:

```bash
dpkg-query -W -f='${Status} ${Version}\n' splunk
dpkg -s splunk
```

Si los datos son importantes, detén el trabajo y restaura `/opt/splunk` desde
una copia de seguridad. Si es un laboratorio recién creado y no hay datos que
conservar, corrige primero AVX y consulta el procedimiento de desinstalación y
reinstalación de la distribución antes de eliminar nada más.

### `dpkg` no encuentra el archivo

Comprueba el directorio actual y el nombre real del paquete:

```bash
pwd
ls -lh ~/Descargas/splunk-10.4.3
```

### La versión no es 10.4.3

Es posible que se haya descargado otra versión o que el comando se esté
ejecutando sobre otra instalación. Comprueba:

```bash
sudo /opt/splunk/bin/splunk version
dpkg -l | grep -i splunk
```

No mezcles paquetes de distintas versiones durante la práctica.

### Splunk Web no responde

Comprueba estado, puertos y log:

```bash
sudo -u splunk /opt/splunk/bin/splunk status
sudo ss -ltnp | grep -E ':8000|:8089'
sudo tail -n 50 /opt/splunk/var/log/splunk/splunkd.log
```

Consulta también [No funciona el acceso web](../troubleshooting/acceso-web.md).

### El servicio no arranca después de reiniciar

Revisa que el usuario de servicio exista y que el arranque automático se haya
habilitado con el mismo usuario:

```bash
getent passwd splunk
sudo /opt/splunk/bin/splunk status
```

Consulta [Splunk no inicia](../troubleshooting/splunk-no-inicia.md) antes de
reinstalar.

### Los eventos no aparecen

La instalación puede estar correcta aunque la ingesta tenga un problema.
Comprueba el índice, el intervalo temporal, el `sourcetype` y los permisos.
Consulta [Los datos no aparecen](../troubleshooting/datos-no-aparecen.md).

## Referencias del procedimiento

- [Requisitos de hardware](requisitos-hardware.md).
- [Arquitectura del laboratorio](arquitectura-laboratorio.md).
- [Comprobaciones previas](comprobaciones-previas.md).
- [Instalación en Ubuntu](04-instalacion-ubuntu.md).
- [Datos del laboratorio](datos-laboratorio.md).
