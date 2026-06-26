'use client'
import { useState } from 'react'
import Header from './Header' // Sesuaikan path jika perlu
import Sidebar from './Sidebar' // Sesuaikan path jika perlu
import type { StudentProfile, User } from '@/types/database'

interface StudentShellProps {
  user: User
  profile: StudentProfile | null
  children: React.ReactNode
}

export default function StudentShell({ user, profile, children }: StudentShellProps) {
  // 1. State untuk mengontrol Sidebar di HP
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <>
      {/* 2. Lempar state ke Sidebar */}
      <Sidebar 
        user={user} 
        profile={profile} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      {/* 3. Lempar fungsi pengubah state ke Header */}
      <Header 
        profile={profile} 
        setSidebarOpen={setIsSidebarOpen} 
      />

      {/* 4. Konten Utama */}
      <main className="md:pl-[240px] pt-14 min-h-screen">
        {children}
      </main>
    </>
  )
}