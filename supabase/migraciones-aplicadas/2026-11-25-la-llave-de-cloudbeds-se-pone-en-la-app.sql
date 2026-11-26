-- La llave de Cloudbeds se pone en la app, no en el CRM
-- =====================================================
--
-- Tony, 25 de noviembre de 2026, mirando Admin en hotelexp.liderax10.com:
-- «Ya tengo la API de Cloudbeds, pero no hay pantalla donde ponerla». No la
-- había. La única pantalla que guardaba llaves de Cloudbeds vivía en el CRM
-- (Ari ARM), y ese es el CRM de Tony — no el panel de un hotel.
--
-- El mismo día, sobre eso: «Hotel Experience, que es la aplicación que
-- estamos haciendo ahorita, yo esta aplicación la desligaría del CRM para que
-- no intervenga con el mismo».
--
-- ── POR QUÉ NO SE REUSÓ `cta_guardar_secreto` ───────────────────────────
-- Porque exige `crm_tony_alvarado.cta_es('administrador')`: el rol en la
-- tabla de usuarios DEL CRM. Llamarla desde Hotel Experience habría dejado la
-- app colgando del CRM justamente donde Tony pidió separarlos, y habría hecho
-- que conectar un hotel dependiera de tener rol en un producto distinto.
--
-- Estas tres piden `humaya_soy_plataforma()`, que es el permiso propio de
-- esta app. Hoy las dos dan lo mismo para Tony —es administrador Y plataforma,
-- comprobado— pero mañana un socio puede ser plataforma sin tocar el CRM.
--
-- ── POR QUÉ EL NOMBRE DEL SECRETO NO SE INVENTA ─────────────────────────
-- `CLOUDBEDS_API_KEY_<propertyID>` es el nombre EXACTO que busca la Edge
-- Function `cloudbeds-conectar` en `llaveDe()`. Cambiarlo acá dejaría la
-- llave guardada y al servidor sin encontrarla: guardar sin servir.

-- ── 1. Qué hotel está conectado y cuál no ───────────────────────────────
-- Devuelve TODOS los hoteles, no solo los conectados: la pantalla tiene que
-- poder mostrar «este todavía no tiene propiedad» y ofrecer el campo. Un
-- listado de solo-conectados no deja conectar al primero.
--
-- Nunca devuelve el valor de ninguna llave: solo si existe y de cuándo es.
-- Un secreto que se puede volver a leer deja de ser secreto.
create or replace function public.humaya_cloudbeds_estado()
returns table(
  negocio_id uuid,
  codigo text,
  nombre text,
  origen_reservas text,
  property_id text,
  llave_propia boolean,
  llave_propia_desde timestamptz,
  llave_general boolean,
  reservas bigint
)
language sql
stable
security definer
set search_path to ''
as $function$
  select
    h.negocio_id,
    n.codigo,
    n.nombre,
    h.origen_reservas,
    p.property_id,
    exists (
      select 1 from vault.secrets v
       where v.name = 'CLOUDBEDS_API_KEY_' || p.property_id
    ),
    (select v.updated_at from vault.secrets v
      where v.name = 'CLOUDBEDS_API_KEY_' || p.property_id),
    exists (select 1 from vault.secrets v where v.name = 'CLOUDBEDS_API_KEY'),
    (select count(*) from public.humaya_cloudbeds_reservas r
      where r.property_id = p.property_id)
  from public.humaya_hoteles h
  join crm_tony_alvarado.cta_negocios n on n.id = h.negocio_id
  left join public.humaya_propiedades p on p.negocio_id = h.negocio_id
  where public.humaya_soy_plataforma()
  order by n.codigo;
$function$;

-- ── 2. Ligar un hotel a su propiedad de Cloudbeds ───────────────────────
create or replace function public.humaya_cloudbeds_conectar(
  p_negocio uuid,
  p_property_id text
)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_nombre text;
begin
  if not public.humaya_soy_plataforma() then
    raise exception 'solo_plataforma' using errcode = 'insufficient_privilege';
  end if;

  -- El número de propiedad de Cloudbeds son solo dígitos. Sin esto, un
  -- copiado con la URL entera adentro se guarda igual y el servidor pide
  -- reservas de una propiedad que no existe.
  if p_property_id !~ '^[0-9]{6,24}$' then
    raise exception 'property_id_invalido';
  end if;

  select n.nombre into v_nombre
    from crm_tony_alvarado.cta_negocios n where n.id = p_negocio;
  if v_nombre is null then
    raise exception 'hotel_no_existe';
  end if;

  -- Ya es de otro hotel: no se le roba en silencio. Si pasara, las reservas
  -- de ese hotel empezarían a caer en este sin que nadie se entere.
  if exists (
    select 1 from public.humaya_propiedades
     where property_id = p_property_id and negocio_id <> p_negocio
  ) then
    raise exception 'property_id_de_otro_hotel';
  end if;

  -- Corregir un número mal puesto cambia la fila del hotel; no se borra
  -- nada. Las reservas ya recibidas guardan su propio `property_id`, así
  -- que lo viejo queda en pie y solo cambia hacia dónde apunta de ahora en
  -- adelante.
  if exists (select 1 from public.humaya_propiedades where negocio_id = p_negocio) then
    update public.humaya_propiedades
       set property_id = p_property_id, nombre = v_nombre
     where negocio_id = p_negocio;
  else
    insert into public.humaya_propiedades (property_id, negocio_id, nombre)
    values (p_property_id, p_negocio, v_nombre);
  end if;
end $function$;

-- ── 3. Guardar la llave de ese hotel en la bóveda ───────────────────────
create or replace function public.humaya_cloudbeds_guardar_llave(
  p_property_id text,
  p_llave text
)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_nombre text;
  v_id uuid;
  v_limpia text;
begin
  if not public.humaya_soy_plataforma() then
    raise exception 'solo_plataforma' using errcode = 'insufficient_privilege';
  end if;

  if p_property_id !~ '^[0-9]{6,24}$' then
    raise exception 'property_id_invalido';
  end if;

  -- Primero el hotel, después su llave. Al revés quedaría un secreto
  -- guardado para una propiedad que nadie reclama, y nadie lo vería nunca.
  if not exists (
    select 1 from public.humaya_propiedades where property_id = p_property_id
  ) then
    raise exception 'propiedad_no_registrada';
  end if;

  v_limpia := btrim(coalesce(p_llave, ''));
  if v_limpia = '' then
    raise exception 'llave_vacia';
  end if;
  -- Las de Cloudbeds son largas. Veinte es holgado: ataja el campo con tres
  -- letras de un copiado a medias, sin casarse con el prefijo `cbat_` por si
  -- Cloudbeds lo cambia.
  if length(v_limpia) < 20 then
    raise exception 'llave_muy_corta';
  end if;

  v_nombre := 'CLOUDBEDS_API_KEY_' || p_property_id;

  select v.id into v_id from vault.secrets v where v.name = v_nombre;
  if found then
    perform vault.update_secret(v_id, v_limpia);
  else
    perform vault.create_secret(
      v_limpia, v_nombre,
      'Puesta desde Hotel Experience. Solo la lee el servidor.'
    );
  end if;
  return true;
end $function$;

grant execute on function public.humaya_cloudbeds_estado() to authenticated;
grant execute on function public.humaya_cloudbeds_conectar(uuid, text) to authenticated;
grant execute on function public.humaya_cloudbeds_guardar_llave(text, text) to authenticated;
