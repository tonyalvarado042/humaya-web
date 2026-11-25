-- El código del hotel va en la RUTA, también del lado de recepción
--
-- Aplicada el 24 de noviembre de 2026, horas después de
-- `2026-11-24-la-portada-de-cada-hotel-tiene-direccion.sql`, que resolvió lo
-- mismo con un parámetro.
--
-- ── POR QUÉ SE DESHACE EL ARREGLO ANTERIOR ──────────────────────────────
-- Tony, viendo las direcciones con `?hotel=bikeandbed`: «para mí está mal.
-- No debería ser esta: hotelexp.liderax10.com/bikeandbed para staff».
--
-- Tenía razón, y el motivo es bueno: del lado del huésped el código SIEMPRE
-- fue parte de la ruta (`guestexp.liderax10.com/bikeandbed`). Dos lados de la
-- misma aplicación no pueden numerar distinto. Un parámetro de consulta para
-- decir «de qué hotel es esta pantalla» era un parche con forma de parche: se
-- pierde al copiar un enlace a medias, no se ve como parte de la dirección, y
-- nadie lo escribe de memoria.
--
-- ── LAS DIRECCIONES, AHORA ──────────────────────────────────────────────
-- Dominio compartido (`hotelexp.liderax10.com`, `guestexp.liderax10.com`):
--
--   landing     hotelexp.liderax10.com/<codigo>
--   recepción   hotelexp.liderax10.com/<codigo>/staff
--   huésped     guestexp.liderax10.com/<codigo>
--
-- Dominio propio (HUMAYA):
--
--   landing     staff.stayhumaya.com
--   recepción   staff.stayhumaya.com/staff
--   huésped     experience.stayhumaya.com
--
-- La dirección PELADA del hotel abre su landing, no el panel. Lo eligió Tony:
-- la más corta es la que se manda, y el panel lo guarda recepción, que lo usa
-- todo el día.
--
-- ── LO QUE NO CAMBIÓ, Y ES LO IMPORTANTE ────────────────────────────────
-- El código en la ruta NO es un permiso. Quién entra lo sigue decidiendo la
-- cuenta: `humaya_hoteles_de_la_cuenta()` filtra por `auth.uid()`, y la
-- Puerta lee el código de la dirección como PREFERENCIA sobre esa lista.
-- Escribir en la barra el código del hotel de al lado cae en el selector de
-- siempre. `humaya_hotel_de_codigo` solo da la marca, que ya es pública del
-- lado del huésped.
--
-- `hotelexp.liderax10.com/staff` sin código sigue funcionando: ahí el hotel
-- lo dice la cuenta, como siempre. No se rompe ningún favorito.

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
  v_dominio_personal text;
  v_compartido boolean := false;
begin
  select n.codigo into v_codigo
  from crm_tony_alvarado.cta_negocios n where n.id = p_negocio;
  if v_codigo is null then
    return;
  end if;

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

  select 'https://' || d.dominio into v_dominio_personal
  from public.humaya_dominios d
  where d.negocio_id = p_negocio and d.lado = 'personal'
    and d.dominio like '%.%' and d.dominio !~ '^[0-9]'
  limit 1;

  if v_dominio_personal is null then
    select 'https://' || d.dominio into v_dominio_personal
    from public.humaya_dominios d
    where d.negocio_id is null and d.lado = 'personal'
      and d.dominio like '%.%' and d.dominio !~ '^[0-9]'
    order by d.dominio
    limit 1;
    -- Solo se marca si de verdad encontró uno compartido. Sin esto, un hotel
    -- sin ningún dominio de personal saldría «compartido» y las direcciones
    -- se armarían sobre null.
    v_compartido := v_dominio_personal is not null;
  end if;

  huesped := v_huesped;
  -- En el dominio compartido el código va en la ruta, igual que del lado del
  -- huésped. En el dominio propio no hace falta: el dominio ya lo dijo.
  personal := case
    when v_dominio_personal is null then null
    when v_compartido then v_dominio_personal || '/' || v_codigo || '/staff'
    else v_dominio_personal || '/staff'
  end;
  -- La landing es la dirección pelada del hotel.
  portada := case
    when v_dominio_personal is null then null
    when v_compartido then v_dominio_personal || '/' || v_codigo
    else v_dominio_personal
  end;
  return next;
end $function$;

revoke all on function public.humaya_direcciones_del_hotel(uuid) from public;

-- ── Y las fichas ya sembradas, que apuntaban a la recepción «de nadie» ──
-- El enlace `recepcion` de los hoteles del dominio compartido decía
-- `hotelexp.liderax10.com/staff`, sin código. Esa dirección sigue sirviendo,
-- pero abre el hotel que diga la cuenta: en la portada DEL hotel tiene que
-- decir cuál es.
--
-- Se reescribe desde la función, no a mano, para que no haya una cuarta copia
-- de la regla.
-- El `lateral` va en un CTE y no en el `from` del update: un UPDATE no puede
-- pasarle una columna de su propia tabla a una funcion del FROM
-- («invalid reference to FROM-clause entry»).
with destino as (
  select e.id, d.personal
  from public.humaya_enlaces e
  cross join lateral public.humaya_direcciones_del_hotel(e.negocio_id) d
  where e.clave = 'recepcion'
)
update public.humaya_enlaces e
set url = destino.personal, actualizado_en = now()
from destino
where destino.id = e.id
  and destino.personal is not null
  and e.url <> destino.personal;

-- ── COMPROBADO ──────────────────────────────────────────────────────────
-- `humaya_hoteles_todos()` con la cuenta de plataforma:
--
--   bikeandbed  landing   https://hotelexp.liderax10.com/bikeandbed
--               recepción https://hotelexp.liderax10.com/bikeandbed/staff
--               huésped   https://guestexp.liderax10.com/bikeandbed
--   demo        landing   https://hotelexp.liderax10.com/demo
--               recepción https://hotelexp.liderax10.com/demo/staff
--               huésped   https://guestexp.liderax10.com/demo
--   humaya      landing   https://staff.stayhumaya.com
--               recepción https://staff.stayhumaya.com/staff
--               huésped   https://experience.stayhumaya.com
--
-- Y el enlace `recepcion` de la portada de cada hotel quedó con esa misma
-- dirección: 2 filas reescritas (bikeandbed y demo), la de HUMAYA ya estaba
-- bien y no se tocó.
