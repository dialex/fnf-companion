import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createGameStateManager,
  DEBOUNCE_DELAY,
} from '../../managers/gameStateManager';
import { getFromStorage, saveToStorage } from '../../utils/localStorage';
import { saveToFile, loadFromFile } from '../../managers/fileManager';

// Mock fileManager
vi.mock('../../managers/fileManager', () => ({
  saveToFile: vi.fn(),
  loadFromFile: vi.fn(),
}));

describe('GameStateManager', () => {
  let manager;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
    manager = createGameStateManager();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Initial state', () => {
    it('should have default values', () => {
      expect(manager.getBook()).toBe('');
      expect(manager.getName()).toBe('');
      expect(manager.getSkill()).toBe('');
      expect(manager.getHealth()).toBe('');
      expect(manager.getLuck()).toBe('');
      expect(manager.getIsLocked()).toBe(false);
      expect(manager.getCoins()).toBe('0');
      expect(manager.getMeals()).toBe('10');
      expect(manager.getInventory()).toBe('');
      expect(manager.getNotes()).toBe('');
      expect(manager.getActionSoundsEnabled()).toBe(true);
      expect(manager.getAllSoundsMuted()).toBe(false);
    });

    it('should have trailSequence starting with 1', () => {
      const trail = manager.getTrailSequence();
      expect(trail).toHaveLength(1);
      expect(trail[0].number).toBe(1);
      expect(trail[0].annotation).toBe(null);
    });
  });

  describe('Observer pattern', () => {
    it('should notify subscribers when state changes', () => {
      const listener = vi.fn();
      manager.subscribe(listener);

      manager.setName('Test');
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          character: expect.objectContaining({ name: 'Test' }),
        })
      );
    });

    it('should allow unsubscribing', () => {
      const listener = vi.fn();
      const unsubscribe = manager.subscribe(listener);

      manager.setName('Test');
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      manager.setName('Test2');
      expect(listener).toHaveBeenCalledTimes(1); // Still 1, not notified
    });

    it('should provide current state snapshot', () => {
      manager.setName('Test');
      const state = manager.getState();
      expect(state.character.name).toBe('Test');
      expect(state).not.toBe(manager.getState()); // Different objects
    });
  });

  describe('Getters and setters', () => {
    it('should get and set book', () => {
      manager.setBook('Test Book');
      expect(manager.getBook()).toBe('Test Book');
    });

    it('should get and set character properties', () => {
      manager.setName('Hero');
      manager.setSkill('12');
      manager.setHealth('20');
      manager.setLuck('10');
      manager.setIsLocked(true);
      manager.setMaxSkill(12);
      manager.setMaxHealth(20);
      manager.setMaxLuck(10);

      expect(manager.getName()).toBe('Hero');
      expect(manager.getSkill()).toBe('12');
      expect(manager.getHealth()).toBe('20');
      expect(manager.getLuck()).toBe('10');
      expect(manager.getIsLocked()).toBe(true);
      expect(manager.getMaxSkill()).toBe(12);
      expect(manager.getMaxHealth()).toBe(20);
      expect(manager.getMaxLuck()).toBe(10);
    });

    it('should get and set consumables', () => {
      manager.setCoins('50');
      manager.setMeals('5');
      manager.setTransactionObject('Sword');
      manager.setTransactionCost('10');
      manager.setPotionType('strength');
      manager.setPotionUsed(true);

      expect(manager.getCoins()).toBe('50');
      expect(manager.getMeals()).toBe('5');
      expect(manager.getTransactionObject()).toBe('Sword');
      expect(manager.getTransactionCost()).toBe('10');
      expect(manager.getPotionType()).toBe('strength');
      expect(manager.getPotionUsed()).toBe(true);
    });

    it('should get and set inventory and notes', () => {
      manager.setInventory('Sword, Shield');
      manager.setNotes('Test notes');

      expect(manager.getInventory()).toBe('Sword, Shield');
      expect(manager.getNotes()).toBe('Test notes');
    });

    it('should get and set fight state', () => {
      manager.setMonsterSkill('10');
      manager.setMonsterHealth('15');
      manager.setMonsterCreature('Goblin');
      manager.setGraveyard('Orc');
      manager.setShowUseLuck(true);
      manager.setLuckUsed(true);
      manager.setIsFighting(true);
      manager.setFightResult('victory');
      manager.setFightOutcome('won');
      manager.setHeroDiceRolls([5, 6]);
      manager.setMonsterDiceRolls([3, 4]);

      expect(manager.getMonsterSkill()).toBe('10');
      expect(manager.getMonsterHealth()).toBe('15');
      expect(manager.getMonsterCreature()).toBe('Goblin');
      expect(manager.getGraveyard()).toBe('Orc');
      expect(manager.getShowUseLuck()).toBe(true);
      expect(manager.getLuckUsed()).toBe(true);
      expect(manager.getIsFighting()).toBe(true);
      expect(manager.getFightResult()).toBe('victory');
      expect(manager.getFightOutcome()).toBe('won');
      expect(manager.getHeroDiceRolls()).toEqual([5, 6]);
      expect(manager.getMonsterDiceRolls()).toEqual([3, 4]);
    });

    it('should get and set sound URLs and volumes', () => {
      manager.setSoundUrls({
        ambience: 'amb.mp3',
        battle: 'battle.mp3',
        victory: 'victory.mp3',
        defeat: 'defeat.mp3',
      });
      manager.setSoundVolumes({
        ambience: 30,
        battle: 40,
        victory: 35,
        defeat: 45,
      });

      expect(manager.getSoundUrls()).toEqual({
        ambience: 'amb.mp3',
        battle: 'battle.mp3',
        victory: 'victory.mp3',
        defeat: 'defeat.mp3',
      });
      expect(manager.getSoundVolumes()).toEqual({
        ambience: 30,
        battle: 40,
        victory: 35,
        defeat: 45,
      });
    });

    it('should get and set action sounds and mute state', () => {
      manager.setActionSoundsEnabled(false);
      manager.setAllSoundsMuted(true);

      expect(manager.getActionSoundsEnabled()).toBe(false);
      expect(manager.getAllSoundsMuted()).toBe(true);
    });

    it('should get and set sections expanded', () => {
      manager.setSectionsExpanded({ game: false, fight: true });

      const expanded = manager.getSectionsExpanded();
      expect(expanded.game).toBe(false);
      expect(expanded.fight).toBe(true);
      // Other sections should remain from defaults
      expect(expanded.character).toBe(true);
    });

    it('should get and set custom sounds', () => {
      const customSounds = [
        { id: 'custom1', name: 'Sound 1', url: 'url1.mp3' },
        { id: 'custom2', name: 'Sound 2', url: 'url2.mp3' },
      ];
      manager.setCustomSounds(customSounds);
      manager.setCustomSoundVolumes({ custom1: 50, custom2: 60 });

      expect(manager.getCustomSounds()).toEqual(customSounds);
      expect(manager.getCustomSoundVolumes()).toEqual({
        custom1: 50,
        custom2: 60,
      });
    });

    it('should get and set trail sequence', () => {
      const sequence = [
        { number: 1, annotation: null },
        { number: 2, annotation: 'died' },
        { number: 3, annotation: 'good' },
      ];
      manager.setTrailSequence(sequence);

      expect(manager.getTrailSequence()).toEqual(sequence);
    });

    it('should ensure trail sequence always starts with 1', () => {
      const sequence = [
        { number: 2, annotation: 'died' },
        { number: 3, annotation: 'good' },
      ];
      manager.setTrailSequence(sequence);

      const result = manager.getTrailSequence();
      expect(result[0].number).toBe(1);
      expect(result[0].annotation).toBe(null);
      expect(result.length).toBe(3);
    });
  });

  describe('Auto-save to localStorage', () => {
    it('should debounce saves to localStorage', () => {
      manager.setName('Test');
      manager.setSkill('12');
      manager.setHealth('20');

      // Should not save immediately
      expect(getFromStorage('fnf-companion-state')).toBe(null);

      // Advance timer
      vi.advanceTimersByTime(DEBOUNCE_DELAY);

      // Should have saved once with latest state
      const saved = getFromStorage('fnf-companion-state');
      expect(saved).toBeDefined();
      expect(saved.character.name).toBe('Test');
      expect(saved.character.skill).toBe('12');
      expect(saved.character.health).toBe('20');
    });

    it('should reset debounce timer on each change', () => {
      manager.setName('Test1');
      vi.advanceTimersByTime(DEBOUNCE_DELAY / 2);
      manager.setName('Test2');
      vi.advanceTimersByTime(DEBOUNCE_DELAY / 2);
      manager.setName('Test3');
      vi.advanceTimersByTime(DEBOUNCE_DELAY);

      const saved = getFromStorage('fnf-companion-state');
      expect(saved.character.name).toBe('Test3');
    });
  });

  describe('loadFromStorage', () => {
    it('should return false when no saved state exists', () => {
      const result = manager.loadFromStorage();
      expect(result).toBe(false);
    });

    it('should load state from localStorage', () => {
      const savedState = {
        metadata: { bookname: 'Test Book', theme: 'dark' },
        character: { name: 'Test Character', skill: '12' },
        consumables: { coins: '50', meals: '5' },
      };
      saveToStorage('fnf-companion-state', savedState);

      const result = manager.loadFromStorage();
      expect(result).toBe(true);
      expect(manager.getBook()).toBe('Test Book');
      expect(manager.getName()).toBe('Test Character');
      expect(manager.getSkill()).toBe('12');
      expect(manager.getCoins()).toBe('50');
      expect(manager.getMeals()).toBe('5');
    });

    it('should merge saved state with defaults', () => {
      const savedState = {
        character: { name: 'Test', skill: '10' },
      };
      saveToStorage('fnf-companion-state', savedState);

      manager.loadFromStorage();
      expect(manager.getName()).toBe('Test');
      expect(manager.getSkill()).toBe('10');
      // Should have defaults for missing fields
      expect(manager.getHealth()).toBe('');
      expect(manager.getCoins()).toBe('0');
    });

    it('should persist volume settings on page refresh', () => {
      // Set volumes
      manager.setSoundVolumes({
        ambience: 30,
        battle: 50,
        victory: 40,
        defeat: 60,
      });
      manager.setCustomSoundVolumes({
        custom1: 45,
        custom2: 55,
      });

      // Advance timer to save
      vi.advanceTimersByTime(DEBOUNCE_DELAY);

      // Create new manager instance (simulating page refresh)
      const newManager = createGameStateManager();
      newManager.loadFromStorage();

      // Volumes should be restored
      expect(newManager.getSoundVolumes()).toEqual({
        ambience: 30,
        battle: 50,
        victory: 40,
        defeat: 60,
      });
      expect(newManager.getCustomSoundVolumes()).toEqual({
        custom1: 45,
        custom2: 55,
      });
    });

    it('should notify subscribers when loading from storage', () => {
      const listener = vi.fn();
      manager.subscribe(listener);

      const savedState = {
        character: { name: 'Test' },
      };
      saveToStorage('fnf-companion-state', savedState);

      manager.loadFromStorage();
      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          character: expect.objectContaining({ name: 'Test' }),
        })
      );
    });
  });

  describe('reset', () => {
    it('should reset state to defaults', () => {
      manager.setName('Test');
      manager.setSkill('12');
      manager.setCoins('50');

      manager.reset();

      expect(manager.getName()).toBe('');
      expect(manager.getSkill()).toBe('');
      expect(manager.getCoins()).toBe('0');
    });

    it('should notify subscribers when resetting', () => {
      const listener = vi.fn();
      manager.subscribe(listener);

      manager.setName('Test');
      manager.reset();

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('loadFromFile', () => {
    it('should return false when no file is loaded', async () => {
      loadFromFile.mockResolvedValue(null);

      const result = await manager.loadFromFile();
      expect(result).toBe(false);
    });

    it('should load state from file', async () => {
      const loadedState = {
        metadata: { bookname: 'Test Book' },
        character: { name: 'Hero', skill: '12' },
        consumables: { coins: '50' },
      };
      loadFromFile.mockResolvedValue(loadedState);

      const result = await manager.loadFromFile();
      expect(result).toBe(true);
      expect(manager.getBook()).toBe('Test Book');
      expect(manager.getName()).toBe('Hero');
      expect(manager.getSkill()).toBe('12');
      expect(manager.getCoins()).toBe('50');
    });

    it('should merge loaded state with defaults', async () => {
      const loadedState = {
        character: { name: 'Test' },
      };
      loadFromFile.mockResolvedValue(loadedState);

      await manager.loadFromFile();
      expect(manager.getName()).toBe('Test');
      expect(manager.getHealth()).toBe(''); // default
    });

    it('should ensure trail sequence starts with 1 when loading from file', async () => {
      const loadedState = {
        trailSequence: [
          { number: 2, annotation: 'died' },
          { number: 3, annotation: 'good' },
        ],
      };
      loadFromFile.mockResolvedValue(loadedState);

      await manager.loadFromFile();
      const trail = manager.getTrailSequence();
      expect(trail[0].number).toBe(1);
      expect(trail[0].annotation).toBe(null);
    });

    it('should notify subscribers when loading from file', async () => {
      const listener = vi.fn();
      manager.subscribe(listener);

      const loadedState = {
        character: { name: 'Test' },
      };
      loadFromFile.mockResolvedValue(loadedState);

      await manager.loadFromFile();
      expect(listener).toHaveBeenCalled();
    });

    it('should persist volume settings on game save and load', async () => {
      // Set volumes
      manager.setSoundVolumes({
        ambience: 35,
        battle: 55,
        victory: 45,
        defeat: 65,
      });
      manager.setCustomSoundVolumes({
        custom1: 50,
        custom2: 70,
      });

      // Save to file
      manager.saveToFile('Test Book', 'Hero');

      // Verify volumes are in saved state
      expect(saveToFile).toHaveBeenCalledWith(
        expect.objectContaining({
          sounds: expect.objectContaining({
            ambienceVolume: 35,
            battleVolume: 55,
            victoryVolume: 45,
            defeatVolume: 65,
          }),
          customSoundVolumes: {
            custom1: 50,
            custom2: 70,
          },
        }),
        'Test Book',
        'Hero'
      );

      // Load from file
      const loadedState = {
        sounds: {
          ambienceVolume: 35,
          battleVolume: 55,
          victoryVolume: 45,
          defeatVolume: 65,
        },
        customSoundVolumes: {
          custom1: 50,
          custom2: 70,
        },
      };
      loadFromFile.mockResolvedValue(loadedState);

      const newManager = createGameStateManager();
      await newManager.loadFromFile();

      // Volumes should be restored
      expect(newManager.getSoundVolumes()).toEqual({
        ambience: 35,
        battle: 55,
        victory: 45,
        defeat: 65,
      });
      expect(newManager.getCustomSoundVolumes()).toEqual({
        custom1: 50,
        custom2: 70,
      });
    });
  });

  describe('saveToFile', () => {
    it('should save current state to file', () => {
      manager.setBook('Test Book');
      manager.setName('Hero');
      manager.setSkill('12');

      manager.saveToFile('Test Book', 'Hero');

      expect(saveToFile).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ bookname: 'Test Book' }),
          character: expect.objectContaining({ name: 'Hero', skill: '12' }),
        }),
        'Test Book',
        'Hero'
      );
    });
  });
});
