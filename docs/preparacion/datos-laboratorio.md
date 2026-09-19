# Datos del laboratorio

Los datos del laboratorio están preparados para practicar el ciclo completo de
trabajo en Splunk:

```text
Archivo original
    ↓
Generación o revisión del dataset
    ↓
Entrada de datos
    ↓
Evento indexado
    ↓
Metadatos
    ↓
Campos extraídos
    ↓
Búsqueda SPL
    ↓
Estadísticas
    ↓
Visualización
    ↓
Dashboard o alerta
```

El laboratorio utiliza una instancia local de **Splunk Enterprise 10.4.3** sobre
**Ubuntu 24.04.5 LTS**. Los datos se consultan principalmente desde el índice:

```text
curso
```

El objetivo no es únicamente conseguir que un archivo aparezca en Splunk. El
asistente debe comprobar que:

- los eventos se han indexado;
- el índice de destino es correcto;
- el timestamp se ha interpretado correctamente;
- `host`, `source` y `sourcetype` son coherentes;
- los campos esperados existen;
- los valores tienen el tipo adecuado;
- las búsquedas utilizan el rango temporal correcto;
- los resultados pueden reproducirse.

---

#### 1. Objetivos de aprendizaje

Al trabajar con los datasets del curso, el asistente aprenderá a:

- revisar un archivo antes de ingerirlo;
- generar datos de laboratorio de forma reproducible;
- seleccionar una estrategia de entrada;
- elegir el índice correcto;
- identificar el `sourcetype`;
- validar la extracción de campos;
- comprobar el timestamp;
- distinguir `_time` de `_indextime`;
- analizar eventos individuales;
- calcular estadísticas;
- crear series temporales;
- identificar errores;
- construir dashboards;
- configurar alertas;
- diagnosticar problemas de ingesta.

El dataset debe utilizarse como una oportunidad para comprender cómo transforma
Splunk los datos originales en información consultable.

---

#### 2. Dataset principal

El dataset principal del laboratorio es:

```text
eventos_web.csv
```

El archivo contiene eventos web simulados para practicar análisis operativo y de
seguridad.

Los campos principales son:

| Campo | Descripción | Ejemplo |
|---|---|---|
| `timestamp` | Fecha y hora original del evento | `2026-01-01T00:00:00Z` |
| `host` | Equipo o servicio que genera el evento | `web-01` |
| `method` | Método HTTP utilizado | `GET` |
| `status` | Código de respuesta HTTP | `200`, `404`, `500` |
| `uri` | Ruta solicitada | `/api/users` |

El dataset generado para el curso contiene:

```text
1 línea de cabecera
500 eventos
501 líneas en total
```

La disponibilidad exacta de los campos depende de la configuración de ingesta y
de la estructura real del archivo. Por eso siempre se deben comprobar los
eventos después de cargarlos.

---

#### 3. Archivos disponibles

El repositorio puede incluir los siguientes recursos:

- [Eventos web](../downloads/eventos_web.csv): dataset principal de ingesta.
- [Consultas SPL](../downloads/consultas-spl.txt): ejemplos y plantillas de
  búsqueda.
- `generar_eventos_web.py`: script para regenerar el CSV.
- `validar_eventos_web.py`: script opcional para validar su estructura.

Los archivos se encuentran dentro de:

```text
docs/downloads/
```

La ruta del archivo dentro del repositorio no tiene por qué coincidir con el
valor de `source` que Splunk mostrará después de la ingesta.

Por ejemplo, el archivo puede encontrarse localmente en:

```text
docs/downloads/eventos_web.csv
```

pero Splunk podría registrar como `source`:

```text
/var/lib/splunk-inputs/eventos_web.csv
```

o:

```text
eventos_web.csv
```

El valor de `source` depende de cómo se haya configurado la entrada.

---

#### 4. Generar un nuevo CSV de laboratorio

El dataset puede regenerarse en cualquier momento mediante Python. Esto permite:

- recuperar el archivo original si se ha modificado;
- crear una nueva práctica con los mismos datos;
- evitar copiar manualmente cientos de líneas;
- comprobar la diferencia entre un archivo y los eventos indexados;
- practicar una ingesta desde cero.

La generación es determinista: con el mismo script se obtiene la misma
estructura de datos.

###### 4.1. Crear el script

Desde la raíz del proyecto:

```bash
mkdir -p tools
nano tools/generar_eventos_web.py
```

Introduce el siguiente contenido:

```python
##!/usr/bin/env python3

import csv
from datetime import datetime, timedelta, timezone
from pathlib import Path


NUMERO_EVENTOS = 500

FECHA_INICIAL = datetime(
    2026,
    1,
    1,
    0,
    0,
    0,
    tzinfo=timezone.utc,
)

HOSTS = [
    "web-01",
    "web-02",
    "web-03",
    "web-04",
]

METODOS = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
]

URIS = [
    "/",
    "/login",
    "/logout",
    "/dashboard",
    "/api/users",
    "/api/orders",
    "/api/products",
    "/search",
    "/checkout",
    "/profile",
    "/settings",
    "/admin",
    "/health",
    "/missing",
]

## La lista se repite de forma controlada para obtener
## diferentes códigos de respuesta HTTP.
ESTADOS = [
    200,
    200,
    200,
    200,
    200,
    201,
    201,
    204,
    301,
    302,
    400,
    401,
    403,
    404,
    500,
    502,
    503,
]


def generar_eventos(ruta_salida: Path) -> None:
    ruta_salida.parent.mkdir(parents=True, exist_ok=True)

    with ruta_salida.open(
        "w",
        newline="",
        encoding="utf-8",
    ) as archivo:
        escritor = csv.writer(archivo)

        escritor.writerow([
            "timestamp",
            "host",
            "method",
            "status",
            "uri",
        ])

        for numero in range(NUMERO_EVENTOS):
            momento = FECHA_INICIAL + timedelta(minutes=numero)

            host = HOSTS[numero % len(HOSTS)]
            method = METODOS[numero % len(METODOS)]
            status = ESTADOS[numero % len(ESTADOS)]
            uri = URIS[numero % len(URIS)]

            escritor.writerow([
                momento.strftime("%Y-%m-%dT%H:%M:%SZ"),
                host,
                method,
                status,
                uri,
            ])


if __name__ == "__main__":
    destino = Path("docs/downloads/eventos_web.csv")
    generar_eventos(destino)

    print(f"Archivo generado: {destino}")
    print(f"Eventos generados: {NUMERO_EVENTOS}")
    print(f"Líneas totales: {NUMERO_EVENTOS + 1}")
```

Guarda el archivo y ejecútalo:

```bash
python3 tools/generar_eventos_web.py
```

Resultado esperado:

```text
Archivo generado: docs/downloads/eventos_web.csv
Eventos generados: 500
Líneas totales: 501
```

###### 4.2. Dar permisos de ejecución opcionales

```bash
chmod +x tools/generar_eventos_web.py
```

También podrás ejecutarlo directamente:

```bash
./tools/generar_eventos_web.py
```

---

#### 5. Estructura temporal del dataset

Los eventos comienzan en:

```text
2026-01-01T00:00:00Z
```

Se genera un evento cada minuto. Por tanto, el último evento se sitúa
aproximadamente en:

```text
2026-01-01T08:19:00Z
```

El intervalo completo es:

```text
2026-01-01T00:00:00Z
→
2026-01-01T08:19:00Z
```

Este detalle es importante porque el dataset es histórico. Una búsqueda como:

```spl
index=curso earliest=-24h latest=now
```

puede no mostrar ningún evento si la fecha actual está fuera de ese periodo.

Para validar inicialmente el dataset, utiliza:

```spl
index=curso earliest=0 latest=now
| stats count
```

O un rango explícito:

```spl
index=curso
earliest="2026-01-01T00:00:00"
latest="2026-01-01T09:00:00"
| stats count
```

---

#### 6. Validar el archivo generado

Antes de ingerir el CSV, comprueba que se ha creado correctamente.

###### 6.1. Comprobar que existe

```bash
ls -lh docs/downloads/eventos_web.csv
```

###### 6.2. Comprobar el tipo de archivo

```bash
file docs/downloads/eventos_web.csv
```

Resultado aproximado:

```text
CSV text
```

###### 6.3. Comprobar el número total de líneas

```bash
wc -l docs/downloads/eventos_web.csv
```

Resultado esperado:

```text
501 docs/downloads/eventos_web.csv
```

La primera línea corresponde a la cabecera. Para contar únicamente los eventos:

```bash
tail -n +2 docs/downloads/eventos_web.csv | wc -l
```

Resultado esperado:

```text
500
```

###### 6.4. Revisar la cabecera y las primeras filas

```bash
head -n 10 docs/downloads/eventos_web.csv
```

Resultado esperado:

```csv
timestamp,host,method,status,uri
2026-01-01T00:00:00Z,web-01,GET,200,/
2026-01-01T00:01:00Z,web-02,POST,200,/login
2026-01-01T00:02:00Z,web-03,PUT,200,/logout
2026-01-01T00:03:00Z,web-04,DELETE,200,/dashboard
2026-01-01T00:04:00Z,web-01,GET,200,/api/users
2026-01-01T00:05:00Z,web-02,POST,201,/api/orders
2026-01-01T00:06:00Z,web-03,PUT,201,/api/products
2026-01-01T00:07:00Z,web-04,DELETE,204,/search
2026-01-01T00:08:00Z,web-01,GET,301,/checkout
```

###### 6.5. Revisar las últimas filas

```bash
tail -n 10 docs/downloads/eventos_web.csv
```

Esto ayuda a detectar:

- filas incompletas;
- saltos de línea inesperados;
- registros truncados;
- problemas al final del archivo.

###### 6.6. Buscar líneas vacías

```bash
grep -n '^$' docs/downloads/eventos_web.csv
```

Si no aparece ninguna salida, no se han detectado líneas vacías.

---

#### 7. Validar la estructura con Python

Puedes utilizar este pequeño script para comprobar que todas las filas tienen
cinco columnas y que los códigos HTTP son numéricos.

Crea el archivo:

```bash
nano tools/validar_eventos_web.py
```

Introduce:

```python
##!/usr/bin/env python3

import csv
from pathlib import Path


RUTA = Path("docs/downloads/eventos_web.csv")

COLUMNAS_ESPERADAS = [
    "timestamp",
    "host",
    "method",
    "status",
    "uri",
]

errores = []
numero_eventos = 0

with RUTA.open("r", newline="", encoding="utf-8") as archivo:
    lector = csv.DictReader(archivo)

    if lector.fieldnames != COLUMNAS_ESPERADAS:
        errores.append(
            f"Cabecera inesperada: {lector.fieldnames}"
        )

    for numero_linea, fila in enumerate(lector, start=2):
        numero_eventos += 1

        if any(valor is None for valor in fila.values()):
            errores.append(
                f"Línea {numero_linea}: contiene valores ausentes"
            )

        try:
            status = int(fila["status"])
        except (TypeError, ValueError):
            errores.append(
                f"Línea {numero_linea}: status no numérico"
            )
            continue

        if status < 100 or status > 599:
            errores.append(
                f"Línea {numero_linea}: status HTTP inválido"
            )

        for campo in ["timestamp", "host", "method", "uri"]:
            if not fila[campo].strip():
                errores.append(
                    f"Línea {numero_linea}: campo vacío: {campo}"
                )

print(f"Eventos revisados: {numero_eventos}")

if errores:
    print(f"Errores encontrados: {len(errores)}")

    for error in errores[:20]:
        print(f"- {error}")

    raise SystemExit(1)

print("Validación correcta")
print("Cabecera correcta")
print("Todas las filas tienen los campos esperados")
print("Todos los códigos HTTP son válidos")
```

Ejecuta:

```bash
python3 tools/validar_eventos_web.py
```

Resultado esperado:

```text
Eventos revisados: 500
Validación correcta
Cabecera correcta
Todas las filas tienen los campos esperados
Todos los códigos HTTP son válidos
```

---

#### 8. Revisar la distribución del dataset

Estas comprobaciones permiten conocer el contenido antes de ingerirlo.

###### 8.1. Eventos por host

```bash
tail -n +2 docs/downloads/eventos_web.csv \
  | cut -d',' -f2 \
  | sort \
  | uniq -c
```

###### 8.2. Eventos por método HTTP

```bash
tail -n +2 docs/downloads/eventos_web.csv \
  | cut -d',' -f3 \
  | sort \
  | uniq -c
```

###### 8.3. Eventos por estado HTTP

```bash
tail -n +2 docs/downloads/eventos_web.csv \
  | cut -d',' -f4 \
  | sort \
  | uniq -c
```

###### 8.4. Validar el número de columnas

```bash
awk -F',' 'NF != 5 {
    print "Línea incorrecta:", NR, $0
}' docs/downloads/eventos_web.csv
```

Si no aparece ninguna salida, todas las filas contienen cinco columnas.

###### 8.5. Revisar con Python

```bash
python3 - <<'PY'
import csv
from collections import Counter

ruta = "docs/downloads/eventos_web.csv"

with open(ruta, newline="", encoding="utf-8") as archivo:
    lector = csv.DictReader(archivo)
    filas = list(lector)

print("Eventos:", len(filas))
print("Hosts:", Counter(fila["host"] for fila in filas))
print("Métodos:", Counter(fila["method"] for fila in filas))
print("Estados:", Counter(fila["status"] for fila in filas))
PY
```

---

#### 9. Copiar el dataset al entorno de Splunk

Para utilizar el archivo como entrada local, copia una versión de trabajo a una
ruta destinada a los datos de laboratorio:

```bash
sudo mkdir -p /var/lib/splunk-inputs
sudo cp docs/downloads/eventos_web.csv \
  /var/lib/splunk-inputs/eventos_web.csv
```

Comprueba el archivo:

```bash
sudo ls -lh /var/lib/splunk-inputs/eventos_web.csv
```

Identifica el usuario que ejecuta Splunk:

```bash
ps -eo user,pid,command | grep '[s]plunkd'
```

Si el proceso se ejecuta con el usuario `splunk`, prueba la lectura:

```bash
sudo -u splunk head -n 5 \
  /var/lib/splunk-inputs/eventos_web.csv
```

Si es necesario, ajusta el propietario del archivo de laboratorio:

```bash
sudo chown splunk:splunk \
  /var/lib/splunk-inputs/eventos_web.csv
```

Vuelve a comprobar:

```bash
sudo -u splunk head -n 5 \
  /var/lib/splunk-inputs/eventos_web.csv
```

> No modifiques permisos de logs de producción. Estos comandos están pensados
> únicamente para una ruta de laboratorio.

---

#### 10. Estrategias de ingesta

El archivo puede cargarse mediante varios métodos.

###### 10.1. Upload desde Splunk Web

Es el método más sencillo para una práctica inicial.

Flujo habitual:

```text
Settings → Add Data → Upload
```

Después:

1. selecciona `eventos_web.csv`;
2. revisa la vista previa;
3. comprueba el separador;
4. revisa el timestamp;
5. selecciona el índice `curso`;
6. confirma el `sourcetype`;
7. completa la carga;
8. ejecuta una búsqueda de validación.

Utiliza:

```text
Index: curso
Sourcetype: curso:web:csv
```

###### 10.2. Monitor de archivo

El método `Monitor` resulta más apropiado para simular una entrada persistente.

Ruta:

```text
/var/lib/splunk-inputs/eventos_web.csv
```

Configuración recomendada:

```text
Index: curso
Sourcetype: curso:web:csv
```

La entrada debe definir:

- ruta monitorizada;
- índice `curso`;
- `sourcetype`;
- reglas de timestamp;
- comportamiento ante archivos existentes;
- permisos de lectura.

###### 10.3. Carga desde configuración

En un entorno administrado, la entrada puede configurarse mediante una app de
Splunk y archivos como:

```text
inputs.conf
```

Ejemplo de configuración para laboratorio:

```ini
[monitor:///var/lib/splunk-inputs/eventos_web.csv]
disabled = false
index = curso
sourcetype = curso:web:csv
```

La configuración debe mantenerse dentro de la estructura de aplicaciones de
Splunk y no editarse de forma improvisada en varias ubicaciones.

Comprueba la configuración efectiva con:

```bash
sudo /opt/splunk/bin/splunk btool inputs list --debug \
  | grep -A 15 -B 5 'eventos_web.csv'
```

La entrada debe mostrar valores equivalentes a:

```text
disabled = false
index = curso
sourcetype = curso:web:csv
```

---

#### 11. Comprobación de la ingesta

Después de cargar el archivo, no continúes directamente con un dashboard.
Primero valida el resultado.

###### 11.1. Contar eventos

```spl
index=curso earliest=0 latest=now
| stats count as total_eventos
```

Resultado esperado para una primera carga limpia:

```text
total_eventos = 500
```

Si el resultado es superior a 500, revisa si el archivo se ha cargado más de una
vez o si existe otra entrada monitorizando la misma ruta.

###### 11.2. Revisar metadatos

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
| sort - count
```

###### 11.3. Revisar eventos individuales

```spl
index=curso earliest=0 latest=now
| table
    _time
    _indextime
    host
    source
    sourcetype
    timestamp
    method
    status
    uri
    _raw
| head 20
```

###### 11.4. Revisar los campos disponibles

```spl
index=curso earliest=0 latest=now
| fieldsummary
```

###### 11.5. Revisar la distribución de campos

```spl
index=curso earliest=0 latest=now
| stats
    count
    dc(host) as hosts_distintos
    dc(method) as metodos_distintos
    dc(status) as estados_distintos
    dc(uri) as uris_distintas
```

Para el dataset generado se esperan aproximadamente:

```text
500 eventos
4 hosts
4 métodos
varios códigos HTTP
14 URI
```

---

#### 12. Consultas SPL iniciales

###### Contar eventos

```spl
index=curso earliest=0 latest=now
| stats count
```

###### Eventos por host

```spl
index=curso earliest=0 latest=now
| stats count by host
| sort - count
```

###### Eventos por método HTTP

```spl
index=curso earliest=0 latest=now
| stats count by method
| sort - count
```

###### Eventos por código de estado

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| stats count by status_num
| sort status_num
```

###### URI más solicitadas

```spl
index=curso earliest=0 latest=now
| stats count as peticiones by uri
| sort - peticiones
| head 10
```

###### Errores HTTP

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| where status_num >= 400
| stats count as errores by status_num
| sort - errores
```

###### URI con más errores

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| where status_num >= 400
| stats count as errores by uri
| sort - errores
| head 10
```

###### Evolución temporal

Como el dataset contiene un evento por minuto, utiliza:

```spl
index=curso earliest=0 latest=now
| timechart span=1h count as peticiones
```

Para observar el detalle por minuto:

```spl
index=curso earliest=0 latest=now
| timechart span=1m count as peticiones
```

---

#### 13. Comparar el archivo con los eventos indexados

El número de líneas y el número de eventos no siempre coinciden
automáticamente. La diferencia puede deberse a:

- la cabecera;
- líneas vacías;
- filas inválidas;
- varias filas interpretadas como un solo evento;
- archivos cargados previamente;
- reglas de ruptura de eventos;
- duplicados;
- entradas configuradas más de una vez.

Comprobar el archivo:

```bash
wc -l docs/downloads/eventos_web.csv
```

Resultado esperado:

```text
501 docs/downloads/eventos_web.csv
```

Contar solo los datos:

```bash
tail -n +2 docs/downloads/eventos_web.csv | wc -l
```

Resultado:

```text
500
```

Contar eventos en Splunk:

```spl
index=curso source="/var/lib/splunk-inputs/eventos_web.csv"
| stats count
```

En una carga limpia, el resultado esperado es:

```text
count = 500
```

Si no coincide, revisa:

```spl
index=curso earliest=0 latest=now
| stats count by source sourcetype host
| sort - count
```

---

#### 14. Control de duplicados

La carga repetida del mismo archivo puede producir eventos duplicados y alterar
las estadísticas.

###### 14.1. Buscar duplicados mediante una firma

```spl
index=curso earliest=0 latest=now
| eval firma=md5(
    coalesce(timestamp, "")
    . coalesce(host, "")
    . coalesce(method, "")
    . coalesce(status, "")
    . coalesce(uri, "")
)
| stats count as apariciones by firma
| where apariciones > 1
| sort - apariciones
```

Esta consulta identifica eventos con el mismo contenido. No demuestra por sí
sola que sean duplicados: dos peticiones legítimas pueden tener exactamente los
mismos valores.

Contrasta el resultado con:

```spl
index=curso earliest=0 latest=now
| table _time _indextime host source method status uri _raw
| head 50
```

###### 14.2. Buenas prácticas

- registra cuándo se cargó el archivo;
- utiliza una carpeta de entrada controlada;
- evita monitorizar dos veces la misma ruta;
- no cargues el archivo desde Upload y Monitor sin una razón;
- documenta el `source` utilizado;
- comprueba el contador de eventos antes y después de la carga;
- regenera el archivo con el script si necesitas repetir el laboratorio.

---

#### 15. Registro de la ingesta

Documenta cada carga mediante una plantilla como esta:

```markdown
######## Registro de ingesta

- Archivo: eventos_web.csv
- Fecha de carga:
- Usuario:
- Método de ingesta:
- Ruta de origen:
- Índice: curso
- Source:
- Sourcetype: curso:web:csv
- Host:
- Número de filas del archivo: 501
- Número de eventos esperados: 500
- Número de eventos indexados:
- Primer `_time`:
- Último `_time`:
- Campos detectados:
- Observaciones:
```

Este registro es especialmente útil cuando:

- se repite una práctica;
- se cambia el `sourcetype`;
- se recarga el dataset;
- se comparan resultados entre asistentes;
- se investiga una diferencia de conteo.

---

#### 16. Flujo recomendado para repetir el laboratorio

Para comenzar una práctica desde cero:

###### Paso 1: regenerar el CSV

```bash
python3 tools/generar_eventos_web.py
```

###### Paso 2: validarlo

```bash
python3 tools/validar_eventos_web.py
```

###### Paso 3: copiarlo a la entrada de Splunk

```bash
sudo cp docs/downloads/eventos_web.csv \
  /var/lib/splunk-inputs/eventos_web.csv
```

###### Paso 4: comprobar permisos

```bash
sudo -u splunk head -n 3 \
  /var/lib/splunk-inputs/eventos_web.csv
```

###### Paso 5: comprobar la entrada

```bash
sudo /opt/splunk/bin/splunk btool inputs list --debug \
  | grep -A 15 -B 5 'eventos_web.csv'
```

###### Paso 6: validar la ingesta

```spl
index=curso earliest=0 latest=now
| stats count by source sourcetype
```

###### Paso 7: analizar los datos

```spl
index=curso earliest=0 latest=now
| eval status_num=tonumber(trim(status))
| stats count by status_num
| sort status_num
```

---

#### 17. Criterios de validación antes de continuar

Antes de pasar a estadísticas, dashboards o alertas, confirma:

- [ ] El archivo se ha generado correctamente.
- [ ] El archivo contiene 500 eventos.
- [ ] La cabecera contiene cinco columnas.
- [ ] No hay filas incompletas.
- [ ] Los códigos HTTP son válidos.
- [ ] Los eventos aparecen en `index=curso`.
- [ ] El `source` corresponde a la entrada utilizada.
- [ ] El `sourcetype` es coherente.
- [ ] El `host` es el esperado.
- [ ] `_time` contiene fechas razonables.
- [ ] `_indextime` permite conocer cuándo se indexaron.
- [ ] El rango temporal real está documentado.
- [ ] Los campos principales están disponibles.
- [ ] `status` puede convertirse a número.
- [ ] `uri` contiene valores coherentes.
- [ ] No se han cargado duplicados accidentalmente.
- [ ] Las búsquedas iniciales devuelven resultados reproducibles.

La búsqueda mínima de validación es:

```spl
index=curso earliest=0 latest=now
| stats
    count as total_eventos
    earliest(_time) as primer_evento
    latest(_time) as ultimo_evento
```

Para una carga limpia del dataset, el resultado esperado es:

```text
total_eventos = 500
```

A partir de este punto, el asistente puede continuar con:

- estadísticas;
- análisis de códigos HTTP;
- errores por URI;
- tendencias temporales;
- dashboards;
- alertas;
- proyecto final.

La calidad de las prácticas dependerá de la calidad de esta validación inicial.
Si el evento está bien generado, revisado e ingerido, el resto del análisis
resulta mucho más sencillo y, sobre todo, reproducible.