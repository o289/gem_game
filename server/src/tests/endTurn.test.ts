import { endTurn, isGameEnded, getWinner } from "../game/actions/endTurn";
import { createTestGameState } from "./helpers/createTestGameState";

describe("endTurn", () => {

  test("turn moves to next player", () => {

    const { gameState, players } = createTestGameState(2);

    expect(gameState.currentPlayer).toBe(players[0]);

    endTurn(gameState, players[0]);

    expect(gameState.currentPlayer).toBe(players[1]);

    expect(gameState.turn).toBe(1);

  });


  test("turn wraps to first player", () => {

    const { gameState, players } = createTestGameState(2);

    endTurn(gameState, players[0]);

    endTurn(gameState, players[1]);

    expect(gameState.currentPlayer).toBe(players[0]);

  });


  test("roundEndTriggered when point >= 15", () => {

    const { gameState, players } = createTestGameState(2);

    const player = gameState.players[0];

    player.point = 15;

    endTurn(gameState, players[0]);

    expect(gameState.roundEndTriggered).toBe(true);

  });


  test("game ends when round returns to start player", () => {

    const { gameState, players } = createTestGameState(2);

    gameState.players[0].point = 15;

    endTurn(gameState, players[0]);

    expect(gameState.roundEndTriggered).toBe(true);

    endTurn(gameState, players[1]);

    const ended = isGameEnded(gameState);

    expect(ended).toBe(true);

  });


  test("getWinner returns highest point player", () => {

    const { gameState, players } = createTestGameState(2);

    gameState.players[0].point = 10;
    gameState.players[1].point = 15;

    const winner = getWinner(gameState);

    expect(winner.id).toBe(players[1]);

  });


  test("should throw if player does not exist", () => {

    const { gameState } = createTestGameState(1);

    expect(() => endTurn(gameState, "unknown")).toThrow("PLAYER_NOT_FOUND");

  });

});