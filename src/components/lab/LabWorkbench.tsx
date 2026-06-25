'use client'
import { useState } from 'react'
import type { Reagent, RunExperimentResult } from '@/types/lab'
import ExplosionOverlay from './ExplosionOverlay'
import ReagentVial from './ReagentVial'
import BeakerSlot from './BeakerSlot'

interface LabWorkbenchProps {
  reagents: Reagent[]
  onExperimentComplete: (result: RunExperimentResult) => void
}

type SlotState = Reagent | null

const CATEGORY_LABEL: Record<string, string> = {
  acid: 'Asam', base: 'Basa', metal: 'Logam', water: 'Air',
  salt: 'Garam', gas: 'Gas', organic: 'Organik',
}

export default function LabWorkbench({ reagents, onExperimentComplete }: LabWorkbenchProps) {
  const [slotA, setSlotA] = useState<SlotState>(null)
  const [slotB, setSlotB] = useState<SlotState>(null)
  const [dragOverSlot, setDragOverSlot] = useState<'a' | 'b' | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [isReacting, setIsReacting] = useState(false)
  const [result, setResult] = useState<RunExperimentResult | null>(null)
  const [showExplosion, setShowExplosion] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const categories = Array.from(new Set(reagents.map(r => r.category)))
  const filteredReagents = activeFilter ? reagents.filter(r => r.category === activeFilter) : reagents

  function handleDragStart(reagent: Reagent) {
    setDraggedId(reagent.id)
  }

  function handleDrop(slot: 'a' | 'b') {
    const reagent = reagents.find(r => r.id === draggedId)
    if (!reagent) return
    if (slot === 'a') setSlotA(reagent)
    else setSlotB(reagent)
    setDragOverSlot(null)
    setDraggedId(null)
  }

  function clearSlots() {
    setSlotA(null)
    setSlotB(null)
    setResult(null)
    setError(null)
  }

  async function handleReact() {
    if (!slotA || !slotB) {
      setError('Isi kedua beaker dulu sebelum mereaksikan')
      return
    }
    setIsReacting(true)
    setError(null)

    try {
      const res = await fetch('/api/lab/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reagent_a_id: slotA.id, reagent_b_id: slotB.id }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Gagal menjalankan reaksi')
        setIsReacting(false)
        return
      }

      setResult(data)
      onExperimentComplete(data)

      if (data.is_explosion) {
        setIsShaking(true)
        setShowExplosion(true)
        setTimeout(() => setShowExplosion(false), 1800)
        setTimeout(() => setIsShaking(false), 500)
      }
    } catch {
      setError('Koneksi gagal, coba lagi')
    } finally {
      setIsReacting(false)
    }
  }

  return (
    <div className="relative">
      {showExplosion && <ExplosionOverlay />}

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_260px] gap-4">

        {/* ============ RAK BAHAN ============ */}
        <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-4 flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <span>🗄️</span> Rak Bahan
          </h3>

          {/* Filter kategori — chip kecil */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <button
              onClick={() => setActiveFilter(null)}
              className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                activeFilter === null
                  ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                  : 'border-slate-700 text-slate-500 hover:border-slate-600'
              }`}
            >
              Semua
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat === activeFilter ? null : cat)}
                className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                  activeFilter === cat
                    ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                    : 'border-slate-700 text-slate-500 hover:border-slate-600'
                }`}
              >
                {CATEGORY_LABEL[cat] ?? cat}
              </button>
            ))}
          </div>

          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 flex-1">
            {filteredReagents.map(reagent => (
              <ReagentVial
                key={reagent.id}
                reagent={reagent}
                onDragStart={() => handleDragStart(reagent)}
                isDragging={draggedId === reagent.id}
              />
            ))}
          </div>
        </div>

        {/* ============ MEJA PENCAMPURAN ============ */}
        <div className="relative bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-6 min-h-[460px] overflow-hidden">
          {/* Tekstur meja — gradient halus seperti permukaan granit lab */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(45,212,191,0.04),transparent_60%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-600/40 to-transparent" />

          <p className="relative text-sm text-slate-400 text-center max-w-xs">
            Tarik bahan dari rak ke dua beaker di bawah, lalu klik <strong className="text-teal-300">Reaksikan</strong>
          </p>

          <div className="relative flex items-end gap-8">
            <BeakerSlot
              label="Beaker A"
              reagent={slotA}
              isOver={dragOverSlot === 'a'}
              isShaking={isShaking}
              onDragOver={() => setDragOverSlot('a')}
              onDragLeave={() => setDragOverSlot(null)}
              onDrop={() => handleDrop('a')}
            />

            <div className="flex flex-col items-center justify-center h-32 pb-2">
              <span className="text-2xl text-slate-600 font-light">+</span>
            </div>

            <BeakerSlot
              label="Beaker B"
              reagent={slotB}
              isOver={dragOverSlot === 'b'}
              isShaking={isShaking}
              onDragOver={() => setDragOverSlot('b')}
              onDragLeave={() => setDragOverSlot(null)}
              onDrop={() => handleDrop('b')}
            />
          </div>

          {error && (
            <div className="relative text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-1.5">
              {error}
            </div>
          )}

          <div className="relative flex gap-3">
            <button
              onClick={handleReact}
              disabled={isReacting || !slotA || !slotB}
              className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-[0_0_24px_-4px_rgba(45,212,191,0.5)] hover:shadow-[0_0_32px_-4px_rgba(45,212,191,0.7)] active:scale-95"
            >
              {isReacting ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Mereaksikan...
                </>
              ) : (
                <>⚗️ Reaksikan</>
              )}
            </button>
            <button
              onClick={clearSlots}
              className="px-4 py-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-300 font-medium rounded-xl text-sm transition-colors"
            >
              Bersihkan
            </button>
          </div>
        </div>

        {/* ============ PANEL HASIL ============ */}
        <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-4 flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <span>📋</span> Hasil Reaksi
          </h3>

          {!result ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10 text-slate-500">
              <div className="text-3xl mb-2 opacity-40">🧫</div>
              <p className="text-xs">Belum ada reaksi dijalankan</p>
            </div>
          ) : (
            <ResultPanel result={result} />
          )}
        </div>
      </div>
    </div>
  )
}

function ResultPanel({ result }: { result: RunExperimentResult }) {
  if (!result.reaction_found) {
    return (
      <div className="flex-1 flex flex-col items-center text-center justify-center py-8 animate-[fade-in_0.3s_ease-out]">
        <div className="text-3xl mb-2">❓</div>
        <p className="text-sm text-slate-300 font-medium mb-1">Tidak ada reaksi dikenal</p>
        <p className="text-xs text-slate-500">Kombinasi ini belum terdaftar di basis data reaksi</p>
      </div>
    )
  }

  if (result.is_explosion) {
    return (
      <div className="flex-1 flex flex-col items-center text-center justify-center py-6 animate-[fade-in_0.3s_ease-out]">
        <div className="text-4xl mb-2">💥</div>
        <p className="text-sm text-red-400 font-bold mb-1">{result.result_label}</p>
        {result.result_formula && <p className="text-xs text-slate-400 font-mono mb-2">{result.result_formula}</p>}
        {result.explanation && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 mt-1">
            <p className="text-xs text-slate-400 leading-relaxed">{result.explanation}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3 animate-[fade-in_0.3s_ease-out]">
      <div className="text-center py-2">
        <div className="text-3xl mb-2">✨</div>
        <p className="text-sm text-teal-300 font-bold">{result.result_label}</p>
        {result.result_formula && <p className="text-xs text-slate-400 font-mono mt-0.5">{result.result_formula}</p>}
      </div>

      {result.xp_earned > 0 && (
        <div className="flex items-center justify-center gap-1.5 bg-yellow-400/10 border border-yellow-500/20 rounded-lg py-1.5">
          <span className="text-xs font-semibold text-yellow-400">⭐ +{result.xp_earned} XP</span>
        </div>
      )}

      {result.explanation && (
        <div className="bg-slate-800/60 rounded-lg p-3">
          <p className="text-xs text-slate-400 leading-relaxed">{result.explanation}</p>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
