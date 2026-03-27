// server/src/game/actions/endTurn.ts
import { GameState } from "shared/types";
import { GameError } from "shared/errors/GameError";

export function endTurn(
  gameState: GameState,
  playerId: string
) {

  const player = gameState.players.find(p => p.id === playerId);

  if (!player) {
    throw new GameError("PLAYER_NOT_FOUND", "プレイヤーが見つかりません");
  }

  // 勝利条件チェック
  if (player.point >= 15) {
    gameState.roundEndTriggered = true;
  }

  // 次プレイヤー
  const currentIndex = gameState.players.findIndex(
  p => p.id === gameState.currentPlayer
);

  const nextIndex =
    (currentIndex + 1) % gameState.players.length;

  // ★ここが重要
  const isLastPlayer = currentIndex === gameState.players.length - 1;

  if (isLastPlayer) {
    gameState.turn++;
  }

  gameState.currentPlayer = gameState.players[nextIndex].id;

}

export function isGameEnded(gameState: GameState): boolean {

  if (!gameState.roundEndTriggered) {
    return false;
  }

  if (gameState.currentPlayer === gameState.roundStartPlayer) {
    return true;
  }

  return false;
}

export function getWinner(gameState: GameState) {

  const players = [...gameState.players];

  players.sort((a, b) => b.point - a.point);

  return players[0];
}