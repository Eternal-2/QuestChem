// ============================================
// DATABASE TYPES — sesuai schema Supabase
// ============================================

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin'
export type QuestType = 'quiz' | 'lab' | 'read' | 'mini_game'
export type QuestDifficulty = 'easy' | 'medium' | 'hard'
export type QuestStatus = 'locked' | 'active' | 'completed' | 'failed'
export type ItemType = 'gear' | 'chemical' | 'potion' | 'artifact' | 'quest_item'
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
export type GearSlot = 'head' | 'body' | 'hands' | 'tool' | 'accessory'

export interface User {
  id: string
  username: string
  display_name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface StudentProfile {
  id: string
  user_id: string
  level: number
  xp: number
  xp_to_next_level: number
  title: string
  streak_days: number
  last_active: string
  armor_stat: number
  intellect_stat: number
  affinity_fire: number
  affinity_water: number
  affinity_earth: number
  affinity_air: number
  affinity_metal: number
  chemistry_knowledge_level: number
  reaction_mastery_level: number
  safety_protocol_level: number
  created_at: string
  updated_at: string
  // joined
  users?: User
}

export interface Quest {
  id: string
  title: string
  description: string | null
  type: QuestType
  difficulty: QuestDifficulty
  topic: string
  subtopic: string | null
  xp_reward: number
  content: QuestContent[]
  prerequisites: string[]
  estimated_minutes: number
  is_published: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type QuestContent =
  | { question: string; options: string[]; answer: number; explanation: string }
  | { section: string; content: string }
  | { step: number; instruction: string; expected: string }

export interface StudentQuest {
  id: string
  student_id: string
  quest_id: string
  status: QuestStatus
  score: number | null
  xp_earned: number
  attempts: number
  answers: unknown[]
  started_at: string | null
  completed_at: string | null
  // joined
  quests?: Quest
}

export interface Item {
  id: string
  name: string
  description: string | null
  type: ItemType
  rarity: ItemRarity
  slot: GearSlot | null
  stats: ItemStats
  icon_url: string | null
  source: string | null
  is_active: boolean
  created_at: string
}

export interface ItemStats {
  armor?: number
  intellect?: number
  xp_bonus?: number
  hazard_resist?: number
}

export interface StudentInventory {
  id: string
  student_id: string
  item_id: string
  quantity: number
  is_equipped: boolean
  obtained_at: string
  // joined
  items?: Item
}

export interface Achievement {
  id: string
  name: string
  description: string | null
  badge_url: string | null
  xp_bonus: number
  requirement: AchievementRequirement
  is_active: boolean
  created_at: string
}

export interface AchievementRequirement {
  type: string
  target: number
  topic?: string
}

export interface StudentAchievement {
  id: string
  student_id: string
  achievement_id: string
  unlocked_at: string
  // joined
  achievements?: Achievement
}

export interface Guild {
  id: string
  name: string
  description: string | null
  banner_url: string | null
  level: number
  total_xp: number
  rank: number | null
  max_members: number
  created_by: string | null
  raid_boss: RaidBoss
  created_at: string
  updated_at: string
}

export interface RaidBoss {
  name?: string
  hp_current?: number
  hp_max?: number
  deadline?: string
  is_active?: boolean
}

export interface GuildMember {
  id: string
  guild_id: string
  student_id: string
  role: 'leader' | 'officer' | 'member'
  xp_contributed: number
  joined_at: string
  // joined
  student_profiles?: StudentProfile
}

export interface GuildMessage {
  id: string
  guild_id: string
  sender_id: string | null
  message: string
  created_at: string
  // joined
  users?: User
}

export interface AiChatLog {
  id: string
  student_id: string
  session_id: string
  role: 'user' | 'assistant'
  message: string
  topic: string | null
  created_at: string
}

export interface XpLog {
  id: string
  student_id: string
  amount: number
  source: string
  source_id: string | null
  description: string | null
  created_at: string
}

// API response types
export interface AwardXpResult {
  success: boolean
  xp_awarded: number
  new_xp: number
  new_level: number
  leveled_up: boolean
  previous_level: number
}

export interface SubmitQuestResult {
  success: boolean
  status: QuestStatus
  score: number
  xp_earned: number
  level_up_info?: AwardXpResult
}

// Rarity colors helper
export const RARITY_COLORS: Record<ItemRarity, string> = {
  common:    'border-gray-300 text-gray-500',
  rare:      'border-blue-400 text-blue-600',
  epic:      'border-purple-500 text-purple-600',
  legendary: 'border-yellow-500 text-yellow-600',
  mythic:    'border-pink-500 text-pink-600',
}

export const RARITY_BG: Record<ItemRarity, string> = {
  common:    'bg-gray-50',
  rare:      'bg-blue-50',
  epic:      'bg-purple-50',
  legendary: 'bg-yellow-50',
  mythic:    'bg-pink-50',
}

export const DIFFICULTY_COLORS: Record<QuestDifficulty, string> = {
  easy:   'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard:   'bg-red-100 text-red-700',
}

// XP needed per level
export const XP_THRESHOLDS = [0, 1000, 2500, 4500, 7000, 10000, 14000, 19000, 25000, 32000, 40000]

export function getLevelProgress(xp: number, level: number): number {
  const current = XP_THRESHOLDS[level - 1] ?? 0
  const next = XP_THRESHOLDS[level] ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1]
  return Math.round(((xp - current) / (next - current)) * 100)
}
