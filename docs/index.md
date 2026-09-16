# Curso práctico de Splunk

Bienvenido al curso de **Splunk Enterprise**, orientado al análisis,
la monitorización y la visualización de datos operativos.

El curso está pensado para trabajar sobre una instancia real de Splunk
Enterprise con acceso administrativo. Aprenderás a validar la plataforma, cargar
datos, escribir búsquedas SPL y convertirlas en objetos reutilizables para
operaciones: reportes, dashboards y alertas.

El curso tiene una duración total de **18 horas**, distribuidas en
**3 sesiones de 6 horas**.

---

## Objetivos del curso

Al finalizar la formación podrás:

- Comprender la arquitectura básica de Splunk.
- Instalar Splunk Enterprise 10.4.3 en Ubuntu 24.04.5 LTS.
- Incorporar archivos y logs.
- Crear y administrar índices.
- Realizar búsquedas mediante SPL.
- Extraer y transformar campos.
- Crear reportes y visualizaciones.
- Diseñar dashboards interactivos.
- Configurar alertas.
- Resolver problemas básicos de funcionamiento.

## Cómo trabajar en el curso

Usa siempre este flujo:

```text
Fuente -> ingesta -> índice -> tiempo -> campos -> SPL -> resultado -> acción
```

No des por correcta una métrica solo porque Splunk muestre un gráfico. Comprueba
qué eventos la forman, qué intervalo temporal utiliza, qué permisos tiene el
usuario y si los campos están extraídos correctamente.

En el laboratorio se utiliza principalmente el índice `curso`. El dataset
`eventos_web.csv` contiene `timestamp`, `host`, `method`, `status` y `uri`.
Algunas métricas del proyecto, como `client_ip` o tiempo de respuesta, requieren
una fuente ampliada si esos campos no están presentes.

## Programa

| Sesión | Contenido | Duración |
|---|---|---:|
| Sesión 1 | Fundamentos e ingestión | 6 horas |
| Sesión 2 | Búsquedas, comandos y funciones SPL | 6 horas |
| Sesión 3 | Reportes, dashboards, alertas y proyecto | 6 horas |

## Metodología

Cada sesión combina:

- Explicaciones conceptuales.
- Demostraciones del instructor.
- Laboratorios guiados.
- Ejercicios individuales.
- Retos de análisis.
- Un proyecto final.

La práctica debe ser reproducible: guarda las consultas, indica el índice y el
rango temporal, documenta el resultado y anota las limitaciones de los datos.

!!! info "Entorno del curso"
	Los laboratorios están diseñados para ejecutarse sobre una máquina
	con **Ubuntu 24.04.5 LTS** y una instancia local de **Splunk Enterprise
	10.4.3**. La descarga oficial ofrece un trial gratuito de 60 días.

## Inicio rápido

1. Completa la [preparación del laboratorio](preparacion/index.md).
2. Comprueba que Splunk Web responde en `http://localhost:8000`.
3. Confirma que el índice `curso` existe.
4. Carga `eventos_web.csv` y selecciona un intervalo que incluya el 1 de enero
   de 2026.
5. Ejecuta una búsqueda mínima:

```spl
index=curso
| stats count as total earliest(_time) as primer_evento latest(_time) as ultimo_evento
```

6. Revisa un evento y sus campos:

```spl
index=curso
| table _time _indextime host source sourcetype method status uri _raw
| head 20
```

Si no aparecen resultados, consulta [Solución de problemas](troubleshooting/index.md)
antes de añadir filtros complejos o recargar el archivo.

## Recorrido recomendado

### Sesión 1: fundamentos e ingestión

Aprenderás cómo funciona la instancia, cómo llegan los datos, cómo se asignan
los metadatos y cómo validar índices y fuentes.

### Sesión 2: búsquedas y SPL

Aprenderás a filtrar, transformar, extraer campos, generar estadísticas y
optimizar búsquedas reproducibles.

### Sesión 3: reportes, dashboards y alertas

Convertirás las búsquedas en objetos reutilizables, añadirás filtros, revisarás
permisos y crearás una alerta operativa.

### Proyecto final

Aplicarás el flujo completo a una solución de monitorización documentada, con
consultas SPL, reportes, dashboard, filtros y alerta.

## Criterios de finalización

Al terminar deberías poder:

- comprobar que Splunk está activo y accesible;
- explicar dónde están los datos y cómo se ingirieron;
- buscar en el índice correcto con un tiempo válido;
- validar `_time`, `host`, `source` y `sourcetype`;
- crear consultas SPL con filtros y estadísticas;
- diseñar un dashboard que responda preguntas operativas;
- configurar una alerta sin generar ruido innecesario;
- aplicar permisos sin conceder `admin` a todos los usuarios;
- diagnosticar problemas de acceso, ingesta, tiempo y campos;
- documentar resultados, rendimiento y limitaciones.

## Acceso rápido

- [Preparar el laboratorio](preparacion/index.md)
- [Comenzar la sesión 1](sesion-1/index.md)
- [Consultar comandos SPL](referencia/comandos-spl.md)
- [Revisar el proyecto final](proyecto/index.md)
- [Solucionar problemas](troubleshooting/index.md)

## Referencias oficiales

- [Documentación general de Splunk](https://docs.splunk.com/Documentation/Splunk)
- [Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/WhatsInThisManual)
- [Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Overview)
- [Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/AboutDashboards)
- [Alertas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Roles y capacidades](https://docs.splunk.com/Documentation/Splunk/latest/Security/Rolesandcapabilities)