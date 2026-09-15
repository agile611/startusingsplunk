# Datos del laboratorio

Los datos del laboratorio están preparados para practicar la ingesta, la
extracción de campos, las estadísticas, las visualizaciones y las alertas sin
utilizar información sensible de producción. Se cargan en la instancia local
de **Splunk Enterprise 10.4.3** y se consultan principalmente desde el índice
`curso`.

## Tipos de datos

- **Logs web:** solicitudes, métodos HTTP, rutas, códigos de respuesta y
  direcciones IP.
- **Eventos de acceso:** inicios de sesión, usuarios, resultados y marcas de
  tiempo.
- **Errores de aplicación:** excepciones, niveles de severidad y mensajes.
- **Datos de seguridad:** actividad sospechosa, bloqueos y eventos de control.

## Archivos disponibles

El repositorio incluye un CSV para las prácticas:

- [Eventos web](../downloads/eventos_web.csv): dataset que se cargará durante la
  práctica de ingesta.
- [Consultas SPL](../downloads/consultas-spl.txt): ejemplos y plantillas de
  búsquedas para reutilizar durante las sesiones.

Los archivos están dentro de `docs/downloads/`, por lo que también se pueden
descargar desde el sitio generado por MkDocs.

## Destino de los datos

El índice recomendado para los ejercicios es `curso`:

```spl
index=curso
```

Antes de cargar un archivo, confirma el índice de destino y evita importar el
mismo dataset repetidamente. La creación y configuración del índice se explica
en [Gestión de índices](../sesion-1/07-indices.md).

## Flujo de trabajo

1. Revisa el archivo y su formato.
2. Configura la entrada desde Splunk Web.
3. Selecciona el índice `curso`.
4. Comprueba el `sourcetype`, el `host` y el timestamp.
5. Ejecuta una búsqueda de validación.
6. Continúa con las estadísticas y visualizaciones.

La guía práctica de carga se encuentra en [Ingesta de datos](../sesion-1/06-ingesta-datos.md).

## Búsquedas iniciales

Después de ingerir los datos, utiliza búsquedas pequeñas para validar el
resultado:

```spl
index=curso
```

```spl
index=curso
| stats count by sourcetype
```

```spl
index=curso
| stats count by host source
```

Si no aparecen eventos, revisa primero el intervalo temporal, el índice, los
permisos y la entrada configurada. La página [Los datos no aparecen](../troubleshooting/datos-no-aparecen.md)
recoge las comprobaciones de diagnóstico.

## Buenas prácticas

- Conserva una copia de los archivos originales.
- No modifiques el CSV antes de comprobar cómo se importa.
- Documenta el índice, `sourcetype` y rango temporal utilizado.
- Evita cargar datos sensibles en el laboratorio.
- No borres manualmente los archivos internos de `/opt/splunk`.
- Usa los mismos datos y nombres de campos en las prácticas para que los
  resultados sean comparables.
