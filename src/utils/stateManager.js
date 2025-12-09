/**
 * State management utilities for saving and loading game state
 */

import { getFromStorage, saveToStorage } from './localStorage';
import {
  convertItemColorToAnnotation,
  annotationToColor,
} from './trailMapping';
import { migrateState } from './migrations';
import { CURRENT_VERSION } from './migrations';

const STORAGE_KEY = 'fnf-companion-state';
const DEBOUNCE_DELAY = 1000; // 1 second

/**
 * Get the default/initial state structure
 */
export const getDefaultState = () => ({
  metadata: {
    version: CURRENT_VERSION,
    savedAt: new Date().toISOString(),
    bookname: '',
    theme: 'light',
    actionSoundsEnabled: true,
    allSoundsMuted: false,
  },
  character: {
    name: '',
    skill: '',
    health: '',
    luck: '',
    isLocked: false,
    maxSkill: null,
    maxHealth: null,
    maxLuck: null,
  },
  consumables: {
    coins: '0',
    meals: '10',
    transactionObject: '',
    transactionCost: '',
    potionType: '',
    potionUsed: false,
  },
  inventory: '',
  fight: {
    monsterSkill: '',
    monsterHealth: '',
    monsterCreature: '',
    graveyard: '',
    showUseLuck: false,
    luckUsed: false,
    isFighting: false,
    fightResult: null,
    fightOutcome: null,
    heroDiceRolls: null,
    monsterDiceRolls: null,
  },
  sounds: {
    ambience: '',
    battle: 'https://www.youtube.com/watch?v=s5NxP6tjm5o',
    victory: 'https://www.youtube.com/watch?v=rgUksX6eM0Y',
    defeat: 'https://www.youtube.com/watch?v=-ZGlaAxB7nI',
    ambienceVolume: 50,
    battleVolume: 50,
    victoryVolume: 50,
    defeatVolume: 50,
  },
  notes: '',
  trailSequence: [{ number: 1, annotation: null }], // Always starts with 1
  sectionsExpanded: {
    game: true,
    character: true,
    consumables: true,
    diceRolls: true,
    inventory: true,
    map: true,
    fight: false,
    notes: false,
  },
});

/**
 * Load state from localStorage
 * @returns {Object|null} The saved state or null if not found
 */
export const loadState = () => {
  const savedState = getFromStorage(STORAGE_KEY, null);
  if (!savedState) {
    return null;
  }

  // Run migrations first to ensure compatibility
  const migratedState = migrateState(savedState);
  if (!migratedState) {
    return null;
  }

  // Merge with default state to ensure all fields exist
  const defaultState = getDefaultState();
  return {
    ...defaultState,
    ...migratedState,
    character: {
      ...defaultState.character,
      ...(migratedState.character || {}),
    },
    consumables: {
      ...defaultState.consumables,
      ...(migratedState.consumables || {}),
    },
    fight: {
      ...defaultState.fight,
      ...(migratedState.fight || {}),
    },
    sounds: {
      ...defaultState.sounds,
      ...(migratedState.sounds || {}),
    },
    // Ensure trailSequence is merged correctly, defaulting to [1] if not present
    trailSequence: migratedState.trailSequence || defaultState.trailSequence,
    sectionsExpanded: {
      ...defaultState.sectionsExpanded,
      ...(migratedState.sectionsExpanded || {}),
    },
    metadata: {
      ...defaultState.metadata,
      ...(migratedState.metadata || {}),
    },
  };
};

/**
 * Save state to localStorage
 * @param {Object} state - The state object to save
 */
export const saveState = (state) => {
  const stateToSave = {
    ...state,
    metadata: {
      ...state.metadata,
      savedAt: new Date().toISOString(),
    },
  };
  saveToStorage(STORAGE_KEY, stateToSave);
};

/**
 * Create a debounced save function
 * @param {Function} saveFn - The save function to debounce
 * @returns {Function} Debounced save function
 */
export const createDebouncedSave = (saveFn) => {
  let timeoutId = null;

  return (state) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      saveFn(state);
      timeoutId = null;
    }, DEBOUNCE_DELAY);
  };
};

/**
 * Build state object from individual state values
 */
export const buildStateObject = (stateValues) => {
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
      battle: stateValues.soundUrls?.battle || '',
      victory: stateValues.soundUrls?.victory || '',
      defeat: stateValues.soundUrls?.defeat || '',
      ambienceVolume:
        typeof stateValues.soundVolumes?.ambience === 'number'
          ? stateValues.soundVolumes.ambience
          : 50,
      battleVolume:
        typeof stateValues.soundVolumes?.battle === 'number'
          ? stateValues.soundVolumes.battle
          : 50,
      victoryVolume:
        typeof stateValues.soundVolumes?.victory === 'number'
          ? stateValues.soundVolumes.victory
          : 50,
      defeatVolume:
        typeof stateValues.soundVolumes?.defeat === 'number'
          ? stateValues.soundVolumes.defeat
          : 50,
    },
    notes: stateValues.notes || '',
    trailSequence: stateValues.trailSequence || [
      { number: 1, color: 'primary-1' },
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
 * Apply loaded state to state setters
 * @param {Object} savedState - The state loaded from storage
 * @param {Object} setters - Object containing all state setter functions
 */
export const applyLoadedState = (savedState, setters) => {
  if (!savedState) {
    return;
  }

  // Restore metadata (book name, theme, actionSoundsEnabled, allSoundsMuted)
  if (savedState.metadata) {
    if (savedState.metadata.bookname !== undefined && setters.setBook) {
      setters.setBook(savedState.metadata.bookname);
    }
    if (
      savedState.metadata.actionSoundsEnabled !== undefined &&
      setters.setActionSoundsEnabled
    ) {
      setters.setActionSoundsEnabled(savedState.metadata.actionSoundsEnabled);
    }
    if (
      savedState.metadata.allSoundsMuted !== undefined &&
      setters.setAllSoundsMuted
    ) {
      setters.setAllSoundsMuted(savedState.metadata.allSoundsMuted);
    }
  }
  // Legacy support: also check top-level for actionSoundsEnabled and allSoundsMuted
  if (
    savedState.actionSoundsEnabled !== undefined &&
    setters.setActionSoundsEnabled &&
    savedState.metadata?.actionSoundsEnabled === undefined
  ) {
    setters.setActionSoundsEnabled(savedState.actionSoundsEnabled);
  }
  if (
    savedState.allSoundsMuted !== undefined &&
    setters.setAllSoundsMuted &&
    savedState.metadata?.allSoundsMuted === undefined
  ) {
    setters.setAllSoundsMuted(savedState.allSoundsMuted);
  }

  // Restore character state
  if (savedState.character) {
    const char = savedState.character;
    if (char.name !== undefined) setters.setName(char.name);
    if (char.skill !== undefined) setters.setSkill(char.skill);
    if (char.health !== undefined) setters.setHealth(char.health);
    if (char.luck !== undefined) setters.setLuck(char.luck);
    if (char.isLocked !== undefined) setters.setIsLocked(char.isLocked);
    if (char.maxSkill !== undefined) setters.setMaxSkill(char.maxSkill);
    if (char.maxHealth !== undefined) setters.setMaxHealth(char.maxHealth);
    if (char.maxLuck !== undefined) setters.setMaxLuck(char.maxLuck);
  }

  // Restore consumables
  if (savedState.consumables) {
    const cons = savedState.consumables;
    if (cons.coins !== undefined) setters.setCoins(cons.coins);
    if (cons.meals !== undefined) setters.setMeals(cons.meals);
    if (cons.transactionObject !== undefined)
      setters.setTransactionObject(cons.transactionObject);
    if (cons.transactionCost !== undefined)
      setters.setTransactionCost(cons.transactionCost);
    if (cons.potionType !== undefined) setters.setPotionType(cons.potionType);
    if (cons.potionUsed !== undefined) setters.setPotionUsed(cons.potionUsed);
  }

  // Restore inventory
  if (savedState.inventory !== undefined)
    setters.setInventory(savedState.inventory);

  // Restore fight state
  if (savedState.fight) {
    const fight = savedState.fight;
    if (fight.monsterSkill !== undefined)
      setters.setMonsterSkill(fight.monsterSkill);
    if (fight.monsterHealth !== undefined)
      setters.setMonsterHealth(fight.monsterHealth);
    if (fight.monsterCreature !== undefined)
      setters.setMonsterCreature(fight.monsterCreature);
    if (fight.graveyard !== undefined) setters.setGraveyard(fight.graveyard);
    if (fight.showUseLuck !== undefined)
      setters.setShowUseLuck(fight.showUseLuck);
    if (fight.luckUsed !== undefined) setters.setLuckUsed(fight.luckUsed);
    if (fight.isFighting !== undefined) setters.setIsFighting(fight.isFighting);
    if (fight.fightResult !== undefined)
      setters.setFightResult(fight.fightResult);
    if (fight.fightOutcome !== undefined)
      setters.setFightOutcome(fight.fightOutcome);
    if (fight.heroDiceRolls !== undefined)
      setters.setHeroDiceRolls(fight.heroDiceRolls);
    if (fight.monsterDiceRolls !== undefined)
      setters.setMonsterDiceRolls(fight.monsterDiceRolls);
  }

  // Restore sounds state
  if (savedState.sounds) {
    const sounds = savedState.sounds;
    if (setters.setSoundUrls) {
      setters.setSoundUrls({
        ambience: sounds.ambience || '',
        battle: sounds.battle || '',
        victory: sounds.victory || '',
        defeat: sounds.defeat || '',
      });
    }
    // Restore sound volumes from sounds object (new structure)
    if (setters.setSoundVolumes) {
      setters.setSoundVolumes({
        ambience: sounds.ambienceVolume ?? 50,
        battle: sounds.battleVolume ?? 50,
        victory: sounds.victoryVolume ?? 50,
        defeat: sounds.defeatVolume ?? 50,
      });
    }
  }
  // Legacy support: also check old soundVolumes structure
  else if (savedState.soundVolumes && setters.setSoundVolumes) {
    setters.setSoundVolumes({
      ambience: savedState.soundVolumes.ambience ?? 50,
      battle: savedState.soundVolumes.battle ?? 50,
      victory: savedState.soundVolumes.victory ?? 50,
      defeat: savedState.soundVolumes.defeat ?? 50,
    });
  }
  // Restore notes
  if (savedState.notes !== undefined) setters.setNotes(savedState.notes);

  // Restore custom sounds
  if (savedState.customSounds && Array.isArray(savedState.customSounds)) {
    if (setters.setCustomSounds) {
      setters.setCustomSounds(savedState.customSounds);
    }
    if (savedState.customSoundVolumes && setters.setCustomSoundVolumes) {
      setters.setCustomSoundVolumes(savedState.customSoundVolumes);
    }
  }

  // Restore trail state
  if (savedState.trailSequence !== undefined) {
    // Ensure sequence always starts with 1
    const sequence = savedState.trailSequence;
    // Handle migration from old format (just numbers or color-based) to new format (annotation-based)
    const normalizedSequence = sequence.map((item) => {
      if (typeof item === 'number') {
        return {
          number: item,
          annotation: null,
        };
      }
      // If item has 'color', convert to 'annotation'
      if (item.color !== undefined) {
        return convertItemColorToAnnotation(item);
      }
      // If item already has 'annotation', use it as-is
      return item;
    });
    if (normalizedSequence.length === 0 || normalizedSequence[0].number !== 1) {
      setters.setTrailSequence([
        { number: 1, annotation: null },
        ...normalizedSequence.filter((item) => item.number !== 1),
      ]);
    } else {
      setters.setTrailSequence(normalizedSequence);
    }
  }

  // Restore sections expanded state
  if (savedState.sectionsExpanded && setters.setSectionsExpanded) {
    setters.setSectionsExpanded(savedState.sectionsExpanded);
  }

  // Restore theme from metadata (new structure)
  // Note: Theme utility's localStorage takes precedence over saved state
  // This ensures user's manual theme selection is preserved
  const themeToRestore = savedState.metadata?.theme || savedState.theme;
  if (
    themeToRestore !== undefined &&
    setters.setTheme &&
    setters.getCurrentTheme
  ) {
    // Restore theme from saved state
    setters.setTheme(themeToRestore);
  }
};
