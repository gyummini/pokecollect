import { useResourceState } from '../state/resourceState'
import { useGameState } from '../state/gameState'
import { pokemonDB } from '../data/pokemonDB'
import { ballImagePath } from '../utils/constants'
import { getBonusBalls, calculateScore } from '../utils/gameUtils'
import type { BallType, PokemonCard } from '../data/cards'
import PokemonImage from './PokemonImage'
import ActionSelector from './ActionSelector'

interface PlayerPanelProps {
  onShowPack: () => void
}

const PlayerPanel = ({ onShowPack }: PlayerPanelProps) => {
  const { ownedCards, balls, evolveCard } = useResourceState()
  const { actionPoints, round, maxRounds, isChoosingAction, setChoosingAction, nextRound } = useGameState()

  const bonusBalls = getBonusBalls(ownedCards)
  const totalScore = calculateScore(ownedCards)

  // 진화 가능한 카드 찾기
  const evolvableCards = ownedCards.flatMap((base) =>
    pokemonDB
      .filter((evolved) => evolved.evolvesFrom === base.name && !ownedCards.some((c) => c.name === evolved.name))
      .map((evolved) => ({ base, evolved }))
  )

  const handleEvolve = (base: PokemonCard, evolved: PokemonCard) => {
    const requires = evolved.requiresEvolutionBonus || {}
    const canEvolve = Object.entries(requires).every(([type, count]) => (bonusBalls[type as BallType] || 0) >= count)

    if (canEvolve) {
      evolveCard(base, evolved)
      alert(`${base.name}이(가) ${evolved.name}(으)로 진화했습니다!`)
    } else {
      alert('진화에 필요한 보너스가 부족합니다.')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Game Status */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-4">게임 현황</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>점수:</span>
            <span className="font-bold">{totalScore}</span>
          </div>
          <div className="flex justify-between">
            <span>라운드:</span>
            <span className="font-bold">
              {round}/{maxRounds}
            </span>
          </div>
          <div className="flex justify-between">
            <span>행동력:</span>
            <span className="font-bold">{actionPoints}</span>
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-2">보유 볼</h3>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(balls).map(([type, count]) => (
            <div key={type} className="flex items-center gap-1">
              <img src={ballImagePath[type as BallType]} alt={type} className="w-6 h-6" />
              <span>x{count}</span>
            </div>
          ))}
        </div>
        <h3 className="font-semibold mt-4 mb-2">보너스</h3>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(bonusBalls).map(([type, count]) => (
            <div key={type} className="flex items-center gap-1">
              <img src={ballImagePath[type as BallType]} alt={type} className="w-6 h-6" />
              <span>+{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-b">
        {isChoosingAction ? (
          <div>
            <ActionSelector />
            <button onClick={() => setChoosingAction(false)} className="mt-2 w-full text-xs text-gray-500 hover:text-gray-700">
              취소
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setChoosingAction(true)}
              disabled={actionPoints < 3}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              볼 가져오기
            </button>
            {actionPoints < 3 && round < maxRounds && (
              <button onClick={nextRound} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                다음 라운드
              </button>
            )}
          </div>
        )}
      </div>

      {/* Owned Cards & Evolution */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="font-semibold mb-2">내 포켓몬 ({ownedCards.length})</h3>
        <div className="space-y-2">
          {ownedCards.map((card) => {
            const evolutionOptions = evolvableCards.filter((e) => e.base.id === card.id)
            return (
              <div key={card.id} className="bg-gray-50 p-2 rounded flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PokemonImage name={card.name} size={40} />
                  <span>{card.name}</span>
                </div>
                {evolutionOptions.length > 0 && (
                  <div className="flex gap-1">
                    {evolutionOptions.map(({ evolved }) => (
                      <button
                        key={evolved.id}
                        onClick={() => handleEvolve(card, evolved)}
                        className="bg-green-200 hover:bg-green-300 rounded-full p-1"
                        title={`Evolve to ${evolved.name}`}
                      >
                        <PokemonImage name={evolved.name} size={24} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Pack Button */}
      <div className="p-4 border-t">
        <button onClick={onShowPack} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded shadow">
          🃏 팩 오픈
        </button>
      </div>
    </div>
  )
}
export default PlayerPanel
