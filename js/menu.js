/* Menú hamburguesa en móvil y tablet (≤ 1199 px): el botón abre y cierra el panel con los enlaces.
   En escritorio el botón no se ve y el menú funciona como siempre.
   Sin JavaScript no se añade "cabecera-principal--menu-js" y el menú móvil sigue siendo el de desplazamiento lateral. */
(function () {
  var cabecera = document.querySelector('.cabecera-principal');
  var boton = document.getElementById('boton-menu');
  var lista = document.getElementById('menu-navegacion');
  if (!cabecera || !boton || !lista) return;

  var CLASE_JS = 'cabecera-principal--menu-js';
  var CLASE_ABIERTO = 'cabecera-principal--menu-abierto';
  var movil = window.matchMedia('(max-width: 1199px)'); // mismo corte que styles.css (hamburguesa en móvil y tablet)
  var textos = { es: ['Abrir menú', 'Cerrar menú'], en: ['Open menu', 'Close menu'] };

  function idioma() {
    return (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  }

  function estaAbierto() {
    return cabecera.classList.contains(CLASE_ABIERTO);
  }

  function pintar() {
    var abierto = estaAbierto();
    var etiqueta = textos[idioma()][abierto ? 1 : 0];
    boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    boton.setAttribute('aria-label', etiqueta);
    boton.setAttribute('title', etiqueta);
  }

  function fijar(abierto) {
    cabecera.classList.toggle(CLASE_ABIERTO, abierto);
    pintar();
  }

  cabecera.classList.add(CLASE_JS);
  fijar(false);

  boton.addEventListener('click', function () {
    fijar(!estaAbierto());
  });

  // Al elegir un enlace (sección, demo o logo) el panel se cierra
  lista.addEventListener('click', function (e) {
    var enlace = e.target.closest('a');
    if (!enlace) return;
    fijar(false);
    enlace.blur(); // el enlace tocado no se queda con el foco ni el resaltado
  });

  // Tocar fuera de la cabecera o el velo oscuro (que cuelga de la propia cabecera) lo cierra
  document.addEventListener('click', function (e) {
    if (estaAbierto() && (e.target === cabecera || !cabecera.contains(e.target))) fijar(false);
  });

  // Escape lo cierra y devuelve el foco al botón
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && estaAbierto()) {
      fijar(false);
      boton.focus();
    }
  });

  // Al pasar a escritorio (o girar el móvil) se cierra
  function alCambiarVista() {
    if (!movil.matches) fijar(false);
  }
  if (movil.addEventListener) movil.addEventListener('change', alCambiarVista);
  else movil.addListener(alCambiarVista);

  // Mantiene la etiqueta del botón en el idioma elegido
  new MutationObserver(pintar).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
