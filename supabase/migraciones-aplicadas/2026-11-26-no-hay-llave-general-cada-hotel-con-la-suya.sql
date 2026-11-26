-- HUMAYA · Método Humaya — se acabó la llave general de Cloudbeds
--
-- Tony, 26 de noviembre de 2026:
--   «cada hotel es una propiedad totalmente independiente, te lo he dicho en
--    múltiples ocasiones, y (…) no puede revolverse una con otra en
--    absolutamente nada. (…) lo que estás diciendo aquí, que si la función
--    cuando se crea el hotel utiliza una llave general, no tiene absolutamente
--    ninguna validez ni lógica».
--
-- Tenía razón. Había una llave `CLOUDBEDS_API_KEY` sin hotel, y dos funciones
-- del servidor caían en ella cuando al hotel le faltaba la suya. Eso no daba
-- error: daba un hotel preguntándole a Cloudbeds con las credenciales de otro.
--
-- Las dos funciones del servidor ya no la leen (cloudbeds-conectar y
-- cloudbeds-webhook). Esta migración quita lo último que quedaba: la columna
-- `llave_general` que `humaya_cloudbeds_estado` le devolvía a la pantalla, y
-- con la que la pantalla dibujaba la etiqueta «usa la llave general».
--
-- Un dato que informa de un respaldo que ya no existe es peor que no tenerlo:
-- la pantalla diría que un hotel está cubierto cuando no lo está.
--
-- El secreto `CLOUDBEDS_API_KEY` sigue en la bóveda, ya sin lector. Borrarlo
-- es destructivo y lo decide Tony; mientras tanto no hace nada.

drop function if exists public.humaya_cloudbeds_estado();

create function public.humaya_cloudbeds_estado()
returns table (
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
as $$
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
  where public.humaya_soy_plataforma()
  order by n.codigo;
$$;

grant execute on function public.humaya_cloudbeds_estado() to authenticated;
