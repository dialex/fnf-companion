# Agent Context - FNF Companion Refactoring

## Current Status (Latest Session)

**Date**: Current refactoring session focused on:
- Migrating from singleton translation system to React Context pattern
- Removing `src/translations/index.js` (old singleton wrapper)
- All components now use `I18nContext` with `useT()` hook

## Architecture Overview

See `NEW_ARCHITECTURE_PLAN.md` for full details. Current target architecture:

### Implemented Managers

1. **DiceRoller** (`src/managers/diceRoller.js`)
   - Pure dice rolling logic: `rollDiceOne()`, `rollDiceTwo()`
   - Provides `getDiceIcon()` for dice display
   - No UI concerns, no state

2. **SoundManager** (`src/managers/soundManager.js`)
   - `playLocalSound(file, gameState)` - handles mute checks
   - `playLuckySound(gameState)` - plays lucky sound
   - Checks `allSoundsMuted` and `actionSoundsEnabled` from gameState

3. **GameShowManager** (`src/managers/gameShowManager.jsx`)
   - Manages all visual/audio feedback
   - Subscribe pattern for React components
   - Returns JSX elements directly (Bootstrap alerts, etc.)
   - Methods:
     - `showDiceRolling(diceCount)` - 1 or 2 dice
     - `showDiceResult(result)` - displays result
     - `showLuckTestResult(isLucky, gameState)` - shows message + plays sound
   - Requires `i18nManager` and `soundManager` as dependencies

4. **i18nManager** (`src/managers/i18nManager.js`)
   - Translation management: `t(key)`, `setLanguage(lang)`, `getCurrentLanguage()`
   - Validates translations across languages
   - Persists language preference to localStorage
   - Provides `getAvailableLanguages()`

### React Context

- **I18nContext** (`src/contexts/I18nContext.jsx`)
  - `I18nProvider` - wraps app, provides i18nManager instance
  - `useI18n()` - gets i18nManager from context
  - `useT()` - gets translation function `t()` from context

### Not Yet Implemented

- **GameStateManager** - state management, persistence (localStorage, YAML)
- **GameMaster** - orchestrates game rules and actions

## Component Status

All components migrated to use `I18nContext`:
- `App.jsx` - creates `i18nManagerRef`, wraps `AppContent` with `I18nProvider`
- `AppContent` - uses `useT()` from context
- `DiceRollsSection.jsx` - uses `useT()`, manages own `DiceRoller` instance
- `Header.jsx`, `CharacterSection.jsx`, `ConsumablesSection.jsx`, `FightSection.jsx`, `GameSection.jsx`, `InventorySection.jsx`, `MapSection.jsx`, `NotesSection.jsx`, `ConfirmationDialog.jsx`, `NotificationBanner.jsx` - all use `useT()`

## Key Patterns & Decisions

### Testing (TDD Approach)
1. Write test first, then implement
2. Test descriptions focus on **behavior**, not implementation
3. Tests must verify **real behavior** - break code to confirm test fails
4. Prefer real code over mocks (only mock external APIs, timers)
5. Avoid "dummy tests" that pass even when code is broken

### Component Responsibilities
- **Sections** (e.g., `DiceRollsSection`):
  - Own button display/disabled logic
  - Subscribe to `GameShowManager` for display state
  - Delegate actions to managers (DiceRoller, GameShowManager)
  - Render JSX from GameShowManager directly

- **App.jsx**:
  - Creates manager instances (diceRollerRef, soundManagerRef, gameShowManagerRef, i18nManagerRef)
  - Passes managers to components
  - Minimal logic, mostly orchestration

### Translation System
- **Old**: Singleton in `src/translations/index.js` (REMOVED)
- **New**: React Context pattern with `I18nContext`
- All user-facing text in `src/translations/en.json` and `src/translations/pt.json`
- Use `useT()` hook in components: `const t = useT(); t('key')`

### Dice Rolling Flow
1. User clicks button in `DiceRollsSection`
2. Section calls `diceRoller.rollDiceOne()` or `rollDiceTwo()`
3. Section calls `gameShowManager.showDiceRolling(count)`
4. After roll completes, section calls `gameShowManager.showDiceResult(result)`
5. For luck tests: `gameShowManager.showLuckTestResult(isLucky, gameState)`
6. GameShowManager returns JSX for display, triggers sounds via SoundManager

## Important Files

### Managers
- `src/managers/diceRoller.js` - dice rolling logic
- `src/managers/soundManager.js` - sound playing
- `src/managers/gameShowManager.jsx` - visual/audio feedback (JSX)
- `src/managers/i18nManager.js` - translations

### Context
- `src/contexts/I18nContext.jsx` - i18n React Context

### Components
- `src/components/DiceRollsSection.jsx` - dice rolling UI
- `src/components/DiceDisplay.jsx` - displays dice animation/results
- `src/App.jsx` - main app, creates managers, wraps with providers

### Tests
- `src/__tests__/managers/diceRoller.test.js` - dice rolling tests
- `src/__tests__/managers/soundManager.test.js` - sound tests
- `src/__tests__/managers/gameShowManager.test.js` - display logic tests
- `src/__tests__/managers/i18nManager.test.jsx` - translation tests
- `src/__tests__/components/DiceRollsSection.test.jsx` - component tests
- `src/__tests__/components/App.smoke.test.jsx` - basic render test

## Pending Tasks

1. **TEST_PLAN.md** - Edit to have a bullet point for each section of the page
2. **Header language menu** - Add tests for language switching behavior (shows options, updates text without reload)
3. **GameMaster** - Implement game rules orchestration (luck test logic, etc.)
4. **GameStateManager** - Implement state management and persistence
5. **canTestLuck logic** - Move from `App.jsx` to `GameMaster` (TODO in App.jsx)

## Known Issues / TODOs

- `App.jsx` has TODO: move `canTestLuck` logic to `GameMaster` once it's created
- Some tests are skipped (see `TEST_PLAN.md` for details)

## Commit Conventions

- Conventional commits: `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`
- Messages lowercase, 80 chars or less
- "c" means commit

## Rules (.cursorrules)

Key rules:
- Be extremely concise
- TDD: write test first
- Test behavior, not implementation
- Verify tests catch real failures
- All user-facing text must be translated
- Save file structure changes require migrations

## Recent Changes (This Session)

1. ✅ Removed `src/translations/index.js` (old singleton wrapper)
2. ✅ All components use `I18nContext` with `useT()`
3. ✅ `GameShowManager` returns JSX directly (Bootstrap alerts)
4. ✅ Luck test message persists until new roll starts
5. ✅ `i18nManager` fully integrated with `GameShowManager`

## Next Steps

1. Edit `TEST_PLAN.md` to have bullet points for each page section
2. Add tests for Header language menu behavior
3. Continue with GameMaster/GameStateManager implementation per architecture plan
