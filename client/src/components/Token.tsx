// src/components/Token.tsx
import React from 'react'
import { TokenColor } from 'shared/types'
import { GemImg } from './GemImg'
import { useTokenContext } from '../context/TokenContext'
import { useGameContext } from '../context/GameContext'

export type TokenProps = {
  token: TokenColor
  count: number
}

const borderColorMap: Record<TokenColor, string> = {
  emerald: 'border-green-500',
  diamond: 'border-gray-200',
  sapphire: 'border-blue-500',
  onyx: 'border-gray-900',
  ruby: 'border-red-500',
  gold: 'border-yellow-300'
}

export const Token: React.FC<TokenProps> = ({ token, count }) => {
  const { addToken, selectedTokens, canSelectToken } = useTokenContext()
  const { isMyTurn } = useGameContext()


  const selected = selectedTokens.includes(token)
  const disabled = !canSelectToken(token)

  return (
    <div className="flex flex-col items-center">
      <div
        onClick={() => {
          if (!isMyTurn || !canSelectToken(token)) return
          addToken(token)
        }}
        className={`
          w-[64px] h-[64px] rounded-full flex items-center justify-center
          border-4 ${borderColorMap[token]}
          bg-gray-800 shadow-md
          transition
          ${(disabled || !isMyTurn) ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
          ${selected ? 'ring-4 ring-yellow-400 scale-110' : ''}
        `}
      >
        <GemImg token={token} />
      </div>

      <div className="text-white text-sm mt-1">
        {count}
      </div>
    </div>
  )
}