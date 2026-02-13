# Design: SCHIFFE VERSENKEN

**Game**: Schiffe versenken (Battleship)
**Platform**: Node.js CLI
**Date**: 2026-02-13

---

## Core Concepts

### State (Memory)
The game tracks:
- **Game state**: which screen/phase is active (title, difficulty, placement, battle, gameover)
- **Board state**: two 10x10 grids per player (fleet grid + tracking grid)
- **Ship state**: position, orientation, and hit segments for each of the 5 ships
- **AI state**: shot history, current hunt targets (for Medium/Hard)
- **UI state**: cursor position, selected menu item, current ship being placed

### Game Loop
Event-driven (not frame-based):
1. Wait for keypress
2. Process input based on current game state
3. Update game state (move cursor, fire shot, place ship, etc.)
4. Redraw screen
5. If AI turn: compute AI move, update state, redraw

### Rendering
Full screen redraw approach:
1. Clear terminal (`\x1b[2J\x1b[H`)
2. Build complete frame as string
3. Write to stdout in one call (`process.stdout.write()`)
4. ANSI escape codes for colors and positioning

---

## Usage of Libraries

**None.** Zero external dependencies. Only Node.js built-ins:
- `readline` — keypress event handling in raw mode
- `fs` — highscore file read/write
- `process.stdin` / `process.stdout` — terminal I/O

---

## File Structure

```
fleet/
  +-- game.js        <- Main entry point, state machine, game loop
  +-- board.js       <- 10x10 grid logic, placement validation, shot processing
  +-- ship.js        <- Ship definitions (types, sizes), damage tracking
  +-- ai.js          <- Computer opponent (Easy/Medium/Hard strategies)
  +-- display.js     <- ANSI rendering, ASCII art, grid drawing, menus
  +-- input.js       <- Keyboard input handling (raw mode, keypress events)
  +-- highscore.js   <- Persistent JSON highscore read/write/display
  +-- README.md      <- How to run, play, and keyboard controls
```

### Module Responsibilities

**game.js**: Owns the state machine. Imports and coordinates all other modules. Contains the main game loop. Entry point: `node game.js`.

**board.js**: Exports a Board class. Manages a 10x10 grid. Methods: `placeShip()`, `processShot()`, `allShipsSunk()`, `getGrid()`. Does not know about rendering.

**ship.js**: Exports ship type definitions (name, size) and a Ship class that tracks position, orientation, and hit state. Methods: `hit(position)`, `isSunk()`, `getSegments()`.

**ai.js**: Exports an AI class constructed with difficulty level. Method: `chooseTarget(shotHistory)` returns coordinates. Internally manages hunt queue for Medium/Hard.

**display.js**: Pure rendering functions. Takes game state as input, returns strings. No side effects except writing to stdout. Handles ANSI color codes, cursor positioning, screen clearing.

**input.js**: Sets up readline interface in raw mode. Emits semantic events (e.g., 'move', 'fire', 'rotate', 'select', 'back') rather than raw keycodes.

**highscore.js**: Reads/writes `highscores.json`. Methods: `load()`, `save(entry)`, `getFormatted()`. Creates file on first save.

---

## Data Flow by Phase

### Ship Placement
```
Keypress -> input.js -> game.js -> board.js (validate) -> display.js (redraw)
```

### Battle - Player Turn
```
Keypress (Enter) -> input.js -> game.js -> board.js.processShot(enemyBoard)
  -> {hit, miss, sunk, shipName} -> display.js (update grids + inventory)
```

### Battle - AI Turn
```
game.js -> ai.js.chooseTarget() -> board.js.processShot(playerBoard)
  -> result -> ai.js (update hunt state) -> display.js (update grids + inventory)
```

### Game Over
```
board.js.allShipsSunk() -> game.js (collect stats)
  -> highscore.js.save() -> display.js (show game over)
```
