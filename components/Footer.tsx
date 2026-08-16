'use client'

import Link from 'next/link'
import { FaInstagram, FaWhatsapp, FaMailBulk } from 'react-icons/fa'
import { SITE_CONFIG, NAV_LINKS } from '@/lib/constants'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-secondary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <span className="font-heading font-bold text-xl">INVENTIA</span>
            </div>
            <p className="text-gray-400 text-sm">
              Tu hijo no usa tecnología. La inventa.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-bold mb-4">Navegación</h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold mb-4">Contacto</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a
                  href={`mailto:${SITE_CONFIG.contact.email}`}
                  className="hover:text-primary-400 transition-colors"
                >
                  {SITE_CONFIG.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${SITE_CONFIG.contact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-400 transition-colors"
                >
                  {SITE_CONFIG.contact.phone}
                </a>
              </li>
              <li>Bogotá, Colombia</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-heading font-bold mb-4">Síguenos</h4>
            <div className="flex space-x-4">
              <a
                href={SITE_CONFIG.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-400 transition-colors text-xl"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
              <a
                href={SITE_CONFIG.links.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-400 transition-colors text-xl"
                aria-label="WhatsApp"
              >
                <FaWhatsapp />
              </a>
              <a
                href={`mailto:${SITE_CONFIG.links.email}`}
                className="text-gray-400 hover:text-primary-400 transition-colors text-xl"
                aria-label="Email"
              >
                <FaMailBulk />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>&copy; {currentYear} INVENTIA. Todos los derechos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-primary-400 transition-colors">
              Privacidad
            </Link>
            <Link href="/terms" className="hover:text-primary-400 transition-colors">
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
