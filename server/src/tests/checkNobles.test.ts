import { checkNobles } from "../game/actions/checkNobles";
import { createTestGameState } from "./helpers/createTestGameState";
import { Noble } from "shared/types";

function createTestNoble(): Noble {
  return {
    id: "n1",
    point: 3,
    requirement: {
      emerald: 3,
      diamond: 0,
      sapphire: 0,
      onyx: 0,
      ruby: 0
    },
    image: 'img/nobles/noble_1.jpg'
  };
}

describe("checkNobles", () => {

  test("player receives noble when requirements are met", () => {

    const noble = createTestNoble();

    const { gameState, players } = createTestGameState(1);
    gameState.nobles = [noble];

    const player = gameState.players[0];

    player.bonuses.emerald = 3;

    const result = checkNobles(gameState, {
      playerId: players[0]
    });

    expect(result?.id).toBe("n1");

    expect(player.point).toBe(3);

    expect(gameState.nobles.length).toBe(0);

  });


  test("player does not receive noble if requirements not met", () => {

    const noble = createTestNoble();

    const { gameState, players } = createTestGameState(1);
    gameState.nobles = [noble];

    const result = checkNobles(gameState, {
      playerId: players[0]
    });

    expect(result).toBeNull();

    expect(gameState.nobles.length).toBe(1);

  });


  test("only one noble is awarded even if multiple are available", () => {

    const noble1 = createTestNoble();

    const noble2: Noble = {
      id: "n2",
      point: 3,
      requirement: {
        emerald: 3,
        diamond: 0,
        sapphire: 0,
        onyx: 0,
        ruby: 0
      },
      image: 'img/nobles/noble_1.jpg'
    };

    const { gameState, players } = createTestGameState(1);
    gameState.nobles = [noble1, noble2];

    const player = gameState.players[0];

    player.bonuses.emerald = 3;

    const result = checkNobles(gameState, {
      playerId: players[0]
    });

    expect(result).not.toBeNull();

    expect(player.point).toBe(3);

    expect(gameState.nobles.length).toBe(1);

  });


  test("should throw if player does not exist", () => {

    const noble = createTestNoble();

    const { gameState } = createTestGameState(1);
    gameState.nobles = [noble];

    expect(() =>
      checkNobles(gameState, {
        playerId: "unknown"
      })
    ).toThrow("PLAYER_NOT_FOUND");

  });

});
