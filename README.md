# Sitio web — Escuela de Diseño UDP

Sitio **estático** (HTML + CSS + JavaScript, sin servidor ni base de datos)
de la Escuela de Diseño de la Universidad Diego Portales. Este repositorio
es además la **fuente para la migración a WordPress** que hará la agencia.

**Sitio en línea:** https://emiguerra.github.io/diseno-web-udp/

---

## Entradas rápidas

### Para la agencia (migración a WordPress)

| Necesito… | Dónde está |
|---|---|
| **Todas las imágenes, videos y PDF del sitio** | [Carpeta en el Drive de Comunicaciones](https://drive.google.com/drive/folders/1cJ89TGm70fkbv0soU-sbqInn8e_AwD4-) (mismas rutas que en los JSON) |
| **Saber qué imagen va dónde** | [Guía de imágenes](documentacion/imagenes-traspaso-agencia.txt) · [Inventario archivo por archivo](documentacion/inventario-imagenes.csv) |
| **Proyectos del portafolio** (título, autor, portada, carpeta con sus fotos) | [portafolio.csv](documentacion/portafolio.csv) · datos completos en [portafolio-data.json](portafolio-data.json) |
| **Cursos con sus descripciones** | [Lista para leer](documentacion/cursos-organigrama.md) · [Tabla para importar](documentacion/cursos-organigrama.csv) · datos en [cursos.json](cursos/datos_catalogo/cursos.json) |
| **Fotos de docentes** (nombradas `nombre-apellido-NN.jpg`, `-01` = foto principal) | Carpeta `docentes/` dentro de la [carpeta del Drive](https://drive.google.com/drive/folders/1cJ89TGm70fkbv0soU-sbqInn8e_AwD4-) |
| **Textos del sitio** | [contenido.json](contenido.json) |
| **Agenda curada** | [agenda-data.json](agenda-data.json) |
| **Formularios** (oportunidad laboral, visita FAAD) | Ver [sección 4](#4-formularios) |

> Importante: **54 archivos no están en ningún JSON** (noticias, programas,
> convenios, red UDP, laboratorios…); están escritos directamente en las
> páginas y en `assets/js/main.js`. El [inventario](documentacion/inventario-imagenes.csv)
> los marca con la nota *"Solo en código"*.

### Páginas del sitio

| Página | En línea | Archivo |
|---|---|---|
| Portada y proyectos | [ver](https://emiguerra.github.io/diseno-web-udp/) | [index.html](index.html) |
| Nosotros (escuela, docentes, malla, organigrama) | [ver](https://emiguerra.github.io/diseno-web-udp/nosotros.html) | [nosotros.html](nosotros.html) |
| Noticias (incluye Laboral) | [ver](https://emiguerra.github.io/diseno-web-udp/noticias.html) | [noticias.html](noticias.html) |
| Explora | [ver](https://emiguerra.github.io/diseno-web-udp/explora.html) | [explora.html](explora.html) |
| Postula (incluye Visita FAAD) | [ver](https://emiguerra.github.io/diseno-web-udp/postula.html) | [postula.html](postula.html) |
| Organigrama · escritorio | [ver](https://emiguerra.github.io/diseno-web-udp/cursos/constelacion.html) | [cursos/constelacion.html](cursos/constelacion.html) |
| Organigrama · celular | [ver](https://emiguerra.github.io/diseno-web-udp/cursos/constelacion-mobile.html) | [cursos/constelacion-mobile.html](cursos/constelacion-mobile.html) |
| Diagrama 02 · Proyecto Académico | [ver](https://emiguerra.github.io/diseno-web-udp/cursos/diagrama-02-proyecto-academico.html) | [cursos/diagrama-02-proyecto-academico.html](cursos/diagrama-02-proyecto-academico.html) |
| Formulario oportunidad laboral | [ver](https://emiguerra.github.io/diseno-web-udp/formularios/oportunidad-laboral.html) | [formularios/oportunidad-laboral.html](formularios/oportunidad-laboral.html) |
| Formulario visita FAAD | [ver](https://emiguerra.github.io/diseno-web-udp/formularios/visita.html) | [formularios/visita.html](formularios/visita.html) |

### Documentación interna

| Documento | Para qué |
|---|---|
| [guia-edicion.md](documentacion/guia-edicion.md) | Cómo editar y publicar, paso a paso |
| [arquitectura.md](documentacion/arquitectura.md) | Resumen de cómo está armado el sitio |
| [respuestas-IT.txt](documentacion/respuestas-IT.txt) | Respuestas técnicas para IT / UDP |
| [plan-panel-admin.md](documentacion/plan-panel-admin.md) | Plan original de panel `/admin` (en pausa por la migración a WordPress) |

---

## 1. Estructura del repositorio

```
/                          raíz = lo que publica GitHub Pages
├── index.html             portada y portafolio
├── nosotros.html          escuela, docentes, malla, organigrama
├── explora.html           exploración de proyectos
├── noticias.html          noticias y laboral
├── postula.html           admisión, cursos abiertos y visita FAAD
│
├── contenido.json         textos del sitio
├── portafolio-data.json   proyectos del portafolio (portada en imgUrl,
│                          carpeta con todas sus fotos en carpetaDrive)
├── agenda-data.json       eventos curados
│
├── assets/
│   ├── css/styles.css     hoja de estilos del sitio
│   ├── js/main.js         lógica del sitio
│   ├── fonts/             WorkFaAAD, Work Sans, NectoMono
│   ├── img/               imágenes (noticias/, programas/, convenios/,
│   │                      faad/, red-udp/, provisorios/ = portadas temporales)
│   ├── video/             videos de fondo (ver sección 6)
│   ├── documentos/        PDF de la malla
│   └── vendor/            librerías de terceros
│
├── cursos/
│   ├── constelacion.html          organigrama, versión escritorio
│   ├── constelacion-mobile.html   organigrama, versión celular (≤ 768 px)
│   ├── diagrama-02-proyecto-academico.html  diagrama del proyecto académico (scrollytelling)
│   ├── datos_catalogo/            cursos.json, cursos.csv e imagenes/
│   └── scraper_catalogo.py        regenera cursos.json desde el catálogo
│
├── formularios/
│   ├── oportunidad-laboral.html   formulario de oportunidades laborales
│   ├── visita.html                formulario de visita FAAD
│   └── formulario.css · .js       diseño y envío (comunes a ambos)
│
└── documentacion/                 guías, inventarios y tablas (ver arriba)
```

Reglas: los `.html` van en la raíz; todo recurso estático bajo `assets/`;
rutas siempre **relativas** (`assets/...`); lo que no se usa no vive en el repo.

---

## 2. Ver el sitio en el computador

No necesita compilación. Basta un servidor local:

```
python3 -m http.server 8000
# abrir http://localhost:8000
```

Abrir los `.html` con doble clic también funciona, pero algunas lecturas de
datos fallan por seguridad del navegador.

---

## 3. Cómo se publica

1. Se sube un cambio (*commit*) a la rama **`main`**.
2. GitHub Pages publica el sitio solo, en uno o dos minutos.
3. Se revisa en la [URL pública](https://emiguerra.github.io/diseno-web-udp/).

Cada cambio queda en el historial y se puede revertir (ver sección 7).

---

## 4. Formularios

Dos formularios con el **mismo diseño del formulario de publicación de
proyectos**, abiertos a todo público (no piden cuenta UDP):

| Formulario | Se abre desde | Avisa por correo a |
|---|---|---|
| [Oportunidad laboral](formularios/oportunidad-laboral.html) | Noticias → Laboral ("Publicar oportunidad", "Publicar oferta", "Publicar práctica") | barbara.gutierrez1@mail.udp.cl, felipe.sepulveda7@mail.udp.cl, vcm.diseno@mail.udp.cl |
| [Visita FAAD](formularios/visita.html) | Postula → Visita FaAAD ("Agendar visita", "Agendar sesión online") | Admisión (correo pendiente) |

Cómo funcionan: la página envía cada respuesta a un **Google Form**, que la
guarda en su planilla; un Apps Script dentro del formulario manda el aviso
por correo. En el sitio se abren en una ventana (`abrirFormulario()` en
`assets/js/main.js`) y quedan con la opción ya marcada según el botón.

Si se cambian las preguntas del Google Form, hay que actualizar también la
página (cada campo usa el identificador `entry.…` de su pregunta).

Los botones de correo directo de Laboral (**Práctica** y **Trabajo**)
siguen funcionando junto al formulario.

---

## 5. Datos y fuentes externas

| Bloque | Fuente |
|---|---|
| Textos | [contenido.json](contenido.json) |
| Portafolio | [portafolio-data.json](portafolio-data.json) |
| Catálogo / malla | [cursos/datos_catalogo/cursos.json](cursos/datos_catalogo/cursos.json) |
| Agenda | RSS de UDP vía `rss2json.com` (única lectura externa en vivo) |
| Formularios | Envían a Google Forms (ver sección 4) |

> **Seguridad:** ninguna clave, token ni endpoint privado vive en el repo.
> Las planillas de respuestas de los formularios tienen datos personales y
> **no** se copian al repositorio.

Librerías de terceros vía CDN: GSAP + ScrollTrigger, gif.js, html2canvas
(ver `assets/vendor/LEEME.md`).

El sitio **no tiene**: base de datos, backend, login real, cookies propias,
analítica, Google Fonts, Google Maps ni pasarela de pago.

---

## 6. Videos

4 de los 5 videos de fondo están en `assets/video/`. **`Facultad.mp4`
(69 MB) no está en el repo** porque supera el límite de GitHub: está en la
[carpeta del Drive](https://drive.google.com/drive/folders/1cJ89TGm70fkbv0soU-sbqInn8e_AwD4-),
en `assets/video/`. Hasta que se suba (o se pase a Vimeo/YouTube), el video
de fondo de Nosotros no se ve en el sitio en línea.

---

## 7. Revertir un cambio

En GitHub: abrir el historial del archivo, elegir la versión anterior y
restaurarla (*revert*). El sitio se vuelve a publicar solo.

---

## 8. Pendientes

1. **Portafolio:** depurar los datos de autores con las planillas de
   cohortes 2023–2026; corregir 3 proyectos con columnas corridas (Veo Leo,
   Diáfano, Dosimar); reemplazar las 23 portadas provisorias por las definitivas.
2. **Docentes:** identificar y nombrar las fotos de ~10 docentes que faltan.
3. **Formularios:** agregar el correo de Admisión para los avisos de visitas.
4. **Videos:** subir `Facultad.mp4` o pasar los videos a Vimeo/YouTube.
5. **Repositorio:** transferirlo a la organización GitHub `disenoUDP`.
6. **Agenda:** quitar la lectura en vivo de `rss2json.com`.
