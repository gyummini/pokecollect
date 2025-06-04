import { getBoardByRarity } from '../utils/gameUtils'
import { useState } from 'react'
import { ballImagePath, bonusBgColor, dummyCards } from '../utils/constants'
import type { BallType, PokemonCard } from '../data/cards'
import { getBonusBalls, getDiscountedCost, handleSelectDiscard } from '../utils/ballUtils'
import { useResourceState } from '../state/resourceState'
import { useGameState } from '../state/gameState'
import PokemonCardComponent from './PokemonCard'
import PlayerPanel from './PlayerPanel'

const GameBoard = () => {
  const { addCard, addBalls, balls, addBallsRaw, ownedCards } = useResourceState()
  const { actionPoints, decreaseActionPoints, resetCount, maxReset, increaseResetCount } = useGameState()
  const [board, setBoard] = useState(getBoardByRarity(dummyCards))
  const [reservedPokemon, setReservedPokemon] = useState<string | null>(null)
  const [discardMode, setDiscardMode] = useState(false)
  const [discardCount, setDiscardBallsCount] = useState(0)
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

  // 요구 볼에서 보너스 할인 적용
  // getDiscountedCost는 ballUtils에서 가져온 함수 사용
  const bonusBalls = getBonusBalls(ownedCards)
  const getDiscountedCostWithBonus = (cost: Partial<Record<BallType, number>>) => getDiscountedCost(cost, bonusBalls)

  // 마스터볼 조커 기능: 볼로 포획 가능한지, 마스터볼 대체 사용량 반환
  const canCaptureWithJoker = (cost: Partial<Record<BallType, number>>, balls: Record<BallType, number>) => {
    const discountedCost = getDiscountedCost(cost, bonusBalls)
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
    const discountedCost = getDiscountedCost(cost, bonusBalls)
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
      setDiscardBallsCount(totalBalls + 1 - 10)
      setDiscardBalls({})
      decreaseActionPoints()
      alert(`볼은 최대 10개까지 보유 가능합니다. ${totalBalls + 1 - 10}개를 버려주세요.`)
      return
    }
    setReservedPokemon(card.name)
    addBalls({ masterball: 1 } as any)
    decreaseActionPoints()
  }

  // discard 관련 핸들러: ballUtils의 handleSelectDiscard를 래핑
  const handleSelectDiscardWrapper = (type: BallType) => handleSelectDiscard(type, balls, discardBalls, setDiscardBalls)

  // 마스터볼 지급 시 10개 초과 체크
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
    setDiscardBallsCount(0)
  }

  return (
    <div>
      <PlayerPanel />

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
                onClick={() => handleSelectDiscardWrapper(type as BallType)}
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
        <div key={rarity} className="mb-2">
          <h3 className="font-bold mb-1 capitalize text-sm">{rarity}</h3>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-0">
            {cards.map((card) => (
              <PokemonCardComponent
                key={card.id}
                card={card}
                actionPoints={actionPoints}
                reservedPokemon={reservedPokemon}
                onCapture={handleCapture}
                onReserve={handleReserve}
                ballImagePath={ballImagePath}
                getDiscountedCost={getDiscountedCostWithBonus}
                bonusBgColor={bonusBgColor}
              />
            ))}
          </div>
        </div>
      ))}

      {/* 예약된 포켓몬 칸 */}
      {reservedCard && (
        <div className="mt-8 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg max-w-md mx-auto">
          <h2 className="text-lg font-bold mb-2 text-yellow-700">예약된 포켓몬</h2>
          <div className="bg-white shadow rounded-lg p-4 border flex justify-center">
            <div style={{ width: 120, minWidth: 0 }}>
              <PokemonCardComponent
                card={reservedCard}
                actionPoints={actionPoints}
                reservedPokemon={reservedPokemon}
                onCapture={handleCapture}
                onReserve={handleReserve}
                ballImagePath={ballImagePath}
                getDiscountedCost={getDiscountedCostWithBonus}
                bonusBgColor={bonusBgColor}
              />
              <div className="mt-2 text-xs text-yellow-700 font-bold text-center">
                예약 취소는 불가능합니다.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameBoard
