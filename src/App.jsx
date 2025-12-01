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

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCurrentLang(newLang);
  };

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
            <Icon path={mdiBookAccount} size={1.5} className="text-white" />
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
            <div className="d-flex align-items-center gap-2">
              <Icon path={mdiWebBox} size={1} className="text-white" />
              <select
                value={currentLang}
                onChange={handleLanguageChange}
                className="form-select content"
                style={{ width: 'auto' }}
              >
                {getAvailableLanguages().map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-5">
        <div className="row g-4">
          <section id="character" className="col-12 col-md-4 section-container">
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
                  onChange={(e) => handleNumberChange(setSkill, e.target.value)}
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
                  onChange={(e) => handleNumberChange(setLuck, e.target.value)}
                  placeholder={t('placeholders.luck')}
                />
              </div>
            </div>
          </section>
          <section id="consumables" className="col-12 col-md-4 section-container">
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
                  onChange={(e) => handleNumberChange(setCoins, e.target.value)}
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
                  onChange={(e) => handleNumberChange(setMeals, e.target.value)}
                />
              </div>
            </div>
          </section>
          <section id="dice-rolls" className="col-12 col-md-4 section-container">
            <div className="section-header">
              <h2 className="heading section-title">
                {t('sections.diceRolls')}
              </h2>
            </div>
            <div className="section-content">
              <button type="button" className="btn btn-secondary">
                test
              </button>
            </div>
          </section>
        </div>
        <div className="row g-4 mt-4">
          <section id="inventory" className="col-12 col-md-6 section-container">
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
          <section id="map" className="col-12 col-md-6 section-container">
            <div className="section-header">
              <h2 className="heading section-title">{t('sections.map')}</h2>
            </div>
            <div className="section-content">{/* Map section */}</div>
          </section>
        </div>
        <div className="row g-4 mt-4">
          <section id="fight" className="col-12 section-container">
            <div className="section-header">
              <h2 className="heading section-title">{t('sections.fight')}</h2>
            </div>
            <div className="section-content">
              {/* Fight section - empty for now */}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
