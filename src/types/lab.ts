// ============================================
// VIRTUAL LAB TYPES — tambahan untuk fitur lab pribadi
// Import bersama types/database.ts
// ============================================

export type ReagentCategory = 'acid' | 'base' | 'metal' | 'water' | 'salt' | 'gas' | 'organic'
export type ReactionEffect = 'damage' | 'heal' | 'debuff' | 'explosion' | 'neutral'

export interface Reagent {
  id: string
  symbol: string
  name: string
  category: ReagentCategory
  color_hex: string
  icon: string
  is_dangerous: boolean
  description: string | null
  created_at: string
}

export interface Reaction {
  id: string
  map_id: string | null
  reagent_a_id: string
  reagent_b_id: string
  result_name: string
  result_formula: string | null
  effect_type: ReactionEffect
  damage: number
  is_explosive: boolean
  explanation: string | null
  xp_reward: number
  created_at: string
}

export interface LabExperiment {
  id: string
  student_id: string
  reagent_a_id: string | null
  reagent_b_id: string | null
  reaction_id: string | null
  result_label: string | null
  is_explosion: boolean
  xp_earned: number
  notes: string | null
  created_at: string
  // joined
  reagent_a?: Reagent
  reagent_b?: Reagent
}

export interface RunExperimentResult {
  experiment_id: string
  reaction_found: boolean
  result_label: string
  result_formula: string | null
  effect_type: ReactionEffect
  is_explosion: boolean
  xp_earned: number
  explanation: string | null
}

export const CATEGORY_COLORS: Record<ReagentCategory, string> = {
  acid:    'border-cyan-400/40 bg-cyan-500/10 text-cyan-300',
  base:    'border-pink-400/40 bg-pink-500/10 text-pink-300',
  metal:   'border-slate-400/40 bg-slate-500/10 text-slate-300',
  water:   'border-blue-400/40 bg-blue-500/10 text-blue-300',
  salt:    'border-amber-400/40 bg-amber-500/10 text-amber-300',
  gas:     'border-purple-400/40 bg-purple-500/10 text-purple-300',
  organic: 'border-green-400/40 bg-green-500/10 text-green-300',
}

export const EFFECT_LABELS: Record<ReactionEffect, string> = {
  damage:    'Serangan',
  heal:      'Penyembuh',
  debuff:    'Pelemah',
  explosion: 'Ledakan',
  neutral:   'Netral',
}
