# Test Plan

This document tracks what needs to be tested. We'll work through it incrementally, starting with the simplest tests first.

## 🔄 State Management (Medium)

These involve state objects and persistence logic.

### `src/utils/stateManager.js`

- [ ] Test `getDefaultState` - returns correct default values
- [ ] Test `buildStateObject` - builds state from current values
- [ ] Test `loadState` - loads and merges saved state
- [ ] Test `saveState` - saves state to localStorage
- [ ] Test `applyLoadedState` - applies loaded state to setters
- [ ] Test state merging (saved state + defaults)
- [ ] Test handling of missing/corrupted saved state

### `src/utils/migrations.js`

- [ ] Test `migrateState` - migrates old state format to new
- [ ] Test migration from version 1.0.0 to current
- [ ] Test that current version state doesn't get migrated
- [ ] Test handling of unknown versions

## 🎲 Game Logic (Medium-Hard)

These test the core game mechanics.

### Fight System (`src/App.jsx` - fight logic)

- [ ] Test `checkFightEnd` - detects when fight ends (hero wins/loses)
- [ ] Test fight attack calculations (hero wins, monster wins, tie)
- [ ] Test health updates on damage
- [ ] Test luck usage in fights
- [ ] Test fight outcome states

### Dice Rolling in Context

- [ ] Test skill test calculations
- [ ] Test luck test calculations
- [ ] Test dice roll results affect game state correctly

## 🎵 Sound Management (Hard)

These involve YouTube API and async operations.

### Sound Logic (`src/App.jsx` - sound management)

- [ ] Test sound URL validation
- [ ] Test sound volume updates
- [ ] Test sound play/pause/stop logic
- [ ] Test custom sound management
- [ ] Test pre-battle sound tracking
- [ ] Test sound resumption after battle

## 🎨 UI/Theme (Medium)

### `src/utils/theme.js`

- [ ] Test theme switching (light/dark)
- [ ] Test theme persistence
- [ ] Test `getFilteredThemes` - filters based on palette variants

### `src/utils/palette.js`

- [ ] Test palette discovery
- [ ] Test palette loading
- [ ] Test palette variant detection
- [ ] Test palette persistence

## 📝 Notes

- Focus on **unit tests** (pure functions) first
- Add **integration tests** for state management
- Keep tests **simple and focused** - one concept per test
- Test **behavior, not implementation**
- Let the **tests improve the code**, we might need to refactor our code to simplify our tests
- Use **descriptive test names** that explain what's being tested
