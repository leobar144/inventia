export default function PopupIllustration() {
  return (
    <svg viewBox="0 0 400 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skyGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2e9655" />
          <stop offset="100%" stopColor="#1e3a66" />
        </linearGradient>
      </defs>

      <rect width="400" height="200" fill="url(#skyGradient)" />

      {/* Stars */}
      <circle cx="40" cy="30" r="2" fill="white" opacity="0.9" className="animate-pulse" />
      <circle
        cx="90" cy="60" r="1.5" fill="white" opacity="0.7"
        className="animate-pulse" style={{ animationDelay: '0.5s' }}
      />
      <circle
        cx="330" cy="35" r="2" fill="white" opacity="0.8"
        className="animate-pulse" style={{ animationDelay: '1s' }}
      />
      <circle
        cx="360" cy="80" r="1.5" fill="white" opacity="0.9"
        className="animate-pulse" style={{ animationDelay: '1.5s' }}
      />
      <circle
        cx="20" cy="120" r="1.5" fill="white" opacity="0.7"
        className="animate-pulse" style={{ animationDelay: '0.3s' }}
      />

      {/* Clouds */}
      <ellipse cx="70" cy="150" rx="35" ry="12" fill="white" opacity="0.15" />
      <ellipse cx="340" cy="160" rx="45" ry="14" fill="white" opacity="0.15" />

      {/* Rocket (left, floating) */}
      <g style={{ transformOrigin: '75px 100px' }} className="animate-float-slow">
        <ellipse cx="75" cy="145" rx="10" ry="4" fill="#e67e22" opacity="0.4" />
        <path d="M75 60 C90 80 90 110 75 130 C60 110 60 80 75 60 Z" fill="#f5ad48" />
        <circle cx="75" cy="90" r="8" fill="#4680b3" />
        <circle cx="75" cy="90" r="5" fill="#d4dde8" />
        <path d="M62 115 L52 132 L67 125 Z" fill="#e67e22" />
        <path d="M88 115 L98 132 L83 125 Z" fill="#e67e22" />
        <path d="M68 128 L75 148 L82 128 Z" fill="#f29014" className="animate-pulse" />
      </g>
    </svg>
  )
}
