-- Cloudbeds: la ficha es la de ESTE hotel, no la lista de todos
--
-- ── DE DÓNDE SALE ──────────────────────────────────────────────────────
-- Tony, 26 de noviembre de 2026, con Bike & Bed abierto en el iPad:
-- «sigues aún revolviendo hoteles, te he dicho mil veces, estoy en bike and
-- bed y sale Humaya. ¿Por qué?».
--
-- Tenía razón. `humaya_cloudbeds_estado()` no recibía ningún hotel: devolvía
-- TODOS los que hay, con su número de propiedad y su conteo de reservas.
-- La pantalla los pintaba en fila, así que estando dentro de Bike & Bed se
-- veía la propiedad de HUMAYA y sus 68 reservas.
--
-- No alcanzaba con esconderlos en la pantalla: los datos del otro hotel
-- igual viajaban al navegador. Ahora la función recibe el hotel y devuelve
-- una fila o ninguna.
--
-- ── LO QUE NO CAMBIA ───────────────────────────────────────────────────
-- Sigue siendo solo de plataforma. Esto no abre el permiso a nadie nuevo:
-- acota lo que ve quien ya podía entrar.

create or replace function public.humaya_cloudbeds_estado(p_negocio uuid)
returns table(
  negocio_id uuid,
  codigo text,
  nombre text,
  origen_reservas text,
  property_id text,
  llave_propia boolean,
  llave_propia_desde timestamptz,
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
    (select count(*) from public.humaya_cloudbeds_reservas r
      where r.property_id = p.property_id)
  from public.humaya_hoteles h
  join crm_tony_alvarado.cta_negocios n on n.id = h.negocio_id
  left join public.humaya_propiedades p on p.negocio_id = h.negocio_id
  where h.negocio_id = p_negocio
    and public.humaya_soy_plataforma();
$function$;

grant execute on function public.humaya_cloudbeds_estado(uuid) to authenticated;

-- La vieja, sin hotel, se borra DESPUÉS de que la app nueva esté al aire:
-- borrarla antes deja la pantalla en vivo sin de dónde leer.
-- drop function if exists public.humaya_cloudbeds_estado();
