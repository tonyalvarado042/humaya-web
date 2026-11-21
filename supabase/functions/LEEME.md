# Las funciones de Supabase

Las cuatro funciones del Método Humaya. **Esta carpeta es la copia del código
que está desplegado**, traída desde Supabase el 21 de noviembre de 2026, con
las versiones que había ese día:

| Función | Versión | Qué hace | Pide sesión |
| --- | --- | --- | --- |
| `humaya-concierge` | 11 | El bot que contesta de noche, y la bandeja de recepción | Solo `?staff=1` |
| `humaya-admin` | 5 | Opciones del menú y catálogo de servicios | Solo para cambiar |
| `humaya-entrada` | 2 | `/entrada`: encontrar la reserva por código + apellido | No |
| `humaya-tv` | 2 | El estado que pinta el televisor de cada villa | No (clave en la URL) |

## ⚠️ Un push a `main` NO las publica

En este repositorio **todo lo demás sí**: la landing es Cloudflare Pages y la
app es el Worker `humaya-experience`, y las dos salen al aire con el push. Las
funciones de Supabase **no**. Commitear acá no cambia nada de lo que está
corriendo.

Se publican a mano, una por una:

```powershell
npx supabase functions deploy humaya-admin --project-ref mlhhhwbgymobcxiklnoz
```

Hace falta `SUPABASE_ACCESS_TOKEN` en el entorno (o `npx supabase login`).
**El token no va en el repositorio.**

Las cuatro corren con `verify_jwt: false` y adentro deciden ellas qué pide
sesión y qué no — por eso el huésped, que no tiene cuenta, puede llamarlas.

## Por qué están acá

Hasta hoy el código vivía **solo en Supabase**. Si alguien borraba una función
o pisaba una versión, no había de dónde sacarla: no hay historia, no hay
`git log`, no hay diff. Ahora sí.

Única diferencia con lo desplegado: en `humaya-entrada`, el rango de tildes de
`plano()` está escrito como `[̀-ͯ]` en vez de con los caracteres
combinantes literales. Son los mismos codepoints; así se puede leer.

⚠️ **Estas copias no pasaron por un compilador.** En la máquina donde se
trajeron no hay Deno instalado: se comprobó que estuvieran completas (sin
cortes, llaves y paréntesis balanceados) y nada más. La que vale es la que
está corriendo en Supabase. Antes de desplegar **desde acá**, correr:

```powershell
deno check supabase/functions/humaya-admin/index.ts
```

## Dos cosas que hay que decidir, encontradas al traerlas

**`humaya-tv` es de un solo hotel.** Tiene el uuid de HUMAYA escrito adentro:

```ts
const NEGOCIO = "4cb80ad6-1004-4d06-9dfb-946a1718be87";
```

Con eso, el televisor de cualquier hotel leería la guía de la casa, las reglas,
los teléfonos de emergencia y el `utc_offset` **de HUMAYA**. Y la lista de
villas que el TV ofrece para cambiar de pantalla (`homes`) se arma sin filtro
de hotel: incluiría las villas de los otros. Hoy solo HUMAYA tiene pantallas,
así que no se ve; con el segundo hotel, sí.

**`humaya-entrada` recibe el hotel y no lo usa.** Lee `body.hotel`, y la
búsqueda en `humaya_cloudbeds_reservas` no lo filtra: un código de HUMAYA
entraría desde el `/entrada` de otro hotel y devolvería el nombre y las fechas
de ese huésped. El `hotel` solo vuelve en la respuesta de «no encontrada».

Las dos son el mismo error que ya apareció en `humaya-concierge` el 20 de
noviembre y en los interruptores de Admin el 21: **una consulta sin filtro
devuelve las filas de los dos hoteles, y con un solo hotel devolvía lo correcto
por casualidad.** Arreglarlas pide desplegar la función y, en el caso del TV,
también el Worker de `tv/` — así que se hace a propósito y verificando, no de
pasada.
