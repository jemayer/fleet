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
