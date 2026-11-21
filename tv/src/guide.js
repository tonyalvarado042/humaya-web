// The guest's phone page (the QR on the TV): Wi-Fi, stay, house guide and local picks. English, for guests.
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const t12 = (hhmm) => { const [h, m] = String(hhmm || "0:00").split(":").map(Number); return (h % 12 || 12) + (m ? ":" + String(m).padStart(2, "0") : "") + (h < 12 ? "am" : "pm"); };
const day = (iso) => iso ? new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }) : "";

/**
 * `llave` es la llave de estadia que venia en la direccion del QR, o null.
 *
 * Con ella el boton entra directo: la villa esta ocupada y la pantalla ya
 * sabe por quien, asi que pedirle el codigo de Airbnb al que esta durmiendo
 * adentro es friccion y nada mas. Sin ella —villa vacia, o una foto vieja
 * del televisor— el boton lleva al formulario de siempre.
 */
export function guidePage(S, llave) {
  const st = S.stay || {};
  const hero = (S.photos && S.photos.hero) || "";
  const section = (title, body) => body ? `<section><h2>${esc(title)}</h2>${body}</section>` : "";
  const items = (list) => (list || []).map((x) => `<details><summary>${esc(x.title)}</summary><p>${esc(x.body)}</p></details>`).join("");
  const wifi = S.wifi ? `<div class="card wifi"><div class="k">Wi-Fi</div><div class="row"><span>Network</span><b>${esc(S.wifi.ssid)}</b></div>
    <div class="row"><span>Password</span><b id="pw">${esc(S.wifi.password)}</b></div>
    <button onclick="navigator.clipboard&&navigator.clipboard.writeText(document.getElementById('pw').textContent).then(function(){this.textContent='Copied'}.bind(this))">Copy password</button></div>` : "";
  const stay = st.active ? `<div class="card"><div class="k">Your stay</div><div class="row"><span>Check-in</span><b>${day(st.from)} · ${t12(S.checkin)}</b></div>
    <div class="row"><span>Check-out</span><b>${day(st.to)} · ${t12(S.checkout_time)}</b></div></div>` :
    `<div class="card"><div class="row"><span>Check-in</span><b>from ${t12(S.checkin)}</b></div><div class="row"><span>Check-out</span><b>by ${t12(S.checkout_time)}</b></div></div>`;
  const local = (S.local || []).map((c) => `<h3>${esc(c.category)}</h3>` + (c.items || []).map((i) =>
    `<div class="place"><div><b>${esc(i.name)}</b><p>${esc(i.note)}</p></div><span>${esc(i.distance || "")}</span></div>`).join("")).join("");
  const steps = (S.checkout && S.checkout.steps || []).map((x) => `<li>${esc(x)}</li>`).join("");
  // La puerta de la app. El dominio viene de la base porque este Worker
  // sirve los televisores de todos los hoteles; antes estaba escrito el de
  // HUMAYA y el segundo hotel habria mandado a sus huespedes al primero.
  const casa = S.dominio_huesped || "experience.stayhumaya.com";
  const puerta = `https://${casa}/entrada` +
    (llave ? `?s=${encodeURIComponent(llave)}` : "");
  const sos = (S.emergency || []).map((e) => `<a class="sos" href="tel:${esc(e.phone)}">${esc(e.name)} <b>${esc(e.phone)}</b></a>`).join("");
  const notes = items(S.notes);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(S.name)} · Guest guide</title>
<link rel="preload" href="/tv/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<style>
@font-face{font-family:Inter;src:url(/tv/fonts/inter-latin-wght-normal.woff2) format("woff2");font-weight:100 900}
*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,sans-serif;background:#f6f1ea;color:#2b2520;-webkit-font-smoothing:antialiased}
header{position:relative;height:300px;background:#3a2f26 url(/tv/homes/${esc(hero)}.jpg) center/cover;color:#fff;display:flex;align-items:flex-end;padding:24px}
header:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.6))}
header div{position:relative}header small{letter-spacing:.3em;font-size:12px;opacity:.85}header h1{margin:6px 0 0;font-size:30px;font-weight:600;letter-spacing:-.01em}
main{max-width:640px;margin:0 auto;padding:16px 18px 48px}
.card{background:#fff;border-radius:18px;padding:18px;margin:14px 0;box-shadow:0 1px 3px rgba(60,40,20,.06)}
.k{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#9a7b5c;margin-bottom:8px}
.row{display:flex;justify-content:space-between;gap:12px;padding:6px 0;font-size:15px}.row span{color:#7d7064}.row b{text-align:right;word-break:break-all}
button{margin-top:10px;width:100%;border:0;border-radius:12px;padding:13px;background:#2b2520;color:#fff;font:600 15px Inter,system-ui}
section{margin-top:26px}h2{font-size:20px;margin:0 0 10px}h3{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#9a7b5c;margin:18px 0 6px}
p.lead{font-size:16px;line-height:1.55;color:#4a4038}
details{background:#fff;border-radius:14px;margin:8px 0;padding:14px 16px}summary{font-weight:600;cursor:pointer}details p{margin:8px 0 0;line-height:1.5;color:#4a4038}
.place{display:flex;justify-content:space-between;gap:12px;background:#fff;border-radius:14px;padding:14px 16px;margin:8px 0}.place p{margin:4px 0 0;font-size:14px;color:#6b5f55;line-height:1.45}.place span{font-size:12px;color:#9a7b5c;white-space:nowrap}
ol{background:#fff;border-radius:14px;padding:14px 16px 14px 36px;line-height:1.8;margin:0}
.sos{display:flex;justify-content:space-between;background:#fff;border-radius:14px;padding:14px 16px;margin:8px 0;color:#9b2c1f;text-decoration:none}
.exp p{margin:8px 0 0;line-height:1.55;color:#4a4038;font-size:15px}.exp .lead{font-size:17px;color:#2b2520;margin-top:2px}.btn{display:block;margin-top:14px;border-radius:12px;padding:13px;background:#2b2520;color:#fff;font:600 15px Inter,system-ui;text-align:center;text-decoration:none}.pie{display:block;text-align:center;margin-top:8px;color:#9a7b5c;font-size:12px}
footer{text-align:center;color:#a99a8c;font-size:12px;margin-top:30px;letter-spacing:.2em}
</style></head><body>
<header><div><small>${esc(S.name)}</small><h1>${st.active && st.guest ? "Welcome, " + esc(st.guest) : "Welcome to " + esc(S.name)}</h1></div></header>
<main>
<div class="card exp">
  <div class="k">HUMAYA Experience</div>
  <p class="lead">Your stay, on the television and here on your phone.</p>
  <p>It is not here to replace anyone. It is here so that when we talk, we already
     know what you need: the Wi-Fi, your villa, what is worth doing nearby and how
     to reach us, all within reach — so that nothing gets between you and being here.</p>
  <p><b>Whatever you ask, a person answers.</b></p>
  <a class="btn" href="${esc(puerta)}">${llave ? "Open my stay" : "Find my stay"}</a>
  <small class="pie">${llave
    ? "Nothing to type: this screen is in your villa."
    : "Your last name and your booking code, once."}</small>
</div>
${wifi}${stay}
${S.welcome ? `<p class="lead">${esc(S.welcome)}</p>` : ""}
${section("From " + (S.host || "your host"), notes)}
${section("How things work", items(S.howto))}
${section("House rules", items(S.rules))}
${section("Around here", local)}
${section("Check-out by " + t12(S.checkout_time), steps ? `<ol>${steps}</ol>` : "")}
${section("Emergency", sos)}
<footer>HUMAYA EXPERIENCE · ${esc(S.name)} · COSTA RICA</footer>
</main></body></html>`;
}
