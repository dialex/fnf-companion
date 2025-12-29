The current code is a spaguetti mess. We need to split the code in areas of responsibility.

## DiceRoller

- Knows how to roll dice
- export rollDiceOne(), returns a integer, 1 to 6, equivalent as rolling one die
- export rollDiceTwo(), returns two integers and their sum, equivalent as rolling two dice
- Pure logic only - no display, no UI concerns
- Can be instantiated and used independently
- Returns dice roll results, nothing more

## GameShowManager

- Responsible for all visual/audio feedback to the user
- Knows how to display dice roll animations (in progress)
- Knows how to display dice roll results
- Knows how to show field update badges (e.g., "+5 health", "-1 meal")
- Knows how to show test result messages (e.g., "You were lucky", "You failed")
- Knows when to trigger sounds via SoundManager (e.g., lucky sound on success)
- Uses a subscribe pattern (similar to fieldBadges) to notify React components of display state changes
- Components subscribe to GameShowManager to get display state (dice rolling, results, badges, messages)
- Separates "what happened" (game logic) from "how to show it" (display logic)

## SoundManager

- Knows how to play sounds, local mp3 files
- Knows how to play youtube tracks in the internet
- Knows how to play a range of specific sounds (lucky sound, attack sound, consume meal sound, etc.)
- Has access to game state to know if sound is muted or not
- Has access to game state to know if actionSounds are muted or not
- Called by GameShowManager when sounds should play

## Section

- Each section of the page knows how to display the elements of its own section
- Subscribes to GameShowManager for display state (dice, badges, messages)
- Owns button display and disabled logic
- Handles user interactions (button clicks) and delegates to appropriate managers

## GameStateManager

- Keeps track of current game states, game variables
- Knows the default values of a new game state
- Knows how to update the game state, e.g. updateHealth(+4), updateMeals(-1), updateLuck(-1)
- Knows how to persist the game state
  - Knows how to save the current game state to local storage
  - Knows how to load the current game state to local storage
  - Knows how to save the current game state into a yaml file
  - Knows how to load the current game state from a yaml file

## GameMaster

- Knows the game rules and actions
- Orchestrates the various steps of an action, triggering diff effects in a specific order
- actionTestLuck, actionBuyItem, actionConsumeMeal, actionNextChapter, actionDeleteChapter, etc.
  - Will trigger a dice roll, using DiceRoller
  - Will trigger a game state update, using GameState
  - Will trigger visual/audio feedback, using GameShowManager
  - GameShowManager will then decide to play sounds via SoundManager if needed
- Pure business logic - no UI concerns

## App

- Should have very little logic, and just serves to group and instantiate all these focused components that each have their job and responsibility
- Creates instances of managers (DiceRoller, GameShowManager, GameStateManager, GameMaster, SoundManager)
- Passes managers to sections/components that need them
- More components, helpers, etc. can be created. The goal is to:
  - have clean tests
  - have smaller files
  - have related code together
  - boundaries and responsibilities are clearly defined and handed over between components
