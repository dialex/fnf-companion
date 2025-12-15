import React, { useState, useEffect, useRef } from 'react';
import { i18nManager } from './managers/i18nManager';
import { isValidYouTubeUrl, extractVideoId } from './utils/youtube';
import {
  loadState,
  saveState,
  buildStateObject,
  applyLoadedState,
  createDebouncedSave,
  getDefaultState,
} from './utils/stateManager';
import { getCurrentTheme, setTheme } from './utils/theme';
import { convertColorToNote } from './utils/trailMapping';
import { createActionSoundsManager } from './utils/actionSoundsManager';
import { createDiceRoller } from './managers/diceRoller';
import { createSoundManager } from './managers/soundManager';
import { createGameShowManager } from './managers/gameShowManager';
import confetti from 'canvas-confetti';
import yaml from 'js-yaml';
import './styles/variables.css';
import './styles/animations.css';
import './styles/components.css';
import './styles/youDied.css';
import './App.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import CharacterSection from './components/CharacterSection';
import ConsumablesSection from './components/ConsumablesSection';
import DiceRollsSection from './components/DiceRollsSection';
import InventorySection from './components/InventorySection';
import MapSection from './components/MapSection';
import FightSection from './components/FightSection';
import NotesSection from './components/NotesSection';
import GameSection from './components/GameSection';
import NotificationBanner from './components/NotificationBanner';
import ConfirmationDialog from './components/ConfirmationDialog';

function AppContent({ onLanguageChange }) {
  const t = i18nManager.t.bind(i18nManager);

  // Theme state to trigger re-renders when theme changes
  const [, setCurrentTheme] = useState(getCurrentTheme());

  // Sync theme state on mount (theme is already initialized in main.jsx)
  useEffect(() => {
    setCurrentTheme(getCurrentTheme());
  }, []);

  // Handler to update language and trigger re-render
  const handleLanguageChange = (lang) => {
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  // Handler to update theme and trigger re-render
  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
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
    { number: 1, annotation: null },
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

  // Dice rolling state (kept for FightSection compatibility)
  const [rollingButton, setRollingButton] = useState(null);
  const [testLuckResult, setTestLuckResult] = useState(null);
  const [isTestingLuck, setIsTestingLuck] = useState(false);
  const [diceRollingType, setDiceRollingType] = useState(null);

  // DiceRoller instance for fight logic
  const diceRollerRef = useRef(createDiceRoller());

  // Refs for fight animation management
  const fightAnimationIdRef = useRef(null);
  const fightTimeoutRef = useRef(null);
  const safetyTimeoutRef = useRef(null);

  // Field badges
  const [fieldBadges, setFieldBadges] = useState({});

  // Action sounds manager
  const actionSoundsPlayer = useRef(createActionSoundsManager());

  // SoundManager and GameShowManager (use singleton i18nManager)
  const soundManagerRef = useRef(createSoundManager());
  const gameShowManagerRef = useRef(
    createGameShowManager(soundManagerRef.current)
  );

  // Notification banner
  const [notification, setNotification] = useState(null);

  // Confirmation dialog
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Section reset key for remounting sections
  const [sectionResetKey, setSectionResetKey] = useState(0);

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
  // Custom sounds: array of { id, label, url }
  const [customSounds, setCustomSounds] = useState([]);
  const [customSoundInputs, setCustomSoundInputs] = useState({}); // { id: { label: '', url: '' } }
  const [customSoundErrors, setCustomSoundErrors] = useState({}); // { id: error }
  const [customSoundPlaying, setCustomSoundPlaying] = useState({}); // { id: boolean }
  const defaultState = getDefaultState();
  const [soundVolumes, setSoundVolumes] = useState({
    ambience: defaultState.sounds.ambienceVolume,
    battle: defaultState.sounds.battleVolume,
    victory: defaultState.sounds.victoryVolume,
    defeat: defaultState.sounds.defeatVolume,
  });
  const [customSoundVolumes, setCustomSoundVolumes] = useState({}); // { id: volume }
  const [actionSoundsEnabled, setActionSoundsEnabled] = useState(true);
  const [allSoundsMuted, setAllSoundsMuted] = useState(false);
  const [sectionsExpanded, setSectionsExpanded] = useState({
    game: true,
    character: true,
    consumables: true,
    diceRolls: true,
    inventory: true,
    map: true,
    fight: false,
    notes: false,
  });
  const youtubePlayersRef = useRef({});
  const soundStoppedManuallyRef = useRef({
    ambience: false,
    battle: false,
    victory: false,
    defeat: false,
  });
  const [showYouDied, setShowYouDied] = useState(false);

  // State management
  const isInitialMountRef = useRef(true);
  const preBattleSoundRef = useRef(null); // Track what sound was playing before battle
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
        setTestLuckResult,
        setIsTestingLuck,
        setDiceRollingType,
        setTrailSequence,
        setSoundUrls,
        setSoundVolumes,
        setActionSoundsEnabled,
        setAllSoundsMuted,
        setTheme,
        getCurrentTheme,
        setBook,
        setSectionsExpanded,
        setCustomSounds,
        setCustomSoundVolumes,
      });
    }

    // Mark initial mount as complete after a small delay
    setTimeout(() => {
      isInitialMountRef.current = false;
    }, 100);
  }, []);

  // Auto-sync action sounds with master sound state (only after initial mount)
  useEffect(() => {
    // Skip auto-sync on initial mount to preserve loaded state
    if (isInitialMountRef.current) return;

    if (allSoundsMuted) {
      setActionSoundsEnabled(false);
    } else {
      setActionSoundsEnabled(true);
    }
  }, [allSoundsMuted]);

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
      testLuckResult,
      isTestingLuck,
      diceRollingType,
      trailSequence,
      soundUrls,
      soundVolumes,
      actionSoundsEnabled,
      allSoundsMuted,
      theme: getCurrentTheme(),
      sectionsExpanded,
      customSounds,
      customSoundVolumes,
    });

    debouncedSaveRef.current(stateToSave);
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
    testLuckResult,
    isTestingLuck,
    diceRollingType,
    trailSequence,
    soundUrls,
    soundVolumes,
    actionSoundsEnabled,
    allSoundsMuted,
    sectionsExpanded,
    customSounds,
    customSoundVolumes,
  ]);

  // Section expanded state handler
  const handleSectionExpandedChange = (sectionName, isExpanded) => {
    setSectionsExpanded((prev) => ({
      ...prev,
      [sectionName]: isExpanded,
    }));
  };

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
    }, BADGE_ANIMATION_DURATION_MS);
  };

  const celebrate = () => {
    // Create a confetti cannon effect with custom colors
    const colors = ['#FF0000', '#FFD700', '#FFFFFF'];
    const duration = 1000 * 15; // seconds
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 200,
      zIndex: 0,
      colors: colors,
    };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Launch confetti from multiple positions
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  // Trail handlers
  const handleTrailSubmit = () => {
    const num = parseInt(trailInput);
    if (isNaN(num) || num < 1 || num > 400) {
      return;
    }

    // Add number to sequence with default annotation
    setTrailSequence((prev) => [...prev, { number: num, annotation: null }]);
    // Clear input
    setTrailInput('');

    // Celebrate if the game was won
    if (num === 400) {
      celebrate();
    }
  };

  const handleTrailPillDelete = () => {
    setTrailSequence((prev) => {
      // Don't delete if there's only one item (the initial 1)
      if (prev.length <= 1) return prev;
      // Remove the last item
      return prev.slice(0, -1);
    });
  };

  const handleTrailPillColorChange = (color) => {
    const annotation = convertColorToNote(color);
    setTrailSequence((prev) => {
      if (prev.length === 0) return prev;
      const newSequence = [...prev];
      const lastIndex = newSequence.length - 1;
      newSequence[lastIndex] = {
        ...newSequence[lastIndex],
        annotation: annotation,
      };
      return newSequence;
    });
    // Auto-play defeat sound and show "You Died" animation when died button is clicked
    if (annotation === 'died') {
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
      // Destroy old player if URL is changing
      const oldPlayer = youtubePlayersRef.current[soundType];
      if (oldPlayer) {
        try {
          oldPlayer.stopVideo();
          oldPlayer.destroy();
        } catch (e) {
          // Ignore errors
        }
        delete youtubePlayersRef.current[soundType];
      }

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
    // Stop and destroy the player
    const player = youtubePlayersRef.current[soundType];
    if (player) {
      try {
        player.stopVideo();
        player.destroy();
      } catch (e) {
        // Ignore errors
      }
      delete youtubePlayersRef.current[soundType];
    }

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
    // Don't play if all sounds are muted
    if (allSoundsMuted) return;

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
        // Pause all other regular sounds
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
        // Pause all custom sounds
        Object.keys(customSoundPlaying).forEach((customId) => {
          if (customSoundPlaying[customId]) {
            const customPlayer =
              youtubePlayersRef.current[`custom-${customId}`];
            if (customPlayer) {
              try {
                customPlayer.pauseVideo();
                setCustomSoundPlaying((prev) => ({
                  ...prev,
                  [customId]: false,
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
    if (player && typeof player.setVolume === 'function') {
      try {
        player.setVolume(volume);
      } catch (e) {
        console.error('Error setting volume:', e);
      }
    }
  };

  // Custom sound handlers
  const handleCustomSoundInputChange = (id, field, value) => {
    setCustomSoundInputs((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value,
      },
    }));
    // Clear error when user types
    if (customSoundErrors[id]) {
      setCustomSoundErrors((prev) => ({
        ...prev,
        [id]: null,
      }));
    }
  };

  const handleCustomSoundSubmit = (id) => {
    const input = customSoundInputs[id];
    if (!input) return;

    const label = input.label?.trim() || '';
    const url = input.url?.trim() || '';

    if (!label) {
      setCustomSoundErrors((prev) => ({
        ...prev,
        [id]: t('game.labelRequired'),
      }));
      return;
    }

    if (!url) {
      setCustomSoundErrors((prev) => ({
        ...prev,
        [id]: t('game.urlRequired'),
      }));
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      setCustomSoundErrors((prev) => ({
        ...prev,
        [id]: t('game.invalidUrl'),
      }));
      return;
    }

    // Add or update custom sound
    setCustomSounds((prev) => {
      const existing = prev.find((s) => s.id === id);
      if (existing) {
        // Update existing
        return prev.map((s) => (s.id === id ? { ...s, label, url } : s));
      } else {
        // Add new
        const newSound = { id, label, url };
        // Initialize volume with default
        setCustomSoundVolumes((prevVolumes) => ({
          ...prevVolumes,
          [id]: defaultState.sounds.ambienceVolume,
        }));
        return [...prev, newSound];
      }
    });

    // Clear inputs and errors
    setCustomSoundInputs((prev) => {
      const newInputs = { ...prev };
      delete newInputs[id];
      return newInputs;
    });
    setCustomSoundErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleCustomSoundDelete = (id) => {
    // Stop and destroy the player
    const player = youtubePlayersRef.current[`custom-${id}`];
    if (player) {
      try {
        player.stopVideo();
        player.destroy();
      } catch (e) {
        // Ignore errors
      }
      delete youtubePlayersRef.current[`custom-${id}`];
    }

    // Remove from custom sounds
    setCustomSounds((prev) => prev.filter((s) => s.id !== id));
    setCustomSoundPlaying((prev) => {
      const newPlaying = { ...prev };
      delete newPlaying[id];
      return newPlaying;
    });
    setCustomSoundVolumes((prev) => {
      const newVolumes = { ...prev };
      delete newVolumes[id];
      return newVolumes;
    });
  };

  const handleCustomSoundPlayPause = (id) => {
    const player = youtubePlayersRef.current[`custom-${id}`];
    if (!player) return;

    try {
      if (customSoundPlaying[id]) {
        player.pauseVideo();
        setCustomSoundPlaying((prev) => ({
          ...prev,
          [id]: false,
        }));
      } else {
        // Stop other sounds if needed
        Object.keys(soundPlaying).forEach((st) => {
          if (soundPlaying[st]) {
            const otherPlayer = youtubePlayersRef.current[st];
            if (otherPlayer) {
              try {
                const playerState = otherPlayer.getPlayerState();
                if (playerState === 1) {
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
        // Stop other custom sounds
        Object.keys(customSoundPlaying).forEach((otherId) => {
          if (otherId !== id && customSoundPlaying[otherId]) {
            const otherPlayer = youtubePlayersRef.current[`custom-${otherId}`];
            if (otherPlayer) {
              try {
                const playerState = otherPlayer.getPlayerState();
                if (playerState === 1) {
                  otherPlayer.pauseVideo();
                }
                setCustomSoundPlaying((prev) => ({
                  ...prev,
                  [otherId]: false,
                }));
              } catch (e) {
                // Ignore errors
              }
            }
          }
        });
        player.playVideo();
        setCustomSoundPlaying((prev) => ({
          ...prev,
          [id]: true,
        }));
      }
    } catch (e) {
      console.error('Error controlling YouTube player:', e);
    }
  };

  const handleCustomSoundStop = (id) => {
    const player = youtubePlayersRef.current[`custom-${id}`];
    if (!player) return;

    if (!customSoundPlaying[id]) return;

    try {
      soundStoppedManuallyRef.current[`custom-${id}`] = true;
      player.pauseVideo();
      player.seekTo(0, true);
      setCustomSoundPlaying((prev) => ({
        ...prev,
        [id]: false,
      }));
    } catch (e) {
      console.error('Error stopping YouTube player:', e);
    }
  };

  const handleCustomSoundVolumeChange = (id, volume) => {
    setCustomSoundVolumes((prev) => ({
      ...prev,
      [id]: volume,
    }));
    const player = youtubePlayersRef.current[`custom-${id}`];
    if (player && typeof player.setVolume === 'function') {
      try {
        player.setVolume(volume);
      } catch (e) {
        console.error('Error setting volume:', e);
      }
    }
  };

  const handleAddCustomSound = () => {
    const newId = `custom-${Date.now()}`;
    setCustomSoundInputs((prev) => ({
      ...prev,
      [newId]: { label: '', url: '' },
    }));
  };

  const handleRemovePendingCustomSound = () => {
    setCustomSoundInputs((prev) => {
      const keys = Object.keys(prev);
      if (keys.length === 0) return prev;
      // Remove the last pending input (most recently added)
      const lastKey = keys[keys.length - 1];
      const newInputs = { ...prev };
      delete newInputs[lastKey];
      return newInputs;
    });
    // Also clear any errors for the removed input
    setCustomSoundErrors((prev) => {
      const keys = Object.keys(prev);
      if (keys.length === 0) return prev;
      const lastKey = keys[keys.length - 1];
      const newErrors = { ...prev };
      delete newErrors[lastKey];
      return newErrors;
    });
  };

  // Auto-play sound from the beginning (stop then play)
  const autoPlaySound = (soundType) => {
    // Don't play if all sounds are muted
    if (allSoundsMuted) return;

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
      // Pause all custom sounds
      Object.keys(customSoundPlaying).forEach((customId) => {
        if (customSoundPlaying[customId]) {
          const customPlayer = youtubePlayersRef.current[`custom-${customId}`];
          if (customPlayer) {
            try {
              const playerState = customPlayer.getPlayerState();
              if (playerState === 1) {
                customPlayer.pauseVideo();
              }
              setCustomSoundPlaying((prev) => ({
                ...prev,
                [customId]: false,
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
      if (!soundUrls[soundType]) {
        return;
      }

      // If player already exists, destroy it first (URL might have changed)
      if (youtubePlayersRef.current[soundType]) {
        const existingPlayer = youtubePlayersRef.current[soundType];
        try {
          existingPlayer.destroy();
        } catch (e) {
          // Ignore errors
        }
        delete youtubePlayersRef.current[soundType];
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
                onReady: (event) => {
                  // Player is ready, set the volume
                  const player = event.target;
                  if (player && typeof player.setVolume === 'function') {
                    try {
                      player.setVolume(soundVolumes[soundType]);
                    } catch (e) {
                      console.error('Error setting initial volume:', e);
                    }
                  }
                },
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

  // Initialize YouTube players for custom sounds
  useEffect(() => {
    if (!window.YT || !window.YT.Player) {
      return;
    }

    customSounds.forEach((customSound) => {
      const playerKey = `custom-${customSound.id}`;
      if (youtubePlayersRef.current[playerKey]) {
        return; // Player already exists
      }

      const videoId = extractVideoId(customSound.url);
      if (!videoId) {
        return;
      }

      const playerId = `youtube-player-${playerKey}`;
      let container = document.getElementById(playerId);
      if (!container) {
        container = document.createElement('div');
        container.id = playerId;
        container.style.display = 'none';
        document.body.appendChild(container);
      }

      youtubePlayersRef.current[playerKey] = new window.YT.Player(playerId, {
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
        },
        events: {
          onReady: (event) => {
            const player = event.target;
            if (player && typeof player.setVolume === 'function') {
              try {
                const volume = customSoundVolumes[customSound.id] ?? 25;
                player.setVolume(volume);
              } catch (e) {
                console.error('Error setting initial volume:', e);
              }
            }
          },
          onStateChange: (event) => {
            if (soundStoppedManuallyRef.current[playerKey]) {
              if (event.data === 0 || event.data === 2) {
                setCustomSoundPlaying((prev) => ({
                  ...prev,
                  [customSound.id]: false,
                }));
              }
              return;
            }

            if (event.data === 0) {
              // Video ended - stop it
              try {
                const player = youtubePlayersRef.current[playerKey];
                if (player) {
                  player.stopVideo();
                }
              } catch (e) {
                // Ignore errors
              }
              setCustomSoundPlaying((prev) => ({
                ...prev,
                [customSound.id]: false,
              }));
            } else if (event.data === 2) {
              // Paused
              setCustomSoundPlaying((prev) => ({
                ...prev,
                [customSound.id]: false,
              }));
            } else if (event.data === 1) {
              // Playing
              setCustomSoundPlaying((prev) => ({
                ...prev,
                [customSound.id]: true,
              }));
            }
          },
        },
      });
    });
  }, [customSounds, customSoundVolumes]);

  // Update volumes on existing YouTube players when soundVolumes changes
  useEffect(() => {
    const soundTypes = ['ambience', 'battle', 'victory', 'defeat'];
    soundTypes.forEach((soundType) => {
      const player = youtubePlayersRef.current[soundType];
      if (player && typeof player.setVolume === 'function') {
        try {
          player.setVolume(soundVolumes[soundType]);
        } catch (e) {
          console.error('Error setting volume on existing player:', e);
        }
      }
    });
  }, [soundVolumes]);

  // Update volumes on existing custom sound players
  useEffect(() => {
    customSounds.forEach((customSound) => {
      const playerKey = `custom-${customSound.id}`;
      const player = youtubePlayersRef.current[playerKey];
      if (player && typeof player.setVolume === 'function') {
        try {
          const volume = customSoundVolumes[customSound.id] ?? 50;
          player.setVolume(volume);
        } catch (e) {
          console.error('Error setting volume on custom sound player:', e);
        }
      }
    });
  }, [customSoundVolumes, customSounds]);

  // Monitor creature name changes to start battle theme
  const prevMonsterCreatureRef = useRef(monsterCreature);
  useEffect(() => {
    const prevCreature = prevMonsterCreatureRef.current;
    const currentCreature = monsterCreature.trim();
    const prevWasEmpty = !prevCreature || prevCreature.length === 0;
    const currentHasContent = currentCreature.length > 0;

    // If creature name goes from empty to having at least one character, start battle theme
    if (prevWasEmpty && currentHasContent && !allSoundsMuted) {
      // Save what sound was playing before battle (ambience or custom sound, not battle)
      if (soundPlaying.ambience) {
        preBattleSoundRef.current = 'ambience';
      } else {
        // Check if any custom sound was playing
        const playingCustomSound = Object.keys(customSoundPlaying).find(
          (id) => customSoundPlaying[id]
        );
        if (playingCustomSound) {
          preBattleSoundRef.current = `custom-${playingCustomSound}`;
        } else {
          preBattleSoundRef.current = null;
        }
      }
      autoPlaySound('battle');
    }

    // If victory theme is playing and creature name changes (user types new name), stop victory and start battle
    if (
      soundPlaying.victory &&
      currentHasContent &&
      prevCreature !== currentCreature &&
      !allSoundsMuted
    ) {
      // Stop victory theme
      const victoryPlayer = youtubePlayersRef.current.victory;
      if (victoryPlayer) {
        try {
          victoryPlayer.pauseVideo();
          setSoundPlaying((prev) => ({
            ...prev,
            victory: false,
          }));
        } catch (e) {
          // Ignore errors
        }
      }
      // Start battle theme from beginning
      autoPlaySound('battle');
    }

    prevMonsterCreatureRef.current = monsterCreature;
  }, [
    monsterCreature,
    allSoundsMuted,
    soundPlaying.victory,
    soundPlaying.ambience,
    customSoundPlaying,
  ]);

  // Monitor trail sequence changes to stop victory and resume ambience
  const prevTrailSequenceRef = useRef(trailSequence);
  useEffect(() => {
    const prevSequence = prevTrailSequenceRef.current;
    const currentSequence = trailSequence;

    // Check if trail sequence actually changed (not just a reference change)
    const sequenceChanged =
      JSON.stringify(prevSequence) !== JSON.stringify(currentSequence);

    // If victory theme is playing and trail sequence changes, stop victory and resume previous sound
    if (sequenceChanged && soundPlaying.victory && !allSoundsMuted) {
      // Stop victory theme
      const victoryPlayer = youtubePlayersRef.current.victory;
      if (victoryPlayer) {
        try {
          victoryPlayer.pauseVideo();
          setSoundPlaying((prev) => ({
            ...prev,
            victory: false,
          }));
        } catch (e) {
          // Ignore errors
        }
      }
      // Resume the sound that was playing before battle (ambience or custom sound)
      const preBattleSound = preBattleSoundRef.current;
      if (preBattleSound === 'ambience' && soundUrls.ambience) {
        autoPlaySound('ambience');
      } else if (preBattleSound && preBattleSound.startsWith('custom-')) {
        // Extract custom sound ID (remove 'custom-' prefix)
        const customId = preBattleSound.replace('custom-', '');
        const customSound = customSounds.find((s) => s.id === customId);
        if (customSound && customSound.url) {
          // Resume custom sound
          const customPlayer = youtubePlayersRef.current[preBattleSound];
          if (customPlayer) {
            try {
              customPlayer.playVideo();
              setCustomSoundPlaying((prev) => ({
                ...prev,
                [customId]: true,
              }));
            } catch (e) {
              // Ignore errors
            }
          }
        }
      }
      // Reset pre-battle sound reference
      preBattleSoundRef.current = null;
    }

    prevTrailSequenceRef.current = trailSequence;
  }, [
    trailSequence,
    soundPlaying.victory,
    allSoundsMuted,
    soundUrls.ambience,
    customSounds,
  ]);

  // Character handlers
  const handleRandomStats = () => {
    const skillRoll = rollDie();
    const newSkill = skillRoll + 6;
    setSkill(
      String(maxSkill !== null ? Math.min(newSkill, maxSkill) : newSkill)
    );

    const healthRolls = rollTwoDice();
    const newHealth = healthRolls.sum + 12;
    setHealth(
      String(maxHealth !== null ? Math.min(newHealth, maxHealth) : newHealth)
    );

    const luckRoll = rollDie();
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
    setTestLuckResult(null);
    setIsTestingLuck(false);
    setDiceRollingType(null);
    setTrailSequence([{ number: 1, annotation: null }]);
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
    const defaultState = getDefaultState();
    setSoundVolumes({
      ambience: defaultState.sounds.ambienceVolume,
      battle: defaultState.sounds.battleVolume,
      victory: defaultState.sounds.victoryVolume,
      defeat: defaultState.sounds.defeatVolume,
    });
    // Reset custom sounds
    customSounds.forEach((customSound) => {
      const player = youtubePlayersRef.current[`custom-${customSound.id}`];
      if (player) {
        try {
          player.stopVideo();
          player.destroy();
        } catch (e) {
          // Ignore errors
        }
        delete youtubePlayersRef.current[`custom-${customSound.id}`];
      }
    });
    setCustomSounds([]);
    setCustomSoundInputs({});
    setCustomSoundErrors({});
    setCustomSoundPlaying({});
    setCustomSoundVolumes({});
    // Reset manual stop flags
    soundStoppedManuallyRef.current = {
      ambience: false,
      battle: false,
      victory: false,
      defeat: false,
    };
    // Clear custom sound stop flags
    customSounds.forEach((customSound) => {
      soundStoppedManuallyRef.current[`custom-${customSound.id}`] = false;
    });
    // Stop and remove all YouTube players
    Object.keys(youtubePlayersRef.current).forEach((soundType) => {
      try {
        youtubePlayersRef.current[soundType].stopVideo();
      } catch (e) {
        // Ignore errors
      }
    });
    youtubePlayersRef.current = {};
    // Force all sections to remount
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
      testLuckResult,
      isTestingLuck,
      diceRollingType,
      trailSequence,
      soundUrls,
      soundVolumes,
      actionSoundsEnabled,
      allSoundsMuted,
      theme: getCurrentTheme(),
      sectionsExpanded,
      customSounds,
      customSoundVolumes,
    });

    // Generate filename: <book>-<charactername>-<YYYYMMDD>-<HHMMSS>.yaml
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
    const filename = `${bookPart}-${namePart}-${datePart}-${timePart}.yaml`;

    const yamlString = yaml.dump(stateToSave, { indent: 2, lineWidth: -1 });
    const blob = new Blob([yamlString], { type: 'text/yaml' });
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
    input.accept = '.yaml';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file extension
      if (!file.name.toLowerCase().endsWith('.yaml')) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const fileContent = event.target.result;
          const loadedState = yaml.load(fileContent);

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
            setTestLuckResult,
            setIsTestingLuck,
            setDiceRollingType,
            setTrailSequence,
            setSoundUrls,
            setSoundVolumes,
            setActionSoundsEnabled,
            setAllSoundsMuted,
            setTheme,
            setSectionsExpanded,
            setCustomSounds,
            setCustomSoundVolumes,
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

  // Handle test luck completion from DiceRollsSection
  const handleTestLuckComplete = (rolls) => {
    const roll1 = rolls.roll1;
    const roll2 = rolls.roll2;
    const sum = rolls.sum;
    const currentLuck = parseInt(luck) || 0;
    const isLucky = sum <= currentLuck;

    // Show luck test result (message + sound via GameShowManager)
    const gameState = {
      allSoundsMuted,
      actionSoundsEnabled,
    };
    gameShowManagerRef.current.showLuckTestResult(isLucky, gameState);

    // Set result (used by FightSection)
    setTestLuckResult({ roll1, roll2, isLucky });

    // Decrement luck
    const newLuck = Math.max(0, currentLuck - 1);
    setLuck(String(newLuck));
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
          return [{ number: num, annotation: 'died' }];
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

    if (!isFightStarted) {
      setIsFightStarted(true);
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
    setTestLuckResult(null);

    fightTimeoutRef.current = setTimeout(() => {
      if (fightAnimationIdRef.current !== animationId) {
        return;
      }

      try {
        // Roll dice for both hero and monster using DiceRoller
        const heroRolls = diceRollerRef.current.rollDiceTwo();
        const heroRoll1 = heroRolls.roll1;
        const heroRoll2 = heroRolls.roll2;
        const heroDiceSum = heroRolls.sum;

        const monsterRolls = diceRollerRef.current.rollDiceTwo();
        const monsterRoll1 = monsterRolls.roll1;
        const monsterRoll2 = monsterRolls.roll2;
        const monsterDiceSum = monsterRolls.sum;

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
          // Play hurt sound when hero takes damage
          if (actionSoundsEnabled) {
            const audio = new Audio(
              `${import.meta.env.BASE_URL}audio/minecraft-hurt.mp3`
            );
            audio.play().catch((error) => {
              console.warn('Could not play audio:', error);
            });
          }
        }
        if (newMonsterHealth !== currentMonsterHealth) {
          setMonsterHealth(String(newMonsterHealth));
          showFieldBadge('monsterHealth', '-2', 'danger');
          // Play hit sound when monster takes damage
          //TODO: use playActionSound
          if (actionSoundsEnabled) {
            const audio = new Audio(
              `${import.meta.env.BASE_URL}audio/minecraft-hit-monster.mp3`
            );
            audio.play().catch((error) => {
              console.warn('Could not play audio:', error);
            });
          }
        }

        // Now check if fight ended with the updated health values
        fightEnded = checkFightEnd(newHealth, newMonsterHealth);

        if (fightEnded) {
          setIsFighting(false);
          setDiceRollingType(null);
          return;
        }

        // Show use luck after every attack with a winner (not on ties, and fight didn't end)
        if (resultType === 'heroWins' || resultType === 'monsterWins') {
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

    setTimeout(() => {
      const rolls = diceRollerRef.current.rollDiceTwo();
      const roll1 = rolls.roll1;
      const roll2 = rolls.roll2;
      const sum = rolls.sum;
      const isLucky = sum <= currentLuck;

      actionSoundsPlayer.current.echoLuckTest(isLucky, actionSoundsEnabled);

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
          // Play hit sound when monster takes extra damage
          if (actionSoundsEnabled) {
            const audio = new Audio(
              `${import.meta.env.BASE_URL}audio/minecraft-hit-monster.mp3`
            );
            audio.play().catch((error) => {
              console.warn('Could not play audio:', error);
            });
          }
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
          // Play hurt sound when hero takes extra damage
          if (actionSoundsEnabled) {
            const audio = new Audio(
              `${import.meta.env.BASE_URL}audio/minecraft-hurt.mp3`
            );
            audio.play().catch((error) => {
              console.warn('Could not play audio:', error);
            });
          }
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
      // Save immediately with current state using buildStateObject to ensure all fields are included
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
        testLuckResult,
        isTestingLuck,
        diceRollingType,
        trailSequence,
        soundUrls,
        soundVolumes,
        actionSoundsEnabled,
        allSoundsMuted,
        theme: getCurrentTheme(),
        sectionsExpanded,
        customSounds,
        customSoundVolumes,
      });
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
    testLuckResult,
    isTestingLuck,
    diceRollingType,
    trailSequence,
    soundUrls,
    soundVolumes,
    actionSoundsEnabled,
    allSoundsMuted,
    sectionsExpanded,
  ]);

  return (
    <div className="min-vh-100 bg-beige d-flex flex-column">
      {showYouDied && (
        <div className="you-died-overlay">
          <div className="you-died-text">{t('fight.youDied')}</div>
        </div>
      )}
      <Header
        onLanguageChange={handleLanguageChange}
        onThemeChange={handleThemeChange}
      />
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
      <main className="container mx-auto py-4 flex-grow-1">
        <div className="row gx-4 mb-4">
          <div className="col-12">
            <GameSection
              book={book}
              onBookChange={setBook}
              onLoadGame={handleLoadGame}
              onSaveGame={handleSaveGame}
              onReset={handleReset}
              allSoundsMuted={allSoundsMuted}
              onAllSoundsMutedChange={setAllSoundsMuted}
              actionSoundsEnabled={actionSoundsEnabled}
              onActionSoundsEnabledChange={setActionSoundsEnabled}
              soundUrls={soundUrls}
              soundInputs={soundInputs}
              soundErrors={soundErrors}
              soundPlaying={soundPlaying}
              soundVolumes={soundVolumes}
              onSoundInputChange={handleSoundInputChange}
              onSoundSubmit={handleSoundSubmit}
              onSoundDelete={handleSoundDelete}
              onSoundPlayPause={handleSoundPlayPause}
              onSoundStop={handleSoundStop}
              onSoundVolumeChange={handleSoundVolumeChange}
              customSounds={customSounds}
              customSoundInputs={customSoundInputs}
              customSoundErrors={customSoundErrors}
              customSoundPlaying={customSoundPlaying}
              customSoundVolumes={customSoundVolumes}
              onCustomSoundInputChange={handleCustomSoundInputChange}
              onCustomSoundSubmit={handleCustomSoundSubmit}
              onCustomSoundDelete={handleCustomSoundDelete}
              onCustomSoundPlayPause={handleCustomSoundPlayPause}
              onCustomSoundStop={handleCustomSoundStop}
              onCustomSoundVolumeChange={handleCustomSoundVolumeChange}
              onAddCustomSound={handleAddCustomSound}
              onRemovePendingCustomSound={handleRemovePendingCustomSound}
              initialExpanded={sectionsExpanded.game}
              onExpandedChange={(expanded) =>
                handleSectionExpandedChange('game', expanded)
              }
            />
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
              initialExpanded={sectionsExpanded.character}
              onExpandedChange={(expanded) =>
                handleSectionExpandedChange('character', expanded)
              }
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
              initialExpanded={sectionsExpanded.consumables}
              onExpandedChange={(expanded) =>
                handleSectionExpandedChange('consumables', expanded)
              }
            />
          </div>
          <div className="col-12 col-xl-4">
            <DiceRollsSection
              key={`dice-${sectionResetKey}`}
              // TODO: Move canTestLuck logic to GameMaster once implemented
              // GameMaster should listen to luck value changes and control button state
              canTestLuck={parseInt(luck) > 0}
              gameShowManager={gameShowManagerRef.current}
              onTestLuckComplete={handleTestLuckComplete}
              initialExpanded={sectionsExpanded.diceRolls}
              onExpandedChange={(expanded) =>
                handleSectionExpandedChange('diceRolls', expanded)
              }
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
              initialExpanded={sectionsExpanded.inventory}
              onExpandedChange={(expanded) =>
                handleSectionExpandedChange('inventory', expanded)
              }
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
              onTrailPillDelete={handleTrailPillDelete}
              initialExpanded={sectionsExpanded.map}
              onExpandedChange={(expanded) =>
                handleSectionExpandedChange('map', expanded)
              }
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
              initialExpanded={sectionsExpanded.fight}
              onExpandedChange={(expanded) =>
                handleSectionExpandedChange('fight', expanded)
              }
            />
          </div>
        </div>
        <div className="row gx-4 mb-4">
          <div className="col-12">
            <NotesSection
              key={`notes-${sectionResetKey}`}
              notes={notes}
              onNotesChange={setNotes}
              initialExpanded={sectionsExpanded.notes}
              onExpandedChange={(expanded) =>
                handleSectionExpandedChange('notes', expanded)
              }
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  // Language state to trigger re-renders when language changes
  const [, setCurrentLang] = useState(i18nManager.getCurrentLanguage());

  // Handler to update language and trigger re-render
  const handleLanguageChange = (lang) => {
    i18nManager.setLanguage(lang);
    setCurrentLang(lang);
  };

  return <AppContent onLanguageChange={handleLanguageChange} />;
}

export default App;
