(function () {
  'use strict';

  var KEY_MODE = 'tic-tac-toe:mode';
  var KEY_SCORES = 'tic-tac-toe:scores';
  var LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  var SVG_NS = 'http://www.w3.org/2000/svg';

  var wrap = document.getElementById('board-wrap');
  var gameboard = document.getElementById('gameboard');
  var statusEl = document.getElementById('status');
  var statusMark = document.getElementById('status-mark');
  var statusText = document.getElementById('status-text');
  var gameOverMsg = document.getElementById('gameover-msg');
  var winnerEl = document.getElementById('winner');
  var resetBtn = document.getElementById('reset-btn');
  var winLine = document.getElementById('win-line');
  var winLineEl = winLine.querySelector('line');
  var modeBtns = document.querySelectorAll('.mode-btn');
  var scoreEls = { x: document.getElementById('score-x'), o: document.getElementById('score-o'), d: document.getElementById('score-d') };
  var labelX = document.getElementById('label-x');
  var labelO = document.getElementById('label-o');

  function load(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function save(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
  }

  var isOnePlayer = load(KEY_MODE) !== '2';
  var scores = { '1': { x: 0, o: 0, d: 0 }, '2': { x: 0, o: 0, d: 0 } };
  try {
    var s = JSON.parse(load(KEY_SCORES));
    ['1', '2'].forEach(function (m) {
      if (s && s[m]) ['x', 'o', 'd'].forEach(function (k) {
        var n = parseInt(s[m][k], 10);
        if (n >= 0) scores[m][k] = n;
      });
    });
  } catch (e) { /* keep defaults */ }

  var cells, isXTurn, isGameOver, computerTimer = 0, msgTimer = 0;

  // ---------- board ----------
  var tiles = [];
  for (var i = 0; i < 9; i++) {
    var tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'tile';
    tile.id = String(i);
    tile.setAttribute('aria-label', 'Square ' + (i + 1) + ', empty');
    gameboard.insertBefore(tile, winLine);
    tiles.push(tile);
  }

  function fitBoard() {
    var w = wrap.clientWidth, h = wrap.clientHeight;
    var size = Math.max(120, Math.floor(Math.min(w, h)));
    gameboard.style.width = size + 'px';
    gameboard.style.height = size + 'px';
  }

  function markSvg(mark) {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('aria-hidden', 'true');
    if (mark === 'X') {
      svg.setAttribute('class', 'mx');
      ['M18 18L82 82', 'M82 18L18 82'].forEach(function (d) {
        var p = document.createElementNS(SVG_NS, 'path');
        p.setAttribute('d', d);
        p.setAttribute('pathLength', '100');
        svg.appendChild(p);
      });
    } else {
      svg.setAttribute('class', 'mo');
      var c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('cx', '50');
      c.setAttribute('cy', '50');
      c.setAttribute('r', '35');
      svg.appendChild(c);
    }
    return svg;
  }

  // ---------- UI ----------
  function playerName(mark) {
    if (isOnePlayer) return mark === 'X' ? 'You' : 'Computer';
    return 'Player ' + mark;
  }

  function setStatus(mark, text, result) {
    statusMark.className = 'mark-chip ' + (mark ? mark.toLowerCase() : 'none');
    statusText.textContent = text;
    statusEl.classList.toggle('result', !!result);
  }

  function updateTurn() {
    var mark = isXTurn ? 'X' : 'O';
    gameboard.classList.toggle('turn-x', isXTurn && !isGameOver);
    gameboard.classList.toggle('turn-o', !isXTurn && !isGameOver && !isOnePlayer);
    gameboard.classList.toggle('locked', isGameOver || (isOnePlayer && !isXTurn));
    if (isGameOver) return;
    if (isOnePlayer) setStatus(mark, isXTurn ? 'Your turn' : 'Computer is thinking…');
    else setStatus(mark, 'Player ' + mark + '’s turn');
  }

  function updateScores() {
    var sc = scores[isOnePlayer ? '1' : '2'];
    scoreEls.x.textContent = sc.x;
    scoreEls.o.textContent = sc.o;
    scoreEls.d.textContent = sc.d;
    labelX.textContent = isOnePlayer ? 'You (X)' : 'Player X';
    labelO.textContent = isOnePlayer ? 'Computer (O)' : 'Player O';
    for (var j = 0; j < modeBtns.length; j++) {
      var on = (modeBtns[j].getAttribute('data-mode') === '1') === isOnePlayer;
      modeBtns[j].setAttribute('aria-checked', on ? 'true' : 'false');
    }
  }

  // ---------- game ----------
  function reset() {
    clearTimeout(computerTimer);
    clearTimeout(msgTimer);
    cells = ['', '', '', '', '', '', '', '', ''];
    isXTurn = true;
    isGameOver = false;
    tiles.forEach(function (t, idx) {
      t.textContent = '';
      t.classList.remove('win', 'dim');
      t.setAttribute('aria-label', 'Square ' + (idx + 1) + ', empty');
    });
    winLine.classList.remove('show');
    gameOverMsg.classList.add('hidden');
    updateTurn();
    updateScores();
  }

  function place(index, mark) {
    cells[index] = mark;
    tiles[index].appendChild(markSvg(mark));
    tiles[index].setAttribute('aria-label', 'Square ' + (index + 1) + ', ' + mark);
    isXTurn = mark !== 'X';
    if (!checkForEnd()) updateTurn();
  }

  function findWin() {
    for (var j = 0; j < LINES.length; j++) {
      var l = LINES[j];
      if (cells[l[0]] && cells[l[0]] === cells[l[1]] && cells[l[1]] === cells[l[2]]) return l;
    }
    return null;
  }

  function cellCenter(idx) {
    return [(idx % 3) * 100 + 50, Math.floor(idx / 3) * 100 + 50];
  }

  function checkForEnd() {
    var line = findWin();
    var full = cells.every(function (c) { return c !== ''; });
    if (!line && !full) return false;
    isGameOver = true;
    clearTimeout(computerTimer);
    updateTurn();
    var key = isOnePlayer ? '1' : '2';
    var text;
    if (line) {
      var mark = cells[line[0]];
      scores[key][mark.toLowerCase()]++;
      tiles.forEach(function (t, idx) {
        if (line.indexOf(idx) >= 0) t.classList.add('win');
        else t.classList.add('dim');
      });
      var a = cellCenter(line[0]), b = cellCenter(line[2]);
      var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.sqrt(dx * dx + dy * dy);
      var ext = 38 / len;
      winLineEl.setAttribute('x1', a[0] - dx * ext);
      winLineEl.setAttribute('y1', a[1] - dy * ext);
      winLineEl.setAttribute('x2', b[0] + dx * ext);
      winLineEl.setAttribute('y2', b[1] + dy * ext);
      winLine.classList.add('show');
      if (isOnePlayer) text = mark === 'X' ? 'You win!' : 'Computer wins!';
      else text = 'Player ' + mark + ' wins!';
      setStatus(mark, text, true);
    } else {
      scores[key].d++;
      text = 'It’s a draw!';
      setStatus('', text, true);
    }
    save(KEY_SCORES, JSON.stringify(scores));
    updateScores();
    msgTimer = setTimeout(function () {
      winnerEl.textContent = text;
      gameOverMsg.classList.remove('hidden');
      resetBtn.focus({ preventScroll: true });
    }, line ? 900 : 600);
    return true;
  }

  function computerMove() {
    if (isGameOver || isXTurn || !isOnePlayer) return;
    var free = [];
    for (var j = 0; j < 9; j++) if (!cells[j]) free.push(j);
    if (!free.length) return;
    place(free[Math.floor(Math.random() * free.length)], 'O');
  }

  function handleTile(index) {
    if (isGameOver || cells[index]) return;
    if (isOnePlayer) {
      if (!isXTurn) return;
      place(index, 'X');
      if (!isGameOver) computerTimer = setTimeout(computerMove, 650);
    } else {
      place(index, isXTurn ? 'X' : 'O');
    }
  }

  // Pointer Events: react on pointerup inside the same tile (fast on touch, no ghost clicks)
  var downTile = -1;
  gameboard.addEventListener('pointerdown', function (e) {
    var t = e.target.closest ? e.target.closest('.tile') : null;
    downTile = t ? tiles.indexOf(t) : -1;
  });
  gameboard.addEventListener('pointerup', function (e) {
    var t = e.target.closest ? e.target.closest('.tile') : null;
    var idx = t ? tiles.indexOf(t) : -1;
    if (idx >= 0 && idx === downTile) handleTile(idx);
    downTile = -1;
  });
  gameboard.addEventListener('pointercancel', function () { downTile = -1; });
  // keyboard activation of a focused tile (Enter / Space) produces a click with detail 0
  gameboard.addEventListener('click', function (e) {
    if (e.detail !== 0) return;
    var t = e.target.closest ? e.target.closest('.tile') : null;
    if (t) handleTile(tiles.indexOf(t));
  });
  gameboard.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  document.addEventListener('keydown', function (e) {
    if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      handleTile(parseInt(e.key, 10) - 1);
    } else if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey) {
      reset();
    }
  });

  function setMode(onePlayer) {
    if (onePlayer === isOnePlayer) return;
    isOnePlayer = onePlayer;
    save(KEY_MODE, isOnePlayer ? '1' : '2');
    reset();
  }

  for (var k = 0; k < modeBtns.length; k++) {
    modeBtns[k].addEventListener('click', function () {
      setMode(this.getAttribute('data-mode') === '1');
    });
  }

  resetBtn.addEventListener('click', reset);
  gameOverMsg.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
  gameOverMsg.addEventListener('pointerup', function (e) { e.stopPropagation(); });
  document.getElementById('new-btn').addEventListener('click', reset);
  document.getElementById('clear-btn').addEventListener('click', function () {
    scores[isOnePlayer ? '1' : '2'] = { x: 0, o: 0, d: 0 };
    save(KEY_SCORES, JSON.stringify(scores));
    updateScores();
  });

  if (window.ResizeObserver) new ResizeObserver(fitBoard).observe(wrap);
  window.addEventListener('resize', fitBoard);
  window.addEventListener('orientationchange', function () { setTimeout(fitBoard, 200); });

  fitBoard();
  reset();
})();
