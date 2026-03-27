import React from 'react'
import { TokenColor } from 'shared/types'

export type GemImgProps = {
  token: TokenColor
}

export const GemImg: React.FC<GemImgProps> = ({
    token
}) => {
    return(
      <div className="w-full h-full rounded-full overflow-hidden shadow-lg">
        <img
          src={`/img/${token}.png`}
          alt={token}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
        
    )
}