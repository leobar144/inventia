-- 018 — Pagos por fuera de Wompi (efectivo, transferencia, Nequi, datáfono).
--
-- Hasta ahora una inscripción solo se activaba cuando el webhook de Wompi
-- confirmaba el pago. Eso deja por fuera a las familias que pagan en efectivo
-- o por transferencia directa — que en la práctica son muchas.
--
-- La solución NO es dejar que cualquiera marque un pago como aprobado: es dar
-- una ruta de administración que registre el pago dejando rastro de quién lo
-- registró y cómo entró la plata.

alter table public.payments
  add column if not exists payment_method text not null default 'wompi',
  add column if not exists recorded_by uuid references public.profiles(id),
  add column if not exists notes text;

comment on column public.payments.payment_method is
  'wompi | efectivo | transferencia | nequi | daviplata | datafono | otro';

comment on column public.payments.recorded_by is
  'Solo para pagos manuales: qué administrador lo registró. Rastro de auditoría del manejo de efectivo.';

-- Un pago manual no tiene transacción de Wompi, así que la referencia es la
-- única llave. Se garantiza que no haya duplicados.
create unique index if not exists payments_reference_unique
  on public.payments (reference);

-- Los pagos que ya existen entraron todos por Wompi.
update public.payments set payment_method = 'wompi' where payment_method is null;
