import type { Reagent } from '@/types/lab'

interface BeakerSlotProps {
  label: string
  reagent: Reagent | null
  isOver: boolean
  isShaking?: boolean
  onDragOver: () => void
  onDragLeave: () => void
  onDrop: () => void
}

export default function BeakerSlot({
  label, reagent, isOver, isShaking, onDragOver, onDragLeave, onDrop,
}: BeakerSlotProps) {
  return (
    <div
      onDragOver={e => { e.preventDefault(); onDragOver() }}
      onDragLeave={onDragLeave}
      onDrop={e => { e.preventDefault(); onDrop() }}
      className={`relative w-28 transition-transform duration-150 ${isOver ? 'scale-110' : ''} ${isShaking ? 'animate-[beaker-shake_0.4s_ease-in-out]' : ''}`}
    >
      {/* Label gantung di atas beaker */}
      <div className="text-center mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      </div>

      {/* Beaker kaca — bentuk khas labu erlenmeyer disederhanakan */}
      <div className="relative h-32">
        <svg viewBox="0 0 100 130" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id={`glass-${label}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0.08" />
              <stop offset="100%" stopColor="white" stopOpacity="0.02" />
            </linearGradient>
            <clipPath id={`beaker-clip-${label}`}>
              <path d="M 30 10 L 30 35 L 8 110 Q 8 122 22 122 L 78 122 Q 92 122 92 110 L 70 35 L 70 10 Z" />
            </clipPath>
          </defs>

          {/* Badan kaca */}
          <path
            d="M 30 10 L 30 35 L 8 110 Q 8 122 22 122 L 78 122 Q 92 122 92 110 L 70 35 L 70 10 Z"
            fill={`url(#glass-${label})`}
            stroke={isOver ? '#2dd4bf' : reagent ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)'}
            strokeWidth="2"
            className="transition-colors duration-200"
          />

          {/* Bibir atas beaker */}
          <path d="M 26 8 L 74 8 L 70 14 L 30 14 Z" fill="rgba(255,255,255,0.15)" />

          {/* Garis ukur */}
          <line x1="14" y1="95" x2="22" y2="95" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <line x1="13" y1="80" x2="22" y2="80" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <line x1="11" y1="65" x2="22" y2="65" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

          {/* Cairan, di-clip ke bentuk beaker */}
          {reagent && (
            <g clipPath={`url(#beaker-clip-${label})`}>
              <rect
                x="0" y={122 - 75} width="100" height="75"
                fill={reagent.color_hex}
                opacity="0.55"
              />
              {/* Riak permukaan cairan */}
              <ellipse cx="50" cy={122 - 75} rx="42" ry="3" fill={reagent.color_hex} opacity="0.8" />
              {/* Gelembung kecil */}
              <circle cx="40" cy="100" r="2" fill="white" opacity="0.3" />
              <circle cx="58" cy="90" r="1.5" fill="white" opacity="0.25" />
              <circle cx="48" cy="70" r="1" fill="white" opacity="0.2" />
            </g>
          )}

          {/* Refleksi kaca vertikal */}
          <path d="M 26 16 L 18 100" stroke="rgba(255,255,255,0.2)" strokeWidth="3" strokeLinecap="round" />
        </svg>

        {/* Simbol bahan, tampil di tengah beaker */}
        {reagent ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 pointer-events-none">
            <span className="text-base font-bold font-mono text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              {reagent.symbol}
            </span>
            <span className="text-[9px] text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] max-w-[70px] text-center leading-tight mt-0.5">
              {reagent.name}
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pt-4 pointer-events-none">
            <span className="text-2xl text-slate-700">+</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes beaker-shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          20% { transform: translateX(-4px) rotate(-2deg); }
          40% { transform: translateX(4px) rotate(2deg); }
          60% { transform: translateX(-3px) rotate(-1deg); }
          80% { transform: translateX(3px) rotate(1deg); }
        }
      `}</style>
    </div>
  )
}
