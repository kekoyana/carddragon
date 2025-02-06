export interface Monster {
  name: string;
  hp: number;
  attack: number;
  defense: number;
  isBoss?: boolean;
  exp?: number;
}

export type Card = number | string | { type: string; power: number } | null;

export type CellColor = 'blue' | 'normal' | 'red';

export type CellEvent = {
  type: 'inn' | 'trap' | 'treasure' | 'carriage' | 'detour' | 'village' | 'monster' | null;
  value?: number; // 回復量、ダメージ量、経験値、移動マス数など
};

export interface MapCell {
  position: number;
  hasMonster: boolean;
  color: CellColor;
  event: CellEvent;
}