#!/usr/bin/env python3
"""
Scraper para el Catálogo de Asignaturas UDP 2026-01.
Extrae datos de cursos e imágenes del PDF.
Genera: datos/cursos.json, datos/cursos.csv, imagenes/
"""

import json
import csv
import re
import os
import io
from pathlib import Path
import pypdf
from PIL import Image

PDF_PATH = "Catálogo Cursos – diseño udp [26–1].pdf"
OUTPUT_DIR = Path("datos_catalogo")
IMAGES_DIR = OUTPUT_DIR / "imagenes"

# Páginas de intro/sección (se saltan en el parsing de cursos)
SECTION_HEADERS = {
    1: "portada",
    2: "indice",
    3: "intro_taller_iii",
    11: "intro_talleres_verticales",
    24: "intro_cursos_profundizacion",
    38: "intro_practicas_electivas",
    47: "intro_cursos_especializacion",
    57: "intro_seminario_titulo",
    64: "contraportada",
}

# Categorías según rangos de página
def get_category(page_num: int) -> str:
    if 4 <= page_num <= 10:
        return "Taller III"
    elif 12 <= page_num <= 23:
        return "Talleres Verticales"
    elif 25 <= page_num <= 37:
        return "Cursos de Profundización"
    elif 39 <= page_num <= 46:
        return "Prácticas Electivas"
    elif 48 <= page_num <= 56:
        return "Cursos de Especialización"
    elif 58 <= page_num <= 63:
        return "Seminario de Título"
    return "otro"


def clean(text: str) -> str:
    return " ".join(text.split()).strip()


def parse_course(text: str, page_num: int) -> dict:
    course = {
        "pagina": page_num,
        "categoria": get_category(page_num),
        "nombre_curso": "",
        "seccion": "",
        "nombre_taller": "",
        "profesores": "",
        "codigo": "",
        "horario": "",
        "instagram": "",
        "descripcion": "",
        "imagenes": [],
    }

    # Limpiar líneas de navegación y pie de página
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    lines = [l for l in lines
             if not re.match(r'^\d+\.\s+\S.+\d+/\d+$', l)
             and not re.search(r'Secretar[ií]a de Estudios', l)]

    full = "\n".join(lines)

    # Patrones de detección
    # field_re: inicio de campo de metadatos (excluyendo contenido descriptivo)
    field_re = re.compile(
        r'(?i)^(Profe?s[^:\n]*:|c[oó]digo:|horario:|instagram:?|@[\w.]|'
        r'contacto\s+para|informaci[oó]n\s+aqu[ií]|formulario\s+de)',
    )
    handle_re  = re.compile(r'^@[\w.]+$')
    email_re   = re.compile(r'^[\w.+-]+@[\w.-]+$')
    seccion_re = re.compile(r'(?i)secci[oó]n\s*\d+')

    # Identificar todas las líneas de metadatos para delimitar el bloque
    meta_indices = []
    for i, l in enumerate(lines):
        if field_re.match(l) or handle_re.match(l) or email_re.match(l):
            meta_indices.append(i)

    if meta_indices:
        meta_start = min(meta_indices)
        meta_end   = max(meta_indices)
    else:
        meta_start = len(lines)
        meta_end   = len(lines) - 1

    title_block = lines[:meta_start]
    desc_block  = lines[meta_end + 1:]

    # ── Layout invertido: descripción ANTES de la metadata ──
    # Se detecta cuando desc_block está vacío pero title_block tiene > 5 líneas
    if not desc_block and len(title_block) > 5:
        title_end = []
        for l in reversed(title_block):
            if re.search(r'[.,;:]$', l) or len(l) > 55:
                break
            title_end.insert(0, l)
        if title_end:
            cut = len(title_block) - len(title_end)
            desc_block  = title_block[:cut]
            title_block = title_end

    # ── Campos con regex sobre todo el texto ──
    m = re.search(r'(?i)c[oó]digo:?\s*([A-Z0-9_]+(?:\s+secci[oó]n\s*\d+)?)', full)
    if m:
        course["codigo"] = clean(m.group(1))

    horarios = re.findall(r'(?i)horario:?\s*([^\n]+)', full)
    if horarios:
        course["horario"] = "; ".join(clean(h) for h in horarios if clean(h))

    m = re.search(r'@[\w.]+', full)
    if m:
        course["instagram"] = m.group(0)

    # Profesores: anclar al inicio de línea para evitar falsos positivos en descripción
    m = re.search(
        r'(?im)^Profe?s[^:\n]*:?\s*([\s\S]+?)(?=\n(?:C[oó]digo:|Horario:|Instagram|@[\w]|Contacto))',
        full
    )
    if m:
        raw = m.group(1)
        raw = re.sub(r'(?i)(FAAD|Arquitectura|Arte|Diseño|Prof\.\s*[Aa]djunto)\s*:\s*', '', raw)
        profs = [clean(l) for l in raw.split("\n") if clean(l)]
        # Filtrar artefactos (líneas que son claramente descripción, no nombres)
        profs = [p for p in profs if len(p) < 60 and not re.search(r'[.;,]{2}', p)]
        course["profesores"] = clean(", ".join(profs))

    # ── Procesar title_block: nombre_curso / sección / nombre_taller ──
    before_sec, after_sec = [], []
    seccion_found = False
    for l in title_block:
        if seccion_re.match(l):
            course["seccion"] = clean(l)
            seccion_found = True
        elif not seccion_found:
            before_sec.append(l)
        else:
            after_sec.append(l)

    if course["seccion"]:
        if before_sec:
            course["nombre_curso"] = clean(" ".join(before_sec))
        if after_sec:
            course["nombre_taller"] = clean(" ".join(after_sec))
    else:
        course["nombre_taller"] = clean(" ".join(title_block))

    course["descripcion"] = clean(" ".join(desc_block))
    return course


# Correcciones manuales de nombres (clave: fragmento a buscar, valor: nombre final)
NOMBRE_OVERRIDES = {
    "Taller Internacional Europa": "Taller Internacional (Europa)",
}


def fix_ligatures(text: str) -> str:
    """Corrige ligaduras tipográficas del PDF (ﬁ→fi, ﬂ→fl, etc.)."""
    return (text
        .replace("ﬁ", "fi").replace("ﬂ", "fl")
        .replace("ﬀ", "ff").replace("ﬃ", "ffi").replace("ﬄ", "ffl")
    )


def normalize_profesores(raw: str) -> str:
    """
    Estandariza la lista de profesores como 'Nombre 01 + Nombre 02'.
    Limpia artefactos: 'Prof. Adjunto/a:', 'por confirmar', roles institucionales.
    """
    # Eliminar prefijos de roles
    raw = re.sub(r'(?i)\bProf\.?\s*Adjunt[ao]s?\s*:?\s*', '', raw)
    raw = re.sub(r'(?i)\b(FAAD|Arquitectura|Arte|Diseño)\s*:\s*', '', raw)

    # Separar por coma, "y " al inicio de token, o " + "
    partes = re.split(r'\s*,\s*|\s+y\s+|\s+\+\s+', raw)

    nombres = []
    for p in partes:
        p = clean(p)
        if not p:
            continue
        # Descartar fragmentos que no parecen un nombre
        if re.search(r'(?i)por\s+confirm|sin\s+asignar|a\s+confirm|tbd', p):
            continue
        if len(p) < 3:
            continue
        nombres.append(p)

    return " + ".join(nombres)


def normalize_seccion(seccion: str, codigo: str) -> str:
    """
    'SECCIÓN 1 - Gráfico' + 'DIS09211 sección 1'
    → 'DIS09211-01 · Diseño Gráfico'
    """
    if not seccion:
        return ""

    # Extraer número de sección
    num_match = re.search(r'\d+', seccion)
    num = f"{int(num_match.group()):02d}" if num_match else ""

    # Extraer mención (parte después del guion)
    mencion = re.sub(r'(?i)secci[oó]n\s*\d+\s*[-–]?\s*', '', seccion).strip()
    mencion = fix_ligatures(mencion)

    # Extraer código base (sin "sección X")
    codigo_base = re.sub(r'(?i)\s*secci[oó]n\s*\d+', '', codigo).strip()

    if codigo_base and num:
        return f"{codigo_base}-{num} · {mencion}" if mencion else f"{codigo_base}-{num}"
    elif mencion:
        return mencion
    return seccion


def normalize_course(course: dict) -> dict:
    """Aplica normalización estándar a todos los campos de texto."""
    # Ligaduras en todos los campos de texto (incluye profesores antes de normalizar)
    for field in ("nombre_taller", "nombre_curso", "descripcion", "seccion", "profesores"):
        course[field] = fix_ligatures(course[field])

    # Correcciones manuales de nombre_taller
    for fragment, override in NOMBRE_OVERRIDES.items():
        if fragment in course["nombre_taller"]:
            course["nombre_taller"] = override
            break

    # Profesores → Nombre 01 + Nombre 02
    course["profesores"] = normalize_profesores(course["profesores"])

    # Sección → código + mención
    course["seccion"] = normalize_seccion(course["seccion"], course["codigo"])

    return course


def is_template_element(w: int, h: int, data_size: int) -> bool:
    """Detecta banners y elementos de diseño del template (no son fotos de talleres).
    Criterio: imagen muy ancha (banner) con poco peso = elemento vectorial/decorativo."""
    if w == 0 or h == 0:
        return True
    ratio = w / h
    # Banners horizontales del template: 1802x880, 1892x284, etc.
    if ratio > 1.8 and data_size < 100_000:
        return True
    # Imágenes muy pequeñas (iconos, logos)
    if w < 100 or h < 100:
        return True
    return False


def extract_images(page, page_num: int, images_dir: Path) -> list[str]:
    candidates = []  # (jpeg_size, final_name, jpeg_bytes)
    try:
        res = page.get("/Resources")
        if not res:
            return []
        xobjects = res.get("/XObject")
        if not xobjects:
            return []

        for name in xobjects.keys():
            obj = xobjects[name]
            if obj.get("/Subtype") != "/Image":
                continue
            w = int(obj.get("/Width") or 0)
            h = int(obj.get("/Height") or 0)
            raw_data = obj.get_data()
            filt = obj.get("/Filter")

            if is_template_element(w, h, len(raw_data)):
                continue

            if filt == "/DCTDecode":
                # JPEG embebido: guardar directo
                jpeg_bytes = raw_data
            else:
                # Raw pixel data (FlateDecode, etc.) → convertir a JPEG con Pillow
                try:
                    bpc = int(obj.get("/BitsPerComponent") or 8)
                    cs = str(obj.get("/ColorSpace") or "/DeviceRGB")
                    mode = "RGB" if "RGB" in cs else "L"
                    # Para 16 bpc: escalar a 8 bpc tomando el byte alto
                    if bpc == 16:
                        raw_8 = bytes(raw_data[i] for i in range(0, len(raw_data), 2))
                    else:
                        raw_8 = raw_data
                    img = Image.frombytes(mode, (w, h), raw_8)
                    buf = io.BytesIO()
                    img.save(buf, format="JPEG", quality=85)
                    jpeg_bytes = buf.getvalue()
                except Exception as conv_err:
                    print(f"  [warn] conversión p{page_num} {name}: {conv_err}")
                    continue

            candidates.append((len(jpeg_bytes), jpeg_bytes))

        # Ordenar por tamaño desc: fotos reales pesan más que miniaturas
        candidates.sort(key=lambda x: x[0], reverse=True)
        saved = []
        for idx, (_, jpeg_bytes) in enumerate(candidates):
            final_name = f"p{page_num:02d}_{idx:02d}.jpg"
            with open(images_dir / final_name, "wb") as f:
                f.write(jpeg_bytes)
            saved.append(final_name)

    except Exception as e:
        print(f"  [warn] imagen p{page_num}: {e}")
        return []
    return saved


def main():
    OUTPUT_DIR.mkdir(exist_ok=True)
    IMAGES_DIR.mkdir(exist_ok=True)

    cursos = []

    with open(PDF_PATH, "rb") as f:
        reader = pypdf.PdfReader(f)
        total = len(reader.pages)
        print(f"PDF cargado: {total} páginas\n")

        for i, page in enumerate(reader.pages):
            page_num = i + 1

            # Saltar portadas e intros de sección
            if page_num in SECTION_HEADERS:
                print(f"  [skip] p{page_num}: {SECTION_HEADERS[page_num]}")
                continue

            cat = get_category(page_num)
            if cat == "otro":
                continue

            text = page.extract_text() or ""
            course = parse_course(text, page_num)
            course = normalize_course(course)

            # Extraer imágenes
            images = extract_images(page, page_num, IMAGES_DIR)
            course["imagenes"] = images

            cursos.append(course)
            print(f"  [ok]   p{page_num} [{cat}] — {course['nombre_curso'] or course['nombre_taller'] or '?'}")
            if images:
                print(f"         imágenes: {images}")

    # Guardar JSON
    json_path = OUTPUT_DIR / "cursos.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(cursos, f, ensure_ascii=False, indent=2)
    print(f"\nJSON guardado: {json_path} ({len(cursos)} cursos)")

    # Guardar CSV
    csv_path = OUTPUT_DIR / "cursos.csv"
    if cursos:
        fieldnames = [k for k in cursos[0].keys() if k != "imagenes"]
        fieldnames.append("imagenes")
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for c in cursos:
                row = {**c, "imagenes": "; ".join(c["imagenes"])}
                writer.writerow(row)
    print(f"CSV guardado:  {csv_path}")

    total_imgs = sum(len(c["imagenes"]) for c in cursos)
    print(f"Imágenes:      {total_imgs} archivos en {IMAGES_DIR}/")


if __name__ == "__main__":
    main()
