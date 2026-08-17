-- Agrega el correo del padre a las reservas de clase de prueba
-- (necesario para poder enviarle la confirmación con el link de la clase)
alter table trial_bookings add column if not exists parent_email text;
