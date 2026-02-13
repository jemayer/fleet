// display.js
const { Board } = require('./board');

// ─── ANSI Color Constants ────────────────────────────────────────────────────

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  inverse: '\x1b[7m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
};

// ─── Screen Utilities ────────────────────────────────────────────────────────

function clearScreen() {
  return '\x1b[2J\x1b[H';
}

function render(content) {
  process.stdout.write(clearScreen() + content);
}

function hideCursor() {
  return '\x1b[?25l';
}

function showCursor() {
  return '\x1b[?25h';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const WIDTH = 80;

function centerText(text, width = WIDTH) {
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, '');
  const pad = Math.max(0, Math.floor((width - stripped.length) / 2));
  return ' '.repeat(pad) + text;
}

function horizontalLine(width = WIDTH, char = '─') {
  return char.repeat(width);
}

function boxTop(width = WIDTH) {
  return '┌' + '─'.repeat(width - 2) + '┐';
}

function boxBottom(width = WIDTH) {
  return '└' + '─'.repeat(width - 2) + '┘';
}

function boxRow(content, width = WIDTH) {
  const stripped = content.replace(/\x1b\[[0-9;]*m/g, '');
  const pad = Math.max(0, width - 2 - stripped.length);
  return '│' + content + ' '.repeat(pad) + '│';
}

function boxRowCentered(content, width = WIDTH) {
  const stripped = content.replace(/\x1b\[[0-9;]*m/g, '');
  const totalPad = Math.max(0, width - 2 - stripped.length);
  const left = Math.floor(totalPad / 2);
  const right = totalPad - left;
  return '│' + ' '.repeat(left) + content + ' '.repeat(right) + '│';
}

// ─── ASCII Art Title ─────────────────────────────────────────────────────────

function renderTitle() {
  const C = COLORS;
  const main = C.bright + C.cyan;
  const shadow = C.blue;
  const r = C.reset;

  // "SCHIFFE VERSENKEN" in large block letters, split across two lines of words
  // First word: SCHIFFE
  const schiffeLines = [
    ' ███  ██  █ █ █ ███ ███ ███',
    '█    █  █ █ █ █ █   █   █  ',
    ' ██  █    ████  ██  ██  ██ ',
    '   █ █  █ █ █ █ █   █   █  ',
    '███   ██  █ █ █ █   █   ███',
  ];

  // Second word: VERSENKEN
  const versenkenLines = [
    '█  █ ███ ███  ███ ███ █  █ █ █ ███ █  █',
    '█  █ █   █  █ █   █   ██ █ ██  █   ██ █',
    '█  █ ██  ███  ███ ██  █ ██ ██  ██  █ ██',
    ' ██  █   █ █    █ █   █  █ █ █ █   █  █',
    ' ██  ███ █  █ ███ ███ █  █ █ █ ███ █  █',
  ];

  const lines = [];
  lines.push('');

  // Render SCHIFFE with shadow
  for (let i = 0; i < schiffeLines.length; i++) {
    const line = schiffeLines[i];
    const centered = centerText(main + line + r);
    lines.push(centered);
  }

  lines.push('');

  // Render VERSENKEN with shadow
  for (let i = 0; i < versenkenLines.length; i++) {
    const line = versenkenLines[i];
    const centered = centerText(main + line + r);
    lines.push(centered);
  }

  lines.push('');
  lines.push(centerText(shadow + '═'.repeat(50) + r));
  lines.push('');

  return lines.join('\n');
}

// Compact title for in-game screens
function renderMiniTitle() {
  const C = COLORS;
  return centerText(
    C.bright + C.cyan + '< SCHIFFE VERSENKEN >' + C.reset
  ) + '\n' +
  centerText(
    C.blue + horizontalLine(40, '─') + C.reset
  ) + '\n';
}

// ─── Menu Rendering ──────────────────────────────────────────────────────────

function renderMenu(items, selectedIndex) {
  const C = COLORS;
  const lines = [];

  lines.push(renderTitle());
  lines.push('');

  for (let i = 0; i < items.length; i++) {
    if (i === selectedIndex) {
      lines.push(centerText(
        C.bright + C.cyan + C.inverse + ' > ' + items[i] + ' < ' + C.reset
      ));
    } else {
      lines.push(centerText(
        C.dim + C.white + '   ' + items[i] + '   ' + C.reset
      ));
    }
  }

  lines.push('');
  lines.push('');
  lines.push(centerText(
    C.dim + '↑/↓ Navigate   Enter: Select' + C.reset
  ));
  lines.push('');

  return lines.join('\n');
}

// ─── Difficulty Selection ────────────────────────────────────────────────────

function renderDifficulty(selectedIndex) {
  const C = COLORS;
  const lines = [];

  const difficulties = [
    { name: 'EASY', desc: 'Forgiving seas — AI shoots randomly.' },
    { name: 'MEDIUM', desc: 'Tactical waters — AI hunts near hits.' },
    { name: 'HARD', desc: 'Ruthless admiral — AI plays optimally.' },
  ];

  lines.push(renderTitle());
  lines.push(centerText(C.bright + C.yellow + '[ SELECT DIFFICULTY ]' + C.reset));
  lines.push('');
  lines.push('');

  for (let i = 0; i < difficulties.length; i++) {
    const d = difficulties[i];
    if (i === selectedIndex) {
      lines.push(centerText(
        C.bright + C.cyan + C.inverse + ' > ' + d.name + ' < ' + C.reset
      ));
      lines.push(centerText(
        C.bright + C.white + d.desc + C.reset
      ));
    } else {
      lines.push(centerText(
        C.dim + C.white + '   ' + d.name + '   ' + C.reset
      ));
      lines.push(centerText(
        C.dim + d.desc + C.reset
      ));
    }
    lines.push('');
  }

  lines.push('');
  lines.push(centerText(
    C.dim + '↑/↓ Navigate   Enter: Select' + C.reset
  ));
  lines.push('');

  return lines.join('\n');
}

// ─── Grid Rendering ──────────────────────────────────────────────────────────

function renderGrid(grid, options = {}) {
  const C = COLORS;
  const { showShips = false, cursor = null, label = '' } = options;
  const lines = [];

  if (label) {
    lines.push(C.bright + C.yellow + ' ' + label + C.reset);
  }

  // Column headers
  lines.push(C.dim + '    A B C D E F G H I J' + C.reset);
  lines.push(C.dim + '   ┌' + '──'.repeat(10) + '┐' + C.reset);

  for (let row = 0; row < 10; row++) {
    const rowNum = String(row + 1).padStart(2, ' ');
    let line = C.dim + rowNum + ' │' + C.reset;

    for (let col = 0; col < 10; col++) {
      const cell = grid[row][col];
      const isCursor = cursor && cursor.row === row && cursor.col === col;
      let symbol = '';

      switch (cell) {
        case Board.EMPTY:
          if (showShips) {
            symbol = C.blue + '~' + C.reset;
          } else {
            symbol = C.dim + '·' + C.reset;
          }
          break;
        case Board.SHIP:
          if (showShips) {
            symbol = C.bright + C.white + '█' + C.reset;
          } else {
            symbol = C.dim + '·' + C.reset;
          }
          break;
        case Board.MISS:
          symbol = C.dim + C.white + '○' + C.reset;
          break;
        case Board.HIT:
          symbol = C.bright + C.red + '✖' + C.reset;
          break;
        default:
          symbol = C.dim + '·' + C.reset;
      }

      if (isCursor) {
        // Strip existing colors and apply cursor highlight
        const rawSymbol = symbol.replace(/\x1b\[[0-9;]*m/g, '');
        symbol = C.bgCyan + C.bright + C.white + rawSymbol + C.reset;
      }

      line += symbol + ' ';
    }

    line += C.dim + '│' + C.reset;
    lines.push(line);
  }

  lines.push(C.dim + '   └' + '──'.repeat(10) + '┘' + C.reset);

  return lines.join('\n');
}

function renderSideBySide(playerGrid, attackGrid, cursor) {
  const C = COLORS;
  const playerLines = renderGrid(playerGrid, {
    showShips: true,
    cursor: null,
    label: 'YOUR FLEET',
  }).split('\n');

  const attackLines = renderGrid(attackGrid, {
    showShips: false,
    cursor: cursor,
    label: 'ATTACK BOARD',
  }).split('\n');

  const lines = [];
  const maxLen = Math.max(playerLines.length, attackLines.length);
  const gap = '    ';

  for (let i = 0; i < maxLen; i++) {
    const left = i < playerLines.length ? playerLines[i] : '';
    const right = i < attackLines.length ? attackLines[i] : '';
    // Pad left side to consistent visual width
    const leftStripped = left.replace(/\x1b\[[0-9;]*m/g, '');
    const padNeeded = Math.max(0, 26 - leftStripped.length);
    lines.push(left + ' '.repeat(padNeeded) + gap + right);
  }

  return lines.join('\n');
}

// ─── Ship Inventory Panel ────────────────────────────────────────────────────

function renderInventory(ships, label) {
  const C = COLORS;
  const lines = [];

  lines.push(C.bright + C.yellow + ' ' + label + C.reset);
  lines.push(C.dim + ' ' + '─'.repeat(30) + C.reset);

  // Find max ship name length for alignment
  const maxNameLen = ships.reduce((max, s) => Math.max(max, s.name.length), 0);

  for (const ship of ships) {
    const paddedName = ship.name.padEnd(maxNameLen, ' ');
    const damage = ship.getDamage();
    const sunk = ship.isSunk();

    let segments = ' [';
    for (let i = 0; i < damage.length; i++) {
      if (i > 0) segments += ' ';
      if (sunk) {
        segments += C.bright + C.red + '✖' + C.reset;
      } else if (damage[i]) {
        segments += C.bright + C.yellow + '◈' + C.reset;
      } else {
        segments += C.bright + C.green + '■' + C.reset;
      }
    }
    segments += ']';

    const sunkLabel = sunk ? (C.bright + C.red + ' SUNK!' + C.reset) : '';
    const nameColor = sunk ? (C.dim + C.red) : (C.white);

    lines.push(' ' + nameColor + paddedName + C.reset + segments + sunkLabel);
  }

  return lines.join('\n');
}

// ─── Placement Screen ────────────────────────────────────────────────────────

function renderPlacement(board, currentShipName, currentShipSize, cursor, orientation, placedCount) {
  const C = COLORS;
  const lines = [];

  lines.push(renderMiniTitle());
  lines.push(centerText(C.bright + C.yellow + '[ PLACE YOUR SHIPS ]' + C.reset));
  lines.push('');

  // Build a display grid with ghost ship preview
  const grid = board.getGrid();
  const displayGrid = grid.map(row => [...row]);

  // Calculate ghost ship positions
  const ghostPositions = [];
  let validPlacement = true;

  if (cursor && currentShipSize) {
    validPlacement = board.canPlaceShip(currentShipSize, cursor, orientation);

    for (let i = 0; i < currentShipSize; i++) {
      const r = cursor.row + (orientation === 'vertical' ? i : 0);
      const c = cursor.col + (orientation === 'horizontal' ? i : 0);
      if (r >= 0 && r < 10 && c >= 0 && c < 10) {
        ghostPositions.push({ row: r, col: c });
      }
    }
  }

  // Render grid with ghost overlay
  const gridLabel = C.bright + C.yellow + ' DEPLOYMENT ZONE' + C.reset;
  const colHeader = C.dim + '    A B C D E F G H I J' + C.reset;
  const gridTop = C.dim + '   ┌' + '──'.repeat(10) + '┐' + C.reset;

  lines.push(gridLabel);
  lines.push(colHeader);
  lines.push(gridTop);

  for (let row = 0; row < 10; row++) {
    const rowNum = String(row + 1).padStart(2, ' ');
    let line = C.dim + rowNum + ' │' + C.reset;

    for (let col = 0; col < 10; col++) {
      const cell = displayGrid[row][col];
      const isGhost = ghostPositions.some(g => g.row === row && g.col === col);
      const isCursorPos = cursor && cursor.row === row && cursor.col === col;
      let symbol = '';

      if (isGhost && cell !== Board.SHIP) {
        // Ghost ship preview
        if (validPlacement) {
          symbol = C.bright + C.green + '█' + C.reset;
        } else {
          symbol = C.bright + C.red + '█' + C.reset;
        }
      } else if (cell === Board.SHIP) {
        if (isGhost && !validPlacement) {
          symbol = C.bright + C.red + '█' + C.reset;
        } else {
          symbol = C.bright + C.white + '█' + C.reset;
        }
      } else {
        symbol = C.blue + '~' + C.reset;
      }

      if (isCursorPos && !isGhost) {
        const rawSymbol = symbol.replace(/\x1b\[[0-9;]*m/g, '');
        symbol = C.bgCyan + C.bright + C.white + rawSymbol + C.reset;
      }

      line += symbol + ' ';
    }

    line += C.dim + '│' + C.reset;
    lines.push(line);
  }

  lines.push(C.dim + '   └' + '──'.repeat(10) + '┘' + C.reset);
  lines.push('');

  // Ship info
  const orientLabel = orientation === 'horizontal' ? 'HORIZONTAL ↔' : 'VERTICAL ↕';
  lines.push(centerText(
    C.bright + C.white + 'Placing: ' +
    C.cyan + currentShipName +
    C.white + ' (size ' + C.yellow + currentShipSize + C.white + ')  ' +
    C.dim + '[' + orientLabel + ']' + C.reset
  ));
  lines.push('');
  lines.push(centerText(
    C.bright + C.magenta + 'Ships placed: ' + placedCount + '/5' + C.reset
  ));
  lines.push('');
  lines.push(centerText(
    C.dim + 'Arrow keys: move  │  R: rotate  │  Enter: place' + C.reset
  ));
  lines.push('');

  return lines.join('\n');
}

// ─── Battle Screen ───────────────────────────────────────────────────────────

function renderBattle(playerBoard, attackBoard, cursor, message, turnCount) {
  const C = COLORS;
  const lines = [];

  lines.push(renderMiniTitle());

  // Side-by-side grids
  const playerGrid = playerBoard.getGrid();
  const attackGrid = attackBoard.getGrid();
  lines.push(renderSideBySide(playerGrid, attackGrid, cursor));
  lines.push('');

  // Ship inventories side by side
  const playerInvLines = renderInventory(playerBoard.getShips(), 'YOUR SHIPS').split('\n');
  const enemyInvLines = renderInventory(attackBoard.getShips(), 'ENEMY SHIPS').split('\n');

  const maxInvLen = Math.max(playerInvLines.length, enemyInvLines.length);
  const gap = '    ';

  for (let i = 0; i < maxInvLen; i++) {
    const left = i < playerInvLines.length ? playerInvLines[i] : '';
    const right = i < enemyInvLines.length ? enemyInvLines[i] : '';
    const leftStripped = left.replace(/\x1b\[[0-9;]*m/g, '');
    const padNeeded = Math.max(0, 34 - leftStripped.length);
    lines.push(left + ' '.repeat(padNeeded) + gap + right);
  }

  lines.push('');

  // Status message
  if (message) {
    lines.push(centerText(
      C.bright + C.yellow + '>> ' + message + ' <<' + C.reset
    ));
  }

  // Turn counter
  lines.push(centerText(
    C.dim + 'Turn: ' + turnCount + C.reset
  ));
  lines.push('');
  lines.push(centerText(
    C.dim + 'Arrow keys: aim  │  Enter: fire' + C.reset
  ));
  lines.push('');

  return lines.join('\n');
}

// ─── Game Over Screen ────────────────────────────────────────────────────────

function renderGameOver(won, stats) {
  const C = COLORS;
  const lines = [];

  lines.push('');
  lines.push('');

  if (won) {
    const victoryArt = [
      '█  █ █ ██ ███ ███ ███ █   █ █',
      '█  █ █ █   █  █  █ █  █ █  █',
      '█  █ █ █   █  █  █ ██  ████ █',
      ' ██  █ █   █  █  █ █ █  ██  ',
      ' ██  █  ██  █  ███ █  █ ██ █',
    ];
    for (const line of victoryArt) {
      lines.push(centerText(C.bright + C.green + line + C.reset));
    }
  } else {
    const defeatArt = [
      '███ ███ ███ ███  █  ███ █',
      '█ █ █   █   █   █ █  █  █',
      '█ █ ██  ██  ██  ███  █  █',
      '█ █ █   █   █   █ █  █   ',
      '███ ███ █   ███ █ █  █  █',
    ];
    for (const line of defeatArt) {
      lines.push(centerText(C.bright + C.red + line + C.reset));
    }
  }

  lines.push('');
  lines.push(centerText(C.blue + '═'.repeat(50) + C.reset));
  lines.push('');

  // Stats
  const diffLabel = stats.difficulty || 'Unknown';
  lines.push(centerText(C.bright + C.yellow + '[ GAME STATISTICS ]' + C.reset));
  lines.push('');
  lines.push(centerText(
    C.white + 'Turns played:     ' + C.bright + C.cyan + stats.turns + C.reset
  ));
  lines.push(centerText(
    C.white + 'Ships remaining:  ' + C.bright + C.cyan + stats.shipsRemaining + C.reset
  ));
  lines.push(centerText(
    C.white + 'Difficulty:       ' + C.bright + C.cyan + diffLabel + C.reset
  ));
  lines.push('');
  lines.push(centerText(C.blue + '─'.repeat(40) + C.reset));
  lines.push('');

  // Name entry prompt
  lines.push(centerText(
    C.bright + C.yellow + 'Enter your name: ' + C.reset + showCursor()
  ));
  lines.push('');
  lines.push('');

  // Menu options
  const menuItems = ['Play Again', 'Main Menu', 'Quit'];
  for (const item of menuItems) {
    lines.push(centerText(C.dim + C.white + '  ' + item + '  ' + C.reset));
  }
  lines.push('');

  return lines.join('\n');
}

// ─── Highscore Screen ────────────────────────────────────────────────────────

function renderHighscores(scores) {
  const C = COLORS;
  const lines = [];

  lines.push(renderTitle());
  lines.push(centerText(C.bright + C.yellow + '[ HIGH SCORES ]' + C.reset));
  lines.push('');

  // Table header
  const hdrRank = 'Rank'.padEnd(6);
  const hdrName = 'Name'.padEnd(12);
  const hdrResult = 'Result'.padEnd(9);
  const hdrTurns = 'Turns'.padEnd(7);
  const hdrDiff = 'Difficulty'.padEnd(12);
  const hdrDate = 'Date'.padEnd(12);

  const header = '  ' + hdrRank + hdrName + hdrResult + hdrTurns + hdrDiff + hdrDate;

  lines.push(C.bright + C.cyan + header + C.reset);
  lines.push(C.dim + '  ' + '─'.repeat(58) + C.reset);

  if (!scores || scores.length === 0) {
    lines.push('');
    lines.push(centerText(C.dim + 'No scores recorded yet.' + C.reset));
  } else {
    for (let i = 0; i < scores.length; i++) {
      const s = scores[i];
      const rank = String(i + 1).padEnd(6);
      const name = (s.name || 'Unknown').padEnd(12);
      const result = (s.won ? 'WIN' : 'LOSS').padEnd(9);
      const turns = String(s.turns || 0).padEnd(7);
      const diff = (s.difficulty || '???').padEnd(12);
      const date = (s.date || '').padEnd(12);

      const resultColor = s.won ? (C.bright + C.green) : (C.dim + C.red);
      const rankColor = i < 3 ? (C.bright + C.yellow) : (C.white);

      lines.push(
        '  ' + rankColor + rank + C.reset +
        C.white + name + C.reset +
        resultColor + result + C.reset +
        C.cyan + turns + C.reset +
        C.magenta + diff + C.reset +
        C.dim + date + C.reset
      );
    }
  }

  lines.push('');
  lines.push(C.dim + '  ' + '─'.repeat(58) + C.reset);
  lines.push('');
  lines.push(centerText(
    C.dim + 'Press any key to return' + C.reset
  ));
  lines.push('');

  return lines.join('\n');
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  COLORS,
  clearScreen,
  render,
  hideCursor,
  showCursor,
  renderTitle,
  renderMiniTitle,
  renderMenu,
  renderDifficulty,
  renderGrid,
  renderSideBySide,
  renderInventory,
  renderPlacement,
  renderBattle,
  renderGameOver,
  renderHighscores,
};
