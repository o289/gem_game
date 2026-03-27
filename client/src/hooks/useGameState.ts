// client/src/hooks/useGameState.ts

import { useEffect, useState } from "react";

import { socketClient } from "../socket/socketClient";

import { GameState, Color } from "shared/types";

type GameEndedPayload = {
  winnerId: string;
  finalState: GameState;
};

export function useGameState() {

  const [gameState, setGameState] = useState<GameState | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {

    socketClient.connect();

    socketClient.onGameStarted((state) => {

      setGameState(state);

    });

    socketClient.onGameStateUpdate((state) => {

      setGameState(state);

    });

    socketClient.onGameEnded((payload: GameEndedPayload) => {

      setWinner(payload.winnerId);

      setGameState(payload.finalState);

    });

    socketClient.onActionError((err) => {

      setError(err.message);

      setTimeout(() => {
        setError(null);
      }, 3000);

    });

    return () => {

      socketClient.disconnect();

    };

  }, []);

  // ----------------------------
  // Room
  // ----------------------------

  function joinRoom(roomId: string, playerId: string, name: string) {

    socketClient.joinRoom(roomId, playerId,name);

  }

  function leaveRoom(roomId: string) {

    socketClient.leaveRoom(roomId);

  }

  function startGame(payload: any) {

    socketClient.startGame(payload);

  }

  // ----------------------------
  // Actions
  // ----------------------------

  function takeTokens(
    roomId: string,
    playerId: string,
    tokens: Color[]
  ) {

    socketClient.takeTokens(roomId, playerId, tokens);

  }

  function reserveCard(
    roomId: string,
    playerId: string,
    cardId: string
  ) {

    socketClient.reserveCard(roomId, playerId, cardId);

  }

  function buyCard(
    roomId: string,
    playerId: string,
    cardId: string
  ) {

    socketClient.buyCard(roomId, playerId, cardId);

  }

  return {

    gameState,

    error,

    winner,

    joinRoom,

    leaveRoom,

    startGame,

    takeTokens,

    reserveCard,

    buyCard

  };

}