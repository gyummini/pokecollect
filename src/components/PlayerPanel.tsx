import { useResourceState } from '../state/resourceState'
import { useState } from 'react'
import { dummyCards, ballImagePath, bonusBgColor } from '../utils/constants'
import { getBonusBalls, getDiscountedCost } from '../utils/ballUtils'
import type { BallType } from '../data/cards'
import PokemonCardComponent from './PokemonCard'

const PlayerPanel = () => {
  const { ownedCards, evolveCard } = useResourceState()
  const [open, setOpen] = useState(false)

  // 진화 가능한 카드 찾기
  const getEvolvableCards = () => {
    return ownedCards.filter((base) =>
      dummyCards.some(
        (c) => c.evolvesFrom === base.name && !ownedCards.some((o) => o.name === c.name)
      )
    )
  }
  const evolvable = getEvolvableCards()
  // 진화 버튼 클릭시
  const handleEvolve = (base: any) => {
    const evolved = dummyCards.find((c: any) => c.evolvesFrom === base.name && !ownedCards.some((o) => o.name === c.name))
    if (evolved) evolveCard(base, evolved)
  }

  const bonusBalls = getBonusBalls(ownedCards)
  const getDiscountedCostWithBonus = (cost: Partial<Record<BallType, number>>) => getDiscountedCost(cost, bonusBalls)

  return (
    <>
      {/* 사이드 패널 열기 버튼: 항상 오른쪽에 고정 */}
      <button
        className="fixed top-1/2 right-0 z-50 bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-2 rounded-l shadow-lg transition-all"
        style={{ transform: 'translateY(-50%)', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
        onClick={() => setOpen(true)}
      >
        🗂️ 내 포켓몬
      </button>

      {/* 오른쪽 슬라이드 패널 */}
      <div
        className={`fixed top-0 right-0 h-full w-[340px] max-w-full bg-white shadow-2xl z-50 transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ borderLeft: '2px solid #facc15' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-bold text-lg">내 포켓몬 컬렉션</span>
          <button onClick={() => setOpen(false)} className="text-2xl font-bold text-gray-500 hover:text-gray-800">×</button>
        </div>
        <div className="overflow-y-auto p-4 flex flex-col gap-4">
          {ownedCards.length === 0 ? (
            <div className="text-gray-400 text-center mt-8">포획한 포켓몬이 없습니다.</div>
          ) : (
            ownedCards.map(card => {
              const isEvolvable = evolvable.some((b) => b.id === card.id)
              return (
                <div key={card.id} className="flex items-center gap-2 border rounded px-2 py-1 bg-gray-50">
                  <div style={{ width: 120, minWidth: 0 }}>
                    <PokemonCardComponent
                      card={card}
                      actionPoints={0}
                      reservedPokemon={null}
                      onCapture={() => {}}
                      onReserve={() => {}}
                      ballImagePath={ballImagePath}
                      getDiscountedCost={getDiscountedCostWithBonus}
                      bonusBgColor={bonusBgColor}
                      hideActions={true}
                    />
                  </div>
                  {isEvolvable && (
                    <button
                      title="진화"
                      className="ml-1 text-green-600 hover:text-green-800"
                      style={{fontSize: '1.1em', lineHeight: 1, padding: 0, background: 'none', border: 'none'}}
                      onClick={() => handleEvolve(card)}
                    >⏫</button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
export default PlayerPanel
