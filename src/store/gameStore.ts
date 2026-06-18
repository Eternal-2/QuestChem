// ============================================
// ZUSTAND GAME STORE
// Global state untuk RPG mechanics
// ============================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StudentProfile, User, StudentInventory, StudentAchievement } from '@/types/database'

interface Notification {
  id: string
  type: 'xp' | 'level_up' | 'achievement' | 'item' | 'info'
  title: string
  message: string
  timestamp: number
}

interface GameState {
  // User & profile
  user: User | null
  profile: StudentProfile | null
  inventory: StudentInventory[]
  achievements: StudentAchievement[]

  // UI state
  notifications: Notification[]
  sidebarOpen: boolean
  activeQuestId: string | null

  // Actions
  setUser: (user: User | null) => void
  setProfile: (profile: StudentProfile | null) => void
  setInventory: (inventory: StudentInventory[]) => void
  setAchievements: (achievements: StudentAchievement[]) => void

  // Game actions
  addXp: (amount: number, source: string) => void
  levelUp: (newLevel: number) => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  dismissNotification: (id: string) => void
  setSidebarOpen: (open: boolean) => void
  setActiveQuest: (questId: string | null) => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      inventory: [],
      achievements: [],
      notifications: [],
      sidebarOpen: true,
      activeQuestId: null,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setInventory: (inventory) => set({ inventory }),
      setAchievements: (achievements) => set({ achievements }),

      addXp: (amount, source) => {
        const { profile } = get()
        if (!profile) return
        const newXp = profile.xp + amount
        set({ profile: { ...profile, xp: newXp } })
        get().addNotification({
          type: 'xp',
          title: `+${amount} XP`,
          message: `Earned from ${source}`,
        })
      },

      levelUp: (newLevel) => {
        const { profile } = get()
        if (!profile) return
        set({ profile: { ...profile, level: newLevel } })
        get().addNotification({
          type: 'level_up',
          title: '🎉 Level Up!',
          message: `You reached Level ${newLevel}!`,
        })
      },

      addNotification: (notification) => {
        const id = Math.random().toString(36).slice(2)
        const newNotif: Notification = { ...notification, id, timestamp: Date.now() }
        set(state => ({ notifications: [newNotif, ...state.notifications].slice(0, 5) }))
        // Auto dismiss after 4s
        setTimeout(() => get().dismissNotification(id), 4000)
      },

      dismissNotification: (id) =>
        set(state => ({ notifications: state.notifications.filter(n => n.id !== id) })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveQuest: (questId) => set({ activeQuestId: questId }),
    }),
    {
      name: 'questchem-game-store',
      // Hanya persist data yang ringan
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)
