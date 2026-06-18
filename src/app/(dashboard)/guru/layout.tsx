import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import TeacherHeader from '@/components/layout/TeacherHeader'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/guru/login')

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'teacher') redirect('/murid/home')

  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans">
      {/* Ambient background glows — tema purple/indigo untuk guru */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full filter blur-[120px]" />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-teal-500/3 rounded-full filter blur-[100px]" />
      </div>

      <div className="relative z-10">
        <TeacherSidebar user={userData} />
        <TeacherHeader />
        <main className="ml-[260px] pt-16 min-h-screen">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
