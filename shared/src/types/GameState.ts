import { Player } from "./Player";
import { TokenSet } from "./Tokens";
import { Card } from "./Card";
import { Noble } from "./Noble";

export type GameState = {
  players: Player[];

  tokenPool: TokenSet;

  // 山札
  decks: {
    level1: Card[];
    level2: Card[];
    level3: Card[];
  };

  // ボードに配置
  market: {
    level1: Card[];
    level2: Card[];
    level3: Card[];
  };

  nobles: Noble[];

  currentPlayer: string;

  roundStartPlayer: string;

  roundEndTriggered: boolean;

  turn: number;
  
  winnerId?: string;
  winnerName?: string;
};