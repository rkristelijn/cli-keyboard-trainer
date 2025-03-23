import readline from 'readline';
import chalk from 'chalk';

// const leftCenterRow = 'asdfg';
// const rightCenterRow = 'hjkl';
// const leftTopRow = 'qwert';
// const rightTopRow = 'yuiop';
// const leftBottomRow = 'zxcvb';
// const rightBottomRow = 'bnm';
const lowercase = 'abcdefghijklmnopqrstuvwxyz';
const uppercase = lowercase.toUpperCase();
const numbers = '1234567890';
// const leftNumbers = '12345';
// const rightNumbers = '67890';
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

// const charset = [
//   ...lowercase,
//   // ...uppercase,
//   // ...numbers,
//   // ...curlies,
//   // ...arrows,
//   // ...math,
//   // ...punctuation,
//   // ...quotes,
//   // ...pathChars,
//   // ...symbols,
//   // ...whitespace,
//   // backspace,
//   // del,
//   // ...homeend,
//   // ...pageUpDown,
// ];

const keyMap = {
  '\x1b[A': '↑',
  '\x1b[B': '↓',
  '\x1b[D': '←',
  '\x1b[C': '→',
  ' ': '␣', // Space
  '\t': '⇥', // Tab
  '\r': '⏎', // Enter (carriage return)
  '\x7f': '⌫', // Backspace (ASCII 127)
  '\x1b[3~': '⌦', // Delete (may vary by terminal)
  '\x1b[H': '⇱', // Home
  '\x1b[F': '⇲', // End
  '\x1b[5~': '⇞', // Page Up
  '\x1b[6~': '⇟', // Page Down
  '\x1b': '⎋', // Escape
};

const sequenceLength = 8;

let scoreRight = 0;
let scoreWrong = 0;
let totalKeystrokes = 0;
let level = 0;
let levelStatus = 0;
let levelBump = 2;

const missedKeys = {}; // { 'a': 2, '↘': 1, ... }

const startTime = Date.now();

const getRandomSequence = () => {
  const currentCharset = getCharsetForLevel(level + 1); // level is base-0
  return Array.from({ length: sequenceLength }, () => currentCharset[Math.floor(Math.random() * currentCharset.length)]);
};

const getCharsetForLevel = (level) => {
  let chars = [...lowercase];

  if (level >= 2) {
    chars.push(...numbers);
  }
  if (level >= 3) {
    chars.push(...uppercase);
  }
  if (level >= 4) {
    chars.push(...curlies);
  }
  if (level >= 5) {
    chars.push(...arrows);
  }
  if (level >= 6) {
    chars.push(...math);
  }
  if (level >= 7) {
    chars.push(...punctuation);
  }
  if (level >= 8) {
    chars.push(...quotes);
  }
  if (level >= 9) {
    chars.push(...pathChars);
  }
  if (level >= 10) {
    chars.push(...symbols);
  }
  if (level >= 11) {
    chars.push(...whitespace);
  }
  if (level >= 12) {
    chars.push(backspace);
  }
  if (level >= 13) {
    chars.push(del);
  }

  return chars;
};

let inputSequence = [];
let currentTarget = [];

const printStatus = () => {
  const accuracy = totalKeystrokes === 0 ? 0 : Math.round((scoreRight / totalKeystrokes) * 100);

  const elapsedMs = Date.now() - startTime;
  const elapsedMin = elapsedMs / 1000 / 60;
  const kpm = Math.round(totalKeystrokes / elapsedMin);

  console.log(
    'right: [' +
      chalk.green(scoreRight) +
      '] ' +
      'typos: [' +
      chalk.red(scoreWrong) +
      '] ' +
      'KPM: [' +
      chalk.cyan(kpm) +
      '] ' +
      'Accuracy: [' +
      chalk.yellow(accuracy + '%') +
      '] ' +
      'Level: [' +
      chalk.red(level) +
      '] ' +
      'levelStatus: [' +
      chalk.blue(levelStatus + '/' + levelBump) +
      '] ' +
      'Total Time: [' +
      chalk.magenta(elapsedMin.toFixed(2) + ' min') +
      '] ' +
      (Object.keys(missedKeys).length > 0 ? ' Missed: [' + getMissedKeysList() + ']' : '')
  );
};


const displayTarget = (target) => {
  console.clear();
  console.log('Keyboard Trainer - Type the shown sequence. Press Ctrl+C to quit.\n');
  console.log('---------------------------------------------------------------------------------------');
  printStatus();
  console.log('---------------------------------------------------------------------------------------');

  console.log(chalk.bold('Target: ') + target.join(' '));
  console.log(chalk.bold('Input:  '));
};

const updateInputDisplay = () => {
  const line = currentTarget.map((char, i) => {
    const inputChar = inputSequence[i];

    if (inputChar === undefined) {
      return chalk.gray(char);
    } else if (inputChar === char) {
      return chalk.green(inputChar);
    } else {
      return chalk.red(inputChar);
    }
  });

  // Move cursor up and overwrite input line
  readline.cursorTo(process.stdout, 0);
  readline.moveCursor(process.stdout, 0, -1);
  readline.clearLine(process.stdout, 0);
  process.stdout.write(chalk.bold('Input:  ') + line.join(' ') + '\n');
};

const renderLevelBar = (status) => {
  const totalBlocks = 10;
  const filledBlocks = Math.floor((status % 100) / 10);
  const bar = Array.from({ length: totalBlocks }, (_, i) => (i < filledBlocks ? chalk.green('■') : chalk.gray('·'))).join('');
  return bar;
};

const getMissedKeysList = () => {
  if (Object.keys(missedKeys).length === 0) {
    return '';
  }
  const sorted = Object.entries(missedKeys).sort(([, a], [, b]) => b - a);
  // .slice(0, 5); // top 5 most missed

  return sorted.map(([key, count]) => `${chalk.red(key)}(${count})`).join(' ');
};

const startNewRound = () => {
  currentTarget = getRandomSequence();
  inputSequence = [];
  displayTarget(currentTarget);
};

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

startNewRound();

process.stdin.on('keypress', (str, key) => {
  let displayKey = keyMap[str] ?? str;

  totalKeystrokes++;

  if (key.sequence in keyMap) {
    displayKey = keyMap[key.sequence];
  } else if (key.ctrl && key.name === 'c') {
    console.log('\nExiting...');
    printStatus();
    process.exit();
  }

  inputSequence.push(displayKey);
  updateInputDisplay();

  if (inputSequence.length === currentTarget.length) {
    currentTarget.forEach((char, i) => {
      const inputChar = inputSequence[i];

      if (inputChar === char) {
        scoreRight++;
      } else {
        scoreWrong++;
        missedKeys[char] = (missedKeys[char] || 0) + 1;
      }
    });

    levelStatus++;
    // Level up if levelStatus exceeds levelBump
    if (levelStatus >= levelBump) {
      level++;
      levelStatus = 0;
    }

    setTimeout(startNewRound, 1000);
  }
});
