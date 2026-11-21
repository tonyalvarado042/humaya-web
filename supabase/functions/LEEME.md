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

## La llave de estadía (21 de noviembre de 2026)

Tony: *«si ya la villa está ocupada y tienen los datos de la reservación, ¿no
es mejor que automáticamente, cuando le hace QR, ya venga con los datos
precargados?»*. Ahora sí: el QR del televisor lleva una llave que abre la
estadía sin que el huésped escriba nada.

**`llave.ts` está DOS VECES, a propósito.** `humaya-tv` la firma y
`humaya-entrada` la abre; son dos funciones desplegables y cada una viaja con
lo suyo. **Si se toca una, hay que tocar y desplegar las dos.** Si se separan,
las llaves dejan de abrir y el huésped ve «ese enlace ya no está abierto» sin
que nada se vea roto. `src/test/llaveDeEstadia.copias.test.ts` firma con una y
abre con la otra en cada `npm test`, justo para que eso no pase callado.

Lo que hay que saber:

- **Se firma con una llave derivada de `SUPABASE_SERVICE_ROLE_KEY`**, no con
  ella directamente (HMAC con la etiqueta `humaya.llave-estadia.v1`). No hay
  ningún secreto nuevo que configurar — y por lo mismo, **si algún día se rota
  la llave de servicio, las llaves de estadía vivas dejan de abrir**. Duran
  días, así que lo peor que pasa es que un huésped escriba su código.
- **No se guarda en ninguna tabla.** Es una afirmación firmada: «en la villa X
  está la reserva Y, hasta el día Z». Quien la abre NO le cree: vuelve a
  preguntarle a la base si esa reserva sigue en esa villa hoy. Por eso una
  reserva cancelada o movida deja de abrir en el acto, sin revocar nada.
  Comprobado en vivo con una reserva de prueba en el hotel demo: cancelarla
  dejó la misma llave en `llave_vencida` y el televisor dejó de firmarla.
- **Solo se firma si el huésped está AHORA** (`esta_ahora` de
  `humaya_tv_ocupacion`). Con la villa vacía la vista devuelve la reserva que
  sigue, y esa llave la tendría quien entre a limpiar.
- **El dominio del huésped sale de `humaya_dominios`**, no de una constante:
  el Worker del TV sirve a todos los hoteles. HUMAYA recibe
  `experience.stayhumaya.com` y el demo `guestexp.liderax10.com`, el del
  producto — que funciona porque con llave el hotel lo decide el servidor
  mirando de qué villa es, no el navegador mirando el dominio.
- **Orden de despliegue:** primero las funciones (el frontend viejo no manda
  llave y nada cambia para él), después la app, y de último el Worker del TV,
  que es el único que no publica solo.
