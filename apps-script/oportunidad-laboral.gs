/**
 * Recibe el formulario "Publicar oportunidad" (formularios/oportunidad-laboral.html).
 *
 * Instalación (una vez):
 *  1. script.google.com → Nuevo proyecto → pega este archivo.
 *  2. Ejecuta `preparar` una vez y acepta los permisos (crea la hoja de respuestas).
 *  3. Implementar → Nueva implementación → Aplicación web
 *       Ejecutar como: Yo   ·   Quién tiene acceso: Cualquier persona
 *  4. Copia la URL que termina en /exec y pégala en data-destino del <form>.
 *  Si cambias este código: Implementar → Administrar implementaciones → editar → Nueva versión.
 */
var AVISAR_A = [
  'barbara.gutierrez1@mail.udp.cl',
  'vcm.diseno@mail.udp.cl',
  'comunicaciones.diseno@mail.udp.cl'
];
var HOJA = 'Respuestas';

// Columnas: [encabezado, nombre del campo en el HTML]. Para agregar una pregunta,
// añade aquí una fila y su <input name="..."> en el HTML.
var CAMPOS = [
  ['Tipo', 'tipo'], ['Cargo ofrecido', 'cargo'], ['Empresa', 'empresa'],
  ['Modalidad', 'modalidad'], ['Jornada', 'jornada'], ['Ciudad', 'ciudad'],
  ['Descripción', 'descripcion'], ['Requisitos', 'requisitos'], ['Menciones', 'menciones'],
  ['¿Remunerado?', 'remunerado'], ['Condiciones', 'condiciones'],
  ['Fecha límite', 'fecha_limite'], ['Postular en', 'postular'],
  ['Portafolio / brochure', 'portafolio'],
  ['Publica', 'nombre'], ['Cargo de quien publica', 'cargo_publica'],
  ['Correo', 'correo'], ['Teléfono', 'telefono'], ['Acepta revisión', 'acepta']
];

function hoja_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  var ss = id ? SpreadsheetApp.openById(id)
              : SpreadsheetApp.create('Respuestas · Publica una oportunidad laboral · Escuela de Diseño UDP');
  if (!id) props.setProperty('SHEET_ID', ss.getId());
  var sh = ss.getSheetByName(HOJA) || ss.insertSheet(HOJA);
  if (sh.getLastRow() === 0) {
    sh.appendRow(['Fecha'].concat(CAMPOS.map(function (c) { return c[0]; })));
    sh.setFrozenRows(1);
  }
  return sh;
}

function preparar() { Logger.log(hoja_().getParent().getUrl()); }

function doPost(e) {
  var p = (e && e.parameters) || {};
  var v = function (k) { return (p[k] || []).join(', ').trim(); };
  // Antispam mínimo: campo trampa que los humanos no ven
  if (v('web')) return ok_();
  if (!v('cargo') || !v('empresa') || !v('correo')) return ok_();

  var fila = [new Date()].concat(CAMPOS.map(function (c) { return v(c[1]); }));
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try { hoja_().appendRow(fila); } finally { lock.releaseLock(); }

  var cuerpo = CAMPOS.map(function (c) { return c[0] + ': ' + v(c[1]); }).join('\n');
  MailApp.sendEmail({
    to: AVISAR_A.join(','),
    replyTo: v('correo'),
    subject: 'Nueva oportunidad: ' + v('cargo') + ' · ' + v('empresa'),
    body: cuerpo + '\n\nHoja: ' + hoja_().getParent().getUrl()
  });
  return ok_();
}

function ok_() {
  return ContentService.createTextOutput('ok');
}
