import { useState } from 'react';

const Game = () => {
  const [position, setPosition] = useState(0); // 現在位置
  const [cards, setCards] = useState<number[]>([]); // 手札
  const [turns, setTurns] = useState(0); // ターン数
  const [gameOver, setGameOver] = useState(false); // ゲーム終了フラグ

  // ゲーム開始
  const startGame = () => {
    setPosition(0);
    setTurns(0);
    setGameOver(false);
    drawCards();
  };

  // カードを引く
  const drawCards = () => {
    const newCards = [];
    for (let i = 0; i < 3; i++) {
      newCards.push(Math.floor(Math.random() * 6) + 1);
    }
    setCards(newCards);
  };

  // カードを使用
  const playCard = (card: number) => {
    if (gameOver) return;
    
    // 移動
    setPosition(prev => prev + card);
    setTurns(prev => prev + 1);
    
    // ゴール判定
    if (position + card >= 20) {
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
        <p>現在位置: {position}</p>
        <p>ターン数: {turns}</p>
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
          <h2>ゲームクリア！</h2>
          <p>ゴールまで{turns}ターンかかりました！</p>
          <button onClick={startGame}>もう一度遊ぶ</button>
        </div>
      )}
    </div>
  );
};

export default Game;
