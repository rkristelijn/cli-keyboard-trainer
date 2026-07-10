/**
 * Character sets and constraints for keyboard trainer.
 * All sets are exported for use in various modes and for future features.
 * @module charsets
 */

/** Lowercase alphabet */
export const lowercase = 'abcdefghijklmnopqrstuvwxyz';
/** Uppercase alphabet */
export const uppercase = lowercase.toUpperCase();
/** Left hand lowercase */
export const leftHandLowercase = 'qwertasdfgzxcvb';
/** Right hand lowercase */
export const rightHandLowercase = 'yuiophjklnm';
/** Left hand uppercase */
export const leftHandUppercase = leftHandLowercase.toUpperCase();
/** Right hand uppercase */
export const rightHandUppercase = rightHandLowercase.toUpperCase();
/** Left hand numbers */
export const leftHandNumbers = '12345';
/** Right hand numbers */
export const rightHandNumbers = '67890';
/** Left hand symbols */
export const leftHandSymbols = '!@#$%';
/** Right hand symbols */
export const rightHandSymbols = '^&*()';
/** All numbers */
export const numbers = '1234567890';
/** Curly brackets and similar */
export const curlies = '()[]{}<>';
/** Arrow keys */
export const arrows = '↑↓←→';
/** Math operators */
export const math = '+-*/%=';
/** Punctuation marks */
export const punctuation = ',.;:!?';
/** Quotes */
export const quotes = '"\'`';
/** Path characters */
export const pathChars = ['/', '\\', '_', '|', '~'];
/** Symbols */
export const symbols = '@#$%^&';
/** Whitespace characters */
export const whitespace = ['␣', '⇥', '⏎']; // Space, Tab, Enter
/** Backspace key */
export const backspace = '⌫';
/** Delete key */
export const del = '⌦';
/** Home/End keys */
export const homeend = ['↖', '↘'];
/** Page Up/Down keys */
export const pageUpDown = ['⇞', '⇟'];
/** Escape key */
export const escape = '⎋';
/** Media keys */
export const mediaKeys = ['⏮', '⏯', '⏭', '🔇', '🔉', '🔊'];
/** Function keys */
export const functionKeys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];

/**
 * Update character sets for letter mode based on level.
 * @param {number} level
 */
export function updateLetterModeCharsets(level, charsetOptions) {
  Object.keys(charsetOptions).forEach(key => {
    charsetOptions[key] = false;
  });
  charsetOptions.leftHandLowercase = true;
  charsetOptions.rightHandLowercase = true;
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

/**
 * Get a human-readable description for a charset option key.
 * @param {string} key
 * @returns {string}
 */
export function getSettingDescription(key) {
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