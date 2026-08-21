import type { Metadata } from 'next'
import Link from 'next/link'
import { LEGAL_INFO } from '@/lib/legal'
import { SIBLING_DISCOUNT_PERCENT } from '@/lib/siblings'

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description:
    'Condiciones de uso de la plataforma INVENTIA y de la prestación de los servicios educativos.',
}

export default function TerminosPage() {
  return (
    <div className="section bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">Términos y Condiciones</h1>
        <p className="text-gray-500 mb-10">Vigente desde el {LEGAL_INFO.vigenteDesde}</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Quiénes somos</h2>
            <p>
              {LEGAL_INFO.razonSocial}, NIT {LEGAL_INFO.nit}, con domicilio en{' '}
              {LEGAL_INFO.domicilio}, presta servicios de educación en robótica, programación e
              inteligencia artificial para niños, niñas y adolescentes entre 4 y 16 años.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Quién puede contratar</h2>
            <p>
              Solo pueden crear una cuenta y contratar los servicios personas mayores de edad que
              actúen como padre, madre o representante legal del menor que se inscribe. Al
              registrarte declaras tener esa calidad y la facultad de autorizar el tratamiento de los
              datos del menor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Inscripción y pagos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Los precios se publican en pesos colombianos (COP) e incluyen los impuestos
                aplicables.
              </li>
              <li>
                Los pagos se procesan a través de Wompi. INVENTIA no almacena datos de tarjetas de
                crédito o débito.
              </li>
              <li>
                La inscripción queda confirmada únicamente cuando la pasarela reporta el pago como
                aprobado.
              </li>
              <li>
                Los cupos son limitados y se asignan en orden de confirmación de pago.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Clase de prueba</h2>
            <p>
              La clase de prueba es gratuita y no obliga a contratar. Reservar un horario y no
              asistir sin avisar puede impedir que otra familia lo use, por lo que te pedimos avisar
              con anticipación si no vas a poder asistir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Programa de referidos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Cada familia registrada recibe un código de referido personal.
              </li>
              <li>
                El descuento aplica cuando una familia nueva usa ese código en su{' '}
                <strong>primer pago aprobado</strong>. El beneficio es doble: descuento para quien se
                inscribe y un crédito equivalente para quien refirió.
              </li>
              <li>
                El crédito del referidor se acredita solo después de que el pago del referido quede
                efectivamente aprobado, y se aplica automáticamente en su siguiente compra.
              </li>
              <li>
                Los créditos no son transferibles ni canjeables por dinero en efectivo.
              </li>
              <li>
                INVENTIA puede modificar o terminar el programa en cualquier momento, respetando los
                créditos ya generados.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              5.1. Descuento por hermano
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Las familias que ya tienen un hijo o hija con inscripción activa reciben un{' '}
                <strong>{SIBLING_DISCOUNT_PERCENT}% de descuento</strong> al inscribir a otro. Se
                aplica automáticamente, sin códigos.
              </li>
              <li>
                El descuento por hermano y el de referido{' '}
                <strong>no son acumulables</strong>: se aplica el que resulte mayor.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Retracto y devoluciones</h2>
            <p>
              De acuerdo con el artículo 47 de la Ley 1480 de 2011 (Estatuto del Consumidor), en las
              ventas realizadas por medios electrónicos tienes derecho a retractarte dentro de los{' '}
              <strong>cinco (5) días hábiles</strong> siguientes a la compra, siempre que el servicio
              no haya comenzado a prestarse. Para ejercerlo, escríbenos a{' '}
              <a href={`mailto:${LEGAL_INFO.email}`} className="text-primary-600 hover:underline">
                {LEGAL_INFO.email}
              </a>
              .
            </p>
            <p className="mt-2">
              Si el curso ya inició, puedes solicitar la devolución proporcional de las clases no
              tomadas, salvo que la inasistencia sea atribuible al estudiante.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              7. Cancelación o reprogramación de clases
            </h2>
            <p className="mb-3">
              Si INVENTIA cancela una clase por causa propia, la reprograma sin costo o la abona al
              plan de la familia.
            </p>
            <p className="mb-3">
              Si el estudiante falta, la familia puede <strong>reponer la clase sin costo</strong>{' '}
              desde el portal, en otro horario del mismo curso que tenga cupo disponible, bajo estas
              condiciones:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Una reposición por cada cuatro clases del plan</strong> (plan Mes: 1;
                Trimestre: 3; Semestre: 6).
              </li>
              <li>
                La reposición debe agendarse dentro de los <strong>treinta (30) días</strong>{' '}
                siguientes a la clase perdida.
              </li>
              <li>
                Está sujeta a la disponibilidad de cupo del grupo receptor, que mantiene el límite
                de ocho estudiantes.
              </li>
            </ul>
            <p className="mt-3">
              Las clases que no se repongan dentro de esas condiciones se consideran dictadas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Herramientas de terceros</h2>
            <p>
              El Aula INVENTIA enlaza a herramientas externas como Scratch (MIT), Code.org, mBlock y
              Roblox Studio. Esas plataformas son operadas por terceros independientes, con sus
              propios términos y políticas de privacidad. INVENTIA no es responsable de su contenido,
              disponibilidad ni del tratamiento de datos que realicen. Recomendamos que un adulto
              acompañe al menor al usarlas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Propiedad intelectual</h2>
            <p>
              La metodología, los contenidos, materiales, marca y diseño de la plataforma pertenecen
              a INVENTIA y no pueden reproducirse ni distribuirse sin autorización escrita.{' '}
              <strong>
                Los proyectos que crea el estudiante son de su autoría y de su familia.
              </strong>{' '}
              Solo los mostramos públicamente si el acudiente lo autoriza expresamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Conducta en clase</h2>
            <p>
              Esperamos respeto entre estudiantes y hacia los profesores. Conductas que afecten
              gravemente el desarrollo de la clase pueden dar lugar a la suspensión del servicio,
              previa comunicación con la familia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Datos personales</h2>
            <p>
              El tratamiento de datos personales se rige por nuestra{' '}
              <Link href="/privacidad" className="text-primary-600 hover:underline">
                Política de Tratamiento de Datos Personales
              </Link>
              , que forma parte integral de estos términos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Cambios y ley aplicable</h2>
            <p>
              INVENTIA puede actualizar estos términos publicando una nueva versión en esta página.
              Estos términos se rigen por la ley colombiana, y cualquier controversia se someterá a
              los jueces competentes de Colombia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Contacto</h2>
            <p>
              <a href={`mailto:${LEGAL_INFO.email}`} className="text-primary-600 hover:underline">
                {LEGAL_INFO.email}
              </a>{' '}
              · {LEGAL_INFO.telefono} · {LEGAL_INFO.domicilio}
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-6 text-sm">
          <Link href="/privacidad" className="text-primary-600 font-medium hover:underline">
            Política de Privacidad →
          </Link>
          <Link href="/" className="text-gray-500 hover:text-primary-600">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
