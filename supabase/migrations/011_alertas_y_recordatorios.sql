-- ============================================================
-- Soporte para notificaciones automáticas:
-- - renewal_alert_sent: evita mandar la alerta de renovación más de
--   una vez por inscripción (se dispara cuando quedan pocas clases).
-- - reminder_sent: evita mandar el recordatorio diario de clase más
--   de una vez por sesión.
-- ============================================================

alter table enrollments add column if not exists renewal_alert_sent boolean default false;
alter table class_sessions add column if not exists reminder_sent boolean default false;
