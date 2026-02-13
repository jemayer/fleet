// tests/ship.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const { SHIP_TYPES, Ship } = require('../ship');

describe('SHIP_TYPES', () => {
  it('defines 5 ship types with correct sizes', () => {
    assert.strictEqual(SHIP_TYPES.length, 5);
    assert.deepStrictEqual(SHIP_TYPES.map(s => [s.name, s.size]), [
      ['Carrier', 5],
      ['Battleship', 4],
      ['Cruiser', 3],
      ['Submarine', 3],
      ['Destroyer', 2],
    ]);
  });
});

describe('Ship', () => {
  it('creates a ship with position and orientation', () => {
    const ship = new Ship('Carrier', 5, { row: 0, col: 0 }, 'horizontal');
    assert.strictEqual(ship.name, 'Carrier');
    assert.strictEqual(ship.size, 5);
    assert.strictEqual(ship.orientation, 'horizontal');
  });

  it('returns all occupied segments for horizontal ship', () => {
    const ship = new Ship('Cruiser', 3, { row: 2, col: 4 }, 'horizontal');
    assert.deepStrictEqual(ship.getSegments(), [
      { row: 2, col: 4 },
      { row: 2, col: 5 },
      { row: 2, col: 6 },
    ]);
  });

  it('returns all occupied segments for vertical ship', () => {
    const ship = new Ship('Cruiser', 3, { row: 2, col: 4 }, 'vertical');
    assert.deepStrictEqual(ship.getSegments(), [
      { row: 2, col: 4 },
      { row: 3, col: 4 },
      { row: 4, col: 4 },
    ]);
  });

  it('tracks hits and reports damage', () => {
    const ship = new Ship('Destroyer', 2, { row: 0, col: 0 }, 'horizontal');
    assert.strictEqual(ship.isSunk(), false);
    assert.strictEqual(ship.hit(0), true);
    assert.strictEqual(ship.isSunk(), false);
    assert.strictEqual(ship.hit(1), true);
    assert.strictEqual(ship.isSunk(), true);
  });

  it('reports per-segment damage state', () => {
    const ship = new Ship('Cruiser', 3, { row: 0, col: 0 }, 'horizontal');
    ship.hit(1);
    assert.deepStrictEqual(ship.getDamage(), [false, true, false]);
  });

  it('rejects duplicate hits on same segment', () => {
    const ship = new Ship('Destroyer', 2, { row: 0, col: 0 }, 'horizontal');
    assert.strictEqual(ship.hit(0), true);
    assert.strictEqual(ship.hit(0), false);
  });

  it('hitAt checks by coordinate', () => {
    const ship = new Ship('Cruiser', 3, { row: 2, col: 4 }, 'horizontal');
    assert.strictEqual(ship.hitAt(2, 5), true);
    assert.strictEqual(ship.hitAt(2, 5), false);
    assert.strictEqual(ship.hitAt(0, 0), false);
  });

  it('occupies checks if coordinate is on this ship', () => {
    const ship = new Ship('Cruiser', 3, { row: 2, col: 4 }, 'horizontal');
    assert.strictEqual(ship.occupies(2, 4), true);
    assert.strictEqual(ship.occupies(2, 6), true);
    assert.strictEqual(ship.occupies(2, 7), false);
    assert.strictEqual(ship.occupies(3, 4), false);
  });
});
