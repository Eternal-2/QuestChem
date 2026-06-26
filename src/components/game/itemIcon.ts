// ============================================
// ITEM ICON HELPER
// ============================================
// Sebelumnya semua item bertipe 'gear' dapat ikon ⚙️ yang sama persis,
// padahal isinya macam-macam: mantel, sepatu, kacamata, sarung tangan,
// helm, jubah, mahkota, dll — semua fungsinya beda tapi tampil identik.
//
// Fungsi ini mendeteksi ikon yang sesuai dari KATA KUNCI di nama item,
// jadi tidak perlu field baru di database atau migrasi data. Item baru
// yang ditambahkan nanti otomatis kena ikon yang tepat selama namanya
// mengandung salah satu kata kunci ini.

interface IconRule {
  keywords: string[]
  icon: string
}

const NAME_ICON_RULES: IconRule[] = [
  // Kepala
  { keywords: ['helm', 'helmet'],                          icon: '⛑️' },
  { keywords: ['mahkota', 'crown', 'tiara'],                icon: '👑' },
  { keywords: ['kacamata', 'goggle', 'glasses'],            icon: '🥽' },
  { keywords: ['topi', 'hat', 'cap'],                       icon: '🎩' },

  // Badan
  { keywords: ['mantel', 'cloak', 'cape'],                  icon: '🧥' },
  { keywords: ['jubah', 'robe', 'gown'],                    icon: '👘' },
  { keywords: ['jas', 'coat', 'lab coat'],                  icon: '🥼' },
  { keywords: ['zirah', 'armor', 'rompi', 'vest'],          icon: '🦺' },
  { keywords: ['baju', 'shirt'],                            icon: '👕' },

  // Tangan
  { keywords: ['sarung tangan', 'gloves', 'glove'],         icon: '🧤' },
  { keywords: ['gelang', 'bracelet'],                        icon: '⛓️' },

  // Kaki
  { keywords: ['sepatu', 'boots', 'boot', 'shoes'],         icon: '🥾' },

  // Aksesoris
  { keywords: ['cincin', 'ring'],                            icon: '💍' },
  { keywords: ['kalung', 'necklace', 'amulet'],             icon: '📿' },
  { keywords: ['tongkat', 'staff', 'wand'],                 icon: '🪄' },

  // Bahan kimia & potion (kalau type-based belum cukup spesifik)
  { keywords: ['ramuan', 'potion', 'elixir'],               icon: '🧴' },
  { keywords: ['kristal', 'crystal'],                        icon: '💎' },
  { keywords: ['scroll', 'gulungan'],                        icon: '📜' },
]

const TYPE_FALLBACK_ICON: Record<string, string> = {
  gear: '🧤', chemical: '🧪', potion: '🧴', artifact: '💎', quest_item: '📦',
}

/**
 * Tentukan ikon item berdasarkan kata kunci di nama, dengan fallback
 * ke ikon berdasarkan `type` kalau tidak ada kata kunci yang cocok.
 */
export function getItemIcon(name: string, type: string): string {
  const lowerName = name.toLowerCase()

  for (const rule of NAME_ICON_RULES) {
    if (rule.keywords.some(kw => lowerName.includes(kw))) {
      return rule.icon
    }
  }

  return TYPE_FALLBACK_ICON[type] ?? '📦'
}
