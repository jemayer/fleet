# Design: SCHIFFE VERSENKEN (Battleship CLI Game)

**Date**: 2026-02-13
**Platform**: Node.js CLI (zero external dependencies)
**Aesthetic**: 80s/90s arcade console, ANSI colors, ASCII art

---

## 1. Game Flow & Screens

The game progresses through these screens:

1. **Title Screen** — ASCII art "SCHIFFE VERSENKEN" in 3D retro font with ANSI colors. Menu: New Game / Highscores / Quit
2. **Difficulty Selection** — Choose Easy / Medium / Hard with arrow keys + Enter
3. **Ship Placement** — Player's grid shown. Navigate cursor with arrow keys, R to rotate, Enter to place. Ships placed one by one (Carrier -> Destroyer). Visual feedback: valid placement in green, invalid in red.
4. **Battle Phase** — Side-by-side grids: "YOUR FLEET" (left) and "ATTACK BOARD" (right). Arrow keys to move crosshair on attack board, Enter to fire. Hits/misses color-coded. AI takes turn after player. Status bar shows last action ("Hit!", "Miss!", "You sunk the Battleship!"). Ship inventory panel below both grids showing damage state for both sides.
5. **Game Over** — Win/loss announcement with stats (turns taken, ships remaining). Prompt for player name -> save to highscore. Option: Play Again / Main Menu / Quit.

---

## 2. Battle Phase Layout

```
+-----------------------------------------------------------+
|              SCHIFFE VERSENKEN                             |
+----------------------------+------------------------------+
|     YOUR FLEET             |       ATTACK BOARD           |
|   A B C D E F G H I J     |    A B C D E F G H I J      |
| 1 ~ ~ # # # # # ~ ~ ~    |  1 . . . . . . . . . .      |
| 2 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~    |  2 . . . X . . . . . .      |
| ...                       |  ...                         |
+----------------------------+------------------------------+
|  YOUR SHIPS                    ENEMY SHIPS                |
|  Carrier    [# # X # #]       Carrier    [# # # # #]    |
|  Battleship [# # # #]         Battleship [# # X #]      |
|  Cruiser    [# # #]           Cruiser    [# X X]        |
|  Submarine  [# # #]           Submarine  [# # #]        |
|  Destroyer  [X X] SUNK!       Destroyer  [X X] SUNK!    |
+-----------------------------------------------------------+
```

Both ship inventory panels use identical visual style:
- Green segments = intact
- Yellow/orange segments = hit
- Red + "SUNK!" = fully destroyed

---

## 3. Ship Definitions

| Ship       | Size |
|------------|------|
| Carrier    | 5    |
| Battleship | 4    |
| Cruiser    | 3    |
| Submarine  | 3    |
| Destroyer  | 2    |

---

## 4. Ship Placement Controls

- **Arrow keys**: Move cursor on grid
- **R**: Rotate ship (horizontal <-> vertical)
- **Enter**: Place ship at current position
- Visual feedback: valid placement highlighted green, invalid in red
- Ships placed sequentially: Carrier first, Destroyer last

---

## 5. Module Architecture

### `game.js` — Main entry point & game loop controller
- Owns the game state machine (title -> difficulty -> placement -> battle -> game over)
- Coordinates turns between player and AI
- Orchestrates all other modules

### `board.js` — Grid/board logic
- 10x10 grid data structure (cells: empty, ship, hit, miss)
- Ship placement validation (bounds checking, overlap detection)
- Shot processing (hit/miss determination, sunk detection)
- Two board instances per game: player's fleet board + tracking board for attacks

### `ship.js` — Ship definitions and state
- Ship types with names and sizes
- Tracks hit positions per ship
- Reports damage state (intact/damaged/sunk) for inventory display

### `ai.js` — Computer opponent
- Easy: pure random targeting (no repeat shots)
- Medium: random + hunt mode (on hit, target adjacent cells)
- Hard: random + hunt + smart targeting (follow the line of hits along a ship's axis)
- All levels share the same interface, difficulty controls targeting strategy

### `display.js` — ANSI rendering & UI
- Title screen ASCII art with 3D font effect
- Side-by-side grid rendering with color coding
- Ship inventory panel (both sides, same style)
- Status messages, menus, game over screen
- Screen clearing and cursor management

### `input.js` — Keyboard input handling
- Raw mode keypress listener (arrow keys, Enter, R, Escape, letter keys)
- Translates keypresses into game actions
- Menu navigation and grid cursor movement

### `highscore.js` — Persistent score tracking
- Read/write JSON file for highscores
- Stores: player name, win/loss, turns taken, difficulty, date
- Sorted display (fewest turns wins, grouped by difficulty)

---

## 6. Data Flow

```
                    game.js (state machine)
                   /    |    \         \
                  /     |     \         \
           input.js  board.js  ai.js  highscore.js
                  \     |     /
                   \    |    /
                   display.js
                       |
                    ship.js (used by board.js)
```

**Ship Placement:** input.js captures arrow/R/Enter -> game.js validates via board.js -> display.js redraws grid with cursor + placed ships

**Battle - Player Turn:** input.js captures cursor + Enter -> game.js calls board.js.processShot() on enemy board -> returns hit/miss/sunk -> display.js updates attack grid + enemy inventory

**Battle - AI Turn:** game.js calls ai.js.chooseTarget() -> board.js.processShot() on player board -> returns result -> ai.js updates internal state (for hunt mode) -> display.js updates fleet grid + player inventory

**Game Over:** game.js detects all ships sunk -> collects stats -> highscore.js saves -> display.js shows game over screen

---

## 7. Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Rendering | Full screen redraw via `process.stdout.write()` with ANSI escape codes | Simple, no partial update complexity |
| Input | `process.stdin` raw mode with `readline` keypress events | Non-blocking, event-driven |
| State machine | String-based states (`'title'`, `'difficulty'`, `'placement'`, `'battle'`, `'gameover'`) | Simple dispatch in game.js |
| AI fairness | No peeking at player board; decisions based on shot results only | Honest AI, satisfying gameplay |
| Highscore storage | `highscores.json` in project directory, sync read/write | No async complexity needed for CLI game |
| Language | German title ("SCHIFFE VERSENKEN"), English UI text | Retro flavor + accessibility |
| Grid display | Side-by-side (your fleet + attack board) | Classic Battleship overview |

---

## 8. Scope

**In scope:**
- Single player vs AI
- Three difficulty levels (Easy/Medium/Hard)
- Keyboard-driven controls throughout
- Persistent highscore system
- Retro arcade visual aesthetic

**Out of scope:**
- Multiplayer / network play
- Sound / audio
- Mouse input
- Configuration files
- Internationalization (beyond the German title)
