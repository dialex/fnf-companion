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

describe('GameMaster', () => {
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
    gameShowManager = createGameShowManager(soundManager);
    gameMaster = createGameMaster({
      diceRoller,
      gameStateManager,
      gameShowManager,
      soundManager,
    });
  });

  describe('Game rules', () => {
    describe('isLucky', () => {
      it('should return true when roll sum is less than or equal to luck', () => {
        expect(gameMaster.isLucky(5, 10)).toBe(true);
        expect(gameMaster.isLucky(10, 10)).toBe(true);
        expect(gameMaster.isLucky(2, 10)).toBe(true);
      });

      it('should return false when roll sum is greater than luck', () => {
        expect(gameMaster.isLucky(11, 10)).toBe(false);
        expect(gameMaster.isLucky(12, 10)).toBe(false);
      });
    });

    describe('canTestLuck', () => {
      it('should return true when luck is greater than 0', () => {
        expect(gameMaster.canTestLuck(1)).toBe(true);
        expect(gameMaster.canTestLuck(10)).toBe(true);
      });

      it('should return false when luck is 0 or less', () => {
        expect(gameMaster.canTestLuck(0)).toBe(false);
        expect(gameMaster.canTestLuck(-1)).toBe(false);
      });
    });

    describe('resolveCombat', () => {
      it("should return 'heroWins' when hero total is greater", () => {
        expect(gameMaster.resolveCombat(10, 8)).toBe('heroWins');
        expect(gameMaster.resolveCombat(15, 10)).toBe('heroWins');
      });

      it("should return 'monsterWins' when monster total is greater", () => {
        expect(gameMaster.resolveCombat(8, 10)).toBe('monsterWins');
        expect(gameMaster.resolveCombat(10, 15)).toBe('monsterWins');
      });

      it("should return 'tie' when totals are equal", () => {
        expect(gameMaster.resolveCombat(10, 10)).toBe('tie');
        expect(gameMaster.resolveCombat(15, 15)).toBe('tie');
      });
    });

    describe('calculateDamage', () => {
      it('should return 2 for any winner', () => {
        expect(gameMaster.calculateDamage('heroWins')).toBe(2);
        expect(gameMaster.calculateDamage('monsterWins')).toBe(2);
      });
    });

    describe('calculateLuckEffect', () => {
      it('should reduce monster health by 1 when hero won and is lucky', () => {
        const result = gameMaster.calculateLuckEffect(true, true, 10, 20);
        expect(result.heroHealthDelta).toBe(0);
        expect(result.monsterHealthDelta).toBe(-1);
      });

      it('should increase monster health by 1 when hero won and is unlucky', () => {
        const result = gameMaster.calculateLuckEffect(true, false, 10, 20);
        expect(result.heroHealthDelta).toBe(0);
        expect(result.monsterHealthDelta).toBe(1);
      });

      it('should increase hero health by 1 when monster won and is lucky', () => {
        const result = gameMaster.calculateLuckEffect(false, true, 10, 20);
        expect(result.heroHealthDelta).toBe(1);
        expect(result.monsterHealthDelta).toBe(0);
      });

      it('should cap hero health at max when monster won and is lucky', () => {
        const result = gameMaster.calculateLuckEffect(false, true, 19, 20);
        expect(result.heroHealthDelta).toBe(1);
        expect(result.monsterHealthDelta).toBe(0);
      });

      it('should not exceed max health when monster won and is lucky', () => {
        const result = gameMaster.calculateLuckEffect(false, true, 20, 20);
        expect(result.heroHealthDelta).toBe(0);
        expect(result.monsterHealthDelta).toBe(0);
      });

      it('should reduce hero health by 1 when monster won and is unlucky', () => {
        const result = gameMaster.calculateLuckEffect(false, false, 10, 20);
        expect(result.heroHealthDelta).toBe(-1);
        expect(result.monsterHealthDelta).toBe(0);
      });

      it('should handle null max health when monster won and is lucky', () => {
        const result = gameMaster.calculateLuckEffect(false, true, 10, null);
        expect(result.heroHealthDelta).toBe(1);
        expect(result.monsterHealthDelta).toBe(0);
      });
    });

    describe('checkFightEnd', () => {
      it('should return won when monster health is 0 or less', () => {
        expect(gameMaster.checkFightEnd(10, 0)).toBe('won');
        expect(gameMaster.checkFightEnd(10, -1)).toBe('won');
      });

      it('should return lost when hero health is 0 or less', () => {
        expect(gameMaster.checkFightEnd(0, 10)).toBe('lost');
        expect(gameMaster.checkFightEnd(-1, 10)).toBe('lost');
      });

      it('should return null when both have health above 0', () => {
        expect(gameMaster.checkFightEnd(10, 10)).toBeNull();
        expect(gameMaster.checkFightEnd(1, 1)).toBeNull();
      });
    });
  });

  describe('actionFight', () => {
    beforeEach(() => {
      // Setup initial state
      gameStateManager.setSkill('10');
      gameStateManager.setHealth('20');
      gameStateManager.setLuck('5');
      gameStateManager.setMonsterCreature('Goblin');
      gameStateManager.setMonsterSkill('8');
      gameStateManager.setMonsterHealth('15');
      gameStateManager.setIsFighting(false);
      gameStateManager.setFightResult(null);
      gameStateManager.setFightOutcome(null);
      gameStateManager.setLuckUsed(false);
    });

    it('should roll dice for hero and monster', () => {
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 });
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 2, roll2: 5, sum: 7 });

      gameMaster.actionFight();

      expect(mockRollDiceTwo).toHaveBeenCalledTimes(2);
    });

    it('should calculate combat totals correctly', () => {
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 }); // Hero: 7 + 10 = 17
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 2, roll2: 5, sum: 7 }); // Monster: 7 + 8 = 15

      const result = gameMaster.actionFight();

      expect(result.heroTotal).toBe(17);
      expect(result.monsterTotal).toBe(15);
      expect(result.type).toBe('heroWins');
    });

    it('should apply damage when hero wins', () => {
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 }); // Hero wins
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 1, roll2: 1, sum: 2 });

      gameStateManager.setMonsterHealth('15');
      gameMaster.actionFight();

      expect(gameStateManager.getMonsterHealth()).toBe('13');
    });

    it('should apply damage when monster wins', () => {
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 1, roll2: 1, sum: 2 }); // Monster wins
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 });

      gameStateManager.setHealth('20');
      gameMaster.actionFight();

      expect(gameStateManager.getHealth()).toBe('18');
    });

    it('should not apply damage on tie', () => {
      // Reset state from previous tests
      gameStateManager.setHealth('20');
      gameStateManager.setMonsterHealth('15');
      gameStateManager.setShowUseLuck(false);
      gameStateManager.setFightResult(null);
      gameStateManager.setFightOutcome(null);

      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      // Create actual tie: hero rolls 5 (5+10=15), monster rolls 7 (7+8=15)
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 2, roll2: 3, sum: 5 }); // Hero: 5 + 10 = 15
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 }); // Monster: 7 + 8 = 15

      gameMaster.actionFight();

      expect(gameStateManager.getHealth()).toBe('20');
      expect(gameStateManager.getMonsterHealth()).toBe('15');
    });

    it('should update dice rolls in state', () => {
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 });
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 2, roll2: 5, sum: 7 });

      gameMaster.actionFight();

      expect(gameStateManager.getHeroDiceRolls()).toEqual([3, 4]);
      expect(gameStateManager.getMonsterDiceRolls()).toEqual([2, 5]);
    });

    it('should set fight result in state', () => {
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 });
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 1, roll2: 1, sum: 2 });

      gameMaster.actionFight();

      const fightResult = gameStateManager.getFightResult();
      expect(fightResult.type).toBe('heroWins');
      expect(fightResult.heroTotal).toBe(17);
      expect(fightResult.monsterTotal).toBe(10);
    });

    it('should show use luck button when there is a winner', () => {
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 });
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 1, roll2: 1, sum: 2 });

      gameMaster.actionFight();

      expect(gameStateManager.getShowUseLuck()).toBe(true);
    });

    it('should not show use luck button on tie', () => {
      // Reset state from previous tests
      gameStateManager.setHealth('20');
      gameStateManager.setMonsterHealth('15');
      gameStateManager.setShowUseLuck(false);
      gameStateManager.setFightResult(null);
      gameStateManager.setFightOutcome(null);

      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      // Create actual tie: hero rolls 5 (5+10=15), monster rolls 7 (7+8=15)
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 2, roll2: 3, sum: 5 }); // Hero: 5 + 10 = 15
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 }); // Monster: 7 + 8 = 15

      gameMaster.actionFight();

      expect(gameStateManager.getShowUseLuck()).toBe(false);
    });

    it('should play sounds when damage is dealt', () => {
      const mockPlayMonsterDamageSound = vi.spyOn(
        soundManager,
        'playMonsterDamageSound'
      );
      const mockPlayPlayerDamageSound = vi.spyOn(
        soundManager,
        'playPlayerDamageSound'
      );

      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 }); // Hero wins
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 1, roll2: 1, sum: 2 });

      gameMaster.actionFight();

      expect(mockPlayMonsterDamageSound).toHaveBeenCalledTimes(1);
      expect(mockPlayPlayerDamageSound).not.toHaveBeenCalled();
    });

    it('should return fight end result when monster health reaches 0', () => {
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 });
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 1, roll2: 1, sum: 2 });

      gameStateManager.setMonsterHealth('2'); // Will be reduced to 0

      const result = gameMaster.actionFight();

      expect(result.fightEnded).toBe('won');
      expect(gameStateManager.getFightOutcome()).toBe('won');
    });

    it('should return fight end result when hero health reaches 0', () => {
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 1, roll2: 1, sum: 2 }); // Monster wins
      mockRollDiceTwo.mockReturnValueOnce({ roll1: 3, roll2: 4, sum: 7 });

      gameStateManager.setHealth('2'); // Will be reduced to 0

      const result = gameMaster.actionFight();

      expect(result.fightEnded).toBe('lost');
      expect(gameStateManager.getFightOutcome()).toBe('lost');
    });
  });

  describe('actionUseLuck', () => {
    beforeEach(() => {
      gameStateManager.setLuck('5');
      gameStateManager.setHealth('20');
      gameStateManager.setMonsterHealth('15');
      gameStateManager.setFightResult({ type: 'heroWins' });
      gameStateManager.setLuckUsed(false);
    });

    it('should roll dice for luck test', () => {
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValue({ roll1: 2, roll2: 3, sum: 5 });

      gameMaster.actionUseLuck();

      expect(mockRollDiceTwo).toHaveBeenCalledTimes(1);
    });

    it('should determine if player is lucky', () => {
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValue({ roll1: 2, roll2: 3, sum: 5 }); // 5 <= 5 = lucky

      const result = gameMaster.actionUseLuck();

      expect(result.isLucky).toBe(true);
    });

    it('should apply luck effect when hero won and is lucky', () => {
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValue({ roll1: 2, roll2: 3, sum: 5 }); // Lucky

      gameStateManager.setMonsterHealth('15');
      gameMaster.actionUseLuck();

      expect(gameStateManager.getMonsterHealth()).toBe('14');
    });

    it('should apply luck effect when hero won and is unlucky', () => {
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValue({ roll1: 3, roll2: 3, sum: 6 }); // Unlucky (6 > 5)

      gameStateManager.setMonsterHealth('15');
      gameMaster.actionUseLuck();

      expect(gameStateManager.getMonsterHealth()).toBe('16');
    });

    it('should apply luck effect when monster won and is lucky', () => {
      gameStateManager.setFightResult({ type: 'monsterWins' });
      gameStateManager.setMaxHealth('20');
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValue({ roll1: 2, roll2: 3, sum: 5 }); // Lucky

      gameStateManager.setHealth('19');
      gameMaster.actionUseLuck();

      expect(gameStateManager.getHealth()).toBe('20');
    });

    it('should apply luck effect when monster won and is unlucky', () => {
      gameStateManager.setFightResult({ type: 'monsterWins' });
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValue({ roll1: 3, roll2: 3, sum: 6 }); // Unlucky

      gameStateManager.setHealth('20');
      gameMaster.actionUseLuck();

      expect(gameStateManager.getHealth()).toBe('19');
    });

    it('should decrement luck by 1', () => {
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValue({ roll1: 2, roll2: 3, sum: 5 });

      gameStateManager.setLuck('5');
      gameMaster.actionUseLuck();

      expect(gameStateManager.getLuck()).toBe('4');
    });

    it('should mark luck as used', () => {
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValue({ roll1: 2, roll2: 3, sum: 5 });

      gameMaster.actionUseLuck();

      expect(gameStateManager.getLuckUsed()).toBe(true);
    });

    it('should show luck test result', () => {
      const mockShowLuckTestResult = vi.spyOn(
        gameShowManager,
        'showLuckTestResult'
      );
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValue({ roll1: 2, roll2: 3, sum: 5 });

      gameMaster.actionUseLuck();

      expect(mockShowLuckTestResult).toHaveBeenCalledWith(true);
    });

    it('should return fight end result when fight ends', () => {
      const mockRollDiceTwo = vi.spyOn(diceRoller, 'rollDiceTwo');
      mockRollDiceTwo.mockReturnValue({ roll1: 2, roll2: 3, sum: 5 });

      gameStateManager.setMonsterHealth('1'); // Will be reduced to 0

      const result = gameMaster.actionUseLuck();

      expect(result.fightEnded).toBe('won');
    });
  });
});
