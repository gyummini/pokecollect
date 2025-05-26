import { create } from 'zustand'

interface GameState {
  actionPoints: number
  round: number
  maxRounds: number
  isChoosingAction: boolean
  resetCount: number
  maxReset: number
  isGameOver: boolean
  finalCollection: any[]
  decreaseActionPoints: () => void
  nextRound: () => void
  resetGame: () => void
  setChoosingAction: (value: boolean) => void
  increaseResetCount: () => void
  setGameOver: (value: boolean) => void
  setFinalCollection: (cards: any[]) => void
}

export const useGameState = create<GameState>((set) => ({
  actionPoints: 30,
  round: 1,
  maxRounds: 3,
  isChoosingAction: false,
  resetCount: 0,
  maxReset: 2,
  isGameOver: false,
  finalCollection: [],

  decreaseActionPoints: () =>
    set((state) => ({
      actionPoints: Math.max(state.actionPoints - 3, 0),
    })),

  nextRound: () =>
    set((state) => ({
      round: Math.min(state.round + 1, state.maxRounds),
      actionPoints: 30,
      isChoosingAction: false,
    })),

  resetGame: () =>
    set(() => ({
      actionPoints: 30,
      round: 1,
      maxRounds: 3,
      isChoosingAction: false,
      resetCount: 0,
      isGameOver: false,
      finalCollection: [],
    })),

  setChoosingAction: (value) =>
    set(() => ({
      isChoosingAction: value,
    })),

  increaseResetCount: () =>
    set((state) => ({
      resetCount: Math.min(state.resetCount + 1, state.maxReset),
    })),

  setGameOver: (value: boolean) =>
    set(() => ({
      isGameOver: value,
    })),

  setFinalCollection: (cards: any[]) =>
    set(() => ({
      finalCollection: cards,
    })),
}))
