import Link from 'next/link'
import Image from 'next/image'
import { FaCheckCircle } from 'react-icons/fa'
import { SITE_CONFIG, FEATURES } from '@/lib/constants'
import { FadeInGrid, FadeInItem, FloatingCard } from '@/components/FadeInSection'

export default function Home() {
  return (
    <>
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
                <a
                  href={`https://wa.me/${SITE_CONFIG.contact.whatsapp}?text=Hola%20INVENTIA%21%20Me%20interesa%20el%20campamento%20de%20octubre`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary text-lg"
                >
                  📅 Reservar Ahora
                </a>
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
            <div className="hidden md:block relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl blur-3xl opacity-20"></div>
              <FloatingCard className="relative bg-white rounded-2xl p-8 shadow-2xl">
                <div className="aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-accent-200 opacity-60 blur-xl" />
                  <div className="absolute bottom-6 left-6 w-20 h-20 rounded-full bg-secondary-200 opacity-60 blur-xl" />
                  <div className="text-center relative">
                    <div className="text-8xl mb-4">🤖</div>
                    <p className="text-lg font-bold text-gray-800">Tu próximo proyecto</p>
                  </div>
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

      {/* Alliance / Trust Section */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="section-container">
          <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wide mb-6">
            Con el respaldo tecnológico de
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="h-20 px-6 bg-secondary-900 rounded-xl flex items-center justify-center">
              <Image
                src="/logoverde_blanco-iz_E_Trv.webp"
                alt="Development Innovation System"
                width={180}
                height={70}
                className="h-12 w-auto"
              />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-800">En alianza con Development Innovation System</p>
              <a
                href="https://discdc.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:underline"
              >
                discdc.com
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
