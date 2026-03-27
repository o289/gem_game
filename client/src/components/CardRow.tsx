import React from 'react'
import { CardData } from './Card'
import { Card } from 'shared/types'
import { useCardSelection } from '../hooks/useCardSelection'

type CardRowProps = {
  cards: Card[]
  onCardPointerDown?: (card: Card, e: React.PointerEvent<HTMLDivElement>) => void
}

export const CardRow: React.FC<CardRowProps> = ({
  cards,
}) => {
  const { selectCard, selectedCard } = useCardSelection()
  return (
    <div className="flex justify-center gap-2 overflow-x-auto">
      {cards.map((card) => (
        <CardData
          key={card.id}
          card={card}
          selected={selectedCard?.id === card.id}
        />
      ))}
    </div>
  )
}