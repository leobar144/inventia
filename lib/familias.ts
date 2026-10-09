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
 * MINIMIZACIÓN: por defecto se publica solo el nombre del acudiente. El nombre
 * del menor va en un campo aparte (`nombreMenor`) y solo se llena cuando el
 * acudiente lo autorizó expresamente para eso, porque identificar a un niño en
 * una web indexable no aporta nada a la venta y sí lo expone. Nunca apellidos
 * de menores.
 *
 * SOBRE EL TESTIMONIO: `frase` queda vacía hasta que la familia diga algo de
 * verdad. Y cuando la familia acaba de entrar, la pregunta honesta no es "¿qué
 * aprendió tu hija?" —todavía no ha aprendido nada— sino "¿por qué nos
 * elegiste?". Lo otro se pregunta a los dos meses.
 */

export interface FamiliaDestacada {
  id: string
  /** Nombre del acudiente. */
  nombre: string
  /** Nombre de pila del niño. Solo si el acudiente lo autorizó expresamente. */
  nombreMenor?: string
  /**
   * Cuadrada, 800×800.
   *
   * OJO AL ENCUADRAR: la tarjeta la muestra apaisada y recorta arriba y abajo
   * —solo se ve la franja central, más o menos del 20 % al 80 % del alto—. Si
   * las caras quedan muy arriba, desaparecen. Pasó con la foto de Kate: se veía
   * el niño y no ella. Antes de publicar, hay que mirar cómo queda en la
   * tarjeta, no solo el archivo.
   */
  foto: string
  fotoAlt: string
  /** Lo que dijo la familia, TEXTUAL. Vacío mientras no haya dicho nada. */
  frase?: string
  /**
   * Qué se muestra mientras no haya frase. Es descripción, no testimonio: dice
   * lo que sabemos que es cierto, sin ponerle palabras en la boca a nadie.
   */
  pie: string
  /** Qué ruta toma el niño. Opcional: no siempre está definida al entrar. */
  programa?: string
  /** Sin esto, no se publica. */
  autorizacionFirmada: boolean
}

export const FAMILIAS: readonly FamiliaDestacada[] = [
  {
    id: 'valeria',
    nombre: 'Valeria',
    foto: '/familias/valeria.jpg',
    fotoAlt: 'Valeria y su hija, una de las primeras familias de INVENTIA en Bogotá',
    pie: 'Valeria y su hija, de las primeras familias que llegaron a INVENTIA en Bogotá.',
    programa: 'Exploradores',
    autorizacionFirmada: true,
  },
  {
    id: 'kate',
    nombre: 'Kate',
    // El usuario dio el nombre del niño y decidió no publicarlo (9/10/2026).
    foto: '/familias/kate.jpg',
    fotoAlt: 'Kate y su hijo, una de las primeras familias de INVENTIA en Bogotá',
    pie: 'Kate y su hijo de 7 años, que acaba de empezar con nosotros.',
    programa: 'Scratch & Bloques',
    autorizacionFirmada: true,
  },
] as const

/** Las que de verdad se pueden mostrar. */
export const FAMILIAS_PUBLICABLES = FAMILIAS.filter((f) => f.autorizacionFirmada)
