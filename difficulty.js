// difficulty.js — Per-difficulty fleet and island configuration

const DIFFICULTIES = ['easy', 'medium', 'hard'];

const DIFFICULTY_CONFIGS = {
  easy: {
    ships: [
      { name: 'Carrier', size: 5 },
      { name: 'Battleship', size: 4 },
      { name: 'Cruiser', size: 3 },
      { name: 'Submarine', size: 3 },
      { name: 'Destroyer', size: 2 },
      { name: 'Destroyer II', size: 2 },
    ],
    islandCount: 4,       // 4 clusters of 2x2
    islandStyle: 'clustered',
  },
  medium: {
    ships: [
      { name: 'Carrier', size: 5 },
      { name: 'Battleship', size: 4 },
      { name: 'Cruiser', size: 3 },
      { name: 'Submarine', size: 3 },
      { name: 'Destroyer', size: 2 },
    ],
    islandCount: 0,
    islandStyle: 'none',
  },
  hard: {
    ships: [
      { name: 'Battleship', size: 4 },
      { name: 'Cruiser', size: 3 },
      { name: 'Submarine', size: 3 },
      { name: 'Destroyer', size: 2 },
    ],
    islandCount: 8,       // 8 single scattered cells
    islandStyle: 'scattered',
  },
};

module.exports = { DIFFICULTIES, DIFFICULTY_CONFIGS };
