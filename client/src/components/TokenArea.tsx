// src/components/TokenArea.tsx

import React from 'react'
import { Token } from './Token'
import { TokenColor, TokenSet } from 'shared/types'

type TokenAreaProps = {
  tokens: TokenSet
}

const COLORS: TokenColor[] = [
  'emerald','diamond','sapphire','onyx','ruby','gold'
]

export const TokenArea: React.FC<TokenAreaProps> = ({
  tokens
}) => {
  
  return (
    <div className="flex justify-center gap-2 py-2">
      {COLORS.map((color) => (
        <Token
          key={color}
          token={color}
          count={tokens[color]}
        />
      ))}
    </div>
  )
}