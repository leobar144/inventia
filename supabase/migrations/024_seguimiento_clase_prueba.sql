-- 024 — Seguimiento después de la clase de prueba.
--
-- Hoy una familia reserva, asiste… y no vuelve a saber de INVENTIA. Ahí es
-- donde se fuga el embudo: ya conocieron el producto y nadie les vuelve a
-- hablar.
--
-- Secuencia de dos toques, ambos disparados por el cron diario que ya existe
-- (no se crea un cron nuevo: el plan gratuito de Vercel los limita):
--   Día +1: "¿Cómo le fue?" — agradecimiento y enlace a los planes.
--   Día +4: "Todavía guardamos el cupo" — urgencia suave y última llamada.
--
-- La secuencia se detiene sola si la familia ya se inscribió: mandarle
-- "vuelve a inscribirte" a alguien que ya pagó es la peor forma de arrancar
-- una relación.

alter table public.trial_bookings
  add column if not exists follow_up_1_sent boolean not null default false,
  add column if not exists follow_up_2_sent boolean not null default false;

comment on column public.trial_bookings.follow_up_1_sent is
  'Correo de seguimiento del día +1 tras la clase de prueba.';

comment on column public.trial_bookings.follow_up_2_sent is
  'Correo de seguimiento del día +4, con urgencia suave.';

create index if not exists trial_bookings_follow_up_idx
  on public.trial_bookings (booking_date)
  where follow_up_1_sent = false or follow_up_2_sent = false;
