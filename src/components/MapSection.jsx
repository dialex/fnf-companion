import React from 'react';
import Icon from '@mdi/react';
import { mdiMap, mdiPencilPlus } from '@mdi/js';
import { t } from '../translations';

export default function MapSection({
  trailSequence,
  trailInput,
  onTrailInputChange,
  onTrailSubmit,
  onTrailTest,
}) {
  // Ensure sequence always starts with 1
  const displaySequence =
    trailSequence.length === 0 || trailSequence[0] !== 1
      ? [1, ...trailSequence.filter((n) => n !== 1)]
      : trailSequence;

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onTrailSubmit();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow numbers, up to 3 digits
    if (value === '' || /^\d{1,3}$/.test(value)) {
      onTrailInputChange(value);
    }
  };

  const handleKeyDown = (e) => {
    // Prevent non-numeric keys (except backspace, delete, arrow keys, etc.)
    if (
      !/[0-9]/.test(e.key) &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)
    ) {
      e.preventDefault();
    }
  };

  return (
    <section id="map" className="section-container mb-4 h-100">
      <div className="section-header">
        <h2 className="heading section-title d-flex align-items-center gap-2">
          <Icon path={mdiMap} size={1} />
          {t('sections.map')}
        </h2>
      </div>
      <div className="section-content d-flex flex-column align-items-center">
        {/* Input and submit button */}
        <div className="d-flex align-items-center gap-2 mb-4">
          <label className="content field-label mb-0">Chapter</label>
          <div className="input-group" style={{ flex: 1 }}>
            <input
              type="number"
              className="content field-input form-control trail-input"
              min="1"
              max="400"
              value={trailInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={onTrailSubmit}
              disabled={
                !trailInput ||
                isNaN(parseInt(trailInput)) ||
                parseInt(trailInput) < 1 ||
                parseInt(trailInput) > 400
              }
              style={{
                minWidth: 'auto',
                width: 'auto',
                padding: '0.5rem',
              }}
            >
              <Icon path={mdiPencilPlus} size={1} />
            </button>
          </div>
          <button
            type="button"
            className="btn btn-light btn-sm"
            onClick={onTrailTest}
            title="Test: Add 20 random numbers"
          >
            Test
          </button>
        </div>

        {/* Sequence display */}
        <div className="d-flex flex-wrap justify-content-center gap-2">
          {displaySequence.map((num, index) => {
            if (num === 1) {
              return (
                <span
                  key={index}
                  className="badge rounded-pill text-white"
                  style={{
                    backgroundColor: '#1a303f',
                    borderColor: '#1a303f',
                  }}
                >
                  {num}
                </span>
              );
            } else if (num === 400) {
              return (
                <span
                  key={index}
                  className="badge rounded-pill text-bg-warning"
                >
                  {num}
                </span>
              );
            } else {
              return (
                <span
                  key={index}
                  className="badge rounded-pill text-bg-secondary"
                >
                  {num}
                </span>
              );
            }
          })}
        </div>
      </div>
    </section>
  );
}
