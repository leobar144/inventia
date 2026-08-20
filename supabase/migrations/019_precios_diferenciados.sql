-- 019 — Precios diferenciados por curso.
--
-- Contexto del cálculo (agosto 2026):
--   - Grupos de máximo 8 niños, clases de 2 horas.
--   - Instructor: $80.000/hora → $160.000 por clase dictada → $20.000 por niño
--     con el grupo lleno.
--   - Wompi: 2,65% + $700 + IVA ≈ 3,4% efectivo.
--   - Coordinadora: salario mínimo 2026 con prestaciones ≈ $2,9M/mes (costo fijo).
--   → Punto de equilibrio: 12 a 18 alumnos activos según el llenado de grupos.
--
-- Escalera de descuento: Mes = base, Trimestre −12%, Semestre −20%.
-- Antes de esta migración la escalera estaba invertida: el Semestre daba menos
-- descuento por clase (−9%) que el Trimestre (−13%), así que a la familia le
-- convenía comprar dos trimestres en vez de un semestre.
--
-- Criterio por curso:
--   - Scratch más barato: es la puerta de entrada (7-10 años, primera compra).
--   - Robótica arriba: desgaste y reposición de robots de la academia.
--   - IA & Futuro arriba: mayor demanda y público de 12-16 años.

update course_plan_prices cpp
set price = v.price
from (values
  ('Scratch & Bloques','mes',290000),
  ('Scratch & Bloques','trimestre',765000),
  ('Scratch & Bloques','semestre',1390000),
  ('Python & Código Real','mes',340000),
  ('Python & Código Real','trimestre',895000),
  ('Python & Código Real','semestre',1630000),
  ('Robótica','mes',370000),
  ('Robótica','trimestre',975000),
  ('Robótica','semestre',1775000),
  ('IA & Futuro','mes',390000),
  ('IA & Futuro','trimestre',1030000),
  ('IA & Futuro','semestre',1870000)
) as v(title, plan_id, price)
where cpp.plan_id = v.plan_id
  and cpp.course_id = (select id from courses where title = v.title);
