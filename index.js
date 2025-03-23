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
// const whitespace = ' \t\n';

const charset = [
  ...lowercase,
  ...uppercase,
  ...numbers,
  ...curlies,
  ...arrows,
  ...math,
  ...punctuation,
  ...quotes,
  ...pathChars,
  ...symbols,
  // ...whitespace,
];

const keyMap = {
  '\x1b[A': '↑',
  '\x1b[B': '↓',
  '\x1b[D': '←',
  '\x1b[C': '→',
};

const sequenceLength = 8;

const getRandomSequence = () =>
  Array.from({ length: sequenceLength }, () =>
    charset[Math.floor(Math.random() * charset.length)]
  );

let inputSequence = [];
let currentTarget = [];

const displayTarget = (target) => {
  console.log('\n Type this sequence (arrows included):');
  console.log('   ' + target.join(' '));
};

const startNewRound = () => {
  currentTarget = getRandomSequence();
  inputSequence = [];
  displayTarget(currentTarget);
};

const showDiff = (expected, actual) => {
  console.log('\nIncorrect. Git-style diff:\n');

  const maxLength = Math.max(expected.length, actual.length);

  for (let i = 0; i < maxLength; i++) {
    const exp = expected[i] ?? '';
    const act = actual[i] ?? '';

    if (exp === act) {
      console.log('  ' + chalk.gray(exp));
    } else {
      if (exp) console.log(chalk.red(`- ${exp}`));
      if (act) console.log(chalk.green(`+ ${act}`));
    }
  }

  console.log('');
};

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

console.log(' Keyboard Trainer – Type the shown sequence using regular + arrow keys. Press Ctrl+C to quit.');

startNewRound();

process.stdin.on('keypress', (str, key) => {
  let displayKey = str;

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

  process.stdout.write(displayKey + ' ');

  if (inputSequence.length === currentTarget.length) {
    const correct = inputSequence.every((val, i) => val === currentTarget[i]);

    if (correct) {
      console.log('\nCorrect!\n');
    } else {
      showDiff(currentTarget, inputSequence);
    }

    setTimeout(startNewRound, 700);
  }
});