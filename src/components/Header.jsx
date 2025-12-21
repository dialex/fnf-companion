import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import {
  mdiWebBox,
  mdiChevronDown,
  mdiBrightness4,
  mdiBrightness5,
  mdiPalette,
} from '@mdi/js';
import { i18nManager } from '../managers/i18nManager';
import { themeManager } from '../managers/themeManager';

export default function Header({ onLanguageChange, onThemeChange }) {
  const i18n = i18nManager;
  const t = i18nManager.t.bind(i18nManager);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [showPaletteSelect, setShowPaletteSelect] = useState(false);
  const [navbarExpanded, setNavbarExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1200);
  const [, forceUpdate] = useState({});
  const [paletteVariants, setPaletteVariants] = useState({
    hasLight: true,
    hasDark: true,
  });
  const currentMode = themeManager.getMode();
  const currentPalette = themeManager.getPalette();

  // Get available modes filtered by palette variants
  const getFilteredModes = () => {
    const allModes = themeManager.getAvailableModes();
    const { hasLight, hasDark } = paletteVariants;

    // Filter out modes that don't have a corresponding palette variant
    return allModes.filter((mode) => {
      if (mode === 'light') return hasLight;
      if (mode === 'dark') return hasDark;
      return true; // Keep other modes if any
    });
  };

  const filteredModes = getFilteredModes();
  const hasOnlyOneMode = filteredModes.length === 1;

  // Subscribe to mode/palette changes and update palette variants
  useEffect(() => {
    const updateVariants = () => {
      const variants = themeManager.checkPaletteVariants();
      setPaletteVariants(variants);
      forceUpdate({});
      if (onThemeChange) {
        onThemeChange(themeManager.getMode());
      }
    };

    // Initial check
    const timer = setTimeout(() => {
      updateVariants();
    }, 100);

    const unsubscribe = themeManager.subscribe(updateVariants);
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [onThemeChange]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1200);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLanguageChange = (lang) => {
    i18n.setLanguage(lang);
    setShowLanguageSelect(false);
    // Notify parent component to trigger re-render
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  const handleLanguageIconClick = () => {
    setShowLanguageSelect(!showLanguageSelect);
  };

  const handleModeToggle = () => {
    // Don't toggle if only one mode is available
    if (hasOnlyOneMode) {
      return;
    }
    // Toggle between light and dark
    const newMode = currentMode === 'light' ? 'dark' : 'light';
    themeManager.setMode(newMode);
  };

  const handlePaletteChange = (palette) => {
    themeManager.setPalette(palette);
    setShowPaletteSelect(false);
  };

  const handlePaletteIconClick = () => {
    setShowPaletteSelect(!showPaletteSelect);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLanguageSelect && !event.target.closest('.language-selector')) {
        setShowLanguageSelect(false);
      }
      if (showPaletteSelect && !event.target.closest('.palette-selector')) {
        setShowPaletteSelect(false);
      }
    };

    if (showLanguageSelect || showPaletteSelect) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageSelect, showPaletteSelect]);

  return (
    <header
      className="navbar navbar-expand-xl sticky-top text-white shadow"
      style={{ backgroundColor: 'var(--header-bg)', zIndex: 1050 }}
    >
      <div className="container mx-auto px-4 py-3 d-flex justify-content-between align-items-center">
        {/* Title and logo - visible on both desktop and mobile */}
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
            {/* Navigation links - only visible on mobile */}
            <div className="d-xl-none d-flex flex-column gap-2 w-100 mb-3 align-items-center">
              <a
                href="#game"
                className="nav-link content text-white text-decoration-none text-center"
                style={{ transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
                onMouseLeave={(e) => (e.target.style.color = 'white')}
                onClick={() => setNavbarExpanded(false)}
              >
                {t('navigation.game')}
              </a>
              <a
                href="#consumables"
                className="nav-link content text-white text-decoration-none text-center"
                style={{ transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
                onMouseLeave={(e) => (e.target.style.color = 'white')}
                onClick={() => setNavbarExpanded(false)}
              >
                {t('navigation.consumables')}
              </a>
              <a
                href="#inventory"
                className="nav-link content text-white text-decoration-none text-center"
                style={{ transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
                onMouseLeave={(e) => (e.target.style.color = 'white')}
                onClick={() => setNavbarExpanded(false)}
              >
                {t('navigation.inventory')}
              </a>
              <a
                href="#map"
                className="nav-link content text-white text-decoration-none text-center"
                style={{ transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
                onMouseLeave={(e) => (e.target.style.color = 'white')}
                onClick={() => setNavbarExpanded(false)}
              >
                {t('navigation.trail')}
              </a>
              <a
                href="#fight"
                className="nav-link content text-white text-decoration-none text-center"
                style={{ transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
                onMouseLeave={(e) => (e.target.style.color = 'white')}
                onClick={() => setNavbarExpanded(false)}
              >
                {t('navigation.fight')}
              </a>
              <a
                href="#notes"
                className="nav-link content text-white text-decoration-none text-center"
                style={{ transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
                onMouseLeave={(e) => (e.target.style.color = 'white')}
                onClick={() => setNavbarExpanded(false)}
              >
                {t('navigation.notes')}
              </a>
            </div>
            {/* Palette, Mode and Language selectors - visible on both desktop and mobile */}
            <div className="position-relative palette-selector">
              <div
                className="d-flex align-items-center"
                style={{ cursor: 'pointer', gap: '0.125rem' }}
                onClick={handlePaletteIconClick}
              >
                <Icon path={mdiPalette} size={1} className="text-white" />
                <Icon path={mdiChevronDown} size={0.8} className="text-white" />
              </div>
              {showPaletteSelect && (
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
                  {themeManager.getAvailablePalettes().map((palette) => (
                    <button
                      key={palette}
                      className="btn btn-link text-white text-decoration-none d-block w-100 text-start p-2"
                      style={{
                        color: 'white',
                        transition: 'background-color 0.2s',
                        backgroundColor:
                          currentPalette === palette
                            ? 'rgba(255, 255, 255, 0.15)'
                            : 'transparent',
                        textTransform: 'capitalize',
                      }}
                      onMouseEnter={(e) => {
                        if (currentPalette !== palette) {
                          e.target.style.backgroundColor =
                            'rgba(255, 255, 255, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPalette !== palette) {
                          e.target.style.backgroundColor = 'transparent';
                        } else {
                          e.target.style.backgroundColor =
                            'rgba(255, 255, 255, 0.15)';
                        }
                      }}
                      onClick={() => handlePaletteChange(palette)}
                    >
                      {palette.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="position-relative theme-selector">
              <div
                className="d-flex align-items-center"
                style={{
                  cursor: hasOnlyOneMode ? 'not-allowed' : 'pointer',
                  opacity: hasOnlyOneMode ? 0.5 : 1,
                }}
                onClick={handleModeToggle}
              >
                <Icon
                  path={
                    currentMode === 'light' ? mdiBrightness5 : mdiBrightness4
                  }
                  size={1}
                  className="text-white"
                />
              </div>
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
                  {i18n.getAvailableLanguages().map((lang) => (
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
