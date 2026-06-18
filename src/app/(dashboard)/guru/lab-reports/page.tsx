import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LabReportsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/guru/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">🔬 Lab Reports</h1>
        <p className="text-slate-400 text-sm mt-0.5">Pantau eksperimen yang dilakukan siswa di laboratorium pribadi</p>
      </div>

      <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-12 text-center">
        <div className="text-4xl mb-3">🧪</div>
        <h2 className="text-white font-bold mb-2">Segera hadir</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Fitur ini akan menampilkan log eksperimen siswa di Laboratorium Pribadi —
          termasuk reaksi yang dicoba dan insiden ledakan jika salah campur.
          Akan aktif setelah tabel <code className="text-teal-400">lab_experiments</code> dibuat di Fase 2.
        </p>
      </div>
    </div>
  )
}
