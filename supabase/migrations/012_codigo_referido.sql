-- ============================================================
-- Programa de referidos — solo el rastreo. El código de cada padre se
-- deriva de su propio id (primeros 8 caracteres en mayúsculas), no hace
-- falta una columna nueva para eso. Aquí solo guardamos qué código usó
-- quien reservó una clase de prueba, para saber quién refirió a quién.
-- El descuento en sí (cuánto y cómo se aplica) queda pendiente de una
-- decisión de negocio — esto solo deja la trazabilidad lista.
-- ============================================================

alter table trial_bookings add column if not exists referred_by_code text;
