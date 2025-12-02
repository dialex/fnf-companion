import React, { useState, useEffect, useRef } from 'react';
import { t, getCurrentLanguage, setLanguage } from './translations';
import './App.css';

// Components
import Header from './components/Header';
import CharacterSection from './components/CharacterSection';
import ConsumablesSection from './components/ConsumablesSection';
import DiceRollsSection from './components/DiceRollsSection';
import InventorySection from './components/InventorySection';
import MapSection from './components/MapSection';
import FightSection from './components/FightSection';
import NotesSection from './components/NotesSection';

function App() {
  // Language state to trigger re-renders when language changes
  // Initialize from localStorage via getCurrentLanguage()
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  // Handler to update language and trigger re-render
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCurrentLang(lang);
  };
  // Character state
  const [name, setName] = useState('');
  const [skill, setSkill] = useState('');
  const [health, setHealth] = useState('');
  const [luck, setLuck] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [maxSkill, setMaxSkill] = useState(null);
  const [maxHealth, setMaxHealth] = useState(null);
  const [maxLuck, setMaxLuck] = useState(null);

  // Consumables state
  const [coins, setCoins] = useState('0');
  const [meals, setMeals] = useState('10');
  const [transactionObject, setTransactionObject] = useState('');
  const [transactionCost, setTransactionCost] = useState('');

  // Inventory and notes
  const [inventory, setInventory] = useState('');
  const [notes, setNotes] = useState('');

  // Fight state
  const [monsterSkill, setMonsterSkill] = useState('');
  const [monsterHealth, setMonsterHealth] = useState('');
  const [monsterCreature, setMonsterCreature] = useState('');
  const [graveyard, setGraveyard] = useState('');
  const [showUseLuck, setShowUseLuck] = useState(false);
  const [luckUsed, setLuckUsed] = useState(false);
  const [isFighting, setIsFighting] = useState(false);
  const [fightResult, setFightResult] = useState(null);
  const [fightOutcome, setFightOutcome] = useState(null);
  const [heroDiceRolls, setHeroDiceRolls] = useState(null);
  const [monsterDiceRolls, setMonsterDiceRolls] = useState(null);

  // Dice rolling state
  const [rollingButton, setRollingButton] = useState(null);
  const [rollDieResult, setRollDieResult] = useState(null);
  const [rollDiceResults, setRollDiceResults] = useState(null);
  const [testLuckResult, setTestLuckResult] = useState(null);
  const [isTestingLuck, setIsTestingLuck] = useState(false);
  const [testSkillResult, setTestSkillResult] = useState(null);
  const [diceRollingType, setDiceRollingType] = useState(null);

  // Refs for fight animation management
  const fightAnimationIdRef = useRef(null);
  const fightTimeoutRef = useRef(null);
  const safetyTimeoutRef = useRef(null);

  // Field badges
  const [fieldBadges, setFieldBadges] = useState({});

  // LocalStorage management
  const STORAGE_KEY = 'fnf-companion-state';
  const DEBOUNCE_DELAY = 2000; // 2 seconds
  const saveTimeoutRef = useRef(null);
  const isInitialMountRef = useRef(true);

  // Save state to localStorage
  const saveStateToStorage = (state) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      console.log('State saved to localStorage');
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  };

  // Load state from localStorage
  const loadStateFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return null;
    }
  };

  // Debounced save function
  const debouncedSave = (state) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveStateToStorage(state);
    }, DEBOUNCE_DELAY);
  };

  // Collect all state into a single object
  const getStateToSave = () => {
    return {
      metadata: {
        version: '1.0.0',
        savedAt: new Date().toISOString(),
        bookname: '', // Will be added to UI later
      },
      character: {
        name,
        skill,
        health,
        luck,
        isLocked,
        maxSkill,
        maxHealth,
        maxLuck,
      },
      consumables: {
        coins,
        meals,
        transactionObject,
        transactionCost,
      },
      inventory,
      notes,
      fight: {
        monsterSkill,
        monsterHealth,
        monsterCreature,
        graveyard,
        showUseLuck,
        luckUsed,
        isFighting,
        fightResult,
        fightOutcome,
        heroDiceRolls,
        monsterDiceRolls,
      },
      diceRolls: {
        rollingButton,
        rollDieResult,
        rollDiceResults,
        testLuckResult,
        isTestingLuck,
        testSkillResult,
        diceRollingType,
      },
    };
  };

  // Load state on mount - run FIRST before any other effects
  useEffect(() => {
    const savedState = loadStateFromStorage();
    console.log('Loading state from localStorage:', savedState);

    if (savedState) {
      // Restore character state
      if (savedState.character) {
        if (savedState.character.name !== undefined)
          setName(savedState.character.name);
        if (savedState.character.skill !== undefined)
          setSkill(savedState.character.skill);
        if (savedState.character.health !== undefined)
          setHealth(savedState.character.health);
        if (savedState.character.luck !== undefined)
          setLuck(savedState.character.luck);
        if (savedState.character.isLocked !== undefined)
          setIsLocked(savedState.character.isLocked);
        if (savedState.character.maxSkill !== undefined)
          setMaxSkill(savedState.character.maxSkill);
        if (savedState.character.maxHealth !== undefined)
          setMaxHealth(savedState.character.maxHealth);
        if (savedState.character.maxLuck !== undefined)
          setMaxLuck(savedState.character.maxLuck);
      }

      // Restore consumables
      if (savedState.consumables) {
        if (savedState.consumables.coins !== undefined)
          setCoins(savedState.consumables.coins);
        if (savedState.consumables.meals !== undefined)
          setMeals(savedState.consumables.meals);
        if (savedState.consumables.transactionObject !== undefined)
          setTransactionObject(savedState.consumables.transactionObject);
        if (savedState.consumables.transactionCost !== undefined)
          setTransactionCost(savedState.consumables.transactionCost);
      }

      // Restore inventory and notes
      if (savedState.inventory !== undefined)
        setInventory(savedState.inventory);
      if (savedState.notes !== undefined) setNotes(savedState.notes);

      // Restore fight state
      if (savedState.fight) {
        if (savedState.fight.monsterSkill !== undefined)
          setMonsterSkill(savedState.fight.monsterSkill);
        if (savedState.fight.monsterHealth !== undefined)
          setMonsterHealth(savedState.fight.monsterHealth);
        if (savedState.fight.monsterCreature !== undefined)
          setMonsterCreature(savedState.fight.monsterCreature);
        if (savedState.fight.graveyard !== undefined)
          setGraveyard(savedState.fight.graveyard);
        if (savedState.fight.showUseLuck !== undefined)
          setShowUseLuck(savedState.fight.showUseLuck);
        if (savedState.fight.luckUsed !== undefined)
          setLuckUsed(savedState.fight.luckUsed);
        if (savedState.fight.isFighting !== undefined)
          setIsFighting(savedState.fight.isFighting);
        if (savedState.fight.fightResult !== undefined)
          setFightResult(savedState.fight.fightResult);
        if (savedState.fight.fightOutcome !== undefined)
          setFightOutcome(savedState.fight.fightOutcome);
        if (savedState.fight.heroDiceRolls !== undefined)
          setHeroDiceRolls(savedState.fight.heroDiceRolls);
        if (savedState.fight.monsterDiceRolls !== undefined)
          setMonsterDiceRolls(savedState.fight.monsterDiceRolls);
      }

      // Restore dice rolls state
      if (savedState.diceRolls) {
        if (savedState.diceRolls.rollingButton !== undefined)
          setRollingButton(savedState.diceRolls.rollingButton);
        if (savedState.diceRolls.rollDieResult !== undefined)
          setRollDieResult(savedState.diceRolls.rollDieResult);
        if (savedState.diceRolls.rollDiceResults !== undefined)
          setRollDiceResults(savedState.diceRolls.rollDiceResults);
        if (savedState.diceRolls.testLuckResult !== undefined)
          setTestLuckResult(savedState.diceRolls.testLuckResult);
        if (savedState.diceRolls.isTestingLuck !== undefined)
          setIsTestingLuck(savedState.diceRolls.isTestingLuck);
        if (savedState.diceRolls.testSkillResult !== undefined)
          setTestSkillResult(savedState.diceRolls.testSkillResult);
        if (savedState.diceRolls.diceRollingType !== undefined)
          setDiceRollingType(savedState.diceRolls.diceRollingType);
      }

      console.log('State restored from localStorage');
    } else {
      console.log('No saved state found in localStorage');
    }

    // Mark initial mount as complete AFTER a small delay to ensure all state setters have run
    setTimeout(() => {
      isInitialMountRef.current = false;
    }, 100);
  }, []);

  // Save state on changes (debounced)
  useEffect(() => {
    // Skip save on initial mount
    if (isInitialMountRef.current) {
      console.log('Skipping save - initial mount');
      return;
    }

    console.log('State changed, preparing to save...');
    const stateToSave = {
      metadata: {
        version: '1.0.0',
        savedAt: new Date().toISOString(),
        bookname: '',
      },
      character: {
        name,
        skill,
        health,
        luck,
        isLocked,
        maxSkill,
        maxHealth,
        maxLuck,
      },
      consumables: {
        coins,
        meals,
        transactionObject,
        transactionCost,
      },
      inventory,
      notes,
      fight: {
        monsterSkill,
        monsterHealth,
        monsterCreature,
        graveyard,
        showUseLuck,
        luckUsed,
        isFighting,
        fightResult,
        fightOutcome,
        heroDiceRolls,
        monsterDiceRolls,
      },
      diceRolls: {
        rollingButton,
        rollDieResult,
        rollDiceResults,
        testLuckResult,
        isTestingLuck,
        testSkillResult,
        diceRollingType,
      },
    };

    console.log('Calling debouncedSave with state:', stateToSave);
    debouncedSave(stateToSave);

    // Cleanup: save immediately on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Use the same state object from the effect closure
        saveStateToStorage(stateToSave);
      }
    };
  }, [
    name,
    skill,
    health,
    luck,
    isLocked,
    maxSkill,
    maxHealth,
    maxLuck,
    coins,
    meals,
    transactionObject,
    transactionCost,
    inventory,
    notes,
    monsterSkill,
    monsterHealth,
    monsterCreature,
    graveyard,
    showUseLuck,
    luckUsed,
    isFighting,
    fightResult,
    fightOutcome,
    heroDiceRolls,
    monsterDiceRolls,
    rollingButton,
    rollDieResult,
    rollDiceResults,
    testLuckResult,
    isTestingLuck,
    testSkillResult,
    diceRollingType,
  ]);

  // Utility functions
  const handleNumberChange = (setter, value, maxValue) => {
    setter(value);
    if (maxValue !== null && value !== '') {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue > maxValue) {
        setter(String(maxValue));
      }
    }
  };

  const showFieldBadge = (fieldName, value, type = 'success') => {
    const id = Date.now();
    setFieldBadges((prev) => ({
      ...prev,
      [fieldName]: { value, type, id },
    }));
    setTimeout(() => {
      setFieldBadges((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }, 2200);
  };

  // Character handlers
  const handleRandomStats = () => {
    const skillRoll = Math.floor(Math.random() * 6) + 1;
    const newSkill = skillRoll + 6;
    setSkill(
      String(maxSkill !== null ? Math.min(newSkill, maxSkill) : newSkill)
    );

    const healthRoll1 = Math.floor(Math.random() * 6) + 1;
    const healthRoll2 = Math.floor(Math.random() * 6) + 1;
    const newHealth = healthRoll1 + healthRoll2 + 12;
    setHealth(
      String(maxHealth !== null ? Math.min(newHealth, maxHealth) : newHealth)
    );

    const luckRoll = Math.floor(Math.random() * 6) + 1;
    const newLuck = luckRoll + 6;
    setLuck(String(maxLuck !== null ? Math.min(newLuck, maxLuck) : newLuck));
  };

  const handleRandomStatsWithAnimation = () => {
    setRollingButton('randomize');
    setTimeout(() => {
      handleRandomStats();
      setRollingButton(null);
    }, 1000);
  };

  const handleToggleLock = () => {
    if (!isLocked) {
      setMaxSkill(parseInt(skill) || null);
      setMaxHealth(parseInt(health) || null);
      setMaxLuck(parseInt(luck) || null);
    } else {
      setMaxSkill(null);
      setMaxHealth(null);
      setMaxLuck(null);
    }
    setIsLocked(!isLocked);
  };

  // Consumables handlers
  const handleConsumeMeal = () => {
    const currentMeals = parseInt(meals) || 0;
    if (currentMeals > 0) {
      const audio = new Audio(
        `${import.meta.env.BASE_URL}audio/minecraft-eat.mp3`
      );
      audio.play().catch((error) => {
        console.warn('Could not play audio:', error);
      });

      setMeals(String(currentMeals - 1));
      showFieldBadge('meals', '-1', 'danger');

      const currentHealth = parseInt(health) || 0;
      const newHealth = currentHealth + 4;
      const actualIncrease =
        maxHealth !== null ? Math.min(newHealth, maxHealth) - currentHealth : 4;
      setHealth(
        String(maxHealth !== null ? Math.min(newHealth, maxHealth) : newHealth)
      );
      if (actualIncrease > 0) {
        showFieldBadge('health', `+${actualIncrease}`, 'success');
      }
    }
  };

  const handlePurchase = () => {
    const objectName = transactionObject.trim();
    const cost = parseInt(transactionCost) || 0;
    const currentCoins = parseInt(coins) || 0;

    if (objectName && cost > 0 && currentCoins >= cost) {
      const newCoins = Math.max(0, currentCoins - cost);
      setCoins(String(newCoins));
      showFieldBadge('coins', `-${cost}`, 'danger');

      const currentInventory = inventory.trim();
      const separator = currentInventory ? '\n' : '';
      setInventory(`${currentInventory}${separator}${objectName}`);
      showFieldBadge('inventory', t('transaction.added'), 'success');

      setTransactionObject('');
      setTransactionCost('');
    }
  };

  // Dice rolling handlers
  const handleTestYourLuck = () => {
    const currentLuck = parseInt(luck) || 0;
    if (currentLuck <= 0 || isTestingLuck || diceRollingType !== null) return;

    setIsTestingLuck(true);
    setDiceRollingType('testLuck');
    setRollDieResult(null);
    setRollDiceResults(null);
    setTestLuckResult(null);
    setTestSkillResult(null);

    setTimeout(() => {
      const roll1 = Math.floor(Math.random() * 6) + 1;
      const roll2 = Math.floor(Math.random() * 6) + 1;
      const sum = roll1 + roll2;
      const isLucky = sum <= currentLuck;

      if (isLucky) {
        const audio = new Audio(
          `${import.meta.env.BASE_URL}audio/rayman-lucky.mp3`
        );
        audio.play().catch((error) => {
          console.warn('Could not play audio:', error);
        });
      }

      setTestLuckResult({ roll1, roll2, isLucky });
      const newLuck = Math.max(0, currentLuck - 1);
      setLuck(String(newLuck));
      setIsTestingLuck(false);
      setDiceRollingType(null);
    }, 1000);
  };

  const handleTestYourSkill = () => {
    const currentSkill = parseInt(skill) || 0;
    if (currentSkill <= 0 || diceRollingType !== null) return;

    setDiceRollingType('testSkill');
    setRollDieResult(null);
    setRollDiceResults(null);
    setTestLuckResult(null);
    setTestSkillResult(null);

    setTimeout(() => {
      const roll1 = Math.floor(Math.random() * 6) + 1;
      const roll2 = Math.floor(Math.random() * 6) + 1;
      const sum = roll1 + roll2;
      const passed = sum <= currentSkill;

      setTestSkillResult({ roll1, roll2, passed });
      setDiceRollingType(null);
    }, 1000);
  };

  const handleRollDie = () => {
    if (diceRollingType !== null) return;
    setDiceRollingType('rollDie');
    setTestLuckResult(null);
    setTestSkillResult(null);
    setRollDiceResults(null);
    setRollDieResult(null);
    setTimeout(() => {
      const result = Math.floor(Math.random() * 6) + 1;
      setRollDieResult(result);
      setDiceRollingType(null);
    }, 1000);
  };

  const handleRollDice = () => {
    if (diceRollingType !== null) return;
    setDiceRollingType('rollDice');
    setTestLuckResult(null);
    setTestSkillResult(null);
    setRollDieResult(null);
    setRollDiceResults(null);
    setTimeout(() => {
      const result1 = Math.floor(Math.random() * 6) + 1;
      const result2 = Math.floor(Math.random() * 6) + 1;
      setRollDiceResults([result1, result2]);
      setDiceRollingType(null);
    }, 1000);
  };

  // Fight handlers
  const checkFightEnd = (heroHealthValue = null, monsterHealthValue = null) => {
    const currentHealth =
      heroHealthValue !== null ? heroHealthValue : parseInt(health) || 0;
    const currentMonsterHealth =
      monsterHealthValue !== null
        ? monsterHealthValue
        : parseInt(monsterHealth) || 0;
    const creatureName = monsterCreature.trim();

    if (currentMonsterHealth <= 0 && creatureName) {
      setFightOutcome('won');
      const currentGraveyard = graveyard.trim();
      const separator = currentGraveyard ? '\n' : '';
      setGraveyard(
        `${currentGraveyard}${separator}${t('fight.defeatCreature')} ${creatureName}`
      );
      setIsFighting(false);
      setDiceRollingType(null);
      setTimeout(() => {
        setFightOutcome(null);
        setMonsterCreature('');
        setMonsterSkill('');
        setMonsterHealth('');
        setHeroDiceRolls(null);
        setMonsterDiceRolls(null);
        setFightResult(null);
        setTestLuckResult(null);
        setShowUseLuck(false);
        setLuckUsed(false);
      }, 5000);
      return true;
    } else if (currentHealth <= 0) {
      setFightOutcome('lost');
      const currentGraveyard = graveyard.trim();
      const separator = currentGraveyard ? '\n' : '';
      setGraveyard(
        `${currentGraveyard}${separator}${t('fight.defeatedBy')} ${creatureName}`
      );
      setIsFighting(false);
      setDiceRollingType(null);
      setTimeout(() => {
        setFightOutcome(null);
        setMonsterCreature('');
        setMonsterSkill('');
        setMonsterHealth('');
        setHeroDiceRolls(null);
        setMonsterDiceRolls(null);
        setFightResult(null);
        setTestLuckResult(null);
        setShowUseLuck(false);
        setLuckUsed(false);
      }, 5000);
      return true;
    }
    return false;
  };

  const handleFight = () => {
    const currentSkill = parseInt(skill) || 0;
    const currentHealth = parseInt(health) || 0;
    const currentLuck = parseInt(luck) || 0;

    if (
      !currentSkill ||
      !currentHealth ||
      !currentLuck ||
      !monsterCreature.trim() ||
      !monsterSkill ||
      !monsterHealth ||
      parseInt(monsterSkill) <= 0 ||
      parseInt(monsterHealth) <= 0 ||
      isFighting ||
      diceRollingType !== null ||
      fightOutcome !== null
    ) {
      return;
    }

    if (fightTimeoutRef.current) {
      clearTimeout(fightTimeoutRef.current);
      fightTimeoutRef.current = null;
    }
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }

    const animationId = Date.now();
    fightAnimationIdRef.current = animationId;
    setIsFighting(true);
    setDiceRollingType('fight');
    setFightResult(null);
    setFightOutcome(null);
    setLuckUsed(false);
    setRollDieResult(null);
    setRollDiceResults(null);
    setTestLuckResult(null);
    setTestSkillResult(null);

    fightTimeoutRef.current = setTimeout(() => {
      if (fightAnimationIdRef.current !== animationId) {
        return;
      }

      try {
        const heroRoll1 = Math.floor(Math.random() * 6) + 1;
        const heroRoll2 = Math.floor(Math.random() * 6) + 1;
        const heroDiceSum = heroRoll1 + heroRoll2;

        const monsterRoll1 = Math.floor(Math.random() * 6) + 1;
        const monsterRoll2 = Math.floor(Math.random() * 6) + 1;
        const monsterDiceSum = monsterRoll1 + monsterRoll2;

        const heroSkill = parseInt(skill) || 0;
        const monsterSkillValue = parseInt(monsterSkill) || 0;
        const heroTotal = heroDiceSum + heroSkill;
        const monsterTotal = monsterDiceSum + monsterSkillValue;

        const currentHealth = parseInt(health) || 0;
        const currentMonsterHealth = parseInt(monsterHealth) || 0;

        let resultType = '';
        let resultMessage = '';
        let newHealth = currentHealth;
        let newMonsterHealth = currentMonsterHealth;
        let shouldShowUseLuck = false;
        let fightEnded = false;

        if (heroTotal === monsterTotal) {
          resultType = 'tie';
          resultMessage = t('fight.attackTie');
        } else if (heroTotal > monsterTotal) {
          resultType = 'heroWins';
          resultMessage = t('fight.attackWin');
          newMonsterHealth = Math.max(0, currentMonsterHealth - 2);
        } else {
          resultType = 'monsterWins';
          resultMessage = t('fight.attackLoss');
          newHealth = Math.max(0, currentHealth - 2);
        }

        // Update health values first, before checking if fight ended
        setHeroDiceRolls([heroRoll1, heroRoll2]);
        setMonsterDiceRolls([monsterRoll1, monsterRoll2]);

        if (newHealth !== currentHealth) {
          setHealth(String(newHealth));
          showFieldBadge('heroHealth', '-2', 'danger');
        }
        if (newMonsterHealth !== currentMonsterHealth) {
          setMonsterHealth(String(newMonsterHealth));
          showFieldBadge('monsterHealth', '-2', 'danger');
        }

        // Now check if fight ended with the updated health values
        fightEnded = checkFightEnd(newHealth, newMonsterHealth);

        if (fightEnded) {
          setIsFighting(false);
          setDiceRollingType(null);
          return;
        }

        // Only show use luck if hero won and fight didn't end
        if (resultType === 'heroWins') {
          shouldShowUseLuck = true;
        }

        setFightResult({
          type: resultType,
          message: resultMessage,
          heroTotal,
          monsterTotal,
        });

        if (shouldShowUseLuck) {
          setShowUseLuck(true);
        }

        if (fightAnimationIdRef.current === animationId) {
          setIsFighting(false);
          setDiceRollingType(null);
          fightAnimationIdRef.current = null;
        }
      } catch (error) {
        console.error('Error in fight calculation:', error);
        setIsFighting(false);
        setDiceRollingType(null);
      }
    }, 1000);

    safetyTimeoutRef.current = setTimeout(() => {
      if (fightAnimationIdRef.current === animationId) {
        setDiceRollingType((current) => {
          if (current === 'fight') {
            setIsFighting(false);
            fightAnimationIdRef.current = null;
            return null;
          }
          return current;
        });
      }
    }, 2000);
  };

  const handleUseLuck = () => {
    const currentLuck = parseInt(luck) || 0;
    if (
      currentLuck <= 0 ||
      diceRollingType !== null ||
      !fightResult ||
      luckUsed
    )
      return;

    setIsTestingLuck(true);
    setDiceRollingType('useLuck');
    setTestLuckResult(null);
    setLuckUsed(true);
    setRollDieResult(null);
    setRollDiceResults(null);
    setTestSkillResult(null);

    setTimeout(() => {
      const roll1 = Math.floor(Math.random() * 6) + 1;
      const roll2 = Math.floor(Math.random() * 6) + 1;
      const sum = roll1 + roll2;
      const isLucky = sum <= currentLuck;

      if (isLucky) {
        const audio = new Audio(
          `${import.meta.env.BASE_URL}audio/rayman-lucky.mp3`
        );
        audio.play().catch((error) => {
          console.warn('Could not play audio:', error);
        });
      }

      const heroWonLastFight = fightResult.type === 'heroWins';
      const currentHealth = parseInt(health) || 0;
      const currentMonsterHealth = parseInt(monsterHealth) || 0;
      let newHealth = currentHealth;
      let newMonsterHealth = currentMonsterHealth;

      if (heroWonLastFight) {
        if (isLucky) {
          newMonsterHealth = Math.max(0, currentMonsterHealth - 1);
          setMonsterHealth(String(newMonsterHealth));
          showFieldBadge('monsterHealth', '-1', 'danger');
        } else {
          newMonsterHealth = currentMonsterHealth + 1;
          setMonsterHealth(String(newMonsterHealth));
          showFieldBadge('monsterHealth', '+1', 'success');
        }
      } else {
        if (isLucky) {
          const maxHealthValue =
            maxHealth !== null ? parseInt(maxHealth) : null;
          newHealth =
            maxHealthValue !== null
              ? Math.min(currentHealth + 1, maxHealthValue)
              : currentHealth + 1;
          const actualIncrease = newHealth - currentHealth;
          setHealth(String(newHealth));
          if (actualIncrease > 0) {
            showFieldBadge('heroHealth', '+1', 'success');
          }
        } else {
          newHealth = Math.max(0, currentHealth - 1);
          setHealth(String(newHealth));
          showFieldBadge('heroHealth', '-1', 'danger');
        }
      }

      const newLuck = Math.max(0, currentLuck - 1);
      setLuck(String(newLuck));

      const fightEnded = checkFightEnd(newHealth, newMonsterHealth);

      if (fightEnded) {
        setIsTestingLuck(false);
        setDiceRollingType(null);
        return;
      }

      setTestLuckResult({ roll1, roll2, isLucky });
      setIsTestingLuck(false);
      setDiceRollingType(null);
    }, 1000);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'default');
  }, []);

  // Save immediately when page is closing
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear any pending debounced save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Save immediately with current state
      const stateToSave = {
        metadata: {
          version: '1.0.0',
          savedAt: new Date().toISOString(),
          bookname: '',
        },
        character: {
          name,
          skill,
          health,
          luck,
          isLocked,
          maxSkill,
          maxHealth,
          maxLuck,
        },
        consumables: {
          coins,
          meals,
          transactionObject,
          transactionCost,
        },
        inventory,
        notes,
        fight: {
          monsterSkill,
          monsterHealth,
          monsterCreature,
          graveyard,
          showUseLuck,
          luckUsed,
          isFighting,
          fightResult,
          fightOutcome,
          heroDiceRolls,
          monsterDiceRolls,
        },
        diceRolls: {
          rollingButton,
          rollDieResult,
          rollDiceResults,
          testLuckResult,
          isTestingLuck,
          testSkillResult,
          diceRollingType,
        },
      };
      saveStateToStorage(stateToSave);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [
    name,
    skill,
    health,
    luck,
    isLocked,
    maxSkill,
    maxHealth,
    maxLuck,
    coins,
    meals,
    transactionObject,
    transactionCost,
    inventory,
    notes,
    monsterSkill,
    monsterHealth,
    monsterCreature,
    graveyard,
    showUseLuck,
    luckUsed,
    isFighting,
    fightResult,
    fightOutcome,
    heroDiceRolls,
    monsterDiceRolls,
    rollingButton,
    rollDieResult,
    rollDiceResults,
    testLuckResult,
    isTestingLuck,
    testSkillResult,
    diceRollingType,
  ]);

  return (
    <div className="min-vh-100 bg-beige">
      <Header onLanguageChange={handleLanguageChange} />
      <main className="container mx-auto py-4">
        <div className="row gx-4 mb-4">
          <div className="col-12 col-md-4">
            <CharacterSection
              name={name}
              skill={skill}
              health={health}
              luck={luck}
              maxSkill={maxSkill}
              maxHealth={maxHealth}
              maxLuck={maxLuck}
              isLocked={isLocked}
              fieldBadges={fieldBadges}
              rollingButton={rollingButton}
              onNameChange={setName}
              onSkillChange={setSkill}
              onHealthChange={setHealth}
              onLuckChange={setLuck}
              onRandomStats={handleRandomStatsWithAnimation}
              onToggleLock={handleToggleLock}
              onNumberChange={handleNumberChange}
            />
          </div>
          <div className="col-12 col-md-4">
            <ConsumablesSection
              coins={coins}
              meals={meals}
              health={health}
              maxHealth={maxHealth}
              transactionObject={transactionObject}
              transactionCost={transactionCost}
              fieldBadges={fieldBadges}
              onCoinsChange={setCoins}
              onMealsChange={setMeals}
              onTransactionObjectChange={setTransactionObject}
              onTransactionCostChange={setTransactionCost}
              onConsumeMeal={handleConsumeMeal}
              onPurchase={handlePurchase}
              onNumberChange={handleNumberChange}
            />
          </div>
          <div className="col-12 col-md-4">
            <DiceRollsSection
              skill={skill}
              luck={luck}
              diceRollingType={diceRollingType}
              isTestingLuck={isTestingLuck}
              rollDieResult={rollDieResult}
              rollDiceResults={rollDiceResults}
              testLuckResult={testLuckResult}
              testSkillResult={testSkillResult}
              onTestYourLuck={handleTestYourLuck}
              onTestYourSkill={handleTestYourSkill}
              onRollDie={handleRollDie}
              onRollDice={handleRollDice}
            />
          </div>
        </div>
        <div className="row gx-4 mb-4">
          <div className="col-12 col-md-4">
            <InventorySection
              inventory={inventory}
              onInventoryChange={setInventory}
              fieldBadges={fieldBadges}
            />
          </div>
          <div className="col-12 col-md-8">
            <MapSection />
          </div>
        </div>
        <div className="row gx-4 mb-4">
          <div className="col-12">
            <FightSection
              skill={skill}
              health={health}
              luck={luck}
              monsterCreature={monsterCreature}
              monsterSkill={monsterSkill}
              monsterHealth={monsterHealth}
              graveyard={graveyard}
              showUseLuck={showUseLuck}
              luckUsed={luckUsed}
              isFighting={isFighting}
              fightResult={fightResult}
              fightOutcome={fightOutcome}
              heroDiceRolls={heroDiceRolls}
              monsterDiceRolls={monsterDiceRolls}
              testLuckResult={testLuckResult}
              isTestingLuck={isTestingLuck}
              diceRollingType={diceRollingType}
              fieldBadges={fieldBadges}
              onMonsterCreatureChange={setMonsterCreature}
              onMonsterSkillChange={setMonsterSkill}
              onMonsterHealthChange={setMonsterHealth}
              onFight={handleFight}
              onUseLuck={handleUseLuck}
              onNumberChange={handleNumberChange}
            />
          </div>
        </div>
        <div className="row gx-4 mb-4">
          <div className="col-12">
            <NotesSection notes={notes} onNotesChange={setNotes} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
