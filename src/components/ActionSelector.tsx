import { useState } from 'react'
import { useResourceState } from '../state/resourceState'
import { useGameState } from '../state/gameState'
import type { BallType } from '../data/cards'

const ballTypes: BallType[] = ['pokeball', 'superball', 'hyperball', 'healball', 'netball']

const ActionSelector = () => {
  const { balls, addBalls } = useResourceState()
  const { actionPoints, decreaseActionPoints, setChoosingAction } = useGameState()

  const [actionType, setActionType] = useState<'same' | 'different'>('same')
  const [diffBalls, setDiffBalls] = useState<BallType[]>([])

  // 볼 버리기 상태
  const [discardMode, setDiscardMode] = useState(false)
  const [discardCount, setDiscardCount] = useState(0)
  const [discardBalls, setDiscardBalls] = useState<Partial<Record<BallType, number>>>({})

  // 예약 관련 상태
  const [reservedPokemon, setReservedPokemon] = useState<string | null>(null)
  const [reserveInput, setReserveInput] = useState('')

  // 볼 총합 계산
  const getTotalBalls = (customBalls?: Record<string, number>) =>
    Object.values(customBalls ?? balls).reduce((sum, v) => sum + (v || 0), 0)

  // 볼 버리기 UI에서 선택
  const handleSelectDiscard = (type: BallType) => {
    if ((discardBalls[type] || 0) < (balls[type] || 0)) {
      setDiscardBalls({
        ...discardBalls,
        [type]: (discardBalls[type] || 0) + 1,
      })
    }
  }

  // 볼 버리기 완료
  const handleConfirmDiscard = () => {
    // 실제 볼 차감
    const updated: Partial<Record<BallType, number>> = {}
    for (const type in discardBalls) {
      updated[type as BallType] = -(discardBalls[type as BallType] || 0)
    }
    addBalls(updated)
    setDiscardMode(false)
    setDiscardBalls({})
    setDiscardCount(0)
    setChoosingAction(false)
  }

  // 볼을 가져오는 공통 처리 (볼을 먼저 모두 받고, 10개 초과 시 버리기)
  const handleAddBallsWithDiscard = (ballsToAdd: Partial<Record<BallType, number>>) => {
    // 1. 볼을 일단 모두 addBalls로 추가
    addBalls(ballsToAdd)
    // 2. zustand의 상태 갱신이 비동기이므로, setTimeout으로 최신 balls 값을 읽음
    setTimeout(() => {
      const total = getTotalBalls()
      if (total > 10) {
        setDiscardMode(true)
        setDiscardCount(total - 10)
        setDiscardBalls({})
        alert(`볼은 최대 10개까지만 가질 수 있습니다. ${total - 10}개를 버려주세요.`)
      } else {
        setChoosingAction(false)
      }
    }, 0)
  }

  // 같은 볼 2개 버튼 클릭
  const handleSameBall = (ball: BallType) => {
    if (actionPoints < 3 || reservedPokemon) {
      alert(reservedPokemon ? '이미 예약한 포켓몬이 있습니다.' : '행동력이 부족합니다.')
      return
    }
    handleAddBallsWithDiscard({ [ball]: 2 })
    decreaseActionPoints()
  }

  // 서로 다른 볼 3개 버튼 클릭
  const handleDiffBall = (ball: BallType) => {
    if (reservedPokemon) return
    if (diffBalls.includes(ball)) return
    const next = [...diffBalls, ball]
    setDiffBalls(next)
    if (next.length === 3) {
      if (actionPoints < 3) {
        alert('행동력이 부족합니다.')
        setDiffBalls([])
        return
      }
      const gain: Partial<Record<BallType, number>> = {}
      next.forEach((b) => {
        gain[b] = (gain[b] || 0) + 1
      })
      handleAddBallsWithDiscard(gain)
      decreaseActionPoints()
      setTimeout(() => setDiffBalls([]), 0)
    }
  }

  // 서로 다른 볼 선택 취소
  const handleResetDiff = () => setDiffBalls([])

  // 볼 버리기 UI에서 선택한 볼 총합
  const getDiscardedTotal = () =>
    Object.values(discardBalls).reduce((sum, v) => sum + (v || 0), 0)

  return (
    <div className="p-4 bg-white shadow mb-4 border">
      <h2 className="text-lg font-bold mb-2">⚙️ 어떤 행동을 할까요?</h2>

      {/* 볼 버리기 모드 */}
      {discardMode ? (
        <div className="p-4 bg-yellow-50 border border-yellow-400 rounded mb-2">
          <div className="mb-2 font-bold text-yellow-700">
            볼이 10개를 초과했습니다. {discardCount}개를 버려주세요.
          </div>
          <div className="flex gap-2 flex-wrap mb-2">
            {ballTypes.concat('masterball' as BallType).map((type) => (
              <button
                key={type}
                className="bg-red-400 hover:bg-red-600 text-white px-3 py-2 rounded"
                disabled={
                  (balls[type] || 0) - (discardBalls[type] || 0) <= 0 ||
                  getDiscardedTotal() >= discardCount
                }
                onClick={() => handleSelectDiscard(type)}
              >
                {type} -{discardBalls[type] || 0} / {balls[type] || 0}
              </button>
            ))}
          </div>
          <div className="mb-2 text-sm">
            선택한 볼: {getDiscardedTotal()} / {discardCount}
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            disabled={getDiscardedTotal() !== discardCount}
            onClick={handleConfirmDiscard}
          >
            버리기 확정
          </button>
        </div>
      ) : (
        <>
          {/* 예약 상태 표시 */}
          {reservedPokemon && (
            <div className="mb-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm flex items-center justify-between">
              <span>
                예약된 포켓몬: <b>{reservedPokemon}</b>
              </span>
              <button
                className="ml-2 text-xs text-red-500 underline"
                onClick={() => setReservedPokemon(null)}
                type="button"
              >
                예약 취소
              </button>
            </div>
          )}

          <div className="flex gap-4 mb-4">
            <label>
              <input
                type="radio"
                name="action"
                value="same"
                checked={actionType === 'same'}
                onChange={() => setActionType('same')}
                disabled={!!reservedPokemon}
              />{' '}
              같은 볼 2개
            </label>
            <label>
              <input
                type="radio"
                name="action"
                value="different"
                checked={actionType === 'different'}
                onChange={() => setActionType('different')}
                disabled={!!reservedPokemon}
              />{' '}
              서로 다른 볼 3개
            </label>
          </div>

          {actionType === 'same' ? (
            <div className="flex gap-2 flex-wrap">
              {ballTypes.map((b) => (
                <button
                  key={b}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                  onClick={() => handleSameBall(b)}
                  disabled={actionPoints < 3 || !!reservedPokemon}
                >
                  {b} 2개 받기
                </button>
              ))}
            </div>
          ) : (
            <div>
              <div className="flex gap-2 flex-wrap mb-2">
                {ballTypes.map((b) => (
                  <button
                    key={b}
                    className={`px-3 py-2 rounded border ${diffBalls.includes(b) ? 'bg-gray-400 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                    onClick={() => handleDiffBall(b)}
                    disabled={diffBalls.includes(b) || diffBalls.length >= 3 || actionPoints < 3 || !!reservedPokemon}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <div className="mb-2">
                <span className="text-sm">선택: {diffBalls.join(', ') || '없음'}</span>
                {diffBalls.length > 0 && (
                  <button
                    className="ml-3 text-xs text-red-500 underline"
                    onClick={handleResetDiff}
                    type="button"
                    disabled={!!reservedPokemon}
                  >
                    선택 취소
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-500">서로 다른 볼 3개를 차례로 선택하세요.</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ActionSelector
