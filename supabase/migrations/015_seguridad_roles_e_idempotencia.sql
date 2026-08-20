-- 015 — Dos correcciones de seguridad encontradas en auditoría.

-- ---------------------------------------------------------------------------
-- 1. CRÍTICO: escalada de privilegios en profiles.role
--
-- La política "profiles: user updates own row" permite UPDATE cuando
-- auth.uid() = id, pero no restringe QUÉ columnas se pueden escribir, y el rol
-- `authenticated` tenía permiso de UPDATE sobre la columna `role`. Resultado:
-- cualquier padre registrado podía ejecutar desde la consola del navegador
--
--   supabase.from('profiles').update({ role: 'admin' }).eq('id', <su propio id>)
--
-- y quedar como admin — con acceso a los datos de todos los niños, los
-- teléfonos y correos de todos los padres, y todos los pagos.
--
-- Se arregla a nivel de permisos de Postgres (más fuerte que una política RLS):
-- `authenticated` simplemente pierde la capacidad de escribir esa columna.
-- Los cambios de rol legítimos ya se hacen con el service role
-- (app/api/admin/instructors/route.ts), que no se ve afectado.
revoke update on public.profiles from authenticated, anon;
grant update (full_name, phone) on public.profiles to authenticated;

-- `anon` no tiene por qué escribir perfiles en absoluto.
revoke insert on public.profiles from anon;

-- ---------------------------------------------------------------------------
-- 2. DINERO REAL: el webhook de Wompi no era idempotente
--
-- Wompi reintenta los webhooks (ante timeout o respuesta no-2xx). Como no había
-- ninguna restricción sobre source_payment_id, cada reintento del mismo evento
-- APPROVED insertaba OTRO crédito de $50.000 para el mismo referidor. Un solo
-- referido podía generar varios créditos.
--
-- El índice único hace que el segundo insert falle en vez de duplicar plata.
create unique index if not exists referral_credits_source_payment_unique
  on public.referral_credits (source_payment_id)
  where source_payment_id is not null;

-- ---------------------------------------------------------------------------
-- 3. Endurecer handle_new_user (advisor de Supabase)
--
-- search_path mutable en una función SECURITY DEFINER permite, a quien pueda
-- crear objetos en un esquema del search_path, secuestrar a qué tabla apunta
-- `public.profiles`. Se fija explícitamente.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'parent'
  );
  return new;
end;
$function$;

-- Es una función de trigger: nadie debería poder invocarla vía /rest/v1/rpc.
revoke execute on function public.handle_new_user() from anon, authenticated;
