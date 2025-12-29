import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  saveState,
  buildStateObject,
  getDefaultState,
  loadState,
  createDebouncedSave,
  applyLoadedState,
  DEBOUNCE_DELAY,
} from '../../managers/stateManager';
import { getFromStorage, saveToStorage } from '../../utils/localStorage';

//TODO: this should be a responsibility of the GameStateManager
describe('Game state manager', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('saveState', () => {
    it('should save all important aspects of game state to localStorage', () => {
      // Create a complete game state with all important fields populated
      const exampleGameState = buildStateObject({
        book: 'Test Book',
        name: 'Test Character',
        skill: '12',
        health: '20',
        luck: '10',
        isLocked: true,
        maxSkill: 12,
        maxHealth: 20,
        maxLuck: 10,
        coins: '50',
        meals: '5',
        transactionObject: 'Sword',
        transactionCost: '10',
        potionType: 'strength',
        potionUsed: true,
        inventory: 'Sword, Shield',
        notes: 'Test notes',
        monsterSkill: '10',
        monsterHealth: '15',
        monsterCreature: 'Goblin',
        graveyard: 'Orc',
        showUseLuck: true,
        luckUsed: true,
        isFighting: true,
        fightResult: 'victory',
        fightOutcome: 'won',
        heroDiceRolls: [5, 6],
        monsterDiceRolls: [3, 4],
        trailSequence: [
          { number: 1, annotation: null },
          { number: 2, annotation: 'died' },
          { number: 3, annotation: 'good' },
        ],
        soundUrls: {
          ambience: 'https://example.com/ambience.mp3',
          battle: 'https://example.com/battle.mp3',
          victory: 'https://example.com/victory.mp3',
          defeat: 'https://example.com/defeat.mp3',
        },
        soundVolumes: {
          ambience: 30,
          battle: 40,
          victory: 35,
          defeat: 45,
        },
        actionSoundsEnabled: true,
        allSoundsMuted: false,
        theme: 'dark',
        sectionsExpanded: {
          game: true,
          character: false,
          consumables: true,
          diceRolls: false,
          inventory: true,
          map: false,
          fight: true,
          notes: false,
        },
        customSounds: [
          {
            id: 'custom1',
            name: 'Custom Sound',
            url: 'https://example.com/custom.mp3',
          },
        ],
        customSoundVolumes: {
          custom1: 50,
        },
      });

      // Save the state
      saveState(exampleGameState);

      // Retrieve from localStorage
      const savedState = getFromStorage('fnf-companion-state');

      // Assert all important aspects are present and not empty (where applicable)
      expect(savedState).toBeDefined();
      expect(savedState).not.toBe(null);

      // Metadata
      expect(savedState.metadata).toBeDefined();
      expect(savedState.metadata.version).toBeDefined();
      expect(savedState.metadata.savedAt).toBeDefined();
      expect(savedState.metadata.bookname).toBe('Test Book');
      expect(savedState.metadata.theme).toBe('dark');
      expect(savedState.metadata.actionSoundsEnabled).toBe(true);
      expect(savedState.metadata.allSoundsMuted).toBe(false);

      // Character
      expect(savedState.character).toBeDefined();
      expect(savedState.character.name).toBe('Test Character');
      expect(savedState.character.skill).toBe('12');
      expect(savedState.character.health).toBe('20');
      expect(savedState.character.luck).toBe('10');
      expect(savedState.character.isLocked).toBe(true);
      expect(savedState.character.maxSkill).toBe(12);
      expect(savedState.character.maxHealth).toBe(20);
      expect(savedState.character.maxLuck).toBe(10);

      // Consumables
      expect(savedState.consumables).toBeDefined();
      expect(savedState.consumables.coins).toBe('50');
      expect(savedState.consumables.meals).toBe('5');
      expect(savedState.consumables.transactionObject).toBe('Sword');
      expect(savedState.consumables.transactionCost).toBe('10');
      expect(savedState.consumables.potionType).toBe('strength');
      expect(savedState.consumables.potionUsed).toBe(true);

      // Inventory
      expect(savedState.inventory).toBe('Sword, Shield');

      // Fight
      expect(savedState.fight).toBeDefined();
      expect(savedState.fight.monsterSkill).toBe('10');
      expect(savedState.fight.monsterHealth).toBe('15');
      expect(savedState.fight.monsterCreature).toBe('Goblin');
      expect(savedState.fight.graveyard).toBe('Orc');
      expect(savedState.fight.showUseLuck).toBe(true);
      expect(savedState.fight.luckUsed).toBe(true);
      expect(savedState.fight.isFighting).toBe(true);
      expect(savedState.fight.fightResult).toBe('victory');
      expect(savedState.fight.fightOutcome).toBe('won');
      expect(savedState.fight.heroDiceRolls).toEqual([5, 6]);
      expect(savedState.fight.monsterDiceRolls).toEqual([3, 4]);

      // Sounds
      expect(savedState.sounds).toBeDefined();
      expect(savedState.sounds.ambience).toBe(
        'https://example.com/ambience.mp3'
      );
      expect(savedState.sounds.battle).toBe('https://example.com/battle.mp3');
      expect(savedState.sounds.victory).toBe('https://example.com/victory.mp3');
      expect(savedState.sounds.defeat).toBe('https://example.com/defeat.mp3');
      expect(savedState.sounds.ambienceVolume).toBe(30);
      expect(savedState.sounds.battleVolume).toBe(40);
      expect(savedState.sounds.victoryVolume).toBe(35);
      expect(savedState.sounds.defeatVolume).toBe(45);

      // Notes
      expect(savedState.notes).toBe('Test notes');

      // Trail sequence
      expect(savedState.trailSequence).toBeDefined();
      expect(Array.isArray(savedState.trailSequence)).toBe(true);
      expect(savedState.trailSequence.length).toBeGreaterThan(0);

      // Sections expanded
      expect(savedState.sectionsExpanded).toBeDefined();
      expect(savedState.sectionsExpanded.game).toBe(true);
      expect(savedState.sectionsExpanded.character).toBe(false);
      expect(savedState.sectionsExpanded.consumables).toBe(true);
      expect(savedState.sectionsExpanded.diceRolls).toBe(false);
      expect(savedState.sectionsExpanded.inventory).toBe(true);
      expect(savedState.sectionsExpanded.map).toBe(false);
      expect(savedState.sectionsExpanded.fight).toBe(true);
      expect(savedState.sectionsExpanded.notes).toBe(false);

      // Custom sounds
      expect(savedState.customSounds).toBeDefined();
      expect(Array.isArray(savedState.customSounds)).toBe(true);
      expect(savedState.customSounds.length).toBeGreaterThan(0);

      // Custom sound volumes
      expect(savedState.customSoundVolumes).toBeDefined();
      expect(typeof savedState.customSoundVolumes).toBe('object');
    });
  });

  describe('getDefaultState', () => {
    it('should return default state structure with all required fields', () => {
      const defaultState = getDefaultState();

      expect(defaultState).toHaveProperty('metadata');
      expect(defaultState).toHaveProperty('character');
      expect(defaultState).toHaveProperty('consumables');
      expect(defaultState).toHaveProperty('inventory');
      expect(defaultState).toHaveProperty('fight');
      expect(defaultState).toHaveProperty('sounds');
      expect(defaultState).toHaveProperty('notes');
      expect(defaultState).toHaveProperty('trailSequence');
      expect(defaultState).toHaveProperty('sectionsExpanded');
    });

    it('should have correct default values', () => {
      const defaultState = getDefaultState();

      expect(defaultState.metadata.theme).toBe('light');
      expect(defaultState.metadata.actionSoundsEnabled).toBe(true);
      expect(defaultState.metadata.allSoundsMuted).toBe(false);
      expect(defaultState.character.name).toBe('');
      expect(defaultState.character.isLocked).toBe(false);
      expect(defaultState.consumables.coins).toBe('0');
      expect(defaultState.consumables.meals).toBe('10');
      expect(defaultState.inventory).toBe('');
      expect(defaultState.notes).toBe('');
      expect(defaultState.trailSequence).toEqual([
        { number: 1, annotation: null },
      ]);
    });

    it('should include app version in metadata', () => {
      const defaultState = getDefaultState();
      expect(defaultState.metadata.version).toBeDefined();
      expect(typeof defaultState.metadata.version).toBe('string');
    });
  });

  describe('loadState', () => {
    it('should return null when no state is saved', () => {
      const result = loadState();
      expect(result).toBe(null);
    });

    it('should load saved state from localStorage', () => {
      const savedState = {
        metadata: { bookname: 'Test Book', theme: 'dark' },
        character: { name: 'Test Character' },
      };
      saveToStorage('fnf-companion-state', savedState);

      const loaded = loadState();

      expect(loaded).toBeDefined();
      expect(loaded.metadata.bookname).toBe('Test Book');
      expect(loaded.character.name).toBe('Test Character');
    });

    it('should merge saved state with defaults', () => {
      const savedState = {
        character: { name: 'Test Character', skill: '10' },
      };
      saveToStorage('fnf-companion-state', savedState);

      const loaded = loadState();

      expect(loaded.character.name).toBe('Test Character');
      expect(loaded.character.skill).toBe('10');
      // Should have defaults for missing fields
      expect(loaded.character.health).toBe('');
      expect(loaded.consumables.coins).toBe('0');
      expect(loaded.metadata.theme).toBe('light');
    });

    it('should handle nested object merging correctly', () => {
      const savedState = {
        character: { name: 'Test' },
        consumables: { coins: '50' },
        fight: { monsterSkill: '10' },
        sounds: { ambience: 'test.mp3' },
      };
      saveToStorage('fnf-companion-state', savedState);

      const loaded = loadState();

      expect(loaded.character.name).toBe('Test');
      expect(loaded.character.skill).toBe(''); // default
      expect(loaded.consumables.coins).toBe('50');
      expect(loaded.consumables.meals).toBe('10'); // default
      expect(loaded.fight.monsterSkill).toBe('10');
      expect(loaded.fight.isFighting).toBe(false); // default
      expect(loaded.sounds.ambience).toBe('test.mp3');
      expect(loaded.sounds.battle).toBeDefined(); // default
    });
  });

  describe('buildStateObject', () => {
    it('should build state object from provided values', () => {
      const state = buildStateObject({
        book: 'Test Book',
        name: 'Test Character',
        skill: '12',
        coins: '50',
      });

      expect(state.metadata.bookname).toBe('Test Book');
      expect(state.character.name).toBe('Test Character');
      expect(state.character.skill).toBe('12');
      expect(state.consumables.coins).toBe('50');
    });

    it('should use defaults for missing values', () => {
      const state = buildStateObject({});

      expect(state.metadata.bookname).toBe('');
      expect(state.character.name).toBe('');
      expect(state.consumables.coins).toBe('0');
      expect(state.consumables.meals).toBe('10');
      expect(state.metadata.theme).toBe('light');
    });

    it('should handle sound URLs and volumes correctly', () => {
      const state = buildStateObject({
        soundUrls: {
          ambience: 'amb.mp3',
          battle: 'battle.mp3',
        },
        soundVolumes: {
          ambience: 30,
          battle: 40,
        },
      });

      expect(state.sounds.ambience).toBe('amb.mp3');
      expect(state.sounds.battle).toBe('battle.mp3');
      expect(state.sounds.victory).toBe(
        'https://www.youtube.com/watch?v=rgUksX6eM0Y'
      ); // default when not provided
      expect(state.sounds.ambienceVolume).toBe(30);
      expect(state.sounds.battleVolume).toBe(40);
      expect(state.sounds.victoryVolume).toBe(25); // default
    });

    it('should handle null values correctly', () => {
      const state = buildStateObject({
        maxSkill: null,
        fightResult: null,
      });

      expect(state.character.maxSkill).toBe(null);
      expect(state.fight.fightResult).toBe(null);
    });

    it('should include version and savedAt in metadata', () => {
      const state = buildStateObject({});

      expect(state.metadata.version).toBeDefined();
      expect(state.metadata.savedAt).toBeDefined();
      expect(typeof state.metadata.savedAt).toBe('string');
    });

    it('should handle trailSequence defaults', () => {
      const state = buildStateObject({});
      expect(state.trailSequence).toEqual([{ number: 1, annotation: null }]);
    });

    it('should handle sectionsExpanded defaults', () => {
      const defaultState = buildStateObject({});
      expect(defaultState.sectionsExpanded.game).toBe(true);
      expect(defaultState.sectionsExpanded.fight).toBe(false);

      const stateWithOverrides = buildStateObject({
        sectionsExpanded: { game: false, fight: true },
      });
      expect(stateWithOverrides.sectionsExpanded.game).toBe(false);
      expect(stateWithOverrides.sectionsExpanded.fight).toBe(true);
    });
  });

  describe('createDebouncedSave', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should debounce save calls', () => {
      const saveFn = vi.fn();
      const debouncedSave = createDebouncedSave(saveFn);

      debouncedSave({ test: 1 });
      debouncedSave({ test: 2 });
      debouncedSave({ test: 3 });

      expect(saveFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(DEBOUNCE_DELAY);

      expect(saveFn).toHaveBeenCalledTimes(1);
      expect(saveFn).toHaveBeenCalledWith({ test: 3 });
    });

    it('should reset timer on each call', () => {
      const saveFn = vi.fn();
      const debouncedSave = createDebouncedSave(saveFn);
      const shorterThanDebounce = DEBOUNCE_DELAY / 2;

      debouncedSave({ test: 1 });
      vi.advanceTimersByTime(shorterThanDebounce);
      debouncedSave({ test: 2 });
      vi.advanceTimersByTime(shorterThanDebounce);
      debouncedSave({ test: 3 });
      vi.advanceTimersByTime(DEBOUNCE_DELAY);

      expect(saveFn).toHaveBeenCalledTimes(1);
      expect(saveFn).toHaveBeenCalledWith({ test: 3 });
    });
  });

  describe('applyLoadedState', () => {
    it('should do nothing when savedState is null', () => {
      const setters = {
        setName: vi.fn(),
        setSkill: vi.fn(),
      };

      applyLoadedState(null, setters);

      expect(setters.setName).not.toHaveBeenCalled();
      expect(setters.setSkill).not.toHaveBeenCalled();
    });

    it('should restore character state', () => {
      const setters = {
        setName: vi.fn(),
        setSkill: vi.fn(),
        setHealth: vi.fn(),
        setLuck: vi.fn(),
        setIsLocked: vi.fn(),
        setMaxSkill: vi.fn(),
        setMaxHealth: vi.fn(),
        setMaxLuck: vi.fn(),
      };

      const savedState = {
        character: {
          name: 'Test',
          skill: '12',
          health: '20',
          luck: '10',
          isLocked: true,
          maxSkill: 12,
          maxHealth: 20,
          maxLuck: 10,
        },
      };

      applyLoadedState(savedState, setters);

      expect(setters.setName).toHaveBeenCalledWith('Test');
      expect(setters.setSkill).toHaveBeenCalledWith('12');
      expect(setters.setHealth).toHaveBeenCalledWith('20');
      expect(setters.setLuck).toHaveBeenCalledWith('10');
      expect(setters.setIsLocked).toHaveBeenCalledWith(true);
      expect(setters.setMaxSkill).toHaveBeenCalledWith(12);
      expect(setters.setMaxHealth).toHaveBeenCalledWith(20);
      expect(setters.setMaxLuck).toHaveBeenCalledWith(10);
    });

    it('should restore consumables state', () => {
      const setters = {
        setCoins: vi.fn(),
        setMeals: vi.fn(),
        setTransactionObject: vi.fn(),
        setTransactionCost: vi.fn(),
        setPotionType: vi.fn(),
        setPotionUsed: vi.fn(),
      };

      const savedState = {
        consumables: {
          coins: '50',
          meals: '5',
          transactionObject: 'Sword',
          transactionCost: '10',
          potionType: 'strength',
          potionUsed: true,
        },
      };

      applyLoadedState(savedState, setters);

      expect(setters.setCoins).toHaveBeenCalledWith('50');
      expect(setters.setMeals).toHaveBeenCalledWith('5');
      expect(setters.setTransactionObject).toHaveBeenCalledWith('Sword');
      expect(setters.setTransactionCost).toHaveBeenCalledWith('10');
      expect(setters.setPotionType).toHaveBeenCalledWith('strength');
      expect(setters.setPotionUsed).toHaveBeenCalledWith(true);
    });

    it('should restore fight state', () => {
      const setters = {
        setMonsterSkill: vi.fn(),
        setMonsterHealth: vi.fn(),
        setMonsterCreature: vi.fn(),
        setGraveyard: vi.fn(),
        setShowUseLuck: vi.fn(),
        setLuckUsed: vi.fn(),
        setIsFighting: vi.fn(),
        setFightResult: vi.fn(),
        setFightOutcome: vi.fn(),
        setHeroDiceRolls: vi.fn(),
        setMonsterDiceRolls: vi.fn(),
      };

      const savedState = {
        fight: {
          monsterSkill: '10',
          monsterHealth: '15',
          monsterCreature: 'Goblin',
          graveyard: 'Orc',
          showUseLuck: true,
          luckUsed: true,
          isFighting: true,
          fightResult: 'victory',
          fightOutcome: 'won',
          heroDiceRolls: [5, 6],
          monsterDiceRolls: [3, 4],
        },
      };

      applyLoadedState(savedState, setters);

      expect(setters.setMonsterSkill).toHaveBeenCalledWith('10');
      expect(setters.setMonsterHealth).toHaveBeenCalledWith('15');
      expect(setters.setMonsterCreature).toHaveBeenCalledWith('Goblin');
      expect(setters.setGraveyard).toHaveBeenCalledWith('Orc');
      expect(setters.setShowUseLuck).toHaveBeenCalledWith(true);
      expect(setters.setLuckUsed).toHaveBeenCalledWith(true);
      expect(setters.setIsFighting).toHaveBeenCalledWith(true);
      expect(setters.setFightResult).toHaveBeenCalledWith('victory');
      expect(setters.setFightOutcome).toHaveBeenCalledWith('won');
      expect(setters.setHeroDiceRolls).toHaveBeenCalledWith([5, 6]);
      expect(setters.setMonsterDiceRolls).toHaveBeenCalledWith([3, 4]);
    });

    it('should restore sounds state', () => {
      const setters = {
        setSoundUrls: vi.fn(),
        setSoundVolumes: vi.fn(),
      };

      const savedState = {
        sounds: {
          ambience: 'amb.mp3',
          battle: 'battle.mp3',
          victory: 'victory.mp3',
          defeat: 'defeat.mp3',
          ambienceVolume: 30,
          battleVolume: 40,
          victoryVolume: 35,
          defeatVolume: 45,
        },
      };

      applyLoadedState(savedState, setters);

      expect(setters.setSoundUrls).toHaveBeenCalledWith({
        ambience: 'amb.mp3',
        battle: 'battle.mp3',
        victory: 'victory.mp3',
        defeat: 'defeat.mp3',
      });
      expect(setters.setSoundVolumes).toHaveBeenCalledWith({
        ambience: 30,
        battle: 40,
        victory: 35,
        defeat: 45,
      });
    });

    it('should restore trail sequence and ensure it starts with 1', () => {
      const setters = {
        setTrailSequence: vi.fn(),
      };

      const savedState = {
        trailSequence: [
          { number: 2, annotation: 'died' },
          { number: 3, annotation: 'good' },
        ],
      };

      applyLoadedState(savedState, setters);

      expect(setters.setTrailSequence).toHaveBeenCalledWith([
        { number: 1, annotation: null },
        { number: 2, annotation: 'died' },
        { number: 3, annotation: 'good' },
      ]);
    });

    it('should not modify trail sequence if it already starts with 1', () => {
      const setters = {
        setTrailSequence: vi.fn(),
      };

      const savedState = {
        trailSequence: [
          { number: 1, annotation: null },
          { number: 2, annotation: 'died' },
        ],
      };

      applyLoadedState(savedState, setters);

      expect(setters.setTrailSequence).toHaveBeenCalledWith([
        { number: 1, annotation: null },
        { number: 2, annotation: 'died' },
      ]);
    });

    it('should restore sections expanded state', () => {
      const setters = {
        setSectionsExpanded: vi.fn(),
      };

      const savedState = {
        sectionsExpanded: {
          game: false,
          character: true,
          fight: true,
        },
      };

      applyLoadedState(savedState, setters);

      expect(setters.setSectionsExpanded).toHaveBeenCalledWith({
        game: false,
        character: true,
        fight: true,
      });
    });

    it('should restore custom sounds and volumes', () => {
      const setters = {
        setCustomSounds: vi.fn(),
        setCustomSoundVolumes: vi.fn(),
      };

      const savedState = {
        customSounds: [
          { id: 'custom1', name: 'Sound 1', url: 'url1.mp3' },
          { id: 'custom2', name: 'Sound 2', url: 'url2.mp3' },
        ],
        customSoundVolumes: {
          custom1: 50,
          custom2: 60,
        },
      };

      applyLoadedState(savedState, setters);

      expect(setters.setCustomSounds).toHaveBeenCalledWith(
        savedState.customSounds
      );
      expect(setters.setCustomSoundVolumes).toHaveBeenCalledWith({
        custom1: 50,
        custom2: 60,
      });
    });

    it('should use default volume for custom sounds without volume', () => {
      const setters = {
        setCustomSounds: vi.fn(),
        setCustomSoundVolumes: vi.fn(),
      };

      const savedState = {
        customSounds: [
          { id: 'custom1', name: 'Sound 1', url: 'url1.mp3' },
          { id: 'custom2', name: 'Sound 2', url: 'url2.mp3' },
        ],
        customSoundVolumes: {
          custom1: 50,
          // custom2 missing
        },
      };

      applyLoadedState(savedState, setters);

      expect(setters.setCustomSoundVolumes).toHaveBeenCalledWith({
        custom1: 50,
        custom2: 25, // default volume
      });
    });
  });
});
