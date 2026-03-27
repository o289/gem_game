import { buyCard } from "../game/actions/buyCard";
import { Card } from "shared/types";
import { createTestGameState } from "./helpers/createTestGameState";

function createTestCard(): Card {
  return {
    id: "card1",
    level: 1,
    cost: {
      emerald: 2,
      diamond: 0,
      sapphire: 0,
      onyx: 0,
      ruby: 0
    },
    bonus: "emerald",
    point: 1
  };
}

describe("buyCard", () => {

  test("player buys card using tokens", () => {

    const { gameState, players } = createTestGameState(1);

    const player = gameState.players[0];

    const card = createTestCard();

    player.tokens.emerald = 2;

    player.reservedCards.push(card);

    buyCard(gameState, {
      playerId: players[0],
      cardId: "card1"
    });

    expect(player.cards.length).toBe(1);

    expect(player.bonuses.emerald).toBe(1);

    expect(player.tokens.emerald).toBe(0);

    expect(player.point).toBe(1);

  });


  test("player buys card using gold tokens", () => {

    const { gameState, players } = createTestGameState(1);

    const player = gameState.players[0];

    const card = createTestCard();

    player.tokens.gold = 2;

    player.reservedCards.push(card);

    buyCard(gameState, {
      playerId: players[0],
      cardId: "card1"
    });

    expect(player.cards.length).toBe(1);

    expect(player.tokens.gold).toBe(0);

  });


  test("player buys card using bonus discount", () => {

    const { gameState, players } = createTestGameState(1);

    const player = gameState.players[0];

    const card = createTestCard();

    player.bonuses.emerald = 2;

    player.reservedCards.push(card);

    buyCard(gameState, {
      playerId: players[0],
      cardId: "card1"
    });

    expect(player.cards.length).toBe(1);

    expect(player.tokens.emerald).toBe(0);

  });


  test("should throw error if player cannot afford card", () => {

    const { gameState, players } = createTestGameState(1);

    const card = createTestCard();

    const player = gameState.players[0];

    player.reservedCards.push(card);

    expect(() =>
      buyCard(gameState, {
        playerId: players[0],
        cardId: "card1"
      })
    ).toThrow("CANNOT_BUY_CARD");

  });


  test("should throw if player does not exist", () => {

    const { gameState } = createTestGameState(1);

    const card = createTestCard();

    gameState.players[0].reservedCards.push(card);

    expect(() =>
      buyCard(gameState, {
        playerId: "unknown",
        cardId: "card1"
      })
    ).toThrow("PLAYER_NOT_FOUND");

  });

});