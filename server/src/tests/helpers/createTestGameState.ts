import { createGameState } from "../../state";
import { createDecks } from "../../state";

export function createTestGameState(playerCount = 3) {
  const players = Array.from({ length: playerCount }, (_, i) => `p${i + 1}`);

  const { deck1, deck2, deck3, nobles } = createDecks(playerCount);

  const gameState = createGameState({
    playerIds: players,
    deck1,
    deck2,
    deck3,
    nobles
  });

  return {
    gameState,
    players
  };
}