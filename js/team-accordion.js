/* Equipo en móvil (≤ 560 px): cada credencial arranca plegada (foto, nombre y rol) y se despliega al tocarla
   para mostrar la descripción. Un botón «+» lo hace evidente, y los de todos los miembros laten hasta que se toca algo.
   En pantallas más anchas no hace nada: team.js sigue gestionando el efecto flotante con el ratón.
   Sin JavaScript no se añade "equipo__lista--plegable" y las fichas se ven completas, como siempre. */
(function () {
  var lista = document.querySelector('.equipo__lista');
  if (!lista) return;

  var movil = window.matchMedia('(max-width: 560px)');
  var miembros = Array.prototype.slice.call(lista.querySelectorAll('.miembro'));
  var textos = { es: ['Ver descripción', 'Ocultar descripción'], en: ['Show description', 'Hide description'] };
  var interactuado = false;

  function idioma() {
    return (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  }

  function pintar(miembro) {
    var boton = miembro.querySelector('.miembro__alternar');
    if (!boton) return;
    var abierto = miembro.classList.contains('miembro--abierto');
    var etiqueta = textos[idioma()][abierto ? 1 : 0];
    boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    boton.setAttribute('aria-label', etiqueta);
    boton.setAttribute('title', etiqueta);
  }

  function activar() {
    // Si team.js ya ha puesto el modo flotante (ratón y pantalla ancha), no se toca nada
    if (lista.classList.contains('equipo__lista--flotante')) return;
    lista.classList.add('equipo__lista--plegable');

    miembros.forEach(function (miembro, i) {
      var tarjeta = miembro.querySelector('.miembro__tarjeta');
      var detalle = miembro.querySelector('.miembro__detalle');
      if (!tarjeta || !detalle) return;

      if (!detalle.id) detalle.id = 'miembro-detalle-' + (i + 1);

      var boton = miembro.querySelector('.miembro__alternar');
      if (!boton) {
        boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'miembro__alternar';
        boton.setAttribute('aria-controls', detalle.id);
        tarjeta.appendChild(boton);
      }

      // El botón ya es el punto de foco: la tarjeta deja de ser un segundo punto de tabulación
      if (tarjeta.hasAttribute('tabindex')) {
        tarjeta.setAttribute('data-tabindex', tarjeta.getAttribute('tabindex'));
        tarjeta.removeAttribute('tabindex');
      }
      pintar(miembro);
    });

    // Todos los botones laten para invitar a tocar, hasta que la persona toca alguna credencial
    if (!interactuado) {
      Array.prototype.forEach.call(lista.querySelectorAll('.miembro__alternar'), function (b) {
        b.classList.add('miembro__alternar--invita');
      });
    }
  }

  function desactivar() {
    lista.classList.remove('equipo__lista--plegable');
    miembros.forEach(function (miembro) {
      miembro.classList.remove('miembro--abierto');
      var boton = miembro.querySelector('.miembro__alternar');
      if (boton) boton.parentNode.removeChild(boton);
      var tarjeta = miembro.querySelector('.miembro__tarjeta');
      if (tarjeta && tarjeta.hasAttribute('data-tabindex')) {
        tarjeta.setAttribute('tabindex', tarjeta.getAttribute('data-tabindex'));
        tarjeta.removeAttribute('data-tabindex');
      }
    });
  }

  function ajustar() {
    if (movil.matches) activar();
    else desactivar();
  }

  // Tocar cualquier parte de la credencial la despliega o la pliega
  lista.addEventListener('click', function (e) {
    if (!lista.classList.contains('equipo__lista--plegable')) return;
    var tarjeta = e.target.closest('.miembro__tarjeta');
    if (!tarjeta) return;
    var miembro = tarjeta.closest('.miembro');

    miembro.classList.toggle('miembro--abierto');
    pintar(miembro);

    if (!interactuado) {
      interactuado = true;
      Array.prototype.forEach.call(lista.querySelectorAll('.miembro__alternar--invita'), function (b) {
        b.classList.remove('miembro__alternar--invita');
      });
    }

    // Si la descripción queda cortada por abajo, se lleva a la vista cuando termina la animación
    if (miembro.classList.contains('miembro--abierto')) {
      setTimeout(function () {
        if (tarjeta.getBoundingClientRect().bottom > window.innerHeight) {
          tarjeta.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 320);
    }
  });

  if (movil.addEventListener) movil.addEventListener('change', ajustar);
  else movil.addListener(ajustar);

  // Etiquetas de los botones en el idioma elegido
  new MutationObserver(function () {
    miembros.forEach(pintar);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  ajustar();
})();
