/**
 * Utility functions for keyboard trainer.
 * @module utils
 */

/**
 * Get a random element from an array.
 * @param {Array} arr
 * @returns {*}
 */
export function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Format elapsed time in minutes.
 * @param {number} ms
 * @returns {string}
 */
export function formatMinutes(ms) {
  return (ms / 1000 / 60).toFixed(2) + ' min';
} 