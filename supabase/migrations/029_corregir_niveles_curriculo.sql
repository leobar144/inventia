-- 029 — Corregir el nivel de currículo asignado a cada curso.
--
-- Detectado probando: una clase de "Scratch & Bloques" mostraba
-- "Módulo: Robótica programable". El curso es para 7-10 años pero apuntaba al
-- nivel Lab (14-16), así que el desplegable de módulos y el filtro de
-- herramientas del Aula INVENTIA usaban contenido de otra edad.
--
-- Los niveles quedaron asignados como relleno cuando se crearon los cursos y
-- nunca se revisaron.
--
--   Scratch & Bloques (7-10)  : lab         → makers       (7-10)  ✓ calza
--   IA & Futuro       (12-16) : innovadores → lab          (14-16) ✓ tiene IA
--   Robótica          (8-14)  : innovadores (sin cambio — el curso menciona
--                               electrónica, que es enfoque de ese nivel)
--   Python            (10-16) : lab (sin cambio — "programación avanzada")
--
-- LIMITACIÓN CONOCIDA: el currículo está organizado por EDAD y los cursos por
-- TEMA. El nivel Makers cubre robótica y programación para 7-10 años, así que
-- sus módulos mezclan ambas cosas: un curso de Scratch puede seguir mostrando
-- módulos de robots. Resolverlo de fondo exige reorganizar los cursos por edad
-- o el currículo por tema — es una decisión pedagógica, no técnica. Mientras
-- tanto el módulo se escoge a mano en cada sesión.

update courses set curriculum_level_id = 'makers' where title = 'Scratch & Bloques';
update courses set curriculum_level_id = 'lab' where title = 'IA & Futuro';
