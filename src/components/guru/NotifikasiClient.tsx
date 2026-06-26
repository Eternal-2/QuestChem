'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const TYPE_STYLE: Record<string, { icon: string; border: string; bg: string; badge: string }> = {
  info:      { icon: 'ℹ️', border: 'border-blue-500/20',   bg: 'bg-blue-500/5',   badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  success:   { icon: '✅', border: 'border-teal-500/20',   bg: 'bg-teal-500/5',   badge: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
  warning:   { icon: '⚠️', border: 'border-orange-500/20', bg: 'bg-orange-500/5', badge: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  lab:       { icon: '💥', border: 'border-red-500/20',    bg: 'bg-red-500/5',    badge: 'text-red-400 bg-red-500/10 border-red-500/20' },
  quest:     { icon: '📜', border: 'border-purple-500/20', bg: 'bg-purple-500/5', badge: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  challenge: { icon: '⚔️', border: 'border-yellow-500/20', bg: 'bg-yellow-500/5', badge: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
}

export default function NotifikasiClient({ notifications }: { notifications: any[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [items, setItems] = useState(notifications)
  const [loading, setLoading] = useState(false)

  const unreadCount = items.filter(n => !n.is_read).length

  async function markRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  async function markAllRead() {
    setLoading(true)
    await supabase.from('notifications').update({ is_read: true }).in('id', items.filter(n => !n.is_read).map(n => n.id))
    setItems(prev => prev.map(n => ({ ...n, is_read: true })))
    setLoading(false)
  }

  async function deleteNotif(id: string) {
    await supabase.from('notifications').delete().eq('id', id)
    setItems(prev => prev.filter(n => n.id !== id))
  }

  function formatTime(ts: string) {
    const diff = Date.now() - new Date(ts).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'Baru saja'
    if (mins < 60) return `${mins} menit lalu`
    if (hours < 24) return `${hours} jam lalu`
    return `${days} hari lalu`
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">🔔 Notifikasi</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={loading}
            className="text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 hover:border-purple-400/50 px-3 py-1.5 rounded-xl transition-colors bg-purple-500/5"
          >
            {loading ? 'Memproses...' : '✓ Tandai semua dibaca'}
          </button>
        )}
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-16 text-center">
          <div className="text-4xl mb-3">🔔</div>
          <p className="text-slate-300 font-semibold">Belum ada notifikasi</p>
          <p className="text-slate-500 text-sm mt-1">Notifikasi akan muncul saat ada aktivitas siswa</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(n => {
            const style = TYPE_STYLE[n.type] ?? TYPE_STYLE.info
            return (
              <div
                key={n.id}
                className={`group relative bg-slate-900/60 backdrop-blur border rounded-2xl p-4 transition-all ${
                  !n.is_read ? `${style.border} ${style.bg}` : 'border-slate-800/60 opacity-70'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg flex-shrink-0 ${style.badge}`}>
                    {style.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-white text-sm">{n.title}</div>
                        <div className="text-slate-400 text-sm mt-0.5 leading-relaxed">{n.message}</div>
                      </div>
                      {!n.is_read && (
                        <div className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0 mt-1.5" />
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-500">{formatTime(n.created_at)}</span>
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={() => markRead(n.id)}
                          className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Lihat →
                        </Link>
                      )}
                      {!n.is_read && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          Tandai dibaca
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteNotif(n.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all text-xs flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
