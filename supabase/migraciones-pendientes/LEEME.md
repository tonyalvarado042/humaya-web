# Migraciones escritas que esperan tu OK

Ahora mismo **no hay ninguna pendiente**.

Lo que se pone acá no está aplicado: son cambios que tocan la seguridad de
producción, y esos los aprueba Tony, no quien programa. Lo que ya entró se
mueve a `../migraciones-aplicadas/`, con la fecha y **los números de la
comprobación** en la cabecera del archivo — no «aplicado y listo», sino qué
devolvía antes y qué devuelve ahora.

## Lo último que entró

`../migraciones-aplicadas/2026-11-24-rls-filtra-por-hotel.sql` — que la base
impida ver el hotel ajeno. 26 políticas. Tony dio el OK el 24 de noviembre de
2026.

⚠️ **Efecto que avisamos y pasó:** quien tenga rol del CRM pero no esté en
ningún hotel deja de ver datos. Hoy eso es `lm@puromtb.com`, medido: pasó de
ver las 67 reservas de HUMAYA a ver 0. Se arregla en Admin → Hoteles → *Quién
trabaja acá*.

## Cómo se aplica una de estas

Desde el editor SQL de Supabase, pegando el archivo entero, en una sola
transacción. Si el archivo es muy grande para la herramienta que estés usando,
no lo partás en pedazos sueltos: generá los `ALTER` desde `pg_policies` con un
bucle que aborte si no cambia la cantidad que esperabas. Así no se queda ni una
tabla a medias ni se cambia una lista de roles por un dedo.

Y después se verifica contra la realidad, no contra la bandera de «éxito»:
con el token de una cuenta asignada a un solo hotel, pedir

    /rest/v1/humaya_cloudbeds_reservas?select=negocio_id&limit=200

y contar. Después **agregarle el otro hotel a la misma cuenta y volver a
pedirlo**: si no cambia el número, lo que estás probando no prueba nada.
