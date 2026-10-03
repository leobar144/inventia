-- 038: constancia del reporte semanal de la Sala de Tareas.
--
-- El reporte semanal es LA promesa de venta del refuerzo ("cada semana usted
-- recibe un reporte de cómo hizo las tareas y cómo usó la IA"). Hasta ahora
-- había bitácora por tarde, pero nadie resumía ni enviaba nada.
--
-- Esta tabla existe para que el envío sea idempotente: el cron corre todos los
-- días (el plan gratuito de Vercel solo permite un cron job), y sin un registro
-- de lo ya enviado, una familia recibiría el mismo reporte siete veces.
--
-- La llave es (child_id, week_start) y no la membresía: una tarde suelta puede
-- quedar sin membresía asociada, y aun así esa familia merece su reporte.

create table if not exists public.tutoring_weekly_reports (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  membership_id uuid references public.tutoring_memberships(id) on delete set null,
  -- Lunes de la semana reportada, en hora de Bogotá.
  week_start date not null,
  attendances int not null default 0,
  sent_at timestamptz not null default now(),
  unique (child_id, week_start)
);

create index if not exists tutoring_weekly_reports_week_idx
  on public.tutoring_weekly_reports (week_start desc);

-- Mismo patrón que el resto de tablas sensibles del proyecto: RLS activo y
-- CERO políticas. Solo se escribe y se lee con service role desde el servidor.
alter table public.tutoring_weekly_reports enable row level security;

comment on table public.tutoring_weekly_reports is
  'Un registro por nino y semana reportada. Evita que el cron diario reenvie el mismo reporte.';
