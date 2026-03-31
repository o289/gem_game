import { ActionErrorPayload } from '../socket/events'
import { GAME_ERROR_CODES, ROOM_ERROR_CODES } from "./errorCodes"

export type GameErrorCode = typeof GAME_ERROR_CODES[number];
export type RoomErrorCode = typeof ROOM_ERROR_CODES[number];

abstract class BaseError extends Error implements ActionErrorPayload {
  code: string;

  constructor(name: string, code: string, message: string) {
    super(message);
    this.code = code;
    this.name = name;
  }
}

export class GameError extends BaseError {
  constructor(code: GameErrorCode, message: string) {
    super("GameError", code, message);
  }
}

export class RoomError extends BaseError {
  constructor(code: RoomErrorCode, message: string) {
    super("RoomError", code, message);
  }
}