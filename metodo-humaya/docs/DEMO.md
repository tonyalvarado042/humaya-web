# Demo del Método Humaya — recorrido de cinco minutos

Estado: **guion escrito; pendiente de ensayo en `https://metodo.stayhumaya.com`**.

Antes de empezar, abrir la portada en una ventana limpia, confirmar que el idioma de Hannah no quedó
guardado en `localStorage` y elegir un horario libre de Sauna para Valeria. Todo lo mostrado usa datos
ficticios y servicios simulados.

## 0:00–0:40 — Portada y contexto

1. Abrir `/` y presentar “Become More Human”.
2. Aclarar que el MVP reúne dos áreas conectadas: la experiencia del huésped y recepción.
3. Señalar el aviso de datos ficticios y abrir **App del huésped**.

Mensaje clave: hoy se valida el recorrido y la operación; los mocks se reemplazarán por API sin
reescribir las pantallas.

## 0:40–2:10 — App del huésped

1. Empezar con Valeria y mostrar Inicio, el protocolo previo y la información de su estadía.
2. Cambiar a Hannah. Su preferencia inicial abre la experiencia en inglés.
3. Alternar ES/EN para mostrar que navegación, fechas y contenidos dinámicos cambian sin modificar la
   URL.
4. Abrir la entrevista light, explicar el aviso de IA y mostrar el progreso parcial.
5. Llegar a la pregunta sensible y enseñar que exige consentimiento y también permite omitirla.

Mensaje clave: la experiencia se adapta al huésped y conserva el idioma por estadía.

## 2:10–3:10 — Experiencia y reserva

1. Volver a Valeria y abrir Concierge; mostrar sugerencias y una respuesta simulada.
2. Abrir Mi villa y señalar la foto oficial, características e instructivos.
3. Entrar a Reservas, elegir Sauna y reservar el primer horario disponible.
4. Mostrar la confirmación y que el horario queda bloqueado durante la sesión.

Mensaje clave: entrevista, concierge, villa y bienestar forman un solo acompañamiento.

## 3:10–4:30 — Recepción

1. Volver a la portada y abrir **Recepción**.
2. En Llegadas, ubicar a Valeria y abrir su perfil desde la tabla o tarjeta.
3. Mostrar Villa 04, la alerta de alergia y las experiencias WOW que el equipo debe preparar.
4. Abrir Spa y bienestar para enseñar la agenda compartida y la reserva recién creada.

Mensaje clave: el equipo recibe contexto accionable sin exponer las pantallas del huésped.

## 4:30–5:00 — PWA y siguiente etapa

1. Mostrar la app instalada en modo standalone.
2. Reabrirla sin conexión después de una primera visita completa.
3. Cerrar explicando que el siguiente paso técnico es conectar PMS, CRM, WhatsApp e IA reales detrás
   de la capa de servicios existente.

## Validación pendiente antes de presentarla

- [ ] Ensayar el recorrido completo sobre HTTPS y mantenerlo debajo de cinco minutos.
- [ ] Confirmar una franja de Sauna disponible antes de la sesión.
- [ ] Probar enlaces directos a `/app`, `/staff`, `/staff/spa` y el perfil de Valeria.
- [ ] Instalar y reabrir offline en Android/Chrome.
- [ ] Agregar a pantalla de inicio y reabrir offline en iPhone/Safari.
- [ ] Revisar portada, encabezado y selector a 360 y 430 px.
- [ ] Registrar dispositivo, sistema, navegador, fecha y resultado en `docs/ESTADO.md`.
