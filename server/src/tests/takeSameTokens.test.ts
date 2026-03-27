// server/src/tests/takeSameTokens.test.ts

import { takeSameTokens } from "../game/actions/takeSameTokens";
import { createTestGameState } from "./helpers/createTestGameState";

describe("takeSameTokens", () => {

  test("player successfully takes two tokens of same color", () => {

    const { gameState, players } = createTestGameState(3);

    takeSameTokens(gameState, {
      playerId: players[0],
      color: "emerald"
    });

    const player = gameState.players[0];

    expect(player.tokens.emerald).toBe(2);

    expect(gameState.tokenPool.emerald).toBe(3);

  });

  test("should throw if tokenPool has less than 4 tokens", () => {

    const { gameState, players } = createTestGameState(3);

    gameState.tokenPool.emerald = 3;

    expect(() =>
      takeSameTokens(gameState, {
        playerId: players[0],
        color: "emerald"
      })
    ).toThrow("NOT_ENOUGH_TOKENS");

  });

  test("should throw if token limit exceeded", () => {

    const { gameState, players } = createTestGameState(3);

    const player = gameState.players[0];

    player.tokens = {
      emerald: 10,
      diamond: 0,
      sapphire: 0,
      onyx: 0,
      ruby: 0,
      gold: 0
    };

    expect(() =>
      takeSameTokens(gameState, {
        playerId: players[0],
        color: "emerald"
      })
    ).toThrow("TOKEN_LIMIT_EXCEEDED");

  });

  test("should throw if player does not exist", () => {

    const { gameState } = createTestGameState(3);

    expect(() =>
      takeSameTokens(gameState, {
        playerId: "unknown",
        color: "emerald"
      })
    ).toThrow("PLAYER_NOT_FOUND");

  });

});