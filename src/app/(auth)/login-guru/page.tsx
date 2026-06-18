'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function TeacherLoginPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogleLogin() {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Efisien: Langsung kunci arah setelah login sukses ke dashboard guru
        redirectTo: `${location.origin}/auth/callback?next=/teacher`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#1a1035] via-[#0b0f19] to-[#0d1f2d] flex items-center justify-center p-4 relative overflow-hidden font-sans">

      {/* Orbs — warna ungu/indigo untuk guru */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-pulse delay-700" />
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-block animate-bounce duration-1000 mb-2">
            <span className="text-4xl">🧙‍♂️</span>
          </div>
          <h1 className="text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 drop-shadow-[0_4px_12px_rgba(192,38,211,0.3)]">
            QUESTCHEM
          </h1>
          <p className="text-slate-400 text-xs uppercase tracking-[0.2em] mt-2 font-semibold">
            Magical Academy Staff Portal
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-800 p-8 relative">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_12px_#c084fc]"></div>

          <div className="text-center mb-8">
            <span className="text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Teacher Role
            </span>
            <h2 className="text-xl font-bold text-white mt-3">Masuk sebagai Pengajar</h2>
            <p className="text-slate-400 text-sm mt-1">Pantau perkembangan alkemis mudamu!</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-950/40 backdrop-blur-md border border-red-800/50 rounded-2xl text-red-400 text-sm text-center font-medium shadow-inner">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="group w-full flex items-center justify-center gap-3 bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_rgba(192,38,211,0.2)] border border-slate-700/60 hover:border-purple-500/50 scale-100 active:scale-[0.98]"
            >
              <img 
                src="https://www.svgrepo.com/show/475656/google-color.svg" 
                alt="Google" 
                width={20}
                height={20}
                className="w-5 h-5 transition-transform group-hover:scale-110"
              />
              <span className="tracking-wide">
                {loading ? 'Membuka Portal Pengajar...' : 'Masuk dengan Google'}
              </span>
            </button>
          </div>

          {/* Fitur Guru Preview */}
          <div className="mt-8 pt-6 border-t border-slate-800/60">
              <p className="text-xs text-slate-500 text-center mb-4 uppercase tracking-wider">Yang bisa kamu lakukan</p>
              <div className="grid grid-cols-2 gap-2">
              {[
                { icon: '🏰', label: 'Buat & kelola kelas' },
                { icon: '📜', label: 'Buat quest & soal' },
                { icon: '📊', label: 'Pantau progress siswa' },
                { icon: '⚗️', label: 'Monitor lab reports' },
              ].map((f) => (
          <div key={f.label} className="flex items-center gap-2 p-2.5 bg-slate-800/40 rounded-xl border border-slate-700/30">
            
        {/* Perubahan di sini: tambahkan f. sebelum nama properti */}
        <span className="text-base">{f.icon}</span>
        <span className="text-xs text-slate-400">{f.label}</span>
      </div>
    ))}
  </div>
</div>

          {/* Navigasi balik ke portal murid */}
          <div className="mt-6 text-center text-sm text-slate-400">
            Kamu seorang murid?{' '}
            <Link href="/login" className="text-teal-400 hover:text-teal-300 font-bold underline underline-offset-4 decoration-teal-500/50">
              Masuk Portal Murid →
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}