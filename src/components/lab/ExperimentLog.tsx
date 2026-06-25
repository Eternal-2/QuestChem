'use client'
import { useEffect, useState } from 'react'
import type { LabExperiment } from '@/types/lab'

export default function ExperimentLog({ refreshKey }: { refreshKey: number }) {
  const [experiments, setExperiments] = useState<LabExperiment[]>([])
  const [explosionCount, setExplosionCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/lab/experiments')
      .then(res => res.json())
      .then(data => {
        setExperiments(data.experiments ?? [])
        setExplosionCount(data.explosion_count ?? 0)
      })
      .finally(() => setLoading(false))
  }, [refreshKey])

  return (
    <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <span>📓</span> Catatan Laboratorium
        </h3>
        {explosionCount > 0 && (
          <span className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded-full">
            💥 {explosionCount}x meledak
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 rounded-xl bg-slate-800/40 animate-pulse" />
          ))}
        </div>
      ) : experiments.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          <div className="text-2xl mb-2 opacity-50">📭</div>
          <p className="text-xs">Belum ada eksperimen tercatat</p>
          <p className="text-[10px] text-slate-600 mt-1">Coba campurkan bahan di meja lab untuk mulai mencatat</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {experiments.map(exp => (
            <div
              key={exp.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
                exp.is_explosion
                  ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                  : exp.reaction_id
                  ? 'bg-teal-500/5 border-teal-500/20 hover:bg-teal-500/10'
                  : 'bg-slate-800/40 border-slate-700/30 hover:bg-slate-800/60'
              }`}
            >
              <span
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                  exp.is_explosion ? 'bg-red-500/15' : exp.reaction_id ? 'bg-teal-500/15' : 'bg-slate-700/40'
                }`}
              >
                {exp.is_explosion ? '💥' : exp.reaction_id ? '✨' : '❓'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-slate-200 truncate font-mono">
                  {exp.reagent_a?.symbol ?? '?'} + {exp.reagent_b?.symbol ?? '?'}
                </div>
                <div className="text-[10px] text-slate-500 truncate">{exp.result_label}</div>
              </div>
              {exp.xp_earned > 0 && (
                <span className="text-[10px] font-semibold text-yellow-400 flex-shrink-0">+{exp.xp_earned} XP</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
