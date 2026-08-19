-- ============================================================
-- Conecta cada curso a un nivel del Método CREA (lib/curriculum.ts)
-- y cada sesión de clase a su número de módulo dentro de ese nivel,
-- para que el camino de clases del padre y la vista del profesor
-- muestren el nombre real del módulo en vez de "Clase 1, 2, 3...".
-- ============================================================

alter table courses add column if not exists curriculum_level_id text;
alter table class_sessions add column if not exists module_number int;
