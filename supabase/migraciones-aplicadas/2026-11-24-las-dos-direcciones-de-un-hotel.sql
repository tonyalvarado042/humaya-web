-- Las dos direcciones de un hotel salen de la base, y de un solo lugar
--
-- Aplicada el 24 de noviembre de 2026. Tony, mirando Admin → Hoteles:
-- «no sale ambos enlaces de huésped y de staff, ¿por qué?».
--
-- ── LO QUE PASABA ───────────────────────────────────────────────────────
-- La ficha de cada hotel mostraba UNA sola dirección, y la armaba a mano en
-- el navegador:
--
--     const dominio = 'https://guestexp.liderax10.com';
--     ...
--     {dominio}/{hotel.codigo}
--
-- Dos problemas en una línea:
--
--  1. La de recepción no aparecía en ninguna parte, aunque desde el 15 de
--     noviembre el huésped y el personal viven en dominios separados.
--  2. Para un hotel con dominio propio era FALSA. HUMAYA salía como
--     `guestexp.liderax10.com/humaya` cuando su dirección es
--     `experience.stayhumaya.com`. Mandarle esa a alguien es mandarlo a una
--     dirección que no es la suya.
--
-- ── POR QUÉ UNA FUNCIÓN Y NO ARREGLAR LA PANTALLA ───────────────────────
-- Porque la regla ya estaba escrita DOS veces: dentro de
-- `humaya_sembrar_hotel` (bien) y en el panel (mal). Arreglar la del panel
-- dejaba dos copias, y la próxima vez se desincronizan otra vez. Ahora hay
-- una sola: `humaya_direcciones_del_hotel`, que usan las dos.
--
-- Había una TERCERA, `puertaDelHuesped()` en `panelHoteles.ts`, que no la
-- llamaba nadie. Se borró.
--
-- ── COMPROBACIÓN ────────────────────────────────────────────────────────
-- Lo que devuelve `humaya_hoteles_todos()` con la cuenta de plataforma:
--
--   bikeandbed  guestexp.liderax10.com/bikeandbed  ·  hotelexp.liderax10.com/staff
--   demo        guestexp.liderax10.com/demo        ·  hotelexp.liderax10.com/staff
--   humaya      experience.stayhumaya.com          ·  staff.stayhumaya.com/staff
--
-- Y la siembra de un hotel nuevo sigue dando lo mismo después del cambio,
-- probado creando `pruebadirecciones` en una transacción revertida:
-- `guest -> https://guestexp.liderax10.com/pruebadirecciones`.

create or replace function public.humaya_direcciones_del_hotel(p_negocio uuid)
returns table(huesped text, personal text)
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
  v_codigo text;
  v_huesped text;
  v_personal text;
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
  end if;

  huesped := v_huesped;
  personal := v_personal;
  return next;
end $function$;

-- Nadie la llama de afuera: la usan las otras dos funciones, que corren como
-- dueñas. Sin `grant`, nadie más puede.
revoke all on function public.humaya_direcciones_del_hotel(uuid) from public;

-- `humaya_hoteles_todos` suma las dos columnas. Hay que soltarla antes:
-- cambiar el tipo que devuelve no se puede con `create or replace`.
drop function if exists public.humaya_hoteles_todos();

create or replace function public.humaya_hoteles_todos()
returns table(
  negocio_id uuid, codigo text, nombre text, marca_hotel text, marca_experiencia text,
  correo text, origen_reservas text, es_demo boolean, activo boolean,
  usuarios bigint, reservas bigint,
  url_huesped text, url_personal text
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
         d.huesped, d.personal
  from public.humaya_hoteles h
  join crm_tony_alvarado.cta_negocios n on n.id = h.negocio_id
  left join lateral public.humaya_direcciones_del_hotel(h.negocio_id) d on true
  where public.humaya_soy_plataforma()
  order by n.codigo;
$function$;

revoke all on function public.humaya_hoteles_todos() from public;
grant execute on function public.humaya_hoteles_todos() to authenticated;

-- Y `humaya_sembrar_hotel` deja de tener su propia copia: pide las dos
-- direcciones a la función nueva. El resto va igual. (El cuerpo completo
-- está en 2026-11-24-hotel-nuevo-nace-completo.sql; acá solo cambió el
-- bloque que las calculaba, que pasó a ser:)
--
--   select d.huesped, d.personal into v_huesped, v_personal
--   from public.humaya_direcciones_del_hotel(p_negocio) d;
