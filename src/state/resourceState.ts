import { create } from 'zustand'
import { dummyCards } from '../data/cards'
import type { BallType, PokemonCard } from '../data/cards'

interface ResourceState {
  balls: Record<BallType, number>
  ownedCards: PokemonCard[]
  reservedCard: PokemonCard | null
  useBalls: (cost: Partial<Record<BallType, number>>) => boolean
  addBalls: (ballsToAdd: Partial<Record<BallType, number>>) => boolean
  setReservedCard: (card: PokemonCard | null) => void
  addMasterBall: () => void
  applyBonus: (bonus: BallType, count: number) => void
  evolveCard: (baseCard: PokemonCard, evolvedCard: PokemonCard) => void
  setCollection: (cards: PokemonCard[]) => void
  addCard: (card: PokemonCard) => void
  getEvolvableCards: () => PokemonCard[]
  addBallsRaw: (delta: Partial<Record<BallType, number>>) => void
}

export const useResourceState = create<ResourceState>((set, get) => ({
  balls: {
    pokeball: 0,
    superball: 0,
    hyperball: 0,
    healball: 0,
    netball: 0,
    masterball: 0,
  },
  ownedCards: [],
  reservedCard: null,

  useBalls: (cost) => {
    const current = get().balls
    const next = { ...current }

    for (const type in cost) {
      const key = type as BallType
      const need = cost[key] || 0
      if ((current[key] || 0) < need) return false
      next[key] -= need
    }

    set({ balls: next })
    return true
  },

  addBalls: (ballsToAdd) => {
    const state = get()
    const updated = { ...state.balls }
    const currentTotal =
      Object.values(updated).reduce((sum, v) => sum + (v || 0), 0)
    const addTotal =
      Object.values(ballsToAdd).reduce((sum, v) => sum + (v || 0), 0)
    let allowedToAdd = Math.max(0, 10 - currentTotal)
    // 10개 초과해도 일단 추가(예약 시 discard 모드에서 처리)
    const result = { ...updated }
    for (const type in ballsToAdd) {
      const key = type as BallType
      const wantToAdd = ballsToAdd[key] || 0
      const addCount = wantToAdd // discard 모드에서 초과분 처리
      result[key] = (result[key] || 0) + addCount
    }
    set({ balls: result })
    return true
  },
  addBallsRaw: (delta) =>
    set((state) => {
      const updated = { ...state.balls }
      for (const t in delta) {
        const k = t as BallType
        updated[k] = (updated[k] || 0) + (delta[k] || 0)
      }
      return { balls: updated }
    }),
  setReservedCard: (card) => set(() => ({ reservedCard: card })),

  addMasterBall: () =>
    set((state) => {
      const current = { ...state.balls }
      if (current.masterball < 3 && Object.values(current).reduce((a, b) => a + b, 0) < 10) {
        current.masterball += 1
        return { balls: current }
      }
      alert('마스터볼은 최대 3개, 전체 볼은 10개까지만 보유할 수 있습니다!')
      return {}
    }),

  applyBonus: (bonus, count) =>
    set((state) => {
      const current = { ...state.balls }
      let add = Math.min(count, 10 - Object.values(current).reduce((a, b) => a + b, 0))
      if (add > 0) current[bonus] = (current[bonus] || 0) + add
      return { balls: current }
    }),

  // 진화 가능한 카드 리스트 반환
  getEvolvableCards: () => {
    const owned = get().ownedCards
    return owned.filter((base) => {
      // 진화 가능한 카드가 존재하는지 확인
      return dummyCards.some(
        (c) => c.evolvesFrom === base.name && !owned.some((o) => o.name === c.name)
      )
    })
  },
  // 진화 실행
  evolveCard: (baseCard: PokemonCard, evolvedCard: PokemonCard) =>
    set((state) => {
      const owned = state.ownedCards.filter((c) => c.id !== baseCard.id)
      return { ownedCards: [...owned, evolvedCard] }
    }),
  // 포획 시 보너스 자동 적용
  addCard: (card: PokemonCard) =>
    set((state) => ({ ownedCards: [...state.ownedCards, card] })),

  setCollection: (cards: PokemonCard[]) => set(() => ({ ownedCards: cards })),
}))
