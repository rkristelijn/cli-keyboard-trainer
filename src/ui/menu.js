/**
 * Menu rendering and navigation logic for keyboard trainer.
 * @module menu
 */
import readline from 'readline';
import chalk from 'chalk';

/**
 * Show the main menu and handle navigation.
 * @param {Array} MENU_OPTIONS - Array of menu option objects {label, description, action}
 */
export function showMenu(MENU_OPTIONS) {
  console.clear();
  console.log(chalk.cyan(`\n  ╔═══════════════════════════════════════════════════════════════════════════╗\n  ║                                                                           ║\n  ║   ██╗  ██╗███████╗██╗   ██╗██████╗  ██████╗  █████╗ ██████╗ ██████╗       ║\n  ║   ██║ ██╔╝██╔════╝╚██╗ ██╔╝██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██╔══██╗      ║\n  ║   █████╔╝ █████╗   ╚████╔╝ ██████╔╝██║   ██║███████║██████╔╝██║  ██║      ║\n  ║   ██╔═██╗ ██╔══╝    ╚██╔╝  ██╔══██╗██║   ██║██╔══██║██╔══██╗██║  ██║      ║\n  ║   ██║  ██╗███████╗   ██║   ██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝      ║\n  ║   ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝       ║\n  ║                                                                           ║\n  ║   ████████╗██████╗  █████╗ ██╗███╗   ██╗███████╗██████╗                   ║\n  ║   ╚══██╔══╝██╔══██╗██╔══██╗██║████╗  ██║██╔════╝██╔══██╗                  ║\n  ║      ██║   ██████╔╝███████║██║██╔██╗ ██║█████╗  ██████╔╝                  ║\n  ║      ██║   ██╔══██╗██╔══██║██║██║╚██╗██║██╔══╝  ██╔══██╗                  ║\n  ║      ██║   ██║  ██║██║  ██║██║██║ ╚████║███████╗██║  ██║                  ║\n  ║      ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝                  ║\n  ║                                                                           ║\n  ╚═══════════════════════════════════════════════════════════════════════════╝\n`));

  console.log('Choose a mode:\n');
  MENU_OPTIONS.forEach((option, index) => {
    console.log(`${chalk.yellow(index + 1 + '.')} ${chalk.bold(option.label)} – ${option.description}`);
  });
  console.log(chalk.magenta('\nPress 1-4 to select a mode, or q to quit.'));

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  readline.emitKeypressEvents(process.stdin);

  let handler = (str, key) => {
    if (key && key.name === 'q') {
      console.log(chalk.cyan('\nGoodbye!\n'));
      process.stdin.removeListener('keypress', handler);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.exit(0);
    }
    if (key && !key.ctrl && !key.meta && key.name && /^[1-4]$/.test(key.name)) {
      const choice = parseInt(key.name);
      if (choice >= 1 && choice <= MENU_OPTIONS.length) {
        const selected = MENU_OPTIONS[choice - 1];
        process.stdin.removeListener('keypress', handler);
        process.stdin.setRawMode(false);
        process.stdin.pause();
        console.clear();
        console.log(chalk.green(`\n> Starting "${selected.label}"...\n`));
        selected.action();
      }
    }
  };
  process.stdin.on('keypress', handler);
} 