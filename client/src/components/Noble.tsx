// src/components/Noble.tsx

import React from 'react'
import { Noble } from 'shared/types'

type NobleProps = {
  noble: Noble
  image: string
}

export const NobleCard: React.FC<NobleProps> = ({
  noble,
  image
}) => {
  return (
    <div className="w-[80px] h-[80px] rounded-lg overflow-hidden bg-gray-700 relative">
      
      {/* 背景画像 */}
      <img
        src={image}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* ポイント（左上） */}
      <div className="absolute top-1 left-1 text-xs bg-black/60 px-1 rounded">
        {noble.point}
      </div>

      {/* 条件（下） */}
      <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-[2px]">
        {Object.entries(noble.requirement).map(([key, value]) => {
          if (value === 0) return null

          return (
            <div key={key} className="flex items-center gap-[2px] bg-black/60 px-[2px] rounded">
              <img
                src={`/img/${key}.png`}
                className="w-3 h-3"
                draggable={false}
              />
              <span className="text-[10px] text-white">{value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 使用例
{/* <NobleCard
  noble={{
    id: 'n1',
    point: 3,
    requirement: {
      emerald: 3,
      diamond: 0,
      sapphire: 3,
      onyx: 0,
      ruby: 0
    }
  }}
  image="/nobles/n1.png"
/> */}