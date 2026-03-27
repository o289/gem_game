import { Color } from "shared/types";
import { Noble, NobleRequirement } from "shared/types";

const COLORS: Color[] = [
  "diamond",
  "ruby",
  "emerald",
  "sapphire",
  "onyx"
];

function uuid() {
  return Math.random().toString(36).substring(2, 10);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

function pickColors(count: number): Color[] {
  return shuffle(COLORS).slice(0, count);
}

function generateImagePath(): string {
  const num = randomInt(1, 12)
  return `img/nobles/noble_${num}.jpg`
}

function generateSingleNoble(): Noble {
  const selected = pickColors(3);

  const requirement: NobleRequirement = {
    diamond: 0,
    ruby: 0,
    emerald: 0,
    sapphire: 0,
    onyx: 0
  };

  for (const c of selected) {
    requirement[c] = 3; // Splendor基本：各色3
  }

  return {
    id: uuid(),
    requirement,
    point: 3,
    image: generateImagePath()
  };
}

export function generateNobles(playerCount: number): Noble[] {

  const totalPool = 10; // 元ゲームと同じ総数

  const pool: Noble[] = [];

  while (pool.length < totalPool) {
    pool.push(generateSingleNoble());
  }

  const needed = playerCount + 1;

  return shuffle(pool).slice(0, needed);
}