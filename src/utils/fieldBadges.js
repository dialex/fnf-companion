/**
 * Utility for managing animated field badges
 */
export const createFieldBadgeManager = () => {
  const badges = {};
  const listeners = new Set();

  const showBadge = (fieldName, value, type = 'success') => {
    const id = Date.now();
    badges[fieldName] = { value, type, id };
    notifyListeners();

    // Clear badge after animation completes (matches CSS animation duration of 2.2s)
    setTimeout(() => {
      delete badges[fieldName];
      notifyListeners();
    }, 2200);
  };

  const subscribe = (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  };

  const notifyListeners = () => {
    listeners.forEach((callback) => callback({ ...badges }));
  };

  const getBadges = () => ({ ...badges });

  return {
    showBadge,
    subscribe,
    getBadges,
  };
};
