import { useResourceState } from '../state/resourceState'
import { getEvolvableCards } from '../utils/gameUtils'
import { dummyCards } from '../data/cards'
import type { BallType } from '../data/cards'
import { useState } from 'react'

// 한글 → 영어 포켓몬 이름 매핑
const koreanToEnglish: Record<string, string> = {
  '이브이': 'eevee',
  '파이리': 'charmander',
  '꼬부기': 'squirtle',
  '캐터피': 'caterpie',
  '샤미드': 'vaporeon',
  '리자드': 'charmeleon',
  '어니부기': 'wartortle',
  '단데기': 'metapod',
  '부스터': 'flareon',
  '리자몽': 'charizard',
  '거북왕': 'blastoise',
  '버터플': 'butterfree',
  '뮤츠': 'mewtwo',
  '뮤': 'mew',
}

// 진화 전 포켓몬의 이미지(영문 폴더 내 0.jpg, 없으면 이모지)
const getPokemonImage = (name: string) => {
  const engName = koreanToEnglish[name] || name
  const path = `/pokemon/${engName}/0.jpg`
  return (
    <img
      src={path}
      alt={name}
      style={{ width: 24, height: 24, display: 'inline', verticalAlign: 'middle', objectFit: 'cover', borderRadius: 4 }}
      onError={e => {
        const emojiMap: Record<string, string> = {
          '이브이': '🦊',
          '파이리': '🔥',
          '꼬부기': '🐢',
          '캐터피': '🐛',
          '샤미드': '🦊',
          '리자드': '🔥',
          '어니부기': '🐢',
          '단데기': '🐛',
          '부스터': '🦊',
          '리자몽': '🔥',
          '거북왕': '🐢',
          '버터플': '🦋',
          '뮤츠': '👾',
          '뮤': '✨',
        }
        const span = document.createElement('span')
        span.textContent = emojiMap[name] || '❓'
        (e.target as HTMLImageElement).replaceWith(span)
      }}
    />
  )
}

const ballImagePath: Record<string, string> = {
  pokeball: '/pokeball/몬스터볼.png',
  superball: '/pokeball/슈퍼볼.png',
  hyperball: '/pokeball/하이퍼볼.png',
  healball: '/pokeball/힐볼.png',
  netball: '/pokeball/네트볼.png',
  masterball: '/pokeball/마스터볼.png',
}

const PlayerPanel = () => {
  const { balls, ownedCards, evolveCard } = useResourceState()
  const evolvable = getEvolvableCards(ownedCards)
  const [hoverEvoId, setHoverEvoId] = useState<number | null>(null)
  const [evoAlertId, setEvoAlertId] = useState<number | null>(null)

  // 보유한 보너스 볼 계산
  const getBonusBalls = () => {
    const bonus: Partial<Record<BallType, number>> = {}
    for (const card of ownedCards) {
      bonus[card.bonus] = (bonus[card.bonus] || 0) + card.bonusCount
    }
    return bonus
  }
  const bonusBalls = getBonusBalls()

  // 진화 정보 매핑: baseId -> { base, evolved }
  const evolvedMap = evolvable.reduce((acc, cur) => {
    acc[cur.base.id] = cur
    return acc
  }, {} as Record<number, { base: any, evolved: any }>)

  // 진화 조건 충족 여부
  const canEvolve = (evolvedCard: any) => {
    if (!evolvedCard.requiresEvolutionBonus) return false
    for (const [type, count] of Object.entries(evolvedCard.requiresEvolutionBonus)) {
      if ((bonusBalls[type as BallType] || 0) < count) return false
    }
    return true
  }

  return (
    <div className="p-4 bg-white shadow mb-4">
      <h2 className="text-xl font-bold mb-2">🎒 현재 보유 볼</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(balls).map(([type, count]) => (
          <div key={type} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm">
            <img
              src={ballImagePath[type] || ''}
              alt={type}
              style={{ width: 24, height: 24, objectFit: 'contain', display: 'inline' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span>{count}</span>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-2">📦 포획한 포켓몬</h2>
      {ownedCards.length === 0 ? (
        <p className="text-sm text-gray-500">포획한 포켓몬이 없습니다.</p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          {ownedCards.map((card) => {
            const evo = evolvedMap[card.id]
            const evolvedCard = evo?.evolved
            const evoBonus = evolvedCard?.requiresEvolutionBonus
            const prevName = evolvedCard?.evolvesFrom
            return (
              <li key={card.id} className="border px-2 py-1 rounded flex flex-col relative">
                <span>
                  {card.name} ({card.rarity})
                </span>
                <span className="text-xs text-blue-600">
                  🎁 보너스: {card.bonus} +{card.bonusCount}
                </span>
                {/* 진화 버튼에 hover 시 진화 정보 툴팁, 항상 활성화 */}
                {evo && evolvedCard && evoBonus && (
                  <div className="relative mt-2">
                    <button
                      className="px-2 py-1 rounded text-xs bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => {
                        if (canEvolve(evolvedCard)) {
                          evolveCard(evo.base, evo.evolved)
                          setEvoAlertId(null)
                        } else {
                          setEvoAlertId(card.id)
                        }
                      }}
                      onMouseEnter={() => setHoverEvoId(card.id)}
                      onMouseLeave={() => setHoverEvoId(null)}
                    >
                      진화
                    </button>
                    {hoverEvoId === card.id && (
                      <div className="absolute z-10 left-1/2 -translate-x-1/2 bottom-full mb-2 bg-white border rounded shadow px-3 py-2 text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1 mb-1">
                          <span>{getPokemonImage(prevName)}{prevName}</span>
                          <span className="mx-1">→</span>
                          <span>{getPokemonImage(evolvedCard.name)}{evolvedCard.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {Object.entries(evoBonus).map(([type, count]) => (
                            <span key={type} className="flex items-center gap-1">
                              <img
                                src={`/balls/${type}.png`}
                                alt={type}
                                style={{ width: 16, height: 16, display: 'inline' }}
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                              />
                              <span>{type}</span>
                              <span className="font-bold text-blue-600">x{count}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* 진화 조건 미충족 시 안내 메시지 */}
                    {evoAlertId === card.id && (
                      <div className="mt-2 text-xs text-red-600 font-bold">
                        진화 조건을 충족하지 않았습니다.
                      </div>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default PlayerPanel
