import { useResourceState } from '../state/resourceState'
import { useState } from 'react'
import { dummyCards, ballImagePath, bonusBgColor } from '../utils/constants'
import { getBonusBalls, getDiscountedCost } from '../utils/ballUtils'
import type { BallType } from '../data/cards'
import PokemonCardComponent from './PokemonCard'
import PokemonImage from './PokemonImage'

const PlayerPanel = () => {
  const { ownedCards, evolveCard } = useResourceState()
  const [open, setOpen] = useState(false)
  const [hoverEvolveCardIds, setHoverEvolveCardIds] = useState<string | null>(null)

  // 진화 가능한 카드 찾기 (진화체가 게임 보드에 있으면 진화 가능)
  const getEvolvableCards = () => {
    return ownedCards.filter((base) =>
      dummyCards.some(
        (c) =>
          c.evolvesFrom === base.name &&
          // 진화체가 게임 보드에 있으면 진화 가능 (소유 여부와 관계없이)
          c.onBoard === true
      )
    )
  }
  const evolvable = getEvolvableCards()

  // 진화 버튼 클릭시 (진화체가 게임 보드에 있는 것 중 첫 번째로 진화)
  const handleEvolve = (base: any) => {
    const evolved = dummyCards.find(
      (c: any) =>
        c.evolvesFrom === base.name &&
        c.onBoard === true
    )
    if (evolved) evolveCard(base, evolved)
  }

  // 진화 가능한 카드(게임 보드에 존재하는 카드) 모두 찾기
  const getEvolvableTargets = (base: any) => {
    return dummyCards.filter(
      (c) => c.evolvesFrom === base.name && c.onBoard === true
    )
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
        className={`fixed top-0 right-0 h-full w-[840px] max-w-full bg-white shadow-2xl z-50 transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ borderLeft: '2px solid #facc15' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-bold text-lg">내 포켓몬 컬렉션</span>
          <button onClick={() => setOpen(false)} className="text-2xl font-bold text-gray-500 hover:text-gray-800">×</button>
        </div>
        <div
          className="overflow-y-auto p-4"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          {ownedCards.length === 0 ? (
            <div className="text-gray-400 text-center mt-8 w-full">포획한 포켓몬이 없습니다.</div>
          ) : (
            ownedCards.map(card => {
              const isEvolvable = evolvable.some((b) => b.id === card.id)
              const evolvableTargets = getEvolvableTargets(card)
              return (
                <div
                  key={card.id}
                  style={{
                    width: 140, // 카드 컨테이너의 최소/고정 width를 140px로 늘림
                    minWidth: 140,
                    maxWidth: 140,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    border: '1px solid #eee',
                    borderRadius: 8,
                    background: '#f9fafb',
                    padding: '4px 4px',
                  }}
                >
                  <div style={{ width: 120, minWidth: 120, maxWidth: 120 }}>
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
                      hideCost={true}
                      hideEvolvesFrom={true}
                    />
                  </div>
                  {isEvolvable && (
                    <div
                      style={{ position: 'relative', display: 'inline-block' }}
                      onMouseEnter={() => setHoverEvolveCardIds(card.id)}
                      onMouseLeave={() => setHoverEvolveCardIds(null)}
                    >
                      <button
                        title="진화"
                        className="ml-1 text-green-600 hover:text-green-800"
                        style={{fontSize: '1.1em', lineHeight: 1, padding: 0, background: 'none', border: 'none'}}
                        onClick={() => {
                          // 진화체가 1개일 때만 바로 진화, 여러 개면 툴팁에서 선택하도록 할 수도 있음
                          const evolvableTargets = getEvolvableTargets(card)
                          if (evolvableTargets.length === 1) {
                            // 요구치 충족 여부 확인
                            const requires = evolvableTargets[0].requiresEvolutionBonus || {};
                            const myBalls = bonusBalls;
                            const allMet = Object.entries(requires).every(
                              ([type, count]) => (myBalls[type] || 0) >= count
                            );
                            if (allMet) {
                              handleEvolve(card)
                            } else {
                              alert('진화 요구 조건을 충족하지 못했습니다.');
                            }
                          }
                        }}
                        disabled={
                          // 진화체가 1개일 때만 버튼으로 진화 가능, 여러 개면 툴팁에서 선택
                          (() => {
                            const evolvableTargets = getEvolvableTargets(card)
                            if (evolvableTargets.length === 1) {
                              const requires = evolvableTargets[0].requiresEvolutionBonus || {};
                              const myBalls = bonusBalls;
                              return !Object.entries(requires).every(
                                ([type, count]) => (myBalls[type] || 0) >= count
                              );
                            }
                            return false;
                          })()
                        }
                      >⏫</button>
                      {/* 진화체 툴팁 */}
                      {hoverEvolveCardIds === card.id && evolvableTargets.length > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            left: '100%',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'white',
                            border: '1px solid #ddd',
                            borderRadius: 12,
                            boxShadow: '0 4px 24px #0004',
                            padding: '20px 32px',
                            zIndex: 9999,
                            display: 'flex',
                            gap: 24,
                            minWidth: 120,
                            minHeight: 120,
                            maxWidth: '60vw',
                            maxHeight: '80vh',
                            alignItems: 'center',
                            overflow: 'visible',
                          }}
                          onClick={e => e.stopPropagation()}
                        >
                          {evolvableTargets.map(target => {
                            const requires = target.requiresEvolutionBonus || {};
                            const myBalls = bonusBalls;
                            const allMet = Object.entries(requires).every(
                              ([type, count]) => (myBalls[type] || 0) >= count
                            );
                            return (
                              <div
                                key={target.id}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  minWidth: 110,
                                  opacity: allMet ? 1 : 0.5,
                                  cursor: allMet ? 'pointer' : 'not-allowed'
                                }}
                                onClick={() => {
                                  if (allMet) handleEvolve(card)
                                }}
                              >
                                <PokemonImage name={target.name} size={100} />
                                <div style={{ marginTop: 12, fontSize: 16 }}>
                                  {Object.entries(requires).map(([type, count]) => {
                                    const met = (myBalls[type] || 0) >= count;
                                    return (
                                      <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <img src={ballImagePath[type]} alt={type} style={{ width: 26, height: 26, objectFit: 'contain' }} />
                                        <span>x{count}</span>
                                        <span>{met ? '✅' : '❌'}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
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
