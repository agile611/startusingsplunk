from datetime import datetime, timedelta, timezone
import csv

hosts = [
    "web-01",
    "web-02",
    "web-03",
    "web-04",
]

methods = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
]

uris = [
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

# Distribución aproximada de respuestas HTTP
statuses = [
    200, 200, 200, 200, 200,
    201, 201,
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

fecha_inicial = datetime(
    2026,
    1,
    1,
    0,
    0,
    0,
    tzinfo=timezone.utc,
)

with open("eventos_web.csv", "w", newline="", encoding="utf-8") as archivo:
    escritor = csv.writer(archivo)

    # Cabecera
    escritor.writerow([
        "timestamp",
        "host",
        "method",
        "status",
        "uri",
    ])

    # Exactamente 500 eventos
    for numero in range(500):
        timestamp = fecha_inicial + timedelta(minutes=numero)

        host = hosts[numero % len(hosts)]
        method = methods[numero % len(methods)]
        status = statuses[numero % len(statuses)]
        uri = uris[numero % len(uris)]

        escritor.writerow([
            timestamp.strftime("%Y-%m-%dT%H:%M:%SZ"),
            host,
            method,
            status,
            uri,
        ])

print("Archivo generado: eventos_web.csv")
print("Eventos generados: 500")
print("Líneas totales, incluida la cabecera: 501")
