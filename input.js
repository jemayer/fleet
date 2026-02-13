// input.js
const readline = require('readline');

class InputHandler {
  constructor() {
    this.listener = null;
  }

  start() {
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    process.stdin.on('keypress', (str, key) => {
      if (key.ctrl && key.name === 'c') process.exit();
      if (this.listener) this.listener(this._translate(key));
    });
    process.stdin.resume();
  }

  onKey(callback) {
    this.listener = callback;
  }

  _translate(key) {
    const name = key.name;

    // Arrow keys -> move actions with direction
    if (name === 'up' || name === 'down' || name === 'left' || name === 'right') {
      return { action: 'move', direction: name };
    }

    // Enter/return -> select
    if (name === 'return') {
      return { action: 'select' };
    }

    // R key -> rotate (for ship placement)
    if (name === 'r') {
      return { action: 'rotate' };
    }

    // Escape -> back
    if (name === 'escape') {
      return { action: 'back' };
    }

    // Backspace -> backspace (for name entry)
    if (name === 'backspace') {
      return { action: 'backspace' };
    }

    // Letters a-z -> letter with value
    if (name && name.length === 1 && name >= 'a' && name <= 'z') {
      return { action: 'letter', value: name };
    }

    // Numbers 0-9 -> number with value
    if (name && name.length === 1 && name >= '0' && name <= '9') {
      return { action: 'number', value: name };
    }

    // Anything else -> unknown
    return { action: 'unknown', key };
  }

  stop() {
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
    process.stdin.pause();
  }
}

module.exports = { InputHandler };
