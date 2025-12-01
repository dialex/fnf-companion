import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import {
  mdiBookAccount,
  mdiSword,
  mdiHeart,
  mdiLeadPencil,
  mdiAccount,
  mdiClover,
  mdiHandCoin,
  mdiFoodApple,
  mdiDiceMultiple,
  mdiWebBox,
  mdiChevronDown,
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
  const [meals, setMeals] = useState('0');
  const [inventory, setInventory] = useState('');
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCurrentLang(lang);
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

  const handleNumberChange = (setter, value) => {
    const numValue = parseInt(value) || 0;
    setter(String(Math.max(0, numValue)));
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'default');
  }, []);

  return (
    <div className="min-vh-100 bg-beige">
      <header
        className="sticky-top text-white shadow"
        style={{ backgroundColor: 'var(--header-bg)', zIndex: 1050 }}
      >
        <div className="container mx-auto px-4 py-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <Icon path={mdiBookAccount} size={2} className="text-white" />
            <h1 className="heading fs-1">{t('app.title')}</h1>
          </div>
          <nav className="d-flex align-items-center gap-4">
            <a
              href="#character"
              className="content text-white text-decoration-none"
              style={{ transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
              onMouseLeave={(e) => (e.target.style.color = 'white')}
            >
              {t('navigation.character')}
            </a>
            <a
              href="#inventory"
              className="content text-white text-decoration-none"
              style={{ transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
              onMouseLeave={(e) => (e.target.style.color = 'white')}
            >
              {t('navigation.inventory')}
            </a>
            <div className="position-relative language-selector">
              <div
                className="d-flex align-items-center"
                style={{ cursor: 'pointer', gap: '0.125rem' }}
                onClick={handleLanguageIconClick}
              >
                <Icon path={mdiWebBox} size={1} className="text-white" />
                <Icon path={mdiChevronDown} size={0.8} className="text-white" />
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
                  <input
                    type="number"
                    className="content field-input form-control"
                    min="0"
                    value={skill}
                    onChange={(e) =>
                      handleNumberChange(setSkill, e.target.value)
                    }
                    placeholder={t('placeholders.skill')}
                  />
                </div>
                <div className="field-group">
                  <div className="field-icon">
                    <Icon path={mdiHeart} size={1} />
                  </div>
                  <label className="content field-label">
                    {t('fields.health')}
                  </label>
                  <input
                    type="number"
                    className="content field-input form-control"
                    min="0"
                    value={health}
                    onChange={(e) =>
                      handleNumberChange(setHealth, e.target.value)
                    }
                    placeholder={t('placeholders.health')}
                  />
                </div>
                <div className="field-group">
                  <div className="field-icon">
                    <Icon path={mdiClover} size={1} />
                  </div>
                  <label className="content field-label">
                    {t('fields.luck')}
                  </label>
                  <input
                    type="number"
                    className="content field-input form-control"
                    min="0"
                    value={luck}
                    onChange={(e) =>
                      handleNumberChange(setLuck, e.target.value)
                    }
                    placeholder={t('placeholders.luck')}
                  />
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
                  <input
                    type="number"
                    className="content field-input form-control"
                    min="0"
                    value={meals}
                    onChange={(e) =>
                      handleNumberChange(setMeals, e.target.value)
                    }
                  />
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
                    <button type="button" className="btn btn-primary">
                      {t('dice.testYourLuck')}
                    </button>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-light flex-fill">
                      {t('dice.roll1')}
                    </button>
                    <button type="button" className="btn btn-light flex-fill">
                      {t('dice.roll2')}
                    </button>
                  </div>
                  <div style={{ minHeight: '100px' }}>
                    {/* Dice roll results will be displayed here */}
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
