import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import TeacherHeader from '@/components/layout/TeacherHeader'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login-guru')

  // ✅ OPTIMASI: select kolom spesifik saja
  const { data: userData } = await supabase
    .from('users')
    .select('id, username, display_name, role, avatar_url')
    .eq('id', user.id)
    .single()

  if (!userData || (userData.role !== 'teacher' && userData.role !== 'admin')) {
    redirect('/murid/home')
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full filter blur-[120px]" />
      </div>
      <div className="relative z-10">
        <TeacherSidebar user={userData} />
        <TeacherHeader />
        <main className="ml-[240px] pt-14 min-h-screen">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
