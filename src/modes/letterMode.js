/**
 * Letter mode logic for keyboard trainer.
 * @module letterMode
 */

import { resetState, getState, setState } from '../core/gameState.js';
import { showMenu } from '../ui/menu.js';
import { saveScore } from '../score/scoreManager.js';
import { updateLetterModeCharsets } from '../core/charsets.js';
import readline from 'readline';
import chalk from 'chalk';

/**
 * Start letter mode (placeholder).
 */
export function startLetterMode() {
  resetState();
  let state = getState();
  console.clear();
  console.log(chalk.bold('Letter Mode\n'));
  console.log('Press Ctrl+C to return to menu\n');
  Object.keys(state.charsetOptions).forEach(key => { state.charsetOptions[key] = false; });
  state.charsetOptions.leftHandLowercase = true;
  state.charsetOptions.rightHandLowercase = true;
  setState(state);
  startGame('letter');
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