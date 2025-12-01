import React, { useState } from 'react';
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [skill, setSkill] = useState('');
  const [health, setHealth] = useState('');
  const [luck, setLuck] = useState('');

  const handleNumberChange = (setter, value) => {
    const numValue = parseInt(value) || 0;
    setter(String(Math.max(0, numValue)));
  };

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
              <h2 className="heading section-title">
                {name.trim().length > 0 ? name : 'Character'}
              </h2>
            </div>
            <div className="section-content">
              <div className="field-group">
                <div className="field-icon">🛡️</div>
                <label className="content field-label">Name</label>
                <input
                  type="text"
                  className="content field-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="field-group">
                <div className="field-icon">⚔️</div>
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
                <div className="field-icon">❤️</div>
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
                <div className="field-icon">🍀</div>
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
