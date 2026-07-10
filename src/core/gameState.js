/**
 * Game state management for keyboard trainer.
 * Provides functions to get, set, and reset state variables.
 * @module gameState
 */

const initialState = {
  scoreRight: 0,
  scoreWrong: 0,
  totalKeystrokes: 0,
  LEVEL: 0,
  levelStatus: 0,
  levelBump: 2,
  inputSequence: [],
  currentTarget: [],
  startTime: Date.now(),
  currentRl: null,
  SEQUENCE_LENGTH: 8,
  MISSED_KEYS: {},
  currentWordLength: 3,
  WORDS_PER_LEVEL: 10,
  wordsCompletedInLevel: 0,
  currentSentence: [],
  currentWordIndex: 0,
  sentencesCompleted: 0,
  SENTENCES_PER_LEVEL: 5,
  levelStats: {},
  levelStartTimes: {},
  levelKeypresses: {},
  currentKeypressHandler: null,
  charsetOptions: {},
};

let state = JSON.parse(JSON.stringify(initialState));

/** Get the current game state */
export function getState() { return state; }
/** Set the game state (merge) */
export function setState(partial) { state = { ...state, ...partial }; }
/** Reset the game state to initial values */
export function resetState() { state = JSON.parse(JSON.stringify(initialState)); } 