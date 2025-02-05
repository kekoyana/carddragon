import styles from './Game.module.css';
import { useGame } from '../hooks/useGame';
import { Card } from '../types';
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
      return `⚔️ ${getWeaponName(card.power)}`;
    }
    if (card === 'H') return '🧪 ポーション';
    if (card === 'H+') return '🧪 ポーション+';
    return `👣 ${card}進む`;
  };

  return (
    <div className={styles.game}>
      <div className={styles.leftPanel}>
        <div className={styles.status}>
          <p>現在位置: {position}マス目 / ゴール: {GAME_CONFIG.GOAL_POSITION}マス目</p>
          <p>Level: {level} (次のレベルまで: {getRequiredExp(level) - exp}exp)</p>
          <p>HP: {hp}/{maxHp}</p>
          <p>攻撃力: {attack}</p>
          <p>ターン数: {turns}</p>
          <div className={styles.nextCells}>
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
              {!victory ? (
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

      <div className={`${styles.action} ${isDiscardMode ? styles.discardMode : ''}`}>
        <div className={styles.cards}>
          {cards.map((card, i) => (
            <button
              key={i}
              onClick={() => playCard(card, i)}
              disabled={gameOver || card === null}
              className={`${styles.cardButton} ${
                (card === 'H' || card === 'H+') ? styles.healButton :
                typeof card === 'number' ? styles.moveButton :
                typeof card === 'object' ? styles.weaponButton : ''
              } ${gameOver ? styles.disabledButton : ''} ${
                isDiscardMode ? styles.discardModeCard : ''
              }`}
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
    </div>
  );
};

export default Game;
