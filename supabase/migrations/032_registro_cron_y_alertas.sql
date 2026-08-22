-- 032 — Bitácora de la tarea diaria.
--
-- El cron de las 7am manda los recordatorios de clase y el seguimiento
-- post-prueba. Si un día deja de ejecutarse —se venció el CRON_SECRET, cambió
-- la configuración de Vercel, falló la consulta— **no pasa nada visible**: los
-- correos simplemente dejan de salir y nadie se entera durante semanas, justo
-- cuando las familias empiezan a faltar a clase sin saber por qué.
--
-- Esta tabla guarda cada corrida. El panel de Métricas muestra una alerta roja
-- si la última fue hace más de 30 horas (corre cada 24) o si terminó con error.
--
-- Las alertas por correo viven en lib/alerts.ts y reutilizan la tabla
-- rate_limits de la migración 031 para no repetir el mismo aviso más de una vez
-- por hora — un fallo que se repite mil veces no puede inundar el correo.

create table if not exists public.cron_runs (
  id bigserial primary key,
  job text not null,
  ok boolean not null,
  reminders_sent int not null default 0,
  follow_ups_sent int not null default 0,
  error text,
  ran_at timestamptz not null default now()
);

comment on table public.cron_runs is
  'Bitácora de la tarea diaria. Sin esto, si el cron deja de correr los recordatorios se apagan en silencio.';

create index if not exists cron_runs_recent on public.cron_runs (job, ran_at desc);

alter table public.cron_runs enable row level security;
