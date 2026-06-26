
'use client'
import { useState } from 'react'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import TeacherHeader from '@/components/layout/TeacherHeader'
export default function TeacherShell({user,children}:any){
 const [sidebarOpen,setSidebarOpen]=useState(false)
 return <>
 <TeacherSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
 <TeacherHeader setSidebarOpen={setSidebarOpen}/>
 <main className="ml-0 md:ml-[240px] pt-14 min-h-screen"><div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-8">{children}</div></main>
 </>
}
