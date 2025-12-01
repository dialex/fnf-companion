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
    <div className="min-h-screen bg-beige">
      <header
        className="sticky top-0 z-50 text-white shadow-md"
        style={{ backgroundColor: 'var(--header-bg)' }}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon path={mdiBookAccount} size={1.5} className="text-white" />
            <h1 className="heading text-3xl">{t('app.title')}</h1>
          </div>
          <nav className="flex items-center gap-6">
            <a
              href="#character"
              className="content hover:text-yellow-400 transition"
            >
              {t('navigation.character')}
            </a>
            <a
              href="#inventory"
              className="content hover:text-yellow-400 transition"
            >
              {t('navigation.inventory')}
            </a>
            <select
              value={currentLang}
              onChange={handleLanguageChange}
              className="content bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 cursor-pointer hover:bg-gray-600 transition"
            >
              {getAvailableLanguages().map((lang) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section id="character" className="section-container">
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
                  className="content field-input"
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
                  className="content field-input"
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
                  className="content field-input"
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
                  className="content field-input"
                  min="0"
                  value={luck}
                  onChange={(e) => handleNumberChange(setLuck, e.target.value)}
                  placeholder={t('placeholders.luck')}
                />
              </div>
            </div>
          </section>
          <section id="consumables" className="section-container">
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
                  className="content field-input"
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
                  className="content field-input"
                  min="0"
                  value={meals}
                  onChange={(e) => handleNumberChange(setMeals, e.target.value)}
                />
              </div>
            </div>
          </section>
          <section id="dice-rolls" className="section-container">
            <div className="section-header">
              <h2 className="heading section-title">
                {t('sections.diceRolls')}
              </h2>
            </div>
            <div className="section-content">
              <div className="dice-buttons">
                <button
                  type="button"
                  className="content dice-btn"
                  onClick={() => {}}
                >
                  {t('dice.testYourLuck')}
                </button>
                <button
                  type="button"
                  className="content dice-btn"
                  onClick={() => {}}
                >
                  {t('dice.roll1')}
                </button>
                <button
                  type="button"
                  className="content dice-btn"
                  onClick={() => {}}
                >
                  {t('dice.roll2')}
                </button>
              </div>
            </div>
          </section>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <section id="inventory" className="section-container">
            <div className="section-header">
              <h2 className="heading section-title">
                {t('sections.inventory')}
              </h2>
            </div>
            <div className="section-content">
              <textarea
                className="content field-input"
                value={inventory}
                onChange={(e) => setInventory(e.target.value)}
                rows={10}
                style={{ resize: 'vertical', minHeight: '200px' }}
              />
            </div>
          </section>
          <section className="section-container">
            <div className="section-header">
              <h2 className="heading section-title"></h2>
            </div>
            <div className="section-content">{/* Empty section */}</div>
          </section>
        </div>
        <div className="grid grid-cols-1 gap-6 mt-6">
          <section id="fight" className="section-container">
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
