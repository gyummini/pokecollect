import PlayerPanel from './components/PlayerPanel'
import TurnControls from './components/TurnControls'
import GameBoard from './components/GameBoard'
import ActionSelector from './components/ActionSelector'
import { useGameState } from './state/gameState'

function App() {
  const { isChoosingAction } = useGameState()

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <h1 className="text-3xl font-bold text-center pt-6 mb-4">포켓몬 컬렉터</h1>
      <PlayerPanel />
      <TurnControls />
      {isChoosingAction && <ActionSelector />}
      <GameBoard />
    </div>
  )
}

export default App
