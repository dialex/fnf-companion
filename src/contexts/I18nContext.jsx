import React, { createContext, useContext } from 'react';

/**
 * React Context for i18nManager
 * Provides translation functions to components without prop drilling
 */
export const I18nContext = createContext(null);

/**
 * Hook to access i18nManager from context
 * @returns {Object} i18nManager instance
 * @throws {Error} If used outside I18nProvider
 */
export const useI18n = () => {
  const i18n = useContext(I18nContext);
  if (!i18n) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return i18n;
};

/**
 * Hook to get the t function from i18nManager
 * @returns {Function} Translation function
 */
export const useT = () => {
  const i18n = useI18n();
  return i18n.t.bind(i18n);
};

/**
 * Provider component for i18nManager
 * @param {Object} props
 * @param {Object} props.i18nManager - i18nManager instance
 * @param {React.ReactNode} props.children - Child components
 */
export const I18nProvider = ({ i18nManager, children }) => {
  return (
    <I18nContext.Provider value={i18nManager}>{children}</I18nContext.Provider>
  );
};
