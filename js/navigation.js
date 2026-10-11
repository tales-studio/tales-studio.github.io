// Navegación: sección activa en el menú, títulos de sección fijos bajo la cabecera y botón de volver arriba.
(function () {
  var cabecera = document.querySelector('.cabecera-principal');
  var nav = document.querySelector('.navegacion-principal');
  var boton = document.getElementById('boton-subir');
  var umbralSubir = 300;
  var pendiente = false;
  var activa = null;
  var destino = null;       // sección a la que se viaja tras pulsar un enlace del menú
  var finViaje = null;      // temporizador que detecta cuándo termina el desplazamiento
  var sepTitulo = 28;       // aire entre cabecera y título fijo (se lee de --sep-titulo-fijo)
  var lista = nav.querySelector('.navegacion-principal__lista');
  var menuDesplazable = window.matchMedia('(max-width: 720px)'); // en móvil el menú se desplaza de lado
  var ESCALA_MIN = 0.82;    // por debajo de esta escala el texto sería demasiado pequeño: el menú pasa a dos filas

  // Cada enlace del menú con su sección y el título de esa sección.
  // El botón «Jugar la demo» no es una categoría: la demo está dentro de Nuestro juego, que se ilumina al llegar
  var secciones = Array.prototype.slice
    .call(document.querySelectorAll('.navegacion-principal__enlace:not(.navegacion-principal__enlace--destacado)'))
    .map(function (enlace) {
      var seccion = document.getElementById(enlace.getAttribute('href').slice(1));
      return {
        enlace: enlace,
        seccion: seccion,
        titulo: seccion ? seccion.querySelector('.seccion__titulo, .seccion-inicio__titulo') : null
      };
    })
    .filter(function (s) { return s.seccion; })
    .sort(function (a, b) {
      return a.seccion.compareDocumentPosition(b.seccion) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

  // Títulos de sección que se quedan fijos bajo la cabecera
  var titulos = Array.prototype.slice.call(document.querySelectorAll('.seccion__titulo'));

  // La cabecera fija el punto donde se pegan los títulos
  function medirCabecera() {
    document.documentElement.style.setProperty('--alto-cabecera', cabecera.offsetHeight + 'px');
    var sep = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sep-titulo-fijo'));
    if (!isNaN(sep)) { sepTitulo = sep; }
  }

  // Ancho que ocuparía el menú en una sola fila, sin recortarlo
  function anchoNatural() {
    lista.style.width = 'max-content';
    lista.style.minWidth = '0';
    var ancho = lista.getBoundingClientRect().width;
    lista.style.width = '';
    lista.style.minWidth = '';
    return ancho;
  }

  // En escritorio el menú tiene que caber siempre entero: si no, se desplazaría de lado
  // al cambiar de sección y dejaría enlaces fuera de la pantalla. Se reduce la escala de
  // textos y separaciones hasta que cabe; si ni así, pasa a dos filas.
  // Se repite al cambiar el tamaño de la ventana, al cargar las fuentes y al cambiar de idioma
  function ajustarMenu() {
    lista.classList.remove('navegacion-principal__lista--en-filas');
    lista.style.setProperty('--menu-escala', '1');
    nav.scrollLeft = 0;
    if (menuDesplazable.matches) { return; }

    var estilo = getComputedStyle(nav);
    var disponible = nav.clientWidth - parseFloat(estilo.paddingLeft) - parseFloat(estilo.paddingRight);
    var escala = 1;

    for (var i = 0; i < 5; i++) {
      var natural = anchoNatural();
      if (natural <= disponible) { return; }
      escala *= (disponible / natural) * 0.995;
      if (escala < ESCALA_MIN) { break; }
      lista.style.setProperty('--menu-escala', escala.toFixed(3));
    }

    lista.classList.add('navegacion-principal__lista--en-filas');
    lista.style.setProperty('--menu-escala', '0.9');
  }

  function remedir() {
    ajustarMenu();
    medirCabecera();
    pedirActualizacion();
  }

  function marcarActiva(actual) {
    secciones.forEach(function (s) { s.enlace.removeAttribute('aria-current'); });
    actual.enlace.setAttribute('aria-current', 'location');

    // Solo en móvil el menú se desplaza: centramos el enlace activo.
    // En escritorio no se toca: el menú no debe moverse al avanzar por la página
    if (menuDesplazable.matches && nav.scrollWidth > nav.clientWidth) {
      var e = actual.enlace.getBoundingClientRect();
      var n = nav.getBoundingClientRect();
      nav.scrollLeft += (e.left - n.left) - (n.width - e.width) / 2;
    }
  }

  function actualizar() {
    pendiente = false;

    var bajoCabecera = cabecera.getBoundingClientRect().bottom;
    var sonda = bajoCabecera + 80;
    var finPagina = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

    // Sección en la que está el usuario
    var actual = secciones[0];
    if (finPagina) {
      actual = secciones[secciones.length - 1];
    } else {
      secciones.forEach(function (s) {
        if (s.seccion.getBoundingClientRect().top <= sonda) { actual = s; }
      });
    }
    // Mientras se viaja a una sección elegida, el menú no ilumina las intermedias
    if (!destino && actual !== activa) {
      activa = actual;
      marcarActiva(actual);
    }

    // Título de la sección: al quedarse fijo bajo la cabecera se activa el velo de fondo
    titulos.forEach(function (t) {
      t.classList.toggle('seccion__titulo--fijo', t.getBoundingClientRect().top <= bajoCabecera + sepTitulo + 1);
    });

    // Botón de volver arriba
    boton.classList.toggle('boton-subir--visible', window.scrollY > umbralSubir);
  }

  function pedirActualizacion() {
    if (!pendiente) {
      pendiente = true;
      window.requestAnimationFrame(actualizar);
    }
  }

  // Viaje: al pulsar un enlace se ilumina directamente el destino y se ignoran las secciones
  // por las que pasa el desplazamiento. Termina cuando el scroll se detiene o el usuario
  // retoma el control con la rueda, el dedo o el teclado
  function terminarViaje() {
    clearTimeout(finViaje);
    if (destino) {
      destino = null;
      pedirActualizacion();
    }
  }

  function iniciarViaje(s) {
    destino = s;
    activa = s;
    marcarActiva(s);
    clearTimeout(finViaje);
    finViaje = setTimeout(terminarViaje, 250);
  }

  document.querySelector('.cabecera-principal').addEventListener('click', function (e) {
    var enlace = e.target.closest('a[href^="#"]');
    if (!enlace || e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) { return; }
    var id = enlace.getAttribute('href').slice(1);
    var s = secciones.filter(function (x) { return x.seccion.id === id; })[0];
    if (s) { iniciarViaje(s); }
  });

  window.addEventListener('scroll', function () {
    if (destino) {
      clearTimeout(finViaje);
      finViaje = setTimeout(terminarViaje, 150);
    }
    pedirActualizacion();
  }, { passive: true });
  ['wheel', 'touchstart', 'keydown'].forEach(function (tipo) {
    window.addEventListener(tipo, terminarViaje, { passive: true });
  });
  window.addEventListener('resize', remedir);
  document.addEventListener('idiomacambiado', remedir); // los textos en inglés miden distinto
  window.addEventListener('load', remedir);
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(remedir); }

  boton.addEventListener('click', function () {
    var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    iniciarViaje(secciones[0]);
    window.scrollTo({ top: 0, behavior: reducido ? 'auto' : 'smooth' });
  });

  ajustarMenu();
  medirCabecera();
  actualizar();
})();