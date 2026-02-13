// display.js
const { Board } = require('./board');

// ─── ANSI Color Constants ────────────────────────────────────────────────────

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
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

// 256-color helper: \x1b[38;5;Nm for foreground
function fg256(n) { return `\x1b[38;5;${n}m`; }
function bg256(n) { return `\x1b[48;5;${n}m`; }

// RGB color helper
function fgRgb(r, g, b) { return `\x1b[38;2;${r};${g};${b}m`; }
function bgRgb(r, g, b) { return `\x1b[48;2;${r};${g};${b}m`; }

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

function getWidth() {
  return process.stdout.columns || 80;
}

function centerText(text, width) {
  const w = width || getWidth();
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, '');
  const pad = Math.max(0, Math.floor((w - stripped.length) / 2));
  return ' '.repeat(pad) + text;
}

function horizontalLine(width, char = '─') {
  return char.repeat(width || getWidth());
}

function boxTop(width) {
  const w = width || getWidth();
  return '┌' + '─'.repeat(w - 2) + '┐';
}

function boxBottom(width) {
  const w = width || getWidth();
  return '└' + '─'.repeat(w - 2) + '┘';
}

function boxRow(content, width) {
  const w = width || getWidth();
  const stripped = content.replace(/\x1b\[[0-9;]*m/g, '');
  const pad = Math.max(0, w - 2 - stripped.length);
  return '│' + content + ' '.repeat(pad) + '│';
}

function boxRowCentered(content, width) {
  const w = width || getWidth();
  const stripped = content.replace(/\x1b\[[0-9;]*m/g, '');
  const totalPad = Math.max(0, w - 2 - stripped.length);
  const left = Math.floor(totalPad / 2);
  const right = totalPad - left;
  return '│' + ' '.repeat(left) + content + ' '.repeat(right) + '│';
}

// ─── ASCII Art Title ─────────────────────────────────────────────────────────

function renderTitle() {
  const C = COLORS;
  const r = C.reset;

  // Color gradient for title text — ocean blues to bright cyan
  const titleGradient = [
    fgRgb(0, 180, 255),   // bright ocean blue
    fgRgb(0, 200, 240),   // lighter blue
    fgRgb(0, 220, 230),   // blue-cyan
    fgRgb(0, 240, 220),   // cyan-ish
    fgRgb(0, 255, 210),   // bright cyan-green
  ];
  const shadowColor = fgRgb(30, 60, 120);  // dark navy shadow
  const accentColor = fgRgb(255, 200, 50); // golden accent

  // "SCHIFFE" in large block letters (4-wide per letter, 1-space gaps)
  const schiffeLines = [
    '████ ████ █  █ ███ ████ ████ ████',
    '█    █    █  █  █  █    █    █   ',
    '███  █    ████  █  ███  ███  ███ ',
    '   █ █    █  █  █  █    █    █   ',
    '████ ████ █  █ ███ █    █    ████',
  ];

  // "VERSENKEN" in large block letters (4-wide per letter, 1-space gaps)
  const versenkenLines = [
    '█  █ ████ ███  ████ ████ █  █ █  █ ████ █  █',
    '█  █ █    █  █ █    █    ██ █ █ █  █    ██ █',
    '█  █ ███  ███  ███  ███  █ ██ ██   ███  █ ██',
    ' ██  █    █ █     █ █    █  █ █ █  █    █  █',
    ' ██  ████ █  █ ████ ████ █  █ █  █ ████ █  █',
  ];

  const lines = [];
  lines.push('');

  // Decorative wave header
  const waveChars = '~🌊~═~═~🌊~═~═~🌊~═~═~🌊~═~═~🌊~';
  lines.push(centerText(fgRgb(40, 100, 180) + waveChars + r));
  lines.push('');

  // Render SCHIFFE with shadow offset (shadow first, then main on top)
  for (let i = 0; i < schiffeLines.length; i++) {
    const color = C.bright + titleGradient[i];
    // Shadow line (shifted right by 1 char)
    const shadowLine = ' ' + schiffeLines[i];
    const combined = shadowColor + shadowLine.slice(0, 1) + r + color + schiffeLines[i] + r;
    lines.push(centerText(combined));
  }

  lines.push('');

  // Render VERSENKEN with gradient + shadow
  for (let i = 0; i < versenkenLines.length; i++) {
    const color = C.bright + titleGradient[i];
    const shadowLine = ' ' + versenkenLines[i];
    const combined = shadowColor + shadowLine.slice(0, 1) + r + color + versenkenLines[i] + r;
    lines.push(centerText(combined));
  }

  lines.push('');

  // Decorative separator with anchors
  const sepLine = '⚓' + '═'.repeat(16) + ' 🚢 ' + '═'.repeat(16) + '⚓';
  lines.push(centerText(accentColor + C.bright + sepLine + r));

  // Subtitle
  lines.push(centerText(fgRgb(120, 160, 200) + C.italic + '~ A Naval Battle Awaits ~' + r));
  lines.push('');

  return lines.join('\n');
}

// Compact title for in-game screens
function renderMiniTitle() {
  const C = COLORS;
  const r = C.reset;
  const titleColor = C.bright + fgRgb(0, 200, 255);
  return centerText(
    fgRgb(40, 100, 180) + '⚓' + r + ' ' +
    titleColor + '< SCHIFFE VERSENKEN >' + r + ' ' +
    fgRgb(40, 100, 180) + '⚓' + r
  ) + '\n' +
  centerText(
    fgRgb(60, 120, 200) + horizontalLine(44, '─') + r
  ) + '\n';
}

// ─── Menu Rendering ──────────────────────────────────────────────────────────

function renderMenu(items, selectedIndex) {
  const C = COLORS;
  const r = C.reset;
  const lines = [];

  // Menu item emojis
  const menuEmojis = ['🚢', '🏅', '🌊'];

  lines.push(renderTitle());
  lines.push('');

  for (let i = 0; i < items.length; i++) {
    const emoji = menuEmojis[i] || '';
    if (i === selectedIndex) {
      lines.push(centerText(
        C.bright + fgRgb(0, 255, 220) + C.inverse +
        ' ▸ ' + emoji + ' ' + items[i] + '  ' + r
      ));
    } else {
      lines.push(centerText(
        fgRgb(100, 130, 160) + '   ' + emoji + ' ' + items[i] + '   ' + r
      ));
    }
    lines.push('');
  }

  lines.push('');
  lines.push(centerText(
    fgRgb(80, 100, 130) + '↑/↓ Navigate   Enter: Select' + r
  ));
  lines.push('');

  return lines.join('\n');
}

// ─── Difficulty Selection ────────────────────────────────────────────────────

function renderDifficulty(selectedIndex) {
  const C = COLORS;
  const r = C.reset;
  const lines = [];

  const difficulties = [
    { name: 'EASY',   emoji: '🌊', desc: 'Forgiving seas — AI shoots randomly.', color: fgRgb(80, 220, 120) },
    { name: 'MEDIUM', emoji: '⚓', desc: 'Tactical waters — AI hunts near hits.', color: fgRgb(255, 200, 50) },
    { name: 'HARD',   emoji: '💥', desc: 'Ruthless admiral — AI plays optimally.', color: fgRgb(255, 80, 80) },
  ];

  lines.push(renderTitle());
  lines.push(centerText(C.bright + fgRgb(255, 200, 50) + '⚙  SELECT DIFFICULTY  ⚙' + r));
  lines.push('');
  lines.push('');

  for (let i = 0; i < difficulties.length; i++) {
    const d = difficulties[i];
    if (i === selectedIndex) {
      lines.push(centerText(
        C.bright + d.color + C.inverse +
        ' ▸ ' + d.emoji + ' ' + d.name + '  ' + r
      ));
      lines.push(centerText(
        C.bright + C.white + d.desc + r
      ));
    } else {
      lines.push(centerText(
        fgRgb(100, 130, 160) + '   ' + d.emoji + ' ' + d.name + '   ' + r
      ));
      lines.push(centerText(
        fgRgb(80, 100, 130) + d.desc + r
      ));
    }
    lines.push('');
  }

  lines.push('');
  lines.push(centerText(
    fgRgb(80, 100, 130) + '↑/↓ Navigate   Enter: Select   Esc: Back' + r
  ));
  lines.push('');

  return lines.join('\n');
}

// ─── Grid Rendering ──────────────────────────────────────────────────────────

function renderGrid(grid, options = {}) {
  const C = COLORS;
  const r = C.reset;
  const { showShips = false, cursor = null, label = '' } = options;
  const lines = [];
  const labelEmoji = showShips ? '🚢' : '🎯';
  const borderColor = showShips ? fgRgb(60, 120, 200) : fgRgb(200, 80, 60);

  if (label) {
    lines.push(C.bright + fgRgb(255, 200, 50) + ' ' + labelEmoji + ' ' + label + r);
  }

  // Column headers
  lines.push(borderColor + '    A B C D E F G H I J' + r);
  lines.push(borderColor + '   ┌' + '──'.repeat(10) + '┐' + r);

  for (let row = 0; row < 10; row++) {
    const rowNum = String(row + 1).padStart(2, ' ');
    let line = borderColor + rowNum + ' │' + r;

    for (let col = 0; col < 10; col++) {
      const cell = grid[row][col];
      const isCursor = cursor && cursor.row === row && cursor.col === col;
      let symbol = '';

      switch (cell) {
        case Board.EMPTY:
          if (showShips) {
            symbol = fgRgb(40, 80, 150) + '~' + r;
          } else {
            symbol = fgRgb(50, 60, 80) + '·' + r;
          }
          break;
        case Board.SHIP:
          if (showShips) {
            symbol = C.bright + fgRgb(180, 200, 220) + '█' + r;
          } else {
            symbol = fgRgb(50, 60, 80) + '·' + r;
          }
          break;
        case Board.MISS:
          symbol = fgRgb(80, 120, 180) + '○' + r;
          break;
        case Board.HIT:
          symbol = C.bright + fgRgb(255, 60, 30) + '✖' + r;
          break;
        default:
          symbol = fgRgb(50, 60, 80) + '·' + r;
      }

      if (isCursor) {
        // Strip existing colors and apply cursor highlight
        const rawSymbol = symbol.replace(/\x1b\[[0-9;]*m/g, '');
        symbol = bgRgb(0, 160, 200) + C.bright + fgRgb(255, 255, 255) + rawSymbol + r;
      }

      line += symbol + ' ';
    }

    line += borderColor + '│' + r;
    lines.push(line);
  }

  lines.push(borderColor + '   └' + '──'.repeat(10) + '┘' + r);

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
  const gridPairWidth = 26 + gap.length + 26; // approx visual width of both grids
  const termWidth = getWidth();
  const marginLeft = Math.max(0, Math.floor((termWidth - gridPairWidth) / 2));
  const margin = ' '.repeat(marginLeft);

  for (let i = 0; i < maxLen; i++) {
    const left = i < playerLines.length ? playerLines[i] : '';
    const right = i < attackLines.length ? attackLines[i] : '';
    // Pad left side to consistent visual width
    const leftStripped = left.replace(/\x1b\[[0-9;]*m/g, '');
    const padNeeded = Math.max(0, 26 - leftStripped.length);
    lines.push(margin + left + ' '.repeat(padNeeded) + gap + right);
  }

  return lines.join('\n');
}

// ─── Ship Inventory Panel ────────────────────────────────────────────────────

function renderInventory(ships, label) {
  const C = COLORS;
  const r = C.reset;
  const lines = [];

  const isEnemy = label.includes('ENEMY');
  const labelEmoji = isEnemy ? '🎯' : '⚓';

  lines.push(C.bright + fgRgb(255, 200, 50) + ' ' + labelEmoji + ' ' + label + r);
  lines.push(fgRgb(60, 80, 120) + ' ' + '─'.repeat(30) + r);

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
        segments += C.bright + fgRgb(255, 50, 30) + '✖' + r;
      } else if (damage[i]) {
        segments += C.bright + fgRgb(255, 180, 0) + '◈' + r;
      } else {
        segments += C.bright + fgRgb(0, 220, 100) + '■' + r;
      }
    }
    segments += ']';

    const sunkLabel = sunk ? (C.bright + fgRgb(255, 50, 30) + ' 💥 SUNK!' + r) : '';
    const nameColor = sunk ? (C.dim + fgRgb(180, 60, 60)) : fgRgb(200, 210, 220);

    lines.push(' ' + nameColor + paddedName + r + segments + sunkLabel);
  }

  return lines.join('\n');
}

// ─── Placement Screen ────────────────────────────────────────────────────────

function renderPlacement(board, currentShipName, currentShipSize, cursor, orientation, placedCount) {
  const C = COLORS;
  const r = C.reset;
  const lines = [];

  lines.push(renderMiniTitle());
  lines.push(centerText(C.bright + fgRgb(255, 200, 50) + '🚢 PLACE YOUR SHIPS 🚢' + r));
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
      const gr = cursor.row + (orientation === 'vertical' ? i : 0);
      const gc = cursor.col + (orientation === 'horizontal' ? i : 0);
      if (gr >= 0 && gr < 10 && gc >= 0 && gc < 10) {
        ghostPositions.push({ row: gr, col: gc });
      }
    }
  }

  // Render grid with ghost overlay — centered
  const gridVisualWidth = 26; // "    A B C D E F G H I J" = 24 + border chars
  const placementMargin = Math.max(0, Math.floor((getWidth() - gridVisualWidth) / 2));
  const pm = ' '.repeat(placementMargin);

  lines.push(pm + C.bright + fgRgb(255, 200, 50) + ' ⚓ DEPLOYMENT ZONE' + r);
  const borderClr = fgRgb(60, 120, 200);
  lines.push(pm + borderClr + '    A B C D E F G H I J' + r);
  lines.push(pm + borderClr + '   ┌' + '──'.repeat(10) + '┐' + r);

  for (let row = 0; row < 10; row++) {
    const rowNum = String(row + 1).padStart(2, ' ');
    let line = borderClr + rowNum + ' │' + r;

    for (let col = 0; col < 10; col++) {
      const cell = displayGrid[row][col];
      const isGhost = ghostPositions.some(g => g.row === row && g.col === col);
      const isCursorPos = cursor && cursor.row === row && cursor.col === col;
      let symbol = '';

      if (isGhost && cell !== Board.SHIP) {
        // Ghost ship preview
        if (validPlacement) {
          symbol = C.bright + fgRgb(0, 220, 100) + '█' + r;
        } else {
          symbol = C.bright + fgRgb(255, 60, 50) + '█' + r;
        }
      } else if (cell === Board.SHIP) {
        if (isGhost && !validPlacement) {
          symbol = C.bright + fgRgb(255, 60, 50) + '█' + r;
        } else {
          symbol = C.bright + fgRgb(180, 200, 220) + '█' + r;
        }
      } else {
        symbol = fgRgb(40, 80, 150) + '~' + r;
      }

      if (isCursorPos && !isGhost) {
        const rawSymbol = symbol.replace(/\x1b\[[0-9;]*m/g, '');
        symbol = bgRgb(0, 160, 200) + C.bright + fgRgb(255, 255, 255) + rawSymbol + r;
      }

      line += symbol + ' ';
    }

    line += borderClr + '│' + r;
    lines.push(pm + line);
  }

  lines.push(pm + borderClr + '   └' + '──'.repeat(10) + '┘' + r);
  lines.push('');

  // Ship info
  const orientLabel = orientation === 'horizontal' ? 'HORIZONTAL ↔' : 'VERTICAL ↕';
  lines.push(centerText(
    C.bright + fgRgb(200, 210, 220) + '🚢 Placing: ' +
    fgRgb(0, 220, 255) + currentShipName +
    fgRgb(200, 210, 220) + ' (size ' + fgRgb(255, 200, 50) + currentShipSize + fgRgb(200, 210, 220) + ')  ' +
    fgRgb(120, 140, 170) + '[' + orientLabel + ']' + r
  ));
  lines.push('');
  lines.push(centerText(
    C.bright + fgRgb(180, 120, 255) + '⚓ Ships placed: ' + placedCount + '/5' + r
  ));
  lines.push('');
  lines.push(centerText(
    fgRgb(80, 100, 130) + 'Arrow keys: move  │  R: rotate  │  Enter: place  │  Esc: back' + r
  ));
  lines.push('');

  return lines.join('\n');
}

// ─── Battle Screen ───────────────────────────────────────────────────────────

function renderBattle(playerBoard, attackBoard, cursor, message, turnCount) {
  const C = COLORS;
  const r = C.reset;
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
  const invPairWidth = 34 + gap.length + 34;
  const termWidth = getWidth();
  const invMarginLeft = Math.max(0, Math.floor((termWidth - invPairWidth) / 2));
  const invMargin = ' '.repeat(invMarginLeft);

  for (let i = 0; i < maxInvLen; i++) {
    const left = i < playerInvLines.length ? playerInvLines[i] : '';
    const right = i < enemyInvLines.length ? enemyInvLines[i] : '';
    const leftStripped = left.replace(/\x1b\[[0-9;]*m/g, '');
    const padNeeded = Math.max(0, 34 - leftStripped.length);
    lines.push(invMargin + left + ' '.repeat(padNeeded) + gap + right);
  }

  lines.push('');

  // Status message
  if (message) {
    // Color the message based on content
    let msgColor = C.bright + fgRgb(255, 200, 50); // default gold
    if (message.includes('Hit')) msgColor = C.bright + fgRgb(255, 100, 30);
    if (message.includes('sunk') || message.includes('Sunk')) msgColor = C.bright + fgRgb(255, 50, 50);
    if (message.includes('Miss')) msgColor = fgRgb(80, 140, 200);

    lines.push(centerText(
      msgColor + '💬 ' + message + r
    ));
  }

  // Turn counter
  lines.push(centerText(
    fgRgb(100, 130, 160) + '⏱  Turn: ' + C.bright + fgRgb(255, 200, 50) + turnCount + r
  ));
  lines.push('');
  lines.push(centerText(
    fgRgb(80, 100, 130) + 'Arrow keys: aim  │  Enter: fire 💥' + r
  ));
  lines.push('');

  return lines.join('\n');
}

// ─── Game Over Screen ────────────────────────────────────────────────────────

function renderGameOver(won, stats, playerName, menuIndex, nameEntered) {
  const C = COLORS;
  const r = C.reset;
  const lines = [];

  // Default parameter values
  playerName = playerName || '';
  menuIndex = menuIndex || 0;
  nameEntered = nameEntered || false;

  lines.push('');
  lines.push('');

  if (won) {
    const victoryGradient = [
      fgRgb(0, 255, 100),
      fgRgb(50, 255, 120),
      fgRgb(100, 255, 150),
      fgRgb(50, 255, 120),
      fgRgb(0, 255, 100),
    ];
    const victoryArt = [
      '█  █ ███ ████ █████  ██  ███  █   █',
      '█  █  █  █      █   █  █ █  █  █ █ ',
      '█  █  █  █      █   █  █ ███    █  ',
      ' ██   █  █      █   █  █ █ █    █  ',
      ' ██  ███ ████   █    ██  █  █   █  ',
    ];
    for (let i = 0; i < victoryArt.length; i++) {
      lines.push(centerText(C.bright + victoryGradient[i] + victoryArt[i] + r));
    }
    lines.push('');
    lines.push(centerText('🏅🏅🏅'));
  } else {
    const defeatGradient = [
      fgRgb(255, 80, 80),
      fgRgb(255, 60, 60),
      fgRgb(220, 40, 40),
      fgRgb(255, 60, 60),
      fgRgb(255, 80, 80),
    ];
    const defeatArt = [
      '███  ████ ████ ████  ██  █████',
      '█  █ █    █    █    █  █   █  ',
      '█  █ ███  ███  ███  ████   █  ',
      '█  █ █    █    █    █  █   █  ',
      '███  ████ █    ████ █  █   █  ',
    ];
    for (let i = 0; i < defeatArt.length; i++) {
      lines.push(centerText(C.bright + defeatGradient[i] + defeatArt[i] + r));
    }
    lines.push('');
    lines.push(centerText('🌊💀🌊'));
  }

  lines.push('');
  lines.push(centerText(fgRgb(60, 100, 180) + '═'.repeat(50) + r));
  lines.push('');

  // Stats
  const diffLabel = stats.difficulty || 'Unknown';
  lines.push(centerText(C.bright + fgRgb(255, 200, 50) + '📊 GAME STATISTICS 📊' + r));
  lines.push('');
  lines.push(centerText(
    fgRgb(200, 210, 220) + '⏱  Turns played:     ' + C.bright + fgRgb(0, 220, 255) + stats.turns + r
  ));
  lines.push(centerText(
    fgRgb(200, 210, 220) + '🚢 Ships remaining:  ' + C.bright + fgRgb(0, 220, 255) + stats.shipsRemaining + r
  ));
  lines.push(centerText(
    fgRgb(200, 210, 220) + '⚙  Difficulty:       ' + C.bright + fgRgb(0, 220, 255) + diffLabel + r
  ));
  lines.push('');
  lines.push(centerText(fgRgb(60, 100, 180) + '─'.repeat(40) + r));
  lines.push('');

  if (!nameEntered) {
    // Name entry mode
    const cursorChar = '█';
    const nameDisplay = playerName + (C.bright + fgRgb(255, 255, 255) + cursorChar + r);
    lines.push(centerText(
      C.bright + fgRgb(255, 200, 50) + '✏  Enter your name: ' + r +
      C.bright + fgRgb(0, 220, 255) + nameDisplay + r
    ));
    lines.push('');
    lines.push(centerText(
      fgRgb(80, 100, 130) + 'Type your name (max 10 chars)  │  Enter: confirm' + r
    ));
    lines.push('');
    lines.push('');

    // Show menu items dimmed (not yet selectable)
    const menuEmojis = ['🔄', '🏠', '🌊'];
    const menuItems = ['Play Again', 'Main Menu', 'Quit'];
    for (let j = 0; j < menuItems.length; j++) {
      lines.push(centerText(fgRgb(60, 70, 90) + '  ' + menuEmojis[j] + ' ' + menuItems[j] + '  ' + r));
    }
  } else {
    // Name confirmed, show it
    lines.push(centerText(
      C.bright + fgRgb(255, 200, 50) + '🏅 Player: ' + r +
      C.bright + fgRgb(0, 220, 255) + playerName + r
    ));
    lines.push('');
    lines.push('');

    // Menu mode - items are selectable
    const menuEmojis = ['🔄', '🏠', '🌊'];
    const menuItems = ['Play Again', 'Main Menu', 'Quit'];
    for (let i = 0; i < menuItems.length; i++) {
      if (i === menuIndex) {
        lines.push(centerText(
          C.bright + fgRgb(0, 255, 220) + C.inverse +
          ' ▸ ' + menuEmojis[i] + ' ' + menuItems[i] + '  ' + r
        ));
      } else {
        lines.push(centerText(
          fgRgb(100, 130, 160) + '   ' + menuEmojis[i] + ' ' + menuItems[i] + '   ' + r
        ));
      }
    }
    lines.push('');
    lines.push(centerText(
      fgRgb(80, 100, 130) + '↑/↓ Navigate   Enter: Select' + r
    ));
  }

  lines.push('');

  return lines.join('\n');
}

// ─── Highscore Screen ────────────────────────────────────────────────────────

function renderHighscores(scores) {
  const C = COLORS;
  const r = C.reset;
  const lines = [];

  const rankEmojis = ['🥇', '🥈', '🥉'];

  lines.push(renderTitle());
  lines.push(centerText(C.bright + fgRgb(255, 200, 50) + '🏅 HIGH SCORES 🏅' + r));
  lines.push('');

  // Table — centered
  const tableWidth = 62;
  const tableMargin = Math.max(0, Math.floor((getWidth() - tableWidth) / 2));
  const tm = ' '.repeat(tableMargin);

  const hdrRank = 'Rank'.padEnd(8);
  const hdrName = 'Name'.padEnd(12);
  const hdrResult = 'Result'.padEnd(9);
  const hdrTurns = 'Turns'.padEnd(7);
  const hdrDiff = 'Difficulty'.padEnd(12);
  const hdrDate = 'Date'.padEnd(12);

  const header = hdrRank + hdrName + hdrResult + hdrTurns + hdrDiff + hdrDate;

  lines.push(tm + C.bright + fgRgb(0, 200, 255) + header + r);
  lines.push(tm + fgRgb(60, 100, 160) + '─'.repeat(60) + r);

  if (!scores || scores.length === 0) {
    lines.push('');
    lines.push(centerText(fgRgb(100, 130, 160) + '🌊 No scores recorded yet. 🌊' + r));
  } else {
    for (let i = 0; i < scores.length; i++) {
      const s = scores[i];
      const rankEmoji = i < 3 ? rankEmojis[i] + ' ' : '   ';
      const rank = (rankEmoji + String(i + 1)).padEnd(8);
      const name = (s.name || 'Unknown').padEnd(12);
      const result = (s.won ? 'WIN' : 'LOSS').padEnd(9);
      const turns = String(s.turns || 0).padEnd(7);
      const diff = (s.difficulty || '???').padEnd(12);
      const date = (s.date || '').padEnd(12);

      const resultColor = s.won ? (C.bright + fgRgb(0, 220, 100)) : (fgRgb(200, 80, 80));
      const rankColor = i < 3 ? (C.bright + fgRgb(255, 200, 50)) : fgRgb(200, 210, 220);

      lines.push(
        tm + rankColor + rank + r +
        fgRgb(200, 210, 220) + name + r +
        resultColor + result + r +
        fgRgb(0, 180, 230) + turns + r +
        fgRgb(180, 120, 255) + diff + r +
        fgRgb(100, 130, 160) + date + r
      );
    }
  }

  lines.push('');
  lines.push(tm + fgRgb(60, 100, 160) + '─'.repeat(60) + r);
  lines.push('');
  lines.push(centerText(
    fgRgb(80, 100, 130) + 'Press any key to return' + r
  ));
  lines.push('');

  return lines.join('\n');
}

// ─── Quit Confirmation ──────────────────────────────────────────────────────

function renderQuitConfirm() {
  const C = COLORS;
  const r = C.reset;
  const lines = [];

  lines.push('');
  lines.push(centerText(fgRgb(60, 80, 120) + '┌' + '─'.repeat(36) + '┐' + r));
  lines.push(centerText(fgRgb(60, 80, 120) + '│' + r + '                                    ' + fgRgb(60, 80, 120) + '│' + r));
  lines.push(centerText(fgRgb(60, 80, 120) + '│' + r + C.bright + fgRgb(255, 200, 50) + '   ⚓ Abandon ship, Captain? ⚓   ' + r + fgRgb(60, 80, 120) + '│' + r));
  lines.push(centerText(fgRgb(60, 80, 120) + '│' + r + '                                    ' + fgRgb(60, 80, 120) + '│' + r));
  lines.push(centerText(fgRgb(60, 80, 120) + '│' + r + fgRgb(0, 220, 100) + '     Y' + r + fgRgb(160, 180, 200) + ' = Return to port (menu)    ' + fgRgb(60, 80, 120) + '│' + r));
  lines.push(centerText(fgRgb(60, 80, 120) + '│' + r + fgRgb(255, 100, 80) + '     Any other key' + r + fgRgb(160, 180, 200) + ' = Stay      ' + fgRgb(60, 80, 120) + '│' + r));
  lines.push(centerText(fgRgb(60, 80, 120) + '│' + r + '                                    ' + fgRgb(60, 80, 120) + '│' + r));
  lines.push(centerText(fgRgb(60, 80, 120) + '└' + '─'.repeat(36) + '┘' + r));

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
  renderQuitConfirm,
};
