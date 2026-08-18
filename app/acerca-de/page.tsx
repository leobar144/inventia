import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { FEATURES } from '@/lib/constants'
import { BADGE_LEVELS } from '@/lib/badges'
import { FadeInGrid, FadeInItem } from '@/components/FadeInSection'
import BadgeIcon from '@/components/BadgeIcon'

export const metadata: Metadata = {
  title: 'Por qué INVENTIA',
  description:
    'Educación STEM para niños de 4 a 16 años en Bogotá, con el Método CREA y respaldo tecnológico internacional.',
}

export default function AcercaDePage() {
  return (
    <>
      <section className="section bg-gradient-to-br from-secondary-50 via-white to-primary-50">
        <div className="section-container text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">¿Por qué INVENTIA?</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tu hijo no usa tecnología. La inventa. Ofrecemos educación STEM de calidad con
            metodología probada y resultados reales.
          </p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="section-container">
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

      <section className="section bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">El Método CREA</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cada clase suma. A medida que tu hijo/a completa clases, avanza por niveles que
              desbloquean certificados y reconocimientos reales.
            </p>
          </div>

          <FadeInGrid className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...BADGE_LEVELS].reverse().map((level) => (
              <FadeInItem key={level.id} className="card p-6 text-center flex flex-col items-center">
                <BadgeIcon level={level} size="md" />
                <p className="font-bold mt-4 mb-1">{level.name}</p>
                <p className="text-xs text-gray-500 mb-2">Desde {level.threshold} clases</p>
                <p className="text-sm text-gray-600">{level.unlocks}</p>
              </FadeInItem>
            ))}
          </FadeInGrid>
        </div>
      </section>

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

      <section className="section bg-gradient-to-r from-secondary-600 to-primary-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Conoce nuestros cursos</h2>
          <p className="text-lg mb-8 max-w-xl mx-auto">
            Robótica, programación e IA para niños de 4 a 16 años, en Bogotá.
          </p>
          <Link href="/cursos" className="btn bg-white text-primary-700 hover:bg-gray-100">
            Ver Cursos
          </Link>
        </div>
      </section>
    </>
  )
}
