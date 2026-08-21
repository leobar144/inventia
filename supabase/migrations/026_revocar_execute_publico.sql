-- 026 — Cerrar de verdad el acceso público a handle_new_user().
--
-- En las migraciones 015 y 016 escribí:
--     revoke execute on function public.handle_new_user() from anon, authenticated;
-- y di el problema por resuelto. No lo estaba.
--
-- `anon` y `authenticated` nunca tuvieron un permiso DIRECTO sobre la función:
-- lo heredaban de PUBLIC, que es a quien PostgreSQL le concede EXECUTE por
-- defecto al crear una función. Revocarle a los roles que no lo tenían
-- directamente no hace nada. En la lista de permisos se veía así:
--
--     {=X/postgres, postgres=X/postgres, service_role=X/postgres}
--       ↑ ese "=X" sin nombre de rol ES el permiso a PUBLIC
--
-- Resultado: la función seguía siendo invocable por cualquiera vía
-- /rest/v1/rpc/handle_new_user. En la práctica fallaba (es una función de
-- trigger: sin `new` definido lanza error en vez de insertar), pero exponer una
-- función SECURITY DEFINER en la API pública no tiene por qué estar ahí.
--
-- El trigger corre sobre auth.users, donde inserta `supabase_auth_admin`, así
-- que se le concede EXECUTE explícitamente ANTES de quitar el de PUBLIC — si no,
-- se rompe el registro de usuarios nuevos.

grant execute on function public.handle_new_user() to supabase_auth_admin;

revoke execute on function public.handle_new_user() from public;
