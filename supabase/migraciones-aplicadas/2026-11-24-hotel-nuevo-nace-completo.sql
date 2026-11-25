-- Un hotel nuevo nace completo, y cada hotel tiene su portada interna
--
-- Aplicada el 24 de noviembre de 2026. Tony: «Arregla eso» — sobre que
-- «un hotel nace vacío y no se puede llenar», y antes: «genere una landing
-- configurable para cada hotel desde admin con todos links… Visión x10,
-- Panel guest, Panel recepción, Cloud beds, Sitio web».
--
-- ── QUÉ DEVOLVÍA ANTES ──────────────────────────────────────────────────
-- Medido sobre Bike & Bed, el primer hotel creado desde el panel:
--
--   codigo        opciones servicios villas tv_ajustes ajustes concierge
--   bikeandbed           0         0      0          0       0         0
--   demo                 6         1      2          1       3         1
--   humaya               6         1     10          1       5         7
--
-- `humaya_crear_hotel` insertaba DOS filas: el negocio y el hotel. Un hotel
-- recién creado abría sin menú, sin ajustes y sin pantalla de TV, y el panel
-- no ofrecía forma de crear ninguna de las tres: la de villas lo decía con
-- todas las letras — «se crean en la base, en humaya_tv_villas».
--
-- ── QUÉ HACE ────────────────────────────────────────────────────────────
-- 1. `humaya_enlaces`: la portada interna de cada hotel. Los enlaces que usa
--    su equipo — recepción, la app del huésped, X10 Vision, Cloudbeds, el
--    sitio — con el nombre, el ícono y el orden que elija cada hotel.
-- 2. `humaya_sembrar_hotel(negocio)`: deja un hotel listo para abrir. Las 6
--    opciones del menú, la fila de ajustes del TV, los ajustes del bot y los
--    enlaces de su portada. Es IDEMPOTENTE: lo que ya existe no se toca, así
--    que se puede correr sobre un hotel vivo sin pisarle nada.
-- 3. `humaya_crear_hotel` la llama. Crear un hotel deja de ser dos filas.
--
-- ── QUÉ NO SIEMBRA, A PROPÓSITO ─────────────────────────────────────────
-- Las villas y el contenido del Concierge. Las villas son del hotel —sus
-- nombres, su cantidad— y sembrar «Villa 1, Villa 2» sería inventarle datos.
-- Se crean desde el panel, que es la otra mitad de este arreglo, o deberían
-- venir del PMS. Lo que el bot sabe también lo escribe el hotel.
--
-- ── POR QUÉ LOS ENLACES NO SON PÚBLICOS ─────────────────────────────────
-- Porque la lista de herramientas internas de un hotel es información del
-- hotel: con qué PMS trabaja, qué dominios usa. Se lee con sesión de
-- recepción y nada más. Por eso no hay permiso para `anon`, al revés que en
-- las otras tablas `humaya_*`, donde la función con llave de servicio es la
-- que lee para el huésped.

create table if not exists public.humaya_enlaces (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references crm_tony_alvarado.cta_negocios(id),
  -- Los sembrados la llevan; los que agregue el hotel van en null. Sirve
  -- para que sembrar dos veces no duplique, no para la pantalla.
  clave text,
  etiqueta text not null,
  descripcion text,
  url text not null,
  -- Un nombre de ícono de la lista que conoce la pantalla. Lo que no
  -- reconozca se dibuja como un enlace: un ícono que falta no puede dejar
  -- la portada en blanco.
  icono text,
  orden integer not null default 0,
  habilitado boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint humaya_enlaces_negocio_clave_key unique (negocio_id, clave)
);

create index if not exists humaya_enlaces_negocio_orden
  on public.humaya_enlaces (negocio_id, orden);

alter table public.humaya_enlaces enable row level security;

grant select, insert, update, delete on public.humaya_enlaces to authenticated;
grant select, insert, update, delete on public.humaya_enlaces to service_role;

-- Las dos mismas políticas que el resto de las tablas del hotel, con el
-- `humaya_puedo_ver` que entró esta mañana: todo recepción LEE lo de SU
-- hotel, y solo un administrador escribe.
drop policy if exists humaya_enlaces_equipo on public.humaya_enlaces;
create policy humaya_enlaces_equipo on public.humaya_enlaces
  for select
  using (
    crm_tony_alvarado.cta_es(variadic array['administrador','operaciones','vendedor','lectura'])
    and public.humaya_puedo_ver(negocio_id)
  );

drop policy if exists humaya_enlaces_admin on public.humaya_enlaces;
create policy humaya_enlaces_admin on public.humaya_enlaces
  for all
  using (
    crm_tony_alvarado.cta_es(variadic array['administrador'])
    and public.humaya_puedo_ver(negocio_id)
  )
  with check (
    crm_tony_alvarado.cta_es(variadic array['administrador'])
    and public.humaya_puedo_ver(negocio_id)
  );

-- ── Dejar un hotel listo para abrir ─────────────────────────────────────
--
-- Idempotente a propósito: cada bloque es un `on conflict do nothing`, así
-- que correrla sobre un hotel que ya trabaja no le cambia una sola fila. Eso
-- es lo que permite usarla también para rellenar los hoteles que ya existen,
-- sin pisarles lo que configuraron.
--
-- Devuelve CUÁNTO creó de cada cosa, no `true`. Una función que contesta
-- «listo» no se puede verificar; una que contesta «6 opciones, 4 enlaces,
-- 1 ajuste del TV» sí.
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

  -- ── Las dos direcciones de este hotel ───────────────────────────────
  -- Con dominio propio la dirección ya dice qué hotel es. En el dominio
  -- compartido hay que ponerle el código a la ruta del huésped — del lado
  -- del personal no, porque ahí el hotel lo dice la cuenta.
  --
  -- Se excluye lo que no es un dominio público (localhost, 127.0.0.1): un
  -- enlace a localhost en la portada de un hotel no lleva a ninguna parte.
  select 'https://' || d.dominio into v_huesped
  from public.humaya_dominios d
  where d.negocio_id = p_negocio and d.lado = 'huesped'
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
  limit 1;

  if v_personal is null then
    select 'https://' || d.dominio || '/staff' into v_personal
    from public.humaya_dominios d
    where d.negocio_id is null and d.lado = 'personal'
      and d.dominio like '%.%' and d.dominio !~ '^[0-9]'
    order by d.dominio
    limit 1;
  end if;

  -- ── 1. El menú del huésped ──────────────────────────────────────────
  -- Las seis pantallas que trae el producto, con los mismos `clave`, orden
  -- e íconos que HUMAYA. No es contenido del hotel: es la estructura de la
  -- app, y sin estas filas la app del huésped abre sin menú.
  --
  -- `move` nace apagada, igual que en HUMAYA: el entrenamiento guiado
  -- todavía no es real.
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

  -- ── 2. La fila de ajustes de la pantalla del TV ─────────────────────
  -- Sin ella el panel de TV no tiene dónde guardar el Wi-Fi ni la guía de
  -- la casa. Nace vacía: el clima, la foto y el Wi-Fi son del hotel.
  with nuevas as (
    insert into public.humaya_tv_ajustes (negocio_id, guia)
    values (p_negocio, '{}'::jsonb)
    on conflict (negocio_id) do nothing
    returning 1
  )
  select count(*) into v_tv from nuevas;

  -- ── 3. Los ajustes ──────────────────────────────────────────────────
  -- El bot nace APAGADO, y eso es a propósito: hoy la llave de Anthropic es
  -- una sola para todos los hoteles, así que un bot encendido en un hotel
  -- ajeno lo paga Tony. Se enciende cuando ese hotel tenga su llave.
  --
  -- Y el demo nace apagado porque un hotel de verdad no tiene por qué
  -- ofrecerle a su recepción estadías inventadas.
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

  -- ── 4. La portada interna ───────────────────────────────────────────
  -- Los enlaces que pidió Tony. Cloudbeds entra SOLO si este hotel dice que
  -- sus reservas vienen de Cloudbeds: un botón a un PMS que el hotel no usa
  -- es un botón que no lleva a ninguna parte.
  --
  -- El sitio web no se siembra: solo el hotel sabe cuál es, y un enlace con
  -- la dirección en blanco es un botón roto. Se agrega desde el panel.
  with nuevas as (
    insert into public.humaya_enlaces
      (negocio_id, clave, etiqueta, descripcion, url, icono, orden)
    select p_negocio, d.clave, d.etiqueta, d.descripcion, d.url, d.icono, d.orden
    from (values
      ('recepcion', 'Panel de recepción', 'Llegadas, huéspedes, agenda y Concierge.', v_personal,                     'concierge-bell', 1),
      ('guest',     'App del huésped',    'Lo que ve el huésped en su teléfono.',     v_huesped,                      'smartphone',     2),
      ('vision',    'X10 Vision',         'Contactos, embudo y seguimientos.',        'https://liderax10.com',        'gauge',          3),
      ('cloudbeds', 'Cloudbeds',          'El PMS: tarifas, calendario y reservas.',  'https://hotels.cloudbeds.com', 'calendar-check', 4)
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

revoke all on function public.humaya_sembrar_hotel(uuid) from public;
grant execute on function public.humaya_sembrar_hotel(uuid) to authenticated;

-- ── Crear un hotel deja de ser dos filas ────────────────────────────────
-- Lo único que cambia respecto a la versión anterior es la llamada a
-- `humaya_sembrar_hotel`. El resto va igual, letra por letra: las
-- validaciones del código y del origen eran correctas.
create or replace function public.humaya_crear_hotel(
  p_codigo text,
  p_nombre text,
  p_marca_hotel text,
  p_marca_experiencia text,
  p_correo text,
  p_origen text default 'ninguno'
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_codigo text := lower(btrim(p_codigo));
  v_negocio uuid;
begin
  if not public.humaya_soy_plataforma() then
    raise exception 'solo_plataforma' using errcode = 'insufficient_privilege';
  end if;

  -- El código va en la dirección del huésped (guestexp.liderax10.com/<codigo>),
  -- así que tiene que ser una ruta válida y no chocar con las nuestras.
  if v_codigo !~ '^[a-z0-9][a-z0-9-]{1,39}$' then
    raise exception 'codigo_invalido';
  end if;
  if v_codigo in ('app', 'staff', 'entrada', 'dev', 'assets', 'api') then
    raise exception 'codigo_reservado';
  end if;
  if exists (select 1 from crm_tony_alvarado.cta_negocios where codigo = v_codigo) then
    raise exception 'codigo_ocupado';
  end if;
  if coalesce(p_origen, 'ninguno') not in ('ninguno', 'cloudbeds', 'airbnb_ical') then
    raise exception 'origen_invalido';
  end if;

  insert into crm_tony_alvarado.cta_negocios (id, codigo, nombre, activo)
  values (gen_random_uuid(), v_codigo, btrim(p_nombre), true)
  returning id into v_negocio;

  insert into public.humaya_hoteles
    (negocio_id, marca_hotel, marca_experiencia, correo, origen_reservas, es_demo)
  values (v_negocio, btrim(p_marca_hotel), btrim(p_marca_experiencia),
          btrim(p_correo), coalesce(p_origen, 'ninguno'), false);

  -- Y acá está el arreglo: el hotel nace con su menú, sus ajustes, su fila
  -- de TV y su portada interna. Antes terminaba en la línea de arriba.
  perform public.humaya_sembrar_hotel(v_negocio);

  return v_negocio;
end $function$;

-- ── El relleno de los hoteles que ya existían ───────────────────────────
-- `humaya_sembrar_hotel` exige ser cuenta de plataforma, y una migración
-- corre sin sesión: `auth.uid()` es null y la función rechazaría. Así que el
-- relleno se corrió haciéndose pasar por la cuenta de plataforma de Tony,
-- dentro de una transacción. NO se le quitó el permiso a la función: una
-- comprobación que se afloja para una migración queda floja para siempre.
--
--   begin;
--   set local role authenticated;
--   set local request.jwt.claims = '{"sub":"245710c3-0115-4fed-a9b1-1c9364b743a5"}';
--   select n.codigo, public.humaya_sembrar_hotel(n.id)
--   from crm_tony_alvarado.cta_negocios n
--   join public.humaya_hoteles h on h.negocio_id = n.id
--   order by n.codigo;
--   commit;
--
-- Lo que devolvió, que es la comprobación y no la bandera de «éxito»:
--
--   bikeandbed  {"opciones": 6, "tv_ajustes": 1, "ajustes": 3, "enlaces": 4}
--   demo        {"opciones": 0, "tv_ajustes": 0, "ajustes": 0, "enlaces": 4}
--   humaya      {"opciones": 0, "tv_ajustes": 0, "ajustes": 0, "enlaces": 4}
--
-- Los ceros de demo y humaya son el punto: la siembra no les tocó nada de
-- lo que ya tenían configurado. Solo les agregó la portada, que no existía.
-- Y las direcciones salieron distintas en cada uno, que es lo que había que
-- comprobar:
--
--   humaya      staff.stayhumaya.com/staff   ·  experience.stayhumaya.com
--   demo        hotelexp.liderax10.com/staff ·  guestexp.liderax10.com/demo
--   bikeandbed  hotelexp.liderax10.com/staff ·  guestexp.liderax10.com/bikeandbed
--
-- ⚠️ Y una predicción mía que estaba mal: creí que demo sacaría 3 enlaces
-- porque su dominio propio es localhost. Saca 4. Localhost no entra, pero no
-- por el filtro: entra con `lado = 'ambos'`, y las dos consultas piden
-- `huesped` y `personal`. El filtro de localhost igual se queda, porque un
-- dominio propio marcado `huesped` apuntando a localhost sí pasaría.
--
-- ── Y la prueba de que un hotel NUEVO nace completo ─────────────────────
-- No alcanza con rellenar los que ya existían: lo que había que arreglar era
-- el nacimiento. Se crearon dos hoteles de prueba dentro de transacciones
-- REVERTIDAS, y después se contó que no quedara ninguno (0 negocios
-- `prueba%`, 3 hoteles, 13 enlaces):
--
--   codigo=pruebanacer, origen=cloudbeds
--     → 6 opciones, 3 ajustes, 1 tv_ajustes, 4 enlaces, y la portada con
--       guestexp.liderax10.com/pruebanacer — el código en la ruta, correcto.
--   codigo=pruebasinpms, origen=ninguno
--     → 3 enlaces: recepcion, guest, vision. SIN Cloudbeds.
--
-- Ese segundo caso es el que prueba la condición: si el filtro del PMS no
-- hiciera nada, habrían salido 4.

-- El sitio de HUMAYA sí se sabe, así que entra a mano. El de cada hotel
-- nuevo lo agrega su equipo desde el panel.
insert into public.humaya_enlaces (negocio_id, clave, etiqueta, descripcion, url, icono, orden)
values ('4cb80ad6-1004-4d06-9dfb-946a1718be87', 'sitio', 'Sitio web',
        'stayhumaya.com, lo que ve quien todavía no reservó.',
        'https://stayhumaya.com', 'globe', 5)
on conflict (negocio_id, clave) do nothing;

-- ── ⚠️ Y una mina que apareció escribiendo esto ─────────────────────────
--
-- `src/marca.ts` dice, textual: «las tablas dejaron de tener HUMAYA como
-- valor por defecto justo para que una fila sin hotel se note en vez de caer
-- callada en Humaya».
--
-- **Era falso.** Medido el 24 de noviembre de 2026: ONCE tablas seguían con
--
--   negocio_id default '4cb80ad6-1004-4d06-9dfb-946a1718be87'::uuid
--
-- o sea el uuid de HUMAYA escrito en el esquema. Toda fila insertada sin
-- decir de qué hotel es —un servicio, una villa, un mensaje del Concierge,
-- un tema del bot— caía dentro de HUMAYA sin un solo error. Es el caso que
-- más cuesta: no falla, se equivoca callado.
--
-- Hoy ningún `insert` del repositorio depende de ese valor (se revisaron los
-- 13: todos mandan `negocio_id`), y RLS frenaría a un hotel ajeno. Pero una
-- cuenta de plataforma pasa, y el día que alguien escriba un insert nuevo y
-- se olvide la columna, la fila aparece en el hotel de Tony.
--
-- Comprobado después de quitarlos, metiendo el error a propósito:
--
--   insert into public.humaya_tv_villas (id, nombre) values ('prueba-sin-hotel', 'Sin hotel');
--   → null value in column "negocio_id" violates not-null constraint
--   → 0 filas con ese id
--
-- Antes, esa misma línea habría creado una villa en HUMAYA.
alter table public.humaya_admin_opciones       alter column negocio_id drop default;
alter table public.humaya_concierge_base       alter column negocio_id drop default;
alter table public.humaya_concierge_estado     alter column negocio_id drop default;
alter table public.humaya_concierge_mensajes   alter column negocio_id drop default;
alter table public.humaya_concierge_notas      alter column negocio_id drop default;
alter table public.humaya_concierge_respuestas alter column negocio_id drop default;
alter table public.humaya_concierge_uso        alter column negocio_id drop default;
alter table public.humaya_servicio_reservas    alter column negocio_id drop default;
alter table public.humaya_servicios            alter column negocio_id drop default;
alter table public.humaya_tv_ajustes           alter column negocio_id drop default;
alter table public.humaya_tv_villas            alter column negocio_id drop default;
