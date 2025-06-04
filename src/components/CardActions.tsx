import React from 'react';
import type { PokemonCard } from '../data/cards';

interface CardActionsProps {
  card: PokemonCard;
  actionPoints: number;
  reservedPokemon: string | null;
  onCapture: (card: PokemonCard) => void;
  onReserve: (card: PokemonCard) => void;
}

const CardActions: React.FC<CardActionsProps> = ({ card, actionPoints, reservedPokemon, onCapture, onReserve }) => (
  <div className="flex gap-1 absolute bottom-2.5 right-2.5">
    <button
      className="bg-pink-500 hover:bg-pink-600 text-white px-2 py-1 rounded text-xs"
      style={{ fontSize: '0.8rem', minWidth: '38px' }}
      onClick={() => onCapture(card)}
      disabled={actionPoints < 3}
    >
      포획!
    </button>
    {(!reservedPokemon &&
      actionPoints >= 3 &&
      card.rarity !== 'legendary' &&
      card.rarity !== 'mythical') && (
      <button
        className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs"
        style={{ fontSize: '0.8rem', minWidth: '38px' }}
        onClick={() => onReserve(card)}
        type="button"
      >
        예약
      </button>
    )}
  </div>
);

export default CardActions;
