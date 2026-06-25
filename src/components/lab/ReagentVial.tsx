import type { Reagent } from '@/types/lab'

const CATEGORY_GLOW: Record<string, { ring: string; glow: string; text: string }> = {
  acid:    { ring: 'ring-cyan-400/30',    glow: 'shadow-[0_0_16px_-2px_rgba(34,211,238,0.35)]',  text: 'text-cyan-300' },
  base:    { ring: 'ring-pink-400/30',    glow: 'shadow-[0_0_16px_-2px_rgba(244,114,182,0.35)]', text: 'text-pink-300' },
  metal:   { ring: 'ring-slate-300/25',   glow: 'shadow-[0_0_16px_-2px_rgba(203,213,225,0.3)]',  text: 'text-slate-200' },
  water:   { ring: 'ring-blue-400/30',    glow: 'shadow-[0_0_16px_-2px_rgba(96,165,250,0.35)]',  text: 'text-blue-300' },
  salt:    { ring: 'ring-amber-300/30',   glow: 'shadow-[0_0_16px_-2px_rgba(252,211,77,0.3)]',   text: 'text-amber-200' },
  gas:     { ring: 'ring-purple-400/30',  glow: 'shadow-[0_0_16px_-2px_rgba(192,132,252,0.35)]', text: 'text-purple-300' },
  organic: { ring: 'ring-green-400/30',   glow: 'shadow-[0_0_16px_-2px_rgba(74,222,128,0.35)]',  text: 'text-green-300' },
}

interface ReagentVialProps {
  reagent: Reagent
  onDragStart: () => void
  isDragging?: boolean
}

export default function ReagentVial({ reagent, onDragStart, isDragging }: ReagentVialProps) {
  const style = CATEGORY_GLOW[reagent.category] ?? CATEGORY_GLOW.salt

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`group relative flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 ring-1 ${style.ring} cursor-grab active:cursor-grabbing transition-all duration-200 hover:bg-slate-800/70 hover:-translate-y-0.5 ${style.glow} ${isDragging ? 'opacity-30 scale-95' : ''}`}
    >
      {/* Vial kaca kecil */}
      <div className="relative w-7 h-10 flex-shrink-0">
        {/* leher botol */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-2 bg-slate-700/60 rounded-t-sm border-x border-t border-white/10" />
        {/* badan botol — kaca */}
        <div className="absolute bottom-0 left-0 right-0 h-8 rounded-b-lg rounded-t-[3px] bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/15 overflow-hidden">
          {/* cairan */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-300"
            style={{
              height: '58%',
              background: `linear-gradient(180deg, ${reagent.color_hex}cc, ${reagent.color_hex}99)`,
            }}
          >
            {/* highlight permukaan cairan */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-white/40" />
          </div>
          {/* refleksi kaca */}
          <div className="absolute top-0.5 left-0.5 w-1 h-4 bg-white/20 rounded-full blur-[1px]" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className={`text-sm font-bold font-mono leading-tight ${style.text}`}>{reagent.symbol}</div>
        <div className="text-[10px] text-slate-500 leading-tight truncate">{reagent.name}</div>
      </div>

      {reagent.is_dangerous && (
        <span
          className="flex-shrink-0 text-[10px] w-4 h-4 rounded-full bg-orange-500/20 text-orange-300 flex items-center justify-center"
          title="Bahan reaktif — hati-hati"
        >
          !
        </span>
      )}

      {/* indikator drag hint, muncul saat hover */}
      <div className="absolute inset-0 rounded-xl border border-dashed border-transparent group-hover:border-white/10 pointer-events-none transition-colors" />
    </div>
  )
}
