/**
 * GameStateManager - Manages all game state with observer pattern for React integration
 */

import { getFromStorage, saveToStorage } from '../utils/localStorage';
import {
  saveToFile as saveFile,
  loadFromFile as loadFile,
} from './fileManager';
import packageJson from '../../package.json';

const CURRENT_VERSION = packageJson.version;
const STORAGE_KEY = 'fnf-companion-state';
export const DEBOUNCE_DELAY = 1000; // 1 second

/**
 * Build state object from individual state values
 */
const buildStateObject = (stateValues) => {
  return {
    metadata: {
      version: CURRENT_VERSION,
      savedAt: new Date().toISOString(),
      bookname: stateValues.book || '',
      theme: stateValues.theme || 'light',
      actionSoundsEnabled: stateValues.actionSoundsEnabled ?? true,
      allSoundsMuted: stateValues.allSoundsMuted ?? false,
    },
    character: {
      name: stateValues.name || '',
      skill: stateValues.skill || '',
      health: stateValues.health || '',
      luck: stateValues.luck || '',
      isLocked: stateValues.isLocked || false,
      maxSkill: stateValues.maxSkill ?? null,
      maxHealth: stateValues.maxHealth ?? null,
      maxLuck: stateValues.maxLuck ?? null,
    },
    consumables: {
      coins: stateValues.coins || '0',
      meals: stateValues.meals || '10',
      transactionObject: stateValues.transactionObject || '',
      transactionCost: stateValues.transactionCost || '',
      potionType: stateValues.potionType || '',
      potionUsed: stateValues.potionUsed || false,
    },
    inventory: stateValues.inventory || '',
    fight: {
      monsterSkill: stateValues.monsterSkill || '',
      monsterHealth: stateValues.monsterHealth || '',
      monsterCreature: stateValues.monsterCreature || '',
      graveyard: stateValues.graveyard || '',
      showUseLuck: stateValues.showUseLuck || false,
      luckUsed: stateValues.luckUsed || false,
      isFighting: stateValues.isFighting || false,
      fightResult: stateValues.fightResult ?? null,
      fightOutcome: stateValues.fightOutcome ?? null,
      heroDiceRolls: stateValues.heroDiceRolls ?? null,
      monsterDiceRolls: stateValues.monsterDiceRolls ?? null,
    },
    sounds: {
      ambience: stateValues.soundUrls?.ambience || '',
      battle:
        stateValues.soundUrls?.battle ||
        'https://www.youtube.com/watch?v=s5NxP6tjm5o',
      victory:
        stateValues.soundUrls?.victory ||
        'https://www.youtube.com/watch?v=rgUksX6eM0Y',
      defeat:
        stateValues.soundUrls?.defeat ||
        'https://www.youtube.com/watch?v=-ZGlaAxB7nI',
      ambienceVolume:
        typeof stateValues.soundVolumes?.ambience === 'number'
          ? stateValues.soundVolumes.ambience
          : 25,
      battleVolume:
        typeof stateValues.soundVolumes?.battle === 'number'
          ? stateValues.soundVolumes.battle
          : 25,
      victoryVolume:
        typeof stateValues.soundVolumes?.victory === 'number'
          ? stateValues.soundVolumes.victory
          : 25,
      defeatVolume:
        typeof stateValues.soundVolumes?.defeat === 'number'
          ? stateValues.soundVolumes.defeat
          : 25,
    },
    notes: stateValues.notes || '',
    trailSequence: stateValues.trailSequence || [
      { number: 1, annotation: null },
    ],
    sectionsExpanded: stateValues.sectionsExpanded || {
      game: true,
      character: true,
      consumables: true,
      diceRolls: true,
      inventory: true,
      map: true,
      fight: false,
      notes: false,
    },
    customSounds: stateValues.customSounds || [],
    customSoundVolumes: stateValues.customSoundVolumes || {},
  };
};

/**
 * Get default state structure
 */
const getDefaultState = () => buildStateObject({});

/**
 * Create GameStateManager instance
 */
export const createGameStateManager = () => {
  // Internal state storage
  let state = getDefaultState();
  let saveTimeoutId = null;

  // Observer pattern for React integration
  const listeners = new Set();

  const notifyListeners = () => {
    listeners.forEach((callback) => callback({ ...state }));
  };

  /**
   * Subscribe to state changes
   * @param {Function} callback - Called with new state when state changes
   * @returns {Function} Unsubscribe function
   */
  const subscribe = (callback) => {
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
    };
  };

  /**
   * Get current state snapshot
   */
  const getState = () => ({ ...state });

  /**
   * Internal method to update state and notify listeners
   */
  const updateState = (updates) => {
    state = { ...state, ...updates };
    notifyListeners();
    debouncedSave();
  };

  /**
   * Debounced save to localStorage
   */
  const debouncedSave = () => {
    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId);
    }
    saveTimeoutId = setTimeout(() => {
      const stateToSave = {
        ...state,
        metadata: {
          ...state.metadata,
          savedAt: new Date().toISOString(),
        },
      };
      saveToStorage(STORAGE_KEY, stateToSave);
      saveTimeoutId = null;
    }, DEBOUNCE_DELAY);
  };

  /**
   * Load state from localStorage
   */
  const loadFromStorage = () => {
    const savedState = getFromStorage(STORAGE_KEY, null);
    if (!savedState) {
      return false;
    }

    // Merge with default state to ensure all fields exist
    const defaultState = getDefaultState();
    const mergedState = {
      ...defaultState,
      ...savedState,
      character: {
        ...defaultState.character,
        ...(savedState.character || {}),
      },
      consumables: {
        ...defaultState.consumables,
        ...(savedState.consumables || {}),
      },
      fight: {
        ...defaultState.fight,
        ...(savedState.fight || {}),
      },
      sounds: {
        ...defaultState.sounds,
        ...(savedState.sounds || {}),
      },
      trailSequence: savedState.trailSequence || defaultState.trailSequence,
      sectionsExpanded: {
        ...defaultState.sectionsExpanded,
        ...(savedState.sectionsExpanded || {}),
      },
      metadata: {
        ...defaultState.metadata,
        ...(savedState.metadata || {}),
      },
    };

    state = mergedState;
    notifyListeners();
    return true;
  };

  /**
   * Reset state to defaults
   */
  const reset = () => {
    state = getDefaultState();
    notifyListeners();
    debouncedSave();
  };

  /**
   * Load state from YAML file
   */
  const loadFromFile = async () => {
    const loadedState = await loadFile();
    if (!loadedState) {
      return false;
    }

    // Merge with defaults
    const defaultState = getDefaultState();
    const mergedState = {
      ...defaultState,
      ...loadedState,
      character: {
        ...defaultState.character,
        ...(loadedState.character || {}),
      },
      consumables: {
        ...defaultState.consumables,
        ...(loadedState.consumables || {}),
      },
      fight: {
        ...defaultState.fight,
        ...(loadedState.fight || {}),
      },
      sounds: {
        ...defaultState.sounds,
        ...(loadedState.sounds || {}),
      },
      trailSequence: loadedState.trailSequence || defaultState.trailSequence,
      sectionsExpanded: {
        ...defaultState.sectionsExpanded,
        ...(loadedState.sectionsExpanded || {}),
      },
      metadata: {
        ...defaultState.metadata,
        ...(loadedState.metadata || {}),
      },
    };

    // Ensure trailSequence starts with 1
    if (
      mergedState.trailSequence.length === 0 ||
      mergedState.trailSequence[0].number !== 1
    ) {
      mergedState.trailSequence = [
        { number: 1, annotation: null },
        ...mergedState.trailSequence.filter((item) => item.number !== 1),
      ];
    }

    state = mergedState;
    notifyListeners();
    debouncedSave();
    return true;
  };

  /**
   * Save state to YAML file
   */
  const saveToFile = (bookName, characterName) => {
    const stateToSave = {
      ...state,
      metadata: {
        ...state.metadata,
        savedAt: new Date().toISOString(),
      },
    };
    saveFile(stateToSave, bookName, characterName);
  };

  // Getters
  const getBook = () => state.metadata.bookname;
  const getName = () => state.character.name;
  const getSkill = () => state.character.skill;
  const getHealth = () => state.character.health;
  const getLuck = () => state.character.luck;
  const getIsLocked = () => state.character.isLocked;
  const getMaxSkill = () => state.character.maxSkill;
  const getMaxHealth = () => state.character.maxHealth;
  const getMaxLuck = () => state.character.maxLuck;
  const getCoins = () => state.consumables.coins;
  const getMeals = () => state.consumables.meals;
  const getTransactionObject = () => state.consumables.transactionObject;
  const getTransactionCost = () => state.consumables.transactionCost;
  const getPotionType = () => state.consumables.potionType;
  const getPotionUsed = () => state.consumables.potionUsed;
  const getInventory = () => state.inventory;
  const getNotes = () => state.notes;
  const getTrailSequence = () => [...state.trailSequence];
  const getMonsterSkill = () => state.fight.monsterSkill;
  const getMonsterHealth = () => state.fight.monsterHealth;
  const getMonsterCreature = () => state.fight.monsterCreature;
  const getGraveyard = () => state.fight.graveyard;
  const getShowUseLuck = () => state.fight.showUseLuck;
  const getLuckUsed = () => state.fight.luckUsed;
  const getIsFighting = () => state.fight.isFighting;
  const getFightResult = () => state.fight.fightResult;
  const getFightOutcome = () => state.fight.fightOutcome;
  const getHeroDiceRolls = () => state.fight.heroDiceRolls;
  const getMonsterDiceRolls = () => state.fight.monsterDiceRolls;
  const getSoundUrls = () => ({
    ambience: state.sounds.ambience,
    battle: state.sounds.battle,
    victory: state.sounds.victory,
    defeat: state.sounds.defeat,
  });
  const getSoundVolumes = () => ({
    ambience: state.sounds.ambienceVolume,
    battle: state.sounds.battleVolume,
    victory: state.sounds.victoryVolume,
    defeat: state.sounds.defeatVolume,
  });
  const getActionSoundsEnabled = () => state.metadata.actionSoundsEnabled;
  const getAllSoundsMuted = () => state.metadata.allSoundsMuted;
  const getSectionsExpanded = () => ({ ...state.sectionsExpanded });
  const getCustomSounds = () => [...state.customSounds];
  const getCustomSoundVolumes = () => ({ ...state.customSoundVolumes });

  // Setters
  const setBook = (value) => {
    state = {
      ...state,
      metadata: { ...state.metadata, bookname: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setName = (value) => {
    state = {
      ...state,
      character: { ...state.character, name: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setSkill = (value) => {
    state = {
      ...state,
      character: { ...state.character, skill: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setHealth = (value) => {
    state = {
      ...state,
      character: { ...state.character, health: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setLuck = (value) => {
    state = {
      ...state,
      character: { ...state.character, luck: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setIsLocked = (value) => {
    state = {
      ...state,
      character: { ...state.character, isLocked: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setMaxSkill = (value) => {
    state = {
      ...state,
      character: { ...state.character, maxSkill: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setMaxHealth = (value) => {
    state = {
      ...state,
      character: { ...state.character, maxHealth: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setMaxLuck = (value) => {
    state = {
      ...state,
      character: { ...state.character, maxLuck: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setCoins = (value) => {
    state = {
      ...state,
      consumables: { ...state.consumables, coins: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setMeals = (value) => {
    state = {
      ...state,
      consumables: { ...state.consumables, meals: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setTransactionObject = (value) => {
    state = {
      ...state,
      consumables: { ...state.consumables, transactionObject: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setTransactionCost = (value) => {
    state = {
      ...state,
      consumables: { ...state.consumables, transactionCost: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setPotionType = (value) => {
    state = {
      ...state,
      consumables: { ...state.consumables, potionType: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setPotionUsed = (value) => {
    state = {
      ...state,
      consumables: { ...state.consumables, potionUsed: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setInventory = (value) => {
    state = { ...state, inventory: value };
    notifyListeners();
    debouncedSave();
  };

  const setNotes = (value) => {
    state = { ...state, notes: value };
    notifyListeners();
    debouncedSave();
  };

  const setTrailSequence = (value) => {
    // Ensure sequence always starts with 1
    let sequence = value;
    if (sequence.length === 0 || sequence[0].number !== 1) {
      sequence = [
        { number: 1, annotation: null },
        ...sequence.filter((item) => item.number !== 1),
      ];
    }
    state = { ...state, trailSequence: sequence };
    notifyListeners();
    debouncedSave();
  };

  const setMonsterSkill = (value) => {
    state = {
      ...state,
      fight: { ...state.fight, monsterSkill: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setMonsterHealth = (value) => {
    state = {
      ...state,
      fight: { ...state.fight, monsterHealth: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setMonsterCreature = (value) => {
    state = {
      ...state,
      fight: { ...state.fight, monsterCreature: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const clearFightResults = (preserveMonsterCreature = null) => {
    // If preserveMonsterCreature is a string, use it; if true, preserve current; if false/null, clear
    const preservedCreature =
      typeof preserveMonsterCreature === 'string'
        ? preserveMonsterCreature
        : preserveMonsterCreature === true
          ? state.fight.monsterCreature
          : '';
    state = {
      ...state,
      fight: {
        ...state.fight,
        fightOutcome: null,
        monsterCreature: preservedCreature,
        monsterSkill: '',
        monsterHealth: '',
        heroDiceRolls: null,
        monsterDiceRolls: null,
        fightResult: null,
        showUseLuck: false,
        luckUsed: false,
        isFighting: false,
      },
    };
    notifyListeners();
    debouncedSave();
  };

  const setGraveyard = (value) => {
    state = {
      ...state,
      fight: { ...state.fight, graveyard: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setShowUseLuck = (value) => {
    state = {
      ...state,
      fight: { ...state.fight, showUseLuck: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setLuckUsed = (value) => {
    state = {
      ...state,
      fight: { ...state.fight, luckUsed: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setIsFighting = (value) => {
    state = {
      ...state,
      fight: { ...state.fight, isFighting: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setFightResult = (value) => {
    state = {
      ...state,
      fight: { ...state.fight, fightResult: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setFightOutcome = (value) => {
    state = {
      ...state,
      fight: { ...state.fight, fightOutcome: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setHeroDiceRolls = (value) => {
    state = {
      ...state,
      fight: { ...state.fight, heroDiceRolls: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setMonsterDiceRolls = (value) => {
    state = {
      ...state,
      fight: { ...state.fight, monsterDiceRolls: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setSoundUrls = (value) => {
    state = {
      ...state,
      sounds: {
        ...state.sounds,
        ambience: value.ambience || '',
        battle: value.battle || state.sounds.battle,
        victory: value.victory || state.sounds.victory,
        defeat: value.defeat || state.sounds.defeat,
      },
    };
    notifyListeners();
    debouncedSave();
  };

  const setSoundVolumes = (value) => {
    state = {
      ...state,
      sounds: {
        ...state.sounds,
        ambienceVolume: value.ambience ?? state.sounds.ambienceVolume,
        battleVolume: value.battle ?? state.sounds.battleVolume,
        victoryVolume: value.victory ?? state.sounds.victoryVolume,
        defeatVolume: value.defeat ?? state.sounds.defeatVolume,
      },
    };
    notifyListeners();
    debouncedSave();
  };

  const setActionSoundsEnabled = (value) => {
    state = {
      ...state,
      metadata: { ...state.metadata, actionSoundsEnabled: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setAllSoundsMuted = (value) => {
    state = {
      ...state,
      metadata: { ...state.metadata, allSoundsMuted: value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setSectionsExpanded = (value) => {
    state = {
      ...state,
      sectionsExpanded: { ...state.sectionsExpanded, ...value },
    };
    notifyListeners();
    debouncedSave();
  };

  const setCustomSounds = (value) => {
    state = { ...state, customSounds: [...value] };
    notifyListeners();
    debouncedSave();
  };

  const setCustomSoundVolumes = (value) => {
    state = { ...state, customSoundVolumes: { ...value } };
    notifyListeners();
    debouncedSave();
  };

  return {
    // Observer pattern
    subscribe,
    getState,

    // Load/Save
    loadFromStorage,
    reset,
    loadFromFile,
    saveToFile,

    // Getters
    getBook,
    getName,
    getSkill,
    getHealth,
    getLuck,
    getIsLocked,
    getMaxSkill,
    getMaxHealth,
    getMaxLuck,
    getCoins,
    getMeals,
    getTransactionObject,
    getTransactionCost,
    getPotionType,
    getPotionUsed,
    getInventory,
    getNotes,
    getTrailSequence,
    getMonsterSkill,
    getMonsterHealth,
    getMonsterCreature,
    getGraveyard,
    getShowUseLuck,
    getLuckUsed,
    getIsFighting,
    getFightResult,
    getFightOutcome,
    getHeroDiceRolls,
    getMonsterDiceRolls,
    getSoundUrls,
    getSoundVolumes,
    getActionSoundsEnabled,
    getAllSoundsMuted,
    getSectionsExpanded,
    getCustomSounds,
    getCustomSoundVolumes,

    // Setters
    setBook,
    setName,
    setSkill,
    setHealth,
    setLuck,
    setIsLocked,
    setMaxSkill,
    setMaxHealth,
    setMaxLuck,
    setCoins,
    setMeals,
    setTransactionObject,
    setTransactionCost,
    setPotionType,
    setPotionUsed,
    setInventory,
    setNotes,
    setTrailSequence,
    setMonsterSkill,
    setMonsterHealth,
    setMonsterCreature,
    clearFightResults,
    setGraveyard,
    setShowUseLuck,
    setLuckUsed,
    setIsFighting,
    setFightResult,
    setFightOutcome,
    setHeroDiceRolls,
    setMonsterDiceRolls,
    setSoundUrls,
    setSoundVolumes,
    setActionSoundsEnabled,
    setAllSoundsMuted,
    setSectionsExpanded,
    setCustomSounds,
    setCustomSoundVolumes,
  };
};
