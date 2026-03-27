// server/src/game/actions/checkNobles.ts
import { GameState, Noble } from "shared/types";
import { GameError } from "shared/errors/GameError";


function canVisitNoble(player: any, noble: Noble) {

  const requirement = noble.requirement;

  if (player.bonuses.emerald < requirement.emerald) return false;
  if (player.bonuses.diamond < requirement.diamond) return false;
  if (player.bonuses.sapphire < requirement.sapphire) return false;
  if (player.bonuses.onyx < requirement.onyx) return false;
  if (player.bonuses.ruby < requirement.ruby) return false;

  return true;
}


export function checkNobles(
  gameState: GameState,
  playerId: string
) {
 
  const player = gameState.players.find(p => p.id === playerId);

  if (!player) {
    throw new GameError("PLAYER_NOT_FOUND", "プレイヤーが見つかりません");
  }

  for (const noble of gameState.nobles) {

    if (canVisitNoble(player, noble)) {

      // 貴族取得
      player.point += noble.point;

      // 貴族削除
      gameState.nobles = gameState.nobles.filter(
        n => n.id !== noble.id
      );

      console.log("ノベルを獲得しました")
      return noble;
    }
  }

  return null;
}