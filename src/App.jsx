import React, { useState, useEffect, useRef } from 'react';
import Icon from '@mdi/react';
import { mdiChevronDown, mdiChevronUp, mdiBook } from '@mdi/js';
import { t, getCurrentLanguage, setLanguage } from './translations';
import {
  loadState,
  saveState,
  buildStateObject,
  applyLoadedState,
  createDebouncedSave,
} from './utils/stateManager';
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
import NotificationBanner from './components/NotificationBanner';
import ConfirmationDialog from './components/ConfirmationDialog';

function App() {
  // Language state to trigger re-renders when language changes
  // Initialize from localStorage via getCurrentLanguage()
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  // Handler to update language and trigger re-render
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCurrentLang(lang);
  };
  // Game state
  const [book, setBook] = useState('');

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
  const [potionType, setPotionType] = useState('');
  const [potionUsed, setPotionUsed] = useState(false);

  // Inventory and notes
  const [inventory, setInventory] = useState('');
  const [notes, setNotes] = useState('');

  // Trail state - each item is { number: number, color: string }
  const [trailSequence, setTrailSequence] = useState([
    { number: 1, color: 'primary-1' },
  ]);
  const [trailInput, setTrailInput] = useState('');

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

  // Notification banner
  const [notification, setNotification] = useState(null);

  // Confirmation dialog
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Section expansion control
  const [shouldExpandSections, setShouldExpandSections] = useState(false);

  // Game section collapse state
  const [isGameExpanded, setIsGameExpanded] = useState(true);

  const toggleGameCollapse = () => {
    setIsGameExpanded(!isGameExpanded);
  };

  // State management
  const isInitialMountRef = useRef(true);
  const debouncedSaveRef = useRef(
    createDebouncedSave((state) => {
      saveState(state);
    })
  );

  // Load state on mount
  useEffect(() => {
    const savedState = loadState();
    if (savedState) {
      if (savedState.metadata?.bookname) {
        setBook(savedState.metadata.bookname);
      }
      applyLoadedState(savedState, {
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
        setMonsterSkill,
        setMonsterHealth,
        setMonsterCreature,
        setGraveyard,
        setShowUseLuck,
        setLuckUsed,
        setIsFighting,
        setFightResult,
        setFightOutcome,
        setHeroDiceRolls,
        setMonsterDiceRolls,
        setRollingButton,
        setRollDieResult,
        setRollDiceResults,
        setTestLuckResult,
        setIsTestingLuck,
        setTestSkillResult,
        setDiceRollingType,
        setTrailSequence,
      });
    }

    // Mark initial mount as complete after a small delay
    setTimeout(() => {
      isInitialMountRef.current = false;
    }, 100);
  }, []);

  // Save state on changes (debounced)
  useEffect(() => {
    // Skip save on initial mount
    if (isInitialMountRef.current) {
      return;
    }

    const stateToSave = buildStateObject({
      book,
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
      potionType,
      potionUsed,
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
      trailSequence,
    });

    debouncedSaveRef.current(stateToSave);

    // Cleanup: save immediately on unmount
    return () => {
      saveState(stateToSave);
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
    potionType,
    potionUsed,
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
    trailSequence,
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

  // Trail handlers
  const handleTrailSubmit = () => {
    const num = parseInt(trailInput);
    if (isNaN(num) || num < 1 || num > 400) {
      return;
    }

    // Add number to sequence with default color
    setTrailSequence((prev) => [...prev, { number: num, color: 'secondary' }]);
    // Clear input
    setTrailInput('');
  };

  const handleTrailTest = () => {
    // Available colors for random selection
    const colors = ['dark', 'info', 'success', 'danger', 'warning'];
    // Generate 20 random numbers between 1 and 400 with random colors
    const randomNumbers = Array.from({ length: 20 }, () => ({
      number: Math.floor(Math.random() * 400) + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setTrailSequence((prev) => [...prev, ...randomNumbers]);
  };

  const handleTrailPillColorChange = (color) => {
    setTrailSequence((prev) => {
      if (prev.length === 0) return prev;
      const newSequence = [...prev];
      const lastIndex = newSequence.length - 1;
      newSequence[lastIndex] = {
        ...newSequence[lastIndex],
        color: color,
      };
      return newSequence;
    });
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

  const handleConsumePotion = () => {
    if (potionUsed || !potionType || !isLocked) return;

    if (potionType === 'skill' && maxSkill !== null) {
      setSkill(String(maxSkill));
      showFieldBadge(
        'skill',
        `+${maxSkill - (parseInt(skill) || 0)}`,
        'success'
      );
    } else if (potionType === 'health' && maxHealth !== null) {
      setHealth(String(maxHealth));
      showFieldBadge(
        'health',
        `+${maxHealth - (parseInt(health) || 0)}`,
        'success'
      );
    } else if (potionType === 'luck' && maxLuck !== null) {
      setLuck(String(maxLuck));
      showFieldBadge('luck', `+${maxLuck - (parseInt(luck) || 0)}`, 'success');
    }

    setPotionUsed(true);
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setShowResetConfirm(false);
    // Reset all state to defaults
    setBook('');
    setName('');
    setSkill('');
    setHealth('');
    setLuck('');
    setIsLocked(false);
    setMaxSkill(null);
    setMaxHealth(null);
    setMaxLuck(null);
    setCoins('0');
    setMeals('10');
    setTransactionObject('');
    setTransactionCost('');
    setPotionType('');
    setPotionUsed(false);
    setInventory('');
    setNotes('');
    setMonsterSkill('');
    setMonsterHealth('');
    setMonsterCreature('');
    setGraveyard('');
    setShowUseLuck(false);
    setLuckUsed(false);
    setIsFighting(false);
    setFightResult(null);
    setFightOutcome(null);
    setHeroDiceRolls(null);
    setMonsterDiceRolls(null);
    setRollingButton(null);
    setRollDieResult(null);
    setRollDiceResults(null);
    setTestLuckResult(null);
    setIsTestingLuck(false);
    setTestSkillResult(null);
    setDiceRollingType(null);
    setTrailSequence([{ number: 1, color: 'primary-1' }]);
    setTrailInput('');
    setShouldExpandSections(false);
  };

  const handleSaveGame = () => {
    const stateToSave = buildStateObject({
      book,
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
      potionType,
      potionUsed,
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
      trailSequence,
    });

    // Generate filename: <book>-<charactername>-<YYYYMMDD>-<HHMMSS>.json
    const now = new Date();
    const datePart =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');
    const timePart =
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');

    const sanitizeFilename = (str) => {
      return str.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    };

    const bookPart = sanitizeFilename(book || 'book');
    const namePart = sanitizeFilename(name || 'character');
    const filename = `${bookPart}-${namePart}-${datePart}-${timePart}.json`;

    const jsonString = JSON.stringify(stateToSave, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setNotification({ message: t('game.saved'), type: 'success' });
  };

  const handleLoadGame = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file extension
      if (!file.name.toLowerCase().endsWith('.json')) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonContent = event.target.result;
          const loadedState = JSON.parse(jsonContent);

          // Validate it's a valid state object
          if (!loadedState || typeof loadedState !== 'object') {
            return;
          }

          // Restore book name
          if (loadedState.metadata?.bookname) {
            setBook(loadedState.metadata.bookname);
          }

          // Apply loaded state
          applyLoadedState(loadedState, {
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
            setMonsterSkill,
            setMonsterHealth,
            setMonsterCreature,
            setGraveyard,
            setShowUseLuck,
            setLuckUsed,
            setIsFighting,
            setFightResult,
            setFightOutcome,
            setHeroDiceRolls,
            setMonsterDiceRolls,
            setRollingButton,
            setRollDieResult,
            setRollDiceResults,
            setTestLuckResult,
            setIsTestingLuck,
            setTestSkillResult,
            setDiceRollingType,
            setTrailSequence,
          });

          setNotification({ message: t('game.loaded'), type: 'success' });
        } catch (error) {
          console.error('Error loading game file:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
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
          bookname: book || '',
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
          potionType,
          potionUsed,
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
        trailSequence,
      };
      saveState(stateToSave);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [
    book,
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
    potionType,
    potionUsed,
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
    trailSequence,
  ]);

  return (
    <div className="min-vh-100 bg-beige">
      <Header onLanguageChange={handleLanguageChange} />
      {notification && (
        <NotificationBanner
          message={notification.message}
          type={notification.type}
          onDismiss={() => setNotification(null)}
        />
      )}
      {showResetConfirm && (
        <ConfirmationDialog
          message={t('confirm.reset')}
          onConfirm={confirmReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
      <main className="container mx-auto py-4">
        <div className="row gx-4 mb-4">
          <div className="col-12">
            <section id="game" className="section-container mb-4">
              <div
                className="section-header"
                onClick={toggleGameCollapse}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleGameCollapse();
                  }
                }}
              >
                <h2 className="heading section-title d-flex align-items-center gap-2">
                  <Icon path={mdiBook} size={1} />
                  {book.trim().length > 0 ? book : t('sections.game')}
                  <Icon
                    path={isGameExpanded ? mdiChevronDown : mdiChevronUp}
                    size={1}
                    style={{ marginLeft: 'auto' }}
                  />
                </h2>
              </div>
              <div
                className={`collapse ${isGameExpanded ? 'show' : ''}`}
                id="game-collapse"
              >
                <div className="section-content" style={{ minHeight: 'auto' }}>
                  <div className="d-flex justify-content-center mb-3">
                    <div
                      className="field-group"
                      style={{ maxWidth: '500px', width: '100%' }}
                    >
                      <label className="content field-label">
                        {t('fields.book')}
                      </label>
                      <input
                        type="text"
                        id="book-input"
                        className="content field-input form-control"
                        placeholder={t('fields.name')}
                        value={book}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setBook(newValue);
                          // Check if user typed a word (letters followed by space)
                          const wordPattern = /[a-zA-Z]+\s/;
                          if (
                            wordPattern.test(newValue) &&
                            !shouldExpandSections
                          ) {
                            setShouldExpandSections(true);
                          }
                        }}
                        maxLength={50}
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-center gap-3 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSaveGame}
                      disabled={!book.trim()}
                    >
                      {t('buttons.saveGame')}
                    </button>
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={handleLoadGame}
                    >
                      {t('buttons.loadGame')}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleReset}
                    >
                      {t('buttons.reset')}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
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
              initialExpanded={false}
              autoExpand={shouldExpandSections}
            />
          </div>
          <div className="col-12 col-md-4">
            <ConsumablesSection
              coins={coins}
              meals={meals}
              health={health}
              maxHealth={maxHealth}
              skill={skill}
              maxSkill={maxSkill}
              luck={luck}
              maxLuck={maxLuck}
              transactionObject={transactionObject}
              transactionCost={transactionCost}
              fieldBadges={fieldBadges}
              isLocked={isLocked}
              potionType={potionType}
              potionUsed={potionUsed}
              onCoinsChange={setCoins}
              onMealsChange={setMeals}
              onTransactionObjectChange={setTransactionObject}
              onTransactionCostChange={setTransactionCost}
              onConsumeMeal={handleConsumeMeal}
              onPurchase={handlePurchase}
              onPotionTypeChange={setPotionType}
              onConsumePotion={handleConsumePotion}
              onNumberChange={handleNumberChange}
              initialExpanded={false}
              autoExpand={shouldExpandSections}
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
              initialExpanded={false}
              autoExpand={shouldExpandSections}
            />
          </div>
        </div>
        <div className="row gx-4 mb-4">
          <div className="col-12 col-md-4">
            <InventorySection
              inventory={inventory}
              onInventoryChange={setInventory}
              fieldBadges={fieldBadges}
              initialExpanded={false}
              autoExpand={shouldExpandSections}
            />
          </div>
          <div className="col-12 col-md-8">
            <MapSection
              trailSequence={trailSequence}
              trailInput={trailInput}
              onTrailInputChange={setTrailInput}
              onTrailSubmit={handleTrailSubmit}
              onTrailPillColorChange={handleTrailPillColorChange}
              initialExpanded={false}
              autoExpand={shouldExpandSections}
            />
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
              initialExpanded={false}
            />
          </div>
        </div>
        <div className="row gx-4 mb-4">
          <div className="col-12">
            <NotesSection
              notes={notes}
              onNotesChange={setNotes}
              initialExpanded={false}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
