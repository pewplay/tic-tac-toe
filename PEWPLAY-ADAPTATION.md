# Tic Tac Toe for PewPlay

This directory contains the original static game adapted for the PewPlay game template. Open `index.html` to play.

`game.json` holds the game page text. `preview.png` and `cover.png` provide the page images. The PewPlay workflow checks pushes to `preview` and `main`.

Game controls: Place X or O in an empty square and try to make a line of three. Start a new match with the on-screen button.

## Second pass (quality update)
- Board sized to the largest square that fits; side panel layout in landscape.
- Clear status pill (turn / thinking / win / draw), animated marks, winning strike line, in-board result card.
- 1 Player / 2 Players segmented control (switching starts a new round), scoreboard per mode, Reset score.
- Fixed: pressing New game while the computer was "thinking" let it play on the fresh board.
- Pointer Events input, keys 1-9 and N; no external fonts.
- Saves `tic-tac-toe:mode` and `tic-tac-toe:scores`. New cover and screenshots.
