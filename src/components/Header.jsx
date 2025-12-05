import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiBookAccount, mdiWebBox, mdiChevronDown, mdiThemeLightDark } from '@mdi/js';
import {
  t,
  setLanguage,
  getCurrentLanguage,
  getAvailableLanguages,
} from '../translations';
import {
  setTheme,
  getCurrentTheme,
  getAvailableThemes,
} from '../utils/theme';

export default function Header({ onLanguageChange, onThemeChange }) {
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [showThemeSelect, setShowThemeSelect] = useState(false);
  const [navbarExpanded, setNavbarExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1200);
  const [currentTheme, setCurrentTheme] = useState(getCurrentTheme());

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1200);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleThemeChange = (theme) => {
    setTheme(theme);
    setCurrentTheme(theme);
    setShowThemeSelect(false);
    // Notify parent component to trigger re-render
    if (onThemeChange) {
      onThemeChange(theme);
    }
  };

  const handleThemeIconClick = () => {
    setShowThemeSelect(!showThemeSelect);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLanguageSelect && !event.target.closest('.language-selector')) {
        setShowLanguageSelect(false);
      }
      if (showThemeSelect && !event.target.closest('.theme-selector')) {
        setShowThemeSelect(false);
      }
    };

    if (showLanguageSelect || showThemeSelect) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageSelect, showThemeSelect]);

  return (
    <header
      className="navbar navbar-expand-xl sticky-top text-white shadow"
      style={{ backgroundColor: 'var(--header-bg)', zIndex: 1050 }}
    >
      <div className="container mx-auto px-4 py-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}favicon/web-app-manifest-192x192.png`}
            alt="FNF Companion"
            style={{ maxHeight: '2.8rem', width: 'auto', height: 'auto' }}
          />
          <h1 className="heading fs-1 mb-0 text-white">{t('app.title')}</h1>
        </div>
        <button
          className="navbar-toggler d-xl-none"
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
          className={`collapse navbar-collapse ${navbarExpanded || isDesktop ? 'show' : ''}`}
          id="navbarNav"
        >
          <div className="navbar-nav d-flex align-items-center gap-4 ms-auto flex-wrap">
            <a
              href="#game"
              className="nav-link content text-white text-decoration-none"
              style={{ transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
              onMouseLeave={(e) => (e.target.style.color = 'white')}
              onClick={() => setNavbarExpanded(false)}
            >
              {t('navigation.game')}
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
              {t('navigation.trail')}
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
            <div className="position-relative theme-selector">
              <div
                className="d-flex align-items-center"
                style={{ cursor: 'pointer', gap: '0.125rem' }}
                onClick={handleThemeIconClick}
              >
                <Icon path={mdiThemeLightDark} size={1} className="text-white" />
                <Icon path={mdiChevronDown} size={0.8} className="text-white" />
              </div>
              {showThemeSelect && (
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
                  {getAvailableThemes().map((theme) => (
                    <button
                      key={theme}
                      className="btn btn-link text-white text-decoration-none d-block w-100 text-start p-2"
                      style={{
                        color: 'white',
                        transition: 'background-color 0.2s',
                        backgroundColor: currentTheme === theme ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (currentTheme !== theme) {
                          e.target.style.backgroundColor =
                            'rgba(255, 255, 255, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentTheme !== theme) {
                          e.target.style.backgroundColor = 'transparent';
                        } else {
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                        }
                      }}
                      onClick={() => handleThemeChange(theme)}
                    >
                      {t(`theme.${theme}`)}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
