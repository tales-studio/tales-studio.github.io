// Selector de idioma ES / EN: solo lógica. Los textos están en translations.js, que debe
// cargarse antes. Lo que no esté en el diccionario (nombres, [marcadores], código) se
// deja tal cual. Al cambiar de idioma se dispara el evento «idiomacambiado» en document,
// que otros módulos (carousel.js) escuchan para actualizar sus propios textos.
(function () {
  var CLAVE = 'shift-happens-idioma';
  var boton = document.getElementById('selector-idioma');
  if (!boton) { return; }

  var EN = TRADUCCIONES.en;

  var REGLAS = TRADUCCIONES.reglas;

  var META_ES = TRADUCCIONES.metaDescripcion.es;
  var META_EN = TRADUCCIONES.metaDescripcion.en;

  function traducir(texto) {
    var limpio = texto.replace(/\s+/g, ' ').trim();
    if (Object.prototype.hasOwnProperty.call(EN, limpio)) { return EN[limpio]; }
    for (var i = 0; i < REGLAS.length; i++) {
      if (REGLAS[i][0].test(limpio)) { return limpio.replace(REGLAS[i][0], REGLAS[i][1]); }
    }
    return null;
  }

  // Guardamos el original en español de cada texto y atributo traducible
  var textos = [];
  var atributos = [];
  var ATRIBUTOS = ['alt', 'aria-label', 'title', 'aria-roledescription', 'data-label'];

  var recorrido = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: function (n) {
      if (!n.nodeValue.trim()) { return NodeFilter.FILTER_REJECT; }
      var padre = n.parentNode;
      if (padre.closest && padre.closest('script, style, noscript, pre, code')) { return NodeFilter.FILTER_REJECT; }
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  while (recorrido.nextNode()) {
    var n = recorrido.currentNode;
    var en = traducir(n.nodeValue);
    if (en !== null) { textos.push({ nodo: n, es: n.nodeValue, en: en }); }
  }

  Array.prototype.forEach.call(
    document.querySelectorAll('[alt], [aria-label], [title], [aria-roledescription], [data-label]'),
    function (el) {
      if (el.classList.contains('carrusel__punto')) { return; } // sus etiquetas las gestiona el carrusel
      ATRIBUTOS.forEach(function (a) {
        if (!el.hasAttribute(a)) { return; }
        var es = el.getAttribute(a);
        var en = traducir(es);
        if (en !== null) { atributos.push({ el: el, attr: a, es: es, en: en }); }
      });
    }
  );

  var meta = document.querySelector('meta[name="description"]');

  function aplicar(idioma) {
    var ingles = idioma === 'en';
    textos.forEach(function (t) {
      var ini = t.es.match(/^\s*/)[0];
      var fin = t.es.match(/\s*$/)[0];
      t.nodo.nodeValue = ingles ? ini + t.en + fin : t.es;
    });
    atributos.forEach(function (a) { a.el.setAttribute(a.attr, ingles ? a.en : a.es); });
    if (meta) { meta.setAttribute('content', ingles ? META_EN : META_ES); }
    document.documentElement.lang = ingles ? 'en' : 'es';
    try { localStorage.setItem(CLAVE, ingles ? 'en' : 'es'); } catch (e) {}
    document.dispatchEvent(new Event('idiomacambiado'));
  }

  boton.addEventListener('click', function () {
    aplicar(document.documentElement.lang === 'en' ? 'es' : 'en');
  });

  var guardado = null;
  try { guardado = localStorage.getItem(CLAVE); } catch (e) {}
  if (guardado === 'en') { aplicar('en'); }
})();