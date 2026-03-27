import { randomUUID } from "crypto";

import { Card, Cost } from "shared/types";
import { Color } from "shared/types";

const COLORS: Color[] = [
  "diamond",
  "ruby",
  "emerald",
  "sapphire",
  "onyx"
];

function createColorCounter(): Record<Color, number> {
  return {
    diamond: 0,
    ruby: 0,
    emerald: 0,
    sapphire: 0,
    onyx: 0
  };
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomColor(): Color {
  return COLORS[randomInt(0, COLORS.length - 1)];
}

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

function generateCost(
  colorsCount: number,
  totalLimit: number
): Cost {

  if (totalLimit < colorsCount) {
    throw new Error("totalLimit must be >= colorsCount");
  }

  // ① 色をランダム選択（bonus含む）
  const shuffled = shuffle(COLORS);
  const selected = shuffled.slice(0, colorsCount);

  const cost: Cost = {
    emerald: 0,
    diamond: 0,
    sapphire: 0,
    onyx: 0,
    ruby: 0
  };

  // ② 各色に最低1配る
  for (const c of selected) {
    cost[c] = 1;
  }

  // ③ 残りをランダム分配
  let remaining = totalLimit - colorsCount;

  while (remaining > 0) {
    const c = selected[randomInt(0, selected.length - 1)];
    cost[c]++;
    remaining--;
  }

  return cost;
}

// 得点の生成
function generatePoint(baseTotal: number, basePoint: number, totalCost: number): number {
  const point = basePoint + (totalCost - baseTotal);
  return Math.max(basePoint, point);
}

function generateImagePath(color: string): string {
  const num = randomInt(1, 6)
  return `img/${color}/${color}_${num}.jpg`
}

export function generateLevel1Card(): Card {
  const bonus = randomColor();

  const baseTotal = 4;
  const basePoint = 0;

  const totalCost = randomInt(4, 5);

  const colorsCount = randomInt(2, 4);

  return {
    id: randomUUID(),
    level: 1,
    bonus,
    cost: generateCost(colorsCount, totalCost),
    point: generatePoint(baseTotal, basePoint, totalCost),
    image: generateImagePath(bonus)
  };
}

export function generateLevel2Card(): Card {
  const bonus = randomColor();

  const baseTotal = 6;
  const basePoint = 1;

  const totalCost = randomInt(5, 8);

  const colorsCount = randomInt(1,4);

  return {
    id: randomUUID(),
    level: 2,
    bonus,
    cost: generateCost(colorsCount, totalCost),
    point: generatePoint(baseTotal, basePoint, totalCost),
    image: generateImagePath(bonus)
  };
}

export function generateLevel3Card(): Card {
  const bonus = randomColor();

  const baseTotal = 11;
  const basePoint = 3;

  const totalCost = randomInt(9, 13);

  const colorsCount = randomInt(1, 4);

  return {
    id: randomUUID(),
    level: 3,
    bonus,
    cost: generateCost(colorsCount, totalCost),
    point: generatePoint(baseTotal, basePoint, totalCost),
    image: generateImagePath(bonus)
  };
}

function generateBalancedDeck(
  size: number,
  generator: () => Card
): Card[] {

  const MIN_PER_COLOR = 1;

  const bonusCount = createColorCounter();

  const deck: Card[] = [];

  let safety = 0;

  while (deck.length < size) {

    safety++;
    if (safety > 10000) {
      break;
    }

    const card = generator();

    // 最低1枚は各色確保しつつ、その後は無条件で追加
    const needsBonus = bonusCount[card.bonus] < MIN_PER_COLOR;

    if (needsBonus || deck.length >= COLORS.length) {
      deck.push(card);
      bonusCount[card.bonus]++;
    }

  }

  return shuffle(deck);

}

export function generateDecks() {

  const level1 = generateBalancedDeck(40, generateLevel1Card);

  const level2 = generateBalancedDeck(30, generateLevel2Card);

  const level3 = generateBalancedDeck(20, generateLevel3Card);

  return {
    level1,
    level2,
    level3
  };

}