import { useState, useEffect } from 'react';

// マップデータを生成（51マス：0-50）
const generateMap = () => {
  const map = [];
  for (let i = 0; i <= 50; i++) {
    map.push({
      position: i,
      isDamage: i > 0 && Math.random() < 0.3 // 30%の確率でダメージマス（0番目はスタート地点なのでダメージなし）
    });
  }
  return map;
};

const Game = () => {
  const [position, setPosition] = useState(0); // 現在位置
  const [cards, setCards] = useState<number[]>([1, 2, 3]); // 手札（初期値）
  const [turns, setTurns] = useState(0); // ターン数
  const [hp, setHp] = useState(10); // HP
  const [gameOver, setGameOver] = useState(false); // ゲーム終了フラグ
  const [mapData, setMapData] = useState(generateMap()); // マップデータ
  const [goal, setGoal] = useState(50); // ゴール位置（50番目）
  const [currentDamage, setCurrentDamage] = useState(0); // 現在のダメージ

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

  // カードを引く
  const drawCards = () => {
    const newCards = [];
    for (let i = 0; i < 3; i++) {
      newCards.push(Math.floor(Math.random() * 6) + 1);
    }
    setCards(newCards);
  };

  // 6マス先までのマス状態を取得
  const getNextCells = () => {
    return mapData.slice(position, position + 7); // 現在位置を含む次の6マス（合計7マス）
  };

  // カードを使用
  const playCard = (card: number) => {
    if (gameOver) return;
    
    // 移動
    const newPosition = position + card;
    setPosition(newPosition);
    setTurns(prev => prev + 1);
    
    // 移動先のマスでダメージ処理
    const landedCell = mapData[newPosition];
    if (landedCell?.isDamage) {
      const damage = Math.floor(Math.random() * 3) + 1;
      setHp(prev => Math.max(0, prev - damage));
      setCurrentDamage(damage);
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
        newCards.push(Math.floor(Math.random() * 6) + 1);
      }
      return newCards;
    });
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
                className={`cell ${cell.isDamage ? 'damage' : ''} ${
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
          >
            {card}
          </button>
        ))}
      </div>
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
