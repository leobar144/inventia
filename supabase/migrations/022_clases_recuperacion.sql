-- 022 — Clases de recuperación.
--
-- Si un niño falta y simplemente pierde la clase, el acudiente pagó 12 y
-- recibió 11. Esa es la queja que termina en cancelación en cualquier negocio
-- de actividades para niños.
--
-- Pero cada recuperación ocupa un cupo de un grupo de 8 que se podría estar
-- vendiendo, así que la política tiene límites (ver lib/makeup.ts):
--   - 1 recuperación por cada 4 clases compradas.
--   - 30 días desde la clase perdida.
--   - La agenda el acudiente, sin intervención del equipo.

create table if not exists public.makeup_bookings (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  missed_session_id uuid not null references public.class_sessions(id) on delete cascade,
  makeup_session_id uuid not null references public.class_sessions(id) on delete cascade,
  created_at timestamptz default now(),
  -- Una clase perdida se recupera una sola vez. Esto es lo que impide que un
  -- doble clic o un reintento consuman dos cupos por la misma falta.
  unique (child_id, missed_session_id)
);

comment on table public.makeup_bookings is
  'Reposición de una clase perdida en otra sesión del mismo curso.';

comment on column public.makeup_bookings.course_id is
  'Se guarda aunque sea derivable de la sesión: el conteo de recuperaciones usadas por curso es la consulta más frecuente.';

alter table public.makeup_bookings enable row level security;

-- El acudiente ve las recuperaciones de sus hijos. La escritura pasa
-- exclusivamente por la ruta del servidor, que es donde se validan el cupo
-- disponible, el plazo de 30 días y el límite del plan.
create policy "makeup_bookings: parent reads own children bookings"
  on public.makeup_bookings for select
  using (
    child_id in (select id from public.children where parent_id = auth.uid())
  );

create index if not exists makeup_bookings_child_course_idx
  on public.makeup_bookings (child_id, course_id);

create index if not exists makeup_bookings_makeup_session_idx
  on public.makeup_bookings (makeup_session_id);
