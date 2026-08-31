# assets/vendor/

Carpeta reservada para **librerías de terceros alojadas localmente**.

Hoy el sitio carga estas librerías desde el CDN `cdnjs.cloudflare.com`:

| Librería | Versión | Para qué |
|---|---|---|
| GSAP | 3.12.2 | animaciones al hacer scroll |
| ScrollTrigger (GSAP) | 3.12.2 | disparar animaciones según el scroll |
| gif.js | 0.2.0 | generar un GIF en el navegador |
| html2canvas | 1.4.1 | convertir un elemento de la página en imagen |

## Pendiente (recomendación de seguridad)

Descargar esos 4 archivos a esta carpeta, enlazarlos de forma local en el
HTML y agregar el atributo `integrity="sha384-..."` (hash SRI) para que el
navegador rechace un archivo alterado. Así se elimina la dependencia
externa y el riesgo de cadena de suministro.

Mientras esta carpeta esté vacía, el sitio sigue usando el CDN.
