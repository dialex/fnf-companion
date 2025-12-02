import React from 'react';
import Icon from '@mdi/react';
import {
  mdiHandCoin,
  mdiFoodApple,
  mdiBagPersonalPlus,
  mdiSilverwareForkKnife,
  mdiHandExtended,
} from '@mdi/js';
import { t } from '../translations';

export default function ConsumablesSection({
  coins,
  meals,
  health,
  maxHealth,
  transactionObject,
  transactionCost,
  fieldBadges,
  onCoinsChange,
  onMealsChange,
  onTransactionObjectChange,
  onTransactionCostChange,
  onConsumeMeal,
  onPurchase,
  onNumberChange,
}) {
  return (
    <section id="consumables" className="section-container mb-4 h-100">
      <div className="section-header">
        <h2 className="heading section-title">{t('sections.consumables')}</h2>
      </div>
      <div className="section-content">
        <div className="field-group" style={{ position: 'relative' }}>
          <div className="field-icon">
            <Icon path={mdiHandCoin} size={1} />
          </div>
          <label className="content field-label">{t('fields.coins')}</label>
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
          <label className="content field-label">{t('fields.meals')}</label>
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
          <label className="content field-label">{t('transaction.buy')}</label>
          <div className="input-group" style={{ flex: 1 }}>
            <input
              type="text"
              className="content field-input form-control"
              placeholder={t('transaction.item')}
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
                      <Icon path={mdiHandExtended} size={1} />
                    </button>
          </div>
        </div>
      </div>
    </section>
  );
}
