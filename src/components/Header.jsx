import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiBookAccount, mdiWebBox, mdiChevronDown } from '@mdi/js';
import {
  t,
  setLanguage,
  getCurrentLanguage,
  getAvailableLanguages,
} from '../translations';

export default function Header({ onLanguageChange }) {
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [navbarExpanded, setNavbarExpanded] = useState(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLanguageSelect(false);
    // Notify parent component to trigger re-render
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
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

  return (
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
            <a
              href="#notes"
              className="nav-link content text-white text-decoration-none"
              style={{ transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
              onMouseLeave={(e) => (e.target.style.color = 'white')}
              onClick={() => setNavbarExpanded(false)}
            >
              {t('navigation.notes')}
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
                    backgroundColor: 'var(--header-bg)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.25rem',
                    padding: '0.5rem',
                    minWidth: '150px',
                    zIndex: 1000,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                  }}
                >
                  {getAvailableLanguages().map((lang) => (
                    <button
                      key={lang}
                      className="btn btn-link text-white text-decoration-none d-block w-100 text-start p-2"
                      style={{
                        color: 'white',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor =
                          'rgba(255, 255, 255, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang === 'en' ? 'English' : 'Português'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
