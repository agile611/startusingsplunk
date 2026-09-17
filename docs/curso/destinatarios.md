# Destinatarios

Este curso está dirigido a profesionales que necesitan convertir registros, datos
de máquina y eventos operativos en búsquedas, indicadores y decisiones.

El enfoque es práctico. Las actividades se realizan sobre una instancia local de
**Splunk Enterprise 10.4.3** instalada en **Ubuntu 24.04.5 LTS**, utilizando un
índice de laboratorio denominado:

```text
curso
```

El asistente trabajará con el flujo completo:

```text
Fuente de datos
    ↓
Entrada
    ↓
Ingesta
    ↓
Índice
    ↓
Eventos y campos
    ↓
Búsqueda SPL
    ↓
Estadística o visualización
    ↓
Reporte, dashboard o alerta
```

El curso parte de una instalación funcional de Splunk Enterprise. Por tanto, el
tiempo de aprendizaje se dedica principalmente a:

- validar la plataforma;
- comprender los datos;
- crear búsquedas SPL;
- interpretar resultados;
- construir objetos reutilizables;
- configurar alertas;
- documentar decisiones;
- resolver problemas habituales.

---

# 1. Público recomendado

El curso está especialmente recomendado para:

- administradores de sistemas;
- ingenieros de operaciones;
- analistas y operadores de seguridad;
- analistas de datos;
- profesionales de IT;
- equipos de soporte;
- desarrolladores;
- responsables de aplicaciones;
- ingenieros DevOps;
- responsables de observabilidad;
- administradores de plataformas de monitorización;
- profesionales que trabajan con logs y datos operativos.

## 1.1 Administradores de sistemas

Encontrarán utilidad en actividades como:

- comprobar el estado de servicios;
- analizar logs;
- revisar errores de sistemas;
- estudiar actividad por host;
- detectar cambios de comportamiento;
- crear alertas operativas;
- relacionar datos de aplicación y sistema.

## 1.2 Analistas de seguridad

El curso proporciona una base para:

- buscar eventos sospechosos;
- analizar códigos de respuesta;
- agrupar actividad por origen;
- identificar patrones;
- construir indicadores;
- crear detecciones iniciales;
- documentar evidencias.

El curso no sustituye una formación completa en **Splunk Enterprise
Security**, SOC, detección avanzada o respuesta ante incidentes. Sí proporciona
los fundamentos de búsqueda, análisis y visualización necesarios para avanzar.

## 1.3 Equipos de soporte

Los asistentes podrán utilizar Splunk para:

- investigar incidencias;
- reconstruir una secuencia de eventos;
- localizar errores;
- comparar hosts;
- comprobar ventanas temporales;
- identificar URI problemáticas;
- crear consultas reutilizables;
- reducir diagnósticos basados únicamente en suposiciones.

## 1.4 Desarrolladores y responsables de aplicaciones

El contenido resulta útil para:

- analizar respuestas HTTP;
- comprobar errores de aplicación;
- estudiar peticiones por URI;
- observar tráfico;
- relacionar métodos y códigos de respuesta;
- detectar información ausente;
- definir métricas de operación;
- crear alertas sobre errores.

---

# 2. Situación de partida

El curso está pensado para asistentes que cumplen estas condiciones:

- disponen de una instancia de Splunk Enterprise instalada;
- pueden acceder a Splunk Web;
- tienen un usuario con rol `admin` en Splunk;
- pueden trabajar con el índice `curso`;
- disponen del dataset de laboratorio;
- pueden ejecutar comandos básicos en Ubuntu;
- están preparados para interpretar resultados técnicos.

## 2.1 Comprobaciones iniciales

Antes de comenzar, se recomienda verificar:

```bash
/opt/splunk/bin/splunk version
```

```bash
sudo systemctl status Splunkd --no-pager
```

```bash
curl -I http://127.0.0.1:8000
```

Y desde Splunk Web:

```spl
| makeresults
| eval estado="Splunk responde"
```

La instalación se considera preparada cuando:

- la versión puede consultarse;
- el servicio está activo;
- Splunk Web responde;
- el usuario puede iniciar sesión;
- la búsqueda mínima funciona;
- el índice de prácticas está disponible o puede crearse.

---

# 3. Perfil técnico recomendado

Es recomendable tener experiencia básica con:

- sistemas Linux;
- archivos de registro;
- procesos y servicios;
- redes y puertos;
- línea de comandos;
- permisos de archivos;
- conceptos de monitorización;
- resolución de incidencias;
- datos tabulares;
- formatos CSV;
- conceptos básicos de HTTP;
- interpretación de tablas y gráficos.

También es útil conocer:

- expresiones booleanas;
- filtros;
- agrupaciones;
- porcentajes;
- fechas y horas;
- conceptos básicos de bases de datos;
- diferencias entre texto y número.

No es necesario tener experiencia previa con Splunk. Los conceptos se introducen
desde el principio y se practican con búsquedas progresivas.

---

# 4. Requisitos que no son obligatorios

No es necesario:

- haber utilizado SPL anteriormente;
- administrar una arquitectura distribuida;
- conocer `props.conf` en profundidad;
- conocer `transforms.conf`;
- haber trabajado con indexer clusters;
- administrar search head clusters;
- utilizar Splunk Enterprise Security;
- programar en Python;
- construir expresiones regulares complejas;
- conocer Dashboard Studio antes del curso.

Estos temas pueden aparecer como contexto, pero el curso se centra en una
instancia mononodo y en un flujo práctico de análisis.

---

# 5. Diferencia entre el rol `admin` y los permisos de Ubuntu

Tener permisos de `admin` en Splunk no significa necesariamente tener permisos
de administrador en Ubuntu.

## 5.1 Permisos dentro de Splunk

El rol `admin` permite realizar, según la configuración de la instancia,
actividades como:

- administrar índices;
- configurar entradas;
- guardar búsquedas;
- crear reportes;
- crear dashboards;
- configurar alertas;
- revisar objetos;
- administrar usuarios y roles;
- consultar configuraciones desde Splunk Web.

## 5.2 Permisos del sistema operativo

Ubuntu controla acciones como:

- consultar servicios;
- iniciar o detener procesos;
- leer archivos protegidos;
- modificar configuraciones del sistema;
- abrir puertos;
- consultar procesos;
- cambiar propietarios;
- modificar reglas del firewall.

Por ejemplo, este comando depende de los permisos de Ubuntu:

```bash
sudo systemctl status Splunkd
```

El hecho de tener el rol `admin` en Splunk no garantiza que el usuario pueda
ejecutar correctamente comandos con `sudo`.

## 5.3 Matriz de permisos

| Actividad | Contexto | Permiso habitual |
|---|---|---|
| Ejecutar una búsqueda | Splunk | Acceso al índice y capacidad de búsqueda |
| Crear un índice | Splunk | Capacidad administrativa adecuada |
| Crear un dashboard | Splunk | Permiso para crear objetos |
| Consultar `Splunkd` | Ubuntu | Permisos de sistema |
| Leer un log protegido | Ubuntu | Permiso sobre el archivo |
| Consultar el puerto `8000` | Ubuntu/red | Acceso local o de red |
| Modificar el firewall | Ubuntu | `sudo` o privilegios equivalentes |

Durante las prácticas se utiliza `admin` para simplificar la configuración, pero
se recomienda validar posteriormente los objetos con el rol operativo real.

---

# 6. Qué debe saber hacer el asistente al finalizar

Al terminar el curso, el asistente podrá:

## 6.1 Validar la plataforma

- consultar la versión de Splunk;
- comprobar el estado de `splunkd`;
- comprobar Splunk Web;
- identificar el puerto `8000`;
- identificar el puerto `8089`;
- reconocer problemas básicos de acceso;
- distinguir un problema de servicio de un problema de búsqueda.

## 6.2 Validar los datos

- identificar el índice utilizado;
- comprobar el número de eventos;
- localizar el primer y último evento;
- revisar `_time`;
- revisar `_indextime`;
- inspeccionar `_raw`;
- identificar `source`;
- identificar `sourcetype`;
- identificar `host`;
- comprobar los campos disponibles;
- reconocer campos ausentes.

Consulta de referencia:

```spl
index=curso earliest=0 latest=now
| stats
    count as total_eventos
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

## 6.3 Construir búsquedas

- buscar por índice;
- aplicar rangos temporales;
- filtrar por campos;
- utilizar operadores booleanos;
- ordenar resultados;
- seleccionar campos;
- agrupar eventos;
- calcular estadísticas;
- generar series temporales;
- crear campos calculados;
- convertir valores de texto a números;
- extraer campos con `rex`.

## 6.4 Crear objetos operativos

- guardar búsquedas;
- crear reportes;
- seleccionar visualizaciones;
- construir dashboards;
- añadir filtros;
- utilizar tokens;
- configurar alertas;
- aplicar throttling;
- revisar permisos;
- documentar los objetos.

---

# 7. Qué se espera del participante

Durante las prácticas, el participante deberá trabajar de forma activa.

Se espera que pueda:

- ejecutar comandos en una terminal de Ubuntu;
- utilizar `sudo` cuando disponga de autorización;
- acceder a Splunk Web;
- navegar por Search & Reporting;
- leer tablas y gráficos;
- revisar eventos individuales;
- comparar resultados;
- hacer preguntas técnicas;
- documentar problemas;
- repetir una consulta;
- justificar sus decisiones.

No basta con copiar y pegar una búsqueda. El participante debe comprender:

- qué índice utiliza;
- qué periodo temporal analiza;
- qué campos intervienen;
- qué transformación realiza;
- qué significa el resultado;
- qué limitaciones tiene la consulta.

---

# 8. Responsabilidad del participante

Cada participante debe validar sus resultados.

Antes de aceptar una búsqueda como correcta, debe comprobar:

- ¿Estoy usando el índice correcto?
- ¿El rango temporal contiene datos?
- ¿El campo existe?
- ¿El nombre del campo está bien escrito?
- ¿El campo contiene valores vacíos?
- ¿El valor es texto o número?
- ¿La consulta devuelve el resultado esperado?
- ¿El resultado responde a la pregunta?
- ¿Estoy interpretando correctamente las unidades?
- ¿Tengo permisos suficientes?
- ¿Puedo reproducir la consulta?

Una búsqueda que devuelve resultados no es necesariamente una búsqueda correcta.
Los resultados deben ser coherentes con los datos y con la pregunta original.

---

# 9. Actividades prácticas para el perfil del asistente

## 9.1 Validación inicial

Ejecutar:

```spl
| makeresults
| eval estado="Splunk responde"
```

Después:

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

Objetivo:

- comprobar el motor de búsqueda;
- comprobar la visibilidad del índice;
- distinguir una búsqueda funcional de una búsqueda con datos.

## 9.2 Revisión del modelo de datos

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

Objetivo:

- reconocer eventos;
- identificar metadatos;
- comprobar campos;
- comparar `_raw` con los campos extraídos.

## 9.3 Análisis de errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| where status_num>=400
| stats count as errores by uri
| sort - errores
| head 10
```

Objetivo:

- detectar URI con más errores;
- practicar conversiones;
- producir una tabla operativa;
- preparar un reporte o dashboard.

## 9.4 Evolución temporal

```spl
index=curso earliest=0 latest=now
| timechart span=1m count as peticiones
```

Objetivo:

- observar volumen;
- elegir una visualización;
- interpretar intervalos;
- preparar un panel temporal.

## 9.5 Alerta básica

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(trim(status))
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

Objetivo:

- expresar una condición operativa;
- utilizar una ventana temporal;
- diferenciar una búsqueda de una alerta;
- comprobar la lógica antes de activar una acción.

---

# 10. Perfiles y objetivos profesionales

## 10.1 Perfil de administración

Prioridades:

- servicio;
- puertos;
- almacenamiento;
- entradas;
- índices;
- permisos;
- troubleshooting.

Preguntas habituales:

- ¿Splunk está activo?
- ¿Está escuchando en el puerto esperado?
- ¿Se están ingiriendo datos?
- ¿El índice está habilitado?
- ¿La entrada apunta al destino correcto?
- ¿El usuario puede acceder al objeto?

## 10.2 Perfil de operaciones

Prioridades:

- disponibilidad;
- volumen;
- errores;
- tendencias;
- hosts;
- alertas;
- dashboards.

Preguntas habituales:

- ¿Está aumentando el número de errores?
- ¿Qué host concentra la actividad?
- ¿Qué URI falla más?
- ¿Qué umbral debe generar una alerta?
- ¿Cómo se presenta la información al equipo?

## 10.3 Perfil de seguridad

Prioridades:

- patrones;
- códigos anómalos;
- orígenes;
- ventanas temporales;
- evidencias;
- permisos;
- trazabilidad.

Preguntas habituales:

- ¿Qué comportamiento se sale de la línea base?
- ¿Qué host produce más errores?
- ¿Hay una concentración temporal?
- ¿Qué campos faltan para investigar mejor?
- ¿Qué usuario puede consultar los datos?

## 10.4 Perfil de desarrollo

Prioridades:

- errores de aplicación;
- URI;
- métodos HTTP;
- tiempos de respuesta;
- códigos de estado;
- calidad de los campos;
- observabilidad.

Preguntas habituales:

- ¿Qué endpoint falla?
- ¿Qué código de respuesta es más frecuente?
- ¿La aplicación registra el contexto necesario?
- ¿Existe información de latencia?
- ¿Qué campos deberían añadirse al dataset?

---

# 11. Limitaciones del curso

El curso utiliza una instancia mononodo y un dataset de laboratorio. Por tanto,
no cubre en profundidad:

- indexer clusters;
- search head clusters;
- replicación;
- balanceo de carga;
- despliegues multisede;
- arquitectura de alta disponibilidad;
- Splunk Cloud;
- Splunk Enterprise Security;
- administración avanzada de licencias;
- despliegues con miles de fuentes;
- gestión avanzada de certificados;
- integración completa con herramientas externas;
- respuesta automatizada ante incidentes.

Sí proporciona una base sólida para continuar con esos contenidos.

---

# 12. Recomendaciones para aprovechar las prácticas

## Antes de ejecutar una búsqueda

1. Identifica el índice.
2. Identifica el periodo temporal.
3. Comprueba los campos.
4. Formula la pregunta.
5. Empieza con una consulta sencilla.

## Mientras construyes la búsqueda

1. Añade un filtro cada vez.
2. Revisa los resultados intermedios.
3. Comprueba los nombres de los campos.
4. Convierte los tipos cuando sea necesario.
5. Limita los resultados durante la exploración.

## Antes de guardar el resultado

1. Ejecuta la consulta con el rango correcto.
2. Revisa el resultado en forma de tabla.
3. Comprueba la interpretación.
4. Documenta las limitaciones.
5. Prueba la consulta con el usuario previsto.
6. Guarda una descripción clara.

---

# 13. Preparación individual

Antes de la primera sesión, cada asistente debería poder responder:

- ¿Dónde está instalado Splunk?
- ¿Qué versión está instalada?
- ¿Cómo compruebo el estado de `Splunkd`?
- ¿Cómo accedo a Splunk Web?
- ¿Qué puerto utiliza Splunk Web?
- ¿Qué índice se utilizará?
- ¿Dónde está el dataset?
- ¿Qué usuario utilizaré?
- ¿Tengo permisos de Ubuntu o solo de Splunk?
- ¿Qué hago si no aparecen eventos?

Si alguna respuesta no está clara, debe resolverse durante la preparación del
laboratorio y no durante la construcción del dashboard final.

---

# 14. Autoevaluación inicial

Marca cada afirmación como:

- **Sí**: puedo hacerlo sin ayuda;
- **Parcialmente**: necesito una explicación;
- **No**: todavía no lo sé hacer.

| Competencia | Sí | Parcialmente | No |
|---|:---:|:---:|:---:|
| Acceder a Splunk Web | [ ] | [ ] | [ ] |
| Consultar la versión | [ ] | [ ] | [ ] |
| Revisar el estado del servicio | [ ] | [ ] | [ ] |
| Explicar qué es un índice | [ ] | [ ] | [ ] |
| Explicar qué es un evento | [ ] | [ ] | [ ] |
| Buscar por índice | [ ] | [ ] | [ ] |
| Utilizar un rango temporal | [ ] | [ ] | [ ] |
| Utilizar `stats` | [ ] | [ ] | [ ] |
| Utilizar `timechart` | [ ] | [ ] | [ ] |
| Crear un dashboard | [ ] | [ ] | [ ] |
| Configurar una alerta | [ ] | [ ] | [ ] |
| Diagnosticar datos ausentes | [ ] | [ ] | [ ] |
| Diferenciar `admin` de `sudo` | [ ] | [ ] | [ ] |

Esta autoevaluación no es un examen. Sirve para identificar qué aspectos
necesitan más atención.

---

# 15. Evidencias de aprendizaje

Durante el curso, el participante deberá conservar:

## Entorno

- [ ] versión de Splunk;
- [ ] versión de Ubuntu;
- [ ] estado del servicio;
- [ ] prueba de Splunk Web;
- [ ] puertos;
- [ ] recursos básicos.

## Datos

- [ ] índice `curso`;
- [ ] entrada de datos;
- [ ] `source`;
- [ ] `sourcetype`;
- [ ] `host`;
- [ ] número de eventos;
- [ ] primer y último timestamp;
- [ ] campos disponibles;
- [ ] muestra de `_raw`.

## Análisis

- [ ] búsqueda total;
- [ ] búsqueda por código HTTP;
- [ ] errores por URI;
- [ ] estadísticas por host;
- [ ] serie temporal;
- [ ] porcentaje de error;
- [ ] interpretación de resultados.

## Objetos

- [ ] búsqueda guardada;
- [ ] reporte;
- [ ] visualización;
- [ ] dashboard;
- [ ] filtro;
- [ ] alerta;
- [ ] permisos;
- [ ] prueba con el usuario correspondiente.

---

# 16. Relación con las secciones del curso

Los destinatarios utilizarán especialmente estos documentos:

- [Presentación](presentacion.md)
- [Objetivos](objetivos.md)
- [Agenda](agenda.md)
- [Preparación del laboratorio](../preparacion/index.md)
- [Arquitectura y componentes](../preparacion/arquitectura.md)
- [Datos del laboratorio](../preparacion/datos-laboratorio.md)
- [Introducción a Splunk](../sesion-1/01-introduccion.md)
- [Ingesta de datos](../sesion-1/04-ingesta-datos.md)
- [Gestión de índices](../sesion-1/05-indices.md)
- [Introducción a SPL](../sesion-2/01-introduccion-spl.md)
- [Estadísticas](../sesion-2/06-estadisticas.md)
- [Dashboards](../sesion-3/04-dashboards.md)
- [Alertas](../sesion-3/06-alertas.md)
- [Administración y seguridad](../sesion-3/07-seguridad.md)
- [Proyecto final](../proyecto/index.md)
- [Solución de problemas](../troubleshooting/index.md)

---

# 17. Referencias oficiales

## Splunk Enterprise

- [Documentación de Splunk Enterprise](https://docs.splunk.com/Documentation/Splunk)
- [Splunk Enterprise Help](https://help.splunk.com/en/splunk-enterprise)
- [Notas de versión](https://docs.splunk.com/Documentation/Splunk/latest/ReleaseNotes)

## Datos, fuentes e índices

- [Cómo procesa Splunk los datos](https://docs.splunk.com/Documentation/Splunk/latest/Data/HowSplunkprocessesdata)
- [Introducción a las fuentes de datos](https://docs.splunk.com/Documentation/Splunk/latest/Data/Whatissource)
- [Monitorización de archivos y directorios](https://docs.splunk.com/Documentation/Splunk/latest/Data/Monitorfilesanddirectories)
- [Índices](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexes)
- [Referencia de `inputs.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Inputsconf)
- [Referencia de `indexes.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Indexesconf)
- [Referencia de `props.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Propsconf)

## SPL

- [Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/WhatsInThisManual)
- [Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Overview)
- [`stats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Stats)
- [`timechart`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart)
- [`eval`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Eval)
- [`rex`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Rex)
- [`fieldsummary`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Fieldsummary)
- [Modificadores temporales](https://docs.splunk.com/Documentation/Splunk/latest/Search/Specifytimemodifiersinyoursearch)

## Dashboards y alertas

- [Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/AboutDashboards)
- [Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/IntroFrame)
- [Visualizaciones](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)
- [Alertas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Throttling de alertas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/ThrottleAlerts)

## Seguridad y permisos

- [Usuarios y roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Roles y capacidades](https://docs.splunk.com/Documentation/Splunk/latest/Security/Rolesandcapabilities)
- [Objetos de conocimiento](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)

## Ubuntu

- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)
- [Systemd en Ubuntu](https://documentation.ubuntu.com/server/explanation/systemd/)
- [Firewall en Ubuntu](https://documentation.ubuntu.com/server/how-to/security/firewalls/)

---

# 18. Perfil de salida

Al finalizar el curso, el asistente podrá trabajar con una instancia básica de
Splunk Enterprise y será capaz de:

- validar el estado de la plataforma;
- comprender el modelo de datos;
- localizar eventos;
- analizar campos;
- crear búsquedas SPL;
- interpretar resultados;
- crear reportes;
- construir dashboards;
- configurar alertas;
- revisar permisos;
- diagnosticar problemas habituales;
- documentar limitaciones;
- presentar una solución de monitorización reproducible.

El resultado esperado no es únicamente conocer la interfaz de Splunk. El
participante debe poder explicar el recorrido completo desde el dato original
hasta la decisión operativa.

```text
Dato original
    ↓
Evento indexado
    ↓
Campo validado
    ↓
Búsqueda reproducible
    ↓
Métrica interpretada
    ↓
Visualización
    ↓
Alerta o acción
```
```

## Nota importante sobre permisos

En el documento se mantiene la distinción entre:

```text
admin en Splunk
```

y:

```text
sudo en Ubuntu
```

Esto evitará que los asistentes interpreten que un rol administrativo dentro de
Splunk permite automáticamente ejecutar comandos del sistema operativo.