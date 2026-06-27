import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RosterClient from '@/components/guru/RosterClient'

// Helper: relasi one-to-one dari Supabase BISA datang sebagai object
// langsung ATAU sebagai array berisi 1 item, tergantung versi/setting
// client yang dipakai. Sebelumnya kode selalu asumsikan array (pakai
// `?.[0]`), padahal kalau bentuknya object, itu membuat `[0]` jadi
// undefined dan SELURUH data (termasuk nama siswa) hilang — jatuh ke
// fallback 'Siswa' generik di RosterClient.
//
// Fungsi ini menangani KEDUA kemungkinan bentuk, jadi aman dipakai
// berapa pun versi Supabase client yang sedang berjalan.
function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  if (Array.isArray(value)) return value[0] ?? null
  return value
}

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

  // Normalisasi hasil Supabase — sekarang aman untuk array MAUPUN object
  const normalizedMembers =
    (members ?? []).map((member: any) => {
      const studentProfile = unwrapRelation(member.student_profiles)
      const users = studentProfile ? unwrapRelation(studentProfile.users) : null

      return {
        ...member,
        student_profiles: studentProfile
          ? { ...studentProfile, users }
          : null,
        classes: unwrapRelation(member.classes),
      }
    })

  return (
    <RosterClient
      classes={classes ?? []}
      members={normalizedMembers}
    />
  )
}
