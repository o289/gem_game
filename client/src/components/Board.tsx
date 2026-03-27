// src/components/Board.tsx

import React, { useEffect, useState } from 'react'
import { Card, Noble } from 'shared/types'
import { CardRow } from './CardRow'
import { NobleArea } from './NobleArea'
import { Modal } from './ui/Modal'


type CardLevelMap = {
  level1: Card[]
  level2: Card[]
  level3: Card[]
}

export type BoardProps = {
  market: CardLevelMap
  nobles: Noble[]
}

export const Board: React.FC<BoardProps> = ({market, nobles}) => {
  

  if (!market || !nobles) return <div className="text-white">Loading...</div>

  const cardsLv1 = market.level1;
  const cardsLv2 = market.level2;
  const cardsLv3 = market.level3;

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain p-2 flex flex-col gap-2">
      
      {/* Nobles */}
      <NobleArea nobles={nobles} />

      {/* Lv3 */}
      <CardRow cards={cardsLv3} />

      {/* Lv2 */}
      <CardRow cards={cardsLv2} />

      {/* Lv1 */}
      <CardRow cards={cardsLv1} />

    </div>
  )
}