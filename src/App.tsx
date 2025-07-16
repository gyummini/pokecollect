import { useState, useEffect } from 'react'
import CardPackFlipDemo from './components/open_pack'
import GameBoard from './components/GameBoard'
import PlayerPanel from './components/PlayerPanel' // PlayerPanel 임포트
import { useGameState } from './state/gameState'
import { calculateScore, getCollection } from './utils/gameUtils'
import { useResourceState } from './state/resourceState'

function App() {
  const [showPack, setShowPack] = useState(false)
  const { actionPoints, round, maxRounds, isGameOver, setGameOver, setFinalCollection } = useGameState()
  const { ownedCards } = useResourceState()

  // 게임 종료 조건 체크
  useEffect(() => {
    if (!isGameOver && round >= maxRounds && actionPoints < 3) {
      setGameOver(true)
      const collection = getCollection(ownedCards)
      setFinalCollection(collection)
    }
  }, [isGameOver, round, maxRounds, actionPoints, ownedCards, setGameOver, setFinalCollection])

  // 팩 오픈 화면
  if (showPack) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <button className="mb-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded" onClick={() => setShowPack(false)}>
          ← 게임으로 돌아가기
        </button>
        <CardPackFlipDemo />
      </div>
    )
  }

  // 메인 게임 화면
  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      {/* Main Game Board */}
      <main className="flex-1 overflow-y-auto p-4">
        <GameBoard />
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <PlayerPanel onShowPack={() => setShowPack(true)} />
      </aside>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white p-8 rounded shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-2">게임 종료!</h2>
            <p className="mb-2">최종 점수: {calculateScore(ownedCards)}점</p>
            <p className="mb-4">
              {calculateScore(ownedCards) >= 17
                ? '축하합니다! 컬렉션에 등록되었습니다.'
                : '17점 미만으로 컬렉션 등록 실패.'}
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => window.location.reload()}
            >
              다시 시작
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
