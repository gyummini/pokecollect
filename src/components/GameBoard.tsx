import { getBoardByRarity } from '../utils/gameUtils'
import { useState } from 'react'
import { dummyCards } from '../data/cards'
import type { PokemonCard, BallType } from '../data/cards'
import { useResourceState } from '../state/resourceState'
import { useGameState } from '../state/gameState'

const GameBoard = () => {
  const { useBalls, addCard, addBalls, balls, addBallsRaw } = useResourceState()
  const { actionPoints, decreaseActionPoints, resetCount, maxReset, increaseResetCount } = useGameState()
  const [board, setBoard] = useState(getBoardByRarity(dummyCards))
  const [reservedPokemon, setReservedPokemon] = useState<string | null>(null)
  const [discardMode, setDiscardMode] = useState(false)
  const [discardCount, setDiscardCount] = useState(0)
  const [discardBalls, setDiscardBalls] = useState<Partial<Record<BallType, number>>>({})

  // 카드 교체(리셋) - 예약 카드는 유지
  const handleResetBoard = () => {
    if (resetCount >= maxReset) {
      alert('카드 교체는 최대 2번만 가능합니다.')
      return
    }
    setBoard(getBoardByRarity(dummyCards))
    increaseResetCount()
  }

  // 예약된 포켓몬 카드 객체
  const reservedCard = reservedPokemon
    ? dummyCards.find((c) => c.name === reservedPokemon) ?? null
    : null

  // 보유한 보너스 볼 계산
  const getBonusBalls = () => {
    const bonus: Partial<Record<BallType, number>> = {}
    for (const card of addCard ? useResourceState.getState().ownedCards : []) {
      bonus[card.bonus] = (bonus[card.bonus] || 0) + card.bonusCount
    }
    return bonus
  }

  // 요구 볼에서 보너스 할인 적용
  const getDiscountedCost = (cost: Partial<Record<BallType, number>>) => {
    const bonus = getBonusBalls()
    const discounted: Partial<Record<BallType, number>> = {}
    for (const type in cost) {
      const required = cost[type as BallType] || 0
      const discount = bonus[type as BallType] || 0
      discounted[type as BallType] = Math.max(0, required - discount)
    }
    return discounted
  }

  // 마스터볼 조커 기능: 볼로 포획 가능한지, 마스터볼 대체 사용량 반환
  const canCaptureWithJoker = (cost: Partial<Record<BallType, number>>, balls: Record<BallType, number>) => {
    const discountedCost = getDiscountedCost(cost)
    let masterball = balls.masterball || 0
    let usedJoker = 0
    let need: Partial<Record<BallType, number>> = {}
    for (const type in discountedCost) {
      if (type === 'masterball') continue
      const required = discountedCost[type as BallType] || 0
      const have = balls[type as BallType] || 0
      if (have >= required) continue
      const lack = required - have
      if (masterball < lack) return { ok: false, usedJoker: 0 }
      masterball -= lack
      usedJoker += lack
      need[type as BallType] = lack
    }
    // masterball 자체 요구는 반드시 masterball로만 충족해야 함
    if ((discountedCost.masterball || 0) > (balls.masterball || 0) + usedJoker) {
      return { ok: false, usedJoker: 0 }
    }
    return { ok: true, usedJoker }
  }

  // 실제 볼 차감(마스터볼 조커 포함)
  const useBallsWithJoker = (cost: Partial<Record<BallType, number>>) => {
    const discountedCost = getDiscountedCost(cost)
    let ballsCopy = { ...balls }
    let masterball = ballsCopy.masterball || 0
    let usedJoker = 0
    let need: Partial<Record<BallType, number>> = {}
    for (const type in discountedCost) {
      if (type === 'masterball') continue
      const required = discountedCost[type as BallType] || 0
      const have = ballsCopy[type as BallType] || 0
      if (have >= required) {
        ballsCopy[type as BallType] -= required
      } else {
        const lack = required - have
        if (masterball < lack) return false
        ballsCopy[type as BallType] = 0
        ballsCopy.masterball -= lack
        masterball -= lack
        usedJoker += lack
        need[type as BallType] = lack
      }
    }
    // masterball 자체 요구
    if ((discountedCost.masterball || 0) > (ballsCopy.masterball || 0)) return false
    ballsCopy.masterball -= (discountedCost.masterball || 0)
    // 실제 적용
    addBallsRaw(
      Object.keys(ballsCopy).reduce((delta, t) => {
        delta[t as BallType] = (ballsCopy[t as BallType] || 0) - (balls[t as BallType] || 0)
        return delta
      }, {} as Partial<Record<BallType, number>>)
    )
    return usedJoker
  }

  const handleCapture = (card: PokemonCard) => {
    // 마스터볼 조커 기능 적용
    const { ok, usedJoker } = canCaptureWithJoker(card.requiredBalls, balls)
    if (!ok) {
      alert('볼이 부족합니다!')
      return
    }
    if (usedJoker > 0) {
      const confirmMsg =
        `필요한 볼이 부족하여 마스터볼 ${usedJoker}개를 대신 사용합니다. 진행할까요?`
      if (!window.confirm(confirmMsg)) return
    }
    const jokerUsed = useBallsWithJoker(card.requiredBalls)
    if (jokerUsed === false) {
      alert('볼이 부족합니다!')
      return
    }
    addCard(card)
    if (reservedPokemon === card.name) setReservedPokemon(null)
    alert(`${card.name} 포획 성공!${jokerUsed > 0 ? ` (마스터볼 ${jokerUsed}개를 다른 볼 대신 사용)` : ''}`)
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
    // 마스터볼 지급 시 10개 초과 체크
    const totalBalls = Object.values(balls).reduce((a, b) => a + (b || 0), 0)
    if (totalBalls >= 10) {
      // 1개 초과, discard 모드 진입
      setReservedPokemon(card.name)
      addBalls({ masterball: 1 } as any)
      setDiscardMode(true)
      setDiscardCount(totalBalls + 1 - 10)
      setDiscardBalls({})
      decreaseActionPoints()
      alert(`볼은 최대 10개까지 보유 가능합니다. ${totalBalls + 1 - 10}개를 버려주세요.`)
      return
    }
    setReservedPokemon(card.name)
    addBalls({ masterball: 1 } as any)
    decreaseActionPoints()
  }

  // discard 관련 핸들러
  const handleSelectDiscard = (type: BallType) => {
    if ((discardBalls[type] || 0) < (balls[type] || 0)) {
      setDiscardBalls({
        ...discardBalls,
        [type]: (discardBalls[type] || 0) + 1,
      })
    }
  }
  const discardedSum = () =>
    Object.values(discardBalls).reduce((s, n) => s + (n || 0), 0)
  const handleConfirmDiscard = () => {
    if (discardedSum() !== discardCount) return
    const negative: Partial<Record<BallType, number>> = {}
    for (const t in discardBalls) {
      negative[t as BallType] = -(discardBalls[t as BallType] || 0)
    }
    addBallsRaw(negative)
    setDiscardMode(false)
    setDiscardBalls({})
    setDiscardCount(0)
  }

  // 요구 볼 표시(보너스 할인 반영)
  const renderRequiredBalls = (card: PokemonCard) => {
    const discounted = getDiscountedCost(card.requiredBalls)
    return Object.entries(card.requiredBalls)
      .map(([type, count]) => {
        const d = discounted[type as BallType] ?? 0
        return d !== count
          ? `${type}: ${count} → ${d}`
          : `${type}: ${count}`
      })
      .join(', ')
  }

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

  // 포켓몬 카드용 이미지(영문 폴더 내 0.jpg, 없으면 이모지)
  const getPokemonImage = (name: string) => {
    const engName = koreanToEnglish[name] || name
    const path = `/pokemon/${engName}/0.jpg`
    return (
      <img
        src={path}
        alt={name}
        style={{ width: 48, height: 48, display: 'block', margin: '0 auto', objectFit: 'cover', borderRadius: 8, background: '#f3f4f6' }}
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
          span.style.fontSize = '32px'
          span.style.display = 'block'
          span.style.textAlign = 'center'
          ;(e.target as HTMLImageElement).replaceWith(span)
        }}
      />
    )
  }

  // 볼 아이콘 경로
  const ballImagePath: Record<string, string> = {
    pokeball: '/pokeball/몬스터볼.png',
    superball: '/pokeball/슈퍼볼.png',
    hyperball: '/pokeball/하이퍼볼.png',
    healball: '/pokeball/힐볼.png',
    netball: '/pokeball/네트볼.png',
    masterball: '/pokeball/마스터볼.png',
  }

  // 보너스별 카드 배경색
  const bonusBgColor: Record<string, string> = {
    pokeball: '#f87171',      // 빨강
    superball: '#60a5fa',     // 파랑
    hyperball: '#52525b',     // 회색
    healball: '#f9a8d4',      // 분홍
    netball: '#4ade80',       // 초록
    masterball: '#a78bfa',    // 보라
  }

  return (
    <div>
      {/* discard 모드 UI */}
      {discardMode && (
        <div className="p-4 bg-yellow-50 border border-yellow-400 rounded mb-4">
          <p className="mb-2 font-bold text-yellow-700">
            볼이 10개를 초과했습니다. {discardCount}개를 버려주세요.
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {Object.keys(balls).map((type) => (
              <button
                key={type}
                className="bg-red-400 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                disabled={
                  (balls[type as BallType] || 0) - (discardBalls[type as BallType] || 0) <= 0 ||
                  discardedSum() >= discardCount
                }
                onClick={() => handleSelectDiscard(type as BallType)}
              >
                {type} -{discardBalls[type as BallType] || 0} / {balls[type as BallType] || 0}
              </button>
            ))}
          </div>
          <p className="text-sm mb-2">
            선택: {discardedSum()} / {discardCount}
          </p>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            disabled={discardedSum() !== discardCount}
            onClick={handleConfirmDiscard}
          >
            버리기 확정
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-500">카드 교체: {resetCount} / {maxReset}</span>
        <button
          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs"
          onClick={handleResetBoard}
          disabled={resetCount >= maxReset || actionPoints < 3}
        >
          카드 교체 (행동력 30 소모)
        </button>
      </div>

      {/* 희귀도별 카드 배치 렌더링 */}
      {Object.entries(board).map(([rarity, cards]) => (
        <div key={rarity} className="mb-4">
          <h3 className="font-bold mb-1 capitalize">{rarity}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {cards.map((card) => {
              const evolvesFrom = card.evolvesFrom
              const requiresBonus = card.requiresEvolutionBonus
              const bonusIcons = Array(card.bonusCount).fill(card.bonus)
              const discounted = getDiscountedCost(card.requiredBalls)
              const requiredBallsArr = Object.entries(card.requiredBalls)
              const bgColor = bonusBgColor[card.bonus] || '#fff'
              return (
                <div
                  key={card.id}
                  className="relative shadow rounded-xl border overflow-visible flex flex-col items-stretch"
                  style={{
                    background: bgColor,
                    width: 180,
                    height: 270,
                    borderRadius: 18,
                    boxShadow: '0 2px 8px #0002',
                    margin: '0 auto',
                  }}
                >
                  {/* 좌상단 점수 */}
                  <div className="absolute left-3 top-3 flex items-center gap-1 z-10">
                    <span className="bg-white/80 text-blue-700 font-bold rounded-full px-2 py-1 text-lg shadow border border-blue-200">{card.points}</span>
                  </div>
                  {/* 우상단 보너스볼 아이콘 */}
                  <div className="absolute right-3 top-3 flex items-center gap-1 z-10">
                    {bonusIcons.map((b, i) => (
                      <img
                        key={i}
                        src={ballImagePath[b]}
                        alt={b}
                        style={{ width: 28, height: 28, objectFit: 'contain', display: 'inline' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ))}
                  </div>
                  {/* 가운데 상단 진화 정보 */}
                  {evolvesFrom && requiresBonus && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-3 flex items-center gap-1 z-10 bg-white/90 px-2 py-1 rounded shadow border">
                      <span style={{ width: 20, height: 20, display: 'inline-block' }}>{getPokemonImage(evolvesFrom)}</span>
                      {Object.entries(requiresBonus).map(([type, count]) => (
                        <span key={type} className="flex items-center gap-0.5 ml-1">
                          <img
                            src={ballImagePath[type]}
                            alt={type}
                            style={{ width: 18, height: 18, display: 'inline' }}
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                          <span className="font-bold text-blue-600 text-xs">x{count}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  {/* 가운데 큰 포켓몬 이미지 */}
                  <div className="flex justify-center items-center" style={{ height: 120, marginTop: 40 }}>
                    <div
                      style={{
                        width: 110,
                        height: 110,
                        background: '#fff',
                        borderRadius: '50%',
                        boxShadow: '0 1px 4px #0001',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {getPokemonImage(card.name)}
                    </div>
                  </div>
                  {/* 카드 이름 */}
                  <h2 className="text-lg font-bold mb-1 text-center text-white drop-shadow" style={{ letterSpacing: 1 }}>{card.name}</h2>
                  {/* 좌하단 필요 볼 정보 */}
                  <div className="absolute left-3 bottom-3 flex flex-col items-start gap-1 z-10">
                    {requiredBallsArr.map(([type, count]) => {
                      const d = discounted[type as BallType] ?? 0
                      return (
                        <div key={type} className="flex items-center gap-1">
                          <img
                            src={ballImagePath[type]}
                            alt={type}
                            style={{ width: 20, height: 20, objectFit: 'contain', display: 'inline' }}
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                          <span className="font-bold text-white text-shadow">{d !== count ? `${count}→${d}` : count}</span>
                        </div>
                      )
                    })}
                  </div>
                  {/* 포획/예약 버튼 */}
                  <div className="flex gap-2 absolute bottom-3 right-3">
                    <button
                      className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded"
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
                        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded"
                        onClick={() => handleReserve(card)}
                        type="button"
                      >
                        예약
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* 예약된 포켓몬 칸 */}
      {reservedCard && (
        <div className="mt-8 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg max-w-md mx-auto">
          <h2 className="text-lg font-bold mb-2 text-yellow-700">예약된 포켓몬</h2>
          <div className="bg-white shadow rounded-lg p-4 border">
            {/* 예약 포켓몬 이미지 */}
            <div className="mb-2">{getPokemonImage(reservedCard.name)}</div>
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
