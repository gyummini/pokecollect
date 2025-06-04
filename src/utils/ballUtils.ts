// 공 관련 유틸 함수 모음
import type { BallType } from '../data/cards';

// 보너스 볼 계산
export function getBonusBalls(cards: { bonus: BallType; bonusCount: number }[]): Partial<Record<BallType, number>> {
  const bonus: Partial<Record<BallType, number>> = {};
  for (const card of cards) {
    bonus[card.bonus] = (bonus[card.bonus] || 0) + card.bonusCount;
  }
  return bonus;
}

// 할인된 비용 계산
export function getDiscountedCost(cost: Partial<Record<BallType, number>>, bonus: Partial<Record<BallType, number>>): Partial<Record<BallType, number>> {
  const discounted: Partial<Record<BallType, number>> = {};
  for (const type in cost) {
    const required = cost[type as BallType] || 0;
    const discount = bonus[type as BallType] || 0;
    discounted[type as BallType] = Math.max(0, required - discount);
  }
  return discounted;
}

// discard 합계 계산
export function discardedSum(discardBalls: Partial<Record<BallType, number>>): number {
  return Object.values(discardBalls).reduce((s, n) => s + (n || 0), 0);
}

// discard 선택 핸들러
export function handleSelectDiscard(type: BallType, balls: Partial<Record<BallType, number>>, discardBalls: Partial<Record<BallType, number>>, setDiscardBalls: (v: Partial<Record<BallType, number>>) => void) {
  if ((discardBalls[type] || 0) < (balls[type] || 0)) {
    setDiscardBalls({
      ...discardBalls,
      [type]: (discardBalls[type] || 0) + 1,
    });
  }
}
