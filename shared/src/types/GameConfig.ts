// shared/src/types/GameConfig.ts
export type WinCondition =
  | {
      type: 'points'
      target: number // 10, 15, 20, 25, 30, 40
    }
  | {
      type: 'turn_limit'
      maxTurns: number // 20, 25, 30, 35, 40
    }

export type DeckConfig = {
  level1Count: number // 40, 50, 60, 70, 100
}

export type TokenConfig = {
  goldCount: number // 3, 5, 7
}

export type GameConfig = {
  winCondition: WinCondition
  deck: DeckConfig
  token: TokenConfig
}

export const defaultGameConfig: GameConfig = {
  winCondition: {
    type: 'points',
    target: 15
  },
  deck: {
    level1Count: 40
  },
  token: {
    goldCount: 5
  }
}
