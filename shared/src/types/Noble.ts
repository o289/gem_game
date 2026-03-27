export type NobleRequirement = {
  emerald: number;
  diamond: number;
  sapphire: number;
  onyx: number;
  ruby: number;
};

export type Noble = {
  id: string;
  requirement: NobleRequirement;
  point: number;
  image: string;
};