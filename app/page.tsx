import Link from 'next/link'
import Image from 'next/image'
import { FaCheckCircle } from 'react-icons/fa'
import { SITE_CONFIG, FEATURES, PRICING_PLANS } from '@/lib/constants'
import { FadeInGrid, FadeInItem, FloatingCard } from '@/components/FadeInSection'
import WelcomePopup from '@/components/WelcomePopup'

export default function Home() {
  return (
    <>
      <WelcomePopup />

      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center py-20">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 animate-fade-in">
              <div className="inline-block">
                <span className="px-4 py-2 bg-accent-100 text-accent-700 rounded-full text-sm font-bold">
                  🚀 Campamento STEM 5-12 de Octubre
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-heading font-bold">
                Tu hijo no usa{' '}
                <span className="gradient-text">tecnología.</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                <span className="font-bold">La inventa.</span> En INVENTIA, aprendes creando.
                Construye robots, programas videojuegos y entiende el futuro con IA.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/clase-de-prueba" className="btn btn-primary text-lg">
                  📅 Reservar Clase de Prueba Gratis
                </Link>
                <Link href="#cursos" className="btn btn-outline text-lg">
                  Conocer Cursos
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200">
                <div>
                  <p className="text-3xl font-bold gradient-text">100+</p>
                  <p className="text-sm text-gray-600">Niños capacitados</p>
                </div>
                <div>
                  <p className="text-3xl font-bold gradient-text">50+</p>
                  <p className="text-sm text-gray-600">Proyectos creados</p>
                </div>
                <div>
                  <p className="text-3xl font-bold gradient-text">4-16</p>
                  <p className="text-sm text-gray-600">Años de edad</p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl blur-3xl opacity-20"></div>
              <FloatingCard className="relative bg-white rounded-2xl p-3 shadow-2xl">
                <div className="aspect-square rounded-xl overflow-hidden relative">
                  <Image
                    src="/gallery/hero.jpg"
                    alt="Estudiante de INVENTIA mostrando el robot que construyó"
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
              </FloatingCard>
              <div className="absolute -bottom-4 -left-4 bg-accent-500 text-white px-4 py-2 rounded-xl shadow-lg font-bold text-sm">
                +50 proyectos creados 🎉
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="section bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">¿Por qué INVENTIA?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ofrecemos educación STEM de calidad con metodología probada y resultados reales.
            </p>
          </div>

          <FadeInGrid className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <FadeInItem key={index} className="card-hover p-8 hover:border-accent-300">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </FadeInItem>
            ))}
          </FadeInGrid>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="section bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Nuestros estudiantes en acción</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Así se ve aprender creando — cada foto es un proyecto real hecho por un niño real.
            </p>
          </div>

          <FadeInGrid className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[160px] md:auto-rows-[200px]">
            <FadeInItem className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden group">
              <Image
                src="/gallery/robotica2.jpg"
                alt="Estudiante armando un robot con ruedas"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </FadeInItem>
            <FadeInItem className="relative rounded-2xl overflow-hidden group">
              <Image
                src="/gallery/robotica1.jpg"
                alt="Estudiante programando un brazo robótico"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </FadeInItem>
            <FadeInItem className="relative rounded-2xl overflow-hidden group">
              <Image
                src="/gallery/kits.webp"
                alt="Estudiantes construyendo con kits de robótica educativa"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </FadeInItem>
            <FadeInItem className="relative rounded-2xl overflow-hidden group">
              <Image
                src="/gallery/iot.jpg"
                alt="Estudiantes trabajando en un proyecto de electrónica"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </FadeInItem>
            <FadeInItem className="relative rounded-2xl overflow-hidden group">
              <Image
                src="/gallery/colaboracion.jpg"
                alt="Dos estudiantes colaborando en un robot"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </FadeInItem>
          </FadeInGrid>
        </div>
      </section>

      {/* Courses Section */}
      <section id="cursos" className="section bg-gradient-to-b from-gray-50 to-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Nuestros Cursos</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Rutas de aprendizaje diseñadas por edades y niveles
            </p>
          </div>

          <FadeInGrid className="grid md:grid-cols-2 gap-8">
            {/* Scratch Section */}
            <FadeInItem className="card-hover p-8 border-l-4 border-primary-500">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-4xl">🎨</span>
                <h3 className="text-2xl font-bold">Scratch & Bloques</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Aprende lógica de programación con bloques visuales. Perfecto para empezar.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <FaCheckCircle className="text-primary-500" />
                  <span>Edades 7-10 años</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FaCheckCircle className="text-primary-500" />
                  <span>8 sesiones semanales</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FaCheckCircle className="text-primary-500" />
                  <span>Proyecto final: Tu primer juego</span>
                </li>
              </ul>
            </FadeInItem>

            {/* Python Section */}
            <FadeInItem className="card-hover p-8 border-l-4 border-secondary-500">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-4xl">🐍</span>
                <h3 className="text-2xl font-bold">Python & Código Real</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Domina un lenguaje de programación real usado por profesionales.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <FaCheckCircle className="text-secondary-500" />
                  <span>Edades 10-16 años</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FaCheckCircle className="text-secondary-500" />
                  <span>Clases en vivo vía Google Meet</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FaCheckCircle className="text-secondary-500" />
                  <span>Certificado verificable</span>
                </li>
              </ul>
            </FadeInItem>

            {/* Robotica Section */}
            <FadeInItem className="card-hover p-8 border-l-4 border-accent-500">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-4xl">🤖</span>
                <h3 className="text-2xl font-bold">Robótica</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Construye y programa robots reales. Aprende electrónica y mecánica.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <FaCheckCircle className="text-accent-500" />
                  <span>Edades 8-14 años</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FaCheckCircle className="text-accent-500" />
                  <span>Kit de robótica incluido</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FaCheckCircle className="text-accent-500" />
                  <span>Competencias inter-grupo</span>
                </li>
              </ul>
            </FadeInItem>

            {/* IA Section */}
            <FadeInItem className="card-hover p-8 border-l-4 border-purple-500">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-4xl">🧠</span>
                <h3 className="text-2xl font-bold">IA & Futuro</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Entiende inteligencia artificial, machine learning y el futuro de la tecnología.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <FaCheckCircle className="text-purple-500" />
                  <span>Edades 12-16 años</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FaCheckCircle className="text-purple-500" />
                  <span>Proyectos con TensorFlow</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FaCheckCircle className="text-purple-500" />
                  <span>Portfolio profesional</span>
                </li>
              </ul>
            </FadeInItem>
          </FadeInGrid>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section bg-white">
        <div className="section-container">
          <div className="text-center mb-4">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Planes que se ajustan al ritmo de tu hijo
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Elige el formato de clase que mejor se acomode — todos incluyen material y
              proyectos.
            </p>
          </div>
          <p className="text-center text-sm text-gray-400 mb-12">
            * Precios de referencia por sesión. Confirma el valor exacto con nosotros por
            WhatsApp.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl overflow-hidden shadow-lg ${
                  plan.highlight ? 'ring-2 ring-primary-500 md:-mt-4' : ''
                }`}
              >
                <div
                  className={`text-center py-6 ${
                    plan.highlight
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600'
                      : 'bg-gradient-to-br from-secondary-600 to-secondary-700'
                  }`}
                >
                  {plan.highlight && (
                    <span className="inline-block mb-1 px-3 py-1 bg-accent-500 text-white text-xs font-bold rounded-full">
                      Más elegido
                    </span>
                  )}
                  <h3 className="text-white text-2xl font-bold">{plan.name}</h3>
                </div>

                <div className="bg-white p-6">
                  <div className="text-center mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ${plan.pricePerSession.toLocaleString('es-CO')}
                    </span>
                    <span className="text-gray-500"> / sesión</span>
                    <p className="text-sm text-gray-500 mt-1">
                      {plan.sessionsPerMonth} sesiones al mes · {plan.groupSize}
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/${SITE_CONFIG.contact.whatsapp}?text=${encodeURIComponent(
                      `Hola INVENTIA! Me interesa el plan ${plan.name}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn w-full mb-6 ${
                      plan.highlight ? 'btn-primary' : 'btn-outline'
                    }`}
                  >
                    Consultar por WhatsApp
                  </a>

                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start space-x-2 text-sm text-gray-600">
                        <FaCheckCircle className="text-primary-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-gray-50">
        <div className="section-container max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Preguntas Frecuentes</h2>
            <p className="text-xl text-gray-600">Resolvemos las dudas más comunes de los papás</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: '¿Mi hijo necesita experiencia previa en programación?',
                a: 'No. Nuestros cursos, como Scratch & Bloques, están diseñados para que un niño sin ninguna experiencia previa pueda empezar desde cero y avanzar a su propio ritmo.',
              },
              {
                q: '¿Las clases son presenciales o virtuales?',
                a: 'Tenemos ambas modalidades: cursos en vivo por Google Meet durante todo el año, y el Campamento STEM presencial en Bogotá (próxima edición: 5-12 de octubre).',
              },
              {
                q: '¿A partir de qué edad puede empezar mi hijo?',
                a: 'Desde los 4 años. Organizamos los cursos por rango de edad (4-6, 7-9, 10-12 y 13-16 años) para que el contenido y el ritmo sean apropiados para cada etapa.',
              },
              {
                q: '¿Qué necesito para las clases virtuales?',
                a: 'Solo un computador con conexión estable a internet. Para el curso de Robótica, el kit necesario está incluido en la inscripción.',
              },
              {
                q: '¿Cómo reservo un cupo o resuelvo más dudas?',
                a: 'Escríbenos directo por WhatsApp — te respondemos en minutos con toda la información de cupos, horarios y próximos pasos.',
              },
            ].map((item, index) => (
              <details
                key={index}
                className="card group open:border-primary-300 open:shadow-md"
              >
                <summary className="cursor-pointer list-none p-5 font-bold flex items-center justify-between">
                  {item.q}
                  <span className="text-primary-500 text-xl group-open:rotate-45 transition-transform ml-4 shrink-0">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-5 text-gray-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Alliance / Trust Section */}
      <section className="section bg-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto rounded-2xl bg-gradient-to-br from-secondary-900 to-secondary-800 shadow-xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="shrink-0">
              <div className="relative h-16 w-56">
                <Image
                  src="/logoverde_blanco-iz_E_Trv.webp"
                  alt="Development Innovation System"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div>
              <p className="text-accent-400 text-sm font-bold uppercase tracking-wide mb-2">
                Alianza tecnológica internacional
              </p>
              <h3 className="text-white text-xl md:text-2xl font-bold mb-2">
                En alianza con Development Innovation System
              </h3>
              <p className="text-secondary-200">
                Contamos con el respaldo de una empresa de tecnología de Estados Unidos, lo que
                nos permite ofrecer una plataforma educativa robusta y en constante evolución.
              </p>
              <a
                href="https://discdc.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-sm text-primary-300 hover:text-primary-200 font-medium hover:underline"
              >
                Conocer más en discdc.com →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-r from-secondary-600 to-primary-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para que tu hijo cree?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Campamento de receso 5-12 de octubre. Cupos limitados. Inscribe ahora.
          </p>
          <a
            href={`https://wa.me/${SITE_CONFIG.contact.whatsapp}?text=Hola%20INVENTIA%21%20Quiero%20reservar%20el%20campamento%20de%20octubre`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            📅 Reservar Cupo Ahora
          </a>
        </div>
      </section>
    </>
  )
}
