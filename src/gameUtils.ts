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
  const random = Math.random();
  const events = CELL_EVENTS[color];
  
  // イベントタイプの抽選（良いイベントか悪いイベントか）
  const isGoodEvent = random < (color === 'blue' ? 0.8 : color === 'red' ? 0.2 : 0.5);
  const eventCategory = isGoodEvent ? 'GOOD' : 'BAD';
  const eventList = events[eventCategory];

  // イベントの抽選
  let currentProb = 0;
  const eventRoll = Math.random();

  for (const [eventType, eventData] of Object.entries(eventList)) {
    currentProb += eventData.PROBABILITY;
    if (eventRoll < currentProb) {
      switch (eventType) {
        case 'INN':
          return { type: 'inn', value: eventData.HEAL_AMOUNT };
        case 'TRAP':
          return { type: 'trap', value: eventData.DAMAGE };
        case 'TREASURE':
          // 青マスでの宝箱イベントで2枚ドローの判定を行う
          const isDoubleDraw = color === 'blue' &&
            eventList.TREASURE.DOUBLE_DRAW_CHANCE &&
            Math.random() < eventList.TREASURE.DOUBLE_DRAW_CHANCE;
          return { type: 'treasure', doubleDraw: isDoubleDraw };
        case 'CARRIAGE':
          return { type: 'carriage', value: eventData.MOVE_FORWARD };
        case 'DETOUR':
          return { type: 'detour', value: eventData.MOVE_BACK };
        case 'VILLAGE':
          return { type: 'village', value: eventData.EXP_GAIN };
      }
    }
  }

  // モンスター出現判定
  if (Math.random() < GAME_CONFIG.MONSTER_SPAWN_RATE * (color === 'red' ? 2.5 : 1)) {
    return { type: 'monster' };
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