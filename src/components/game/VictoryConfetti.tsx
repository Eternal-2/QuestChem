'use client'

const COLORS = ['#2dd4bf', '#fbbf24', '#f472b6', '#a78bfa', '#60a5fa', '#fb923c']

export default function VictoryConfetti() {
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.4,
    duration: 1.4 + Math.random() * 0.8,
    color: COLORS[i % COLORS.length],
    rotateStart: Math.random() * 360,
    drift: (Math.random() - 0.5) * 80,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((p, i) => (
        <div
          key={i}
          className="absolute top-[-10px] w-2 h-3 animate-[confetti-fall_var(--dur)_ease-in_var(--delay)_1_forwards]"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotateStart}deg)`,
            '--dur': `${p.duration}s`,
            '--delay': `${p.delay}s`,
            '--drift': `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}

      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) translateX(var(--drift)) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
