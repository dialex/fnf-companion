import React, { useState } from 'react';
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
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [skill, setSkill] = useState('');
  const [health, setHealth] = useState('');
  const [luck, setLuck] = useState('');
  const [coins, setCoins] = useState('0');
  const [meals, setMeals] = useState('0');

  const handleNumberChange = (setter, value) => {
    const numValue = parseInt(value) || 0;
    setter(String(Math.max(0, numValue)));
  };

  return (
    <div className="min-h-screen bg-beige">
      <header className="sticky top-0 z-50 bg-gray-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon path={mdiBookAccount} size={1.5} className="text-white" />
            <h1 className="heading text-3xl">Fight & Fantasy Companion</h1>
          </div>
          <nav className="flex gap-6">
            <a
              href="#character"
              className="content hover:text-yellow-400 transition"
            >
              Character
            </a>
            <a
              href="#inventory"
              className="content hover:text-yellow-400 transition"
            >
              Inventory
            </a>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section id="character" className="section-container">
            <div className="section-header">
              <h2 className="heading section-title">
                {name.trim().length > 0 ? name : 'Character'}
              </h2>
            </div>
            <div className="section-content">
              <div className="field-group">
                <div className="field-icon">
                  <Icon path={mdiAccount} size={1} />
                </div>
                <label className="content field-label">Name</label>
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
                <label className="content field-label">Skill</label>
                <input
                  type="number"
                  className="content field-input"
                  min="0"
                  value={skill}
                  onChange={(e) => handleNumberChange(setSkill, e.target.value)}
                  placeholder="1 die + 6"
                />
              </div>
              <div className="field-group">
                <div className="field-icon">
                  <Icon path={mdiHeart} size={1} />
                </div>
                <label className="content field-label">Health</label>
                <input
                  type="number"
                  className="content field-input"
                  min="0"
                  value={health}
                  onChange={(e) =>
                    handleNumberChange(setHealth, e.target.value)
                  }
                  placeholder="2 dice + 12"
                />
              </div>
              <div className="field-group">
                <div className="field-icon">
                  <Icon path={mdiClover} size={1} />
                </div>
                <label className="content field-label">Luck</label>
                <input
                  type="number"
                  className="content field-input"
                  min="0"
                  value={luck}
                  onChange={(e) => handleNumberChange(setLuck, e.target.value)}
                  placeholder="1 die + 6"
                />
              </div>
            </div>
          </section>
          <section id="consumables" className="section-container">
            <div className="section-header">
              <h2 className="heading section-title">Consumables</h2>
            </div>
            <div className="section-content">
              <div className="field-group">
                <div className="field-icon">
                  <Icon path={mdiHandCoin} size={1} />
                </div>
                <label className="content field-label">Coins</label>
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
                <label className="content field-label">Meals</label>
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
              <h2 className="heading section-title">Dice Rolls</h2>
            </div>
            <div className="section-content">
              <div className="dice-buttons">
                <button
                  type="button"
                  className="content dice-btn"
                  onClick={() => {}}
                >
                  Test your luck
                </button>
                <button
                  type="button"
                  className="content dice-btn"
                  onClick={() => {}}
                >
                  Roll 1
                </button>
                <button
                  type="button"
                  className="content dice-btn"
                  onClick={() => {}}
                >
                  Roll 2
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
