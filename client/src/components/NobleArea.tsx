// src/components/NobleArea.tsx

import React from 'react'
import { Noble } from 'shared/types'
import { NobleCard } from './Noble'

type NobleAreaProps = {
  nobles: Noble[]
}

export const NobleArea: React.FC<NobleAreaProps> = ({ nobles }) => {
  return (
    <div className="flex justify-center gap-2 py-2 overflow-x-auto">
      {nobles.map((noble) => (
        <NobleCard
          key={noble.id}
          noble={noble}
          image={noble.image}
        />
      ))}
    </div>
  )
}