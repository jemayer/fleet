// game.js
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

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const MENU_ITEMS = ['New Game', 'Highscores', 'Quit'];

class Game {
  constructor() {
    this.state = STATES.TITLE;
    this.input = new InputHandler();
    this.highscore = new Highscore();
    this.menuIndex = 0;
    this.difficultyIndex = 1; // default Medium
    // Game state (initialized when starting a new game)
    this.playerBoard = null;
    this.enemyBoard = null;
    this.ai = null;
    this.cursor = { row: 0, col: 0 };
    this.message = '';
    this.turnCount = 0;
    // Placement state
    this.currentShipIndex = 0;
    this.placementOrientation = 'horizontal';
    // Game over state
    this.playerName = '';
    this.gameOverMenuIndex = 0;
    this.won = false;
    this.nameEntered = false;
  }

  start() {
    process.stdout.write(display.hideCursor());
    process.on('exit', () => process.stdout.write(display.showCursor()));
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
    let content;
    switch (this.state) {
      case STATES.TITLE:
        content = display.renderMenu(MENU_ITEMS, this.menuIndex);
        break;
      case STATES.DIFFICULTY:
        content = display.renderDifficulty(this.difficultyIndex);
        break;
      case STATES.HIGHSCORES:
        content = display.renderHighscores(this.highscore.load());
        break;
      case STATES.PLACEMENT: {
        const shipType = SHIP_TYPES[this.currentShipIndex];
        content = display.renderPlacement(
          this.playerBoard,
          shipType.name,
          shipType.size,
          this.cursor,
          this.placementOrientation,
          this.currentShipIndex
        );
        break;
      }
      case STATES.BATTLE:
        content = display.renderBattle(
          this.playerBoard,
          this.enemyBoard,
          this.cursor,
          this.message,
          this.turnCount
        );
        break;
      case STATES.GAMEOVER: {
        const stats = {
          turns: this.turnCount,
          shipsRemaining: this.playerBoard.getShips().filter(s => !s.isSunk()).length,
          difficulty: this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1),
        };
        content = display.renderGameOver(this.won, stats, this.playerName, this.gameOverMenuIndex, this.nameEntered);
        break;
      }
    }
    display.render(content);
  }

  // --- Title Screen ---
  handleTitle(action) {
    if (action.action === 'move') {
      if (action.direction === 'up') this.menuIndex = Math.max(0, this.menuIndex - 1);
      if (action.direction === 'down') this.menuIndex = Math.min(MENU_ITEMS.length - 1, this.menuIndex + 1);
    }
    if (action.action === 'select') {
      switch (this.menuIndex) {
        case 0: // New Game
          this.state = STATES.DIFFICULTY;
          this.difficultyIndex = 1;
          break;
        case 1: // Highscores
          this.state = STATES.HIGHSCORES;
          break;
        case 2: // Quit
          process.stdout.write(display.showCursor());
          process.exit(0);
      }
    }
  }

  // --- Difficulty Selection ---
  handleDifficulty(action) {
    if (action.action === 'move') {
      if (action.direction === 'up') this.difficultyIndex = Math.max(0, this.difficultyIndex - 1);
      if (action.direction === 'down') this.difficultyIndex = Math.min(2, this.difficultyIndex + 1);
    }
    if (action.action === 'select') {
      this.startNewGame(DIFFICULTIES[this.difficultyIndex]);
    }
    if (action.action === 'back') {
      this.state = STATES.TITLE;
    }
  }

  startNewGame(difficulty) {
    this.playerBoard = new Board();
    this.enemyBoard = new Board();
    this.enemyBoard.placeShipsRandomly();
    this.ai = new AI(difficulty);
    this.difficulty = difficulty;
    this.cursor = { row: 0, col: 0 };
    this.currentShipIndex = 0;
    this.placementOrientation = 'horizontal';
    this.message = '';
    this.turnCount = 0;
    this.playerName = '';
    this.gameOverMenuIndex = 0;
    this.nameEntered = false;
    this.state = STATES.PLACEMENT;
  }

  // --- Highscores ---
  handleHighscores(action) {
    // Any key returns to title
    this.state = STATES.TITLE;
  }

  // --- Ship Placement ---
  handlePlacement(action) {
    const shipType = SHIP_TYPES[this.currentShipIndex];

    if (action.action === 'move') {
      // Move cursor within grid bounds
      if (action.direction === 'up') this.cursor.row = Math.max(0, this.cursor.row - 1);
      if (action.direction === 'down') this.cursor.row = Math.min(9, this.cursor.row + 1);
      if (action.direction === 'left') this.cursor.col = Math.max(0, this.cursor.col - 1);
      if (action.direction === 'right') this.cursor.col = Math.min(9, this.cursor.col + 1);
    }

    if (action.action === 'rotate') {
      this.placementOrientation = this.placementOrientation === 'horizontal' ? 'vertical' : 'horizontal';
    }

    if (action.action === 'select') {
      // Try to place ship at cursor position
      const placed = this.playerBoard.placeShip(
        shipType.name,
        shipType.size,
        { row: this.cursor.row, col: this.cursor.col },
        this.placementOrientation
      );

      if (placed) {
        this.currentShipIndex++;
        if (this.currentShipIndex >= SHIP_TYPES.length) {
          // All ships placed — transition to battle
          this.cursor = { row: 0, col: 0 };
          this.state = STATES.BATTLE;
        }
      }
      // If not placed (invalid position), do nothing — player sees red preview
    }

    if (action.action === 'back') {
      this.state = STATES.TITLE;
    }
  }

  handleBattle(action) {
    if (action.action === 'move') {
      if (action.direction === 'up') this.cursor.row = Math.max(0, this.cursor.row - 1);
      if (action.direction === 'down') this.cursor.row = Math.min(9, this.cursor.row + 1);
      if (action.direction === 'left') this.cursor.col = Math.max(0, this.cursor.col - 1);
      if (action.direction === 'right') this.cursor.col = Math.min(9, this.cursor.col + 1);
    }

    if (action.action === 'select') {
      // Player fires at enemy board
      const result = this.enemyBoard.processShot(this.cursor.row, this.cursor.col);

      if (result.alreadyShot) {
        this.message = 'Already fired there! Choose another target.';
        return;
      }

      this.turnCount++;

      if (result.sunk) {
        this.message = 'You sunk the ' + result.shipName + '!';
      } else if (result.hit) {
        this.message = 'Hit!';
      } else {
        this.message = 'Miss!';
      }

      // Check win
      if (this.enemyBoard.allShipsSunk()) {
        this.won = true;
        this.state = STATES.GAMEOVER;
        return;
      }

      // AI turn
      this.doAiTurn();
    }
  }

  doAiTurn() {
    const target = this.ai.chooseTarget();
    const result = this.playerBoard.processShot(target.row, target.col);
    this.ai.recordResult(target.row, target.col, result.hit, result.sunk);

    // Append AI result to message
    let aiMsg;
    if (result.sunk) {
      aiMsg = 'Enemy sunk your ' + result.shipName + '!';
    } else if (result.hit) {
      aiMsg = 'Enemy hit your fleet!';
    } else {
      aiMsg = 'Enemy missed.';
    }
    this.message += '  |  ' + aiMsg;

    // Check loss
    if (this.playerBoard.allShipsSunk()) {
      this.won = false;
      this.state = STATES.GAMEOVER;
    }
  }

  handleGameOver(action) {
    if (!this.nameEntered) {
      // Name entry mode
      if (action.action === 'letter') {
        if (this.playerName.length < 10) {
          this.playerName += action.value.toUpperCase();
        }
      }
      if (action.action === 'number') {
        if (this.playerName.length < 10) {
          this.playerName += action.value;
        }
      }
      if (action.action === 'backspace') {
        this.playerName = this.playerName.slice(0, -1);
      }
      if (action.action === 'select' && this.playerName.length > 0) {
        // Save highscore
        this.highscore.save({
          name: this.playerName,
          won: this.won,
          turns: this.turnCount,
          difficulty: this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1),
          date: new Date().toISOString().split('T')[0],
        });
        this.nameEntered = true;
        this.gameOverMenuIndex = 0;
      }
    } else {
      // Menu mode: Play Again / Main Menu / Quit
      if (action.action === 'move') {
        if (action.direction === 'up') this.gameOverMenuIndex = Math.max(0, this.gameOverMenuIndex - 1);
        if (action.direction === 'down') this.gameOverMenuIndex = Math.min(2, this.gameOverMenuIndex + 1);
      }
      if (action.action === 'select') {
        switch (this.gameOverMenuIndex) {
          case 0: // Play Again
            this.startNewGame(this.difficulty);
            break;
          case 1: // Main Menu
            this.state = STATES.TITLE;
            this.menuIndex = 0;
            break;
          case 2: // Quit
            process.stdout.write(display.showCursor());
            process.exit(0);
        }
      }
    }
  }
}

const game = new Game();
game.start();
