// 1) Configuración de secciones y categorías
const config = {
  dispositivos: ['todo', 'arcade', 'consolas', 'portatil', 'ordenadores'],
  juegos:       ['aventura', 'rpg', 'deportes', 'plataforma', 'puzzle', 'juegos'],
};

// 2) Referencias a elementos del DOM
const mainContent    = document.getElementById('main-content');
const vistaContainer = document.getElementById('contenedor-vista');

// 3) Inicialización del router
document.addEventListener('DOMContentLoaded', () => {
  // Navegación con History API
  document.body.addEventListener('click', e => {
    if (e.target.matches('a[data-link]')) {
      e.preventDefault();
      const href = e.target.getAttribute('href');
      const path = href.startsWith('/') ? href : '/' + href;
      history.pushState(null, '', path);
      route(path);
    }
  });
  // Botón Atrás / Adelante
  window.addEventListener('popstate', () => route(location.pathname));
  // Ruta inicial
  route(location.pathname);
});

function route(path) {
  // Referencia al contenedor de filtros
  const filtersContainer = document.getElementById('filters-container');

  // 1) Home
  if (path === '/' || path.endsWith('index.html')) {
    filtersContainer.classList.add('d-none');
    mainContent.classList.remove('d-none');
    vistaContainer.classList.add('d-none');
    return;
  }

  // 2) Página de Contacto / Sobre Nosotros
  if (path === '/contacto') {
    filtersContainer.classList.add('d-none');
    mainContent.classList.add('d-none');
    vistaContainer.classList.remove('d-none');
    vistaContainer.innerHTML = '<p class="text-white">Cargando contenido…</p>';

    fetch('/views/contacto.html')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(html => {
        vistaContainer.innerHTML = html;
      })
      .catch(err => {
        console.error('Error cargando /views/contacto.html:', err);
        showError('/contacto');
      });
    return;
  }

  // 3) Rutas de tipo /seccion/categoria
  const partes = path.split('/').filter(Boolean);
  if (partes.length === 2) {
    const [seccion, categoria] = partes;

    // Validar sección y categoría
    if (!config[seccion] || !config[seccion].includes(categoria)) {
      showError(`/${seccion}/${categoria}`);
      return;
    }

    // Mostrar filtros correspondientes
    renderFilters(seccion);

    // Ocultar home y mostrar contenido dinámico
    mainContent.classList.add('d-none');
    vistaContainer.classList.remove('d-none');
    vistaContainer.innerHTML = '<p class="text-white">Cargando contenido…</p>';

    // Cargar fragmento vía AJAX y aplicar filtros
    const url = `/views/${seccion}/${categoria}.html`;
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(html => {
        vistaContainer.innerHTML = html;
        filterCards(); // aplica filtros al nuevo contenido
      })
      .catch(err => {
        console.error(`Error cargando ${url}:`, err);
        showError(url);
      });
    return;
  }

  // 4) 404 genérico
  showError(path);
}

function showError(info) {
  const filtersContainer = document.getElementById('filters-container');
  filtersContainer.classList.add('d-none');
  mainContent.classList.add('d-none');
  vistaContainer.classList.remove('d-none');
  vistaContainer.innerHTML = `
    <h1 class="text-white">404</h1>
    <p class="text-white">No se encontró <code>${info}</code></p>`;
}