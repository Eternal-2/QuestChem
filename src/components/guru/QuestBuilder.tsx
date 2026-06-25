'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { QuestType, QuestDifficulty, QuestContent, Quest } from '@/types/database'

interface QuestBuilderProps {
  initialQuest?: Quest // kalau ada, berarti mode edit
}

const TOPICS = [
  'acid_base', 'stoichiometry', 'bonding', 'periodic_table', 'reactions', 'thermodynamics',
]

type QuizItem = { question: string; options: string[]; answer: number; explanation: string }
type ReadItem = { section: string; content: string }
type LabItem  = { step: number; instruction: string; expected: string }

export default function QuestBuilder({ initialQuest }: QuestBuilderProps) {
  const router = useRouter()
  const isEdit = !!initialQuest

  const [title, setTitle] = useState(initialQuest?.title ?? '')
  const [description, setDescription] = useState(initialQuest?.description ?? '')
  const [type, setType] = useState<QuestType>(initialQuest?.type ?? 'quiz')
  const [difficulty, setDifficulty] = useState<QuestDifficulty>(initialQuest?.difficulty ?? 'easy')
  const [topic, setTopic] = useState(initialQuest?.topic ?? TOPICS[0])
  const [subtopic, setSubtopic] = useState(initialQuest?.subtopic ?? '')
  const [xpReward, setXpReward] = useState(initialQuest?.xp_reward ?? 50)
  const [estimatedMinutes, setEstimatedMinutes] = useState(initialQuest?.estimated_minutes ?? 10)

  // Content berbeda bentuk tergantung tipe quest
  const [quizItems, setQuizItems] = useState<QuizItem[]>(
    type === 'quiz' && initialQuest?.content
      ? (initialQuest.content as unknown as QuizItem[])
      : [{ question: '', options: ['', ''], answer: 0, explanation: '' }]
  )
  const [readItems, setReadItems] = useState<ReadItem[]>(
    type === 'read' && initialQuest?.content
      ? (initialQuest.content as unknown as ReadItem[])
      : [{ section: '', content: '' }]
  )
  const [labItems, setLabItems] = useState<LabItem[]>(
    type === 'lab' && initialQuest?.content
      ? (initialQuest.content as unknown as LabItem[])
      : [{ step: 1, instruction: '', expected: '' }]
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ===== Quiz handlers =====
  function addQuizItem() {
    setQuizItems(prev => [...prev, { question: '', options: ['', ''], answer: 0, explanation: '' }])
  }
  function removeQuizItem(idx: number) {
    setQuizItems(prev => prev.filter((_, i) => i !== idx))
  }
  function updateQuizItem(idx: number, patch: Partial<QuizItem>) {
    setQuizItems(prev => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)))
  }
  function addOption(qIdx: number) {
    setQuizItems(prev => prev.map((q, i) => (i === qIdx ? { ...q, options: [...q.options, ''] } : q)))
  }
  function removeOption(qIdx: number, oIdx: number) {
    setQuizItems(prev => prev.map((q, i) => {
      if (i !== qIdx) return q
      const newOptions = q.options.filter((_, oi) => oi !== oIdx)
      const newAnswer = q.answer >= newOptions.length ? 0 : q.answer
      return { ...q, options: newOptions, answer: newAnswer }
    }))
  }
  function updateOption(qIdx: number, oIdx: number, value: string) {
    setQuizItems(prev => prev.map((q, i) => {
      if (i !== qIdx) return q
      const newOptions = [...q.options]
      newOptions[oIdx] = value
      return { ...q, options: newOptions }
    }))
  }

  // ===== Read handlers =====
  function addReadItem() {
    setReadItems(prev => [...prev, { section: '', content: '' }])
  }
  function removeReadItem(idx: number) {
    setReadItems(prev => prev.filter((_, i) => i !== idx))
  }
  function updateReadItem(idx: number, patch: Partial<ReadItem>) {
    setReadItems(prev => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }

  // ===== Lab handlers =====
  function addLabItem() {
    setLabItems(prev => [...prev, { step: prev.length + 1, instruction: '', expected: '' }])
  }
  function removeLabItem(idx: number) {
    setLabItems(prev => prev.filter((_, i) => i !== idx).map((item, i) => ({ ...item, step: i + 1 })))
  }
  function updateLabItem(idx: number, patch: Partial<LabItem>) {
    setLabItems(prev => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)))
  }

  function getContent(): QuestContent[] {
    if (type === 'quiz') return quizItems as unknown as QuestContent[]
    if (type === 'read') return readItems as unknown as QuestContent[]
    if (type === 'lab') return labItems as unknown as QuestContent[]
    return []
  }

  function validate(): string | null {
    if (!title.trim()) return 'Judul quest tidak boleh kosong'
    if (!description.trim()) return 'Deskripsi quest tidak boleh kosong'

    if (type === 'quiz') {
      if (quizItems.length === 0) return 'Tambahkan minimal 1 soal'
      for (const [i, q] of quizItems.entries()) {
        if (!q.question.trim()) return `Soal #${i + 1}: pertanyaan tidak boleh kosong`
        if (q.options.some(o => !o.trim())) return `Soal #${i + 1}: semua pilihan jawaban harus diisi`
        if (q.options.length < 2) return `Soal #${i + 1}: minimal 2 pilihan jawaban`
      }
    }
    if (type === 'read') {
      if (readItems.length === 0) return 'Tambahkan minimal 1 bagian bacaan'
      for (const [i, r] of readItems.entries()) {
        if (!r.section.trim() || !r.content.trim()) return `Bagian #${i + 1}: judul dan isi tidak boleh kosong`
      }
    }
    if (type === 'lab') {
      if (labItems.length === 0) return 'Tambahkan minimal 1 langkah'
      for (const [i, l] of labItems.entries()) {
        if (!l.instruction.trim()) return `Langkah #${i + 1}: instruksi tidak boleh kosong`
      }
    }
    return null
  }

  async function handleSave(publish: boolean) {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      title: title.trim(),
      description: description.trim(),
      type,
      difficulty,
      topic,
      subtopic: subtopic.trim() || null,
      xp_reward: xpReward,
      estimated_minutes: estimatedMinutes,
      content: getContent(),
      is_published: publish,
    }

    try {
      const url = isEdit ? `/api/quests/manage/${initialQuest!.id}` : '/api/quests/manage'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Gagal menyimpan quest')
        setSaving(false)
        return
      }

      router.push('/guru/quest-bank')
    } catch {
      setError('Koneksi gagal, coba lagi')
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Info dasar */}
      <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <span>📋</span> Informasi Dasar
        </h3>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Judul Quest</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Contoh: Mengenal Asam dan Basa"
            className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Deskripsi</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder="Jelaskan singkat apa yang akan dipelajari siswa di quest ini"
            className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Tipe Quest</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as QuestType)}
              className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="quiz">📝 Quiz</option>
              <option value="read">📖 Bacaan</option>
              <option value="lab">🔬 Lab Terbimbing</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Kesulitan</label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value as QuestDifficulty)}
              className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="easy">Mudah</option>
              <option value="medium">Sedang</option>
              <option value="hard">Sulit</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Topik</label>
            <select
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              {TOPICS.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Sub-topik (opsional)</label>
            <input
              type="text"
              value={subtopic}
              onChange={e => setSubtopic(e.target.value)}
              placeholder="pH Scale"
              className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">XP Reward</label>
            <input
              type="number"
              min={0}
              value={xpReward}
              onChange={e => setXpReward(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Estimasi Waktu (menit)</label>
            <input
              type="number"
              min={1}
              value={estimatedMinutes}
              onChange={e => setEstimatedMinutes(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
        </div>
      </div>

      {/* Builder konten — beda tergantung tipe */}
      {type === 'quiz' && (
        <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span>📝</span> Soal Quiz ({quizItems.length})
            </h3>
            <button
              onClick={addQuizItem}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 bg-teal-500/10 border border-teal-500/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              + Tambah Soal
            </button>
          </div>

          {quizItems.map((q, qIdx) => (
            <div key={qIdx} className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Soal #{qIdx + 1}</span>
                {quizItems.length > 1 && (
                  <button onClick={() => removeQuizItem(qIdx)} className="text-xs text-red-400 hover:text-red-300">
                    Hapus
                  </button>
                )}
              </div>

              <textarea
                value={q.question}
                onChange={e => updateQuizItem(qIdx, { question: e.target.value })}
                placeholder="Tulis pertanyaan di sini..."
                rows={2}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              />

              <div className="space-y-2">
                <label className="text-xs text-slate-400">Pilihan jawaban (klik radio untuk tandai jawaban benar)</label>
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`answer-${qIdx}`}
                      checked={q.answer === oIdx}
                      onChange={() => updateQuizItem(qIdx, { answer: oIdx })}
                      className="w-4 h-4 accent-teal-500 flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                      placeholder={`Pilihan ${String.fromCharCode(65 + oIdx)}`}
                      className="flex-1 px-3 py-1.5 bg-slate-900/60 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    {q.options.length > 2 && (
                      <button onClick={() => removeOption(qIdx, oIdx)} className="text-slate-500 hover:text-red-400 text-sm flex-shrink-0">
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addOption(qIdx)}
                  className="text-xs text-slate-400 hover:text-slate-300"
                >
                  + Tambah pilihan
                </button>
              </div>

              <textarea
                value={q.explanation}
                onChange={e => updateQuizItem(qIdx, { explanation: e.target.value })}
                placeholder="Penjelasan jawaban (tampil setelah siswa menjawab)"
                rows={2}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              />
            </div>
          ))}
        </div>
      )}

      {type === 'read' && (
        <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span>📖</span> Bagian Bacaan ({readItems.length})
            </h3>
            <button
              onClick={addReadItem}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 bg-teal-500/10 border border-teal-500/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              + Tambah Bagian
            </button>
          </div>

          {readItems.map((r, idx) => (
            <div key={idx} className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Bagian #{idx + 1}</span>
                {readItems.length > 1 && (
                  <button onClick={() => removeReadItem(idx)} className="text-xs text-red-400 hover:text-red-300">
                    Hapus
                  </button>
                )}
              </div>
              <input
                type="text"
                value={r.section}
                onChange={e => updateReadItem(idx, { section: e.target.value })}
                placeholder="Judul bagian, misal: Pengenalan pH"
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <textarea
                value={r.content}
                onChange={e => updateReadItem(idx, { content: e.target.value })}
                placeholder="Isi materi bacaan..."
                rows={4}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              />
            </div>
          ))}
        </div>
      )}

      {type === 'lab' && (
        <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span>🔬</span> Langkah Lab Terbimbing ({labItems.length})
            </h3>
            <button
              onClick={addLabItem}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 bg-teal-500/10 border border-teal-500/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              + Tambah Langkah
            </button>
          </div>

          {labItems.map((l, idx) => (
            <div key={idx} className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Langkah {l.step}</span>
                {labItems.length > 1 && (
                  <button onClick={() => removeLabItem(idx)} className="text-xs text-red-400 hover:text-red-300">
                    Hapus
                  </button>
                )}
              </div>
              <textarea
                value={l.instruction}
                onChange={e => updateLabItem(idx, { instruction: e.target.value })}
                placeholder="Instruksi untuk siswa, misal: Campurkan HCl dengan NaOH"
                rows={2}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              />
              <input
                type="text"
                value={l.expected}
                onChange={e => updateLabItem(idx, { expected: e.target.value })}
                placeholder="Hasil yang diharapkan, misal: Larutan menjadi netral (pH 7)"
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="px-5 py-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-300 font-medium rounded-xl text-sm transition-colors disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan sebagai Draft'}
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(168,85,247,0.25)]"
        >
          {saving ? 'Menyimpan...' : isEdit ? 'Simpan & Publikasikan' : 'Publikasikan Quest'}
        </button>
      </div>
    </div>
  )
}
