# Feedback de Anthony

Dónde se anota lo que diga Anthony al ver la demo, y las decisiones que hay que confirmarle.

Cómo se usa: se escribe acá sin filtrar durante la reunión, después se clasifica en la tabla de
triage, y lo que entra se convierte en tarea de la fase que corresponda en `docs/PLAN.md`.

Estado del proyecto y qué se construyó en cada fase: `docs/ESTADO.md`.

---

## 1. Decisiones que tomé solo y conviene confirmarle

Cosas que el prototipo no resolvía o que se contradecían. Están implementadas de una manera concreta;
si Anthony prefiere otra, es trabajo acotado.

| #   | Decisión                                                                                                                                                                                                  | Dónde se ve                 | Confirmado |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ---------- |
| 1   | Tres tonos se apartan del prototipo para llegar a contraste AA: el dorado de recepción, el gris secundario y los deshabilitados. Cambios mínimos de luminosidad, mismo tono.                              | Todo el dashboard           | ☐          |
| 2   | Inventé 5 huéspedes más (Beltrán, Zamora, Farah, Lima, Lindqvist) porque el tablero decía "8 de 10 ocupadas" y esas personas no existían.                                                                 | Llegadas, tablero de villas | ☐          |
| 3   | Dos turnos de spa del 15 de noviembre estaban asignados a huéspedes que todavía no habían llegado. Los pasé a gente que ya estaba en casa.                                                                | Agenda de Spa               | ☐          |
| 4   | La app del huésped y el dashboard estaban parados en fechas distintas. Hoy = 14 de noviembre para todo, y hay dos huéspedes de demo: Valeria (llega hoy) y Hannah (llega en 5 días, entrevista a medias). | Selector en Inicio          | ☐          |
| 5   | Escribí 18 preguntas provisionales para la entrevista profunda. El prototipo solo traía las 5 light.                                                                                                      | Entrevista, modo Profunda   | ☐          |
| 6   | Escribí 14 consejos provisionales para el protocolo de 7 días previo a la llegada.                                                                                                                        | Inicio, sección "Preparate" | ☐          |
| 7   | Se puede reservar sauna el mismo día de llegada (4 días para Valeria, no los 3 del prototipo). Llega a las 3 p.m. y el spa cierra a las 21:00.                                                            | Reservas                    | ☐          |
| 8   | Saqué el "Volver a empezar" de la entrevista: ahora borraría respuestas de verdad. En su lugar lleva a Inicio.                                                                                            | Entrevista, al terminar     | ☐          |
| 9   | El horario ocupado y la alergia no se comunican solo con color: llevan texto e ícono. Es requisito de accesibilidad.                                                                                      | Reservas, Llegadas          | ☐          |
| 10  | El consentimiento de privacidad se pide una vez, antes de la primera pregunta sensible, y la pregunta siempre se puede saltar.                                                                            | Entrevista                  | ☐          |
| 11  | El dashboard es responsive completo. Debajo de 1024 px: menú deslizable en vez de barra lateral, y tarjetas en vez de tabla.                                                                              | Todo `/staff` en celular    | ☐          |
| 12  | En celular, el perfil del huésped pone las experiencias WOW **arriba de todo**: es lo que el equipo mira primero al recibir a alguien.                                                                    | Perfil en celular           | ☐          |
| 13  | En celular, la agenda de spa solo muestra tarjeta para los horarios con reserva; los libres van resumidos en una línea.                                                                                   | Spa en celular              | ☐          |
| 14  | "Villas" aparece en el menú de recepción pero deshabilitado: no es una de las 8 pantallas del MVP.                                                                                                        | Menú de recepción           | ☐          |
| 15  | El indicador "Experiencias WOW por preparar" cuenta solo las de las llegadas **del día**, no las del hotel entero.                                                                                        | Llegadas                    | ☐          |
| 16  | Inglés cubre toda la app del huésped, pero recepción continúa solo en español. El idioma inicial sale de la preferencia del huésped y cada elección se recuerda por estadía.                              | Todo `/app`                 | ☐          |
| 17  | La PWA usa la marca oficial dorada sobre fondo oscuro en los íconos maskable y Apple.                                                                                                                     | Ícono al instalar la app    | ☑          |
| 18  | La landing queda intacta y el MVP se desplegará en `experience.stayhumaya.com`, con origen/document root separado en SiteGround.                                                                          | Integración Fase 6          | ☑          |
| 19  | La landing usa Jost + Inter y `#C8AD85`; durante esta fase la app conserva Cormorant + Jost y sus tonos accesibles, sin una realineación visual completa.                                                 | Marca de app y recepción    | ☑          |
| 20  | Alemán y francés existen en la landing, pero continúan fuera del MVP de huésped y caen temporalmente a español.                                                                                           | Idiomas de `/app`           | ☐          |
| 21  | `/dev/ui` sirve como catálogo interno solo en desarrollo; el build público responde con la pantalla de ruta inexistente.                                                                                  | Rutas de Fase 6             | ☑          |
| 22  | Ascenso (la app de entrenamiento que Anthony armó aparte, con Alex) se integró como el pilar **Move** dentro de Método Humaya, en vez de quedar como app separada. Usa datos de ejemplo (3 sesiones semanales, coach "Coach Tony Alvarado"), igual que el resto del MVP; no se tocó Supabase ni la base del CRM. | `/app/move`, `/app/move/:sessionId` | ☐ |
| 23  | El reproductor de sesión sigue el orden que pidió Anthony: video de intro de la sesión (silenciable) → intro de cada sección con sus ejercicios → series de trabajo/descanso por ejercicio → video de cierre al completar la tanda completa de cada ejercicio → enfriamiento → resumen con calificación. | `/app/move/:sessionId` | ☐ |
| 24  | De los cuatro tratamientos de video que se armaron para comparar (inmersivo, con marco, burbuja, pantalla completa), "Pantalla completa" (video de fondo con los controles sobrepuestos) queda como estilo por defecto, por ser el que Anthony prefirió al ver el mockup. Los otros tres siguen elegibles desde el selector dentro del reproductor. | `/app/move/:sessionId`, selector de estilo de video | ☑ |
| 25  | Los 5 clips de Alex (intro, sección, ejercicio, cierre, enfriamiento) se comprimieron con ffmpeg para no pesar la PWA (~5.2 MB en total) y se copiaron a `public/videos/`; no entraron al precache de la PWA (el precache actual sigue siendo de assets del build, no de estos videos). | `public/videos/` | ☐ |

## 2. Lo que necesito de él para reemplazar contenido provisional

Ya está en la lista de `docs/PLAN.md`; acá con el detalle de qué desbloquea cada cosa.

| Qué                                          | Para qué                                        | Recibido |
| -------------------------------------------- | ----------------------------------------------- | -------- |
| Marca y wordmark oficiales                   | Encabezados e íconos de la PWA                  | ☑ PNG    |
| Fuentes de la landing                        | Decidir si la app adopta Jost + Inter           | ☑ datos  |
| Fotos de las villas                          | Reemplazar el marcador gris en Mi villa         | ☑        |
| Preguntas reales de la entrevista, por pilar | Reemplazar las 5 light y las 18 profundas       | ☐        |
| Instructivos reales de la villa              | Hoy hay 4 genéricos (aire, agua, luces, cocina) | ☐        |
| Horarios y capacidad de sauna y cold plunge  | Hoy: 9 franjas, 45 y 20 minutos                 | ☐        |
| Texto de la política de privacidad           | Hoy el enlace no lleva a ningún lado            | ☐        |
| Consejos del protocolo de 7 días             | Reemplazar los 14 provisionales                 | ☐        |
| Nombres y datos reales de las villas         | Hoy las características son inventadas          | ☐        |

## 3. Lo que dijo Anthony

<!-- Se anota acá durante la reunión, sin filtrar. Fecha, pantalla y qué dijo. -->

### Sesión del ___ de ______

**Inicio**

**Entrevista**

**Concierge**

**Mi villa**

**Reservas**

**Recepción** (Llegadas, Perfil, Spa — y cómo se ve en celular)

**General** (tono, marca, cosas que faltan)

## 4. Triage

Cada punto del apartado 3 termina en una fila de acá.

| Qué pidió | Tamaño | Cuándo | Estado |
| --------- | ------ | ------ | ------ |
|           |        |        |        |

- **Tamaño**: chico (menos de una hora) · mediano (una sesión) · grande (cambia el plan).
- **Cuándo**: ahora (interrumpe la fase en curso) · en su fase · después del MVP · no entra.
- **Estado**: pendiente · en curso · hecho · descartado.

### Cambios que sí conviene meter en el momento

Los que son baratos y se notan: textos, orden de secciones, nombres, colores dentro de los tokens.

### Cambios que conviene anotar y no tocar todavía

Los que mueven la estructura: pantallas nuevas, campos nuevos en el modelo de datos, o cualquier cosa
que toque el contrato de `src/types/`. Esos se discuten con el plan a la vista antes de tocar código.

## 5. Preguntas abiertas del proyecto

De `docs/PLAN.md`, sin responder todavía:

- [ ] ¿El alcance es solo pantallas con datos de ejemplo?
- [ ] Presupuesto, forma de pago y fecha de entrega
- [ ] ¿Repo, dominio y hosting a nombre de quién?
- [ ] ¿Dónde reservan los huéspedes hoy? ¿El sistema tiene API?
- [ ] ¿Qué CRM usan y tiene API?
- [ ] ¿Tienen WhatsApp Business con API oficial?

---

## Decisiones tomadas sin Anthony — 20 de noviembre de 2026

Del pedido *«todos debe ser configurables colores font y etiquetas en admin»*.
Ninguna es irreversible; si alguna no le gusta, se cambia.

| Decisión | Por qué | Cómo se deshace |
| --- | --- | --- |
| El acento son **dos** campos (fondo oscuro / fondo claro), no uno | `--gold` vale `#c8a565` sobre negro y `#87672e` sobre blanco: un solo hex deja un lado ilegible | Dejar `acentoStaff` vacío y se usa el mismo |
| Las variantes del acento (bright, dim, track) **se derivan** con `color-mix`, no se piden | Pedir cuatro dorados para elegir uno no lo llena nadie; dejarlos quietos daría bordes dorados en un hotel verde | Agregar campos al formulario |
| Las etiquetas se guardan **por idioma** en un jsonb, no una columna por idioma | La app tiene dos idiomas y la landing cuatro; así no cambia de forma | — |
| Orden del texto: idioma del huésped → traducción de la app → otro idioma | Renombrar solo el español no debe hacer que un huésped en inglés lea español | `src/i18n/opciones.ts` |
| Admin se parte en **seis** secciones con esos nombres | Que cada función tenga su dirección, y que se pueda mandar un enlace a una sola | `features/staff/admin/secciones.ts` |
| Los botones que necesitan rol `administrador` **no se muestran** a los demás roles | Regla de la casa: lo que se sabe que va a rebotar se explica, no se ofrece | `useEsAdministrador()` |
| Encender y apagar **sí** se muestra a todo recepción | Pasa por la función `humaya-admin`, que acepta los cuatro roles: esconderlo sería romper algo que funciona | — |
| El formulario **mide el contraste** y avisa | Un color bonito que no se lee no se descubre hasta que un huésped no encuentra el botón | `src/services/contraste.ts` |

---

## Decisiones tomadas sin Anthony — 21 de noviembre de 2026

De abrir **todas** las pantallas de recepción como administrador, con cuenta de prueba, contra el
hotel demo. Ninguna es irreversible.

| Decisión | Por qué | Cómo se deshace |
| --- | --- | --- |
| «Protocolo pre-llegada» pasa a **«Preparación pre-llegada»** | La palabra está prohibida desde el 11 de noviembre y estaba en pantalla. De las dos salidas que `marca.ts` propone —«el orden», «la secuencia»— ninguna suena a una fila de una línea de tiempo; el huésped ya ve esa misma cosa como **«Preparate»**, así que recepción usa su misma palabra en vez de inventar una tercera | `src/services/guests.ts` |
| Una prueba sostiene el vocabulario prohibido | La regla llevaba diez días escrita en `marca.ts` y la app la rompía en tres lugares. Una regla que solo vive en un comentario se rompe sola | `src/i18n/sinPalabrasProhibidas.test.ts` |
| El aviso de la guía del TV deja de decir «las diez pantallas» | El hotel demo tiene dos. El número estaba escrito a mano y una prueba lo exigía | `copyTv.ts` |
| El cliente falso aprende `insert`, `delete` y `single` | Sin eso, crear y borrar temas, respuestas y notas **no se podía probar**, y por eso nadie vio que el orden se calculaba con las filas de todos los hoteles | `src/test/supabaseStub.ts` |

### Lo que NO hice, porque es decisión suya

**Media recepción solo habla español.** El botón de idioma del menú promete inglés y lo cumplen
tres pantallas: la puerta, Llegadas y Huéspedes. Spa, las dos del Concierge, la ficha del huésped
y las siete de Admin tienen el texto escrito solo en español — no es un error de código, es texto
que no existe: **628 líneas** en once archivos de `copy*.ts`, que habría que escribir en inglés y
cablear a `Record<Idioma, …>` pantalla por pantalla.

Son tres caminos y los tres son razonables:

1. **Traducir todo.** Un recepcionista que no lee español puede trabajar un turno completo.
2. **Traducir solo lo del turno** (Spa, Concierge, ficha) y dejar Admin en español, que lo usa el
   dueño.
3. **Dejarlo** y que el botón de idioma solo aparezca donde hay inglés, en vez de prometerlo en
   todas.

Hoy está en el peor de los tres: promete y no cumple. No lo elegí yo porque escribir 628 líneas de
voz de marca en inglés no es una corrección, es una decisión de producto.
