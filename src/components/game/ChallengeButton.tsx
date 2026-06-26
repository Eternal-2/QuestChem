'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Classmate {
  student_id: string
  display_name: string | null
  username: string
  level: number
  best_score: number
}

interface ChallengeButtonProps {
  questId: string
  questTitle: string
}

export default function ChallengeButton({ questId, questTitle }: ChallengeButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [classmates, setClassmates] = useState<Classmate[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [challenging, setChallenging] = useState<string | null>(null)

  async function openPicker() {
    setOpen(true)
    setError(null)
    if (classmates !== null) return // sudah pernah di-load

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user?.id)
      .single()

    if (!profile) {
      setError('Profil tidak ditemukan')
      setLoading(false)
      return
    }

    const { data, error: rpcError } = await supabase.rpc('get_classmates_with_quest_record', {
      p_student_id: profile.id,
      p_quest_id: questId,
    })

    if (rpcError) {
      setError('Gagal memuat daftar teman')
    } else {
      setClassmates(data ?? [])
    }
    setLoading(false)
  }

  async function handleChallenge(opponentId: string) {
    setChallenging(opponentId)
    setError(null)

    const res = await fetch('/api/challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opponent_id: opponentId, quest_id: questId }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Gagal membuat tantangan')
      setChallenging(null)
      return
    }

    setOpen(false)
    setChallenging(null)
    router.push('/murid/challenge')
  }

  return (
    <div className="relative">
      <button
        onClick={openPicker}
        className="w-full py-2 bg-slate-800/60 hover:bg-slate-800 border border-purple-500/30 text-purple-300 font-semibold rounded-xl text-xs transition-all"
      >
        🥊 Tantang Teman
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-3 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">Tantang di "{questTitle}"</span>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white text-xs">✕</button>
          </div>

          {loading ? (
            <p className="text-xs text-slate-500 text-center py-4">Memuat teman sekelas...</p>
          ) : error ? (
            <p className="text-xs text-red-400 text-center py-4">{error}</p>
          ) : !classmates || classmates.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">
              Belum ada teman sekelas yang punya rekor di quest ini.
            </p>
          ) : (
            <div className="space-y-1.5">
              {classmates.map(c => (
                <button
                  key={c.student_id}
                  onClick={() => handleChallenge(c.student_id)}
                  disabled={challenging === c.student_id}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 transition-colors text-left disabled:opacity-50"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(c.display_name ?? c.username).slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-200 truncate">{c.display_name ?? c.username}</div>
                    <div className="text-[10px] text-slate-500">Level {c.level} · Rekor {c.best_score}%</div>
                  </div>
                  <span className="text-[10px] text-purple-400 flex-shrink-0">
                    {challenging === c.student_id ? '...' : 'Tantang →'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
