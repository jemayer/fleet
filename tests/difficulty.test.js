// tests/difficulty.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const { DIFFICULTY_CONFIGS, DIFFICULTIES } = require('../difficulty');

describe('Difficulty Config', () => {
  it('exports configs for all three difficulties', () => {
    assert.deepStrictEqual(DIFFICULTIES, ['easy', 'medium', 'hard']);
    for (const d of DIFFICULTIES) {
      assert.ok(DIFFICULTY_CONFIGS[d], `missing config for ${d}`);
    }
  });

  it('each config has ships array with name and size', () => {
    for (const d of DIFFICULTIES) {
      const config = DIFFICULTY_CONFIGS[d];
      assert.ok(Array.isArray(config.ships));
      assert.ok(config.ships.length >= 4);
      for (const ship of config.ships) {
        assert.ok(typeof ship.name === 'string');
        assert.ok(typeof ship.size === 'number');
        assert.ok(ship.size >= 2 && ship.size <= 5);
      }
    }
  });

  it('each config has island settings', () => {
    for (const d of DIFFICULTIES) {
      const config = DIFFICULTY_CONFIGS[d];
      assert.ok(typeof config.islandCount === 'number');
      assert.ok(typeof config.islandStyle === 'string');
    }
  });

  it('easy has 6 ships totaling 19 cells', () => {
    const total = DIFFICULTY_CONFIGS.easy.ships.reduce((s, sh) => s + sh.size, 0);
    assert.strictEqual(DIFFICULTY_CONFIGS.easy.ships.length, 6);
    assert.strictEqual(total, 19);
  });

  it('medium has 5 ships totaling 17 cells (classic)', () => {
    const total = DIFFICULTY_CONFIGS.medium.ships.reduce((s, sh) => s + sh.size, 0);
    assert.strictEqual(DIFFICULTY_CONFIGS.medium.ships.length, 5);
    assert.strictEqual(total, 17);
  });

  it('hard has 4 ships totaling 12 cells', () => {
    const total = DIFFICULTY_CONFIGS.hard.ships.reduce((s, sh) => s + sh.size, 0);
    assert.strictEqual(DIFFICULTY_CONFIGS.hard.ships.length, 4);
    assert.strictEqual(total, 12);
  });

  it('medium has zero islands', () => {
    assert.strictEqual(DIFFICULTY_CONFIGS.medium.islandCount, 0);
  });

  it('easy has clustered islands', () => {
    assert.ok(DIFFICULTY_CONFIGS.easy.islandCount > 0);
    assert.strictEqual(DIFFICULTY_CONFIGS.easy.islandStyle, 'clustered');
  });

  it('hard has scattered islands', () => {
    assert.ok(DIFFICULTY_CONFIGS.hard.islandCount > 0);
    assert.strictEqual(DIFFICULTY_CONFIGS.hard.islandStyle, 'scattered');
  });
});
