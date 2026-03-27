export type Color =
  | "emerald"
  | "diamond"
  | "sapphire"
  | "onyx"
  | "ruby";

export type TokenColor = Color | "gold"

export type TokenSet = {
  emerald: number;
  diamond: number;
  sapphire: number;
  onyx: number;
  ruby: number;
  gold: number;
};

export type BonusSet = {
  emerald: number;
  diamond: number;
  sapphire: number;
  onyx: number;
  ruby: number;
};