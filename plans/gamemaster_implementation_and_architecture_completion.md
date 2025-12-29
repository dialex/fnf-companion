# GameMaster Implementation and Architecture Completion

## Current Status

### ✅ Already Implemented Managers

- **DiceRoller** (`src/managers/diceRoller.js`) - Pure dice rolling logic
- **SoundManager** (`src/managers/soundManager.js`) - Sound playback
- **GameShowManager** (`src/managers/gameShowManager.jsx`) - Visual/audio feedback
- **GameStateManager** (`src/managers/gameStateManager.js`) - State management with persistence
- **i18nManager** (`src/managers/i18nManager.js`) - Translations
- **fileManager** (`src/managers/fileManager.js`) - File operations

### ❌ Missing

- **GameMaster** - Game rules orchestration (completely missing)

## Work Required

### 1. Create GameMaster (`src/managers/gameMaster.js`)

GameMaster will orchestrate all game actions by:

- Taking dependencies: `diceRoller`, `gameStateManager`, `gameShowManager`, `soundManager`
- Providing action methods that coordinate the flow:
  1. Validate action conditions
  2. Roll dice (if needed) via DiceRoller
  3. Apply game rules (e.g., `isLucky = sum <= currentLuck`)
  4. Update state via GameStateManager
  5. Show feedback via GameShowManager (which triggers sounds via SoundManager)

**Required Actions:**

- `actionTestLuck()` - Test your luck dice roll
- `actionBuyItem(objectName, cost)` - Purchase item
- `actionConsumeMeal()` - Consume meal to restore health
- `actionConsumePotion()` - Consume potion to restore stat
- `actionNextChapter(chapterNumber)` - Add chapter to trail
- `actionDeleteChapter()` - Remove last chapter from trail
- `actionFight()` - Start/continue fight round
- `actionUseLuck()` - Use luck during fight
- `actionReset()` - Reset game state (with confirmation)

**Helper Methods:**

- `isLucky(rollSum, currentLuck)` - Game rule: `rollSum <= currentLuck`
- `canTestLuck(currentLuck)` - Game rule: `currentLuck > 0`

### 2. Move Logic from App.jsx to GameMaster

**Current handlers in App.jsx that need to move:**

1. **`handleTestLuckComplete`** (line 1131)
   - Move `isLucky` calculation to `GameMaster.isLucky()`
   - Move entire flow to `GameMaster.actionTestLuck()`
   - Returns result object for FightSection

2. **`handlePurchase`** (line 1108)
   - Move to `GameMaster.actionBuyItem(objectName, cost)`
   - Handles: validation, coin deduction, inventory update, sound, badges

3. **`handleConsumeMeal`** (line 968)
   - Move to `GameMaster.actionConsumeMeal()`
   - Handles: validation, meal decrement, health increase, sound, badges

4. **`handleConsumePotion`** (line 998)
   - Move to `GameMaster.actionConsumePotion()`
   - Handles: validation, stat restoration, sound, badges, potion marking

5. **`handleTrailSubmit`** (line 270)
   - Move to `GameMaster.actionNextChapter(chapterNumber)`
   - Handles: validation, adding chapter, celebration at 400

6. **`handleTrailPillDelete`** (line 290)
   - Move to `GameMaster.actionDeleteChapter()`
   - Handles: validation, removing last chapter

7. **`handleFight`** (line 1222)
   - Move to `GameMaster.actionFight()`
   - Handles: validation, dice rolling, combat resolution, health updates, fight end check

8. **`handleUseLuck`** (line 1378)
   - Move to `GameMaster.actionUseLuck()`
   - Handles: validation, luck test, applying luck result to fight

9. **`handleReset` / `confirmReset`** (line 1034)
   - Move to `GameMaster.actionReset()` with confirmation handling
   - Orchestrates full state reset

### 3. Update App.jsx

**Changes needed:**

- Create `gameMasterRef` instance with all manager dependencies
- Replace handler functions with calls to `GameMaster` actions
- Remove business logic, keep only UI orchestration
- Pass `gameMaster` to sections that need it

**Example transformation:**

```javascript
// Before:
const handleTestLuckComplete = (rolls) => {
  const isLucky = sum <= currentLuck; // Game logic in App
  // ... more logic
};

// After:
const handleTestLuckComplete = (rolls) => {
  const result = gameMasterRef.current.actionTestLuck(rolls);
  setTestLuckResult(result); // Only UI state updates
};
```

### 4. Update Sections

**Sections that need GameMaster:**

- **DiceRollsSection** - Already delegates to GameShowManager, but `canTestLuck` should come from GameMaster
- **ConsumablesSection** - Needs GameMaster for purchase, meal, potion actions
- **MapSection** - Needs GameMaster for trail actions
- **FightSection** - Needs GameMaster for fight and use luck actions

**Pattern:**

- Sections call `gameMaster.actionX()` instead of handlers in App.jsx
- Sections still own button disabled/enabled logic
- GameMaster returns results/state that sections use for display

### 5. Resolve TODOs

**TODOs to address:**

1. Line 70: GameStateManager subscription - Keep in App.jsx (it's React integration, not game logic)
2. Line 995: Potion logic → Move to GameMaster
3. Line 1032: Reset logic → Move to GameMaster
4. Line 1101: Notification → Move to GameShowManager
5. Line 1106: Purchase logic → Move to GameMaster
6. Line 1136: isLucky logic → Move to GameMaster.isLucky()
7. Line 1398: isLucky logic → Move to GameMaster.isLucky()
8. Line 1612: canTestLuck logic → Move to GameMaster.canTestLuck()

### 6. Testing

**Required tests for GameMaster:**

- Each action method (test luck, buy item, consume meal, etc.)
- Game rules (isLucky, canTestLuck)
- Action validation (preconditions)
- Integration with other managers (verify calls to DiceRoller, GameStateManager, GameShowManager)

**Test structure:**

- Unit tests for GameMaster actions
- Integration tests verifying manager coordination
- Update existing tests that test handlers in App.jsx

## Architecture Flow After Completion

```
User clicks button
  ↓
Section (UI logic: disabled state, display)
  ↓
GameMaster.actionX() (orchestrates)
  ↓
├─ DiceRoller (if dice needed)
├─ GameStateManager (state updates)
└─ GameShowManager (feedback)
    └─ SoundManager (sounds)
```

## Files to Create/Modify

**New files:**

- `src/managers/gameMaster.js` - Main GameMaster implementation
- `src/__tests__/managers/gameMaster.test.js` - GameMaster tests

**Modify:**

- `src/App.jsx` - Remove handlers, create GameMaster, delegate to it
- `src/components/DiceRollsSection.jsx` - Use GameMaster for canTestLuck
- `src/components/ConsumablesSection.jsx` - Use GameMaster actions
- `src/components/MapSection.jsx` - Use GameMaster actions
- `src/components/FightSection.jsx` - Use GameMaster actions
- `src/managers/gameShowManager.jsx` - Add notification support (TODO line 1101)

## Estimated Complexity

- **GameMaster implementation**: Medium (8-10 action methods, game rules)
- **App.jsx refactoring**: Medium (replace ~8 handlers)
- **Section updates**: Low (change prop passing)
- **Testing**: Medium (comprehensive test coverage needed)

Total: ~15-20 action methods/logic blocks to move, ~5-6 files to modify, 1 new manager file.
