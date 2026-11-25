-- La portada interna de cada hotel tiene una dirección propia, tocable
--
-- Aplicada el 24 de noviembre de 2026. Tony, leyendo la tabla de direcciones
-- que le mandé: «no veo la dirección de landing de Bike & Bed. No es ninguna
-- de estas».
--
-- ── TENÍA RAZÓN, Y NO ERA UN OLVIDO MÍO ─────────────────────────────────
-- Le mandé la del panel de recepción y la del huésped. La portada interna
-- —la landing que él pidió— vive en `/staff/inicio`, y para un hotel del
-- dominio COMPARTIDO no tenía dirección propia: `hotelexp.liderax10.com/
-- staff/inicio` es la misma para Bike & Bed y para el demo, porque de ese
-- lado el hotel lo dice la CUENTA, no la dirección.
--
-- Resultado práctico: no existía ningún enlace que abriera la portada de
-- Bike & Bed. Con una cuenta de plataforma —que ve los tres hoteles— esa
-- dirección abre el que quedó recordado la vez pasada. Un enlace que lleva a
-- un hotel distinto según quién lo toque no es una dirección.
--
-- ── LA SOLUCIÓN ─────────────────────────────────────────────────────────
-- `?hotel=<codigo>` en la portada del dominio compartido. Lo lee la Puerta
-- (`src/features/staff/puerta/Puerta.tsx`) DESPUÉS de preguntarle a la base
-- qué hoteles puede ver esta cuenta, así que no es un permiso: un código que
-- la cuenta no tiene no abre nada, cae en el selector de siempre.
--
-- En un hotel con dominio propio no hace falta y no se pone: en
-- `staff.stayhumaya.com` el hotel lo dice el dominio.
--
-- ── POR QUÉ LA ARMA LA BASE Y NO LA PANTALLA ────────────────────────────
-- Por lo mismo que el 24 de noviembre, hace unas horas: la regla de las
-- direcciones estaba escrita tres veces y una mentía. Esta es la tercera
-- dirección del hotel; sale del mismo lugar que las otras dos.

-- Cambia el tipo que devuelve: hay que soltarla antes.
drop function if exists public.humaya_direcciones_del_hotel(uuid);

create or replace function public.humaya_direcciones_del_hotel(p_negocio uuid)
returns table(huesped text, personal text, portada text)
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
  v_codigo text;
  v_huesped text;
  v_personal text;
  v_compartido boolean := false;
begin
  select n.codigo into v_codigo
  from crm_tony_alvarado.cta_negocios n where n.id = p_negocio;
  if v_codigo is null then
    return;
  end if;

  -- Con dominio propio la dirección ya dice qué hotel es. En el dominio
  -- compartido hay que ponerle el código a la ruta del huésped — del lado
  -- del personal no, porque ahí el hotel lo dice la cuenta.
  --
  -- Lo que no es un dominio público (localhost, 127.0.0.1) queda fuera: un
  -- enlace a localhost en el panel no lleva a ninguna parte.
  select 'https://' || d.dominio into v_huesped
  from public.humaya_dominios d
  where d.negocio_id = p_negocio and d.lado = 'huesped'
    and d.dominio like '%.%' and d.dominio !~ '^[0-9]'
  limit 1;

  if v_huesped is null then
    select 'https://' || d.dominio || '/' || v_codigo into v_huesped
    from public.humaya_dominios d
    where d.negocio_id is null and d.lado = 'huesped'
      and d.dominio like '%.%' and d.dominio !~ '^[0-9]'
    order by d.dominio
    limit 1;
  end if;

  select 'https://' || d.dominio || '/staff' into v_personal
  from public.humaya_dominios d
  where d.negocio_id = p_negocio and d.lado = 'personal'
    and d.dominio like '%.%' and d.dominio !~ '^[0-9]'
  limit 1;

  if v_personal is null then
    select 'https://' || d.dominio || '/staff' into v_personal
    from public.humaya_dominios d
    where d.negocio_id is null and d.lado = 'personal'
      and d.dominio like '%.%' and d.dominio !~ '^[0-9]'
    order by d.dominio
    limit 1;
    -- Solo se marca si de verdad encontró uno compartido. Sin esto, un hotel
    -- sin ningún dominio de personal saldría «compartido» y la portada se
    -- armaría sobre null.
    v_compartido := v_personal is not null;
  end if;

  huesped := v_huesped;
  personal := v_personal;
  -- En el dominio compartido la dirección sola no alcanza: le hace falta
  -- decir de qué hotel es la portada que se quiere abrir.
  portada := case
    when v_personal is null then null
    when v_compartido then v_personal || '/inicio?hotel=' || v_codigo
    else v_personal || '/inicio'
  end;
  return next;
end $function$;

revoke all on function public.humaya_direcciones_del_hotel(uuid) from public;

drop function if exists public.humaya_hoteles_todos();

create or replace function public.humaya_hoteles_todos()
returns table(
  negocio_id uuid, codigo text, nombre text, marca_hotel text, marca_experiencia text,
  correo text, origen_reservas text, es_demo boolean, activo boolean,
  usuarios bigint, reservas bigint,
  url_huesped text, url_personal text, url_portada text
)
language sql
stable
security definer
set search_path to ''
as $function$
  select h.negocio_id, n.codigo, n.nombre, h.marca_hotel, h.marca_experiencia,
         h.correo, h.origen_reservas, coalesce(h.es_demo, false), n.activo,
         (select count(*) from crm_tony_alvarado.cta_usuario_negocios un
           where un.negocio_id = h.negocio_id),
         (select count(*) from public.humaya_cloudbeds_reservas r
           where r.negocio_id = h.negocio_id),
         d.huesped, d.personal, d.portada
  from public.humaya_hoteles h
  join crm_tony_alvarado.cta_negocios n on n.id = h.negocio_id
  left join lateral public.humaya_direcciones_del_hotel(h.negocio_id) d on true
  where public.humaya_soy_plataforma()
  order by n.codigo;
$function$;

revoke all on function public.humaya_hoteles_todos() from public;
grant execute on function public.humaya_hoteles_todos() to authenticated;

-- ── COMPROBADO ──────────────────────────────────────────────────────────
-- `humaya_hoteles_todos()` con la cuenta de plataforma, columna de portada:
--
--   bikeandbed  https://hotelexp.liderax10.com/staff/inicio?hotel=bikeandbed
--   demo        https://hotelexp.liderax10.com/staff/inicio?hotel=demo
--   humaya      https://staff.stayhumaya.com/staff/inicio
--
-- HUMAYA sin parámetro: tiene dominio propio y ahí no hay nada que elegir.
--
-- `humaya_sembrar_hotel` sigue funcionando sin tocarla: pide `d.huesped` y
-- `d.personal` por nombre, y una columna más no le cambia nada. Probado
-- creando un hotel en una transacción revertida después del cambio.
