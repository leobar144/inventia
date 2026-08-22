-- 031 — Límite de envíos en los formularios públicos.
--
-- `/api/trial-bookings` y `/api/school-leads` aceptaban envíos sin ningún tope.
-- Cualquiera podía automatizar cientos de reservas falsas y provocar dos daños:
--
--   1. Llenar la agenda con horarios ocupados que no existen.
--   2. Agotar la cuota mensual de Resend. Este es el peligroso: no se ve venir,
--      y el día que se acaba **dejan de salir los recordatorios de clase de las
--      familias reales**. El ataque no se nota; simplemente los clientes dejan
--      de recibir correos.
--
-- Se guarda un HASH de la IP, nunca la IP en claro: alcanza para contar envíos
-- del mismo origen sin conservar un dato personal identificable, que bajo la
-- Ley 1581 obligaría a declararlo en la política de tratamiento.
--
-- La lógica vive en lib/rateLimit.ts y falla en abierto: si esta tabla da error,
-- se deja pasar la petición. Un problema del control antiabuso no puede impedir
-- que una familia real agende su clase.

create table if not exists public.rate_limits (
  id bigserial primary key,
  key_hash text not null,
  endpoint text not null,
  created_at timestamptz not null default now()
);

comment on table public.rate_limits is
  'Registro de envíos a formularios públicos para limitar abuso. La llave es un HASH de la IP, nunca la IP en claro.';

create index if not exists rate_limits_lookup
  on public.rate_limits (endpoint, key_hash, created_at desc);

-- Mismo patrón que class_attendance y trial_bookings: RLS activo sin políticas.
-- Solo se toca con service role desde el servidor.
alter table public.rate_limits enable row level security;
