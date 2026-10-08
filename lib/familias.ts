/**
 * Las primeras familias de INVENTIA en Bogotá.
 *
 * REGLA, SIN EXCEPCIONES: aquí solo entra una familia cuando existe la
 * autorización de imagen FIRMADA por quien ejerce la patria potestad
 * (documentos-legales/Autorizacion-uso-de-imagen-INVENTIA.docx). Un permiso
 * conversado no basta: esto es la cara de un menor en una web pública e
 * indexable. El campo `autorizacionFirmada` no es decorativo — si está en
 * false, la familia no se muestra.
 *
 * MINIMIZACIÓN: se publica el nombre del acudiente, nunca el del niño. Para
 * presentar a una familia no hace falta identificar al menor, así que no se
 * hace.
 *
 * SOBRE EL TESTIMONIO: `frase` queda vacía hasta que la familia diga algo de
 * verdad. Y cuando la familia acaba de entrar, la pregunta honesta no es "¿qué
 * aprendió tu hija?" —todavía no ha aprendido nada— sino "¿por qué nos
 * elegiste?". Lo otro se pregunta a los dos meses.
 */

export interface FamiliaDestacada {
  id: string
  /** Nombre del acudiente. Nunca el del menor. */
  nombre: string
  foto: string
  fotoAlt: string
  /** Lo que dijo la familia, textual. Vacío mientras no haya dicho nada. */
  frase?: string
  /** Qué ruta toma el niño. Sirve para que el visitante se ubique. */
  programa: string
  /** Sin esto, no se publica. */
  autorizacionFirmada: boolean
}

export const FAMILIAS: readonly FamiliaDestacada[] = [
  {
    id: 'valeria',
    nombre: 'Valeria',
    foto: '/familias/valeria.jpg',
    fotoAlt: 'Valeria y su hija, una de las primeras familias de INVENTIA en Bogotá',
    programa: 'Exploradores',
    autorizacionFirmada: true,
  },
] as const

/** Las que de verdad se pueden mostrar. */
export const FAMILIAS_PUBLICABLES = FAMILIAS.filter((f) => f.autorizacionFirmada)
