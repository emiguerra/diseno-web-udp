# Arquitectura

Resumen. El detalle técnico para IT está en `respuestas-IT.txt`.
El plan de implementación del panel está en `plan-panel-admin.md`.

## Modelo (objetivo)

Sitio **estático** servido por GitHub Pages, con un **panel de
administración** para editar y las **planillas de Google** que se
mantienen para las listas. No hay servidor de aplicación ni base de
datos expuesta: todo el contenido son archivos versionados en el
repositorio.

```
   ┌──────────  PANEL /admin  (una sola puerta, un solo login)  ──────────┐
   │                                                                      │
   │  Formularios en el panel        Accesos directos a las planillas     │
   │  ─────────────────────          ───────────────────────────────      │
   │  • Imágenes / archivos          → Planilla "Proyectos"   (Google)    │
   │  • Textos de páginas            → Planilla "Agenda"      (Google)    │
   │  • Noticias                     → Planilla "Docentes"    (Google)    │
   └──────────────────────────────────────┬───────────────────────────────┘
                                          │
                     GitHub Action (programada o con botón):
                     lee las planillas y los formularios,
                     regenera los .json, hace commit
                                          │
                                          ▼
        Repositorio  ──►  GitHub Pages (CDN + HTTPS)  ──►  navegador
```

Diferencia clave con el modelo anterior: el visitante **ya no llama a
Google en vivo**. Un proceso automático (GitHub Action) copia las
planillas al repositorio y el sitio se republica. Las planillas siguen
siendo de Google y editables como siempre.

## Decisiones

| Tema | Decisión | Motivo |
|---|---|---|
| Tipo de sitio | Estático | Menor superficie de ataque; sin mantención de servidor ni plugins. Responde a la observación de seguridad de IT. |
| Repositorio | GitHub. Hoy en `emiguerra/diseno-web-udp` (personal); se transfiere a la organización `disenoUDP`. | Institucional, permisos por rol, historial y revisión de cambios. |
| Hosting | GitHub Pages | Gratis, CDN + HTTPS automáticos, sin infraestructura propia. |
| Edición de contenido | **Google Sheets (listas) + panel de administración headless (imágenes, archivos, textos de página)** | Se conserva la planilla que el equipo ya sabe usar y se suma un panel con formularios. Todo el contenido queda como archivos en el repo. |
| Panel | Decap / Sveltia / Pages CMS (se elige al implementar) | Vive dentro del propio repositorio; guarda cada cambio como commit. Sin servidor ni base de datos. |
| Sincronización | GitHub Action programada (o con botón "Publicar") | Copia las planillas y los formularios a los .json y republica. Reemplaza la lectura en vivo. |
| Videos | Vimeo / YouTube (embebidos) | No cargar el repositorio ni el ancho de banda del sitio. |
| Netlify | Provisorio, se retira | Cuenta personal; se usó para ver el avance mientras se define el repo institucional. |

## Quién edita qué

| Contenido | Dónde se edita | Formato en el repo |
|---|---|---|
| Listas y tablas: proyectos, agenda, docentes, cursos | Google Sheets | `.json` regenerado por la Action |
| Imágenes, videos, PDF | Panel `/admin` | archivos en `assets/` |
| Textos de las páginas (portada, "nosotros", etc.) | Panel `/admin` | `.json` / `.md` en el repo |

Regla: **tabla → planilla; archivo o texto de página → panel.**

## Flujo de datos (estado actual, hasta implementar la Action)

Cada bloque dinámico llama a su fuente externa y, si falla, usa el JSON
local del repositorio:

- Textos ← Google Apps Script  ·  respaldo `contenido.json`
- Portafolio ← Google Sheets API v4  ·  respaldo `portafolio-data.json`
- Agenda ← rss2json.com (RSS UDP)  ·  respaldo `agenda-data.json`

Al implementar la GitHub Action, estas llamadas en vivo se reemplazan
por los .json ya regenerados; el navegador del visitante deja de
contactar servicios externos.

## Recomendaciones abiertas

1. Implementar el panel + la GitHub Action de sincronización
   (ver `plan-panel-admin.md`).
2. Reemplazar `rss2json.com` por lectura propia del RSS en la Action.
3. Alojar las librerías JS localmente con hash SRI (`assets/vendor/`).
4. Restringir la API key de Google Sheets por dominio y a solo lectura
   (necesaria solo mientras exista la lectura en vivo).
5. Transferir el repositorio a la organización `disenoUDP`.
6. Mover los videos a Vimeo / YouTube.
