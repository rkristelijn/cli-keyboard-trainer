#!/usr/bin/env node

import readline from 'readline';
import chalk from 'chalk';
import { generate } from 'random-words';

// Character sets and constants
const lowercase = 'abcdefghijklmnopqrstuvwxyz';
const uppercase = lowercase.toUpperCase();
const numbers = '1234567890';
const curlies = '()[]{}<>';
const arrows = '↑↓←→';
const math = '+-*/%=';
const punctuation = ',.;:!?';
const quotes = '"\'`';
const pathChars = ['/', '\\', '_', '|', '~'];
const symbols = '@#$%^&';
const whitespace = ['␣', '⇥', '⏎']; // Space, Tab, Enter
const backspace = '⌫';
const del = '⌦';
const homeend = ['↖', '↘'];
const pageUpDown = ['⇞', '⇟'];
const escape = '⎋';
const functionKeys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];
const shiftKeys = ['⇧L', '⇧R']; // Left and Right shift keys

// Key mapping
const keyMap = {
  '\x1b[A': '↑',    // Up arrow
  '\x1b[B': '↓',    // Down arrow
  '\x1b[D': '←',    // Left arrow
  '\x1b[C': '→',    // Right arrow
  ' ': '␣',
  '\t': '⇥',
  '\r': '⏎',
  '\x7f': '⌫',
  '\x1b[3~': '⌦',
  '\x1b[H': '⇱',
  '\x1b[F': '⇲',
  '\x1b[5~': '⇞',
  '\x1b[6~': '⇟',
  '\x1b': '⎋',
  '\x1b[11~': 'F1',
  '\x1b[12~': 'F2',
  '\x1b[13~': 'F3',
  '\x1b[14~': 'F4',
  '\x1b[15~': 'F5',
  '\x1b[17~': 'F6',
  '\x1b[18~': 'F7',
  '\x1b[19~': 'F8',
  '\x1b[20~': 'F9',
  '\x1b[21~': 'F10',
  '\x1b[23~': 'F11',
  '\x1b[24~': 'F12',
  '\x1b[1;2': '⇧L', // Left shift
  '\x1b[1;2': '⇧R', // Right shift
  '\x1bOP': 'F1',
  '\x1bOQ': 'F2',
  '\x1bOR': 'F3',
  '\x1bOS': 'F4',
  '\x1b[15~': 'F5',
  '\x1b[17~': 'F6',
  '\x1b[18~': 'F7',
  '\x1b[19~': 'F8',
  '\x1b[20~': 'F9',
  '\x1b[21~': 'F10',
  '\x1b[23~': 'F11',
  '\x1b[24~': 'F12',
};

// Global state
let scoreRight = 0;
let scoreWrong = 0;
let totalKeystrokes = 0;
let LEVEL = 0;
let levelStatus = 0;
let levelBump = 10;
let inputSequence = [];
let currentTarget = [];
let startTime = Date.now();
let currentRl = null;
const SEQUENCE_LENGTH = 8;
const MISSED_KEYS = {};

// Settings
const charsetOptions = {
  lowercase: true,
  uppercase: false,
  numbers: false,
  curlies: false,
  arrows: false,
  math: false,
  punctuation: false,
  quotes: false,
  pathChars: false,
  symbols: false,
  whitespace: false,
  backspace: false,
  del: false,
  functionKeys: false,
  shiftKeys: false,
  crossShift: false
};

// Add shift state tracking
let leftShiftPressed = false;
let rightShiftPressed = false;

// Define which characters should use which shift key
const leftShiftChars = new Set('QWERTASDFGZXCVB!@#$%');
const rightShiftChars = new Set('YUIOPHJKLNM^&*()_+');

// Keep track of current game handler
let currentKeypressHandler = null;

// Add text mode specific state
let currentWordLength = 3; // Start with 3-letter words
const WORDS_PER_LEVEL = 10; // Number of words to complete before level up
let wordsCompletedInLevel = 0;

// Add these state variables at the top level
let currentSentence = [];
let currentWordIndex = 0;
let sentencesCompleted = 0;
const SENTENCES_PER_LEVEL = 5;  // Complete 5 sentences before level up (was 10)

// Utility functions
function getRandomSequence(level, sequenceLength) {
  const currentCharset = getCharsetForLevel(level + 1);
  return Array.from({ length: sequenceLength }, () => currentCharset[Math.floor(Math.random() * currentCharset.length)]);
}

function getCharsetForLevel(level) {
  let chars = [];
  
  if (charsetOptions.lowercase) chars.push(...lowercase);
  if (charsetOptions.uppercase) chars.push(...uppercase);
  if (charsetOptions.numbers) chars.push(...numbers);
  if (charsetOptions.curlies) chars.push(...curlies);
  if (charsetOptions.arrows) chars.push(...arrows);
  if (charsetOptions.math) chars.push(...math);
  if (charsetOptions.punctuation) chars.push(...punctuation);
  if (charsetOptions.quotes) chars.push(...quotes);
  if (charsetOptions.pathChars) chars.push(...pathChars);
  if (charsetOptions.symbols) chars.push(...symbols);
  if (charsetOptions.whitespace) chars.push(...whitespace);
  if (charsetOptions.backspace) chars.push(backspace);
  if (charsetOptions.del) chars.push(del);
  if (charsetOptions.functionKeys) chars.push(...functionKeys);

  // If no character sets are enabled, default to lowercase
  if (chars.length === 0) {
    chars.push(...lowercase);
    charsetOptions.lowercase = true;
  }

  return chars;
}

function printStatus(mode) {
  const accuracy = totalKeystrokes === 0 ? 0 : Math.round((scoreRight / totalKeystrokes) * 100);
  const elapsedMs = Date.now() - startTime;
  const elapsedMin = elapsedMs / 1000 / 60;
  const kpm = Math.round(totalKeystrokes / elapsedMin);

  const levelInfo = mode === 'text' 
    ? `Word Length: [${chalk.red(currentWordLength)}] Progress: [${chalk.blue(sentencesCompleted)}/${SENTENCES_PER_LEVEL}]` 
    : `Level: [${chalk.red(LEVEL)}] levelStatus: [${chalk.blueBright(levelStatus + '/' + levelBump)}]`;

  console.log(
    'right: [' + chalk.green(scoreRight) + '] ' +
    'typos: [' + chalk.red(scoreWrong) + '] ' +
    'KPM: [' + chalk.cyan(kpm) + '] ' +
    'Accuracy: [' + chalk.yellow(accuracy + '%') + '] ' +
    levelInfo + ' ' +
    'Total Time: [' + chalk.magenta(elapsedMin.toFixed(2) + ' min') + ']'
  );
}

function getMissedKeysList(missedKeys) {
  if (Object.keys(missedKeys).length === 0) return '';
  const sorted = Object.entries(missedKeys).sort(([, a], [, b]) => b - a);
  return sorted.map(([key, count]) => `${chalk.red(key)}(${count})`).join(' ');
}

function displayTarget(target, mode) {
  console.clear();
  const modeText = mode === 'text' ? 'Text Mode' : mode === 'letter' ? 'Letter Mode' : 'Letter Trainer Mode';
  const settingsText = mode === 'letter' ? '' : ', Ctrl+S for settings';
  console.log(`Keyboard Trainer - ${chalk.cyan(modeText)} - Type the shown sequence. Press Ctrl+C to quit${settingsText}.\n`);
  console.log('--------------------------------------------------------------------------------------------------');
  printStatus(mode);
  console.log('--------------------------------------------------------------------------------------------------');

  if (mode === 'text') {
    console.log(chalk.yellow(`Current level: ${currentWordLength}-letter words`));
    console.log(chalk.yellow(`Sentence ${sentencesCompleted + 1}/${SENTENCES_PER_LEVEL}\n`));
  } else if (mode === 'letter') {
    // Show available characters for current level
    const chars = getCharsetForLevel(LEVEL);
    console.log(chalk.yellow(`Level ${LEVEL + 1}: Available characters: ${chars.join(' ')}\n`));
  } else if (charsetOptions.crossShift) {
    console.log(chalk.yellow('Cross-shift mode enabled:'));
    console.log(chalk.yellow('Use RIGHT SHIFT for: Q W E R T A S D F G Z X C V B'));
    console.log(chalk.yellow('Use LEFT SHIFT for:  Y U I O P H J K L N M'));
    console.log('--------------------------------------------------------------------------------------------------\n');
  }

  console.log(chalk.bold('Target: ') + (mode === 'text' ? target.join('') : target.join(' ')));
  console.log(chalk.bold('Input:  '));
}

function resetGameState() {
  scoreRight = 0;
  scoreWrong = 0;
  totalKeystrokes = 0;
  LEVEL = 0;
  levelStatus = 0;
  inputSequence = [];
  currentTarget = [];
  startTime = Date.now();
  
  // Clean up readline interface
  if (currentRl) {
    currentRl.close();
    currentRl = null;
  }

  // Clean up keypress handler
  if (currentKeypressHandler) {
    process.stdin.removeListener('keypress', currentKeypressHandler);
    currentKeypressHandler = null;
  }
}

function startNewRound(mode) {
  if (mode === 'text') {
    // Generate new sentence and convert to single target
    currentSentence = generateNewSentence();
    currentTarget = currentSentence.join(' ').split('');
  } else {
    // Original letter mode
    currentTarget = getRandomSequence(LEVEL, SEQUENCE_LENGTH);
  }
  
  inputSequence = [];
  displayTarget(currentTarget, mode);
}

// Add this function at the appropriate scope level (outside of any other function)
function updateInputDisplay(mode = 'letter') {
  const line = currentTarget.map((char, i) => {
    const inputChar = inputSequence[i];
    if (inputChar === undefined) {
      return chalk.gray(char);
    }

    // For text mode, do direct character comparison
    if (mode === 'text') {
      return inputChar === char ? chalk.green(inputChar) : chalk.red(inputChar);
    }

    // For letter mode and letter trainer mode, normalize both input and target for comparison
    const normalizeKey = (key) => {
      if (key === '↑' || key === 'up') return '↑';
      if (key === '↓' || key === 'down') return '↓';
      if (key === '←' || key === 'left') return '←';
      if (key === '→' || key === 'right') return '→';
      if (key && typeof key === 'string' && key.toLowerCase().startsWith('f') && !isNaN(key.slice(1))) {
        return key.toUpperCase();
      }
      return key;
    };

    const normalizedInput = normalizeKey(inputChar);
    const normalizedTarget = normalizeKey(char);
    const isMatch = normalizedInput === normalizedTarget;
    return isMatch ? chalk.green(inputChar) : chalk.red(inputChar);
  });

  // Clear the current input line and write the new one
  readline.cursorTo(process.stdout, 0);
  readline.moveCursor(process.stdout, 0, -1);
  readline.clearLine(process.stdout, 0);
  
  const displayStr = mode === 'text' ? line.join('') : line.join(' ');
  process.stdout.write(chalk.bold('Input:  ') + displayStr + '\n');
}

// Game modes
function startGame(mode) {
  // Clean up any existing listeners
  if (currentKeypressHandler) {
    process.stdin.removeListener('keypress', currentKeypressHandler);
    currentKeypressHandler = null;
  }

  // Set up stdin
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  readline.emitKeypressEvents(process.stdin);

  // Start first round with appropriate mode
  startNewRound(mode);

  currentKeypressHandler = (str, key) => {
    if (key.ctrl && key.name === 'c') {
      process.stdin.removeListener('keypress', currentKeypressHandler);
      currentKeypressHandler = null;
      process.stdin.setRawMode(false);
      process.stdin.pause();
      console.clear();
      showMenu();
      return;
    }

    // Only show settings option for modes 1 and 2
    if (key.ctrl && key.name === 's' && mode !== 'letter') {
      process.stdin.removeListener('keypress', currentKeypressHandler);
      currentKeypressHandler = null;
      openSettingsMenu();
      return;
    }

    // Get the character to display
    let displayKey;
    if (mode === 'text' || mode === 'letter') {
      // For text mode and letter mode, use the raw character input without transformations
      displayKey = str;
    } else {
      // For letter trainer mode, handle special keys
      if (key.name && key.name.startsWith('f') && !isNaN(key.name.slice(1))) {
        displayKey = key.name.toUpperCase();
      } else if (key.name === 'up') {
        displayKey = '↑';
      } else if (key.name === 'down') {
        displayKey = '↓';
      } else if (key.name === 'left') {
        displayKey = '←';
      } else if (key.name === 'right') {
        displayKey = '→';
      } else {
        displayKey = keyMap[str] ?? str;
      }
    }
    
    if (inputSequence.length < currentTarget.length) {
      inputSequence.push(displayKey);
      totalKeystrokes++;

      const targetChar = currentTarget[inputSequence.length - 1];
      const isMatch = displayKey === targetChar;

      if (isMatch) {
        scoreRight++;
        levelStatus++;
      } else {
        scoreWrong++;
        MISSED_KEYS[targetChar] = (MISSED_KEYS[targetChar] || 0) + 1;
      }

      updateInputDisplay(mode);

      if (inputSequence.length === currentTarget.length) {
        if (mode === 'text') {
          sentencesCompleted++;
          if (sentencesCompleted >= SENTENCES_PER_LEVEL) {
            // Level up - increase word length
            currentWordLength++;
            sentencesCompleted = 0;
            console.log(chalk.bold.green(`\nLevel up! Now typing ${currentWordLength}-letter words`));
          }
          // Immediately start new sentence
          startNewRound(mode);
        } else if (mode === 'letter') {
          // Letter mode level up logic with automatic charset progression
          if (levelStatus >= levelBump) {
            LEVEL++;
            levelStatus = 0;
            // Update character sets based on level
            updateLetterModeCharsets(LEVEL);
          }
          setTimeout(() => startNewRound(mode), 500);
        } else {
          // Letter trainer mode
          if (levelStatus >= levelBump) {
            LEVEL++;
            levelStatus = 0;
          }
          setTimeout(() => startNewRound(mode), 500);
        }
      }
    }
  };

  process.stdin.on('keypress', currentKeypressHandler);
}

function startLetterTrainer() {
  resetGameState();
  console.clear();
  console.log(chalk.bold('Letter Trainer Mode\n'));
  console.log('Press Ctrl+C to return to menu, Ctrl+S for settings\n');
  startGame('letter-trainer');
}

function startTextMode() {
  resetGameState();
  console.clear();
  console.log(chalk.bold('Text Mode\n'));
  console.log('Press Ctrl+C to return to menu, Ctrl+S for settings\n');
  
  // Initialize text mode specific state
  currentWordLength = 3;
  sentencesCompleted = 0;
  currentSentence = generateNewSentence();
  
  // Join all words into a single target
  currentTarget = currentSentence.join(' ').split('');
  
  startGame('text');
}

function generateNewSentence() {
  return generate({
    exactly: 10,
    minLength: currentWordLength,
    maxLength: currentWordLength
  });
}

function startLetterMode() {
  resetGameState();
  console.clear();
  console.log(chalk.bold('Letter Mode\n'));
  console.log('Press Ctrl+C to return to menu\n');
  
  // Force only lowercase for letter mode
  Object.keys(charsetOptions).forEach(key => {
    charsetOptions[key] = false;
  });
  charsetOptions.lowercase = true;
  
  startGame('letter');
}

// Menu functions
function showHeader() {
  console.clear();
  console.log(chalk.bold.cyan('╔══════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║          CLI KEYBOARD TRAINER                ║'));
  console.log(chalk.bold.cyan('╚══════════════════════════════════════════════╝'));
  console.log();
}

function showMenu() {
  showHeader();
  console.log(chalk.bold('Choose a mode:\n'));
  MENU_OPTIONS.forEach((option, index) => {
    console.log(`${chalk.yellow(index + 1 + '.')} ${chalk.bold(option.label)} – ${option.description}`);
  });
  console.log('\nPress the number of your choice, or "q" to quit.\n');
  
  currentRl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  promptUser();
}

function promptUser() {
  currentRl.question(chalk.magenta('Your choice: '), (input) => {
    const trimmed = input.trim().toLowerCase();

    if (trimmed === 'q') {
      console.log(chalk.cyan('\nGoodbye!\n'));
      currentRl.close();
      process.exit(0);
    }

    const choice = parseInt(trimmed);
    if (!isNaN(choice) && choice >= 1 && choice <= MENU_OPTIONS.length) {
      const selected = MENU_OPTIONS[choice - 1];
      currentRl.close();
      currentRl = null;
      console.clear();
      console.log(chalk.green(`\n> Starting "${selected.label}"...\n`));
      selected.action();
    } else {
      console.log(chalk.red('\nInvalid choice. Try again.\n'));
      promptUser();
    }
  });
}

function openSettingsMenu() {
  // Clean up existing game handler
  if (currentKeypressHandler) {
    process.stdin.removeListener('keypress', currentKeypressHandler);
    currentKeypressHandler = null;
  }
  
  process.stdin.setRawMode(true);
  process.stdin.resume();

  const renderMenu = () => {
    console.clear();
    console.log(chalk.bold('Settings - Toggle Charset Groups (press letter to toggle, or q to quit):\n'));
    Object.keys(charsetOptions).forEach((key, index) => {
      const isEnabled = charsetOptions[key] ? chalk.green('ON') : chalk.red('OFF');
      const letter = String.fromCharCode(97 + index);
      const description = getSettingDescription(key);
      console.log(`${letter}. [${isEnabled}] ${key}${description ? ` - ${description}` : ''}`);
    });
    console.log('\nToggle: [a-p], or press "q" to return to training.');
  };

  renderMenu();

  const settingsHandler = (str, key) => {
    if (key.name === 'q') {
      // Clean up settings handler
      process.stdin.removeListener('keypress', settingsHandler);
      
      // Return to game
      console.clear();
      startGame('letter');
      return;
    }

    const index = key.name.charCodeAt(0) - 97;
    if (index >= 0 && index < Object.keys(charsetOptions).length) {
      const settingKey = Object.keys(charsetOptions)[index];
      charsetOptions[settingKey] = !charsetOptions[settingKey];

      if (settingKey === 'crossShift' && charsetOptions.crossShift) {
        charsetOptions.lowercase = true;
        charsetOptions.uppercase = true;
      }

      renderMenu();
    }
  };

  // Add the settings keypress handler
  process.stdin.on('keypress', settingsHandler);
}

// Menu options configuration
const MENU_OPTIONS = [
  { label: 'Letter Trainer Mode', description: 'Train specific keystrokes with custom settings', action: startLetterTrainer },
  { label: 'Normal Text Mode', description: 'Type real words/sentences in KPM mode', action: startTextMode },
  { label: 'Normal Letter Mode', description: 'Game with progressive levels and character sets', action: startLetterMode },
];

// Add descriptions for settings
function getSettingDescription(key) {
  const descriptions = {
    lowercase: 'Basic lowercase letters (a-z)',
    uppercase: 'Uppercase letters (A-Z) - Required for cross-shift',
    crossShift: 'Enforce using opposite shift key for uppercase letters (automatically enables lowercase and uppercase)',
    functionKeys: 'Include F1-F12 keys in training',
    shiftKeys: 'Include shift key practice',
  };
  return descriptions[key] || '';
}

// Add new function to handle letter mode charset progression
function updateLetterModeCharsets(level) {
  // Reset all charsets
  Object.keys(charsetOptions).forEach(key => {
    charsetOptions[key] = false;
  });
  
  // Always have lowercase enabled
  charsetOptions.lowercase = true;
  
  // Add character sets based on level
  if (level >= 2) charsetOptions.numbers = true;
  if (level >= 3) charsetOptions.uppercase = true;
  if (level >= 4) charsetOptions.curlies = true;
  if (level >= 5) charsetOptions.arrows = true;
  if (level >= 6) charsetOptions.math = true;
  if (level >= 7) charsetOptions.punctuation = true;
  if (level >= 8) charsetOptions.quotes = true;
  if (level >= 9) charsetOptions.pathChars = true;
  if (level >= 10) charsetOptions.symbols = true;
  if (level >= 11) charsetOptions.whitespace = true;
  if (level >= 12) charsetOptions.backspace = true;
  if (level >= 13) charsetOptions.del = true;
  if (level >= 14) charsetOptions.functionKeys = true;
}

// Start the application
showMenu();
