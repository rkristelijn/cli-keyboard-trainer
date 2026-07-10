/**
 * Main entry point for CLI Keyboard Trainer
 */
import { showMenu } from './ui/menu.js';
import { startTextMode } from './modes/textMode.js';
import { startLetterMode } from './modes/letterMode.js';
import { startLetterTrainer } from './modes/letterTrainer.js';
import { analyzeScores } from './score/scoreManager.js';

const MENU_OPTIONS = [
  { label: 'Letter Trainer Mode', description: 'Train specific keystrokes with custom settings', action: startLetterTrainer },
  { label: 'Normal Text Mode', description: 'Type real words/sentences in KPM mode', action: startTextMode },
  { label: 'Normal Letter Mode', description: 'Game with progressive levels and character sets', action: startLetterMode },
  { label: 'View Progress', description: 'Analyze your typing performance and improvements', action: analyzeScores }
];

showMenu(MENU_OPTIONS); 