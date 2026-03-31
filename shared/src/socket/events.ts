// shared/src/socket/events.ts

import { GameState, GameConfig } from "../types";

// -----------------------------
// Payload Types
// -----------------------------

export type JoinRoomPayload = {
  roomId: string;
  playerId: string;
  name: string
};

export type LeaveRoomPayload = {
  roomId: string;
};

export type StartGamePayload = {
  roomId: string;
  config: GameConfig
};

export type ReconnectPlayerPayload = {
  roomId: string;
  playerId: string;
}

export type TakeTokensPayload = {
  roomId: string;
  playerId: string;
  tokens: string[];
};


export type ReserveCardPayload = {
  roomId: string;
  playerId: string;
  cardId: string;
};

export type BuyCardPayload = {
  roomId: string;
  playerId: string;
  cardId: string;
};

export type GameEndedPayload = {
  winnerId: string;
  finalState: GameState;
};

export type ActionErrorPayload = {
  code: string;
  message: string;
};

// -----------------------------
// Client -> Server
// -----------------------------

export type ClientToServerEvents = {
  joinRoom: (payload: JoinRoomPayload) => void;
  leaveRoom: (payload: LeaveRoomPayload) => void;
  reconnectPlayer: (payload: ReconnectPlayerPayload) => void;

  startGame: (payload: StartGamePayload) => void;
  resetGame: (data: {roomId: string}) => void
  
  takeTokens: (payload: TakeTokensPayload) => void;

  reserveCard: (payload: ReserveCardPayload) => void;
  buyCard: (payload: BuyCardPayload) => void;


  getGameState: (data: { roomId: string }) => void;
};

// -----------------------------
// Server -> Client
// -----------------------------

export type ServerToClientEvents = {
  gameStarted: (state: GameState) => void;

  gameStateUpdate: (state: GameState) => void;

  gameEnded: (payload: GameEndedPayload) => void;

  forceExitRoom: (payload: ActionErrorPayload) => void

  actionError: (error: ActionErrorPayload) => void;

  // 🔥 追加：待機中のルーム情報更新
  roomUpdate: (payload: {
    players: { id: string; name: string }[];
    hostId: string;
    status: string
  }) => void;
};
