import { useState, useEffect } from 'react';
import { Monster, Card, MapCell, CellEventResult } from '../types';
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
  getWeaponName,
  getRandomEventForCell
} from '../gameUtils';
import styles from '../components/Game.module.css';

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
      setBattleMessage("モンスターに敗北しました！");
      triggerGameOverAnimation(); // アニメーションを呼び出す
      playGameOverSound(); // 効果音を再生する
      setGameOver(true);
      setVictory(false);
      return true;
    }
    return false;
  };

  // アニメーション関数
  const triggerGameOverAnimation = () => {
    // オーバーレイ要素の作成
    const overlay = document.createElement('div');
    overlay.className = `${styles['game-over-overlay']}`;
    document.body.appendChild(overlay);

    // メッセージの追加
    const message = document.createElement('div');
    message.style.display = 'flex';
    message.style.flexDirection = 'column';
    message.style.alignItems = 'center';
    message.style.gap = '1rem';

    const gameOverText = document.createElement('div');
    gameOverText.textContent = 'ゲームオーバー';
    gameOverText.style.fontSize = '3rem';
    gameOverText.style.color = '#ff3b30';
    gameOverText.style.fontWeight = 'bold';
    gameOverText.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
    message.appendChild(gameOverText);

    const subText = document.createElement('div');
    subText.textContent = 'HPが0になりました...';
    subText.style.fontSize = '1.5rem';
    subText.style.color = 'white';
    subText.style.opacity = '0.8';
    message.appendChild(subText);

    // テキストのアニメーション
    gameOverText.style.animation = 'fadeInDown 0.5s ease-out';
    subText.style.animation = 'fadeIn 0.5s ease-out 0.3s forwards';
    subText.style.opacity = '0';

    // アニメーションのスタイル定義
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 0.8; }
      }
    `;
    document.head.appendChild(style);
    overlay.appendChild(message);

    // スタイルを直接設定して確実に表示されるようにする
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9999';

    // アニメーション開始（即座にアクティブ化）
    requestAnimationFrame(() => {
        overlay.classList.add(`${styles['active']}`);
    });

    // 3秒後にフェードアウト
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        if (overlay.parentNode) {
          document.body.removeChild(overlay);
        }
      }, 500);
    }, 3000);
  };

  // 効果音関数
  const playGameOverSound = () => {
      const audio = new Audio('/path/to/game-over-sound.mp3'); // 効果音のパスを指定
      audio.play();
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
  };

  // 待機処理
  const handleWait = () => {
    if (gameOver) return;
    const card = drawOneCard();
    setBattleMessage(`カードを発掘して${getCardDescription(card)}を見つけた！`);
    turnEnd();
  };

  // 経験値を加算してレベルアップをチェックする関数
  const addExp = (amount: number, initialMessage?: string) => {
    let newExp = exp + amount;
    let currentLevel = level;
    let message = initialMessage || '';

    // レベルアップ可能な限り繰り返す
    while (newExp >= getRequiredExp(currentLevel)) {
      const nextLevel = currentLevel + 1;
      const requiredExp = getRequiredExp(currentLevel);
      newExp -= requiredExp;
      currentLevel = nextLevel;
      message += `\nレベルアップ！ Level ${currentLevel - 1} → ${currentLevel}`;
    }

    // レベルが上がっている場合はステータスを更新
    if (currentLevel > level) {
      const levelDiff = currentLevel - level;
      setLevel(currentLevel);
      setMaxHp(prev => prev + LEVEL_UP_STATS.HP * levelDiff);
      setHp(prev => prev + LEVEL_UP_STATS.HP * levelDiff);
      setAttack(prev => prev + LEVEL_UP_STATS.ATTACK * levelDiff);
    }

    // 経験値を設定
    setExp(newExp);

    // メッセージを設定（初期メッセージがある場合は、その後にレベルアップメッセージを追加）
    if (message) {
      setBattleMessage(prev => prev + message);
    }
  };

  // イベント処理
  const handleCellEvent = (position: number): string => {
    const cell = mapData[position];
    const event: CellEventResult = getRandomEventForCell(cell.color);
    let message = '';

    if (!event.type) return message;

    switch (event.type) {
      case 'inn': {
        const healAmount = maxHp; // Set healAmount to maxHp for full restoration
        setHp(prev => Math.min(maxHp, prev + healAmount));
        message = `宿屋で休んで${healAmount}回復した！`;
        break;
      }
      case 'trap': {
        const damage = event.value ?? 2;
        setHp(prev => Math.max(0, prev - damage));
        message = `落とし穴に落ちて${damage}ダメージを受けた！`;
        break;
      }
      case 'treasure': {
        const randomCard = drawOneCard();
        if (event.doubleDraw) {
          const secondCard = drawOneCard(); // 2枚目のカードを引く
          message = `宝箱を見つけた！${getCardDescription(randomCard)}と${getCardDescription(secondCard)}を手に入れた！`;
        } else {
          message = `宝箱を見つけた！${getCardDescription(randomCard)}を手に入れた！`;
        }
        break;
      }
      case 'carriage': {
        const steps = event.value ?? 3;
        message = `馬車に乗って${steps}マス進みます！`;
        setTimeout(() => {
          setPosition(prev => Math.min(GAME_CONFIG.GOAL_POSITION, prev + steps));
          setBattleMessage(prev => `${prev}\n${steps}マス進みました！`);
        }, 1000);
        break;
      }
      case 'detour': {
        const backSteps = event.value ?? 2;
        message = `回り道で${backSteps}マス戻ります...`;
        setTimeout(() => {
          setPosition(prev => Math.max(0, prev - backSteps));
          setBattleMessage(prev => `${prev}\n${backSteps}マス戻りました...`);
        }, 1000);
        break;
      }
      case 'village': {
        const expGain = event.value ?? 5; // 経験値を5に設定
        const expMessage = `村人から歓迎され${expGain}の経験値を得た！`;
        addExp(expGain, expMessage);
        message = '';
        break;
      }
      case 'monster': {
        const monster = getRandomMonster();
        setCurrentMonster(monster);
        setInBattle(true);
        message = `${monster.name}が現れた！`;
        break;
      }
    }
    return message;
  };

  // ダメージにゆらぎを追加する
  const addDamageVariation = (baseDamage: number): number => {
    const variation = 0.2; // ±20%の変動
    const randomFactor = 1 + (Math.random() * variation * 2 - variation);
    return Math.round(baseDamage * randomFactor);
  };

  // ダメージ計算
  const calculateDamage = (attacker: 'player' | 'monster', weaponPower: number = 0) => {
    if (!currentMonster) return 0;
    
    if (attacker === 'player') {
      const baseDamage = Math.max(1, attack + weaponPower - currentMonster.defense);
      return addDamageVariation(baseDamage);
    } else {
      const baseDamage = Math.max(0, currentMonster.attack - 1);
      return addDamageVariation(baseDamage);
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
        setBattleMessage(`${message}\n\n伝説のドラゴンを討伐！\n君は真の英雄となった！\n世界に平和が訪れた！`);
        triggerGameOverAnimation();
        playGameOverSound();
        return;
      }

      if (monsterExp > 0) {
        const expMessage = `${message}\n${monsterExp}の経験値を獲得！`;
        addExp(monsterExp, expMessage);
      } else {
        setBattleMessage(message);
      }
      setInBattle(false);
      setCurrentMonster(null);
      const card = drawOneCard(); // モンスターを倒したときにカードを引く
      setBattleMessage(prev => `${prev}\n戦利品として${getCardDescription(card)}を手に入れた！`);
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

    const eventMessage = handleCellEvent(newPosition);
    if (eventMessage) {
      setBattleMessage(eventMessage);
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
    const discardedCard = cards[index];
    removeCard(index);
    const newCard = drawOneCard(); // カードを捨てたときにカードを引く
    setBattleMessage(`${getCardDescription(discardedCard)}を${getCardDescription(newCard)}に交換した！`);
    turnEnd();
    setIsDiscardMode(false);
  };

  // カードの説明を取得
  const getCardDescription = (card: Card): string => {
    if (card === null) return '';
    if (typeof card === 'object' && card.type === 'weapon') {
      return getWeaponName(card.power);
    }
    if (card === 'H') return 'ポーション';
    if (card === 'H+') return 'ポーション+';
    return `${card}マス進むカード`;
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
    setInBattle(false);
    setIsDiscardMode(false);
    drawInitialCards();
  };

  // マップ全体を返す
  const getNextCells = () => {
    return mapData;
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
    handleWait,
  };
};
