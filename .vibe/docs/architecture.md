# Architecture: SCHIFFE VERSENKEN

**Game**: Schiffe versenken (Battleship)
**Platform**: Node.js CLI (zero dependencies)
**Created**: 2026-02-13

---

## Platform Decision

**We chose Node.js CLI because:**

- Zero dependency requirement — only built-in modules (readline, fs)
- Direct execution via `node game.js` — no build tooling
- Full control over terminal rendering via ANSI escape codes
- Perfect for retro text-mode aesthetic

---

## The Big Picture

```
┌─────────────────────────────────────────┐
│           GAME.JS (State Machine)       │
│      Title → Difficulty → Placement     │
│           → Battle → Game Over          │
└──────────┬──────────┬──────────┬────────┘
           │          │          │
     ┌─────┘    ┌─────┘    ┌────┘
     v          v          v
┌─────────┐ ┌─────────┐ ┌─────────┐
│INPUT.JS │ │BOARD.JS │ │  AI.JS  │
│Keyboard │ │Grid &   │ │Computer │
│Events   │ │Ships    │ │Opponent │
└────┬────┘ └────┬────┘ └────┬────┘
     │           │            │
     │      ┌────┘            │
     │      v                 │
     │ ┌─────────┐            │
     │ │ SHIP.JS │            │
     │ │Ship Data│            │
     │ └─────────┘            │
     │      │                 │
     └──────┼─────────────────┘
            v
     ┌──────────────┐     ┌──────────────┐
     │ DISPLAY.JS   │     │HIGHSCORE.JS  │
     │ ANSI Render  │     │JSON Persist  │
     └──────────────┘     └──────────────┘
```

---

## Building Blocks

### game.js — Game Manager
**Responsibilities:**
- Owns the state machine (title, difficulty, placement, battle, gameover, highscores)
- Coordinates turns between player and AI
- Orchestrates all other modules
- Detects win/loss conditions

### board.js — Grid & Board Logic
**Responsibilities:**
- 10x10 grid data structure (cells: empty, ship, hit, miss)
- Ship placement validation (bounds, overlaps)
- Shot processing (hit/miss/sunk detection)
- Two instances per game: player fleet + attack tracking

### ship.js — Ship Definitions & State
**Responsibilities:**
- Ship types with names and sizes
- Tracks hit positions per ship
- Reports damage state (intact/damaged/sunk)

### ai.js — Computer Opponent
**Responsibilities:**
- Three difficulty strategies (Easy/Medium/Hard)
- Target selection based on shot history only (no cheating)
- Hunt mode state management

### display.js — ANSI Rendering & UI
**Responsibilities:**
- ASCII art title screen with 3D font effects
- Side-by-side grid rendering with colors
- Ship inventory panels (both sides, same style)
- Menus, status messages, game over screen

### input.js — Keyboard Input
**Responsibilities:**
- Raw mode keypress listener
- Translates keypresses to game actions
- Menu navigation and grid cursor movement

### highscore.js — Score Persistence
**Responsibilities:**
- Read/write highscores.json
- Store name, result, turns, difficulty, date
- Sorted display by difficulty and turns

---

## Key Decisions

**Decision 1: Full screen redraw rendering**
- **What**: Clear and redraw entire screen each frame
- **Why**: Simpler than partial updates, no cursor tracking bugs
- **Impact**: Clean visual output, slight flicker acceptable for retro feel

**Decision 2: Honest AI (no cheating)**
- **What**: AI decisions based only on shot results, never peeks at player board
- **Why**: Fair gameplay is more satisfying
- **Impact**: Harder difficulty comes from smarter strategy, not unfair advantage

**Decision 3: Synchronous file I/O for highscores**
- **What**: Use fs.readFileSync/writeFileSync
- **Why**: CLI game doesn't need async; simpler code
- **Impact**: Momentary block on save is imperceptible
