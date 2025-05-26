export type BallType = 'pokeball' | 'superball' | 'hyperball' | 'healball' | 'netball' | 'masterball'
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythical'

export interface PokemonCard {
  id: number
  name: string
  rarity: Rarity
  requiredBalls: Partial<Record<BallType, number>>
  bonus: BallType
  bonusCount: number
  points: number
  evolvesFrom?: string
  requiresEvolutionBonus?: Partial<Record<BallType, number>>
}

// 카드 데이터 보완: 희귀도별 요구 볼/점수/보너스 규칙 준수, 진화 라인 추가
export const dummyCards: PokemonCard[] = [
  // common 4장
  {
    id: 1,
    name: '이브이',
    rarity: 'common',
    requiredBalls: { pokeball: 3, healball: 1 },
    bonus: 'pokeball',
    bonusCount: 1,
    points: 1,
  },
  {
    id: 2,
    name: '파이리',
    rarity: 'common',
    requiredBalls: { pokeball: 2, superball: 1, healball: 1 },
    bonus: 'pokeball',
    bonusCount: 1,
    points: 1,
  },
  {
    id: 3,
    name: '꼬부기',
    rarity: 'common',
    requiredBalls: { pokeball: 2, netball: 1, healball: 1 },
    bonus: 'pokeball',
    bonusCount: 1,
    points: 1,
  },
  {
    id: 4,
    name: '캐터피',
    rarity: 'common',
    requiredBalls: { pokeball: 2, netball: 1, superball: 1 },
    bonus: 'pokeball',
    bonusCount: 1,
    points: 1,
  },
  // uncommon 4장
  {
    id: 5,
    name: '샤미드',
    rarity: 'uncommon',
    requiredBalls: { pokeball: 4, superball: 2, netball: 1 },
    bonus: 'superball',
    bonusCount: 1,
    points: 3,
    evolvesFrom: '이브이',
    requiresEvolutionBonus: { pokeball: 1 },
  },
  {
    id: 6,
    name: '리자드',
    rarity: 'uncommon',
    requiredBalls: { pokeball: 3, superball: 3, healball: 1 },
    bonus: 'superball',
    bonusCount: 1,
    points: 3,
    evolvesFrom: '파이리',
    requiresEvolutionBonus: { superball: 1 },
  },
  {
    id: 7,
    name: '어니부기',
    rarity: 'uncommon',
    requiredBalls: { pokeball: 3, netball: 2, healball: 2 },
    bonus: 'superball',
    bonusCount: 1,
    points: 3,
    evolvesFrom: '꼬부기',
    requiresEvolutionBonus: { netball: 1 },
  },
  {
    id: 8,
    name: '단데기',
    rarity: 'uncommon',
    requiredBalls: { pokeball: 3, netball: 2, superball: 1 },
    bonus: 'superball',
    bonusCount: 1,
    points: 3,
    evolvesFrom: '캐터피',
    requiresEvolutionBonus: { netball: 1 },
  },
  // rare 4장
  {
    id: 9,
    name: '부스터',
    rarity: 'rare',
    requiredBalls: { hyperball: 4, superball: 3, healball: 2 },
    bonus: 'hyperball',
    bonusCount: 2,
    points: 5,
    evolvesFrom: '샤미드',
    requiresEvolutionBonus: { superball: 2 },
  },
  {
    id: 10,
    name: '리자몽',
    rarity: 'rare',
    requiredBalls: { hyperball: 4, superball: 3, netball: 2 },
    bonus: 'hyperball',
    bonusCount: 2,
    points: 5,
    evolvesFrom: '리자드',
    requiresEvolutionBonus: { superball: 2 },
  },
  {
    id: 11,
    name: '거북왕',
    rarity: 'rare',
    requiredBalls: { hyperball: 3, healball: 3, netball: 3 },
    bonus: 'hyperball',
    bonusCount: 2,
    points: 5,
    evolvesFrom: '어니부기',
    requiresEvolutionBonus: { healball: 2 },
  },
  {
    id: 12,
    name: '버터플',
    rarity: 'rare',
    requiredBalls: { hyperball: 3, netball: 3, superball: 3 },
    bonus: 'hyperball',
    bonusCount: 2,
    points: 5,
    evolvesFrom: '단데기',
    requiresEvolutionBonus: { netball: 2 },
  },
  // legendary 1장
  {
    id: 13,
    name: '뮤츠',
    rarity: 'legendary',
    requiredBalls: { masterball: 1, hyperball: 5, superball: 4 },
    bonus: 'masterball',
    bonusCount: 2,
    points: 2,
  },
  // mythical 1장
  {
    id: 14,
    name: '뮤',
    rarity: 'mythical',
    requiredBalls: { masterball: 1, healball: 2, netball: 2 },
    bonus: 'healball',
    bonusCount: 2,
    points: 0,
  },
]
