import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GuruProfileClient from '@/components/guru/GuruProfileClient'

export default async function GuruProfilPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login-guru')

  const [{ data: userData }, { data: classes }] = await Promise.all([
    supabase
      .from('users')
      .select('id, username, display_name, email, avatar_url, role, created_at')
      .eq('id', user.id)
      .single(),
    supabase
      .from('classes')
      .select('id, name, cohort, join_code, created_at')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  // Ambil total siswa dari semua kelas
  const classIds = classes?.map(c => c.id) ?? []
  const [{ count: totalStudents }, { data: recentActivity }] = await Promise.all([
    classIds.length > 0
      ? supabase
          .from('class_members')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classIds)
      : { count: 0 },
    supabase
      .from('notifications')
      .select('id, title, message, type, created_at, is_read')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Total quest yang dibuat
  const { count: totalQuests } = await supabase
    .from('quests')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', user.id)

  return (
    <GuruProfileClient
      userData={userData}
      classes={classes ?? []}
      totalStudents={totalStudents ?? 0}
      totalQuests={totalQuests ?? 0}
      recentActivity={recentActivity ?? []}
    />
  )
}
