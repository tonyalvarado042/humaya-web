-- ========================================================================
--  EL PISO DEL MULTI-HOTEL: que la BASE no deje ver el hotel ajeno
--  Escrito y APLICADO el 24 de noviembre de 2026, con el OK de Tony.
--
--  -- COMO SE APLICO, QUE NO FUE PEGANDO ESTE ARCHIVO ---------------------
--  Los 26 ALTER de abajo son el estado FINAL, y sirven para leer qué quedó.
--  Mandarlos en una sola peticion murio dos veces por tamaño, asi que se
--  aplico un bucle que los genera desde `pg_policies`: lee la condicion
--  actual de cada politica y le suma ` and public.humaya_puedo_ver(...)`.
--  Mas seguro que esto, no menos: no puede saltarse una politica ni
--  cambiarle la lista de roles por un error de transcripcion. El bucle
--  aborta si no cambia exactamente 26.
--
--  -- VERIFICADO, NO SUPUESTO ---------------------------------------------
--  Antes:  lm@puromtb.com, sin NINGUN hotel asignado -> 67 reservas, 3 hoteles.
--          Un usuario inexistente -> 0. (O sea: la medicion distingue.)
--  Despues:
--    * lm@puromtb.com                    -> 0 reservas, 0 hoteles, 0 todo.
--    * aalvarado@gmail.com (plataforma)  -> 67 reservas, 3 hoteles, 12 villas.
--    * cuenta de prueba en Bike & Bed    -> 0 reservas, 1 hotel (el suyo).
--      la MISMA cuenta, agregada a HUMAYA -> 67 reservas, 2 hoteles.
--      (asi se prueba que el 0 era una negacion y no una consulta rota)
--    * escribir en su hotel  -> 204, 1 fila cambiada (y revertida).
--    * insertar en el hotel ajeno -> 42501 "new row violates row-level
--      security policy".
--  Y recepcion abierta de verdad con esa cuenta: entra, lista el menu del
--  hotel (6 opciones) y sus 2 televisores. Cuenta borrada al terminar.
--
--  Eran 26 politicas, no 25 como decia el LEEME.
-- ========================================================================
--
-- -- EL AGUJERO, MEDIDO --------------------------------------------------
-- RLS esta prendido en las 17 tablas humaya_*, pero NINGUNA politica mira
-- negocio_id. Todas preguntan solo <<tenes un rol del CRM?>>:
--
--     crm_tony_alvarado.cta_es('administrador','operaciones','vendedor','lectura')
--
-- Probado, no supuesto: una cuenta de recepcion asignada UNICAMENTE al
-- hotel pruebahotel pidio
--
--     GET /rest/v1/humaya_cloudbeds_reservas?select=negocio_id&limit=200
--
-- y recibio las 67 reservas de HUMAYA: nombres, correos, fechas y villas
-- de huespedes reales de otro hotel. Una sola peticion.
--
-- El filtro por hotel vive hoy en la pantalla (.eq('negocio_id', ...)), y
-- una pantalla se salta con curl.
--
-- -- QUE NO ROMPE --------------------------------------------------------
-- El huesped. No lee estas tablas: entra por las Edge Functions, que usan
-- la llave de servicio y no pasan por RLS.
--
-- -- OJO: QUE SI CAMBIA --------------------------------------------------
-- Quien tenga rol del CRM pero no este en cta_usuario_negocios ni sea
-- es_plataforma deja de ver datos de cualquier hotel. Hoy eso alcanza a
-- lm@puromtb.com. Se arregla en Admin -> Hoteles -> Quien trabaja aca.

create or replace function public.humaya_puedo_ver(p_negocio uuid)
returns boolean
language sql stable security definer
set search_path to ''
as $function$
  select exists (
    select 1 from crm_tony_alvarado.cta_usuarios u
    where u.id = auth.uid()
      and u.activo
      and (
        u.es_plataforma
        or exists (
          select 1 from crm_tony_alvarado.cta_usuario_negocios un
          where un.usuario_id = u.id and un.negocio_id = p_negocio
        )
      )
  );
$function$;

grant execute on function public.humaya_puedo_ver(uuid) to authenticated;

-- ALTER y no DROP+CREATE: asi ninguna tabla queda sin politica ni un
-- instante. Cada politica conserva su condicion y le suma el filtro.

alter policy humaya_admin_opciones_admin on public.humaya_admin_opciones using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text])) and public.humaya_puedo_ver(negocio_id)) with check ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_admin_opciones_equipo on public.humaya_admin_opciones using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text, 'operaciones'::text, 'vendedor'::text, 'lectura'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_ajustes_admin on public.humaya_ajustes using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text])) and public.humaya_puedo_ver(negocio_id)) with check ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_ajustes_equipo on public.humaya_ajustes using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text, 'operaciones'::text, 'vendedor'::text, 'lectura'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_cloudbeds_reservas_equipo on public.humaya_cloudbeds_reservas using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text, 'operaciones'::text, 'vendedor'::text, 'lectura'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_concierge_base_admin on public.humaya_concierge_base using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text])) and public.humaya_puedo_ver(negocio_id)) with check ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_concierge_base_equipo on public.humaya_concierge_base using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text, 'operaciones'::text, 'vendedor'::text, 'lectura'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_estado_equipo on public.humaya_concierge_estado using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text, 'operaciones'::text, 'vendedor'::text, 'lectura'::text])) and public.humaya_puedo_ver(negocio_id)) with check ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text, 'operaciones'::text, 'vendedor'::text, 'lectura'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_concierge_mensajes_equipo on public.humaya_concierge_mensajes using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text, 'operaciones'::text, 'vendedor'::text, 'lectura'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_notas_equipo on public.humaya_concierge_notas using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text, 'operaciones'::text, 'vendedor'::text, 'lectura'::text])) and public.humaya_puedo_ver(negocio_id)) with check ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text, 'operaciones'::text, 'vendedor'::text, 'lectura'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_respuestas_admin on public.humaya_concierge_respuestas using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text])) and public.humaya_puedo_ver(negocio_id)) with check ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_respuestas_equipo on public.humaya_concierge_respuestas using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text, 'operaciones'::text, 'vendedor'::text, 'lectura'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_concierge_uso_equipo on public.humaya_concierge_uso using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text, 'operaciones'::text, 'vendedor'::text, 'lectura'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_dominios_admin on public.humaya_dominios using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text])) and public.humaya_puedo_ver(negocio_id)) with check ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_dominios_equipo on public.humaya_dominios using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text, 'operaciones'::text, 'vendedor'::text, 'lectura'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_hoteles_admin on public.humaya_hoteles using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text])) and public.humaya_puedo_ver(negocio_id)) with check ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_hoteles_equipo on public.humaya_hoteles using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text, 'operaciones'::text, 'vendedor'::text, 'lectura'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_propiedades_admin on public.humaya_propiedades using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text])) and public.humaya_puedo_ver(negocio_id)) with check ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_propiedades_equipo on public.humaya_propiedades using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text, 'operaciones'::text, 'vendedor'::text, 'lectura'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_servicio_reservas_equipo on public.humaya_servicio_reservas using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text, 'operaciones'::text, 'vendedor'::text, 'lectura'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_servicios_admin on public.humaya_servicios using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text])) and public.humaya_puedo_ver(negocio_id)) with check ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_servicios_equipo on public.humaya_servicios using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text, 'operaciones'::text, 'vendedor'::text, 'lectura'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_tv_ajustes_admin on public.humaya_tv_ajustes using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text])) and public.humaya_puedo_ver(negocio_id)) with check ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_tv_ajustes_equipo on public.humaya_tv_ajustes using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text, 'operaciones'::text, 'vendedor'::text, 'lectura'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_tv_villas_admin on public.humaya_tv_villas using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text])) and public.humaya_puedo_ver(negocio_id)) with check ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text])) and public.humaya_puedo_ver(negocio_id));
alter policy humaya_tv_villas_equipo on public.humaya_tv_villas using ((crm_tony_alvarado.cta_es(VARIADIC ARRAY['administrador'::text, 'operaciones'::text, 'vendedor'::text, 'lectura'::text])) and public.humaya_puedo_ver(negocio_id));
