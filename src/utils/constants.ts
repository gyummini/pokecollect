import type { BallType } from '../data/cards'
import { dummyCards } from '../data/cards'

export const ballImagePath: Record<BallType, string> = {
  pokeball: '/pokeball/몬스터볼.png',
  superball: '/pokeball/슈퍼볼.png',
  hyperball: '/pokeball/하이퍼볼.png',
  healball: '/pokeball/힐볼.png',
  netball: '/pokeball/네트볼.png',
  masterball: '/pokeball/마스터볼.png',
}

export const bonusBgColor: Record<string, string> = {
  pokeball: '#f87171',      // 빨강
  superball: '#60a5fa',     // 파랑
  hyperball: '#52525b',     // 회색
  healball: '#f9a8d4',      // 분홍
  netball: '#4ade80',       // 초록
  masterball: '#a78bfa',    // 보라
}

export { dummyCards }
