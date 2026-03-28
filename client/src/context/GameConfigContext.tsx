

import { createContext, useContext, useState, ReactNode } from "react"
import { GameConfig, defaultGameConfig } from "shared/types/GameConfig"

type GameConfigContextType = {
  config: GameConfig
  setConfig: (config: GameConfig) => void
}

const GameConfigContext = createContext<GameConfigContextType | undefined>(undefined)

export const GameConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<GameConfig>(defaultGameConfig)

  return (
    <GameConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </GameConfigContext.Provider>
  )
}

export const useGameConfig = () => {
  const context = useContext(GameConfigContext)

  if (!context) {
    throw new Error("useGameConfig must be used within GameConfigProvider")
  }

  return context
}