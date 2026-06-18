import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Achievement, StudentAchievement } from '@/types/database'

export default async function AchievementsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('id, xp, level')
    .eq('user_id', user.id)
    .single()

  // All achievements
  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*')
    .eq('is_active', true)

  // Student's unlocked achievements
  const { data: unlocked } = await supabase
    .from('student_achievements')
    .select('achievement_id, unlocked_at')
    .eq('student_id', profile?.id)

  const unlockedMap = new Set(unlocked?.map(u => u.achievement_id))
  const unlockedCount = unlockedMap.size
  const totalCount = allAchievements?.length ?? 0
  const completionPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">🏆 Achievement Center</h1>
        <p className="text-gray-500 text-sm">Track your mastery and showcase your rare chemical artifacts.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Overall completion */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Overall Completion</h3>
            <span className="text-xl">🏆</span>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-1">{completionPct}% <span className="text-base font-normal text-gray-400">Mastered</span></div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${completionPct}%` }} />
          </div>
          <div className="text-xs text-gray-400 mt-2">{unlockedCount} / {totalCount} achievements unlocked</div>
        </div>

        {/* Global ranking (placeholder) */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Global Ranking</h3>
            <span className="text-xl">🌍</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">⭐</div>
            <div>
              <div className="text-2xl font-bold">Top {profile?.level ? Math.max(5, 100 - profile.level * 5) : 50}%</div>
              <div className="text-purple-200 text-sm">Elite Alchemists globally</div>
            </div>
          </div>
        </div>
      </div>

      {/* Badge collection */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span>🎖️</span>
          <h3 className="font-semibold text-gray-900">Badge Collection</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {allAchievements?.map((ach: Achievement) => {
            const isUnlocked = unlockedMap.has(ach.id)
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-100 bg-gray-50 opacity-60 grayscale'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${isUnlocked ? 'bg-yellow-100' : 'bg-gray-200'}`}>
                    {isUnlocked ? '🏅' : '🔒'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{ach.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{ach.description}</div>
                    {/* Progress bar (simplified) */}
                    <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isUnlocked ? 'bg-green-500' : 'bg-gray-300'}`}
                        style={{ width: isUnlocked ? '100%' : '0%' }}
                      />
                    </div>
                    {ach.xp_bonus > 0 && (
                      <div className={`text-xs mt-1 font-medium ${isUnlocked ? 'text-green-600' : 'text-gray-400'}`}>
                        +{ach.xp_bonus} XP
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
