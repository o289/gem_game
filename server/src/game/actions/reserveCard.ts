// server/src/game/actions/reserveCard.ts

import { GameState } from "shared/types";
import { GameError, RoomError } from "shared/errors/Error";


function findCardInMarket(gameState: GameState, cardId: string) {
  const levels = ["level1", "level2", "level3"] as const;

  for (const level of levels) {
    const card = gameState.market[level].find(c => c.id === cardId);

    if (card) {
      return { card, level };
    }
  }

  return null;
}

function removeCardFromMarket(gameState: GameState, cardId: string) {
  const levels = ["level1", "level2", "level3"] as const;

  for (const level of levels) {
    const index = gameState.market[level].findIndex(c => c.id === cardId);

    if (index !== -1) {
      gameState.market[level].splice(index, 1);
      return;
    }
  }
}

function refillMarket(gameState: GameState, level: "level1" | "level2" | "level3") {

  const deck = gameState.decks[level];

  if (deck.length === 0) {
    return;
  }

  const newCard = deck.shift();

  if (!newCard) {
    return;
  }

  gameState.market[level].push(newCard);
}

function getPlayerOrThrow(gameState: GameState, playerId: string) {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) {
    throw new RoomError("PLAYER_NOT_FOUND", "プレイヤーが見つかりません");
  }
  return player;
}

function validateReserveLimit(player: { reservedCards: any[] }) {
  if (player.reservedCards.length >= 3) {
    throw new GameError("RESERVE_LIMIT_REACHED", "予約カードは最大3枚までです");
  }
}

function giveGoldIfAvailable(gameState: GameState, player: any) {
  if (gameState.tokenPool.gold > 0) {
    gameState.tokenPool.gold--;
    player.tokens.gold++;
  }
}


// *** マーケットから予約 ***

type Params = {
  playerId: string;
  cardId: string;
};

export function reserveCard(
  gameState: GameState,
  params: Params
) {
  const { playerId, cardId } = params;

  const player = getPlayerOrThrow(gameState, playerId);
  validateReserveLimit(player);

  // マーケットからカード検索
  const result = findCardInMarket(gameState, cardId);

  if (!result) {
    throw new GameError("CARD_NOT_FOUND", "カードが見つかりません");
  }

  const { card, level } = result;

  // マーケットから削除
  removeCardFromMarket(gameState, cardId);

  // 予約追加
  player.reservedCards.push(card);

  // goldトークン取得
  giveGoldIfAvailable(gameState, player);

  // マーケット補充
  refillMarket(gameState, level);

}


// 山札から予約

type DeckParams = {
  playerId: string;
  level: "level1" | "level2" | "level3";
};


export function reserveFromDeck(
  gameState: GameState,
  params: DeckParams
) {
  const { playerId, level } = params;

  const player = getPlayerOrThrow(gameState, playerId);
  validateReserveLimit(player);

  const deck = gameState.decks[level];

  if (deck.length === 0) {
    throw new GameError("DECK_EMPTY", "山札が空です");
  }

  const card = deck.shift();

  if (!card) {
    throw new GameError("DECK_EMPTY", "山札が空です");
  }

  // 予約追加
  player.reservedCards.push(card);

  // goldトークン取得
  giveGoldIfAvailable(gameState, player);
}


export function reserveCardAndReturn(
  gameState: GameState,
  params: Params
): GameState {
  reserveCard(gameState, params);
  return gameState;
}