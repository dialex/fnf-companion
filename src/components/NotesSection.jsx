import React from 'react';
import Icon from '@mdi/react';
import { mdiLeadPencil } from '@mdi/js';
import { t } from '../translations';

export default function NotesSection({ notes, onNotesChange }) {
  return (
    <section id="notes" className="section-container mb-4 h-100">
      <div className="section-header">
        <h2 className="heading section-title d-flex align-items-center gap-2">
          <Icon path={mdiLeadPencil} size={1} />
          {t('sections.notes')}
        </h2>
      </div>
      <div className="section-content">
        <textarea
          className="content field-input form-control notes-handwritten"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={10}
          style={{ resize: 'vertical', minHeight: '200px' }}
        />
      </div>
    </section>
  );
}
