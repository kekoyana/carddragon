import { useState } from 'react';

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
    <div className="game">
      <h1>カードドラゴンゲーム</h1>
      <div className="status">
        <p>現在位置: {position}マス目 / ゴール: {goal}マス目</p>
        <p>HP: {hp}</p>
        <p>ターン数: {turns}</p>
        <div className="next-cells">
          <p>次の6マス:</p>
          <div className="cell-container">
            {getNextCells().map((cell, i) => (
              <div 
                key={i}
                className={`cell ${cell.hasMonster ? 'monster' : ''} ${
                  i === 0 ? 'current' : ''
                }`}
              >
                {cell.position}
              </div>
            ))}
            {currentDamage !== 0 && (
              <div className={`damage-display ${currentDamage > 0 ? 'damage' : 'heal'}`}>
                {currentDamage > 0 ? `-${currentDamage}ダメージ！` : `+${-currentDamage}回復！`}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="cards">
        {cards.map((card, i) => (
          <button 
            key={i}
            onClick={() => playCard(card)}
            disabled={gameOver}
            className={card === 'H' ? 'heal' : ''}
          >
            {card === 'H' ? '回復' : card}
          </button>
        ))}
      </div>
      
      {inBattle && currentMonster && (
        <div className="battle">
          <h2>戦闘中！</h2>
          <div className="monster-info">
            <p>{currentMonster.name} (HP: {currentMonster.hp})</p>
          </div>
          <div className="battle-log">
            {battleLog.map((log, i) => (
              <p key={i}>{log}</p>
            ))}
          </div>
          <div className="battle-actions">
            <button onClick={handleAttack}>攻撃</button>
          </div>
        </div>
      )}
      
      {gameOver && (
        <div className="game-over">
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
          <button onClick={startGame}>もう一度遊ぶ</button>
        </div>
      )}
    </div>
  );
};

export default Game;

// CSSスタイル
const styles = `
.game {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.status {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.cell-container {
  display: flex;
  gap: 5px;
  margin-top: 10px;
}

.cell {
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 4px;
  text-align: center;
  min-width: 40px;
}

.cell.current {
  background: #e3f2fd;
}

.cell.monster {
  background: #ffebee;
}

.damage-display {
  margin-top: 10px;
  padding: 8px;
  border-radius: 4px;
  font-weight: bold;
}

.damage-display.damage {
  color: #c62828;
}

.damage-display.heal {
  color: #2e7d32;
}

.cards {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.cards button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background: #2196f3;
  color: white;
  cursor: pointer;
  font-size: 16px;
}

.cards button.heal {
  background: #4caf50;
}

.cards button:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
}

.battle {
  margin-top: 20px;
  padding: 20px;
  background: #fff3e0;
  border-radius: 8px;
}

.monster-info {
  margin-bottom: 15px;
  font-weight: bold;
}

.battle-log {
  max-height: 150px;
  overflow-y: auto;
  margin-bottom: 15px;
  padding: 10px;
  background: white;
  border-radius: 4px;
}

.battle-actions {
  display: flex;
  gap: 10px;
}

.battle-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background: #ff9800;
  color: white;
  cursor: pointer;
  font-size: 16px;
}

.game-over {
  margin-top: 20px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  text-align: center;
}
`;

// スタイルをドキュメントに追加
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
