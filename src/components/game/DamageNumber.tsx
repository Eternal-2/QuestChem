'use client'

interface DamageNumberProps {
  amount: number
  color: 'red' | 'teal'
  nonce: number // berubah tiap kali muncul, supaya animasi re-trigger
}

export default function DamageNumber({ amount, color, nonce }: DamageNumberProps) {
  return (
    <div
      key={nonce}
      className={`absolute -top-2 right-2 font-black text-2xl pointer-events-none select-none animate-[dmg-float_0.9s_ease-out_1_forwards] ${
        color === 'red' ? 'text-red-400' : 'text-orange-300'
      }`}
      style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
    >
      -{amount}
    </div>
  )
}
