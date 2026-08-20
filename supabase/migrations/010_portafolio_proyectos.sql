-- ============================================================
-- Portafolio simple: el padre guarda el link a un proyecto real que
-- hizo su hijo (Scratch, Roblox, etc.) — no alojamos nada nosotros,
-- solo el título y la URL.
-- ============================================================

create table if not exists child_projects (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade not null,
  title text not null,
  url text not null,
  created_at timestamp default now()
);

alter table child_projects enable row level security;

-- Mismo patrón que "children": el padre administra directo (select/insert/
-- delete) los proyectos de sus propios hijos, sin pasar por una API — es
-- información de bajo riesgo que el padre ya controla por completo.
drop policy if exists "child_projects: parent manages own child's projects" on child_projects;
create policy "child_projects: parent manages own child's projects" on child_projects
  for all using (
    child_id in (select id from children where parent_id = auth.uid())
  ) with check (
    child_id in (select id from children where parent_id = auth.uid())
  );
