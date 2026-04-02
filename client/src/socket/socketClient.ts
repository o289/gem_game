import { io, Socket } from "socket.io-client";

import {
  ClientToServerEvents,
  ServerToClientEvents
} from "shared/socket/events"

import { GameConfig, GameState, TokenSet } from "shared/types";
import { ReserveCardPayload } from "shared/socket/events";

class SocketClient {

  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  private currentRoomId?: string;
  private currentPlayerId?: string;
  private currentPlayerName?: string;

  private handlers: {
    gameStateUpdate?: (state: GameState) => void;
    roomUpdate?: (data: any) => void;
    gameStarted?: (state: GameState) => void;
    gameEnded?: (payload: any) => void;
    actionError?: (error: any) => void;
  } = {};

  constructor() {

    this.socket = io({
      transports: ["websocket"],
      autoConnect: false
    });
    this.socket.on("connect", () => {});

  }

  connect() {
    // console.log("CONNECT AUTH", {
    //   roomId: this.currentRoomId,
    //   playerId: this.currentPlayerId
    // });

    this.socket = io({
      transports: ["websocket"],
      autoConnect: false,
      auth: {
        roomId: this.currentRoomId,
        playerId: this.currentPlayerId,
        name: this.currentPlayerName
      }
    });

    // 🔥 既存handlerを新socketに再登録
    if (this.handlers.gameStateUpdate) {
      this.socket.on("gameStateUpdate", this.handlers.gameStateUpdate);
    }
    if (this.handlers.roomUpdate) {
      this.socket.on("roomUpdate", this.handlers.roomUpdate);
    }
    if (this.handlers.gameStarted) {
      this.socket.on("gameStarted", this.handlers.gameStarted);
    }
    if (this.handlers.gameEnded) {
      this.socket.on("gameEnded", this.handlers.gameEnded);
    }
    if (this.handlers.actionError) {
      this.socket.on("actionError", this.handlers.actionError);
    }

    this.socket.connect();

    // 🔥 接続後にjoin & state同期（reconnect対応）
    this.socket.once("connect", () => {
      if (this.currentRoomId && this.currentPlayerId && this.currentPlayerName) {
        this.socket.emit("joinRoom", {
          roomId: this.currentRoomId,
          playerId: this.currentPlayerId,
          name: this.currentPlayerName
        });
        this.socket.emit("getGameState", {
          roomId: this.currentRoomId
        });
      }
    });

  }

  disconnect() {

    this.socket.disconnect();

  }

  // --------------------
  // Room
  // --------------------

  joinRoom(roomId: string, playerId: string, name: string) {
    this.currentRoomId = roomId;
    this.currentPlayerId = playerId;
    this.currentPlayerName = name;

    if (!this.socket.connected) {
      this.connect();
      return;
    }

    this.socket.emit("joinRoom", { roomId, playerId, name });
    this.socket.emit("getGameState", { roomId });
  }

  getGameState(roomId: string) {
    this.socket.emit("getGameState", { roomId });
  }

  leaveRoom(roomId: string) {
    this.currentRoomId = undefined;
    this.currentPlayerId = undefined;
    this.currentPlayerName = undefined;
    this.socket.emit("leaveRoom", { roomId });
  }


  startGame(roomId: string, config: GameConfig) {

    this.socket.emit("startGame", { roomId, config });

  }

  // --------------------
  // Game Actions
  // --------------------

  takeTokens(roomId: string, playerId: string, tokens: string[]) {

    this.socket.emit("takeTokens", {
      roomId,
      playerId,
      tokens
    });

  }

  reserveCard(payload: ReserveCardPayload) {

    this.socket.emit("reserveCard", payload);

  }

  buyCard(roomId: string, playerId: string, cardId: string, payment?: TokenSet) {

    this.socket.emit("buyCard", {
      roomId,
      playerId,
      cardId,
      payment
    });

  }

  resetGame(roomId: string) {

    this.socket.emit("resetGame", {
      roomId
    });

  }

  // --------------------
  // Server Events
  // --------------------

  onGameStarted(callback: (state: GameState) => void) {
    this.handlers.gameStarted = (state) => {
      console.log("[socket] gameStarted received", state);
      callback(state);
    };
    this.socket.on("gameStarted", this.handlers.gameStarted);
  }

  offGameStarted() {

    this.socket.off("gameStarted");

  }

  onRoomUpdate(callback: (data: any) => void) {
    this.handlers.roomUpdate = callback;
    this.socket.on("roomUpdate", callback);
  }

  offRoomUpdate() {
    this.socket.off("roomUpdate");
  }

  onGameStateUpdate(callback: (state: GameState) => void) {

    this.handlers.gameStateUpdate = callback;
    this.socket.on("gameStateUpdate", callback);

  }

  offGameStateUpdate() {

    this.socket.off("gameStateUpdate");

  }

  onGameEnded(callback: (payload: any) => void) {

    this.handlers.gameEnded = callback;
    this.socket.on("gameEnded", callback);

  }

  offGameEnded() {

    this.socket.off("gameEnded");

  }

  onActionError(callback: (error: any) => void) {

    this.handlers.actionError = callback;
    this.socket.on("actionError", callback);

  }

  offActionError() {

    this.socket.off("actionError");

  }

  onForceExitRoom(callback: (payload: { code: string; message: string }) => void) {
    this.socket.on("forceExitRoom", callback);
  }

  offForceExitRoom(callback?: (payload: { code: string; message: string }) => void) {
    if (callback) {
      this.socket.off("forceExitRoom", callback);
    } else {
      this.socket.off("forceExitRoom");
    }
  }

}

export const socketClient = new SocketClient();


// 使用例
// import { socketClient } from "../socket/socketClient";
// useEffect(() => {
//   socketClient.connect();
//   socketClient.onGameStateUpdate((state) => {
//     setGameState(state);
//   });
// }, []);

// トークン取得例
// socketClient.takeDifferentTokens(
//   roomId,
//   playerId,
//   ["emerald", "diamond", "ruby"]
// );