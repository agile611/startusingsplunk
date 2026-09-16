# Sesión 3: reportes, dashboards y alertas

En esta sesión convertiremos las búsquedas SPL en componentes de
monitorización reutilizables.

El enfoque está pensado para asistentes que ya tienen **Splunk Enterprise**
instalado y acceso administrativo. Aprenderás a pasar de una consulta validada
a un objeto que otros usuarios puedan consultar, filtrar, recibir o revisar de
forma segura.

El flujo de trabajo es:

```text
Búsqueda validada -> reporte o visualización -> dashboard -> filtro -> alerta -> revisión
```

Tener permisos de `admin` facilita la práctica, pero no sustituye la validación
con el rol final. Un dashboard o una alerta puede funcionar para el
administrador y fallar para otro usuario por diferencias de índice, aplicación,
propiedad o permisos.

## Objetivos

- Guardar y compartir búsquedas.
- Crear reportes.
- Diseñar visualizaciones.
- Construir dashboards.
- Añadir filtros mediante tokens.
- Configurar alertas.
- Aplicar permisos básicos.
- Validar rendimiento, estados vacíos y dependencias.
- Documentar y mantener objetos de conocimiento.

## Antes de empezar

Comprueba que:

- Splunk Enterprise está iniciado y Splunk Web responde.
- El índice `curso` existe y contiene eventos.
- El archivo `eventos_web.csv` se ha ingerido correctamente.
- Los campos `host`, `method`, `status` y `uri` están disponibles.
- Puedes seleccionar un intervalo que incluya el 1 de enero de 2026.

Consulta un evento antes de crear objetos reutilizables:

```spl
index=curso
| table _time _indextime host source sourcetype method status uri _raw
| head 20
```

Si no hay resultados, revisa [Gestión del tiempo](../sesion-2/03-gestion-tiempo.md),
el índice, la ingesta y los permisos. No construyas un dashboard sobre datos
que todavía no has validado.

## Contenidos

1. [Búsquedas guardadas](01-busquedas-guardadas.md)
2. [Reportes](02-reportes.md)
3. [Visualizaciones](03-visualizaciones.md)
4. [Dashboards](04-dashboards.md)
5. [Filtros y tokens](05-filtros-tokens.md)
6. [Alertas](06-alertas.md)
7. [Administración y seguridad](07-seguridad.md)
8. [Laboratorios](08-laboratorios.md)
9. [Repaso](09-repaso.md)

## Dashboard que construiremos

El dashboard **Monitorización de aplicación web** contendrá:

- Total de peticiones.
- Total y porcentaje de errores.
- Peticiones por minuto.
- Distribución de códigos HTTP.
- Hosts y URI con más errores.
- Tabla de eventos críticos.

El dataset mínimo del curso contiene `timestamp`, `host`, `method`, `status` y
`uri`. No contiene necesariamente `client_ip` ni duración de respuesta; por
eso los paneles de IP, latencia o URL más lentas requieren una fuente ampliada.
Documenta esa limitación en lugar de inventar una métrica.

## Ruta recomendada

1. [Búsquedas guardadas](01-busquedas-guardadas.md): reutilizar y compartir SPL.
2. [Reportes](02-reportes.md): programar y comunicar resultados.
3. [Visualizaciones](03-visualizaciones.md): elegir la representación adecuada.
4. [Dashboards](04-dashboards.md): organizar paneles operativos.
5. [Filtros y tokens](05-filtros-tokens.md): hacer la vista interactiva.
6. [Alertas](06-alertas.md): detectar condiciones accionables.
7. [Administración y seguridad](07-seguridad.md): controlar acceso y auditoría.
8. [Laboratorios](08-laboratorios.md): construir y probar la solución.
9. [Repaso](09-repaso.md): comprobar que puedes defender las decisiones.

## Producto final de la sesión

Al terminar deberías tener:

- una búsqueda guardada con índice, tiempo y descripción;
- al menos un reporte con salida validada;
- un dashboard con resumen, evolución, distribución y detalle;
- un filtro temporal y, si procede, un filtro de host o estado;
- una alerta probada con casos de disparo y no disparo;
- permisos revisados para un usuario no administrador;
- una comprobación de rendimiento con Job Inspector;
- documentación de resultados, limitaciones y dependencias.

## Checklist de calidad

- [ ] Los paneles responden a preguntas operativas concretas.
- [ ] Las búsquedas indican índice y tiempo.
- [ ] Los tokens tienen valores iniciales y estados vacíos definidos.
- [ ] La alerta tiene condición, ventana, frecuencia y responsable.
- [ ] Los objetos están publicados en la aplicación correcta.
- [ ] Los permisos se han probado con el rol final.
- [ ] No se exponen campos sensibles innecesarios.
- [ ] El rendimiento es razonable para la frecuencia de uso.
- [ ] Las conclusiones respetan las limitaciones del dataset.

## Resultado esperado

Al finalizar la sesión tendrás un dashboard funcional y una alerta para
detectar errores HTTP del servidor. También podrás explicar cómo se construyó
cada componente, quién puede utilizarlo, qué datos analiza y qué pasos seguir
si deja de mostrar resultados.

## Referencias oficiales

- [Objetos de conocimiento](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Aboutknowledgeobjects)
- [Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/AboutDashboards)
- [Tokens](https://docs.splunk.com/Documentation/Splunk/latest/Viz/tokens)
- [Alertas](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Roles y capacidades](https://docs.splunk.com/Documentation/Splunk/latest/Security/Rolesandcapabilities)
- [Job Inspector](https://docs.splunk.com/Documentation/Splunk/latest/Search/JobInspector)
- [Buenas prácticas de búsquedas](https://docs.splunk.com/Documentation/Splunk/latest/Search/Writebetterqueries)
