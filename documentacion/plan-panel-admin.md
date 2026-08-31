# Plan de implementación — panel de administración + planillas

Modelo elegido: **sitio estático + Google Sheets (listas) + panel de
administración + GitHub Action de sincronización**, con una sola puerta
de entrada.

Este panel es una **capa que se agrega después** de tener el sitio
estático publicado. El sitio funciona durante todo el proceso.

---

## 1. Qué es cada pieza

| Pieza | Qué hace | Dónde vive |
|---|---|---|
| **Sitio estático** | Las páginas que ve el visitante | Repositorio + GitHub Pages |
| **Google Sheets** | Listas: proyectos, agenda, docentes, cursos | Google Workspace |
| **Panel `/admin`** | Formularios para imágenes, archivos y textos de página | Una página más del repositorio |
| **GitHub Action** | Robot que copia las planillas + formularios a los `.json` y republica | GitHub (se ejecuta solo) |

Ninguna pieza es un servidor ni una base de datos que haya que hostear
o parchar.

---

## 2. Elegir el panel (una de estas)

| Opción | Ventaja | A considerar |
|---|---|---|
| **Sveltia CMS** | Interfaz moderna, reemplazo directo de Decap, buen soporte de imágenes | Proyecto más nuevo |
| **Decap CMS** | Estándar, muy documentado | Interfaz más básica |
| **Pages CMS** (pagescms.org) | Hecho para GitHub, interfaz limpia | Config vía `.pages.yml` |

Las tres: gratis, viven en el repo, guardan cada cambio como commit,
inicio de sesión con GitHub. **Recomendado: Sveltia CMS.**

---

## 3. Tipos de contenido (colecciones del panel)

A definir con comunicaciones. Propuesta inicial:

| Colección | Campos | Sale hacia |
|---|---|---|
| Noticias | título, fecha, imagen, resumen, enlace | `noticias` (JSON) |
| Textos de portada | bloques de texto con formato | `contenido.json` |
| Textos "Nosotros" | historia, visión, cita, instalaciones | `contenido.json` |
| Convenios / programas | título, imagen, descripción | `contenido.json` |
| Biblioteca de imágenes | subida y organización de archivos | `assets/img/**` |

Las colecciones **Proyectos**, **Agenda**, **Docentes** y **Cursos**
se siguen editando en **Google Sheets** (no en el panel). El panel
muestra en su menú un enlace directo a cada planilla.

---

## 4. La GitHub Action de sincronización

Un archivo en `.github/workflows/sincronizar-contenido.yml`.

**Cuándo corre:**
- Programada: una vez al día (ej. 06:00).
- Manual: botón "Run workflow" en GitHub (equivale a "Publicar ahora").
- Opcional: cuando cambia algo en el panel.

**Qué hace, paso a paso:**
1. Lee cada Google Sheet publicada como CSV/JSON (o vía la API de Sheets
   con una credencial guardada como *secret* en GitHub).
2. Lee el RSS de eventos de UDP (`www.udp.cl/agenda-udp/feed/`).
3. Convierte todo a los archivos `contenido.json`,
   `portafolio-data.json`, `agenda-data.json`,
   `cursos/datos_catalogo/cursos.json`.
4. Si hubo cambios, hace commit → GitHub Pages republica.

**Credenciales:** la clave de acceso a Google se guarda en
`Settings → Secrets` del repositorio. Nunca en el código, nunca en el
navegador del visitante.

**Efecto:** el sitio deja de llamar a Google y a rss2json desde el
navegador del visitante. Menos dependencias externas, más seguro.

---

## 5. La "puerta única"

El panel `/admin` permite agregar enlaces en su menú lateral. Se
configura así:

```
Menú del panel:
  • Noticias                (formulario)
  • Textos de portada       (formulario)
  • Textos "Nosotros"       (formulario)
  • Biblioteca de imágenes  (archivos)
  ─────────────────────────
  → Planilla "Proyectos"    (abre Google Sheets)
  → Planilla "Agenda"       (abre Google Sheets)
  → Planilla "Docentes"     (abre Google Sheets)
  ─────────────────────────
  → Ver sitio publicado
  → Publicar ahora          (dispara la Action)
```

Se entra a un solo lugar, con un solo inicio de sesión.

---

## 6. Pasos de implementación (en orden)

1. **[Requisito]** Sitio estático completo en el repositorio + GitHub
   Pages activo. (En curso.)
2. Elegir el panel (Sveltia recomendado).
3. Agregar la carpeta `admin/` con `index.html` y `config.yml`
   (define las colecciones y los enlaces a las planillas).
4. Configurar el inicio de sesión con GitHub (OAuth).
5. Migrar los textos actuales de `contenido.json` a las colecciones
   del panel.
6. Escribir la GitHub Action de sincronización y guardar el *secret*
   de Google.
7. Ajustar el JavaScript del sitio para leer los `.json` regenerados
   (quitar las llamadas en vivo a Google y a rss2json).
8. Capacitar al equipo de comunicaciones (~30 min).
9. Retirar el hosting provisorio de Netlify.

---

## 7. Qué NO cambia

- El sitio sigue siendo estático en GitHub Pages.
- No hay servidor ni base de datos que mantener.
- Las planillas siguen siendo de Google y se editan igual.
- El mensaje para IT se mantiene: *"sitio estático; el contenido se
  edita en un panel y en planillas de Google; un proceso automático lo
  convierte en archivos versionados y republica; sin servidor, sin base
  de datos, sin servicio externo de contenidos."*
