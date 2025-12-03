import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import {
  mdiHandCoin,
  mdiFoodApple,
  mdiBagPersonalPlus,
  mdiSilverwareForkKnife,
  mdiBottleTonicPlus,
  mdiCup,
  mdiCupOutline,
  mdiChevronDown,
  mdiChevronUp,
} from '@mdi/js';
import { t } from '../translations';

export default function ConsumablesSection({
  coins,
  meals,
  health,
  maxHealth,
  skill,
  maxSkill,
  luck,
  maxLuck,
  transactionObject,
  transactionCost,
  fieldBadges,
  isLocked,
  potionType,
  potionUsed,
  onCoinsChange,
  onMealsChange,
  onTransactionObjectChange,
  onTransactionCostChange,
  onConsumeMeal,
  onPurchase,
  onPotionTypeChange,
  onConsumePotion,
  onNumberChange,
  initialExpanded = true,
  autoExpand = false,
}) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  useEffect(() => {
    if (autoExpand && !isExpanded) {
      setIsExpanded(true);
    }
  }, [autoExpand, isExpanded]);

  useEffect(() => {
    setIsExpanded(initialExpanded);
  }, [initialExpanded]);

  const toggleCollapse = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <section
      id="consumables"
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
          {t('sections.consumables')}
          <Icon
            path={isExpanded ? mdiChevronDown : mdiChevronUp}
            size={1}
            style={{ marginLeft: 'auto' }}
          />
        </h2>
      </div>
      <div
        className={`collapse ${isExpanded ? 'show' : ''}`}
        id="consumables-collapse"
      >
        <div className="section-content">
          <div className="field-group" style={{ position: 'relative' }}>
            <div className="field-icon">
              <Icon path={mdiHandCoin} size={1} />
            </div>
            <label className="content field-label">{t('consumables.coins')}</label>
            <input
              type="number"
              className="content field-input form-control"
              min="0"
              value={coins}
              onChange={(e) => onNumberChange(onCoinsChange, e.target.value)}
            />
            {fieldBadges?.coins && (
              <span
                className={`badge rounded-pill bg-${
                  fieldBadges.coins.type === 'success' ? 'success' : 'danger'
                } field-badge`}
                key={fieldBadges.coins.id}
              >
                {fieldBadges.coins.value}
              </span>
            )}
          </div>
          <div className="field-group" style={{ position: 'relative' }}>
            <div className="field-icon">
              <Icon path={mdiFoodApple} size={1} />
            </div>
            <label className="content field-label">{t('consumables.meals')}</label>
            <div className="input-group" style={{ flex: 1 }}>
              <input
                type="number"
                className="content field-input form-control"
                min="0"
                value={meals}
                onChange={(e) => onNumberChange(onMealsChange, e.target.value)}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={onConsumeMeal}
                disabled={
                  parseInt(meals) <= 0 ||
                  (maxHealth !== null && parseInt(health) >= maxHealth)
                }
                style={{
                  minWidth: 'auto',
                  width: 'auto',
                  padding: '0.5rem',
                }}
              >
                <Icon path={mdiSilverwareForkKnife} size={1} />
              </button>
            </div>
            {fieldBadges?.meals && (
              <span
                className={`badge rounded-pill bg-${
                  fieldBadges.meals.type === 'success' ? 'success' : 'danger'
                } field-badge`}
                key={fieldBadges.meals.id}
              >
                {fieldBadges.meals.value}
              </span>
            )}
          </div>
          <div className="field-group">
            <div className="field-icon">
              <Icon path={mdiBagPersonalPlus} size={1} />
            </div>
            <label className="content field-label">
              {t('consumables.buy')}
            </label>
            <div className="input-group" style={{ flex: 1 }}>
              <input
                type="text"
                className="content field-input form-control"
                placeholder={t('consumables.item')}
                value={transactionObject}
                onChange={(e) => onTransactionObjectChange(e.target.value)}
              />
              <input
                type="number"
                className="content field-input form-control transaction-cost-input"
                min="0"
                max="9"
                placeholder="0"
                value={transactionCost}
                onChange={(e) => onTransactionCostChange(e.target.value)}
                onFocus={(e) => {
                  if (e.target.value === '0') {
                    onTransactionCostChange('');
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={onPurchase}
                disabled={
                  !transactionObject.trim() ||
                  !transactionCost ||
                  parseInt(transactionCost) <= 0 ||
                  parseInt(coins) < parseInt(transactionCost)
                }
                style={{
                  minWidth: 'auto',
                  width: 'auto',
                  padding: '0.5rem',
                }}
              >
                <Icon path={mdiHandCoin} size={1} />
              </button>
            </div>
          </div>
          {isLocked && (
            <div className="field-group">
              <div className="field-icon">
                <Icon path={mdiBottleTonicPlus} size={1} />
              </div>
              <label className="content field-label">
                {t('consumables.potion')}
              </label>
              <div className="input-group" style={{ flex: 1 }}>
                <select
                  className="content field-input form-control"
                  value={potionType}
                  onChange={(e) => onPotionTypeChange(e.target.value)}
                  disabled={potionUsed}
                  style={potionUsed ? { textDecoration: 'line-through' } : {}}
                >
                  <option value="">{t('consumables.potionSelect')}</option>
                  <option value="skill">{t('consumables.potionRestoreSkill')}</option>
                  <option value="health">{t('consumables.potionRestoreHealth')}</option>
                  <option value="luck">{t('consumables.potionRestoreLuck')}</option>
                </select>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onConsumePotion}
                  disabled={
                    !potionType ||
                    potionUsed ||
                    (potionType === 'skill' &&
                      maxSkill !== null &&
                      parseInt(skill) >= maxSkill) ||
                    (potionType === 'health' &&
                      maxHealth !== null &&
                      parseInt(health) >= maxHealth) ||
                    (potionType === 'luck' &&
                      maxLuck !== null &&
                      parseInt(luck) >= maxLuck)
                  }
                  style={{
                    minWidth: 'auto',
                    width: 'auto',
                    padding: '0.5rem',
                  }}
                >
                  <Icon path={potionUsed ? mdiCupOutline : mdiCup} size={1} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
