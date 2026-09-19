# 7. Seguridad

La seguridad en Splunk controla quién puede iniciar sesión, qué datos puede
buscar, qué objetos puede utilizar y qué acciones puede ejecutar. No se limita
a ocultar un panel: debe aplicarse en roles, índices, aplicaciones, objetos de
conocimiento y canales de notificación.

Tener una cuenta `admin` facilita las prácticas del curso, pero no significa
que todos los asistentes deban trabajar con ese rol. En un entorno real se
aplica el principio de mínimo privilegio: cada usuario recibe solo el acceso
necesario para su responsabilidad.

## Las capas que debes proteger

En una instalación de Splunk conviene revisar estas capas:

1. **Autenticación**: quién puede iniciar sesión.
2. **Roles**: qué capacidades tiene cada usuario.
3. **Índices**: qué datos puede buscar cada rol.
4. **Aplicaciones**: qué objetos y configuraciones puede utilizar.
5. **Objetos de conocimiento**: búsquedas, reportes, dashboards, lookups y
	extracciones.
6. **Acciones**: correos, webhooks, scripts o respuestas automáticas.
7. **Auditoría**: qué actividad debe quedar registrada y revisarse.

Un usuario puede tener acceso a Splunk Web y aun así no poder buscar el índice
`curso`. Del mismo modo, puede ver un dashboard pero no modificar su búsqueda.

## Usuarios y roles

Un usuario recibe capacidades a través de uno o más roles. El rol determina,
entre otros aspectos:

- índices permitidos y excluidos;
- capacidades administrativas;
- acceso a aplicaciones;
- posibilidad de crear o compartir objetos;
- límites de búsqueda y recursos disponibles.

Desde Splunk Web, revisa **Settings > Access controls > Users** y **Settings >
Access controls > Roles**. En una práctica puedes utilizar `admin`, pero para
probar un dashboard o una alerta debes crear o utilizar un rol con permisos
similares al usuario final.

No concedas capacidades administrativas para resolver un problema de búsqueda.
Primero comprueba si el problema es el índice, el objeto compartido, la
aplicación o el rango temporal.

## Acceso a índices

Un rol puede permitir o denegar búsquedas en determinados índices. Para el
laboratorio, el acceso esperado es al índice `curso`:

```spl
index=curso
| stats count by host, sourcetype
```

Si un usuario no obtiene resultados, compara la búsqueda con la cuenta de
administración y revisa:

1. que el índice exista;
2. que el rol incluya `curso` en sus índices permitidos;
3. que no exista una exclusión más específica;
4. que el tiempo seleccionado incluya los eventos;
5. que el objeto se haya compartido en la aplicación correcta.

No uses `index=*` como prueba habitual: puede revelar la existencia de fuentes
que el usuario no necesita conocer y dificulta identificar el permiso concreto
que falta.

## Objetos de conocimiento

Los objetos creados durante la sesión también tienen propietario, aplicación y
permisos:

- búsquedas guardadas;
- reportes;
- dashboards;
- alertas;
- lookups;
- extracciones de campos;
- eventos, macros y otros recursos reutilizables.

Un objeto privado puede funcionar para su creador y no para los asistentes. Un
objeto compartido con demasiada amplitud puede exponer datos o permitir cambios
no deseados.

Desde **Settings > Knowledge** o desde la gestión específica de búsquedas,
reportes y alertas, revisa:

- propietario;
- aplicación;
- lectura;
- escritura;
- eliminación;
- dependencias de otros objetos.

Antes de publicar un objeto, pruébalo con el rol que lo utilizará y no solo con
`admin`.

## Compartir de forma segura

Usa este criterio:

| Necesidad | Alcance recomendado |
|---|---|
| Prueba personal | Privado para el creador. |
| Ejercicio de una aplicación | Compartido dentro de la aplicación. |
| Uso por un equipo concreto | Acceso para el rol o grupo correspondiente. |
| Objeto común y no sensible | Compartido ampliamente, tras validación. |

No concedas escritura a todos los usuarios si solo necesitan consultar. La
capacidad de editar una alerta o un dashboard puede cambiar notificaciones,
consultas y exposición de datos.

## Seguridad de dashboards, tokens y alertas

Los tokens filtran la interfaz, pero no sustituyen los permisos. Un usuario no
debe obtener acceso a un índice sensible escribiendo otro valor en un control.

Las alertas requieren atención adicional porque pueden:

- enviar datos por correo;
- llamar a sistemas externos;
- ejecutar acciones con efectos operativos;
- revelar nombres de hosts, URI o errores internos.

Antes de publicar una alerta revisa destinatarios, acciones, credenciales,
throttling y el contexto de ejecución. Envía el mínimo contexto necesario y
evita incluir `_raw` completo si puede contener información sensible.

## Auditoría y revisión de actividad

Splunk dispone de datos internos y de auditoría que ayudan a revisar actividad.
Por ejemplo, puedes empezar explorando eventos de auditoría:

```spl
index=_audit
| table _time user action info search savedsearch_name
| sort - _time
| head 50
```

Los campos concretos dependen de la versión y del tipo de evento. Usa esta
consulta como punto de exploración y revisa los eventos reales antes de crear
un informe de auditoría.

También conviene revisar periódicamente:

- inicios de sesión fallidos y exitosos;
- cambios de roles y permisos;
- creación o modificación de alertas;
- cambios en objetos compartidos;
- consultas anómalas o de alto coste;
- acciones externas ejecutadas por alertas.

La auditoría no sustituye una política de acceso: sirve para detectar y
reconstruir actividad, no para conceder permisos.

## Protección de credenciales y datos sensibles

No incluyas contraseñas, tokens, claves API ni secretos directamente en SPL,
descripciones, nombres de dashboards o correos de alerta. Revisa también:

- campos personales o identificadores de usuarios;
- direcciones internas y nombres de hosts;
- datos enviados a lookups o exportaciones;
- destinatarios de informes y alertas;
- permisos de archivos utilizados por entradas o scripts.

Si una integración necesita credenciales, utiliza el mecanismo de secretos y la
configuración aprobada por la plataforma. No pegues secretos en una búsqueda
para hacer una prueba rápida.

## Checklist para un administrador

Antes de dar por terminado un objeto o una práctica, comprueba:

- el usuario tiene el rol apropiado;
- el rol puede buscar solo los índices necesarios;
- el objeto está en la aplicación correcta;
- los permisos de lectura y escritura son intencionados;
- los dashboards no exponen campos innecesarios;
- las alertas solo notifican a destinatarios autorizados;
- los tokens no se usan como autorización;
- la consulta funciona con el rol final;
- las acciones externas están documentadas;
- la actividad relevante puede auditarse.

## Procedimiento de diagnóstico

Cuando un usuario dice “no veo datos” o “no puedo editar el dashboard”:

1. Reproduce el problema con el mismo usuario y aplicación.
2. Ejecuta una búsqueda mínima sobre el índice esperado.
3. Revisa el rango temporal y `_time`.
4. Comprueba los índices permitidos por el rol.
5. Revisa propietario y permisos del objeto.
6. Comprueba dependencias, tokens, lookups y extracciones.
7. Revisa eventos de auditoría si el cambio o acceso debería estar registrado.
8. Corrige la capa responsable y vuelve a probar con el rol final.

No concedas `admin` como solución general. Elevar permisos puede ocultar la
causa y crear un riesgo mayor.

## Errores habituales

| Síntoma | Causa posible | Comprobación |
|---|---|---|
| Admin ve datos y otro usuario no | Índice no permitido o rango distinto. | Comparar rol, índice y tiempo. |
| Puede ver pero no editar | Falta permiso de escritura del objeto. | Revisar propietario y aplicación. |
| Dashboard vacío tras compartirlo | Objeto o dependencia privada. | Probar búsquedas y lookups con el rol final. |
| Token muestra datos no autorizados | Se confundió filtro con autorización. | Revisar roles e índices permitidos. |
| Alerta envía información sensible | Acción o destinatarios demasiado amplios. | Revisar contenido y permisos. |
| No se puede reconstruir un cambio | Auditoría insuficiente o no revisada. | Consultar `_audit` y documentar cambios. |
| Se concede `admin` para resolverlo | Diagnóstico incompleto. | Revisar primero la capa exacta del permiso. |

## Buenas prácticas

- Aplica mínimo privilegio.
- Separa administración, búsqueda, edición y publicación.
- Comparte objetos por rol y aplicación, no por comodidad.
- Revisa índices permitidos y excluidos.
- Prueba con el rol real del usuario final.
- No uses tokens como mecanismo de seguridad.
- Protege secretos y limita exportaciones.
- Audita cambios y acciones relevantes.
- Retira usuarios, objetos y permisos obsoletos.
- Documenta quién es responsable de cada alerta y dashboard.

## Referencias oficiales

- [Control de acceso y usuarios](https://docs.splunk.com/Documentation/Splunk/latest/Security/Configureusers)
- [Roles y capacidades](https://docs.splunk.com/Documentation/Splunk/latest/Security/Rolesandcapabilities)
- [Permisos de objetos de conocimiento](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Knowledgeobjectpermissions)
- [Seguridad de búsquedas](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)
- [Índice de auditoría](https://docs.splunk.com/Documentation/Splunk/latest/Security/Auditindex)
- [Seguridad de dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/ShareDashboards)
- [Modelo de seguridad de Splunk](https://docs.splunk.com/Documentation/Splunk/latest/Security/AboutSplunksecurity)
revisión segura de dashboards, reportes y alertas.
