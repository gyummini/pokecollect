import React from 'react';

interface BonusIconsProps {
  bonus: string;
  bonusCount: number;
  ballImagePath: Record<string, string>;
  iconSize?: number;
}

const BonusIcons: React.FC<BonusIconsProps> = ({ bonus, bonusCount, ballImagePath, iconSize = 22 }) => {
  const bonusIcons = Array(bonusCount).fill(bonus);
  return (
    <div className={`absolute right-2.5 top-2.5 flex items-center z-10 ${bonusCount > 1 ? 'flex-col gap-0.5' : 'gap-1'}`}>
      {bonusIcons.map((b, i) => (
        <img
          key={i}
          src={ballImagePath[b]}
          alt={b}
          style={{ width: iconSize, height: iconSize, objectFit: 'contain', display: 'inline' }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ))}
    </div>
  );
};

export default BonusIcons;
