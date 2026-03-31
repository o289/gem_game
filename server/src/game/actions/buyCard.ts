// server/src/game/actions/buyCard.ts
import { GameState, Player, Card, Color, TokenColor, TokenSet } from "shared/types";
import { GameError, RoomError } from "shared/errors/Error";


// 
function findCard(
  gameState: GameState,
  player: Player,
  cardId: string
) {
  const levels = ["level1", "level2", "level3"] as const;

  for (const level of levels) {
    const card = gameState.market[level].find(c => c.id === cardId);

    if (card) {
      return { card, source: "market", level };
    }
  }

  const reserved = player.reservedCards.find(c => c.id === cardId);

  if (reserved) {
    return { card: reserved, source: "reserved" };
  }

  return null;
}

// 
function calculatePayment(player: Player, card: Card) {

  const payment: TokenSet = {
    emerald: 0,
    diamond: 0,
    sapphire: 0,
    onyx: 0,
    ruby: 0,
    gold: 0,
  };

  const colors: Color[] = [
    "emerald",
    "diamond",
    "sapphire",
    "onyx",
    "ruby"
  ];

  for (const color of colors) {

    const cost = card.cost[color];
    const bonus = player.bonuses[color];

    let remaining = Math.max(cost - bonus, 0);

    const useToken = Math.min(player.tokens[color], remaining);

    payment[color] = useToken;

    remaining -= useToken;

    if (remaining > 0) {
      payment.gold += remaining;
    }
  }

  if (payment.gold > player.tokens.gold) {
    throw new GameError("CANNOT_BUY_CARD", "コストが足りません");
  }

  return payment;
}

// 
function applyPayment(
  gameState: GameState,
  player: Player,
  payment: TokenSet
) {

  const colors: TokenColor[] = [
    "emerald",
    "diamond",
    "sapphire",
    "onyx",
    "ruby",
    "gold"
  ] as const;

  for (const color of colors) {

    const amount = payment[color];

    if (amount <= 0) continue;

    player.tokens[color] -= amount;
    gameState.tokenPool[color] += amount;
  }
}

// 
function removeCardFromMarket(
  gameState: GameState,
  cardId: string
) {

  const levels = ["level1", "level2", "level3"] as const;

  for (const level of levels) {

    const index = gameState.market[level].findIndex(
      c => c.id === cardId
    );

    if (index !== -1) {
      gameState.market[level].splice(index, 1);
      return;
    }
  }
}

// 
function refillMarket(
  gameState: GameState,
  level: "level1" | "level2" | "level3"
) {

  const deck = gameState.decks[level];

  if (deck.length === 0) return;

  const newCard = deck.shift();

  if (!newCard) return;

  gameState.market[level].push(newCard);
}

type Params = {
  playerId: string;
  cardId: string;
};

export function buyCard(
  gameState: GameState,
  params: Params
) {
  const { playerId, cardId } = params;

  const player = gameState.players.find(p => p.id === playerId);

  if (!player) {
    throw new RoomError("PLAYER_NOT_FOUND", "プレイヤーが見つかりません");
  }

  // カード取得
  const result = findCard(gameState, player, cardId);

  if (!result) {
    throw new GameError("CARD_NOT_FOUND", "カードが見つかりません");
  }

  const { card, source, level } = result;

  // 支払い計算
  const payment = calculatePayment(player, card);

  // 支払い実行
  applyPayment(gameState, player, payment);

  // カード取得
  player.cards.push(card);

  // ボーナス追加
  player.bonuses[card.bonus]++;

  // スコア追加
  player.point += card.point;

  // カード削除
  if (source === "market") {
    removeCardFromMarket(gameState, cardId);
    refillMarket(gameState, level!);
  }

  if (source === "reserved") {
    player.reservedCards = player.reservedCards.filter(
      c => c.id !== cardId
    );
  }

}

export function buyCardAndReturn(
  gameState: GameState,
  params: Params
): GameState {
  buyCard(gameState, params);
  return gameState;
}