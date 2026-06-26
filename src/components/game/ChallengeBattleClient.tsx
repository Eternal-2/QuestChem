'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface QuizQuestion {
  question: string
  options: string[]
  answer?: number
  correct_index?: number
  explanation: string
}

interface ChallengeBattleClientProps {
  challenge: {
    id: string
    opponent_score: number
  }
  quest: {
    id: string
    title: string
    content: QuizQuestion[]
    xp_reward: number
  }
  opponentName: string
  playerName: string
  playerLevel: number
}

export default function ChallengeBattleClient({
  challenge, quest, opponentName, playerName, playerLevel,
}: ChallengeBattleClientProps) {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [showExplain, setShowExplain] = useState(false)
  const [result, setResult] = useState<{ score: number; xpEarned: number; outcome: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const questions = quest.content
  const totalQ = questions.length
  const q = questions[currentQ]

  function getAnswerIndex(question: QuizQuestion) {
    return question.correct_index ?? question.answer ?? 0
  }

  function handleAnswer(idx: number) {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
    if (idx === getAnswerIndex(q)) setCorrectCount(c => c + 1)
    setShowExplain(true)
  }

  async function handleNext() {
    setSelected(null)
    setAnswered(false)
    setShowExplain(false)

    const nextIdx = currentQ + 1
    if (nextIdx >= totalQ) {
      const finalScore = Math.round((correctCount / totalQ) * 100)
      const xpEarned = Math.round((finalScore / 100) * quest.xp_reward)

      setSubmitting(true)
      try {
        const res = await fetch(`/api/challenge/${challenge.id}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score: finalScore, xp_earned: xpEarned }),
        })
        const data = await res.json()
        setResult({
          score: finalScore,
          xpEarned,
          outcome: data.result ?? (finalScore > challenge.opponent_score ? 'challenger_win' : finalScore < challenge.opponent_score ? 'opponent_win' : 'draw'),
        })
      } catch {
        setResult({
          score: finalScore,
          xpEarned,
          outcome: finalScore > challenge.opponent_score ? 'challenger_win' : finalScore < challenge.opponent_score ? 'opponent_win' : 'draw',
        })
      }
      setSubmitting(false)
      router.refresh()
    } else {
      setCurrentQ(nextIdx)
    }
  }

  // ============ HASIL ============
  if (result) {
    const won = result.outcome === 'challenger_win'
    const draw = result.outcome === 'draw'

    return (
      <div className="min-h-screen bg-[#080c14] text-white font-sans flex items-center justify-center">
        <div className="max-w-md w-full px-6 text-center space-y-5">
          <div className="text-8xl">{won ? '🏆' : draw ? '🤝' : '💀'}</div>
          <h1 className={`text-3xl font-black ${won ? 'text-yellow-400' : draw ? 'text-slate-300' : 'text-red-400'}`}>
            {won ? 'MENANG!' : draw ? 'SERI!' : 'KALAH!'}
          </h1>
          <p className="text-slate-400">
            {won
              ? `Skormu mengalahkan rekor ${opponentName}!`
              : draw
              ? `Skormu sama dengan rekor ${opponentName}.`
              : `Rekor ${opponentName} masih lebih unggul. Coba quest lain untuk menantang lagi!`}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/60 border border-purple-500/30 rounded-xl p-4">
              <div className="text-xl font-black text-purple-400">{result.score}%</div>
              <div className="text-xs text-slate-500">Skormu</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4">
              <div className="text-xl font-black text-slate-300">{challenge.opponent_score}%</div>
              <div className="text-xs text-slate-500">Rekor {opponentName}</div>
            </div>
          </div>

          {result.xpEarned > 0 && (
            <div className="bg-yellow-400/10 border border-yellow-500/20 rounded-xl py-2">
              <span className="text-sm font-semibold text-yellow-400">⭐ +{result.xpEarned} XP dari quest</span>
              {won && <span className="text-sm font-semibold text-yellow-400"> · +25 XP bonus menang</span>}
            </div>
          )}

          <button
            onClick={() => router.push('/murid/challenge')}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl"
          >
            ← Kembali ke Tantangan
          </button>
        </div>
      </div>
    )
  }

  // ============ LAYAR MULAI ============
  if (!started) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white font-sans flex items-center justify-center">
        <div className="max-w-md w-full px-6 text-center space-y-5">
          <div className="text-6xl">🥊</div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
            Tantangan: {quest.title}
          </h1>

          <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center font-black mb-2">
                {playerLevel}
              </div>
              <div className="text-xs font-semibold text-white truncate">{playerName}</div>
              <div className="text-xs text-slate-500">Kamu</div>
            </div>
            <span className="text-xl text-slate-600 px-2">VS</span>
            <div className="text-center flex-1">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-black mb-2">
                {challenge.opponent_score}%
              </div>
              <div className="text-xs font-semibold text-white truncate">{opponentName}</div>
              <div className="text-xs text-slate-500">Rekor terbaik</div>
            </div>
          </div>

          <p className="text-sm text-slate-400">
            Jawab {totalQ} pertanyaan kimia. Skormu akan dibandingkan dengan rekor terbaik {opponentName} — bukan main bersamaan, kamu melawan hasil terbaiknya.
          </p>

          <button
            onClick={() => setStarted(true)}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold rounded-xl transition-all"
          >
            ⚔️ Mulai Tantangan
          </button>
        </div>
      </div>
    )
  }

  // ============ BATTLE ============
  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Soal {currentQ + 1}/{totalQ}</span>
          <span className="text-xs text-purple-400">Target: {challenge.opponent_score}%</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5">
          <p className="text-white font-semibold text-base mb-4 leading-relaxed">{q.question}</p>

          <div className="space-y-2">
            {q.options.map((opt, i) => {
              let style = 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:border-slate-600 hover:text-white'
              if (answered) {
                if (i === getAnswerIndex(q)) style = 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                else if (i === selected) style = 'bg-red-500/20 border-red-500/50 text-red-300'
                else style = 'bg-slate-800/40 border-slate-700/30 text-slate-500'
              }
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={answered}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${style} disabled:cursor-default`}
                >
                  <span className="font-semibold mr-2">{['A', 'B', 'C', 'D'][i]}.</span>
                  {opt}
                </button>
              )
            })}
          </div>

          {showExplain && (
            <div className={`mt-4 p-3 rounded-xl border text-sm ${selected === getAnswerIndex(q) ? 'bg-teal-500/10 border-teal-500/30 text-teal-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
              <div className="font-bold mb-1">{selected === getAnswerIndex(q) ? '✅ Benar!' : '❌ Salah!'}</div>
              <div className="text-xs opacity-80">{q.explanation}</div>
            </div>
          )}
        </div>

        {answered && (
          <button
            onClick={handleNext}
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold rounded-xl transition-all disabled:opacity-60"
          >
            {submitting ? 'Mengirim...' : currentQ + 1 >= totalQ ? '⚔️ Lihat Hasil' : '➤ Soal Berikutnya'}
          </button>
        )}

        <div className="flex justify-center gap-2">
          {questions.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentQ ? 'bg-purple-400' : i < currentQ ? 'bg-teal-500' : 'bg-slate-700'}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
