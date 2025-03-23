import readline from 'readline';
import chalk from 'chalk';

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

const charset = [
  ...lowercase,
  // ...uppercase,
  // ...numbers,
  // ...curlies,
  // ...arrows,
  // ...math,
  // ...punctuation,
  // ...quotes,
  // ...pathChars,
  // ...symbols,
  ...whitespace,
];

const keyMap = {
  '\x1b[A': '↑',
  '\x1b[B': '↓',
  '\x1b[D': '←',
  '\x1b[C': '→',
  ' ': '␣',          // Space
  '\t': '⇥',         // Tab
  '\r': '⏎',         // Enter (carriage return)
};

const sequenceLength = 8;
let scoreRight = 0;
let scoreWrong = 0;

const getRandomSequence = () =>
  Array.from({ length: sequenceLength }, () =>
    charset[Math.floor(Math.random() * charset.length)]
  );

let inputSequence = [];
let currentTarget = [];

const displayTarget = (target) => {
  console.clear();
  console.log('Keyboard Trainer - Type the shown sequence. Press Ctrl+C to quit.\n');
  console.log('right: [' + chalk.green(scoreRight) + '] typos: [' + chalk.red(scoreWrong) + ']\n');
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

  if (key.sequence in keyMap) {
    displayKey = keyMap[key.sequence];
  } else if (key.name === 'escape') {
    console.log('\n👋 Exiting...');
    process.exit();
  } else if (key.ctrl && key.name === 'c') {
    console.log('\n👋 Exiting...');
    process.exit();
  }

  inputSequence.push(displayKey);
  updateInputDisplay();

  if (inputSequence.length === currentTarget.length) {
    currentTarget.forEach((char, i) => {
      if (inputSequence[i] === char) {
        scoreRight++;
      } else {
        scoreWrong++;
      }
    });
    setTimeout(startNewRound, 1000);
  }
});