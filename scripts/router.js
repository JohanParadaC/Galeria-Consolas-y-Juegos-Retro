// 1) Configuración de secciones y categorías
const config = {
  dispositivos: ['todo', 'arcade', 'consolas', 'portatil', 'ordenadores'],
  juegos:       ['aventura', 'rpg', 'deportes', 'plataforma', 'puzzle', 'juegos'],
};

// 2) Referencias a elementos del DOM
const mainContent    = document.getElementById('main-content');
const vistaContainer = document.getElementById('contenedor-vista');

document.addEventListener('DOMContentLoaded', () => {
  // Hijack de todos los <a data-link>
  document.body.addEventListener('click', e => {
    if (e.target.matches('a[data-link]')) {
      e.preventDefault();
      const href     = e.target.getAttribute('href');
      const hashPath = href.startsWith('#') ? href : `#${href}`;
      location.hash   = hashPath;
    }
  });

  window.addEventListener('hashchange', () => route(location.hash));
  route(location.hash);
});

function route(hash) {
  const filtersContainer = document.getElementById('filters-container');

  // 1) NORMALIZAR: quitar “#” y quitar barra inicial si la hubiera
  let rawPath = hash.replace(/^#/, '');          // "/contacto" o "contacto" o ""
  if (rawPath.startsWith('/')) {
    rawPath = rawPath.slice(1);                  // "contacto" o ""
  }
  const path = rawPath || '/';                   // "/" como home

  // HOME
  if (path === '/' || path === 'index.html') {
    filtersContainer.classList.add('d-none');
    mainContent.classList.remove('d-none');
    vistaContainer.classList.add('d-none');
    return;
  }

  // CONTACTO
  if (path === 'contacto') {
    filtersContainer.classList.add('d-none');
    mainContent.classList.add('d-none');
    vistaContainer.classList.remove('d-none');
    vistaContainer.innerHTML = '<p class="text-white">Cargando contenido…</p>';

    fetch('views/contacto.html')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(html => {
        vistaContainer.innerHTML = html;
        // Inicia validación y lógica del formulario que está en script.js
        if (typeof inicializarFormularioContacto === 'function') {
          inicializarFormularioContacto();
        } else {
          const script = document.createElement('script');
          script.src = 'scripts/script.js';
          script.onload = () => {
            inicializarFormularioContacto?.();
          };
          document.body.appendChild(script);
        }
      })
      .catch(err => {
        console.error('Error cargando views/contacto.html:', err);
        showError('contacto');
      });
    return;
  }

  // CATEGORÍAS (dispositivos/juegos)
  const partes = path.split('/').filter(Boolean);
  if (partes.length === 2) {
    const [seccion, categoria] = partes;
    if (!config[seccion] || !config[seccion].includes(categoria)) {
      return showError(path);
    }
    renderFilters(seccion);
    mainContent.classList.add('d-none');
    vistaContainer.classList.remove('d-none');
    vistaContainer.innerHTML = '<p class="text-white">Cargando contenido…</p>';

    const url = `views/${seccion}/${categoria}.html`;
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(html => {
        vistaContainer.innerHTML = html;
        filterCards();
      })
      .catch(err => {
        console.error(`Error cargando ${url}:`, err);
        showError(url);
      });
    return;
  }

  // 404
  showError(path);
}

function showError(info) {
  const filtersContainer = document.getElementById('filters-container');
  filtersContainer.classList.add('d-none');
  mainContent.classList.add('d-none');
  vistaContainer.classList.remove('d-none');
  vistaContainer.innerHTML = `
    <h1 class="text-white">404</h1>
    <p class="text-white">No se encontró <code>${info}</code></p>
  `;
}