# Arquitectura del laboratorio

El laboratorio utiliza una arquitectura **mononodo** para que todas las
prácticas puedan realizarse en una única máquina con **Ubuntu 24.04.5 LTS**.
Sobre ella se instala manualmente **Splunk Enterprise 10.4.3**, que reúne las
funciones necesarias para recibir, indexar, buscar y presentar los datos.

Esta topología no representa un despliegue de producción completo, pero es una
forma muy eficiente de aprender el flujo real de información: cómo entra un
evento, cómo se valida, cómo se indexa y cómo termina apareciendo en una
consulta o un dashboard. Reduce la complejidad operativa sin sacrificar la
lógica fundamental del producto.

La clave es entender que Splunk no solo "ve archivos". En realidad, recibe
fuentes de datos, interpreta el formato, los normaliza, los almacena en un
índice y luego permite consultarlos con SPL. Aunque todo esto ocurra en la
misma máquina, la arquitectura conceptual sigue siendo válida para entornos
mucho más grandes.

## Objetivo de la topología

La decisión de usar una instancia mononodo responde a tres motivos didácticos y
prácticos:

- mantener la instalación sencilla y reproducible,
- evitar errores de red y certificados que distraen del aprendizaje,
- permitir que el alumno entienda todos los pasos del ciclo de datos.

La máquina del laboratorio actúa como si fuera a la vez:

- una fuente de datos de prueba,
- un indexer que almacena eventos,
- un search head que ejecuta búsquedas,
- un servidor de Splunk Web para la interfaz.

Eso no significa que no existan roles internos. Solo significa que, por
práctica, todo está concentrado en un único nodo.

## Componentes principales

- **Splunk Enterprise:** servicio principal instalado en `/opt/splunk`.
- **Splunk Web:** interfaz de usuario disponible en el puerto `8000`.
- **Indexer:** procesa, indexa y almacena los eventos.
- **Search head:** coordina las búsquedas y presenta los resultados. En este
  laboratorio se ejecuta en la misma instancia que el indexer.
- **Fuentes de datos:** archivos CSV, logs y otros archivos preparados para las
  prácticas.
- **Índice `curso`:** destino principal de los eventos del laboratorio.
- **`splunkd`:** servicio interno que gestiona la administración, la ingesta y
  otras funciones de Splunk.

No es necesario instalar un Universal Forwarder para seguir el itinerario
principal. Solo se utilizaría si se quisiera simular la recopilación desde otra
máquina. En ese caso, el puerto habitual de recepción sería `9997`.

Un forwarder no aporta valor didáctico en una práctica básica si la intención es
aprender el flujo local completo; su uso se reserva a escenarios donde queremos
separar la recopilación en varios servidores.

## Cómo se ve el flujo real en este laboratorio

En la práctica, la secuencia suele ser la siguiente:

```text
Fuente de datos (CSV, log o archivo preparado)
        |
        v
Entrada configurada en Splunk
        |
        v
Parsing y extracción de campos
        |
        v
Asignación de timestamp, host, source y sourcetype
        |
        v
Índice `curso`
        |
        v
Consulta SPL en Splunk Web
        |
        v
Resultado, tabla, gráfico, dashboard o alerta
```

Este flujo puede dividirse también en diagnósticos prácticos:

- ¿La fuente existe y genera datos?
- ¿Splunk está leyendo la entrada correcta?
- ¿El evento está bien parseado y con timestamp válido?
- ¿Está almacenado en el índice `curso`?
- ¿La búsqueda tiene el intervalo temporal correcto?
- ¿El usuario ve el resultado con permisos adecuados?

Esta forma de pensar es especialmente útil cuando un evento no aparece y la
respuesta no es “reinstalar Splunk”, sino comprobar la etapa exacta donde falla.

El flujo completo se practica en [Ingesta de datos](../sesion-1/04-ingesta-datos.md)
y se consulta con las técnicas de [Búsquedas básicas](../sesion-2/02-busquedas-basicas.md).

## Puertos

| Puerto | Componente | Función |
|---:|---|---|
| 8000 | Splunk Web | Acceso desde el navegador. |
| 8089 | `splunkd` | API y administración interna. |
| 9997 | Entrada TCP | Recepción opcional desde un Universal Forwarder. |

Comprueba los puertos activos con:

```bash
sudo ss -ltnp | grep -E ':8000|:8089|:9997'
```

Un puerto abierto solo demuestra que existe un servicio escuchando. Para
validar la ingesta también hay que comprobar que los eventos aparecen en
`index=curso` y que la búsqueda devuelve resultados esperados.

## Relación con la instalación

La topología se crea mediante la [guía de instalación manual en
Ubuntu](instalar-splunk.md). Al finalizar esa guía deben cumplirse estas
condiciones:

- La versión mostrada por `splunk version` es 10.4.3.
- `splunk status` indica que el servicio está ejecutándose.
- Splunk Web responde en `http://localhost:8000`.
- La cuenta administrativa local permite iniciar sesión.
- El arranque automático queda configurado para los reinicios del laboratorio.
- Los datos de práctica pueden cargarse y consultarse correctamente en el
  índice `curso`.

## Comprender la arquitectura sin perder el foco

Aunque la máquina del laboratorio actúa como un entorno mononodo, el alumno debe
pensar en términos de roles funcionales, no solo de una sola máquina física. En
la práctica, cada tarea tiene un sentido claro:

- la fuente produce datos,
- la entrada los recibe,
- el indexer los procesa y almacena,
- el search head los consulta,
- Splunk Web los presenta al usuario.

Esto ayuda a trasladar el conocimiento a entornos reales con varios servidores,
certificados y nodos especializados.

## Arquitectura distribuida como referencia

En un entorno mayor, las responsabilidades pueden separarse:

```text
Fuentes -> Universal Forwarders -> Indexers -> Search Heads -> Usuarios
```

En una infraestructura real, el número de fuentes, usuarios y volumen de datos
hace que sea razonable repartir estas responsabilidades. En ese caso se añade
complejidad en:

- seguridad y certificados,
- sincronización entre nodos,
- manejo de licencias,
- mantenimiento de permisos,
- monitorización y escalado.

El curso presenta estos componentes conceptualmente en [Arquitectura y
componentes](arquitectura.md), pero las prácticas se ejecutan en el nodo único
descrito aquí para mantener el aprendizaje práctico y enfocarlo en Splunk.

## Referencias útiles

Para ampliar la teoría y contrastar la práctica del curso, estas son
referencias oficiales de Splunk:

- Documentación de Splunk sobre indexers:
  https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutindexers
- Documentación sobre search heads:
  https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutsearchheads
- Documentación sobre forwarders:
  https://docs.splunk.com/Documentation/Splunk/latest/Forwarding/Aboutforwarding
- Visión general de configuración:
  https://docs.splunk.com/Documentation/Splunk/latest/Admin/Configurationoverview
- Guía de administración general:
  https://docs.splunk.com/Documentation/Splunk/latest/Admin/Welcome-to-Admin

También es útil relacionar este documento con el resto del curso:

- [Ingesta de datos](../sesion-1/04-ingesta-datos.md)
- [Búsquedas básicas](../sesion-2/02-busquedas-basicas.md)
- [Arquitectura y componentes](arquitectura.md)
- [Instalar Splunk en Ubuntu](instalar-splunk.md)

## Resumen

La arquitectura del laboratorio tiene una finalidad clara: ofrecer un entorno
realista pero simple para aprender Splunk. La máquina realiza todas las tareas
principales, pero conceptualmente sigue a un modelo con source, input,
processing, indexación, búsqueda y presentación. Eso permite al alumno entender
la lógica del producto sin perderse en una topología de producción que sería
más compleja de desplegar y mantener.

Es decir, aunque el laboratorio sea mononodo, el conocimiento transferible es el
mismo que se usa en despliegues distribuidos mayores: los datos fluyen desde
la fuente hasta el índice, y desde allí hasta la consulta y la visualización.
