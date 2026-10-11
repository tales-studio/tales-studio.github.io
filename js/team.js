// Equipo: tarjetas compactas que se despliegan al pasar el ratón.
// Cada tarjeta flota sobre su hueco; aquí se fija la altura del hueco a la de la tarjeta cerrada
(function () {
  var lista = document.querySelector('.equipo__lista');
  if (!lista) { return; }
  var consulta = window.matchMedia('(hover: hover) and (min-width: 561px)');
  var huecos = Array.prototype.slice.call(lista.querySelectorAll('.miembro'));

  function medir() {
    huecos.forEach(function (hueco) {
      hueco.style.height = '';
    });
    if (!lista.classList.contains('equipo__lista--flotante')) { return; }
    var alturas = huecos.map(function (hueco) {
      var tarjeta = hueco.querySelector('.miembro__tarjeta');
      var detalle = hueco.querySelector('.miembro__detalle');
      return tarjeta.offsetHeight - detalle.offsetHeight; // altura de la tarjeta cerrada
    });
    var maxima = Math.max.apply(null, alturas); // todas las tarjetas de la fila, igual de altas
    huecos.forEach(function (hueco) { hueco.style.height = maxima + 'px'; });
  }

  function aplicar() {
    lista.classList.toggle('equipo__lista--flotante', consulta.matches);
    medir();
  }

  aplicar();
  window.addEventListener('resize', medir);
  window.addEventListener('load', medir);
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(medir); }
  if (consulta.addEventListener) { consulta.addEventListener('change', aplicar); }
  else if (consulta.addListener) { consulta.addListener(aplicar); }
})();