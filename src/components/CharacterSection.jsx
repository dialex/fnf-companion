import React from 'react';
import Icon from '@mdi/react';
import {
  mdiAccount,
  mdiSword,
  mdiHeart,
  mdiClover,
  mdiDice3,
  mdiLock,
  mdiLockOpenVariant,
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
}) {
  return (
    <section id="character" className="section-container mb-4 h-100">
      <div className="section-header">
        <h2 className="heading section-title">
          {name.trim().length > 0 ? name : t('sections.character')}
        </h2>
      </div>
      <div className="section-content">
        <div className="field-group">
          <div className="field-icon">
            <Icon path={mdiAccount} size={1} />
          </div>
          <label className="content field-label">{t('fields.name')}</label>
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
          <label className="content field-label">{t('fields.skill')}</label>
          <div className="input-group" style={{ flex: 1 }}>
            {maxSkill !== null && (
              <span className="input-group-text bg-secondary text-white">
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
              placeholder={t('placeholders.skill')}
            />
          </div>
        </div>
        <div className="field-group" style={{ position: 'relative' }}>
          <div className="field-icon">
            <Icon path={mdiHeart} size={1} />
          </div>
          <label className="content field-label">{t('fields.health')}</label>
          <div className="input-group" style={{ flex: 1 }}>
            {maxHealth !== null && (
              <span className="input-group-text bg-secondary text-white">
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
              placeholder={t('placeholders.health')}
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
          <label className="content field-label">{t('fields.luck')}</label>
          <div className="input-group" style={{ flex: 1 }}>
            {maxLuck !== null && (
              <span className="input-group-text bg-secondary text-white">
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
              placeholder={t('placeholders.luck')}
            />
          </div>
        </div>
        <div className="d-flex justify-content-center gap-2 mt-3">
          <button
            type="button"
            className="btn btn-light d-flex align-items-center justify-content-center gap-2"
            onClick={() => {
              onRandomStats();
            }}
            disabled={rollingButton !== null}
          >
            {t('buttons.randomStats')}
            <Icon
              path={mdiDice3}
              size={1}
              className={
                rollingButton === 'randomize' ? 'dice-rolling' : ''
              }
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
            {isLocked ? t('buttons.unlock') : t('buttons.lock')}
            <Icon
              path={isLocked ? mdiLockOpenVariant : mdiLock}
              size={1}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
