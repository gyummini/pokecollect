import React from 'react';

interface CardScoreProps {
  points: number;
}

const CardScore: React.FC<CardScoreProps> = ({ points }) => (
  <div className="absolute left-2.5 top-2.5 flex items-center gap-0.5 z-10">
    <span className="font-bold text-white text-lg drop-shadow" style={{padding: 0, background: 'none', border: 'none', boxShadow: 'none'}}>{points}</span>
  </div>
);

export default CardScore;
