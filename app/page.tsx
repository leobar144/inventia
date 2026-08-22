import Link from 'next/link'
import Image from 'next/image'
import { FaCheckCircle } from 'react-icons/fa'
import {
  SITE_CONFIG,
  FEATURES,
  PRICING_PLANS,
  PROGRAM_TRACKS,
  CAMPAIGN,
  isCampaignActive,
} from '@/lib/constants'
import { FadeInGrid, FadeInItem, FloatingCard } from '@/components/FadeInSection'
import WelcomePopup from '@/components/WelcomePopup'
import MobileStickyBar from '@/components/MobileStickyBar'
import InventiaBot from '@/components/InventiaBot'
import ContactSection from '@/components/ContactSection'

export default function Home() {
  const campaignActive = isCampaignActive()
  const minPlanPrice = Math.min(...PRICING_PLANS.map((p) => p.price))

  return (
    <>
      <WelcomePopup />
      <MobileStickyBar />

      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center py-20">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 animate-fade-in">
              {campaignActive && (
                <div className="inline-block">
                  <span className="px-4 py-2 bg-accent-100 text-accent-700 rounded-full text-sm font-bold">
                    🚀 {CAMPAIGN.name} {CAMPAIGN.dateLabel}
                  </span>
                </div>
              )}

              <h1 className="text-5xl md:text-6xl font-heading font-bold">
                Tu hijo no usa{' '}
                <span className="gradient-text">tecnología.</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                <span className="font-bold">La inventa.</span> Robótica, programación e IA para
                niños de <strong>4 a 16 años</strong> en <strong>Bogotá</strong>, en grupos de
                máximo 8 niños, presencial o virtual.
              </p>

              {/* Un solo llamado principal: el segundo botón se llevaba gente
                  que ya venía decidida a agendar. */}
              <div className="pt-2">
                <Link href="/clase-de-prueba" className="btn btn-primary text-lg">
                  Reservar clase de prueba gratis
                </Link>
                <p className="text-sm text-gray-500 mt-3">
                  Sin costo y sin compromiso · Planes desde{' '}
                  <strong className="text-gray-700">
                    ${minPlanPrice.toLocaleString('es-CO')} al mes
                  </strong>
                </p>
              </div>

              {/* La trayectoria va ANTES de las cifras: un número sin origen le
                  suena a promesa a un papá; con origen le suena a respaldo, y
                  responde de entrada la objeción de "academia nueva". */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Metodología creada con{' '}
                  <a
                    href="https://discdc.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-secondary-700 hover:underline"
                  >
                    Development Innovation System
                  </a>{' '}
                  en Estados Unidos, implementada en Cali. Ahora en Bogotá.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-3xl font-bold gradient-text">+100</p>
                  <p className="text-sm text-gray-600">Niños formados con el método</p>
                </div>
                <div>
                  <p className="text-3xl font-bold gradient-text">8</p>
                  <p className="text-sm text-gray-600">Niños por clase, máximo</p>
                </div>
                <div>
                  <p className="text-3xl font-bold gradient-text">32</p>
                  <p className="text-sm text-gray-600">Módulos de currículo</p>
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
              {/* Verde, no naranja: el naranja queda reservado para urgencia
                  (campaña, cupos). Y el dato dice lo que nos diferencia, no una
                  cifra que cualquiera puede afirmar. */}
              <div className="absolute -bottom-4 -left-4 bg-primary-600 text-white px-4 py-2 rounded-xl shadow-lg font-bold text-sm">
                Máximo 8 niños por clase
              </div>
              <FloatingCard className="absolute -top-6 -right-6 bg-white rounded-full p-2 shadow-lg hidden sm:block">
                <InventiaBot className="w-16 h-16" />
              </FloatingCard>
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
              <FadeInItem key={index} className="card-hover p-8 hover:border-primary-300">
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
            {PROGRAM_TRACKS.map((track) => (
              <FadeInItem
                key={track.id}
                className={`card-hover p-8 border-l-4 ${track.borderColor}`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-4xl">{track.icon}</span>
                  <h3 className="text-2xl font-bold">{track.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{track.description}</p>
                <ul className="space-y-2">
                  {track.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center space-x-2">
                      <FaCheckCircle className={track.iconColor} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </FadeInItem>
            ))}
          </FadeInGrid>

          <div className="text-center mt-10">
            <Link href="/cursos" className="text-primary-600 font-bold hover:underline">
              Ver el detalle completo de cada curso →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precios" className="section bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Grupos pequeños, atención real</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Máximo 8 niños por clase, presenciales o virtuales — elige el plan que mejor se
              acomode a tu hijo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl overflow-hidden shadow-lg flex flex-col ${
                  plan.highlight ? 'ring-2 ring-primary-500 md:-mt-4' : ''
                }`}
              >
                <div
                  className={`text-center py-6 flex flex-col items-center justify-center shrink-0 ${
                    plan.highlight
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600'
                      : 'bg-gradient-to-br from-secondary-600 to-secondary-700'
                  }`}
                >
                  <span
                    className={`inline-block mb-1 px-3 py-1 bg-accent-500 text-white text-xs font-bold rounded-full ${
                      plan.highlight ? '' : 'invisible'
                    }`}
                  >
                    Más elegido
                  </span>
                  <h3 className="text-white text-2xl font-bold">{plan.name}</h3>
                  <p className="text-white/80 text-sm">{plan.classes} clases</p>
                  <p className="text-white text-xs font-bold mt-2 bg-white/15 inline-block px-3 py-1 rounded-full">
                    {plan.levelIcon} {plan.levelName}
                  </p>
                </div>

                <div className="bg-white p-6 flex flex-col flex-grow">
                  <p className="text-center text-sm font-bold text-primary-600 uppercase tracking-wide mb-3 min-h-[2.5rem] flex items-center justify-center">
                    {plan.tagline}
                  </p>

                  <div className="text-center mb-3">
                    {plan.originalPrice && (
                      <p className="text-gray-400 line-through text-sm">
                        ${plan.originalPrice.toLocaleString('es-CO')}
                      </p>
                    )}
                    <span className="text-xs text-gray-500 block">Desde</span>
                    <span className="text-3xl font-bold text-gray-900">
                      ${plan.price.toLocaleString('es-CO')}
                    </span>
                    <span className="text-xs text-gray-500 block mt-1">
                      {plan.classes} clases · según el curso
                    </span>
                  </div>

                  {plan.originalPrice && (
                    <p className="text-center text-sm font-bold text-primary-600 mb-2">
                      Ahorras ${(plan.originalPrice - plan.price).toLocaleString('es-CO')}
                    </p>
                  )}

                  <p className="text-sm text-gray-600 text-center mb-4 flex-grow">
                    {plan.description}
                  </p>

                  <div className="bg-gray-50 rounded-lg p-3 mb-6 text-center min-h-[92px] flex flex-col justify-center">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                      Desbloqueas
                    </p>
                    <p className="text-sm text-gray-700">{plan.unlocks}</p>
                  </div>

                  <a
                    href={`https://wa.me/${SITE_CONFIG.contact.whatsapp}?text=${encodeURIComponent(
                      `Hola INVENTIA! Me interesa el plan ${plan.name} - ${plan.levelName} (${plan.classes} clases).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn w-full ${plan.highlight ? 'btn-primary' : 'btn-outline'}`}
                  >
                    Consultar por WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto mt-8 text-center bg-primary-50 border border-primary-200 rounded-xl p-5">
            <p className="text-gray-800">
              <span className="text-xl mr-1">🏆</span>
              <strong>¿Tu hijo llega a Inventor(a) dos veces?</strong> Desbloquea el nivel{' '}
              <strong>Maestro Inventor</strong> — mentoría de estudiantes nuevos y competencias
              INVENTIA.
            </p>
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
                a: `Tenemos ambas modalidades: clases presenciales en Bogotá y clases en vivo por Google Meet, durante todo el año.${
                  campaignActive ? ` Además, ${CAMPAIGN.name} del ${CAMPAIGN.dateLabel}.` : ''
                }`,
              },
              {
                q: '¿A partir de qué edad puede empezar mi hijo?',
                a: 'Desde los 4 años. Organizamos los cursos por rango de edad (4-6, 7-9, 10-12 y 13-16 años) para que el contenido y el ritmo sean apropiados para cada etapa.',
              },
              {
                q: '¿Qué necesito para las clases virtuales?',
                a: 'Solo un computador con conexión estable a internet. En Robótica presencial los robots los ponemos nosotros — no tienes que comprar nada.',
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

      {/* Aquí iba una sección de testimonios con tres tarjetas vacías que decían
          "Próximamente". Estaba justo en el punto del scroll donde el padre busca
          la prueba de que otros ya confiaron — y le respondía que nadie lo ha
          hecho. Se quita hasta tener testimonios reales: una página sin la
          sección se lee normal, con la sección vacía se lee como negocio que no
          arrancó. */}

      <ContactSection />

      {/* CTA Section */}
      <section className="section pb-24 md:pb-12 bg-gradient-to-r from-secondary-600 to-primary-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para que tu hijo cree?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {campaignActive
              ? `${CAMPAIGN.name} ${CAMPAIGN.dateLabel}. Cupos limitados — los grupos son de máximo 8 niños.`
              : 'La primera clase es gratis y sin compromiso. Los grupos son de máximo 8 niños.'}
          </p>
          {campaignActive ? (
            <a
              href={`https://wa.me/${SITE_CONFIG.contact.whatsapp}?text=${encodeURIComponent(CAMPAIGN.whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              📅 Reservar cupo ahora
            </a>
          ) : (
            <Link
              href="/clase-de-prueba"
              className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              📅 Agendar clase de prueba gratis
            </Link>
          )}
        </div>
      </section>
    </>
  )
}
