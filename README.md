# Sitio web — Escuela de Diseño UDP

Sitio **estático** (HTML + CSS + JavaScript, sin servidor ni base de datos)
de la Escuela de Diseño de la Universidad Diego Portales.

- **En línea:** https://emiguerra.github.io/diseno-web-udp/ (GitHub Pages,
  rama `main` / raíz).
- **Repositorio:** `emiguerra/diseno-web-udp` (cuenta personal, público);
  pendiente transferir a la organización GitHub `disenoUDP`.
- **Contenido editorial:** modelo híbrido — un **panel de administración**
  (`/admin`) para imágenes, archivos y textos de página, y **Google
  Sheets** para las listas (proyectos, agenda, docentes, cursos). Una
  GitHub Action sincroniza todo. Ver `documentacion/plan-panel-admin.md`.
  *(El panel y la Action aún no están implementados.)*

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
│   ├── plan-panel-admin.md        plan del panel /admin + planillas + Action
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

Regla: **tabla → planilla; archivo o texto de página → panel `/admin`.**

| Qué cambia | Quién | Cómo |
|---|---|---|
| Listas: proyectos, agenda, docentes, cursos | Comunicaciones | Editar la **planilla Google Sheets** (se abre desde el panel `/admin`). Una GitHub Action la convierte en JSON y republica. |
| Imágenes, archivos, textos de página | Comunicaciones | **Panel `/admin`** (formularios). El panel hace el *commit*. |
| Diseño / estructura | Equipo web | Editar los `.html`, `assets/css/styles.css` o `assets/js/main.js` → *commit*. |
| Videos | Comunicaciones | Ver sección 6. |

> El panel `/admin` aún no está implementado. Mientras tanto: los textos
> y el portafolio se editan directamente en los `.json` del repo; la
> agenda se sigue leyendo del RSS de UDP en vivo; imágenes y archivos se
> suben directamente al repo. Ver `documentacion/plan-panel-admin.md`.

Paso a paso para no-programadores: **`documentacion/guia-edicion.md`**.

---

## 5. Datos y fuentes externas

**Objetivo:** una GitHub Action regenera los `.json` desde las planillas
y el RSS de UDP en cada publicación; el navegador del visitante no
contacta servicios externos.

**Estado actual:** los textos y el portafolio se leen **de los archivos
`.json` del repo** (las llamadas en vivo a Google se quitaron por
seguridad — ver más abajo). Solo la agenda hace una llamada externa en
vivo:

| Bloque | Fuente | Nota |
|---|---|---|
| Textos | `contenido.json` (repo) | `_config.fuente` = `"local"` |
| Portafolio | `portafolio-data.json` (repo) | `SHEETS_API_URL` vacío |
| Agenda | `rss2json.com` sobre el RSS de UDP | única llamada externa en vivo; se quita con la Action |
| Catálogo / malla | `cursos/datos_catalogo/cursos.json` (repo) | — |

> **Nota de seguridad:** una API key de Google quedó en `assets/js/main.js`
> al subir el repo. Ya fue **eliminada en Google** y removida del código.
> Regla: **ninguna clave, token ni endpoint privado vive en el repo.** Los
> secretos van en *GitHub Actions secrets* y los usa la Action del lado del
> servidor. Detalle en `documentacion/respuestas-IT.txt`, sección E.

Librerías de terceros vía CDN: GSAP + ScrollTrigger, gif.js, html2canvas
(ver `assets/vendor/LEEME.md`).

**El sitio NO tiene:** base de datos, backend, login, formularios que
envíen datos, cookies propias, analítica, Google Fonts, Google Maps ni
pasarela de pago.

---

## 6. Videos

4 de los 5 videos de fondo están en `assets/video/`. **Falta
`Facultad.mp4` (69 MB)** — supera el límite de subida por web (25 MB); se
sube con **GitHub Desktop** o se pasa a Vimeo. Hasta entonces, el video
de fondo de `nosotros.html` da 404.

**Pendiente:** subir los 5 a **Vimeo** (o YouTube en
`youtube-nocookie.com`) e insertarlos embebidos, para no cargar el
repositorio ni el ancho de banda del sitio. Al hacerlo, quitar los `.mp4`
del repo.

---

## 7. Revertir un cambio

Desde GitHub: abrir el historial, elegir el estado anterior y restaurarlo
(*revert*). El sitio se vuelve a publicar solo. No se requieren respaldos
manuales.

---

## 8. Pendientes para dejar la arquitectura operativa

Hecho: sitio subido al repo · GitHub Pages activo · API key filtrada
eliminada en Google y removida del código.

1. Subir `Facultad.mp4` (69 MB) por GitHub Desktop, o pasarlo a Vimeo.
2. Cerrar la alerta de Secret Scanning en GitHub como *Revoked*.
3. Revisar el sitio renderizado en el navegador (no solo que cargue).
4. Transferir el repositorio a la organización `disenoUDP` y dar acceso
   de escritura al equipo.
5. Implementar el panel `/admin` + la GitHub Action de sincronización
   (ver `documentacion/plan-panel-admin.md`).
6. Quitar la llamada en vivo a `rss2json.com` (agenda) — la resuelve la
   Action.
7. Mover los videos a Vimeo / YouTube (sección 6).
8. Alojar las librerías JS en `assets/vendor/` con hash SRI.
9. Retirar el hosting provisorio de Netlify.

---

## 9. Documentación

- **`documentacion/respuestas-IT.txt`** — respuestas técnicas detalladas
  para IT / UDP (integración, procesos, tecnologías, despliegues,
  dependencias).
- **`documentacion/arquitectura.md`** — resumen de arquitectura.
- **`documentacion/plan-panel-admin.md`** — plan del panel de
  administración + planillas + GitHub Action.
- **`documentacion/guia-edicion.md`** — guía de edición y publicación.
