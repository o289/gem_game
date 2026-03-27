import { Color } from "./Tokens";

export type Cost = {
  emerald: number;
  diamond: number;
  sapphire: number;
  onyx: number;
  ruby: number;
};

export type Card = {
  id: string;
  level: 1 | 2 | 3;
  cost: Cost;
  bonus: Color;
  point: number;
  image: string;
};
