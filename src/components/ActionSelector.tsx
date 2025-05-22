import { useState } from 'react'
import { useResourceState } from '../state/resourceState'
import { useGameState } from '../state/gameState'
import type { BallType } from '../data/cards'

const ballTypes: BallType[] = ['pokeball', 'superball', 'hyperball', 'healball', 'netball']

const ActionSelector = () => {
  const { addBalls } = useResourceState()
  const { actionPoints, decreaseActionPoints, setChoosingAction } = useGameState()

  const [actionType, setActionType] = useState<'same' | 'different'>('same')
  const [sameBall, setSameBall] = useState<BallType>('pokeball')
  const [diffBalls, setDiffBalls] = useState<BallType[]>(['pokeball', 'superball', 'healball'])

  const handleConfirm = () => {
    if (actionPoints < 3) {
      alert('행동력이 부족합니다.')
      return
    }

    if (actionType === 'same') {
      addBalls({ [sameBall]: 2 })
    } else {
      const unique = new Set(diffBalls)
      if (unique.size < 3) {
        alert('서로 다른 볼 3개를 선택해주세요.')
        return
      }
      const gain: Partial<Record<BallType, number>> = {}
      diffBalls.forEach((ball) => {
        gain[ball] = (gain[ball] || 0) + 1
      })
      addBalls(gain)
    }

    decreaseActionPoints()
    setChoosingAction(false)
  }

  return (
    <div className="p-4 bg-white shadow mb-4 border">
      <h2 className="text-lg font-bold mb-2">⚙️ 어떤 행동을 할까요?</h2>

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
        <select
          value={sameBall}
          onChange={(e) => setSameBall(e.target.value as BallType)}
          className="border px-2 py-1 rounded"
        >
          {ballTypes.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      ) : (
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <select
              key={i}
              value={diffBalls[i]}
              onChange={(e) => {
                const copy = [...diffBalls]
                copy[i] = e.target.value as BallType
                setDiffBalls(copy)
              }}
              className="border px-2 py-1 rounded"
            >
              {ballTypes.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          ))}
        </div>
      )}

      <button
        onClick={handleConfirm}
        className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded"
      >
        행동 확정
      </button>
    </div>
  )
}

export default ActionSelector
