import { create } from 'zustand'

interface GameState {
  actionPoints: number
  round: number
  maxRounds: number
  isChoosingAction: boolean
  decreaseActionPoints: () => void
  nextRound: () => void
  resetGame: () => void
  setChoosingAction: (value: boolean) => void
}

export const useGameState = create<GameState>((set) => ({
  actionPoints: 30,
  round: 1,
  maxRounds: 3,
  isChoosingAction: false,

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
    })),

  setChoosingAction: (value) =>
    set(() => ({
      isChoosingAction: value,
    })),
}))
