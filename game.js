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
      // Placement, Battle, GameOver will be added in Tasks 8-10
      default:
        content = 'State: ' + this.state + ' (coming soon)';
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
    this.state = STATES.PLACEMENT;
  }

  // --- Highscores ---
  handleHighscores(action) {
    // Any key returns to title
    this.state = STATES.TITLE;
  }

  // --- Stubs for Tasks 8-10 ---
  handlePlacement(action) {
    // TODO: Task 8
    if (action.action === 'back') this.state = STATES.TITLE;
  }

  handleBattle(action) {
    // TODO: Task 9
  }

  handleGameOver(action) {
    // TODO: Task 10
  }
}

const game = new Game();
game.start();
