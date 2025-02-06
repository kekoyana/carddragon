import { Monster, Card, MapCell, CellColor, CellEvent } from './types';
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

const getRandomEvent = (color: CellColor): CellEvent => {
  const random = Math.random();
  let probabilitySum = 0;

  // 青マスの場合は良いイベントの確率を上げる
  if (color === 'blue') {
    // 宿屋
    probabilitySum += CELL_EVENTS.INN.PROBABILITY * 1.5;
    if (random < probabilitySum) {
      return { type: 'inn', value: CELL_EVENTS.INN.HEAL_AMOUNT };
    }

    // 宝箱
    probabilitySum += CELL_EVENTS.TREASURE.PROBABILITY * 1.5;
    if (random < probabilitySum) {
      return { type: 'treasure' };
    }

    // 村人
    probabilitySum += CELL_EVENTS.VILLAGE.PROBABILITY * 1.5;
    if (random < probabilitySum) {
      return { type: 'village', value: CELL_EVENTS.VILLAGE.EXP_GAIN };
    }

    // 馬車
    if (random < probabilitySum + CELL_EVENTS.CARRIAGE.PROBABILITY * 1.5) {
      return { type: 'carriage', value: CELL_EVENTS.CARRIAGE.MOVE_FORWARD };
    }
  }
  // 赤マスの場合は悪いイベントの確率を上げる
  else if (color === 'red') {
    // 落とし穴
    probabilitySum += CELL_EVENTS.TRAP.PROBABILITY * 1.5;
    if (random < probabilitySum) {
      return { type: 'trap', value: CELL_EVENTS.TRAP.DAMAGE };
    }

    // 回り道
    probabilitySum += CELL_EVENTS.DETOUR.PROBABILITY * 1.5;
    if (random < probabilitySum) {
      return { type: 'detour', value: CELL_EVENTS.DETOUR.MOVE_BACK };
    }

    // モンスター
    if (random < probabilitySum + GAME_CONFIG.MONSTER_SPAWN_RATE * 1.5) {
      return { type: 'monster' };
    }
  }
  // 通常マスの場合は標準の確率でイベントを設定
  else {
    if (random < CELL_EVENTS.INN.PROBABILITY) {
      return { type: 'inn', value: CELL_EVENTS.INN.HEAL_AMOUNT };
    }
    if (random < probabilitySum + CELL_EVENTS.TRAP.PROBABILITY) {
      return { type: 'trap', value: CELL_EVENTS.TRAP.DAMAGE };
    }
    if (random < probabilitySum + CELL_EVENTS.TREASURE.PROBABILITY) {
      return { type: 'treasure' };
    }
    if (random < probabilitySum + CELL_EVENTS.CARRIAGE.PROBABILITY) {
      return { type: 'carriage', value: CELL_EVENTS.CARRIAGE.MOVE_FORWARD };
    }
    if (random < probabilitySum + CELL_EVENTS.DETOUR.PROBABILITY) {
      return { type: 'detour', value: CELL_EVENTS.DETOUR.MOVE_BACK };
    }
    if (random < probabilitySum + CELL_EVENTS.VILLAGE.PROBABILITY) {
      return { type: 'village', value: CELL_EVENTS.VILLAGE.EXP_GAIN };
    }
    if (random < probabilitySum + GAME_CONFIG.MONSTER_SPAWN_RATE) {
      return { type: 'monster' };
    }
  }

  return { type: null };
};

export const generateMap = (): MapCell[] => {
  const map = [];
  for (let i = 0; i <= GAME_CONFIG.GOAL_POSITION; i++) {
    const color = getRandomCellColor();
    const event = getRandomEvent(color);
    map.push({
      position: i,
      hasMonster: event.type === 'monster',
      color,
      event
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