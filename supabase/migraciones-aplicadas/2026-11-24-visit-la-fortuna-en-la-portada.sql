-- La guía del destino entra a la portada interna de todos los hoteles
--
-- Aplicada el 24 de noviembre de 2026. Tony: «agregá visitlafortunacr.com a
-- todas las landing creadas. Tours rentals etc».
--
-- ── QUÉ ES ──────────────────────────────────────────────────────────────
-- `visitlafortunacr.com` es la guía de La Fortuna del propio Tony. Lo que
-- tiene de verdad, leído del menú del sitio el 24 de noviembre de 2026:
-- Qué hacer, Volcán, Aguas termales, Cataratas, Canopy, Rafting, Canyoning,
-- Vida silvestre, Café y chocolate, Parques nacionales, Tours (aventura y
-- naturaleza), Atracciones, Transporte (shuttles y traslados privados),
-- Dónde dormir, Comer, Experiencias y Blog.
--
-- NO tiene sección de alquileres: `/es/alquileres`, `/es/rentals` y
-- `/es/alquiler-de-carros` dan 404, y en el sitemap no hay ninguna página
-- con «alquil» ni «rental». Lo más cerca es `/es/transporte`. Por eso la
-- descripción de la ficha no promete alquileres: dice tours, aguas termales
-- y traslados, que es lo que hay.
--
-- ── POR QUÉ TAMBIÉN VA EN LA SIEMBRA ────────────────────────────────────
-- Porque «todas las landing creadas» envejece: el hotel que se cree mañana
-- nacería sin ella y habría que acordarse a mano. Un hotel que no esté en
-- La Fortuna la apaga con un clic en Admin → Portada interna, que es más
-- barato que la lista de pendientes de alguien.
--
-- ── ORDEN 6 ─────────────────────────────────────────────────────────────
-- Última. 1 recepción, 2 app del huésped, 3 X10 Vision, 4 Cloudbeds,
-- 5 el sitio del hotel (solo HUMAYA lo tiene hoy), 6 la guía del destino:
-- es una referencia para recomendarle algo al huésped, no una herramienta
-- de todos los días.

create or replace function public.humaya_sembrar_hotel(p_negocio uuid)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_codigo text;
  v_origen text;
  v_huesped text;
  v_personal text;
  v_opciones integer := 0;
  v_enlaces integer := 0;
  v_tv integer := 0;
  v_ajustes integer := 0;
begin
  if not public.humaya_soy_plataforma() then
    raise exception 'solo_plataforma' using errcode = 'insufficient_privilege';
  end if;

  select n.codigo into v_codigo
  from crm_tony_alvarado.cta_negocios n where n.id = p_negocio;
  if v_codigo is null then
    raise exception 'hotel_no_existe';
  end if;

  select coalesce(h.origen_reservas, 'ninguno') into v_origen
  from public.humaya_hoteles h where h.negocio_id = p_negocio;

  -- Las dos direcciones salen de UN solo lugar, el mismo que lee el panel de
  -- hoteles. Estaban escritas dos veces y la copia del panel ya se había
  -- equivocado con HUMAYA.
  select d.huesped, d.personal into v_huesped, v_personal
  from public.humaya_direcciones_del_hotel(p_negocio) d;

  with nuevas as (
    insert into public.humaya_admin_opciones
      (negocio_id, clave, etiqueta, descripcion, icono, habilitada, orden)
    select p_negocio, d.clave, d.etiqueta, d.descripcion, d.icono, d.habilitada, d.orden
    from (values
      ('resumen',   'Mis datos',  'Tu estadía, tu entrevista y tus consejos para llegar.', 'user',           true,  0),
      ('interview', 'Entrevista', 'Contanos como te gusta que te atiendan.',                'message-square', true,  1),
      ('concierge', 'Concierge',  'Preguntale lo que necesites a cualquier hora.',          'sparkles',       true,  2),
      ('villa',     'Mi villa',   'Wi-Fi, instructivos y todo sobre tu villa.',             'tent',           true,  3),
      ('bookings',  'Reservas',   'Sauna, cold plunge y otras experiencias.',               'calendar-days',  true,  4),
      ('move',      'Move',       'Tu entrenamiento guiado de la semana.',                  'dumbbell',       false, 5)
    ) as d(clave, etiqueta, descripcion, icono, habilitada, orden)
    on conflict (negocio_id, clave) do nothing
    returning 1
  )
  select count(*) into v_opciones from nuevas;

  with nuevas as (
    insert into public.humaya_tv_ajustes (negocio_id, guia)
    values (p_negocio, '{}'::jsonb)
    on conflict (negocio_id) do nothing
    returning 1
  )
  select count(*) into v_tv from nuevas;

  with nuevas as (
    insert into public.humaya_ajustes (negocio_id, clave, valor)
    select p_negocio, d.clave, d.valor
    from (values
      ('demo_visible',  'false'::jsonb),
      ('bot_encendido', 'false'::jsonb),
      ('bot_modelo',    '"claude-haiku-5-5"'::jsonb)
    ) as d(clave, valor)
    on conflict (negocio_id, clave) do nothing
    returning 1
  )
  select count(*) into v_ajustes from nuevas;

  with nuevas as (
    insert into public.humaya_enlaces
      (negocio_id, clave, etiqueta, descripcion, url, icono, orden)
    select p_negocio, d.clave, d.etiqueta, d.descripcion, d.url, d.icono, d.orden
    from (values
      ('recepcion', 'Panel de recepción',  'Llegadas, huéspedes, agenda y Concierge.',          v_personal,                     'concierge-bell', 1),
      ('guest',     'App del huésped',     'Lo que ve el huésped en su teléfono.',              v_huesped,                      'smartphone',     2),
      ('vision',    'X10 Vision',          'Contactos, embudo y seguimientos.',                 'https://liderax10.com',        'gauge',          3),
      ('cloudbeds', 'Cloudbeds',           'El PMS: tarifas, calendario y reservas.',           'https://hotels.cloudbeds.com', 'calendar-check', 4),
      ('destino',   'Visit La Fortuna CR', 'Tours, aguas termales y traslados, para recomendarle al huésped.',
                                                                                               'https://visitlafortunacr.com', 'map-pin',        6)
    ) as d(clave, etiqueta, descripcion, url, icono, orden)
    where d.url is not null
      and (d.clave <> 'cloudbeds' or v_origen = 'cloudbeds')
    on conflict (negocio_id, clave) do nothing
    returning 1
  )
  select count(*) into v_enlaces from nuevas;

  return jsonb_build_object(
    'codigo', v_codigo,
    'opciones', v_opciones,
    'tv_ajustes', v_tv,
    'ajustes', v_ajustes,
    'enlaces', v_enlaces
  );
end $function$;

-- ── Y a los tres hoteles que ya existen ─────────────────────────────────
-- `on conflict do nothing`: correr esto dos veces no duplica la ficha.
insert into public.humaya_enlaces
  (negocio_id, clave, etiqueta, descripcion, url, icono, orden)
select h.negocio_id,
       'destino',
       'Visit La Fortuna CR',
       'Tours, aguas termales y traslados, para recomendarle al huésped.',
       'https://visitlafortunacr.com',
       'map-pin',
       6
from public.humaya_hoteles h
on conflict (negocio_id, clave) do nothing;

-- ── COMPROBADO ──────────────────────────────────────────────────────────
-- Después de aplicar, fichas por hotel:
--   bikeandbed  5  (recepción, huésped, X10 Vision, Cloudbeds, destino)
--   demo        5  (ídem)
--   humaya      6  (las mismas más «Sitio web»)
-- Las tres con la ficha `destino` de última.
