-- ============================================================
-- Asistente de reserva de clase de prueba (estilo Codingal)
-- Ejecutar completo en Supabase SQL Editor
-- ============================================================

-- 1. Plantilla semanal recurrente que el negocio configura
create table if not exists trial_availability (
  id uuid primary key default gen_random_uuid(),
  day_of_week int not null check (day_of_week between 0 and 6), -- 0 = domingo ... 6 = sábado
  time time not null,
  is_active boolean default true,
  created_at timestamp default now()
);

-- 2. Reservas reales de padres para una fecha concreta
create table if not exists trial_bookings (
  id uuid primary key default gen_random_uuid(),
  availability_id uuid references trial_availability(id) not null,
  booking_date date not null,
  child_name text not null,
  child_age int not null,
  course_interest text,
  parent_name text not null,
  whatsapp text not null,
  created_at timestamp default now(),
  unique (availability_id, booking_date)
);

-- 3. RLS
alter table trial_availability enable row level security;
alter table trial_bookings enable row level security;

drop policy if exists "trial_availability: public read" on trial_availability;
create policy "trial_availability: public read" on trial_availability
  for select using (is_active = true);

-- No hay policy de select pública en trial_bookings a propósito: nadie externo
-- puede leer las reservas de otras familias. Los inserts los hace el backend
-- con la service role key (app/api/trial-bookings/route.ts), no el navegador
-- directamente, para evitar reservas duplicadas por condición de carrera.

-- ============================================================
-- Ejemplo: configura aquí tus horarios reales (ajusta día/hora)
-- day_of_week: 0=domingo, 1=lunes, 2=martes, 3=miércoles, 4=jueves, 5=viernes, 6=sábado
-- ============================================================
-- insert into trial_availability (day_of_week, time) values
--   (1, '15:00'), (1, '16:00'),
--   (3, '15:00'), (3, '16:00'),
--   (6, '10:00'), (6, '11:00');
