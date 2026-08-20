-- 016 — Registro del consentimiento de tratamiento de datos (Ley 1581 de 2012).
--
-- El artículo 9 exige autorización previa, expresa e informada del titular, y el
-- artículo 8 le da derecho a "solicitar prueba de la autorización otorgada".
-- Para poder dar esa prueba hay que guardar CUÁNDO se otorgó y sobre QUÉ versión
-- del texto — no basta con mostrar un checkbox en el formulario.

alter table public.profiles
  add column if not exists data_consent_at timestamptz,
  add column if not exists data_consent_version text;

alter table public.trial_bookings
  add column if not exists data_consent_at timestamptz,
  add column if not exists data_consent_version text;

comment on column public.profiles.data_consent_at is
  'Momento en que el acudiente autorizó el tratamiento de datos. Prueba de la autorización (Ley 1581/2012 art. 8 y 9).';

-- ---------------------------------------------------------------------------
-- handle_new_user: guardar el teléfono y el consentimiento.
--
-- Bug de paso: el formulario de registro sí pedía el WhatsApp y lo mandaba en
-- raw_user_meta_data, pero esta función nunca lo copiaba a profiles.phone — el
-- número quedaba enterrado en auth.users y la tabla profiles siempre con phone
-- nulo. Se corrige aquí, junto con el registro del consentimiento.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  insert into public.profiles (
    id, email, full_name, phone, role, data_consent_at, data_consent_version
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'phone', ''),
    'parent',
    case
      when (new.raw_user_meta_data->>'data_consent') = 'true' then now()
      else null
    end,
    nullif(new.raw_user_meta_data->>'data_consent_version', '')
  );
  return new;
end;
$function$;

revoke execute on function public.handle_new_user() from anon, authenticated;
