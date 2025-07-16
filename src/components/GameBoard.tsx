import React, { useState, useEffect } from 'react'
import { getNewBoard } from '../utils/gameUtils'
import { ballImagePath, bonusBgColor } from '../utils/constants'
import type { BallType, PokemonCard, Rarity } from '../data/cards'
import { pokemonDB } from '../data/pokemonDB'
import { getBonusBalls, getDiscountedCost, handleSelectDiscard } from '../utils/ballUtils'
import { useResourceState } from '../state/resourceState'
import { useGameState } from '../state/gameState'
import PokemonCardComponent from './PokemonCard'

// 희귀도 순서 및 라벨 정의
const rarityOrder: Rarity[] = ['rare', 'uncommon', 'common']
const rarityLabels: Record<Rarity, string> = {
  rare: '희귀',
  uncommon: '고급',
  common: '일반',
  legendary: '전설',
  mythical: '환상',
}

const GameBoard = () => {
  const { addCard, addBalls, balls, addBallsRaw, ownedCards } = useResourceState()
  const { actionPoints, decreaseActionPoints, resetCount, maxReset, increaseResetCount } = useGameState()
  const [board, setBoard] = useState(getNewBoard())
  const [reservedPokemon, setReservedPokemon] = useState<string | null>(null)
  const [discardMode, setDiscardMode] = useState(false)
  const [discardCount, setDiscardBallsCount] = useState(0)
  const [discardBalls, setDiscardBalls] = useState<Partial<Record<BallType, number>>>({})

  // 예약된 포켓몬 카드 객체
  const reservedCard = reservedPokemon ? pokemonDB.find((c) => c.name === reservedPokemon) ?? null : null

  // 카드 교체 (리셋)
  const handleResetBoard = () => {
    if (resetCount >= maxReset) {
      alert('카드 교체는 최대 2번만 가능합니다.')
      return
    }
    setBoard(getNewBoard())
    increaseResetCount()
  }

  // 보너스 할인 적용
  const bonusBalls = getBonusBalls(ownedCards)
  const getDiscountedCostWithBonus = (cost: Partial<Record<BallType, number>>) => getDiscountedCost(cost, bonusBalls)

  const handleCapture = (card: PokemonCard) => {
    const discountedCost = getDiscountedCost(card.requiredBalls, bonusBalls)
    let totalRequired = 0
    let canAfford = true

    Object.entries(discountedCost).forEach(([type, count]) => {
      totalRequired += count
      if (balls[type as BallType] < count) {
        canAfford = false
      }
    })

    if (!canAfford) {
      alert('볼이 부족합니다!')
      return
    }

    addCard(card)
    const newBalls = { ...balls }
    Object.entries(discountedCost).forEach(([type, count]) => {
      newBalls[type as BallType] -= count
    })
    addBallsRaw(newBalls)

    if (reservedPokemon === card.name) setReservedPokemon(null)
    alert(`${card.name} 포획 성공!`)
  }

  const handleReserve = (card: PokemonCard) => {
    if (reservedPokemon) {
      alert('이미 예약한 포켓몬이 있습니다.')
      return
    }
    if (actionPoints < 3) {
      alert('행동력이 부족합니다.')
      return
    }
    if (card.rarity === 'legendary' || card.rarity === 'mythical') {
      alert('전설/환상 포켓몬은 예약할 수 없습니다.')
      return
    }
    // 마스터볼 지급 시 10개 초과 체크
    const totalBalls = Object.values(balls).reduce((a, b) => a + (b || 0), 0)
    if (totalBalls >= 10) {
      setReservedPokemon(card.name)
      addBalls({ masterball: 1 } as any)
      setDiscardMode(true)
      setDiscardBallsCount(totalBalls + 1 - 10)
      setDiscardBalls({})
      decreaseActionPoints()
      alert(`볼은 최대 10개까지 보유 가능합니다. ${totalBalls + 1 - 10}개를 버려주세요.`)
      return
    }
    setReservedPokemon(card.name)
    addBalls({ masterball: 1 } as any)
    decreaseActionPoints()
  }

  // 버리기 관련 핸들러
  const handleSelectDiscardWrapper = (type: BallType) => handleSelectDiscard(type, balls, discardBalls, setDiscardBalls)
  const discardedSum = () => Object.values(discardBalls).reduce((s, n) => s + (n || 0), 0)
  const handleConfirmDiscard = () => {
    if (discardedSum() !== discardCount) return
    const negative: Partial<Record<BallType, number>> = {}
    for (const t in discardBalls) {
      negative[t as BallType] = -(discardBalls[t as BallType] || 0)
    }
    addBallsRaw(negative)
    setDiscardMode(false)
    setDiscardBalls({})
    setDiscardBallsCount(0)
  }

  return (
    <div className="space-y-4">
      {/* 카드 교체 버튼 */}
      <div className="flex justify-end items-center mb-2">
        <button
          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs"
          onClick={handleResetBoard}
          disabled={resetCount >= maxReset || actionPoints < 3}
        >
          카드 교체 (행동력 3 소모)
        </button>
      </div>

      {/* 버리기 모드 UI */}
      {discardMode && (
        <div className="p-4 bg-yellow-50 border border-yellow-400 rounded mb-4">
          <p className="mb-2 font-bold text-yellow-700">볼이 10개를 초과했습니다. {discardCount}개를 버려주세요.</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {Object.keys(balls).map((type) => (
              <button
                key={type}
                className="bg-red-400 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                disabled={(balls[type as BallType] || 0) - (discardBalls[type as BallType] || 0) <= 0 || discardedSum() >= discardCount}
                onClick={() => handleSelectDiscardWrapper(type as BallType)}
              >
                {type} -{discardBalls[type as BallType] || 0} / {balls[type as BallType] || 0}
              </button>
            ))}
          </div>
          <p className="text-sm mb-2">선택: {discardedSum()} / {discardCount}</p>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            disabled={discardedSum() !== discardCount}
            onClick={handleConfirmDiscard}
          >
            버리기 확정
          </button>
        </div>
      )}

      {/* 전설/환상/예약 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {board.legendary[0] && <PokemonCardComponent card={board.legendary[0]} {...{ actionPoints, reservedPokemon, onCapture, onReserve, ballImagePath, getDiscountedCost: getDiscountedCostWithBonus, bonusBgColor }} rarityLabel="전설" />}
        {board.mythical[0] && <PokemonCardComponent card={board.mythical[0]} {...{ actionPoints, reservedPokemon, onCapture, onReserve, ballImagePath, getDiscountedCost: getDiscountedCostWithBonus, bonusBgColor }} rarityLabel="환상" />}
        {reservedCard && <PokemonCardComponent card={reservedCard} {...{ actionPoints, reservedPokemon, onCapture, onReserve, ballImagePath, getDiscountedCost: getDiscountedCostWithBonus, bonusBgColor }} rarityLabel="예약" />}
      </div>

      {/* 일반/고급/희귀 카드 */}
      {rarityOrder.map((rarity) => (
        <div key={rarity}>
          <h3 className="font-bold mb-2 text-lg">{rarityLabels[rarity]}</h3>
          <div className="grid grid-cols-4 gap-4">
            {board[rarity].map((card) => (
              <PokemonCardComponent
                key={card.id}
                card={card}
                actionPoints={actionPoints}
                reservedPokemon={reservedPokemon}
                onCapture={handleCapture}
                onReserve={handleReserve}
                ballImagePath={ballImagePath}
                getDiscountedCost={getDiscountedCostWithBonus}
                bonusBgColor={bonusBgColor}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default GameBoard
