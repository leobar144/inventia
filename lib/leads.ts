/** Etapas de una solicitud institucional, en orden del embudo. */
export const LEAD_STATUSES = [
  { id: 'nuevo', label: 'Nuevo', className: 'bg-accent-100 text-accent-800' },
  { id: 'contactado', label: 'Contactado', className: 'bg-secondary-100 text-secondary-700' },
  { id: 'propuesta', label: 'Propuesta enviada', className: 'bg-primary-100 text-primary-700' },
  { id: 'cerrado', label: 'Cerrado ✓', className: 'bg-primary-500 text-white' },
  { id: 'descartado', label: 'Descartado', className: 'bg-gray-100 text-gray-500' },
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]['id']

export function isValidLeadStatus(value: string): value is LeadStatus {
  return LEAD_STATUSES.some((s) => s.id === value)
}

export function leadStatusLabel(id: string): string {
  return LEAD_STATUSES.find((s) => s.id === id)?.label ?? id
}

export function leadStatusClass(id: string): string {
  return LEAD_STATUSES.find((s) => s.id === id)?.className ?? 'bg-gray-100 text-gray-600'
}

/**
 * Mensaje inicial de WhatsApp para responderle a una institución.
 *
 * Va prellenado a propósito: en venta institucional el primero que responde
 * suele ganar, y tener que redactar desde cero es justo lo que hace que la
 * respuesta se aplace.
 */
export function buildLeadWhatsAppMessage(params: {
  contactName: string
  institutionName: string
}): string {
  const firstName = params.contactName.trim().split(/\s+/)[0]
  return `Hola ${firstName}, le escribo de INVENTIA 🤖

Recibimos su solicitud de ${params.institutionName} y con mucho gusto coordinamos la demostración sin costo en su sede.

Llevamos nuestros propios robots (mTiny y Tale-Bot, sin pantallas) y hacemos una sesión real con un grupo de niños para que el equipo docente vea de qué se trata.

¿Qué día de esta semana o la próxima les queda bien?`
}
