# Datos no aparecen

Cuando una búsqueda no devuelve eventos, separa primero estas situaciones:

1. La fuente no está llegando a Splunk.
2. Los eventos están en otro índice.
3. Los eventos existen, pero quedan fuera del intervalo temporal.
4. El usuario no tiene permisos para leerlos.
5. Un filtro, `sourcetype` o campo está eliminando los resultados.

No reinstales Splunk ni vuelvas a cargar el archivo antes de identificar cuál de
estas hipótesis es correcta. Cargar varias veces el mismo dataset puede crear
duplicados y complicar el diagnóstico.

## Flujo rápido de diagnóstico

Sigue este orden:

```text
Servicio -> entrada -> índice -> tiempo -> permisos -> campos -> filtros
```

### 1. Confirmar que Splunk está activo

```bash
sudo -u splunk /opt/splunk/bin/splunk status
```

Si el servicio no está activo, consulta [Splunk no inicia](splunk-no-inicia.md).
Si Splunk Web responde pero no hay datos, el problema puede estar en la entrada
o en la búsqueda, no en el acceso web.

### 2. Buscar sin filtros complejos

Empieza por el índice recomendado:

```spl
index=curso
| head 20
```

Después cuenta eventos:

```spl
index=curso
| stats count as total
```

No empieces con `status=404`, `sourcetype=...` o una expresión regular. Primero
comprueba si existen eventos visibles.

### 3. Ampliar temporalmente el rango

Selecciona **Todo el tiempo** para una primera comprobación controlada. Después
revisa el tiempo real de los eventos:

```spl
index=curso
| stats count as total earliest(_time) as primer_evento latest(_time) as ultimo_evento
```

El CSV del curso contiene eventos del 1 de enero de 2026. Una búsqueda con
**Últimas 24 horas** ejecutada meses después no los encontrará aunque la carga
haya sido correcta.

Para ese archivo, prueba:

```spl
index=curso earliest="01/01/2026:00:00:00" latest="01/01/2026:00:10:00"
| table _time host method status uri
```

Si esta búsqueda encuentra datos y `index=curso` no los encuentra con el rango
actual, la ingesta funciona y el problema es temporal.

## Comprobar la fuente y el índice

Revisa los metadatos:

```spl
index=curso
| stats count by index, source, sourcetype, host
| sort - count
```

Comprueba que:

- `index` es `curso`;
- `source` corresponde al archivo o entrada esperada;
- `sourcetype` es coherente con el formato;
- `host` identifica el origen correcto.

No confundas `source` con `index`: el primero describe de dónde procede el
evento y el segundo dónde está almacenado.

Si sospechas que el índice es otro y tienes permiso para revisar metadatos,
puedes explorar de forma limitada:

```spl
| metadata type=sources index=curso
```

No uses `index=*` como primera respuesta. Puede tardar, mezclar fuentes y
ocultar el índice que realmente necesita revisión.

## Comprobar la entrada de datos

Desde Splunk Web revisa **Settings > Add Data** o **Settings > Data inputs**,
según el tipo de entrada. Confirma:

- ruta absoluta del archivo;
- que el archivo existe en el servidor de Splunk;
- usuario y permisos de lectura;
- índice de destino;
- `host` y `sourcetype` asignados;
- si la entrada monitoriza cambios o solo importó una vez;
- que no se está ignorando el archivo por su estado o ruta.

En una fuente local, que el archivo exista en el ordenador del asistente no
significa que exista en el servidor donde se ejecuta Splunk.

En el sistema operativo puedes revisar:

```bash
ls -l /ruta/al/archivo
sudo -u splunk test -r /ruta/al/archivo
```

El segundo comando comprueba si el usuario de servicio puede leerlo.

## Comprobar permisos

Si Admin ve eventos y otro usuario no, compara el acceso al índice:

1. Ejecuta `index=curso | stats count` con el usuario afectado.
2. Revisa los índices permitidos por su rol.
3. Comprueba que no exista una exclusión del índice.
4. Revisa la aplicación y el objeto de búsqueda.
5. Confirma el rango temporal utilizado.

No concedas `admin` como solución. El usuario debe recibir acceso al índice y a
los objetos que necesita, no capacidades administrativas completas.

## Comprobar el evento original y los campos

Cuando aparecen eventos pero una consulta concreta no devuelve nada, muestra el
contenido original:

```spl
index=curso
| table _time _raw host source sourcetype timestamp method status uri
| head 20
```

Para el CSV de referencia, deberían poder validarse `host`, `method`, `status`
y `uri`. Si el texto existe en `_raw` pero el campo no aparece, consulta
[Campos incorrectos](campos-incorrectos.md) y [Extracción de campos](../sesion-2/08-extraccion-campos.md).

Comprueba también el `sourcetype`:

```spl
index=curso
| stats count by sourcetype
```

Un campo mal extraído no siempre significa que los datos no hayan llegado.

## Revisar filtros paso a paso

Construye la consulta incrementando una condición cada vez:

```spl
index=curso
```

```spl
index=curso status=404
```

```spl
index=curso status=404 uri="/missing"
```

Si la primera consulta devuelve eventos y la segunda no, revisa el nombre y los
valores reales de `status`. Si la segunda funciona y la tercera no, revisa la
extracción o el valor exacto de `uri`.

No añadas `rex`, `eval`, `join` o `transaction` durante el primer diagnóstico.
Primero demuestra que la búsqueda base encuentra el conjunto correcto.

## Revisar `_time` e `_indextime`

Un archivo puede contener eventos antiguos e indexarse ahora. Compara ambos
tiempos:

```spl
index=curso
| table _time _indextime source host status uri
| sort _time
```

- `_time` representa el momento del evento y controla el rango de búsqueda.
- `_indextime` representa cuándo Splunk lo indexó.

Si `_time` es incorrecto, revisa el parsing del timestamp y la zona horaria de
la fuente. Cambiar el selector temporal puede encontrar los eventos, pero no
corrige la causa del problema.

## Revisar logs del servidor

Si la entrada no produce eventos, revisa los logs de Splunk:

```bash
sudo tail -n 100 /opt/splunk/var/log/splunk/splunkd.log
```

Busca errores relacionados con la entrada, permisos, lectura de archivos,
parsing o índice:

```bash
sudo grep -iE 'error|failed|permission|monitor|input|index' \
	/opt/splunk/var/log/splunk/splunkd.log | tail -n 50
```

Conserva el contexto temporal del error. No borres el archivo ni reinicies la
instancia repetidamente sin conocer el motivo.

## Tabla de síntomas

| Síntoma | Causa probable | Acción |
|---|---|---|
| `index=curso` no devuelve nada | Índice, tiempo, permisos o ingesta. | Probar Todo el tiempo y revisar entrada. |
| La búsqueda absoluta sí devuelve datos | Rango temporal incorrecto. | Ajustar selector o `earliest`/`latest`. |
| Admin ve datos y otro usuario no | Rol sin acceso al índice. | Revisar permisos, no conceder `admin`. |
| `source` no es el esperado | Entrada o ruta incorrecta. | Revisar Data inputs y archivo del servidor. |
| Eventos en `_raw`, campos ausentes | Parsing o extracción incorrectos. | Revisar `sourcetype` y `rex` temporal. |
| Solo falla un filtro | Campo, valor o tipo incorrecto. | Añadir condiciones una a una. |
| Se duplican eventos | Archivo cargado o monitorizado varias veces. | Revisar entradas y no recargar sin control. |
| El evento tiene fecha inesperada | Timestamp o zona horaria incorrectos. | Revisar configuración de parsing. |

## Procedimiento de cierre

Documenta la incidencia con:

- fecha y hora de la prueba;
- usuario y rol utilizados;
- índice y rango temporal;
- `source`, `sourcetype` y `host` observados;
- consulta mínima que funcionó o falló;
- log relevante;
- causa raíz;
- corrección aplicada y validación posterior.

Una incidencia está resuelta cuando la búsqueda funciona con el rol previsto y
la corrección no introduce duplicados, campos incorrectos o exposición de datos.

## Referencias oficiales

- [Solución de problemas de datos](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Troubleshootingyourdata)
- [Ingesta de datos](https://docs.splunk.com/Documentation/Splunk/latest/Data/Whatissource)
- [Índices](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Modificadores temporales](https://docs.splunk.com/Documentation/Splunk/latest/Search/Specifytimemodifiersinyoursearch)
- [Campos y extracción](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Extractfields)
- [Roles y capacidades](https://docs.splunk.com/Documentation/Splunk/latest/Security/Rolesandcapabilities)
- [Monitorización de la plataforma](https://docs.splunk.com/Documentation/Splunk/latest/Monitor/MonitoringConsole)
