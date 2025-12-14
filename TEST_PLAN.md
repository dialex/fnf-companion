# Test Plan

Tracks what needs to be tested, starting with the simplest tests first.

## 🎲 Game Logic (Medium-Hard)

These test the core game mechanics.

### Save and load file logic

- Creates yaml file
- Saves file and has the right values
- Loads file
- Loads file and overrides current state (and local storage)

### Dice Rolling in Context

- [x] Test skill test calculations
- [x] Test luck test calculations
- [x] Test dice roll results affect game state correctly
- [ ] Test that action sounds manager is called when luck test is successful
  - TODO: This test is pending until we simplify/extract the dice roll handler logic out of App.jsx
  - The current handler has too many dependencies to test easily
  - Once handlers are extracted to separate functions, we can test the integration properly

### Fight System (`src/App.jsx` - fight logic)

- [ ] Test `checkFightEnd` - detects when fight ends (hero wins/loses)
- [ ] Test fight attack calculations (hero wins, monster wins, tie)
- [ ] Test health updates on damage
- [ ] Test luck usage in fights
- [ ] Test fight outcome states

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
