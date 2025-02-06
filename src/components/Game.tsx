import styles from './Game.module.css';
import { useGame } from '../hooks/useGame';
import { Card, MapCell } from '../types';
import { GAME_CONFIG } from '../gameData';
import { getWeaponName } from '../gameUtils';

const Game = () => {
  const {
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
    inBattle,
    currentMonster,
    battleMessage,
    isDiscardMode,
    playCard,
    attackMonster,
    runAway,
    startGame,
    getNextCells,
    setIsDiscardMode,
    getRequiredExp,
  } = useGame();

  const renderCard = (card: Card) => {
    if (card === null) return '';
    if (typeof card === 'object') {
      return <span>⚔️ {getWeaponName(card.power)}</span>;
    }
    if (card === 'H') return <span>🧪 ポーション</span>;
    if (card === 'H+') return <span>🧪 ポーション+</span>;
    return <span>👣 {card}マス進む</span>;
  };

  const renderCell = (cell: MapCell, isCurrent: boolean) => (
    <div 
      className={`${styles.cell} ${styles[cell.color]} ${isCurrent ? styles.current : ''}`}
      data-event={cell.event.type}
    >
      {cell.position}
    </div>
  );

  return (
    <div className={styles.game}>
      <div className={styles.status}>
        <div className={styles.statusInfo}>
          <p>現在位置: {position}マス目 / ゴール: {GAME_CONFIG.GOAL_POSITION}マス目</p>
          <p>Level: {level} (次のレベルまで: {getRequiredExp(level) - exp}exp)</p>
          <p>HP: {hp}/{maxHp}</p>
          <p>攻撃力: {attack}</p>
          <p>ターン数: {turns}</p>
        </div>

        <div className={styles.monsterArea}>
          {currentMonster && (
            <div className={styles.monsterStatus}>
              戦闘中のモンスター: {currentMonster.name} (HP: {currentMonster.hp})
            </div>
          )}
        </div>

        <div className={styles.nextCells}>
          <div className={styles.cellContainer}>
            {getNextCells().map((cell, i) => renderCell(cell, i === 0))}
          </div>
        </div>
      </div>

      <div className={styles.message}>
        <div className={styles.battleMessage}>
          {battleMessage.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
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
                card === 'H' ? styles.healButton :
                card === 'H+' ? styles.healPlus :
                typeof card === 'object' ? styles.weaponButton :
                card !== null ? styles.moveButton : ''
              } ${isDiscardMode && card !== null ? styles.discardModeCard : ''}`}
            >
              {renderCard(card)}
            </button>
          ))}
        </div>

        {inBattle && currentMonster && !isDiscardMode && (
          <div className={styles.battleActions}>
            <button
              className={styles.battleActionButton}
              onClick={() => attackMonster()}
              disabled={gameOver}
            >
              攻撃
            </button>
            <button
              className={styles.battleActionButton}
              onClick={runAway}
              disabled={gameOver}
            >
              逃げる
            </button>
          </div>
        )}

        <div className={styles.discardAction}>
          <button
            className={`${styles.discardActionButton} ${isDiscardMode ? styles.cancelButton : ''}`}
            onClick={() => setIsDiscardMode(!isDiscardMode)}
            disabled={gameOver}
          >
            {isDiscardMode ? 'キャンセル' : 'カードを捨てる'}
          </button>
        </div>
      </div>

      {gameOver && (
        <div className={styles.gameOver}>
          {victory ? (
            <>
              <p>ゲームクリア！</p>
              <p>ゴールまで{turns}ターンかかりました！</p>
            </>
          ) : (
            <>
              <p>ゲームオーバー</p>
              <p>HPが0になりました...</p>
            </>
          )}
          <button 
            className={styles.button}
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
