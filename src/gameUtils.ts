import { Monster, Card, MapCell } from './types';
import { 
  MONSTERS,
  GAME_CONFIG,
  CARD_PROBABILITY,
  WEAPON_TIERS,
  WEAPON_NAMES
} from './gameData';

export const getRandomMonster = (): Monster => {
  // 通常モンスターからランダムに選択
  const index = Math.floor(Math.random() * MONSTERS.length);
  return MONSTERS[index];
};

export const generateMap = (): MapCell[] => {
  const map = [];
  for (let i = 0; i <= GAME_CONFIG.GOAL_POSITION; i++) {
    map.push({
      position: i,
      hasMonster: i > 0 && Math.random() < GAME_CONFIG.MONSTER_SPAWN_RATE
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
  return currentLevel * 5;
};