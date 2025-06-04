import PokemonImage from './PokemonImage.tsx';
import CardScore from './CardScore.tsx';
import RequiredBalls from './RequiredBalls.tsx';
import BonusIcons from './BonusIcons.tsx';
import type { PokemonCard, BallType } from '../data/cards';

interface PokemonCardProps {
  card: PokemonCard;
  actionPoints: number;
  reservedPokemon: string | null;
  onCapture: (card: PokemonCard) => void;
  onReserve: (card: PokemonCard) => void;
  ballImagePath: Record<string, string>;
  getDiscountedCost: (cost: Partial<Record<BallType, number>>) => Partial<Record<BallType, number>>;
  bonusBgColor: Record<string, string>;
  hideActions?: boolean; // 사이드바에서만 true로 전달
}

function PokemonCardComponent({
  card,
  actionPoints,
  reservedPokemon,
  onCapture,
  onReserve,
  ballImagePath,
  getDiscountedCost,
  bonusBgColor,
  hideActions = false,
}: PokemonCardProps) {
  const evolvesFrom = card.evolvesFrom;
  const requiresBonus = card.requiresEvolutionBonus;
  const bgColor = bonusBgColor[card.bonus] || '#fff';

  return (
    <div
      className="relative shadow rounded-lg border overflow-visible flex flex-col items-stretch aspect-[5/7]"
      style={{
        background: bgColor,
        width: '100%',
        borderRadius: 12,
        boxShadow: '0 1px 4px #0001',
        margin: 0,
        padding: 0,
      }}
    >
      {/* 좌상단 점수 */}
      <CardScore points={card.points} />
      {/* 우상단 보너스볼 아이콘 */}
      <BonusIcons bonus={card.bonus} bonusCount={card.bonusCount} ballImagePath={ballImagePath} />
      {/* 가운데 상단 진화 정보 */}
      {evolvesFrom && requiresBonus && (
        <div className="absolute left-1/2 -translate-x-1/2 top-2.5 flex items-center gap-0.5 z-10 bg-white/90 px-1.5 py-1 rounded shadow border">
          <span style={{ width: 17, height: 17, display: 'inline-block' }}>
            <PokemonImage name={evolvesFrom} size={17} />
          </span>
          {Object.entries(requiresBonus).map(([type, count]) => (
            <span key={type} className="flex items-center gap-0.5 ml-0.5">
              <img
                src={ballImagePath[type]}
                alt={type}
                style={{ width: 15, height: 15, display: 'inline' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <span className="font-bold text-blue-600 text-xs">x{count}</span>
            </span>
          ))}
        </div>
      )}
      {/* 가운데 큰 포켓몬 이미지 */}
      <div className="flex justify-center items-center" style={{ height: 72, marginTop: 22 }}>
        <PokemonImage name={card.name} size={48} />
      </div>
      {/* 카드 이름 */}
      <h2 className="text-base font-bold mb-0.5 text-center text-white drop-shadow" style={{ letterSpacing: 0 }}>{card.name}</h2>
      {/* 좌하단 필요 볼 정보 */}
      <RequiredBalls card={card} getDiscountedCost={getDiscountedCost} ballImagePath={ballImagePath} />
      {/* 포획/예약 버튼: hideActions가 false일 때만 노출, 예약이 이미 있으면 예약 버튼만 숨김 */}
      {!hideActions && (
        <div className="absolute right-1 bottom-1 flex gap-1">
          <button
            className="bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold py-0.5 px-2 rounded shadow"
            style={{ minWidth: 36, minHeight: 22 }}
            onClick={e => { e.stopPropagation(); onCapture(card); }}
            disabled={actionPoints <= 0}
          >
            포획
          </button>
          {!reservedPokemon && (
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-white text-[10px] font-bold py-0.5 px-2 rounded shadow"
              style={{ minWidth: 36, minHeight: 22 }}
              onClick={e => { e.stopPropagation(); onReserve(card); }}
            >
              예약
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PokemonCardComponent;
