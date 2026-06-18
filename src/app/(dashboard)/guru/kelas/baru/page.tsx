'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function BuatKelasPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ name: '', cohort: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Sesi habis, silakan login ulang')
      setLoading(false)
      return
    }

    const { data, error: insertError } = await supabase
      .from('classes')
      .insert({
        name: form.name,
        cohort: form.cohort || null,
        teacher_id: user.id,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push(`/guru/kelas/${data.id}`)
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">+ Buat Kelas Baru</h1>
        <p className="text-slate-400 text-sm mt-0.5">Kelas baru otomatis mendapat kode unik untuk siswa join</p>
      </div>

      <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nama Kelas</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Contoh: Kelas 8-A Kimia"
              className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Kohort / Keterangan <span className="text-slate-500">(opsional)</span></label>
            <input
              type="text"
              value={form.cohort}
              onChange={e => setForm({ ...form, cohort: e.target.value })}
              placeholder="Contoh: Semester Ganjil 2026"
              className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-all disabled:opacity-60 shadow-[0_0_20px_rgba(168,85,247,0.25)]"
          >
            {loading ? 'Membuat kelas...' : 'Buat Kelas'}
          </button>
        </form>
      </div>
    </div>
  )
}
