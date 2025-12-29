## Basic

- [ ] Page loads and there's no console error when the page finished loading

## Map Section (`src/components/MapSection.jsx`)

- [x] There's a field to type a chapter number
- [x] Chapter number must be a number between 1 and 400
- [x] Trail always starts with the number 1
- [x] Trail numbers are displayed using badges, from left to right, one after another. They have a color based on their meaning.
- [x] Trail numbers can be tagged using a button group with 6 diff meanings: Normal, Choyce, Good, Bad, Important, and Died
- [x] When the last trail number is clicked it is removed from the trail (this is used when the user added one by mistake)
- [x] When the died button is clicked it displays a special "YOU DIED" animation (tested in GameShowManager)
- [x] If the user submits chapter 400, then it triggers a special "confetti" animation and marks the chapter as Important (yellow) (confetti tested in GameShowManager - note: Important marking not yet implemented)
- [x] Trail is part of the game state, so it's persisted between refreshes and load games (tested in gameStateManager tests)
- Refactor convertColorToNote: (color)

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
  - Read only text field
  - Starts empty by default at the start of a game
  - Whenever a monster is defeat, a new entry is added to the bottom of the list
  - Each entry says "Defeated <name of monster>" and the first part of the string is i18n
- Music switching
  - When battle music starts, the previously playing ambience music must stop. The system must remember which ambience music was playing.
  - When player moves on from battle, ie starts typing a new number in the trail section, the ambience music that was playing before the the battle must automatically resume
  - Custom music follows the same rules as ambience rules (can be interrupted by battle, resumes after)

## Last touches

- Fix comments like // Kept for backward compatibility
- Fix todos
- [ ] Calculate test coverage, to see if we missed any spots
- [ ] Run other code quality metrics, maybe complexity?, to look for refactor opportunities
- [ ] Run tests as part of the GitHub pipeline

## 📝 Notes

- Focus on **unit tests** (pure functions) first
- Add **integration tests** for state management
- Keep tests **simple and focused** - one concept per test
- Test **behavior, not implementation**
- Let the **tests improve the code**, we might need to refactor our code to simplify our tests
- Use **descriptive test names** that explain what's being tested
