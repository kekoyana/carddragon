import { useState, useEffect } from 'react';
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
      hasMonster: i > 0 && Math.random() < 0.3
    });
  }
  return map;
};

const Game = () => {
  useEffect(() => {
    startGame();
  }, []);
  const [position, setPosition] = useState(0); // 現在位置
  const [cards, setCards] = useState<(number | string | { type: string; power: number } | null)[]>(Array(8).fill(null)); // 手札（初期値）
  const [turns, setTurns] = useState(0); // ターン数
  const [hp, setHp] = useState(10); // HP
  const [gameOver, setGameOver] = useState(false); // ゲーム終了フラグ
  const [mapData, setMapData] = useState(generateMap()); // マップデータ
  const [goal, setGoal] = useState(50); // ゴール位置（50番目）
  const [currentDamage, setCurrentDamage] = useState(0); // 現在のダメージ
  const [inBattle, setInBattle] = useState(false); // 戦闘中フラグ
  const [currentMonster, setCurrentMonster] = useState<Monster | null>(null); // 現在のモンスター
  const [battleMessage, setBattleMessage] = useState(''); // 現在の戦闘メッセージ

  // ゲーム開始
  const startGame = async () => {
    // 過去データのリセット処理を追加
    setCards(Array(8).fill(null)); // 手札をリセット
    setCurrentMonster(null); // 現在のモンスターをリセット
    setBattleMessage(''); // 戦闘メッセージをリセット
    setPosition(0);
    setTurns(0);
    setHp(10);
    setGameOver(false);
    drawInitialCards();
    setGoal(50);
    setMapData(generateMap());
  };

  // 初期カードを5枚引く
  const drawInitialCards = () => {
    for (let i = -1; i < 6; i++) {
      drawOneCard(); // drawOneCardを5回呼び出す
    }
  };

  // カードを1枚引く（空いている手札エリアに配置）
  const drawOneCard = () => {
    const newCard = drawCard();
    setCards(prev => {
      const emptyIndices = prev.map((_, index) => index).filter(index => prev[index] === null);
      if (emptyIndices.length === 0) return prev; // 空いている手札エリアがない場合
      const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      const newCards = [...prev];
      newCards[randomIndex] = newCard; // 空いている手札エリアにカードを配置
      return newCards;
    });
    return newCard; // 新しいカードを返す
  };

  const drawCard = () => {
    // 20%の確率で回復カード、10%で武器カード、70%で通常カード
    const randomValue = Math.random();
    if (randomValue < 0.2) {
      return 'H'; // 回復カード
    } else if (randomValue < 0.3) {
      return { type: 'weapon', power: Math.floor(Math.random() * 5) + 1 }; // 武器カード
    }
    return Math.floor(Math.random() * 6) + 1; // 通常カード
  };

  // 6マス先までのマス状態を取得
  const getNextCells = () => {
    return mapData.slice(position, position + 7); // 現在位置を含む次の6マス（合計7マス）
  };

  // カードを使用
  const playCard = (card: number | string | { type: string; power: number } | null, index: number) => {
    if (gameOver || inBattle || card === null) return;
    
    // 移動（回復カードの場合は移動しない）
    let newPosition = position;
    if (typeof card === 'number') {
      newPosition = position + card;
      setPosition(newPosition);
    }
    
    // 移動先のマスでモンスター遭遇
    const landedCell = mapData[newPosition];
    if (landedCell?.hasMonster) {
      const monster = getRandomMonster();
      setCurrentMonster(monster);
      setInBattle(true);
      setBattleMessage(`${monster.name}が現れた！`);
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

    // ターン数更新
    setTurns(prev => prev + 1);
    
    // カードを削除（選択したカードのみ）
    setCards(prev => {
      const newCards = [...prev];
      newCards[index] = null;
      return newCards;
    });

    // ターン経過時に1枚のカードを引く（最大8枚まで）
    drawOneCard();
  };

  // 攻撃処理
  const handleAttack = () => {
    if (!currentMonster) return;
    
    // プレイヤーの攻撃
    const playerDamage = Math.max(1, 3 - currentMonster.defense);
    const newMonsterHp = currentMonster.hp - playerDamage;
    const attackMessage = `プレイヤーの攻撃！${currentMonster.name}に${playerDamage}ダメージ！`;
    
    if (newMonsterHp <= 0) {
      setBattleMessage(`${attackMessage}\n${currentMonster.name}を倒した！`);
      setInBattle(false);
      setCurrentMonster(null);
      return;
    }

    // モンスターの反撃
    const monsterDamage = Math.max(0, currentMonster.attack - 1);
    setHp(prev => Math.max(0, prev - monsterDamage));
    setBattleMessage(`${attackMessage}\n${currentMonster.name}の反撃！${monsterDamage}ダメージを受けた！`);

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

    // ターン経過時に1枚のカードを引く（最大8枚まで）
    drawOneCard();
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
          {currentMonster && (
            <div className={styles.monsterStatus}>
              <p>戦闘中のモンスター: {currentMonster.name} (HP: {currentMonster.hp})</p>
            </div>
          )}
        </div>

        <div className={styles.message}>
          <div className={styles.battleMessage}>
            {battleMessage.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          {gameOver && (
            <>
              {hp <= 0 ? (
                <>
                  <p className={styles.gameOverMessage}>ゲームオーバー</p>
                  <p className={styles.gameOverMessage}>HPが0になりました...</p>
                </>
              ) : (
                <>
                  <p className={styles.gameOverMessage}>ゲームクリア！</p>
                  <p className={styles.gameOverMessage}>ゴールまで{turns}ターンかかりました！</p>
                </>
              )}
              <button 
                className={styles.cardButton}
                onClick={startGame}
              >
                もう一度遊ぶ
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.action}>
        <div className={styles.cards}>
          {cards.map((card, i) => (
            <button 
              key={i}
              onClick={() => playCard(card, i)}
              disabled={gameOver || card === null}
              className={`${styles.cardButton} ${
                card === 'H' ? styles.healButton : ''
              } ${gameOver ? styles.disabledButton : ''}`}
            >
              {card === null ? '' : typeof card === 'object' ? `武器${card.power}` : card === 'H' ? '回復' : card}
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
    </div>
  );
};

export default Game;
