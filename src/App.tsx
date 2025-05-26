import React from "react";
import PlayerPanel from "./components/PlayerPanel";
import TurnControls from "./components/TurnControls";
import GameBoard from "./components/GameBoard";
import ActionSelector from "./components/ActionSelector";
import { useGameState } from "./state/gameState";
import { useEffect } from "react";
import { calculateScore, getCollection } from "./utils/gameUtils";
import { useResourceState } from "./state/resourceState";

function App() {
  const {
    isChoosingAction,
    actionPoints,
    round,
    maxRounds,
    isGameOver,
    setGameOver,
    setFinalCollection,
  } = useGameState();
  const { ownedCards } = useResourceState();

  // 게임 종료 조건 체크 및 컬렉션 등록
  useEffect(() => {
    if (!isGameOver && round >= maxRounds && actionPoints < 3) {
      setGameOver(true);
      const collection = getCollection(ownedCards);
      setFinalCollection(collection);
    }
  }, [
    isGameOver,
    round,
    maxRounds,
    actionPoints,
    ownedCards,
    setGameOver,
    setFinalCollection,
  ]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <h1 className="text-3xl font-bold text-center pt-6 mb-4">
        포켓몬 컬렉터
      </h1>
      <PlayerPanel />
      <TurnControls />
      {isChoosingAction && <ActionSelector />}
      <GameBoard />
      {isGameOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white p-8 rounded shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-2">게임 종료!</h2>
            <p className="mb-2">최종 점수: {calculateScore(ownedCards)}점</p>
            <p className="mb-4">
              {calculateScore(ownedCards) >= 17
                ? "축하합니다! 컬렉션에 등록되었습니다."
                : "17점 미만으로 컬렉션 등록 실패."}
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
  );
}

export default App;
