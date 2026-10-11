/* Características principales en móvil/tablet (≤ 900 px): no hay «pasar el ratón», así que el efecto de
   resaltado (la tarjeta se eleva y el borde se pone rojo) se aplica a la tarjeta que está en el centro de la
   pantalla mientras se hace scroll. En escritorio no hace nada: manda el hover de siempre. */
(function () {
  var lista = document.querySelector('.caracteristicas__lista');
  if (!lista) return;
  var tarjetas = Array.prototype.slice.call(lista.querySelectorAll('.caracteristica'));
  if (!tarjetas.length) return;

  var CLASE = 'caracteristica--activa';
  var TOLERANCIA = 60; // px: si la línea de lectura cae en el hueco entre tarjetas, gana la más cercana
  var movil = window.matchMedia('(max-width: 900px)');
  var cabecera = document.querySelector('.cabecera-principal');
  var visible = false;
  var pendiente = false;

  // Línea de lectura: el centro del área visible bajo la cabecera fija
  function linea() {
    var arriba = cabecera ? cabecera.getBoundingClientRect().bottom : 0;
    return arriba + (window.innerHeight - arriba) * 0.5;
  }

  function actualizar() {
    pendiente = false;
    if (!movil.matches || !visible) return;

    var y = linea();
    var distancias = tarjetas.map(function (t) {
      var r = t.getBoundingClientRect();
      if (y >= r.top && y <= r.bottom) return 0;
      return Math.min(Math.abs(y - r.top), Math.abs(y - r.bottom));
    });
    var minima = Math.min.apply(null, distancias);

    tarjetas.forEach(function (t, i) {
      // Se resaltan la tarjeta bajo la línea (o todas las de esa fila) y ninguna si se está lejos de la lista
      t.classList.toggle(CLASE, minima <= TOLERANCIA && distancias[i] === minima);
    });
  }

  function pedir() {
    if (pendiente) return;
    pendiente = true;
    window.requestAnimationFrame(actualizar);
  }

  function limpiar() {
    tarjetas.forEach(function (t) { t.classList.remove(CLASE); });
  }

  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);

  // Solo se calcula mientras la lista está en pantalla
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entradas) {
      visible = entradas[0].isIntersecting;
      if (visible) pedir(); else limpiar();
    }, { rootMargin: '80px 0px' }).observe(lista);
  } else {
    visible = true;
  }

  function alCambiarVista() {
    if (movil.matches) pedir(); else limpiar();
  }
  if (movil.addEventListener) movil.addEventListener('change', alCambiarVista);
  else movil.addListener(alCambiarVista);

  pedir();
})();
