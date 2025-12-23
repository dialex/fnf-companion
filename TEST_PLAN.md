## Basic

- [ ] Page loads and there's no console error when the page finished loading

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
  - Read only text field
  - Starts empty by default at the start of a game
  - Whenever a monster is defeat, a new entry is added to the bottom of the list
  - Each entry says "Defeated <name of monster>" and the first part of the string is i18n
- Music switching
  - When battle music starts, the previously playing ambience music must stop. The system must remember which ambience music was playing.
  - When player moves on from battle, ie starts typing a new number in the trail section, the ambience music that was playing before the the battle must automatically resume
  - Custom music follows the same rules as ambience rules (can be interrupted by battle, resumes after)

### SoundManager - Sounds vs Music

**Distinction:**

- **Sounds**: Built-in local mp3 files that can play at any time, even without internet connection. Multiple sounds can play simultaneously.
- **Music**: YouTube URLs that require internet connection. Only one music track can play at a time.

### SoundManager - Music (YouTube tracks)

**Music Exclusivity:**

- [ ] Only one music track can play at a time
- [ ] When a new music track starts, any currently playing music is paused automatically
- [ ] This applies to all music types: ambience, battle, victory, defeat, and custom music

**Music Control Buttons:**

**Master Sound Control:**

- [ ] Master sound button controls ALL sounds AND ALL music
- [ ] When master sound is muted, no sounds play and no music plays
- [ ] When master sound is unmuted, sounds and music can play (subject to other settings)

**Action Sounds Control:**

- [ ] Action sounds button only affects built-in sounds (mp3 files)
- [ ] When action sounds are enabled, built-in sounds play when triggered
- [ ] When action sounds are disabled, built-in sounds do NOT play when triggered
- [ ] Action sounds setting does NOT affect music playback
- [ ] Music can still play even when action sounds are disabled

**Music URL Validation:**

- [ ] Test YouTube URL validation
- [ ] Invalid URLs show error messages
- [ ] Valid URLs initialize YouTube player

**Music Volume Control:**

- [ ] Test volume updates for each music track
- [ ] Volume changes persist across play/pause cycles
- [ ] Volume respects master mute setting
- [ ] Volume persists on page refresh
- [ ] Volume persists on game save and load

## Last touches

- [ ] Run tests as part of the GitHub pipeline

## 📝 Notes

- Focus on **unit tests** (pure functions) first
- Add **integration tests** for state management
- Keep tests **simple and focused** - one concept per test
- Test **behavior, not implementation**
- Let the **tests improve the code**, we might need to refactor our code to simplify our tests
- Use **descriptive test names** that explain what's being tested
