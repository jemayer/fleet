---
# fleet-k4mv
title: Difficulty islands and fleet variations
status: completed
type: feature
priority: normal
created_at: 2026-03-24T14:00:00Z
updated_at: 2026-03-24T16:00:00Z
---

Make difficulty levels affect the human player's challenge — not just the AI's smartness. Each difficulty now varies the fleet composition and introduces island obstacles on the board, so turns-to-win naturally scales with difficulty and the per-difficulty highscore tabs become meaningful.

## Design

### Easy
- **Fleet**: 6 ships — Carrier(5), Battleship(4), Cruiser(3), Submarine(3), Destroyer(2), Destroyer II(2) = **19 cells**
- **Islands**: ~4 clustered 2x2 island groups, reducing playable area to ~80 cells
- **Density**: ~24% — high target density, easier to stumble onto hits
- **AI**: Random shots (unchanged)

### Medium
- **Fleet**: 5 ships — Carrier(5), Battleship(4), Cruiser(3), Submarine(3), Destroyer(2) = **17 cells** (current game, unchanged)
- **Islands**: None — classic open ocean
- **Density**: 17%
- **AI**: Hunt/target (unchanged)

### Hard
- **Fleet**: 4 ships — Battleship(4), Cruiser(3), Submarine(3), Destroyer(2) = **12 cells** (no Carrier)
- **Islands**: ~8 scattered single-cell islands that break up search patterns without shrinking the ocean much
- **Density**: ~13% — lots of empty water, finding ships takes real effort
- **AI**: Hunt/target with axis-lock (unchanged)

### Island rendering
- Grid cell: colored `▲` using `fgRgb(139, 105, 20)` (sandy brown), consistent with existing single-width cell characters (`~`, `·`, `█`, `✖`, `○`)
- Emojis (🏝️) may be used in UI text/labels outside the grid where alignment doesn't matter
- Islands are visible on both player and enemy boards (known terrain, not hidden)
- Ships cannot be placed on island cells
- Shots cannot target island cells (or are simply ignored/blocked)

### Board changes
- Add `Board.ISLAND` cell type
- New `Board` constructor option or method to place islands based on difficulty config
- `placeShipsRandomly()` must respect island cells
- `canPlaceShip()` must reject positions overlapping islands

### Difficulty config
- Extract fleet and island configuration into a per-difficulty config object (ship list, island count, island pattern style)
- Pass difficulty config to `Board` and `Game.startNewGame()`

## Motivation

Currently difficulty only controls AI targeting intelligence, which doesn't affect the player's own hunt at all. A 40-turn win on Easy and a 40-turn win on Hard are identical achievements from the player's perspective. This change makes each difficulty a genuinely different experience and gives the highscore tabs real meaning.
