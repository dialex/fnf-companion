import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import {
  mdiBookAccount,
  mdiSword,
  mdiHeart,
  mdiAccount,
  mdiClover,
  mdiHandCoin,
  mdiFoodApple,
  mdiSilverwareForkKnife,
  mdiDice1,
  mdiDice2,
  mdiDice3,
  mdiDice4,
  mdiDice5,
  mdiDice6,
  mdiDiceMultiple,
  mdiWebBox,
  mdiChevronDown,
  mdiLock,
  mdiLockOpenVariant,
} from '@mdi/js';
import {
  t,
  setLanguage,
  getCurrentLanguage,
  getAvailableLanguages,
} from './translations';
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [skill, setSkill] = useState('');
  const [health, setHealth] = useState('');
  const [luck, setLuck] = useState('');
  const [coins, setCoins] = useState('0');
  const [meals, setMeals] = useState('10');
  const [inventory, setInventory] = useState('');
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [navbarExpanded, setNavbarExpanded] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [maxSkill, setMaxSkill] = useState(null);
  const [maxHealth, setMaxHealth] = useState(null);
  const [maxLuck, setMaxLuck] = useState(null);
  const [rollingButton, setRollingButton] = useState(null);
  const [rollDieResult, setRollDieResult] = useState(null);
  const [rollDiceResults, setRollDiceResults] = useState(null);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLanguageSelect(false);
  };

  const handleLanguageIconClick = () => {
    setShowLanguageSelect(!showLanguageSelect);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLanguageSelect && !event.target.closest('.language-selector')) {
        setShowLanguageSelect(false);
      }
    };

    if (showLanguageSelect) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageSelect]);

  const handleNumberChange = (setter, value, maxValue) => {
    const numValue = parseInt(value) || 0;
    const clampedValue =
      maxValue !== null ? Math.min(numValue, maxValue) : numValue;
    setter(String(Math.max(0, clampedValue)));
  };

  const handleConsumeMeal = () => {
    const currentMeals = parseInt(meals) || 0;
    if (currentMeals > 0) {
      // Play eat sound
      const audio = new Audio(
        `${import.meta.env.BASE_URL}audio/minecraft-eat.mp3`
      );
      audio.play().catch((error) => {
        // Silently handle audio play errors (e.g., user hasn't interacted yet)
        console.warn('Could not play audio:', error);
      });

      setMeals(String(currentMeals - 1));
      const currentHealth = parseInt(health) || 0;
      const newHealth = currentHealth + 4;
      setHealth(
        String(maxHealth !== null ? Math.min(newHealth, maxHealth) : newHealth)
      );
    }
  };

  const handleRandomStats = () => {
    // Skill: random 1-6 + 6
    const skillRoll = Math.floor(Math.random() * 6) + 1;
    const newSkill = skillRoll + 6;
    setSkill(
      String(maxSkill !== null ? Math.min(newSkill, maxSkill) : newSkill)
    );

    // Health: two random 1-6, sum them, then + 12
    const healthRoll1 = Math.floor(Math.random() * 6) + 1;
    const healthRoll2 = Math.floor(Math.random() * 6) + 1;
    const newHealth = healthRoll1 + healthRoll2 + 12;
    setHealth(
      String(maxHealth !== null ? Math.min(newHealth, maxHealth) : newHealth)
    );

    // Luck: random 1-6 + 6
    const luckRoll = Math.floor(Math.random() * 6) + 1;
    const newLuck = luckRoll + 6;
    setLuck(String(maxLuck !== null ? Math.min(newLuck, maxLuck) : newLuck));
  };

  const handleToggleLock = () => {
    if (!isLocked) {
      // Lock: set max values to current values
      setMaxSkill(parseInt(skill) || null);
      setMaxHealth(parseInt(health) || null);
      setMaxLuck(parseInt(luck) || null);
    } else {
      // Unlock: clear max values
      setMaxSkill(null);
      setMaxHealth(null);
      setMaxLuck(null);
    }
    setIsLocked(!isLocked);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'default');
  }, []);

  return (
    <div className="min-vh-100 bg-beige">
      <header
        className="navbar navbar-expand-lg sticky-top text-white shadow"
        style={{ backgroundColor: 'var(--header-bg)', zIndex: 1050 }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="d-flex align-items-center gap-3">
            <Icon path={mdiBookAccount} size={2} className="text-white" />
            <h1 className="heading fs-1 mb-0">{t('app.title')}</h1>
          </div>
          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setNavbarExpanded(!navbarExpanded)}
            aria-controls="navbarNav"
            aria-expanded={navbarExpanded}
            aria-label="Toggle navigation"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '0.25rem 0.5rem',
            }}
          >
            <span
              className="navbar-toggler-icon"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 1%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e")`,
              }}
            />
          </button>
          <nav
            className={`collapse navbar-collapse ${navbarExpanded ? 'show' : ''}`}
            id="navbarNav"
          >
            <div className="navbar-nav d-flex align-items-center gap-4 ms-auto">
              <a
                href="#character"
                className="nav-link content text-white text-decoration-none"
                style={{ transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
                onMouseLeave={(e) => (e.target.style.color = 'white')}
                onClick={() => setNavbarExpanded(false)}
              >
                {t('navigation.character')}
              </a>
              <a
                href="#consumables"
                className="nav-link content text-white text-decoration-none"
                style={{ transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
                onMouseLeave={(e) => (e.target.style.color = 'white')}
                onClick={() => setNavbarExpanded(false)}
              >
                {t('navigation.consumables')}
              </a>
              <a
                href="#dice-rolls"
                className="nav-link content text-white text-decoration-none"
                style={{ transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
                onMouseLeave={(e) => (e.target.style.color = 'white')}
                onClick={() => setNavbarExpanded(false)}
              >
                {t('navigation.diceRolls')}
              </a>
              <a
                href="#inventory"
                className="nav-link content text-white text-decoration-none"
                style={{ transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
                onMouseLeave={(e) => (e.target.style.color = 'white')}
                onClick={() => setNavbarExpanded(false)}
              >
                {t('navigation.inventory')}
              </a>
              <a
                href="#map"
                className="nav-link content text-white text-decoration-none"
                style={{ transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
                onMouseLeave={(e) => (e.target.style.color = 'white')}
                onClick={() => setNavbarExpanded(false)}
              >
                {t('navigation.map')}
              </a>
              <a
                href="#fight"
                className="nav-link content text-white text-decoration-none"
                style={{ transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
                onMouseLeave={(e) => (e.target.style.color = 'white')}
                onClick={() => setNavbarExpanded(false)}
              >
                {t('navigation.fight')}
              </a>
              <div className="position-relative language-selector">
                <div
                  className="d-flex align-items-center"
                  style={{ cursor: 'pointer', gap: '0.125rem' }}
                  onClick={handleLanguageIconClick}
                >
                  <Icon path={mdiWebBox} size={1} className="text-white" />
                  <Icon
                    path={mdiChevronDown}
                    size={0.8}
                    className="text-white"
                  />
                </div>
                {showLanguageSelect && (
                  <div
                    className="position-absolute"
                    style={{
                      top: '100%',
                      right: 0,
                      marginTop: '0.5rem',
                      minWidth: '120px',
                      zIndex: 1060,
                      backgroundColor: 'white',
                      borderRadius: '0.25rem',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      overflow: 'hidden',
                    }}
                  >
                    {getAvailableLanguages().map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        className="content w-100 text-start border-0 bg-transparent px-3 py-2"
                        style={{
                          cursor: 'pointer',
                          color: '#333',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f8f9fa';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                        onClick={() => handleLanguageChange(lang)}
                      >
                        {lang === 'en'
                          ? 'English'
                          : lang === 'pt'
                            ? 'Português'
                            : lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      </header>
      <main className="container mx-auto py-4">
        <div className="row gx-4 mb-4">
          <div className="col-12 col-md-4">
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
                  <label className="content field-label">
                    {t('fields.name')}
                  </label>
                  <input
                    type="text"
                    className="content field-input form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <div className="field-icon">
                    <Icon path={mdiSword} size={1} />
                  </div>
                  <label className="content field-label">
                    {t('fields.skill')}
                  </label>
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
                        handleNumberChange(setSkill, e.target.value, maxSkill)
                      }
                      placeholder={t('placeholders.skill')}
                    />
                  </div>
                </div>
                <div className="field-group">
                  <div className="field-icon">
                    <Icon path={mdiHeart} size={1} />
                  </div>
                  <label className="content field-label">
                    {t('fields.health')}
                  </label>
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
                        handleNumberChange(setHealth, e.target.value, maxHealth)
                      }
                      placeholder={t('placeholders.health')}
                    />
                  </div>
                </div>
                <div className="field-group">
                  <div className="field-icon">
                    <Icon path={mdiClover} size={1} />
                  </div>
                  <label className="content field-label">
                    {t('fields.luck')}
                  </label>
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
                        handleNumberChange(setLuck, e.target.value, maxLuck)
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
                      setRollingButton('randomize');
                      setTimeout(() => {
                        handleRandomStats();
                        setRollingButton(null);
                      }, 1000);
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
                    onClick={handleToggleLock}
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
          </div>
          <div className="col-12 col-md-4">
            <section id="consumables" className="section-container mb-4 h-100">
              <div className="section-header">
                <h2 className="heading section-title">
                  {t('sections.consumables')}
                </h2>
              </div>
              <div className="section-content">
                <div className="field-group">
                  <div className="field-icon">
                    <Icon path={mdiHandCoin} size={1} />
                  </div>
                  <label className="content field-label">
                    {t('fields.coins')}
                  </label>
                  <input
                    type="number"
                    className="content field-input form-control"
                    min="0"
                    value={coins}
                    onChange={(e) =>
                      handleNumberChange(setCoins, e.target.value)
                    }
                  />
                </div>
                <div className="field-group">
                  <div className="field-icon">
                    <Icon path={mdiFoodApple} size={1} />
                  </div>
                  <label className="content field-label">
                    {t('fields.meals')}
                  </label>
                  <div className="input-group" style={{ flex: 1 }}>
                    <input
                      type="number"
                      className="content field-input form-control"
                      min="0"
                      value={meals}
                      onChange={(e) =>
                        handleNumberChange(setMeals, e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleConsumeMeal}
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
                </div>
              </div>
            </section>
          </div>
          <div className="col-12 col-md-4">
            <section id="dice-rolls" className="section-container mb-4 h-100">
              <div className="section-header">
                <h2 className="heading section-title">
                  {t('sections.diceRolls')}
                </h2>
              </div>
              <div className="section-content">
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex justify-content-center">
                    <button
                      type="button"
                      className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                    >
                      {t('dice.testYourLuck')}
                      <Icon path={mdiClover} size={1} />
                    </button>
                  </div>
                  <div className="d-flex gap-2 justify-content-center">
                    <button
                      type="button"
                      className="btn btn-light d-flex align-items-center justify-content-center gap-2"
                      onClick={() => {
                        if (rollingButton !== null) return;
                        setRollingButton('rollDie');
                        setTimeout(() => {
                          const result = Math.floor(Math.random() * 6) + 1;
                          setRollDieResult(result);
                          setRollDiceResults(null);
                          setRollingButton(null);
                        }, 1000);
                      }}
                      disabled={rollingButton !== null}
                    >
                      {t('dice.rollDie')}
                      <Icon
                        path={mdiDice3}
                        size={1}
                        className={
                          rollingButton === 'rollDie' ? 'dice-rolling' : ''
                        }
                        style={
                          rollingButton === 'rollDie'
                            ? { animationDuration: '0.3s' }
                            : {}
                        }
                      />
                    </button>
                    <button
                      type="button"
                      className="btn btn-light d-flex align-items-center justify-content-center gap-2"
                      onClick={() => {
                        if (rollingButton !== null) return;
                        setRollingButton('rollDice');
                        setTimeout(() => {
                          const result1 = Math.floor(Math.random() * 6) + 1;
                          const result2 = Math.floor(Math.random() * 6) + 1;
                          setRollDiceResults([result1, result2]);
                          setRollDieResult(null);
                          setRollingButton(null);
                        }, 1000);
                      }}
                      disabled={rollingButton !== null}
                    >
                      {t('dice.rollDice')}
                      <Icon
                        path={mdiDiceMultiple}
                        size={1}
                        className={
                          rollingButton === 'rollDice' ? 'dice-rolling' : ''
                        }
                        style={
                          rollingButton === 'rollDice'
                            ? { animationDuration: '0.3s' }
                            : {}
                        }
                      />
                    </button>
                  </div>
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ minHeight: '100px' }}
                  >
                    {rollDieResult && (
                      <Icon
                        path={
                          rollDieResult === 1
                            ? mdiDice1
                            : rollDieResult === 2
                              ? mdiDice2
                              : rollDieResult === 3
                                ? mdiDice3
                                : rollDieResult === 4
                                  ? mdiDice4
                                  : rollDieResult === 5
                                    ? mdiDice5
                                    : mdiDice6
                        }
                        size={3}
                        style={{ color: '#007e6e' }}
                      />
                    )}
                    {rollDiceResults && (
                      <div className="d-flex align-items-center">
                        <Icon
                          path={
                            rollDiceResults[0] === 1
                              ? mdiDice1
                              : rollDiceResults[0] === 2
                                ? mdiDice2
                                : rollDiceResults[0] === 3
                                  ? mdiDice3
                                  : rollDiceResults[0] === 4
                                    ? mdiDice4
                                    : rollDiceResults[0] === 5
                                      ? mdiDice5
                                      : mdiDice6
                          }
                          size={3}
                          style={{ color: '#007e6e' }}
                        />
                        <Icon
                          path={
                            rollDiceResults[1] === 1
                              ? mdiDice1
                              : rollDiceResults[1] === 2
                                ? mdiDice2
                                : rollDiceResults[1] === 3
                                  ? mdiDice3
                                  : rollDiceResults[1] === 4
                                    ? mdiDice4
                                    : rollDiceResults[1] === 5
                                      ? mdiDice5
                                      : mdiDice6
                          }
                          size={3}
                          style={{ color: '#007e6e' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
        <div className="row gx-4 mb-4">
          <div className="col-12 col-md-6">
            <section id="inventory" className="section-container mb-4 h-100">
              <div className="section-header">
                <h2 className="heading section-title">
                  {t('sections.inventory')}
                </h2>
              </div>
              <div className="section-content">
                <textarea
                  className="content field-input form-control"
                  value={inventory}
                  onChange={(e) => setInventory(e.target.value)}
                  rows={10}
                  style={{ resize: 'vertical', minHeight: '200px' }}
                />
              </div>
            </section>
          </div>
          <div className="col-12 col-md-6">
            <section id="map" className="section-container mb-4 h-100">
              <div className="section-header">
                <h2 className="heading section-title">{t('sections.map')}</h2>
              </div>
              <div className="section-content">{/* Map section */}</div>
            </section>
          </div>
        </div>
        <div className="row gx-4 mb-4">
          <div className="col-12">
            <section id="fight" className="section-container mb-4 h-100">
              <div className="section-header">
                <h2 className="heading section-title">{t('sections.fight')}</h2>
              </div>
              <div className="section-content">
                {/* Fight section - empty for now */}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
