import { cn } from '@/utils/misc';

export type TurnstileLight = 'idle' | 'reading' | 'granted' | 'denied';

/** Representação visual (SVG) de uma catraca tripé. */
export function TurnstileGraphic({ light, rotation }: { light: TurnstileLight; rotation: number }) {
  const led = light === 'granted' ? '#10b981' : light === 'denied' ? '#e11d2e' : light === 'reading' ? '#f59e0b' : '#3f3f46';
  return (
    <svg viewBox="0 0 220 260" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="tsBody" x1="0" x2="1">
          <stop offset="0" stopColor="#2a2a31" />
          <stop offset="0.5" stopColor="#3a3a42" />
          <stop offset="1" stopColor="#1f1f24" />
        </linearGradient>
        <linearGradient id="tsTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a4a52" />
          <stop offset="1" stopColor="#2a2a31" />
        </linearGradient>
        <radialGradient id="tsGlow">
          <stop offset="0" stopColor={led} stopOpacity="0.55" />
          <stop offset="1" stopColor={led} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* chão */}
      <ellipse cx="110" cy="245" rx="95" ry="10" fill="#000" opacity="0.5" />
      {/* corpo */}
      <rect x="40" y="70" width="90" height="175" rx="10" fill="url(#tsBody)" stroke="#4b4b55" strokeWidth="1" />
      <rect x="40" y="58" width="90" height="22" rx="8" fill="url(#tsTop)" stroke="#55555f" strokeWidth="1" />
      {/* leitor biométrico */}
      <rect x="56" y="92" width="58" height="36" rx="6" fill="#0b0b0d" stroke="#2f2f36" />
      <circle cx="85" cy="110" r="11" fill="none" stroke={light === 'reading' ? '#f59e0b' : '#3f3f46'} strokeWidth="2" className={cn(light === 'reading' && 'animate-pulse')} />
      <path d="M79 110a6 6 0 0 1 12 0M82 114a3 3 0 0 1 6 0" stroke={light === 'reading' ? '#f59e0b' : '#52525b'} strokeWidth="1.5" fill="none" />
      {/* LED */}
      <circle cx="85" cy="150" r="26" fill="url(#tsGlow)" />
      <rect x="62" y="144" width="46" height="12" rx="6" fill={led} className="transition-[fill] duration-300" />
      {/* hub + braços (rotacionam) */}
      <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '140px 175px', transition: 'transform 900ms cubic-bezier(.3,.7,.2,1)' }}>
        <line x1="140" y1="175" x2="208" y2="175" stroke="#d4d4d8" strokeWidth="9" strokeLinecap="round" />
        <line x1="140" y1="175" x2="106" y2="116" stroke="#a1a1aa" strokeWidth="9" strokeLinecap="round" />
        <line x1="140" y1="175" x2="106" y2="234" stroke="#a1a1aa" strokeWidth="9" strokeLinecap="round" />
      </g>
      <circle cx="140" cy="175" r="16" fill="#52525b" stroke="#71717a" strokeWidth="2" />
      <circle cx="140" cy="175" r="6" fill={led} />
    </svg>
  );
}
