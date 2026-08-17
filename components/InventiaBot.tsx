export default function InventiaBot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Sombra */}
      <ellipse cx="100" cy="185" rx="45" ry="8" fill="black" opacity="0.1" />

      {/* Antena */}
      <line x1="100" y1="35" x2="100" y2="20" stroke="#e67e22" strokeWidth="3" />
      <circle cx="100" cy="16" r="7" fill="#e67e22" className="animate-pulse" />

      {/* Cabeza */}
      <rect x="65" y="35" width="70" height="55" rx="18" fill="#f5f7fa" stroke="#4680b3" strokeWidth="3" />
      {/* Ojos */}
      <circle cx="85" cy="62" r="9" fill="#2e9655" />
      <circle cx="115" cy="62" r="9" fill="#2e9655" />
      <circle cx="87" cy="59" r="2.5" fill="white" />
      <circle cx="117" cy="59" r="2.5" fill="white" />
      {/* Sonrisa */}
      <path d="M85 78 Q100 88 115 78" stroke="#4680b3" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Cuerpo */}
      <rect x="55" y="95" width="90" height="65" rx="16" fill="white" stroke="#2e9655" strokeWidth="3" />
      <rect x="80" y="112" width="40" height="10" rx="5" fill="#e67e22" />
      <circle cx="75" cy="140" r="6" fill="#4680b3" />
      <circle cx="100" cy="140" r="6" fill="#f5ad48" />
      <circle cx="125" cy="140" r="6" fill="#2e9655" />

      {/* Brazos */}
      <rect x="30" y="105" width="14" height="30" rx="7" fill="#f5f7fa" stroke="#4680b3" strokeWidth="3" />
      <rect x="156" y="105" width="14" height="30" rx="7" fill="#f5f7fa" stroke="#4680b3" strokeWidth="3" />

      {/* Piernas */}
      <rect x="70" y="160" width="16" height="20" rx="6" fill="white" stroke="#2e9655" strokeWidth="3" />
      <rect x="114" y="160" width="16" height="20" rx="6" fill="white" stroke="#2e9655" strokeWidth="3" />
    </svg>
  )
}
