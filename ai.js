// ai.js — AI opponent with three difficulty levels
// Chooses where to fire shots using hunt/target/axis-lock state machine

class AI {
  constructor(difficulty) {
    this.difficulty = difficulty; // 'easy' | 'medium' | 'hard'
    this.shotsFired = new Set();  // "row,col" strings
    this.targetQueue = [];        // array of {row, col}
    this.mode = 'hunt';           // 'hunt' | 'target'
    this.hitChain = [];           // consecutive hits for axis detection (Hard)
    this.islands = new Set();
  }

  setIslands(islandSet) {
    this.islands = islandSet || new Set();
  }

  /**
   * Choose the next cell to fire at.
   * Returns {row, col}.
   */
  chooseTarget() {
    // If we have queued targets (medium/hard), try them first
    if (this.difficulty !== 'easy') {
      while (this.targetQueue.length > 0) {
        const candidate = this.targetQueue.shift();
        const key = `${candidate.row},${candidate.col}`;
        if (
          candidate.row >= 0 && candidate.row < 10 &&
          candidate.col >= 0 && candidate.col < 10 &&
          !this.shotsFired.has(key) &&
          !this.islands.has(key)
        ) {
          return candidate;
        }
      }
      // Queue exhausted — fall back to hunt mode
      this.mode = 'hunt';
    }

    // HUNT mode: pick a random untried cell
    return this._randomUntried();
  }

  /**
   * Record the result of a shot and update internal state.
   * @param {number} row
   * @param {number} col
   * @param {boolean} hit - whether the shot was a hit
   * @param {boolean} sunk - whether a ship was sunk by this shot
   */
  recordResult(row, col, hit, sunk) {
    const key = `${row},${col}`;
    this.shotsFired.add(key);

    // Easy: just record — no targeting logic
    if (this.difficulty === 'easy') {
      return;
    }

    if (hit && sunk) {
      // Ship sunk — clear targeting state, return to hunt
      this.targetQueue = [];
      this.hitChain = [];
      this.mode = 'hunt';
      return;
    }

    if (hit) {
      this.mode = 'target';

      if (this.difficulty === 'hard') {
        this.hitChain.push({ row, col });

        if (this.hitChain.length >= 2) {
          // Determine axis from hit chain
          this._rebuildQueueFromAxis();
          return;
        }
      }

      // Medium (or Hard with only 1 hit): queue 4 adjacent cells
      this._queueAdjacent(row, col);
    }
  }

  /**
   * Queue the 4 orthogonally adjacent cells, filtering out
   * already-shot cells and out-of-bounds cells.
   */
  _queueAdjacent(row, col) {
    const candidates = [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ];

    for (const c of candidates) {
      if (
        c.row >= 0 && c.row < 10 &&
        c.col >= 0 && c.col < 10 &&
        !this.shotsFired.has(`${c.row},${c.col}`) &&
        !this.islands.has(`${c.row},${c.col}`)
      ) {
        this.targetQueue.push(c);
      }
    }
  }

  /**
   * Hard mode: rebuild targetQueue based on axis lock.
   * Examines hitChain to determine axis, then queues only
   * cells extending the line in both directions.
   */
  _rebuildQueueFromAxis() {
    const hits = this.hitChain;
    const sameRow = hits.every(h => h.row === hits[0].row);
    const sameCol = hits.every(h => h.col === hits[0].col);

    this.targetQueue = [];

    if (sameRow) {
      // Horizontal axis — extend left and right
      const row = hits[0].row;
      const cols = hits.map(h => h.col).sort((a, b) => a - b);
      const minCol = cols[0];
      const maxCol = cols[cols.length - 1];

      // Extend left (decreasing col)
      const left = minCol - 1;
      if (left >= 0 && !this.shotsFired.has(`${row},${left}`) && !this.islands.has(`${row},${left}`)) {
        this.targetQueue.push({ row, col: left });
      }

      // Extend right (increasing col)
      const right = maxCol + 1;
      if (right < 10 && !this.shotsFired.has(`${row},${right}`) && !this.islands.has(`${row},${right}`)) {
        this.targetQueue.push({ row, col: right });
      }
    } else if (sameCol) {
      // Vertical axis — extend up and down
      const col = hits[0].col;
      const rows = hits.map(h => h.row).sort((a, b) => a - b);
      const minRow = rows[0];
      const maxRow = rows[rows.length - 1];

      // Extend up (decreasing row)
      const up = minRow - 1;
      if (up >= 0 && !this.shotsFired.has(`${up},${col}`) && !this.islands.has(`${up},${col}`)) {
        this.targetQueue.push({ row: up, col });
      }

      // Extend down (increasing row)
      const down = maxRow + 1;
      if (down < 10 && !this.shotsFired.has(`${down},${col}`) && !this.islands.has(`${down},${col}`)) {
        this.targetQueue.push({ row: down, col });
      }
    }
  }

  /**
   * Pick a random cell that hasn't been shot yet.
   */
  _randomUntried() {
    // Build list of untried cells
    const untried = [];
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if (!this.shotsFired.has(`${r},${c}`) && !this.islands.has(`${r},${c}`)) {
          untried.push({ row: r, col: c });
        }
      }
    }

    // Pick one at random
    const idx = Math.floor(Math.random() * untried.length);
    return untried[idx];
  }
}

module.exports = { AI };
