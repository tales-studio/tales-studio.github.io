/* Contacto en móvil y tablet: el formulario se pliega y un botón lo despliega.
   En escritorio el botón está oculto y el formulario siempre se ve.
   Sin JavaScript no se añade la clase "contacto--plegable", así que el formulario queda visible. */
(function () {
  var rejilla = document.querySelector('.contacto__rejilla');
  var boton = document.getElementById('contacto-desplegar');
  var formulario = document.getElementById('formulario-contacto');
  if (!rejilla || !boton || !formulario) return;

  rejilla.classList.add('contacto--plegable');

  function fijarEstado(abierto) {
    rejilla.classList.toggle('contacto--abierto', abierto);
    boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
  }

  fijarEstado(false);

  // ---- Envío del formulario (FormSubmit, vía fetch, sin recargar la página) ----
  var estado = document.getElementById('contacto-estado');
  var enviar = formulario.querySelector('button[type="submit"]');
  var CORREO = (formulario.getAttribute('action').match(/formsubmit\.co\/([^\/?#]+)/) || [])[1];
  var TEXTOS = {
    es: {
      enviando: 'Enviando…',
      ok: '¡Mensaje enviado! Te responderemos lo antes posible.',
      error: 'No se pudo enviar el mensaje. Inténtalo de nuevo o escríbenos a '
    },
    en: {
      enviando: 'Sending…',
      ok: 'Message sent! We will get back to you as soon as possible.',
      error: 'The message could not be sent. Please try again or email us at '
    }
  };
  var ultimo = null; // clave del último mensaje mostrado, para traducirlo si cambia el idioma

  function idioma() {
    return (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  }

  function mostrar(clave, tipo) {
    ultimo = clave;
    estado.hidden = false;
    estado.setAttribute('data-tipo', tipo);
    estado.textContent = TEXTOS[idioma()][clave] + (clave === 'error' ? CORREO : '');
  }

  document.addEventListener('idiomacambiado', function () {
    if (ultimo && !estado.hidden) mostrar(ultimo, estado.getAttribute('data-tipo'));
  });

  formulario.addEventListener('submit', function (e) {
    // Sin fetch o sin dirección de FormSubmit, se deja el envío normal del navegador
    if (!window.fetch || !CORREO) return;
    e.preventDefault();
    if (enviar.disabled) return;

    enviar.disabled = true;
    formulario.setAttribute('aria-busy', 'true');
    mostrar('enviando', 'info');

    fetch('https://formsubmit.co/ajax/' + CORREO, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(formulario)
    })
      .then(function (r) {
        return r.json().then(function (d) { return { ok: r.ok, datos: d }; });
      })
      .then(function (res) {
        if (!res.ok || String(res.datos.success) !== 'true') throw new Error('envio');
        formulario.reset();
        mostrar('ok', 'ok');
      })
      .catch(function () {
        mostrar('error', 'error');
      })
      .then(function () {
        enviar.disabled = false;
        formulario.removeAttribute('aria-busy');
      });
  });

  boton.addEventListener('click', function () {
    var abrir = boton.getAttribute('aria-expanded') !== 'true';
    fijarEstado(abrir);
    if (abrir) {
      // Lleva el formulario a la vista y pone el cursor en el primer campo
      var campo = formulario.querySelector('input, textarea');
      formulario.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      if (campo) campo.focus({ preventScroll: true });
    }
  });
})();
