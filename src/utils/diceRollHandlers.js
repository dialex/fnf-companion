import { rollDie, rollTwoDice } from './dice';

/**
 * Internal helper to create a dice roll handler
 */
const createHandler = ({
  rollingType,
  rollFunction,
  onRollComplete,
  setDiceRollingType,
  setRollDieResult,
  setRollDiceResults,
  setTestLuckResult,
  setTestSkillResult,
  onBeforeRoll = () => {},
  onAfterRoll = () => {},
}) => {
  return () => {
    // Clear previous results
    setRollDieResult(null);
    setRollDiceResults(null);
    setTestLuckResult(null);
    setTestSkillResult(null);

    // Set rolling type
    setDiceRollingType(rollingType);

    // Call before roll callback
    onBeforeRoll();

    // Roll after timeout
    setTimeout(() => {
      const result = rollFunction();
      onRollComplete(result);
      setDiceRollingType(null);
      onAfterRoll();
    }, 1000);
  };
};

/**
 * Creates dice roll handlers with shared state setters
 * @param {Object} config - Shared configuration
 * @param {Function} config.setDiceRollingType - Setter for diceRollingType
 * @param {Function} config.setRollDieResult - Setter for rollDieResult
 * @param {Function} config.setRollDiceResults - Setter for rollDiceResults
 * @param {Function} config.setTestLuckResult - Setter for testLuckResult
 * @param {Function} config.setTestSkillResult - Setter for testSkillResult
 * @param {Function} config.getDiceRollingType - Getter for current diceRollingType
 * @param {Function} config.getSkill - Getter for current skill value
 * @param {Function} config.getLuck - Getter for current luck value
 * @param {Function} config.getIsTestingLuck - Getter for isTestingLuck state
 * @returns {Object} Object with specific handler methods
 */
export const createDiceRollHandlers = ({
  setDiceRollingType,
  setRollDieResult,
  setRollDiceResults,
  setTestLuckResult,
  setTestSkillResult,
  getDiceRollingType,
  getSkill,
  getLuck,
  getIsTestingLuck,
}) => {
  return {
    /**
     * Handler for rolling a single die
     */
    rollDie: ({ onRollComplete }) => {
      if (getDiceRollingType() !== null) return;
      return createHandler({
        rollingType: 'rollDie',
        rollFunction: rollDie,
        onRollComplete,
        setDiceRollingType,
        setRollDieResult,
        setRollDiceResults,
        setTestLuckResult,
        setTestSkillResult,
      });
    },

    /**
     * Handler for rolling two dice
     */
    rollDice: ({ onRollComplete }) => {
      if (getDiceRollingType() !== null) return;
      return createHandler({
        rollingType: 'rollDice',
        rollFunction: rollTwoDice,
        onRollComplete,
        setDiceRollingType,
        setRollDieResult,
        setRollDiceResults,
        setTestLuckResult,
        setTestSkillResult,
      });
    },

    /**
     * Handler for testing skill
     */
    testSkill: ({ onRollComplete }) => {
      const currentSkill = parseInt(getSkill()) || 0;
      if (currentSkill <= 0 || getDiceRollingType() !== null) return;
      return createHandler({
        rollingType: 'testSkill',
        rollFunction: rollTwoDice,
        onRollComplete,
        setDiceRollingType,
        setRollDieResult,
        setRollDiceResults,
        setTestLuckResult,
        setTestSkillResult,
      });
    },

    /**
     * Handler for testing luck
     */
    testLuck: ({ onBeforeRoll, onRollComplete, onAfterRoll }) => {
      const currentLuck = parseInt(getLuck()) || 0;
      if (
        currentLuck <= 0 ||
        getIsTestingLuck() ||
        getDiceRollingType() !== null
      ) {
        return;
      }
      return createHandler({
        rollingType: 'testLuck',
        rollFunction: rollTwoDice,
        onBeforeRoll,
        onRollComplete,
        onAfterRoll,
        setDiceRollingType,
        setRollDieResult,
        setRollDiceResults,
        setTestLuckResult,
        setTestSkillResult,
      });
    },
  };
};
