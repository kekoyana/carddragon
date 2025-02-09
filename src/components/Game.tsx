import { useState, useEffect } from 'react';
import styles from './Game.module.css';
import { useGame } from '../hooks/useGame';
import { Card, MapCell } from '../types';
import { GAME_CONFIG } from '../gameData';
import { getWeaponName } from '../gameUtils';

interface TutorialStep {
  message: string;
  position: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  direction: 'top' | 'bottom' | 'left' | 'right';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    message: 'マスの色によって異なるイベントが発生します。\n青マス：カードや回復などの良いイベント\n赤マス：モンスターや罠などの危険なイベント\n通常マス：ランダムなイベント',
    position: { top: '220px', left: '20px' },
    direction: 'bottom'
  },
  {
    message: '手持ちのカードを使ってマスを進みます。\n・数字のカード：指定マス進む\n・🧪のカード：HPを回復\n・⚔️のカード：武器を装備して攻撃力アップ',
    position: { bottom: '220px', left: '20px' },
    direction: 'top'
  },
  {
    message: 'モンスターと戦うときは「攻撃」か「逃げる」を選べます。\nレベルアップすると最大HPと攻撃力が上昇します！',
    position: { top: '50%', right: '20px' },
    direction: 'left'
  }
];

const Game = () => {
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

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
    handleWait,
  } = useGame();

  // ゲーム開始時にチュートリアルを表示（一度だけ）
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      localStorage.setItem('hasSeenTutorial', 'true');
    }
  }, []);

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
    >
      {cell.position}
    </div>
  );

  const getCardClass = (card: Card) => {
    if (card === null) return '';
    if (card === 'H') return styles.healButton;
    if (card === 'H+') return styles.healPlus;
    if (typeof card === 'object') return styles.weaponButton;
    return styles.moveButton;
  };

  return (
    <div className={styles.game}>
      <div className={styles.status}>
        <div className={styles.statusInfo}>
          <div>
            <p>現在位置</p>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(position / GAME_CONFIG.GOAL_POSITION) * 100}%` }}
              />
              <span>{position}マス / {GAME_CONFIG.GOAL_POSITION}マス</span>
            </div>
            <p className={styles.turns}>ターン: {turns}</p>
          </div>
          <div>
            <p>Level: {level}</p>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(exp / getRequiredExp(level)) * 100}%` }}
              />
              <span>EXP: {exp}/{getRequiredExp(level)}</span>
            </div>
          </div>
          <div>
            <p>HP</p>
            <div className={`${styles.progressBar} ${styles.hpBar} ${
              hp <= maxHp * 0.25 ? styles.hpDanger :
              hp <= maxHp * 0.5 ? styles.hpWarning : ''
            }`}>
              <div
                className={styles.progressFill}
                style={{ width: `${(hp / maxHp) * 100}%` }}
              />
              <span>{hp}/{maxHp}</span>
            </div>
            <p className={styles.attack}>攻撃力: {attack}</p>
          </div>
        </div>

        <div className={styles.monsterArea}>
          {currentMonster && (
            <div className={styles.monsterStatus}>
              <div className={styles.monsterName}>
                戦闘中のモンスター: {currentMonster.name}
              </div>
              <div className={styles.monsterHpBar}>
                <div
                  className={styles.monsterHpFill}
                  style={{ width: `${(currentMonster.hp / (currentMonster.isBoss ? 80 : 18)) * 100}%` }}
                />
                <span>HP: {currentMonster.hp}</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.nextCells}>
          <div
            className={styles.cellContainer}
            style={{
              transform: `translateX(-${position * 60}px)`,
              paddingLeft: '10px'
            }}
          >
            {getNextCells().map((cell, i) => renderCell(cell, i === position))}
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
              className={`${styles.cardButton} ${getCardClass(card)} ${
                isDiscardMode && card !== null ? styles.discardModeCard : ''
              }`}
            >
              {renderCard(card)}
            </button>
          ))}
        </div>

        <div className={styles.actionButtons}>
          <div className={styles.battleActions}>
            {inBattle && currentMonster && !isDiscardMode && (
              <>
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
              </>
            )}
          </div>

          <div className={styles.discardAction}>
            <button
              className={`${styles.discardActionButton} ${isDiscardMode ? styles.cancelButton : ''}`}
              onClick={() => setIsDiscardMode(!isDiscardMode)}
              disabled={gameOver}
            >
              {isDiscardMode ? 'キャンセル' : 'カード交換'}
            </button>
            {!inBattle && (
              <button
                className={styles.discardActionButton}
                onClick={handleWait}
                disabled={gameOver}
              >
                カード発掘
              </button>
            )}
          </div>
        </div>
      </div>

      {gameOver && (
        <div className={styles.gameOver}>
          {victory ? (
            <>
              <p>おめでとう！ドラゴンを倒して世界を救いました！</p>
              <p>クリア記録: {turns}ターン！</p>
            </>
          ) : (
            <>
              <p>ゲームオーバー</p>
              <p>HPが0になりました...</p>
            </>
          )}
          <button 
            className={styles.restartButton}
            onClick={startGame}
          >
            もう一度遊ぶ
          </button>
        </div>
      )}

      {/* チュートリアル */}
      {showTutorial && tutorialStep < TUTORIAL_STEPS.length && (
        <div
          className={`${styles.tutorial} ${styles[TUTORIAL_STEPS[tutorialStep].direction]}`}
          style={TUTORIAL_STEPS[tutorialStep].position}
        >
          {TUTORIAL_STEPS[tutorialStep].message.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
          <button
            className={styles.tutorialButton}
            onClick={() => {
              if (tutorialStep === TUTORIAL_STEPS.length - 1) {
                setShowTutorial(false);
              } else {
                setTutorialStep(step => step + 1);
              }
            }}
          >
            {tutorialStep === TUTORIAL_STEPS.length - 1 ? 'はじめる' : '次へ'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;
