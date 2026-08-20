-- 021 — Registro visual de clase: qué hizo cada niño, con foto opcional.
--
-- El profesor, que ya entra a marcar asistencia, deja una nota y opcionalmente
-- una foto de lo que construyó el niño ese día. El acudiente lo ve en el portal.
--
-- DECISIONES DE PRIVACIDAD (son fotos de menores — la categoría más sensible
-- que maneja la plataforma):
--
--   1. CONSENTIMIENTO SEPARADO. Autorizar el tratamiento de datos NO autoriza
--      fotografiar al niño. Es un permiso aparte, apagado por defecto, que el
--      acudiente da y revoca cuando quiera.
--   2. Sin consentimiento no se puede subir foto de ese niño. La nota de texto
--      sí, porque describe la actividad, no la imagen del menor.
--   3. El bucket es PRIVADO. Nunca hay URL pública de la foto de un niño: se
--      sirve con enlaces firmados que expiran, generados en el servidor.
--   4. Las fotos NO aparecen en el perfil público compartible. Un papá puede
--      querer verlas en su portal privado y aun así no querer que circulen por
--      WhatsApp. Son decisiones distintas y aquí solo se habilita la primera.

alter table public.children
  add column if not exists photo_consent boolean not null default false,
  add column if not exists photo_consent_at timestamptz;

comment on column public.children.photo_consent is
  'Autorización explícita del acudiente para tomar y guardar fotos del menor. Apagado por defecto. Independiente de is_public.';

create table if not exists public.class_notes (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  session_id uuid not null references public.class_sessions(id) on delete cascade,
  note text,
  photo_path text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (child_id, session_id)
);

comment on table public.class_notes is
  'Lo que hizo cada niño en cada clase. Una fila por niño por sesión.';

comment on column public.class_notes.photo_path is
  'Ruta dentro del bucket privado class-evidence. Nunca es una URL pública.';

alter table public.class_notes enable row level security;

-- El acudiente puede LEER las notas de sus propios hijos. La escritura es
-- exclusiva del profesor/administrador vía service role — un padre no puede
-- inventar el registro de una clase.
create policy "class_notes: parent reads own children notes"
  on public.class_notes for select
  using (
    child_id in (select id from public.children where parent_id = auth.uid())
  );

create index if not exists class_notes_child_idx on public.class_notes (child_id);
create index if not exists class_notes_session_idx on public.class_notes (session_id);

-- Bucket privado para las fotos. `public = false` es lo que impide que exista
-- una URL abierta a la foto de un menor.
insert into storage.buckets (id, name, public)
values ('class-evidence', 'class-evidence', false)
on conflict (id) do nothing;
