-- ============================================================
-- Acceso de profesores: cada curso queda asignado a un profesor
-- (profiles.role = 'instructor'), quien ve solo sus propias clases.
-- ============================================================

alter table courses add column if not exists instructor_id uuid references profiles(id);

-- No se agregan policies de select/insert nuevas: el acceso de profesores
-- se resuelve igual que /admin, vía service role desde rutas del servidor
-- que verifican profiles.role = 'instructor' (o 'admin') antes de responder.
