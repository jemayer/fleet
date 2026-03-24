// tests/highscore.test.js
const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { Highscore } = require('../highscore');

const TEST_FILE = path.join(__dirname, 'test-highscores.json');

describe('Highscore', () => {
  let hs;
  beforeEach(() => { hs = new Highscore(TEST_FILE); });
  afterEach(() => { try { fs.unlinkSync(TEST_FILE); } catch {} });

  it('returns empty array when no file exists', () => {
    assert.deepStrictEqual(hs.load(), []);
  });

  it('saves and loads an entry', () => {
    hs.save({ name: 'ACE', won: true, turns: 42, difficulty: 'Hard', date: '2026-02-13' });
    const scores = hs.load();
    assert.strictEqual(scores.length, 1);
    assert.strictEqual(scores[0].name, 'ACE');
  });

  it('sorts by fewest turns (winners first)', () => {
    hs.save({ name: 'A', won: true, turns: 50, difficulty: 'Easy', date: '2026-02-13' });
    hs.save({ name: 'B', won: true, turns: 30, difficulty: 'Easy', date: '2026-02-13' });
    hs.save({ name: 'C', won: false, turns: 20, difficulty: 'Easy', date: '2026-02-13' });
    const scores = hs.load();
    assert.strictEqual(scores[0].name, 'B'); // fewest turns, won
    assert.strictEqual(scores[1].name, 'A');
  });

  it('limits to top 10 entries per difficulty', () => {
    for (let i = 0; i < 15; i++) {
      hs.save({ name: 'P' + i, won: true, turns: i + 20, difficulty: 'Easy', date: '2026-02-13' });
    }
    const easyScores = hs.loadByDifficulty('Easy');
    assert.strictEqual(easyScores.length, 10);
  });

  it('keeps scores for different difficulties independently', () => {
    hs.save({ name: 'A', won: true, turns: 30, difficulty: 'Easy', date: '2026-02-13' });
    hs.save({ name: 'B', won: true, turns: 40, difficulty: 'Hard', date: '2026-02-13' });
    assert.strictEqual(hs.loadByDifficulty('Easy').length, 1);
    assert.strictEqual(hs.loadByDifficulty('Hard').length, 1);
    assert.strictEqual(hs.loadByDifficulty('Medium').length, 0);
    assert.strictEqual(hs.load().length, 2);
  });

  it('caps each difficulty at 10 without affecting others', () => {
    for (let i = 0; i < 12; i++) {
      hs.save({ name: 'E' + i, won: true, turns: i + 10, difficulty: 'Easy', date: '2026-02-13' });
    }
    for (let i = 0; i < 5; i++) {
      hs.save({ name: 'H' + i, won: true, turns: i + 10, difficulty: 'Hard', date: '2026-02-13' });
    }
    assert.strictEqual(hs.loadByDifficulty('Easy').length, 10);
    assert.strictEqual(hs.loadByDifficulty('Hard').length, 5);
  });
});
