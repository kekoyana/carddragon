import { Monster, Card, MapCell, CellColor, CellEventResult } from './types';
import { 
  MONSTERS,
  GAME_CONFIG,
  CARD_PROBABILITY,
  WEAPON_TIERS,
  WEAPON_NAMES,
  CELL_COLOR_PROBABILITY,
  CELL_EVENTS
} from './gameData';

export const getRandomMonster = (): Monster => {
  // 通常モンスターからランダムに選択
  const index = Math.floor(Math.random() * MONSTERS.length);
  return MONSTERS[index];
};

const getRandomCellColor = (): CellColor => {
  const random = Math.random();
  if (random < CELL_COLOR_PROBABILITY.BLUE) return 'blue';
  if (random < CELL_COLOR_PROBABILITY.BLUE + CELL_COLOR_PROBABILITY.RED) return 'red';
  return 'normal';
};

export const getRandomEventForCell = (color: CellColor): CellEventResult => {
  const events = CELL_EVENTS[color];
  const isGoodEvent = Math.random() < (color === 'blue' ? 1 : color === 'red' ? 0 : 0.5);
  const eventList = events[isGoodEvent ? 'GOOD' : 'BAD'];
  
  let currentProb = 0;
  const eventRoll = Math.random();

  for (const [eventType, eventData] of Object.entries(eventList)) {
    currentProb += eventData.PROBABILITY;
    if (eventRoll < currentProb) {
      switch (eventType) {
        case 'NOTHING':
          return { type: null };
        case 'INN': {
          const healAmount = getRandomValueFromRange(eventData.HEAL_AMOUNT);
          return { type: 'inn', value: healAmount };
        }
        case 'TRAP': {
          const damage = getRandomValueFromRange(eventData.DAMAGE);
          return { type: 'trap', value: damage };
        }
        case 'TREASURE': {
          return { type: 'treasure', doubleDraw: false };
        }
        case 'TREASURE_PLUS': {
          return { type: 'treasure', doubleDraw: true };
        }
        case 'CARRIAGE': {
          const moveForward = getRandomValueFromRange(eventData.MOVE_FORWARD);
          return { type: 'carriage', value: moveForward };
        }
        case 'DETOUR': {
          const moveBack = getRandomValueFromRange(eventData.MOVE_BACK);
          return { type: 'detour', value: moveBack };
        }
        case 'MONSTER': {
          return { type: 'monster' };
        }
      }
    }
  }

  return { type: null };
};

export const generateMap = (): MapCell[] => {
  const map = [];
  for (let i = 0; i <= GAME_CONFIG.GOAL_POSITION; i++) {
    map.push({
      position: i,
      color: getRandomCellColor()
    });
  }
  return map;
};

export const getWeaponName = (power: number): string => {
  // パワーに応じた武器名を返す
  if (power <= WEAPON_TIERS.WEAK.MAX) {
    return `${WEAPON_NAMES.WEAK[power - WEAPON_TIERS.WEAK.MIN]}(${power})`;
  }
  if (power <= WEAPON_TIERS.MEDIUM.MAX) {
    return `${WEAPON_NAMES.MEDIUM[power - WEAPON_TIERS.MEDIUM.MIN]}(${power})`;
  }
  if (power <= WEAPON_TIERS.STRONG.MAX) {
    return `${WEAPON_NAMES.STRONG[power - WEAPON_TIERS.STRONG.MIN]}(${power})`;
  }
  // LEGENDARYの武器
  const legendaryIndex = Math.min(
    WEAPON_NAMES.LEGENDARY.length - 1,
    Math.floor((power - WEAPON_TIERS.LEGENDARY.MIN) / 23)
  );
  return `${WEAPON_NAMES.LEGENDARY[legendaryIndex]}(${power})`;
};

export const drawCard = (): Card => {
  const random = Math.random();
  let probability = 0;

  // 回復カード
  probability += CARD_PROBABILITY.HEAL;
  if (random < probability) return 'H';

  // 回復カード+
  probability += CARD_PROBABILITY.HEAL_PLUS;
  if (random < probability) return 'H+';

  // 武器カード
  probability += CARD_PROBABILITY.WEAPON;
  if (random < probability) {
    const weaponRoll = Math.random();
    let power: number;

    if (weaponRoll < WEAPON_TIERS.WEAK.PROBABILITY) {
      power = Math.floor(Math.random() * 
        (WEAPON_TIERS.WEAK.MAX - WEAPON_TIERS.WEAK.MIN + 1)) + 
        WEAPON_TIERS.WEAK.MIN;
    } else if (weaponRoll < WEAPON_TIERS.WEAK.PROBABILITY + WEAPON_TIERS.MEDIUM.PROBABILITY) {
      power = Math.floor(Math.random() * 
        (WEAPON_TIERS.MEDIUM.MAX - WEAPON_TIERS.MEDIUM.MIN + 1)) + 
        WEAPON_TIERS.MEDIUM.MIN;
    } else if (weaponRoll < WEAPON_TIERS.WEAK.PROBABILITY + WEAPON_TIERS.MEDIUM.PROBABILITY + WEAPON_TIERS.STRONG.PROBABILITY) {
      power = Math.floor(Math.random() * 
        (WEAPON_TIERS.STRONG.MAX - WEAPON_TIERS.STRONG.MIN + 1)) + 
        WEAPON_TIERS.STRONG.MIN;
    } else {
      power = Math.floor(Math.random() * 
        (WEAPON_TIERS.LEGENDARY.MAX - WEAPON_TIERS.LEGENDARY.MIN + 1)) + 
        WEAPON_TIERS.LEGENDARY.MIN;
    }
    return { type: 'weapon', power };
  }

  // 移動カード（1-6）
  return Math.floor(Math.random() * 6) + 1;
};

export const getRequiredExp = (currentLevel: number): number => {
  // レベル1→2は6exp（弱いモンスター2体）
  // その後は徐々に上昇（レベル2→3は8exp、レベル3→4は12exp、レベル4→5は18exp）
  return Math.floor(6 * Math.pow(1.5, currentLevel - 1));
};

// 範囲から整数の乱数を生成する関数
export const getRandomValueFromRange = (range: [number, number]): number => {
  const [min, max] = range;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};