'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const TYPE_ICON: Record<string, string> = {
  info: 'ℹ️', success: '✅', warning: '⚠️',
  lab: '💥', quest: '📜', challenge: '⚔️',
}

interface GuruProfileClientProps {
  userData: any
  classes: any[]
  totalStudents: number
  totalQuests: number
  recentActivity: any[]
}

export default function GuruProfileClient({
  userData, classes, totalStudents, totalQuests, recentActivity
}: GuruProfileClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [editMode, setEditMode] = useState(false)
  const [displayName, setDisplayName] = useState(userData?.display_name ?? '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  const joinedDate = userData?.created_at
    ? new Date(userData.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
    : '-'

  async function handleSave() {
    if (!displayName.trim()) return
    setLoading(true)
    setError(null)

    const { error: err } = await supabase
      .from('users')
      .update({ display_name: displayName.trim() })
      .eq('id', userData.id)

    setLoading(false)
    if (err) { setError(err.message); return }
    setEditMode(false)
    setSuccess(true)
    setTimeout(() => { setSuccess(false); router.refresh() }, 2000)
  }

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login-guru')
  }

  function formatTime(ts: string) {
    const diff = Date.now() - new Date(ts).getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (hours < 1) return 'Baru saja'
    if (hours < 24) return `${hours} jam lalu`
    return `${days} hari lalu`
  }

  const initials = (userData?.display_name ?? userData?.username ?? 'G').slice(0, 2).toUpperCase()

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Success banner */}
      {success && (
        <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400 text-sm text-center">
          ✅ Profil berhasil diperbarui!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Avatar + Info */}
        <div className="bg-[#0d1117] border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-[0_0_24px_rgba(168,85,247,0.3)]">
              {userData?.avatar_url
                ? <img src={userData.avatar_url} alt="avatar" className="w-full h-full rounded-full object-cover" />
                : initials
              }
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-purple-500 rounded-full border-2 border-[#0d1117] flex items-center justify-center text-xs">
              👨‍🏫
            </div>
          </div>

          {/* Nama */}
          {editMode ? (
            <div className="w-full space-y-2 mb-3">
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                autoFocus
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-2">
                <button onClick={() => setEditMode(false)} className="flex-1 py-1.5 bg-slate-800 border border-slate-700/50 text-slate-300 rounded-lg text-xs">Batal</button>
                <button onClick={handleSave} disabled={loading} className="flex-1 py-1.5 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-lg text-xs disabled:opacity-60">
                  {loading ? '...' : 'Simpan'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-1">
              <h2 className="text-lg font-black text-white">{userData?.display_name ?? userData?.username}</h2>
              <button onClick={() => setEditMode(true)} className="text-xs text-purple-400 hover:text-purple-300 transition-colors mt-0.5">
                ✏️ Edit nama
              </button>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold px-3 py-1 rounded-full mb-4">
            👨‍🏫 PENGAJAR
          </div>

          {/* Info */}
          <div className="w-full space-y-2 text-left">
            <div className="flex items-center gap-2 p-2.5 bg-slate-800/40 border border-slate-700/30 rounded-xl">
              <span className="text-slate-500 text-sm">📧</span>
              <span className="text-xs text-slate-400 truncate">{userData?.email ?? 'Tidak ada email' }</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-slate-800/40 border border-slate-700/30 rounded-xl">
              <span className="text-slate-500 text-sm">📅</span>
              <span className="text-xs text-slate-400">Bergabung {joinedDate}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-slate-800/40 border border-slate-700/30 rounded-xl">
              <span className="text-slate-500 text-sm">🔑</span>
              <span className="text-xs text-slate-400">Login via Google</span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="mt-6 w-full py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {signingOut ? 'Keluar...' : '🚪 Keluar'}
          </button>
        </div>

        {/* MIDDLE: Stats + Kelas */}
        <div className="space-y-5">
          {/* Stats */}
          <div className="bg-[#0d1117] border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span>📊</span>
              <h3 className="font-bold text-white">Statistik Mengajar</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🏰', label: 'Total Kelas', value: classes.length, color: 'text-purple-400' },
                { icon: '👥', label: 'Total Siswa', value: totalStudents, color: 'text-teal-400' },
                { icon: '📜', label: 'Quest Dibuat', value: totalQuests, color: 'text-blue-400' },
                { icon: '⭐', label: 'Aktivitas', value: recentActivity.length, color: 'text-yellow-400' },
              ].map(s => (
                <div key={s.label} className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3 text-center">
                  <div className="text-xl mb-0.5">{s.icon}</div>
                  <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Daftar kelas */}
          <div className="bg-[#0d1117] border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span>🏰</span>
                <h3 className="font-bold text-white">Kelas Saya</h3>
              </div>
              <Link href="/guru/kelas/baru" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">+ Buat</Link>
            </div>

            {classes.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">🏰</div>
                <p className="text-slate-400 text-sm">Belum ada kelas</p>
                <Link href="/guru/kelas/baru" className="text-xs text-purple-400 hover:text-purple-300 mt-2 inline-block">Buat kelas pertama →</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {classes.map(c => (
                  <Link
                    key={c.id}
                    href={`/guru/kelas/${c.id}`}
                    className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700/30 hover:border-purple-500/30 rounded-xl transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border border-purple-500/30 flex items-center justify-center text-lg flex-shrink-0">
                      🏰
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors truncate">{c.name}</div>
                      {c.cohort && <div className="text-xs text-slate-500 truncate">{c.cohort}</div>}
                    </div>
                    <div className="font-mono text-xs text-slate-500 flex-shrink-0">{c.join_code}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Aktivitas terbaru */}
        <div className="bg-[#0d1117] border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span>🔔</span>
              <h3 className="font-bold text-white">Aktivitas Terbaru</h3>
            </div>
            <Link href="/guru/notifikasi" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Lihat semua</Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-3xl mb-2 opacity-50">🔔</div>
              <p className="text-slate-500 text-sm">Belum ada aktivitas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((n: any) => (
                <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${!n.is_read ? 'bg-purple-500/5 border-purple-500/20' : 'bg-slate-800/30 border-slate-700/30'}`}>
                  <span className="text-lg flex-shrink-0">{TYPE_ICON[n.type] ?? 'ℹ️'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{n.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</div>
                    <div className="text-xs text-slate-600 mt-1">{formatTime(n.created_at)}</div>
                  </div>
                  {!n.is_read && <div className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0 mt-1" />}
                </div>
              ))}
            </div>
          )}

          {/* Quick links */}
          <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
            <p className="text-xs text-slate-600 uppercase tracking-wider">Aksi Cepat</p>
            {[
              { href: '/guru/kelas', label: 'Kelola Kelas', icon: '🏰' },
              { href: '/guru/quest-bank/baru', label: 'Buat Quest', icon: '📜' },
              { href: '/guru/roster', label: 'Lihat Roster', icon: '👥' },
              { href: '/guru/lab-reports', label: 'Lab Reports', icon: '🔬' },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="flex items-center gap-2 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors text-sm"
              >
                <span>{l.icon}</span> {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
