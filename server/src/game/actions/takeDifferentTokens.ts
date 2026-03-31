// server/src/game/actions/takeDifferentTokens.ts
import { GameState, Color } from "shared/types";
import { GameError, RoomError } from "shared/errors/Error"

type Params = {
  playerId: string;
  colors: Color[];
};

export function takeDifferentTokens(
  gameState: GameState,
  params: Params
) {
  const { playerId, colors } = params;

  const player = gameState.players.find(p => p.id === playerId);

  if (!player) {
    throw new RoomError("PLAYER_NOT_FOUND", "プレイヤーが見つかりません");
  }

  // 3色であること
  if (colors.length !== 3) {
    throw new GameError("INVALID_TOKEN_SELECTION", "トークンは3種類選択してください");
  }

  // 重複禁止
  const unique = new Set(colors);
  if (unique.size !== 3) {
    throw new GameError("TOKENS_MUST_BE_DIFFERENT", "異なる色のトークンを選択してください");
  }

  // トークンプール確認
  for (const color of colors) {
    if (gameState.tokenPool[color] < 1) {
      throw new GameError("TOKEN_NOT_AVAILABLE", "そのトークンは現在取得できません");
    }
  }

  // トークン10枚制限
  const tokenCount =
    Object.values(player.tokens).reduce((a, b) => a + b, 0);

  if (tokenCount + 3 > 10) {
    throw new GameError("TOKEN_LIMIT_EXCEEDED", "トークンは10枚までしか持てません");
  }

  // 実際に取得
  for (const color of colors) {
    gameState.tokenPool[color]--;
    player.tokens[color]++;
  }

}


export function takeDifferentTokensAndReturn(
  gameState: GameState,
  params: Params
): GameState {
  takeDifferentTokens(gameState, params);
  return gameState;
}


// 使い方
// import { takeDifferentTokens } from "../game/actions";

// takeDifferentTokens(gameState, {
//   playerId: payload.playerId,
//   colors: payload.colors
// });