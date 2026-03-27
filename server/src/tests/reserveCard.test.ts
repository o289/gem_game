

import { reserveCard } from "../game/actions/reserveCard";
import { createTestGameState } from "./helpers/createTestGameState";
import { Card } from "shared/types";

function createTestCard(): Card {
  return {
    id: "card1",
    level: 1,
    cost: {
      emerald: 1,
      diamond: 0,
      sapphire: 0,
      onyx: 0,
      ruby: 0
    },
    bonus: "emerald",
    point: 0,
    image: 'img/emerald/emerald_3.jpg'
  };
}

describe("reserveCard", () => {

  test("player reserves card from market", () => {
    const card = createTestCard();
    const { gameState, players } = createTestGameState(1);
    gameState.market.level1.push(card);
    const player = gameState.players[0];
    reserveCard(gameState, {
      playerId: players[0],
      cardId: "card1"
    });
    expect(player.reservedCards.length).toBe(1);
    expect(player.reservedCards[0].id).toBe("card1");
  });


  test("player receives gold token when reserving", () => {
    const card = createTestCard();
    const { gameState, players } = createTestGameState(1);
    gameState.market.level1.push(card);
    const player = gameState.players[0];
    reserveCard(gameState, {
      playerId: players[0],
      cardId: "card1"
    });
    expect(player.tokens.gold).toBe(1);
    expect(gameState.tokenPool.gold).toBe(4);
  });


  test("reserve limit is 3 cards", () => {
    const { gameState, players } = createTestGameState(1);
    const player = gameState.players[0];
    player.reservedCards.push(createTestCard());
    player.reservedCards.push(createTestCard());
    player.reservedCards.push(createTestCard());
    const card = createTestCard();
    gameState.market.level1.push(card);
    expect(() =>
      reserveCard(gameState, {
        playerId: players[0],
        cardId: "card1"
      })
    ).toThrow("RESERVE_LIMIT_REACHED");
  });


  test("should throw if card not found", () => {
    const { gameState, players } = createTestGameState(1);
    expect(() =>
      reserveCard(gameState, {
        playerId: players[0],
        cardId: "unknown"
      })
    ).toThrow("CARD_NOT_FOUND");
  });


  test("should throw if player does not exist", () => {
    const { gameState } = createTestGameState(1);
    const card = createTestCard();
    gameState.market.level1.push(card);
    expect(() =>
      reserveCard(gameState, {
        playerId: "unknown",
        cardId: "card1"
      })
    ).toThrow("PLAYER_NOT_FOUND");
  });

});