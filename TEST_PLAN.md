## Basic

- [ ] Page loads and there's no console error when the page finished loading

## Consumables Section (`src/components/ConsumablesSection.jsx`)

- [ ] All player-facing text is translated

## Inventory Section (`src/components/InventorySection.jsx`)

- [x] Inventory items can be edited (free text field)
- [x] Inventory is saved to state (local and file)
- [x] All player-facing text is translated

## Notes Section (`src/components/NotesSection.jsx`)

- [x] Notes section uses a special font (handwritten style)
- [x] Notes can be edited
- [x] Notes are saved to state and file
- [x] All player-facing text is translated

## Confirmation Dialog (`src/components/ConfirmationDialog.jsx`)

- [ ] Dialog displays messages correctly
- [ ] Confirm/cancel actions work
- [ ] All player-facing text is translated

## Map Section (`src/components/MapSection.jsx`)

- [ ] Trail sequence can be updated
- [ ] Trail annotations work
- [ ] Trail is saved to state
- [ ] All player-facing text is translated

## Fight Section (`src/components/FightSection.jsx`)

- All the fight rules are part of the GameMaster
- All the visual and sound effects are part of the GameShowManager
- Player stats
  - Current player stats are displayed in this section
  - The player can edit the stats here, the same way as in Character section
- Monster stats
  - Monster has a name, health and skill
  - When the player starts typing the monster's name, the battle music starts (GameShowMaster)
- Fight (before)
  - Fight button is disabled by default
  - If the monster has all fields filled then the fight button is enabled
- Fight (during)
  - If the fight started, the button "Fight" changes to say "Attack"
  - Whenever player does an attack
    - the attack button displays the roll animation and two dice are rolled for the player and another 2 for the monster
    - The dice roll is displayed and the player dice have a diff color from the monsters dice
    - The result of the attack is as follows:
    - player's roll + players's skill > monster's roll + monster's skill = player wins the attack
    - player's roll + players's skill < monster's roll + monster's skill = player loses the attack
    - player's roll + players's skill = monster's roll + monster's skill = it's a tie
  - to resolve the result of an attack:
    - if player wins, monster takes 2 damage, GSM displays sound and badge
    - if player loses, player takes 2 damage, GSM displays sound and badge
    - if it's a tie, GSM displays a neutral message
  - After an attack finishes, a button "Use luck" is displayed
    - This triggers a usual test your luck roll
    - If the player won the attack, the use luck can be used as follows:
      - If player is lucky, the monster takes 1 extra damage
      - Otherwise, the monster recovers 1 damage
    - If the monster won the attack, the use luck can be used as follows:
      - If player is lucky, the player recovers 1 health
      - Otherwise, the player takes 1 extra damage
  - Whenever the player does damage, GSM plays a sound and displays a badge
  - Whenever the player suffers damage, GSM plays a sound and displays a badge
- Fight (after)
  - If the player's health reaches 0
    - Mark the current trail as Died
    - GSM plays the Defeat music
    - GSM triggers the YOU DIED screen animation
  - If the monster's health reaches 0
    - GSM plays the Victory music
    - GSM appends the name of the monster to the bottom of the graveyard
- Graveyard

- [ ] Fight System (`src/App.jsx` - fight logic)
  - Fight logic needs to go into the new GameMaster
  - [ ] Test `checkFightEnd` - detects when fight ends (hero wins/loses)
  - [ ] Test fight attack calculations (hero wins, monster wins, tie)
  - [ ] Test health updates on damage
  - [ ] Test luck usage in fights
  - [ ] Test fight outcome states
- [ ] Monster stats can be set
- [ ] Fight actions work correctly
- [ ] All player-facing text is translated

## Notification Banner (`src/components/NotificationBanner.jsx`)

- [ ] Banner displays messages correctly
- [ ] Banner can be dismissed
- [ ] All player-facing text is translated

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
- When the player changes palette, the changes take immediate effect, without the need for a hard page refresh

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
