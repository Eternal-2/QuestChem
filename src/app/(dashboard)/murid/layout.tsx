import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import StudentShell from '@/components/layout/StudentShell'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: userData }, { data: profile }] = await Promise.all([
    supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single(),

    supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single(),
  ])

  if (!userData) redirect('/login')

  return (
    <div className="min-h-screen bg-[#080c14]">
      <StudentShell
        user={userData}
        profile={profile}
      >
        {children}
      </StudentShell>
    </div>
  )
}