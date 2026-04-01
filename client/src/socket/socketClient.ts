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

  constructor() {

    this.socket = io({
      transports: ["websocket"]
    });
    this.socket.on("connect", () => {});

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

    if (!this.socket.connected) {
      this.socket.connect();
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