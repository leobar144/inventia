'use client'

import { FaDownload } from 'react-icons/fa'

export default function CertificatePrintButton() {
  return (
    <button onClick={() => window.print()} className="no-print btn btn-primary">
      <FaDownload className="mr-2" /> Descargar certificado (PDF)
    </button>
  )
}
