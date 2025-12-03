/**
 * State management utilities for saving and loading game state
 */

import { getFromStorage, saveToStorage } from './localStorage';

const STORAGE_KEY = 'fnf-companion-state';
const DEBOUNCE_DELAY = 2000; // 2 seconds

/**
 * Get the default/initial state structure
 */
export const getDefaultState = () => ({
  metadata: {
    version: '1.0.0',
    savedAt: new Date().toISOString(),
    bookname: '',
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
  notes: '',
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
  diceRolls: {
    rollingButton: null,
    rollDieResult: null,
    rollDiceResults: null,
    testLuckResult: null,
    isTestingLuck: false,
    testSkillResult: null,
    diceRollingType: null,
  },
  sounds: {
    ambience: '',
    battle: 'https://www.youtube.com/watch?v=s5NxP6tjm5o',
    victory: 'https://www.youtube.com/watch?v=rgUksX6eM0Y',
    defeat: 'https://www.youtube.com/watch?v=-ZGlaAxB7nI',
  },
  soundVolumes: {
    ambience: 100,
    battle: 100,
    victory: 100,
    defeat: 100,
  },
  actionSoundsEnabled: true,
  allSoundsMuted: false,
  trailSequence: [{ number: 1, color: 'primary-1' }], // Always starts with 1
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

  // Merge with default state to ensure all fields exist
  const defaultState = getDefaultState();
  return {
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
    diceRolls: {
      ...defaultState.diceRolls,
      ...(savedState.diceRolls || {}),
    },
    sounds: {
      ...defaultState.sounds,
      ...(savedState.sounds || {}),
    },
    soundVolumes: {
      ...defaultState.soundVolumes,
      ...(savedState.soundVolumes || {}),
    },
    actionSoundsEnabled:
      savedState.actionSoundsEnabled !== undefined
        ? savedState.actionSoundsEnabled
        : defaultState.actionSoundsEnabled,
    allSoundsMuted:
      savedState.allSoundsMuted !== undefined
        ? savedState.allSoundsMuted
        : defaultState.allSoundsMuted,
    // Ensure trailSequence is merged correctly, defaulting to [1] if not present
    trailSequence: savedState.trailSequence || defaultState.trailSequence,
    metadata: {
      ...defaultState.metadata,
      ...(savedState.metadata || {}),
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
      version: '1.0.0',
      savedAt: new Date().toISOString(),
      bookname: stateValues.book || '',
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
    notes: stateValues.notes || '',
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
    diceRolls: {
      rollingButton: stateValues.rollingButton ?? null,
      rollDieResult: stateValues.rollDieResult ?? null,
      rollDiceResults: stateValues.rollDiceResults ?? null,
      testLuckResult: stateValues.testLuckResult ?? null,
      isTestingLuck: stateValues.isTestingLuck || false,
      testSkillResult: stateValues.testSkillResult ?? null,
      diceRollingType: stateValues.diceRollingType ?? null,
    },
    sounds: {
      ambience: stateValues.soundUrls?.ambience || '',
      battle: stateValues.soundUrls?.battle || '',
      victory: stateValues.soundUrls?.victory || '',
      defeat: stateValues.soundUrls?.defeat || '',
    },
    soundVolumes: {
      ambience: stateValues.soundVolumes?.ambience ?? 100,
      battle: stateValues.soundVolumes?.battle ?? 100,
      victory: stateValues.soundVolumes?.victory ?? 100,
      defeat: stateValues.soundVolumes?.defeat ?? 100,
    },
    actionSoundsEnabled: stateValues.actionSoundsEnabled ?? true,
    allSoundsMuted: stateValues.allSoundsMuted ?? false,
    trailSequence: stateValues.trailSequence || [
      { number: 1, color: 'primary-1' },
    ],
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

  // Restore inventory and notes
  if (savedState.inventory !== undefined)
    setters.setInventory(savedState.inventory);
  if (savedState.notes !== undefined) setters.setNotes(savedState.notes);

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

  // Restore dice rolls state
  if (savedState.diceRolls) {
    const dice = savedState.diceRolls;
    if (dice.rollingButton !== undefined)
      setters.setRollingButton(dice.rollingButton);
    if (dice.rollDieResult !== undefined)
      setters.setRollDieResult(dice.rollDieResult);
    if (dice.rollDiceResults !== undefined)
      setters.setRollDiceResults(dice.rollDiceResults);
    if (dice.testLuckResult !== undefined)
      setters.setTestLuckResult(dice.testLuckResult);
    if (dice.isTestingLuck !== undefined)
      setters.setIsTestingLuck(dice.isTestingLuck);
    if (dice.testSkillResult !== undefined)
      setters.setTestSkillResult(dice.testSkillResult);
    if (dice.diceRollingType !== undefined)
      setters.setDiceRollingType(dice.diceRollingType);
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
  }
  if (savedState.soundVolumes && setters.setSoundVolumes) {
    setters.setSoundVolumes({
      ambience: savedState.soundVolumes.ambience ?? 100,
      battle: savedState.soundVolumes.battle ?? 100,
      victory: savedState.soundVolumes.victory ?? 100,
      defeat: savedState.soundVolumes.defeat ?? 100,
    });
  }
  if (
    savedState.actionSoundsEnabled !== undefined &&
    setters.setActionSoundsEnabled
  ) {
    setters.setActionSoundsEnabled(savedState.actionSoundsEnabled);
  }
  if (savedState.allSoundsMuted !== undefined && setters.setAllSoundsMuted) {
    setters.setAllSoundsMuted(savedState.allSoundsMuted);
  }

  // Restore trail state
  if (savedState.trailSequence !== undefined) {
    // Ensure sequence always starts with 1
    const sequence = savedState.trailSequence;
    // Handle migration from old format (just numbers) to new format (objects)
    const normalizedSequence = sequence.map((item) => {
      if (typeof item === 'number') {
        return {
          number: item,
          color:
            item === 1 ? 'primary-1' : item === 400 ? 'primary-2' : 'secondary',
        };
      }
      return item;
    });
    if (normalizedSequence.length === 0 || normalizedSequence[0].number !== 1) {
      setters.setTrailSequence([
        { number: 1, color: 'primary-1' },
        ...normalizedSequence.filter((item) => item.number !== 1),
      ]);
    } else {
      setters.setTrailSequence(normalizedSequence);
    }
  }
};
