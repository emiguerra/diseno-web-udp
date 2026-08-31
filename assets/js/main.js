        // 1. SISTEMA DE PÁGINAS (Navegación)
        // SUSCRIPCIÓN — control de acceso (demo)
        function desbloquearAcceso() {
            const gates = document.querySelectorAll('.subs-gate');
            const contents = document.querySelectorAll('.subs-content-locked');
            gates.forEach(g => g.style.display = 'none');
            contents.forEach(c => {
                c.style.display = 'block';
                c.classList.remove('subs-content-locked');
            });
        }

        function bloquearAcceso() {
            const gates = document.querySelectorAll('.subs-gate');
            const contents = document.querySelectorAll('[id$="-content"]');
            gates.forEach(g => g.style.display = '');
            contents.forEach(c => c.classList.add('subs-content-locked'));
        }

        function scrollToSeccion(id) {
            setTimeout(() => {
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            }, 50);
        }

        function goTo(id) {
            if (id === 'home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                scrollToSeccion(id);
            }
        }

        // 2. LÓGICA DEL HEADER (Baja opacidad al scroll, opacidad completa al hover)
        const header = document.getElementById('main-header');
        const scrollThreshold = 60;
        const videoHeight = () => window.innerHeight;
        const hasHero = !!document.getElementById('home');

        // Páginas sin hero arrancan con header sólido y no lo pierden
        if (!hasHero) header.classList.add('header-solid');

        window.addEventListener('scroll', () => {
            if (hasHero) {
                if (window.scrollY > videoHeight() - 100) {
                    header.classList.add('header-solid');
                } else {
                    header.classList.remove('header-solid');
                }
            }

            if (window.scrollY > scrollThreshold) {
                header.classList.add('header-dimmed');
            } else {
                header.classList.remove('header-dimmed');
            }
        });

        // Header sólido + dropdown pegado al bottom del header, alineado bajo su nav-item
        document.querySelectorAll('.nav-item').forEach(item => {
            const dropdown = item.querySelector('.dropdown');
            if (!dropdown) return;

            let hideTimer;

            function openDropdown() {
                clearTimeout(hideTimer);
                header.classList.add('header-dropdown-open');
                const headerBottom = header.getBoundingClientRect().bottom;
                const itemLeft = item.getBoundingClientRect().left;
                const dotOffset = 10; // dot (5px) + flex gap (5px)
                dropdown.style.top = headerBottom + 'px';
                dropdown.style.paddingLeft = (itemLeft + dotOffset) + 'px';
                item.classList.add('is-open');
            }

            function scheduleClose() {
                hideTimer = setTimeout(() => {
                    item.classList.remove('is-open');
                    header.classList.remove('header-dropdown-open');
                }, 150);
            }

            item.addEventListener('mouseenter', openDropdown);
            item.addEventListener('mouseleave', scheduleClose);
            dropdown.addEventListener('mouseenter', () => clearTimeout(hideTimer));
            dropdown.addEventListener('mouseleave', scheduleClose);
        });

        // 4. ARCHIVO — SISTEMA DE FILTROS DE 3 NIVELES
        const taxonomia = {
            grafico: {
                editorial:  ['tipografia', 'libro-artista', 'risografia', 'cartel'],
                identidad:  ['señaletica', 'branding', 'packaging'],
                imagen:     ['ilustracion', 'fotografia', 'halftone']
            },
            industrial: {
                producto:   ['mobiliario', 'accesorio', 'herramienta'],
                sistemas:   ['cnc', 'biomaterial', 'prototipado', 'fabricacion']
            },
            indumentaria2: {
                textil:     ['patronaje', 'tejido', 'coleccion', 'estampado'],
                indumentaria: ['costume', 'accesorios-moda']
            },
            interaccion: {
                digital:    ['ux-ui', 'motion', 'plataforma', 'hardware'],
                servicios:  ['investigacion', 'co-diseno', 'sistemas-info']
            }
        };

        const etiquetasFlujo = {
            editorial: 'Editorial', identidad: 'Identidad', imagen: 'Imagen',
            producto: 'Producto', sistemas: 'Sistemas',
            textil: 'Textil', indumentaria: 'Indumentaria',
            digital: 'Digital', servicios: 'Servicios'
        };
        const etiquetasSub = {
            'tipografia':'Tipografía','libro-artista':'Libro de artista','risografia':'Risografía','cartel':'Cartel / Póster',
            'señaletica':'Señalética','branding':'Branding','packaging':'Packaging',
            'ilustracion':'Ilustración','fotografia':'Fotografía','halftone':'Halftone',
            'mobiliario':'Mobiliario','accesorio':'Accesorio','herramienta':'Herramienta',
            'cnc':'CNC','biomaterial':'Biomaterial','prototipado':'Prototipado','fabricacion':'Fabricación digital',
            'patronaje':'Patronaje','tejido':'Tejido experimental','coleccion':'Colección',
            'estampado':'Estampado','costume':'Costume','accesorios-moda':'Accesorios',
            'ux-ui':'UX/UI','motion':'Motion','plataforma':'Plataforma','hardware':'Hardware / Tangible',
            'investigacion':'Investigación','co-diseno':'Co-diseño','sistemas-info':'Sistemas de info'
        };

        // Ocultar items extra (del 6 en adelante) al cargar
        const LIMITE_VISIBLE = 50;
        let archExpandido = false;

        function initArchivo() {
            const items = document.querySelectorAll('.arch-item');
            items.forEach((item, i) => {
                if (i >= LIMITE_VISIBLE) item.classList.add('arch-oculto-extra');
            });
        }

        function toggleArchivo() {
            archExpandido = !archExpandido;
            const items = document.querySelectorAll('.arch-item');
            const btn   = document.getElementById('arch-vermás-btn');
            const icono = document.getElementById('arch-vermás-icono');

            items.forEach((item, i) => {
                if (i >= LIMITE_VISIBLE) {
                    item.classList.toggle('arch-oculto-extra', !archExpandido);
                }
            });

            btn.childNodes[0].textContent = archExpandido ? 'Ver menos ' : 'Ver más proyectos ';
            icono.textContent = archExpandido ? '↑' : '↓';
            filtrarProyectos();
            ScrollTrigger.refresh();
        }

        initArchivo();

        // Reintentar imágenes Drive que fallen (máx 3 veces, con backoff)
        document.querySelectorAll('img[referrerpolicy="no-referrer"]').forEach(img => {
            let retries = 0;
            img.addEventListener('error', function retry() {
                if (retries >= 3) { img.dataset.error = '1'; return; }
                retries++;
                const src = img.src;
                setTimeout(() => { img.src = ''; img.src = src; }, retries * 1500);
            });
        });

        let filtroN1 = 'todas';

        function seleccionarN1(btn) {
            filtroN1 = btn.dataset.n1;
            document.querySelectorAll('#pills-n1 .arch-pill').forEach(p => p.classList.remove('activa'));
            btn.classList.add('activa');
            filtrarProyectos();
        }

        function filtrarProyectos() {
            const texto = document.getElementById('arch-search-input').value.toLowerCase().trim();
            const keywords = texto.split(/\s+/).filter(Boolean);
            const items = document.querySelectorAll('.arch-item');
            let visibles = 0;
            let total = 0;

            items.forEach(item => {
                if (item.classList.contains('arch-oculto-extra')) {
                    item.classList.remove('oculto');
                    return;
                }

                total++;
                const m = item.dataset.mencion || '';
                const f = item.dataset.flujo   || '';
                const s = item.dataset.sub     || '';
                const t = (item.dataset.titulo  || '').toLowerCase();
                const tags = Array.from(item.querySelectorAll('.arch-tag'))
                                  .map(el => el.textContent.toLowerCase()).join(' ');
                const haystack = `${t} ${m} ${f} ${s} ${tags}`;

                const okMencion  = filtroN1 === 'todas' || m === filtroN1;
                const okKeywords = keywords.length === 0 || keywords.every(k => haystack.includes(k));

                if (okMencion && okKeywords) {
                    item.classList.remove('oculto');
                    visibles++;
                } else {
                    item.classList.add('oculto');
                }
            });

            document.getElementById('arch-contador').textContent =
                `Mostrando ${visibles} de ${total} proyectos`;
        }

        function registrarCursorPills() {
            document.querySelectorAll('.arch-pill').forEach(el => {
                el.addEventListener('mouseenter', () => {
                    gsap.to('#cursor',          { scale: 3,   duration: 0.25 });
                    gsap.to('#cursor-follower', { opacity: 0, duration: 0.2 });
                });
                el.addEventListener('mouseleave', () => {
                    gsap.to('#cursor',          { scale: 1,   duration: 0.25 });
                    gsap.to('#cursor-follower', { opacity: 1, duration: 0.2 });
                });
            });
        }
        registrarCursorPills();

        // 3. VIDEO HERO — empieza en segundo 7
        const heroVid = document.getElementById('hero-vid');
        if (heroVid) {
            heroVid.addEventListener('loadedmetadata', () => {
                heroVid.currentTime = 7;
            });
            // fallback por si ya está cargado
            if (heroVid.readyState >= 1) heroVid.currentTime = 7;
        }

        // 4. CARRUSEL — PROYECTOS DESTACADOS (navegación por botones, scroll vertical libre)
        gsap.registerPlugin(ScrollTrigger);

        function initHscrollGaleria(pinId, trackId, progressId) {
            const pin    = document.getElementById(pinId);
            const htrack = document.getElementById(trackId);
            const hdots  = document.querySelectorAll('#' + progressId + ' .hscroll-dot');
            if (!htrack || !pin) return;

            const slides    = htrack.querySelectorAll('.hscroll-slide');
            const numSlides = slides.length;
            if (numSlides < 2) return;

            let current = 0;
            let timer   = null;

            function goTo(idx) {
                current = ((idx % numSlides) + numSlides) % numSlides;
                htrack.style.transform = `translateX(calc(${-current} * 100vw))`;
                hdots.forEach((d, i) => d.classList.toggle('activo', i === current));
            }

            function startAuto() {
                clearInterval(timer);
                timer = setInterval(() => goTo(current + 1), 4000);
            }

            // Dots clickeables — reinician el timer
            hdots.forEach((dot, i) => dot.addEventListener('click', () => {
                goTo(i);
                startAuto();
            }));

            // Swipe táctil — reinicia el timer
            let tx = 0;
            pin.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
            pin.addEventListener('touchend',   e => {
                const dx = e.changedTouches[0].clientX - tx;
                if (Math.abs(dx) > 50) { goTo(current + (dx < 0 ? 1 : -1)); startAuto(); }
            });

            goTo(0);
            startAuto();
        }

        initHscrollGaleria('hscroll-pin', 'hscroll-track', 'hscroll-progress');
        initHscrollGaleria('hscroll-pin-instal', 'hscroll-track-instal', 'hscroll-progress-instal');

        // 4. CURSOR PERSONALIZADO
        gsap.set('#cursor',          { xPercent: -50, yPercent: -50 });
        gsap.set('#cursor-follower', { xPercent: -50, yPercent: -50 });

        const _cursorEl   = document.getElementById('cursor');
        const _followerEl = document.getElementById('cursor-follower');
        const _darkZones = [...document.querySelectorAll('.site-footer, [data-cursor-light]')];

        document.addEventListener('mousemove', (e) => {
            gsap.set('#cursor',         { x: e.clientX, y: e.clientY });
            gsap.to('#cursor-follower', { x: e.clientX, y: e.clientY, duration: 0.18, ease: 'power2.out' });

            const overDark = _darkZones.some(el => {
                const r = el.getBoundingClientRect();
                return e.clientX >= r.left && e.clientX <= r.right &&
                       e.clientY >= r.top  && e.clientY <= r.bottom;
            });
            _cursorEl.classList.toggle('cursor-light', overDark);
            _followerEl.classList.toggle('cursor-light', overDark);
        });
        // Iframe del organigrama captura el mouse: ocultar cursor custom al entrar, restaurar al salir
        const _orgIframe = document.querySelector('.cons-iframe-wrap iframe');
        if (_orgIframe) {
            _orgIframe.addEventListener('mouseenter', () => {
                gsap.to([_cursorEl, _followerEl], { opacity: 0, duration: 0.12, overwrite: true });
            });
            _orgIframe.addEventListener('mouseleave', () => {
                gsap.to([_cursorEl, _followerEl], { opacity: 1, duration: 0.18, overwrite: true });
                // Forzar reposicionamiento en el siguiente mousemove
            });
        }

        document.querySelectorAll('a, button, .btn, .logo, .main-nav a, .project-cell, .malla-tab').forEach(el => {
            el.addEventListener('mouseenter', () => {
                gsap.to('#cursor',          { scale: 3,   duration: 0.25 });
                gsap.to('#cursor-follower', { opacity: 0, duration: 0.2 });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to('#cursor',          { scale: 1,   duration: 0.25 });
                gsap.to('#cursor-follower', { opacity: 1, duration: 0.2 });
            });
        });

        /* 5. MALLA INTERACTIVA — funciones */
        (function() {
            const overlay = document.getElementById('mi-popup-overlay');
            if (overlay) {
                overlay.addEventListener('click', e => { if (e.target === overlay) cerrarDetalles(); });
            }
            const mcOverlay = document.getElementById('mc-overlay');
            if (mcOverlay) {
                mcOverlay.addEventListener('click', e => { if (e.target === mcOverlay) cerrarMCPopup(); });
            }
            document.addEventListener('keydown', e => {
                if (e.key !== 'Escape') return;
                if (overlay && overlay.classList.contains('abierto')) cerrarDetalles();
                if (mcOverlay && mcOverlay.classList.contains('abierto')) cerrarMCPopup();
            });
        })();

        /* =========================================
           POPUP RAMO — lógica de apertura
        ========================================= */
        document.addEventListener('DOMContentLoaded', function() {
        (function() {
            const rcOverlay = document.getElementById('rc-overlay');
            const rcClose   = document.getElementById('rc-close');
            if (!rcOverlay) return;

            const TIPO_MAP = {
                'mi-tipo-taller':   { label: 'Taller / Laboratorio', cr: '8',   area: 'Proyectual' },
                'mi-tipo-electivo': { label: 'Electivo de mención',  cr: '5',   area: 'Especialización' },
                'mi-tipo-cfgral':   { label: 'Formación general',    cr: '5',   area: 'Humanidades' },
                'mi-tipo-especial': { label: 'Especial',             cr: '8',   area: 'Formación especial' },
                'mi-tipo-ingles':   { label: 'Inglés',               cr: '5',   area: 'Idiomas' },
                'mi-tipo-regular':  { label: 'Regular',              cr: '4–5', area: 'Disciplinar' },
            };

            const COMP_MAP = {
                'mi-tipo-taller':   ['Pensamiento proyectual','Experimentación','Trabajo en equipo','Prototipado'],
                'mi-tipo-regular':  ['Análisis crítico','Comunicación visual','Síntesis conceptual'],
                'mi-tipo-electivo': ['Especialización','Autonomía','Investigación aplicada'],
                'mi-tipo-cfgral':   ['Contexto social','Pensamiento crítico','Comunicación oral y escrita'],
                'mi-tipo-ingles':   ['Comunicación internacional','Lectura técnica','Vocabulario disciplinar'],
                'mi-tipo-especial': ['Integración','Síntesis','Presentación profesional'],
            };

            const METOD_MAP = {
                'mi-tipo-taller':   ['Taller presencial','Crítica colectiva','Entrega de proyecto'],
                'mi-tipo-regular':  ['Clase expositiva','Ejercicios prácticos','Pruebas evaluativas'],
                'mi-tipo-electivo': ['Seminario','Portfolio','Exposición'],
                'mi-tipo-cfgral':   ['Lectura','Debate','Ensayo'],
                'mi-tipo-ingles':   ['Conversación','Escritura académica','Listening'],
                'mi-tipo-especial': ['Proyecto integrado','Presentación pública','Memoria escrita'],
            };

            const RESULTADOS_MAP = {
                'mi-tipo-taller':   [
                    'Desarrollar proyectos de diseño con rigor conceptual y técnico.',
                    'Aplicar metodologías de diseño centradas en la persona.',
                    'Comunicar propuestas de manera efectiva ante una audiencia crítica.',
                    'Trabajar en equipo en contextos multidisciplinarios.',
                ],
                'mi-tipo-regular':  [
                    'Analizar fenómenos visuales y culturales desde perspectivas disciplinares.',
                    'Aplicar conocimientos teóricos al proceso proyectual.',
                    'Producir argumentos críticos y fundamentados sobre el diseño.',
                ],
                'mi-tipo-electivo': [
                    'Profundizar en un área específica de la mención.',
                    'Desarrollar un proyecto autónomo con criterio investigativo.',
                    'Relacionar la especialización con el entorno profesional y cultural.',
                ],
                'mi-tipo-cfgral':   [
                    'Comprender el diseño en relación al contexto social y cultural.',
                    'Articular posturas críticas mediante escritura y argumentación.',
                ],
                'mi-tipo-ingles':   [
                    'Leer y comprender textos técnicos en inglés.',
                    'Participar en conversaciones profesionales básicas.',
                ],
                'mi-tipo-especial': [
                    'Integrar competencias del programa en un proyecto final.',
                    'Presentar resultados ante jurado externo con solvencia profesional.',
                    'Documentar el proceso en una memoria escrita.',
                ],
            };

            function getTipoKey(cell) {
                for (const k of Object.keys(TIPO_MAP)) {
                    if (cell.classList.contains(k)) return k;
                }
                return 'mi-tipo-regular';
            }

            function makePills(container, items) {
                container.innerHTML = '';
                items.forEach(t => {
                    const s = document.createElement('span');
                    s.className = 'rc-pill';
                    s.textContent = t;
                    container.appendChild(s);
                });
            }

            function abrirRamo(cell) {
                const nombre = cell.dataset.nombre || 'Ramo sin nombre';
                const desc   = cell.dataset.desc   || 'Descripción no disponible para este ramo.';

                // Semestre desde grid-column del style
                const colStyle = cell.style.gridColumn || '';
                const colMatch = colStyle.match(/^(\d+)/);
                const sem = colMatch ? parseInt(colMatch[1]) : null;

                const tipoKey  = getTipoKey(cell);
                const tipoData = TIPO_MAP[tipoKey];

                // Identidad
                document.getElementById('rc-nombre').textContent   = nombre;
                document.getElementById('rc-tipo-tag').textContent = tipoData.label;
                document.getElementById('rc-cr-tag').textContent   = tipoData.cr + ' cr';
                document.getElementById('rc-sem-tag').textContent  = sem ? 'Sem. ' + sem : '';

                // Descripción
                document.getElementById('rc-desc').textContent = desc;

                // Meta
                document.getElementById('rc-meta-sem').textContent  = sem ? 'Semestre ' + sem : '—';
                document.getElementById('rc-meta-cr').textContent   = tipoData.cr + ' créditos';
                document.getElementById('rc-meta-tipo').textContent = tipoData.label;
                document.getElementById('rc-meta-area').textContent = tipoData.area;

                // Pills
                makePills(document.getElementById('rc-comp'),   COMP_MAP[tipoKey]   || []);
                makePills(document.getElementById('rc-metod'),  METOD_MAP[tipoKey]  || []);

                // Visual label
                document.getElementById('rc-visual-label').textContent = nombre + ' — ' + tipoData.area;

                // Resultados de aprendizaje
                const rl = document.getElementById('rc-resultados-list');
                rl.innerHTML = '';
                (RESULTADOS_MAP[tipoKey] || []).forEach(r => {
                    const li = document.createElement('li');
                    li.textContent = r;
                    rl.appendChild(li);
                });

                rcOverlay.classList.add('abierto');
                document.body.style.overflow = 'hidden';
            }

            // Cerrar
            rcClose.addEventListener('click', () => {
                rcOverlay.classList.remove('abierto');
                document.body.style.overflow = '';
            });
            rcOverlay.addEventListener('click', e => {
                if (e.target === rcOverlay) {
                    rcOverlay.classList.remove('abierto');
                    document.body.style.overflow = '';
                }
            });
            document.addEventListener('keydown', e => {
                if (e.key === 'Escape' && rcOverlay.classList.contains('abierto')) {
                    rcOverlay.classList.remove('abierto');
                    document.body.style.overflow = '';
                }
            });
        })();
        }); // DOMContentLoaded

        // Carga agenda al iniciar
        document.addEventListener('DOMContentLoaded', cargarAgenda);

        /* =============================================
           MALLA INTERACTIVA — MENCIONES Y FILTROS
           ============================================= */
        const MENCIONES_MI = {
            grafico:      { label: 'Diseño Gráfico' },
            industrial:   { label: 'Diseño Industrial' },
            interaccion:  { label: 'Diseño de Interacción' },
            indumentaria: { label: 'Diseño Textil e Indumentaria' }
        };

        let modoDoble = false;
        const mencionesActivas = [];

        function celdasCamino() {
            return document.querySelectorAll('.malla-interactiva .mi-tipo-taller, .malla-interactiva .mi-tipo-electivo');
        }

        function mallaToggleDoble(btn) {
            modoDoble = !modoDoble;
            const controles = document.getElementById('malla-controles');
            controles.classList.toggle('modo-doble', modoDoble);
            btn.classList.toggle('activo', modoDoble);
            if (modoDoble) {
                document.querySelector('.mi-filtro-btn[data-filtro=""]').classList.remove('activo');
            } else {
                mencionesActivas.length = 0;
                document.querySelectorAll('.mi-filtro-btn').forEach(b => { if (b !== btn) b.classList.remove('activo'); });
                document.querySelector('.mi-filtro-btn[data-filtro=""]').classList.add('activo');
            }
            aplicarCamino();
            actualizarInfo();
        }

        function mallaFiltrar(btn) {
            const filtro = btn.dataset.filtro;
            if (!filtro) {
                if (modoDoble) {
                    modoDoble = false;
                    document.getElementById('malla-controles').classList.remove('modo-doble');
                    document.querySelector('.mi-filtro-doble').classList.remove('activo');
                }
                mencionesActivas.length = 0;
                document.querySelectorAll('.mi-filtro-btn').forEach(b => b.classList.remove('activo'));
                btn.classList.add('activo');
                aplicarCamino();
                actualizarInfo();
                return;
            }
            if (modoDoble) {
                const idx = mencionesActivas.indexOf(filtro);
                if (idx > -1) {
                    mencionesActivas.splice(idx, 1);
                    btn.classList.remove('activo');
                } else {
                    if (mencionesActivas.length >= 2) {
                        const primero = mencionesActivas.shift();
                        const btnPrev = document.querySelector(`.mi-filtro-btn[data-filtro="${primero}"]`);
                        if (btnPrev) btnPrev.classList.remove('activo');
                    }
                    mencionesActivas.push(filtro);
                    btn.classList.add('activo');
                }
            } else {
                mencionesActivas.length = 0;
                mencionesActivas.push(filtro);
                document.querySelectorAll('.mi-filtro-btn').forEach(b => b.classList.remove('activo'));
                btn.classList.add('activo');
            }
            aplicarCamino();
            actualizarInfo();
        }

        function aplicarCamino() {
            const electivos = document.querySelectorAll('.malla-interactiva .mi-tipo-electivo');
            const camino = celdasCamino();
            document.querySelectorAll('.mi-camino').forEach(c => c.classList.remove('mi-camino'));
            document.querySelectorAll('.mi-h-grafico,.mi-h-industrial,.mi-h-interaccion,.mi-h-indumentaria')
                .forEach(c => c.classList.remove('mi-h-grafico','mi-h-industrial','mi-h-interaccion','mi-h-indumentaria'));
            if (mencionesActivas.length === 0) {
                electivos.forEach(cell => {
                    const nameEl = cell.querySelector('.mi-cell-name');
                    if (nameEl) nameEl.textContent = 'Electivo de mención';
                    cell.dataset.nombre = 'Electivo de mención';
                });
                return;
            }
            const claseColor = 'mi-h-' + mencionesActivas[0];
            camino.forEach(cell => cell.classList.add('mi-camino', claseColor));
            electivos.forEach(cell => {
                const partes = mencionesActivas.map(m => (cell.dataset[m] || 'Electivo').replace(/^Electivo\s+/, ''));
                const texto = mencionesActivas.length > 1
                    ? 'Electivo ' + partes.join(' / ')
                    : (cell.dataset[mencionesActivas[0]] || 'Electivo de mención');
                const nameEl = cell.querySelector('.mi-cell-name');
                if (nameEl) nameEl.textContent = texto;
                cell.dataset.nombre = texto;
            });
        }

        function actualizarInfo() {
            const info = document.getElementById('mi-filtro-info');
            if (!info) return;
            if (modoDoble) {
                if (mencionesActivas.length === 0) info.innerHTML = 'Modo doble mención · selecciona dos menciones';
                else if (mencionesActivas.length === 1) info.innerHTML = 'Selecciona la segunda mención';
                else info.innerHTML = mencionesActivas.map(m => MENCIONES_MI[m].label).join(' + ');
            } else {
                info.innerHTML = '';
            }
        }

        /* ── Catálogo de cursos scrapeado ── */
        var _catalogData = null;
        var _currentCatCursos = [];
        var _currentCatMallaNombre = '';
        var IMGS_BASE_MALLA = 'cursos/datos_catalogo/imagenes/';

        fetch('cursos/datos_catalogo/cursos.json')
            .then(r => r.json())
            .then(data => { _catalogData = data; })
            .catch(() => { _catalogData = []; });

        function mostrarDetalles(cell) {
            abrirMCPopup(cell);
        }

        function _renderCatalogList(scroll, mallaNombre, cat, cursos) {
            const cards = cursos.map((c, idx) => {
                const imgSrc = c.imagenes && c.imagenes[0] ? `${IMGS_BASE_MALLA}${c.imagenes[0]}` : null;
                const imgEl = imgSrc
                    ? `<img class="crs-card-img" src="${imgSrc}" alt="${c.nombre_taller || ''}" loading="lazy">`
                    : `<div class="crs-card-img-empty"></div>`;
                const sec  = c.seccion    ? `<div class="crs-card-sec">${c.seccion}</div>` : '';
                const prof = c.profesores ? `<div class="crs-card-prof">${c.profesores}</div>` : '';
                return `<div class="crs-card" onclick="abrirDetalleCurso(${idx})">
                    ${imgEl}
                    <div class="crs-card-body">
                        ${sec}
                        <div class="crs-card-taller">${c.nombre_taller || c.nombre_curso}</div>
                        ${prof}
                    </div>
                </div>`;
            }).join('');

            scroll.innerHTML = `
                <span class="crs-cat-tag">${cat}</span>
                <h2 class="crs-popup-grid-title">${mallaNombre}</h2>
                <p class="crs-popup-grid-meta">${cursos.length} sección${cursos.length !== 1 ? 'es' : ''} · Catálogo 2026–1</p>
                <div class="crs-cards-grid">${cards}</div>`;
            scroll.scrollTop = 0;
        }

        function abrirDetalleCurso(idx) {
            const c = _currentCatCursos[idx];
            if (!c) return;
            const scroll = document.getElementById('mi-popup-scroll');
            const headerTitle = document.querySelector('.mi-popup-header-title');
            if (headerTitle) headerTitle.textContent = c.nombre_taller || c.nombre_curso;

            const imgSrc = c.imagenes && c.imagenes[0] ? `${IMGS_BASE_MALLA}${c.imagenes[0]}` : null;
            const heroEl = imgSrc ? `<img class="crs-detail-hero" id="crs-hero-img" src="${imgSrc}" alt="${c.nombre_taller || ''}">` : '';

            const thumbsEl = c.imagenes && c.imagenes.length > 1
                ? `<div class="crs-detail-thumbs">${c.imagenes.map((img, i) =>
                    `<img class="crs-detail-thumb${i === 0 ? ' activo' : ''}" src="${IMGS_BASE_MALLA}${img}"
                         onclick="_switchHero(this, '${IMGS_BASE_MALLA}${img}')" loading="lazy">`
                ).join('')}</div>` : '';

            const fields = [
                c.profesores && { label: c.profesores.includes('+') ? 'Docentes' : 'Docente', value: c.profesores },
                c.seccion    && { label: 'Sección',   value: c.seccion },
                c.codigo     && { label: 'Código',    value: c.codigo.replace(/\s*secci[oó]n\s*\d+/i, '').trim() },
                c.horario    && { label: 'Horario',   value: c.horario },
                c.instagram  && { label: 'Instagram', value: c.instagram },
            ].filter(Boolean).map(f =>
                `<div class="crs-detail-field"><span class="crs-detail-label">${f.label}</span><span class="crs-detail-value">${f.value}</span></div>`
            ).join('');

            const descEl = c.descripcion
                ? `<div class="crs-detail-field" style="margin-top:28px"><span class="crs-detail-label">Descripción</span><p class="crs-detail-desc">${c.descripcion}</p></div>`
                : '';

            scroll.innerHTML = `
                <button class="crs-back-btn" onclick="_volverListaCursos()">← Volver a ${c.categoria}</button>
                ${heroEl}
                <div class="crs-detail-layout">
                    <div>
                        <div class="crs-detail-cat">${c.categoria}${c.seccion ? ' · ' + c.seccion : ''}</div>
                        <h2 class="crs-detail-taller">${c.nombre_taller || c.nombre_curso}</h2>
                        ${c.nombre_curso ? `<div class="crs-detail-curso-nombre">${c.nombre_curso}</div>` : ''}
                        ${descEl}
                        ${thumbsEl}
                    </div>
                    <div class="crs-detail-sidebar">${fields}</div>
                </div>`;
            scroll.scrollTop = 0;
        }

        function _volverListaCursos() {
            const scroll = document.getElementById('mi-popup-scroll');
            const headerTitle = document.querySelector('.mi-popup-header-title');
            const cat = _currentCatCursos[0] ? _currentCatCursos[0].categoria : '';
            if (headerTitle) headerTitle.textContent = cat ? cat + ' — Catálogo 2026–1' : 'Catálogo 2026–1';
            _renderCatalogList(scroll, _currentCatMallaNombre, cat, _currentCatCursos);
        }

        function _switchHero(thumbEl, src) {
            const hero = document.getElementById('crs-hero-img');
            if (hero) hero.src = src;
            document.querySelectorAll('.crs-detail-thumb').forEach(t => t.classList.remove('activo'));
            thumbEl.classList.add('activo');
        }

        function cerrarDetalles() {
            const overlay = document.getElementById('mi-popup-overlay');
            if (overlay) overlay.classList.remove('abierto');
            document.body.style.overflow = '';
        }

        /* =========================================
           POPUP MADRE DE CURSOS (mc-)
        ========================================= */
        const _MC_COLS = {
            1:{ciclo:'Ciclo Inicial',semLabel:'Semestre 1'},
            2:{ciclo:'Ciclo Inicial',semLabel:'Semestre 2'},
            3:{ciclo:'Ciclo Inicial',semLabel:'Semestre 3'},
            4:{ciclo:'Ciclo Inicial',semLabel:'Semestre 4'},
            5:{ciclo:'Ciclo Licenciatura',semLabel:'Semestre 5'},
            6:{ciclo:'Ciclo Licenciatura',semLabel:'Semestre 6'},
            7:{ciclo:'Ciclo Licenciatura',semLabel:'Semestre 7'},
            8:{ciclo:'Ciclo Licenciatura',semLabel:'Semestre 8'},
            9:{ciclo:'Ciclo Profesional',semLabel:'Semestre 9'},
            10:{ciclo:'Ciclo Profesional',semLabel:'Semestre 10'},
        };
        let _mcReg = null;
        let _mcFlat = [];
        let _mcCurrentCatalogCell = null;
        let _mcBrowseActiveCell = null;

        function _buildMCRegistry() {
            if (_mcReg) return;
            _mcReg = {};
            document.querySelectorAll('.mi-cell[data-nombre]').forEach(cell => {
                const m = (cell.getAttribute('style') || '').match(/grid-column\s*:\s*(\d+)/);
                if (!m) return;
                const col = parseInt(m[1]);
                if (!_MC_COLS[col]) return;
                if (!_mcReg[col]) _mcReg[col] = [];
                _mcReg[col].push(cell);
            });
            _mcFlat = [];
            [1,2,3,4,5,6,7,8,9,10].forEach(c => { if (_mcReg[c]) _mcFlat.push(..._mcReg[c]); });
        }

        function _buildMCNav() { /* reemplazado por _mcShowBrowse */ }

        function _mcSelect(idx) { _mcSelectFromCard(idx); }

        function _mcFadeContent(html, afterFn) {
            const content = document.getElementById('mc-content');
            if (!content) return;
            content.classList.add('mc-fade-out');
            setTimeout(() => {
                content.innerHTML = html;
                content.scrollTop = 0;
                content.classList.remove('mc-fade-out');
                if (afterFn) afterFn(content);
            }, 150);
        }

        function _mcShowBrowse(activeCell) {
            const content = document.getElementById('mc-content');
            if (!content || !_mcReg) return;
            _mcBrowseActiveCell = activeCell;
            _mcSetHeaderCourse(activeCell ? (activeCell.dataset.nombre || 'Programa Curricular') : 'Programa Curricular');

            const cicloOrder = ['Ciclo Inicial','Ciclo Licenciatura','Ciclo Profesional'];
            const cicloMap = {};
            [1,2,3,4,5,6,7,8,9,10].forEach(col => {
                if (!_mcReg[col]) return;
                const {ciclo, semLabel} = _MC_COLS[col];
                if (!cicloMap[ciclo]) cicloMap[ciclo] = {};
                cicloMap[ciclo][semLabel] = _mcReg[col];
            });

            let html = '<div class="mc-browse">';
            cicloOrder.forEach(ciclo => {
                if (!cicloMap[ciclo]) return;
                html += `<div class="mc-browse-ciclo"><div class="mc-browse-ciclo-head">${ciclo}</div>`;
                Object.keys(cicloMap[ciclo]).forEach(semLabel => {
                    html += `<div class="mc-browse-sem"><div class="mc-browse-sem-head">${semLabel}</div><div class="mc-browse-cards">`;
                    cicloMap[ciclo][semLabel].forEach(cell => {
                        const idx = _mcFlat.indexOf(cell);
                        const isActive = cell === activeCell;
                        const desc = cell.dataset.desc || '';
                        const shortDesc = desc.length > 110 ? desc.slice(0, 107) + '…' : desc;
                        html += `<div class="mc-card${isActive ? ' activo' : ''}" data-mc-idx="${idx}" onclick="_mcSelectFromCard(${idx})">
                            <div class="mc-card-top">
                                <span class="mc-card-title">${cell.dataset.nombre || ''}</span>
                                <span class="mc-card-arrow">↗</span>
                            </div>
                            ${shortDesc ? `<p class="mc-card-desc">${shortDesc}</p>` : ''}
                        </div>`;
                    });
                    html += '</div></div>';
                });
                html += '</div>';
            });
            html += '</div>';

            _mcFadeContent(html, (cont) => {
                const active = cont.querySelector('.mc-card.activo');
                if (active) setTimeout(() => active.scrollIntoView({ block: 'center', behavior: 'smooth' }), 60);
            });
        }

        function _mcSelectFromCard(idx) {
            const cell = _mcFlat[idx];
            if (!cell) return;
            _mcBrowseActiveCell = cell;
            document.querySelectorAll('.mc-card').forEach(c => c.classList.remove('activo'));
            const card = document.querySelector(`.mc-card[data-mc-idx="${idx}"]`);
            if (card) card.classList.add('activo');
            _mcRenderContent(cell);
        }

        function _getCellTipo(cell) {
            if (cell.classList.contains('mi-tipo-taller'))  return 'Taller';
            if (cell.classList.contains('mi-tipo-electivo')) return 'Electivo';
            if (cell.classList.contains('mi-tipo-cfgral'))  return 'Form. General';
            if (cell.classList.contains('mi-tipo-especial')) return 'Lab FAAD';
            if (cell.classList.contains('mi-tipo-ingles'))  return 'Idioma';
            return 'Asignatura';
        }

        function _mcSetHeaderCourse(nombre) {
            const el = document.getElementById('mc-header-course');
            if (el) el.textContent = nombre;
        }

        function _mcRenderContent(cell) {
            const content = document.getElementById('mc-content');
            if (!content) return;

            const nombre = cell.dataset.nombre || '';
            _mcSetHeaderCourse(nombre);

            // Celda con catálogo → mostrar lista de cursos
            const cat = cell.dataset.cat;
            if (cat && _catalogData && _catalogData.length) {
                const cursos = _catalogData.filter(c => c.categoria === cat);
                if (cursos.length) {
                    _currentCatCursos = cursos;
                    _currentCatMallaNombre = nombre;
                    _mcCurrentCatalogCell = cell;
                    _mcRenderCatalog(content, cell);
                    return;
                }
            }

            // Celda regular → ficha rediseñada
            const desc  = cell.dataset.desc || '';
            const img   = cell.dataset.img  || '';
            const tipo  = _getCellTipo(cell);
            const cr    = cell.dataset.creditos || '';
            const cod   = cell.dataset.codigo   || '';
            const sem   = cell.dataset.semestre || '';
            const dur   = cell.dataset.duracion || '';

            const pillsHtml = [
                `<span class="mc-course-pill">${tipo}</span>`,
                cr ? `<span class="mc-course-pill mc-course-pill-cr">${cr}</span>` : '',
            ].join('');

            const metaItems = [sem, dur].filter(Boolean);
            const metaHtml = metaItems.length
                ? `<div class="mc-course-meta-bar">${
                    metaItems.map((m, i) =>
                        `${i > 0 ? '<span class="mc-course-meta-sep">·</span>' : ''}<span class="mc-course-meta-item">${m}</span>`
                    ).join('')
                  }</div>`
                : '';

            const descHtml = desc ? `<p class="mc-course-desc">${desc}</p>` : '';
            const codeHtml = cod  ? `<div class="mc-course-code">${cod}</div>` : '';
            const heroHtml = img  ? `<img class="crs-detail-hero" src="${img}" alt="${nombre}" style="margin-bottom:32px">` : '';

            _mcFadeContent(`<div class="mc-detail">
                <button class="crs-back-btn" onclick="_mcShowBrowse(_mcBrowseActiveCell)">← Todos los cursos</button>
                ${heroHtml}<div class="mc-course-view">
                    <div class="mc-course-pills">${pillsHtml}</div>
                    <h2 class="mc-course-title">${nombre}</h2>
                    ${metaHtml}
                    ${descHtml || '<p class="mc-course-desc" style="color:#bbb">Sin descripción disponible.</p>'}
                    ${codeHtml}
                </div>
            </div>`);
        }

        function _mcRenderCatalog(content, malaCell) {
            const cat = malaCell.dataset.cat || '';
            const nombre = malaCell.dataset.nombre || '';
            const cursos = _currentCatCursos;
            const cards = cursos.map((c, idx) => {
                const imgSrc = c.imagenes && c.imagenes[0] ? `${IMGS_BASE_MALLA}${c.imagenes[0]}` : null;
                const imgEl = imgSrc
                    ? `<img class="crs-card-img" src="${imgSrc}" alt="${c.nombre_taller || ''}" loading="lazy">`
                    : `<div class="crs-card-img-empty"></div>`;
                const prof = c.profesores ? `<div class="crs-card-prof">${c.profesores}</div>` : '';
                return `<div class="crs-card" onclick="_mcAbrirCurso(${idx})">
                    ${imgEl}
                    <div class="crs-card-body">
                        <div class="crs-card-taller">${c.nombre_taller || c.nombre_curso}</div>
                        ${prof}
                    </div>
                </div>`;
            }).join('');
            _mcFadeContent(`<div class="mc-detail mc-detail-catalog">
                <button class="crs-back-btn" onclick="_mcShowBrowse(_mcBrowseActiveCell)">← Todos los cursos</button>
                <div class="mc-cat-header">
                    <span class="crs-cat-tag">${cat}</span>
                    <h2 class="crs-popup-grid-title">${nombre}</h2>
                </div>
                <div class="crs-cards-grid">${cards}</div>
            </div>`);
        }

        function _mcAbrirCurso(idx) {
            const c = _currentCatCursos[idx];
            if (!c) return;
            const content = document.getElementById('mc-content');
            if (!content) return;
            _mcSetHeaderCourse(c.nombre_taller || c.nombre_curso || '');
            const imgSrc = c.imagenes && c.imagenes[0] ? `${IMGS_BASE_MALLA}${c.imagenes[0]}` : null;
            const heroEl = imgSrc ? `<img class="crs-detail-hero" id="crs-hero-img" src="${imgSrc}" alt="${c.nombre_taller || ''}">` : '';
            const thumbsEl = c.imagenes && c.imagenes.length > 1
                ? `<div class="crs-detail-thumbs">${c.imagenes.map((img, i) =>
                    `<img class="crs-detail-thumb${i === 0 ? ' activo' : ''}" src="${IMGS_BASE_MALLA}${img}"
                         onclick="_switchHero(this, '${IMGS_BASE_MALLA}${img}')" loading="lazy">`
                ).join('')}</div>` : '';
            const fields = [
                c.profesores && { label: c.profesores.includes('+') ? 'Docentes' : 'Docente', value: c.profesores },
                c.seccion    && { label: 'Sección',  value: c.seccion },
                c.codigo     && { label: 'Código',   value: c.codigo.replace(/\s*secci[oó]n\s*\d+/i, '').trim() },
                c.horario    && { label: 'Horario',  value: c.horario },
                c.instagram  && { label: 'Instagram',value: c.instagram },
            ].filter(Boolean).map(f =>
                `<div class="crs-meta-item"><span class="crs-detail-label">${f.label}</span><span class="crs-detail-value">${f.value}</span></div>`
            ).join('');
            const metaRow = fields ? `<div class="crs-meta-row">${fields}</div>` : '';
            const descLen = (c.descripcion || '').length;
            const descSizeClass = descLen > 1400 ? 'crs-detail-desc-xl' : (descLen > 800 ? 'crs-detail-desc-lg' : '');
            const descEl = c.descripcion
                ? `<p class="crs-detail-desc ${descSizeClass}">${c.descripcion}</p>`
                : '';
            _mcFadeContent(`<div class="mc-course-detail">
                <button class="crs-back-btn" onclick="_mcVolverCatalogo()">← Volver a ${c.categoria}</button>
                <div class="crs-course-scene">
                    <div class="crs-course-media">
                        ${heroEl}
                        ${thumbsEl}
                    </div>
                    <div class="crs-course-info">
                        <div class="crs-detail-cat">${c.categoria}${c.seccion ? ' · ' + c.seccion : ''}</div>
                        <h2 class="crs-detail-taller">${c.nombre_taller || c.nombre_curso}</h2>
                        ${c.nombre_curso ? `<div class="crs-detail-curso-nombre">${c.nombre_curso}</div>` : ''}
                        ${metaRow}
                        ${descEl}
                    </div>
                </div>
            </div>`);
        }

        function _mcVolverCatalogo() {
            const content = document.getElementById('mc-content');
            if (!content || !_mcCurrentCatalogCell) return;
            _currentCatCursos = (_catalogData || []).filter(c => c.categoria === _mcCurrentCatalogCell.dataset.cat);
            _mcSetHeaderCourse(_mcCurrentCatalogCell.dataset.nombre || '');
            _mcRenderCatalog(content, _mcCurrentCatalogCell);
        }

        function abrirMCPopup(cell) {
            _buildMCRegistry();
            const overlay = document.getElementById('mc-overlay');
            if (!overlay) return;
            _mcBrowseActiveCell = cell;
            _mcRenderContent(cell);
            overlay.classList.add('abierto');
            document.body.style.overflow = 'hidden';
        }

        function cerrarMCPopup() {
            const ov = document.getElementById('mc-overlay');
            if (ov) ov.classList.remove('abierto');
            document.body.style.overflow = '';
        }

        /* =========================================
           EXPORTAR MALLA
        ========================================= */
        (function() {
            const MALLA_DATA = {
                '1,3':  { id: 't1',    cred:  8 },
                '2,3':  { id: 't2',    cred:  8 },
                '3,3':  { id: 't3',    cred:  8 },
                '4,3':  { id: 't4',    cred:  8 },
                '5,3':  { id: 'li1',   cred:  8 },
                '6,3':  { id: 'li2',   cred:  8 },
                '7,3':  { id: 'li3',   cred:  8 },
                '8,3':  { id: 'li4',   cred:  8 },
                '9,3':  { id: 'st',    cred: 15 },
                '10,3': { id: 'pt',    cred: 30 },
                '1,4':  { id: 'vc',    cred:  5 },
                '2,4':  { id: 'cd',    cred:  5 },
                '3,4':  { id: 'ac',    cred:  5 },
                '4,4':  { id: 'disc',  cred:  5 },
                '5,4':  { id: 'em51',  cred:  5 },
                '6,4':  { id: 'inv',   cred:  5 },
                '7,4':  { id: 'hinv',  cred:  5 },
                '8,4':  { id: 'fproy', cred:  5 },
                '1,5':  { id: 'cv',    cred:  5 },
                '2,5':  { id: 'geo',   cred:  5 },
                '3,5':  { id: 'tipo',  cred:  5 },
                '4,5':  { id: 'eav',   cred:  5 },
                '5,5':  { id: 'em52',  cred:  5 },
                '6,5':  { id: 'em6',   cred:  5 },
                '7,5':  { id: 'em7',   cred:  5 },
                '8,5':  { id: 'em8',   cred:  5 },
                '9,5':  { id: 'pp',    cred: 10 },
                '1,6':  { id: 'di',    cred:  4 },
                '2,6':  { id: 'mexp',  cred:  4 },
                '3,6':  { id: 'pcomp', cred:  4 },
                '4,6':  { id: 'dinf',  cred:  4 },
                '5,6':  { id: 'dce',   cred:  4 },
                '6,6':  { id: 'ief',   cred:  4 },
                '7,6':  { id: 'eg',    cred:  4 },
                '8,6':  { id: 'cfg5',  cred:  5 },
                '1,7':  { id: 'emat',  cred:  5 },
                '2,7':  { id: 'proc',  cred:  4 },
                '3,7':  { id: 'fab',   cred:  4 },
                '4,7':  { id: 'cfg1',  cred:  5 },
                '5,7':  { id: 'cfg2',  cred:  5 },
                '6,7':  { id: 'cfg3',  cred:  5 },
                '7,7':  { id: 'cfg4',  cred:  5 },
                '8,7':  { id: 'cfg6',  cred:  5 },
                '1,8':  { id: 'lfaad', cred:  2 },
                '2,8':  { id: 'ing1',  cred:  5 },
                '3,8':  { id: 'ing2',  cred:  5 },
                '4,8':  { id: 'ing3',  cred:  5 },
                '6,8':  { id: 'ps',    cred:  5 },
            };

            const TOTAL_CRED = 292;

            function getPos(cell) {
                const s = cell.getAttribute('style') || '';
                const c = s.match(/grid-column\s*:\s*(\d+)/);
                const r = s.match(/grid-row\s*:\s*(\d+)/);
                return (c && r) ? c[1] + ',' + r[1] : null;
            }

            // Añadir etiquetas cr a cada celda
            document.querySelectorAll('.mi-cell[data-nombre]').forEach(cell => {
                if (cell.classList.contains('mi-header') ||
                    cell.classList.contains('mi-empty')  ||
                    cell.classList.contains('mi-taller-int')) return;

                const pos = getPos(cell);
                if (!pos || !MALLA_DATA[pos]) return;

                const d = MALLA_DATA[pos];
                cell.dataset.id   = d.id;
                cell.dataset.cred = d.cred;

                const tag = document.createElement('span');
                tag.className   = 'mi-cred-tag';
                tag.textContent = d.cred + ' cr';
                cell.appendChild(tag);
            });

            // Mostrar total del plan
            const count = document.getElementById('mi-credbar-count');
            if (count) count.textContent = TOTAL_CRED + ' cr totales';
            const fill = document.getElementById('mi-credbar-fill');
            if (fill) fill.style.width = '100%';
        })();

        /* =============================================
           DOBLE MENCIÓN — MALLA INTERACTIVA
           ============================================= */
        (function() {
            // ── Etiquetas de menciones ────────────────────────
            const DM_LABELS = {
                grafico:      'Diseño Gráfico',
                industrial:   'Diseño Industrial',
                interaccion:  'Diseño de Interacción',
                indumentaria: 'Diseño de Indumentaria',
            };

            // 5 slots electivos en el grid (col, row)
            const SLOTS = [
                { col: 5, row: 4 },
                { col: 5, row: 5 },
                { col: 6, row: 5 },
                { col: 7, row: 5 },
                { col: 8, row: 5 },
            ];
            // Distribución indicativa: A en slots pares, B en slots impares
            const DIST_A = [0, 2, 4];  // 3 slots → Mención principal
            const DIST_B = [1, 3];     // 2 slots → Mención secundaria

            // semestres con electivo para la nota de créditos
            const SEMS_ELECTIVO = ['Sem 5', 'Sem 6', 'Sem 7', 'Sem 8', 'Sem 9'];

            let selMenciones = []; // [mA, mB] o menos

            function getElectivo(col, row) {
                return document.querySelector(
                    `.mi-electivo[style*="grid-column:${col}"][style*="grid-row:${row}"]`
                );
            }

            function clearDM() {
                document.querySelectorAll('.mi-electivo').forEach(cell => {
                    cell.classList.remove('mi-h-grafico','mi-h-industrial','mi-h-interaccion','mi-h-indumentaria');
                    cell.querySelector('.mi-cell-name').textContent = 'Electivo de mención';
                    cell.dataset.nombre = 'Electivo de mención';
                    cell.dataset.desc   = '';
                });
                document.querySelector('.malla-interactiva').classList.remove('filtro-activo');
                document.querySelectorAll('.mi-sub-esp').forEach(s => s.textContent = '');
            }

            function applyDM() {
                if (selMenciones.length < 2) { clearDM(); return; }
                const [mA, mB] = selMenciones;
                clearDM();
                document.querySelector('.malla-interactiva').classList.add('filtro-activo');
                document.querySelectorAll('.mi-sub-esp').forEach(s => s.textContent = 'doble');

                SLOTS.forEach((slot, i) => {
                    const m    = DIST_A.includes(i) ? mA : mB;
                    const cell = getElectivo(slot.col, slot.row);
                    if (!cell) return;
                    cell.classList.add('mi-h-' + m);
                    const nombre  = cell.dataset[m] || 'Electivo de mención';
                    const descKey = 'desc' + m.charAt(0).toUpperCase() + m.slice(1);
                    cell.querySelector('.mi-cell-name').textContent = nombre;
                    cell.dataset.nombre = nombre;
                    cell.dataset.desc   = cell.dataset[descKey] || '';
                });

                buildResult(mA, mB);c
            }

            function buildResult(mA, mB) {
                const result = document.getElementById('mi-dm-result');
                const chips  = document.getElementById('mi-dm-chips');
                const courses= document.getElementById('mi-dm-courses');
                const cred   = document.getElementById('mi-dm-cred');

                // Chips de mención
                chips.innerHTML =
                    `<span class="mi-dm-chip h-${mA}">${DM_LABELS[mA]}</span>` +
                    `<span class="mi-dm-x">+</span>` +
                    `<span class="mi-dm-chip h-${mB} sob">${DM_LABELS[mB]}</span>`;

                // Listas de 5 cursos por mención
                const listA = SLOTS.map(s => {
                    const c = getElectivo(s.col, s.row);
                    return c ? (c.dataset[mA] || '—') : '—';
                });
                const listB = SLOTS.map(s => {
                    const c = getElectivo(s.col, s.row);
                    return c ? (c.dataset[mB] || '—') : '—';
                });

                const colorA = { grafico:'#2952a3', industrial:'#b83a24', interaccion:'#2e5c42', indumentaria:'#b88214' }[mA];
                const colorB = { grafico:'#2952a3', industrial:'#b83a24', interaccion:'#2e5c42', indumentaria:'#b88214' }[mB];

                courses.innerHTML =
                    `<div>
                        <div class="mi-dm-col-head" style="color:${colorA}">${DM_LABELS[mA]} — regular</div>
                        <div class="mi-dm-course-item" style="border-color:${colorA}40">${listA.join('<br>')}</div>
                    </div>
                    <div>
                        <div class="mi-dm-col-head" style="color:${colorB}">${DM_LABELS[mB]} — sobrecarga</div>
                        <div class="mi-dm-course-item" style="border-color:${colorB}40">${listB.join('<br>')}</div>
                    </div>`;

                // Nota de créditos
                cred.innerHTML =
                    `<strong>Vía rápida:</strong> ${SEMS_ELECTIVO.join(' · ')}<br>` +
                    `1 electivo regular (${DM_LABELS[mA]}) + 1 electivo sobrecarga (${DM_LABELS[mB]}) por semestre<br>` +
                    `<strong>~32 cr/sem</strong> · máximo institucional: 36 cr · sin extender permanencia`;

                result.classList.add('visible');
            }

            function updateBtnClasses() {
                document.querySelectorAll('.mi-dm-btn').forEach(b => {
                    b.classList.remove('dm-A', 'dm-B');
                });
                if (selMenciones[0]) {
                    const bA = document.querySelector(`.mi-dm-btn[data-mencion="${selMenciones[0]}"]`);
                    if (bA) bA.classList.add('dm-A');
                }
                if (selMenciones[1]) {
                    const bB = document.querySelector(`.mi-dm-btn[data-mencion="${selMenciones[1]}"]`);
                    if (bB) bB.classList.add('dm-B');
                }
            }

            window.mallaDMToggle = function() {
                const panel  = document.getElementById('mi-dm-panel');
                const toggle = document.getElementById('mi-dm-toggle');
                const info   = document.getElementById('mi-filtro-info');
                const isOpen = panel.classList.contains('abierto');

                if (isOpen) {
                    panel.classList.remove('abierto');
                    toggle.classList.remove('activo');
                    selMenciones = [];
                    updateBtnClasses();
                    clearDM();
                    document.getElementById('mi-dm-result').classList.remove('visible');
                    info.innerHTML = 'Pasa el cursor sobre cada ramo para ver más información.';
                    info.classList.remove('activo');
                } else {
                    document.querySelectorAll('.mi-filtro-btn:not(#mi-dm-toggle)').forEach(b => b.classList.remove('activo'));
                    document.querySelector('.mi-filtro-btn[data-filtro=""]').classList.add('activo');
                    panel.classList.add('abierto');
                    toggle.classList.add('activo');
                    info.innerHTML = 'Elige dos menciones para construir tu doble especialidad.';
                    info.classList.add('activo');
                }
            };

            window.mallaDMSelect = function(btn) {
                const m   = btn.dataset.mencion;
                const idx = selMenciones.indexOf(m);

                if (idx !== -1) {
                    // Deseleccionar
                    selMenciones.splice(idx, 1);
                } else if (selMenciones.length < 2) {
                    selMenciones.push(m);
                } else {
                    // Reemplazar la secundaria
                    selMenciones[1] = m;
                }

                updateBtnClasses();
                applyDM();

                if (selMenciones.length < 2) {
                    document.getElementById('mi-dm-result').classList.remove('visible');
                }
            };
        })();

        /* =============================================
           EXPORTAR MALLA COMO PNG
           ============================================= */
        async function exportarPNG() {
            const btn = document.getElementById('mi-export-btn');
            const target = document.querySelector('.malla-bloque');
            const cursorEl = document.getElementById('cursor');
            const follower = document.getElementById('cursor-follower');
            if (typeof html2canvas !== 'function') { alert('No se pudo cargar la librería de exportación.'); return; }
            const labelOriginal = btn.textContent;
            btn.disabled = true; btn.textContent = 'Generando…';
            const prevC = cursorEl ? cursorEl.style.display : '';
            const prevF = follower ? follower.style.display : '';
            if (cursorEl) cursorEl.style.display = 'none';
            if (follower) follower.style.display = 'none';
            btn.style.visibility = 'hidden';
            try {
                if (document.fonts && document.fonts.ready) await document.fonts.ready;
                const innerCanvas = await html2canvas(target, { backgroundColor: '#000000', scale: 2, useCORS: true, logging: false });
                const margin = 128;
                const finalCanvas = document.createElement('canvas');
                finalCanvas.width = innerCanvas.width + margin * 4;
                finalCanvas.height = innerCanvas.height + margin * 4;
                const ctx = finalCanvas.getContext('2d');
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
                ctx.drawImage(innerCanvas, margin * 2, margin * 2);
                const activo = document.querySelector('.mi-filtro-btn.activo');
                const sufijo = (activo && activo.dataset.filtro) ? activo.dataset.filtro : 'plan-completo';
                const fecha = new Date().toISOString().slice(0, 10);
                const link = document.createElement('a');
                link.download = `malla-diseno-udp-${sufijo}-${fecha}.png`;
                link.href = finalCanvas.toDataURL('image/png');
                document.body.appendChild(link); link.click(); document.body.removeChild(link);
            } catch(err) { console.error(err); alert('Hubo un problema al generar la imagen.'); }
            finally {
                if (cursorEl) cursorEl.style.display = prevC;
                if (follower) follower.style.display = prevF;
                btn.style.visibility = ''; btn.disabled = false; btn.textContent = labelOriginal;
            }
        }

        /* =============================================
           EXPORTAR MALLA COMO GIF
           ============================================= */
        async function exportarGIF() {
            const btn = document.getElementById('mi-export-gif-btn');
            const btnPNG = document.getElementById('mi-export-btn');
            const target = document.querySelector('.malla-bloque');
            const cursorEl = document.getElementById('cursor');
            const follower = document.getElementById('cursor-follower');
            if (typeof html2canvas !== 'function' || typeof GIF !== 'function') { alert('No se pudieron cargar las librerías necesarias.'); return; }
            const labelOriginal = btn.textContent;
            btn.disabled = true; btnPNG.disabled = true; btn.textContent = 'Preparando…';
            const activoPrevio = document.querySelector('.mi-filtro-btn.activo');
            const filtroPrevio = activoPrevio ? activoPrevio.dataset.filtro : '';
            const prevC = cursorEl ? cursorEl.style.display : '';
            const prevF = follower ? follower.style.display : '';
            if (cursorEl) cursorEl.style.display = 'none';
            if (follower) follower.style.display = 'none';
            btn.style.visibility = 'hidden'; btnPNG.style.visibility = 'hidden';
            try {
                if (document.fonts && document.fonts.ready) await document.fonts.ready;
                const secuencia = [
                    { filtro: '',             label: 'Plan Completo' },
                    { filtro: 'grafico',      label: 'Diseño Gráfico' },
                    { filtro: 'industrial',   label: 'Diseño Industrial' },
                    { filtro: 'interaccion',  label: 'Diseño Interacción' },
                    { filtro: 'indumentaria', label: 'Diseño Textil e Indumentaria' }
                ];
                const margin = 64; const SCALE = 1; const DELAY = 1600;
                const frames = [];
                for (let i = 0; i < secuencia.length; i++) {
                    btn.textContent = `Capturando ${i + 1}/${secuencia.length}…`;
                    const targetBtn = document.querySelector(`.mi-filtro-btn[data-filtro="${secuencia[i].filtro}"]`);
                    if (targetBtn) mallaFiltrar(targetBtn);
                    await new Promise(r => setTimeout(r, 380));
                    const frame = await html2canvas(target, { backgroundColor: '#000000', scale: SCALE, useCORS: true, logging: false });
                    frames.push(frame);
                }
                btn.textContent = 'Generando GIF…';
                const w = frames[0].width; const h = frames[0].height;
                const finalW = w + margin * 2; const finalH = h + margin * 2;
                const gif = new GIF({
                    workers: 2, quality: 10, width: finalW, height: finalH, background: '#000000',
                    workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js'
                });
                for (const f of frames) {
                    const padded = document.createElement('canvas');
                    padded.width = finalW; padded.height = finalH;
                    const ctx = padded.getContext('2d');
                    ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, finalW, finalH);
                    ctx.drawImage(f, margin, margin);
                    gif.addFrame(padded, { delay: DELAY });
                }
                gif.on('progress', p => { btn.textContent = `Generando GIF… ${Math.round(p * 100)}%`; });
                const blob = await new Promise((resolve, reject) => {
                    gif.on('finished', resolve);
                    gif.on('abort', () => reject(new Error('Render abortado')));
                    gif.render();
                });
                const fecha = new Date().toISOString().slice(0, 10);
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `malla-diseno-udp-menciones-${fecha}.gif`;
                link.href = url;
                document.body.appendChild(link); link.click(); document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } catch(err) { console.error(err); alert('Hubo un problema al generar el GIF.'); }
            finally {
                const btnPrev = document.querySelector(`.mi-filtro-btn[data-filtro="${filtroPrevio}"]`);
                if (btnPrev) mallaFiltrar(btnPrev);
                if (cursorEl) cursorEl.style.display = prevC;
                if (follower) follower.style.display = prevF;
                btn.style.visibility = ''; btnPNG.style.visibility = '';
                btn.disabled = false; btnPNG.disabled = false; btn.textContent = labelOriginal;
            }
        }

        // FILTRO EQUIPO
        function filtrarEquipo(tipo, btn) {
            document.querySelectorAll('.equipo-tab').forEach(t => t.classList.remove('activa'));
            btn.classList.add('activa');
            document.querySelectorAll('.docente-card').forEach(c => {
                c.style.display = (tipo === 'todos' || c.dataset.tipo === tipo) ? '' : 'none';
            });
        }

        // ==========================================
        // NOTICIAS — datos, feed y popup
        // ==========================================
        const _noticiasData = [
            {
                id: 0, categoria: 'Escuela',
                titulo: 'Muestra final Talleres de Diseño 2026',
                fecha: '28 May 2026',
                imagen: 'assets/img/noticias/noticia-muestratalleres.jpg',
                credito: 'Foto: @colectivas.serie',
                cuerpo: '<p>La exhibición anual de proyectos estudiantiles de los Talleres I, II, III y IV cierra el primer semestre en las sedes de Av. República 180 y Salvador Sanfuentes 2221. Este año, el eje conductor fue la observación urbana como metodología proyectual.</p><p>Más de 200 proyectos de los cuatro ciclos formativos pueden verse en recorrido libre los días 4, 5 y 6 de junio. La apertura contará con presentaciones de los equipos docentes y la presencia del cuerpo académico completo.</p>'
            },
            {
                id: 1, categoria: 'Investigación',
                titulo: 'LAB 360: nuevas metodologías de edición colaborativa',
                fecha: '14 May 2026',
                imagen: 'assets/img/noticias/noticia-lab360.jpg',
                cuerpo: '<p>El Laboratorio Gráfico LAB 360 presentó su ciclo de talleres abiertos centrados en edición colaborativa y producción risográfica. El programa, dirigido por el equipo de la mención Gráfico, reúne estudiantes de todas las menciones en un espacio de experimentación material.</p><p>Las sesiones abordan desde composición tipográfica variable hasta el diseño de publicaciones de tirada corta, conectando práctica material con investigación sobre la cultura impresa contemporánea.</p>'
            },
            {
                id: 2, categoria: 'Vinculación',
                titulo: 'Congreso Futuro 2026: Museo Futuro diseñado por estudiantes de Interacción',
                fecha: '05 May 2026',
                imagen: 'assets/img/noticias/noticia-congresofuturo.jpg',
                credito: 'Foto: Carlos yo, Wikimedia Commons (CC BY-SA 4.0)',
                cuerpo: '<p>Estudiantes de quinto y sexto semestre de la mención Diseño de Interacción desarrollaron la propuesta de experiencia inmersiva «Museo Futuro» para el Congreso Futuro 2026. El proyecto implicó el diseño de interfaces físicas y digitales que articulan especulación y participación ciudadana.</p><p>La instalación, exhibida en el Centro Cultural Gabriela Mistral, fue visitada por más de 3.000 personas durante los cuatro días del congreso.</p>'
            },
            {
                id: 3, categoria: 'Docencia',
                titulo: 'Taller Internacional en Madrid: Máquinas de Archivar',
                fecha: '20 Abr 2026',
                imagen: 'assets/img/noticias/noticia-madrid.jpg',
                credito: 'Foto: Miguel303xm, Wikimedia Commons (CC BY-SA 2.5)',
                cuerpo: '<p>Un grupo de estudiantes de quinto semestre participó en el Taller Internacional FaAAD–ETSAM en Madrid, bajo el encargo «Máquinas de Archivar». El ejercicio, de dos semanas, exploró la traducción de archivos institucionales en sistemas de diseño y dispositivos de exhibición.</p><p>Los proyectos resultantes se exhibirán en agosto en la Sala de Exposiciones de Av. República 180.</p>'
            },
            {
                id: 4, categoria: 'Alumni',
                titulo: 'Egresados FaAAD en la 4YFN 2026: diseño e innovación tecnológica',
                fecha: '10 Abr 2026',
                imagen: 'assets/img/noticias/noticia-4yfn.jpg',
                credito: 'Foto: Kent Wang, Wikimedia Commons (CC BY 4.0)',
                cuerpo: '<p>Cuatro equipos conformados por egresados de la Escuela de Diseño UDP participaron en la feria de innovación tecnológica 4YFN 2026 en Barcelona, representando proyectos en movilidad sostenible, salud digital y biomateriales.</p><p>Los proyectos fueron seleccionados a través de un proceso de postulación abierta coordinado por la Unidad de Vinculación con el Medio de la FaAAD.</p>'
            },
            {
                id: 5, categoria: 'Publicación',
                titulo: 'Revista 180 N°56: edición bilingüe sobre diseño y espacio público',
                fecha: '01 Abr 2026',
                imagen: 'assets/img/noticias/noticia-revista180.jpg',
                cuerpo: '<p>La Revista 180 presenta su número 56, una edición bilingüe español/inglés dedicada al diseño del espacio público en contextos latinoamericanos. El número reúne investigaciones de académicos de la FaAAD y colaboraciones con instituciones de Colombia, México y Argentina.</p><p>El lanzamiento se realizará el 15 de abril en la biblioteca de Av. República 180.</p>'
            }
        ];

        let _noticiaActual = 0;

        // Renderizar feed de tarjetas
        (function _buildNoticiasFeed() {
            const feed = document.getElementById('noticias-feed');
            if (!feed) return;
            feed.innerHTML = _noticiasData.map((n, i) => `
                <div class="noticia-card" data-cat="${n.categoria}" onclick="abrirNoticia(${i})">
                    <div class="noticia-card-img">${n.imagen ? `<img src="${n.imagen}" alt="${n.titulo}" loading="lazy">` : ''}</div>
                    <span class="noticia-card-label">${n.categoria}</span>
                    <h3 class="noticia-card-title">${n.titulo}</h3>
                    <span class="noticia-card-fecha">${n.fecha}</span>
                </div>`).join('');
        })();

        function filtrarNoticias(cat, btn) {
            document.querySelectorAll('.agenda-filter-btn').forEach(b => {
                if (b.closest('#noticias')) b.classList.remove('activo');
            });
            btn.classList.add('activo');
            document.querySelectorAll('#noticias-feed .noticia-card').forEach(c => {
                c.classList.toggle('oculta', cat !== 'todos' && c.dataset.cat !== cat);
            });
        }

        function abrirNoticia(idx) {
            _noticiaActual = idx;
            _renderNoticiaArt(idx);
            _renderNoticiaAside(idx);
            const overlay = document.getElementById('noticia-overlay');
            overlay.style.display = 'block';
            requestAnimationFrame(() => {
                overlay.classList.add('abierto');
            });
            document.body.style.overflow = 'hidden';
        }

        function cerrarNoticia() {
            const ov = document.getElementById('noticia-overlay');
            ov.classList.remove('abierto');
            ov.style.display = '';
            document.body.style.overflow = '';
        }

        function _noticiaOverlayClick(e) {
            if (e.target === document.getElementById('noticia-overlay')) cerrarNoticia();
        }

        function _renderNoticiaArt(idx) {
            const n = _noticiasData[idx];
            if (!n) return;
            document.getElementById('noticia-bc-current').textContent = n.categoria;
            document.getElementById('noticia-article').innerHTML = `
                <span class="noticia-art-label">${n.categoria}</span>
                <h1 class="noticia-art-titulo">${n.titulo}</h1>
                <span class="noticia-art-meta">${n.fecha}</span>
                <div class="noticia-art-hero">${n.imagen ? `<img src="${n.imagen}" alt="${n.titulo}">` : ''}</div>
                ${n.credito ? `<span class="noticia-art-credito">${n.credito}</span>` : ''}
                <div class="noticia-art-cuerpo">${n.cuerpo}</div>
                <div class="noticia-art-nav">
                    <button class="noticia-nav-btn" onclick="navNoticia(-1)" ${idx === 0 ? 'disabled' : ''}>← Anterior</button>
                    <span class="noticia-nav-count">${idx + 1} / ${_noticiasData.length}</span>
                    <button class="noticia-nav-btn" onclick="navNoticia(1)" ${idx === _noticiasData.length - 1 ? 'disabled' : ''}>Siguiente →</button>
                </div>`;
            document.getElementById('noticia-article').scrollTop = 0;
        }

        function _renderNoticiaAside(activeIdx) {
            document.getElementById('noticia-aside').innerHTML = _noticiasData.map((n, i) => `
                <div class="noticia-aside-item${i === activeIdx ? ' activo' : ''}" onclick="abrirNoticia(${i})">
                    <span class="noticia-aside-label">${n.categoria}</span>
                    <span class="noticia-aside-titulo">${n.titulo}</span>
                </div>`).join('');
        }

        function navNoticia(dir) {
            const next = _noticiaActual + dir;
            if (next < 0 || next >= _noticiasData.length) return;
            _noticiaActual = next;
            _renderNoticiaArt(next);
            _renderNoticiaAside(next);
        }

        // Cerrar con Escape
        document.addEventListener('keydown', e => {
            if (e.key !== 'Escape') return;
            if (document.getElementById('noticia-overlay').classList.contains('abierto')) cerrarNoticia();
            if (document.getElementById('ev-overlay').classList.contains('abierto')) cerrarEvento();
        });

        // AGENDA — carga dinámica desde agenda-data.json + RSS UDP
        let _agendaData = [];
        let _evActual  = 0;

        const _AGENDA_RSS = [
            { url: 'https://www.udp.cl/agenda-udp/feed/', tipo: 'corporativa', categoria: 'UDP', fuente: 'udp.cl' }
        ];

        function _fechaStr(s) {
            const M = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
            const d = new Date(s);
            return isNaN(d) ? s : `${d.getDate()} ${M[d.getMonth()]}<br>${d.getFullYear()}`;
        }

        function _fechaPlana(s) {
            const M = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
            const d = new Date(s);
            return isNaN(d) ? s : `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`;
        }

        function _stripHtml(h) {
            const t = document.createElement('div');
            t.innerHTML = h || '';
            return t.textContent.trim();
        }

        async function cargarAgenda() {
            const grid = document.getElementById('agenda-grid');
            grid.innerHTML = '<li style="padding:1.5rem 0;color:#888;list-style:none">Cargando agenda…</li>';

            let curados = [];
            try {
                const r = await fetch('agenda-data.json');
                if (r.ok) curados = await r.json();
            } catch(e) {}

            let rssEvs = [];
            for (const src of _AGENDA_RSS) {
                try {
                    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(src.url)}&count=15`;
                    const d = await (await fetch(apiUrl)).json();
                    if (d.status === 'ok') {
                        rssEvs = rssEvs.concat(d.items.map(item => ({
                            tipo: src.tipo, categoria: src.categoria,
                            fecha: item.pubDate, hora: '',
                            lugar: 'UDP', titulo: item.title,
                            desc: (_stripHtml(item.description).slice(0, 220) + (_stripHtml(item.description).length > 220 ? '…' : '')),
                            url: item.link, fuente: src.fuente
                        })));
                    }
                } catch(e) {}
            }

            const now = Date.now();
            const todos = [...curados, ...rssEvs].sort((a, b) => {
                const da = new Date(a.fecha), db = new Date(b.fecha);
                const fa = da >= now, fb = db >= now;
                if (fa !== fb) return fa ? -1 : 1;
                return fa ? da - db : db - da;
            });

            _agendaData = todos.map((ev, i) => ({ ...ev, id: i }));
            _renderAgendaGrid(_agendaData);
        }

        function _renderAgendaGrid(eventos) {
            const grid = document.getElementById('agenda-grid');
            if (!eventos.length) {
                grid.innerHTML = '<li style="padding:1.5rem 0;color:#888">No hay eventos disponibles.</li>';
                return;
            }
            grid.innerHTML = eventos.map((ev, i) => {
                const fd = (ev.fecha || '').match(/^\d{4}-/)
                    ? _fechaStr(ev.fecha)
                    : (ev.fecha || '').replace(/^(\d+ \w+) (\d{4})$/, '$1<br>$2');
                return `<li class="agenda-list-item" data-tipo="${ev.tipo}" onclick="abrirEvento(${i})">
                    <div class="agenda-event">
                        <div class="agenda-ev-meta">
                            <span class="agenda-ev-date">${fd}</span>
                            <span class="agenda-ev-categoria">${ev.categoria}</span>
                        </div>
                        <div class="agenda-ev-main">
                            <h3 class="agenda-ev-title">${ev.titulo}</h3>
                            <p class="agenda-ev-desc">${ev.desc || ''}</p>
                        </div>
                        <div class="agenda-ev-loc">
                            <span class="agenda-ev-tag">${ev.categoria}</span>
                            <span class="agenda-ev-arrow">→</span>
                        </div>
                    </div>
                </li>`;
            }).join('');
        }

        function abrirEvento(idx) {
            _evActual = idx;
            _renderEvArt(idx);
            _renderEvAside(idx);
            const overlay = document.getElementById('ev-overlay');
            overlay.style.display = 'block';
            requestAnimationFrame(() => { overlay.classList.add('abierto'); });
            document.body.style.overflow = 'hidden';
        }

        function cerrarEvento() {
            const ov = document.getElementById('ev-overlay');
            ov.classList.remove('abierto');
            ov.style.display = '';
            document.body.style.overflow = '';
        }

        function _evOverlayClick(e) {
            if (e.target === document.getElementById('ev-overlay')) cerrarEvento();
        }

        function _renderEvArt(idx) {
            const ev = _agendaData[idx];
            if (!ev) return;
            document.getElementById('ev-bc-current').textContent = ev.categoria;
            const fechaPlana = (ev.fecha || '').match(/^\d{4}-/) ? _fechaPlana(ev.fecha) : ev.fecha;
            const linkHtml = ev.url
                ? `<a class="btn btn-solid" href="${ev.url}" target="_blank" rel="noopener" style="margin-top:1.5rem;display:inline-block">Ver evento →</a>`
                : '';
            const fuenteHtml = ev.fuente
                ? `<p style="font-size:0.75rem;color:#888;margin-top:0.75rem">Fuente: ${ev.fuente}</p>`
                : '';
            document.getElementById('ev-article').innerHTML = `
                <span class="ev-art-tag">${ev.categoria}</span>
                <h1 class="ev-art-titulo">${ev.titulo}</h1>
                <div class="ev-art-info">
                    <div class="ev-art-info-cell">
                        <span class="ev-art-info-label">Fecha</span>
                        <span class="ev-art-info-val">${fechaPlana}</span>
                    </div>
                    ${ev.hora ? `<div class="ev-art-info-cell">
                        <span class="ev-art-info-label">Hora</span>
                        <span class="ev-art-info-val">${ev.hora}</span>
                    </div>` : ''}
                    ${ev.lugar ? `<div class="ev-art-info-cell ev-art-info-full">
                        <span class="ev-art-info-label">Lugar</span>
                        <span class="ev-art-info-val">${ev.lugar}</span>
                    </div>` : ''}
                </div>
                <p class="ev-art-desc">${ev.desc || ''}</p>
                ${linkHtml}${fuenteHtml}`;
            document.getElementById('ev-article').scrollTop = 0;
        }

        function _renderEvAside(activeIdx) {
            document.getElementById('ev-aside').innerHTML = _agendaData.map((ev, i) => {
                const fp = (ev.fecha || '').match(/^\d{4}-/) ? _fechaPlana(ev.fecha) : ev.fecha;
                return `<div class="ev-aside-item${i === activeIdx ? ' activo' : ''}" onclick="abrirEvento(${i})">
                    <span class="ev-aside-date">${fp}</span>
                    <span class="ev-aside-titulo">${ev.titulo}</span>
                </div>`;
            }).join('');
        }

        // FILTRO AGENDA
        function filtrarAgenda(tipo, btn) {
            document.querySelectorAll('#agenda-content .agenda-filter-btn').forEach(t => t.classList.remove('activo'));
            btn.classList.add('activo');
            document.querySelectorAll('.agenda-list-item').forEach(c => {
                c.classList.toggle('oculto', tipo !== 'todos' && c.dataset.tipo !== tipo);
            });
        }

        // FILTRO DIGITAL
        function filtrarDigital(tipo, btn) {
            document.querySelectorAll('.digital-tab').forEach(t => t.classList.remove('activa'));
            btn.classList.add('activa');
            document.querySelectorAll('.digital-item').forEach(c => {
                c.classList.toggle('oculto', tipo !== 'todos' && c.dataset.tipo !== tipo);
            });
        }

        // FILTRO CASOS DE ÉXITO
        function filtrarCasos(tipo, btn) {
            document.querySelectorAll('.casos-tab').forEach(t => t.classList.remove('activa'));
            btn.classList.add('activa');
            document.querySelectorAll('.caso-card').forEach(c => {
                c.classList.toggle('oculto', tipo !== 'todos' && c.dataset.tipo !== tipo);
            });
        }

        /* ── POPUP DOCENTE ── */
        const DOCENTES = {
            'sergio-majluf': {
                nombre: 'Sergio Majluf Jadue',
                cargo: 'Profesor Titular',
                mencion: 'Interacción Digital',
                email: 'sergio.majluf@mail.udp.cl',
                antiguedad: '1 año',
                instagram: '@ux_udp',
                bio: 'Diseñador UC (Chile) y Master en Interactive Telecommunications de New York University. Educador por vocación y promotor de la cultura maker por espíritu, trabaja desde las metodologías de diseño e innovación para el desarrollo, gestión y liderazgo de programas educacionales. Ha participado en la creación, dirección y liderazgo de programas de vinculación con el medio, educación continua, pregrado y posgrado en distintas universidades.',
                asignaturas: ['Taller de Diseño de Interfaces (UI)', 'Taller de Diseño de Experiencias (UX)', 'Fundamentos de UX (Diplomado UDP)'],
                areas: ['Diseño de Interacción', 'Innovación y Emprendimiento', 'Evaluación'],
                fortalezas: ['Flexibilidad y trabajo en equipo', 'Educación', 'Prospección tecnológica'],
            },
            'aaron-montoya': {
                nombre: 'Aarón Montoya Moraga',
                cargo: 'Profesor Adjunto',
                mencion: 'Interacción Digital',
                foto: 'assets/img/MONTOYA_AARON-scaled.jpg',
                email: 'aaron.montoya@mail.udp.cl',
                antiguedad: '1 año',
                instagram: '@ux_udp',
                bio: 'Ingeniere Eléctrique PUC, magíster en Artes Mediales del Interactive Telecommunications Program (ITP) en New York University, magíster en Artes Mediales y Ciencias de MIT Media Lab, becarie de CONICYT y de Processing Foundation. Profesore invitado en la Escuela de Diseño de la Universidad de Chile y en Design Lab de la Universidad Adolfo Ibáñez.',
                asignaturas: ['Taller de Interfaz de Usuario UI (DIS8636)', 'Taller de Experiencia de Usuario UX (DIS8637)', 'Diseño Página Web (DIS9005)', 'Programación Creativa Multimedia (DIS9034)'],
                areas: ['Computación aplicada a diseño y artes', 'Tecnologías web para diseño y artes mediales', 'Ética en inteligencia artificial', 'Diseño de instrumentos musicales digitales y análogos'],
                fortalezas: ['Formación multidisciplinar', 'Habilidades en diseño y escritura de software y hardware'],
                galeria: ['assets/img/montoya 1.png', 'assets/img/montoya 2.png', 'assets/img/montoya 3.png', 'assets/img/montoya 4.png'],
            },
            'manuel-cordova': {
                nombre: 'Manuel Córdova Manzor',
                cargo: 'Profesor Titular',
                mencion: 'Diseño Gráfico',
                email: 'manuel.cordova@mail.udp.cl',
                antiguedad: '20 años',
                instagram: '@tiyda_udp',
                bio: 'Diseñador Gráfico de la U de Chile, Máster en Branding por la Universitat Pompeu Fabra (Barcelona). Co-fundador de Comunas Unidas, estudio de diseño con base en Santiago activo desde 2004. Ha desarrollado cientos de proyectos vinculados a temáticas artísticas, culturales y sociales a nivel local e internacional.',
                asignaturas: ['Taller de Branding S01', 'Taller de Dirección de Arte S02', 'Narrativas Visuales e Inteligencia Artificial (DIS)'],
                areas: ['Identidad visual', 'Comunicación visual para cultura y artes'],
                fortalezas: ['Versátil', 'Empático', 'Riguroso'],
            },
            'ariel-altamirano': {
                nombre: 'Ariel Altamirano Valenzuela',
                cargo: 'Profesor Adjunto',
                mencion: 'Diseño Gráfico',
                email: 'ariel.altamirano@mail.udp.cl',
                antiguedad: '10 años',
                instagram: '@tiyda_udp',
                bio: 'Diseñador gráfico dedicado más de 15 años al diseño de discos y trabajo en el ámbito de la música y cultura. Diseñador estable de la banda Como Asesinar a Felipes. Ha trabajado con Hordatoj, Fakuta, Liricistas, Mente Sabia Cru y Nicole, entre otros. Fundador y director del sello de música electrónica Discos Pegaos.',
                asignaturas: ['Taller de Exploración y Cultura Visual', 'Taller de Branding: Productos y Servicios'],
                areas: ['Diseño Gráfico', 'Música', 'Cultura & Artes', 'Audiovisual'],
                fortalezas: ['Versatilidad'],
            },
            'aribel-gonzalez': {
                nombre: 'Aribel González López',
                cargo: 'Profesora Adjunta',
                mencion: 'Diseño Gráfico',
                email: 'aribel.gonzalez@mail.udp.cl',
                antiguedad: '1 año',
                instagram: '—',
                bio: 'Diseñadora gráfica egresada de la Pontificia Universidad Católica de Chile, especializada en diseño editorial y diseño de identidad. Desde 2014 es socia y directora de arte de la editorial de fotografía Buen Lugar. Sus trabajos han sido premiados en Chile Diseño, Picture of the Year Latam, Latin American Design Awards y la Bienal Iberoamericana de Diseño.',
                asignaturas: ['Taller de Museografía y Proyectos Expositivos'],
                areas: ['Diseño editorial', 'Fotolibros', 'Diseño de identidad'],
                fortalezas: ['Responsabilidad', 'Orden'],
            },
            'alvaro-arteaga': {
                nombre: 'Álvaro Arteaga Sabaini',
                cargo: 'Profesor Adjunto',
                mencion: 'Diseño Gráfico',
                email: 'alvaro.arteaga@mail.udp.cl',
                antiguedad: '12 años',
                instagram: '@taller_editorial_ilustrado',
                bio: 'Diseñador gráfico e ilustrador profesional. Dedicado a la docencia hace 15 años, 12 de ellos en la Escuela de Diseño UDP. Especializado en temas de dibujo, ilustración, fotografía, cine y cultura popular.',
                asignaturas: ['Taller Editorial Publicaciones', 'Laboratorio de Dibujo e Imagen', 'Comunicación Gráfica II', 'Fotografía'],
                areas: ['Diseño Gráfico', 'Dirección de Arte', 'Ilustración', 'Fotografía'],
                fortalezas: ['Rigurosidad', 'Motivación'],
            },
            'jennifer-king': {
                nombre: 'Jennifer King',
                cargo: 'Profesora Titular',
                mencion: 'Diseño Gráfico',
                email: 'jennifer.king@mail.udp.cl',
                antiguedad: '29 años',
                instagram: '@taller_editorial_ilustrado',
                bio: 'Docente con 29 años de trayectoria en la institución. Especializada en ediciones ilustradas y publicaciones. Además ejerce como docente en el Diplomado de Ilustración de la PUC.',
                asignaturas: ['Taller Vertical Ediciones Ilustradas'],
                areas: [],
                fortalezas: [],
            },
            'simon-gallardo': {
                nombre: 'Simón Gallardo Ban',
                cargo: 'Profesor Titular',
                mencion: 'Diseño Industrial',
                email: 'manuel.gallardo@mail.udp.cl',
                antiguedad: '18 años',
                instagram: '@reobserva',
                bio: 'Diseñador Industrial UDP y amante de la naturaleza. Ha trazado su trayectoria profesional entre el paisaje, lo audiovisual y el desarrollo de productos. Cuenta con una maestría en Territorio y Paisaje de la UDP, estudios de Diseño Avanzado de Productos en NAVA y más de 18 años de carrera docente. Actualmente es académico en la Universidad Católica de Temuco, a cargo de coordinación y docencia en título.',
                asignaturas: ['Taller Diseño en Áreas Protegidas'],
                areas: ['Territorio y paisaje'],
                fortalezas: ['Conocimiento interdisciplinar', 'Trabajo en equipo'],
            },
            'juan-gili': {
                nombre: 'Juan Gili Hanisch',
                cargo: 'Profesor Adjunto',
                mencion: 'Diseño Industrial',
                email: 'juan.gili@mail.udp.cl',
                antiguedad: '12 años',
                instagram: '@reobserva',
                bio: 'Diseñador Industrial, Magíster en Territorio y Paisaje de la UDP. Ha investigado, conservado y divulgado sitios arqueológicos del Norte Grande de Chile a través de la Fundación Desierto de Atacama, trabajo reconocido con el Premio de Conservación 2017 del Consejo de Monumentos Nacionales. Ha participado en la Trienal de Arquitectura de Sharjah 2019 y la Bienal de Arte de Tailandia 2022. Actualmente es coordinador del centro CREA del Campus Creativo UNAB.',
                asignaturas: ['Taller Diseño para Áreas Silvestres'],
                areas: ['Diseño de Equipamiento para Parques y Reservas', 'Museografía y Montaje', 'Arqueología y Conservación'],
                fortalezas: ['Producción', 'Resolución de problemas', 'Adaptación al cambio', 'Buen trato humano'],
            },
            'vicente-stephens': {
                nombre: 'Vicente Stephens Manríquez',
                cargo: 'Profesor Titular',
                mencion: 'Diseño Industrial',
                email: 'vicente.stephens@mail.udp.cl',
                antiguedad: '2 años',
                instagram: '@procesos.fabricacion.udp',
                bio: 'Diseñador Industrial UDP especializado en el desarrollo y fabricación de objetos y muebles de madera. Tiene una fábrica en la cual colabora con diferentes arquitectos, artistas y diseñadores para crear sus proyectos.',
                asignaturas: ['Taller de Investigación y Desarrollo Material'],
                areas: ['Fabricación y diseño industrial'],
                fortalezas: ['Desarrollo, construcción y fabricación', 'Dibujo técnico y a mano alzada', 'Estudio de materiales'],
            },
            'margarita-talep': {
                nombre: 'Margarita Talep Follert',
                cargo: 'Profesora Adjunta',
                mencion: 'Diseño Industrial',
                email: 'margarita.talep@mail.udp.cl',
                antiguedad: '5 años',
                instagram: '@procesos.fabricacion.udp',
                bio: 'Diseñadora Industrial (Rancagua, 1995). Ha expuesto en el Palacio Pereira, el MAVI y el Citylab del GAM. Ha participado en exposiciones colectivas en México, China, Inglaterra, Alemania y Suecia. Obtuvo el premio de bronce en el Beyond Plastic Award de Alemania (2019), fue reconocida como Top 50 Thinkers to Rebuild the World por Prospect Magazine (2021) y galardonada como Egresada Destacada UDP 2021. Actualmente cursa el Magíster de Arquitectura Sustentable y Energía en la PUC.',
                asignaturas: ['Taller de Procesos y Fabricación S02', 'Taller de Investigación y Desarrollo Material S01', 'Visualización y Materia (ARQ)', 'Experimentación y Producción Biomaterial (DIS)'],
                areas: ['Materiales', 'Biomateriales', 'Biodiseño'],
                fortalezas: ['Responsable', 'Observadora', 'Mediadora', 'Inspiradora', 'Empática', 'Rigurosa'],
            },
            'alejandra-ruiz': {
                nombre: 'Alejandra Contessina Ruiz San Martín',
                cargo: 'Profesora Titular',
                mencion: 'Textil e Indumentaria',
                email: 'alejandra.ruiz@mail.udp.cl',
                antiguedad: '14 años',
                instagram: '@tallersostenible',
                bio: 'Diseñadora UDP certificada en Fashion Sustainability en Parsons School of Design (NYC) y en Design to Improve Life por The Index Project (Copenhague). Jefa del Diplomado Moda Futura en UDD, especializado en estrategia y gestión sostenible para la industria del textil e indumentaria. Socia fundadora del estudio boutique CR, especializado en moda sostenible para el ámbito corporativo con clientes en Santiago, Buenos Aires y Nueva York.',
                asignaturas: ['Taller de Productos Sostenibles', 'Taller de Textil e Indumentaria Sostenible'],
                areas: ['Textil e indumentaria sostenible', 'Estrategia y gestión en la industria del textil e indumentaria'],
                fortalezas: ['Sostenibilidad', 'Educación', 'Innovación'],
            },
            'paulina-romero': {
                nombre: 'Paulina Romero Solimano',
                cargo: 'Profesora Titular',
                mencion: 'Textil e Indumentaria',
                email: 'maru.romero@mail.udp.cl',
                antiguedad: '12 años',
                instagram: '@taller_indumentariatx',
                bio: 'Diseñadora de la Pontificia Universidad Católica de Chile. Magíster en Artes con mención en Artes Visuales, Universidad de Chile. Diseñadora y Artista Textil con más de 20 años de experiencia en docencia de pregrado y posgrado en el área de Vestuario y Textiles. Desarrollo profesional independiente como diseñadora textil e ilustradora.',
                asignaturas: ['Taller Vertical Indumentaria', 'Superficies Textiles'],
                areas: ['Diseño de instrumentos para mejora de aprendizajes', 'Teñidos naturales con hierbas chilenas', 'El textil e indumentaria como modelador de sistemas de consumo'],
                fortalezas: ['Gran experiencia docente', 'Adaptabilidad', 'Creatividad para el aprendizaje significativo'],
            },
            'eugenia-ibarra': {
                nombre: 'María Eugenia Ibarra Letelier',
                cargo: 'Profesora Adjunta',
                mencion: 'Textil e Indumentaria',
                email: 'maria.ibarra2@mail.udp.cl',
                antiguedad: '1 año',
                instagram: '@taller_indumentariatx',
                bio: 'Diseñadora textil y de vestuario, con formación en marketing y comunicación de moda. Creadora de la marca sostenible Ropa de Género (RDG) desde 2006. Ha representado su marca en ferias internacionales en Tokio, Ciudad de México y Los Ángeles con apoyo de ProChile. Reconocida en la Bienal Iberoamericana de Diseño (Madrid 2021) y Selvedge World Fair (Reino Unido 2021). En 2020 inició la \u201cIncubadora creativa del Tejido rural\u201d en la región de O\u2019Higgins.',
                asignaturas: ['Taller Vertical Indumentaria', 'Superficies Textiles'],
                areas: ['Investigación textil', 'Metodología y certificación Tejido Escapular'],
                fortalezas: ['Creatividad e ingenio', 'Compromiso social', 'Versatilidad y flexibilidad'],
            },
            'felipe-sepulveda': {
                nombre: 'Felipe Sepúlveda Tamayo',
                cargo: 'Profesor Adjunto',
                mencion: 'Textil e Indumentaria',
                email: 'felipe.sepulveda7@mail.udp.cl',
                antiguedad: '1 año',
                instagram: '@tallersostenible',
                bio: 'Diseñador y Licenciado en Artes (carreras paralelas) de la PUC. Con 13 años de trayectoria en destacadas empresas de retail nacional como líder corporativo de Store Planning y Visual Merchandising (Colgram, Cencosud, Rosen). Creador y jefe del Diplomado en Vitrinismo y Visual Merchandising de la PUC. Actualmente egresado del Magíster en Diseño e Innovación Sostenible, desarrollando un proyecto que vincula textil e indumentaria autóctona con diseño e IA.',
                asignaturas: ['Taller Vertical Integrado de Productos Sostenibles', 'Taller de Textiles de Punto'],
                areas: ['Creación para el textil e indumentaria y sostenibilidad'],
                fortalezas: ['Innovación para la sostenibilidad en el textil e indumentaria', 'Transferencia de conocimiento', 'Compromiso docente', 'Trabajo en equipo'],
            },
        };

        const DOCENTES_KEYS = Object.keys(DOCENTES);
        let docenteActualIdx = 0;

        function abrirDocente(id) {
            const idx = DOCENTES_KEYS.indexOf(id);
            if (idx !== -1) docenteActualIdx = idx;
            _renderDocente(DOCENTES_KEYS[docenteActualIdx]);
            const overlay = document.getElementById('dp-overlay');
            overlay.classList.add('abierto');
            document.body.style.overflow = 'hidden';
        }

        function _renderDocente(id) {
            const d = DOCENTES[id];
            if (!d) return;
            const overlay = document.getElementById('dp-overlay');

            const palabras = d.nombre.trim().split(/\s+/);
            overlay.querySelector('.dp-nombre').textContent = palabras.slice(0, 2).join(' ');
            overlay.querySelector('.dp-cargo').textContent = d.cargo;
            overlay.querySelector('.dp-tag').textContent = d.mencion;
            overlay.querySelector('.dp-bio').textContent = d.bio;
            overlay.querySelector('[data-dp="email"]').textContent = d.email;
            overlay.querySelector('[data-dp="antiguedad"]').textContent = d.antiguedad;
            overlay.querySelector('[data-dp="instagram"]').textContent = d.instagram;

            // Foto de perfil
            const fotoEl = overlay.querySelector('.dp-foto');
            if (d.foto) {
                fotoEl.innerHTML = `<img src="${d.foto}" alt="${d.nombre}">`;
            } else {
                fotoEl.innerHTML = '';
            }

            // Galería slider
            const galeria = d.galeria || [];
            const track = document.getElementById('dp-galeria-track');
            const dotsEl = document.getElementById('dp-galeria-dots');
            track.innerHTML = Array.from({ length: 4 }, (_, i) => {
                const src = galeria[i];
                const srcEncoded = src ? src.replace(/ /g, '%20') : null;
                return srcEncoded
                    ? `<div class="dp-galeria-slide"><img src="${srcEncoded}" alt="Proyecto ${i+1}"></div>`
                    : `<div class="dp-galeria-slide placeholder"></div>`;
            }).join('');
            dotsEl.innerHTML = Array.from({ length: 4 }, (_, i) =>
                `<div class="dp-galeria-dot${i === 0 ? ' activo' : ''}"></div>`
            ).join('');
            // Listeners en dots: click pausa; doble-click reanuda
            dotsEl.querySelectorAll('.dp-galeria-dot').forEach((dot, i) => {
                dot.addEventListener('click', () => {
                    if (galeriaPausada && galeriaIdx === i) {
                        reanudarAutoScroll();
                    } else {
                        pausarEnDot(i);
                    }
                });
            });
            galeriaIdx = 0;
            track.style.transform = 'translateX(0)';
            galeriaPausada = false;
            iniciarAutoScroll();

            document.getElementById('dp-counter').textContent =
                `${docenteActualIdx + 1} / ${DOCENTES_KEYS.length}`;
        }

        function navegarDocente(dir) {
            docenteActualIdx = (docenteActualIdx + dir + DOCENTES_KEYS.length) % DOCENTES_KEYS.length;
            _renderDocente(DOCENTES_KEYS[docenteActualIdx]);
        }

        let galeriaIdx = 0;
        let galeriaTimer = null;
        let galeriaPausada = false;

        function irASlide(idx) {
            const slides = document.querySelectorAll('.dp-galeria-slide');
            const dots   = document.querySelectorAll('.dp-galeria-dot');
            if (!slides.length) return;
            galeriaIdx = (idx + slides.length) % slides.length;
            document.getElementById('dp-galeria-track').style.transform =
                `translateX(-${galeriaIdx * 100}%)`;
            dots.forEach((d, i) => {
                d.classList.toggle('activo', i === galeriaIdx);
            });
        }

        function navegarGaleria(dir) {
            irASlide(galeriaIdx + dir);
        }

        function iniciarAutoScroll() {
            detenerAutoScroll();
            if (galeriaPausada) return;
            galeriaTimer = setInterval(() => navegarGaleria(1), 2500);
        }

        function detenerAutoScroll() {
            if (galeriaTimer) { clearInterval(galeriaTimer); galeriaTimer = null; }
        }

        function pausarEnDot(idx) {
            galeriaPausada = true;
            detenerAutoScroll();
            irASlide(idx);
            // Marcar dot pausado
            document.querySelectorAll('.dp-galeria-dot').forEach((d, i) => {
                d.classList.toggle('pausado', i === idx);
            });
        }

        function reanudarAutoScroll() {
            galeriaPausada = false;
            document.querySelectorAll('.dp-galeria-dot').forEach(d => d.classList.remove('pausado'));
            iniciarAutoScroll();
        }

        document.addEventListener('DOMContentLoaded', function() {
            const overlay = document.getElementById('dp-overlay');
            if (!overlay) return;

            const cerrar = () => {
                overlay.classList.remove('abierto');
                document.body.style.overflow = '';
                detenerAutoScroll();
            };

            document.getElementById('dp-close').addEventListener('click', cerrar);
            document.getElementById('dp-prev').addEventListener('click', () => navegarDocente(-1));
            document.getElementById('dp-next').addEventListener('click', () => navegarDocente(1));

            overlay.addEventListener('click', e => {
                if (e.target === overlay) cerrar();
            });

            document.addEventListener('keydown', e => {
                if (!overlay.classList.contains('abierto')) return;
                if (e.key === 'Escape') cerrar();
                if (e.key === 'ArrowLeft')  navegarDocente(-1);
                if (e.key === 'ArrowRight') navegarDocente(1);
            });
        });

        /* =========================================
           PORTAFOLIO — Sheets API v4 (fuente principal)
        ========================================= */
        const SHEETS_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets/1Y_pmmK7_d_mQAK3xOXO9k0ADidAzcqXbBcZnTqEmdks/values/Proyectos?key=AIzaSyD2Rwj6W9qbRnCmtg9g8cMG9iLAvhA2y6I';
        const GAS_API_URL = '';
        const SHEET_CSV_URL = '';

        /* =========================================
           POPUP PROYECTO — Cédula de proyecto
        ========================================= */
        document.addEventListener('DOMContentLoaded', function() {
            const ppOverlay  = document.getElementById('pp-overlay');
            const ppClose    = document.getElementById('pp-close');
            const ppScene    = document.getElementById('pp-scene');
            const ppSidePrev = document.getElementById('pp-side-prev');
            const ppSideNext = document.getElementById('pp-side-next');
            if (!ppOverlay) return;

            const MENCION_LABEL = {
                grafico: 'Diseño Gráfico',
                industrial: 'Diseño Industrial',
                indumentaria: 'Textil e Indumentaria',
                interaccion: 'Diseño de Interacción',
                multiple: 'Múltiple Mención',
            };

            const PROYECTOS = {
                'fauna-primavera': {
                    titulo: 'Festival 26 Fauna Primavera · Cartel y señalética',
                    num: '(01)', mencion: 'grafico', anio: '2025',
                    tipo: 'Identidad · Festival',
                    colaboradores: 'Manuel Córdoba',
                    desc: 'Registro fotográfico del Festival 26 Fauna Primavera: cartelería, señalética y producción gráfica del evento. Identidad visual desarrollada en colaboración con el equipo de comunicaciones de la Escuela de Diseño UDP.',
                    img: 'assets/img/fauna_raw.jpg', galeria: ['assets/img/fauna_raw.jpg'],
                },
                'metamorfa': {
                    titulo: 'METAMORFA · Instalación expositiva',
                    num: '(02)', mencion: 'industrial', anio: '2025',
                    tipo: 'Instalación · Exhibición',
                    colaboradores: 'Mále Uribe, Vicente Stephens',
                    desc: 'Instalación expositiva que explora la metamorfosis de materiales y formas en espacio. Registro de montaje y exhibición en la Escuela de Diseño UDP, junio 2025.',
                    img: 'assets/img/metamorfa_raw.jpg', galeria: ['assets/img/metamorfa_raw.jpg'],
                },
                'silla-metal': {
                    titulo: 'Silla Metal · Sesión Mayo 2026',
                    num: '(03)', mencion: 'grafico', anio: '2026',
                    tipo: 'Fotografía de objeto · Estudio',
                    colaboradores: 'Escuela de Diseño UDP',
                    desc: 'Sesión fotográfica de estudio con iluminación dramática documentando la Silla Metal. La fotografía analítica del objeto explora la tensión entre la geometría del metal y la presencia corporal.',
                    img: 'assets/img/silla_metal_studio.jpg', galeria: ['assets/img/silla_metal_studio.jpg'],
                },
                'historia-diseno-nicanor-parra': {
                    titulo: 'Historia del Diseño Chileno · Nicanor Parra',
                    num: '(04)', mencion: 'grafico', anio: '2026',
                    tipo: 'Investigación · Historia del diseño',
                    colaboradores: 'Escuela de Diseño UDP',
                    desc: 'Registro del módulo de Historia del Diseño Chileno centrado en Nicanor Parra y su relación con la cultura visual del siglo XX: antipoesía, tipografía y el diseño como acto político.',
                    img: 'assets/img/nicanor_parra.jpg', galeria: ['assets/img/nicanor_parra.jpg'],
                },
                'lab360-sesion': {
                    titulo: 'Sesión Lab 360 · Exploración gráfica',
                    num: '(05)', mencion: 'grafico', anio: '2026',
                    tipo: 'Gráfica · Risografía',
                    colaboradores: 'Laboratorio Lab 360 UDP',
                    desc: 'Registro de sesión de trabajo en el Laboratorio 360, espacio de exploración gráfica análoga. La sesión investigó la risografía y la ilustración como lenguajes propios del laboratorio.',
                    img: 'assets/img/lab360_sesion.jpg', galeria: ['assets/img/lab360_sesion.jpg'],
                },
                'boric-modo-historia': {
                    titulo: 'Boric: Modo Historia · Diseño de Información',
                    num: '(06)', mencion: 'grafico', anio: '2026',
                    tipo: 'Infografía · Diseño de datos',
                    colaboradores: 'Estudiantes Solemne 1 — Sergio Mora-Díaz',
                    desc: 'Proyecto de visualización política desarrollado en el ramo de Sergio Mora-Díaz. El diseño de información articula hitos del gobierno Boric en un sistema editorial de datos.',
                    img: 'assets/img/solemne_moradiaz.jpg', galeria: ['assets/img/solemne_moradiaz.jpg'],
                },
                'laboratorio-otf-charla': {
                    titulo: 'Laboratorio OTF · Charla de Tipografía',
                    num: '(07)', mencion: 'grafico', anio: '2026',
                    tipo: 'Tipografía · Laboratorio',
                    colaboradores: 'Laboratorio OTF — Alejandro Navarro',
                    desc: 'Registro de charla de tipografía en el Laboratorio OTF. El Laboratorio es el núcleo productivo de la escuela especializado en tipografía experimental y diseño de tipos.',
                    img: 'assets/img/otf_charla.jpg', galeria: ['assets/img/otf_charla.jpg'],
                },
                'museo-museos-branding': {
                    titulo: 'Museo de los Museos · Taller de Branding',
                    num: '(08)', mencion: 'grafico', anio: '2026',
                    tipo: 'Identidad · Branding',
                    colaboradores: 'Estudiantes Taller de Branding UDP',
                    desc: 'Proyecto colaborativo entre la Escuela de Diseño UDP y el Museo de los Museos. Los estudiantes diseñaron identidad visual y sistema de marca para los 15 años de la institución.',
                    img: 'assets/img/museo_branding.jpg', galeria: ['assets/img/museo_branding.jpg'],
                },
                'examen-titulo-2025': {
                    titulo: 'Examen de Título 2025 · Proyectos de grado',
                    num: '(09)', mencion: 'grafico', anio: '2025',
                    tipo: 'Proyecto de Título · Graduación',
                    colaboradores: 'Escuela de Diseño UDP — Cohorte 2025',
                    desc: 'Registro del Examen de Título 2025. Los proyectos de grado presentados cubren las tres menciones: Diseño Gráfico, Diseño Industrial e Indumentaria.',
                    img: 'assets/img/examen_titulo.jpg', galeria: ['assets/img/examen_titulo.jpg'],
                },
                'grounding-computation': {
                    titulo: 'Grounding Computation · Instalación',
                    num: '(10)', mencion: 'grafico', anio: '2026',
                    tipo: 'Instalación · Digital',
                    colaboradores: 'Escuela de Diseño UDP',
                    desc: 'Instalación que investiga la materialidad de los procesos computacionales: dónde los datos tocan el cuerpo, el espacio y la superficie. Registro de montaje mayo 2026.',
                    img: 'assets/img/grounding_computation.jpg', galeria: ['assets/img/grounding_computation.jpg'],
                },
                'taller-editorial-ilustrado': {
                    titulo: 'Taller Editorial Ilustrado · Mayo 2026',
                    num: '(11)', mencion: 'grafico', anio: '2026',
                    tipo: 'Editorial · Taller',
                    colaboradores: 'Escuela de Diseño UDP',
                    desc: 'Taller que exploró la intersección entre ilustración y diseño editorial, produciendo publicaciones de pequeño tiraje. Registro de proceso y resultado, mayo 2026.',
                    img: 'assets/img/taller_editorial_ilustrado.jpg', galeria: ['assets/img/taller_editorial_ilustrado.jpg'],
                },
                'taller-manuel-cordova': {
                    titulo: 'Taller Manuel Córdova · Diseño Gráfico',
                    num: '(12)', mencion: 'grafico', anio: '2026',
                    tipo: 'Taller · Diseño Gráfico',
                    colaboradores: 'Manuel Córdova — Taller Vertical UDP',
                    desc: 'Documentación del Taller Vertical de Diseño Gráfico dictado por Manuel Córdova. El taller aborda metodologías contemporáneas de identidad y comunicación visual.',
                    img: 'assets/img/taller_manuel_cordova.jpg', galeria: ['assets/img/taller_manuel_cordova.jpg'],
                },
                'revista-180': {
                    titulo: 'Revista 180 · Fotografía Editorial',
                    num: '(13)', mencion: 'grafico', anio: '2026',
                    tipo: 'Publicación · Fotografía editorial',
                    colaboradores: 'Revista 180 — Escuela de Diseño UDP',
                    desc: 'Registro fotográfico editorial para Revista 180, publicación académica de la Escuela de Diseño UDP. La sesión documenta el proceso de producción de la publicación.',
                    img: 'assets/img/revista_180.jpg', galeria: ['assets/img/revista_180.jpg'],
                },
                'archivo-30anos': {
                    titulo: '30 Años Escuela · Naranja Publicaciones',
                    num: '(14)', mencion: 'grafico', anio: '2026',
                    tipo: 'Publicación · Archivo',
                    colaboradores: 'Naranja Publicaciones — Escuela de Diseño UDP',
                    desc: 'Proyecto editorial que conmemora los 30 años de la Escuela de Diseño UDP, desarrollado con Naranja Publicaciones. El archivo reúne imágenes y documentos históricos de la escuela.',
                    img: 'assets/img/archivo_30anos.jpg', galeria: ['assets/img/archivo_30anos.jpg'],
                },
                'kayak-groenlandes': {
                    titulo: 'Kayak groenlandés · La herencia de la técnica',
                    num: '(15)', mencion: 'multiple', anio: '2026',
                    tipo: 'Proyecto de Título · Fabricación',
                    colaboradores: 'Sebastián Romero — Taller Ruina (guía: Jenny Abud)',
                    desc: 'Proyecto de título de Sebastián Romero, alumni y docente UDP, desarrollado en el Taller Ruina bajo la guía de Jenny Abud. El kayak groenlandés fue construido en el marco de la investigación "La herencia de la técnica", que explora los saberes artesanales transmitidos a través del cuerpo y la repetición.',
                    img: 'assets/img/kayak_raw.jpg', galeria: ['assets/img/kayak_raw.jpg'],
                },
                'chile-originario': {
                    titulo: 'Chile Originario · Taller de Diseño Gráfico III',
                    num: '(16)', mencion: 'grafico', anio: '2026',
                    tipo: 'Información · Editorial',
                    colaboradores: 'Estudiantes Taller DG III — Camilo Zúñiga, Antonieta López, Marijan Pivalica',
                    desc: 'Resultados del examen final del Taller de Diseño Gráfico III con estudiantes de segundo año. El ejercicio propuso comunicar el legado de los pueblos originarios de Chile mediante diseño editorial, tipografía e ilustración.',
                    img: 'assets/img/chile_originario_raw.jpg', galeria: ['assets/img/chile_originario_raw.jpg'],
                },
                'colectivas-feminismo': {
                    titulo: 'Colectivas · Gráfica, Feminismo & Resistencia',
                    num: '(17)', mencion: 'grafico', anio: '2021',
                    tipo: 'Proyecto de Título · Digital',
                    colaboradores: 'Camila Espinoza Petermann',
                    desc: 'Proyecto de título de Camila Espinoza Petermann, seleccionado para representar a Chile en la Bienal Iberoamericana de Diseño en Madrid 2021. Colectivas visibiliza el trabajo artístico y político de mujeres feministas durante el Estallido Social de 2019 a través de una serie documental y una plataforma digital.',
                    img: 'assets/img/colectivas_raw.jpg', galeria: ['assets/img/colectivas_raw.jpg'],
                },
                'maquinas-percutoras': {
                    titulo: 'Máquinas Percutoras · Diseño y Performance',
                    num: '(18)', mencion: 'multiple', anio: '2026',
                    tipo: 'Fabricación · Performance',
                    colaboradores: 'Docentes y estudiantes Escuela de Diseño UDP — Splitting Absence',
                    desc: 'Proyecto que cruza fabricación e investigación en performance musical. Las máquinas percutoras son instrumentos diseñados y construidos por docentes y estudiantes de la Escuela, presentados en el proyecto de danza y sonido Splitting Absence.',
                    img: 'assets/img/maquinas_raw.jpg', galeria: ['assets/img/maquinas_raw.jpg'],
                },
            };

            const PP_KEYS = Object.keys(PROYECTOS);
            let ppActualIdx = 0;
            let ppGaleriaIdx = 0;
            let ppGaleriaTimer = null;

            function ppIrASlide(idx) {
                const slides = ppOverlay.querySelectorAll('.pp-galeria-slide');
                const dots   = ppOverlay.querySelectorAll('.pp-galeria-dot');
                if (!slides.length) return;
                ppGaleriaIdx = (idx + slides.length) % slides.length;
                document.getElementById('pp-galeria-track').style.transform =
                    `translateX(-${ppGaleriaIdx * 100}%)`;
                dots.forEach((d, i) => d.classList.toggle('activo', i === ppGaleriaIdx));
            }

            function ppIniciarAutoScroll() {
                if (ppGaleriaTimer) clearInterval(ppGaleriaTimer);
                ppGaleriaTimer = setInterval(() => ppIrASlide(ppGaleriaIdx + 1), 3000);
            }

            function ppDetenerAutoScroll() {
                if (ppGaleriaTimer) { clearInterval(ppGaleriaTimer); ppGaleriaTimer = null; }
            }

            function _renderProyecto(id) {
                const p = PROYECTOS[id];
                if (!p) return;

                // Número, tags, título, descripción
                document.getElementById('pp-num').textContent         = p.num || '';
                document.getElementById('pp-tag-mencion').textContent = MENCION_LABEL[p.mencion] || p.mencion;
                document.getElementById('pp-tag-anio').textContent    = p.anio;
                document.getElementById('pp-titulo').textContent      = p.titulo;
                document.getElementById('pp-desc').textContent        = p.desc;

                // Meta filas dinámicas
                const metaEl = document.getElementById('pp-meta');
                const metaData = [
                    ['Año', p.anio],
                    ['Tipo', p.tipo],
                    ['Colaboradores', p.colaboradores],
                ].filter(([, v]) => v);
                metaEl.innerHTML = metaData.map(([label, val]) =>
                    `<div class="pp-meta-row">
                        <span class="pp-meta-label">${label}</span>
                        <span class="pp-meta-val">${val}</span>
                    </div>`
                ).join('');

                // Galería
                const track  = document.getElementById('pp-galeria-track');
                const dotsEl = document.getElementById('pp-galeria-dots');
                const galeriaImgs = (p.galeria && p.galeria.length) ? p.galeria : (p.img ? [p.img] : []);
                track.innerHTML = galeriaImgs.map(src =>
                    `<div class="pp-galeria-slide"><img src="${src}" alt="${p.titulo}"></div>`
                ).join('');
                dotsEl.innerHTML = galeriaImgs.length > 1
                    ? galeriaImgs.map((_, i) =>
                        `<div class="pp-galeria-dot${i === 0 ? ' activo' : ''}"></div>`).join('')
                    : '';
                dotsEl.querySelectorAll('.pp-galeria-dot').forEach((dot, i) => {
                    dot.addEventListener('click', () => ppIrASlide(i));
                });
                document.getElementById('pp-galeria-label').textContent =
                    (p.num || '') + '  ' + p.anio;
                ppGaleriaIdx = 0;
                track.style.transform = 'translateX(0)';
                ppIniciarAutoScroll();

            }

            function ppNavegar(direction) {
                ppDetenerAutoScroll();
                const exitClass  = direction > 0 ? 'pp-slide-left' : 'pp-slide-right';
                const enterClass = direction > 0 ? 'pp-enter-right' : 'pp-enter-left';
                ppScene.classList.add(exitClass);
                setTimeout(() => {
                    ppActualIdx = (ppActualIdx + direction + PP_KEYS.length) % PP_KEYS.length;
                    _renderProyecto(PP_KEYS[ppActualIdx]);
                    ppScene.classList.remove(exitClass);
                    ppScene.classList.add(enterClass);
                    setTimeout(() => ppScene.classList.remove(enterClass), 280);
                }, 200);
            }

            window.abrirProyecto = function(id) {
                // Si el slug no está en PROYECTOS, construirlo desde el arch-item del DOM
                if (!PROYECTOS[id]) {
                    const item = document.querySelector(`.arch-item[data-proyecto="${id}"]`);
                    if (item) {
                        const imgEl  = item.querySelector('.arch-img img');
                        const imgSrc = imgEl ? imgEl.getAttribute('src') : '';
                        const titulo = item.dataset.titulo || id;
                        const mencion = item.dataset.mencion || 'multiple';
                        const numEl  = item.querySelector('.arch-num');
                        const num    = numEl ? numEl.textContent : '';
                        const tags   = Array.from(item.querySelectorAll('.arch-tag')).map(t => t.textContent);

                        // data-galeria="FILE_ID1,FILE_ID2,..." → múltiples imágenes Drive
                        const galeriaAttr = item.dataset.galeria || '';
                        const galeria = galeriaAttr
                            ? galeriaAttr.split(',').map(fid =>
                                `https://lh3.googleusercontent.com/d/${fid.trim()}=w1200`)
                            : (imgSrc ? [imgSrc] : []);

                        PROYECTOS[id] = {
                            titulo, num, mencion, anio: '',
                            tipo: tags.slice(0, 3).join(' · '),
                            colaboradores: '', desc: '',
                            img: imgSrc, galeria
                        };
                        if (!PP_KEYS.includes(id)) PP_KEYS.push(id);
                    }
                }
                const idx = PP_KEYS.indexOf(id);
                if (idx !== -1) ppActualIdx = idx;
                if (PP_KEYS[ppActualIdx]) _renderProyecto(PP_KEYS[ppActualIdx]);
                ppOverlay.classList.add('abierto');
                document.body.style.overflow = 'hidden';
            };

            ppSidePrev.addEventListener('click', () => ppNavegar(-1));
            ppSideNext.addEventListener('click', () => ppNavegar(1));

            // ── CARGA DINÁMICA DESDE GAS ──────────────────────────────────────
            const RATIOS_GRID = ['3/4','4/3','2/3','4/5','1/1','3/2','4/3','3/4','4/5','2/3','1/1','4/3'];

            function escHtml(str) {
                return String(str || '')
                    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
                    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
            }

            function toSlug(str) {
                return String(str || '').toLowerCase()
                    .normalize('NFD').replace(/[̀-ͯ]/g, '')
                    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            }

            function parseCSV(text) {
                const rows = [];
                let row = [], field = '', inQuote = false;
                for (let i = 0; i < text.length; i++) {
                    const ch = text[i];
                    if (inQuote) {
                        if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
                        else if (ch === '"') inQuote = false;
                        else field += ch;
                    } else {
                        if (ch === '"') inQuote = true;
                        else if (ch === ',') { row.push(field); field = ''; }
                        else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
                        else if (ch !== '\r') field += ch;
                    }
                }
                if (row.length > 0 || field !== '') { row.push(field); rows.push(row); }
                return rows;
            }

            function csvToProyectos(csvText) {
                const rows = parseCSV(csvText);
                if (rows.length < 2) return [];
                const headers = rows[0].map(h => h.trim());
                const col = name => headers.findIndex(h => h === name);
                const iNombre   = col('NOMBRE PROYECTO');
                const iAutor    = col('AUTOR');
                const iTipo     = col('TIPO');
                const iColec    = col('COLECCIÓN');
                const iEtiq     = col('ETIQUETAS');
                const iDesc     = col('DESCRIPCIÓN');
                const iDrive    = col('LINK DRIVE');
                const iStatus   = col('STATUS');
                const iPortada  = col('PORTADA_ID');
                const iYT       = col('LINK YT');
                const iRedes    = col('REDES Y ENLACES');
                const iPalabras = col('PALABRAS CLAVES');
                return rows.slice(1)
                    .filter(r => {
                        const portada = (r[iPortada] || '').trim();
                        const status  = (r[iStatus]  || '').trim();
                        return portada && status !== 'rechazado';
                    })
                    .map(r => {
                        const nombre   = (r[iNombre] || '').trim();
                        const portadaId = (r[iPortada] || '').trim();
                        const etiqStr  = (r[iEtiq]  || '').trim();
                        const driveUrl = (r[iDrive]  || '').trim();
                        const driveMatch = driveUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
                        return {
                            slug:         toSlug(nombre),
                            titulo:       nombre,
                            autor:        (r[iAutor]    || '').trim(),
                            tipo:         (r[iTipo]     || '').trim(),
                            coleccion:    (r[iColec]    || '').trim(),
                            tags:         etiqStr ? etiqStr.split(',').map(t => t.trim()).filter(Boolean) : [],
                            descripcion:  (r[iDesc]     || '').trim(),
                            imgUrl:       portadaId ? `https://lh3.googleusercontent.com/d/${portadaId}=w1200` : '',
                            redes:        (r[iRedes]    || '').trim(),
                            palabrasClave:(r[iPalabras] || '').trim(),
                            videoYt:      (r[iYT]       || '').trim(),
                            driveFolder:  driveMatch ? driveMatch[1] : '',
                        };
                    })
                    .filter(p => p.slug && p.imgUrl);
            }

            async function cargarPortafolio() {
                let data = null;

                // Sheets API v4 (fuente principal, sin CORS)
                if (SHEETS_API_URL) {
                    try {
                        const res = await fetch(SHEETS_API_URL);
                        if (res.ok) {
                            const json = await res.json();
                            const rows = json.values || [];
                            if (rows.length > 1) {
                                const heads = rows[0].map(h => String(h).trim());
                                const col = n => heads.indexOf(n);
                                const iNombre=col('NOMBRE PROYECTO'),iAutor=col('AUTOR'),iTipo=col('TIPO'),
                                      iColec=col('COLECCIÓN'),iEtiq=col('ETIQUETAS'),iDesc=col('DESCRIPCIÓN'),
                                      iDrive=col('LINK DRIVE'),iStatus=col('STATUS'),iPortada=col('PORTADA_ID'),
                                      iYT=col('LINK YT'),iRedes=col('REDES Y ENLACES'),iPalabras=col('PALABRAS CLAVES');
                                const proyectos = rows.slice(1)
                                    .filter(r => {
                                        const portada = String(r[iPortada] || '').trim();
                                        const status  = String(r[iStatus]  || '').trim();
                                        return portada && status !== 'rechazado';
                                    })
                                    .map(r => {
                                        const nombre    = String(r[iNombre]  || '').trim();
                                        const portadaId = String(r[iPortada] || '').trim();
                                        const etiqStr   = String(r[iEtiq]   || '').trim();
                                        const driveUrl  = String(r[iDrive]  || '').trim();
                                        const driveM    = driveUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
                                        return {
                                            slug:         toSlug(nombre),
                                            titulo:       nombre,
                                            autor:        String(r[iAutor]    || '').trim(),
                                            tipo:         String(r[iTipo]     || '').trim(),
                                            coleccion:    String(r[iColec]    || '').trim(),
                                            tags:         etiqStr ? etiqStr.split(',').map(t => t.trim()).filter(Boolean) : [],
                                            descripcion:  String(r[iDesc]     || '').trim(),
                                            imgUrl:       portadaId ? `https://lh3.googleusercontent.com/d/${portadaId}=w1200` : '',
                                            redes:        String(r[iRedes]    || '').trim(),
                                            palabrasClave:String(r[iPalabras] || '').trim(),
                                            videoYt:      String(r[iYT]       || '').trim(),
                                            driveFolder:  driveM ? driveM[1] : '',
                                        };
                                    })
                                    .filter(p => p.slug && p.imgUrl);
                                if (proyectos.length) data = proyectos;
                            }
                        }
                    } catch(e) {
                        console.warn('Sheets API no disponible, usando JSON local.', e);
                    }
                }

                // Fallback: archivo JSON local
                if (!data) {
                    try {
                        const res = await fetch('portafolio-data.json?t=' + Date.now());
                        const json = await res.json();
                        if (Array.isArray(json) && json.length) data = json;
                    } catch(e) {
                        console.warn('JSON local no disponible, usando HTML estático.');
                        return;
                    }
                }

                if (!data) return;

                // Filtrar items sin imagen local válida
                data = data.filter(p => p.imgUrl && !p.imgUrl.startsWith('https://drive.google.com'));

                if (!data.length) return;

                try {

                    // Limpiar proyectos estáticos para que el popup solo muestre los del formulario
                    Object.keys(PROYECTOS).forEach(k => delete PROYECTOS[k]);

                    const grid = document.getElementById('arch-grid');

                    // 4 columnas × 8 filas — separación calculada para evitar superposición
                    // Tamaño fijo 4/3 en CSS: altura ≈ 9vw por item a 12vw, ≈11vw a 15vw
                    // Columnas centradas en 14 / 36 / 64 / 86 % del ancho
                    // Filas separadas 12% del alto (≈21.6vh) → sin overlap con items a 12vw
                    const ARCH_POS = [
                        {x:'14%',y:'5%', s:'12vw',z:1,d:7.2,dl:0},
                        {x:'36%',y:'4%', s:'15vw',z:2,d:6.8,dl:-1.4},
                        {x:'64%',y:'6%', s:'15vw',z:2,d:7.6,dl:-3.1},
                        {x:'86%',y:'4%', s:'12vw',z:1,d:6.5,dl:-2.2},

                        {x:'15%',y:'18%',s:'12vw',z:2,d:7.9,dl:-4.0},
                        {x:'37%',y:'17%',s:'15vw',z:1,d:6.4,dl:-0.7},
                        {x:'63%',y:'19%',s:'15vw',z:3,d:8.1,dl:-2.8},
                        {x:'85%',y:'17%',s:'12vw',z:2,d:7.0,dl:-1.5},

                        {x:'13%',y:'31%',s:'12vw',z:3,d:6.7,dl:-3.5},
                        {x:'36%',y:'30%',s:'15vw',z:2,d:7.4,dl:-5.0},
                        {x:'64%',y:'32%',s:'15vw',z:1,d:8.3,dl:-0.4},
                        {x:'87%',y:'30%',s:'12vw',z:3,d:6.9,dl:-2.6},

                        {x:'15%',y:'44%',s:'12vw',z:1,d:7.5,dl:-4.3},
                        {x:'37%',y:'43%',s:'15vw',z:3,d:6.2,dl:-1.1},
                        {x:'63%',y:'45%',s:'15vw',z:2,d:7.8,dl:-3.8},
                        {x:'85%',y:'43%',s:'12vw',z:1,d:8.0,dl:-0.9},

                        {x:'14%',y:'57%',s:'12vw',z:2,d:6.6,dl:-2.4},
                        {x:'36%',y:'56%',s:'15vw',z:1,d:7.3,dl:-4.8},
                        {x:'64%',y:'58%',s:'15vw',z:3,d:8.2,dl:-1.7},
                        {x:'86%',y:'56%',s:'12vw',z:2,d:6.8,dl:-3.2},

                        {x:'15%',y:'70%',s:'12vw',z:3,d:7.6,dl:-0.6},
                        {x:'37%',y:'69%',s:'15vw',z:2,d:6.3,dl:-2.1},
                        {x:'63%',y:'71%',s:'15vw',z:1,d:7.9,dl:-4.5},
                        {x:'85%',y:'69%',s:'12vw',z:3,d:6.5,dl:-1.3},

                        {x:'13%',y:'83%',s:'12vw',z:2,d:8.0,dl:-3.7},
                        {x:'36%',y:'82%',s:'15vw',z:1,d:7.1,dl:-0.8},
                        {x:'64%',y:'84%',s:'15vw',z:2,d:6.6,dl:-2.9},
                        {x:'87%',y:'82%',s:'12vw',z:1,d:7.7,dl:-4.2},

                        {x:'15%',y:'94%',s:'12vw',z:1,d:6.9,dl:-1.6},
                        {x:'37%',y:'93%',s:'15vw',z:3,d:7.4,dl:-3.4},
                        {x:'63%',y:'95%',s:'15vw',z:2,d:8.1,dl:-0.3},
                        {x:'85%',y:'93%',s:'12vw',z:3,d:6.7,dl:-2.0},
                    ];

                    const items = data.map((p, i) => {
                        const num   = String(i + 1).padStart(2, '0');
                        const ratio = RATIOS_GRID[i % RATIOS_GRID.length];
                        const pos   = ARCH_POS[i % ARCH_POS.length];

                        // Registrar en PROYECTOS para que el popup funcione
                        PROYECTOS[p.slug] = {
                            titulo:       p.titulo,
                            num:          `(${num})`,
                            mencion:      p.mencion || 'multiple',
                            anio:         p.anio || '',
                            tipo:         [p.tipo, p.coleccion].filter(Boolean).join(' · '),
                            colaboradores: p.autor,
                            desc:         p.descripcion || '',
                            img:          p.imgUrl || '',
                            galeria:      p.imgUrl ? [p.imgUrl] : [],
                            redes:        p.redes || '',
                            palabrasClave: p.palabrasClave || '',
                            videoYt:      p.videoYt || '',
                        };

                        const tagsHtml = (p.palabrasClave || p.tipo || '')
                            .split(/[,;·]/)
                            .map(t => t.trim()).filter(Boolean)
                            .map(t => `<span class="arch-tag">${escHtml(t)}</span>`)
                            .join('');

                        return `<div class="arch-item" data-mencion="multiple"
                             data-titulo="${escHtml(p.titulo)}" data-proyecto="${p.slug}"
                             onclick="abrirProyecto('${p.slug}')" style="cursor:pointer;">
                            <div class="arch-img" style="aspect-ratio:${ratio}">
                                <img src="${escHtml(p.imgUrl || '')}" alt="${escHtml(p.titulo)}" referrerpolicy="no-referrer" loading="lazy">
                            </div>
                            <span class="arch-num">(${num})</span>
                            <span class="arch-titulo">${escHtml(p.titulo)}</span>
                            <div class="arch-tags">${tagsHtml}</div>
                        </div>`;
                    });

                    grid.innerHTML = items.join('\n');

                    // Refrescar la lista de slugs del popup con los proyectos nuevos
                    PP_KEYS.splice(0, PP_KEYS.length, ...Object.keys(PROYECTOS));

                    // Re-inicializar visibilidad y filtros
                    archExpandido = false;
                    initArchivo();
                    filtrarProyectos();
                    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();

                } catch(e) {
                    console.warn('Portafolio: usando contenido estático (API no disponible).', e);
                }
            }

            cargarPortafolio();

            ppClose.addEventListener('click', () => {
                ppOverlay.classList.remove('abierto');
                ppDetenerAutoScroll();
                document.body.style.overflow = '';
            });
            ppOverlay.addEventListener('click', e => {
                if (e.target === ppOverlay) {
                    ppOverlay.classList.remove('abierto');
                    ppDetenerAutoScroll();
                    document.body.style.overflow = '';
                }
            });
            document.addEventListener('keydown', e => {
                if (!ppOverlay.classList.contains('abierto')) return;
                if (e.key === 'Escape') {
                    ppOverlay.classList.remove('abierto');
                    ppDetenerAutoScroll();
                    document.body.style.overflow = '';
                }
                if (e.key === 'ArrowLeft')  ppNavegar(-1);
                if (e.key === 'ArrowRight') ppNavegar(1);
            });
        });

        // TRANSICIÓN ORGANIGRAMA — polvo flotante sobre gradiente suave
        (function initConsTransitions() {
            function makeTransition(canvasEl, colorFrom, colorTo) {
                if (!canvasEl) return;
                const ctx = canvasEl.getContext('2d');
                let w = 0, h = 0;
                let pts = [];

                function spawnPts() {
                    pts = Array.from({ length: 160 }, () => ({
                        x:  Math.random() * w,
                        y:  Math.random() * h,
                        r:  Math.random() * 3.5 + 1.2,
                        vx: (Math.random() - 0.5) * 0.48,
                        vy: (Math.random() - 0.55) * 0.18,
                        fs: Math.random() * 0.013 + 0.003,
                        fp: Math.random() * Math.PI * 2,
                    }));
                }

                function resize() {
                    w = canvasEl.offsetWidth  || window.innerWidth;
                    h = canvasEl.offsetHeight || 200;
                    canvasEl.width  = w;
                    canvasEl.height = h;
                    spawnPts();
                }
                resize();
                window.addEventListener('resize', resize);

                let tick = 0;
                function draw() {
                    // Gradiente suave con mid-point para evitar salto brusco
                    const grad = ctx.createLinearGradient(0, 0, 0, h);
                    grad.addColorStop(0,    colorFrom);
                    grad.addColorStop(0.42, colorFrom);
                    grad.addColorStop(0.58, colorTo);
                    grad.addColorStop(1,    colorTo);
                    ctx.clearRect(0, 0, w, h);
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, w, h);

                    for (const p of pts) {
                        p.x += p.vx;
                        p.y += p.vy;
                        if (p.x < -3) p.x = w + 3;
                        if (p.x > w + 3) p.x = -3;
                        if (p.y < -3) p.y = h + 3;
                        if (p.y > h + 3) p.y = -3;

                        const fade  = (Math.sin(tick * p.fs + p.fp) + 1) / 2;
                        const alpha = 0.12 + fade * 0.75;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
                        ctx.fill();
                    }
                    tick++;
                    requestAnimationFrame(draw);
                }
                draw();
            }

            makeTransition(document.getElementById('cons-trans-in'),  '#f4f4f4', '#000000');
            makeTransition(document.getElementById('cons-trans-out'), '#000000', '#f4f4f4');
        })();

        // 3. REPRODUCCIÓN AUTOMÁTICA DE VIDEOS AL ENTRAR EN VIEWPORT
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.25
        };

        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.play().catch(() => {
                        // Silently fail if autoplay is blocked
                    });
                } else {
                    entry.target.pause();
                }
            });
        }, observerOptions);

        // Observar todos los videos en la página
        document.querySelectorAll('video').forEach(video => {
            videoObserver.observe(video);
        });


    (function() {
        // ── CONFIGURACIÓN ──────────────────────────────────────────────
        // Modo 'local' lee contenido.json. Modo 'sheets' lee el Google Sheet publicado.
        // Para cambiar: editar contenido.json → campo _config.fuente y _config.google_sheets_url
        const ARCHIVO_LOCAL = 'contenido.json';

        // ── UTILIDADES ─────────────────────────────────────────────────
        function resolveKey(obj, path) {
            return path.split('.').reduce(function(o, k) {
                if (o === undefined || o === null) return undefined;
                var i = parseInt(k);
                return isNaN(i) ? o[k] : o[i];
            }, obj);
        }

        function escape(str) {
            return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        }

        // ── GENERADORES DE HTML ────────────────────────────────────────
        function generarPrograma(p) {
            var meta = [p.duracion, p.modalidad, p.extra].filter(Boolean)
                .map(function(m){ return '<span>' + escape(m) + '</span>'; }).join('');
            return '<div class="postgrado-card">'
                + '<span class="postgrado-tipo">' + escape(p.tipo) + '</span>'
                + '<h2>' + escape(p.nombre) + '</h2>'
                + '<p>' + escape(p.desc) + '</p>'
                + '<div class="postgrado-meta">' + meta + '</div>'
                + '</div>';
        }

        function generarConvenio(c) {
            return '<div class="convenio-item">'
                + '<span class="convenio-tipo">' + escape(c.tipo) + '</span>'
                + '<h3>' + escape(c.nombre) + '</h3>'
                + '<p>' + escape(c.desc) + '</p>'
                + '</div>';
        }

        function generarCaso(c) {
            return '<div class="caso-card" data-tipo="' + escape(c.tipo) + '">'
                + '<div class="img-placeholder" style="height:280px;"></div>'
                + '<div class="caso-body">'
                + '<span class="caso-tipo-tag">' + escape(c.tipo.charAt(0).toUpperCase() + c.tipo.slice(1)) + '</span>'
                + '<h3>' + escape(c.nombre) + '</h3>'
                + '<p>' + escape(c.desc) + '</p>'
                + '</div></div>';
        }

        function generarPublicacion(p, num) {
            return '<div class="pub-card">'
                + '<div class="img-placeholder" style="height:360px;"></div>'
                + '<div class="pub-body">'
                + '<span class="pub-num">(' + String(num).padStart(2,'0') + ')</span>'
                + '<h2>' + escape(p.nombre) + '</h2>'
                + '<p>' + escape(p.desc) + '</p>'
                + '</div></div>';
        }

        function generarLabWin(lab) {
            var mediaHtml = lab.video
                ? '<div class="img-placeholder lab-win-video" style="height:180px;"><video autoplay loop playsinline muted preload="metadata"><source src="' + escape(lab.video) + '" type="video/mp4"></video></div>'
                : '<div class="img-placeholder" style="height:180px;"></div>';
            var tagsHtml = (lab.tags || []).map(function(t){ return '<span class="lab-win-tag">' + escape(t) + '</span>'; }).join('');
            var linkHtml = lab.url
                ? '<a href="' + escape(lab.url) + '" target="_blank" rel="noopener" class="lab-win-link">' + escape(lab.instagram) + '</a>'
                : '';
            return '<div class="lab-win">'
                + '<div class="lab-win-bar"><div class="lab-win-dots"><span class="lab-win-dot"></span><span class="lab-win-dot"></span><span class="lab-win-dot"></span></div><span class="lab-win-handle">' + escape(lab.handle) + '</span></div>'
                + mediaHtml
                + '<div class="lab-win-body">'
                + '<span class="lab-win-name">' + escape(lab.nombre) + '</span>'
                + '<span class="lab-win-sub">' + escape(lab.sub) + '</span>'
                + '<div class="lab-win-tags">' + tagsHtml + '</div>'
                + linkHtml
                + '</div></div>';
        }

        // ── APLICAR CONTENIDO ──────────────────────────────────────────
        function aplicarContenido(c) {
            // 1. Textos simples via data-content
            document.querySelectorAll('[data-content]').forEach(function(el) {
                var val = resolveKey(c, el.dataset.content);
                if (val !== undefined && val !== null && val !== '') {
                    el.innerHTML = val;
                }
            });

            // 2. Postgrado — regenerar tarjetas
            if (c.postgrado && c.postgrado.programas) {
                var pg = document.getElementById('postgrado-grid');
                if (pg) pg.innerHTML = c.postgrado.programas.map(generarPrograma).join('');
            }

            // 3. Convenios — regenerar lista
            if (c.convenios && c.convenios.items) {
                var cl = document.getElementById('convenios-lista');
                if (cl) cl.innerHTML = c.convenios.items.map(generarConvenio).join('');
            }

            // 4. Red UDP — regenerar grid
            if (c.casos_exito && c.casos_exito.items) {
                var cg = document.getElementById('casos-grid');
                if (cg) cg.innerHTML = c.casos_exito.items.map(generarCaso).join('');
            }

            // 5. Cursos abiertos — regenerar grid
            if (c.cursos_abiertos && c.cursos_abiertos.cursos) {
                var cag = document.getElementById('cursos-abiertos-grid');
                if (cag) cag.innerHTML = c.cursos_abiertos.cursos.map(generarPrograma).join('');
            }

            // 6. Publicaciones — regenerar grid
            if (c.publicaciones && c.publicaciones.items) {
                var pubg = document.querySelector('#publicaciones-content .publicaciones-grid');
                if (pubg) pubg.innerHTML = c.publicaciones.items.map(generarPublicacion).join('');
            }

            // 7. Laboratorios — regenerar todos los marquees
            if (c.laboratorios) {
                document.querySelectorAll('.labs-marquee-track').forEach(function(track) {
                    var set = c.laboratorios.map(generarLabWin).join('');
                    track.innerHTML = set + set;
                    // reactivar videos en el nuevo HTML
                    track.querySelectorAll('video').forEach(function(v) {
                        v.load();
                        videoObserver.observe(v);
                    });
                });
            }

            // 8. Docentes — actualizar bios en el objeto DOCENTES existente
            if (c.docentes && typeof DOCENTES !== 'undefined') {
                c.docentes.forEach(function(d) {
                    if (DOCENTES[d.id]) {
                        if (d.bio) DOCENTES[d.id].bio = d.bio;
                        if (d.nombre) DOCENTES[d.id].nombre = d.nombre;
                        if (d.cargo) DOCENTES[d.id].cargo = d.cargo;
                        if (d.email) DOCENTES[d.id].email = d.email;
                        if (d.asignaturas) DOCENTES[d.id].asignaturas = d.asignaturas;
                        if (d.areas) DOCENTES[d.id].areas = d.areas;
                        if (d.fortalezas) DOCENTES[d.id].fortalezas = d.fortalezas;
                    }
                });
            }
        }

        // ── CARGA ──────────────────────────────────────────────────────
        fetch(ARCHIVO_LOCAL)
            .then(function(r) { return r.json(); })
            .then(function(c) {
                var cfg = c._config || {};
                if (cfg.fuente === 'apps-script' && cfg.google_sheets_url) {
                    return fetch(cfg.google_sheets_url).then(function(r) { return r.json(); });
                }
                return c;
            })
            .then(aplicarContenido)
            .catch(function(e) {
                console.warn('[contenido] No se pudo cargar el archivo de contenido.', e);
            });
    })();
