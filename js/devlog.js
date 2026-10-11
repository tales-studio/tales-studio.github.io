// Devlog interactivo: según se hace scroll, las tareas se tickean, los nodos de fase se iluminan
// (y se marcan al completar todas sus tareas) y la línea roja de la izquierda se va pintando.
// Todo se calcula respecto a una «línea de lectura» a media altura de la pantalla, así que al subir
// de nuevo el progreso retrocede. Sin este script el devlog se ve completo, como antes.
(function () {
  var linea = document.querySelector('.linea-tiempo');
  if (!linea) { return; }

  var LECTURA = 0.62;       // altura de la línea de lectura, como fracción del alto de pantalla
  var MARGEN_FINAL = 24;    // si el final de la línea de tiempo ya se ve con este margen, se da por completa
  var pendiente = false;
  var TOLERANCIA = 60;      // px: si la línea de lectura cae en el hueco entre fases, gana la más cercana
  // En móvil/tablet no hay «pasar el ratón»: la tarjeta de la fase que está bajo la línea de lectura
  // recibe el mismo efecto que el hover (se desplaza y el borde se aviva). Mismo corte que features-highlight.js
  var movil = window.matchMedia('(max-width: 900px)');

  var hitos = Array.prototype.map.call(linea.querySelectorAll('.hito'), function (hito) {
    return {
      el: hito,
      titulo: hito.querySelector('.hito__titulo'),
      tareas: Array.prototype.slice.call(hito.querySelectorAll('.hito__tareas li'))
    };
  });

  linea.classList.add('linea-tiempo--progresiva');

  function actualizar() {
    pendiente = false;
    var caja = linea.getBoundingClientRect();
    var alto = window.innerHeight;
    var completa = caja.bottom <= alto - MARGEN_FINAL;
    var lectura = completa ? Infinity : alto * LECTURA;

    // La línea discontinua empieza y acaba a 10 px de los extremos de la lista
    var largo = Math.max(0, caja.height - 20);
    var progreso = completa ? largo : Math.max(0, Math.min(largo, lectura - caja.top - 10));
    linea.style.setProperty('--progreso', progreso + 'px');

    hitos.forEach(function (hito) {
      var hechas = 0;
      hito.tareas.forEach(function (tarea) {
        // 15 px: centro de la casilla, que es lo que tiene que alcanzar la línea
        var hecha = tarea.getBoundingClientRect().top + 15 <= lectura;
        tarea.classList.toggle('tarea--hecha', hecha);
        if (hecha) { hechas++; }
      });
      // 14 px: centro del rombo, alineado con la primera línea del título
      hito.el.classList.toggle('hito--alcanzado', hito.titulo.getBoundingClientRect().top + 14 <= lectura);
      hito.el.classList.toggle('hito--completo', hechas === hito.tareas.length);
    });

    resaltarTarjeta(completa);
  }

  // Tarjeta activa: la fase cuya caja contiene la línea de lectura (o la más cercana, dentro de la tolerancia).
  // Al llegar al final de la línea de tiempo se queda activa la última fase
  function resaltarTarjeta(completa) {
    if (!movil.matches) { limpiarTarjetas(); return; }
    var y = window.innerHeight * LECTURA;
    var distancias = hitos.map(function (hito) {
      var r = hito.el.querySelector('.hito__contenido').getBoundingClientRect();
      if (y >= r.top && y <= r.bottom) { return 0; }
      return Math.min(Math.abs(y - r.top), Math.abs(y - r.bottom));
    });
    var minima = Math.min.apply(null, distancias);
    hitos.forEach(function (hito, i) {
      var activa = completa ? i === hitos.length - 1 : (minima <= TOLERANCIA && distancias[i] === minima);
      hito.el.classList.toggle('hito--activo', activa);
    });
  }

  function limpiarTarjetas() {
    hitos.forEach(function (hito) { hito.el.classList.remove('hito--activo'); });
  }

  function pedirActualizacion() {
    if (!pendiente) {
      pendiente = true;
      window.requestAnimationFrame(actualizar);
    }
  }

  window.addEventListener('scroll', pedirActualizacion, { passive: true });
  window.addEventListener('resize', pedirActualizacion);
  window.addEventListener('load', pedirActualizacion);
  if (movil.addEventListener) { movil.addEventListener('change', pedirActualizacion); }
  else { movil.addListener(pedirActualizacion); }
  document.addEventListener('idiomacambiado', pedirActualizacion); // los textos en inglés miden distinto
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(pedirActualizacion); }

  actualizar();
})();
