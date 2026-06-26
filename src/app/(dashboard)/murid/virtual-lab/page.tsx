'use client'
import { useEffect, useState } from 'react'
import LabWorkbench from '@/components/lab/LabWorkbench'
import ExperimentLog from '@/components/lab/ExperimentLog'
import type { Reagent, RunExperimentResult } from '@/types/lab'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation' // 👈 1. Tambahkan import useRouter

export default function VirtualLabPage() {
  const router = useRouter() // 👈 2. Inisialisasi router
  const supabase = createClient()
  const [reagents, setReagents] = useState<Reagent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [lastResult, setLastResult] = useState<RunExperimentResult | null>(null)

  useEffect(() => {
    async function loadReagents() {
      const { data } = await supabase
        .from('reagents')
        .select('*')
        .order('category')
      setReagents(data ?? [])
      setLoading(false)
    }
    loadReagents()
  }, [])

  function handleExperimentComplete(result: RunExperimentResult) {
    setLastResult(result)
    setRefreshKey(k => k + 1)
    
    // 👇 3. Tambahkan baris ini agar Sidebar langsung memperbarui XP!
    router.refresh() 
  }

return (
    // Tambahkan px-4 (padding kiri-kanan untuk HP) dan pb-24 (ruang kosong di bawah agar tidak tertutup bar HP)
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6 pb-24">
      <div className="relative">
        <div className="absolute -top-8 -left-4 w-64 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <h1 className="relative text-2xl font-black text-white flex items-center gap-2">
          🔬 Laboratorium Pribadi
        </h1>
        <p className="relative text-slate-400 text-sm mt-0.5">
          Campurkan bahan kimia secara bebas untuk eksplorasi. Hati-hati — beberapa kombinasi bisa berbahaya!
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Memuat rak bahan...</div>
      ) : (
        <div className="w-full overflow-x-hidden"> {/* 👈 Pencegah komponen anak melebar keluar layar */}
          <LabWorkbench reagents={reagents} onExperimentComplete={handleExperimentComplete} />
          <div className="mt-8">
            <ExperimentLog refreshKey={refreshKey} />
          </div>
        </div>
      )}
    </div>
  )
}
