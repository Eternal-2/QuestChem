'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ChallengeButton from './ChallengeButton'
import DamageNumber from './DamageNumber'
import VictoryConfetti from './VictoryConfetti'

interface Boss {
  id: string
  title: string
  description: string | null
  difficulty: string
  xp_reward: number
  content: any[]
  raid_boss: {
    name: string
    hp_max: number
    hp_current: number
    weakness: string
    element: string
    image_emoji: string
  }
}

interface PvEClientProps {
  profile: any
  bosses: Boss[]
  battleHistory: any[]
}

const DIFFICULTY_COLOR: Record<string, string> = {
  easy:   'text-teal-400 border-teal-500/40 bg-teal-500/10',
  medium: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
  hard:   'text-red-400 border-red-500/40 bg-red-500/10',
  expert: 'text-pink-400 border-pink-500/40 bg-pink-500/10',
}

const ELEMENT_COLOR: Record<string, string> = {
  fire:  'from-red-900/40 to-orange-900/20 border-red-500/30',
  water: 'from-blue-900/40 to-cyan-900/20 border-blue-500/30',
  earth: 'from-green-900/40 to-emerald-900/20 border-green-500/30',
  air:   'from-slate-700/40 to-slate-800/20 border-slate-500/30',
  metal: 'from-indigo-900/40 to-purple-900/20 border-indigo-500/30',
}

// Demo boss kalau DB belum ada data
const DEMO_BOSSES: Boss[] = [
  {
    id: 'demo-1',
    title: 'Naga Asam Sulfat',
    description: 'Boss pertama yang menguasai reaksi asam-basa. Kalahkan dengan pengetahuan kimiamu!',
    difficulty: 'easy',
    xp_reward: 150,
    content: [
      {
        question: 'Apa rumus kimia asam sulfat?',
        options: ['H₂SO₄', 'HCl', 'HNO₃', 'H₃PO₄'],
        correct_index: 0,
        explanation: 'Asam sulfat memiliki rumus H₂SO₄ (dua atom H, satu atom S, empat atom O)',
        damage: 25,
      },
      {
        question: 'Berapa pH larutan netral?',
        options: ['0', '7', '14', '1'],
        correct_index: 1,
        explanation: 'Larutan netral memiliki pH = 7, di mana konsentrasi H⁺ = OH⁻',
        damage: 20,
      },
      {
        question: 'Apa yang terjadi saat asam bereaksi dengan basa?',
        options: ['Terbentuk garam dan air', 'Terbentuk gas H₂', 'Larutan menjadi asam', 'Tidak ada reaksi'],
        correct_index: 0,
        explanation: 'Reaksi netralisasi: Asam + Basa → Garam + Air',
        damage: 30,
      },
      {
        question: 'Indikator yang berubah merah di larutan asam adalah?',
        options: ['Fenolftalein', 'Lakmus', 'Metil jingga', 'Bromtimol biru'],
        correct_index: 1,
        explanation: 'Kertas lakmus merah di asam, biru di basa',
        damage: 25,
      },
    ],
    raid_boss: { name: 'Naga Asam Sulfat', hp_max: 100, hp_current: 100, weakness: 'basa', element: 'fire', image_emoji: '🐉' },
  },
  {
    id: 'demo-2',
    title: 'Golem Stoikiometri',
    description: 'Boss penjaga keseimbangan reaksi kimia. Hitung dengan tepat untuk mengalahkannya!',
    difficulty: 'medium',
    xp_reward: 300,
    content: [
      {
        question: 'Berapa mol H₂O yang dihasilkan dari 2 mol H₂ + O₂?',
        options: ['1 mol', '2 mol', '3 mol', '4 mol'],
        correct_index: 1,
        explanation: '2H₂ + O₂ → 2H₂O, sehingga 2 mol H₂ menghasilkan 2 mol H₂O',
        damage: 35,
      },
      {
        question: 'Massa molar NaCl adalah?',
        options: ['23 g/mol', '35.5 g/mol', '58.5 g/mol', '40 g/mol'],
        correct_index: 2,
        explanation: 'Mr NaCl = Ar Na + Ar Cl = 23 + 35.5 = 58.5 g/mol',
        damage: 30,
      },
      {
        question: 'Dalam 2 mol CO₂, ada berapa mol atom O?',
        options: ['2 mol', '4 mol', '1 mol', '6 mol'],
        correct_index: 1,
        explanation: 'Setiap molekul CO₂ punya 2 atom O. 2 mol CO₂ × 2 = 4 mol atom O',
        damage: 35,
      },
    ],
    raid_boss: { name: 'Golem Stoikiometri', hp_max: 100, hp_current: 100, weakness: 'stoichiometry', element: 'earth', image_emoji: '🗿' },
  },
  {
    id: 'demo-3',
    title: 'Lich Ikatan Kimia',
    description: 'Boss abadi yang menguasai semua jenis ikatan. Hanya yang paham struktur Lewis yang bisa menang!',
    difficulty: 'hard',
    xp_reward: 500,
    content: [
      {
        question: 'Ikatan kovalen terbentuk antara?',
        options: ['Logam dan non-logam', 'Dua non-logam', 'Dua logam', 'Ion positif dan negatif'],
        correct_index: 1,
        explanation: 'Ikatan kovalen terbentuk saat dua atom non-logam berbagi elektron',
        damage: 40,
      },
      {
        question: 'NaCl terbentuk melalui ikatan?',
        options: ['Kovalen polar', 'Kovalen non-polar', 'Ion', 'Logam'],
        correct_index: 2,
        explanation: 'NaCl (garam dapur) terbentuk melalui ikatan ion antara Na⁺ dan Cl⁻',
        damage: 35,
      },
      {
        question: 'Elektron valensi atom karbon (C, nomor atom 6) adalah?',
        options: ['2', '4', '6', '8'],
        correct_index: 1,
        explanation: 'Konfigurasi C: 2,4. Elektron valensi = 4 (kulit terluar)',
        damage: 40,
      },
      {
        question: 'Molekul H₂O memiliki bentuk geometri?',
        options: ['Linear', 'Segitiga datar', 'Bengkok/V', 'Tetrahedral'],
        correct_index: 2,
        explanation: 'H₂O memiliki 2 pasang elektron bebas pada O, sehingga bentuknya bengkok (V)',
        damage: 45,
      },
    ],
    raid_boss: { name: 'Lich Ikatan Kimia', hp_max: 100, hp_current: 100, weakness: 'bonding', element: 'metal', image_emoji: '💀' },
  },
]

export default function PvEClient({ profile, bosses, battleHistory }: PvEClientProps) {
  const router = useRouter()
  const allBosses = bosses.length > 0 ? bosses : DEMO_BOSSES
  
  const [phase, setPhase] = useState<'select' | 'battle' | 'result'>('select')
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [bossHp, setBossHp] = useState(100)
  const [playerHp, setPlayerHp] = useState(100)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [showExplain, setShowExplain] = useState(false)
  const [resultData, setResultData] = useState<{ won: boolean; xpEarned: number; score: number } | null>(null)
  const [saving, setSaving] = useState(false)

  // ===== State efek visual =====
  const [bossHit, setBossHit] = useState(false)        // boss bergetar + flash saat kena damage
  const [playerHit, setPlayerHit] = useState(false)     // player bergetar + vignette merah saat kena serangan
  const [screenShake, setScreenShake] = useState(false) // seluruh layar bergetar saat player kena serangan
  const [bossDamage, setBossDamage] = useState<{ amount: number; nonce: number } | null>(null)
  const [playerDamage, setPlayerDamage] = useState<{ amount: number; nonce: number } | null>(null)
  const [bossFlashRing, setBossFlashRing] = useState(false) // ring kuning di HP bar boss saat dipukul
  const [attackPulse, setAttackPulse] = useState<'player' | 'boss' | null>(null) // siapa yang lagi menyerang

  const displayName = (profile as any)?.users?.display_name ?? 'Alchemist'
  const level = profile?.level ?? 1

  function startBattle(boss: Boss) {
    setSelectedBoss(boss)
    setBossHp(100)
    setPlayerHp(100)
    setCurrentQ(0)
    setScore(0)
    setCorrect(0)
    setSelected(null)
    setAnswered(false)
    setPhase('battle')
  }

  function handleAnswer(idx: number) {
    if (answered || !selectedBoss) return
    const q = selectedBoss.content[currentQ]
    setSelected(idx)
    setAnswered(true)

    const isCorrect = idx === q.correct_index
    if (isCorrect) {
      const dmg = q.damage ?? 25
      const newBossHp = Math.max(0, bossHp - dmg)

      // Efek: boss bergetar + flash + angka damage terbang
      setAttackPulse('player')
      setBossDamage({ amount: dmg, nonce: Date.now() })
      setBossHit(true)
      setBossFlashRing(true)
      setTimeout(() => setBossHp(newBossHp), 150) // delay kecil supaya getaran terlihat sebelum HP turun
      setTimeout(() => { setBossHit(false); setAttackPulse(null) }, 450)
      setTimeout(() => setBossFlashRing(false), 600)
      setTimeout(() => setBossDamage(null), 900)

      setScore(s => s + Math.round((dmg / 100) * selectedBoss.xp_reward))
      setCorrect(c => c + 1)
    } else {
      const dmg = 20

      // Efek: player bergetar + seluruh layar shake + vignette merah + angka damage
      setAttackPulse('boss')
      setPlayerDamage({ amount: dmg, nonce: Date.now() })
      setPlayerHit(true)
      setScreenShake(true)
      setTimeout(() => setPlayerHp(p => Math.max(0, p - dmg)), 150)
      setTimeout(() => { setPlayerHit(false); setAttackPulse(null) }, 450)
      setTimeout(() => setScreenShake(false), 400)
      setTimeout(() => setPlayerDamage(null), 900)
    }
    setShowExplain(true)
  }

async function nextQuestion() {
  if (!selectedBoss) return

  setSelected(null)
  setAnswered(false)
  setShowExplain(false)

  const nextIdx = currentQ + 1
  const totalQ = selectedBoss.content.length

  console.log("=== NEXT QUESTION ===")
  console.log({
    currentQ,
    nextIdx,
    totalQ,
    bossHp,
    playerHp,
    correct,
  })

  if (nextIdx >= totalQ || playerHp <= 0 || bossHp <= 0) {
    const won = bossHp <= 0 || (correct / totalQ >= 0.6 && playerHp > 0)
    const finalScore = Math.round((correct / totalQ) * 100)
    const xpEarned = won
      ? selectedBoss.xp_reward
      : Math.round(selectedBoss.xp_reward * 0.2)

    console.log("Battle selesai")
    console.log({
      won,
      finalScore,
      xpEarned,
      questId: selectedBoss.id,
    })

    setResultData({
      won,
      xpEarned,
      score: finalScore,
    })

    setPhase("result")

    setSaving(true)

    try {
      console.log("Mengirim request submit...")

      const res = await fetch(`/api/quests/${selectedBoss.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: [],
          score: finalScore,
        }),
      })

      console.log("Status:", res.status)

      const data = await res.json()

      console.log("Response:", data)
    } catch (err) {
      console.error("FETCH ERROR:", err)
    }

    setSaving(false)
  } else {
    setCurrentQ(nextIdx)
  }
}

  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-[#080c14] text-white font-sans">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-red-500/5 rounded-full filter blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-orange-500/5 rounded-full filter blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400">
                🐉 Arena PvE
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">Pilih boss yang ingin kamu tantang</p>
            </div>

            {/* Navigasi ke fitur terkait */}
            <div className="flex gap-2">
              <a
                href="/murid/ranking"
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/60 border border-yellow-500/20 hover:border-yellow-500/40 rounded-xl text-xs font-semibold text-yellow-400 transition-colors"
              >
                🏆 Ranking
              </a>
              <a
                href="/murid/challenge"
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/60 border border-purple-500/20 hover:border-purple-500/40 rounded-xl text-xs font-semibold text-purple-400 transition-colors"
              >
                🥊 Tantangan
              </a>
            </div>
          </div>

          {/* Stat player */}
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-2xl font-black text-white shadow-[0_0_16px_rgba(45,212,191,0.3)]">
              {level}
            </div>
            <div className="flex-1">
              <div className="font-black text-white">{displayName}</div>
              <div className="text-xs text-teal-400">{profile?.title ?? 'Novice Chemist'}</div>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <div className="text-sm font-black text-blue-400">🛡️ {profile?.armor_stat ?? 0}</div>
                <div className="text-xs text-slate-500">Armor</div>
              </div>
              <div>
                <div className="text-sm font-black text-purple-400">🧠 {profile?.intellect_stat ?? 0}</div>
                <div className="text-xs text-slate-500">Intellect</div>
              </div>
            </div>
          </div>

          {/* Boss list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allBosses.map((boss, i) => {
              const rb = boss.raid_boss ?? {}
              const elemColor = ELEMENT_COLOR[rb.element ?? 'fire'] ?? ELEMENT_COLOR.fire
              const diffStyle = DIFFICULTY_COLOR[boss.difficulty] ?? DIFFICULTY_COLOR.medium

              return (
                <div key={boss.id} className={`group bg-gradient-to-br ${elemColor} backdrop-blur border rounded-2xl p-5 transition-all hover:scale-[1.02] hover:brightness-110`}>
                  <div className="text-6xl text-center mb-4 group-hover:animate-bounce">{rb.image_emoji ?? '👾'}</div>
                  <h3 className="font-black text-white text-center mb-1">{boss.title}</h3>
                  <p className="text-xs text-slate-400 text-center mb-4 line-clamp-2">{boss.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">HP Boss</span>
                      <span className="text-red-400 font-bold">100 HP</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-500 to-orange-400 w-full rounded-full" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border capitalize ${diffStyle}`}>
                      {boss.difficulty}
                    </span>
                    <span className="text-xs font-bold text-yellow-400">+{boss.xp_reward} XP</span>
                  </div>

                  <div className="text-xs text-slate-500 text-center mb-3">
                    {boss.content.length} soal kimia
                  </div>

                  <button
                    onClick={() => startBattle(boss)}
                    className="w-full py-2.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-bold rounded-xl text-sm transition-all shadow-[0_0_16px_rgba(239,68,68,0.2)]"
                  >
                    ⚔️ Tantang!
                  </button>

                  {/* Tantang teman hanya untuk boss sungguhan dari database,
                      bukan demo boss (ID 'demo-1' dst tidak ada di tabel quests) */}
                  {!boss.id.startsWith('demo-') && (
                    <div className="mt-2">
                      <ChallengeButton questId={boss.id} questTitle={boss.title} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Battle history */}
          {battleHistory.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2"><span>📜</span> Riwayat Battle</h3>
              <div className="space-y-2">
                {battleHistory.map((h: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
                    <div>
                      <div className="text-sm font-semibold text-white">{h.quests?.title ?? 'Battle'}</div>
                      <div className="text-xs text-slate-400">Skor: {h.score ?? 0}%</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-bold ${h.status === 'completed' ? 'text-teal-400' : 'text-red-400'}`}>
                        {h.status === 'completed' ? '✓ Menang' : '✗ Kalah'}
                      </div>
                      <div className="text-xs text-yellow-400">+{h.xp_earned} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (phase === 'battle' && selectedBoss) {
    const q = selectedBoss.content[currentQ]
    const rb = selectedBoss.raid_boss ?? {}
    const totalQ = selectedBoss.content.length

    return (
      <div className={`min-h-screen bg-[#080c14] text-white font-sans relative ${screenShake ? 'animate-[screen-shake_0.4s_ease-in-out]' : ''}`}>
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 to-transparent" />
          {/* Vignette merah saat player kena serangan */}
          <div className={`absolute inset-0 transition-opacity duration-300 ${playerHit ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(239,68,68,0.35) 100%)' }}
          />
          {/* Flash kuning singkat saat boss kena serangan */}
          <div className={`absolute inset-0 bg-yellow-400/10 transition-opacity duration-150 ${bossHit ? 'opacity-100' : 'opacity-0'}`} />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 space-y-4">
          {/* Battle header */}
          <div className="flex items-center justify-between">
            <button onClick={() => setPhase('select')} className="text-slate-400 hover:text-white text-sm transition-colors">
              ← Mundur
            </button>
            <span className="text-xs text-slate-500">Soal {currentQ + 1}/{totalQ}</span>
          </div>

          {/* Boss HP */}
          <div className={`relative bg-slate-900/80 border rounded-2xl p-4 transition-all duration-150 ${
            bossHit ? 'border-yellow-400/70 shadow-[0_0_24px_-2px_rgba(250,204,21,0.5)] animate-[hit-shake_0.35s_ease-in-out]' : 'border-red-500/30'
          }`}>
            {bossDamage && <DamageNumber amount={bossDamage.amount} color="red" nonce={bossDamage.nonce} />}
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-3xl transition-transform duration-200 ${bossHit ? 'scale-90 -rotate-6' : attackPulse === 'boss' ? 'scale-110' : ''}`}>
                {rb.image_emoji ?? '👾'}
              </span>
              <div className="flex-1">
                <div className="font-black text-white text-sm">{selectedBoss.title}</div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-red-400">HP Boss</span>
                  <span className="text-red-400 font-bold">{bossHp}/100</span>
                </div>
                <div className={`h-3 bg-slate-800 rounded-full overflow-hidden ${bossFlashRing ? 'ring-2 ring-yellow-300/70' : ''}`}>
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${bossHp}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Player HP */}
          <div className={`relative bg-slate-900/80 border rounded-2xl p-3 flex items-center gap-3 transition-all duration-150 ${
            playerHit ? 'border-red-500/70 shadow-[0_0_24px_-2px_rgba(239,68,68,0.5)] animate-[hit-shake_0.35s_ease-in-out]' : 'border-teal-500/30'
          }`}>
            {playerDamage && <DamageNumber amount={playerDamage.amount} color="teal" nonce={playerDamage.nonce} />}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center font-black text-white text-sm transition-transform duration-200 ${
              playerHit ? 'scale-90 rotate-3' : attackPulse === 'player' ? 'scale-110' : ''
            }`}>
              {level}
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-teal-400">{displayName}</span>
                <span className="text-teal-400 font-bold">{playerHp}/100 HP</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${playerHp}%` }}
                />
              </div>
            </div>
          </div>

          {/* Soal */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5">
            <div className="text-xs text-orange-400 font-semibold uppercase tracking-wider mb-3">⚔️ Serang Boss!</div>
            <p className="text-white font-semibold text-base mb-4 leading-relaxed">{q.question}</p>

            <div className="space-y-2">
              {q.options.map((opt: string, i: number) => {
                let style = 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:border-slate-600 hover:text-white'
                let icon = null
                if (answered) {
                  if (i === q.correct_index) {
                    style = 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                    icon = <span className="ml-2">✅</span>
                  } else if (i === selected) {
                    style = 'bg-red-500/20 border-red-500/50 text-red-300'
                    icon = <span className="ml-2">❌</span>
                  } else {
                    style = 'bg-slate-800/40 border-slate-700/30 text-slate-500'
                  }
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={answered}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-200 ${style} disabled:cursor-default ${
                      i === selected && answered ? 'scale-[1.02]' : ''
                    }`}
                  >
                    <span className="font-semibold mr-2">{['A', 'B', 'C', 'D'][i]}.</span>
                    {opt}
                    {icon}
                  </button>
                )
              })}
            </div>

            {showExplain && (
              <div className={`mt-4 p-3 rounded-xl border text-sm ${selected === q.correct_index ? 'bg-teal-500/10 border-teal-500/30 text-teal-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                <div className="font-bold mb-1">{selected === q.correct_index ? '✅ Benar! Boss terkena damage!' : '❌ Salah! Kamu terkena serangan balik!'}</div>
                <div className="text-xs opacity-80">{q.explanation}</div>
              </div>
            )}
          </div>

          {answered && (
            <button
              onClick={nextQuestion}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-bold rounded-xl transition-all"
            >
              {currentQ + 1 >= totalQ || playerHp <= 0 || bossHp <= 0 ? '⚔️ Selesaikan Battle' : '➤ Soal Berikutnya'}
            </button>
          )}

          {/* Progress */}
          <div className="flex justify-center gap-2">
            {selectedBoss.content.map((_: any, i: number) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentQ ? 'bg-orange-400' : i < currentQ ? 'bg-teal-500' : 'bg-slate-700'}`} />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes hit-shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-6px) rotate(-1deg); }
            40% { transform: translateX(5px) rotate(1deg); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(3px); }
          }
          @keyframes screen-shake {
            0%, 100% { transform: translate(0, 0); }
            10% { transform: translate(-3px, 2px); }
            20% { transform: translate(3px, -2px); }
            30% { transform: translate(-3px, -1px); }
            40% { transform: translate(3px, 2px); }
            50% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 1px); }
            70% { transform: translate(-2px, 1px); }
            80% { transform: translate(1px, -1px); }
            90% { transform: translate(-1px, 1px); }
          }
          @keyframes dmg-float {
            0% { transform: translateY(0) scale(0.8); opacity: 0; }
            15% { transform: translateY(-4px) scale(1.2); opacity: 1; }
            100% { transform: translateY(-36px) scale(1); opacity: 0; }
          }
        `}</style>
      </div>
    )
  }

  if (phase === 'result' && resultData && selectedBoss) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white font-sans flex items-center justify-center relative overflow-hidden">
        {resultData.won && <VictoryConfetti />}

        {/* Glow ambient sesuai hasil */}
        <div className={`fixed inset-0 pointer-events-none ${
          resultData.won
            ? 'bg-[radial-gradient(ellipse_at_center,rgba(250,204,21,0.08),transparent_60%)]'
            : 'bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.08),transparent_60%)]'
        }`} />

        <div className="max-w-md w-full px-6 text-center space-y-5 relative z-10">
          <div className={`text-8xl ${resultData.won ? 'animate-[trophy-bounce_0.8s_ease-out_1]' : 'animate-[defeat-droop_0.6s_ease-out_1]'}`}>
            {resultData.won ? '🏆' : '💀'}
          </div>
          <h1 className={`text-3xl font-black ${resultData.won ? 'text-yellow-400' : 'text-red-400'}`}>
            {resultData.won ? 'MENANG!' : 'KALAH!'}
          </h1>
          <p className="text-slate-400">
            {resultData.won
              ? `Kamu berhasil mengalahkan ${selectedBoss.title}!`
              : `${selectedBoss.title} berhasil mengalahkanmu. Coba lagi!`}
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3">
              <div className="text-xl font-black text-white">{resultData.score}%</div>
              <div className="text-xs text-slate-500">Akurasi</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3">
              <div className="text-xl font-black text-yellow-400">+{resultData.xpEarned}</div>
              <div className="text-xs text-slate-500">XP</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3">
              <div className="text-xl font-black text-teal-400">{correct}/{selectedBoss.content.length}</div>
              <div className="text-xs text-slate-500">Benar</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => startBattle(selectedBoss)}
              className="flex-1 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl"
            >
              🔄 Coba Lagi
            </button>
            <button
              onClick={() => { setPhase('select'); router.refresh() }}
              className="flex-1 py-3 bg-slate-800 border border-slate-700/50 text-slate-300 rounded-xl"
            >
              ← Pilih Boss
            </button>
          </div>
        </div>

        <style>{`
          @keyframes trophy-bounce {
            0% { transform: scale(0.3) translateY(20px); opacity: 0; }
            50% { transform: scale(1.25) translateY(-12px); opacity: 1; }
            70% { transform: scale(0.95) translateY(0); }
            100% { transform: scale(1) translateY(0); }
          }
          @keyframes defeat-droop {
            0% { transform: scale(1.1) rotate(0deg); opacity: 0; }
            40% { transform: scale(1) rotate(-8deg); opacity: 1; }
            70% { transform: rotate(5deg); }
            100% { transform: rotate(0deg); }
          }
        `}</style>
      </div>
    )
  }

  return null
}
