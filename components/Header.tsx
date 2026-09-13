'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import { NAV_LINKS, SITE_CONFIG } from '@/lib/constants'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-6 h-24">
          {/* Logo */}
          <Link href="/" className="relative h-20 w-72 shrink-0">
            <Image
              src="/logo2.jpeg"
              alt="INVENTIA"
              fill
              priority
              className="object-contain object-left"
            />
          </Link>

          {/* Desktop Navigation
              Va en `xl` y no en `md`: con seis enlaces, el logo de 288px y los
              dos botones de la derecha, el menu necesita 1012px y por debajo de
              eso los enlaces se partian en tres lineas y "Contacto" chocaba con
              "Portal de Padres". Debajo de xl entra el menu de hamburguesa, que
              ya tiene exactamente los mismos enlaces. */}
          <nav className="hidden xl:flex space-x-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[15px] text-gray-600 hover:text-primary-600 font-medium transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden xl:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-[15px] text-gray-600 hover:text-primary-600 font-medium transition-colors whitespace-nowrap"
            >
              Portal de Padres
            </Link>
            <a
              href={`https://wa.me/${SITE_CONFIG.contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 text-[15px] bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-colors whitespace-nowrap"
            >
              Reservar
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="xl:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <nav className="xl:hidden pb-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Portal de Padres
            </Link>
            <a
              href={`https://wa.me/${SITE_CONFIG.contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 bg-primary-500 text-white rounded-lg font-medium text-center hover:bg-primary-600 transition-colors"
            >
              Reservar
            </a>
          </nav>
        )}
      </div>
    </header>
  )
}
