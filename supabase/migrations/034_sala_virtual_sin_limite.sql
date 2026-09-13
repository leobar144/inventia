-- 034 — La Sala de Tareas virtual no tiene cupo.
--
-- Decisión del usuario (12/09/2026): presencial máximo 12, que es lo que cabe
-- en el salón con doce cuadernos abiertos; virtual sin tope, porque no hay
-- sillas que se acaben.
--
-- `capacity` pasa a aceptar NULL, y NULL significa "sin límite". Se prefiere a
-- guardar 9999 porque un número mágico obliga a que cada pantalla se acuerde de
-- que 9999 quiere decir otra cosa; NULL no se puede malinterpretar, y la base
-- deja de poder mentir sobre un cupo que no existe.

alter table public.tutoring_blocks
  alter column capacity drop not null,
  alter column capacity drop default;

comment on column public.tutoring_blocks.capacity is
  'Cupo de la tarde. NULL = sin limite (asi quedan las virtuales). Las presenciales van en 12: es lo que cabe en el salon.';

-- El cupo, cuando existe, tiene que ser un numero util.
alter table public.tutoring_blocks
  drop constraint if exists tutoring_blocks_capacity_check;

alter table public.tutoring_blocks
  add constraint tutoring_blocks_capacity_check
    check (capacity is null or capacity > 0);
