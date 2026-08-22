-- 030 — Crear el curso Exploradores (4-6 años).
--
-- HUECO DETECTADO POR EL USUARIO: el sitio promete "4 a 16 años" en siete
-- lugares distintos (home, Acerca de, Cursos, metadatos, perfil público,
-- Términos y la página de instituciones), y /metodo-crea muestra la malla
-- completa con INVENTIA Exploradores 4-6 años y sus 8 módulos.
--
-- Pero NO existía ningún curso comprable por debajo de los 7 años. Un padre con
-- un hijo de 5 veía la promesa, agendaba clase de prueba, se registraba… y al
-- momento de inscribir no encontraba nada.
--
-- Peor: la página de jardines infantiles está construida sobre Exploradores.
-- Si un jardín aceptaba, no había en qué inscribir a esos niños.
--
-- FORMATO, distinto al resto de cursos:
--   - Clase de 1 hora (a los 4-6 años la atención no da para dos).
--   - Grupos de máximo 6 (con robots de piso, un instructor no alcanza para 8).
--
-- Como la duración cambia el costo del instructor ($80.000/hora), se agrega
-- `class_hours` por curso: el panel de ocupación asumía 2 horas para todos y
-- habría calculado mal el margen de este.
--
-- PRECIO: $45.000 por clase por niño → Mes $180.000, Trimestre $475.000 (−12%),
-- Semestre $865.000 (−20%). Con 6 niños deja ~69% de margen; con 3 baja a ~23%,
-- así que no conviene abrir un grupo de Exploradores con menos de 3.

alter table public.courses
  add column if not exists class_hours numeric not null default 2;

comment on column public.courses.class_hours is
  'Duración de una clase en horas. Exploradores (4-6 años) dura 1; el resto 2. El costo del instructor se calcula con esto.';

insert into public.courses (title, description, level, price, currency, max_students, curriculum_level_id, class_hours)
values (
  'Exploradores',
  'Robótica sin pantallas para los más pequeños. Programan robots de piso con tarjetas físicas, no con tabletas.',
  'beginner',
  180000,
  'COP',
  6,
  'exploradores',
  1
)
on conflict do nothing;

insert into public.course_plan_prices (course_id, plan_id, price)
select c.id, v.plan_id, v.price
from public.courses c
cross join (values ('mes', 180000), ('trimestre', 475000), ('semestre', 865000)) as v(plan_id, price)
where c.title = 'Exploradores'
on conflict (course_id, plan_id) do nothing;
