// ship.js
const SHIP_TYPES = [
  { name: 'Carrier', size: 5 },
  { name: 'Battleship', size: 4 },
  { name: 'Cruiser', size: 3 },
  { name: 'Submarine', size: 3 },
  { name: 'Destroyer', size: 2 },
];

class Ship {
  constructor(name, size, position, orientation) {
    this.name = name;
    this.size = size;
    this.position = position;
    this.orientation = orientation;
    this.hits = new Array(size).fill(false);
  }

  getSegments() {
    const segments = [];
    for (let i = 0; i < this.size; i++) {
      segments.push({
        row: this.position.row + (this.orientation === 'vertical' ? i : 0),
        col: this.position.col + (this.orientation === 'horizontal' ? i : 0),
      });
    }
    return segments;
  }

  occupies(row, col) {
    return this.getSegments().some(s => s.row === row && s.col === col);
  }

  hit(segmentIndex) {
    if (this.hits[segmentIndex]) return false;
    this.hits[segmentIndex] = true;
    return true;
  }

  hitAt(row, col) {
    const segments = this.getSegments();
    const idx = segments.findIndex(s => s.row === row && s.col === col);
    if (idx === -1) return false;
    return this.hit(idx);
  }

  isSunk() {
    return this.hits.every(h => h);
  }

  getDamage() {
    return [...this.hits];
  }
}

module.exports = { SHIP_TYPES, Ship };
