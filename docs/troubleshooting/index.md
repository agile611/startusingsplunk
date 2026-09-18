# Troubleshooting

Esta sección ayuda a diagnosticar problemas habituales de Splunk Enterprise sin
reinstalar, recargar datos indiscriminadamente ni cambiar permisos a ciegas.

Está pensada para el laboratorio de monitorización web, pero el método también
sirve como base para una operación administrada.

La regla principal es separar el síntoma de la causa:

```text
Servicio
    ↓
Red y puertos
    ↓
Ingesta
    ↓
Índice
    ↓
Tiempo
    ↓
Eventos y campos
    ↓
SPL
    ↓
Dashboards, reportes y alertas
    ↓
Permisos
```

Una búsqueda vacía puede deberse a:

- datos que no han llegado;
- índice incorrecto;
- rango temporal equivocado;
- eventos históricos;
- campos no extraídos;
- filtros demasiado restrictivos;
- rol sin acceso;
- objeto de conocimiento privado.

Una página web que no abre puede deberse a:

- servicio detenido;
- puerto cerrado;
- firewall;
- proxy;
- DNS;
- certificado;
- navegador;
- autenticación;
- autorización.

Diagnostica la capa correcta antes de aplicar cambios. Splunk no suele necesitar
una reinstalación porque una búsqueda tenga un mal día.

---

## 1. Objetivos

Al finalizar esta sección, los asistentes podrán:

- identificar la capa en la que se produce un problema;
- comprobar el estado de Splunk Enterprise;
- verificar puertos y procesos;
- validar una entrada de datos;
- comprobar índices, fuentes y `sourcetypes`;
- diagnosticar rangos temporales incorrectos;
- diferenciar `_time` de `_indextime`;
- revisar campos y eventos originales;
- utilizar búsquedas SPL mínimas;
- analizar el rendimiento de una búsqueda;
- utilizar Job Inspector;
- consultar los logs internos;
- comprobar permisos y roles;
- revisar dashboards, reportes y alertas;
- documentar evidencias;
- aplicar cambios pequeños y reversibles;
- validar la solución con el rol final.

---

## 2. Entorno de referencia

El laboratorio utiliza como referencia:

- Splunk Enterprise 10.4.3.
- Ubuntu 24.04.5 LTS.
- Instalación habitual: `/opt/splunk`.
- Splunk Web: puerto `8000`.
- Management port: puerto `8089`.
- Índice principal del curso: `curso`.
- Usuario de configuración: `admin`.
- Usuario de validación: usuario con permisos limitados.
- Dataset: eventos de monitorización de una aplicación web.

La instalación real puede utilizar:

- otra ruta;
- otros puertos;
- otro usuario de servicio;
- otro método de autenticación;
- otra topología de red.

Comprueba siempre los valores reales antes de aplicar una corrección.

---

## 3. Mapa rápido de síntomas

| Síntoma | Empieza por | Documento relacionado |
|---|---|---|
| Splunk no inicia o se detiene | Estado del servicio y logs de arranque | `splunk-no-inicia.md` |
| Splunk Web no abre | Puerto, servicio, red, proxy y TLS | `acceso-web.md` |
| Splunk Web abre, pero no hay eventos | Índice, entrada, tiempo y permisos | `datos-no-aparecen.md` |
| Los eventos existen, pero los campos son incorrectos | `_raw`, `sourcetype` y extracción | `campos-incorrectos.md` |
| Un usuario ve menos datos que Admin | Índices permitidos y roles | `datos-no-aparecen.md` |
| Un dashboard funciona solo para Admin | Tokens, objetos y permisos | `campos-incorrectos.md` |
| Una alerta no se activa | Tiempo, frecuencia, condición y permisos | Documentar la alerta |
| Las búsquedas son lentas | Job Inspector y Monitoring Console | Esta guía |
| Hay eventos duplicados | Entradas, fuentes y reingestas | `datos-no-aparecen.md` |
| El disco se llena | `df`, buckets, logs y retención | Esta guía |
| El campo aparece como texto | `tonumber`, `trim` y valores nulos | `campos-incorrectos.md` |

---

## 4. Procedimiento común

Cuando alguien informe de un problema, registra primero:

1. Qué esperaba que ocurriera.
2. Qué ocurre realmente.
3. Fecha y hora, incluida la zona horaria.
4. Usuario, rol y aplicación utilizados.
5. Índice, `source` y `sourcetype`.
6. Consulta SPL exacta.
7. Selector temporal.
8. Mensaje de error completo.
9. Cambios realizados antes del problema.
10. Si el problema afecta a todos los usuarios o solo a uno.

Después sigue este orden:

1. Comprueba el servicio.
2. Comprueba el puerto o la interfaz afectada.
3. Ejecuta la prueba mínima posible.
4. Revisa índice, tiempo y permisos.
5. Inspecciona `_raw`, `source`, `sourcetype` y campos.
6. Añade filtros y comandos uno a uno.
7. Revisa logs y Job Inspector.
8. Aplica un cambio pequeño.
9. Repite la prueba.
10. Documenta el resultado.

---

## 5. Regla de oro: cambiar una sola capa cada vez

No realices simultáneamente todos estos cambios:

- cambiar el índice;
- modificar el `sourcetype`;
- editar `props.conf`;
- abrir el firewall;
- conceder `admin`;
- recargar el archivo;
- cambiar el selector temporal.

Si después la búsqueda funciona, no sabrás cuál fue la causa.

Utiliza esta secuencia:

```text
Observar
  ↓
Formular una hipótesis
  ↓
Realizar una prueba pequeña
  ↓
Aplicar un único cambio
  ↓
Validar
  ↓
Documentar
```

---

## 6. Prueba mínima del servicio

#### 6.1 Comprobar la versión

```bash
/opt/splunk/bin/splunk version
```

Si es necesario:

```bash
sudo /opt/splunk/bin/splunk version
```

#### 6.2 Comprobar el servicio

```bash
sudo systemctl status Splunkd --no-pager
```

#### 6.3 Comprobar el proceso

```bash
ps -eo user,pid,ppid,cmd | grep -i '[s]plunk'
```

#### 6.4 Comprobar puertos principales

```bash
sudo ss -ltnp | grep -E ':8000|:8089'
```

#### 6.5 Comprobar Splunk Web localmente

```bash
curl -I http://127.0.0.1:8000
```

Si utiliza HTTPS:

```bash
curl -kI https://127.0.0.1:8000
```

Una respuesta HTTP como `200`, `302`, `401` o `403` demuestra que hay un servicio
respondiendo. `Connection refused` suele indicar que no hay un proceso
aceptando conexiones en esa dirección y puerto.

---

## 7. Prueba mínima de búsqueda

Para el laboratorio, utiliza primero una búsqueda conocida:

```spl
index=curso earliest=0 latest=now
| stats
    count as total
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

Si no devuelve resultados:

1. selecciona **Todo el tiempo**;
2. confirma que el índice se llama `curso`;
3. prueba el intervalo absoluto del dataset;
4. comprueba el usuario y sus roles;
5. revisa la entrada;
6. revisa los logs.

Si devuelve resultados, inspecciona un evento:

```spl
index=curso earliest=0 latest=now
| table
    _time
    _indextime
    host
    source
    sourcetype
    method
    status
    uri
    _raw
| head 20
```

No utilices `index=*` como primera prueba. Puede:

- tardar más;
- mezclar fuentes;
- ocultar el índice correcto;
- generar resultados difíciles de interpretar.

---

## 8. Diagnóstico por capas

#### 8.1 Capa de servicio

Pregunta:

> ¿Está activo `splunkd`?

Comandos:

```bash
sudo systemctl status Splunkd
```

```bash
sudo /opt/splunk/bin/splunk status
```

#### 8.2 Capa de red

Pregunta:

> ¿El cliente puede alcanzar el servidor?

Comandos:

```bash
nc -vz NOMBRE_O_IP 8000
```

```bash
getent hosts NOMBRE_O_IP
```

```bash
ip route
```

#### 8.3 Capa de ingesta

Pregunta:

> ¿La entrada existe y está habilitada?

Consulta:

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype host disabled
```

#### 8.4 Capa de índice

Pregunta:

> ¿El índice existe y contiene eventos?

Consulta:

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

#### 8.5 Capa temporal

Pregunta:

> ¿Los eventos están dentro del intervalo?

Consulta:

```spl
index=curso earliest=0 latest=now
| stats
    earliest(_time) as inicio
    latest(_time) as fin
    count
```

#### 8.6 Capa de campos

Pregunta:

> ¿El dato existe en `_raw` y se ha extraído correctamente?

Consulta:

```spl
index=curso earliest=0 latest=now
| table _raw host method status uri
| head 20
```

#### 8.7 Capa SPL

Pregunta:

> ¿Qué condición elimina los eventos?

Añade filtros progresivamente:

```spl
index=curso
```

```spl
index=curso status=404
```

```spl
index=curso status=404 uri="/missing"
```

#### 8.8 Capa de permisos

Pregunta:

> ¿El usuario tiene acceso al índice y al objeto?

Consulta:

```spl
| rest /services/authentication/current-context
| table username roles
```

---

## 9. Evidencias útiles

Recoge únicamente la información necesaria.

#### 9.1 Evidencias del sistema

```bash
/opt/splunk/bin/splunk version
```

```bash
sudo systemctl status Splunkd --no-pager
```

```bash
sudo ss -ltnp | grep -E ':8000|:8089|:9997|:8088'
```

```bash
df -h
```

```bash
timedatectl
```

#### 9.2 Evidencias de logs

```bash
sudo tail -n 100 \
  /opt/splunk/var/log/splunk/splunkd.log
```

```bash
sudo tail -n 100 \
  /opt/splunk/var/log/splunk/web_service.log
```

#### 9.3 Evidencias de Splunk

```spl
| rest /services/authentication/current-context
| table username roles
```

```spl
| rest /services/data/indexes
| table title disabled totalEventCount currentDBSizeMB
```

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype host disabled
```

#### 9.4 Información que debe eliminarse antes de compartir

No incluyas:

- contraseñas;
- tokens;
- claves privadas;
- cookies;
- cabeceras de autenticación;
- datos personales;
- información de producción;
- direcciones internas si no son necesarias.

---

## 10. Logs internos de Splunk

#### 10.1 Errores recientes

```spl
index=_internal earliest=-30m latest=now
| search log_level=error OR log_level=warn
| table
    _time
    host
    component
    log_level
    message
| sort - _time
```

#### 10.2 Problemas de ingesta

```spl
index=_internal earliest=-30m latest=now
| search
    message="*monitor*"
    OR message="*input*"
    OR message="*permission*"
    OR message="*parsing*"
    OR message="*index*"
| table _time host component log_level message
| sort - _time
```

#### 10.3 Problemas de autenticación

```spl
index=_internal earliest=-1h latest=now
| search
    message="*authentication*"
    OR message="*login*"
    OR message="*failed*"
    OR message="*unauthorized*"
| table _time host component log_level message
| sort - _time
```

La estructura de los mensajes internos puede variar. Si una búsqueda no devuelve
resultados, inspecciona primero una muestra:

```spl
index=_internal earliest=-15m latest=now
| head 20
| table _time host component log_level message _raw
```

---

## 11. Job Inspector

Job Inspector ayuda a analizar la ejecución de una búsqueda.

#### 11.1 Cuándo utilizarlo

Utilízalo cuando:

- una búsqueda tarda demasiado;
- el número de resultados es inesperado;
- el dashboard tarda en cargar;
- una alerta consume demasiados recursos;
- un comando parece ser el cuello de botella;
- necesitas comparar dos versiones de SPL.

#### 11.2 Procedimiento

1. Ejecuta la búsqueda.
2. Abre el menú de acciones de la búsqueda.
3. Selecciona **Job Inspector**.
4. Revisa los tiempos y fases de ejecución.
5. Identifica comandos costosos.
6. Documenta la consulta y el intervalo temporal.

La ubicación exacta puede variar según la versión y la aplicación.

#### 11.3 Qué observar

Revisa especialmente:

- tiempo total;
- tiempo de búsqueda;
- tiempo de parsing;
- tiempo de ejecución de comandos;
- cantidad de eventos examinados;
- cantidad de resultados;
- uso de subsearches;
- comandos que generan grandes volúmenes intermedios.

#### 11.4 Buenas prácticas de rendimiento

Preferible:

```spl
index=curso earliest=-24h latest=now
| stats count by host
```

Menos recomendable para una primera prueba:

```spl
index=*
| search host=*
| table *
| sort 0 _time
```

Buenas prácticas:

- especificar el índice;
- especificar el tiempo;
- filtrar pronto;
- seleccionar solo los campos necesarios;
- limitar rankings;
- evitar `join` si `stats` resuelve el caso;
- evitar `transaction` salvo necesidad;
- no utilizar `table *`;
- no ordenar más resultados de los necesarios.

---

## 12. Monitoring Console

Monitoring Console permite revisar el estado y rendimiento de la plataforma.

#### 12.1 Áreas de interés

Según la versión y configuración, puede ayudar a investigar:

- salud de la instancia;
- rendimiento de búsquedas;
- actividad de usuarios;
- capacidad de indexación;
- problemas de almacenamiento;
- errores internos;
- actividad de forwarders;
- problemas de configuración.

#### 12.2 Cuándo utilizarla

Utiliza Monitoring Console cuando:

- el problema afecta a varios usuarios;
- varias búsquedas son lentas;
- existe presión de CPU o memoria;
- la ingesta se retrasa;
- hay problemas de capacidad;
- el fallo no se limita a una única consulta.

#### 12.3 Limitación

Monitoring Console no sustituye a:

- los logs;
- las pruebas mínimas;
- la validación del índice;
- la revisión de permisos;
- la inspección de la consulta.

Es una fuente adicional de evidencias, no una respuesta automática.

---

## 13. Diagnóstico de búsquedas lentas

#### 13.1 Reducir el intervalo

Prueba primero:

```spl
index=curso earliest=-15m latest=now
| stats count by host
```

Después amplía:

```spl
index=curso earliest=-24h latest=now
| stats count by host
```

Compara el tiempo de ejecución.

#### 13.2 Reducir campos

Evita:

```spl
| table *
```

Utiliza:

```spl
| table _time host status uri
```

#### 13.3 Filtrar temprano

Preferible:

```spl
index=curso earliest=-24h latest=now status=500
| stats count by uri
```

También puedes normalizar de forma explícita:

```spl
index=curso earliest=-24h latest=now
| eval status_num=tonumber(status)
| where status_num=500
| stats count by uri
```

#### 13.4 Limitar resultados

```spl
| sort - count
| head 10
```

#### 13.5 Evitar comandos costosos sin necesidad

Investiga antes de utilizar:

- `join`;
- `transaction`;
- subsearches grandes;
- `map`;
- `sort 0`;
- búsquedas globales;
- `table *`.

---

## 14. Diagnóstico de dashboards

Cuando una búsqueda funciona en Search, pero un dashboard no muestra datos:

#### 14.1 Ejecutar la búsqueda fuera del dashboard

Copia la SPL y ejecútala manualmente.

#### 14.2 Revisar el intervalo

Comprueba si el dashboard utiliza:

- un rango relativo;
- un token temporal;
- un valor vacío;
- una fecha incompatible con el dataset histórico.

#### 14.3 Revisar tokens

Comprueba:

- nombre del token;
- valor inicial;
- opción `Todos`;
- comillas;
- token temporal;
- token de host;
- token de status.

#### 14.4 Revisar permisos

Comprueba:

- propietario;
- aplicación;
- permisos de lectura;
- búsquedas dependientes;
- acceso al índice.

#### 14.5 Probar una versión mínima

Utiliza temporalmente:

```spl
index=curso earliest=0 latest=now
| stats count
```

Si funciona, añade los filtros y tokens uno por uno.

---

## 15. Diagnóstico de alertas

Cuando una alerta no se activa, revisa:

1. ¿La búsqueda manual devuelve resultados?
2. ¿El intervalo temporal coincide con la frecuencia?
3. ¿Los eventos tienen `_time` reciente?
4. ¿La condición se evalúa como se espera?
5. ¿La alerta está habilitada?
6. ¿El usuario tiene permisos?
7. ¿El throttling está suprimiendo notificaciones?
8. ¿La acción está configurada?
9. ¿El correo, webhook o script funciona?
10. ¿La alerta utiliza datos históricos en lugar de recientes?

#### 15.1 Consulta de prueba

Para cinco HTTP 500 en cinco minutos:

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

#### 15.2 Prueba histórica

```spl
index=curso
earliest="01/01/2026:00:00:00"
latest="01/01/2026:00:10:00"
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

Esta prueba valida la lógica, pero no demuestra que la alerta en tiempo real
funcione.

#### 15.3 Validar eventos recientes

```spl
index=curso earliest=-10m latest=now
| table _time host status uri
| sort - _time
```

---

## 16. Diagnóstico de permisos

#### 16.1 Revisar usuario y roles

```spl
| rest /services/authentication/current-context
| table username roles
```

#### 16.2 Comparar usuarios

Ejecuta la misma consulta con:

- `admin`;
- analista;
- usuario de validación.

Consulta base:

```spl
index=curso earliest=0 latest=now
| stats count
```

#### 16.3 Revisar el índice

```spl
| rest /services/data/indexes
| search title=curso
| table title disabled totalEventCount currentDBSizeMB
```

#### 16.4 Principio de mínimo privilegio

No concedas `admin` para resolver:

- ausencia de datos;
- acceso a un dashboard;
- lectura del índice;
- una búsqueda guardada;
- un campo no visible.

Concede únicamente las capacidades y accesos necesarios.

---

## 17. Diagnóstico de almacenamiento

#### 17.1 Espacio libre

```bash
df -h
```

#### 17.2 Inodos

```bash
df -ih
```

#### 17.3 Tamaño de Splunk

```bash
sudo du -sh /opt/splunk
```

#### 17.4 Tamaño de índices

```bash
sudo du -h --max-depth=1 \
  /opt/splunk/var/lib/splunk \
  | sort -h
```

#### 17.5 Tamaño de logs

```bash
sudo du -h --max-depth=1 \
  /opt/splunk/var/log/splunk \
  | sort -h
```

No elimines manualmente:

```text
/opt/splunk/var/lib/splunk
```

Gestiona retención, archivado y capacidad mediante procedimientos controlados.

---

## 18. Diagnóstico de duplicados

#### 18.1 Revisar volumen por fuente

```spl
index=curso earliest=0 latest=now
| stats count by source sourcetype host
| sort - count
```

#### 18.2 Buscar `_raw` repetido

```spl
index=curso earliest=0 latest=now
| stats count as repeticiones by _raw
| where repeticiones>1
| sort - repeticiones
| head 50
```

#### 18.3 Revisar entradas repetidas

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype host disabled
| sort path
```

Una coincidencia de `_raw` no demuestra por sí sola que exista duplicación. Dos
peticiones reales pueden tener exactamente el mismo contenido.

---

## 19. Procedimientos de diagnóstico por síntoma

#### 19.1 Splunk no inicia

Ejecuta:

```bash
sudo systemctl status Splunkd --no-pager
```

```bash
sudo journalctl -u Splunkd --since "30 minutes ago" --no-pager
```

```bash
sudo tail -n 100 \
  /opt/splunk/var/log/splunk/splunkd.log
```

Consulta:

```text
splunk-no-inicia.md
```

---

#### 19.2 Splunk Web no abre

Ejecuta:

```bash
sudo ss -ltnp | grep -E ':8000|:8089'
```

```bash
curl -I http://127.0.0.1:8000
```

```bash
sudo tail -n 100 \
  /opt/splunk/var/log/splunk/web_service.log
```

Consulta:

```text
acceso-web.md
```

---

#### 19.3 No hay eventos

Ejecuta:

```spl
index=curso earliest=0 latest=now
| stats count
```

Después:

```spl
| rest /services/data/inputs/monitor
| table path index sourcetype host disabled
```

Consulta:

```text
datos-no-aparecen.md
```

---

#### 19.4 Campos incorrectos

Ejecuta:

```spl
index=curso earliest=0 latest=now
| table _raw host source sourcetype status uri
| head 20
```

Después:

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

Consulta:

```text
campos-incorrectos.md
```

---

#### 19.5 Dashboard sin datos

1. Ejecuta la SPL fuera del dashboard.
2. Utiliza un rango temporal amplio.
3. Sustituye tokens por valores fijos.
4. Revisa permisos.
5. Añade filtros uno a uno.
6. Comprueba el contexto de la aplicación.

---

#### 19.6 Alerta sin activación

1. Ejecuta la SPL manualmente.
2. Revisa `_time`.
3. Revisa ventana y frecuencia.
4. Revisa condición.
5. Comprueba throttling.
6. Comprueba la acción.
7. Prueba con eventos recientes.

---

## 20. Qué no hacer

- No reinstales Splunk ante el primer error.
- No borres `/opt/splunk`.
- No borres índices para “empezar de cero”.
- No recargues repetidamente el mismo archivo.
- No concedas `admin` para resolver un problema de lectura.
- No desactives TLS como solución permanente.
- No desactives el firewall sin una justificación.
- No compartas contraseñas, claves privadas ni tokens.
- No cambies varias capas a la vez.
- No modifiques `props.conf` globalmente sin pruebas.
- No edites directamente archivos `default`.
- No borres buckets manualmente.
- No uses `index=*` como primera consulta.
- No concluyas que existe una causa raíz solo porque dos hechos coinciden.
- No trates un dataset histórico como si fuera tiempo real.
- No ignores `_time` e `_indextime`.
- No utilices `fillnull` para ocultar errores de ingesta.
- No pruebes únicamente con `admin`.

---

## 21. Criterio de resolución

Un problema está resuelto cuando:

- se ha identificado la causa raíz;
- o se ha documentado claramente una limitación;
- la prueba mínima funciona;
- funciona con el usuario y rol previstos;
- la corrección se ha probado con un caso normal;
- la corrección se ha probado con un caso problemático;
- no se han creado duplicados;
- no se han añadido permisos innecesarios;
- la búsqueda, dashboard o alerta muestra el resultado esperado;
- los logs no muestran nuevos errores relacionados;
- queda documentado qué se cambió;
- existe un procedimiento de reversión si es necesario.

Una solución que funciona únicamente con `admin` no está completa si el objeto
debe utilizarlo un analista u operador.

---

## 22. Plantilla de informe de troubleshooting

```markdown
## Informe de troubleshooting

#### Fecha y hora

Completar.

#### Zona horaria

Completar.

#### Instancia

Completar.

#### Versión de Splunk

Completar.

#### Sistema operativo

Completar.

#### Usuario afectado

Completar.

#### Rol

Completar.

#### Aplicación

Completar.

#### Síntoma

Describir qué ocurre.

#### Comportamiento esperado

Describir qué debería ocurrir.

#### Primera hipótesis

Completar.

#### Servicio

```text
Estado:
Usuario del proceso:
```

#### Red y puertos

```text
Splunk Web:
Management port:
Dirección de escucha:
Firewall:
```

#### Índice

```text
curso
```

#### Source

Completar.

#### Sourcetype

Completar.

#### Rango temporal

Completar.

#### Consulta mínima

```spl
Completar.
```

#### Resultado de la consulta mínima

Completar.

#### `_time`

Completar.

#### `_indextime`

Completar.

#### Campos revisados

Completar.

#### Logs consultados

Completar.

#### Job Inspector

Completar si aplica.

#### Monitoring Console

Completar si aplica.

#### Causa raíz

Describir una causa concreta.

#### Corrección aplicada

Describir el cambio.

#### Validación

Indicar la consulta y el resultado.

#### Validación con el rol final

Completar.

#### Riesgos o limitaciones

Completar.

#### Rollback

Describir cómo revertir el cambio.

#### Responsable

Completar.
```

---

## 23. Checklist de diagnóstico

#### Servicio

- [ ] Splunk está instalado.
- [ ] Se ha comprobado la versión.
- [ ] `Splunkd` está activo.
- [ ] Se conoce el usuario del proceso.
- [ ] Se han revisado los logs de arranque.

#### Red

- [ ] El puerto esperado está escuchando.
- [ ] Se ha probado el acceso local.
- [ ] Se ha probado el acceso remoto si aplica.
- [ ] Se ha revisado DNS.
- [ ] Se ha revisado el firewall.
- [ ] Se ha revisado el proxy.
- [ ] Se ha verificado HTTP frente a HTTPS.

#### Ingesta

- [ ] La entrada existe.
- [ ] Está habilitada.
- [ ] La ruta es correcta.
- [ ] El archivo existe en el servidor.
- [ ] El usuario de Splunk puede leerlo.
- [ ] No existen entradas duplicadas.
- [ ] El `source` es correcto.
- [ ] El `sourcetype` es correcto.

#### Índice

- [ ] Existe `curso`.
- [ ] Está habilitado.
- [ ] La entrada apunta al índice correcto.
- [ ] Hay eventos indexados.
- [ ] El usuario tiene acceso.
- [ ] Hay espacio disponible.

#### Tiempo

- [ ] Se ha probado `earliest=0 latest=now`.
- [ ] Se conoce el primer evento.
- [ ] Se conoce el último evento.
- [ ] `_time` es correcto.
- [ ] `_indextime` se ha revisado.
- [ ] La zona horaria es coherente.

#### Campos y SPL

- [ ] Se ha revisado `_raw`.
- [ ] Se han revisado los campos extraídos.
- [ ] Se ha utilizado `fieldsummary`.
- [ ] Se han comprobado tipos numéricos.
- [ ] Se han añadido filtros progresivamente.
- [ ] Se han evitado comandos complejos al principio.
- [ ] Se han revisado valores nulos y vacíos.

#### Dashboards y alertas

- [ ] La búsqueda funciona fuera del objeto.
- [ ] Los tokens tienen valores correctos.
- [ ] El rango temporal funciona.
- [ ] El objeto está compartido.
- [ ] La alerta está habilitada.
- [ ] La condición funciona manualmente.
- [ ] Se ha revisado el throttling.

#### Seguridad

- [ ] No se han compartido secretos.
- [ ] No se han concedido permisos excesivos.
- [ ] Se ha aplicado mínimo privilegio.
- [ ] Se ha protegido el puerto `8089`.
- [ ] No se ha desactivado TLS permanentemente.
- [ ] No se han eliminado datos como primera medida.

#### Cierre

- [ ] Se ha identificado la causa.
- [ ] Se ha aplicado una corrección.
- [ ] Se ha validado la solución.
- [ ] Se ha probado un caso normal.
- [ ] Se ha probado un caso problemático.
- [ ] Se ha documentado el rollback.
- [ ] El informe está completo.
```

## Referencias incluidas

- [Troubleshooting de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Abouttroubleshooting)
- [Troubleshooting de datos](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Troubleshootingyourdata)
- [Monitoring Console](https://docs.splunk.com/Documentation/Splunk/latest/Monitor/MonitoringConsole)
- [Roles y capacidades](https://docs.splunk.com/Documentation/Splunk/latest/Security/Rolesandcapabilities)
- [Índice de auditoría](https://docs.splunk.com/Documentation/Splunk/latest/Security/Auditindex)
- [Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchapp)
- [Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)
- [REST API Reference](https://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTprolog)
- [About indexes](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Get data in](https://docs.splunk.com/Documentation/Splunk/latest/Get%20started/Getdatain)
- [Knowledge Objects](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)
- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)