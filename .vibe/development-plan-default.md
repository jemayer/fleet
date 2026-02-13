# Development Plan: SCHIFFE VERSENKEN (Battleship CLI Game)

*Generated on 2026-02-13 by Vibe Feature MCP*
*Workflow: [greenfield](https://mrsimpson.github.io/responsible-vibe-mcp/workflows/greenfield)*

## Goal
Build a classic Battleship game ("Schiffe versenken") as a Node.js CLI application with zero dependencies, featuring an 80s/90s arcade console aesthetic, AI opponents with difficulty levels, and a persistent highscore system.

## Key Decisions
- Ship placement via arrow keys + R to rotate + Enter (arcade-style, not coordinate typing)
- AI difficulty via honest hunt patterns (no cheating): Easy=random, Medium=random+hunt, Hard=random+hunt+smart
- Side-by-side grid layout (YOUR FLEET left, ATTACK BOARD right)
- Ship inventory panels below grids, both sides identical visual style
- German title "SCHIFFE VERSENKEN", English UI text
- Full screen redraw rendering (clear + rebuild each frame)
- Event-driven game loop (keypress-triggered, not frame-based)
- Synchronous file I/O for highscores (simplicity over async)

## Notes
- Zero external dependencies — only Node.js built-in modules (readline, fs, etc.)
- Direct execution via `node game.js`
- Retro 80s/90s arcade aesthetic using ANSI color codes and ASCII art
- Keyboard-driven controls (arrow keys, letters, enter)
- Use Beans (https://github.com/hmans/beans) for task management

## Ideation
### Tasks

### Completed
- [x] Created development plan file
- [x] Define core game mechanics and user flow (5 screens: title, difficulty, placement, battle, game over)
- [x] Identify building blocks and module responsibilities (7 modules: game, board, ship, ai, display, input, highscore)
- [x] Document requirements, architecture, and design docs
- [x] Define what's in scope and out of scope
- [x] Design validated and saved to docs/plans/2026-02-13-schiffe-versenken-design.md

## Architecture

### Phase Entrance Criteria:
- [x] Core game mechanics and user flow are clearly defined
- [x] All building blocks and their responsibilities are identified
- [x] Requirements document is filled in with concrete features
- [x] Scope boundaries (in/out) are documented

### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

## Plan

### Phase Entrance Criteria:
- [ ] Architecture document describes all modules and their relationships
- [ ] Design document specifies file structure, core patterns, and data flow
- [ ] Key technical decisions are documented (input handling, AI strategy, rendering approach)
- [ ] Module interfaces/responsibilities are clear enough to implement independently

### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

## Code

### Phase Entrance Criteria:
- [ ] Implementation plan has detailed, ordered tasks for each module
- [ ] Build order is defined with dependencies between modules
- [ ] Each task is small enough for an atomic commit
- [ ] Beans tickets are created for all planned work items

### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

## Finalize

### Phase Entrance Criteria:
- [ ] All core features are implemented and working
- [ ] Game is fully playable from start to finish
- [ ] AI difficulty levels (Easy/Medium/Hard) work correctly
- [ ] Highscore system persists between sessions
- [ ] README is written with play instructions and keyboard controls
- [ ] Git history shows atomic, meaningful commits

### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
