import { Monster, CellColor } from './types';

// モンスターデータ
export const MONSTERS: Monster[] = [
  { name: 'スライム', hp: 3, attack: 1, defense: 0, exp: 3 },    // 経験値増加
  { name: 'ゴブリン', hp: 5, attack: 2, defense: 1, exp: 4 },    // 経験値増加
  { name: 'オーク', hp: 8, attack: 3, defense: 2, exp: 6 },
  { name: 'ワイバーン', hp: 15, attack: 5, defense: 4, exp: 10 },
  { name: 'コボルド', hp: 4, attack: 2, defense: 0, exp: 3 },    // 経験値増加
  { name: 'スケルトン', hp: 6, attack: 3, defense: 1, exp: 5 },
  { name: 'ゾンビ', hp: 10, attack: 2, defense: 2, exp: 6 },
  { name: 'ハーピー', hp: 12, attack: 4, defense: 2, exp: 8 },
  { name: 'ガーゴイル', hp: 14, attack: 4, defense: 3, exp: 9 },
  { name: 'キメラ', hp: 18, attack: 6, defense: 3, exp: 12 }
];

// ボスモンスター
export const BOSS_MONSTER: Monster = {
  name: "ドラゴン",
  hp: 80,            // HPを調整
  attack: 5,         // 攻撃力を調整
  defense: 3,
  isBoss: true
};

// カード出現確率設定
export const CARD_PROBABILITY = {
  HEAL: 0.15,        // 通常ポーション
  HEAL_PLUS: 0.05,   // 高性能ポーション
  WEAPON: 0.1,       // 武器カード
  MOVE: 0.7         // 移動カード
} as const;

// 武器の強さ設定
export const WEAPON_TIERS = {
  WEAK: {            // 40% - 弱い武器
    PROBABILITY: 0.4,
    MIN: 1,
    MAX: 2
  },
  MEDIUM: {          // 30% - 中程度の武器
    PROBABILITY: 0.3,
    MIN: 3,
    MAX: 5
  },
  STRONG: {          // 20% - 強い武器
    PROBABILITY: 0.2,
    MIN: 6,
    MAX: 9
  },
  LEGENDARY: {       // 10% - とても強い武器
    PROBABILITY: 0.1,
    MIN: 10,
    MAX: 100
  }
} as const;

// 武器の名前データ
export const WEAPON_NAMES = {
  WEAK: ['ダガー', 'ブロンズソード'],
  MEDIUM: ['バスタードソード', 'バトルアクス', 'ウォーハンマー'],
  STRONG: ['ミスリルブレード', 'フレイムソード', 'ドラゴンバスター', 'ルーンブレード'],
  LEGENDARY: ['デーモンスレイヤー', 'エクスカリバー', 'クリスタルソード', 'ラグナロク']
} as const;

// プレイヤーの初期ステータス
export const INITIAL_STATS = {
  MAX_HP: 10,
  ATTACK: 3,
  LEVEL: 1,
} as const;

// レベルアップ時のステータス上昇値
export const LEVEL_UP_STATS = {
  HP: 3,           // HPの上昇値を3に
  ATTACK: 2,       // 攻撃力の上昇値を2に
} as const;

// ゲーム設定値
export const GAME_CONFIG = {
  GOAL_POSITION: 50,
  INITIAL_HAND_SIZE: 8,
  HEAL_AMOUNT: 3,
  HEAL_PLUS_AMOUNT: 10,
  RUNAWAY_DISTANCE: 10,
  MONSTER_SPAWN_RATE: 0.4,    // モンスター出現率を上昇
} as const;

// マスの色ごとの確率設定
export const CELL_COLOR_PROBABILITY = {
  BLUE: 0.2,    // 青マス（良いイベント）を減少
  RED: 0.5,     // 赤マス（悪いイベント）を増加
  NORMAL: 0.3   // 通常マス
} as const;

// マスのイベント設定
export const CELL_EVENTS = {
  INN: {
    HEAL_AMOUNT: 5,
    PROBABILITY: 0.2
  },
  TRAP: {
    DAMAGE: 2,
    PROBABILITY: 0.03        // 落とし穴の確率を低下
  },
  TREASURE: {
    PROBABILITY: 0.15
  },
  CARRIAGE: {
    MOVE_FORWARD: 3,
    PROBABILITY: 0.05
  },
  DETOUR: {
    MOVE_BACK: 2,
    PROBABILITY: 0.03        // 戻るマスの確率を低下
  },
  VILLAGE: {
    EXP_GAIN: 2,
    PROBABILITY: 0.1
  }
} as const;