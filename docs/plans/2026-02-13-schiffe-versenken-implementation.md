# SCHIFFE VERSENKEN Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a fully playable Battleship CLI game with retro arcade aesthetic, three AI difficulty levels, and persistent highscores.

**Architecture:** 7 modules (ship, board, display, input, ai, highscore, game) built bottom-up. Pure data/logic modules first, then rendering, then input, then AI, then orchestration. Event-driven game loop using Node.js readline raw mode.

**Tech Stack:** Node.js (vanilla JS, zero external deps). Built-in modules: `readline`, `fs`, `node:test`, `node:assert`.

---

## Build Order & Dependencies

```
Task 1: ship.js          (no deps)
Task 2: board.js          (depends on: ship.js)
Task 3: display.js        (depends on: ship.js, board.js)
Task 4: input.js          (no deps)
Task 5: highscore.js      (no deps)
Task 6: ai.js             (depends on: board.js)
Task 7: game.js skeleton  (depends on: all above)
Task 8: ship placement    (depends on: game.js skeleton)
Task 9: battle phase      (depends on: ship placement)
Task 10: game over + highscore integration (depends on: battle phase)
Task 11: polish & README  (depends on: all above)
```

---

### Task 1: Ship Module

**Files:**
- Create: `ship.js`
- Create: `tests/ship.test.js`

**Step 1: Write the failing tests**

```javascript
// tests/ship.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const { SHIP_TYPES, Ship } = require('../ship');

describe('SHIP_TYPES', () => {
  it('defines 5 ship types with correct sizes', () => {
    assert.strictEqual(SHIP_TYPES.length, 5);
    assert.deepStrictEqual(SHIP_TYPES.map(s => [s.name, s.size]), [
      ['Carrier', 5],
      ['Battleship', 4],
      ['Cruiser', 3],
      ['Submarine', 3],
      ['Destroyer', 2],
    ]);
  });
});

describe('Ship', () => {
  it('creates a ship with position and orientation', () => {
    const ship = new Ship('Carrier', 5, { row: 0, col: 0 }, 'horizontal');
    assert.strictEqual(ship.name, 'Carrier');
    assert.strictEqual(ship.size, 5);
    assert.strictEqual(ship.orientation, 'horizontal');
  });

  it('returns all occupied segments for horizontal ship', () => {
    const ship = new Ship('Cruiser', 3, { row: 2, col: 4 }, 'horizontal');
    assert.deepStrictEqual(ship.getSegments(), [
      { row: 2, col: 4 },
      { row: 2, col: 5 },
      { row: 2, col: 6 },
    ]);
  });

  it('returns all occupied segments for vertical ship', () => {
    const ship = new Ship('Cruiser', 3, { row: 2, col: 4 }, 'vertical');
    assert.deepStrictEqual(ship.getSegments(), [
      { row: 2, col: 4 },
      { row: 3, col: 4 },
      { row: 4, col: 4 },
    ]);
  });

  it('tracks hits and reports damage', () => {
    const ship = new Ship('Destroyer', 2, { row: 0, col: 0 }, 'horizontal');
    assert.strictEqual(ship.isSunk(), false);
    assert.strictEqual(ship.hit(0), true);  // hit segment index 0
    assert.strictEqual(ship.isSunk(), false);
    assert.strictEqual(ship.hit(1), true);  // hit segment index 1
    assert.strictEqual(ship.isSunk(), true);
  });

  it('reports per-segment damage state', () => {
    const ship = new Ship('Cruiser', 3, { row: 0, col: 0 }, 'horizontal');
    ship.hit(1);
    assert.deepStrictEqual(ship.getDamage(), [false, true, false]);
  });

  it('rejects duplicate hits on same segment', () => {
    const ship = new Ship('Destroyer', 2, { row: 0, col: 0 }, 'horizontal');
    assert.strictEqual(ship.hit(0), true);
    assert.strictEqual(ship.hit(0), false); // already hit
  });

  it('hitAt checks by coordinate', () => {
    const ship = new Ship('Cruiser', 3, { row: 2, col: 4 }, 'horizontal');
    assert.strictEqual(ship.hitAt(2, 5), true);   // middle segment
    assert.strictEqual(ship.hitAt(2, 5), false);  // already hit
    assert.strictEqual(ship.hitAt(0, 0), false);  // not on this ship
  });

  it('occupies checks if coordinate is on this ship', () => {
    const ship = new Ship('Cruiser', 3, { row: 2, col: 4 }, 'horizontal');
    assert.strictEqual(ship.occupies(2, 4), true);
    assert.strictEqual(ship.occupies(2, 6), true);
    assert.strictEqual(ship.occupies(2, 7), false);
    assert.strictEqual(ship.occupies(3, 4), false);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `node --test tests/ship.test.js`
Expected: Multiple failures (module not found)

**Step 3: Implement ship.js**

```javascript
// ship.js
const SHIP_TYPES = [
  { name: 'Carrier', size: 5 },
  { name: 'Battleship', size: 4 },
  { name: 'Cruiser', size: 3 },
  { name: 'Submarine', size: 3 },
  { name: 'Destroyer', size: 2 },
];

class Ship {
  constructor(name, size, position, orientation) {
    this.name = name;
    this.size = size;
    this.position = position;       // { row, col }
    this.orientation = orientation;  // 'horizontal' | 'vertical'
    this.hits = new Array(size).fill(false);
  }

  getSegments() {
    const segments = [];
    for (let i = 0; i < this.size; i++) {
      segments.push({
        row: this.position.row + (this.orientation === 'vertical' ? i : 0),
        col: this.position.col + (this.orientation === 'horizontal' ? i : 0),
      });
    }
    return segments;
  }

  occupies(row, col) {
    return this.getSegments().some(s => s.row === row && s.col === col);
  }

  hit(segmentIndex) {
    if (this.hits[segmentIndex]) return false;
    this.hits[segmentIndex] = true;
    return true;
  }

  hitAt(row, col) {
    const segments = this.getSegments();
    const idx = segments.findIndex(s => s.row === row && s.col === col);
    if (idx === -1) return false;
    return this.hit(idx);
  }

  isSunk() {
    return this.hits.every(h => h);
  }

  getDamage() {
    return [...this.hits];
  }
}

module.exports = { SHIP_TYPES, Ship };
```

**Step 4: Run tests to verify they pass**

Run: `node --test tests/ship.test.js`
Expected: All tests pass

**Step 5: Commit**

```bash
git add ship.js tests/ship.test.js
git commit -m "feat: add ship module with types, placement, and damage tracking"
```

---

### Task 2: Board Module

**Files:**
- Create: `board.js`
- Create: `tests/board.test.js`

**Step 1: Write the failing tests**

```javascript
// tests/board.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const { Board } = require('../board');
const { SHIP_TYPES } = require('../ship');

describe('Board', () => {
  it('creates a 10x10 grid initialized to EMPTY', () => {
    const board = new Board();
    const grid = board.getGrid();
    assert.strictEqual(grid.length, 10);
    assert.strictEqual(grid[0].length, 10);
    assert.strictEqual(grid[0][0], Board.EMPTY);
  });

  it('places a ship on the grid', () => {
    const board = new Board();
    const result = board.placeShip('Destroyer', 2, { row: 0, col: 0 }, 'horizontal');
    assert.strictEqual(result, true);
    const grid = board.getGrid();
    assert.strictEqual(grid[0][0], Board.SHIP);
    assert.strictEqual(grid[0][1], Board.SHIP);
    assert.strictEqual(grid[0][2], Board.EMPTY);
  });

  it('rejects placement out of bounds', () => {
    const board = new Board();
    assert.strictEqual(board.placeShip('Carrier', 5, { row: 0, col: 7 }, 'horizontal'), false);
    assert.strictEqual(board.placeShip('Carrier', 5, { row: 7, col: 0 }, 'vertical'), false);
  });

  it('rejects overlapping placement', () => {
    const board = new Board();
    board.placeShip('Cruiser', 3, { row: 0, col: 0 }, 'horizontal');
    assert.strictEqual(board.placeShip('Destroyer', 2, { row: 0, col: 1 }, 'vertical'), false);
  });

  it('validates placement without placing', () => {
    const board = new Board();
    assert.strictEqual(board.canPlaceShip(5, { row: 0, col: 0 }, 'horizontal'), true);
    assert.strictEqual(board.canPlaceShip(5, { row: 0, col: 7 }, 'horizontal'), false);
  });

  it('processes a miss', () => {
    const board = new Board();
    const result = board.processShot(5, 5);
    assert.strictEqual(result.hit, false);
    assert.strictEqual(result.sunk, false);
    assert.strictEqual(result.shipName, null);
    assert.strictEqual(board.getGrid()[5][5], Board.MISS);
  });

  it('processes a hit', () => {
    const board = new Board();
    board.placeShip('Destroyer', 2, { row: 3, col: 3 }, 'horizontal');
    const result = board.processShot(3, 3);
    assert.strictEqual(result.hit, true);
    assert.strictEqual(result.sunk, false);
    assert.strictEqual(result.shipName, 'Destroyer');
    assert.strictEqual(board.getGrid()[3][3], Board.HIT);
  });

  it('detects ship sunk', () => {
    const board = new Board();
    board.placeShip('Destroyer', 2, { row: 0, col: 0 }, 'horizontal');
    board.processShot(0, 0);
    const result = board.processShot(0, 1);
    assert.strictEqual(result.sunk, true);
    assert.strictEqual(result.shipName, 'Destroyer');
  });

  it('detects all ships sunk', () => {
    const board = new Board();
    board.placeShip('Destroyer', 2, { row: 0, col: 0 }, 'horizontal');
    assert.strictEqual(board.allShipsSunk(), false);
    board.processShot(0, 0);
    board.processShot(0, 1);
    assert.strictEqual(board.allShipsSunk(), true);
  });

  it('rejects shot at already-shot cell', () => {
    const board = new Board();
    board.processShot(5, 5);
    const result = board.processShot(5, 5);
    assert.strictEqual(result.alreadyShot, true);
  });

  it('getShips returns all placed ships', () => {
    const board = new Board();
    board.placeShip('Destroyer', 2, { row: 0, col: 0 }, 'horizontal');
    board.placeShip('Cruiser', 3, { row: 2, col: 0 }, 'vertical');
    assert.strictEqual(board.getShips().length, 2);
  });

  it('placeShipsRandomly places all 5 ships without overlap', () => {
    const board = new Board();
    board.placeShipsRandomly();
    assert.strictEqual(board.getShips().length, 5);
    // Total ship cells: 5+4+3+3+2 = 17
    let shipCells = 0;
    const grid = board.getGrid();
    for (let r = 0; r < 10; r++)
      for (let c = 0; c < 10; c++)
        if (grid[r][c] === Board.SHIP) shipCells++;
    assert.strictEqual(shipCells, 17);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `node --test tests/board.test.js`
Expected: Failures (module not found)

**Step 3: Implement board.js**

Key implementation details:
- `Board` class with static constants: `EMPTY = 0`, `SHIP = 1`, `MISS = 2`, `HIT = 3`
- `grid`: 10x10 2D array
- `ships`: array of Ship instances
- `placeShip(name, size, position, orientation)`: validate then create Ship, mark grid
- `canPlaceShip(size, position, orientation)`: bounds + overlap check without placing
- `processShot(row, col)`: returns `{ hit, sunk, shipName, alreadyShot }`
- `allShipsSunk()`: check all ships
- `placeShipsRandomly()`: place all SHIP_TYPES at random valid positions
- `getGrid()`: return grid copy
- `getShips()`: return ships array

**Step 4: Run tests to verify they pass**

Run: `node --test tests/board.test.js`
Expected: All tests pass

**Step 5: Commit**

```bash
git add board.js tests/board.test.js
git commit -m "feat: add board module with grid, placement, and shot processing"
```

---

### Task 3: Display Module

**Files:**
- Create: `display.js`

This module is heavily visual — test by running the game and inspecting terminal output rather than unit tests.

**Step 1: Implement ANSI color helpers and screen utilities**

```javascript
// display.js - key constants and helpers
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
};

function clearScreen() { ... }   // \x1b[2J\x1b[H
function render(content) { ... } // process.stdout.write(clearScreen + content)
```

**Step 2: Implement ASCII art title**

Create the "SCHIFFE VERSENKEN" title using block characters and ANSI colors. Use a 3D shadow effect by offsetting a darker copy behind the main text. Target: eye-catching retro arcade header.

**Step 3: Implement menu rendering**

`renderMenu(items, selectedIndex)` — renders a vertical menu with the selected item highlighted (inverse colors or bracket markers).

**Step 4: Implement grid rendering**

`renderGrid(board, options)` — renders a 10x10 grid with:
- Column headers (A-J), row numbers (1-10)
- Cell colors: blue `~` for empty water, white `·` for unknown, red `X` for hit, gray `○` for miss
- Optional cursor highlight (for placement and targeting)
- `renderSideBySide(playerBoard, attackBoard, cursor)` — two grids next to each other

**Step 5: Implement ship inventory rendering**

`renderInventory(ships, label)` — renders the ship inventory panel:
- Ship name + bracket segments: `[■ ■ ◈ ■ ■]`
- Green `■` for intact, yellow `◈` for hit, red `✕` for sunk segments
- "SUNK!" label in red for fully destroyed ships

**Step 6: Implement placement screen**

`renderPlacement(board, currentShip, cursor, orientation)` — shows the grid with placed ships, current ship preview at cursor position (green if valid, red if invalid).

**Step 7: Implement battle screen**

`renderBattle(playerBoard, attackBoard, cursor, message, playerShips, enemyShips)` — composes: title bar + side-by-side grids + ship inventories + status message.

**Step 8: Implement game over screen**

`renderGameOver(won, stats)` — victory/defeat message with stats.

**Step 9: Manual visual test**

Create a temporary test script that calls each render function with sample data and verify terminal output looks correct.

**Step 10: Commit**

```bash
git add display.js
git commit -m "feat: add display module with ANSI rendering, grids, and retro UI"
```

---

### Task 4: Input Module

**Files:**
- Create: `input.js`

**Step 1: Implement input handler**

```javascript
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
    // Map raw keypresses to semantic actions:
    // arrow keys -> { action: 'move', direction: 'up'|'down'|'left'|'right' }
    // enter/return -> { action: 'select' }
    // 'r' -> { action: 'rotate' }
    // escape -> { action: 'back' }
    // letters a-j -> { action: 'letter', value: key.name }
    // numbers 0-9 -> { action: 'number', value: key.name }
  }

  stop() {
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
    process.stdin.pause();
  }
}

module.exports = { InputHandler };
```

**Step 2: Manual test** — create a temp script that logs translated keypresses.

**Step 3: Commit**

```bash
git add input.js
git commit -m "feat: add input module with raw keyboard handling"
```

---

### Task 5: Highscore Module

**Files:**
- Create: `highscore.js`
- Create: `tests/highscore.test.js`

**Step 1: Write failing tests**

```javascript
// tests/highscore.test.js
const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { Highscore } = require('../highscore');

const TEST_FILE = path.join(__dirname, 'test-highscores.json');

describe('Highscore', () => {
  let hs;
  beforeEach(() => { hs = new Highscore(TEST_FILE); });
  afterEach(() => { try { fs.unlinkSync(TEST_FILE); } catch {} });

  it('returns empty array when no file exists', () => {
    assert.deepStrictEqual(hs.load(), []);
  });

  it('saves and loads an entry', () => {
    hs.save({ name: 'ACE', won: true, turns: 42, difficulty: 'Hard', date: '2026-02-13' });
    const scores = hs.load();
    assert.strictEqual(scores.length, 1);
    assert.strictEqual(scores[0].name, 'ACE');
  });

  it('sorts by fewest turns (winners first)', () => {
    hs.save({ name: 'A', won: true, turns: 50, difficulty: 'Easy', date: '2026-02-13' });
    hs.save({ name: 'B', won: true, turns: 30, difficulty: 'Easy', date: '2026-02-13' });
    hs.save({ name: 'C', won: false, turns: 20, difficulty: 'Easy', date: '2026-02-13' });
    const scores = hs.load();
    assert.strictEqual(scores[0].name, 'B'); // fewest turns, won
    assert.strictEqual(scores[1].name, 'A');
  });

  it('limits to top 10 entries', () => {
    for (let i = 0; i < 15; i++) {
      hs.save({ name: `P${i}`, won: true, turns: i + 20, difficulty: 'Easy', date: '2026-02-13' });
    }
    assert.strictEqual(hs.load().length, 10);
  });
});
```

**Step 2: Run tests, verify they fail**

Run: `node --test tests/highscore.test.js`

**Step 3: Implement highscore.js**

- `Highscore` class with configurable file path
- `load()`: read JSON, parse, sort (wins first, then by turns ascending), return array
- `save(entry)`: load existing, append, sort, truncate to 10, write
- `getFormatted()`: return formatted string table for display

**Step 4: Run tests, verify they pass**

Run: `node --test tests/highscore.test.js`

**Step 5: Commit**

```bash
git add highscore.js tests/highscore.test.js
git commit -m "feat: add highscore module with persistent JSON storage"
```

---

### Task 6: AI Module

**Files:**
- Create: `ai.js`
- Create: `tests/ai.test.js`

**Step 1: Write failing tests**

```javascript
// tests/ai.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const { AI } = require('../ai');

describe('AI - Easy', () => {
  it('returns valid coordinates within 10x10 grid', () => {
    const ai = new AI('easy');
    for (let i = 0; i < 50; i++) {
      const { row, col } = ai.chooseTarget();
      assert.ok(row >= 0 && row < 10, `row ${row} out of bounds`);
      assert.ok(col >= 0 && col < 10, `col ${col} out of bounds`);
      ai.recordResult(row, col, false, false); // all misses
    }
  });

  it('never targets the same cell twice', () => {
    const ai = new AI('easy');
    const seen = new Set();
    for (let i = 0; i < 100; i++) {
      const { row, col } = ai.chooseTarget();
      const key = `${row},${col}`;
      assert.ok(!seen.has(key), `duplicate target: ${key}`);
      seen.add(key);
      ai.recordResult(row, col, false, false);
    }
  });
});

describe('AI - Medium', () => {
  it('targets adjacent cells after a hit', () => {
    const ai = new AI('medium');
    const { row, col } = ai.chooseTarget();
    ai.recordResult(row, col, true, false); // hit!
    // Next target should be adjacent to the hit
    const next = ai.chooseTarget();
    const isAdjacent = (Math.abs(next.row - row) + Math.abs(next.col - col)) === 1;
    assert.ok(isAdjacent, `expected adjacent to (${row},${col}), got (${next.row},${next.col})`);
  });

  it('returns to hunt mode after sinking a ship', () => {
    const ai = new AI('medium');
    // Simulate hitting and sinking a 2-cell ship at (5,5)-(5,6)
    const t1 = ai.chooseTarget();
    ai.recordResult(t1.row, t1.col, false, false);
    // Force a known hit scenario
    ai.recordResult(5, 5, true, false);
    ai._addTargetNeighbors(5, 5);
    ai.recordResult(5, 6, true, true); // sunk!
    ai._clearTargets();
    // Should be back in hunt mode (random)
    assert.strictEqual(ai._mode, 'hunt');
  });
});

describe('AI - Hard', () => {
  it('locks to axis after two hits in a line', () => {
    const ai = new AI('hard');
    // Simulate two horizontal hits
    ai.recordResult(3, 4, true, false);
    ai._addTargetNeighbors(3, 4);
    ai.recordResult(3, 5, true, false);
    ai._lockAxis(3, 4, 3, 5);
    // Next targets should be along the horizontal axis
    const next = ai.chooseTarget();
    assert.strictEqual(next.row, 3, 'should stay on same row');
  });
});
```

**Step 2: Run tests, verify they fail**

Run: `node --test tests/ai.test.js`

**Step 3: Implement ai.js**

Key implementation:
- `AI` class with `difficulty` ('easy' | 'medium' | 'hard')
- Internal state: `shotsFired` (Set), `targetQueue` (array of coords), `_mode` ('hunt' | 'target')
- `chooseTarget()`:
  - If `targetQueue` has entries → pop next target
  - Else → pick random untried cell
- `recordResult(row, col, hit, sunk)`:
  - Add to `shotsFired`
  - If hit and not sunk:
    - Medium: add 4 adjacent cells to `targetQueue` (filtered: in bounds, not already shot)
    - Hard: same, plus track hit chain for axis locking
  - If sunk: clear `targetQueue`, reset to hunt mode
- Hard mode extras: `_lockAxis()` — when 2+ hits align, filter queue to only cells on that axis

**Step 4: Run tests, verify they pass**

Run: `node --test tests/ai.test.js`

**Step 5: Commit**

```bash
git add ai.js tests/ai.test.js
git commit -m "feat: add AI module with easy/medium/hard difficulty strategies"
```

---

### Task 7: Game Skeleton

**Files:**
- Create: `game.js`

**Step 1: Implement state machine and main loop**

```javascript
// game.js - skeleton
const { InputHandler } = require('./input');
const { Board } = require('./board');
const { SHIP_TYPES } = require('./ship');
const { AI } = require('./ai');
const { Highscore } = require('./highscore');
const display = require('./display');

const STATES = {
  TITLE: 'title',
  DIFFICULTY: 'difficulty',
  PLACEMENT: 'placement',
  BATTLE: 'battle',
  GAMEOVER: 'gameover',
  HIGHSCORES: 'highscores',
};

class Game {
  constructor() {
    this.state = STATES.TITLE;
    this.input = new InputHandler();
    this.highscore = new Highscore();
    this.menuIndex = 0;
    this.difficultyIndex = 1; // default Medium
    this.playerBoard = null;
    this.enemyBoard = null;
    this.ai = null;
    this.cursor = { row: 0, col: 0 };
    this.message = '';
    this.turnCount = 0;
    // Placement state
    this.currentShipIndex = 0;
    this.placementOrientation = 'horizontal';
  }

  start() {
    this.input.start();
    this.input.onKey((action) => this.handleInput(action));
    this.render();
  }

  handleInput(action) {
    switch (this.state) {
      case STATES.TITLE: this.handleTitle(action); break;
      case STATES.DIFFICULTY: this.handleDifficulty(action); break;
      case STATES.PLACEMENT: this.handlePlacement(action); break;
      case STATES.BATTLE: this.handleBattle(action); break;
      case STATES.GAMEOVER: this.handleGameOver(action); break;
      case STATES.HIGHSCORES: this.handleHighscores(action); break;
    }
    this.render();
  }

  render() {
    // Dispatch to display functions based on current state
  }

  // ... state handlers (implemented in Tasks 8-10)
}

const game = new Game();
game.start();
```

**Step 2: Implement title screen handler**

Handle arrow up/down to navigate menu (New Game / Highscores / Quit), Enter to select. Wire to display.renderTitle().

**Step 3: Implement difficulty selection handler**

Handle arrow up/down for Easy/Medium/Hard, Enter to confirm. Transitions to placement state, creates boards and AI.

**Step 4: Manual test** — `node game.js` should show title, navigate menu, select difficulty.

**Step 5: Commit**

```bash
git add game.js
git commit -m "feat: add game skeleton with state machine, title screen, and difficulty selection"
```

---

### Task 8: Ship Placement Phase

**Files:**
- Modify: `game.js` (add placement handlers)
- Modify: `display.js` (add placement preview rendering if needed)

**Step 1: Implement handlePlacement()**

- Arrow keys: move cursor within grid bounds (0-9, 0-9)
- R: toggle `placementOrientation` between 'horizontal' and 'vertical'
- Enter: attempt `playerBoard.placeShip()` at cursor. If valid → advance `currentShipIndex`. If all 5 placed → transition to BATTLE state, run `enemyBoard.placeShipsRandomly()`.
- Display shows: grid with placed ships + ghost preview of current ship at cursor (green/red)

**Step 2: Wire display.renderPlacement()** — show grid with cursor, ship preview, ship name + "Place your [ShipName] (R to rotate)"

**Step 3: Manual test** — place all 5 ships using arrow keys

**Step 4: Commit**

```bash
git add game.js display.js
git commit -m "feat: add ship placement phase with cursor navigation and rotation"
```

---

### Task 9: Battle Phase

**Files:**
- Modify: `game.js` (add battle handlers)

**Step 1: Implement handleBattle()**

- Arrow keys: move cursor on attack board
- Enter: fire shot at cursor position
  - Call `enemyBoard.processShot(row, col)`
  - Update message ("Hit!", "Miss!", "You sunk the [name]!")
  - Check `enemyBoard.allShipsSunk()` → GAMEOVER (win)
  - Then AI turn: `ai.chooseTarget()` → `playerBoard.processShot()` → `ai.recordResult()`
  - Update message with AI result
  - Check `playerBoard.allShipsSunk()` → GAMEOVER (loss)
  - Increment `turnCount`

**Step 2: Wire display.renderBattle()** — side-by-side grids + ship inventories + status message

**Step 3: Add brief delay for AI turn** — use `setTimeout` so player sees their shot result before AI shoots (e.g., 500ms pause)

**Step 4: Manual test** — play through several turns, verify hits/misses display correctly, verify ship inventory updates

**Step 5: Commit**

```bash
git add game.js display.js
git commit -m "feat: add battle phase with player shooting and AI turns"
```

---

### Task 10: Game Over & Highscore Integration

**Files:**
- Modify: `game.js` (add gameover + highscore handlers)

**Step 1: Implement handleGameOver()**

- Display win/loss message with stats (turns, ships remaining)
- Prompt for player name (capture letter keypresses to build a name string, Enter to confirm)
- Save to highscore
- Show menu: Play Again / Main Menu / Quit

**Step 2: Implement handleHighscores()**

- Display formatted highscore table from `highscore.getFormatted()`
- Any key returns to title screen

**Step 3: Wire "Play Again"** — reset all game state, transition to DIFFICULTY

**Step 4: Manual test** — play a full game to completion, enter name, verify highscore saved, check Highscores from main menu

**Step 5: Commit**

```bash
git add game.js
git commit -m "feat: add game over screen, name entry, and highscore integration"
```

---

### Task 11: Polish & README

**Files:**
- Create: `README.md`
- Modify: `display.js` (visual polish)

**Step 1: Enhance visual polish**

- Refine ASCII art title (3D shadow effect, color gradient)
- Add box-drawing characters for borders
- Ensure consistent spacing and alignment
- Test in different terminal sizes (minimum 80 columns)

**Step 2: Write README.md**

```markdown
# SCHIFFE VERSENKEN

A classic Battleship game for the terminal with retro 80s/90s arcade aesthetics.

## How to Run

\`\`\`bash
node game.js
\`\`\`

Requires Node.js 18+. No dependencies to install.

## How to Play

[Game rules, keyboard controls, difficulty levels, highscores]

## Controls

| Key | Action |
|-----|--------|
| Arrow keys | Navigate cursor / menu |
| Enter | Confirm / Fire |
| R | Rotate ship (during placement) |
| Escape | Back / Cancel |

## Difficulty Levels

- **Easy**: AI fires randomly
- **Medium**: AI hunts adjacent cells after a hit
- **Hard**: AI follows ship axis after consecutive hits
```

**Step 3: Run all tests**

Run: `node --test tests/*.test.js`
Expected: All pass

**Step 4: Full manual playthrough** — play complete game on each difficulty

**Step 5: Commit**

```bash
git add README.md display.js
git commit -m "docs: add README and polish visual presentation"
```

---

## Summary: 11 Tasks, ~15 Commits

| Task | Module | Estimated Complexity |
|------|--------|---------------------|
| 1 | ship.js | Low |
| 2 | board.js | Medium |
| 3 | display.js | High (visual iteration) |
| 4 | input.js | Low |
| 5 | highscore.js | Low |
| 6 | ai.js | Medium |
| 7 | game.js skeleton | Medium |
| 8 | Ship placement | Medium |
| 9 | Battle phase | High |
| 10 | Game over + highscores | Medium |
| 11 | Polish + README | Low |
