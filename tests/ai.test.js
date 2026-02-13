// tests/ai.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const { AI } = require('../ai');

describe('AI - Easy', () => {
  it('returns valid coordinates within 10x10 grid', () => {
    const ai = new AI('easy');
    for (let i = 0; i < 50; i++) {
      const { row, col } = ai.chooseTarget();
      assert.ok(row >= 0 && row < 10);
      assert.ok(col >= 0 && col < 10);
      ai.recordResult(row, col, false, false);
    }
  });

  it('never targets the same cell twice', () => {
    const ai = new AI('easy');
    const seen = new Set();
    for (let i = 0; i < 100; i++) {
      const { row, col } = ai.chooseTarget();
      const key = `${row},${col}`;
      assert.ok(!seen.has(key), `duplicate: ${key}`);
      seen.add(key);
      ai.recordResult(row, col, false, false);
    }
  });

  it('stays in hunt mode even after a hit', () => {
    const ai = new AI('easy');
    const target = ai.chooseTarget();
    ai.recordResult(target.row, target.col, true, false);
    assert.strictEqual(ai.mode, 'hunt');
    assert.strictEqual(ai.targetQueue.length, 0);
  });
});

describe('AI - Medium', () => {
  it('targets adjacent cells after a hit', () => {
    const ai = new AI('medium');
    // Fire a random shot first, then record a hit
    const target = ai.chooseTarget();
    ai.recordResult(5, 5, true, false); // hit at 5,5
    // Manually set up: after recording a hit at (5,5), targetQueue should have adjacent cells
    const next = ai.chooseTarget();
    const dist = Math.abs(next.row - 5) + Math.abs(next.col - 5);
    assert.strictEqual(dist, 1, `expected adjacent to (5,5), got (${next.row},${next.col})`);
  });

  it('returns to hunt mode after sinking', () => {
    const ai = new AI('medium');
    ai.recordResult(5, 5, true, false); // hit
    ai.recordResult(5, 6, true, true);  // hit + sunk!
    assert.strictEqual(ai.mode, 'hunt');
    assert.strictEqual(ai.targetQueue.length, 0);
  });

  it('switches to target mode on hit', () => {
    const ai = new AI('medium');
    ai.recordResult(5, 5, true, false);
    assert.strictEqual(ai.mode, 'target');
  });

  it('filters out already-shot cells from targetQueue', () => {
    const ai = new AI('medium');
    // Shoot all cells around (5,5) except one
    ai.recordResult(4, 5, false, false); // above
    ai.recordResult(6, 5, false, false); // below
    ai.recordResult(5, 4, false, false); // left
    // Now hit at (5,5) — only (5,6) should be a valid target from the queue
    ai.recordResult(5, 5, true, false);
    const next = ai.chooseTarget();
    assert.strictEqual(next.row, 5);
    assert.strictEqual(next.col, 6);
  });
});

describe('AI - Hard', () => {
  it('locks to axis after consecutive hits', () => {
    const ai = new AI('hard');
    ai.recordResult(3, 4, true, false); // first hit
    ai.recordResult(3, 5, true, false); // second hit, same row = horizontal axis
    // Queue should only contain cells on the horizontal axis: (3,3) and (3,6)
    const next = ai.chooseTarget();
    assert.strictEqual(next.row, 3, 'should stay on row 3');
    assert.ok(next.col === 3 || next.col === 6, `expected col 3 or 6, got ${next.col}`);
  });

  it('clears axis lock after sinking', () => {
    const ai = new AI('hard');
    ai.recordResult(3, 4, true, false);
    ai.recordResult(3, 5, true, true); // sunk
    assert.strictEqual(ai.mode, 'hunt');
    assert.deepStrictEqual(ai.hitChain, []);
  });

  it('extends line in both directions for vertical axis', () => {
    const ai = new AI('hard');
    ai.recordResult(4, 3, true, false); // first hit
    ai.recordResult(5, 3, true, false); // second hit, same col = vertical axis
    // Queue should contain cells extending vertically: (3,3) and (6,3)
    const targets = [];
    // Collect all targets from queue
    while (ai.targetQueue.length > 0) {
      targets.push(ai.chooseTarget());
    }
    const rows = targets.map(t => t.row).sort();
    const cols = targets.map(t => t.col);
    assert.ok(rows.includes(3) || rows.includes(6), 'should extend vertically');
    cols.forEach(c => assert.strictEqual(c, 3, 'all targets should be on col 3'));
  });

  it('respects grid boundaries when extending line', () => {
    const ai = new AI('hard');
    ai.recordResult(0, 0, true, false); // first hit at corner
    ai.recordResult(0, 1, true, false); // second hit, horizontal axis
    // Should only queue (0,2) since (0,-1) is out of bounds
    const next = ai.chooseTarget();
    assert.strictEqual(next.row, 0);
    assert.strictEqual(next.col, 2);
  });
});
