# Fight Section Testing and GameMaster Implementation Plan

## Overview

The Fight Section contains complex game logic that is currently embedded in `App.jsx`. Testing this logic will be difficult without proper separation of concerns. This is the ideal opportunity to create `GameMaster` to centralize game rules and orchestrate game actions.

**Note**: This plan focuses on Fight Section testing, but aligns with the broader GameMaster architecture outlined in `gamemaster_implementation_and_architecture_completion.md`. We'll start with fight logic, but structure GameMaster to accommodate all game actions.

**Status Update**: Since the existing plan was written:

- ✅ Trail actions (`handleTrailSubmit`, `handleTrailPillDelete`) are already handled by `MapSection` internally
- ❌ Fight actions still need to move to GameMaster
- ❌ Other actions (test luck, purchase, consume meal/potion, reset) still need to move to GameMaster

## Current State Analysis

### Fight Logic in App.jsx

**Location**: `src/App.jsx` lines ~1088-1395

**Key Functions:**

1. `checkFightEnd()` - Determines if fight ended, handles win/loss outcomes
2. `handleFight()` - Main fight attack logic (~150 lines)
3. `handleUseLuck()` - Use luck during fight (~80 lines)

**Game Rules Embedded:**

- Combat resolution: `heroTotal = heroDiceSum + heroSkill` vs `monsterTotal = monsterDiceSum + monsterSkill`
- Damage calculation: Winner deals 2 damage
- Luck test: `isLucky = sum <= currentLuck`
- Use luck effects:
  - If hero won + lucky: monster -1 damage
  - If hero won + unlucky: monster +1 health
  - If monster won + lucky: hero +1 health (capped at max)
  - If monster won + unlucky: hero -1 damage
- Fight end conditions: health <= 0
- Victory: Add to graveyard, play victory sound
- Defeat: Mark trail as died, play defeat sound, show YOU DIED

**State Management:**

- Uses `gsm` (GameStateManager) for state
- Uses `diceRollerRef` for dice rolling
- Uses `soundManagerRef` for sounds
- Uses `gameShowManagerRef` for visual feedback
- Uses React state for UI timing (`diceRollingType`, `isTestingLuck`, etc.)

### Fight Section Component

**Location**: `src/components/FightSection.jsx`

**Current Props:**

- Hero stats (read-only): `skill`, `health`, `luck`
- Monster stats: `monsterCreature`, `monsterSkill`, `monsterHealth`
- Fight state: `graveyard`, `showUseLuck`, `luckUsed`, `isFighting`, `isFightStarted`, `fightResult`, `fightOutcome`, `heroDiceRolls`, `monsterDiceRolls`, `testLuckResult`, `isTestingLuck`, `diceRollingType`, `fieldBadges`
- Callbacks: `onMonsterCreatureChange`, `onMonsterSkillChange`, `onMonsterHealthChange`, `onFight`, `onUseLuck`, `onNumberChange`

**Component Responsibilities:**

- Display hero/monster stats
- Display dice rolls
- Display fight results
- Display graveyard
- Button disabled/enabled logic
- UI state (expanded/collapsed)

## Proposed Architecture

### GameMaster (`src/managers/gameMaster.js`)

**Purpose**: Centralize all game rules and orchestrate game actions

**Dependencies:**

- `diceRoller` - For dice rolling
- `gameStateManager` - For state updates
- `gameShowManager` - For visual/audio feedback
- `soundManager` - For sound playback (via GameShowManager or direct)

**Core Game Rules (Pure Functions):**

```javascript
isLucky(rollSum, currentLuck); // rollSum <= currentLuck
canTestLuck(currentLuck); // currentLuck > 0
canFight(heroStats, monsterStats, fightState); // Validation
resolveCombat(heroTotal, monsterTotal); // Returns: 'heroWins' | 'monsterWins' | 'tie'
calculateDamage(winner); // Returns: 2
calculateLuckEffect(heroWon, isLucky, currentHealth, maxHealth); // Returns health deltas
checkFightEnd(heroHealth, monsterHealth); // Returns: 'won' | 'lost' | null
```

**Action Methods (Fight-focused for now, but extensible):**

```javascript
// Fight actions (Phase 1 - this plan)
actionFight() {
  // 1. Validate preconditions
  // 2. Roll dice for hero and monster
  // 3. Calculate totals (dice + skill)
  // 4. Resolve combat result
  // 5. Apply damage
  // 6. Update state
  // 7. Show feedback (sounds, badges)
  // 8. Check if fight ended
  // 9. Show "use luck" button if applicable
  // Returns: fight result object
}

actionUseLuck() {
  // 1. Validate preconditions
  // 2. Roll dice for luck test
  // 3. Determine if lucky
  // 4. Apply luck effect based on last fight result
  // 5. Decrement luck
  // 6. Update state
  // 7. Show feedback
  // 8. Check if fight ended
  // Returns: luck test result object
}

// Future actions (from existing plan, not in Phase 1)
// actionTestLuck() - Test your luck dice roll
// actionBuyItem(objectName, cost) - Purchase item
// actionConsumeMeal() - Consume meal to restore health
// actionConsumePotion() - Consume potion to restore stat
// actionReset() - Reset game state
// Note: Trail actions (actionNextChapter, actionDeleteChapter) are handled by MapSection
```

**State Management:**

- GameMaster reads/writes to `gameStateManager`
- GameMaster coordinates with `gameShowManager` for feedback
- GameMaster does NOT manage React UI state (that stays in App.jsx)

### Updated App.jsx

**Changes:**

1. Create `gameMasterRef` with dependencies
2. Replace `handleFight` with thin wrapper calling `gameMaster.actionFight()`
3. Replace `handleUseLuck` with thin wrapper calling `gameMaster.actionUseLuck()`
4. Remove `checkFightEnd` (moved to GameMaster)
5. Keep React UI state management (`diceRollingType`, `isTestingLuck`, etc.)
6. Keep timing/animation coordination

**Pattern:**

```javascript
const handleFight = () => {
  // UI state updates
  setDiceRollingType('fight');

  // Delegate to GameMaster
  setTimeout(() => {
    const result = gameMasterRef.current.actionFight();
    // Update UI state based on result
    setDiceRollingType(null);
  }, 1000);
};
```

### Updated FightSection

**Changes:**

- Receive `gameMaster` as prop (optional, for future direct calls)
- Keep all current props (for now, to minimize changes)
- Button disabled logic can use `gameMaster.canFight()` if needed

**Future (after refactoring):**

- FightSection could call `gameMaster.actionFight()` directly
- But for now, keep callback pattern to minimize changes

## Implementation Strategy

### Phase 1: Create GameMaster with Fight Logic

**Goal**: Extract fight logic to GameMaster, test it in isolation. Structure GameMaster to be extensible for other actions later.

**Steps:**

1. Create `src/managers/gameMaster.js` with extensible structure
2. Implement core game rules (pure functions, easy to test):
   - `isLucky(rollSum, currentLuck)` - Used by fight AND test luck
   - `canTestLuck(currentLuck)` - Used by test luck
   - `resolveCombat(heroTotal, monsterTotal)` - Fight-specific
   - `calculateDamage(winner)` - Fight-specific
   - `calculateLuckEffect(heroWon, isLucky, currentHealth, maxHealth)` - Fight-specific
   - `checkFightEnd(heroHealth, monsterHealth)` - Fight-specific
3. Implement `actionFight()` method
4. Implement `actionUseLuck()` method
5. Write unit tests for all game rules
6. Write unit tests for action methods
7. Write integration tests with mocked managers

**Note**: We're implementing fight actions first, but the structure should make it easy to add other actions later (test luck, purchase, consume meal/potion, reset).

**Files:**

- `src/managers/gameMaster.js` (new)
- `src/__tests__/managers/gameMaster.test.js` (new)

### Phase 2: Integrate GameMaster into App.jsx

**Goal**: Replace fight handlers with GameMaster calls

**Steps:**

1. Create `gameMasterRef` in App.jsx
2. Replace `handleFight` to use `gameMaster.actionFight()`
3. Replace `handleUseLuck` to use `gameMaster.actionUseLuck()`
4. Remove `checkFightEnd` from App.jsx
5. Update timing/animation coordination
6. Test that fight flow still works end-to-end

**Files:**

- `src/App.jsx` (modify)

### Phase 3: Write Fight Section Tests

**Goal**: Comprehensive test coverage for Fight Section

**Test Categories:**

1. **Component Rendering**
   - Displays hero stats correctly
   - Displays monster stats correctly
   - Displays graveyard correctly
   - Button states (disabled/enabled)

2. **Fight Flow**
   - Fight button enables when monster fields filled
   - Attack button appears after fight starts
   - Dice rolls display correctly
   - Fight results display correctly
   - Use luck button appears after attack

3. **Use Luck Flow**
   - Use luck button enables/disables correctly
   - Luck test result displays
   - Health changes display correctly
   - Badges show for damage/healing

4. **Fight End**
   - Victory message displays
   - Defeat message displays
   - Graveyard updates on victory
   - Trail marked as died on defeat

5. **Integration with GameMaster**
   - Calls GameMaster actions correctly
   - Updates state based on GameMaster results
   - Displays feedback from GameShowManager

**Files:**

- `src/__tests__/components/FightSection.test.jsx` (new)

### Phase 4: Test GameMaster Integration

**Goal**: Ensure GameMaster works correctly with real managers

**Test Categories:**

1. **Manager Coordination**
   - GameMaster calls DiceRoller correctly
   - GameMaster updates GameStateManager correctly
   - GameMaster triggers GameShowManager correctly
   - GameMaster triggers SoundManager correctly

2. **State Persistence**
   - Fight state persists correctly
   - Graveyard persists correctly
   - Monster stats persist correctly

3. **Edge Cases**
   - Fight with 0 health
   - Fight with 0 monster health
   - Use luck with 0 luck
   - Multiple attacks in sequence
   - Use luck multiple times (should be prevented)

**Files:**

- `src/__tests__/managers/gameMaster.integration.test.js` (new)

## Testing Strategy

### Unit Tests (GameMaster)

**Focus**: Game rules and logic in isolation

**Examples:**

```javascript
describe('GameMaster - Game Rules', () => {
  it('should determine if player is lucky correctly', () => {
    expect(gameMaster.isLucky(5, 10)).toBe(true);
    expect(gameMaster.isLucky(10, 10)).toBe(true);
    expect(gameMaster.isLucky(11, 10)).toBe(false);
  });

  it('should resolve combat correctly', () => {
    expect(gameMaster.resolveCombat(10, 8)).toBe('heroWins');
    expect(gameMaster.resolveCombat(8, 10)).toBe('monsterWins');
    expect(gameMaster.resolveCombat(10, 10)).toBe('tie');
  });

  it('should calculate luck effect correctly', () => {
    // Hero won + lucky = monster -1
    // Hero won + unlucky = monster +1
    // Monster won + lucky = hero +1 (capped)
    // Monster won + unlucky = hero -1
  });
});
```

### Integration Tests (GameMaster + Managers)

**Focus**: Coordination between managers

**Examples:**

```javascript
describe('GameMaster - Fight Integration', () => {
  it('should coordinate fight action correctly', () => {
    const result = gameMaster.actionFight();

    expect(mockDiceRoller.rollDiceTwo).toHaveBeenCalledTimes(2);
    expect(mockGameStateManager.setHeroDiceRolls).toHaveBeenCalled();
    expect(mockGameStateManager.setMonsterDiceRolls).toHaveBeenCalled();
    expect(mockSoundManager.playMonsterDamageSound).toHaveBeenCalled();
    expect(result.type).toBe('heroWins');
  });
});
```

### Component Tests (FightSection)

**Focus**: UI behavior and user interactions

**Examples:**

```javascript
describe('FightSection', () => {
  it('should enable fight button when monster fields are filled', () => {
    // Test button state
  });

  it('should display dice rolls after attack', () => {
    // Test dice display
  });

  it('should show use luck button after attack with winner', () => {
    // Test button visibility
  });
});
```

## Benefits of This Approach

1. **Testability**: Game rules are pure functions, easy to test
2. **Maintainability**: Game logic centralized in one place
3. **Reusability**: GameMaster can be used by other components
4. **Separation of Concerns**: UI logic separate from game logic
5. **Future-Proof**: Easy to add new game actions

## Risks and Mitigations

**Risk**: Breaking existing fight flow
**Mitigation**:

- Keep App.jsx handlers as thin wrappers initially
- Test thoroughly before removing old code
- Keep both implementations temporarily if needed

**Risk**: GameMaster becomes too complex
**Mitigation**:

- Keep game rules as pure functions
- Keep action methods focused on orchestration
- Extract complex logic to helper methods

**Risk**: Timing/animation coordination issues
**Mitigation**:

- Keep timing logic in App.jsx (React-specific)
- GameMaster returns results synchronously
- App.jsx handles async timing

## Success Criteria

1. ✅ All game rules are in GameMaster
2. ✅ All game rules have unit tests
3. ✅ Fight flow works end-to-end
4. ✅ Fight Section has comprehensive tests
5. ✅ No game logic remains in App.jsx
6. ✅ Code is more maintainable and testable

## Estimated Effort

- **Phase 1 (GameMaster)**: 4-6 hours
- **Phase 2 (Integration)**: 2-3 hours
- **Phase 3 (Fight Section Tests)**: 4-6 hours
- **Phase 4 (Integration Tests)**: 2-3 hours

**Total**: ~12-18 hours

## Alignment with Existing Plan

This plan focuses on **Fight Section testing** but aligns with the broader vision in `gamemaster_implementation_and_architecture_completion.md`:

**What we're doing now (Phase 1):**

- ✅ Create GameMaster structure
- ✅ Implement fight actions (`actionFight`, `actionUseLuck`)
- ✅ Implement fight game rules
- ✅ Test fight logic

**What comes later (from existing plan):**

- `actionTestLuck()` - Test your luck (uses `isLucky` rule we'll create)
- `actionBuyItem()` - Purchase item
- `actionConsumeMeal()` - Consume meal
- `actionConsumePotion()` - Consume potion
- `actionReset()` - Reset game state
- Trail actions are already handled by MapSection (no need to move)

**Benefits of this approach:**

- Start with the most complex logic (fight)
- Establish patterns for other actions
- Make GameMaster extensible from the start
- Can test fight section immediately after Phase 1-2

## Next Steps

1. Review and approve this plan
2. Start with Phase 1: Create GameMaster with fight logic (but structure for extensibility)
3. Write tests as we go (TDD approach)
4. Iterate and refine based on findings
5. After fight is done, other actions can follow the same pattern
