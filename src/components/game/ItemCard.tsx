import type { Item } from '@/types/database'
import { RARITY_COLORS, RARITY_BG } from '@/types/database'

interface ItemCardProps {
  item: Item
  quantity?: number
  isEquipped?: boolean
  onEquip?: () => void
  onClick?: () => void
  size?: 'sm' | 'md'
}

const RARITY_BORDER: Record<string, string> = {
  common:    'border-gray-200',
  rare:      'border-blue-400',
  epic:      'border-purple-500',
  legendary: 'border-yellow-500',
  mythic:    'border-pink-500',
}

const RARITY_LABEL: Record<string, string> = {
  common:    'text-gray-400',
  rare:      'text-blue-500',
  epic:      'text-purple-600',
  legendary: 'text-yellow-600',
  mythic:    'text-pink-600',
}

const TYPE_EMOJI: Record<string, string> = {
  gear:       '⚙️',
  chemical:   '🧪',
  potion:     '🧴',
  artifact:   '💎',
  quest_item: '📦',
}

export default function ItemCard({ item, quantity, isEquipped, onEquip, onClick, size = 'md' }: ItemCardProps) {
  const small = size === 'sm'

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-2xl border-2 ${RARITY_BORDER[item.rarity]} p-3 cursor-pointer hover:shadow-md transition-all ${isEquipped ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
    >
      {/* Quantity badge */}
      {quantity && quantity > 1 && (
        <span className="absolute top-2 right-2 bg-gray-700 text-white text-xs rounded-full px-1.5 py-0.5 font-mono">
          x{quantity}
        </span>
      )}

      {/* Equipped badge */}
      {isEquipped && (
        <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">
          ✓
        </span>
      )}

      {/* Icon */}
      <div className={`${RARITY_BG[item.rarity]} rounded-xl flex items-center justify-center mb-2 ${small ? 'h-10 text-2xl' : 'h-14 text-3xl'}`}>
        {item.icon_url ? (
          <img src={item.icon_url} alt={item.name} className="w-8 h-8 object-contain" />
        ) : (
          <span>{TYPE_EMOJI[item.type]}</span>
        )}
      </div>

      {/* Name */}
      <div className={`font-medium text-gray-900 text-center leading-tight ${small ? 'text-xs' : 'text-sm'}`}>
        {item.name}
      </div>

      {/* Rarity */}
      <div className={`text-center capitalize mt-0.5 ${small ? 'text-xs' : 'text-xs'} ${RARITY_LABEL[item.rarity]}`}>
        {item.rarity}
      </div>

      {/* Stats */}
      {!small && item.stats && Object.keys(item.stats).length > 0 && (
        <div className="mt-2 space-y-0.5">
          {item.stats.armor     && <div className="text-xs text-gray-500">🛡️ +{item.stats.armor} Armor</div>}
          {item.stats.intellect && <div className="text-xs text-gray-500">🧠 +{item.stats.intellect} Intellect</div>}
          {item.stats.xp_bonus  && <div className="text-xs text-green-600">⭐ +{item.stats.xp_bonus}% XP</div>}
        </div>
      )}
    </div>
  )
}
