-- ============================================================
-- Corrige un hueco de seguridad: referral_credits se creó en la
-- migración 013 sin RLS activado — cualquiera con la llave pública de
-- Supabase (visible en el código del navegador, normal) podía leer o
-- insertar créditos falsos de $50.000 directamente.
--
-- Mismo patrón que class_attendance (006_asistencia_insignias.sql): RLS
-- activado, sin policies de select/insert/update para el rol autenticado
-- normal. Nada en el frontend necesita leer esta tabla directo — el
-- código de cada padre se deriva de auth.uid(), no de una consulta a esta
-- tabla — y los créditos solo se crean/consumen desde
-- /api/payments/create y /api/webhooks/wompi, ambos con service role
-- (que ignora RLS).
-- ============================================================

alter table referral_credits enable row level security;
