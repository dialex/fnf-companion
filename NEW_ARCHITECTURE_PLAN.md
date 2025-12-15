The current code is a spaguetti mess. We need to split the code in areas of responsibility.

## DiceRoller

- Knows how to roll dice
- export rollDiceOne(), returns a integer, 1 to 6, equivalent as rolling one die
- export rollDiceTwo(), returns two integers and their sum, equivalent as rolling two dice
- Knows how to display the result of a dice roll (for one or two dice), e.g. displayRollResult()
- Knows how to display the animation of a dice roll in progress, e.g. displayRollProgress()

## NoiseBox

- Knows how to play sounds, local mp3 files
- Knows how to play youtube tracks in the internet
- Knows how to play a range of specific sounds (lucky sound, attack sound, consume meal sound, etc.)
- Has access to game state to know if sound is muted or not
- Has access to game state to know if actionSounds are muted or not

## Section

- Each section of the page knows how to display the elements of its own section

## GameState

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
  - Will trigger playing a sound, using NoiseBox
  - Will trigger a game state update, using GameState
  - Will trigger a new dice roll, using DiceRoller
  - etc.

## App

- Should have very little logic, and just serves to group and instantiate all these focused components that each have their job and responsibility
- More components, helpers, etc. can be created. The goal is to:
  - have clean tests
  - have smaller files
  - have related code together
  - boundaries and responsibilities are clearly defined and handed over between components
