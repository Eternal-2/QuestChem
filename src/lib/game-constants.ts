// ============================================
// GAME CONSTANTS
// ============================================

export const XP_THRESHOLDS = [0, 1000, 2500, 4500, 7000, 10000, 14000, 19000, 25000, 32000, 40000]

export const LEVEL_TITLES: Record<number, string> = {
  1:  'Novice Chemist',
  2:  'Lab Apprentice',
  3:  'Element Seeker',
  4:  'Reaction Adept',
  5:  'Alchemist',
  6:  'Compound Master',
  7:  'Bonding Expert',
  8:  'Molecular Sage',
  9:  'Grand Alchemist',
  10: 'Legendary Chemist',
}

export const TOPICS = [
  { id: 'acid_base',      label: 'Acids & Bases',       icon: '🧪', color: 'green' },
  { id: 'stoichiometry',  label: 'Stoichiometry',        icon: '⚖️',  color: 'blue' },
  { id: 'bonding',        label: 'Chemical Bonding',     icon: '🔗', color: 'purple' },
  { id: 'periodic_table', label: 'Periodic Table',       icon: '📊', color: 'amber' },
  { id: 'reactions',      label: 'Chemical Reactions',   icon: '💥', color: 'red' },
  { id: 'thermodynamics', label: 'Thermodynamics',       icon: '🔥', color: 'orange' },
  { id: 'electrochemistry', label: 'Electrochemistry',   icon: '⚡', color: 'yellow' },
  { id: 'organic',        label: 'Organic Chemistry',    icon: '🌿', color: 'teal' },
]

export const QUEST_TYPE_LABELS: Record<string, string> = {
  quiz:      'Quiz',
  lab:       'Virtual Lab',
  read:      'Reading',
  mini_game: 'Mini-Game',
}

export const QUEST_TYPE_ICONS: Record<string, string> = {
  quiz:      '📝',
  lab:       '🔬',
  read:      '📖',
  mini_game: '🎮',
}

export const ELEMENT_AFFINITY_COLORS: Record<string, string> = {
  fire:  '#E85D24',
  water: '#185FA5',
  earth: '#3B6D11',
  air:   '#888780',
  metal: '#534AB7',
}

export const NAV_ITEMS = [
  { href: '/murid/home',         label: 'Home',        icon: 'home' },
  { href: '/murid/world-map',    label: 'World Map',   icon: 'map' },
  { href: '/murid/virtual-lab',  label: 'Virtual Lab', icon: 'flask' },
  { href: '/murid/quests',       label: 'Quests',      icon: 'school' },
  { href: '/murid/ai-tutor',     label: 'AI Tutor',    icon: 'robot' },
]
