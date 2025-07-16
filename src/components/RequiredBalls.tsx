import React from 'react';
import type { PokemonCard, BallType } from '../data/cards';

interface RequiredBallsProps {
  card: PokemonCard;
  getDiscountedCost: (cost: Partial<Record<BallType, number>>) => Partial<Record<BallType, number>>;
  ballImagePath: Record<string, string>;
  ballSize?: number;
}

const RequiredBalls: React.FC<RequiredBallsProps> = ({ card, getDiscountedCost, ballImagePath, ballSize = 16 }) => {
  const discounted = getDiscountedCost(card.requiredBalls);
  const requiredBallsArr = Object.entries(card.requiredBalls);
  return (
    <div className="absolute left-2.5 bottom-2.5 flex flex-col items-start gap-0.5 z-10">
      {requiredBallsArr.map(([type, count]) => {
        const d = discounted[type as BallType] ?? 0;
        return (
          <div key={type} className="flex items-center gap-0.5">
            <img
              src={ballImagePath[type]}
              alt={type}
              style={{ width: ballSize, height: ballSize, objectFit: 'contain', display: 'inline' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="font-bold text-white text-shadow text-xs">{d !== count ? `${count}→${d}` : count}</span>
          </div>
        );
      })}
    </div>
  );
};

export default RequiredBalls;
