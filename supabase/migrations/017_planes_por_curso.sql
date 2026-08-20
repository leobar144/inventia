-- 017 — Resolver la inconsistencia entre "curso" y "plan".
--
-- El sitio de marketing vende PLANES (Mes 4 clases / Trimestre 12 / Semestre 24)
-- pero el checkout vendía CURSOS a un precio plano. Un papá veía "Trimestre
-- $890.000" en la home y "Robótica $340.000" en el portal, sin entender qué
-- estaba comprando.
--
-- A partir de aquí el modelo es explícito:
--   - El CURSO es QUÉ estudia el niño (Scratch, Python, Robótica, IA).
--   - El PLAN es CUÁNTAS clases compra la familia y a qué precio.
--   - El precio vive en la combinación de los dos.

create table if not exists public.course_plan_prices (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  plan_id text not null,          -- 'mes' | 'trimestre' | 'semestre' (ver lib/plans.ts)
  price int not null,             -- en pesos colombianos, sin centavos
  is_active boolean not null default true,
  created_at timestamptz default now(),
  unique (course_id, plan_id)
);

comment on table public.course_plan_prices is
  'Precio de cada combinación curso × plan. Es la única fuente de verdad de lo que paga una familia.';

-- Los precios son información pública: el checkout tiene que poder mostrarlos.
-- La escritura se hace únicamente con service role desde rutas de administración.
alter table public.course_plan_prices enable row level security;

create policy "course_plan_prices: public read"
  on public.course_plan_prices for select
  using (is_active = true);

-- ---------------------------------------------------------------------------
-- La inscripción tiene que recordar QUÉ plan se compró.
--
-- Esto además corrige el cálculo de avance: hoy el denominador es "todas las
-- sesiones que tenga el curso", así que si el administrador crea 30 sesiones,
-- todos los niños quedan midiéndose sobre 30 sin importar que hayan pagado 4.
-- Con classes_purchased cada familia avanza sobre lo que efectivamente compró.
alter table public.enrollments
  add column if not exists plan_id text,
  add column if not exists classes_purchased int;

comment on column public.enrollments.classes_purchased is
  'Número de clases que cubre el plan comprado. Denominador del % de avance.';

comment on column public.courses.price is
  'OBSOLETO desde la migración 017. El precio real vive en course_plan_prices. Se conserva solo por compatibilidad con datos viejos.';

-- ---------------------------------------------------------------------------
-- Semilla: por ahora todos los cursos arrancan con los precios base que ya
-- estaban publicados en el sitio (Mes $340.000 / Trimestre $890.000 /
-- Semestre $1.860.000). La diferenciación de precio por curso es el paso
-- siguiente y se hace actualizando estas filas.
insert into public.course_plan_prices (course_id, plan_id, price)
select c.id, p.plan_id, p.price
from public.courses c
cross join (
  values ('mes', 340000), ('trimestre', 890000), ('semestre', 1860000)
) as p(plan_id, price)
on conflict (course_id, plan_id) do nothing;
