import { useResourceState } from '../state/resourceState'

const PlayerPanel = () => {
  const { balls, ownedCards } = useResourceState()

  return (
    <div className="p-4 bg-white shadow mb-4">
      <h2 className="text-xl font-bold mb-2">🎒 현재 보유 볼</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(balls).map(([type, count]) => (
          <div key={type} className="text-sm bg-gray-100 px-2 py-1 rounded">
            {type}: {count}
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-2">📦 포획한 포켓몬</h2>
      {ownedCards.length === 0 ? (
        <p className="text-sm text-gray-500">포획한 포켓몬이 없습니다.</p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          {ownedCards.map((card) => (
            <li key={card.id} className="border px-2 py-1 rounded flex flex-col">
              <span>
                {card.name} ({card.rarity})
              </span>
              <span className="text-xs text-blue-600">
                🎁 보너스: {card.bonus} +{card.bonusCount}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default PlayerPanel
