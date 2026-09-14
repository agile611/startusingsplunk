# Proyecto final

El proyecto consiste en desarrollar una solución básica de monitorización
para una aplicación web.

## Escenario

La organización necesita conocer:

- El volumen de peticiones.
- La evolución temporal del tráfico.
- Los códigos HTTP más frecuentes.
- Las URL con mayor número de errores.
- Las IP con actividad anormal.
- Los tiempos de respuesta.
- La aparición de errores del servidor.

## Requisitos

El proyecto debe incluir:

- [ ] Un índice específico.
- [ ] Un dataset correctamente ingerido.
- [ ] Cinco consultas SPL documentadas.
- [ ] Dos reportes.
- [ ] Un dashboard con al menos seis paneles.
- [ ] Dos filtros interactivos.
- [ ] Una alerta.
- [ ] Una explicación de los resultados.

## Dashboard mínimo

| Panel | Visualización recomendada |
|---|---|
| Total de peticiones | Valor único |
| Total de errores | Valor único |
| Peticiones por minuto | Línea temporal |
| Errores por código HTTP | Barras |
| IP con más errores | Tabla |
| URL más lentas | Tabla |

## Alerta mínima

La alerta debe detectar cinco o más errores HTTP `500` durante un
intervalo de cinco minutos.

```spl
index=curso earliest=-5m status>=500
| stats count as errores_500
| where errores_500>=5
```

## Entrega

El participante deberá presentar:

- Las búsquedas SPL utilizadas.
- Capturas del dashboard.
- La configuración de la alerta.
- Una explicación breve del caso detectado.
