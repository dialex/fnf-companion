# Refactor Plan: Rename SoundManager to NoiseManager

## Overview

Rename terminology to be more consistent:

- **SoundManager** → **NoiseManager** (manages both sounds and music)
- **Master Sound** → **Noise** (button that controls all noise)
- **Action Sounds** → **Sound** (button that controls built-in mp3 sounds)
- **allSoundsMuted** → **allNoiseMuted**
- **actionSoundsEnabled** → **soundsEnabled**
- YouTube tracks → **Music** (already mostly correct)
- Built-in mp3 files → **Sound** (already mostly correct)

## Files to Modify

### 1. Core Manager Files (3 files)

- `src/managers/soundManager.js` → `src/managers/noiseManager.js`
  - Rename: `createSoundManager` → `createNoiseManager`
  - Rename: `allSoundsMuted` → `allNoiseMuted`
  - Rename: `actionSoundsEnabled` → `soundsEnabled`
  - Rename: `getSoundPlaying()` → `getMusicPlaying()` (YouTube tracks)
  - Rename: `getCustomSoundPlaying()` → `getCustomMusicPlaying()`
  - Rename: `getSoundStoppedManually()` → `getMusicStoppedManually()`
  - Rename: `soundPlaying` → `musicPlaying`
  - Rename: `customSoundPlaying` → `customMusicPlaying`
  - Rename: `soundStoppedManually` → `musicStoppedManually`
  - Update all comments and JSDoc

### 2. GameStateManager (1 file)

- `src/managers/gameStateManager.js`
  - Rename: `getActionSoundsEnabled()` → `getSoundsEnabled()`
  - Rename: `getAllSoundsMuted()` → `getAllNoiseMuted()`
  - Rename: `setActionSoundsEnabled()` → `setSoundsEnabled()`
  - Rename: `setAllSoundsMuted()` → `setAllNoiseMuted()`
  - Update state metadata keys: `actionSoundsEnabled` → `soundsEnabled`, `allSoundsMuted` → `allNoiseMuted`

### 3. App.jsx (1 file - ~50+ changes)

- Import: `createSoundManager` → `createNoiseManager`
- Variable: `soundManagerRef` → `noiseManagerRef`
- All method calls: `soundManagerRef.current.*` → `noiseManagerRef.current.*`
- Method names: `getAllSoundsMuted()` → `getAllNoiseMuted()`, etc.
- State variables: `allSoundsMuted` → `allNoiseMuted`, `actionSoundsEnabled` → `soundsEnabled`
- Comments mentioning "SoundManager" → "NoiseManager"
- Comments mentioning "master sound" → "noise"
- Comments mentioning "action sounds" → "sound"

### 4. GameSection Component (1 file)

- Props: `allSoundsMuted` → `allNoiseMuted`
- Props: `actionSoundsEnabled` → `soundsEnabled`
- Props: `onAllSoundsMutedChange` → `onAllNoiseMutedChange`
- Props: `onActionSoundsEnabledChange` → `onSoundsEnabledChange`
- Variable: `masterSoundButtonRef` → `noiseButtonRef`
- Variable: `actionSoundsCheckboxRef` → `soundButtonRef`
- Function: `handleMasterSoundToggle` → `handleNoiseToggle`
- Comments and tooltip text references

### 5. GameShowManager (1 file)

- Parameter: `soundManager` → `noiseManager`
- All method calls updated

### 6. Translations (2 files)

- `src/translations/en.json`:
  - `"actionSoundsTooltip": "Play sounds on actions"` → `"soundTooltip": "Play sounds on actions"`
  - `"muteAll": "Mute all"` → `"muteNoise": "Mute noise"` (or keep as is?)
  - `"unmuteAll": "Unmute all"` → `"unmuteNoise": "Unmute noise"` (or keep as is?)
- `src/translations/pt.json`: Same changes

### 7. Test Files (8 files)

- `src/__tests__/managers/soundManager.test.js` → `noiseManager.test.js`
  - Import: `createSoundManager` → `createNoiseManager`
  - Describe: `'SoundManager'` → `'NoiseManager'`
  - All variable names: `soundManager` → `noiseManager`
  - All method calls updated
  - Test descriptions: "Master sound" → "Noise", "Action sounds" → "Sound"

- `src/__tests__/managers/soundManager.music.test.js` → `noiseManager.music.test.js`
  - Same changes as above

- `src/__tests__/managers/gameShowManager.test.js`
  - Mock: `mockSoundManager` → `mockNoiseManager`

- `src/__tests__/components/GameSection.test.jsx`
  - Props: `allSoundsMuted` → `allNoiseMuted`, etc.
  - Test descriptions updated

- `src/__tests__/components/GameSectionReset.integration.test.jsx`
  - Props updated

- `src/__tests__/components/DiceRollsSection.test.jsx`
  - Props updated

- `src/__tests__/managers/gameStateManager.test.js`
  - Method names updated

- `src/__tests__/managers/stateManager.test.js`
  - State keys updated

### 8. CSS (1 file)

- `src/styles/components.css`
  - `#actionSoundsCheckbox` → `#soundButton` (if ID changes)

### 9. Legacy Files (if they exist)

- `src/managers/stateManager.js` - Check if still used

## Migration Considerations

### Save File Compatibility

- **BREAKING CHANGE**: Existing save files use `actionSoundsEnabled` and `allSoundsMuted` in metadata
- Need migration function in `src/utils/migrations.js`:
  ```javascript
  function migrateTo1_X_0(state) {
    if (state.metadata.actionSoundsEnabled !== undefined) {
      state.metadata.soundsEnabled = state.metadata.actionSoundsEnabled;
      delete state.metadata.actionSoundsEnabled;
    }
    if (state.metadata.allSoundsMuted !== undefined) {
      state.metadata.allNoiseMuted = state.metadata.allSoundsMuted;
      delete state.metadata.allSoundsMuted;
    }
    return state;
  }
  ```
- Update `CURRENT_VERSION` in `package.json`

### Backward Compatibility

- None - this is a breaking change for save files
- Users will need to re-save their games after migration

## Estimated Impact

### Files Changed: ~20 files

### Lines Changed: ~500+ lines

### Breaking Changes: Yes (save file format)

### Test Updates: All 8 test files need updates

### Risk Level: Medium-High (touches core state management)

## Benefits

1. Clearer terminology: "Noise" = all audio, "Sound" = mp3 files, "Music" = YouTube
2. More intuitive naming for buttons
3. Better separation of concerns in naming

## Drawbacks

1. Large refactor touching many files
2. Breaking change for save files (requires migration)
3. All tests need updating
4. Risk of missing some references
5. Time investment significant

## Recommendation

**Consider if the naming clarity is worth the refactor cost.** The current naming works, though it's less intuitive. If proceeding:

1. Do in a feature branch
2. Update tests as you go
3. Test save file migration thoroughly
4. Consider doing in phases (manager first, then components, then tests)
