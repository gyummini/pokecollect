import { useState } from 'react'
import { useResourceState } from '../state/resourceState'
import { useGameState } from '../state/gameState'
import type { BallType } from '../data/cards'

const ballTypes: BallType[] = [
  'pokeball',
  'superball',
  'hyperball',
  'healball',
  'netball',
]

const ActionSelector = () => {
  /* zustand hooks */
  const { balls, addBallsRaw } = useResourceState()
  const { actionPoints, decreaseActionPoints, setChoosingAction } = useGameState()

  /* 행동 선택 상태 */
  const [actionType, setActionType] = useState<'same' | 'different'>('same')
  const [diffBalls, setDiffBalls] = useState<BallType[]>([])

  /* 버리기(Discard) 모드 상태 */
  const [discardMode, setDiscardMode] = useState(false)
  const [discardCount, setDiscardCount] = useState(0)
  const [discardBalls, setDiscardBalls] =
    useState<Partial<Record<BallType, number>>>({})

  /* 현재 볼 총합 계산 */
  const getTotal = (obj: Partial<Record<BallType, number>>) =>
    Object.values(obj).reduce((s, n) => s + (n || 0), 0)

  /* ───────────────────────────────────
       공통 로직 : 볼 획득 + 초과 처리
  ────────────────────────────────────*/
  const handleAddBallsWithDiscard = (gain: Partial<Record<BallType, number>>) => {
    /* 1) gain 을 현재 balls 에 합쳐 스냅샷 생성 */
    const merged: Partial<Record<BallType, number>> = { ...balls }
    for (const t in gain) {
      const k = t as BallType
      merged[k] = (merged[k] || 0) + (gain[k] || 0)
    }
    const nextTotal = getTotal(merged)

    /* 2) 제한 없이 모든 볼 추가 */
    addBallsRaw(gain)

    /* 3) 초과 여부 판단 */
    if (nextTotal > 10) {
      setDiscardMode(true)
      setDiscardCount(nextTotal - 10)
      setDiscardBalls({})
      alert(`볼은 최대 10개까지 보유 가능합니다. ${nextTotal - 10}개를 버려주세요.`)
    } else {
      setChoosingAction(false)
    }
  }

  /* 같은 볼 2개 */
  const handleSameBall = (ball: BallType) => {
    if (actionPoints < 3) {
      alert('행동력이 부족합니다.')
      return
    }
    handleAddBallsWithDiscard({ [ball]: 2 })
    decreaseActionPoints()
  }

  /* 서로 다른 볼 3개 */
  const handleDiffBall = (ball: BallType) => {
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
      next.forEach((b) => (gain[b] = 1))
      handleAddBallsWithDiscard(gain)
      decreaseActionPoints()
      setDiffBalls([])
    }
  }

  const handleResetDiff = () => setDiffBalls([])

  /* 버리기 선택 */
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
    /* 음수로 만들어 차감 */
    const negative: Partial<Record<BallType, number>> = {}
    for (const t in discardBalls) {
      negative[t as BallType] = -(discardBalls[t as BallType] || 0)
    }
    addBallsRaw(negative)
    /* 모드 종료 */
    setDiscardMode(false)
    setDiscardBalls({})
    setDiscardCount(0)
    setChoosingAction(false)
  }

  /* ───────────── 렌더 ───────────── */
  return (
    <div className="p-4 bg-white shadow mb-4 border">
      <h2 className="text-lg font-bold mb-2">⚙️ 어떤 행동을 할까요?</h2>

      {discardMode ? (
        /* ── 버리기 모드 ── */
        <div className="p-4 bg-yellow-50 border border-yellow-400 rounded mb-2">
          <p className="mb-2 font-bold text-yellow-700">
            볼이 10개를 초과했습니다. {discardCount}개를 버려주세요.
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {ballTypes.concat('masterball' as BallType).map((type) => (
              <button
                key={type}
                className="bg-red-400 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                disabled={
                  (balls[type] || 0) - (discardBalls[type] || 0) <= 0 ||
                  discardedSum() >= discardCount
                }
                onClick={() => handleSelectDiscard(type)}
              >
                {type} -{discardBalls[type] || 0} / {balls[type] || 0}
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
      ) : (
        /* ── 일반 모드 ── */
        <>
          <div className="flex gap-4 mb-4">
            <label>
              <input
                type="radio"
                name="action"
                value="same"
                checked={actionType === 'same'}
                onChange={() => setActionType('same')}
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
              />{' '}
              서로 다른 볼 3개
            </label>
          </div>

          {actionType === 'same' ? (
            <div className="flex flex-wrap gap-2">
              {ballTypes.map((b) => (
                <button
                  key={b}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  onClick={() => handleSameBall(b)}
                  disabled={actionPoints < 3}
                >
                  {b} ×2
                </button>
              ))}
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {ballTypes.map((b) => (
                  <button
                    key={b}
                    className={`px-3 py-1 rounded text-sm border ${
                      diffBalls.includes(b)
                        ? 'bg-gray-400 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                    onClick={() => handleDiffBall(b)}
                    disabled={
                      diffBalls.includes(b) ||
                      diffBalls.length >= 3 ||
                      actionPoints < 3
                    }
                  >
                    {b}
                  </button>
                ))}
              </div>
              <p className="text-sm mb-2">
                선택: {diffBalls.join(', ') || '없음'}
                {diffBalls.length > 0 && (
                  <button
                    className="ml-3 text-xs text-red-500 underline"
                    onClick={handleResetDiff}
                    type="button"
                  >
                    선택 취소
                  </button>
                )}
              </p>
              <p className="text-xs text-gray-500">
                서로 다른 볼 3개를 차례로 선택하세요.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ActionSelector
