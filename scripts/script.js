// 1. Referencias
const filtersContainer = document.getElementById('filters-container');

// — Helper para obtener solo el contenedor activo —
function getCardsContainer() {
  return document.getElementById('contenedor-vista')
      || document.getElementById('main-content');
}

const filtrosBySection = {
  dispositivos: 
    `<div class="row align-items-center g-3">
      <!-- Selector de marcas (dropdown) -->
      <div class="col-auto">
      <select id="filter-brand" class="form-select">
        <option value="">Marcas</option>
        <option value="acorn">Acorn</option>
        <option value="apple">Apple</option>
        <option value="amstrad">Amstrad</option>
        <option value="atari">Atari</option>
        <option value="bandai">Bandai</option>
        <option value="capcom">Capcom</option>
        <option value="commodore">Commodore</option>
        <option value="future pinball">Future Pinball</option>
        <option value="mame">MAME</option>
        <option value="microsoft">Microsoft</option>
        <option value="nec">NEC</option>
        <option value="nintendo">Nintendo</option>
        <option value="nokia">Nokia</option>
        <option value="sega">Sega</option>
        <option value="sharp">Sharp</option>
        <option value="sinclair">Sinclair</option>
        <option value="snk">SNK</option>
        <option value="sony">Sony</option>
      </select>
      </div>
      <!-- Selector de eras -->
      <div class="col-auto">
        <select id="filter-era" class="form-select">
          <option value="">Todas las eras</option>
          <option value="1970">1970s</option>
          <option value="1980">1980s</option>
          <option value="1990">1990s</option>
          <option value="2000">2000s</option>
        </select>
      </div>
      <!-- Contador de resultados -->
      <div class="col-auto">
        <span id="results-count" class="text-white"></span>
      </div>
      <!-- Botón Limpiar -->
      <div class="col-auto">
        <button id="clear-filters" class="btn btn-secondary">Limpiar</button>
      </div>
    </div>`,
  juegos: `
    <div class="row align-items-center g-3">

      <!-- Selector de plataformas (igual que antes) -->
      <div class="col-auto">
        <select id="filter-platform" class="form-select">
          <option value="">Plataformas</option>
          <option value="nintendo">Nintendo</option>
          <option value="playstation">PlayStation</option>
          <option value="sega">Sega</option>
          <option value="atari">Atari</option>
          <option value="arcade">Arcade</option>
          <option value="xbox">Xbox</option>
          <option value="pc">PC</option>
        </select>
      </div>

      <!-- Nuevo selector de décadas/eras -->
      <div class="col-auto">
        <select id="filter-era" class="form-select">
          <option value="">Todas las décadas</option>
          <option value="1970">1970s</option>
          <option value="1980">1980s</option>
          <option value="1990">1990s</option>
          <option value="2000">2000s</option>
        </select>
      </div>

      <!-- Contador de resultados -->
      <div class="col-auto">
        <span id="results-count" class="text-white"></span>
      </div>

      <!-- Botón Limpiar -->
      <div class="col-auto">
        <button id="clear-filters" class="btn btn-secondary">Limpiar</button>
      </div>

    </div>
  `
};

// 2. Inyecta filtros cuando cambie de ruta
function renderFilters(section) {
  if (!filtrosBySection[section]) {
    filtersContainer.classList.add('d-none');
    filtersContainer.innerHTML = '';
    return;
  }
  filtersContainer.classList.remove('d-none');
  filtersContainer.innerHTML = filtrosBySection[section];
  attachFilterListeners();
}

// 3. Función de filtrado común
function filterCards() {
  const term   = document.getElementById('filter-search')?.value.toLowerCase() || '';
  const brand  = filtersContainer.querySelector('#filter-brand')?.value.toLowerCase() || '';
  const era    = filtersContainer.querySelector('#filter-era')?.value;
  const genres = Array.from(filtersContainer.querySelectorAll('.filter-genre:checked'))
                       .map(cb => cb.value.toLowerCase());
  const platform = filtersContainer.querySelector('#filter-platform')?.value.toLowerCase();

  const container = getCardsContainer();
  if (!container) return;

  let visible = 0;
  container.querySelectorAll('.card').forEach(card => {
    const title = card.querySelector('.card-title').textContent.toLowerCase();
    const meta  = card.querySelector('.card-text').textContent.toLowerCase();
    const year  = parseInt(card.getAttribute('data-year'), 10) || 0;
    const cardBrand = (card.dataset.brand || '').toLowerCase();

    const okSearch   = !term     || title.includes(term);
    const okBrand    = !brand    || cardBrand === brand;
    const okPlatform = !platform || meta.includes(platform);
    const okGenre    = !genres.length || genres.some(g => meta.includes(g));

    let okEra = true;
    if (era) {
      const decade = parseInt(era, 10);
      okEra = year >= decade && year < decade + 10;
    }

    const show = okSearch && okBrand && okPlatform && okGenre && okEra;
    const wrapper = card.closest('.col');
    if (wrapper) wrapper.style.display = show ? '' : 'none';
    else         card.style.display = show ? '' : 'none';

    if (show) visible++;
  });

  document.getElementById('results-count').textContent =
    `${visible} resultado${visible !== 1 ? 's' : ''}`;
}

// 4. Limpia todos los filtros
function clearFilters() {
  filtersContainer.querySelectorAll('input, select').forEach(el => {
    if (el.type === 'checkbox') el.checked = false;
    if (el.tagName === 'SELECT') el.value = '';
    if (el.type === 'text') el.value = '';
  });
  filterCards();
}

// 5. Conecta eventos a los filtros recién renderizados
function attachFilterListeners() {
  filtersContainer.querySelectorAll('input, select, #clear-filters').forEach(el => {
    if (el.id === 'clear-filters') {
      el.addEventListener('click', clearFilters);
    } else {
      el.addEventListener('input', filterCards);
      el.addEventListener('change', filterCards);
    }
  });
  // Filtrado inicial
  filterCards();
}

// 6. Buscador del header
document.getElementById('header-search')
  .addEventListener('submit', e => {
    e.preventDefault();
    filterCards();
  });

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa el Modal de Bootstrap
  const bsModal = new bootstrap.Modal(document.getElementById('detailModal'));

  // Escucha clics en TODO el body sobre tarjetas .clickable-card
  document.body.addEventListener('click', e => {
    const card = e.target.closest('.clickable-card');
    if (!card) return;  // si no clicaste en una tarjeta, salimos

    // Extrae datos de la tarjeta
    const title    = card.querySelector('.card-title').textContent;
    const imgEl    = card.querySelector('img');
    const src      = imgEl.src;
    const alt      = imgEl.alt;
    const desc     = card.querySelector('.card-text').textContent;
    const year     = card.dataset.year;
    // En Dispositivos usamos data-brand, en Juegos data-platform
    const brandOrPlatform = card.dataset.brand || card.dataset.platform || '';

    // Rellena el Modal
    document.getElementById('modalTitle').textContent = title;
    const mImg = document.getElementById('modalImg');
    mImg.src = src;
    mImg.alt = alt;
    document.getElementById('modalDesc').textContent = desc;
    document.getElementById('modalMeta').textContent =
      `Año: ${year}` +
      (brandOrPlatform ? ` • Marca/Plataforma: ${brandOrPlatform}` : '');
  const author = card.dataset.author;
  console.log('Autor leído:', author);  // <-- Debe salir en la consola

  document.getElementById('modalMeta').textContent =
    `Año: ${year}` +
    (brandOrPlatform ? ` • Marca/Plataforma: ${brandOrPlatform}` : '') +
    (author ? ` • Autor: ${author}` : '');

    // Muestra el Modal
    bsModal.show();
  });
});

// 7. Función para inicializar el formulario dinámico
function inicializarFormularioContacto() {
  const form = document.getElementById('contactForm');
  const mensajeExito = document.getElementById('mensajeExito');
  if (!form || !mensajeExito) return;

  form.addEventListener('submit', function(event) {
    event.preventDefault();
    form.classList.remove('was-validated');

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const nombre = form.elements['nombre'].value;
    mensajeExito.textContent = `¡Gracias por tu mensaje, ${nombre}!`;
    mensajeExito.classList.remove('d-none');

    setTimeout(() => {
      form.reset();
      form.classList.remove('was-validated');
      mensajeExito.classList.add('d-none');
    }, 3000);
  });
}

//oculta el menu cuando se selecciona una de las opciones de dispositivos o juegos
document.addEventListener('DOMContentLoaded', () => {
  // Aquí buscamos solo <a data-link>, no todos los .nav-link
  document.querySelectorAll('a[data-link]').forEach(link => {
    link.addEventListener('click', () => {
      const collapseEl = document.querySelector('.navbar-collapse');
      if (!collapseEl) return;

      // Si el menú está abierto, lo ocultamos
      if (collapseEl.classList.contains('show')) {
        // Obtenemos la instancia de Bootstrap Collapse o la creamos
        let bsCollapse = bootstrap.Collapse.getInstance(collapseEl);
        if (!bsCollapse) {
          bsCollapse = new bootstrap.Collapse(collapseEl, { toggle: false });
        }
        bsCollapse.hide();
      }
    });
  });
});