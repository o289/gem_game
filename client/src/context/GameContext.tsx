import { createContext, useContext, ReactNode, useState } from "react";
import React from "react";
import { GameState, Player, Card, Color, TokenSet } from "shared/types";


type buyCardSource = 'market' | 'reserved'

type ActionState =
  | { type: 'none' }
  | { type: 'card_selected'; card: Card; source: buyCardSource }
  | { type: 'payment_selecting', card: Card, source: buyCardSource }
  | { type: 'token_selecting' }
  | { type: 'deck_reserve_confirm', level: "level1" | "level2" | "level3" }


type GameContextType = {
  gameState: GameState | null;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  myPlayerId: string;
  roomId: string;

  myPlayer?: Player;
  isMyTurn: boolean;

  canTakeTokens: boolean;
  canBuyCard: (card: Card) => boolean;
  canReserve: boolean;

  actionState: ActionState;
  setActionState: React.Dispatch<React.SetStateAction<ActionState>>;
};

const GameContext = createContext<GameContextType | null>(null);

type Props = {
  children: ReactNode;
  gameState: GameState | null;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  myPlayerId: string;
  roomId: string;
};

export const GameProvider = ({
  children,
  gameState,
  setGameState,
  myPlayerId,
  roomId,
}: Props) => {
  const myPlayer = gameState?.players.find(
    (p) => p.id === myPlayerId
  );

  const isMyTurn = gameState?.currentPlayer === myPlayerId;
  const [actionState, setActionState] = useState<ActionState>({ type: 'none' });

  // =========================
  // 判定ロジック
  // =========================

  // トークン取得可能か
  const canTakeTokens =
    !!isMyTurn &&
    !!myPlayer &&
    Object.values(myPlayer.tokens).reduce((a, b) => a + b, 0) < 10;

  // カード購入可能か
  const canBuyCard = (card: Card) => {
    if (!isMyTurn || !myPlayer) return false;

    let goldNeeded = 0;

    for (const color in card.cost) {
      const cost = card.cost[color as Color] || 0;
      const bonus = myPlayer.bonuses[color as Color] || 0;
      const tokens = myPlayer.tokens[color as Color] || 0;

      const required = Math.max(0, cost - bonus);

      if (tokens >= required) continue;

      goldNeeded += required - tokens;
    }

    return goldNeeded <= myPlayer.tokens.gold;
  };

  // 予約可能か
  const canReserve =
    !!isMyTurn &&
    !!myPlayer &&
    myPlayer.reservedCards.length < 3;

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        myPlayerId,
        roomId,
        myPlayer,
        isMyTurn,
        canTakeTokens,
        canBuyCard,
        canReserve,
        actionState,
        setActionState,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error("useGameContext must be used within GameProvider");
  }
  return ctx;
};