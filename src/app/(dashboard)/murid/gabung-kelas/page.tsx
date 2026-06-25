'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function GabungKelasPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleJoin() {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    setSuccess(null)

    const res = await fetch('/api/class/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ join_code: code.trim().toUpperCase() }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Gagal bergabung ke kelas')
      return
    }

    setSuccess(`Berhasil bergabung ke kelas "${data.class_name}"! 🎉`)
    setCode('')
    setTimeout(() => router.push('/murid/kelas'), 2000)
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-teal-500/5 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full filter blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-6 py-12">
        <Link href="/murid/home" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8">
          ← Kembali
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/30 flex items-center justify-center text-3xl mx-auto mb-4">
            🏰
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Gabung Kelas</h1>
          <p className="text-slate-400 text-sm">Masukkan kode kelas yang diberikan gurumu</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400 text-sm text-center">
              ✅ {success}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Kode Kelas</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              placeholder="Contoh: AB12CD"
              maxLength={8}
              className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white font-mono text-lg tracking-[0.2em] placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-center uppercase"
            />
          </div>

          <button
            onClick={handleJoin}
            disabled={loading || !code.trim()}
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(45,212,191,0.2)]"
          >
            {loading ? 'Bergabung...' : '🏰 Gabung Kelas'}
          </button>

          <div className="pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-500 text-center mb-3">Kelas yang sudah kamu ikuti</p>
            <Link
              href="/murid/kelas"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800/40 border border-slate-700/30 hover:border-slate-600 rounded-xl text-slate-300 text-sm transition-colors"
            >
              📋 Lihat Kelas Saya
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4">
          <p className="text-xs text-slate-500 flex items-start gap-2">
            <span className="text-blue-400 flex-shrink-0 mt-0.5">ℹ️</span>
            Kode kelas terdiri dari 8 karakter huruf dan angka. Minta kode kepada gurumu jika belum punya.
          </p>
        </div>
      </div>
    </div>
  )
}
