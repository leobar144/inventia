-- 035 — Tarde suelta, y el precio como algo que todavía no se ha definido.
--
-- Dos decisiones del usuario (12/09/2026):
--
--   1. NO publicar precio todavía. Se modela como `price = NULL`, no como un
--      precio real escondido en la vista. La diferencia importa: con NULL, el
--      checkout se NIEGA a cobrar un plan sin precio en vez de cobrar un número
--      que nadie aprobó. Un `mostrarPrecios = false` en el código habría dejado
--      el precio vivo en la base, a un descuido de venderse solo.
--
--   2. Falta la puerta de entrada: hoy lo más barato es un paquete de dos
--      tardes por semana. Una mamá que quiere probar UNA tarde no tiene por
--      dónde. Se agrega `una-tarde`, que además es el mejor camino de venta:
--      prueba suelta hoy, paquete el mes entrante.

-- ---------------------------------------------------------------------------
-- 1. El precio puede no estar definido

alter table public.tutoring_plans
  alter column price drop not null;

comment on column public.tutoring_plans.price is
  'Pesos colombianos. NULL = todavia sin definir: la pagina publica muestra el plan sin precio y el checkout se niega a cobrarlo.';

-- El precio, cuando exista, tiene que ser un numero que se pueda cobrar.
alter table public.tutoring_plans
  drop constraint if exists tutoring_plans_price_check;

alter table public.tutoring_plans
  add constraint tutoring_plans_price_check
    check (price is null or price > 0);

-- ---------------------------------------------------------------------------
-- 2. La tarde suelta
--
-- `sessions_per_week = 0` a propósito: no es un compromiso semanal, es una
-- visita. Es lo que distingue este plan de los paquetes en la presentación.

insert into public.tutoring_plans (id, name, sessions_per_week, sessions_included, price, sort_order)
values ('una-tarde', 'Una tarde suelta', 0, 1, null, 0)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Los precios provisionales que yo había sembrado se retiran
--
-- Los $240.000 / $330.000 / $480.000 de la migración 033 eran mi recomendación
-- a partir del mercado, no una decisión de INVENTIA. Quedaron publicados en la
-- página sin que nadie los aprobara. Se limpian: cuando el usuario decida, se
-- escriben aquí y la página los muestra sola.

update public.tutoring_plans set price = null;
