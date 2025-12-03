import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiLeadPencil, mdiChevronDown, mdiChevronUp } from '@mdi/js';
import { t } from '../translations';

export default function NotesSection({ notes, onNotesChange }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleCollapse = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <section
      id="notes"
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
          <Icon path={mdiLeadPencil} size={1} />
          {t('sections.notes')}
          <Icon
            path={isExpanded ? mdiChevronDown : mdiChevronUp}
            size={1}
            style={{ marginLeft: 'auto' }}
          />
        </h2>
      </div>
      <div
        className={`collapse ${isExpanded ? 'show' : ''}`}
        id="notes-collapse"
      >
        <div className="section-content">
          <textarea
            className="content field-input form-control notes-handwritten"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={10}
            style={{ resize: 'vertical', minHeight: '200px' }}
          />
        </div>
      </div>
    </section>
  );
}
