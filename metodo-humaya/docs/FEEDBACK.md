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
| 18  | La landing queda intacta y el MVP se desplegará en `metodo.stayhumaya.com`, con origen/document root separado en SiteGround.                                                                              | Integración Fase 6          | ☑          |
| 19  | La landing usa Jost + Inter y `#C8AD85`; durante esta fase la app conserva Cormorant + Jost y sus tonos accesibles, sin una realineación visual completa.                                                 | Marca de app y recepción    | ☑          |
| 20  | Alemán y francés existen en la landing, pero continúan fuera del MVP de huésped y caen temporalmente a español.                                                                                           | Idiomas de `/app`           | ☐          |
| 21  | `/dev/ui` sirve como catálogo interno solo en desarrollo; el build público responde con la pantalla de ruta inexistente.                                                                                  | Rutas de Fase 6             | ☑          |

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
