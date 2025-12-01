import React from 'react';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-beige">
      <header className="sticky top-0 z-50 bg-gray-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚔️</span>
            <h1 className="text-xl font-semibold">Fight & Fantasy Companion</h1>
          </div>
          <nav className="flex gap-6">
            <a href="#character" className="hover:text-yellow-400 transition">
              Character
            </a>
            <a href="#inventory" className="hover:text-yellow-400 transition">
              Inventory
            </a>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section id="character" className="section-container">
            <div className="section-header">
              <h2 className="section-title">CHARACTER</h2>
            </div>
            <div className="section-content">
              {/* Character fields will be added in Step 4 */}
            </div>
          </section>
          <section id="inventory" className="section-container">
            <div className="section-header">
              <h2 className="section-title">INVENTORY</h2>
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
