# Guía de edición y publicación

Para quien edita el sitio sin ser programador/a. No requiere usar la
consola/terminal.

---

## A. Cambiar textos, agenda o proyectos del portafolio

Esto **no toca el repositorio**.

1. Abrir la **planilla Google Sheets** correspondiente (pedir el enlace
   al equipo web si no se tiene).
2. Editar las celdas.
3. Guardar. Los cambios se reflejan en el sitio la próxima vez que un
   visitante carga la página (o en la próxima publicación, si se
   configura el "congelado" automático).

> Si la planilla no está disponible, el sitio muestra la última versión
> guardada en los archivos `contenido.json`, `portafolio-data.json` o
> `agenda-data.json` del repositorio.

---

## B. Cambiar un texto fijo, un enlace o una imagen del código

Se hace en GitHub, desde el navegador.

1. Entrar al repositorio en `github.com/disenoUDP/<repo>`.
2. Navegar al archivo (por ejemplo `index.html` o
   `assets/css/styles.css`).
3. Botón **lápiz** (Edit this file).
4. Hacer el cambio.
5. Abajo, en **Commit changes**: escribir una descripción corta
   (ej. "actualiza fecha de postulación") y confirmar.
6. En ~1 minuto el sitio queda publicado. Verificar en la URL pública.

Para varios cambios a la vez o algo delicado: usar **GitHub Desktop**
(aplicación con botones) o pedir apoyo al equipo web.

---

## C. Agregar o reemplazar una imagen

1. Optimizar la imagen antes de subirla: ancho máximo ~2000 px y peso
   **menor a 300 KB** (usar Squoosh, TinyPNG o similar).
2. Subirla a la subcarpeta que corresponda dentro de `assets/img/`:
   - noticia → `assets/img/noticias/`
   - programa / mención → `assets/img/programas/`
   - convenio → `assets/img/convenios/`
   - facultad → `assets/img/faad/`
   - portafolio → `assets/img/` (o `assets/img/provisorios/`)
   En GitHub: entrar a la carpeta → **Add file → Upload files**.
3. En el `.html` o `.json` donde va la imagen, apuntar a la ruta nueva,
   por ejemplo: `assets/img/noticias/mi-imagen.jpg`.
4. *Commit*.

---

## D. Cambiar un video

Los videos van en **Vimeo / YouTube**, no en el repositorio.

1. Subir el video a la cuenta de la Escuela en Vimeo (o YouTube).
2. Copiar el código de inserción (*embed*).
3. Reemplazar el `<iframe>` correspondiente en el `.html`.
4. *Commit*.

---

## E. Deshacer un cambio publicado

1. En el repositorio, pestaña **Commits**.
2. Abrir el commit que se quiere revertir.
3. Botón **Revert** → confirmar.
4. El sitio se republica solo con el estado anterior.

---

## F. Antes de confirmar un cambio, revisar

- ¿Las rutas de imágenes/enlaces son **relativas** (`assets/...`) y
  existen?
- ¿La imagen pesa menos de 300 KB?
- ¿El mensaje de *commit* describe qué se cambió?
