'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Kelas {
  id: string
  name: string
  cohort: string | null
  join_code: string
}

export default function KelasActions({ kelas }: { kelas: Kelas }) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState<'edit' | 'reset' | 'delete' | null>(null)
  const [form, setForm] = useState({ name: kelas.name, cohort: kelas.cohort ?? '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openModal(type: 'edit' | 'reset' | 'delete') {
    setModal(type)
    setOpen(false)
    setError(null)
  }

  async function handleEdit() {
    if (!form.name.trim()) return
    setLoading(true)
    const { error: err } = await supabase
      .from('classes')
      .update({ name: form.name.trim(), cohort: form.cohort || null })
      .eq('id', kelas.id)
    setLoading(false)
    if (err) { setError(err.message); return }
    setModal(null)
    router.refresh()
  }

  async function handleResetCode() {
    setLoading(true)
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const { error: err } = await supabase
      .from('classes')
      .update({ join_code: newCode })
      .eq('id', kelas.id)
    setLoading(false)
    if (err) { setError(err.message); return }
    setModal(null)
    router.refresh()
  }

  async function handleDelete() {
    setLoading(true)
    const { error: err } = await supabase.from('classes').delete().eq('id', kelas.id)
    setLoading(false)
    if (err) { setError(err.message); return }
    router.push('/guru/kelas')
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 rounded-xl text-slate-300 text-sm transition-colors"
        >
          ⚙️ Kelola <span className="text-xs">{open ? '▲' : '▼'}</span>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-44 bg-slate-900 border border-slate-700/50 rounded-xl shadow-xl z-50 overflow-hidden">
              <button onClick={() => openModal('edit')} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                ✏️ Edit Kelas
              </button>
              <button onClick={() => openModal('reset')} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                🔄 Reset Kode
              </button>
              <div className="border-t border-slate-800" />
              <button onClick={() => openModal('delete')} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                🗑️ Hapus Kelas
              </button>
            </div>
          </>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>

            {error && <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">{error}</div>}

            {modal === 'edit' && (
              <>
                <h2 className="text-lg font-black text-white mb-4">✏️ Edit Kelas</h2>
                <div className="space-y-3 mb-5">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Nama Kelas</label>
                    <input
                      type="text" value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Kohort <span className="text-slate-600">(opsional)</span></label>
                    <input
                      type="text" value={form.cohort}
                      onChange={e => setForm({ ...form, cohort: e.target.value })}
                      placeholder="Semester Ganjil 2026"
                      className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setModal(null)} className="flex-1 py-2.5 bg-slate-800 border border-slate-700/50 text-slate-300 rounded-xl text-sm">Batal</button>
                  <button onClick={handleEdit} disabled={loading} className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl text-sm disabled:opacity-60">
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </>
            )}

            {modal === 'reset' && (
              <>
                <h2 className="text-lg font-black text-white mb-2">🔄 Reset Kode Kelas</h2>
                <p className="text-slate-400 text-sm mb-6">
                  Kode <strong className="text-teal-400 font-mono">{kelas.join_code}</strong> akan diganti kode baru. Siswa yang sudah join tidak terpengaruh.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setModal(null)} className="flex-1 py-2.5 bg-slate-800 border border-slate-700/50 text-slate-300 rounded-xl text-sm">Batal</button>
                  <button onClick={handleResetCode} disabled={loading} className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl text-sm disabled:opacity-60">
                    {loading ? 'Mereset...' : 'Reset Kode'}
                  </button>
                </div>
              </>
            )}

            {modal === 'delete' && (
              <>
                <div className="text-center mb-5">
                  <div className="text-4xl mb-3">⚠️</div>
                  <h2 className="text-lg font-black text-white mb-2">Hapus Kelas?</h2>
                  <p className="text-slate-400 text-sm">
                    Kelas <strong className="text-white">"{kelas.name}"</strong> dan semua data anggotanya akan dihapus permanen.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setModal(null)} className="flex-1 py-2.5 bg-slate-800 border border-slate-700/50 text-slate-300 rounded-xl text-sm">Batal</button>
                  <button onClick={handleDelete} disabled={loading} className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-xl text-sm disabled:opacity-60">
                    {loading ? 'Menghapus...' : 'Ya, Hapus'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
