import type { Metadata } from 'next'
import Link from 'next/link'
import { LEGAL_INFO } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Política de Tratamiento de Datos Personales',
  description:
    'Cómo INVENTIA recolecta, usa y protege los datos personales de las familias, conforme a la Ley 1581 de 2012.',
}

export default function PrivacidadPage() {
  return (
    <div className="section bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
          Política de Tratamiento de Datos Personales
        </h1>
        <p className="text-gray-500 mb-10">Vigente desde el {LEGAL_INFO.vigenteDesde}</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Responsable del tratamiento</h2>
            <p>
              {LEGAL_INFO.razonSocial} (en adelante “INVENTIA”), identificada con NIT{' '}
              {LEGAL_INFO.nit}, con domicilio en {LEGAL_INFO.domicilio}, es la responsable del
              tratamiento de los datos personales recolectados a través de este sitio web y de sus
              servicios educativos.
            </p>
            <p className="mt-2">
              Contacto para asuntos de datos personales:{' '}
              <a href={`mailto:${LEGAL_INFO.email}`} className="text-primary-600 hover:underline">
                {LEGAL_INFO.email}
              </a>{' '}
              · {LEGAL_INFO.telefono}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Marco legal</h2>
            <p>
              Esta política se rige por la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas
              colombianas que regulan la protección de datos personales, así como por el artículo 15
              de la Constitución Política (derecho al habeas data).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Datos que recolectamos</h2>
            <p className="mb-3">
              <strong>Del padre, madre o representante legal:</strong> nombre completo, correo
              electrónico, número de WhatsApp o teléfono, e historial de pagos e inscripciones.
            </p>
            <p className="mb-3">
              <strong>Del niño, niña o adolescente:</strong> nombre, fecha de nacimiento o edad,
              curso en el que está inscrito, asistencia a clases, avance académico, insignias
              obtenidas, notas del instructor sobre lo que trabajó en cada clase, y —cuando el padre
              o la madre decide agregarlos— enlaces a los proyectos que construye.
            </p>
            <p className="mb-3">
              <strong>Fotografías del menor:</strong> solo si el acudiente activa expresamente ese
              permiso en el portal. Es una autorización aparte, apagada por defecto, que puede
              revocarse en cualquier momento. Las fotos se guardan en almacenamiento privado, se
              muestran únicamente al acudiente dentro de su portal, y{' '}
              <strong>nunca se publican ni se incluyen en el perfil compartible</strong>.
            </p>
            <p>
              No recolectamos datos sensibles (origen racial o étnico, orientación política,
              convicciones religiosas, datos de salud, datos biométricos) ni los solicitamos en
              ningún formulario.
            </p>
          </section>

          <section className="rounded-xl border-2 border-accent-200 bg-accent-50 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              4. Datos de niños, niñas y adolescentes
            </h2>
            <p className="mb-3">
              El artículo 7 de la Ley 1581 de 2012 da un tratamiento especial a los datos de menores
              de edad. En INVENTIA:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Los datos del menor solo se recolectan a través de su padre, madre o representante
                legal, quien otorga la autorización previa, expresa e informada.
              </li>
              <li>
                El tratamiento responde al interés superior del menor y respeta sus derechos
                fundamentales. Los datos se usan exclusivamente para prestar el servicio educativo y
                reportar el avance a su familia.
              </li>
              <li>
                <strong>Nunca publicamos ni compartimos públicamente los datos del menor sin una
                autorización específica y adicional del acudiente</strong>, que puede revocarse en
                cualquier momento.
              </li>
              <li>
                No usamos los datos del menor con fines publicitarios ni los vendemos o cedemos a
                terceros con fines comerciales.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Finalidades del tratamiento</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Gestionar la inscripción, matrícula y participación en los cursos.</li>
              <li>Registrar asistencia y avance académico, y reportarlo a la familia.</li>
              <li>Emitir certificados e insignias de logro.</li>
              <li>
                Dejar constancia de lo que el estudiante trabajó en cada clase, para reportárselo a
                su familia.
              </li>
              <li>Procesar pagos y cumplir obligaciones contables y tributarias.</li>
              <li>
                Enviar comunicaciones operativas: recordatorios de clase, confirmaciones de reserva,
                avisos de renovación y notificaciones de logros.
              </li>
              <li>Atender consultas, solicitudes y reclamos.</li>
              <li>
                Administrar el programa de referidos, cuando la familia decide participar en él.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Encargados y terceros</h2>
            <p className="mb-3">
              Para operar la plataforma nos apoyamos en proveedores tecnológicos que actúan como
              encargados del tratamiento y solo procesan los datos siguiendo nuestras instrucciones:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Supabase</strong> — almacenamiento de la base de datos y autenticación.
              </li>
              <li>
                <strong>Vercel</strong> — alojamiento y ejecución de la aplicación web.
              </li>
              <li>
                <strong>Wompi</strong> — procesamiento de pagos. Los datos de tarjetas se ingresan
                directamente en la pasarela; INVENTIA nunca los recibe ni los almacena.
              </li>
              <li>
                <strong>Resend</strong> — envío de correos transaccionales.
              </li>
            </ul>
            <p className="mt-3">
              Algunos de estos proveedores almacenan información en servidores fuera de Colombia. Al
              aceptar esta política, el titular autoriza esa transferencia internacional en los
              términos del artículo 26 de la Ley 1581 de 2012.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Derechos del titular</h2>
            <p className="mb-3">
              Conforme al artículo 8 de la Ley 1581 de 2012, el titular —o su representante legal
              cuando se trate de un menor— tiene derecho a:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Conocer, actualizar y rectificar sus datos personales.</li>
              <li>Solicitar prueba de la autorización otorgada.</li>
              <li>Ser informado sobre el uso que se ha dado a sus datos.</li>
              <li>
                Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones a
                la ley.
              </li>
              <li>
                Revocar la autorización y solicitar la supresión de los datos, cuando no exista un
                deber legal o contractual que obligue a conservarlos.
              </li>
              <li>Acceder gratuitamente a sus datos personales.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              8. Cómo ejercer estos derechos
            </h2>
            <p>
              Escribe a{' '}
              <a href={`mailto:${LEGAL_INFO.email}`} className="text-primary-600 hover:underline">
                {LEGAL_INFO.email}
              </a>{' '}
              indicando tu nombre, el dato o derecho que quieres ejercer y un medio de contacto.
            </p>
            <p className="mt-2">
              Las <strong>consultas</strong> se atienden en un máximo de diez (10) días hábiles,
              prorrogables por cinco (5) más. Los <strong>reclamos</strong> se atienden en un máximo
              de quince (15) días hábiles, prorrogables por ocho (8) más, informándote siempre el
              motivo de la demora.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Seguridad</h2>
            <p>
              Aplicamos medidas técnicas y administrativas para proteger la información: cifrado en
              tránsito (HTTPS), control de acceso por roles, aislamiento de los datos de cada familia
              a nivel de base de datos, y acceso restringido a la información únicamente al personal
              que lo necesita para prestar el servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Conservación</h2>
            <p>Los datos se conservan {LEGAL_INFO.conservacion}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Cambios a esta política</h2>
            <p>
              Si modificamos esta política, publicaremos la nueva versión en esta página con su fecha
              de vigencia. Si el cambio afecta de forma sustancial las finalidades del tratamiento,
              te lo informaremos por correo electrónico.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-6 text-sm">
          <Link href="/terminos" className="text-primary-600 font-medium hover:underline">
            Términos y Condiciones →
          </Link>
          <Link href="/" className="text-gray-500 hover:text-primary-600">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
