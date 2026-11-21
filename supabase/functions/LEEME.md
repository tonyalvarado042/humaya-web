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

## ⚠️ `verify_jwt` se manda SIEMPRE, y en estas cuatro va en `false`

La herramienta de despliegue lo pone en `true` si no se manda. El 21 de
noviembre de 2026 se desplegó `humaya-tv` sin el parámetro y **todas las
pantallas del hotel quedaron en 401 durante 75 segundos**: el televisor no
tiene cuenta y no manda `Authorization`. Lo mismo vale para las otras tres: el
huésped entra por código de confirmación, no tiene sesión.

Cada una decide adentro qué pide sesión y qué no — por eso `verify_jwt` va en
`false` y la puerta está en el código, no en la plataforma.

## Las dos fugas que se encontraron al traerlas, y cómo quedaron

**`humaya-tv` tenía el uuid de HUMAYA escrito adentro.** El televisor de
cualquier otro hotel leía la guía de la casa, las reglas, los teléfonos de
emergencia y el huso horario de HUMAYA, y la lista de villas para cambiar de
pantalla incluía las de los otros. El hotel demo ya tiene dos pantallas, así
que estaba viva.

**Arreglado (v5):** el hotel sale de la VILLA, que es lo único que el televisor
manda. `humaya_tv_villas` tiene el id como clave primaria, así que una villa
pertenece a un solo hotel. Comprobado en vivo: el demo recibe sus 2 villas y su
guía de 0 reglas; HUMAYA sus 10 y sus 5 reglas.

De paso, la función ahora devuelve `clima` —de `humaya_tv_ajustes`, por
hotel—, porque el Worker lo tenía escrito a mano en La Fortuna. Y `ocupacion`,
que dice si quien aparece en pantalla salió de una reserva o de lo que alguien
escribió a mano.

**`humaya-entrada` recibía el hotel y no lo usaba.** Un código de HUMAYA
entraba desde el `/entrada` de otro hotel y devolvía el nombre y las fechas de
ese huésped.

**Arreglado:** la búsqueda filtra por `negocio_id`, resuelto del código igual
que en `humaya-admin`. Sin hotel contesta `400 falta_hotel`. Se desplegó
DESPUÉS de que el frontend que manda el hotel estuviera en vivo, para no
romper el check-in de nadie en el medio. Y su lista de CORS —escrita a mano—
dejaba fuera `staff.stayhumaya.com` y los dominios del producto; ahora es la
misma expresión que usa `humaya-admin`.
