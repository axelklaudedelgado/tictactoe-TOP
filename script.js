const gameboard = (() => {
  const rows = 3;
  const columns = 3;
  const board = [];

  function Cell() {
    let value = "0";
  
    const addMarker = (marker) => {
      value = marker;
    };
  
    const getValue = () => value;
  
    return {
      addMarker,
      getValue
    };
  }

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(Cell());
    }
  }
  
  const getBoard = () => board;

  const placeMarker = (row, column, marker) => {
    board[row][column].addMarker(marker);
  };

  const printBoard = () => {
    const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()))
    console.log(boardWithCellValues);
  };

  return { getBoard, placeMarker, printBoard };
})();

function createPlayer(playerNumber, marker)  {
  const name = prompt(`Create display name for Player ${playerNumber}: `);

  const getName = () => name;

  const getMarker = () => marker;

  return {getName, getMarker};
}

const gameController = (() => {

  const players = [
    createPlayer(1, "X"),
    createPlayer(2, "O")
  ];

  let activePlayer = players[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const getActivePlayer = () => activePlayer;

  const printNewRound = () => {
    gameboard.printBoard();
    console.log(`${getActivePlayer().getName()}'s turn.`);
  };

  const playRound = (row, column) => {
    gameboard.placeMarker(row, column, getActivePlayer().getMarker());

    /*  This is where we would check for a winner and handle that logic,
        such as a win message. */

    switchPlayerTurn();
    printNewRound();
  };

  printNewRound();

  return {
    playRound,
    getActivePlayer
  };
})();