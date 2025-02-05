import { useState, useEffect } from 'react';
import { Monster, Card, MapCell } from '../types';
import { 
  INITIAL_STATS,
  GAME_CONFIG,
  BOSS_MONSTER,
  LEVEL_UP_STATS
} from '../gameData';
import {
  getRandomMonster,
  generateMap,
  drawCard,
  getRequiredExp,
  getWeaponName
} from '../gameUtils';

export const useGame = () => {
  const [position, setPosition] = useState<number>(0);
  const [cards, setCards] = useState<Card[]>(Array(GAME_CONFIG.INITIAL_HAND_SIZE).fill(null));
  const [turns, setTurns] = useState<number>(0);
  const [level, setLevel] = useState<number>(INITIAL_STATS.LEVEL);
  const [exp, setExp] = useState<number>(0);
  const [maxHp, setMaxHp] = useState<number>(INITIAL_STATS.MAX_HP);
  const [hp, setHp] = useState<number>(INITIAL_STATS.MAX_HP);
  const [attack, setAttack] = useState<number>(INITIAL_STATS.ATTACK);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [mapData, setMapData] = useState<MapCell[]>(generateMap());
  const [inBattle, setInBattle] = useState(false);
  const [currentMonster, setCurrentMonster] = useState<Monster | null>(null);
  const [battleMessage, setBattleMessage] = useState('');
  const [isDiscardMode, setIsDiscardMode] = useState(false);

  // HPチェックとゲームオーバー判定
  const checkGameStatus = () => {
    if (hp <= 0) {
      setGameOver(true);
      setVictory(false);
      return true;
    }
    return false;
  };

  // カードを1枚引く
  const drawOneCard = () => {
    const newCard = drawCard();
    setCards(prev => {
      const emptyIndices = prev.map((_, index) => index).filter(index => prev[index] === null);
      if (emptyIndices.length === 0) return prev;
      const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      const newCards = [...prev];
      newCards[randomIndex] = newCard;
      return newCards;
    });
    return newCard;
  };

  // 初期カードを引く
  const drawInitialCards = () => {
    for (let i = -1; i < 5; i++) {
      drawOneCard();
    }
  };

  // ターン終了処理
  const turnEnd = () => {
    if (checkGameStatus()) return;
    
    setTurns(prev => prev + 1);
    drawOneCard();
  };

  // レベルアップチェック
  const checkLevelUp = () => {
    // 現在の経験値で可能なレベルアップをすべて処理
    let currentExp = exp;
    let currentLevel = level;
    let message = '';

    while (true) {
      const requiredExp = getRequiredExp(currentLevel);
      if (currentExp >= requiredExp) {
        currentLevel++;
        currentExp -= requiredExp;
        message += `\nレベルアップ！ Level ${currentLevel - 1} → ${currentLevel}`;
      } else {
        break;
      }
    }

    // レベルが上がっていた場合、ステータスを更新
    if (currentLevel > level) {
      const levelDiff = currentLevel - level;
      setLevel(currentLevel);
      setExp(currentExp);
      setMaxHp(prev => prev + LEVEL_UP_STATS.HP * levelDiff);
      setHp(prev => prev + LEVEL_UP_STATS.HP * levelDiff);
      setAttack(prev => prev + LEVEL_UP_STATS.ATTACK * levelDiff);
      setBattleMessage(prev => prev + message);
    }
  };

  // ダメージ計算
  const calculateDamage = (attacker: 'player' | 'monster', weaponPower: number = 0) => {
    if (!currentMonster) return 0;
    
    if (attacker === 'player') {
      return Math.max(1, attack + weaponPower - currentMonster.defense);
    } else {
      return Math.max(0, currentMonster.attack - 1);
    }
  };

  // 攻撃メッセージの生成
  const getAttackMessage = (weaponPower: number, damage: number) => {
    if (!currentMonster) return '';
    
    return weaponPower > 0
      ? `プレイヤーの${getWeaponName(weaponPower)}で攻撃！${currentMonster.name}に${damage}ダメージ！`
      : `プレイヤーの攻撃！${currentMonster.name}に${damage}ダメージ！`;
  };

  // バトル結果の処理
  const processBattleResult = (message: string, newMonsterHp: number) => {
    if (!currentMonster) return;
    
    if (newMonsterHp <= 0) {
      const monsterExp = currentMonster.exp || 0;
      
      // ドラゴンを倒した場合は勝利
      if (currentMonster.isBoss) {
        setGameOver(true);
        setVictory(true);
        setBattleMessage(`${message}\nドラゴンを倒し、世界に平和が訪れた！`);
        return;
      }

      if (monsterExp > 0) {
        setExp(prev => prev + monsterExp);
        setBattleMessage(`${message}\n${monsterExp}の経験値を獲得！`);
        setTimeout(checkLevelUp, 0);
      } else {
        setBattleMessage(message);
      }
      setInBattle(false);
      setCurrentMonster(null);
    } else {
      setBattleMessage(message);
      setCurrentMonster(prev => prev ? {
        ...prev,
        hp: newMonsterHp
      } : null);
    }
  };

  // 攻撃処理
  const attackMonster = (weaponPower: number = 0) => {
    if (!currentMonster) return;

    const playerDamage = calculateDamage('player', weaponPower);
    const attackMessage = getAttackMessage(weaponPower, playerDamage);
    const newMonsterHp = currentMonster.hp - playerDamage;
    
    if (newMonsterHp <= 0) {
      processBattleResult(`${attackMessage}\n${currentMonster.name}を倒した！`, newMonsterHp);
      if (!currentMonster.isBoss) {
        turnEnd();
      }
      return;
    }

    const monsterDamage = calculateDamage('monster');
    const newHp = Math.max(0, hp - monsterDamage);
    setHp(newHp);
    
    processBattleResult(`${attackMessage}\n${currentMonster.name}の反撃！${monsterDamage}ダメージを受けた！`, newMonsterHp);
    
    if (newHp <= 0) {
      setGameOver(true);
      setVictory(false);
      return;
    }
    
    turnEnd();
  };

  // 移動処理
  const handleMovement = (steps: number) => {
    const newPosition = Math.min(GAME_CONFIG.GOAL_POSITION, position + steps);
    setPosition(newPosition);
    
    if (newPosition === GAME_CONFIG.GOAL_POSITION && !currentMonster) {
      setInBattle(true);
      setCurrentMonster(BOSS_MONSTER);
      setBattleMessage("ドラゴンが現れた！");
      return;
    }

    const landedCell = mapData[newPosition];
    if (landedCell?.hasMonster && newPosition < GAME_CONFIG.GOAL_POSITION) {
      const monster = getRandomMonster();
      setCurrentMonster(monster);
      setInBattle(true);
      setBattleMessage(`${monster.name}が現れた！`);
    }
  };

  // 回復処理
  const handleHealing = (card: string) => {
    const healAmount = card === 'H+' ? GAME_CONFIG.HEAL_PLUS_AMOUNT : GAME_CONFIG.HEAL_AMOUNT;
    setHp(prev => Math.min(maxHp, prev + healAmount));
    setBattleMessage(`+${healAmount}回復！`);
  };

  // 武器カード処理
  const handleWeaponCard = (power: number) => {
    if (!currentMonster) return false;
    attackMonster(power);
    return true;
  };

  // 逃げる処理
  const runAway = () => {
    const newPosition = Math.max(0, position - GAME_CONFIG.RUNAWAY_DISTANCE);
    setPosition(newPosition);
    setBattleMessage("逃げた！10マス後退する！");
    setInBattle(false);
    setCurrentMonster(null);
    turnEnd();
  };

  // カードを捨てる
  const handleDiscard = (index: number) => {
    if (gameOver || !cards[index]) return;
    removeCard(index);
    turnEnd();
    setIsDiscardMode(false);
  };

  // カードの削除
  const removeCard = (index: number) => {
    setCards(prev => {
      const newCards = [...prev];
      newCards[index] = null;
      return newCards;
    });
  };

  // カードを使用
  const playCard = (card: Card, index: number) => {
    if (gameOver || card === null) return;
    
    if (isDiscardMode) {
      handleDiscard(index);
      return;
    }

    if (inBattle && typeof card === 'number') return;

    let processed = true;
    
    if (typeof card === 'object' && card.type === 'weapon') {
      processed = handleWeaponCard(card.power);
    } else if (typeof card === 'number') {
      handleMovement(card);
    } else if (card === 'H' || card === 'H+') {
      handleHealing(card);
    } else {
      processed = false;
    }

    if (processed) {
      removeCard(index);
      turnEnd();
    }
  };

  // ゲーム開始・リセット
  const startGame = () => {
    setCards(Array(GAME_CONFIG.INITIAL_HAND_SIZE).fill(null));
    setCurrentMonster(null);
    setBattleMessage('');
    setPosition(0);
    setTurns(0);
    setLevel(INITIAL_STATS.LEVEL);
    setExp(0);
    setMaxHp(INITIAL_STATS.MAX_HP);
    setHp(INITIAL_STATS.MAX_HP);
    setAttack(INITIAL_STATS.ATTACK);
    setGameOver(false);
    setVictory(false);
    setMapData(generateMap());
    drawInitialCards();
  };

  // 次の6マスの状態を取得
  const getNextCells = () => {
    return mapData.slice(position, position + 7);
  };

  useEffect(() => {
    startGame();
  }, []);

  return {
    // State
    position,
    cards,
    turns,
    level,
    exp,
    maxHp,
    hp,
    attack,
    gameOver,
    victory,
    mapData,
    inBattle,
    currentMonster,
    battleMessage,
    isDiscardMode,
    
    // Actions
    playCard,
    attackMonster,
    runAway,
    startGame,
    getNextCells,
    setIsDiscardMode,
    getRequiredExp,
  };
};