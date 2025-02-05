export interface Monster {
  name: string;
  hp: number;
  attack: number;
  defense: number;
  isBoss?: boolean;
  exp?: number;
}

export type Card = number | string | { type: string; power: number } | null;

export interface MapCell {
  position: number;
  hasMonster: boolean;
}