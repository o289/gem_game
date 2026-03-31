import { GameState, Color } from "shared/types";
import { GameError, RoomError } from "shared/errors/Error";


type Params = {
  playerId: string;
  color: Color;
};

export function takeSameTokens(
  gameState: GameState,
  params: Params
) {
  const { playerId, color } = params;

  const player = gameState.players.find(p => p.id === playerId);

  if (!player) {
    throw new RoomError("PLAYER_NOT_FOUND", "プレイヤーが見つかりません");
  }

  // トークンプール確認
  if (gameState.tokenPool[color] < 4) {
    throw new GameError("NOT_ENOUGH_TOKENS", "同じトークンを取得するには4枚以上必要です");
  }

  // トークン10枚制限
  const tokenCount =
    Object.values(player.tokens).reduce((a, b) => a + b, 0);

  if (tokenCount + 2 > 10) {
    throw new GameError("TOKEN_LIMIT_EXCEEDED", "トークンは10枚までしか持てません");
  }

  // トークン取得
  gameState.tokenPool[color] -= 2;
  player.tokens[color] += 2;

}

export function takeSameTokensAndReturn(
  gameState: GameState,
  params: Params
): GameState {
  takeSameTokens(gameState, params);
  return gameState;
}