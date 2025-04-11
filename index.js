#!/usr/bin/env node

import readline from 'readline';
import chalk from 'chalk';
import { generate } from 'random-words';
import fs from 'fs';
import path from 'path';

// Character sets and constants
const lowercase = 'abcdefghijklmnopqrstuvwxyz';
const leftHandLowercase = 'qwertasdfgzxcvb';
const rightHandLowercase = 'yuiophjklnm';
const uppercase = lowercase.toUpperCase();
const leftHandUppercase = leftHandLowercase.toUpperCase();
const rightHandUppercase = rightHandLowercase.toUpperCase();
const leftHandNumbers = '12345';
const rightHandNumbers = '67890';
const leftHandSymbols = '!@#$%';
const rightHandSymbols = '^&*()';
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
const homeend = ['↖', '↘']; // Home, End
const pageUpDown = ['⇞', '⇟']; // PageUp, PageDown
const escape = '⎋'; // Escape key
const mediaKeys = ['⏮', '⏯', '⏭', '🔇', '🔉', '🔊']; // Previous, Play/Pause, Next, Mute, Volume Down, Volume Up
const functionKeys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F12'];

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
  '\x1b[H': '↖',    // Home
  '\x1b[F': '↘',    // End
  '\x1b[5~': '⇞',   // Page Up
  '\x1b[6~': '⇟',   // Page Down
  '\x1b': '⎋',      // Escape
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
  '\x1b[1;2': '⇧L', // Left shift
  '\x1b[1;2': '⇧R', // Right shift
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
let MISSED_KEYS = {};

// Settings
const charsetOptions = {
  leftHandLowercase: true,
  rightHandLowercase: true,
  leftHandUppercase: false,
  rightHandUppercase: false,
  leftHandNumbers: false,
  rightHandNumbers: false,
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
  homeend: false,
  pageUpDown: false,
  escape: false,
  mediaKeys: false,
  functionKeys: false,
  shiftKeys: false,
  crossShift: false
};

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

// Add variables to track per-level statistics
let levelStats = {};
let levelStartTimes = {};
let levelKeypresses = {};

// Utility functions
function getRandomSequence(level, sequenceLength) {
  const currentCharset = getCharsetForLevel(level + 1);
  return Array.from({ length: sequenceLength }, () => currentCharset[Math.floor(Math.random() * currentCharset.length)]);
}

function getCharsetForLevel(level) {
  let chars = [];
  
  if (charsetOptions.leftHandLowercase) chars.push(...'qwertasdfgzxcvb');
  if (charsetOptions.rightHandLowercase) chars.push(...'yuiophjklnm');
  if (charsetOptions.leftHandUppercase) chars.push(...'QWERTASDFGZXCVB');
  if (charsetOptions.rightHandUppercase) chars.push(...'YUIOPHJKLNM');
  if (charsetOptions.leftHandNumbers) chars.push(...'12345');
  if (charsetOptions.rightHandNumbers) chars.push(...'67890');
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
  if (charsetOptions.homeend) chars.push(...homeend);
  if (charsetOptions.pageUpDown) chars.push(...pageUpDown);
  if (charsetOptions.escape) chars.push(escape);
  if (charsetOptions.mediaKeys) chars.push(...mediaKeys);
  if (charsetOptions.functionKeys) chars.push(...functionKeys);

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
  startTime = Date.now();
  scoreRight = 0;
  scoreWrong = 0;
  totalKeystrokes = 0;
  inputSequence = [];
  sentencesCompleted = 0;
  levelStatus = 0;
  LEVEL = 0;
  currentWordLength = 3;
  MISSED_KEYS = {};
  
  // Reset level tracking
  levelStats = {};
  levelStartTimes = {};
  levelKeypresses = {};
  
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
      // Normalize arrow keys in all modes
      if (key === '↑' || key === 'up') return '↑';
      if (key === '↓' || key === 'down') return '↓';
      if (key === '←' || key === 'left') return '←';
      if (key === '→' || key === 'right') return '→';
      if (key === '␣' || key === ' ') return '␣';
      if (key === '⇥' || key === '\t') return '⇥';
      if (key === '⏎' || key === '\n' || key === '\r') return '⏎';
      if (key === '⎋' || key === 'escape') return '⎋';
      if (key === '⏮' || key === 'audioPrev') return '⏮';
      if (key === '⏯' || key === 'audioPlay') return '⏯';
      if (key === '⏭' || key === 'audioNext') return '⏭';
      if (key === '🔇' || key === 'audioMute') return '🔇';
      if (key === '🔉' || key === 'audioVolDown') return '🔉';
      if (key === '🔊' || key === 'audioVolUp') return '🔊';
      
      // Handle function keys
      if (key && typeof key === 'string' && key.toLowerCase().startsWith('f') && !isNaN(key.slice(1)) && key.length > 1) {
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

// Add this function to save scores
function saveScore(mode) {
  try {
    const accuracy = totalKeystrokes === 0 ? 0 : Math.round((scoreRight / totalKeystrokes) * 100);
    const elapsedMs = Date.now() - startTime;
    const elapsedMin = elapsedMs / 1000 / 60;
    const kpm = Math.round(totalKeystrokes / elapsedMin);
    
    // Calculate KPM per level
    const kpmPerLevel = {};
    Object.keys(levelKeypresses).forEach(level => {
      const levelTime = (levelStartTimes[level].end - levelStartTimes[level].start) / 1000 / 60;
      if (levelTime > 0) {
        kpmPerLevel[level] = Math.round(levelKeypresses[level] / levelTime);
      }
    });
    
    // Create score data with enhanced statistics
    const scoreData = {
      timestamp: new Date().toISOString(),
      mode: mode,
      accuracy: accuracy,
      kpm: kpm,
      right: scoreRight,
      wrong: scoreWrong,
      totalKeystrokes: totalKeystrokes,
      level: mode === 'text' ? currentWordLength : LEVEL,
      timeSpent: elapsedMin.toFixed(2),
      detailedStats: {
        kpmPerLevel: kpmPerLevel,
        missedKeys: MISSED_KEYS
      }
    };
    
    // Add mode-specific data
    if (mode === 'letter-trainer') {
      // For letter-trainer mode, log which character sets were enabled
      scoreData.detailedStats.enabledOptions = {};
      Object.keys(charsetOptions).forEach(key => {
        scoreData.detailedStats.enabledOptions[key] = charsetOptions[key];
      });
    }
    
    const scoreLogPath = path.join(process.cwd(), 'score.log');
    
    // Read existing file if it exists
    let existingData = [];
    try {
      if (fs.existsSync(scoreLogPath)) {
        const fileContent = fs.readFileSync(scoreLogPath, 'utf8');
        existingData = fileContent.split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line));
      }
    } catch (err) {
      // If error reading file, just continue with empty array
      console.error('Error reading existing score log:', err.message);
    }
    
    // Add new score and write back
    existingData.push(scoreData);
    
    // Write each JSON object on a new line for easier appending
    const dataToWrite = existingData.map(entry => JSON.stringify(entry)).join('\n') + '\n';
    fs.writeFileSync(scoreLogPath, dataToWrite);
    
    console.log(chalk.green(`\nScore saved to score.log`));
  } catch (err) {
    console.error('Error saving score:', err.message);
  }
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

  // Initialize level tracking for current level
  if (!levelStartTimes[LEVEL]) {
    levelStartTimes[LEVEL] = { start: Date.now(), end: null };
  }
  if (!levelKeypresses[LEVEL]) {
    levelKeypresses[LEVEL] = 0;
  }

  // Start first round with appropriate mode
  startNewRound(mode);

  currentKeypressHandler = (str, key) => {
    if (key.ctrl && key.name === 'c') {
      process.stdin.removeListener('keypress', currentKeypressHandler);
      currentKeypressHandler = null;
      process.stdin.setRawMode(false);
      process.stdin.pause();
      
      // Save score before exiting
      if (totalKeystrokes > 0) {
        saveScore(mode);
      }
      
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
    if (mode === 'text') {
      displayKey = str;
    } else if (mode === 'letter') {
      // Letter mode - handle special keys
      if (key.name === 'up') displayKey = '↑';
      else if (key.name === 'down') displayKey = '↓';
      else if (key.name === 'left') displayKey = '←';
      else if (key.name === 'right') displayKey = '→';
      else if (key.name === 'space') displayKey = '␣';
      else if (key.name === 'tab') displayKey = '⇥';
      else if (key.name === 'return' || key.name === 'enter') displayKey = '⏎';
      else if (key.name === 'home') displayKey = '↖';
      else if (key.name === 'end') displayKey = '↘';
      else if (key.name === 'pageup') displayKey = '⇞';
      else if (key.name === 'pagedown') displayKey = '⇟';
      else if (key.name === 'escape') displayKey = '⎋';
      else if (key.name === 'audioPrev') displayKey = '⏮';
      else if (key.name === 'audioPlay') displayKey = '⏯';
      else if (key.name === 'audioNext') displayKey = '⏭';
      else if (key.name === 'audioMute') displayKey = '🔇';
      else if (key.name === 'audioVolDown') displayKey = '🔉';
      else if (key.name === 'audioVolUp') displayKey = '🔊';
      else if (key.name && key.name.startsWith('f') && !isNaN(key.name.slice(1)) && key.name.length > 1) {
        displayKey = key.name.toUpperCase();
      } else {
        displayKey = str;
      }
    } else {
      // Letter trainer mode
      if (key.name === 'audioPrev') displayKey = '⏮';
      else if (key.name === 'audioPlay') displayKey = '⏯';
      else if (key.name === 'audioNext') displayKey = '⏭';
      else if (key.name === 'audioMute') displayKey = '🔇';
      else if (key.name === 'audioVolDown') displayKey = '🔉';
      else if (key.name === 'audioVolUp') displayKey = '🔊';
      else if (key.name === 'escape') displayKey = '⎋';
      else if (key.name === 'home') displayKey = '↖';
      else if (key.name === 'end') displayKey = '↘';
      else if (key.name === 'pageup') displayKey = '⇞';
      else if (key.name === 'pagedown') displayKey = '⇟';
      else if (key.name && key.name.startsWith('f') && !isNaN(key.name.slice(1)) && key.name.length > 1) {
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

      // Track keypress for current level
      levelKeypresses[LEVEL] = (levelKeypresses[LEVEL] || 0) + 1;

      if (inputSequence.length === currentTarget.length) {
        if (mode === 'text') {
          sentencesCompleted++;
          if (sentencesCompleted >= SENTENCES_PER_LEVEL) {
            // Mark end time for current level
            if (levelStartTimes[currentWordLength]) {
              levelStartTimes[currentWordLength].end = Date.now();
            }
            
            // Initialize next level
            currentWordLength++;
            if (!levelStartTimes[currentWordLength]) {
              levelStartTimes[currentWordLength] = { start: Date.now(), end: null };
            }
            if (!levelKeypresses[currentWordLength]) {
              levelKeypresses[currentWordLength] = 0;
            }
            console.log(chalk.bold.green(`\nLevel up! Now typing ${currentWordLength}-letter words`));
          }
          // Immediately start new sentence
          startNewRound(mode);
        } else if (mode === 'letter') {
          // Letter mode level up logic with automatic charset progression
          if (levelStatus >= levelBump) {
            // Mark end time for current level
            if (levelStartTimes[LEVEL]) {
              levelStartTimes[LEVEL].end = Date.now();
            }
            
            // Initialize next level
            LEVEL++;
            levelStatus = 0;
            if (!levelStartTimes[LEVEL]) {
              levelStartTimes[LEVEL] = { start: Date.now(), end: null };
            }
            if (!levelKeypresses[LEVEL]) {
              levelKeypresses[LEVEL] = 0;
            }
            
            // Update character sets based on level
            updateLetterModeCharsets(LEVEL);
          }
          setTimeout(() => startNewRound(mode), 500);
        } else {
          // Letter trainer mode
          if (levelStatus >= levelBump) {
            // Mark end time for current level
            if (levelStartTimes[LEVEL]) {
              levelStartTimes[LEVEL].end = Date.now();
            }
            
            // Initialize next level
            LEVEL++;
            levelStatus = 0;
            if (!levelStartTimes[LEVEL]) {
              levelStartTimes[LEVEL] = { start: Date.now(), end: null };
            }
            if (!levelKeypresses[LEVEL]) {
              levelKeypresses[LEVEL] = 0;
            }
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
  charsetOptions.leftHandLowercase = true;
  charsetOptions.rightHandLowercase = true;
  
  startGame('letter');
}

// Menu functions
function showMenu() {
  console.clear();
  console.log(chalk.cyan(`
  ╔═══════════════════════════════════════════════════════════════════════════╗
  ║                                                                           ║
  ║   ██╗  ██╗███████╗██╗   ██╗██████╗  ██████╗  █████╗ ██████╗ ██████╗       ║
  ║   ██║ ██╔╝██╔════╝╚██╗ ██╔╝██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██╔══██╗      ║
  ║   █████╔╝ █████╗   ╚████╔╝ ██████╔╝██║   ██║███████║██████╔╝██║  ██║      ║
  ║   ██╔═██╗ ██╔══╝    ╚██╔╝  ██╔══██╗██║   ██║██╔══██║██╔══██╗██║  ██║      ║
  ║   ██║  ██╗███████╗   ██║   ██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝      ║
  ║   ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝       ║
  ║                                                                           ║
  ║   ████████╗██████╗  █████╗ ██╗███╗   ██╗███████╗██████╗                   ║
  ║   ╚══██╔══╝██╔══██╗██╔══██╗██║████╗  ██║██╔════╝██╔══██╗                  ║
  ║      ██║   ██████╔╝███████║██║██╔██╗ ██║█████╗  ██████╔╝                  ║
  ║      ██║   ██╔══██╗██╔══██║██║██║╚██╗██║██╔══╝  ██╔══██╗                  ║
  ║      ██║   ██║  ██║██║  ██║██║██║ ╚████║███████╗██║  ██║                  ║
  ║      ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝                  ║
  ║                                                                           ║
  ╚═══════════════════════════════════════════════════════════════════════════╝
`));

  console.log('Choose a mode:\n');

  MENU_OPTIONS.forEach((option, index) => {
    console.log(`${chalk.yellow(index + 1 + '.')} ${chalk.bold(option.label)} – ${option.description}`);
  });
  
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
  
  // Store current game mode to return to it
  const previousMode = currentTarget.length > 0 ? 
    (currentTarget.includes(' ') ? 'text' : 'letter-trainer') : 
    'letter-trainer';
  
  // Log current progress before changing settings
  if (totalKeystrokes > 0) {
    console.log(chalk.cyan('\nLogging current progress before settings change...'));
    saveScore(previousMode);
  }
  
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
      
      // Return to the correct game mode
      console.clear();
      if (previousMode === 'text') {
        startTextMode();
      } else {
        startLetterTrainer();
      }
      return;
    }

    const index = key.name.charCodeAt(0) - 97;
    if (index >= 0 && index < Object.keys(charsetOptions).length) {
      const settingKey = Object.keys(charsetOptions)[index];
      charsetOptions[settingKey] = !charsetOptions[settingKey];

      if (settingKey === 'crossShift' && charsetOptions.crossShift) {
        charsetOptions.leftHandLowercase = true;
        charsetOptions.rightHandLowercase = true;
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
  { label: 'View Progress', description: 'Analyze your typing performance and improvements', action: analyzeScores }
];

// Add descriptions for settings
function getSettingDescription(key) {
  const descriptions = {
    leftHandLowercase: 'Left hand lowercase letters (q w e r t a s d f g z x c v b)',
    rightHandLowercase: 'Right hand lowercase letters (y u i o p h j k l n m)',
    leftHandUppercase: 'Left hand uppercase letters (Q W E R T A S D F G Z X C V B)',
    rightHandUppercase: 'Right hand uppercase letters (Y U I O P H J K L N M)',
    leftHandNumbers: 'Left hand numbers (1 2 3 4 5)',
    rightHandNumbers: 'Right hand numbers (6 7 8 9 0)',
    curlies: 'Brackets and parentheses ( ) [ ] { } < >',
    arrows: 'Arrow keys (↑ ↓ ← →)',
    math: 'Mathematical operators (+ - * / % =)',
    punctuation: 'Punctuation marks (. , ; : ! ?)',
    quotes: 'Quote marks (" \' `)',
    pathChars: 'Path characters (/ \\ _ | ~)',
    symbols: 'Special symbols (@ # $ % ^ &)',
    whitespace: 'Whitespace characters (Space, Tab, Enter)',
    backspace: 'Backspace key (⌫)',
    del: 'Delete key (⌦)',
    homeend: 'Home and End navigation keys',
    pageUpDown: 'Page Up and Page Down keys',
    escape: 'Escape key',
    mediaKeys: 'Media control keys (Previous, Play/Pause, Next, Volume controls)',
    functionKeys: 'Include F1-F12 keys in training',
    shiftKeys: 'Include shift key practice',
    crossShift: 'Enforce using opposite shift key for uppercase letters (automatically enables uppercase)'
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
  charsetOptions.leftHandLowercase = true;
  charsetOptions.rightHandLowercase = true;
  
  // Add character sets based on level
  if (level >= 2) charsetOptions.leftHandNumbers = true;
  if (level >= 3) charsetOptions.rightHandNumbers = true;
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

function analyzeScores() {
  console.clear();
  console.log(chalk.bold('Score Analysis\n'));
  
  try {
    const scoreLogPath = path.join(process.cwd(), 'score.log');
    let scores = [];
    
    if (fs.existsSync(scoreLogPath)) {
      const content = fs.readFileSync(scoreLogPath, 'utf8');
      scores = content.trim().split('\n').map(line => JSON.parse(line));
    }
    
    if (scores.length === 0) {
      console.log(chalk.yellow('No scores recorded yet. Play some games first!'));
      return;
    }

    // Group scores by mode
    const modeScores = {
      'text': [],
      'letter': [],
      'letter-trainer': []
    };

    scores.forEach(score => {
      if (modeScores[score.mode]) {
        modeScores[score.mode].push(score);
      }
    });

    // Analyze each mode
    Object.entries(modeScores).forEach(([mode, modeData]) => {
      if (modeData.length === 0) return;

      console.log(chalk.cyan(`\n${mode.toUpperCase()} MODE ANALYSIS`));
      console.log('----------------------------------');

      // Sort by timestamp
      modeData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Calculate trends
      const recentScores = modeData.slice(-5);
      const avgAccuracy = recentScores.reduce((sum, s) => sum + s.accuracy, 0) / recentScores.length;
      const avgKpm = recentScores.reduce((sum, s) => sum + s.kpm, 0) / recentScores.length;
      const maxLevel = Math.max(...modeData.map(s => s.level));
      const totalSessions = modeData.length;
      
      // Recent improvement calculations
      const firstFive = modeData.slice(0, 5);
      const initialAvgKpm = firstFive.reduce((sum, s) => sum + s.kpm, 0) / firstFive.length;
      const kpmImprovement = ((avgKpm - initialAvgKpm) / initialAvgKpm * 100).toFixed(1);

      // Display statistics
      console.log(`Total Sessions: ${chalk.yellow(totalSessions)}`);
      console.log(`Highest Level Reached: ${chalk.yellow(maxLevel)}`);
      console.log(`Recent Average Accuracy: ${chalk.yellow(avgAccuracy.toFixed(1))}%`);
      console.log(`Recent Average Speed: ${chalk.yellow(avgKpm.toFixed(1))} KPM`);
      
      if (!isNaN(kpmImprovement) && firstFive.length === 5) {
        const improvementColor = kpmImprovement > 0 ? chalk.green : chalk.red;
        console.log(`Speed Improvement: ${improvementColor(kpmImprovement + '%')}`);
      }

      // Show most common mistakes if available
      if (modeData.some(s => s.detailedStats?.missedKeys)) {
        const allMissedKeys = {};
        modeData.forEach(score => {
          if (score.detailedStats?.missedKeys) {
            Object.entries(score.detailedStats.missedKeys).forEach(([key, count]) => {
              allMissedKeys[key] = (allMissedKeys[key] || 0) + count;
            });
          }
        });

        if (Object.keys(allMissedKeys).length > 0) {
          const topMistakes = Object.entries(allMissedKeys)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

          console.log('\nMost Common Mistakes:');
          topMistakes.forEach(([key, count]) => {
            console.log(`  ${chalk.red(key)}: ${count} times`);
          });
        }
      }

      // Show recent sessions
      console.log('\nRecent Sessions:');
      recentScores.reverse().forEach(score => {
        const date = new Date(score.timestamp).toLocaleString();
        console.log(
          chalk.gray(`${date} - `) +
          `Level: ${chalk.yellow(score.level)}, ` +
          `Accuracy: ${chalk.yellow(score.accuracy)}%, ` +
          `Speed: ${chalk.yellow(score.kpm)} KPM`
        );
      });
    });

    console.log('\nPress Enter to return to menu...');
    
    // Create readline interface for user input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('', () => {
      rl.close();
      showMenu();
    });

  } catch (error) {
    console.error(chalk.red('Error reading scores:', error.message));
    console.log('\nPress Enter to return to menu...');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('', () => {
      rl.close();
      showMenu();
    });
  }
}

// Start the application
showMenu();
