# 5. Filtros y tokens

Los filtros permiten limitar los datos que ve el usuario. Los tokens son
valores dinámicos que conectan controles del dashboard con búsquedas y paneles.
Gracias a ellos, una persona puede seleccionar un periodo, un host o un código
HTTP sin editar la SPL manualmente.

Un token no concede permisos adicionales. Solo cambia el valor que recibe la
consulta; el usuario sigue limitado por sus roles, aplicaciones e índices
autorizados.

## Qué problema resuelven

Sin tokens, un dashboard puede tener una búsqueda fija:

```spl
index=curso host=web-01 status>=400
| stats count as errores by uri
```

Con un token de host, la misma vista puede reutilizarse:

```spl
index=curso host=$host_token$ status>=400
| stats count as errores by uri
```

El usuario elige el host desde un control y el panel se actualiza. La consulta
debe seguir teniendo índice, tiempo y filtros válidos aunque cambien los
valores seleccionados.

## Tipos de filtros habituales

### Selector temporal

El selector temporal global permite que todos los paneles utilicen el mismo
intervalo. En una búsqueda parametrizada puedes encontrar tokens como:

```spl
index=curso earliest=$earliest$ latest=$latest$
| stats count by status
```

El nombre exacto depende del tipo y versión del dashboard. Comprueba que el
token se sustituye correctamente y que no queda vacío.

### Selector de host

```spl
index=curso host="$host_token$"
| stats count as peticiones by status
```

Define un valor inicial como `*` o una opción equivalente para representar
“todos”, según el tipo de control. No insertes `host=*` sin probar que el panel
funciona cuando no hay un host seleccionado.

### Selector de código HTTP

```spl
index=curso status=$status_token$
| stats count as peticiones by uri
```

Si el control devuelve varios códigos, la condición debe estar preparada para
una lista y no para una cadena única. Valida el formato real que genera el
control antes de compartir el dashboard.

### Texto introducido por el usuario

```spl
index=curso uri="$uri_token$"
| table _time host method status uri
```

Los controles de texto son flexibles, pero pueden introducir valores inválidos,
comillas o expresiones no previstas. Para usuarios generales, una lista
controlada suele ser más segura y fácil de usar que un texto libre.

## Crear un filtro desde Splunk Web

El flujo general es:

1. Abrir el dashboard en modo edición.
2. Añadir un control de entrada.
3. Elegir el tipo: tiempo, lista, desplegable, multiselección o texto.
4. Definir el nombre del token.
5. Establecer una etiqueta visible para el usuario.
6. Definir valores iniciales y opciones válidas.
7. Referenciar el token en las búsquedas de los paneles.
8. Guardar y probar el dashboard con varias selecciones.

El nombre técnico puede ser `host_token`, mientras que la etiqueta visible
puede ser `Host`. Mantén una convención coherente para no confundir la etiqueta
con el token que utiliza la SPL.

## Tokens de búsqueda para poblar controles

En lugar de escribir manualmente los hosts, un control puede obtener sus
opciones de una búsqueda:

```spl
index=curso
| stats count by host
| sort host
```

El resultado debe ofrecer una columna que represente el valor y, si conviene,
otra que sirva como etiqueta visible. Limita esta búsqueda al índice y al
periodo adecuados; un control que busca en todos los índices puede ser lento y
mostrar valores que el usuario no debería necesitar.

Para códigos HTTP:

```spl
index=curso
| stats count by status
| sort status
```

Comprueba que las opciones del control respetan los permisos del usuario y que
el valor “todos” está definido de forma explícita.

## Selección múltiple

Una multiselección permite comparar varios valores. La consulta debe recibir el
formato correcto, por ejemplo una condición basada en `IN` o una expansión de
valores según el tipo de dashboard:

```spl
index=curso
| search status IN ($status_token$)
| stats count by uri
```

La sintaxis concreta puede variar entre dashboards clásicos y dashboards
basados en JSON. Comprueba el valor final del token y no supongas que una lista
se sustituye igual que un único valor.

## Token de clic en un panel

Un panel puede enviar un valor seleccionado a otro panel. Un flujo típico es:

1. El usuario selecciona una URI en una tabla.
2. El dashboard establece un token con esa URI.
3. Un panel de detalle filtra los eventos con ese valor.

Consulta del panel de detalle:

```spl
index=curso uri="$uri_seleccionada$"
| table _time host method status uri
| sort - _time
| head 50
```

Define también qué ocurre cuando el usuario limpia la selección. Un token
antiguo puede seguir activo y hacer que el panel parezca mostrar datos actuales
cuando en realidad conserva un filtro anterior.

## Valores iniciales y estados vacíos

Todo token debe tener un comportamiento definido cuando:

- el dashboard se abre por primera vez;
- el usuario borra una selección;
- la búsqueda de opciones no devuelve datos;
- el valor seleccionado ya no existe;
- el usuario no tiene acceso al índice o al campo.

Prueba estos estados con una búsqueda mínima:

```spl
index=curso
| stats count as total
```

Si el total es cero, muestra un mensaje claro o una tabla vacía controlada. No
interpretes automáticamente un token vacío como `*` sin comprobar el impacto en
la consulta y en el volumen de datos.

## Seguridad y tokens

Los tokens no son un mecanismo de autorización. Un usuario no debe poder ver un
índice o un campo sensible solo porque escriba otro valor en un control.

Como administrador:

- valida los permisos de la búsqueda y del dashboard;
- evita construir SPL libre a partir de texto sin controlar;
- utiliza listas de valores cuando el conjunto sea conocido;
- no expongas campos sensibles en los resultados de los paneles;
- prueba el dashboard con roles distintos;
- revisa lookups y búsquedas auxiliares que alimenten los controles.

La seguridad debe estar en roles y permisos, no en ocultar opciones de la
interfaz.

## Rendimiento de los filtros

Cada cambio de token puede volver a ejecutar varios paneles. Para mantener una
respuesta razonable:

- filtra por índice y tiempo antes de utilizar tokens;
- limita las opciones de los controles;
- evita búsquedas auxiliares sobre `index=*`;
- no refresques todos los paneles para cada control si no es necesario;
- utiliza `head` o agregaciones para poblar listas largas;
- evita texto libre cuando una lista controlada sea suficiente;
- revisa Job Inspector con los valores más amplios.

Un dashboard rápido con un único host seleccionado puede volverse lento cuando
el usuario selecciona todos los hosts y varios meses de histórico. Prueba ambos
extremos.

## Validación práctica

Antes de publicar un filtro:

1. Abre el dashboard con los valores iniciales.
2. Selecciona un valor que exista, como `web-01`.
3. Selecciona un valor sin resultados y comprueba el estado vacío.
4. Cambia el tiempo y verifica todos los paneles.
5. Prueba limpiar la selección.
6. Prueba varias selecciones si es multiselección.
7. Comprueba que el valor llega a la SPL esperada.
8. Repite la prueba con un usuario no administrador.
9. Mide el coste de la selección más amplia.

## Errores habituales

| Síntoma | Causa posible | Comprobación |
|---|---|---|
| El panel queda vacío al abrir | Token sin valor inicial. | Definir y probar un valor por defecto. |
| El filtro no cambia el panel | Nombre del token distinto o no conectado. | Comparar nombre del control y de la SPL. |
| El valor “todos” devuelve demasiado | El comodín amplía el rango o índice. | Mantener índice y tiempo limitados. |
| La multiselección no funciona | Formato de lista incorrecto. | Inspeccionar el valor final del token. |
| El panel conserva un filtro antiguo | Token de clic no se limpia. | Configurar estado de borrado. |
| La lista tarda mucho | Búsqueda auxiliar amplia. | Agregar, limitar tiempo y revisar Job Inspector. |
| Admin ve datos y otro usuario no | Diferencias de permisos, no de token. | Probar el rol y el índice autorizado. |
| El usuario puede introducir valores peligrosos | Texto libre insertado directamente en SPL. | Usar opciones controladas y validar entradas. |

## Buenas prácticas

- Da nombres técnicos claros a los tokens.
- Usa etiquetas visibles comprensibles para el usuario.
- Define valores iniciales, valores vacíos y estados sin resultados.
- Mantén el índice y el rango temporal fuera del control del usuario siempre
	que sea posible.
- Prefiere listas controladas frente a texto libre.
- Prueba tokens con valores válidos, inexistentes y amplios.
- No confundas interacción con autorización.
- Revisa rendimiento y permisos antes de publicar.

## Referencias oficiales

- [Tokens en dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/tokens)
- [Crear controles de entrada](https://docs.splunk.com/Documentation/Splunk/latest/Viz/PanelreferenceforSimplifiedXML)
- [Dashboards y filtros](https://docs.splunk.com/Documentation/Splunk/latest/Viz/DashboardExamples)
- [Permisos de objetos de conocimiento](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Knowledgeobjectpermissions)
- [Comando `search`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Search)
- [Job Inspector](https://docs.splunk.com/Documentation/Splunk/latest/Search/JobInspector)