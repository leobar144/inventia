-- 033 — Sala de Tareas: asesoría en tareas escolares.
--
-- POR QUÉ UN MODELO APARTE Y NO UN CURSO MÁS
--
-- Tentación obvia: crear un curso "Asesoría de tareas" y reusar todo. No
-- funciona, y romperlo después sale caro:
--
--   - Un curso tiene currículo y sesiones NUMERADAS en secuencia (Clase 1, 2,
--     3…). La tarea no tiene secuencia: el niño llega con lo que le dejaron hoy.
--   - `enrollments.classes_purchased` es el denominador del % de avance. Aquí no
--     hay avance que medir: no se "termina" la asesoría de tareas.
--   - Las insignias cuentan `class_attendance`. Un niño que va 5 tardes por
--     semana llegaría a Maestro Inventor en un mes sin haber construido un
--     robot, y la insignia dejaría de significar algo.
--   - El panel de ocupación calcula margen asumiendo un instructor por grupo de
--     8 de UN curso. La sala tiene edades y colegios mezclados, cupo 12 y un
--     monitor más económico.
--   - Las clases de recuperación no aplican: no hay tema perdido que reponer.
--
-- Por eso: tablas propias, pequeñas, sin tocar las de cursos.
--
-- LO QUE SÍ SE COMPARTE: `payments`. La plata de la sala tiene que entrar por
-- el mismo lado que la de los cursos, o la contabilidad queda partida en dos y
-- el panel de métricas miente. Ver el ALTER más abajo.

-- ---------------------------------------------------------------------------
-- 1. Planes
--
-- Viven en base de datos, no en código, por la misma razón que
-- `course_plan_prices`: el precio se ajusta sin desplegar.

create table if not exists public.tutoring_plans (
  id text primary key,                -- 'dos-tardes' | 'tres-tardes' | 'todas'
  name text not null,
  sessions_per_week int not null,
  sessions_included int not null,     -- tardes incluidas en el mes
  price int not null,                 -- pesos, sin centavos
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

comment on table public.tutoring_plans is
  'Planes de la Sala de Tareas. El precio vive aqui, nunca en el codigo.';

comment on column public.tutoring_plans.sessions_included is
  'Tardes que cubre la mensualidad. Es el denominador de "te quedan N tardes".';

-- 4,33 semanas por mes: 2 tardes -> 9, 3 -> 13, 5 -> 22.
insert into public.tutoring_plans (id, name, sessions_per_week, sessions_included, price, sort_order)
values
  ('dos-tardes',  'Dos tardes por semana',  2,  9, 240000, 1),
  ('tres-tardes', 'Tres tardes por semana', 3, 13, 330000, 2),
  ('todas',       'Todas las tardes',       5, 22, 480000, 3)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Bloques: el calendario real de tardes

create table if not exists public.tutoring_blocks (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  monitor_id uuid references public.profiles(id) on delete set null,
  capacity int not null default 12,
  modality text not null default 'presencial',
  meeting_link text,
  notes text,
  created_at timestamptz default now(),
  constraint tutoring_blocks_modality_check
    check (modality in ('presencial', 'virtual')),
  constraint tutoring_blocks_horario_check check (ends_at > starts_at)
);

comment on table public.tutoring_blocks is
  'Cada tarde de sala. timestamptz, no timestamp: la migracion 027 ya nos costo un bug de 5 horas.';

comment on column public.tutoring_blocks.monitor_id is
  'El monitor es un profile con role=instructor. No se crea un rol nuevo: seria una ruta de autenticacion mas que mantener y proteger.';

-- ---------------------------------------------------------------------------
-- 3. Membresías: la mensualidad de un niño

create table if not exists public.tutoring_memberships (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  plan_id text not null references public.tutoring_plans(id),
  status text not null default 'pending_payment',
  sessions_included int not null,
  starts_on date not null,
  ends_on date not null,
  renewal_alert_sent boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint tutoring_memberships_status_check
    check (status in ('pending_payment', 'active', 'expired', 'cancelled'))
);

comment on column public.tutoring_memberships.sessions_included is
  'Copia del plan al momento de comprar. Si manana el plan cambia de 13 a 12 tardes, a quien ya pago no se le recorta.';

-- ---------------------------------------------------------------------------
-- 4. Asistencia + bitácora de tarea
--
-- Esta tabla ES el producto. Lo que la competencia de Bogotá no entrega: el
-- papá sabe el mismo día qué materia trabajó su hijo, en qué se atascó y si usó
-- inteligencia artificial — y cómo.
--
-- `ai_use` no es moralina: los colegios ya están pidiendo que el alumno declare
-- cómo usó la IA. Aquí queda registrado por un adulto que estaba presente.

create table if not exists public.tutoring_attendance (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  block_id uuid not null references public.tutoring_blocks(id) on delete cascade,
  membership_id uuid references public.tutoring_memberships(id) on delete set null,
  subjects text[] not null default '{}',
  what_was_done text,
  stuck_on text,
  ai_use text not null default 'no',
  ai_note text,
  homework_completed boolean,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (child_id, block_id),
  constraint tutoring_attendance_ai_use_check
    check (ai_use in ('no', 'consulta', 'verificacion', 'la-hizo'))
);

comment on column public.tutoring_attendance.stuck_on is
  'En que se atasco. Tres veces el mismo tema en cinco tardes dispara alerta al acudiente: eso es lo que ningun profesor particular hace.';

comment on column public.tutoring_attendance.ai_use is
  'no | consulta (pregunto y entendio) | verificacion (reviso lo que ya habia hecho) | la-hizo (la IA resolvio la tarea). El ultimo es el que hay que conversar con la familia.';

-- ---------------------------------------------------------------------------
-- 5. Pagos: una sola caja
--
-- `enrollment_id` era NOT NULL porque lo único que se vendía eran cursos. Se
-- relaja y se agrega la membresía, con un CHECK que obliga a que el pago apunte
-- a exactamente una de las dos cosas — nunca a ninguna, nunca a ambas.

alter table public.payments
  alter column enrollment_id drop not null,
  add column if not exists tutoring_membership_id uuid
    references public.tutoring_memberships(id) on delete set null;

alter table public.payments
  drop constraint if exists payments_destino_check;

alter table public.payments
  add constraint payments_destino_check check (
    (enrollment_id is not null and tutoring_membership_id is null) or
    (enrollment_id is null and tutoring_membership_id is not null)
  );

comment on column public.payments.tutoring_membership_id is
  'Pago de Sala de Tareas. Excluyente con enrollment_id: un pago es de un curso o de la sala, nunca de los dos.';

-- ---------------------------------------------------------------------------
-- 6. RLS
--
-- Mismo criterio de siempre: lo público se lee público, lo del niño lo lee su
-- acudiente, y TODA escritura pasa por service role desde una ruta de servidor
-- que ya verificó quién llama.

alter table public.tutoring_plans enable row level security;
alter table public.tutoring_blocks enable row level security;
alter table public.tutoring_memberships enable row level security;
alter table public.tutoring_attendance enable row level security;

-- Precios y horarios son información comercial: la página pública los muestra.
create policy "tutoring_plans: public read"
  on public.tutoring_plans for select
  using (is_active = true);

create policy "tutoring_blocks: public read"
  on public.tutoring_blocks for select
  using (true);

create policy "tutoring_memberships: parent reads own children"
  on public.tutoring_memberships for select
  using (child_id in (select id from public.children where parent_id = auth.uid()));

-- La bitácora la escribe el monitor vía service role. Un padre no puede
-- inventar que su hijo asistió, ni borrar un "la IA le hizo la tarea".
create policy "tutoring_attendance: parent reads own children"
  on public.tutoring_attendance for select
  using (child_id in (select id from public.children where parent_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- 7. Índices

create index if not exists tutoring_blocks_starts_idx
  on public.tutoring_blocks (starts_at);
create index if not exists tutoring_blocks_monitor_idx
  on public.tutoring_blocks (monitor_id);
create index if not exists tutoring_memberships_child_idx
  on public.tutoring_memberships (child_id);
create index if not exists tutoring_memberships_status_idx
  on public.tutoring_memberships (status, ends_on);
create index if not exists tutoring_attendance_child_idx
  on public.tutoring_attendance (child_id, created_at desc);
create index if not exists tutoring_attendance_block_idx
  on public.tutoring_attendance (block_id);
create index if not exists payments_membership_idx
  on public.payments (tutoring_membership_id);
