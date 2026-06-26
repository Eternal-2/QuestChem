import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import StudentShell from '@/components/layout/StudentShell'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ✅ OPTIMASI: Parallel queries + select kolom spesifik
  const [{ data: userData }, { data: profile }] = await Promise.all([
    supabase
      .from('users')
      .select('id, username, display_name, role, avatar_url')
      .eq('id', user.id)
      .single(),
    supabase
      .from('student_profiles')
      .select('id, level, xp, xp_to_next_level, title, streak_days')
      .eq('user_id', user.id)
      .single(),
  ])

  if (!userData) redirect('/login')

  return (
    <div className="min-h-screen bg-[#080c14]">
      <StudentShell user={userData} profile={profile}>{children}</StudentShell>
    </div>
  )
}
