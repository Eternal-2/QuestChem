import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RosterClient from '@/components/guru/RosterClient'

export default async function RosterPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login-guru')

  const { data: classes } = await supabase
    .from('classes')
    .select('id, name')
    .eq('teacher_id', user.id)
    .order('name')

  const classIds = classes?.map((c) => c.id) ?? []

  const { data: members } =
    classIds.length > 0
      ? await supabase
          .from('class_members')
          .select(`
            id,
            student_profiles (
              id,
              level,
              xp,
              streak_days,
              title,
              users (
                username,
                display_name
              )
            ),
            classes (
              id,
              name
            )
          `)
          .in('class_id', classIds)
          .order('joined_at', { ascending: false })
      : { data: [] }

  // Normalisasi hasil Supabase (array -> object)
  const normalizedMembers =
    (members ?? []).map((member: any) => ({
      ...member,
      student_profiles: member.student_profiles?.[0]
        ? {
            ...member.student_profiles[0],
            users: member.student_profiles[0].users?.[0] ?? null,
          }
        : null,
      classes: member.classes?.[0] ?? null,
    }))

  return (
    <RosterClient
      classes={classes ?? []}
      members={normalizedMembers}
    />
  )
}