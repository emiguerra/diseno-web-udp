/* Formularios del sitio (oportunidad laboral, visita FAAD).
 *
 * La página tiene el diseño del formulario de proyectos, pero las respuestas
 * se envían al Google Form indicado en <form data-destino="…/formResponse">.
 * Cada campo lleva como name el identificador de su pregunta en el Google Form
 * (entry.123…). Así las respuestas quedan en la planilla del formulario y se
 * disparan los avisos por correo que ya están instalados ahí.
 *
 * Marcas en el HTML:
 *   required                   campo de texto obligatorio
 *   data-grupo-req="entry.X"   en un .tags-grid: hay que marcar al menos una opción
 *   data-fecha                 input type=date (se envía como año/mes/día)
 *   ?tipo=Valor en la URL      deja marcada esa opción en el campo [data-tipo]
 *   ?embed=1                   la página se muestra dentro de la ventana del sitio
 */
(function () {
  'use strict';

  var form = document.getElementById('formulario');
  var resumen = document.getElementById('error-summary');
  var estado = document.getElementById('statusMsg');
  var btn = document.getElementById('submitBtn');
  var params = new URLSearchParams(location.search);

  if (params.get('embed') === '1') document.body.classList.add('embebido');

  // Opción preseleccionada desde el botón que abrió el formulario
  var tipo = params.get('tipo');
  if (tipo) {
    document.querySelectorAll('[data-tipo] input').forEach(function (i) {
      if (i.value === tipo) i.checked = true;
    });
  }

  function etiqueta(el) {
    var campo = el.closest('.field');
    var lab = campo && campo.querySelector('label');
    return lab ? lab.textContent.replace('*', '').trim() : 'Campo';
  }

  function marcarError(el, msg, errores) {
    el.classList.add('error');
    var campo = el.closest('.field');
    var e = campo && campo.querySelector('.field-error');
    if (e) { e.textContent = msg; e.style.display = 'block'; }
    if (!el.id) el.id = 'campo-' + errores.length;
    errores.push({ id: el.id, texto: etiqueta(el) + ': ' + msg.toLowerCase() });
  }

  function validar() {
    var errores = [];
    form.querySelectorAll('.error').forEach(function (x) { x.classList.remove('error'); });
    form.querySelectorAll('.field-error').forEach(function (x) { x.style.display = 'none'; });

    form.querySelectorAll('input[required], textarea[required]').forEach(function (el) {
      if (el.type === 'checkbox') {
        if (!el.checked) marcarError(el, 'Debes aceptar para continuar.', errores);
      } else if (!el.value.trim()) {
        marcarError(el, 'Este campo es obligatorio.', errores);
      } else if (el.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value.trim())) {
        marcarError(el, 'Escribe un correo válido.', errores);
      }
    });
    form.querySelectorAll('[data-grupo-req]').forEach(function (g) {
      if (!g.querySelector('input:checked')) marcarError(g, 'Elige una opción.', errores);
    });

    if (errores.length) {
      resumen.innerHTML = '<p class="err-summary-title">Revisa ' + errores.length +
        (errores.length === 1 ? ' campo' : ' campos') + '</p><ul>' +
        errores.map(function (e) { return '<li><a href="#' + e.id + '">' + e.texto + '</a></li>'; }).join('') +
        '</ul>';
      resumen.style.display = 'block';
      resumen.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      resumen.style.display = 'none';
    }
    return !errores.length;
  }

  function datos() {
    var d = new URLSearchParams();
    form.querySelectorAll('[name^="entry."]').forEach(function (el) {
      if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) return;
      var v = el.value.trim();
      if (!v) return;
      if (el.hasAttribute('data-fecha')) {
        var p = v.split('-');               // aaaa-mm-dd
        d.append(el.name + '_year', p[0]);
        d.append(el.name + '_month', String(+p[1]));
        d.append(el.name + '_day', String(+p[2]));
      } else {
        d.append(el.name, v);
      }
    });
    return d;
  }

  form.addEventListener('input', function (e) {
    var el = e.target.closest('.error');
    if (el) el.classList.remove('error');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validar()) return;
    btn.disabled = true;
    document.getElementById('spinner').style.display = 'block';
    document.getElementById('btnArrow').style.display = 'none';
    estado.className = 'status';

    // Google Forms no permite leer la respuesta desde otra página (no-cors):
    // si la conexión funciona, el envío se da por recibido.
    fetch(form.dataset.destino, { method: 'POST', mode: 'no-cors', body: datos() })
      .then(function () {
        var correo = form.querySelector('input[type="email"]');
        var c = document.getElementById('confirm-email');
        if (c && correo) c.textContent = correo.value.trim();
        form.style.display = 'none';
        document.querySelector('.aviso-previo').style.display = 'none';
        document.getElementById('confirmacion').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(function () {
        estado.textContent = 'No pudimos enviar el formulario. Revisa tu conexión e inténtalo de nuevo.';
        estado.className = 'status error';
      })
      .then(function () {
        btn.disabled = false;
        document.getElementById('spinner').style.display = 'none';
        document.getElementById('btnArrow').style.display = '';
      });
  });

  document.getElementById('clearBtn').addEventListener('click', function () {
    form.reset();
    resumen.style.display = 'none';
    form.querySelectorAll('.error').forEach(function (x) { x.classList.remove('error'); });
    form.querySelectorAll('.field-error').forEach(function (x) { x.style.display = 'none'; });
  });

  document.getElementById('btnVolverFormulario').addEventListener('click', function () {
    form.reset();
    form.style.display = '';
    document.querySelector('.aviso-previo').style.display = '';
    document.getElementById('confirmacion').style.display = 'none';
    window.scrollTo({ top: 0 });
  });
})();
