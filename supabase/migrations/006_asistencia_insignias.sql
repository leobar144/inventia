-- ============================================================
-- Sistema de asistencia + insignias por nivel
-- ============================================================

-- Contador de clases completadas por niño (fuente para calcular la insignia)
alter table children add column if not exists classes_completed int default 0;

-- Registro de asistencia: qué niño asistió a qué sesión
create table if not exists class_attendance (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade not null,
  session_id uuid references class_sessions(id) on delete cascade not null,
  attended boolean default true,
  created_at timestamp default now(),
  unique (child_id, session_id)
);

alter table class_attendance enable row level security;

-- Sin policies de select/insert para roles normales a propósito: solo se
-- escribe/lee desde app/api/admin/attendance/route.ts con la service role key,
-- después de verificar que quien llama tiene profiles.role = 'admin'.
