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

export const dummyCards: PokemonCard[] = [
  {
    id: 1,
    name: '이브이',
    rarity: 'common',
    requiredBalls: { pokeball: 2, healball: 1 },
    bonus: 'pokeball',
    bonusCount: 1,
    points: 1,
  },
  {
    id: 2,
    name: '파이리',
    rarity: 'common',
    requiredBalls: { superball: 1, pokeball: 2 },
    bonus: 'pokeball',
    bonusCount: 1,
    points: 0,
  },
  {
    id: 3,
    name: '샤미드',
    rarity: 'uncommon',
    requiredBalls: { pokeball: 3, superball: 3, netball: 1 },
    bonus: 'superball',
    bonusCount: 1,
    points: 2,
    evolvesFrom: '이브이',
    requiresEvolutionBonus: { pokeball: 1 },
  },
  {
    id: 4,
    name: '부스터',
    rarity: 'uncommon',
    requiredBalls: { pokeball: 2, superball: 3, healball: 2 },
    bonus: 'superball',
    bonusCount: 1,
    points: 3,
    evolvesFrom: '이브이',
    requiresEvolutionBonus: { healball: 1 },
  },
  {
    id: 5,
    name: '리자몽',
    rarity: 'rare',
    requiredBalls: { hyperball: 4, superball: 3, netball: 2 },
    bonus: 'hyperball',
    bonusCount: 1,
    points: 5,
    evolvesFrom: '리자드',
    requiresEvolutionBonus: { superball: 2 },
  },
  {
    id: 6,
    name: '마기라스',
    rarity: 'rare',
    requiredBalls: { hyperball: 3, healball: 3, netball: 3 },
    bonus: 'hyperball',
    bonusCount: 1,
    points: 4,
  },
  {
    id: 7,
    name: '뮤츠',
    rarity: 'legendary',
    requiredBalls: { masterball: 1, hyperball: 3, superball: 4 },
    bonus: 'masterball',
    bonusCount: 2,
    points: 2,
  },
  {
    id: 8,
    name: '뮤',
    rarity: 'mythical',
    requiredBalls: { masterball: 1, healball: 2, netball: 2 },
    bonus: 'healball',
    bonusCount: 2,
    points: 0,
  }
]
