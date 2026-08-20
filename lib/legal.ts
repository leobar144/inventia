/**
 * Datos legales de la empresa, en un solo lugar.
 *
 * ⚠️ IMPORTANTE: los campos marcados como PENDIENTE deben completarse con la
 * información real de la empresa antes de recibir padres reales. La Ley 1581 de
 * 2012 exige identificar plenamente al responsable del tratamiento de datos.
 */
export const LEGAL_INFO = {
  // Razón social registrada en cámara de comercio.
  razonSocial: 'INVENTIA', // PENDIENTE: razón social completa (ej. "INVENTIA S.A.S.")
  nit: 'PENDIENTE', // PENDIENTE: NIT con dígito de verificación
  domicilio: 'Bogotá D.C., Colombia', // PENDIENTE: dirección física completa
  email: 'info@inventiagroup.com',
  telefono: '+57 350 211 4492',

  // Fecha desde la cual rige la versión vigente de las políticas.
  vigenteDesde: '20 de agosto de 2026',

  // Plazo de conservación de los datos una vez termina la relación.
  conservacion: 'mientras exista la relación con la familia y, luego de terminada, por el término necesario para atender obligaciones legales, contables y tributarias.',
} as const

/**
 * Texto único del consentimiento. Se usa en el registro y en la reserva de
 * clase de prueba para que ambos flujos digan exactamente lo mismo — y para que
 * quede un solo lugar donde cambiarlo si el abogado lo ajusta.
 */
export const CONSENT_VERSION = '2026-08-20'
