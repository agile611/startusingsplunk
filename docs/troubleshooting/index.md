# Troubleshooting

Esta sección ayuda a diagnosticar problemas habituales de Splunk Enterprise sin
reinstalar ni cambiar permisos a ciegas. Está pensada para el laboratorio del
curso, pero el método también sirve como base para una operación administrada.

La regla principal es separar el síntoma de la causa:

```text
Servicio -> red -> ingesta -> índice -> tiempo -> campos -> SPL -> permisos
```

Una búsqueda vacía puede deberse a datos que no han llegado, a un rango
temporal incorrecto o a un rol sin acceso. Una página web que no abre puede
deberse al servicio, al puerto, al proxy o al certificado. Diagnostica la capa
correcta antes de aplicar cambios.

## Mapa rápido de síntomas

| Síntoma | Empieza por |
|---|---|
| Splunk no inicia o se detiene | [Splunk no inicia](splunk-no-inicia.md) |
| Splunk Web no abre | [Problemas de acceso web](acceso-web.md) |
| Splunk Web abre, pero no hay eventos | [Datos no aparecen](datos-no-aparecen.md) |
| Los eventos existen, pero los campos son incorrectos | [Campos incorrectos](campos-incorrectos.md) |
| Un usuario ve menos datos que Admin | [Datos no aparecen](datos-no-aparecen.md) y [Campos incorrectos](campos-incorrectos.md) |
| Un dashboard o alerta funciona solo para Admin | [Problemas de acceso web](acceso-web.md) y [Campos incorrectos](campos-incorrectos.md) |

## Procedimiento común

Cuando una persona informe de un problema, registra primero:

1. Qué esperaba que ocurriera.
2. Qué ocurre realmente.
3. Fecha y hora, incluida la zona horaria.
4. Usuario, rol y aplicación utilizados.
5. Índice, `source` y `sourcetype` implicados.
6. Consulta SPL exacta y selector temporal.
7. Mensaje de error completo.
8. Cambios realizados justo antes del problema.

Después sigue este orden:

1. Comprueba el servicio y su estado.
2. Comprueba el puerto o la interfaz afectada.
3. Ejecuta la prueba mínima posible.
4. Revisa índice, tiempo y permisos.
5. Inspecciona `_raw`, `source`, `sourcetype` y campos.
6. Añade filtros y comandos uno a uno.
7. Revisa logs y Job Inspector cuando corresponda.
8. Aplica un cambio pequeño y repite la prueba.

## Prueba mínima de búsqueda

Para el laboratorio, utiliza una búsqueda conocida antes de probar consultas
complejas:

```spl
index=curso
| stats count as total earliest(_time) as primer_evento latest(_time) as ultimo_evento
```

Si no devuelve resultados:

- selecciona **Todo el tiempo**;
- prueba el intervalo absoluto del CSV, del 1 de enero de 2026;
- confirma que el usuario puede leer `curso`;
- revisa la entrada y el `sourcetype`.

Si devuelve resultados, inspecciona un evento:

```spl
index=curso
| table _time _indextime host source sourcetype method status uri _raw
| head 20
```

No uses `index=*` como primera prueba. Es más lento, mezcla fuentes y puede
ocultar qué índice o permiso está causando el problema.

## Evidencias útiles

En el servidor de Ubuntu del laboratorio, recoge solo la información necesaria:

```bash
/opt/splunk/bin/splunk version
sudo -u splunk /opt/splunk/bin/splunk status
sudo ss -ltnp | grep -E ':8000|:8089'
sudo tail -n 100 /opt/splunk/var/log/splunk/splunkd.log
```

Para problemas de acceso web, añade una prueba local:

```bash
curl -I http://127.0.0.1:8000
```

Para problemas de datos, conserva la consulta mínima, el rango temporal y una
muestra de `_raw`, eliminando cualquier dato sensible antes de compartirla.

## Qué no hacer

- No reinstales Splunk ante el primer error.
- No borres `/opt/splunk` ni los índices para “empezar de cero”.
- No recargues repetidamente el mismo archivo sin comprobar duplicados.
- No concedas `admin` para resolver un problema de lectura.
- No desactives TLS o el firewall como solución permanente.
- No compartas contraseñas, claves privadas, tokens ni datos sensibles.
- No cambies `props.conf` o `transforms.conf` globalmente sin una prueba.
- No modifiques varias capas a la vez: perderás la causa del cambio.

## Criterio de resolución

Un problema está resuelto cuando:

- se ha identificado la causa raíz o una limitación documentada;
- la prueba mínima funciona con el usuario y rol previstos;
- no se han creado duplicados ni cambios de permisos innecesarios;
- la corrección se ha probado con un caso normal y uno problemático;
- los logs y la consulta de validación muestran el resultado esperado;
- queda documentado qué se cambió y cómo revertirlo si fuera necesario.

## Referencias del curso

- [Splunk no inicia](splunk-no-inicia.md)
- [Problemas de acceso web](acceso-web.md)
- [Datos no aparecen](datos-no-aparecen.md)
- [Campos incorrectos](campos-incorrectos.md)
- [Gestión de índices](../sesion-1/05-indices.md)
- [Ingesta de datos](../sesion-1/04-ingesta-datos.md)
- [Gestión del tiempo](../sesion-2/03-gestion-tiempo.md)
- [Extracción de campos](../sesion-2/08-extraccion-campos.md)

## Referencias oficiales

- [Solución de problemas de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Abouttroubleshooting)
- [Solución de problemas de datos](https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Troubleshootingyourdata)
- [Monitorización de la plataforma](https://docs.splunk.com/Documentation/Splunk/latest/Monitor/MonitoringConsole)
- [Roles y capacidades](https://docs.splunk.com/Documentation/Splunk/latest/Security/Rolesandcapabilities)
- [Índice de auditoría](https://docs.splunk.com/Documentation/Splunk/latest/Security/Auditindex)
