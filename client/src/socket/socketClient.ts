import { io, Socket } from "socket.io-client";

import {
  ClientToServerEvents,
  ServerToClientEvents
} from "shared/socket/events"

import { GameConfig, GameState } from "shared/types";

class SocketClient {

  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  private currentRoomId?: string;
  private currentPlayerId?: string;
  private currentPlayerName?: string;

  constructor() {

    this.socket = io({
      transports: ["websocket"]
    });
    this.socket.on("connect", () => {
      if (this.currentRoomId && this.currentPlayerId && this.currentPlayerName) {
        // 🔥 再接続時も joinRoom に統一
        this.socket.emit("joinRoom", {
          roomId: this.currentRoomId,
          playerId: this.currentPlayerId,
          name: this.currentPlayerName
        });

        // 🔥 状態再取得（最重要）
        this.socket.emit("getGameState", {
          roomId: this.currentRoomId
        });
      }
    });

  }

  connect() {

    this.socket.connect();

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

    if (this.socket.connected) {
      this.socket.emit("joinRoom", { roomId, playerId, name });

      // 🔥 初回接続でも確実に状態取得
      this.socket.emit("getGameState", { roomId });

      // 🔥 念のため遅延再取得（取りこぼし防止）
      setTimeout(() => {
        if (this.currentRoomId) {
          this.socket.emit("getGameState", { roomId: this.currentRoomId });
        }
      }, 300);

    } else {
      this.socket.connect();
      this.socket.once("connect", () => {
        this.socket.emit("joinRoom", { roomId, playerId, name });

        // 🔥 初回接続でも確実に状態取得
        this.socket.emit("getGameState", { roomId });

        // 🔥 念のため遅延再取得（取りこぼし防止）
        setTimeout(() => {
          if (this.currentRoomId) {
            this.socket.emit("getGameState", { roomId: this.currentRoomId });
          }
        }, 300);
      });
    }
  }

  leaveRoom(roomId: string) {
    this.currentRoomId = undefined;
    this.currentPlayerId = undefined;
    this.currentPlayerName = undefined;
    this.socket.emit("leaveRoom", { roomId });
  }

  reconnectPlayer(roomId: string, playerId: string) {
    // 🔥 joinRoom に統一（name は保持済み前提）
    if (this.currentPlayerName) {
      this.joinRoom(roomId, playerId, this.currentPlayerName);
    } else {
      // nameが不明な場合は最低限接続のみ
      this.currentRoomId = roomId;
      this.currentPlayerId = playerId;
      if (!this.socket.connected) this.socket.connect();
    }
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

  reserveCard(roomId: string, playerId: string, cardId: string) {

    this.socket.emit("reserveCard", {
      roomId,
      playerId,
      cardId
    });

  }

  buyCard(roomId: string, playerId: string, cardId: string) {

    this.socket.emit("buyCard", {
      roomId,
      playerId,
      cardId
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
    this.socket.on("gameStarted", (state) => {
      console.log("[socket] gameStarted received", state);
      callback(state);
    });
  }

  offGameStarted() {

    this.socket.off("gameStarted");

  }

  onRoomUpdate(callback: (data: any) => void) {
    this.socket.on("roomUpdate", callback);
  }

  offRoomUpdate() {
    this.socket.off("roomUpdate");
  }

  onGameStateUpdate(callback: (state: GameState) => void) {

    this.socket.on("gameStateUpdate", callback);

  }

  offGameStateUpdate() {

    this.socket.off("gameStateUpdate");

  }

  onGameEnded(callback: (payload: any) => void) {

    this.socket.on("gameEnded", callback);

  }

  offGameEnded() {

    this.socket.off("gameEnded");

  }

  onActionError(callback: (error: any) => void) {

    this.socket.on("actionError", callback);

  }

  offActionError() {

    this.socket.off("actionError");

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