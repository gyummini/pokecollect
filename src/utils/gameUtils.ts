import { dummyCards } from '../data/cards'
import type { PokemonCard } from '../data/cards'

// 게임 점수 계산, 진화 가능 여부, 보너스 계산 등 유틸 함수
export function calculateScore(cards: PokemonCard[]): number {
  return cards.reduce((sum, c) => sum + (c.points || 0), 0)
}

export function canEvolve(owned: PokemonCard[], card: PokemonCard): boolean {
  if (!card.evolvesFrom) return false
  return owned.some((c) => c.name === card.evolvesFrom)
}

export function getCollection(cards: PokemonCard[]): PokemonCard[] {
  // 17점 이상 카드만 컬렉션 등록
  const score = calculateScore(cards)
  return score >= 17 ? cards : []
}

export function getEvolvableCards(owned: PokemonCard[]): { base: PokemonCard, evolved: PokemonCard }[] {
  // 소유한 카드 중 진화 가능한 조합 반환
  return owned.flatMap((base) =>
    dummyCards
      .filter((c) => c.evolvesFrom === base.name && !owned.some((o) => o.name === c.name))
      .map((evolved) => ({ base, evolved }))
  )
}

export function getBoardByRarity(cards: PokemonCard[]): Record<string, PokemonCard[]> {
  // 희귀도별 카드 배치 (common 4, uncommon 4, rare 4, legendary 1, mythical 1)
  const result: Record<string, PokemonCard[]> = {
    common: [], uncommon: [], rare: [], legendary: [], mythical: []
  }
  for (const card of cards) {
    result[card.rarity].push(card)
  }
  return {
    common: result.common.slice(0, 4),
    uncommon: result.uncommon.slice(0, 4),
    rare: result.rare.slice(0, 4),
    legendary: result.legendary.slice(0, 1),
    mythical: result.mythical.slice(0, 1),
  }
}
