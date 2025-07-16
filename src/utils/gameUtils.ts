import { pokemonDB } from '../data/pokemonDB'
import type { PokemonCard, Rarity } from '../data/cards'

// Fisher-Yates shuffle 알고리즘
const shuffle = <T>(array: T[]): T[] => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// 게임 점수 계산
export function calculateScore(cards: PokemonCard[]): number {
  return cards.reduce((sum, c) => sum + (c.points || 0), 0)
}

// 진화 가능 여부 확인
export function canEvolve(owned: PokemonCard[], card: PokemonCard): boolean {
  if (!card.evolvesFrom) return false
  return owned.some((c) => c.name === card.evolvesFrom)
}

// 최종 컬렉션 반환
export function getCollection(cards: PokemonCard[]): PokemonCard[] {
  const score = calculateScore(cards)
  return score >= 17 ? cards : []
}

// 진화 가능한 카드 목록 반환
export function getEvolvableCards(owned: PokemonCard[]): { base: PokemonCard, evolved: PokemonCard }[] {
  return owned.flatMap((base) =>
    pokemonDB
      .filter((c) => c.evolvesFrom === base.name && !owned.some((o) => o.name === c.name))
      .map((evolved) => ({ base, evolved }))
  )
}

// 희귀도별로 무작위 카드를 뽑아 보드를 구성
export function getNewBoard(): Record<Rarity, PokemonCard[]> {
  const cardsByRarity: Record<Rarity, PokemonCard[]> = {
    common: [],
    uncommon: [],
    rare: [],
    legendary: [],
    mythical: [],
  }

  // pokemonDB에서 희귀도별로 카드 분류
  for (const card of pokemonDB) {
    cardsByRarity[card.rarity].push(card)
  }

  // 각 희귀도별로 카드 섞기
  const shuffledCommon = shuffle(cardsByRarity.common)
  const shuffledUncommon = shuffle(cardsByRarity.uncommon)
  const shuffledRare = shuffle(cardsByRarity.rare)
  const shuffledLegendary = shuffle(cardsByRarity.legendary)
  const shuffledMythical = shuffle(cardsByRarity.mythical)

  return {
    common: shuffledCommon.slice(0, 4),
    uncommon: shuffledUncommon.slice(0, 4),
    rare: shuffledRare.slice(0, 4),
    legendary: shuffledLegendary.slice(0, 1),
    mythical: shuffledMythical.slice(0, 1),
  }
}
