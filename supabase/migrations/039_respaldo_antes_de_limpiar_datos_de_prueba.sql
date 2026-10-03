-- 039: respaldo completo antes de borrar los datos de prueba.
--
-- POR QUÉ EXISTE
--
-- La web se abre al público el lunes 5 de octubre de 2026. Hasta hoy la base de
-- producción solo tuvo datos inventados durante el desarrollo (agosto de 2026):
-- padres y profesores con alias leobar144+..., un "Niño de Prueba", pagos de
-- sandbox de Wompi con tarjeta 4242. Nada de eso puede quedar cuando entre la
-- primera familia real.
--
-- Antes de borrar se copia TODO a este esquema. Borrar en producción sin una
-- copia es irreversible, y el día que haga falta reconstruir un caso de prueba
-- —o demostrar qué había antes del lanzamiento— esta copia es la única fuente.
--
-- Para restaurar: insert into public.X select * from backup_prelanzamiento.X;
-- (respetando el orden de las llaves foráneas: profiles, children, courses,
-- enrollments, payments, class_sessions, el resto).
--
-- Se puede borrar este esquema cuando la operación real lleve unos meses
-- andando y ya nadie lo necesite.

create schema if not exists backup_prelanzamiento;

create table if not exists backup_prelanzamiento.profiles as select * from public.profiles;
create table if not exists backup_prelanzamiento.children as select * from public.children;
create table if not exists backup_prelanzamiento.courses as select * from public.courses;
create table if not exists backup_prelanzamiento.enrollments as select * from public.enrollments;
create table if not exists backup_prelanzamiento.payments as select * from public.payments;
create table if not exists backup_prelanzamiento.class_sessions as select * from public.class_sessions;
create table if not exists backup_prelanzamiento.class_attendance as select * from public.class_attendance;
create table if not exists backup_prelanzamiento.class_notes as select * from public.class_notes;
create table if not exists backup_prelanzamiento.trial_bookings as select * from public.trial_bookings;
create table if not exists backup_prelanzamiento.referral_credits as select * from public.referral_credits;
create table if not exists backup_prelanzamiento.school_leads as select * from public.school_leads;
create table if not exists backup_prelanzamiento.child_projects as select * from public.child_projects;
create table if not exists backup_prelanzamiento.makeup_bookings as select * from public.makeup_bookings;

-- Los usuarios de autenticación no se pueden recrear con un insert (las
-- contraseñas viven cifradas en auth.users), pero sí sirve saber quién existía.
create table if not exists backup_prelanzamiento.auth_users as
  select id, email, created_at, last_sign_in_at from auth.users;

comment on schema backup_prelanzamiento is
  'Copia de los datos de prueba de agosto de 2026, tomada el 3/10/2026 antes de abrir la web al publico. Ver migracion 040.';
