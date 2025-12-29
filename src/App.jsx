import React, { useState, useEffect, useRef } from 'react';
import { i18nManager } from './managers/i18nManager';
import { isValidYouTubeUrl, extractVideoId } from './utils/youtube';
import { createGameStateManager } from './managers/gameStateManager';
import { themeManager } from './managers/themeManager';
import { convertColorToNote } from './utils/trailMapping';
import { createDiceRoller } from './managers/diceRoller';
import { rollDie, rollTwoDice } from './utils/dice';
import { createSoundManager } from './managers/soundManager';
import { createGameShowManager } from './managers/gameShowManager';
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
  const [, setCurrentTheme] = useState(themeManager.getMode());

  // Sync theme state on mount and subscribe to changes
  useEffect(() => {
    const updateTheme = () => {
      setCurrentTheme(themeManager.getMode());
    };

    // Initial sync
    updateTheme();

    // Subscribe to theme changes
    const unsubscribe = themeManager.subscribe(updateTheme);
    return unsubscribe;
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

  // GameStateManager - single source of truth for all game state
  const gameStateManagerRef = useRef(createGameStateManager());
  const [, forceUpdate] = useState({});

  // Subscribe to GameStateManager for re-renders
  useEffect(() => {
    //TODO: think if this should be handled by GameMaster
    const unsubscribe = gameStateManagerRef.current.subscribe(() => {
      forceUpdate({});
    });

    // Load state from localStorage on mount
    gameStateManagerRef.current.loadFromStorage();

    return unsubscribe;
  }, []);

  // GameStateManager - single source of truth
  const gsm = gameStateManagerRef.current;

  // Trail state - UI-only (input field)

  // Fight state - UI-only (fight started flag, dice rolling UI state)
  const [isFightStarted, setIsFightStarted] = useState(false);
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

  // SoundManager and GameShowManager (use singleton i18nManager)
  // Initialize SoundManager with state from GameStateManager
  const soundManagerRef = useRef(
    createSoundManager({
      allSoundsMuted: gsm.getAllSoundsMuted(),
      actionSoundsEnabled: gsm.getActionSoundsEnabled(),
    })
  );
  const gameShowManagerRef = useRef(
    createGameShowManager(soundManagerRef.current)
  );

  // Sync SoundManager with GameStateManager when mute/action sounds change
  useEffect(() => {
    soundManagerRef.current.setAllSoundsMuted(gsm.getAllSoundsMuted());
    soundManagerRef.current.setActionSoundsEnabled(
      gsm.getActionSoundsEnabled()
    );
  }, [gsm.getAllSoundsMuted(), gsm.getActionSoundsEnabled()]);

  // Notification banner
  const [notification, setNotification] = useState(null);

  // Confirmation dialog
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Section reset key for remounting sections
  const [sectionResetKey, setSectionResetKey] = useState(0);

  // Sound state - UI-only (input fields, errors)
  // Playing status is now managed by SoundManager
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
  // Sync SoundManager's playing state with React for UI updates
  const [soundPlaying, setSoundPlaying] = useState(() =>
    soundManagerRef.current.getSoundPlaying()
  );
  // Custom sounds: UI-only state (input fields, errors)
  // Playing status is now managed by SoundManager
  const [customSoundInputs, setCustomSoundInputs] = useState({}); // { id: { label: '', url: '' } }
  const [customSoundErrors, setCustomSoundErrors] = useState({}); // { id: error }
  const [customSoundPlaying, setCustomSoundPlaying] = useState(() =>
    soundManagerRef.current.getCustomSoundPlaying()
  );

  // Subscribe to SoundManager state changes for React updates
  useEffect(() => {
    const unsubscribe = soundManagerRef.current.subscribe(() => {
      setSoundPlaying(soundManagerRef.current.getSoundPlaying());
      setCustomSoundPlaying(soundManagerRef.current.getCustomSoundPlaying());
    });
    return unsubscribe;
  }, []);
  // Subscribe to GameShowManager for visual feedback (YOU DIED, etc.)
  const [gameShowState, setGameShowState] = useState(() =>
    gameShowManagerRef.current.getDisplayState()
  );
  useEffect(() => {
    const unsubscribe = gameShowManagerRef.current.subscribe((state) => {
      setGameShowState(state);
    });
    return unsubscribe;
  }, []);

  // State management
  const isInitialMountRef = useRef(true);
  const preBattleSoundRef = useRef(null); // Track what sound was playing before battle

  // Mark initial mount as complete after a small delay
  useEffect(() => {
    setTimeout(() => {
      isInitialMountRef.current = false;
    }, 100);
  }, []);

  // Auto-sync action sounds with master sound state (only after initial mount)
  useEffect(() => {
    // Skip auto-sync on initial mount to preserve loaded state
    if (isInitialMountRef.current) return;

    if (gsm.getAllSoundsMuted()) {
      gsm.setActionSoundsEnabled(false);
    } else {
      gsm.setActionSoundsEnabled(true);
    }
  }, [gsm.getAllSoundsMuted()]);

  // Note: GameStateManager handles auto-save to localStorage automatically

  // Section expanded state handler
  const handleSectionExpandedChange = (sectionName, isExpanded) => {
    gsm.setSectionsExpanded({
      ...gsm.getSectionsExpanded(),
      [sectionName]: isExpanded,
    });
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

  // Trail handlers are now handled by MapSection internally

  const handleTrailPillColorChange = (color) => {
    // This is now handled by MapSection internally
    // Kept for backward compatibility with fight section
    // When player dies in fight, we need to mark the trail as died
    const { convertColorToNote } = require('./utils/trailMapping');
    const annotation = convertColorToNote(color);
    const current = gsm.getTrailSequence();
    if (current.length === 0) return;
    const newSequence = [...current];
    const lastIndex = newSequence.length - 1;
    newSequence[lastIndex] = {
      ...newSequence[lastIndex],
      annotation: annotation,
    };
    gsm.setTrailSequence(newSequence);
    // Auto-play defeat sound and show "You Died" animation when died button is clicked
    if (annotation === 'died') {
      autoPlaySound('defeat');
      gameShowManagerRef.current.showYouDied();
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
      const oldPlayer = soundManagerRef.current.getPlayer(soundType);
      if (oldPlayer) {
        try {
          oldPlayer.stopVideo();
          oldPlayer.destroy();
        } catch (e) {
          // Ignore errors
        }
        // Player will be recreated by initPlayer when URL changes
      }

      gsm.setSoundUrls({
        ...gsm.getSoundUrls(),
        [soundType]: url,
      });
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
    soundManagerRef.current.handleMusicDelete(soundType, (soundType) => {
      // Update GameStateManager (persistent state)
      const currentUrls = gsm.getSoundUrls();
      gsm.setSoundUrls({
        ...currentUrls,
        [soundType]: '',
      });
      // Update UI state (input fields, errors)
      setSoundInputs((prev) => ({
        ...prev,
        [soundType]: '',
      }));
      setSoundErrors((prev) => ({
        ...prev,
        [soundType]: null,
      }));
    });
  };

  const handleSoundPlayPause = (soundType) => {
    soundManagerRef.current.handleMusicPlayPause(soundType);
  };

  const handleSoundStop = (soundType) => {
    soundManagerRef.current.handleMusicStop(soundType);
  };

  const handleSoundVolumeChange = (soundType, volume) => {
    gsm.setSoundVolumes({
      ...gsm.getSoundVolumes(),
      [soundType]: volume,
    });
    soundManagerRef.current.setPlayerVolume(soundType, volume);
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
    const current = gsm.getCustomSounds();
    const existing = current.find((s) => s.id === id);
    if (existing) {
      // Update existing
      gsm.setCustomSounds(
        current.map((s) => (s.id === id ? { ...s, label, url } : s))
      );
    } else {
      // Add new
      const newSound = { id, label, url };
      // Initialize volume with default
      const defaultState = gsm.getState();
      gsm.setCustomSoundVolumes({
        ...gsm.getCustomSoundVolumes(),
        [id]: defaultState.sounds.ambienceVolume,
      });
      gsm.setCustomSounds([...current, newSound]);
    }

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
    const playerKey = `custom-${id}`;
    const player = soundManagerRef.current.getPlayer(playerKey);
    if (player) {
      try {
        player.stopVideo();
        player.destroy();
      } catch (e) {
        // Ignore errors
      }
      // Player will be removed by SoundManager's delete handling
    }

    // Remove from custom sounds
    gsm.setCustomSounds(gsm.getCustomSounds().filter((s) => s.id !== id));
    setCustomSoundPlaying((prev) => {
      const newPlaying = { ...prev };
      delete newPlaying[id];
      return newPlaying;
    });
    const volumes = { ...gsm.getCustomSoundVolumes() };
    delete volumes[id];
    gsm.setCustomSoundVolumes(volumes);
  };

  const handleCustomSoundPlayPause = (id) => {
    const playerKey = `custom-${id}`;
    const player = soundManagerRef.current.getPlayer(playerKey);
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
            const otherPlayer = soundManagerRef.current.getPlayer(st);
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
            const otherPlayerKey = `custom-${otherId}`;
            const otherPlayer =
              soundManagerRef.current.getPlayer(otherPlayerKey);
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
    const playerKey = `custom-${id}`;
    const player = soundManagerRef.current.getPlayer(playerKey);
    if (!player) return;

    if (!customSoundPlaying[id]) return;

    try {
      // Note: soundStoppedManually is now managed by SoundManager internally
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
    gsm.setCustomSoundVolumes({
      ...gsm.getCustomSoundVolumes(),
      [id]: volume,
    });
    const playerKey = `custom-${id}`;
    soundManagerRef.current.setPlayerVolume(playerKey, volume);
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
    if (gsm.getAllSoundsMuted()) return;

    const player = soundManagerRef.current.getPlayer(soundType);
    if (!player || !gsm.getSoundUrls()[soundType]) return;

    try {
      // Pause all other sounds - check all players, not just those marked as playing
      const soundTypes = ['ambience', 'battle', 'victory', 'defeat'];
      soundTypes.forEach((st) => {
        if (st !== soundType) {
          const otherPlayer = soundManagerRef.current.getPlayer(st);
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
          const customPlayerKey = `custom-${customId}`;
          const customPlayer =
            soundManagerRef.current.getPlayer(customPlayerKey);
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
      if (!gsm.getSoundUrls()[soundType]) {
        return;
      }

      if (window.YT && window.YT.Player) {
        const videoId = extractVideoId(gsm.getSoundUrls()[soundType]);
        if (videoId) {
          soundManagerRef.current.initPlayer(soundType, videoId, {
            volume: gsm.getSoundVolumes()[soundType],
          });
        }
      } else {
        setTimeout(() => initPlayer(soundType), 100);
      }
    };

    // Initialize all players
    soundTypes.forEach((soundType) => {
      if (
        gsm.getSoundUrls()[soundType] &&
        !soundManagerRef.current.getPlayer(soundType)
      ) {
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
  }, [gsm]);

  // Initialize YouTube players for custom sounds
  useEffect(() => {
    if (!window.YT || !window.YT.Player) {
      return;
    }

    gsm.getCustomSounds().forEach((customSound) => {
      const playerKey = `custom-${customSound.id}`;
      if (soundManagerRef.current.getPlayer(playerKey)) {
        return; // Player already exists
      }

      const videoId = extractVideoId(customSound.url);
      if (!videoId) {
        return;
      }

      soundManagerRef.current.initCustomPlayer(customSound.id, videoId, {
        volume: gsm.getCustomSoundVolumes()[customSound.id] ?? 25,
      });
    });
  }, [gsm]);

  // Update volumes on existing YouTube players when soundVolumes changes
  useEffect(() => {
    const soundTypes = ['ambience', 'battle', 'victory', 'defeat'];
    soundTypes.forEach((soundType) => {
      soundManagerRef.current.setPlayerVolume(
        soundType,
        gsm.getSoundVolumes()[soundType]
      );
    });
  }, [gsm]);

  // Update volumes on existing custom sound players
  useEffect(() => {
    gsm.getCustomSounds().forEach((customSound) => {
      const playerKey = `custom-${customSound.id}`;
      const volume = gsm.getCustomSoundVolumes()[customSound.id] ?? 50;
      soundManagerRef.current.setPlayerVolume(playerKey, volume);
    });
  }, [gsm]);

  // Monitor creature name changes to start battle theme
  const prevMonsterCreatureRef = useRef(gsm.getMonsterCreature());
  useEffect(() => {
    const prevCreature = prevMonsterCreatureRef.current;
    const currentCreature = gsm.getMonsterCreature().trim();
    const prevWasEmpty = !prevCreature || prevCreature.length === 0;
    const currentHasContent = currentCreature.length > 0;

    // If creature name goes from empty to having at least one character, start battle theme
    if (prevWasEmpty && currentHasContent && !gsm.getAllSoundsMuted()) {
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
      !gsm.getAllSoundsMuted()
    ) {
      // Stop victory theme
      const victoryPlayer = soundManagerRef.current.getPlayer('victory');
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

    prevMonsterCreatureRef.current = gsm.getMonsterCreature();
  }, [gsm, soundPlaying.victory, soundPlaying.ambience, customSoundPlaying]);

  // Monitor trail sequence changes to stop victory and resume ambience
  const prevTrailSequenceRef = useRef(gsm.getTrailSequence());
  useEffect(() => {
    const prevSequence = prevTrailSequenceRef.current;
    const currentSequence = gsm.getTrailSequence();

    // Check if trail sequence actually changed (not just a reference change)
    const sequenceChanged =
      JSON.stringify(prevSequence) !== JSON.stringify(currentSequence);

    // If victory theme is playing and trail sequence changes, stop victory and resume previous sound
    if (sequenceChanged && soundPlaying.victory && !gsm.getAllSoundsMuted()) {
      // Stop victory theme
      const victoryPlayer = soundManagerRef.current.getPlayer('victory');
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
      if (preBattleSound === 'ambience' && gsm.getSoundUrls().ambience) {
        autoPlaySound('ambience');
      } else if (preBattleSound && preBattleSound.startsWith('custom-')) {
        // Extract custom sound ID (remove 'custom-' prefix)
        const customId = preBattleSound.replace('custom-', '');
        const customSound = gsm
          .getCustomSounds()
          .find((s) => s.id === customId);
        if (customSound && customSound.url) {
          // Resume custom sound
          const customPlayer =
            soundManagerRef.current.getPlayer(preBattleSound);
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

    prevTrailSequenceRef.current = gsm.getTrailSequence();
  }, [gsm, soundPlaying.victory, customSoundPlaying]);

  // Character handlers
  const handleRandomStats = () => {
    const skillRoll = rollDie();
    const newSkill = skillRoll + 6;
    gsm.setSkill(
      String(
        gsm.getMaxSkill() !== null
          ? Math.min(newSkill, gsm.getMaxSkill())
          : newSkill
      )
    );

    const healthRolls = rollTwoDice();
    const newHealth = healthRolls.sum + 12;
    gsm.setHealth(
      String(
        gsm.getMaxHealth() !== null
          ? Math.min(newHealth, gsm.getMaxHealth())
          : newHealth
      )
    );

    const luckRoll = rollDie();
    const newLuck = luckRoll + 6;
    gsm.setLuck(
      String(
        gsm.getMaxLuck() !== null
          ? Math.min(newLuck, gsm.getMaxLuck())
          : newLuck
      )
    );
  };

  const handleRandomStatsWithAnimation = () => {
    setRollingButton('randomize');
    setTimeout(() => {
      handleRandomStats();
      setRollingButton(null);
    }, 1000);
  };

  const handleToggleLock = () => {
    if (!gsm.getIsLocked()) {
      gsm.setMaxSkill(parseInt(gsm.getSkill()) || null);
      gsm.setMaxHealth(parseInt(gsm.getHealth()) || null);
      gsm.setMaxLuck(parseInt(gsm.getLuck()) || null);
    } else {
      gsm.setMaxSkill(null);
      gsm.setMaxHealth(null);
      gsm.setMaxLuck(null);
    }
    gsm.setIsLocked(!gsm.getIsLocked());
  };

  // Consumables handlers
  const handleConsumeMeal = () => {
    const currentMeals = parseInt(gsm.getMeals()) || 0;
    if (currentMeals > 0) {
      soundManagerRef.current.playEatSound();

      gsm.setMeals(String(currentMeals - 1));
      showFieldBadge('meals', '-1', 'danger');

      const currentHealth = parseInt(gsm.getHealth()) || 0;
      const newHealth = currentHealth + 4;
      const actualIncrease =
        gsm.getMaxHealth() !== null
          ? Math.min(newHealth, gsm.getMaxHealth()) - currentHealth
          : 4;
      gsm.setHealth(
        String(
          gsm.getMaxHealth() !== null
            ? Math.min(newHealth, gsm.getMaxHealth())
            : newHealth
        )
      );
      if (actualIncrease > 0) {
        showFieldBadge('health', `+${actualIncrease}`, 'success');
      }
    }
  };

  // TODO: Move potion consumption logic to GameMaster once implemented
  // GameMaster should handle: validation, restoring stat to max value, playing drink sound, showing badges, marking potion as used
  // Missing tests (should be in GameMaster): potion restores trait to max value, drink sound plays when potion is consumed
  const handleConsumePotion = () => {
    if (potionUsed || !potionType || !isLocked) return;

    soundManagerRef.current.playDrinkSound();

    if (gsm.getPotionType() === 'skill' && gsm.getMaxSkill() !== null) {
      const currentSkill = parseInt(gsm.getSkill()) || 0;
      const difference = gsm.getMaxSkill() - currentSkill;
      gsm.setSkill(String(gsm.getMaxSkill()));
      if (difference > 0) {
        showFieldBadge('skill', `+${difference}`, 'success');
      }
    } else if (
      gsm.getPotionType() === 'health' &&
      gsm.getMaxHealth() !== null
    ) {
      const currentHealth = parseInt(gsm.getHealth()) || 0;
      const difference = gsm.getMaxHealth() - currentHealth;
      gsm.setHealth(String(gsm.getMaxHealth()));
      if (difference > 0) {
        showFieldBadge('health', `+${difference}`, 'success');
      }
    } else if (gsm.getPotionType() === 'luck' && gsm.getMaxLuck() !== null) {
      const currentLuck = parseInt(gsm.getLuck()) || 0;
      const difference = gsm.getMaxLuck() - currentLuck;
      gsm.setLuck(String(gsm.getMaxLuck()));
      if (difference > 0) {
        showFieldBadge('luck', `+${difference}`, 'success');
      }
    }

    gsm.setPotionUsed(true);
  };

  // TODO: Move reset confirmation logic to GameMaster once implemented
  // GameMaster should handle: showing confirmation dialog, validating reset conditions, orchestrating reset
  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setShowResetConfirm(false);
    // Reset all game state to defaults via GameStateManager
    gsm.reset();
    // Reset UI-only state
    setTrailInput('');
    setIsFightStarted(false);
    setRollingButton(null);
    setTestLuckResult(null);
    setIsTestingLuck(false);
    setDiceRollingType(null);
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
    // Reset SoundManager playing state (internal state)
    // Note: SoundManager state will be synced via getSoundPlaying() calls
    setSoundPlaying({
      ambience: false,
      battle: false,
      victory: false,
      defeat: false,
    });
    // Reset custom sounds UI state
    const currentCustomSounds = gsm.getCustomSounds();
    currentCustomSounds.forEach((customSound) => {
      const playerKey = `custom-${customSound.id}`;
      const player = soundManagerRef.current.getPlayer(playerKey);
      if (player) {
        try {
          player.stopVideo();
          player.destroy();
        } catch (e) {
          // Ignore errors
        }
      }
    });
    setCustomSoundInputs({});
    setCustomSoundErrors({});
    setCustomSoundPlaying({});
    // Note: Players are managed by SoundManager, no need to manually clear them
    // Force all sections to remount
    setSectionResetKey((prev) => prev + 1);
  };

  const handleSaveGame = () => {
    gsm.saveToFile(gsm.getBook(), gsm.getName());
    setNotification({ message: t('game.saved'), type: 'success' });
  };

  const handleLoadGame = async () => {
    const loaded = await gsm.loadFromFile();
    if (loaded) {
      // Note: Theme is NOT loaded from game save files - it's session-specific
      // and stored only in localStorage via themeManager
      //TODO: should be handled by GameShowManager
      setNotification({ message: t('game.loaded'), type: 'success' });
    }
  };

  // TODO: Move purchase logic to GameMaster once implemented
  // GameMaster should handle: validation, deducting coins, adding to inventory, playing sound, showing badges
  const handlePurchase = () => {
    soundManagerRef.current.playPurchaseSound();

    const objectName = transactionObject.trim();
    const cost = parseInt(transactionCost) || 0;
    const currentCoins = parseInt(gsm.getCoins()) || 0;

    if (objectName && cost > 0 && currentCoins >= cost) {
      const newCoins = Math.max(0, currentCoins - cost);
      gsm.setCoins(String(newCoins));
      showFieldBadge('coins', `-${cost}`, 'danger');

      const currentInventory = gsm.getInventory().trim();
      const separator = currentInventory ? '\n' : '';
      gsm.setInventory(`${currentInventory}${separator}${objectName}`);
      showFieldBadge('inventory', t('consumables.added'), 'success');

      gsm.setTransactionObject('');
      gsm.setTransactionCost('');
    }
  };

  // Handle test luck completion from DiceRollsSection
  const handleTestLuckComplete = (rolls) => {
    const roll1 = rolls.roll1;
    const roll2 = rolls.roll2;
    const sum = rolls.sum;
    const currentLuck = parseInt(luck) || 0;
    const isLucky = sum <= currentLuck; //TODO: move this logic to GameMaster

    // Show luck test result (message + sound via GameShowManager)
    gameShowManagerRef.current.showLuckTestResult(isLucky);

    // Set result (used by FightSection)
    setTestLuckResult({ roll1, roll2, isLucky });

    // Decrement luck
    const newLuck = Math.max(0, currentLuck - 1);
    gsm.setLuck(String(newLuck));
  };

  // Fight handlers
  const checkFightEnd = (heroHealthValue = null, monsterHealthValue = null) => {
    const currentHealth =
      heroHealthValue !== null
        ? heroHealthValue
        : parseInt(gsm.getHealth()) || 0;
    const currentMonsterHealth =
      monsterHealthValue !== null
        ? monsterHealthValue
        : parseInt(monsterHealth) || 0;
    const creatureName = gsm.getMonsterCreature().trim();

    if (currentMonsterHealth <= 0 && creatureName) {
      gsm.setFightOutcome('won');
      // Auto-play victory sound
      autoPlaySound('victory');
      const currentGraveyard = gsm.getGraveyard().trim();
      const separator = currentGraveyard ? '\n' : '';
      gsm.setGraveyard(
        `${currentGraveyard}${separator}${t('fight.defeatCreature')} ${creatureName}`
      );
      gsm.setIsFighting(false);
      setIsFightStarted(false);
      setDiceRollingType(null);
      setTimeout(() => {
        gsm.setFightOutcome(null);
        gsm.setMonsterCreature('');
        gsm.setMonsterSkill('');
        gsm.setMonsterHealth('');
        gsm.setHeroDiceRolls(null);
        gsm.setMonsterDiceRolls(null);
        gsm.setFightResult(null);
        setTestLuckResult(null);
        gsm.setShowUseLuck(false);
        gsm.setLuckUsed(false);
      }, 5000);
      return true;
    } else if (currentHealth <= 0) {
      gsm.setFightOutcome('lost');
      // Ensure there's a trail entry, then trigger died button (which will play defeat sound)
      const currentTrail = gsm.getTrailSequence();
      if (currentTrail.length === 0) {
        // If no trail entries, add one with the current input or default to 1
        const num = 1; // Default to 1 if no trail exists
        gsm.setTrailSequence([{ number: num, annotation: 'died' }]);
      }
      // Trigger died button in trail (which will play defeat sound)
      handleTrailPillColorChange('dark');
      const currentGraveyard = gsm.getGraveyard().trim();
      const separator = currentGraveyard ? '\n' : '';
      gsm.setGraveyard(
        `${currentGraveyard}${separator}${t('fight.defeatedBy')} ${creatureName}`
      );
      gsm.setIsFighting(false);
      setIsFightStarted(false);
      setDiceRollingType(null);
      setTimeout(() => {
        gsm.setFightOutcome(null);
        gsm.setMonsterCreature('');
        gsm.setMonsterSkill('');
        gsm.setMonsterHealth('');
        gsm.setHeroDiceRolls(null);
        gsm.setMonsterDiceRolls(null);
        gsm.setFightResult(null);
        setTestLuckResult(null);
        gsm.setShowUseLuck(false);
        gsm.setLuckUsed(false);
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
    gsm.setIsFighting(true);
    setDiceRollingType('fight');
    gsm.setFightResult(null);
    gsm.setFightOutcome(null);
    gsm.setLuckUsed(false);
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

        const heroSkill = parseInt(gsm.getSkill()) || 0;
        const monsterSkillValue = parseInt(gsm.getMonsterSkill()) || 0;
        const heroTotal = heroDiceSum + heroSkill;
        const monsterTotal = monsterDiceSum + monsterSkillValue;

        const currentHealth = parseInt(gsm.getHealth()) || 0;
        const currentMonsterHealth = parseInt(gsm.getMonsterHealth()) || 0;

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
        gsm.setHeroDiceRolls([heroRoll1, heroRoll2]);
        gsm.setMonsterDiceRolls([monsterRoll1, monsterRoll2]);

        if (newHealth !== currentHealth) {
          gsm.setHealth(String(newHealth));
          showFieldBadge('heroHealth', '-2', 'danger');
          // Play hurt sound when hero takes damage
          soundManagerRef.current.playPlayerDamageSound();
        }
        if (newMonsterHealth !== currentMonsterHealth) {
          gsm.setMonsterHealth(String(newMonsterHealth));
          showFieldBadge('monsterHealth', '-2', 'danger');
          // Play hit sound when monster takes damage
          soundManagerRef.current.playMonsterDamageSound();
        }

        // Now check if fight ended with the updated health values
        fightEnded = checkFightEnd(newHealth, newMonsterHealth);

        if (fightEnded) {
          gsm.setIsFighting(false);
          setDiceRollingType(null);
          return;
        }

        // Show use luck after every attack with a winner (not on ties, and fight didn't end)
        if (resultType === 'heroWins' || resultType === 'monsterWins') {
          shouldShowUseLuck = true;
        }

        gsm.setFightResult({
          type: resultType,
          message: resultMessage,
          heroTotal,
          monsterTotal,
        });

        if (shouldShowUseLuck) {
          gsm.setShowUseLuck(true);
        }

        if (fightAnimationIdRef.current === animationId) {
          gsm.setIsFighting(false);
          setDiceRollingType(null);
          fightAnimationIdRef.current = null;
        }
      } catch (error) {
        console.error('Error in fight calculation:', error);
        gsm.setIsFighting(false);
        setDiceRollingType(null);
      }
    }, 1000);

    safetyTimeoutRef.current = setTimeout(() => {
      if (fightAnimationIdRef.current === animationId) {
        setDiceRollingType((current) => {
          if (current === 'fight') {
            gsm.setIsFighting(false);
            fightAnimationIdRef.current = null;
            return null;
          }
          return current;
        });
      }
    }, 2000);
  };

  const handleUseLuck = () => {
    const currentLuck = parseInt(gsm.getLuck()) || 0;
    if (
      currentLuck <= 0 ||
      diceRollingType !== null ||
      !gsm.getFightResult() ||
      gsm.getLuckUsed()
    )
      return;

    setIsTestingLuck(true);
    setDiceRollingType('useLuck');
    setTestLuckResult(null);
    gsm.setLuckUsed(true);

    setTimeout(() => {
      const rolls = diceRollerRef.current.rollDiceTwo();
      const roll1 = rolls.roll1;
      const roll2 = rolls.roll2;
      const sum = rolls.sum;
      const isLucky = sum <= currentLuck; //TODO: move this logic to GameMaster

      gameShowManagerRef.current.showLuckTestResult(isLucky);

      const heroWonLastFight = gsm.getFightResult().type === 'heroWins';
      const currentHealth = parseInt(gsm.getHealth()) || 0;
      const currentMonsterHealth = parseInt(gsm.getMonsterHealth()) || 0;
      let newHealth = currentHealth;
      let newMonsterHealth = currentMonsterHealth;

      if (heroWonLastFight) {
        if (isLucky) {
          newMonsterHealth = Math.max(0, currentMonsterHealth - 1);
          gsm.setMonsterHealth(String(newMonsterHealth));
          showFieldBadge('monsterHealth', '-1', 'danger');
          // Play hit sound when monster takes extra damage
          soundManagerRef.current.playMonsterDamageSound();
        } else {
          newMonsterHealth = currentMonsterHealth + 1;
          gsm.setMonsterHealth(String(newMonsterHealth));
          showFieldBadge('monsterHealth', '+1', 'success');
        }
      } else {
        if (isLucky) {
          const maxHealthValue =
            gsm.getMaxHealth() !== null ? parseInt(gsm.getMaxHealth()) : null;
          newHealth =
            maxHealthValue !== null
              ? Math.min(currentHealth + 1, maxHealthValue)
              : currentHealth + 1;
          const actualIncrease = newHealth - currentHealth;
          gsm.setHealth(String(newHealth));
          if (actualIncrease > 0) {
            showFieldBadge('heroHealth', '+1', 'success');
          }
        } else {
          newHealth = Math.max(0, currentHealth - 1);
          gsm.setHealth(String(newHealth));
          showFieldBadge('heroHealth', '-1', 'danger');
          // Play hurt sound when hero takes extra damage
          soundManagerRef.current.playPlayerDamageSound();
        }
      }

      const newLuck = Math.max(0, currentLuck - 1);
      gsm.setLuck(String(newLuck));

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

  // Save immediately when page is closing
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Force immediate save (GameStateManager handles the actual save)
      const stateToSave = gsm.getState();
      // Save directly to localStorage (bypass debounce)
      const { saveToStorage } = require('../utils/localStorage');
      saveToStorage('fnf-companion-state', {
        ...stateToSave,
        metadata: {
          ...stateToSave.metadata,
          savedAt: new Date().toISOString(),
        },
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // Empty deps - gsm is stable ref

  return (
    <div className="min-vh-100 bg-beige d-flex flex-column">
      {gameShowState.youDiedOverlay}
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
              book={gsm.getBook()}
              onBookChange={gsm.setBook}
              onLoadGame={handleLoadGame}
              onSaveGame={handleSaveGame}
              onReset={handleReset}
              allSoundsMuted={gsm.getAllSoundsMuted()}
              onAllSoundsMutedChange={gsm.setAllSoundsMuted}
              actionSoundsEnabled={gsm.getActionSoundsEnabled()}
              onActionSoundsEnabledChange={gsm.setActionSoundsEnabled}
              soundUrls={gsm.getSoundUrls()}
              soundInputs={soundInputs}
              soundErrors={soundErrors}
              soundPlaying={soundPlaying}
              soundVolumes={gsm.getSoundVolumes()}
              onSoundInputChange={handleSoundInputChange}
              onSoundSubmit={handleSoundSubmit}
              onSoundDelete={handleSoundDelete}
              onSoundPlayPause={handleSoundPlayPause}
              onSoundStop={handleSoundStop}
              onSoundVolumeChange={handleSoundVolumeChange}
              customSounds={gsm.getCustomSounds()}
              customSoundInputs={customSoundInputs}
              customSoundErrors={customSoundErrors}
              customSoundPlaying={customSoundPlaying}
              customSoundVolumes={gsm.getCustomSoundVolumes()}
              onCustomSoundInputChange={handleCustomSoundInputChange}
              onCustomSoundSubmit={handleCustomSoundSubmit}
              onCustomSoundDelete={handleCustomSoundDelete}
              onCustomSoundPlayPause={handleCustomSoundPlayPause}
              onCustomSoundStop={handleCustomSoundStop}
              onCustomSoundVolumeChange={handleCustomSoundVolumeChange}
              onAddCustomSound={handleAddCustomSound}
              onRemovePendingCustomSound={handleRemovePendingCustomSound}
              initialExpanded={gsm.getSectionsExpanded().game}
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
              name={gsm.getName()}
              skill={gsm.getSkill()}
              health={gsm.getHealth()}
              luck={gsm.getLuck()}
              maxSkill={gsm.getMaxSkill()}
              maxHealth={gsm.getMaxHealth()}
              maxLuck={gsm.getMaxLuck()}
              isLocked={gsm.getIsLocked()}
              fieldBadges={fieldBadges}
              rollingButton={rollingButton}
              onNameChange={gsm.setName}
              onSkillChange={gsm.setSkill}
              onHealthChange={gsm.setHealth}
              onLuckChange={gsm.setLuck}
              onRandomStats={handleRandomStatsWithAnimation}
              onToggleLock={handleToggleLock}
              onNumberChange={handleNumberChange}
              initialExpanded={gsm.getSectionsExpanded().character}
              onExpandedChange={(expanded) =>
                handleSectionExpandedChange('character', expanded)
              }
            />
          </div>
          <div className="col-12 col-xl-4">
            <ConsumablesSection
              key={`consumables-${sectionResetKey}`}
              coins={gsm.getCoins()}
              meals={gsm.getMeals()}
              health={gsm.getHealth()}
              maxHealth={gsm.getMaxHealth()}
              skill={gsm.getSkill()}
              maxSkill={gsm.getMaxSkill()}
              luck={gsm.getLuck()}
              maxLuck={gsm.getMaxLuck()}
              transactionObject={gsm.getTransactionObject()}
              transactionCost={gsm.getTransactionCost()}
              fieldBadges={fieldBadges}
              isLocked={gsm.getIsLocked()}
              potionType={gsm.getPotionType()}
              potionUsed={gsm.getPotionUsed()}
              onCoinsChange={gsm.setCoins}
              onMealsChange={gsm.setMeals}
              onTransactionObjectChange={gsm.setTransactionObject}
              onTransactionCostChange={gsm.setTransactionCost}
              onConsumeMeal={handleConsumeMeal}
              onPurchase={handlePurchase}
              onPotionTypeChange={gsm.setPotionType}
              onConsumePotion={handleConsumePotion}
              onNumberChange={handleNumberChange}
              initialExpanded={gsm.getSectionsExpanded().consumables}
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
              canTestLuck={parseInt(gsm.getLuck()) > 0}
              gameShowManager={gameShowManagerRef.current}
              onTestLuckComplete={handleTestLuckComplete}
              initialExpanded={gsm.getSectionsExpanded().diceRolls}
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
              inventory={gsm.getInventory()}
              onInventoryChange={gsm.setInventory}
              fieldBadges={fieldBadges}
              initialExpanded={gsm.getSectionsExpanded().inventory}
              onExpandedChange={(expanded) =>
                handleSectionExpandedChange('inventory', expanded)
              }
            />
          </div>
          <div className="col-12 col-xl-8">
            <MapSection
              key={`map-${sectionResetKey}`}
              trailSequence={gsm.getTrailSequence()}
              gsm={gsm}
              onDied={() => {
                autoPlaySound('defeat');
                gameShowManagerRef.current.showYouDied();
              }}
              onCelebrate={() => {
                gameShowManagerRef.current.celebrate();
              }}
              initialExpanded={gsm.getSectionsExpanded().map}
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
              skill={gsm.getSkill()}
              health={gsm.getHealth()}
              luck={gsm.getLuck()}
              monsterCreature={gsm.getMonsterCreature()}
              monsterSkill={gsm.getMonsterSkill()}
              monsterHealth={gsm.getMonsterHealth()}
              graveyard={gsm.getGraveyard()}
              showUseLuck={gsm.getShowUseLuck()}
              luckUsed={gsm.getLuckUsed()}
              isFighting={gsm.getIsFighting()}
              isFightStarted={isFightStarted}
              fightResult={gsm.getFightResult()}
              fightOutcome={gsm.getFightOutcome()}
              heroDiceRolls={gsm.getHeroDiceRolls()}
              monsterDiceRolls={gsm.getMonsterDiceRolls()}
              testLuckResult={testLuckResult}
              isTestingLuck={isTestingLuck}
              diceRollingType={diceRollingType}
              fieldBadges={fieldBadges}
              onMonsterCreatureChange={gsm.setMonsterCreature}
              onMonsterSkillChange={gsm.setMonsterSkill}
              onMonsterHealthChange={gsm.setMonsterHealth}
              onFight={handleFight}
              onUseLuck={handleUseLuck}
              onNumberChange={handleNumberChange}
              initialExpanded={gsm.getSectionsExpanded().fight}
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
              notes={gsm.getNotes()}
              onNotesChange={gsm.setNotes}
              initialExpanded={gsm.getSectionsExpanded().notes}
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
