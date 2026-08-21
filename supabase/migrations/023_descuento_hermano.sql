-- 023 — Descuento por hermano.
--
-- Un acudiente que ya tiene un hijo inscrito y activo recibe un descuento al
-- inscribir al segundo. Es la venta más fácil del negocio: ya confía, ya conoce
-- el proceso, y no hay costo de adquisición.
--
-- El porcentaje vive en lib/siblings.ts, no en la base: es una decisión
-- comercial que cambia, y no queremos una migración cada vez.
--
-- REGLA DE ACUMULACIÓN: nunca se suman el descuento de referido y el de
-- hermano. Se aplica el MAYOR de los dos. Sumarlos podía llegar a ~30% sobre el
-- plan, que se come el margen del grupo.
--
-- En la práctica casi nunca compiten: el de referido solo aplica en el primer
-- pago aprobado de la cuenta, y el de hermano exige que ya haya un hermano
-- activo (o sea, un pago aprobado previo). El único cruce posible es un padre
-- con crédito de referido acumulado, y ahí gana el mayor.

alter table public.payments
  add column if not exists discount_reason text;

comment on column public.payments.discount_reason is
  'referido | hermano | null. Qué descuento se aplicó a este pago. Solo se aplica uno: el mayor.';
