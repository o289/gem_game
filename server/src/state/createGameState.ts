// server/src/state/createGameState.ts

import { GameState, Player, Card, Noble } from "shared/types";

type CreateGameStateParams = {
  players: { id: string; name: string }[];
  deck1: Card[];
  deck2: Card[];
  deck3: Card[];
  nobles: Noble[];
};

export function createGameState(params: CreateGameStateParams): GameState {
  const { players: inputPlayers, deck1, deck2, deck3, nobles } = params;

  // プレイヤー初期化
  const players: Player[] = inputPlayers.map(({ id, name }) => ({
    id,
    name,

    tokens: {
      emerald: 0,
      diamond: 0,
      sapphire: 0,
      onyx: 0,
      ruby: 0,
      gold: 0,
    },

    bonuses: {
      emerald: 0,
      diamond: 0,
      sapphire: 0,
      onyx: 0,
      ruby: 0,
    },

    reservedCards: [],
    cards: [],
    point: 0,
  }));

  function shuffle<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }

  // デッキコピー
  const decks = {
    level1: shuffle(deck1),
    level2: shuffle(deck2),
    level3: shuffle(deck3),
  };

  // トークンプール（人数依存）
  function createTokenPool(playerCount: number) {
    let base = 7;

    if (playerCount === 2) base = 4;
    if (playerCount === 3) base = 5;

    return {
      emerald: base,
      diamond: base,
      sapphire: base,
      onyx: base,
      ruby: base,
      gold: 5,
    };
  }

  const tokenPool = createTokenPool(players.length);

  // マーケット初期化
  const market = {
    level1: decks.level1.splice(0, 4),
    level2: decks.level2.splice(0, 4),
    level3: decks.level3.splice(0, 4),
  };

  const roundStartPlayer = players[0].id;

  const gameState: GameState = {
    players,

    tokenPool,

    decks,

    market,

    nobles,

    currentPlayer: roundStartPlayer,

    roundStartPlayer,

    roundEndTriggered: false,

    turn: 1,
  };


  return gameState;
}

// Room作成
// ↓
// Game開始
// ↓
// GameState生成

// 例
// const gameState = createGameState({
//   players: [
//     { id: "p1", name: "Taro" },
//     { id: "p2", name: "Hanako" },
//     { id: "p3", name: "Jiro" },
//   ],
//   deck1,
//   deck2,
//   deck3,
//   nobles,
// });