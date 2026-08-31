# Sitio web — Escuela de Diseño UDP

Sitio **estático** (HTML + CSS + JavaScript, sin servidor ni base de datos)
de la Escuela de Diseño de la Universidad Diego Portales.

- **Publicación:** GitHub Pages (sirve estos archivos tal cual).
- **Contenido editorial:** editable desde una planilla Google Sheets, sin
  tocar código.
- **Repositorio destino:** organización GitHub `disenoUDP`.

> Este proyecto nació como *wireframe* (prototipo navegable) y se está
> pasando a producción manteniendo el modelo estático por ser el más
> simple y seguro para un sitio de facultad.

---

## 1. Estructura del repositorio

```
/                          raíz = lo que publica GitHub Pages
├── index.html             portada
├── nosotros.html          escuela, docentes, malla, constelación
├── explora.html           exploración de proyectos
├── noticias.html          noticias
├── postula.html           admisión y cursos abiertos
│
├── contenido.json         textos del sitio      ┐
├── portafolio-data.json   proyectos del portafolio │ datos + respaldo local
├── agenda-data.json       eventos curados          ┘ (ver sección 5)
│
├── assets/
│   ├── css/styles.css     única hoja de estilos
│   ├── js/main.js         toda la lógica del sitio
│   ├── fonts/             tipografías propias (.woff2 / .otf / .ttf)
│   ├── img/               imágenes del sitio
│   │   ├── noticias/        noticia-*
│   │   ├── programas/       pregrado-* · postgrado-* · mencion-*
│   │   ├── convenios/       convenio-*
│   │   ├── faad/            logos e imágenes de facultad
│   │   ├── red-udp/         red-udp-*
│   │   ├── provisorios/     imágenes de portafolio en revisión
│   │   └── (resto)          portafolio y misceláneas
│   ├── video/             videos de fondo  → ver sección 6
│   ├── documentos/        PDF (malla normativa)
│   └── vendor/            librerías de terceros locales → ver LEEME.md
│
├── cursos/
│   ├── constelacion.html          se muestra embebida en nosotros.html
│   ├── datos_catalogo/
│   │   ├── cursos.json            lo consume assets/js/main.js
│   │   ├── cursos.csv             fuente del catálogo
│   │   └── imagenes/              imágenes del catálogo/malla
│   └── scraper_catalogo.py        herramienta para regenerar cursos.json
│
├── documentacion/
│   ├── respuestas-IT.txt          respuestas técnicas para IT/UDP
│   ├── arquitectura.md            resumen de arquitectura
│   └── guia-edicion.md            cómo editar y publicar (paso a paso)
│
├── .nojekyll              evita que GitHub Pages procese el sitio con Jekyll
└── .gitignore
```

Reglas:

- Los `.html` van en la **raíz** (convención de GitHub Pages).
- Todo recurso estático vive bajo `assets/`, **una subcarpeta por tipo**.
- Las rutas dentro del código son **relativas** (`assets/...`), nunca
  absolutas.
- Lo que no se usa **no vive en el repo**: se archiva en
  `../_archivo-sin-uso-wireframe/` (fuera del repositorio, con un
  `INVENTARIO.txt`).

---

## 2. Ver el sitio en el computador

No necesita compilación. Basta un servidor estático local, por ejemplo:

```
# con Python (ya viene en macOS)
python3 -m http.server 8000
# abrir http://localhost:8000
```

Abrir los `.html` con doble clic también funciona, pero algunas llamadas
a datos fallan por seguridad del navegador; usar el servidor local.

---

## 3. Cómo se publica

1. Se confirma un cambio (*commit*) en la rama **`main`**.
2. GitHub Pages reconstruye y publica el sitio automáticamente (~1 min).
3. Se verifica en la URL pública.

No hay paso de "subir" manual ni servidor que administrar. Cada *commit*
queda versionado y es reversible.

Cambios grandes (rediseños, páginas nuevas): hacerlos en una rama aparte
y fusionar a `main` con *Pull Request* revisado.

---

## 4. Editar contenido y código

| Qué cambia | Quién | Cómo |
|---|---|---|
| Textos, agenda, portafolio | Comunicaciones | Editar la **planilla Google Sheets**. El sitio la refleja. |
| Diseño / estructura | Equipo web | Editar los `.html`, `assets/css/styles.css` o `assets/js/main.js` → *commit*. |
| Imágenes | Equipo web | Optimizar (**< 300 KB**) y dejarlas en la subcarpeta de `assets/img/` que corresponda → *commit*. |
| Videos | Comunicaciones | Ver sección 6. |

Paso a paso para no-programadores: **`documentacion/guia-edicion.md`**.

---

## 5. Datos y fuentes externas

Cada bloque dinámico intenta leer una fuente externa **en vivo** y, si
falla, usa el archivo JSON local del repo como respaldo:

| Bloque | Fuente en vivo | Respaldo local |
|---|---|---|
| Textos | Google Apps Script (Google Sheet) | `contenido.json` |
| Portafolio | Google Sheets API v4 (hoja "Proyectos") | `portafolio-data.json` |
| Agenda | `rss2json.com` sobre el RSS de UDP | `agenda-data.json` |
| Catálogo / malla | — | `cursos/datos_catalogo/cursos.json` |

Detalle completo (URLs, claves, riesgos y recomendaciones) en
**`documentacion/respuestas-IT.txt`**, sección E.

Librerías de terceros vía CDN: GSAP + ScrollTrigger, gif.js, html2canvas
(ver `assets/vendor/LEEME.md`).

**El sitio NO tiene:** base de datos, backend, login, formularios que
envíen datos, cookies propias, analítica, Google Fonts, Google Maps ni
pasarela de pago.

---

## 6. Videos

Los 5 videos de fondo están hoy en `assets/video/` (~114 MB).

**Pendiente:** subirlos a **Vimeo** (o YouTube en `youtube-nocookie.com`)
e insertarlos embebidos, para no cargar el repositorio ni el ancho de
banda del sitio. Al hacerlo, quitar los `.mp4` del repo.

---

## 7. Revertir un cambio

Desde GitHub: abrir el historial, elegir el estado anterior y restaurarlo
(*revert*). El sitio se vuelve a publicar solo. No se requieren respaldos
manuales.

---

## 8. Pendientes para dejar la arquitectura operativa

1. Un *owner* de `disenoUDP` crea el repositorio y da acceso de escritura
   al equipo (los miembros no pueden crear repos en la organización).
2. Subir esta carpeta y activar GitHub Pages (**Settings → Pages**, servir
   desde la raíz de `main`).
3. Mover los videos a Vimeo / YouTube (sección 6).
4. Restringir la API key de Google Sheets (por dominio y a solo lectura).
5. Retirar el hosting provisorio de Netlify.
6. (Opcional) GitHub Actions para congelar el contenido de Sheets en los
   JSON y validar enlaces antes de publicar.

---

## 9. Documentación

- **`documentacion/respuestas-IT.txt`** — respuestas técnicas detalladas
  para IT / UDP (integración, procesos, tecnologías, despliegues,
  dependencias).
- **`documentacion/arquitectura.md`** — resumen de arquitectura.
- **`documentacion/guia-edicion.md`** — guía de edición y publicación.
