import { dummyCards } from '../data/cards'
import type { PokemonCard } from '../data/cards'
import { useResourceState } from '../state/resourceState'

const GameBoard = () => {
  const { useBalls, addCard } = useResourceState()

  const handleCapture = (card: PokemonCard) => {
    const success = useBalls(card.requiredBalls)
    if (success) {
      addCard(card)
      alert(`${card.name} 포획 성공!`)
    } else {
      alert('볼이 부족합니다!')
    }
  }

  const renderRequiredBalls = (card: PokemonCard) => {
    return Object.entries(card.requiredBalls)
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ')
  }

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {dummyCards.map((card) => (
        <div key={card.id} className="bg-white shadow rounded-lg p-4 border">
          <h2 className="text-xl font-bold mb-1">{card.name}</h2>
          <p className="text-sm text-gray-600 mb-1">희귀도: {card.rarity}</p>
          <p className="text-sm mb-1">필요 볼: {renderRequiredBalls(card)}</p>
          <p className="text-sm mb-1">
            보너스: {card.bonus} x {card.bonusCount}
          </p>
          <p className="font-semibold text-right text-blue-600">점수: {card.points}</p>

          <button
            className="mt-2 bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded w-full"
            onClick={() => handleCapture(card)}
          >
            포획!
          </button>
        </div>
      ))}
    </div>
  )
}

export default GameBoard
