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
  const [testLuckResult, setTestLuckResult] = useState(null);
  const [isTestingLuck, setIsTestingLuck] = useState(false);
  const [testSkillResult, setTestSkillResult] = useState(null);
  const [diceRollingType, setDiceRollingType] = useState(null);
  const [fieldBadges, setFieldBadges] = useState({});

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

  const showFieldBadge = (fieldName, value, type = 'success') => {
    const id = Date.now();
    setFieldBadges((prev) => ({
      ...prev,
      [fieldName]: { value, type, id },
    }));
    // Clear badge after animation completes
    setTimeout(() => {
      setFieldBadges((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }, 1500);
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
      showFieldBadge('meals', '-1', 'danger');

      const currentHealth = parseInt(health) || 0;
      const newHealth = currentHealth + 4;
      const actualIncrease =
        maxHealth !== null ? Math.min(newHealth, maxHealth) - currentHealth : 4;
      setHealth(
        String(maxHealth !== null ? Math.min(newHealth, maxHealth) : newHealth)
      );
      if (actualIncrease > 0) {
        showFieldBadge('health', `+${actualIncrease}`, 'success');
      }
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

  const getDiceIcon = (value) => {
    switch (value) {
      case 1:
        return mdiDice1;
      case 2:
        return mdiDice2;
      case 3:
        return mdiDice3;
      case 4:
        return mdiDice4;
      case 5:
        return mdiDice5;
      case 6:
        return mdiDice6;
      default:
        return mdiDice1;
    }
  };

  const handleTestYourLuck = () => {
    const currentLuck = parseInt(luck) || 0;
    if (currentLuck <= 0 || isTestingLuck || diceRollingType !== null) return;

    // Start animation in results area
    setIsTestingLuck(true);
    setDiceRollingType('testLuck');

    // Clear other results
    setRollDieResult(null);
    setRollDiceResults(null);
    setTestLuckResult(null);
    setTestSkillResult(null);

    // After animation, roll dice and show result
    setTimeout(() => {
      // Roll two dice
      const roll1 = Math.floor(Math.random() * 6) + 1;
      const roll2 = Math.floor(Math.random() * 6) + 1;
      const sum = roll1 + roll2;

      // Check if lucky (sum <= luck)
      const isLucky = sum <= currentLuck;

      // Play lucky sound if lucky
      if (isLucky) {
        const audio = new Audio(
          `${import.meta.env.BASE_URL}audio/rayman-lucky.mp3`
        );
        audio.play().catch((error) => {
          // Silently handle audio play errors (e.g., user hasn't interacted yet)
          console.warn('Could not play audio:', error);
        });
      }

      // Set result
      setTestLuckResult({
        roll1,
        roll2,
        isLucky,
      });

      // Decrease luck by 1
      const newLuck = Math.max(0, currentLuck - 1);
      setLuck(String(newLuck));

      // Stop animation
      setIsTestingLuck(false);
      setDiceRollingType(null);
    }, 1000);
  };

  const handleTestYourSkill = () => {
    const currentSkill = parseInt(skill) || 0;
    if (currentSkill <= 0 || diceRollingType !== null) return;

    // Start animation in results area
    setDiceRollingType('testSkill');

    // Clear other results
    setRollDieResult(null);
    setRollDiceResults(null);
    setTestLuckResult(null);
    setTestSkillResult(null);

    // After animation, roll dice and show result
    setTimeout(() => {
      // Roll two dice
      const roll1 = Math.floor(Math.random() * 6) + 1;
      const roll2 = Math.floor(Math.random() * 6) + 1;
      const sum = roll1 + roll2;

      // Check if passed (sum <= skill)
      const passed = sum <= currentSkill;

      // Set result
      setTestSkillResult({
        roll1,
        roll2,
        passed,
      });

      // Stop animation
      setDiceRollingType(null);
    }, 1000);
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
                <div className="field-group" style={{ position: 'relative' }}>
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
                  {fieldBadges.health && (
                    <span
                      className={`badge bg-${
                        fieldBadges.health.type === 'success'
                          ? 'success'
                          : 'danger'
                      } field-badge`}
                      key={fieldBadges.health.id}
                    >
                      {fieldBadges.health.value}
                    </span>
                  )}
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
                <div className="field-group" style={{ position: 'relative' }}>
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
                  {fieldBadges.meals && (
                    <span
                      className={`badge bg-${
                        fieldBadges.meals.type === 'success'
                          ? 'success'
                          : 'danger'
                      } field-badge`}
                      key={fieldBadges.meals.id}
                    >
                      {fieldBadges.meals.value}
                    </span>
                  )}
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
                  <div className="d-flex gap-2 justify-content-center">
                    <button
                      type="button"
                      className="btn btn-secondary d-flex align-items-center justify-content-center gap-2"
                      onClick={handleTestYourLuck}
                      disabled={
                        !luck ||
                        parseInt(luck) <= 0 ||
                        isTestingLuck ||
                        diceRollingType !== null
                      }
                    >
                      {t('dice.testYourLuck')}
                      <Icon path={mdiClover} size={1} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary d-flex align-items-center justify-content-center gap-2"
                      onClick={handleTestYourSkill}
                      disabled={
                        !skill ||
                        parseInt(skill) <= 0 ||
                        diceRollingType !== null
                      }
                    >
                      {t('dice.testYourSkill')}
                      <Icon path={mdiSword} size={1} />
                    </button>
                  </div>
                  <div className="d-flex gap-2 justify-content-center">
                    <button
                      type="button"
                      className="btn btn-light d-flex align-items-center justify-content-center gap-2"
                      onClick={() => {
                        if (diceRollingType !== null) return;
                        setDiceRollingType('rollDie');
                        // Clear other results
                        setTestLuckResult(null);
                        setTestSkillResult(null);
                        setRollDiceResults(null);
                        setRollDieResult(null);
                        setTimeout(() => {
                          const result = Math.floor(Math.random() * 6) + 1;
                          setRollDieResult(result);
                          setDiceRollingType(null);
                        }, 1000);
                      }}
                      disabled={diceRollingType !== null}
                    >
                      {t('dice.rollDie')}
                      <Icon path={mdiDice3} size={1} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-light d-flex align-items-center justify-content-center gap-2"
                      onClick={() => {
                        if (diceRollingType !== null) return;
                        setDiceRollingType('rollDice');
                        // Clear other results
                        setTestLuckResult(null);
                        setTestSkillResult(null);
                        setRollDieResult(null);
                        setRollDiceResults(null);
                        setTimeout(() => {
                          const result1 = Math.floor(Math.random() * 6) + 1;
                          const result2 = Math.floor(Math.random() * 6) + 1;
                          setRollDiceResults([result1, result2]);
                          setDiceRollingType(null);
                        }, 1000);
                      }}
                      disabled={diceRollingType !== null}
                    >
                      {t('dice.rollDice')}
                      <Icon path={mdiDiceMultiple} size={1} />
                    </button>
                  </div>
                  <div
                    className="d-flex flex-column justify-content-center align-items-center"
                    style={{ minHeight: '100px', gap: '5px' }}
                  >
                    {diceRollingType === 'rollDie' && (
                      <Icon
                        path={mdiDice3}
                        size={3}
                        className="dice-rolling"
                        style={{ color: '#007e6e', animationDuration: '0.3s' }}
                      />
                    )}
                    {diceRollingType === 'rollDice' && (
                      <div className="d-flex align-items-center gap-2">
                        <Icon
                          path={mdiDice3}
                          size={3}
                          className="dice-rolling"
                          style={{
                            color: '#007e6e',
                            animationDuration: '0.3s',
                          }}
                        />
                        <Icon
                          path={mdiDice3}
                          size={3}
                          className="dice-rolling"
                          style={{
                            color: '#007e6e',
                            animationDuration: '0.3s',
                          }}
                        />
                      </div>
                    )}
                    {diceRollingType === 'testSkill' && (
                      <div className="d-flex align-items-center gap-2">
                        <Icon
                          path={mdiDice3}
                          size={3}
                          className="dice-rolling"
                          style={{
                            color: '#007e6e',
                            animationDuration: '0.3s',
                          }}
                        />
                        <Icon
                          path={mdiDice3}
                          size={3}
                          className="dice-rolling"
                          style={{
                            color: '#007e6e',
                            animationDuration: '0.3s',
                          }}
                        />
                      </div>
                    )}
                    {diceRollingType === 'testLuck' && (
                      <div className="d-flex align-items-center gap-2">
                        <Icon
                          path={mdiDice3}
                          size={3}
                          className="dice-rolling"
                          style={{
                            color: '#007e6e',
                            animationDuration: '0.3s',
                          }}
                        />
                        <Icon
                          path={mdiDice3}
                          size={3}
                          className="dice-rolling"
                          style={{
                            color: '#007e6e',
                            animationDuration: '0.3s',
                          }}
                        />
                      </div>
                    )}
                    {testSkillResult && diceRollingType === null && (
                      <>
                        <div
                          className={`alert content ${
                            testSkillResult.passed
                              ? 'alert-success'
                              : 'alert-danger'
                          } mb-0`}
                          role="alert"
                        >
                          {testSkillResult.passed
                            ? t('dice.youPassedTheTest')
                            : t('dice.youFailedTheTest')}
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <Icon
                            path={getDiceIcon(testSkillResult.roll1)}
                            size={3}
                            style={{ color: '#007e6e' }}
                          />
                          <Icon
                            path={getDiceIcon(testSkillResult.roll2)}
                            size={3}
                            style={{ color: '#007e6e' }}
                          />
                        </div>
                      </>
                    )}
                    {testLuckResult && diceRollingType === null && (
                      <>
                        <div
                          className={`alert content ${
                            testLuckResult.isLucky
                              ? 'alert-success'
                              : 'alert-danger'
                          } mb-0`}
                          role="alert"
                        >
                          {testLuckResult.isLucky
                            ? t('dice.youWereLucky')
                            : t('dice.youWereUnlucky')}
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <Icon
                            path={getDiceIcon(testLuckResult.roll1)}
                            size={3}
                            style={{ color: '#007e6e' }}
                          />
                          <Icon
                            path={getDiceIcon(testLuckResult.roll2)}
                            size={3}
                            style={{ color: '#007e6e' }}
                          />
                        </div>
                      </>
                    )}
                    {rollDieResult && diceRollingType === null && (
                      <Icon
                        path={getDiceIcon(rollDieResult)}
                        size={3}
                        style={{ color: '#007e6e' }}
                      />
                    )}
                    {rollDiceResults && diceRollingType === null && (
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
