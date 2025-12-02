import React from 'react';
import Icon from '@mdi/react';
import {
  mdiClover,
  mdiSword,
  mdiDice3,
  mdiDiceMultiple,
} from '@mdi/js';
import { t } from '../translations';
import { getDiceIcon } from '../utils/dice';

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
}) {
  return (
    <section id="dice-rolls" className="section-container mb-4 h-100">
      <div className="section-header">
        <h2 className="heading section-title">{t('sections.diceRolls')}</h2>
      </div>
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
                !skill ||
                parseInt(skill) <= 0 ||
                diceRollingType !== null
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
            {diceRollingType === 'rollDie' && (
              <Icon
                path={mdiDice3}
                size={3}
                className="dice-rolling"
                style={{ color: '#007e6e', animationDuration: '0.3s' }}
              />
            )}
            {diceRollingType === 'rollDice' && (
              <div className="d-flex align-items-center gap-2">
                <Icon
                  path={mdiDice3}
                  size={3}
                  className="dice-rolling"
                  style={{
                    color: '#007e6e',
                    animationDuration: '0.3s',
                  }}
                />
                <Icon
                  path={mdiDice3}
                  size={3}
                  className="dice-rolling"
                  style={{
                    color: '#007e6e',
                    animationDuration: '0.3s',
                  }}
                />
              </div>
            )}
            {diceRollingType === 'testSkill' && (
              <div className="d-flex align-items-center gap-2">
                <Icon
                  path={mdiDice3}
                  size={3}
                  className="dice-rolling"
                  style={{
                    color: '#007e6e',
                    animationDuration: '0.3s',
                  }}
                />
                <Icon
                  path={mdiDice3}
                  size={3}
                  className="dice-rolling"
                  style={{
                    color: '#007e6e',
                    animationDuration: '0.3s',
                  }}
                />
              </div>
            )}
            {diceRollingType === 'testLuck' && (
              <div className="d-flex align-items-center gap-2">
                <Icon
                  path={mdiDice3}
                  size={3}
                  className="dice-rolling"
                  style={{
                    color: '#007e6e',
                    animationDuration: '0.3s',
                  }}
                />
                <Icon
                  path={mdiDice3}
                  size={3}
                  className="dice-rolling"
                  style={{
                    color: '#007e6e',
                    animationDuration: '0.3s',
                  }}
                />
              </div>
            )}
            {testSkillResult && diceRollingType === null && (
              <>
                <div
                  className={`alert content ${
                    testSkillResult.passed
                      ? 'alert-success'
                      : 'alert-danger'
                  } mb-0`}
                  role="alert"
                >
                  {testSkillResult.passed
                    ? t('dice.youPassedTheTest')
                    : t('dice.youFailedTheTest')}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Icon
                    path={getDiceIcon(testSkillResult.roll1)}
                    size={3}
                    style={{ color: '#007e6e' }}
                  />
                  <Icon
                    path={getDiceIcon(testSkillResult.roll2)}
                    size={3}
                    style={{ color: '#007e6e' }}
                  />
                </div>
              </>
            )}
            {testLuckResult && diceRollingType === null && (
              <>
                <div
                  className={`alert content ${
                    testLuckResult.isLucky
                      ? 'alert-success'
                      : 'alert-danger'
                  } mb-0`}
                  role="alert"
                >
                  {testLuckResult.isLucky
                    ? t('dice.youWereLucky')
                    : t('dice.youWereUnlucky')}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Icon
                    path={getDiceIcon(testLuckResult.roll1)}
                    size={3}
                    style={{ color: '#007e6e' }}
                  />
                  <Icon
                    path={getDiceIcon(testLuckResult.roll2)}
                    size={3}
                    style={{ color: '#007e6e' }}
                  />
                </div>
              </>
            )}
            {rollDieResult && diceRollingType === null && (
              <Icon
                path={getDiceIcon(rollDieResult)}
                size={3}
                style={{ color: '#007e6e' }}
              />
            )}
            {rollDiceResults && diceRollingType === null && (
              <div className="d-flex align-items-center" style={{ gap: '20px' }}>
                <Icon
                  path={getDiceIcon(rollDiceResults[0])}
                  size={3}
                  style={{ color: '#007e6e' }}
                />
                <Icon
                  path={getDiceIcon(rollDiceResults[1])}
                  size={3}
                  style={{ color: '#007e6e' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
