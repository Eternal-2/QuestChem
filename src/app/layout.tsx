import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'QuestChem — Learn Chemistry Through Adventure',
  description: 'Gamified chemistry education platform. Level up your knowledge, complete quests, and join guilds!',
  keywords: ['chemistry', 'education', 'gamification', 'learning', 'RPG'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
