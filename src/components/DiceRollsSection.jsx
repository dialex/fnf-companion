import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import {
  mdiClover,
  mdiSword,
  mdiDice3,
  mdiDiceMultiple,
  mdiChevronDown,
  mdiChevronUp,
} from '@mdi/js';
import { t } from '../translations';
import DiceDisplay from './DiceDisplay';

export default function DiceRollsSection({
  skill,
  luck,
  diceRollingType,
  isTestingLuck,
  rollDieResult,
  rollDiceResults,
  testLuckResult,
  testSkillResult,
  onTestYourLuck,
  onTestYourSkill,
  onRollDie,
  onRollDice,
  initialExpanded = true,
  onExpandedChange,
}) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  useEffect(() => {
    setIsExpanded(initialExpanded);
  }, [initialExpanded]);

  const toggleCollapse = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (onExpandedChange) {
      onExpandedChange(newExpanded);
    }
  };

  const getDiceResult = () => {
    if (rollDieResult) return rollDieResult;
    if (rollDiceResults) return rollDiceResults;
    if (testSkillResult) return [testSkillResult.roll1, testSkillResult.roll2];
    if (testLuckResult) return [testLuckResult.roll1, testLuckResult.roll2];
    return null;
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
                onClick={onTestYourLuck}
                disabled={
                  !luck ||
                  parseInt(luck) <= 0 ||
                  isTestingLuck ||
                  diceRollingType !== null
                }
              >
                {t('dice.testYourLuck')}
                <Icon path={mdiClover} size={1} />
              </button>
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                onClick={onTestYourSkill}
                disabled={
                  !skill || parseInt(skill) <= 0 || diceRollingType !== null
                }
              >
                {t('dice.testYourSkill')}
                <Icon path={mdiSword} size={1} />
              </button>
            </div>
            <div className="d-flex gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-light d-flex align-items-center justify-content-center gap-2"
                onClick={onRollDie}
                disabled={diceRollingType !== null}
              >
                {t('dice.rollDie')}
                <Icon path={mdiDice3} size={1} />
              </button>
              <button
                type="button"
                className="btn btn-light d-flex align-items-center justify-content-center gap-2"
                onClick={onRollDice}
                disabled={diceRollingType !== null}
              >
                {t('dice.rollDice')}
                <Icon path={mdiDiceMultiple} size={1} />
              </button>
            </div>
            <div
              className="d-flex flex-column justify-content-center align-items-center"
              style={{ minHeight: '100px', gap: '5px' }}
            >
              {/* Dice animation or results */}
              <DiceDisplay
                rollingType={diceRollingType}
                result={getDiceResult()}
                color="#007e6e"
              />
              {/* Test result messages */}
              {testSkillResult && diceRollingType === null && (
                <div
                  className={`alert content ${
                    testSkillResult.passed ? 'alert-success' : 'alert-danger'
                  } mb-0`}
                  role="alert"
                >
                  {testSkillResult.passed
                    ? t('dice.youPassedTheTest')
                    : t('dice.youFailedTheTest')}
                </div>
              )}
              {testLuckResult && diceRollingType === null && (
                <div
                  className={`alert content ${
                    testLuckResult.isLucky ? 'alert-success' : 'alert-danger'
                  } mb-0`}
                  role="alert"
                >
                  {testLuckResult.isLucky
                    ? t('dice.youWereLucky')
                    : t('dice.youWereUnlucky')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
