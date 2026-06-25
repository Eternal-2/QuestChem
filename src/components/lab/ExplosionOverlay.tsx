'use client'

export default function ExplosionOverlay() {
  // Pecahan kaca acak — posisi & rotasi berbeda tiap render terasa lebih organik
  const shards = Array.from({ length: 10 }, (_, i) => ({
    angle: (360 / 10) * i + Math.random() * 20,
    distance: 60 + Math.random() * 80,
    size: 6 + Math.random() * 10,
    delay: Math.random() * 0.1,
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Flash cahaya */}
      <div className="absolute inset-0 bg-orange-500/25 animate-[flash-fade_0.5s_ease-out_1_forwards]" />

      {/* Inti ledakan */}
      <div className="relative">
        <div className="absolute inset-0 w-24 h-24 -m-12 rounded-full bg-gradient-to-br from-yellow-300 via-orange-500 to-red-600 blur-md animate-[core-pop_0.5s_ease-out_1_forwards]" />

        {/* Pecahan kaca beterbangan */}
        {shards.map((s, i) => (
          <div
            key={i}
            className="absolute top-0 left-0 w-2 bg-white/70 animate-[shard-fly_0.7s_ease-out_1_forwards]"
            style={{
              height: `${s.size}px`,
              width: `${s.size * 0.4}px`,
              animationDelay: `${s.delay}s`,
              '--angle': `${s.angle}deg`,
              '--distance': `${s.distance}px`,
            } as React.CSSProperties}
          />
        ))}

        <span className="relative text-6xl block">💥</span>
      </div>

      <style>{`
        @keyframes flash-fade {
          0% { opacity: 0; }
          15% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes core-pop {
          0% { transform: scale(0.3); opacity: 0; }
          30% { transform: scale(1.4); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes shard-fly {
          0% {
            transform: rotate(var(--angle)) translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: rotate(var(--angle)) translateY(calc(var(--distance) * -1)) rotate(540deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
