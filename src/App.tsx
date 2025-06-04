import { useState, useEffect } from 'react';
import CardPackFlipDemo from './components/open_pack';
import GameBoard from './components/GameBoard';
import ActionSelector from './components/ActionSelector';
import { useGameState } from './state/gameState';
import { calculateScore, getCollection } from './utils/gameUtils';
import { useResourceState } from './state/resourceState';
import { ballImagePath } from './utils/constants';

const TopBar = () => {
  // BallType 타입을 TopBar 내부에서 import
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type BallType = import('./data/cards').BallType;
  const { balls } = useResourceState();
  const { actionPoints, round, maxRounds, isChoosingAction, setChoosingAction, nextRound } = useGameState();

  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-2 px-2 py-1 bg-white/90 border-b border-gray-200 mb-2" style={{fontSize: '15px'}}>
      {/* 보유 볼 */}
      <div className="flex items-center gap-2">
        {Object.entries(balls).map(([type, count]) => (
          <span key={type} className="flex items-center gap-0.5">
            <img src={ballImagePath[type as BallType]} alt={type} style={{width: 20, height: 20, objectFit: 'contain'}} />
            <span style={{minWidth: 12, textAlign: 'right'}}>{count}</span>
          </span>
        ))}
      </div>
      {/* 라운드/행동력/행동버튼 */}
      <div className="flex items-center gap-2">
        <span title="라운드" className="flex items-center gap-0.5">🎯 {round}/{maxRounds}</span>
        <span title="행동력" className="flex items-center gap-0.5">⚡ {actionPoints}</span>
        {!isChoosingAction && (
          <button
            onClick={() => setChoosingAction(true)}
            disabled={actionPoints < 3}
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
          >
            볼 가져오기
          </button>
        )}
        {actionPoints < 3 && round < maxRounds && (
          <button
            onClick={nextRound}
            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
          >
            ▶
          </button>
        )}
      </div>
    </div>
  );
};

function App() {
  const [showPack, setShowPack] = useState(false);
  const { isChoosingAction, actionPoints, round, maxRounds, isGameOver, setGameOver, setFinalCollection, setChoosingAction } = useGameState();
  const { ownedCards } = useResourceState();

  // 게임 종료 조건 체크 및 컬렉션 등록
  useEffect(() => {
    if (!isGameOver && round >= maxRounds && actionPoints < 3) {
      setGameOver(true);
      const collection = getCollection(ownedCards);
      setFinalCollection(collection);
    }
  }, [isGameOver, round, maxRounds, actionPoints, ownedCards, setGameOver, setFinalCollection]);

  if (showPack) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <button className="mb-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded" onClick={() => setShowPack(false)}>
          ← 게임으로 돌아가기
        </button>
        <CardPackFlipDemo />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <TopBar />
      <div className="flex justify-end px-4 py-2">
        <button
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded shadow"
          onClick={() => setShowPack(true)}
        >
          🃏 팩 오픈
        </button>
      </div>
      {isChoosingAction && (
        <div>
          <ActionSelector />
          <div className="flex justify-end px-4">
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded text-xs"
              onClick={() => setChoosingAction(false)}
              type="button"
            >
              취소
            </button>
          </div>
        </div>
      )}
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
