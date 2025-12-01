import React, { useState } from 'react';
import './App.css';

function App() {
  const [skill, setSkill] = useState('');
  const [health, setHealth] = useState('');
  const [luck, setLuck] = useState('');

  return (
    <div className="min-h-screen bg-beige">
      <header className="sticky top-0 z-50 bg-gray-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚔️</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section id="character" className="section-container">
            <div className="section-header">
              <h2 className="heading section-title">Character</h2>
            </div>
            <div className="section-content">
              <div className="field-group">
                <div className="field-icon">🛡️</div>
                <label className="content field-label">Name</label>
                <input type="text" className="content field-input" />
              </div>
              <div className="field-group">
                <div className="field-icon">⚔️</div>
                <label className="content field-label">Skill</label>
                <div className="number-input-wrapper">
                  <input
                    type="number"
                    className="content field-input number-input"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    placeholder="1 die + 6"
                  />
                  <div className="number-controls">
                    <button
                      type="button"
                      className="content number-btn"
                      aria-label="Increment"
                      onClick={() => increment(setSkill, skill)}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="content number-btn"
                      aria-label="Decrement"
                      onClick={() => decrement(setSkill, skill)}
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>
              <div className="field-group">
                <div className="field-icon">❤️</div>
                <label className="content field-label">Health</label>
                <div className="number-input-wrapper">
                  <input
                    type="number"
                    className="content field-input number-input"
                    value={health}
                    onChange={(e) => setHealth(e.target.value)}
                    placeholder="2 dice + 12"
                  />
                  <div className="number-controls">
                    <button
                      type="button"
                      className="content number-btn"
                      aria-label="Increment"
                      onClick={() => increment(setHealth, health)}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="content number-btn"
                      aria-label="Decrement"
                      onClick={() => decrement(setHealth, health)}
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>
              <div className="field-group">
                <div className="field-icon">🍀</div>
                <label className="content field-label">Luck</label>
                <div className="number-input-wrapper">
                  <input
                    type="number"
                    className="content field-input number-input"
                    value={luck}
                    onChange={(e) => setLuck(e.target.value)}
                    placeholder="One die plus six"
                  />
                  <div className="number-controls">
                    <button
                      type="button"
                      className="content number-btn"
                      aria-label="Increment"
                      onClick={() => increment(setLuck, luck)}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="content number-btn"
                      aria-label="Decrement"
                      onClick={() => decrement(setLuck, luck)}
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section id="inventory" className="section-container">
            <div className="section-header">
              <h2 className="heading section-title">Inventory</h2>
            </div>
            <div className="section-content">
              {/* Inventory fields will be added in Step 5 */}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
