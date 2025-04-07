#!/usr/bin/env node

import readline from 'readline';
import chalk from 'chalk';

// Menu options
const MENU_OPTIONS = [
  { label: 'Letter Trainer Mode', description: 'Train specific keystrokes with custom settings', action: startLetterTrainer },
  { label: 'Normal Text Mode', description: 'Type real words/sentences in KPM mode', action: startTextMode },
  { label: 'Normal Letter Mode', description: 'Game with progressive levels and character sets', action: startLetterMode },
];

// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const showHeader = () => {
  console.clear();
  console.log(chalk.bold.cyan('╔══════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║          CLI KEYBOARD TRAINER                ║'));
  console.log(chalk.bold.cyan('╚══════════════════════════════════════════════╝'));
  console.log();
};

const showMenu = () => {
  showHeader();
  console.log(chalk.bold('Choose a mode:\n'));
  MENU_OPTIONS.forEach((option, index) => {
    console.log(`${chalk.yellow(index + 1 + '.')} ${chalk.bold(option.label)} – ${option.description}`);
  });
  console.log('\nPress the number of your choice, or "q" to quit.\n');
};

const promptUser = () => {
  rl.question(chalk.magenta('Your choice: '), (input) => {
    const trimmed = input.trim().toLowerCase();

    if (trimmed === 'q') {
      console.log(chalk.cyan('\nGoodbye!\n'));
      rl.close();
      process.exit(0);
    }

    const choice = parseInt(trimmed);
    if (!isNaN(choice) && choice >= 1 && choice <= MENU_OPTIONS.length) {
      const selected = MENU_OPTIONS[choice - 1];
      console.clear();
      console.log(chalk.green(`\n> Starting "${selected.label}"...\n`));
      rl.close();
      selected.action(); // start corresponding function
    } else {
      console.log(chalk.red('\nInvalid choice. Try again.\n'));
      promptUser();
    }
  });
};

// Placeholder mode functions
function startLetterTrainer() {
  console.log(chalk.yellow('🚧 Letter Trainer Mode is not implemented yet.'));
  process.exit(0);
}

function startTextMode() {
  console.log(chalk.yellow('🚧 Normal Text Mode is not implemented yet.'));
  process.exit(0);
}

function startLetterMode() {
  console.log(chalk.yellow('🚧 Normal Letter Mode is not implemented yet.'));
  process.exit(0);
}

// Launch
showMenu();
promptUser();