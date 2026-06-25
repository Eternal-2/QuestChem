interface ExplosionBadgeProps {
  count: number
  size?: 'sm' | 'md'
}

/**
 * Badge kecil untuk ditempel di avatar profil siswa.
 * Tampil hanya jika siswa pernah mengalami insiden ledakan di lab.
 *
 * Cara pakai di profile page:
 *   <div className="relative inline-block">
 *     <div className="w-24 h-24 rounded-full ...">🧑‍🔬</div>
 *     <ExplosionBadge count={profile.explosion_count} />
 *   </div>
 */
export default function ExplosionBadge({ count, size = 'md' }: ExplosionBadgeProps) {
  if (!count || count === 0) return null

  const dims = size === 'sm' ? 'w-6 h-6 text-xs -top-1 -right-1' : 'w-8 h-8 text-sm -top-2 -right-2'

  return (
    <div
      title={`${count}x insiden ledakan di lab`}
      className={`absolute ${dims} rounded-full bg-red-500 border-2 border-slate-900 flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.5)] z-10`}
    >
      <span>💥</span>
    </div>
  )
}
