'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function GabungKelasPage() {
  const router = useRouter()
  const supabase = createClient()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Sesi habis, login ulang.'); setLoading(false); return }

    const { data: profile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) { setError('Profil siswa tidak ditemukan.'); setLoading(false); return }

    const { data: kelas, error: kelasError } = await supabase
      .from('classes')
      .select('id, name')
      .eq('join_code', code.trim().toLowerCase())
      .single()

    if (kelasError || !kelas) {
      setError('Kode kelas tidak ditemukan. Periksa kembali kode dari gurumu.')
      setLoading(false)
      return
    }

    const { error: joinError } = await supabase
      .from('class_members')
      .insert({ class_id: kelas.id, student_id: profile.id })

    if (joinError) {
      if (joinError.code === '23505') {
        setError('Kamu sudah tergabung di kelas ini.')
      } else {
        setError(joinError.message)
      }
      setLoading(false)
      return
    }

    setSuccess(`Berhasil bergabung ke ${kelas.name}!`)
    setLoading(false)
    setTimeout(() => router.push('/murid/home'), 1500)
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-black text-white">🏰 Gabung Kelas</h1>
        <p className="text-slate-400 text-sm mt-1">Masukkan kode kelas dari gurumu</p>
      </div>

      <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-300 text-sm">
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Kode Kelas</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
              placeholder="Contoh: a1b2c3d4"
              className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-center text-lg font-mono tracking-widest text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-all disabled:opacity-60 shadow-[0_0_20px_rgba(45,212,191,0.25)]"
          >
            {loading ? 'Memproses...' : 'Gabung Kelas'}
          </button>
        </form>
      </div>
    </div>
  )
}
