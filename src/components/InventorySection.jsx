import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiBagPersonal, mdiChevronDown, mdiChevronUp } from '@mdi/js';
import { i18nManager } from '../managers/i18nManager';

export default function InventorySection({
  inventory,
  onInventoryChange,
  fieldBadges,
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
      id="inventory"
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
          <Icon path={mdiBagPersonal} size={1} />
          {t('sections.inventory')}
          <Icon
            path={isExpanded ? mdiChevronDown : mdiChevronUp}
            size={1}
            style={{ marginLeft: 'auto' }}
          />
        </h2>
      </div>
      <div
        className={`collapse ${isExpanded ? 'show' : ''}`}
        id="inventory-collapse"
      >
        <div className="section-content d-flex flex-column">
          <div
            style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <textarea
              className="content field-input form-control"
              value={inventory}
              onChange={(e) => onInventoryChange(e.target.value)}
              style={{
                resize: 'vertical',
                height: '100%',
                minHeight: '200px',
              }}
            />
            {fieldBadges?.inventory && (
              <span
                className={`badge rounded-pill bg-${
                  fieldBadges.inventory.type === 'success'
                    ? 'success'
                    : 'danger'
                } inventory-badge`}
                key={fieldBadges.inventory.id}
              >
                {fieldBadges.inventory.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
