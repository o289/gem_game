// server/src/state/createDecks.ts

import { GameConfig, Card, Noble } from "shared/types";

// 既存の生成ロジック（仮）
import {
  generateDecks
} from "../game/generation/generateCards";

import { generateNobles } from "../game/generation/generateNobles" 

// 汎用シャッフル
function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export type Decks = {
  deck1: Card[];
  deck2: Card[];
  deck3: Card[];
  nobles: Noble[];
};

export function createDecks(playerCount: number, config: GameConfig): Decks {
  // 外部生成ロジックを呼び出す
  const { level1, level2, level3 } = generateDecks(config);
  const nobles = generateNobles(playerCount);

  // シャッフルして返す
  return {
    deck1: shuffle(level1),
    deck2: shuffle(level2),
    deck3: shuffle(level3),
    nobles: shuffle(nobles),
  };
}