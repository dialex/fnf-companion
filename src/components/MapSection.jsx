import React, { useState, useEffect, useRef } from 'react';
import Icon from '@mdi/react';
import {
  mdiMapMarkerDistance,
  mdiPencilPlus,
  mdiCoffin,
  mdiMapMarkerCheck,
  mdiMapMarkerRemoveVariant,
  mdiMapMarkerStar,
  mdiMapMarkerQuestion,
  mdiMapMarker,
  mdiChevronDown,
  mdiChevronUp,
} from '@mdi/js';
import { i18nManager } from '../managers/i18nManager';
import {
  convertNoteItemtoColor,
  convertColorToNote,
} from '../utils/trailMapping';

export default function MapSection({
  trailSequence,
  gsm,
  onDied,
  onCelebrate,
  initialExpanded = true,
  onExpandedChange,
}) {
  const t = i18nManager.t.bind(i18nManager);
  const [selectedButton, setSelectedButton] = useState(null);
  const pillRefs = useRef({});
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [trailInput, setTrailInput] = useState('');

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

  // Convert annotations to colors for display
  const displaySequence = trailSequence.map((item) =>
    convertNoteItemtoColor(item)
  );

  // Ensure sequence always starts with 1
  const normalizedDisplaySequence =
    displaySequence.length === 0 || displaySequence[0]?.number !== 1
      ? [
          { number: 1, color: 'light' },
          ...displaySequence.filter((item) => item.number !== 1),
        ]
      : displaySequence;

  // Initialize Bootstrap tooltips
  useEffect(() => {
    // Dynamically import Bootstrap's Tooltip
    import('bootstrap').then((bootstrap) => {
      const { Tooltip } = bootstrap;

      // Initialize tooltips for all pills
      Object.entries(pillRefs.current).forEach(([key, element]) => {
        if (element) {
          // Dispose existing tooltip if it exists
          const existingTooltip = bootstrap.Tooltip.getInstance(element);
          if (existingTooltip) {
            existingTooltip.dispose();
          }

          // Create new tooltip
          new Tooltip(element, {
            placement: 'top',
            trigger: 'hover focus',
            html: false,
          });
        }
      });
    });

    // Cleanup function
    return () => {
      import('bootstrap').then((bootstrap) => {
        Object.values(pillRefs.current).forEach((element) => {
          if (element) {
            const tooltip = bootstrap.Tooltip.getInstance(element);
            if (tooltip) {
              tooltip.dispose();
            }
          }
        });
      });
    };
  }, [displaySequence]);

  const handlePillColorChange = (color) => {
    if (!gsm) return;

    const annotation = convertColorToNote(color);
    const current = gsm.getTrailSequence();
    if (current.length === 0) return;

    const newSequence = [...current];
    const lastIndex = newSequence.length - 1;
    newSequence[lastIndex] = {
      ...newSequence[lastIndex],
      annotation: annotation,
    };
    gsm.setTrailSequence(newSequence);

    // Auto-play defeat sound and show "You Died" animation when died button is clicked
    if (annotation === 'died' && onDied) {
      onDied();
    }
  };

  const handleSubmit = () => {
    if (!gsm) return;

    const num = parseInt(trailInput);
    if (isNaN(num) || num < 1 || num > 400) {
      return;
    }

    // Add number to sequence with default annotation
    gsm.setTrailSequence([
      ...gsm.getTrailSequence(),
      { number: num, annotation: null },
    ]);

    // Clear input
    setTrailInput('');

    // Chapter 400 is automatically marked as important
    if (num === 400) {
      handlePillColorChange('warning');
      // Celebrate if the game was won
      onCelebrate();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow numbers, up to 3 digits
    if (value === '' || /^\d{1,3}$/.test(value)) {
      setTrailInput(value);
    }
  };

  const handlePillDelete = () => {
    if (!gsm) return;

    const current = gsm.getTrailSequence();
    // Don't delete if there's only one item (the initial 1)
    if (current.length <= 1) return;
    // Remove the last item
    gsm.setTrailSequence(current.slice(0, -1));
  };

  const handleKeyDown = (e) => {
    // Handle Enter key to submit
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
      return;
    }
    // Prevent non-numeric keys (except backspace, delete, arrow keys, etc.)
    if (
      !/[0-9]/.test(e.key) &&
      ![
        'Backspace',
        'Delete',
        'ArrowLeft',
        'ArrowRight',
        'Tab',
        'Enter',
      ].includes(e.key)
    ) {
      e.preventDefault();
    }
  };

  return (
    <section
      id="map"
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
          <Icon path={mdiMapMarkerDistance} size={1} />
          {t('sections.trail')}
          <Icon
            path={isExpanded ? mdiChevronDown : mdiChevronUp}
            size={1}
            style={{ marginLeft: 'auto' }}
          />
        </h2>
      </div>
      <div className={`collapse ${isExpanded ? 'show' : ''}`} id="map-collapse">
        <div className="section-content d-flex flex-column align-items-center">
          {/* Input and submit button */}
          <div className="d-flex align-items-center gap-2 mb-4">
            <label className="content field-label mb-0">
              {t('trail.chapter')}
            </label>
            <div className="input-group" style={{ flex: 1 }}>
              <input
                type="number"
                className="content field-input form-control trail-input"
                min="1"
                max="400"
                value={trailInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
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
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn btn-light btn-sm ${selectedButton === 'default' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedButton('default');
                  handlePillColorChange('light');
                }}
                title={t('trail.default')}
              >
                <Icon path={mdiMapMarker} size={1} />
              </button>
              <button
                type="button"
                className={`btn btn-info btn-sm text-white ${selectedButton === 'question' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedButton('question');
                  handlePillColorChange('info');
                }}
                title={t('trail.question')}
              >
                <Icon path={mdiMapMarkerQuestion} size={1} />
              </button>
              <button
                type="button"
                className={`btn btn-success btn-sm text-white ${selectedButton === 'good' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedButton('good');
                  handlePillColorChange('success');
                }}
                title={t('trail.good')}
              >
                <Icon path={mdiMapMarkerCheck} size={1} />
              </button>
              <button
                type="button"
                className={`btn btn-danger btn-sm text-white ${selectedButton === 'bad' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedButton('bad');
                  handlePillColorChange('danger');
                }}
                title={t('trail.bad')}
              >
                <Icon path={mdiMapMarkerRemoveVariant} size={1} />
              </button>
              <button
                type="button"
                className={`btn btn-warning btn-sm text-white ${selectedButton === 'star' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedButton('star');
                  handlePillColorChange('warning');
                }}
                title={t('trail.important')}
              >
                <Icon path={mdiMapMarkerStar} size={1} />
              </button>
              <button
                type="button"
                className={`btn btn-dark btn-sm text-white ${selectedButton === 'died' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedButton('died');
                  handlePillColorChange('dark');
                }}
                title={t('trail.died')}
              >
                <Icon path={mdiCoffin} size={1} />
              </button>
            </div>
          </div>

          {/* Sequence display */}
          <div className="d-flex flex-wrap justify-content-center gap-2">
            {normalizedDisplaySequence.map((item, index) => {
              const num = typeof item === 'number' ? item : item.number;
              const color = typeof item === 'number' ? 'light' : item.color;

              // Get tooltip text based on color
              const getTooltipText = (color, number) => {
                switch (color) {
                  case 'dark':
                    return t('trail.died');
                  case 'info':
                    return t('trail.question');
                  case 'success':
                    return t('trail.good');
                  case 'danger':
                    return t('trail.bad');
                  case 'warning':
                    return t('trail.important');
                  default:
                    return String(number);
                }
              };

              // Determine pill class based on color
              let pillClass = 'badge rounded-pill';
              let customStyle = {};
              const tooltipText = getTooltipText(color, num);

              // Use assigned color
              switch (color) {
                case 'primary-1':
                  pillClass += ' text-white';
                  customStyle = {
                    backgroundColor: '#1a303f',
                    borderColor: '#1a303f',
                  };
                  break;
                case 'primary-2':
                  pillClass += ' text-white';
                  customStyle = {
                    backgroundColor: '#D4A24B',
                    borderColor: '#D4A24B',
                  };
                  break;
                case 'dark':
                  pillClass += ' text-white';
                  customStyle = {
                    backgroundColor: '#212529',
                    borderColor: '#212529',
                  };
                  break;
                case 'info':
                  pillClass += ' text-white';
                  customStyle = {
                    backgroundColor: '#0c95b2',
                    borderColor: '#0c95b2',
                  };
                  break;
                case 'success':
                  pillClass += ' text-bg-success';
                  break;
                case 'danger':
                  pillClass += ' text-white';
                  customStyle = {
                    backgroundColor: '#dc3545', // Lighter danger red (Bootstrap default)
                    borderColor: '#dc3545',
                  };
                  break;
                case 'warning':
                  pillClass += ' text-white';
                  customStyle = {
                    backgroundColor: '#ffc107', // Lighter warning yellow
                    borderColor: '#ffc107',
                  };
                  break;
                default:
                  pillClass += ' text-bg-light';
              }

              const pillId = `trail-pill-${index}`;
              const isLastPill = index === normalizedDisplaySequence.length - 1;
              const canDelete =
                isLastPill && normalizedDisplaySequence.length > 1;

              const handlePillClick = async () => {
                if (canDelete) {
                  // Dispose tooltip before deleting the pill
                  const element = pillRefs.current[pillId];
                  if (element) {
                    const bootstrap = await import('bootstrap');
                    const tooltip = bootstrap.Tooltip.getInstance(element);
                    if (tooltip) {
                      tooltip.hide(); // Hide tooltip if visible
                      tooltip.dispose(); // Dispose tooltip instance
                    }
                  }
                  handlePillDelete();
                }
              };

              return (
                <span
                  key={index}
                  id={pillId}
                  ref={(el) => {
                    pillRefs.current[pillId] = el;
                  }}
                  className={pillClass}
                  style={{
                    ...customStyle,
                    cursor: canDelete ? 'pointer' : 'default',
                  }}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  data-bs-title={tooltipText || String(num)}
                  role="button"
                  tabIndex={0}
                  onClick={handlePillClick}
                >
                  {num}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
