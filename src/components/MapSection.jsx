import React from 'react';
import Icon from '@mdi/react';
import { mdiMap } from '@mdi/js';
import { t } from '../translations';

export default function MapSection() {
  return (
    <section id="map" className="section-container mb-4 h-100">
      <div className="section-header">
        <h2 className="heading section-title d-flex align-items-center gap-2">
          <Icon path={mdiMap} size={1} />
          {t('sections.map')}
        </h2>
      </div>
      <div className="section-content">{/* Map section */}</div>
    </section>
  );
}
