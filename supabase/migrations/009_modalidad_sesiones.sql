-- ============================================================
-- Modalidad de cada clase: presencial o virtual. Determina si se
-- muestra el botón de Meet o solo la etiqueta "Presencial" al padre
-- y al profesor. Por defecto 'virtual' (todas las sesiones de hoy
-- ya usan Google Meet).
-- ============================================================

alter table class_sessions add column if not exists modality text default 'virtual';
