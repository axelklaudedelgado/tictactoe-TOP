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

  const getBoardValues = () => board.map((row) => row.map((cell) => cell.getValue()));

  const placeMarker = (row, column, marker) => {
    board[row][column].addMarker(marker);
  };

  const printBoard = () => {
    const boardWithCellValues = getBoardValues();
    console.log(boardWithCellValues);
  };

  return { getBoard, getBoardValues, placeMarker, printBoard };
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

  const checkWinner = () => {
    const currentBoard = gameboard.getBoardValues();

    const allEqual = array => array.every(value => (value === "X" || value === "O") && value === array[0]);

    const checkHorizontalWinner = () => currentBoard.some(row => allEqual(row));

    const checkVerticalWinner = () => {
      const [firstRow, secondRow, thirdRow] = currentBoard;
      return firstRow.some((value, index) => allEqual([value, secondRow[index], thirdRow[index]]));
    };

    const checkDiagonalWinner = () => {
      const getDiagonal = () => currentBoard.map((row, index) => row[index]);
      const getReverseDiagonal = () => currentBoard.map((row, index) => [...row].reverse()[index]);

      return allEqual(getDiagonal()) || allEqual(getReverseDiagonal());
    };

    if( checkHorizontalWinner() || checkVerticalWinner() || checkDiagonalWinner() ) {
      console.log(`${getActivePlayer().getName()} wins!`);
      gameboard.printBoard();
      return true;
    }
  }

  const printNewRound = () => {
    gameboard.printBoard();
    console.log(`${getActivePlayer().getName()}'s turn.`);
  };

  const playRound = (row, column) => {
    gameboard.placeMarker(row, column, getActivePlayer().getMarker());

    if(checkWinner()) return;

    switchPlayerTurn();
    printNewRound();
  };

  printNewRound();

  return {
    playRound,
    getActivePlayer
  };
})();