import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import {
  mdiAccount,
  mdiSword,
  mdiHeart,
  mdiClover,
  mdiDice3,
  mdiLock,
  mdiLockOpenVariant,
  mdiChevronDown,
  mdiChevronUp,
} from '@mdi/js';
import { t } from '../translations';

export default function CharacterSection({
  name,
  skill,
  health,
  luck,
  maxSkill,
  maxHealth,
  maxLuck,
  isLocked,
  fieldBadges,
  rollingButton,
  onNameChange,
  onSkillChange,
  onHealthChange,
  onLuckChange,
  onRandomStats,
  onToggleLock,
  onNumberChange,
  initialExpanded = true,
}) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  useEffect(() => {
    setIsExpanded(initialExpanded);
  }, [initialExpanded]);

  const toggleCollapse = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <section
      id="character"
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
          {name.trim().length > 0 ? name : t('sections.character')}
          <Icon
            path={isExpanded ? mdiChevronDown : mdiChevronUp}
            size={1}
            style={{ marginLeft: 'auto' }}
          />
        </h2>
      </div>
      <div
        className={`collapse ${isExpanded ? 'show' : ''}`}
        id="character-collapse"
      >
        <div className="section-content">
          <div className="field-group">
            <div className="field-icon">
              <Icon path={mdiAccount} size={1} />
            </div>
            <label className="content field-label">{t('character.name')}</label>
            <input
              type="text"
              className="content field-input form-control"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>
          <div className="field-group">
            <div className="field-icon">
              <Icon path={mdiSword} size={1} />
            </div>
            <label className="content field-label">
              {t('character.skill')}
            </label>
            <div className="input-group" style={{ flex: 1 }}>
              {maxSkill !== null && (
                <span className="input-group-text locked-number text-white">
                  {maxSkill}
                </span>
              )}
              <input
                type="number"
                className="content field-input form-control"
                min="0"
                value={skill}
                onChange={(e) =>
                  onNumberChange(onSkillChange, e.target.value, maxSkill)
                }
                placeholder={t('character.skillPlaceholder')}
              />
            </div>
          </div>
          <div className="field-group" style={{ position: 'relative' }}>
            <div className="field-icon">
              <Icon path={mdiHeart} size={1} />
            </div>
            <label className="content field-label">
              {t('character.health')}
            </label>
            <div className="input-group" style={{ flex: 1 }}>
              {maxHealth !== null && (
                <span className="input-group-text locked-number text-white">
                  {maxHealth}
                </span>
              )}
              <input
                type="number"
                className="content field-input form-control"
                min="0"
                value={health}
                onChange={(e) =>
                  onNumberChange(onHealthChange, e.target.value, maxHealth)
                }
                placeholder={t('character.healthPlaceholder')}
              />
            </div>
            {fieldBadges?.health && (
              <span
                className={`badge rounded-pill bg-${
                  fieldBadges.health.type === 'success' ? 'success' : 'danger'
                } field-badge`}
                key={fieldBadges.health.id}
              >
                {fieldBadges.health.value}
              </span>
            )}
          </div>
          <div className="field-group">
            <div className="field-icon">
              <Icon path={mdiClover} size={1} />
            </div>
            <label className="content field-label">{t('character.luck')}</label>
            <div className="input-group" style={{ flex: 1 }}>
              {maxLuck !== null && (
                <span className="input-group-text locked-number text-white">
                  {maxLuck}
                </span>
              )}
              <input
                type="number"
                className="content field-input form-control"
                min="0"
                value={luck}
                onChange={(e) =>
                  onNumberChange(onLuckChange, e.target.value, maxLuck)
                }
                placeholder={t('character.luckPlaceholder')}
              />
            </div>
          </div>
          <div className="d-flex justify-content-center gap-2 mt-3">
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
              onClick={() => {
                onRandomStats();
              }}
              disabled={rollingButton !== null}
            >
              {t('character.randomStats')}
              <Icon
                path={mdiDice3}
                size={1}
                className={rollingButton === 'randomize' ? 'dice-rolling' : ''}
                style={
                  rollingButton === 'randomize'
                    ? { animationDuration: '0.3s' }
                    : {}
                }
              />
            </button>
            <button
              type="button"
              className="btn btn-light d-flex align-items-center justify-content-center gap-2"
              onClick={onToggleLock}
              disabled={
                !skill ||
                !health ||
                !luck ||
                parseInt(skill) <= 0 ||
                parseInt(health) <= 0 ||
                parseInt(luck) <= 0
              }
            >
              {isLocked ? t('character.unlock') : t('character.lock')}
              <Icon path={isLocked ? mdiLockOpenVariant : mdiLock} size={1} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
