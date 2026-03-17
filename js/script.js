/**
 * @file script.js
 * @description Script principal de Hogwarts Castle.
 *              Aquí va toda la lógica del proyecto: navegación,
 *              llamadas a la API y renderizado dinámico de cada página.
 * @author TuNombre
 *
 * Aprendí a hacer peticiones HTTP con fetch aquí:
 * @see https://lenguajejs.com/javascript/peticiones-http/fetch/
 * Y los eventos del DOM aquí:
 * @see https://lenguajejs.com/javascript/dom/eventos-dom/
 */

/** La URL base de la API — la añado a una variable para no tener que colocar el enlace siempre*/
const API_BASE = "https://hp-api.onrender.com/api";

/**
 * @constant {Object} ENDPOINTS
 * @description Objeto que agrupa todas las URLs de la API en un solo sitio.
 *              Así si cambia la API, solo toco aquí y no busco por todo el código.
 *
 * Algunos endpoints son strings directos y otros son funciones que
 * reciben un parámetro y construyen la URL dinámicamente.
 * Esto se llama objeto literal con métodos como propiedades:
 * @see https://lenguajejs.com/javascript/objetos/object-literal/
 */
const ENDPOINTS = {
  allCharacters: API_BASE + "/characters",
  students:      API_BASE + "/characters/students",
  staff:         API_BASE + "/characters/staff",
  house:         function (house) { return API_BASE + "/characters/house/" + house; },
  character:     function (id)    { return API_BASE + "/character/" + id; },
  spells:        API_BASE + "/spells"
};

/**
 * @constant {Object} HOUSE_DATA
 * @description Datos estáticos de las 4 casas de Hogwarts.
 *              Los guardo aquí porque la API no los devuelve directamente.
 *              Lo uso en el resultado del sombrero para mostrar nombre,
 *              descripción y color de la casa ganadora.
 *
 * Es un objeto con objetos anidados dentro — accedo a ellos con
 * HOUSE_DATA["gryffindor"].name o HOUSE_DATA.gryffindor.name.
 */
const HOUSE_DATA = {
  gryffindor: {
    name:  "Gryffindor",
    desc:  "Valentía, coraje y determinación. Los elegidos por el sombrero para Gryffindor destacan por su corazón noble y su espíritu indomable.",
    color: "#FFC500"
  },
  slytherin: {
    name:  "Slytherin",
    desc:  "Ambición, astucia y liderazgo. Los de Slytherin son ingeniosos y determinados, capaces de todo para alcanzar sus objetivos.",
    color: "#C0C0C0"
  },
  ravenclaw: {
    name:  "Ravenclaw",
    desc:  "Sabiduría, inteligencia y creatividad. Los cuervos valoran el conocimiento por encima de todo y siempre buscan aprender.",
    color: "#946B2D"
  },
  hufflepuff: {
    name:  "Hufflepuff",
    desc:  "Lealtad, paciencia y trabajo duro. Los tejones son los más fieles y justos de Hogwarts, nunca abandonan a los suyos.",
    color: "#ECB939"
  }
};

/**
 * @constant {Array} QUIZ_QUESTIONS
 * @description Array de objetos con las 5 preguntas del test del sombrero.
 *              Cada pregunta tiene un texto y 4 respuestas posibles.
 *              Cada respuesta tiene un objeto points que suma puntos
 *              a cada casa según la letra: g = Gryffindor, s = Slytherin,
 *              r = Ravenclaw, h = Hufflepuff.
 *
 * Esto es un array de objetos con arrays de objetos dentro — bastante anidado,
 * pero muy útil para organizar datos estructurados como este:
 * @see https://lenguajejs.com/javascript/arrays/arrays-objetos/
 */
const QUIZ_QUESTIONS = [
  {
    text: "¿Qué valoras más en la vida?",
    answers: [
      { text: "El coraje y la valentía ante todo",          points: { g: 3, s: 0, r: 1, h: 1 } },
      { text: "El conocimiento y la sabiduría",              points: { g: 0, s: 1, r: 3, h: 1 } },
      { text: "La lealtad hacia tus seres queridos",         points: { g: 1, s: 0, r: 0, h: 3 } },
      { text: "El éxito y alcanzar tus metas",               points: { g: 1, s: 3, r: 1, h: 0 } }
    ]
  },
  {
    text: "Encuentras una bolsa de dinero en la calle. ¿Qué haces?",
    answers: [
      { text: "La entrego a la policía sin dudarlo",          points: { g: 2, s: 0, r: 1, h: 3 } },
      { text: "Busco al dueño por mi cuenta",                 points: { g: 3, s: 0, r: 1, h: 2 } },
      { text: "Me la quedo, quien la perdió fue descuidado",  points: { g: 0, s: 3, r: 1, h: 0 } },
      { text: "Analizo la situación antes de actuar",         points: { g: 0, s: 1, r: 3, h: 1 } }
    ]
  },
  {
    text: "¿Cómo prefieres pasar tu tiempo libre?",
    answers: [
      { text: "Leyendo o aprendiendo algo nuevo",             points: { g: 0, s: 1, r: 3, h: 1 } },
      { text: "Con mis amigos y familia",                     points: { g: 1, s: 0, r: 0, h: 3 } },
      { text: "Buscando aventuras y emociones fuertes",       points: { g: 3, s: 1, r: 0, h: 0 } },
      { text: "Planificando mis próximos objetivos",          points: { g: 0, s: 3, r: 2, h: 0 } }
    ]
  },
  {
    text: "Tu mayor miedo es...",
    answers: [
      { text: "Fallarle a las personas que quiero",           points: { g: 2, s: 0, r: 0, h: 3 } },
      { text: "No lograr mis ambiciones",                     points: { g: 1, s: 3, r: 1, h: 0 } },
      { text: "No saber la respuesta correcta",               points: { g: 0, s: 0, r: 3, h: 1 } },
      { text: "Ser cobarde cuando más se me necesite",        points: { g: 3, s: 1, r: 0, h: 1 } }
    ]
  },
  {
    text: "Si pudieras elegir una habilidad mágica, ¿cuál sería?",
    answers: [
      { text: "Invisibilidad para no ser detectado",          points: { g: 0, s: 3, r: 2, h: 0 } },
      { text: "Leer la mente de los demás",                   points: { g: 0, s: 2, r: 3, h: 0 } },
      { text: "Proteger a todos los que quiero",              points: { g: 2, s: 0, r: 0, h: 3 } },
      { text: "Teletransportarme a cualquier peligro",        points: { g: 3, s: 0, r: 1, h: 1 } }
    ]
  }
];

/** Guardo aquí todos los personajes que devuelve la API */
let allCharactersCache = [];

/** Lleva la pista del filtro de casa activo en libro.html (all por defecto) */
let currentHouseFilter = "all";

/** Acumula los puntos del quiz del sombrero por casa */
let quizScores = { g: 0, s: 0, r: 0, h: 0 };

/** Índice de la pregunta actual del quiz (empieza en 0) */
let currentQuestion = 0;

/**
 * @description Función que genera el HTML del placeholder de imagen
 *              según el género del personaje. Si es "female" usa la bruja,
 *              si no usa el hechicero. El tamaño varía según el contexto:
 *              140px para el modal grande, 120px para tarjetas normales.
 *
 * Uso el operador ternario (condición ? valorSi : valorNo) para elegir
 * la imagen en una sola línea, sin necesidad de un if/else largo.
 *
 * @param {Object} character - Objeto personaje con propiedad .gender
 * @param {string} divClass  - Clase CSS del div contenedor
 * @param {string} imgPath   - Ruta relativa hasta la carpeta img/
 * @returns {string} HTML listo para insertar con innerHTML
 */
function getPlaceholderHTML(character, divClass, imgPath) {
  var gender   = (character.gender || "").toLowerCase();
  var isFemale = gender === "female" || gender === "femenino";

  var size = (divClass === "modal-no-img") ? "140" : "120";

  var file = isFemale
    ? imgPath + "bruja"     + size + ".png"
    : imgPath + "hechicero" + size + ".png";

  return "<div class=\"" + divClass + "\" aria-label=\"Sin imagen\">"
       + "<img src=\""   + file    + "\" alt=\"\" />"
       + "</div>";
}

document.addEventListener("DOMContentLoaded", function () {
  initNavActiveLink();

  var page = detectCurrentPage();

  if (page === "libro")    { initLibro();    }
  if (page === "sombrero") { initSombrero(); }
  if (page === "duelo")    { initDuelo();    }
});

/**
 * @description Marca como activo el enlace del nav que corresponde a la página actual.
 *              Compara el nombre del archivo del href con el de la URL actual.
 *
 * split("/").pop() parte el string por "/" y me queda solo el nombre del archivo.
 * Por ejemplo: "/pages/libro.html" → ["", "pages", "libro.html"] → "libro.html"
 * @see https://lenguajejs.com/javascript/string/metodos-split/
 */
function initNavActiveLink() {
  var links       = document.querySelectorAll(".nav-link");
  var currentPage = window.location.pathname.split("/").pop() || "index.html";

  links.forEach(function (link) {
    var linkPage = link.getAttribute("href").split("/").pop();
    if (linkPage === currentPage) {
      /* Quito "active" de todos y se lo pongo solo al correcto */
      links.forEach(function (l) { l.classList.remove("active"); });
      link.classList.add("active");
    }
  });
}

/**
 * @description Detecta en qué página estamos mirando la URL con includes().
 * @returns {string} "libro", "sombrero", "duelo" o "" si es el index
 */
function detectCurrentPage() {
  var path = window.location.pathname;
  if (path.includes("libro"))    { return "libro"; }
  if (path.includes("sombrero")) { return "sombrero"; }
  if (path.includes("duelo"))    { return "duelo"; }
  return "";
}

/**
 * @description Wrapper de fetch reutilizable para todas las llamadas a la API.
 *              Recibe la URL y dos callbacks: uno que devuelve correctamente y otro para el error.
 *
 * response.ok es true si el código HTTP está entre 200-299.
 * Si no, lanzo un Error manualmente con throw para que lo agarre el .catch().
 * @see https://lenguajejs.com/javascript/peticiones-http/fetch/
 * @see https://lenguajejs.com/javascript/excepciones/throw/
 *
 * @param {string}   url       - URL a consultar
 * @param {Function} onSuccess - Se llama con los datos JSON si todo va bien
 * @param {Function} onError   - Se llama con el mensaje de error si falla
 */
function fetchAPI(url, onSuccess, onError) {
  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("La API respondió con error: " + response.status);
      }
      /* .json() también devuelve una promesa, así que la encadeno */
      return response.json();
    })
    .then(function (data) {
      onSuccess(data);
    })
    .catch(function (error) {
      onError(error.message);
    });
}

/**
 * @description Quita la clase "hidden" de un elemento por su id.
 * @param {string} id - ID del elemento a mostrar
 */
function showElement(id) {
  var el = document.getElementById(id);
  if (el) { el.classList.remove("hidden"); }
}

/**
 * @description Añade la clase "hidden" a un elemento por su id.
 * @param {string} id - ID del elemento a ocultar
 */
function hideElement(id) {
  var el = document.getElementById(id);
  if (el) { el.classList.add("hidden"); }
}

/**
 * @description Cambia el texto de un elemento de forma segura con textContent.
 *              Uso textContent en vez de innerHTML para evitar inyección de HTML.
 * @param {string} id   - ID del elemento
 * @param {string} text - Texto a asignar
 */
function setText(id, text) {
  var el = document.getElementById(id);
  if (el) { el.textContent = text; }
}

/**
 * @description Cambia el HTML interno de un elemento con innerHTML.
 *              Solo lo uso cuando necesito insertar etiquetas HTML de verdad.
 * @param {string} id   - ID del elemento
 * @param {string} html - HTML a insertar
 */
function setHTML(id, html) {
  var el = document.getElementById(id);
  if (el) { el.innerHTML = html; }
}

/**
 * @description Capitaliza la primera letra de un string.
 *              La API devuelve las casas en minúsculas ("gryffindor")
 *              y así las muestro con la primera letra en mayúscula ("Gryffindor").
 *
 * charAt(0) me da el primer carácter, toUpperCase() lo pone en mayúscula,
 * y slice(1) me da el resto del string desde el índice 1.
 * @see https://lenguajejs.com/javascript/string/metodos-slice/
 *
 * @param   {string} house - Nombre de la casa en minúsculas
 * @returns {string} Nombre con la primera letra en mayúscula
 */
function getHouseName(house) {
  if (!house) { return "Sin casa"; }
  return house.charAt(0).toUpperCase() + house.slice(1);
}

/**
 * @description Genera el HTML del badge de casa que aparece en el modal.
 *              Incluye el escudo de la casa como imagen.
 *
 * Uso un objeto "escudos" como tabla de consulta en vez de
 * un switch o varios if — es más limpio y fácil de cambiaar.
 *
 * @param   {string} house - Nombre de la casa en minúsculas
 * @returns {string} HTML del badge con escudo e imagen
 */
function buildHouseBadgeHTML(house) {
  var cls  = house ? house.toLowerCase() : "no-house";
  var name = house ? getHouseName(house) : "Sin casa";

  var escudos = {
    gryffindor: "../img/escudo_gryffindor.png",
    slytherin:  "../img/escudo_slytherin.png",
    ravenclaw:  "../img/escudo_ravenclaw.png",
    hufflepuff: "../img/escudo_hufflepuf.png"
  };

  var imgHTML = escudos[cls]
    ? "<img src=\"" + escudos[cls] + "\" alt=\"\" class=\"modal-house-badge__escudo\" />"
    : "";

  return "<span class=\"modal-house-badge " + cls + "\">" + imgHTML + name + "</span>";
}

/** Personajes que pasan el filtro activo — los que realmente se muestran */
let filteredCharacters = [];

/** Página actual del lector de personajes (empieza en 0, se muestra como 1) */
let currentPage = 0;

/** Hechizos que pasan el filtro de búsqueda del grimorio */
let filteredSpells = [];

/** Página actual del grimorio (0 igual que currentPage) */
let currentSpellPage = 0;

/** Cuántos personajes se muestran por página en el lector */
const PAGE_SIZE = 4;

/** Cuántos hechizos se muestran por página en el grimorio */
const SPELLS_PAGE_SIZE = 8;

/**
 * @description Arranca la página El Gran Libro.
 *              Pide todos los personajes a la API al entrar.
 *              Cuando llegan, muestra el botón de abrir el libro.
 *              Los hechizos se cargan en paralelo en segundo plano.
 */
function initLibro() {
  fetchAPI(
    ENDPOINTS.allCharacters,
    function (data) {
      allCharactersCache = data;
      hideElement("loading-state");
      updateChapterCounts(data);
      showElement("btn-open-book");
      initOpenBookButton();
      initModalClose();
      loadSpells();
    },
    function (errorMsg) {
      hideElement("loading-state");
      showElement("error-state");
      setText("error-message", "No se pudo cargar el archivo mágico. " + errorMsg);
    }
  );
}

/**
 * @description Calcula cuántos personajes hay en cada casa y lo muestra
 *              en el botón del índice antes de abrir el libro.
 *
 * filter() recorre el array y devuelve solo los elementos que cumplen
 * la condición — en este caso los de cada casa.
 * @see https://lenguajejs.com/javascript/arrays/metodo-filter/
 *
 * @param {Array} characters - Array completo de personajes de la API
 */
function updateChapterCounts(characters) {
  var houses = ["gryffindor", "slytherin", "ravenclaw", "hufflepuff"];
  setText("count-all", characters.length + " entradas");

  houses.forEach(function (house) {
    var count = characters.filter(function (c) {
      return c.house && c.house.toLowerCase() === house;
    }).length;
    setText("count-" + house, count + " entradas");
  });
}

/**
 * @description Inicializa el botón "Abrir el libro" de la portada.
 *              Al pulsarlo, oculta la portada y muestra el contenido con animación.
 *
 * classList.remove/add dispara las transiciones CSS automáticamente.
 * @see https://lenguajejs.com/javascript/dom/clases-css/
 */
function initOpenBookButton() {
  var btn = document.getElementById("btn-open-book");
  if (!btn) { return; }

  btn.addEventListener("click", function () {
    hideElement("book-cover");
    showElement("book-content");
    /* Estas tres funciones necesitan que el contenido sea visible para funcionar */
    initChapterButtons();
    applyFilters();
  });
}

/**
 * @description Inicializa los botones del índice de capítulos.
 *              El capítulo VI (hechizos) muestra la sección del grimorio
 *              y oculta la de personajes. Los demás hacen lo contrario.
 *
 * btn.id.replace("btn-", "") me quita el prefijo "btn-" del id para
 * quedarme solo con el nombre del capítulo: "btn-gryffindor" → "gryffindor".
 * @see https://lenguajejs.com/javascript/string/metodos-replace/
 */
function initChapterButtons() {
  var buttons = document.querySelectorAll(".chapter-btn");

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      buttons.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");

      var chapter = btn.id.replace("btn-", "");

      if (chapter === "spells") {
        hideElement("characters-section");
          showElement("spells-section");
        return;
      }

      showElement("characters-section");
      hideElement("spells-section");

      currentHouseFilter = chapter;
      currentPage = 0;

      var chapterNames = {
        all:        "Todos los magos",
        gryffindor: "Gryffindor",
        slytherin:  "Slytherin",
        ravenclaw:  "Ravenclaw",
        hufflepuff: "Hufflepuff"
      };
      setText("chapter-title", chapterNames[chapter] || "Todos los magos");
      applyFilters();
    });
  });
}

/**
 * @description Renderiza la página actual de personajes (PAGE_SIZE por página).
 *
 * slice(inicio, fin) corta el array para quedarse solo con los personajes
 * de la página actual. Por ejemplo, página 2 → slice(4, 8).
 * @see https://lenguajejs.com/javascript/arrays/metodo-slice/
 *
 * Math.ceil() redondea hacia arriba — si hay 5 personajes y PAGE_SIZE es 4,
 * necesito 2 páginas, no 1.25.
 * @see https://lenguajejs.com/javascript/matematicas/math-ceil/
 *
 * @param {Array} characters - Array ya filtrado de personajes a paginar
 */
function renderCharacters(characters) {
  var grid = document.getElementById("characters-grid");
  if (!grid) { return; }

  filteredCharacters = characters;
  var totalPages = Math.ceil(characters.length / PAGE_SIZE);

  if (currentPage >= totalPages) { currentPage = 0; }

  var start          = currentPage * PAGE_SIZE;
  var pageCharacters = characters.slice(start, start + PAGE_SIZE);

  setText("results-count", characters.length + " personajes · página " + (currentPage + 1) + " de " + (totalPages || 1));

  if (characters.length === 0) {
    grid.innerHTML = "<p class=\"error-text\" style=\"grid-column:1/-1;\">No se encontraron personajes.</p>";
    updatePageControls(0, 0);
    return;
  }

  var html = "";
  pageCharacters.forEach(function (character, index) {
    var house = character.house ? character.house.toLowerCase() : "";

    /* Si el personaje tiene foto la uso; si no, genero un placeholder con género */
    var imgHTML = character.image
      ? "<img src=\"" + character.image + "\" alt=\"Foto de " + character.name + "\" class=\"character-card__img\" loading=\"lazy\" />"
      : getPlaceholderHTML(character, "character-card__no-img", "../img/");

    /* Añado data-id para poder abrir el modal con el id correcto al hacer click */
    html += "<article class=\"character-card " + house + "\""
          + " data-id=\"" + character.id + "\""
          + " style=\"animation-delay:" + (index * 0.06) + "s\""
          + " role=\"button\" tabindex=\"0\""
          + " aria-label=\"Ver ficha de " + character.name + "\">"
          + "<div class=\"character-card__img-wrapper\">" + imgHTML + "</div>"
          + "<div class=\"character-card__body\">"
          + "<p class=\"character-card__name\">" + character.name + "</p>"
          + "<p class=\"character-card__house\">" + getHouseName(character.house) + "</p>"
          + "</div>"
          + "</article>";
  });

  /* Truco para reiniciar una animación CSS: quito la clase, fuerzlo un reflow
     leyendo offsetWidth (el navegador recalcula el layout), y la vuelvo a añadir.
     Sin el void offsetWidth, el navegador omite la animación porque la clase
     nunca "desapareció" realmente.
     @see https://lenguajejs.com/javascript/dom/cssom/ */
  var page = document.querySelector(".book-page");
  if (page) {
    page.classList.remove("book-page--turning");
    void page.offsetWidth;
    page.classList.add("book-page--turning");
  }

  grid.innerHTML = html;
  setText("page-indicator", "— " + (currentPage + 1) + " —");
  updatePageControls(currentPage, totalPages);
  initCharacterCardClicks();
}

/**
 * @description Activa/desactiva las flechas de paginación y registra sus clicks.
 *              Usa data-init como "bandera" para no añadir el mismo listener dos veces.
 *
 * getAttribute / setAttribute me permiten leer y escribir atributos HTML.
 * @see https://lenguajejs.com/javascript/dom/dataset/
 * La propiedad disabled activa/desactiva un botón nativamente.
 * @see https://lenguajejs.com/javascript/dom/propiedades-atributos/
 *
 * @param {number} page       - Página actual (0-based)
 * @param {number} totalPages - Total de páginas calculado con Math.ceil
 */
function updatePageControls(page, totalPages) {
  var btnPrev = document.getElementById("btn-prev");
  var btnNext = document.getElementById("btn-next");
  if (!btnPrev || !btnNext) { return; }

  /* En la primera página deshabilito "anterior", en la última deshabilito "siguiente" */
  btnPrev.disabled = (page === 0);
  btnNext.disabled = (page >= totalPages - 1);

  if (!btnPrev.getAttribute("data-init")) {
    btnPrev.setAttribute("data-init", "true");
    btnPrev.addEventListener("click", function () {
      if (currentPage > 0) {
        currentPage--;
        renderCharacters(filteredCharacters);
      }
    });
  }

  if (!btnNext.getAttribute("data-init")) {
    btnNext.setAttribute("data-init", "true");
    btnNext.addEventListener("click", function () {
      var total = Math.ceil(filteredCharacters.length / PAGE_SIZE);
      if (currentPage < total - 1) {
        currentPage++;
        renderCharacters(filteredCharacters);
      }
    });
  }
}

/**
 * @description Añade los eventos click y teclado a las tarjetas de personaje.
 *              El teclado es para accesibilidad: permite abrir la ficha con Enter o Espacio.
 *
 * event.key devuelve el nombre de la tecla pulsada como string.
 * @see https://lenguajejs.com/javascript/eventos/teclado/
 */
function initCharacterCardClicks() {
  var cards = document.querySelectorAll(".character-card");
  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      openCharacterModal(card.getAttribute("data-id"));
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        openCharacterModal(card.getAttribute("data-id"));
      }
    });
  });
}

/**
 * @description Abre el modal y carga la ficha detallada de un personaje por id.
 *              Bloquea el scroll del body mientras está abierto.
 *
 * document.body.style.overflow = "hidden" evita que la página de fondo
 * siga siendo scrollable mientras el modal está abierto.
 * @see https://lenguajejs.com/javascript/dom/cssom/
 *
 * @param {string} id - ID único del personaje en la API
 */
function openCharacterModal(id) {
  var overlay = document.getElementById("modal-overlay");
  if (!overlay) { return; }

  setHTML("modal-content", "<p class=\"loading-text\" style=\"text-align:center;padding:2rem 1rem;\">Cargando ficha...</p>");
  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  fetchAPI(
    ENDPOINTS.character(id),
    function (data) {
      /* La API a veces devuelve un array con un objeto, otras veces el objeto directo.
         Array.isArray() me dice si es un array para tratarlo siempre igual.
         @see https://lenguajejs.com/javascript/arrays/array-isarray/ */
      var character = Array.isArray(data) ? data[0] : data;
      renderModal(character);
    },
    function (errorMsg) {
      setHTML("modal-content", "<p class=\"error-text\">No se pudo cargar la ficha. " + errorMsg + "</p>");
    }
  );
}

/**
 * @description Construye todo el HTML de la ficha del personaje dentro del modal.
 *              Accedo a propiedades anidadas como character.wand.wood usando
 *              el operador && para comprobar que existen antes de acceder.
 *
 * Si intentase acceder directamente a character.wand.wood y wand fuese null,
 * el programa se rompería. El && hace un "short-circuit": si wand es falsi,
 * para y devuelve false sin intentar acceder a .wood.
 * @see https://lenguajejs.com/javascript/objetos/acceso-objetos/
 *
 * @param {Object} character - Objeto completo del personaje devuelto por la API
 */
function renderModal(character) {
  if (!character) { return; }

  var house = character.house ? character.house.toLowerCase() : "";

  /* Si tiene foto la muestro; si no, placeholder con género */
  var imgHTML = character.image
    ? "<img src=\"" + character.image + "\" alt=\"Foto de " + character.name + "\" class=\"modal-img\" />"
    : getPlaceholderHTML(character, "modal-no-img", "../img/");

  var wand = (character.wand && character.wand.wood)
    ? character.wand.wood + ", " + character.wand.core
    : "Desconocida";

  var html = "<div class=\"modal-img-wrapper\">" + imgHTML + "</div>"
           + "<h2 class=\"modal-name\" id=\"modal-name\">" + character.name + "</h2>"
           + buildHouseBadgeHTML(house)
           + "<div class=\"modal-data\">"
           + buildDataItem("Especie",      character.species    || "Desconocida")
           + buildDataItem("Género",       character.gender     || "Desconocido")
           + buildDataItem("Ascendencia",  character.ancestry   || "Desconocida")
           + buildDataItem("Varita",       wand)
           + buildDataItem("Patronus",     character.patronus   || "Desconocido")
           + buildDataItem("Ojos",         character.eyeColour  || "Desconocido")
           + buildDataItem("Cabello",      character.hairColour || "Desconocido")
           + buildDataItem("Estado",       character.alive ? "Vivo" : "Fallecido")
           + buildDataItem("Alumno",       character.hogwartsStudent ? "Sí" : "No")
           + buildDataItem("Profesor",     character.hogwartsStaff   ? "Sí" : "No")
           + buildDataItem("Actor/Actriz", character.actor      || "Desconocido")
           + "</div>";

  setHTML("modal-content", html);
}

/**
 * @description Genera el HTML de un par etiqueta/valor para la ficha del modal.
 *              Lo reutilizo para cada campo del personaje.
 *
 * @param   {string} label - Nombre del campo (ej: "Especie")
 * @param   {string} value - Valor del campo (ej: "Human")
 * @returns {string} HTML del item listo para concatenar
 */
function buildDataItem(label, value) {
  return "<div class=\"modal-data-item\">"
       + "<span class=\"modal-data-item__label\">" + label + "</span>"
       + "<span class=\"modal-data-item__value\">" + value + "</span>"
       + "</div>";
}

/**
 * @description Inicializa los tres métodos de cierre del modal:
 *              botón X, click en el fondo oscuro y tecla Escape.
 *
 * e.target es el elemento que recibió el click.
 * Comparo e.target === overlay para asegurarme de que el click fue
 * en el fondo y no en el contenido del modal (que también está dentro del overlay).
 * @see https://lenguajejs.com/javascript/eventos/objeto-event/
 */
function initModalClose() {
  var closeBtn = document.getElementById("modal-close");
  var overlay  = document.getElementById("modal-overlay");

  if (closeBtn) {
    closeBtn.addEventListener("click", function () { closeModal(); });
  }
  if (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) { closeModal(); }
    });
  }
  /* Escape también cierra el modal — accesibilidad básica */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeModal(); }
  });
}

/**
 * @description Cierra el modal y devuelve el scroll al body.
 */
function closeModal() {
  hideElement("modal-overlay");
  document.body.style.overflow = "";
}

/**
 * @description Combina el filtro de casa y la búsqueda por texto y renderiza el resultado.
 *              Encadeno dos filter() — primero filtra por casa, luego por texto.
 *
 * filter() devuelve un nuevo array sin modificar el original.
 * @see https://lenguajejs.com/javascript/arrays/metodo-filter/
 * includes() comprueba si un string contiene otro (devuelve true/false).
 * @see https://lenguajejs.com/javascript/string/metodos-includes/
 */
function applyFilters() {
  var filtered = allCharactersCache;

  if (currentHouseFilter !== "all") {
    filtered = filtered.filter(function (c) {
      return c.house && c.house.toLowerCase() === currentHouseFilter;
    });
  }


  renderCharacters(filtered);
}

/**
 * @description Carga los hechizos desde la API en segundo plano.
 *              Actualiza el contador del capítulo VI en el índice cuando lleguen.
 *              Como usa el mismo fetchAPI, no bloquea la carga de personajes.
 * @see https://lenguajejs.com/javascript/peticiones-http/fetch/
 */
function loadSpells() {
  fetchAPI(
    ENDPOINTS.spells,
    function (data) {
      hideElement("spells-loading");
      setText("count-spells", data.length + " hechizos");
      filteredSpells = data;
      currentSpellPage = 0;
      renderSpells(filteredSpells);
      initSpellPageControls();
    },
    function (errorMsg) {
      hideElement("spells-loading");
      showElement("spells-error");
      setText("spells-error-text", "No se pudo cargar el grimorio. " + errorMsg);
    }
  );
}

/**
 * @description Renderiza la página actual de hechizos.
 *              Funciona exactamente igual que renderCharacters pero
 *              con su propio estado (currentSpellPage, filteredSpells).
 *
 * @param {Array} spells - Array ya filtrado de hechizos a paginar
 */
function renderSpells(spells) {
  var grid = document.getElementById("spells-grid");
  if (!grid) { return; }

  filteredSpells = spells;
  var totalPages = Math.ceil(spells.length / SPELLS_PAGE_SIZE);
  if (currentSpellPage >= totalPages) { currentSpellPage = 0; }

  var pageSpells = spells.slice(
    currentSpellPage * SPELLS_PAGE_SIZE,
    currentSpellPage * SPELLS_PAGE_SIZE + SPELLS_PAGE_SIZE
  );

  setText("spells-count", spells.length + " hechizos · página " + (currentSpellPage + 1) + " de " + (totalPages || 1));

  if (spells.length === 0) {
    grid.innerHTML = "<p class=\"error-text\">No se encontraron hechizos.</p>";
    updateSpellPageControls(0, 0);
    return;
  }

  var html = "";
  pageSpells.forEach(function (spell, index) {
    var incantation = spell.incantation || "";

    html += "<div class=\"spell-card\" style=\"animation-delay:" + (index * 0.02) + "s\">"
          + (incantation ? "<p class=\"spell-card__incantation\">" + incantation + "</p>" : "")
          + "<p class=\"spell-card__name\">" + spell.name + "</p>"
          + "</div>";
  });

  var page = document.querySelector(".spells-book-page");
  if (page) {
    page.classList.remove("book-page--turning");
    void page.offsetWidth;
    page.classList.add("book-page--turning");
  }

  grid.innerHTML = html;
  setText("spell-page-indicator", "— " + (currentSpellPage + 1) + " —");
  updateSpellPageControls(currentSpellPage, totalPages);
}

/**
 * @description Activa/desactiva las flechas del grimorio.
 *              Misma lógica de data-init que en updatePageControls.
 *
 * @param {number} page       - Página actual del grimorio
 * @param {number} totalPages - Total de páginas del grimorio
 */
function updateSpellPageControls(page, totalPages) {
  var btnPrev = document.getElementById("btn-spell-prev");
  var btnNext = document.getElementById("btn-spell-next");
  if (!btnPrev || !btnNext) { return; }

  btnPrev.disabled = (page === 0);
  btnNext.disabled = (page >= totalPages - 1);

  if (!btnPrev.getAttribute("data-init")) {
    btnPrev.setAttribute("data-init", "true");
    btnPrev.addEventListener("click", function () {
      if (currentSpellPage > 0) {
        currentSpellPage--;
        renderSpells(filteredSpells);
      }
    });
  }

  if (!btnNext.getAttribute("data-init")) {
    btnNext.setAttribute("data-init", "true");
    btnNext.addEventListener("click", function () {
      var total = Math.ceil(filteredSpells.length / SPELLS_PAGE_SIZE);
      if (currentSpellPage < total - 1) {
        currentSpellPage++;
        renderSpells(filteredSpells);
      }
    });
  }
}

/**
 * @description Arranca los controles del grimorio (se llama una sola vez al cargar).
 */
function initSpellPageControls() {
  updateSpellPageControls(currentSpellPage, Math.ceil(filteredSpells.length / SPELLS_PAGE_SIZE));
}

/**
 * @description Arranca la página del Sombrero Seleccionador.
 *              Resetea el estado del quiz y muestra la primera pregunta.
 */
function initSombrero() {
  quizScores      = { g: 0, s: 0, r: 0, h: 0 };
  currentQuestion = 0;

  renderQuestion(0);

  var retryBtn = document.getElementById("btn-retry");
  if (retryBtn) {
    retryBtn.addEventListener("click", function () { resetQuiz(); });
  }
}

/**
 * @description Renderiza la pregunta del índice recibido.
 *              Genera los botones de respuesta dinámicamente y los inicializa.
 *
 * @param {number} index - Posición de la pregunta en QUIZ_QUESTIONS (0-based)
 */
function renderQuestion(index) {
  var question = QUIZ_QUESTIONS[index];
  if (!question) { return; }

  setText("question-number", "Pregunta " + (index + 1) + " de " + QUIZ_QUESTIONS.length);
  setText("question-text",   question.text);
  updateProgressBar(index);

  var grid = document.getElementById("answers-grid");
  if (!grid) { return; }

  var html = "";
  question.answers.forEach(function (answer, i) {
    html += "<button class=\"answer-btn\" data-index=\"" + i + "\">"
          + answer.text
          + "</button>";
  });
  grid.innerHTML = html;

  initAnswerButtons(question);
}

/**
 * @description Asigna el evento click a cada botón de respuesta.
 *              Lee el índice del botón con data-index, suma los puntos
 *              de esa respuesta a quizScores y pasa a la siguiente pregunta.
 *
 * parseInt convierte el string del data-index en número para usarlo como índice.
 * Los atributos data-* guardan datos en el HTML:
 * @see https://lenguajejs.com/javascript/dom/dataset/
 *
 * @param {Object} question - Objeto de la pregunta con sus 4 respuestas
 */
function initAnswerButtons(question) {
  var buttons = document.querySelectorAll(".answer-btn");

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var answer = question.answers[parseInt(btn.getAttribute("data-index"))];

      /* Sumo los puntos de esta respuesta al marcador acumulado */
      quizScores.g += answer.points.g;
      quizScores.s += answer.points.s;
      quizScores.r += answer.points.r;
      quizScores.h += answer.points.h;

      currentQuestion++;

      if (currentQuestion < QUIZ_QUESTIONS.length) {
        renderQuestion(currentQuestion);
      } else {
        showQuizResult();
      }
    });
  });
}

/**
 * @description Actualiza la barra de progreso del quiz.
 *              Calcula el porcentaje completado y lo aplica directamente con style.width.
 *
 * Modificar estilos inline con element.style:
 * @see https://lenguajejs.com/javascript/dom/cssom/
 *
 * @param {number} index - Pregunta actual (0-based); al terminar se llama con QUIZ_QUESTIONS.length
 */
function updateProgressBar(index) {
  var bar = document.getElementById("progress-bar");
  if (!bar) { return; }
  /* Divido la pregunta actual entre el total y multiplico por 100 para obtener % */
  bar.style.width = ((index / QUIZ_QUESTIONS.length) * 100) + "%";
}

/**
 * @description Calcula la casa ganadora al acabar el quiz y muestra el resultado.
 *              Recorre el objeto quizScores con Object.keys() para encontrar
 *              la clave con mayor puntuación.
 *
 * Object.keys() devuelve un array con los nombres de las propiedades del objeto.
 * Aquí me da ["g", "s", "r", "h"] y itero sobre ellos para encontrar el máximo.
 * @see https://lenguajejs.com/javascript/objetos/object-keys/
 *
 * También muestra el escudo de la casa ganadora — imagen que dibujé yo mismo.
 */
function showQuizResult() {
  updateProgressBar(QUIZ_QUESTIONS.length);

  var map       = { g: "gryffindor", s: "slytherin", r: "ravenclaw", h: "hufflepuff" };
  var winnerKey = "g";
  var maxScore  = -1;

  Object.keys(quizScores).forEach(function (key) {
    if (quizScores[key] > maxScore) {
      maxScore  = quizScores[key];
      winnerKey = key;
    }
  });

  var winnerHouse = map[winnerKey];
  var houseInfo   = HOUSE_DATA[winnerHouse];

  hideElement("quiz-section");
  showElement("result-section");

  var nameEl   = document.getElementById("result-house-name");
  var shieldEl = document.getElementById("result-house-shield");

  if (nameEl && houseInfo) {
    nameEl.textContent = houseInfo.name;
    nameEl.className   = "result-house-name " + winnerHouse;
  }

  var escudos = {
    gryffindor: "../img/escudo_gryffindor.png",
    slytherin:  "../img/escudo_slytherin.png",
    ravenclaw:  "../img/escudo_ravenclaw.png",
    hufflepuff: "../img/escudo_hufflepuf.png"
  };

  if (shieldEl && escudos[winnerHouse]) {
    shieldEl.src       = escudos[winnerHouse];
    shieldEl.alt       = houseInfo ? houseInfo.name : winnerHouse;
    shieldEl.className = "result-house-shield " + winnerHouse;
    shieldEl.classList.remove("hidden");
  }

  setText("result-house-desc", houseInfo.desc);
  loadHouseMembers(winnerHouse);
}

/**
 * @description Pide a la API los personajes de la casa ganadora.
 * @param {string} house - Nombre de la casa en minúsculas
 */
function loadHouseMembers(house) {
  showElement("members-loading");
  hideElement("members-error");

  fetchAPI(
    ENDPOINTS.house(house),
    function (data) {
      hideElement("members-loading");
      /* slice(0, 12) me queda con los primeros 12 — no quiero mostrar cientos
         @see https://lenguajejs.com/javascript/arrays/metodo-slice/ */
      renderHouseMembers(data.slice(0, 12));
    },
    function (errorMsg) {
      hideElement("members-loading");
      showElement("members-error");
      setText("members-error-text", "No se pudieron cargar los compañeros. " + errorMsg);
    }
  );
}

/**
 * @description Renderiza las mini tarjetas de compañeros de casa en el resultado.
 *              Si el miembro no tiene foto, usa el placeholder por género.
 *
 * @param {Array} members - Array de hasta 12 personajes de la casa ganadora
 */
function renderHouseMembers(members) {
  var grid = document.getElementById("result-members-grid");
  if (!grid) { return; }

  if (members.length === 0) {
    grid.innerHTML = "<p class=\"error-text\">No hay compañeros registrados.</p>";
    return;
  }

  var html = "";
  members.forEach(function (member, index) {
    var imgHTML = member.image
      ? "<img src=\"" + member.image + "\" alt=\"Foto de " + member.name + "\" class=\"member-card__img\" loading=\"lazy\" />"
      : getPlaceholderHTML(member, "member-card__no-img", "../img/");

    html += "<div class=\"member-card\" style=\"animation-delay:" + (index * 0.05) + "s\">"
          + "<div class=\"member-card__img-wrapper\">" + imgHTML + "</div>"
          + "<p class=\"member-card__name\">" + member.name + "</p>"
          + "</div>";
  });

  grid.innerHTML = html;
}

/**
 * @description Reinicia el quiz al estado inicial para poder repetirlo.
 */
function resetQuiz() {
  quizScores      = { g: 0, s: 0, r: 0, h: 0 };
  currentQuestion = 0;
  hideElement("result-section");
  showElement("quiz-section");
  renderQuestion(0);
}

/**
 * @description Arranca la página Duelo de Magos.
 *              Carga todos los personajes para rellenar el select del jugador.
 */
function initDuelo() {
  showElement("duel-loading");

  fetchAPI(
    ENDPOINTS.allCharacters,
    function (data) {
      allCharactersCache = data;
      hideElement("duel-loading");
      populateDuelSelect(data);
      initDuelSelectListener();
      initDuelButton();
    },
    function (errorMsg) {
      hideElement("duel-loading");
      showElement("duel-error");
      setText("duel-error-text", "No se pudieron cargar los magos. " + errorMsg);
    }
  );
}

/**
 * @description Rellena el <select> del jugador con todos los personajes disponibles.
 *              Añade el nombre y la casa entre paréntesis para que sea más fácil elegir.
 *
 * Construyo el HTML de las opciones con un string y lo asigno de golpe con innerHTML,
 * en vez de crear elementos uno a uno — más rápido para listas largas.
 * @see https://lenguajejs.com/javascript/dom/crear-elementos-dom/
 *
 * @param {Array} characters - Array completo de personajes
 */
function populateDuelSelect(characters) {
  var select1 = document.getElementById("select-1");
  if (!select1) { return; }

  var optionsHTML = "<option value=\"\">— Elige un mago —</option>";

  characters.forEach(function (character) {
    optionsHTML += "<option value=\"" + character.id + "\">"
                 + character.name
                 + (character.house ? " (" + getHouseName(character.house) + ")" : "")
                 + "</option>";
  });

  select1.innerHTML = optionsHTML;
}

/**
 * @description Escucha cuando el jugador elige un mago en el select
 *              y carga su tarjeta de detalle automáticamente.
 *
 * El evento "change" en un select se dispara cuando cambia la opción seleccionada.
 * @see https://lenguajejs.com/javascript/eventos/formularios/
 */
function initDuelSelectListener() {
  var select1 = document.getElementById("select-1");
  if (!select1) { return; }

  select1.addEventListener("change", function () {
    loadDuelistCard("select-1", "card-1");
    /* Cuando el jugador cambia de mago, reseteo el panel de la CPU */
    hideElement("card-2");
    showElement("cpu-hint");
    hideElement("duel-result");
  });
}

/**
 * @description Carga y renderiza la tarjeta de un duelista por el id del select.
 *              Si el select está vacío, oculta la tarjeta.
 *
 * @param {string} selectId - ID del <select> del que leer el valor
 * @param {string} cardId   - ID del contenedor donde renderizar la tarjeta
 */
function loadDuelistCard(selectId, cardId) {
  var select = document.getElementById(selectId);
  var card   = document.getElementById(cardId);
  if (!select || !card) { return; }

  var id = select.value;

  if (!id) {
    card.classList.add("hidden");
    card.innerHTML = "";
    return;
  }

  card.innerHTML = "<p class=\"loading-text\" style=\"padding:1rem;\">Invocando al mago...</p>";
  card.classList.remove("hidden");
  hideElement("duel-result");

  fetchAPI(
    ENDPOINTS.character(id),
    function (data) {
      var character = Array.isArray(data) ? data[0] : data;
      renderDuelistCard(card, character);
    },
    function (errorMsg) {
      card.innerHTML = "<p class=\"error-text\">Error al cargar el mago. " + errorMsg + "</p>";
    }
  );
}

/**
 * @description Construye y renderiza la tarjeta de un duelista.
 *              El color del badge de casa lo saco de HOUSE_DATA usando
 *              notación de corchetes: HOUSE_DATA[house].color
 *
 * Los corchetes permiten acceder a propiedades con un nombre dinámico (una variable),
 * algo que no se puede hacer con el punto cuando el nombre no es literal.
 * @see https://lenguajejs.com/javascript/objetos/acceso-objetos/
 *
 * @param {HTMLElement} container - Elemento contenedor donde insertar la tarjeta
 * @param {Object}      character - Datos del personaje
 */
function renderDuelistCard(container, character) {
  var house      = character.house ? character.house.toLowerCase() : "";
  var houseColor = (house && HOUSE_DATA[house]) ? HOUSE_DATA[house].color : "#7F77DD";
  var wand       = (character.wand && character.wand.wood)
    ? character.wand.wood + ", " + character.wand.core
    : "Varita desconocida";

  var imgHTML = character.image
    ? "<img src=\"" + character.image + "\" alt=\"Foto de " + character.name + "\" class=\"duelist-card__img\" />"
    : getPlaceholderHTML(character, "duelist-card__no-img", "../img/");

  var badgeStyle = "border:1px solid " + houseColor + ";"
                 + "color:" + houseColor + ";"
                 + "background:rgba(0,0,0,0.2);";

  container.innerHTML =
      "<div class=\"duelist-card__img-wrapper\">" + imgHTML + "</div>"
    + "<p class=\"duelist-card__name\">"  + character.name + "</p>"
    + "<p class=\"duelist-card__info\">"  + (character.species || "Mago") + " · " + (character.gender || "") + "</p>"
    + "<p class=\"duelist-card__info\">Varita: "   + wand + "</p>"
    + "<p class=\"duelist-card__info\">Patronus: " + (character.patronus || "Desconocido") + "</p>"
    + "<span class=\"duelist-card__house-badge\" style=\"" + badgeStyle + "\">"
    + getHouseName(character.house) + "</span>";
}

/**
 * @description Inicializa el botón de "Iniciar duelo".
 */
function initDuelButton() {
  var btn = document.getElementById("btn-duel");
  if (!btn) { return; }
  btn.addEventListener("click", function () { executeDuel(); });
}

/**
 * @description Ejecuta el duelo entre el mago del jugador y uno aleatorio de la CPU.
 *
 * try/catch para validar que el jugador eligió un mago antes de duelo.
 * Si no eligió, lanzo un Error con throw que el catch captura para mostrar el mensaje.
 * @see https://lenguajejs.com/javascript/excepciones/try-catch-finally/
 *
 * Para la CPU uso filter() para excluir al mago del jugador del pool
 * y luego Math.floor(Math.random() * pool.length) para un índice aleatorio.
 * @see https://lenguajejs.com/javascript/matematicas/math-random/
 * @see https://lenguajejs.com/javascript/arrays/metodo-filter/
 */
function executeDuel() {
  var select1 = document.getElementById("select-1");
  if (!select1) { return; }

  try {
    if (!select1.value) {
      throw new Error("Debes elegir tu mago antes de iniciar el duelo.");
    }
  } catch (err) {
    showElement("duel-result");
    setText("duel-result-text", err.message);
    return;
  }

  var char1 = allCharactersCache.find(function (c) { return c.id === select1.value; });
  if (!char1) { return; }

  /* La CPU elige un mago del pool (todos menos el del jugador) */
  var pool  = allCharactersCache.filter(function (c) { return c.id !== select1.value; });
  var index = Math.floor(Math.random() * pool.length);
  var char2 = pool[index];

  hideElement("cpu-hint");
  var card2 = document.getElementById("card-2");
  if (card2) {
    card2.classList.remove("hidden");
    renderDuelistCard(card2, char2);
  }

  var score1 = calculateDuelScore(char1);
  var score2 = calculateDuelScore(char2);

  var resultText = "";

  if (score1 > score2) {
    resultText = "¡Victoria! " + char1.name + " vence a " + char2.name + " (" + score1 + " vs " + score2 + " puntos).";
  } else if (score2 > score1) {
    resultText = "La CPU gana. " + char2.name + " derrota a " + char1.name + " (" + score2 + " vs " + score1 + " puntos).";
  } else {
    resultText = "¡Empate! " + char1.name + " y " + char2.name + " están igualados con " + score1 + " puntos.";
  }

  showElement("duel-result");
  setText("duel-result-text", resultText);
}

/**
 * @description Calcula la "fuerza" de un personaje para el duelo
 *              basándose en sus atributos de la API.
 *              Añade hasta 2 puntos aleatorios para que no siempre gane el mismo.
 *
 * La suma de puntos es arbitraria pero tiene lógica:
 * un profesor vale más que un alumno, tener patronus es señal de magia fuerte, etc.
 *
 * Math.floor(Math.random() * 3) da 0, 1 o 2 — el factor suerte del duelo.
 * @see https://lenguajejs.com/javascript/matematicas/math-random/
 *
 * @param   {Object} character - Datos del personaje
 * @returns {number} Puntuación total del duelo
 */
function calculateDuelScore(character) {
  var score = 0;

  if (character.hogwartsStaff)               { score += 3; } /* Profesor: +3 */
  if (character.hogwartsStudent)             { score += 1; } /* Alumno: +1 */
  if (character.wizard)                      { score += 2; } /* Mago confirmado: +2 */
  if (character.alive)                       { score += 1; } /* Vivo: +1 */
  if (character.patronus)                    { score += 2; } /* Tiene patronus: +2 */
  if (character.wand && character.wand.wood) { score += 2; } /* Varita con madera: +2 */
  if (character.wand && character.wand.core) { score += 1; } /* Varita con núcleo: +1 */
  if (character.ancestry === "pure-blood")   { score += 2; } /* Sangre pura: +2 */
  if (character.ancestry === "half-blood")   { score += 1; } /* Mestizo: +1 */

  score += Math.floor(Math.random() * 3);

  return score;
}