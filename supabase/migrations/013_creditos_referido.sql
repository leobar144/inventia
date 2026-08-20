-- ============================================================
-- Descuento de referidos: $50.000 COP para el que refiere Y para el
-- referido (doble vía), aplicado en el checkout.
--
-- referral_credits: crédito ganado por un padre cuando alguien a quien
-- refirió completa su primer pago. Se consume (used=true) en su propio
-- siguiente checkout.
--
-- payments.referred_by_code / referrer_parent_id / discount_cents: rastro
-- de qué código se usó en ese pago específico y cuánto se descontó — el
-- crédito para el referidor solo se crea cuando el webhook de Wompi
-- confirma que el pago quedó APPROVED (nunca antes de cobrar de verdad).
-- ============================================================

create table if not exists referral_credits (
  id uuid primary key default gen_random_uuid(),
  referrer_parent_id uuid references profiles(id) not null,
  amount_cents bigint not null default 5000000,
  source_payment_id uuid references payments(id),
  used boolean default false,
  used_payment_id uuid references payments(id),
  created_at timestamp default now()
);

alter table payments add column if not exists referred_by_code text;
alter table payments add column if not exists referrer_parent_id uuid references profiles(id);
alter table payments add column if not exists discount_cents bigint default 0;
alter table payments add column if not exists consumed_credit_id uuid references referral_credits(id);
