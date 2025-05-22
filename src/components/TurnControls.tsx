import { useGameState } from '../state/gameState'

const TurnControls = () => {
  const {
    actionPoints,
    round,
    maxRounds,
    isChoosingAction,
    setChoosingAction,
    nextRound,
  } = useGameState()

  return (
    <div className="p-4 flex flex-col items-center gap-3 bg-white shadow mb-4">
      <p className="text-lg">🎯 현재 라운드: {round} / {maxRounds}</p>
      <p className="text-lg">⚡ 남은 행동력: {actionPoints}</p>

      {!isChoosingAction && (
        <button
          onClick={() => setChoosingAction(true)}
          disabled={actionPoints < 3}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          행동하기 (-3)
        </button>
      )}

      {actionPoints < 3 && round < maxRounds && (
        <button
          onClick={nextRound}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          다음 라운드로 ▶
        </button>
      )}

      {round >= maxRounds && actionPoints < 3 && (
        <p className="text-red-600 font-bold mt-2">게임 종료 조건 충족됨</p>
      )}
    </div>
  )
}

export default TurnControls
