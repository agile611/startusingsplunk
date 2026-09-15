# Arquitectura del laboratorio

El laboratorio utiliza una arquitectura **mononodo** para que todas las
prácticas puedan realizarse en una única máquina con **Ubuntu 24.04.5 LTS**.
Sobre ella se instala manualmente **Splunk Enterprise 10.4.3**, que reúne las
funciones necesarias para recibir, indexar, buscar y presentar los datos.

Esta topología no representa un despliegue de producción completo, pero permite
aprender el mismo flujo de datos sin añadir la complejidad de varios servidores.

## Componentes principales

- **Splunk Enterprise:** servicio principal instalado en `/opt/splunk`.
- **Splunk Web:** interfaz de usuario disponible en el puerto `8000`.
- **Indexer:** procesa, indexa y almacena los eventos.
- **Search head:** coordina las búsquedas y presenta los resultados. En este
  laboratorio se ejecuta en la misma instancia.
- **Fuentes de datos:** archivos CSV y otros datos preparados para las
  prácticas.
- **Índice `curso`:** destino lógico de los eventos del laboratorio.
- **`splunkd`:** servicio interno que gestiona la administración, la ingesta y
  otras funciones de Splunk.

No es necesario instalar un Universal Forwarder para seguir el itinerario
principal. Solo se utilizaría si se quisiera simular la recopilación desde otra
máquina. En ese caso, el puerto habitual de recepción sería `9997`.

## Flujo de datos

```text
Archivo o fuente de prueba
|
v
Entrada de Splunk y parsing
|
v
Índice curso
|
v
Búsqueda SPL en Splunk Web
|
v
Tabla, visualización, dashboard o alerta
```

El flujo completo se practica en [Ingesta de datos](../sesion-1/06-ingesta-datos.md)
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
`index=curso`.

## Relación con la instalación

La topología se crea mediante la [guía de instalación manual en
Ubuntu](../sesion-1/04-instalacion-ubuntu.md). Al finalizar esa guía deben
cumplirse estas condiciones:

- La versión mostrada por `splunk version` es 10.4.3.
- `splunk status` indica que el servicio está ejecutándose.
- Splunk Web responde en `http://localhost:8000`.
- La cuenta administrativa local permite iniciar sesión.
- El arranque automático queda configurado para los reinicios del laboratorio.

## Arquitectura distribuida como referencia

En un entorno mayor, las responsabilidades pueden separarse:

```text
Fuentes -> Universal Forwarders -> Indexers -> Search Heads -> Usuarios
```

El curso presenta estos componentes conceptualmente en [Arquitectura y
componentes](../sesion-1/03-arquitectura.md), pero las prácticas se ejecutan en
el nodo único descrito aquí.
