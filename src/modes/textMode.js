/**
 * Text mode logic for keyboard trainer.
 * @module textMode
 */

import { resetState, getState, setState } from '../core/gameState.js';
import { showMenu } from '../ui/menu.js';
import { saveScore } from '../score/scoreManager.js';
import readline from 'readline';
import chalk from 'chalk';
import { generate } from 'random-words';

/**
 * Start text mode (placeholder).
 */
export function startTextMode() {
  resetState();
  let state = getState();
  console.clear();
  console.log(chalk.bold('Text Mode\n'));
  console.log('Press Ctrl+C to return to menu, Ctrl+S for settings\n');
  state.currentWordLength = 3;
  state.sentencesCompleted = 0;
  state.currentSentence = generateNewSentence(state.currentWordLength);
  state.currentTarget = state.currentSentence.join(' ').split('');
  setState(state);
  startGame('text');
}

function generateNewSentence(wordLength) {
  return generate({ exactly: 10, minLength: wordLength, maxLength: wordLength });
}

function startGame(mode) {
  let state = getState();
  if (state.currentKeypressHandler) {
    process.stdin.removeListener('keypress', state.currentKeypressHandler);
    setState({ currentKeypressHandler: null });
  }
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  readline.emitKeypressEvents(process.stdin);
  startNewRound(mode);
  const handler = (str, key) => {
    if (key.ctrl && key.name === 'c') {
      process.stdin.removeListener('keypress', handler);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      if (state.totalKeystrokes > 0) saveScore(mode);
      console.clear();
      showMenu();
      return;
    }
    // Add more key handling as needed...
  };
  setState({ currentKeypressHandler: handler });
  process.stdin.on('keypress', handler);
}

function startNewRound(mode) {
  // TODO: Implement round logic, update state, and call display functions
} 