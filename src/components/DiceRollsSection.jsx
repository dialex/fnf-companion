import React, { useState, useEffect, useRef } from 'react';
import Icon from '@mdi/react';
import {
  mdiClover,
  mdiDice3,
  mdiDiceMultiple,
  mdiChevronDown,
  mdiChevronUp,
} from '@mdi/js';
import { i18nManager } from '../managers/i18nManager';
import DiceDisplay from './DiceDisplay';
import { createDiceRoller } from '../managers/diceRoller';

export default function DiceRollsSection({
  canTestLuck,
  onTestLuckComplete,
  gameShowManager,
  initialExpanded = true,
  onExpandedChange,
}) {
  const t = i18nManager.t.bind(i18nManager);
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [displayState, setDisplayState] = useState(
    gameShowManager
      ? gameShowManager.getDisplayState()
      : { diceRolling: null, diceResult: null }
  );
  const diceRollerRef = useRef(createDiceRoller());
  const timeoutRef = useRef(null);

  useEffect(() => {
    setIsExpanded(initialExpanded);
  }, [initialExpanded]);

  useEffect(() => {
    if (!gameShowManager) return;

    const unsubscribe = gameShowManager.subscribe((state) => {
      setDisplayState(state);
    });

    return () => {
      unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [gameShowManager]);

  const toggleCollapse = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (onExpandedChange) {
      onExpandedChange(newExpanded);
    }
  };

  const isRolling = displayState.diceRolling !== null;

  const handleRollOne = () => {
    if (isRolling) return;
    if (!gameShowManager) return;

    gameShowManager.showDiceRolling(1);

    timeoutRef.current = setTimeout(() => {
      const result = diceRollerRef.current.rollDiceOne();
      gameShowManager.showDiceResult(result);
    }, 1000);
  };

  const handleRollTwo = () => {
    if (isRolling) return;
    if (!gameShowManager) return;

    gameShowManager.showDiceRolling(2);

    timeoutRef.current = setTimeout(() => {
      const result = diceRollerRef.current.rollDiceTwo();
      gameShowManager.showDiceResult([result.roll1, result.roll2]);
    }, 1000);
  };

  const handleTestLuck = () => {
    if (isRolling) return;
    if (!canTestLuck) return;
    if (!gameShowManager) return;

    gameShowManager.showDiceRolling(2);

    timeoutRef.current = setTimeout(() => {
      const result = diceRollerRef.current.rollDiceTwo();
      gameShowManager.showDiceResult([result.roll1, result.roll2]);

      if (onTestLuckComplete) {
        onTestLuckComplete(result);
      }
    }, 1000);
  };

  return (
    <section
      id="dice-rolls"
      className={`section-container mb-4 ${isExpanded ? 'h-100' : ''}`}
    >
      <div
        className="section-header"
        onClick={toggleCollapse}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleCollapse();
          }
        }}
      >
        <h2 className="heading section-title d-flex align-items-center gap-2">
          {t('sections.diceRolls')}
          <Icon
            path={isExpanded ? mdiChevronDown : mdiChevronUp}
            size={1}
            style={{ marginLeft: 'auto' }}
          />
        </h2>
      </div>
      <div
        className={`collapse ${isExpanded ? 'show' : ''}`}
        id="dice-rolls-collapse"
      >
        <div className="section-content">
          <div className="d-flex flex-column gap-3">
            <div className="d-flex gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                onClick={handleTestLuck}
                disabled={!canTestLuck || isRolling}
              >
                {t('dice.testYourLuck')}
                <Icon path={mdiClover} size={1} />
              </button>
            </div>
            <div className="d-flex gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-light d-flex align-items-center justify-content-center gap-2"
                onClick={handleRollOne}
                disabled={isRolling}
              >
                {t('dice.rollDie')}
                <Icon path={mdiDice3} size={1} />
              </button>
              <button
                type="button"
                className="btn btn-light d-flex align-items-center justify-content-center gap-2"
                onClick={handleRollTwo}
                disabled={isRolling}
              >
                {t('dice.rollDice')}
                <Icon path={mdiDiceMultiple} size={1} />
              </button>
            </div>
            <div
              className="d-flex flex-column justify-content-center align-items-center"
              style={{ minHeight: '100px', gap: '5px' }}
            >
              <DiceDisplay
                diceRolling={displayState.diceRolling}
                result={displayState.diceResult}
                color="#007e6e"
              />
              {displayState.luckTestMessage}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
