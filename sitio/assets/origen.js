/* ─────────────────────────────────────────────────────────────────────────
   HUMAYA · DE DONDE VIENE ESTA VISITA

   Tony, 11 de noviembre de 2026: «hay manera que las solicitudes de reserva
   del form vengan con ip de donde viene esta visita si google etc?».

   La IP ya la guardaba el servidor desde agosto (la lee de la cabecera
   cf-connecting-ip, que el navegador NO puede ver ni falsear). Lo que no
   existia es esto: de donde venia la persona. Eso solo lo sabe el navegador,
   y solo en la PRIMERA pagina de la visita.

   ⚠️ Por que se graba una sola vez por visita:
   si alguien entra por Google a /bienestar/ y despues navega a la portada
   para llenar el formulario, en esa segunda pagina document.referrer ya dice
   «stayhumaya.com» y los ?utm_ se perdieron en el camino. Leer el origen en
   el momento de enviar el formulario diria «vino de mi propio sitio» en casi
   todos los casos reales. Por eso se graba al entrar, se guarda en
   sessionStorage y no se vuelve a tocar hasta que la persona cierre la pesta.

   El pais sale de /cdn-cgi/trace, que es de Cloudflare y lo sirve el propio
   stayhumaya.com: no se le manda la IP de nadie a terceros. Supabase no pasa
   cabeceras de geo a las Edge Functions — se comprobo, solo llega la IP —,
   asi que el pais tiene que venir por aqui.

   Nada de esto puede frenar un envio: todo va en try/catch y el formulario
   funciona igual si este archivo no carga, si el almacenamiento esta
   bloqueado o si el trace no contesta.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var LLAVE = "humaya.origen";

  /* sessionStorage tira excepcion en modo privado y con las cookies
     bloqueadas. Nunca debe tumbar la pagina. */
  function leer() {
    try { return JSON.parse(sessionStorage.getItem(LLAVE) || "null"); }
    catch (e) { return null; }
  }
  function guardar(dato) {
    try { sessionStorage.setItem(LLAVE, JSON.stringify(dato)); } catch (e) {}
  }

  function deLaCasa(url) {
    try {
      var h = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
      return h === location.hostname.replace(/^www\./, "").toLowerCase() ||
             h === "stayhumaya.com" || /\.stayhumaya\.com$/.test(h);
    } catch (e) { return false; }
  }

  /* Los buscadores y las redes primero por host; las IA antes que Google
     porque gemini.google.com tambien es google.* y no es una busqueda. */
  var CASAS = [
    [/^chatgpt\.com$|^chat\.openai\.com$/, "ChatGPT"],
    [/^gemini\.google\.com$/,              "Gemini"],
    [/^claude\.ai$/,                       "Claude"],
    [/(^|\.)perplexity\.ai$/,              "Perplexity"],
    [/(^|\.)copilot\.microsoft\.com$/,     "Copilot"],
    [/(^|\.)google\./,                     "Google (búsqueda)"],
    [/(^|\.)bing\.com$/,                   "Bing"],
    [/(^|\.)duckduckgo\.com$/,             "DuckDuckGo"],
    [/(^|\.)ecosia\.org$/,                 "Ecosia"],
    [/(^|\.)yahoo\./,                      "Yahoo"],
    [/(^|\.)yandex\./,                     "Yandex"],
    [/(^|\.)instagram\.com$/,              "Instagram"],
    [/(^|\.)facebook\.com$|^l\.facebook\.com$|^lm\.facebook\.com$/, "Facebook"],
    [/(^|\.)tiktok\.com$/,                 "TikTok"],
    [/^t\.co$|(^|\.)twitter\.com$|(^|\.)x\.com$/, "X / Twitter"],
    [/(^|\.)youtube\.com$|^youtu\.be$/,    "YouTube"],
    [/(^|\.)linkedin\.com$|^lnkd\.in$/,    "LinkedIn"],
    [/(^|\.)pinterest\./,                  "Pinterest"],
    [/(^|\.)reddit\.com$/,                 "Reddit"],
    [/(^|\.)whatsapp\.com$|^wa\.me$/,      "WhatsApp"],
    [/^t\.me$|(^|\.)telegram\./,           "Telegram"],
    [/(^|\.)tripadvisor\./,                "TripAdvisor"],
    [/(^|\.)booking\.com$/,                "Booking.com"],
    [/(^|\.)airbnb\./,                     "Airbnb"],
    [/(^|\.)expedia\./,                    "Expedia"]
  ];

  /* El canal es la linea que Tony va a LEER en el correo. «Google Ads» y
     «Google (busqueda)» se cobran distinto y se trabajan distinto, asi que
     no pueden salir iguales. El gclid solo lo pone Google Ads al hacer
     clic en un anuncio. */
  function canalDe(ref, p) {
    if (p.gclid) return "Google Ads";
    if (p.msclkid) return "Microsoft Ads";
    if (p.fbclid) return "Meta (anuncio)";
    if (p.utm_source) {
      var pagado = /cpc|ppc|paid|ads/i.test(p.utm_medium || "");
      return p.utm_source + (p.utm_medium ? " · " + p.utm_medium : "") +
             (pagado ? "" : "");
    }
    if (!ref) return "Directo";
    var h;
    try { h = new URL(ref).hostname.replace(/^www\./, "").toLowerCase(); }
    catch (e) { return "Directo"; }
    for (var i = 0; i < CASAS.length; i++) {
      if (CASAS[i][0].test(h)) return CASAS[i][1];
    }
    return h;
  }

  /* El primer toque de la visita. Se calcula una sola vez. */
  function primerToque() {
    var ya = leer();
    if (ya && ya.canal) return ya;

    var q = new URLSearchParams(location.search);
    var p = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
     "gclid", "fbclid", "msclkid"].forEach(function (k) {
      var v = (q.get(k) || "").trim().slice(0, 200);
      if (v) p[k] = v;
    });

    var ref = document.referrer || "";
    if (ref && deLaCasa(ref)) ref = "";

    var dato = {
      canal: canalDe(ref, p),
      referrer: ref.slice(0, 300),
      landing: (location.pathname + location.search).slice(0, 300),
      visto: new Date().toISOString()
    };
    Object.keys(p).forEach(function (k) { dato[k] = p[k]; });

    guardar(dato);
    return dato;
  }

  /* El pais, del propio Cloudflare de stayhumaya.com. Una vez por visita. */
  function pedirPais() {
    var dato = leer();
    if (!dato || dato.pais || dato.paisPedido) return;
    dato.paisPedido = true;           /* para no reintentar en cada pagina */
    guardar(dato);

    var corte = null;
    try {
      var ctrl = new AbortController();
      corte = setTimeout(function () { ctrl.abort(); }, 2500);
      fetch("/cdn-cgi/trace", { signal: ctrl.signal, cache: "no-store" })
        .then(function (r) { return r.ok ? r.text() : ""; })
        .then(function (txt) {
          var m = /(?:^|\n)loc=([A-Z]{2})/.exec(txt || "");
          if (!m) return;
          var d = leer() || {};
          d.pais = m[1];
          guardar(d);
        })
        .catch(function () {})
        .finally(function () { if (corte) clearTimeout(corte); });
    } catch (e) { if (corte) clearTimeout(corte); }
  }

  try {
    primerToque();
    pedirPais();
  } catch (e) { /* jamas debe romper la pagina */ }

  /* Lo que lee el formulario al enviar. */
  window.humayaOrigen = function () {
    try {
      var d = leer();
      if (!d) return null;
      var salida = {};
      Object.keys(d).forEach(function (k) {
        if (k !== "paisPedido" && d[k]) salida[k] = d[k];
      });
      return Object.keys(salida).length ? salida : null;
    } catch (e) { return null; }
  };
})();
