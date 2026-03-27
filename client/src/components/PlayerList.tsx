// src/components/PlayerList.tsx

import React from 'react'

type PlayerListProps = {
  players: string[]
}

export const PlayerList: React.FC<PlayerListProps> = ({ players }) => {
  return (
    <div className="flex overflow-x-auto gap-2 p-2 bg-gray-800">
      {players.map((player, index) => (
        <div
          key={index}
          className="min-w-[80px] h-[50px] border border-gray-600 flex items-center justify-center"
        >
          {player}
        </div>
      ))}
    </div>
  )
}