-- 025 — Canal institucional: jardines infantiles y colegios.
--
-- Vender a un jardín son 20 o 30 niños de una sola conversación, con grupos
-- llenos desde el día uno y cero costo de adquisición por familia. Es la
-- palanca de crecimiento más grande del negocio.
--
-- El modelo comercial (¿paga la institución o pagan las familias?) todavía no
-- está definido: se decide con los primeros jardines que respondan. Por eso
-- esta tabla solo capta el interés y deja el resto abierto.

create table if not exists public.school_leads (
  id uuid primary key default gen_random_uuid(),
  institution_name text not null,
  contact_name text not null,
  contact_role text,
  email text not null,
  phone text not null,
  student_count int,
  grades text,
  message text,
  status text not null default 'nuevo',
  created_at timestamptz default now()
);

comment on table public.school_leads is
  'Jardines y colegios interesados. Canal B2B.';

comment on column public.school_leads.status is
  'nuevo | contactado | propuesta | cerrado | descartado';

-- Mismo patrón que trial_bookings: RLS activo y sin políticas. Son datos
-- comerciales sensibles y solo se leen con service role desde /admin.
alter table public.school_leads enable row level security;
