import React, { useRef, useLayoutEffect, useState } from 'react';
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
  rarityLabel?: string; // 등급 표시용 (legendary/mythical)
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
  rarityLabel,
}: PokemonCardProps) {
  const evolvesFrom = card.evolvesFrom;
  const requiresBonus = card.requiresEvolutionBonus;
  const bgColor = bonusBgColor[card.bonus] || '#fff';

  // 카드 크기 감지
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);
  useLayoutEffect(() => {
    if (!cardRef.current) return;
    const handleResize = () => setCardWidth(cardRef.current!.offsetWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 비율에 따라 내부 요소 크기 계산 (기본 카드 width 200 기준)
  const ratio = cardWidth ? cardWidth / 200 : 1;
  const pokeImgSize = 110 * ratio;
  const ballSize = 16 * ratio;
  const bonusBallSize = 22 * ratio;
  const btnFontSize = 10 * ratio;
  const btnPadding = `${0.5 * ratio}em ${2 * ratio}px`;
  const btnMinWidth = 36 * ratio;
  const btnMinHeight = 22 * ratio;

  return (
    <div
      ref={cardRef}
      className="relative shadow rounded-lg border overflow-visible flex flex-col items-stretch aspect-[5/7]"
      style={{
        background: bgColor,
        borderRadius: 12,
        boxShadow: '0 1px 4px #0001',
        margin: 0,
        padding: 0,
      }}
    >
      {/* 등급 표시 (legendary/mythical) */}
      {rarityLabel && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1 z-20">
          <span className={
            rarityLabel === 'LEGENDARY'
              ? 'text-xs font-bold text-purple-700 bg-white/80 px-2 py-0.5 rounded shadow'
              : 'text-xs font-bold text-pink-700 bg-white/80 px-2 py-0.5 rounded shadow'
          }>
            {rarityLabel}
          </span>
        </div>
      )}
      {/* 좌상단 점수 */}
      <CardScore points={card.points} />
      {/* 우상단 보너스볼 아이콘 */}
      <BonusIcons bonus={card.bonus} bonusCount={card.bonusCount} ballImagePath={ballImagePath} iconSize={bonusBallSize} />
      {/* 가운데 상단 진화 정보 */}
      {evolvesFrom && requiresBonus && (
        <div className="absolute left-1/2 -translate-x-1/2 top-2.5 flex items-center gap-0.5 z-10 bg-white/90 px-1.5 py-1 rounded shadow border">
          <span style={{ width: 17 * ratio, height: 17 * ratio, display: 'inline-block' }}>
            <PokemonImage name={evolvesFrom} size={17 * ratio} />
          </span>
          {Object.entries(requiresBonus).map(([type, count]) => (
            <span key={type} className="flex items-center gap-0.5 ml-0.5">
              <img
                src={ballImagePath[type]}
                alt={type}
                style={{ width: ballSize, height: ballSize, display: 'inline', objectFit: 'contain' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <span className="font-bold text-blue-600 text-xs">x{count}</span>
            </span>
          ))}
        </div>
      )}
      {/* 가운데 큰 포켓몬 이미지 */}
      <div className="flex justify-center items-center" style={{ height: 140 * ratio, marginTop: 22 * ratio }}>
        <PokemonImage name={card.name} size={pokeImgSize} />
      </div>
      {/* 카드 이름 */}
      <h2 className="text-base font-bold mb-0.5 text-center text-white drop-shadow" style={{ letterSpacing: 0, fontSize: `${16 * ratio}px` }}>{card.name}</h2>
      {/* 좌하단 필요 볼 정보 */}
      <RequiredBalls card={card} getDiscountedCost={getDiscountedCost} ballImagePath={ballImagePath} ballSize={ballSize} />
      {/* 포획/예약 버튼: hideActions가 false일 때만 노출, 예약이 이미 있으면 예약 버튼만 숨김 */}
      {!hideActions && (
        <div className="absolute right-1 bottom-1 flex gap-1">
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-bold rounded shadow"
            style={{ minWidth: btnMinWidth, minHeight: btnMinHeight, fontSize: btnFontSize, padding: btnPadding }}
            onClick={e => { e.stopPropagation(); onCapture(card); }}
            disabled={actionPoints <= 0}
          >
            포획
          </button>
          {!reservedPokemon && (
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded shadow"
              style={{ minWidth: btnMinWidth, minHeight: btnMinHeight, fontSize: btnFontSize, padding: btnPadding }}
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
