import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import {
  mdiSwordCross,
  mdiClover,
  mdiSword,
  mdiHeart,
  mdiSnake,
  mdiChevronDown,
  mdiChevronUp,
} from '@mdi/js';
import { i18nManager } from '../managers/i18nManager';
import DiceDisplay from './DiceDisplay';

export default function FightSection({
  // Hero stats (read-only)
  skill,
  health,
  luck,
  // Monster stats
  monsterCreature,
  monsterSkill,
  monsterHealth,
  // Fight state
  graveyard,
  showUseLuck,
  luckUsed,
  isFighting,
  isFightStarted,
  fightResult,
  fightOutcome,
  heroDiceRolls,
  monsterDiceRolls,
  testLuckResult,
  isTestingLuck,
  diceRollingType,
  fieldBadges,
  // Callbacks
  onMonsterCreatureChange,
  onMonsterCreatureFocus,
  onMonsterSkillChange,
  onMonsterHealthChange,
  onFight,
  onUseLuck,
  onNumberChange,
  initialExpanded = true,
  onExpandedChange,
}) {
  const t = i18nManager.t.bind(i18nManager);
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

  return (
    <section
      id="fight"
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
          <Icon path={mdiSwordCross} size={1} />
          {t('sections.fight')}
          <Icon
            path={isExpanded ? mdiChevronDown : mdiChevronUp}
            size={1}
            style={{ marginLeft: 'auto' }}
          />
        </h2>
      </div>
      <div
        className={`collapse ${isExpanded ? 'show' : ''}`}
        id="fight-collapse"
      >
        <div className="section-content d-flex flex-column">
          <div className="row gx-4 flex-grow-1" style={{ minHeight: 0 }}>
            <div
              className="col-12 col-xl-4 d-flex flex-column"
              style={{ minHeight: 0 }}
            >
              <h3 className="heading mb-3">{t('fight.graveyard')}</h3>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                }}
              >
                <textarea
                  className="content field-input form-control"
                  value={graveyard}
                  readOnly
                  disabled
                  style={{
                    resize: 'none',
                    height: '100%',
                    minHeight: '200px',
                  }}
                />
              </div>
            </div>
            <div className="col-12 col-xl-8">
              <div className="row gx-4">
                <div className="col-12 col-xl-6 d-flex flex-column">
                  <h3 className="heading mb-3">{t('fight.hero')}</h3>
                  <div className="field-group">
                    <div className="field-icon">
                      <Icon path={mdiClover} size={1} />
                    </div>
                    <label className="content field-label">
                      {t('fight.luck')}
                    </label>
                    <input
                      type="number"
                      className="content field-input form-control"
                      value={luck || ''}
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="field-group">
                    <div className="field-icon">
                      <Icon path={mdiSword} size={1} />
                    </div>
                    <label className="content field-label">
                      {t('fight.skill')}
                    </label>
                    <input
                      type="number"
                      className="content field-input form-control"
                      value={skill || ''}
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="field-group" style={{ position: 'relative' }}>
                    <div className="field-icon">
                      <Icon path={mdiHeart} size={1} />
                    </div>
                    <label className="content field-label">
                      {t('fight.health')}
                    </label>
                    <input
                      type="number"
                      className="content field-input form-control"
                      value={health || ''}
                      readOnly
                      disabled
                    />
                    {fieldBadges?.heroHealth && (
                      <span
                        className={`badge rounded-pill bg-${
                          fieldBadges.heroHealth.type === 'success'
                            ? 'success'
                            : 'danger'
                        } field-badge`}
                        key={fieldBadges.heroHealth.id}
                      >
                        {fieldBadges.heroHealth.value}
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-12 col-xl-6 d-flex flex-column">
                  <h3 className="heading mb-3">{t('fight.monster')}</h3>
                  <div className="field-group">
                    <div className="field-icon">
                      <Icon path={mdiSnake} size={1} />
                    </div>
                    <label className="content field-label">
                      {t('fight.creature')}
                    </label>
                    <input
                      type="text"
                      className="content field-input form-control"
                      placeholder={t('fight.creaturePlaceholder')}
                      value={monsterCreature}
                      onChange={(e) => onMonsterCreatureChange(e.target.value)}
                      onFocus={() => {
                        if (onMonsterCreatureFocus) {
                          onMonsterCreatureFocus();
                        }
                      }}
                    />
                  </div>
                  <div className="field-group">
                    <div className="field-icon">
                      <Icon path={mdiSword} size={1} />
                    </div>
                    <label className="content field-label">
                      {t('fight.skill')}
                    </label>
                    <input
                      type="number"
                      className="content field-input form-control"
                      min="0"
                      value={monsterSkill}
                      onChange={(e) =>
                        onNumberChange(onMonsterSkillChange, e.target.value)
                      }
                    />
                  </div>
                  <div className="field-group" style={{ position: 'relative' }}>
                    <div className="field-icon">
                      <Icon path={mdiHeart} size={1} />
                    </div>
                    <label className="content field-label">
                      {t('fight.health')}
                    </label>
                    <input
                      type="number"
                      className="content field-input form-control"
                      min="0"
                      value={monsterHealth}
                      onChange={(e) =>
                        onNumberChange(onMonsterHealthChange, e.target.value)
                      }
                    />
                    {fieldBadges?.monsterHealth && (
                      <span
                        className={`badge rounded-pill bg-${
                          fieldBadges.monsterHealth.type === 'success'
                            ? 'success'
                            : 'danger'
                        } field-badge`}
                        key={fieldBadges.monsterHealth.id}
                      >
                        {fieldBadges.monsterHealth.value}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="row gx-4 mt-3">
                <div className="col-12 d-flex gap-2 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={
                      !monsterCreature.trim() ||
                      !monsterSkill ||
                      !monsterHealth ||
                      parseInt(monsterSkill) <= 0 ||
                      parseInt(monsterHealth) <= 0 ||
                      !skill ||
                      !health ||
                      !luck ||
                      parseInt(skill) <= 0 ||
                      parseInt(health) <= 0 ||
                      parseInt(luck) <= 0 ||
                      isFighting ||
                      diceRollingType !== null ||
                      fightOutcome !== null
                    }
                    onClick={onFight}
                  >
                    {isFightStarted ? t('fight.attack') : t('fight.fight')}
                    <Icon path={mdiSwordCross} size={1} />
                  </button>
                  {showUseLuck && (
                    <button
                      type="button"
                      className="btn btn-secondary d-flex align-items-center gap-2"
                      disabled={
                        luckUsed ||
                        !luck ||
                        parseInt(luck) <= 0 ||
                        diceRollingType !== null ||
                        isTestingLuck ||
                        fightOutcome !== null
                      }
                      onClick={onUseLuck}
                    >
                      {t('fight.useLuck')}
                      <Icon path={mdiClover} size={1} />
                    </button>
                  )}
                </div>
              </div>
              <div className="row gx-4 mt-3">
                <div className="col-12 col-xl-6">
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ minHeight: '80px' }}
                  >
                    <DiceDisplay
                      diceRolling={
                        diceRollingType === 'fight' ||
                        diceRollingType === 'useLuck'
                          ? 2
                          : null
                      }
                      result={
                        testLuckResult
                          ? [testLuckResult.roll1, testLuckResult.roll2]
                          : heroDiceRolls
                            ? heroDiceRolls
                            : null
                      }
                      color="#007e6e"
                    />
                  </div>
                </div>
                <div className="col-12 col-xl-6">
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ minHeight: '80px' }}
                  >
                    <DiceDisplay
                      diceRolling={diceRollingType === 'fight' ? 2 : null}
                      result={monsterDiceRolls || null}
                      color="#7e000f"
                    />
                  </div>
                </div>
              </div>
              {testLuckResult &&
                diceRollingType === null &&
                !isTestingLuck &&
                fightResult &&
                !fightOutcome && (
                  <div className="row gx-4 mt-3">
                    <div className="col-12">
                      <div
                        className={`alert content ${
                          testLuckResult.isLucky
                            ? 'alert-success'
                            : 'alert-danger'
                        } mb-0 text-center`}
                        role="alert"
                      >
                        {testLuckResult.isLucky
                          ? t('dice.youWereLucky')
                          : t('dice.youWereUnlucky')}{' '}
                        {fightResult.type === 'heroWins'
                          ? testLuckResult.isLucky
                            ? t('fight.attackWinLucky')
                            : t('fight.attackWinUnlucky')
                          : testLuckResult.isLucky
                            ? t('fight.attackLossLucky')
                            : t('fight.attackLossUnlucky')}
                      </div>
                    </div>
                  </div>
                )}
              {fightOutcome ? (
                <div className="row gx-4 mt-3">
                  <div className="col-12">
                    <div
                      className={`alert content ${
                        fightOutcome === 'won' ? 'alert-info' : 'alert-dark'
                      } mb-0 text-center`}
                      role="alert"
                    >
                      {fightOutcome === 'won'
                        ? t('fight.battleWon')
                        : t('fight.battleLost')}
                    </div>
                  </div>
                </div>
              ) : (
                fightResult && (
                  <div className="row gx-4 mt-3">
                    <div className="col-12">
                      <div
                        className={`alert content ${
                          fightResult.type === 'tie'
                            ? 'alert-secondary'
                            : fightResult.type === 'heroWins'
                              ? 'alert-success'
                              : 'alert-danger'
                        } mb-0 text-center`}
                        role="alert"
                      >
                        {fightResult.message}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
