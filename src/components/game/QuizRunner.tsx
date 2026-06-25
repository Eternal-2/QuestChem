'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Quest } from '@/types/database'

interface QuizRunnerProps {
  quest: Quest
  previousScore: number | null
}

type QuizQuestion = {
  question: string
  options: string[]
  answer: number
  explanation: string
}

type ReadSection = {
  section: string
  content: string
}

type LabStep = {
  step: number
  instruction: string
  expected: string
}

export default function QuizRunner({ quest, previousScore }: QuizRunnerProps) {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [result, setResult] = useState<{ score: number; xpEarned: number; leveledUp: boolean } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Read & lab pakai paginasi sederhana yang sama
  const [pageIdx, setPageIdx] = useState(0)

  // ============================================
  // TIPE: BACAAN
  // ============================================
  if (quest.type === 'read') {
    const sections = quest.content as ReadSection[]
    if (!started) {
      return (
        <div className="bg-slate-900/60 backdrop-blur rounded-2xl border border-slate-700/50 p-8 text-center">
          <div className="text-5xl mb-4">📖</div>
          <h2 className="text-lg font-semibold text-white mb-2">Siap untuk membaca?</h2>
          <p className="text-slate-400 text-sm mb-6">{sections.length} bagian untuk dijelajahi</p>
          <button
            onClick={() => setStarted(true)}
            className="bg-teal-500 hover:bg-teal-400 text-slate-900 px-8 py-2.5 rounded-xl font-semibold transition-colors"
          >
            Mulai Membaca
          </button>
        </div>
      )
    }

    const section = sections[pageIdx]
    const isLast = pageIdx === sections.length - 1

    const handleFinishRead = async () => {
      setSubmitting(true)
      const res = await fetch(`/api/quests/${quest.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: [], score: 100 }),
      })
      const data = await res.json()
      setResult({ score: 100, xpEarned: data.xp_earned ?? quest.xp_reward, leveledUp: data.level_up_info?.leveled_up ?? false })
      setSubmitting(false)
      // PENTING: beri tahu Next.js untuk re-render Server Component (Sidebar, Header)
      // dengan data XP terbaru dari database — tanpa ini sidebar tetap menampilkan
      // angka lama karena dia hanya menerima props sekali saat halaman pertama dimuat.
      router.refresh()
    }

    return (
      <div className="bg-slate-900/60 backdrop-blur rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center gap-2 mb-6">
          {sections.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-colors ${i <= pageIdx ? 'bg-teal-400' : 'bg-slate-800'}`}
            />
          ))}
        </div>

        <div className="text-xs text-slate-500 mb-2">Bagian {pageIdx + 1} dari {sections.length}</div>
        <h2 className="text-lg font-semibold text-white mb-4">{section.section}</h2>
        <p className="text-slate-300 leading-relaxed text-sm">{section.content}</p>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setPageIdx(p => p - 1)}
            disabled={pageIdx === 0}
            className="px-4 py-2 rounded-xl border border-slate-700 text-sm text-slate-300 hover:border-slate-600 disabled:opacity-40 transition-colors"
          >
            ← Sebelumnya
          </button>
          {isLast ? (
            <button
              onClick={handleFinishRead}
              disabled={submitting}
              className="px-6 py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded-xl text-sm font-semibold disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Menyimpan...' : 'Selesai ✓'}
            </button>
          ) : (
            <button
              onClick={() => setPageIdx(p => p + 1)}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Lanjut →
            </button>
          )}
        </div>
      </div>
    )
  }

  // ============================================
  // TIPE: LAB TERBIMBING
  // ============================================
  if (quest.type === 'lab') {
    const steps = quest.content as LabStep[]
    if (!started) {
      return (
        <div className="bg-slate-900/60 backdrop-blur rounded-2xl border border-slate-700/50 p-8 text-center">
          <div className="text-5xl mb-4">🔬</div>
          <h2 className="text-lg font-semibold text-white mb-2">Siap memulai eksperimen?</h2>
          <p className="text-slate-400 text-sm mb-6">{steps.length} langkah terbimbing</p>
          <button
            onClick={() => setStarted(true)}
            className="bg-teal-500 hover:bg-teal-400 text-slate-900 px-8 py-2.5 rounded-xl font-semibold transition-colors"
          >
            Mulai Lab
          </button>
        </div>
      )
    }

    const step = steps[pageIdx]
    const isLast = pageIdx === steps.length - 1

    const handleFinishLab = async () => {
      setSubmitting(true)
      const res = await fetch(`/api/quests/${quest.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: [], score: 100 }),
      })
      const data = await res.json()
      setResult({ score: 100, xpEarned: data.xp_earned ?? quest.xp_reward, leveledUp: data.level_up_info?.leveled_up ?? false })
      setSubmitting(false)
      // Sama seperti bacaan — refresh Server Component supaya sidebar update
      router.refresh()
    }

    return (
      <div className="bg-slate-900/60 backdrop-blur rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-colors ${i <= pageIdx ? 'bg-purple-400' : 'bg-slate-800'}`}
            />
          ))}
        </div>

        <div className="text-xs text-slate-500 mb-2">Langkah {step.step} dari {steps.length}</div>
        <p className="text-white leading-relaxed text-sm mb-4">{step.instruction}</p>

        <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3">
          <div className="text-xs text-slate-500 mb-1">Hasil yang diharapkan</div>
          <p className="text-sm text-teal-300">{step.expected}</p>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setPageIdx(p => p - 1)}
            disabled={pageIdx === 0}
            className="px-4 py-2 rounded-xl border border-slate-700 text-sm text-slate-300 hover:border-slate-600 disabled:opacity-40 transition-colors"
          >
            ← Sebelumnya
          </button>
          {isLast ? (
            <button
              onClick={handleFinishLab}
              disabled={submitting}
              className="px-6 py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded-xl text-sm font-semibold disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Menyimpan...' : 'Selesai ✓'}
            </button>
          ) : (
            <button
              onClick={() => setPageIdx(p => p + 1)}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Lanjut →
            </button>
          )}
        </div>
      </div>
    )
  }

  // ============================================
  // TIPE: QUIZ
  // ============================================
  const questions = quest.content as QuizQuestion[]

  if (result) {
    return (
      <div className="bg-slate-900/60 backdrop-blur rounded-2xl border border-slate-700/50 p-8 text-center">
        <div className="text-6xl mb-4">{result.score >= 80 ? '🏆' : result.score >= 60 ? '⭐' : '😅'}</div>
        <h2 className="text-2xl font-bold text-white mb-1">
          {result.score >= 80 ? 'Luar Biasa!' : result.score >= 60 ? 'Kerja Bagus!' : 'Terus Berlatih!'}
        </h2>
        <p className="text-slate-400 text-sm mb-6">Skor kamu {result.score}%</p>

        <div className="grid grid-cols-2 gap-4 mb-8 max-w-xs mx-auto">
          <div className="bg-yellow-400/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-400">+{result.xpEarned}</div>
            <div className="text-xs text-yellow-500/80">XP Diperoleh</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{result.score}%</div>
            <div className="text-xs text-slate-400">Skor</div>
          </div>
        </div>

        {result.leveledUp && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 mb-6 text-purple-300 font-medium text-sm">
            🎉 Naik Level! Kamu mencapai level baru!
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              setStarted(false); setCurrentIdx(0); setSelected(null)
              setAnswers([]); setShowExplanation(false); setResult(null)
            }}
            className="px-6 py-2.5 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium hover:border-slate-600 transition-colors"
          >
            Coba Lagi
          </button>
          <button
            onClick={() => router.push('/murid/quests')}
            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded-xl text-sm font-semibold transition-colors"
          >
            Kembali ke Quests
          </button>
        </div>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="bg-slate-900/60 backdrop-blur rounded-2xl border border-slate-700/50 p-8 text-center">
        <div className="text-5xl mb-4">📝</div>
        <h2 className="text-lg font-semibold text-white mb-2">{questions.length} Pertanyaan</h2>
        <p className="text-slate-400 text-sm mb-2">Nilai lulus: 60% &nbsp;•&nbsp; XP maksimal: +{quest.xp_reward}</p>
        {previousScore !== null && (
          <p className="text-sm text-teal-400 mb-4">Skor terbaik: {previousScore}%</p>
        )}
        <button
          onClick={() => setStarted(true)}
          className="bg-teal-500 hover:bg-teal-400 text-slate-900 px-8 py-2.5 rounded-xl font-semibold transition-colors"
        >
          Mulai Quest
        </button>
      </div>
    )
  }

  const question = questions[currentIdx]
  const isAnswered = selected !== null

  const handleNext = async () => {
    const newAnswers = [...answers, selected!]
    setAnswers(newAnswers)

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1)
      setSelected(null)
      setShowExplanation(false)
    } else {
      setSubmitting(true)
      const correct = newAnswers.filter((a, i) => a === questions[i].answer).length
      const score = Math.round((correct / questions.length) * 100)

      const res = await fetch(`/api/quests/${quest.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: newAnswers, score }),
      })
      const data = await res.json()
      setResult({
        score,
        xpEarned: data.xp_earned ?? 0,
        leveledUp: data.level_up_info?.leveled_up ?? false,
      })
      setSubmitting(false)
      // PENTING: ini baris yang hilang sebelumnya — tanpa ini, sidebar (Server
      // Component) tidak pernah tahu XP siswa sudah berubah di database, jadi
      // tetap menampilkan angka lama sampai user reload manual / pindah halaman.
      router.refresh()
    }
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur rounded-2xl border border-slate-700/50 p-6">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex gap-1 flex-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i < currentIdx ? 'bg-teal-400' : i === currentIdx ? 'bg-purple-400' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-slate-500 flex-shrink-0">{currentIdx + 1}/{questions.length}</span>
      </div>

      {/* Question */}
      <h3 className="text-base font-semibold text-white mb-5 leading-relaxed">{question.question}</h3>

      {/* Options */}
      <div className="space-y-3 mb-5">
        {question.options.map((opt, i) => {
          let style = 'border-slate-700 text-slate-300 hover:border-purple-500/40 hover:bg-slate-800/60'
          if (isAnswered) {
            if (i === question.answer) style = 'border-teal-500/60 bg-teal-500/10 text-teal-300'
            else if (i === selected) style = 'border-red-500/50 bg-red-500/10 text-red-300'
            else style = 'border-slate-800 text-slate-500'
          } else if (selected === i) {
            style = 'border-purple-500/60 bg-purple-500/10 text-purple-300'
          }

          return (
            <button
              key={i}
              onClick={() => { if (!isAnswered) { setSelected(i); setShowExplanation(true) } }}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${style}`}
            >
              <span className="mr-2 text-xs opacity-60">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className={`p-4 rounded-xl mb-5 text-sm ${selected === question.answer ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' : 'bg-orange-500/10 text-orange-300 border border-orange-500/20'}`}>
          <span className="font-semibold mr-1">{selected === question.answer ? '✓ Benar!' : '✗ Belum tepat.'}</span>
          {question.explanation}
        </div>
      )}

      {/* Next button */}
      {isAnswered && (
        <button
          onClick={handleNext}
          disabled={submitting}
          className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 py-2.5 rounded-xl font-semibold disabled:opacity-60 transition-colors"
        >
          {submitting ? 'Mengirim...' : currentIdx < questions.length - 1 ? 'Pertanyaan Selanjutnya →' : 'Selesaikan Quest ✓'}
        </button>
      )}
    </div>
  )
}
