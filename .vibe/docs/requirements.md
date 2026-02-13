# Requirements: SCHIFFE VERSENKEN

**Date**: 2026-02-13
**Game**: Schiffe versenken (Battleship)

---

## Core Game Principle

**The Main Idea**: A player places ships on a grid and takes turns firing at the computer's hidden fleet, trying to sink all enemy ships before the computer sinks theirs.

**What Makes It Fun**: The tension of hunting invisible ships, the satisfaction of landing hits, and the strategic challenge of outsmarting the AI.

**Game Type**: Turn-based strategy (classic Battleship)

---

## Version 1: Must-Have Features

### 1. Retro Title Screen
- ASCII art "SCHIFFE VERSENKEN" with 3D font effect and ANSI colors
- Main menu: New Game / Highscores / Quit
- Keyboard navigation (arrow keys + Enter)

### 2. Ship Placement Phase
- 10x10 grid display with coordinate labels (A-J, 1-10)
- Arrow key cursor navigation
- R key to rotate ship orientation (horizontal/vertical)
- Enter to confirm placement
- Visual feedback: green for valid, red for invalid placement
- Ships placed sequentially: Carrier(5), Battleship(4), Cruiser(3), Submarine(3), Destroyer(2)

### 3. Battle Phase
- Side-by-side grid display: YOUR FLEET (left) + ATTACK BOARD (right)
- Arrow key crosshair movement on attack board
- Enter to fire at selected cell
- Color-coded results: blue=water/miss, red=hit, dark red=sunk
- Ship inventory below both grids showing damage state (intact/damaged/sunk)
- Both inventories use identical visual style
- Status messages: "Hit!", "Miss!", "You sunk the [ship name]!"
- AI takes turn after player fires

### 4. AI Opponent with Difficulty Levels
- Difficulty selection screen before placement (Easy/Medium/Hard)
- Easy: pure random targeting (no repeat shots)
- Medium: random + hunt adjacent cells on hit
- Hard: random + hunt + smart axis-following on consecutive hits
- AI places its own ships randomly (valid placement)

### 5. Win/Loss & Game Over
- Game ends when all ships of one side are sunk
- Victory/defeat announcement with stats (turns taken, ships remaining)
- Prompt for player name

### 6. Highscore System
- Persistent JSON file storage (highscores.json)
- Tracks: player name, win/loss, turns taken, difficulty level, date
- Viewable from main menu
- Sorted by winners first, then by fewest turns (top 10)

### 7. Full Keyboard Controls
- All interaction via keyboard (no mouse, no typed coordinates)
- Arrow keys for navigation everywhere
- Enter for confirmation/selection
- R for ship rotation during placement
- Escape for back/cancel where appropriate

---

## How We Know Version 1 is Done

- [x] Game launches and shows retro ASCII title screen
- [x] Player can select difficulty with keyboard
- [x] Player can place all 5 ships using arrow keys + rotate
- [x] Battle phase shows side-by-side grids with ship inventories
- [x] Player can fire at enemy grid and see hit/miss results
- [x] AI opponent fires back with appropriate difficulty behavior
- [x] Game detects win/loss and shows game over screen
- [x] Highscores save to file and display from main menu
- [x] All controls are keyboard-driven (no typing coordinates)

---

## Out of Scope

- Multiplayer / network play
- Sound / audio effects
- Mouse input
- Configuration files / settings persistence
- Internationalization (beyond German title)
- Ship placement undo (place next ship or restart placement)
