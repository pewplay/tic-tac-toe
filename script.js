document.addEventListener('DOMContentLoaded', () => {

  const gameboard = document.getElementById('gameboard');
  const gameOverMsg = document.getElementById('gameover-msg');
  const winner = document.getElementById('winner');
  const resetBtn = document.getElementById('reset-btn');
  const playerToggleBtn = document.getElementById('toggle-btn');
  const playerTurn = document.getElementById('player-turn');
  playerTurn.textContent = 'X';

  const $ivory = '#F6F7EB';
  const $green = '#ffcb03';

  let tilesArr = [
    0, 1, 2,
    3, 4, 5,
    6, 7, 8
  ];

  let isOnePlayer = true;
  let isComputerTurn = false;
  let isXTurn = true;
  let isGameOver = false;
  let validPlays = 0;
  let winningCombo;

  const addTiles = () => {
    tilesArr.forEach((index) => {
      const tile = document.createElement('div');
      tile.id = index;
      tile.classList.add('tile');
      tile.addEventListener('click', () => handleClick(tile));
      gameboard.appendChild(tile);
    });
  }

  addTiles();

  const tiles = document.querySelectorAll('.tile');

  const handleClick = (tile) => {
    if (isOnePlayer === true) {
      if (isXTurn && tile.textContent === '') {
        markX(tile);
        isComputerTurn = true;
        !isGameOver ? 
        setTimeout(() => computerMarkO(), 1000) :
        false;
      }
    }
    if (isOnePlayer === false) {
      if (isXTurn && tile.textContent === '') {
        markX(tile);
      } else if (!isXTurn && tile.textContent === '') {
        markO(tile);
      }
    }
  }

  const markX = (tile) => {
    tile.textContent = 'X';
    tilesArr[tile.id] = 'X';
    validPlays++;
    isXTurn = !isXTurn;
    isXTurn ? playerTurn.textContent = 'X' : playerTurn.textContent = 'O';
    checkForWin();
    validPlays === 9 ? displayMessage() : false;
  }

  const markO = (tile) => {
    tile.textContent = 'O';
    tilesArr[tile.id] = 'O';
    validPlays++;
    isXTurn = !isXTurn;
    isXTurn ? playerTurn.textContent = 'X' : playerTurn.textContent = 'O';
    checkForWin();
    validPlays === 9 ? displayMessage() : false;
  }

  const getRandomTile = () => {
    const availTilesArr = [];
    for (let i = 0; i < tilesArr.length; i++) {
      if (tilesArr[i] !== 'X' && tilesArr[i] !== 'O') {
        availTilesArr.push(i);
      }
    }
    const randomIndex = Math.floor(Math.random() * availTilesArr.length);
    return availTilesArr[randomIndex];
  }

  const computerMarkO = () => {
    if (isComputerTurn) {
      let randomID = getRandomTile();
      let randomTile = document.getElementById(randomID);
      randomTile.textContent = 'O';
      tilesArr[randomID] = 'O';
      validPlays++;
      isXTurn = !isXTurn;
      isXTurn ? playerTurn.textContent = 'X' : playerTurn.textContent = 'O';
      checkForWin();
      validPlays === 9 ? displayMessage() : false;
    }
    isComputerTurn = false;
  }

  const checkForWin = () => {
    // winning combos
    // [0,1,2], [3,4,5], [6,7,8], [0,3,6], 
    // [1,4,7], [2,5,8], [0,4,8], [2,4,6]
    tilesArr[0] === tilesArr[1] &&
    tilesArr[1] === tilesArr[2] &&
    tilesArr[0] === tilesArr[2] ?
    gameOver(0) :
    false;

    tilesArr[3] === tilesArr[4] &&
    tilesArr[4] === tilesArr[5] &&
    tilesArr[3] === tilesArr[5] ?
    gameOver(1) :
    false;

    tilesArr[6] === tilesArr[7] &&
    tilesArr[7] === tilesArr[8] &&
    tilesArr[6] === tilesArr[8] ?
    gameOver(2) :
    false;

    tilesArr[0] === tilesArr[3] &&
    tilesArr[3] === tilesArr[6] &&
    tilesArr[0] === tilesArr[6] ?
    gameOver(3) :
    false;

    tilesArr[1] === tilesArr[4] &&
    tilesArr[4] === tilesArr[7] &&
    tilesArr[1] === tilesArr[7] ?
    gameOver(4) :
    false;

    tilesArr[2] === tilesArr[5] &&
    tilesArr[5] === tilesArr[8] &&
    tilesArr[2] === tilesArr[8] ?
    gameOver(5) :
    false;

    tilesArr[0] === tilesArr[4] &&
    tilesArr[4] === tilesArr[8] &&
    tilesArr[0] === tilesArr[8] ?
    gameOver(6) :
    false;

    tilesArr[2] === tilesArr[4] &&
    tilesArr[4] === tilesArr[6] &&
    tilesArr[2] === tilesArr[6] ?
    gameOver(7) :
    false;

  }

  const gameOver = (val) => {
    isGameOver = true;
    winningCombo = val;
    switch (winningCombo) {
      case 0:
        tiles[0].style.color = $green;
        tiles[1].style.color = $green;
        tiles[2].style.color = $green;
        break;
      case 1:
        tiles[3].style.color = $green;
        tiles[4].style.color = $green;
        tiles[5].style.color = $green;
        break;
      case 2:
        tiles[6].style.color = $green;
        tiles[7].style.color = $green;
        tiles[8].style.color = $green;
        break;
      case 3:
        tiles[0].style.color = $green;
        tiles[3].style.color = $green;
        tiles[6].style.color = $green;
        break;
      case 4: 
        tiles[1].style.color = $green;
        tiles[4].style.color = $green;
        tiles[7].style.color = $green;
        break;
      case 5:
        tiles[2].style.color = $green;
        tiles[5].style.color = $green;
        tiles[8].style.color = $green;
        break;
      case 6:
        tiles[0].style.color = $green;
        tiles[4].style.color = $green;
        tiles[8].style.color = $green;
        break;
      case 7:
        tiles[2].style.color = $green;
        tiles[4].style.color = $green;
        tiles[6].style.color = $green;
    }
    displayMessage();
  }

  const displayMessage = () => {
    if (isGameOver) {
      setTimeout(() => {
        gameOverMsg.style.display = 'block';
        playerTurn.textContent === 'X' ? 
        winner.textContent = 'Giocatore O Vince!' : 
        winner.textContent = 'Giocatore X Vince!';
      }, 1000);
    } 
    if (!isGameOver) {
      gameOverMsg.style.display = 'block';
      winner.textContent = 'Pareggio!'
    }
  }

  const reset = () => {
    tiles.forEach((tile) => {
      tile.textContent = '';
      tile.style.color = $ivory;
    });
    tilesArr = [
      0, 1, 2,
      3, 4, 5,
      6, 7, 8
    ];
    winningCombo = '';
    isXTurn = true;
    isGameOver = false;
    validPlays = 0;
    playerTurn.textContent = 'X';
    gameOverMsg.style.display = 'none';
  }

  const handleNumPlayers = () => {
    isOnePlayer = !isOnePlayer;
    isOnePlayer ? 
    playerToggleBtn.style.float = 'left' : 
    playerToggleBtn.style.float = 'right';
  }

  resetBtn.addEventListener('click', () => reset());
  playerToggleBtn.addEventListener('click', () => handleNumPlayers());
});