import { takeDifferentTokens } from "../game/actions";
import { createTestGameState } from "./helpers/createTestGameState";


test("player takes 3 different tokens", () => {
  const { gameState, players } = createTestGameState(3);

  takeDifferentTokens(gameState, {
    playerId: players[0],
    colors: ["emerald", "diamond", "ruby"]
  });

  const player = gameState.players.find(p => p.id === players[0])!;
  
  expect(player.tokens.emerald).toBe(1);
  expect(player.tokens.diamond).toBe(1);
  expect(player.tokens.ruby).toBe(1);

  expect(gameState.tokenPool.emerald).toBe(4);
  expect(gameState.tokenPool.diamond).toBe(4);
  expect(gameState.tokenPool.ruby).toBe(4);

});