## Basic

- [ ] Page loads and there's no console error when the page finished loading

## Consumables Section (`src/components/ConsumablesSection.jsx`)

- [ ] Coins can be updated and start with 0 by default
- [ ] Meals can be updated and start with 10 by default
- Trade button
  - [ ] User can type the name of an item and its cost
  - [ ] If the user has enough gold to pay the cost, then the buy button is enabled
  - [ ] When the buy button is clicked, the field is cleared, the name of the item is appended to the bottom of the inventory list, and the cost is deducted from the coins amount
  - [ ] When an item is bought, it plays a purchase sound
- Potion button
  - [ ] If stats are locked there's a potion field visible
  - [ ] The user can chose from 3 types of potions
  - [ ] Each potion will restore that trait to its max value when used (drinked)
  - [ ] Use potion button is disabled if the respective stat is already maxed
  - [ ] When potion is used, the potion cannot be changed or used again
  - [ ] When potion is used, it plays a drink sound
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
