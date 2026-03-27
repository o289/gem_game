import React from 'react'
import { Card } from 'shared/types'
import { useGameContext } from '../context/GameContext'
import { playSound } from '../util/sound'

type CardProps = {
  card: Card
  selected?: boolean
}

export const CardData: React.FC<CardProps> = ({
  card,
}) => {
  const { isMyTurn, setActionState } = useGameContext()

  return (
    <div
      onClick={() => {
        if (!isMyTurn) return
        playSound('card')
        setActionState({
          type: 'card_selected',
          card,
          source: 'market'
        })
      }}
      className={`w-[100px] h-[140px] rounded-lg overflow-hidden relative ${isMyTurn ? 'bg-gray-700 cursor-pointer' : 'bg-gray-500 opacity-60 cursor-not-allowed'}`}
    >
      {/* 背景画像 */}
      <img
        src={card.image}
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 上部 */}
      <div className="absolute top-1 left-1 right-1 flex justify-between items-center">
        <span className="text-xs bg-black/60 px-1 rounded">{card.point}</span>

        <img
          src={`/img/${card.bonus}.png`}
          className="w-4 h-4"
          draggable={false}
        />
      </div>

      {/* コスト（左下） */}
      <div className="absolute bottom-1 left-1 flex flex-col gap-[2px]">
        {Object.entries(card.cost).map(([key, value]) => {
          if (value === 0) return null

          return (
            <div key={key} className="flex items-center gap-1">
              <img
                src={`/img/${key}.png`}
                className="w-4 h-4"
                draggable={false}
              />
              <span className="text-[13px]">{value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}