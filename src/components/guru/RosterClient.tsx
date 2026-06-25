'use client'
import { useState, useMemo } from 'react'

interface Class { id: string; name: string }
interface Member {
  id: string
  student_profiles: {
    id: string
    level: number
    xp: number
    streak_days: number
    title: string
    users: { username: string; display_name: string | null }
  } | null
  classes: { id: string; name: string } | null
}

const PAGE_SIZE = 5

export default function RosterClient({ classes, members }: { classes: Class[]; members: Member[] }) {
  const [search, setSearch] = useState('')
  const [selectedClass, setSelectedClass] = useState('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return members.filter(m => {
      const sp = m.student_profiles
      const name = sp?.users?.display_name ?? sp?.users?.username ?? ''
      const matchSearch = name.toLowerCase().includes(search.toLowerCase())
      const matchClass = selectedClass === 'all' || m.classes?.id === selectedClass
      return matchSearch && matchClass
    })
  }, [members, search, selectedClass])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleFilter(classId: string) {
    setSelectedClass(classId)
    setPage(1)
  }

  function handleSearch(val: string) {
    setSearch(val)
    setPage(1)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">👥 Roster Siswa</h1>
        <p className="text-slate-400 text-sm mt-0.5">Semua siswa dari seluruh kelas yang kamu ajar</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-2 flex-1 min-w-[200px] focus-within:border-purple-500/50 transition-colors">
          <span className="text-slate-500 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Cari nama siswa..."
            className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none flex-1"
          />
          {search && (
            <button onClick={() => handleSearch('')} className="text-slate-500 hover:text-slate-300 text-xs transition-colors">✕</button>
          )}
        </div>

        {/* Filter kelas */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
              selectedClass === 'all'
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                : 'bg-slate-900/60 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            Semua Kelas
          </button>
          {classes.map(c => (
            <button
              key={c.id}
              onClick={() => handleFilter(c.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                selectedClass === c.id
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                  : 'bg-slate-900/60 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Total */}
        <span className="text-xs text-slate-500 ml-auto flex-shrink-0">
          {filtered.length} siswa
        </span>
      </div>

      {/* Tabel */}
      <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden">
        {paginated.length > 0 ? (
          <>
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wide border-b border-slate-800 bg-slate-900/40">
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Nama Siswa</th>
                  <th className="px-5 py-3 font-medium">Kelas</th>
                  <th className="px-5 py-3 font-medium">Level</th>
                  <th className="px-5 py-3 font-medium">Total XP</th>
                  <th className="px-5 py-3 font-medium">Streak</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((m, i) => {
                  const sp = m.student_profiles
                  const name = sp?.users?.display_name ?? sp?.users?.username ?? 'Siswa'
                  const rank = (page - 1) * PAGE_SIZE + i + 1
                  return (
                    <tr key={m.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 text-xs text-slate-500">{rank}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {name.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-200">{name}</div>
                            <div className="text-xs text-slate-500">{sp?.title ?? 'Novice Chemist'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs bg-slate-800/60 border border-slate-700/50 text-slate-300 px-2 py-1 rounded-lg">
                          {m.classes?.name ?? '-'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white text-xs font-black">
                            {sp?.level ?? 1}
                          </div>
                          <span className="text-xs text-slate-400">Lvl {sp?.level ?? 1}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold text-yellow-400 bg-yellow-400/10 border border-yellow-500/20 px-2 py-1 rounded-full">
                          ⭐ {(sp?.xp ?? 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-orange-400 font-semibold">🔥 {sp?.streak_days ?? 0}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800">
              <span className="text-xs text-slate-500">
                Menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length} siswa
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                      page === p
                        ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                        : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center"
                >
                  ›
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-slate-500">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm">
              {search || selectedClass !== 'all'
                ? 'Tidak ada siswa yang cocok dengan filter'
                : 'Belum ada siswa di kelas manapun'}
            </p>
            {(search || selectedClass !== 'all') && (
              <button
                onClick={() => { setSearch(''); setSelectedClass('all') }}
                className="mt-3 text-xs text-teal-400 hover:text-teal-300 transition-colors"
              >
                Reset filter
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
