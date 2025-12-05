import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import {
  mdiWebBox,
  mdiChevronDown,
  mdiBrightness4,
  mdiBrightness5,
  mdiPalette,
} from '@mdi/js';
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
  THEMES,
} from '../utils/theme';
import {
  setPalette,
  getCurrentPalette,
  getAvailablePalettes,
  checkPaletteVariants,
} from '../utils/palette';

export default function Header({ onLanguageChange, onThemeChange }) {
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [showPaletteSelect, setShowPaletteSelect] = useState(false);
  const [navbarExpanded, setNavbarExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1200);
  const [currentTheme, setCurrentTheme] = useState(getCurrentTheme());
  const [currentPalette, setCurrentPalette] = useState(getCurrentPalette());
  const [paletteVariants, setPaletteVariants] = useState({
    hasLight: true,
    hasDark: true,
  });

  // Get available themes filtered by palette variants
  const getFilteredThemes = () => {
    const allThemes = getAvailableThemes();
    const { hasLight, hasDark } = paletteVariants;

    // If only one variant is available, hide the opposite variant
    if (hasLight && !hasDark) {
      // Only light available - hide dark
      return allThemes.filter((theme) => theme !== THEMES.DARK);
    } else if (hasDark && !hasLight) {
      // Only dark available - hide light
      return allThemes.filter((theme) => theme !== THEMES.LIGHT);
    }

    return allThemes;
  };

  const filteredThemes = getFilteredThemes();
  const hasOnlyOneTheme = filteredThemes.length === 1;

  // Sync theme and palette state on mount (with small delay to ensure they are initialized)
  useEffect(() => {
    // Use setTimeout to ensure theme and palette are initialized from main.jsx
    const timer = setTimeout(() => {
      setCurrentTheme(getCurrentTheme());
      setCurrentPalette(getCurrentPalette());
      // Check palette variants after initial load
      const variants = checkPaletteVariants();
      setPaletteVariants(variants);
    }, 100); // Slightly longer delay to ensure CSS is loaded
    return () => clearTimeout(timer);
  }, []);

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

  const handleThemeToggle = () => {
    // Don't toggle if only one theme is available
    if (hasOnlyOneTheme) {
      return;
    }
    // Toggle between light and dark
    const newTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    setTheme(newTheme);
    setCurrentTheme(newTheme);
    // Notify parent component to trigger re-render
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  const handlePaletteChange = (palette) => {
    setPalette(palette, () => {
      // Callback after palette loads - refresh theme state to reflect auto-switch
      setCurrentPalette(palette);
      setCurrentTheme(getCurrentTheme());

      // Update palette variants state
      const variants = checkPaletteVariants();
      setPaletteVariants(variants);

      // Notify parent component to trigger re-render
      if (onThemeChange) {
        onThemeChange(getCurrentTheme());
      }
    });
    setShowPaletteSelect(false);
  };

  // Check palette variants on mount and when palette changes
  useEffect(() => {
    // Delay to ensure CSS is loaded
    const timer = setTimeout(() => {
      const variants = checkPaletteVariants();
      setPaletteVariants(variants);
    }, 150);
    return () => clearTimeout(timer);
  }, [currentPalette]);

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
            {/* Palette, Theme and Language selectors - visible on both desktop and mobile */}
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
                  {getAvailablePalettes().map((palette) => (
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
                  cursor: hasOnlyOneTheme ? 'not-allowed' : 'pointer',
                  opacity: hasOnlyOneTheme ? 0.5 : 1,
                }}
                onClick={handleThemeToggle}
              >
                <Icon
                  path={
                    currentTheme === THEMES.LIGHT
                      ? mdiBrightness5
                      : mdiBrightness4
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
