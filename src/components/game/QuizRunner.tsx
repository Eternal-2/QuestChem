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

export default function QuizRunner({ quest, previousScore }: QuizRunnerProps) {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [result, setResult] = useState<{ score: number; xpEarned: number; leveledUp: boolean } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Read type
  const [readPage, setReadPage] = useState(0)

  if (quest.type === 'read') {
    const sections = quest.content as ReadSection[]
    if (!started) {
      return (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="text-5xl mb-4">📖</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Ready to read?</h2>
          <p className="text-gray-500 text-sm mb-6">{sections.length} sections to explore</p>
          <button
            onClick={() => setStarted(true)}
            className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Start Reading
          </button>
        </div>
      )
    }

    const section = sections[readPage]
    const isLast = readPage === sections.length - 1

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
    }

    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {sections.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-colors ${i <= readPage ? 'bg-blue-500' : 'bg-gray-100'}`}
            />
          ))}
        </div>

        <div className="text-xs text-gray-400 mb-2">{section.section}</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{section.section}</h2>
        <p className="text-gray-600 leading-relaxed text-sm">{section.content}</p>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setReadPage(p => p - 1)}
            disabled={readPage === 0}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-gray-400 disabled:opacity-40 transition-colors"
          >
            ← Previous
          </button>
          {isLast ? (
            <button
              onClick={handleFinishRead}
              disabled={submitting}
              className="px-6 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Saving...' : 'Complete ✓'}
            </button>
          ) : (
            <button
              onClick={() => setReadPage(p => p + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    )
  }

  // Quiz type
  const questions = quest.content as QuizQuestion[]

  if (result) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div className="text-6xl mb-4">{result.score >= 80 ? '🏆' : result.score >= 60 ? '⭐' : '😅'}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {result.score >= 80 ? 'Excellent!' : result.score >= 60 ? 'Good Job!' : 'Keep Practicing!'}
        </h2>
        <p className="text-gray-500 text-sm mb-6">You scored {result.score}%</p>

        <div className="grid grid-cols-2 gap-4 mb-8 max-w-xs mx-auto">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-600">+{result.xpEarned}</div>
            <div className="text-xs text-blue-500">XP Earned</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-700">{result.score}%</div>
            <div className="text-xs text-gray-500">Score</div>
          </div>
        </div>

        {result.leveledUp && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6 text-yellow-700 font-medium text-sm">
            🎉 Level Up! You've reached a new level!
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              setStarted(false); setCurrentIdx(0); setSelected(null)
              setAnswers([]); setShowExplanation(false); setResult(null)
            }}
            className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:border-gray-400 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/quests')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Quests
          </button>
        </div>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div className="text-5xl mb-4">📝</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{questions.length} Questions</h2>
        <p className="text-gray-500 text-sm mb-2">Pass score: 60% &nbsp;•&nbsp; Max XP: +{quest.xp_reward}</p>
        {previousScore !== null && (
          <p className="text-sm text-blue-600 mb-4">Best score: {previousScore}%</p>
        )}
        <button
          onClick={() => setStarted(true)}
          className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Start Quest
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
      // Calculate score & submit
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
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex gap-1 flex-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i < currentIdx ? 'bg-green-500' : i === currentIdx ? 'bg-blue-500' : 'bg-gray-100'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">{currentIdx + 1}/{questions.length}</span>
      </div>

      {/* Question */}
      <h3 className="text-base font-semibold text-gray-900 mb-5 leading-relaxed">{question.question}</h3>

      {/* Options */}
      <div className="space-y-3 mb-5">
        {question.options.map((opt, i) => {
          let style = 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
          if (isAnswered) {
            if (i === question.answer) style = 'border-green-500 bg-green-50 text-green-800'
            else if (i === selected) style = 'border-red-400 bg-red-50 text-red-700'
            else style = 'border-gray-100 text-gray-400'
          } else if (selected === i) {
            style = 'border-blue-500 bg-blue-50 text-blue-700'
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
        <div className={`p-4 rounded-xl mb-5 text-sm ${selected === question.answer ? 'bg-green-50 text-green-800' : 'bg-orange-50 text-orange-800'}`}>
          <span className="font-semibold mr-1">{selected === question.answer ? '✓ Correct!' : '✗ Not quite.'}</span>
          {question.explanation}
        </div>
      )}

      {/* Next button */}
      {isAnswered && (
        <button
          onClick={handleNext}
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {submitting ? 'Submitting...' : currentIdx < questions.length - 1 ? 'Next Question →' : 'Finish Quest ✓'}
        </button>
      )}
    </div>
  )
}
