# Migraciones escritas que esperan tu OK

Lo que hay acá **no está aplicado**. Son cambios que tocan la seguridad de
producción, y esos los aprueba Tony, no quien programa.

| Archivo | Qué hace | Por qué espera |
|---|---|---|
| `rls-filtra-por-hotel.sql` | Que la base impida ver el hotel ajeno | Cambia 25 políticas de seguridad y deja sin acceso a quien no esté asignado a un hotel |

## Cómo se aplica

Desde el editor SQL de Supabase, pegando el archivo entero. Va en una sola
transacción: o entra todo o no entra nada.

Después hay que **verificarlo, no creerle a la bandera**:

1. Entrar a recepción con una cuenta normal y ver que sigue cargando.
2. Con el token de una cuenta asignada a un solo hotel, pedir
   `/rest/v1/humaya_cloudbeds_reservas?select=negocio_id&limit=200` y
   comprobar que **solo** vuelven las de ese hotel.

Hoy esa misma petición devuelve las 67 de HUMAYA a cualquier cuenta de
recepción, sea del hotel que sea.
