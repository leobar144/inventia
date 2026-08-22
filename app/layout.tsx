import type { Metadata, Viewport } from 'next'
import { Inter, Figtree } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppChatButton from '@/components/WhatsAppChatButton'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

/**
 * Titulares en Figtree.
 *
 * Poppins, la anterior, es la fuente por defecto de toda academia infantil:
 * usarla nos mimetizaba con la competencia. Se probó Fraunces (serif) buscando
 * diferenciación, pero su contraste alto entre trazos leía editorial —de revista
 * o bufete— y chocaba con una marca de robótica para niños.
 *
 * Figtree queda en el punto medio: cálida y moderna como pide el público
 * infantil, más adulta que Poppins para sostener el precio, y sin rarezas que
 * hagan dudar a un padre que llega de un anuncio.
 */
const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading',
})

export const metadata: Metadata = {
  title: 'INVENTIA | Robótica, Programación e IA para Niños',
  description: 'Tu hijo no usa tecnología. La inventa. Campamento STEM para niños de 4-16 años en Bogotá.',
  keywords: [
    'robótica niños',
    'programación infantil',
    'IA niños',
    'campamento STEM',
    'educación tecnológica',
    'Bogotá',
  ],
  authors: [{ name: 'INVENTIA' }],
  creator: 'INVENTIA',
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://inventiagroup.com',
    siteName: 'INVENTIA',
    title: 'INVENTIA | Robótica, Programación e IA para Niños',
    description: 'Tu hijo no usa tecnología. La inventa.',
    images: [
      {
        url: 'https://inventiagroup.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'INVENTIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'INVENTIA | Robótica, Programación e IA',
    description: 'Tu hijo no usa tecnología. La inventa.',
    images: ['https://inventiagroup.com/og-image.png'],
  },
  robots: 'index, follow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${figtree.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <WhatsAppChatButton />
      </body>
    </html>
  )
}
