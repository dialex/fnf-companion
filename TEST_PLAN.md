## Basic

- [ ] Page loads and there's no console error when the page finished loading

## Header Section (`src/components/Header.jsx`)

- [ ] Language menu shows available language options
- [ ] Clicking a language option updates all text on the page without reload
- [ ] Language preference persists after page reload
- [ ] Theme toggle switches between light/dark themes
- [ ] Theme preference persists after page reload
- [ ] Palette menu shows available palettes
- [ ] Palette changes take immediate effect without page reload

## Footer Section (`src/components/Footer.jsx`)

- [ ] Footer displays correctly
- [ ] Footer content is translated

## Game Section (`src/components/GameSection.jsx`)

- [ ] Save and load file logic
  - [ ] Creates yaml file
  - [ ] Saves file and has the right values
  - [ ] Loads file
  - [ ] Loads file and overrides current state (and local storage)
- [ ] Reset game functionality
- [ ] All user-facing text is translated

## Character Section (`src/components/CharacterSection.jsx`)

- [ ] Character stats can be edited
- [ ] Character stats are saved to state
- [ ] Lock/unlock functionality works
- [ ] Max values are enforced
- [ ] All user-facing text is translated

## Consumables Section (`src/components/ConsumablesSection.jsx`)

- [ ] Coins can be updated
- [ ] Meals can be updated
- [ ] Transaction logic works
- [ ] Potion usage works
- [ ] All user-facing text is translated

## Dice Rolls Section (`src/components/DiceRollsSection.jsx`)

- [x] Roll one die functionality
- [x] Roll two dice functionality
- [x] Test luck functionality
- [x] Buttons are disabled during rolls
- [x] Luck test button is disabled when luck is 0
- [x] Dice results are displayed correctly
- [x] Luck test messages are displayed with correct styling
- [ ] All user-facing text is translated

## Inventory Section (`src/components/InventorySection.jsx`)

- [ ] Inventory items can be added
- [ ] Inventory items can be removed
- [ ] Inventory is saved to state
- [ ] All user-facing text is translated

## Map Section (`src/components/MapSection.jsx`)

- [ ] Trail sequence can be updated
- [ ] Trail annotations work
- [ ] Trail is saved to state
- [ ] All user-facing text is translated

## Fight Section (`src/components/FightSection.jsx`)

- [ ] Fight System (`src/App.jsx` - fight logic)
  - [ ] Test `checkFightEnd` - detects when fight ends (hero wins/loses)
  - [ ] Test fight attack calculations (hero wins, monster wins, tie)
  - [ ] Test health updates on damage
  - [ ] Test luck usage in fights
  - [ ] Test fight outcome states
- [ ] Monster stats can be set
- [ ] Fight actions work correctly
- [ ] All user-facing text is translated

## Notes Section (`src/components/NotesSection.jsx`)

- [ ] Notes can be edited
- [ ] Notes are saved to state
- [ ] All user-facing text is translated

## Notification Banner (`src/components/NotificationBanner.jsx`)

- [ ] Banner displays messages correctly
- [ ] Banner can be dismissed
- [ ] All user-facing text is translated

## Confirmation Dialog (`src/components/ConfirmationDialog.jsx`)

- [ ] Dialog displays messages correctly
- [ ] Confirm/cancel actions work
- [ ] All user-facing text is translated

## Translations logic

- [x] User-facing strings are not hardcoded in the code
- [x] User-facing strings are listed in a language specific json
- [x] User-facing strings are loaded from its respective language file and then displayed to the user
- [x] Languages can be changed without a page reload
- [x] There's a menu in the page that lets the user switch languages
- [x] There's an entry in the menu for each Language file

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

- Reads css file with palette settings
- Validates css file before applying its values
- If file only contains a light theme, it should use that, update the light/dark button state to show the light icon, and disable it
- If file only contains a dark theme, it should use that, update the light/dark button state to show the dark icon, and disable it
- It should have one default css
- It should display one entry in the palette menu per theme file available
- Dashes in the filename should display as spaces in the palette menu
- When the user changes palette, the changes take immediate effect, without the need for a hard page refresh

### `src/utils/theme.js`

- [ ] Test theme switching (light/dark)
- [ ] Test theme persistence
- [ ] Test `getFilteredThemes` - filters based on palette variants

### `src/utils/palette.js`

- [ ] Test palette discovery
- [ ] Test palette loading
- [ ] Test palette variant detection
- [ ] Test palette persistence

## Last touches

- [ ] Run tests as part of the GitHub pipeline

## 📝 Notes

- Focus on **unit tests** (pure functions) first
- Add **integration tests** for state management
- Keep tests **simple and focused** - one concept per test
- Test **behavior, not implementation**
- Let the **tests improve the code**, we might need to refactor our code to simplify our tests
- Use **descriptive test names** that explain what's being tested
