import React, { useState, useEffect, useRef } from 'react';
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
