export const GAME_ERROR_CODES = [
  "INVALID_TOKEN_SELECTION",
  "TOKENS_MUST_BE_DIFFERENT",
  "TOKEN_NOT_AVAILABLE",
  "TOKEN_LIMIT_EXCEEDED",
  "NOT_ENOUGH_TOKENS",
  "CANNOT_BUY_CARD",
  "CARD_NOT_FOUND",
  "RESERVE_LIMIT_REACHED",
] as const;

export const ROOM_ERROR_CODES = [
  "ROOM_NOT_FOUND",
  "PLAYER_NOT_FOUND",
  "ROOM_FULL",
  "ROOM_ALREADY_EXISTS",
  "GAME_ALREADY_STARTED",
  "NOT_ENOUGH_PLAYERS",
  "GAME_NOT_STARTED",
] as const;

export function isRoomError(code: string): code is typeof ROOM_ERROR_CODES[number] {
  return (ROOM_ERROR_CODES as readonly string[]).includes(code);
}

export function isGameError(code: string): code is typeof GAME_ERROR_CODES[number] {
  return (GAME_ERROR_CODES as readonly string[]).includes(code);
}
