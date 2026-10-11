/* Al ir a «Jugar la demo» o «Capturas» (enlaces dentro de Nuestro juego), el subtítulo debe quedar
   por debajo de la cabecera Y del título fijo «Nuestro juego». Ese título ocupa una o dos líneas según
   el ancho de pantalla y el idioma, así que se mide su altura real y se guarda en --alto-titulo-juego,
   que styles.css usa para el scroll-margin-top de esos bloques. */
(function () {
  var titulo = document.querySelector('#nuestro-juego .seccion__titulo');
  if (!titulo) return;
  var raiz = document.documentElement;

  function medir() {
    raiz.style.setProperty('--alto-titulo-juego', titulo.offsetHeight + 'px');
  }

  medir();

  // Cambia al girar el móvil, redimensionar o cambiar de idioma (el texto del título cambia)
  if ('ResizeObserver' in window) {
    new ResizeObserver(medir).observe(titulo);
  } else {
    window.addEventListener('resize', medir);
  }

  // Al cargar las tipografías el título puede cambiar de línea
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);
})();
