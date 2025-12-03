import React, { useState, useEffect, useRef } from 'react';
import Icon from '@mdi/react';
import {
  mdiChevronDown,
  mdiChevronUp,
  mdiBook,
  mdiPlay,
  mdiPause,
  mdiStop,
  mdiTrashCan,
  mdiCheck,
  mdiVolumeHigh,
} from '@mdi/js';
import { t, getCurrentLanguage, setLanguage } from './translations';
import { isValidYouTubeUrl, extractVideoId } from './utils/youtube';
import {
  loadState,
  saveState,
  buildStateObject,
  applyLoadedState,
  createDebouncedSave,
} from './utils/stateManager';
import './styles/variables.css';
import './styles/animations.css';
import './styles/components.css';
import './styles/youDied.css';
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
  const [isFightStarted, setIsFightStarted] = useState(false);

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
  const [sectionResetKey, setSectionResetKey] = useState(0);

  // Game section collapse state
  const [isGameExpanded, setIsGameExpanded] = useState(true);

  const toggleGameCollapse = () => {
    setIsGameExpanded(!isGameExpanded);
  };

  // Sound state
  const [soundUrls, setSoundUrls] = useState({
    ambience: '',
    battle: 'https://www.youtube.com/watch?v=s5NxP6tjm5o',
    victory: 'https://www.youtube.com/watch?v=rgUksX6eM0Y',
    defeat: 'https://www.youtube.com/watch?v=-ZGlaAxB7nI',
  });
  const [soundInputs, setSoundInputs] = useState({
    ambience: '',
    battle: '',
    victory: '',
    defeat: '',
  });
  const [soundErrors, setSoundErrors] = useState({
    ambience: null,
    battle: null,
    victory: null,
    defeat: null,
  });
  const [soundPlaying, setSoundPlaying] = useState({
    ambience: false,
    battle: false,
    victory: false,
    defeat: false,
  });
  const [soundVolumes, setSoundVolumes] = useState({
    ambience: 100,
    battle: 100,
    victory: 100,
    defeat: 100,
  });
  const [actionSoundsEnabled, setActionSoundsEnabled] = useState(true);
  const youtubePlayersRef = useRef({});
  const soundStoppedManuallyRef = useRef({
    ambience: false,
    battle: false,
    victory: false,
    defeat: false,
  });
  const actionSoundsCheckboxRef = useRef(null);
  const [showYouDied, setShowYouDied] = useState(false);

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
        setSoundUrls,
        setSoundVolumes,
        setActionSoundsEnabled,
      });
    }

    // Mark initial mount as complete after a small delay
    setTimeout(() => {
      isInitialMountRef.current = false;
    }, 100);
  }, []);

  // Debug: Log current Bootstrap breakpoint
  useEffect(() => {
    const getBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1400) return 'xxl (≥1400px)';
      if (width >= 1200) return 'xl (≥1200px)';
      if (width >= 992) return 'lg (≥992px)';
      if (width >= 768) return 'md (≥768px)';
      if (width >= 576) return 'sm (≥576px)';
      return 'xs (<576px)';
    };

    const logBreakpoint = () => {
      const breakpoint = getBreakpoint();
      const width = window.innerWidth;
      console.log(
        `[Bootstrap Breakpoint] Current: ${breakpoint} | Width: ${width}px`
      );
    };

    // Log on mount
    logBreakpoint();

    // Log on resize
    const handleResize = () => {
      logBreakpoint();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
      soundUrls,
      soundVolumes,
      actionSoundsEnabled,
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
    soundUrls,
    soundVolumes,
    actionSoundsEnabled,
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
    // Auto-play defeat sound and show "You Died" animation when died button is clicked
    if (color === 'dark') {
      autoPlaySound('defeat');
      setShowYouDied(true);
      setTimeout(() => {
        setShowYouDied(false);
      }, 9000);
    }
  };

  // Sound handlers
  const handleSoundInputChange = (soundType, value) => {
    setSoundInputs((prev) => ({
      ...prev,
      [soundType]: value,
    }));
    // Clear error when user types
    if (soundErrors[soundType]) {
      setSoundErrors((prev) => ({
        ...prev,
        [soundType]: null,
      }));
    }
  };

  const handleSoundSubmit = (soundType) => {
    const url = soundInputs[soundType].trim();
    if (!url) {
      return;
    }

    if (isValidYouTubeUrl(url)) {
      setSoundUrls((prev) => ({
        ...prev,
        [soundType]: url,
      }));
      setSoundInputs((prev) => ({
        ...prev,
        [soundType]: '',
      }));
      setSoundErrors((prev) => ({
        ...prev,
        [soundType]: null,
      }));
    } else {
      setSoundErrors((prev) => ({
        ...prev,
        [soundType]: t('game.invalidUrl'),
      }));
    }
  };

  const handleSoundDelete = (soundType) => {
    setSoundUrls((prev) => ({
      ...prev,
      [soundType]: '',
    }));
    setSoundInputs((prev) => ({
      ...prev,
      [soundType]: '',
    }));
    setSoundErrors((prev) => ({
      ...prev,
      [soundType]: null,
    }));
    setSoundPlaying((prev) => ({
      ...prev,
      [soundType]: false,
    }));
    // Stop and remove player
    if (youtubePlayersRef.current[soundType]) {
      try {
        youtubePlayersRef.current[soundType].stopVideo();
      } catch (e) {
        // Ignore errors
      }
      delete youtubePlayersRef.current[soundType];
    }
  };

  const handleSoundPlayPause = (soundType) => {
    const player = youtubePlayersRef.current[soundType];
    if (!player) return;

    try {
      if (soundPlaying[soundType]) {
        player.pauseVideo();
        setSoundPlaying((prev) => ({
          ...prev,
          [soundType]: false,
        }));
      } else {
        // Pause all other sounds
        const soundTypes = ['ambience', 'battle', 'victory', 'defeat'];
        soundTypes.forEach((st) => {
          if (st !== soundType && soundPlaying[st]) {
            const otherPlayer = youtubePlayersRef.current[st];
            if (otherPlayer) {
              try {
                otherPlayer.pauseVideo();
                setSoundPlaying((prev) => ({
                  ...prev,
                  [st]: false,
                }));
              } catch (e) {
                // Ignore errors
              }
            }
          }
        });
        // Play the selected sound
        player.playVideo();
        setSoundPlaying((prev) => ({
          ...prev,
          [soundType]: true,
        }));
      }
    } catch (e) {
      console.error('Error controlling YouTube player:', e);
    }
  };

  const handleSoundStop = (soundType) => {
    const player = youtubePlayersRef.current[soundType];
    if (!player) return;

    // Only stop if it's currently playing
    if (!soundPlaying[soundType]) return;

    try {
      // Mark as manually stopped to prevent auto-restart
      soundStoppedManuallyRef.current[soundType] = true;
      // Pause first, then seek to beginning
      player.pauseVideo();
      player.seekTo(0, true); // true = allowSeekAhead
      setSoundPlaying((prev) => ({
        ...prev,
        [soundType]: false,
      }));
    } catch (e) {
      console.error('Error stopping YouTube player:', e);
    }
  };

  const handleSoundVolumeChange = (soundType, volume) => {
    setSoundVolumes((prev) => ({
      ...prev,
      [soundType]: volume,
    }));
    const player = youtubePlayersRef.current[soundType];
    if (player) {
      try {
        player.setVolume(volume);
      } catch (e) {
        console.error('Error setting volume:', e);
      }
    }
  };

  // Auto-play sound from the beginning (stop then play)
  const autoPlaySound = (soundType) => {
    const player = youtubePlayersRef.current[soundType];
    if (!player || !soundUrls[soundType]) return;

    try {
      // Clear manual stop flag
      soundStoppedManuallyRef.current[soundType] = false;
      // Pause all other sounds - check all players, not just those marked as playing
      const soundTypes = ['ambience', 'battle', 'victory', 'defeat'];
      soundTypes.forEach((st) => {
        if (st !== soundType) {
          const otherPlayer = youtubePlayersRef.current[st];
          if (otherPlayer) {
            try {
              // Check if video is actually playing and pause it
              const playerState = otherPlayer.getPlayerState();
              if (playerState === 1) {
                // 1 = playing
                otherPlayer.pauseVideo();
              }
              setSoundPlaying((prev) => ({
                ...prev,
                [st]: false,
              }));
            } catch (e) {
              // Ignore errors
            }
          }
        }
      });
      // Reset to beginning and play
      player.pauseVideo();
      player.seekTo(0, true);
      player.playVideo();
      setSoundPlaying((prev) => ({
        ...prev,
        [soundType]: true,
      }));
    } catch (e) {
      console.error('Error auto-playing sound:', e);
    }
  };

  // Initialize YouTube player when URL is set
  useEffect(() => {
    const soundTypes = ['ambience', 'battle', 'victory', 'defeat'];

    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = (soundType) => {
      if (!soundUrls[soundType] || youtubePlayersRef.current[soundType]) {
        return;
      }

      if (window.YT && window.YT.Player) {
        const videoId = extractVideoId(soundUrls[soundType]);
        if (videoId) {
          const playerId = `youtube-player-${soundType}`;
          // Create hidden iframe container
          let container = document.getElementById(playerId);
          if (!container) {
            container = document.createElement('div');
            container.id = playerId;
            container.style.display = 'none';
            document.body.appendChild(container);
          }

          youtubePlayersRef.current[soundType] = new window.YT.Player(
            playerId,
            {
              videoId: videoId,
              playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                enablejsapi: 1,
                fs: 0,
                iv_load_policy: 3,
                modestbranding: 1,
                playsinline: 1,
                rel: 0,
                ...(soundType === 'ambience' || soundType === 'battle'
                  ? { loop: 1, playlist: videoId } // Loop only for ambience and battle
                  : {}),
              },
              events: {
                onStateChange: (event) => {
                  // 0 = ended, 1 = playing, 2 = paused
                  const shouldLoop =
                    soundType === 'ambience' || soundType === 'battle';

                  // Don't auto-restart if user manually stopped
                  if (soundStoppedManuallyRef.current[soundType]) {
                    if (event.data === 0 || event.data === 2) {
                      // Video ended or paused after manual stop - keep it stopped
                      setSoundPlaying((prev) => ({
                        ...prev,
                        [soundType]: false,
                      }));
                    }
                    return;
                  }

                  if (event.data === 0) {
                    // Video ended
                    if (shouldLoop) {
                      // Restart if it should loop (ambience/battle)
                      try {
                        const player = youtubePlayersRef.current[soundType];
                        if (player) {
                          player.seekTo(0);
                          player.playVideo();
                        }
                      } catch (e) {
                        setSoundPlaying((prev) => ({
                          ...prev,
                          [soundType]: false,
                        }));
                      }
                    } else {
                      // Stop for victory and defeat - ensure they don't loop
                      try {
                        const player = youtubePlayersRef.current[soundType];
                        if (player) {
                          player.stopVideo();
                        }
                      } catch (e) {
                        // Ignore errors
                      }
                      setSoundPlaying((prev) => ({
                        ...prev,
                        [soundType]: false,
                      }));
                    }
                  } else if (event.data === 2) {
                    // Paused
                    setSoundPlaying((prev) => ({
                      ...prev,
                      [soundType]: false,
                    }));
                  } else if (event.data === 1) {
                    // Playing
                    setSoundPlaying((prev) => ({
                      ...prev,
                      [soundType]: true,
                    }));
                  }
                },
              },
            }
          );

          // Set initial volume
          setTimeout(() => {
            if (youtubePlayersRef.current[soundType]) {
              youtubePlayersRef.current[soundType].setVolume(
                soundVolumes[soundType]
              );
            }
          }, 500);
        }
      } else {
        setTimeout(() => initPlayer(soundType), 100);
      }
    };

    // Initialize all players
    soundTypes.forEach((soundType) => {
      if (soundUrls[soundType] && !youtubePlayersRef.current[soundType]) {
        if (window.YT && window.YT.Player) {
          initPlayer(soundType);
        } else {
          // Store original callback if it exists
          const originalCallback = window.onYouTubeIframeAPIReady;
          window.onYouTubeIframeAPIReady = () => {
            if (originalCallback) originalCallback();
            soundTypes.forEach((st) => initPlayer(st));
          };
        }
      }
    });
  }, [soundUrls, soundVolumes]);

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
      if (actionSoundsEnabled) {
        const audio = new Audio(
          `${import.meta.env.BASE_URL}audio/minecraft-eat.mp3`
        );
        audio.play().catch((error) => {
          console.warn('Could not play audio:', error);
        });
      }

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

    if (actionSoundsEnabled) {
      const audio = new Audio(
        `${import.meta.env.BASE_URL}audio/minecraft-drink.mp3`
      );
      audio.play().catch((error) => {
        console.warn('Could not play audio:', error);
      });
    }

    if (potionType === 'skill' && maxSkill !== null) {
      const currentSkill = parseInt(skill) || 0;
      const difference = maxSkill - currentSkill;
      setSkill(String(maxSkill));
      if (difference > 0) {
        showFieldBadge('skill', `+${difference}`, 'success');
      }
    } else if (potionType === 'health' && maxHealth !== null) {
      const currentHealth = parseInt(health) || 0;
      const difference = maxHealth - currentHealth;
      setHealth(String(maxHealth));
      if (difference > 0) {
        showFieldBadge('health', `+${difference}`, 'success');
      }
    } else if (potionType === 'luck' && maxLuck !== null) {
      const currentLuck = parseInt(luck) || 0;
      const difference = maxLuck - currentLuck;
      setLuck(String(maxLuck));
      if (difference > 0) {
        showFieldBadge('luck', `+${difference}`, 'success');
      }
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
    setIsFightStarted(false);
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
    setActionSoundsEnabled(true);
    setSoundUrls({
      ambience: '',
      battle: 'https://www.youtube.com/watch?v=s5NxP6tjm5o',
      victory: 'https://www.youtube.com/watch?v=rgUksX6eM0Y',
      defeat: 'https://www.youtube.com/watch?v=-ZGlaAxB7nI',
    });
    setSoundInputs({
      ambience: '',
      battle: '',
      victory: '',
      defeat: '',
    });
    setSoundErrors({
      ambience: null,
      battle: null,
      victory: null,
      defeat: null,
    });
    setSoundPlaying({
      ambience: false,
      battle: false,
      victory: false,
      defeat: false,
    });
    setSoundVolumes({
      ambience: 100,
      battle: 100,
      victory: 100,
      defeat: 100,
    });
    // Reset manual stop flags
    soundStoppedManuallyRef.current = {
      ambience: false,
      battle: false,
      victory: false,
      defeat: false,
    };
    // Stop and remove all YouTube players
    Object.keys(youtubePlayersRef.current).forEach((soundType) => {
      try {
        youtubePlayersRef.current[soundType].stopVideo();
      } catch (e) {
        // Ignore errors
      }
    });
    youtubePlayersRef.current = {};
    setShouldExpandSections(false);
    // Force all sections to remount with collapsed state
    setSectionResetKey((prev) => prev + 1);
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
      soundUrls,
      soundVolumes,
      actionSoundsEnabled,
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
            setSoundUrls,
            setSoundVolumes,
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
    if (actionSoundsEnabled) {
      const audio = new Audio(`${import.meta.env.BASE_URL}audio/purchase.mp3`);
      audio.play().catch((error) => {
        console.warn('Could not play audio:', error);
      });
    }

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
      showFieldBadge('inventory', t('consumables.added'), 'success');

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
        if (actionSoundsEnabled) {
          const audio = new Audio(
            `${import.meta.env.BASE_URL}audio/rayman-lucky.mp3`
          );
          audio.play().catch((error) => {
            console.warn('Could not play audio:', error);
          });
        }
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
      // Auto-play victory sound
      autoPlaySound('victory');
      const currentGraveyard = graveyard.trim();
      const separator = currentGraveyard ? '\n' : '';
      setGraveyard(
        `${currentGraveyard}${separator}${t('fight.defeatCreature')} ${creatureName}`
      );
      setIsFighting(false);
      setIsFightStarted(false);
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
      // Ensure there's a trail entry, then trigger died button (which will play defeat sound)
      setTrailSequence((prev) => {
        if (prev.length === 0) {
          // If no trail entries, add one with the current input or default to 1
          const num = parseInt(trailInput) || 1;
          return [{ number: num, color: 'dark' }];
        }
        return prev;
      });
      // Trigger died button in trail (which will play defeat sound)
      handleTrailPillColorChange('dark');
      const currentGraveyard = graveyard.trim();
      const separator = currentGraveyard ? '\n' : '';
      setGraveyard(
        `${currentGraveyard}${separator}${t('fight.defeatedBy')} ${creatureName}`
      );
      setIsFighting(false);
      setIsFightStarted(false);
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

    // Auto-play battle sound only on first fight click - do this immediately
    if (!isFightStarted) {
      setIsFightStarted(true);
      // Call autoPlaySound immediately, before any other state changes
      autoPlaySound('battle');
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
        if (actionSoundsEnabled) {
          const audio = new Audio(
            `${import.meta.env.BASE_URL}audio/rayman-lucky.mp3`
          );
          audio.play().catch((error) => {
            console.warn('Could not play audio:', error);
          });
        }
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
      {showYouDied && (
        <div className="you-died-overlay">
          <div className="you-died-text">{t('fight.youDied')}</div>
          </div>
      )}
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
          message={t('game.resetConfirm')}
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
                  <div className="row gx-4">
                    <div className="col-12 col-xl-6">
                      <h3 className="heading mb-3">{t('game.book')}</h3>
                      <div className="field-group mb-3">
                <label className="content field-label">
                          {t('game.name')}
                </label>
                <input
                  type="text"
                          id="book-input"
                          className="content field-input form-control"
                          placeholder=""
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
                      <div className="d-flex justify-content-center gap-3 flex-wrap">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleSaveGame}
                          disabled={!book.trim()}
                        >
                          {t('game.saveGame')}
                        </button>
                        <button
                          type="button"
                          className="btn btn-light"
                          onClick={handleLoadGame}
                        >
                          {t('game.loadGame')}
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={handleReset}
                        >
                          {t('game.reset')}
                        </button>
                </div>
                    </div>
                    <div className="col-12 col-xl-6">
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <h3 className="heading mb-0">{t('game.sound')}</h3>
                <input
                          ref={actionSoundsCheckboxRef}
                          type="checkbox"
                          id="actionSoundsCheckbox"
                          checked={actionSoundsEnabled}
                          onChange={(e) =>
                            setActionSoundsEnabled(e.target.checked)
                          }
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          data-bs-title={t('game.actionSoundsTooltip')}
                          style={{ cursor: 'pointer' }}
                />
              </div>
                      <div className="row g-3">
                        {['ambience', 'battle', 'victory', 'defeat'].map(
                          (soundType) => (
                            <div key={soundType} className="col-6">
                              <label className="content field-label mb-2">
                                {t(`game.${soundType}`)}
                </label>
                              {!soundUrls[soundType] ? (
                                <div>
                                  <div
                                    className="input-group"
                                    style={{ flex: 1 }}
                                  >
                <input
                                      type="text"
                                      className={`content field-input form-control ${
                                        soundErrors[soundType]
                                          ? 'is-invalid'
                                          : ''
                                      }`}
                                      placeholder={t('game.youtubeUrl')}
                                      value={soundInputs[soundType]}
                  onChange={(e) =>
                                        handleSoundInputChange(
                                          soundType,
                                          e.target.value
                                        )
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleSoundSubmit(soundType);
                                        }
                                      }}
                                    />
                                    <button
                                      type="button"
                                      className="btn btn-primary"
                                      onClick={() =>
                                        handleSoundSubmit(soundType)
                                      }
                                      style={{
                                        minWidth: 'auto',
                                        width: 'auto',
                                        padding: '0.5rem',
                                      }}
                                    >
                                      <Icon path={mdiCheck} size={1} />
                                    </button>
              </div>
                                  {soundErrors[soundType] && (
                                    <div className="invalid-feedback d-block sound-error">
                                      {soundErrors[soundType]}
                </div>
                                  )}
                                </div>
                              ) : (
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                  <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => handleSoundDelete(soundType)}
                                    style={{
                                      minWidth: 'auto',
                                      width: 'auto',
                                      padding: '0.5rem',
                                    }}
                                    title={t('game.delete')}
                                  >
                                    <Icon path={mdiTrashCan} size={1} />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() =>
                                      handleSoundPlayPause(soundType)
                                    }
                                    style={{
                                      minWidth: 'auto',
                                      width: 'auto',
                                      padding: '0.5rem',
                                    }}
                                    title={
                                      soundPlaying[soundType]
                                        ? t('game.pause')
                                        : t('game.play')
                                    }
                                  >
                                    <Icon
                                      path={
                                        soundPlaying[soundType]
                                          ? mdiPause
                                          : mdiPlay
                                      }
                                      size={1}
                                    />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => handleSoundStop(soundType)}
                                    style={{
                                      minWidth: 'auto',
                                      width: 'auto',
                                      padding: '0.5rem',
                                    }}
                                    title={t('game.stop')}
                                  >
                                    <Icon path={mdiStop} size={1} />
                                  </button>
                                  <div className="d-flex align-items-center gap-1">
                                    <Icon path={mdiVolumeHigh} size={0.8} />
                <input
                                      type="range"
                                      className="form-range"
                  min="0"
                                      max="100"
                                      value={soundVolumes[soundType]}
                                      onChange={(e) =>
                                        handleSoundVolumeChange(
                                          soundType,
                                          parseInt(e.target.value)
                                        )
                                      }
                                      style={{
                                        width: '50px',
                                        height: '4px',
                                      }}
                />
              </div>
            </div>
                              )}
            </div>
                          )
                        )}
                </div>
              </div>
                </div>
              </div>
            </div>
          </section>
            </div>
            </div>
        <div className="row gx-4 mb-4">
          <div className="col-12 col-xl-4">
            <CharacterSection
              key={`character-${sectionResetKey}`}
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
          <div className="col-12 col-xl-4">
            <ConsumablesSection
              key={`consumables-${sectionResetKey}`}
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
          <div className="col-12 col-xl-4">
            <DiceRollsSection
              key={`dice-${sectionResetKey}`}
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
          <div className="col-12 col-xl-4">
            <InventorySection
              key={`inventory-${sectionResetKey}`}
              inventory={inventory}
              onInventoryChange={setInventory}
              fieldBadges={fieldBadges}
              initialExpanded={false}
              autoExpand={shouldExpandSections}
            />
        </div>
          <div className="col-12 col-xl-8">
            <MapSection
              key={`map-${sectionResetKey}`}
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
              key={`fight-${sectionResetKey}`}
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
              isFightStarted={isFightStarted}
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
              key={`notes-${sectionResetKey}`}
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
