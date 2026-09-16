///PER ARREGLAR

# Evaluación del proyecto final

La evaluación comprueba tanto el resultado técnico como la capacidad para explicar,
validar y mantener la solución.

No se evaluará únicamente que el dashboard tenga buena apariencia. También se
tendrá en cuenta si los datos son correctos, si la SPL es reproducible, si la alerta
es accionable y si el participante puede diagnosticar problemas.

---

## Criterios de evaluación

La puntuación total es de 100 puntos.

| Área | Puntos |
|---|---:|
| Validación del entorno y la ingesta | 15 |
| Calidad de las búsquedas SPL | 20 |
| Reportes y visualizaciones | 10 |
| Dashboard | 20 |
| Filtros y tokens | 10 |
| Alerta | 10 |
| Seguridad y permisos | 5 |
| Documentación y explicación | 10 |
| **Total** | **100** |

---

## 1. Entorno e ingesta — 15 puntos

### 15 puntos

- El índice existe.
- El dataset está correctamente ingerido.
- Los eventos aparecen con el rango temporal adecuado.
- `host`, `source` y `sourcetype` son coherentes.
- El participante sabe explicar el flujo desde la fuente hasta la búsqueda.

### 10 puntos

- Los eventos están disponibles, pero falta documentar algún metadato.
- La validación depende de búsquedas demasiado amplias.

### 5 puntos

- La ingesta funciona parcialmente.
- Hay campos o timestamps sin validar.

### 0 puntos

- No existen eventos consultables.
- No se puede demostrar que el dataset haya sido ingerido.

Búsquedas mínimas esperadas:

```spl
index=curso earliest=0 latest=now
| stats count
```

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
```

---

## 2. Búsquedas SPL — 20 puntos

Se valorará que las consultas:

- utilicen el índice explícitamente;
- definan el periodo temporal;
- usen campos reales;
- normalicen valores numéricos;
- respondan preguntas concretas;
- sean legibles;
- incluyan comentarios o documentación;
- sean reutilizables.

### Excelente

Las búsquedas son precisas, eficientes y explican sus supuestos.

### A mejorar

Las consultas funcionan, pero utilizan nombres ambiguos, rangos no documentados
o filtros poco selectivos.

### Errores frecuentes

- utilizar `index=*` sin motivo;
- comparar un campo textual como si fuera numérico;
- buscar `status=500` cuando el campo real es `status_code`;
- utilizar `earliest=-5m` con datos históricos;
- no validar los campos antes de ejecutar `stats`.

---

## 3. Reportes y visualizaciones — 10 puntos

Se valorará:

- elección correcta de la visualización;
- nombre y descripción;
- audiencia definida;
- periodo temporal documentado;
- resultado interpretable;
- ausencia de gráficos innecesarios.

Ejemplos:

| Necesidad | Salida adecuada |
|---|---|
| Una cifra principal | Single value |
| Comparar códigos | Barras |
| Ver evolución | Línea temporal |
| Localizar eventos | Tabla |
| Mostrar ranking | Barras o tabla ordenada |

Un gráfico visualmente atractivo, pero basado en una consulta incorrecta, no obtiene
una valoración alta.

---

## 4. Dashboard — 20 puntos

### Debe incluir

- al menos seis paneles;
- títulos claros;
- consultas validadas;
- orden lógico;
- intervalo temporal;
- comportamiento documentado sin datos;
- visualizaciones adecuadas.

### Orden recomendado

1. Resumen de peticiones.
2. Resumen de errores.
3. Porcentaje de error.
4. Evolución temporal.
5. Distribución de códigos HTTP.
6. Detalle por URI, host o IP.

### Evaluación

| Nivel | Características |
|---|---|
| Excelente | Responde rápidamente a las preguntas operativas y permite investigar |
| Correcto | Incluye los paneles mínimos y funciona |
| Básico | Tiene paneles, pero sin orden o explicación clara |
| Insuficiente | Muestra datos sin relación o paneles vacíos |

---

## 5. Filtros y tokens — 10 puntos

Se valorará que:

- existan al menos dos filtros;
- el selector temporal afecte a los paneles;
- el segundo filtro funcione con valores diferentes;
- exista una opción equivalente a “todos”;
- no se rompan las búsquedas con valores vacíos;
- se explique que los tokens no conceden permisos.

El participante debe probar al menos:

- un valor concreto;
- la opción “todos”;
- un valor sin resultados.

Ejemplo conceptual:

```spl
index=curso
| where "$host_token$"="*" OR host="$host_token$"
| stats count by status
```

La sintaxis exacta puede variar según Dashboard Studio o dashboards clásicos.
Se evaluará el comportamiento funcional, no únicamente el texto del token.

---

## 6. Alerta — 10 puntos

La alerta debe cumplir:

- condición clara;
- consulta validada;
- ventana temporal definida;
- frecuencia configurada;
- acción documentada;
- prueba realizada;
- prevención razonable de duplicados.

Consulta mínima:

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

### Se valorará especialmente

- diferencia entre datos históricos y datos en tiempo real;
- explicación del intervalo;
- existencia de throttling;
- destinatario definido;
- acción posterior documentada.

Una alerta que genera avisos repetidos sin control puede perder hasta la mitad de
los puntos de esta sección aunque la condición sea técnicamente correcta.

---

## 7. Seguridad y permisos — 5 puntos

Se valorará que el participante:

- no utilice `admin` como solución permanente;
- revise quién puede ver el índice;
- compruebe quién puede modificar el dashboard;
- documente la aplicación y la compartición;
- pruebe el objeto con un usuario final cuando sea posible.

Debe distinguir entre:

- permisos para iniciar sesión;
- permisos sobre índices;
- permisos sobre aplicaciones;
- permisos sobre objetos;
- capacidades administrativas.

---

## 8. Documentación — 10 puntos

La documentación debe permitir que otra persona reproduzca el proyecto.

Debe incluir:

- objetivo;
- dataset;
- índice;
- rango temporal;
- SPL;
- resultados;
- capturas;
- decisiones;
- limitaciones;
- recomendaciones.

### Limitaciones que deben declararse

Por ejemplo:

- el dataset no contiene IP;
- no existe campo de tiempo de respuesta;
- la muestra es demasiado pequeña;
- los datos son históricos;
- no se puede validar una alerta en tiempo real;
- todos los usuarios utilizaron el rol `admin`;
- no se dispuso de tráfico suficiente para probar el umbral de cinco errores 500.

Documentar una limitación es mejor que presentar como válido un análisis que los datos
no permiten realizar.

---

## Defensa práctica

Durante la presentación, el participante debe poder responder:

1. ¿En qué índice están los eventos?
2. ¿Qué rango temporal utilizaste?
3. ¿Cómo sabes que la ingesta fue correcta?
4. ¿Qué significa `_time`?
5. ¿Qué campos utiliza cada panel?
6. ¿Cómo calculaste el porcentaje de error?
7. ¿Por qué elegiste esa visualización?
8. ¿Qué ocurre si no hay datos?
9. ¿Cómo funciona el filtro?
10. ¿Cuándo se dispara la alerta?
11. ¿Cómo evitarías alertas repetidas?
12. ¿Qué permisos necesita el usuario final?
13. ¿Qué limitaciones tiene el dataset?
14. ¿Qué mejorarías en producción?

---

## Prueba de diagnóstico

Se puede solicitar al participante que resuelva uno de estos problemas:

- índice incorrecto;
- rango temporal vacío;
- campo `status` con otro nombre;
- `status` tratado como texto;
- dashboard sin permisos;
- alerta basada en datos históricos;
- archivo ingerido dos veces;
- campo de latencia inexistente.

El participante debe seguir este orden:

```text
Índice
    ↓
Tiempo
    ↓
Eventos
    ↓
Campos
    ↓
Metadatos
    ↓
Permisos
    ↓
SPL
    ↓
Objeto de conocimiento
```

---

## Resultado de la evaluación

| Puntuación | Resultado |
|---:|---|
| 90–100 | Solución completa, reproducible y bien documentada |
| 75–89 | Solución funcional con mejoras menores |
| 60–74 | Cumple parcialmente; requiere correcciones |
| Menos de 60 | No demuestra todavía una solución operativa completa |

Para superar el proyecto se recomienda obtener al menos **60 puntos** y cumplir
obligatoriamente estos elementos:

- dataset consultable;
- cinco búsquedas SPL;
- dashboard;
- dos filtros;
- alerta documentada;
- explicación de las limitaciones.

---

## Referencias oficiales

- [Splunk Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchapp)
- [Search optimization](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutsearchoptimization)
- [Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/IntroFrame)
- [Classic Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/PanelreferenceforSimplifiedXML)
- [Alerts](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Users and roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)

La evaluación mide la capacidad para construir una solución completa de
monitorización y justificar técnicamente sus decisiones.

## Puntuación

| Criterio | Puntos |
|---|---:|
| Ingesta y validación | 15 |
| Búsquedas SPL | 20 |
| Reportes | 10 |
| Dashboard | 20 |
| Filtros | 10 |
| Alerta | 10 |
| Seguridad | 5 |
| Documentación | 10 |
| **Total** | **100** |

## Ingesta y validación

Se evaluará que el participante pueda demostrar:

```spl
index=curso earliest=0 latest=now
| stats count
```

```spl
index=curso earliest=0 latest=now
| stats count by host source sourcetype
```

Debe identificar correctamente:

- índice;
- fuente;
- host;
- `sourcetype`;
- rango temporal;
- campos disponibles.

## SPL

Las búsquedas deben ser legibles y reproducibles.

Se valorará positivamente:

- índice explícito;
- rango temporal;
- uso de `tonumber`;
- filtros tempranos;
- nombres de campos claros;
- explicación del resultado.

## Dashboard

Debe tener al menos seis paneles:

1. total de peticiones;
2. total de errores;
3. peticiones por minuto;
4. errores por código;
5. IP o host con más errores;
6. URL más lentas o URI con más errores.

## Alerta

La alerta debe detectar cinco o más HTTP `500` en cinco minutos:

```spl
index=curso earliest=-5m latest=now
| eval status_num=tonumber(status)
| stats count(eval(status_num=500)) as errores_500
| where errores_500>=5
```

Debe documentarse:

- frecuencia;
- condición;
- acción;
- responsable;
- prevención de duplicados;
- prueba.

## Limitaciones

El participante debe documentar expresamente si:

- no hay IP;
- no hay duración;
- los eventos son históricos;
- no hay suficientes eventos HTTP `500`;
- no se pudo probar con un usuario no administrador.

## Defensa

Durante la defensa debe poder explicar:

- qué pregunta responde cada búsqueda;
- por qué usa ese intervalo;
- cómo se calcula el porcentaje de error;
- cómo se seleccionó cada gráfico;
- qué ocurre cuando no hay resultados;
- cómo se prueba la alerta;
- qué mejoraría en producción.

## Referencias

- [Splunk Search Manual](https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchapp)
- [Splunk Alerts](https://docs.splunk.com/Documentation/Splunk/latest/Alert/Aboutalerts)
- [Splunk Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Aboutthismanual)
- [Splunk Users and Roles](https://docs.splunk.com/Documentation/Splunk/latest/Security/Aboutusersandroles)