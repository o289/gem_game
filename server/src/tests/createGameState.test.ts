import { createTestGameState } from "./helpers/createTestGameState";

describe("createGameState", () => {

  test("initial state is correct", () => {
    const { gameState, players } = createTestGameState(3);

    expect(gameState.players.length).toBe(players.length);

    expect(gameState.players[0].tokens.diamond).toBe(0);
    expect(gameState.players[0].point).toBe(0);

    expect(gameState.tokenPool.gold).toBe(5);

    expect(gameState.decks.level1.length).toBeGreaterThan(0);
   
    expect(gameState.market.level1.length).toBe(4);
    expect(gameState.market.level2.length).toBe(4);
    expect(gameState.market.level3.length).toBe(4);

    expect(
      gameState.decks.level1.length +
      gameState.market.level1.length
    ).toBe(40);
    expect(
      gameState.decks.level2.length +
      gameState.market.level2.length
    ).toBe(30);
    expect(
      gameState.decks.level3.length +
      gameState.market.level3.length
    ).toBe(20);

    expect(gameState.nobles.length).toBe(players.length + 1);

    expect(gameState.currentPlayer).toBe("p1");
    expect(gameState.turn).toBe(1);

  });

});