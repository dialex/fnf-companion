import React, { useState, useEffect, useRef } from 'react';
import Icon from '@mdi/react';
import {
  mdiChevronDown,
  mdiChevronUp,
  mdiBook,
  mdiPlay,
  mdiPause,
  mdiStop,
  mdiClose,
  mdiCheck,
  mdiVolumeHigh,
  mdiGestureTap,
  mdiGestureTapHold,
  mdiVolumeOff,
} from '@mdi/js';
import { t } from '../translations';

export default function GameSection({
  book,
  onBookChange,
  onLoadGame,
  onSaveGame,
  onReset,
  allSoundsMuted,
  onAllSoundsMutedChange,
  actionSoundsEnabled,
  onActionSoundsEnabledChange,
  soundUrls,
  soundInputs,
  soundErrors,
  soundPlaying,
  soundVolumes,
  onSoundInputChange,
  onSoundSubmit,
  onSoundDelete,
  onSoundPlayPause,
  onSoundStop,
  onSoundVolumeChange,
  initialExpanded = true,
  onExpandedChange,
}) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const masterSoundButtonRef = useRef(null);
  const actionSoundsCheckboxRef = useRef(null);

  useEffect(() => {
    setIsExpanded(initialExpanded);
}, [initialExpanded]);

  useEffect(() => {
    import('bootstrap').then((bootstrap) => {
      const { Tooltip } = bootstrap;

      // Initialize tooltip for action sounds button
      if (actionSoundsCheckboxRef.current) {
        const element = actionSoundsCheckboxRef.current;
        const existingTooltip = Tooltip.getInstance(element);
        if (existingTooltip) existingTooltip.dispose();
        new Tooltip(element, {
          placement: 'top',
          trigger: 'hover focus',
          html: false,
        });
      }

      // Initialize tooltip for master sound button
      if (masterSoundButtonRef.current) {
        const element = masterSoundButtonRef.current;
        const existingTooltip = Tooltip.getInstance(element);
        if (existingTooltip) existingTooltip.dispose();
        new Tooltip(element, {
          placement: 'top',
          trigger: 'hover focus',
          html: false,
        });
      }
    });

    return () => {
      // Cleanup tooltips
      import('bootstrap').then((bootstrap) => {
        const { Tooltip } = bootstrap;
        if (actionSoundsCheckboxRef.current) {
          const tooltip = Tooltip.getInstance(actionSoundsCheckboxRef.current);
          if (tooltip) tooltip.dispose();
        }
        if (masterSoundButtonRef.current) {
          const tooltip = Tooltip.getInstance(masterSoundButtonRef.current);
          if (tooltip) tooltip.dispose();
        }
      });
    };
  }, [actionSoundsEnabled, allSoundsMuted]);

  const toggleCollapse = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (onExpandedChange) {
      onExpandedChange(newExpanded);
    }
  };

  const handleBookChange = (e) => {
    const newValue = e.target.value;
    onBookChange(newValue);
  };

  const handleMasterSoundToggle = () => {
    const newMutedState = !allSoundsMuted;
    onAllSoundsMutedChange(newMutedState);
    // If muting, stop all playing sounds and turn off action sounds
    if (newMutedState) {
      const soundTypes = ['ambience', 'battle', 'victory', 'defeat'];
      soundTypes.forEach((st) => {
        if (soundPlaying[st]) {
          onSoundStop(st);
        }
      });
      // Auto-turn off action sounds when master is muted
      onActionSoundsEnabledChange(false);
    } else {
      // Auto-turn on action sounds when master is unmuted
      onActionSoundsEnabledChange(true);
    }
  };

  return (
    <section id="game" className="section-container mb-4">
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
          <Icon path={mdiBook} size={1} />
          {book.trim().length > 0 ? book : t('sections.game')}
          <Icon
            path={isExpanded ? mdiChevronDown : mdiChevronUp}
            size={1}
            style={{ marginLeft: 'auto' }}
          />
        </h2>
      </div>
      <div
        className={`collapse ${isExpanded ? 'show' : ''}`}
        id="game-collapse"
      >
        <div className="section-content" style={{ minHeight: 'auto' }}>
          <div className="row gx-4">
            <div className="col-12 col-xl-6">
              <h3 className="heading mb-3">{t('game.book')}</h3>
              <div className="field-group mb-3">
                <label className="content field-label">{t('game.name')}</label>
                <input
                  type="text"
                  id="book-input"
                  className="content field-input form-control"
                  placeholder=""
                  value={book}
                  onChange={handleBookChange}
                  maxLength={50}
                />
              </div>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onLoadGame}
                >
                  {t('game.loadGame')}
                </button>
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={onSaveGame}
                  disabled={!book.trim()}
                >
                  {t('game.saveGame')}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={onReset}
                >
                  {t('game.reset')}
                </button>
              </div>
            </div>
            <div className="col-12 col-xl-6">
              <div className="d-flex align-items-center gap-2 mb-3">
                <h3 className="heading mb-0">{t('game.sound')}</h3>
                <button
                  ref={masterSoundButtonRef}
                  type="button"
                  className={
                    allSoundsMuted ? 'btn btn-light' : 'btn btn-success'
                  }
                  onClick={handleMasterSoundToggle}
                  style={{
                    minWidth: 'auto',
                    width: 'auto',
                    padding: '0.5rem',
                  }}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  data-bs-title={
                    allSoundsMuted ? t('game.unmuteAll') : t('game.muteAll')
                  }
                >
                  <Icon
                    path={allSoundsMuted ? mdiVolumeOff : mdiVolumeHigh}
                    size={1}
                  />
                </button>
                <button
                  ref={actionSoundsCheckboxRef}
                  type="button"
                  className={
                    actionSoundsEnabled ? 'btn btn-success' : 'btn btn-light'
                  }
                  onClick={() =>
                    onActionSoundsEnabledChange(!actionSoundsEnabled)
                  }
                  disabled={allSoundsMuted}
                  style={{
                    minWidth: 'auto',
                    width: 'auto',
                    padding: '0.5rem',
                  }}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  data-bs-title={t('game.actionSoundsTooltip')}
                >
                  <Icon
                    path={
                      actionSoundsEnabled ? mdiGestureTapHold : mdiGestureTap
                    }
                    size={1}
                  />
                </button>
              </div>
              <div className="row g-3">
                {['ambience', 'battle', 'victory', 'defeat'].map(
                  (soundType) => (
                    <div key={soundType} className="col-6">
                      <label className="content field-label mb-2">
                        {t(`game.${soundType}`)}
                      </label>
                      {!soundUrls[soundType] ? (
                        <div>
                          <div className="input-group" style={{ flex: 1 }}>
                            <input
                              type="text"
                              className={`content field-input form-control ${
                                soundErrors[soundType] ? 'is-invalid' : ''
                              }`}
                              placeholder={t('game.youtubeUrl')}
                              value={soundInputs[soundType]}
                              onChange={(e) =>
                                onSoundInputChange(soundType, e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  onSoundSubmit(soundType);
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => onSoundSubmit(soundType)}
                              style={{
                                minWidth: 'auto',
                                width: 'auto',
                                padding: '0.5rem',
                              }}
                            >
                              <Icon path={mdiCheck} size={1} />
                            </button>
                          </div>
                          {soundErrors[soundType] && (
                            <div className="invalid-feedback d-block sound-error">
                              {soundErrors[soundType]}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => onSoundPlayPause(soundType)}
                            disabled={allSoundsMuted}
                            style={{
                              minWidth: 'auto',
                              width: 'auto',
                              padding: '0.5rem',
                            }}
                            title={
                              soundPlaying[soundType]
                                ? t('game.pause')
                                : t('game.play')
                            }
                          >
                            <Icon
                              path={
                                soundPlaying[soundType] ? mdiPause : mdiPlay
                              }
                              size={1}
                            />
                          </button>
                          <button
                            type="button"
                            className="btn btn-light"
                            onClick={() => onSoundStop(soundType)}
                            disabled={allSoundsMuted}
                            style={{
                              minWidth: 'auto',
                              width: 'auto',
                              padding: '0.5rem',
                            }}
                            title={t('game.stop')}
                          >
                            <Icon path={mdiStop} size={1} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-light"
                            onClick={() => onSoundDelete(soundType)}
                            disabled={allSoundsMuted}
                            style={{
                              minWidth: 'auto',
                              width: 'auto',
                              padding: '0.5rem',
                            }}
                            title={t('game.delete')}
                          >
                            <Icon path={mdiClose} size={1} />
                          </button>
                          <div className="d-flex align-items-center gap-1">
                            <Icon path={mdiVolumeHigh} size={0.8} />
                            <input
                              type="range"
                              className="form-range"
                              min="0"
                              max="100"
                              value={soundVolumes[soundType]}
                              onChange={(e) =>
                                onSoundVolumeChange(
                                  soundType,
                                  parseInt(e.target.value)
                                )
                              }
                              disabled={allSoundsMuted}
                              style={{
                                width: '50px',
                                height: '4px',
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
