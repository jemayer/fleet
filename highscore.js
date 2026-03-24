// highscore.js
const fs = require('fs');
const path = require('path');

class Highscore {
  constructor(filePath) {
    this.filePath = filePath || path.join(__dirname, 'highscores.json');
  }

  load() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      const scores = JSON.parse(data);
      return this._sort(scores);
    } catch {
      return [];
    }
  }

  save(entry) {
    const scores = this.load();
    scores.push(entry);
    const sorted = this._sort(scores);
    // Keep top 10 per difficulty
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const capped = [];
    for (const diff of difficulties) {
      const diffScores = sorted.filter(s => s.difficulty === diff);
      capped.push(...diffScores.slice(0, 10));
    }
    // Keep any entries with unknown difficulty too
    const knownDiffs = new Set(difficulties);
    capped.push(...sorted.filter(s => !knownDiffs.has(s.difficulty)));
    fs.writeFileSync(this.filePath, JSON.stringify(capped, null, 2));
  }

  loadByDifficulty(difficulty) {
    const scores = this.load();
    return scores.filter(s => s.difficulty === difficulty);
  }

  _sort(scores) {
    return scores.sort((a, b) => {
      // Winners first
      if (a.won !== b.won) return a.won ? -1 : 1;
      // Then by fewest turns
      return a.turns - b.turns;
    });
  }

  getFormatted() {
    const scores = this.load();
    if (scores.length === 0) return 'No highscores yet!';

    let result = '';
    result += ' # | Name       | Result | Turns | Difficulty | Date\n';
    result += '---+------------+--------+-------+------------+-----------\n';
    scores.forEach((s, i) => {
      const rank = String(i + 1).padStart(2);
      const name = s.name.padEnd(10).slice(0, 10);
      const won = s.won ? 'WIN ' : 'LOSS';
      const turns = String(s.turns).padStart(5);
      const diff = s.difficulty.padEnd(10);
      const date = s.date || '---';
      result += `${rank} | ${name} | ${won}   | ${turns} | ${diff} | ${date}\n`;
    });
    return result;
  }
}

module.exports = { Highscore };
