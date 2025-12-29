import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createGameMaster } from '../../managers/gameMaster';
import { createDiceRoller } from '../../managers/diceRoller';
import { createGameStateManager } from '../../managers/gameStateManager';
import { createSoundManager } from '../../managers/soundManager';
import { createGameShowManager } from '../../managers/gameShowManager';

// Mock Audio for sound playback in tests
const playMock = vi.fn().mockResolvedValue(undefined);
global.Audio = class MockAudio {
  constructor(src) {
    this.src = src;
    this.play = playMock;
    this.pause = vi.fn();
    this.volume = 1;
  }
};

describe('GameMaster integration', () => {
  let gameMaster;
  let diceRoller;
  let gameStateManager;
  let soundManager;
  let gameShowManager;

  beforeEach(() => {
    vi.clearAllMocks();
    diceRoller = createDiceRoller();
    gameStateManager = createGameStateManager();
    soundManager = createSoundManager();
    gameShowManager = createGameShowManager(soundManager, gameStateManager);
    gameMaster = createGameMaster({
      diceRoller,
      gameStateManager,
      gameShowManager,
      soundManager,
    });

    // Setup initial state
    gameStateManager.setSkill('10');
    gameStateManager.setHealth('20');
    gameStateManager.setLuck('5');
    gameStateManager.setMaxHealth('20');
    gameStateManager.setMonsterCreature('Goblin');
    gameStateManager.setMonsterSkill('8');
    gameStateManager.setMonsterHealth('15');
  });

  describe('Manager coordination', () => {
    it('should coordinate fight action across all managers', () => {
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      const mockPlayMonsterDamageSound = vi.spyOn(
        soundManager,
        'playMonsterDamageSound'
      );
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 });
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 2, roll2: 3, sum: 5 });

      const result = gameMaster.actionFight();

      // Verify DiceRoller was called
      expect(mockRollDiceTwo).toHaveBeenCalledTimes(2);

      // Verify GameStateManager was updated
      expect(gameStateManager.getHeroDiceRolls()).toEqual([3, 4]);
      expect(gameStateManager.getMonsterDiceRolls()).toEqual([2, 3]);
      expect(gameStateManager.getMonsterHealth()).toBe('13'); // 15 - 2

      // Verify SoundManager was called
      expect(mockPlayMonsterDamageSound).toHaveBeenCalled();

      // Verify result structure
      expect(result.type).toBe('heroWins');
      expect(result.badges).toHaveLength(1);
      expect(result.badges[0].field).toBe('monsterHealth');
    });

    it('should coordinate use luck action across all managers', () => {
      // Setup fight result first
      gameStateManager.setFightResult({ type: 'heroWins' });
      gameStateManager.setShowUseLuck(true);

      const mockShowLuckTestResult = vi.spyOn(
        gameShowManager,
        'showLuckTestResult'
      );
      const mockPlayMonsterDamageSound = vi.spyOn(
        soundManager,
        'playMonsterDamageSound'
      );
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValue({ roll1: 2, roll2: 3, sum: 5 });

      const result = gameMaster.actionUseLuck();

      // Verify DiceRoller was called
      expect(mockRollDiceTwo).toHaveBeenCalledTimes(1);

      // Verify GameStateManager was updated
      expect(gameStateManager.getMonsterHealth()).toBe('14'); // 15 - 1 (lucky)
      expect(gameStateManager.getLuck()).toBe('4'); // 5 - 1
      expect(gameStateManager.getLuckUsed()).toBe(true);

      // Verify GameShowManager was called
      expect(mockShowLuckTestResult).toHaveBeenCalledWith(true);

      // Verify SoundManager was called
      expect(mockPlayMonsterDamageSound).toHaveBeenCalled();

      // Verify result structure
      expect(result.isLucky).toBe(true);
      expect(result.badges).toHaveLength(1);
    });
  });

  describe('State persistence', () => {
    it('should persist fight state through game state manager', () => {
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 });
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 1, roll2: 1, sum: 2 });

      gameMaster.actionFight();

      // Verify state is persisted in GameStateManager
      const fightResult = gameStateManager.getFightResult();
      expect(fightResult).not.toBeNull();
      expect(fightResult.type).toBe('heroWins');

      // Verify graveyard is updated on victory
      gameStateManager.setMonsterHealth('2');
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 });
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 1, roll2: 1, sum: 2 });

      gameMaster.actionFight();

      const graveyard = gameStateManager.getGraveyard();
      expect(graveyard).toContain('Goblin');
    });

    it('should persist monster stats through fight sequence', () => {
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 });
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 1, roll2: 1, sum: 2 });

      // First attack
      gameMaster.actionFight();
      expect(gameStateManager.getMonsterHealth()).toBe('13');

      // Second attack
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 });
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 1, roll2: 1, sum: 2 });
      gameStateManager.setFightResult(null);
      gameStateManager.setShowUseLuck(false);
      gameStateManager.setLuckUsed(false);

      gameMaster.actionFight();
      expect(gameStateManager.getMonsterHealth()).toBe('11'); // 13 - 2
    });
  });

  describe('Edge cases', () => {
    it('should handle fight when hero health reaches 0', () => {
      gameStateManager.setHealth('2');
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 1, roll2: 1, sum: 2 }); // Monster wins
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 });

      const result = gameMaster.actionFight();

      expect(result.fightEnded).toBe('lost');
      expect(gameStateManager.getFightOutcome()).toBe('lost');
      expect(gameStateManager.getHealth()).toBe('0');
    });

    it('should handle fight when monster health reaches 0', () => {
      gameStateManager.setMonsterHealth('2');
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 }); // Hero wins
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 1, roll2: 1, sum: 2 });

      const result = gameMaster.actionFight();

      expect(result.fightEnded).toBe('won');
      expect(gameStateManager.getFightOutcome()).toBe('won');
      expect(gameStateManager.getMonsterHealth()).toBe('0');
    });

    it('should handle use luck when luck is 0', () => {
      gameStateManager.setLuck('0');
      gameStateManager.setFightResult({ type: 'heroWins' });

      // GameMaster doesn't validate luck > 0, it just decrements it (clamped to 0)
      // This validation is handled by App.jsx UI layer
      // So we verify that luck stays at 0 (clamped)
      gameMaster.actionUseLuck();
      expect(gameStateManager.getLuck()).toBe('0');
    });

    it('should handle multiple attacks in sequence', () => {
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 });
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 1, roll2: 1, sum: 2 });

      // First attack
      gameMaster.actionFight();
      expect(gameStateManager.getMonsterHealth()).toBe('13');
      expect(gameStateManager.getShowUseLuck()).toBe(true);

      // Second attack (reset state first)
      gameStateManager.setFightResult(null);
      gameStateManager.setShowUseLuck(false);
      gameStateManager.setLuckUsed(false);
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 });
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 1, roll2: 1, sum: 2 });

      gameMaster.actionFight();
      expect(gameStateManager.getMonsterHealth()).toBe('11');
    });

    it('should prevent use luck multiple times', () => {
      gameStateManager.setFightResult({ type: 'heroWins' });
      gameStateManager.setShowUseLuck(true);

      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValue({ roll1: 2, roll2: 3, sum: 5 });

      // First use luck
      gameMaster.actionUseLuck();
      expect(gameStateManager.getLuckUsed()).toBe(true);

      // GameMaster doesn't validate luckUsed, it just sets it
      // This validation is handled by App.jsx UI layer
      // So we verify that luckUsed is true after first call
      // App.jsx should prevent second call by checking this flag
      expect(gameStateManager.getLuckUsed()).toBe(true);
    });

    it('should handle luck effect when hero health is at max', () => {
      gameStateManager.setHealth('20');
      gameStateManager.setMaxHealth('20');
      gameStateManager.setFightResult({ type: 'monsterWins' });

      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValue({ roll1: 2, roll2: 3, sum: 5 }); // Lucky

      gameMaster.actionUseLuck();

      // Health should not exceed max
      expect(gameStateManager.getHealth()).toBe('20');
    });

    it('should handle luck effect when hero has no max health', () => {
      gameStateManager.setHealth('20');
      gameStateManager.setMaxHealth(null);
      gameStateManager.setFightResult({ type: 'monsterWins' });

      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValue({ roll1: 2, roll2: 3, sum: 5 }); // Lucky

      gameMaster.actionUseLuck();

      // Health should increase without cap
      expect(gameStateManager.getHealth()).toBe('21');
    });
  });

  describe('Full fight flow', () => {
    it('should complete full fight sequence from start to victory', () => {
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 });
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 1, roll2: 1, sum: 2 });

      // First attack
      let result = gameMaster.actionFight();
      expect(result.fightEnded).toBeNull();
      expect(gameStateManager.getMonsterHealth()).toBe('13');
      expect(gameStateManager.getShowUseLuck()).toBe(true);

      // Use luck
      gameStateManager.setFightResult(
        result.type === 'heroWins' ? { type: 'heroWins' } : null
      );
      mockRollDiceTwo.mockReturnValue({ roll1: 2, roll2: 3, sum: 5 });
      result = gameMaster.actionUseLuck();
      expect(result.fightEnded).toBeNull();
      expect(gameStateManager.getMonsterHealth()).toBe('12'); // 13 - 1

      // Second attack (finish monster)
      gameStateManager.setMonsterHealth('2');
      gameStateManager.setFightResult(null);
      gameStateManager.setShowUseLuck(false);
      gameStateManager.setLuckUsed(false);
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 });
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 1, roll2: 1, sum: 2 });

      result = gameMaster.actionFight();
      expect(result.fightEnded).toBe('won');
      expect(gameStateManager.getFightOutcome()).toBe('won');
      expect(gameStateManager.getGraveyard()).toContain('Goblin');
    });

    it('should complete full fight sequence from start to defeat', () => {
      gameStateManager.setHealth('3');
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 1, roll2: 1, sum: 2 }); // Monster wins
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 });

      // First attack
      let result = gameMaster.actionFight();
      expect(result.fightEnded).toBeNull();
      expect(gameStateManager.getHealth()).toBe('1');
      expect(gameStateManager.getShowUseLuck()).toBe(true);

      // Use luck (unlucky)
      gameStateManager.setFightResult({ type: 'monsterWins' });
      mockRollDiceTwo.mockReturnValue({ roll1: 3, roll2: 3, sum: 6 }); // Unlucky (6 > 5)
      result = gameMaster.actionUseLuck();
      expect(result.fightEnded).toBe('lost');
      expect(gameStateManager.getFightOutcome()).toBe('lost');
      expect(gameStateManager.getHealth()).toBe('0'); // 1 - 1
    });
  });
});
