// stayhumaya.com — control: ¿cada página trae SU idioma de fábrica?
//
//   node bin/cada-pagina-dice-su-idioma.js
//   node bin/cada-pagina-dice-su-idioma.js --probarme
//
// ── POR QUE EXISTE ─────────────────────────────────────────────────────
// Hasta la 1.7.9, las cuatro portadas traían el mismo bloque de opciones en
// el campo «Idioma preferido» del formulario de reservas:
//
//   <option value="es">Español</option><option value="en">English</option>
//
// `es` primero y sin `selected`, así que el navegador la elegía sola — **en
// las cuatro**. Alguien que entraba a `/en/`, leía en inglés, escribía en
// inglés y no abría ese menú, dejaba su reserva marcada `lang = "es"`.
//
// Medido el 22 de noviembre de 2026 sobre las 32 filas de
// `booking_requests`: de las 11 marcadas `es`, **tres estaban escritas en
// inglés**. El CRM contestaba en español a gente que escribió en inglés.
//
// ⚠️ Esto NO daba error en ninguna parte. El formulario guardaba, la función
// contestaba, el correo salía. Simplemente salía en el idioma equivocado.
// Por eso hace falta un control: lo que falla callado no se arregla solo.
//
// ── Y LA VERSION ───────────────────────────────────────────────────────
// De paso comprueba que las 20 páginas lleven la misma `humaya-version`.
// Ya pasó dos veces que se desalinearan (ver la 1.7.2 en DESPLIEGUES.md), y
// una versión que miente hace que el registro de despliegues mienta también.

const fs = require("fs");
const path = require("path");

/** Las cuatro portadas con formulario, y el idioma que le toca a cada una. */
const PORTADAS = {
  "sitio/index.html": "es",
  "sitio/en/index.html": "en",
  "sitio/de/index.html": "de",
  "sitio/fr/index.html": "fr",
};

/**
 * Qué `<option>` del campo «Idioma preferido» viene marcada.
 *
 * Devuelve el código, `null` si ninguna (que es el bug), o `"varias"` si hay
 * más de una — un `<select>` con dos `selected` se queda con la última y es
 * aún más difícil de ver leyendo.
 */
function deFabrica(html) {
  const sel = /<select name="idioma">([\s\S]*?)<\/select>/.exec(html);
  if (!sel) return "sin-campo";
  const marcadas = [...sel[1].matchAll(/<option value="([a-z]{2})"([^>]*)>/g)]
    .filter((m) => /\bselected\b/.test(m[2]))
    .map((m) => m[1]);
  if (marcadas.length === 0) return null;
  if (marcadas.length > 1) return "varias";
  return marcadas[0];
}

/** La versión estampada en el HTML. */
function version(html) {
  const m = /<meta name="humaya-version" content="([^"]*)"/.exec(html);
  return m ? m[1] : null;
}

// ── La autoprueba ────────────────────────────────────────────────────────
// ⚠️ Un control que solo se corre cuando pasa no prueba nada. El primer caso
// es el bug real, copiado de la 1.7.9.
const CASOS = [
  ["el bug de la 1.7.9: ninguna marcada",
   '<select name="idioma"><option value="es">Español</option><option value="en">English</option></select>',
   null],
  ["arreglada para inglés",
   '<select name="idioma"><option value="es">Español</option><option value="en" selected>English</option></select>',
   "en"],
  ["arreglada para español",
   '<select name="idioma"><option value="es" selected>Español</option><option value="en">English</option></select>',
   "es"],
  ["dos marcadas también es un problema",
   '<select name="idioma"><option value="es" selected>Español</option><option value="en" selected>English</option></select>',
   "varias"],
  ["sin el campo",
   "<form><input name=\"email\"></form>",
   "sin-campo"],
  ["no se confunde con OTRO select que tenga selected",
   '<select name="personas"><option value="2" selected>2</option></select>' +
   '<select name="idioma"><option value="de" selected>Deutsch</option></select>',
   "de"],
];

function probarme() {
  let malo = 0;
  for (const [titulo, html, esperado] of CASOS) {
    const visto = deFabrica(html);
    const bien = visto === esperado;
    console.log(`${bien ? "✓" : "✖"} ${titulo}`);
    if (!bien) { console.log(`    esperaba ${JSON.stringify(esperado)} y vio ${JSON.stringify(visto)}`); malo++; }
  }
  // Y la versión.
  const v = version('<meta name="humaya-version" content="1.7.10">');
  if (v !== "1.7.10") { console.log("✖ no lee la versión"); malo++; }
  else console.log("✓ lee la versión del HTML");

  console.log(malo
    ? `\n✖ el control no sirve: ${malo} caso(s) mal`
    : `\n✓ los ${CASOS.length + 1} casos bien — agarra el bug y no se confunde`);
  return malo ? 1 : 0;
}

if (process.argv.includes("--probarme")) process.exit(probarme());

// ── Sobre el sitio de verdad ─────────────────────────────────────────────
let problemas = 0;

for (const [ruta, suyo] of Object.entries(PORTADAS)) {
  if (!fs.existsSync(ruta)) {
    console.log(`✖ falta ${ruta}`);
    problemas++;
    continue;
  }
  const visto = deFabrica(fs.readFileSync(ruta, "utf8"));
  if (visto === suyo) {
    console.log(`✓ ${ruta.padEnd(22)} viene en «${suyo}», que es el suyo`);
  } else {
    const porque = visto === null
      ? "no hay ninguna marcada, así que el navegador elige la primera (es)"
      : visto === "varias" ? "hay más de una marcada"
      : visto === "sin-campo" ? "no encontré el campo «Idioma preferido»"
      : `viene en «${visto}»`;
    console.log(`✖ ${ruta.padEnd(22)} ${porque} — tendría que venir en «${suyo}»`);
    problemas++;
  }
}

// Todas las páginas con la misma versión.
const paginas = [];
(function juntar(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) juntar(p);
    else if (e.name.endsWith(".html")) paginas.push(p);
  }
})("sitio");

const porVersion = new Map();
for (const p of paginas) {
  const v = version(fs.readFileSync(p, "utf8"));
  if (!v) continue;
  if (!porVersion.has(v)) porVersion.set(v, []);
  porVersion.get(v).push(p);
}

// ⚠️ `reservar.html` lleva su propia numeración desde la 1.4.4 y eso está en
// DESPLIEGUES.md: no es un error, es a propósito.
const APARTE = new Set(["sitio/reservar.html", "sitio\\reservar.html"]);
const lineas = [...porVersion.entries()]
  .filter(([, l]) => !(l.length === 1 && APARTE.has(l[0])));

console.log();
if (lineas.length === 1) {
  console.log(`✓ las ${lineas[0][1].length} páginas van en la ${lineas[0][0]}`);
} else {
  console.log("✖ las páginas no llevan la misma versión:");
  for (const [v, l] of lineas) console.log(`    ${v} → ${l.length} página(s): ${l.slice(0, 3).join(", ")}${l.length > 3 ? "…" : ""}`);
  problemas++;
}

console.log(problemas
  ? `\n✖ ${problemas} problema(s). Esto sale al aire con el próximo push.`
  : "\n✓ todo bien");
process.exit(problemas ? 1 : 0);
