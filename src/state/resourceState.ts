import { create } from 'zustand'
import type { BallType, PokemonCard } from '../data/cards'

interface ResourceState {
  balls: Record<BallType, number>
  ownedCards: PokemonCard[]
  useBalls: (cost: Partial<Record<BallType, number>>) => boolean
  addBalls: (ballsToAdd: Partial<Record<BallType, number>>) => void
  addMasterBall: () => void
  addCard: (card: PokemonCard) => void
}

export const useResourceState = create<ResourceState>((set, get) => ({
  balls: {
    pokeball: 5,
    superball: 5,
    hyperball: 5,
    healball: 5,
    netball: 5,
    masterball: 1,
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
    set((state) => {
      const updated = { ...state.balls }
      for (const type in ballsToAdd) {
        const key = type as BallType
        updated[key] = (updated[key] || 0) + (ballsToAdd[key] || 0)
      }
      return { balls: updated }
    })
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
