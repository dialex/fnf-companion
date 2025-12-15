## Basic

- [ ] Page loads and there's no console error when the page finished loading

## Save and load file logic

- [ ] Creates yaml file
- [ ] Saves file and has the right values
- [ ] Loads file
- [ ] Loads file and overrides current state (and local storage)

## Translations logic

- [ ] User-facing strings are not hardcoded in the code
- [ ] User-facing strings are listed in a language specific json
- [ ] User-facing strings are loaded from its respective language file and then displayed to the user
- [ ] Lnaguages can be changed without a page reload
- [ ] There's a menu in the page that lets the user switch languages
- [ ] There's an entry in the menu for each Language file

## Game rules

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
