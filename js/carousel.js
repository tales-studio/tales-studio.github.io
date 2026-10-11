// Carrusel de capturas: botones, puntos y teclado sobre una pista con scroll-snap
(function () {
  var pista = document.querySelector('.carrusel__pista');
  if (!pista) { return; }
  var diapositivas = Array.prototype.slice.call(pista.children);
  var anterior = document.querySelector('[data-carrusel="anterior"]');
  var siguiente = document.querySelector('[data-carrusel="siguiente"]');
  var contenedorPuntos = document.querySelector('.carrusel__puntos');
  var puntos = [];
  var actual = 0;

  function irA(i) {
    i = Math.max(0, Math.min(diapositivas.length - 1, i));
    var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    pista.scrollTo({ left: diapositivas[i].offsetLeft - diapositivas[0].offsetLeft, behavior: reducido ? 'auto' : 'smooth' });
  }

  function marcar(i) {
    actual = i;
    puntos.forEach(function (p, n) { p.setAttribute('aria-current', n === i ? 'true' : 'false'); });
    anterior.disabled = i === 0;
    siguiente.disabled = i === diapositivas.length - 1;
  }

  diapositivas.forEach(function (_, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'carrusel__punto';
    b.addEventListener('click', function () { irA(i); });
    contenedorPuntos.appendChild(b);
    puntos.push(b);
  });

  // Las etiquetas de los puntos dependen del idioma de la página
  function etiquetarPuntos() {
    var en = document.documentElement.lang === 'en';
    puntos.forEach(function (p, n) {
      p.setAttribute('aria-label', (en ? 'Go to screenshot ' : 'Ir a la captura ') + (n + 1) + (en ? ' of ' : ' de ') + diapositivas.length);
    });
  }
  etiquetarPuntos();
  document.addEventListener('idiomacambiado', etiquetarPuntos);

  anterior.addEventListener('click', function () { irA(actual - 1); });
  siguiente.addEventListener('click', function () { irA(actual + 1); });

  pista.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); irA(actual + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); irA(actual - 1); }
  });

  // La diapositiva activa es la más cercana al borde izquierdo de la pista
  var pendiente = false;
  pista.addEventListener('scroll', function () {
    if (pendiente) { return; }
    pendiente = true;
    window.requestAnimationFrame(function () {
      pendiente = false;
      var base = pista.scrollLeft + diapositivas[0].offsetLeft;
      var mejor = 0, dist = Infinity;
      diapositivas.forEach(function (d, i) {
        var dd = Math.abs(d.offsetLeft - base);
        if (dd < dist) { dist = dd; mejor = i; }
      });
      // Al llegar al final, la última cuenta aunque no pueda alinearse a la izquierda
      if (pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - 2) { mejor = diapositivas.length - 1; }
      if (mejor !== actual) { marcar(mejor); }
    });
  }, { passive: true });

  // Avance automático: cada INTERVALO ms pasa a la siguiente captura y, tras la última, vuelve a la primera.
  // No se pausa con el ratón encima: se reinicia la cuenta cuando la persona usa el carrusel (flechas, puntos,
  // teclado, rueda o dedo) y se detiene con el botón de pausa, con la pestaña oculta o con el carrusel fuera
  // de pantalla. Con «reducir movimiento» sigue avanzando, pero sin deslizamiento (irA usa entonces un salto)
  var INTERVALO = 5000;
  var INTERVALO_TRAS_USO = 8000;
  var carrusel = pista.closest('.carrusel');
  var botonPausa = carrusel.querySelector('.carrusel__pausa');
  var temporizador = null;
  var reproduciendo = true;   // lo cambia el botón de pausa
  var enPantalla = true;      // lo actualiza el observador, si existe

  function programar(retraso) {
    clearTimeout(temporizador);
    if (!reproduciendo || !enPantalla || document.hidden) { return; }
    temporizador = setTimeout(function () {
      irA(actual === diapositivas.length - 1 ? 0 : actual + 1);
      programar();
    }, retraso || INTERVALO);
  }

  function etiquetarPausa() {
    var en = document.documentElement.lang === 'en';
    botonPausa.dataset.reproduciendo = String(reproduciendo);
    botonPausa.setAttribute('aria-label', reproduciendo
      ? (en ? 'Pause autoplay' : 'Pausar el desplazamiento automático')
      : (en ? 'Resume autoplay' : 'Reanudar el desplazamiento automático'));
  }

  botonPausa.addEventListener('click', function () {
    reproduciendo = !reproduciendo;
    etiquetarPausa();
    programar();
  });
  document.addEventListener('idiomacambiado', etiquetarPausa);
  etiquetarPausa();

  // Si la persona usa el carrusel, se le da más tiempo antes del siguiente avance
  function usado() { programar(INTERVALO_TRAS_USO); }
  carrusel.addEventListener('pointerdown', usado, { passive: true });
  carrusel.addEventListener('keydown', usado, { passive: true });
  pista.addEventListener('wheel', usado, { passive: true });
  document.addEventListener('visibilitychange', function () { programar(); });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entradas) {
      enPantalla = entradas[0].isIntersecting;
      programar();
    }, { threshold: 0.25 }).observe(carrusel);
  }
  programar();

  marcar(0);
})();