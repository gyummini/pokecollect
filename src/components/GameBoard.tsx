import { useState } from 'react'
import { dummyCards } from '../data/cards'
import type { PokemonCard } from '../data/cards'
import { useResourceState } from '../state/resourceState'
import { useGameState } from '../state/gameState'

const GameBoard = () => {
  const { useBalls, addCard, addBalls } = useResourceState()
  const { actionPoints, decreaseActionPoints } = useGameState()

  // 예약 상태 관리 (포켓몬 이름)
  const [reservedPokemon, setReservedPokemon] = useState<string | null>(null)

  // 예약된 포켓몬 카드 객체
  const reservedCard = reservedPokemon
    ? dummyCards.find((c) => c.name === reservedPokemon) ?? null
    : null

  // 예약되지 않은 카드만 메인 보드에 표시
  const visibleCards = dummyCards.filter(
    (card) => card.name !== reservedPokemon
  )

  const handleCapture = (card: PokemonCard) => {
    // 예약 여부와 상관없이 포획 가능
    const success = useBalls(card.requiredBalls)
    if (success) {
      addCard(card)
      if (reservedPokemon === card.name) setReservedPokemon(null)
      alert(`${card.name} 포획 성공!`)
    } else {
      alert('볼이 부족합니다!')
    }
  }

  // 예약 버튼 내부에서만 사용
  const handleReserve = (card: PokemonCard) => {
    if (reservedPokemon) {
      alert('이미 예약한 포켓몬이 있습니다.')
      return
    }
    if (actionPoints < 3) {
      alert('행동력이 부족합니다.')
      return
    }
    if (card.rarity === 'legendary' || card.rarity === 'mythical') {
      alert('전설/환상 포켓몬은 예약할 수 없습니다.')
      return
    }
    setReservedPokemon(card.name)
    addBalls({ masterball: 1 } as any)
    decreaseActionPoints()
  }

  const renderRequiredBalls = (card: PokemonCard) => {
    return Object.entries(card.requiredBalls)
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ')
  }

  return (
    <div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleCards.map((card) => (
          <div key={card.id} className="bg-white shadow rounded-lg p-4 border">
            <h2 className="text-xl font-bold mb-1">{card.name}</h2>
            <p className="text-sm text-gray-600 mb-1">희귀도: {card.rarity}</p>
            <p className="text-sm mb-1">필요 볼: {renderRequiredBalls(card)}</p>
            <p className="text-sm mb-1">
              보너스: {card.bonus} x {card.bonusCount}
            </p>
            <p className="font-semibold text-right text-blue-600">점수: {card.points}</p>

            <div className="flex gap-2 mt-2">
              <button
                className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded flex-1"
                onClick={() => handleCapture(card)}
                disabled={actionPoints < 3}
              >
                포획!
              </button>
              {(!reservedPokemon &&
                actionPoints >= 3 &&
                card.rarity !== 'legendary' &&
                card.rarity !== 'mythical') && (
                <button
                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded flex-1"
                  onClick={() => handleReserve(card)}
                  type="button"
                >
                  예약
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 예약된 포켓몬 칸 */}
      {reservedCard && (
        <div className="mt-8 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg max-w-md mx-auto">
          <h2 className="text-lg font-bold mb-2 text-yellow-700">예약된 포켓몬</h2>
          <div className="bg-white shadow rounded-lg p-4 border">
            <h2 className="text-xl font-bold mb-1">{reservedCard.name}</h2>
            <p className="text-sm text-gray-600 mb-1">희귀도: {reservedCard.rarity}</p>
            <p className="text-sm mb-1">필요 볼: {renderRequiredBalls(reservedCard)}</p>
            <p className="text-sm mb-1">
              보너스: {reservedCard.bonus} x {reservedCard.bonusCount}
            </p>
            <p className="font-semibold text-right text-blue-600">점수: {reservedCard.points}</p>
            <div className="flex gap-2 mt-2">
              <button
                className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded flex-1"
                onClick={() => handleCapture(reservedCard)}
                disabled={actionPoints < 3}
              >
                포획!
              </button>
            </div>
            <div className="mt-2 text-xs text-yellow-700 font-bold">
              예약 취소는 불가능합니다.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameBoard
