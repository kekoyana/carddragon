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

export type EventType = 'inn' | 'trap' | 'treasure' | 'carriage' | 'detour' | 'village' | 'monster' | null;

// 効果値の範囲を表す型
export type Range = {
  MIN: number;
  MAX: number;
};

export type CellEventCategory = 'GOOD' | 'BAD';

export interface CellEventResult {
  type: EventType;
  value?: number;
  doubleDraw?: boolean;  // 2枚ドローするかどうか
}

export interface MapCell {
  position: number;
  color: CellColor;
}