import { useState } from 'react';
import styles from './Game.module.css';

// モンスターインターフェース
interface Monster {
  name: string;
  hp: number;
  attack: number;
  defense: number;
  isBoss?: boolean;
}

// モンスターデータ
const MONSTERS: Monster[] = [
  { name: 'スライム', hp: 3, attack: 1, defense: 0 },
  { name: 'ゴブリン', hp: 5, attack: 2, defense: 1 },
  { name: 'オーク', hp: 8, attack: 3, defense: 2 },
  { name: 'ドラゴン', hp: 15, attack: 5, defense: 4, isBoss: true }
];

// ランダムなモンスターを取得
const getRandomMonster = (): Monster => {
  // 80%で通常モンスター、20%でボス
  const isBoss = Math.random() < 0.2;
  const availableMonsters = isBoss 
    ? MONSTERS.filter(m => m.isBoss)
    : MONSTERS.filter(m => !m.isBoss);
  
  return availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
};

// マップデータを生成（51マス：0-50）
const generateMap = () => {
  const map = [];
  for (let i = 0; i <= 50; i++) {
    map.push({
      position: i,
      hasMonster: i > 0 && Math.random() < 0.8 // 80%の確率でモンスターマス（0番目はスタート地点なのでなし）
    });
  }
  return map;
};

const Game = () => {
  const [position, setPosition] = useState(0); // 現在位置
  const [cards, setCards] = useState<(number | string)[]>([1, 2, 3]); // 手札（初期値）
  const [turns, setTurns] = useState(0); // ターン数
  const [hp, setHp] = useState(10); // HP
  const [gameOver, setGameOver] = useState(false); // ゲーム終了フラグ
  const [mapData, setMapData] = useState(generateMap()); // マップデータ
  const [goal, setGoal] = useState(50); // ゴール位置（50番目）
  const [currentDamage, setCurrentDamage] = useState(0); // 現在のダメージ
  const [inBattle, setInBattle] = useState(false); // 戦闘中フラグ
  const [currentMonster, setCurrentMonster] = useState<Monster | null>(null); // 現在のモンスター
  const [battleLog, setBattleLog] = useState<string[]>([]); // 戦闘ログ

  // ゲーム開始
  const startGame = () => {
    setPosition(0);
    setTurns(0);
    setHp(10);
    setGameOver(false);
    drawCards();
    setGoal(50);
    setMapData(generateMap());
  };

  // 1枚のカードを引く
  const drawCard = () => {
    // 20%の確率で回復カード、80%で通常カード
    if (Math.random() < 0.2) {
      return 'H';
    }
    return Math.floor(Math.random() * 6) + 1;
  };

  // カードを引く
  const drawCards = () => {
    const newCards = [];
    for (let i = 0; i < 3; i++) {
      newCards.push(drawCard());
    }
    setCards(newCards);
  };

  // 6マス先までのマス状態を取得
  const getNextCells = () => {
    return mapData.slice(position, position + 7); // 現在位置を含む次の6マス（合計7マス）
  };

  // カードを使用
  const playCard = (card: number | string) => {
    if (gameOver || inBattle) return;
    
    // 移動（回復カードの場合は移動しない）
    let newPosition = position;
    if (typeof card === 'number') {
      newPosition = position + card;
      setPosition(newPosition);
    }
    // ターン数更新（移動カードまたは回復カード使用時）
    if (typeof card === 'number' || card === 'H') {
      setTurns(prev => prev + 1);
    }
    
    // 移動先のマスでモンスター遭遇
    const landedCell = mapData[newPosition];
    if (landedCell?.hasMonster) {
      const monster = getRandomMonster();
      setCurrentMonster(monster);
      setInBattle(true);
      setBattleLog([`${monster.name}が現れた！`]);
    } else {
      setCurrentDamage(0);
    }
    
    // 回復アイテム使用
    if (typeof card === 'string' && card === 'H') {
      const healAmount = 3;
      setHp(prev => Math.min(10, prev + healAmount));
      setCurrentDamage(-healAmount);
    }

    // HPチェック
    if (hp <= 1) {
      setGameOver(true);
      return;
    }

    // ゴール判定
    if (newPosition >= goal) {
      setGameOver(true);
      return;
    }

    // カードを更新
    setCards(prev => {
      const newCards = prev.filter(c => c !== card);
      while (newCards.length < 3) {
        newCards.push(drawCard());
      }
      return newCards;
    });
  };

  // 攻撃処理
  const handleAttack = () => {
    if (!currentMonster) return;
    
    // プレイヤーの攻撃
    const playerDamage = Math.max(1, 3 - currentMonster.defense);
    const newMonsterHp = currentMonster.hp - playerDamage;
    setBattleLog(prev => [
      ...prev,
      `プレイヤーの攻撃！${currentMonster.name}に${playerDamage}ダメージ！`
    ]);
    
    if (newMonsterHp <= 0) {
      setBattleLog(prev => [
        ...prev,
        `${currentMonster.name}を倒した！`
      ]);
      setInBattle(false);
      setCurrentMonster(null);
      return;
    }

    // モンスターの反撃
    const monsterDamage = Math.max(0, currentMonster.attack - 1);
    setHp(prev => Math.max(0, prev - monsterDamage));
    setBattleLog(prev => [
      ...prev,
      `${currentMonster.name}の反撃！${monsterDamage}ダメージを受けた！`
    ]);

    // HPチェック
    if (hp - monsterDamage <= 0) {
      setGameOver(true);
      return;
    }

    // モンスターのHP更新
    setCurrentMonster(prev => prev ? {
      ...prev,
      hp: newMonsterHp
    } : null);
    
    // ターン数更新
    setTurns(prev => prev + 1);
  };

  return (
    <div className={styles.game}>
      <div className={styles.leftPanel}>
        <div className={styles.status}>
          <p>現在位置: {position}マス目 / ゴール: {goal}マス目</p>
          <p>HP: {hp}</p>
          <p>ターン数: {turns}</p>
          <div className={styles.nextCells}>
            <p>次の6マス:</p>
            <div className={styles.cellContainer}>
              {getNextCells().map((cell, i) => (
                <div 
                  key={i}
                  className={`${styles.cell} ${
                    cell.hasMonster ? styles.monsterCell : ''
                  } ${i === 0 ? styles.currentCell : ''}`}
                >
                  {cell.position}
                </div>
              ))}
              {currentDamage !== 0 && (
                <div className={`${styles.damageDisplay} ${
                  currentDamage > 0 ? styles.damage : styles.heal
                }`}>
                  {currentDamage > 0 ? `-${currentDamage}ダメージ！` : `+${-currentDamage}回復！`}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.message}>
          {inBattle && currentMonster && (
            <>
              <div className={styles.monsterInfo}>
                <p>{currentMonster.name} (HP: {currentMonster.hp})</p>
              </div>
              <div className={styles.battleLog}>
                {battleLog.map((log, i) => (
                  <p key={i}>{log}</p>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className={styles.action}>
        <div className={styles.cards}>
          {cards.map((card, i) => (
            <button 
              key={i}
              onClick={() => playCard(card)}
              disabled={gameOver}
              className={`${styles.cardButton} ${
                card === 'H' ? styles.healButton : ''
              } ${gameOver ? styles.disabledButton : ''}`}
            >
              {card === 'H' ? '回復' : card}
            </button>
          ))}
        </div>
        
        {inBattle && currentMonster && (
          <div className={styles.battleActions}>
            <button 
              className={styles.battleActionButton}
              onClick={handleAttack}
            >
              攻撃
            </button>
          </div>
        )}
      </div>
      
      {gameOver && (
        <div className={styles.gameOver}>
          {hp <= 0 ? (
            <>
              <h2>ゲームオーバー</h2>
              <p>HPが0になりました...</p>
            </>
          ) : (
            <>
              <h2>ゲームクリア！</h2>
              <p>ゴールまで{turns}ターンかかりました！</p>
            </>
          )}
          <button 
            className={styles.cardButton}
            onClick={startGame}
          >
            もう一度遊ぶ
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;
