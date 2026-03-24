// board.js
const { Ship, SHIP_TYPES } = require('./ship');

class Board {
  static EMPTY = 0;
  static SHIP = 1;
  static MISS = 2;
  static HIT = 3;
  static ISLAND = 4;

  constructor() {
    this.grid = Array.from({ length: 10 }, () => new Array(10).fill(Board.EMPTY));
    this.ships = [];
  }

  getGrid() {
    return this.grid;
  }

  getShips() {
    return this.ships;
  }

  canPlaceShip(size, position, orientation) {
    for (let i = 0; i < size; i++) {
      const row = position.row + (orientation === 'vertical' ? i : 0);
      const col = position.col + (orientation === 'horizontal' ? i : 0);
      if (row < 0 || row >= 10 || col < 0 || col >= 10) return false;
      if (this.grid[row][col] !== Board.EMPTY) return false;
    }
    return true;
  }

  placeShip(name, size, position, orientation) {
    if (!this.canPlaceShip(size, position, orientation)) return false;

    const ship = new Ship(name, size, position, orientation);
    const segments = ship.getSegments();
    for (const seg of segments) {
      this.grid[seg.row][seg.col] = Board.SHIP;
    }
    this.ships.push(ship);
    return true;
  }

  placeIslands(count, style) {
    if (count === 0 || style === 'none') return;

    if (style === 'clustered') {
      for (let i = 0; i < count; i++) {
        let placed = false;
        while (!placed) {
          const row = Math.floor(Math.random() * 9);
          const col = Math.floor(Math.random() * 9);
          if (this.grid[row][col] === Board.EMPTY &&
              this.grid[row][col + 1] === Board.EMPTY &&
              this.grid[row + 1][col] === Board.EMPTY &&
              this.grid[row + 1][col + 1] === Board.EMPTY) {
            this.grid[row][col] = Board.ISLAND;
            this.grid[row][col + 1] = Board.ISLAND;
            this.grid[row + 1][col] = Board.ISLAND;
            this.grid[row + 1][col + 1] = Board.ISLAND;
            placed = true;
          }
        }
      }
    } else if (style === 'scattered') {
      for (let i = 0; i < count; i++) {
        let placed = false;
        while (!placed) {
          const row = Math.floor(Math.random() * 10);
          const col = Math.floor(Math.random() * 10);
          if (this.grid[row][col] === Board.EMPTY) {
            this.grid[row][col] = Board.ISLAND;
            placed = true;
          }
        }
      }
    }
  }

  processShot(row, col) {
    const cell = this.grid[row][col];

    if (cell === Board.HIT || cell === Board.MISS) {
      return { hit: false, sunk: false, shipName: null, alreadyShot: true, isIsland: false };
    }

    if (cell === Board.ISLAND) {
      return { hit: false, sunk: false, shipName: null, alreadyShot: false, isIsland: true };
    }

    if (cell === Board.SHIP) {
      this.grid[row][col] = Board.HIT;
      const ship = this.ships.find(s => s.occupies(row, col));
      ship.hitAt(row, col);
      return {
        hit: true,
        sunk: ship.isSunk(),
        shipName: ship.name,
        alreadyShot: false,
        isIsland: false,
      };
    }

    // EMPTY cell - miss
    this.grid[row][col] = Board.MISS;
    return { hit: false, sunk: false, shipName: null, alreadyShot: false, isIsland: false };
  }

  allShipsSunk() {
    if (this.ships.length === 0) return false;
    return this.ships.every(s => s.isSunk());
  }

  placeShipsRandomly(shipTypes) {
    const types = shipTypes || SHIP_TYPES;
    for (const { name, size } of types) {
      let placed = false;
      while (!placed) {
        const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);
        placed = this.placeShip(name, size, { row, col }, orientation);
      }
    }
  }
}

module.exports = { Board };
