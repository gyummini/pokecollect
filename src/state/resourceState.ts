import { create } from 'zustand'
import type { BallType, PokemonCard } from '../data/cards'

interface ResourceState {
  balls: Record<BallType, number>
  ownedCards: PokemonCard[]
  useBalls: (cost: Partial<Record<BallType, number>>) => boolean
  addBalls: (ballsToAdd: Partial<Record<BallType, number>>) => boolean
  addMasterBall: () => void
  addCard: (card: PokemonCard) => void
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
    if (addTotal > allowedToAdd) {
      // 10개 초과 시 경고 및 실패 반환
      alert('볼은 최대 10개까지만 가질 수 있습니다!')
      return false
    }
    const result = { ...updated }
    for (const type in ballsToAdd) {
      const key = type as BallType
      const wantToAdd = ballsToAdd[key] || 0
      const addCount = Math.min(wantToAdd, allowedToAdd)
      result[key] = (result[key] || 0) + addCount
      allowedToAdd -= addCount
      if (allowedToAdd <= 0) break
    }
    set({ balls: result })
    return true
  },

  addMasterBall: () => {
    set((state) => ({
      balls: {
        ...state.balls,
        masterball: (state.balls.masterball || 0) + 1,
      },
    }))
  },

  addCard: (card) => {
    set((state) => ({
      ownedCards: [...state.ownedCards, card],
    }))
  },
}))
