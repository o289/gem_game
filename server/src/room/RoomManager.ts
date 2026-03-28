import { GameState, GameConfig, defaultGameConfig } from "shared/types";
import { createGameState } from "../state/createGameState";

export type RoomStatus = "waiting" | "playing" | "finished";

type RoomPlayer = {
  id: string;
  name: string;
  socketId: string;
};

export type Room = {
  id: string;
  hostId: string;
  players: RoomPlayer[];
  gameState?: GameState;
  config: GameConfig
  status: RoomStatus;
};

export class RoomManager {
  private rooms = new Map<string, Room>();
  private disconnectTimeouts = new Map<string, NodeJS.Timeout>();

  createRoom(roomId: string, hostId: string, socketId: string, name: string): Room {
    if (this.rooms.has(roomId)) {
      throw new Error("ROOM_ALREADY_EXISTS");
    }

    const room: Room = {
      id: roomId,
      hostId,
      players: [
        { id: hostId, name, socketId }
      ],
      config: defaultGameConfig,
      status: "waiting",
    };

    this.rooms.set(roomId, room);

    return room;
  }

  joinRoom(roomId: string, playerId: string, socketId: string, name: string): Room {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new Error("ROOM_NOT_FOUND");
    }

    const existing = room.players.find(p => p.id === playerId);

    // 🔥 再接続は最優先で処理（ゲーム中・満員でも許可）
    if (existing) {
      existing.socketId = socketId;
      existing.name = name;
      return room;
    }

    // 🔥 ここから先は新規参加のみ
    if (room.status !== "waiting") {
      throw new Error("GAME_ALREADY_STARTED");
    }

    if (room.players.length >= 4) {
      throw new Error("ROOM_FULL");
    }

    room.players.push({ id: playerId, name, socketId });

    return room;
  }

  leaveRoom(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);

    if (!room) return;

    room.players = room.players.filter((p) => p.id !== playerId);

    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return;
    }

    // 🔥 ホストは自動変更しない（reconnect対応のため）
    if (room.hostId === playerId) {
      console.log("⚠️ host left (manual leave), keeping hostId until handled explicitly");
    }
  }

  deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }

  setDisconnectTimeout(playerId: string, timeout: NodeJS.Timeout) {
    const existing = this.disconnectTimeouts.get(playerId);
    if (existing) {
      clearTimeout(existing);
    }
    this.disconnectTimeouts.set(playerId, timeout);
  }

  clearDisconnectTimeout(playerId: string) {
    const timeout = this.disconnectTimeouts.get(playerId);
    if (timeout) {
      clearTimeout(timeout);
      this.disconnectTimeouts.delete(playerId);
    }
  }

  startGame(
    roomId: string,
    config: GameConfig,
    decks: {
      level1: any[];
      level2: any[];
      level3: any[];
    },
    nobles: any[]
  ): GameState {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new Error("ROOM_NOT_FOUND");
    }

    room.config = config

    if (room.players.length < 2) {
      throw new Error("NOT_ENOUGH_PLAYERS");
    }

    if (room.status !== "waiting") {
      throw new Error("GAME_ALREADY_STARTED");
    }


    const gameState = createGameState({
      players: room.players.map(p => ({ id: p.id, name: p.name })),
      deck1: decks.level1,
      deck2: decks.level2,
      deck3: decks.level3,
      nobles,
    },
    room.config
  );

    console.log("⑤ after createGameState");

    room.gameState = gameState;

    room.status = "playing";

    return gameState;
  }

  resetGame(roomId: string): void {
    const room = this.rooms.get(roomId);

    if (!room) return;

    // ゲーム状態を初期化
    room.gameState = undefined;

    // ステータスをwaitingに戻す
    room.status = "waiting";
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getGameState(roomId: string): GameState {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new Error("ROOM_NOT_FOUND");
    }

    if (!room.gameState) {
      throw new Error("GAME_NOT_STARTED");
    }

    return room.gameState;
  }

  setGameState(roomId: string, gameState: GameState) {
    const room = this.rooms.get(roomId)

    if (!room) {
      throw new Error("ROOM_NOT_FOUND")
    }

    room.gameState = gameState
  }

  finishGame(roomId: string): void {
    const room = this.rooms.get(roomId);

    if (!room) return;

    room.status = "finished";
  }

  getPlayers(roomId: string): string[] {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new Error("ROOM_NOT_FOUND");
    }

    return room.players.map(p => p.id);
  }

  getSocketId(roomId: string, playerId: string): string | undefined {
    const room = this.rooms.get(roomId);

    if (!room) return undefined;

    return room.players.find(p => p.id === playerId)?.socketId;
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }
}

export const roomManager = new RoomManager()