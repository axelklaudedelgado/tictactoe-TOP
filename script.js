const gameboard = (() => {
  const rows = 3;
  const columns = 3;
  const board = [];

  function Cell() {
    let value;
  
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

  const getPlayers = () => players;

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
  };

  const printNewRound = () => {
    gameboard.printBoard();
    console.log(`${getActivePlayer().getName()}'s turn.`);
  };

  const playRound = (row, column) => {
    const board = gameboard.getBoard();
    if((board[row][column]).getValue() === undefined) {
      gameboard.placeMarker(row, column, getActivePlayer().getMarker());

      if(checkWinner()) return;

      switchPlayerTurn();
    } else {
      console.log("Space is occupied! Please try again.")
    }
    printNewRound();
  };

  printNewRound();

  return {
    playRound,
    getActivePlayer,
    getPlayers
  };
})();

const ScreenController = (() => {
  const playerTurnDiv = document.querySelector('.marker');
  const boardDiv = document.querySelector('.board');
  
  const playerOneScore = document.querySelector("#playerOneScore");
  const tieScore = document.querySelector("#tieScore");
  const playerTwoScore = document.querySelector("#playerTwoScore");

  const updateScreen = () => {
    const board = gameboard.getBoard();
    const activePlayer = gameController.getActivePlayer();

    playerTurnDiv.textContent = `${activePlayer.getMarker()}`;

    board.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        const cellButton = document.querySelector(`[data-row="${rowIndex}"][data-column="${columnIndex}"]`);
        const buttonText = cellButton.children[0];

        if (buttonText.textContent !== cell.getValue()) {
          buttonText.textContent = cell.getValue();
        }
      });
    });
  };

  const createScoreboard = () => {
    const players = gameController.getPlayers();

    const playerOneDisplay = document.querySelector("#playerOne");
    const playerTwoDisplay = document.querySelector("#playerTwo");

    const playerOne = players[0].getName();
    const playerTwo = players[1].getName();

    playerOneDisplay.textContent = `${playerOne}`;
    playerTwoDisplay.textContent = `${playerTwo}`;

    playerOneScore.textContent = "0";
    tieScore.textContent = "0";
    playerTwoScore.textContent = "0";
  };

  const createGrid = () => {
    boardDiv.textContent = "";

    const board = gameboard.getBoard();

    board.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        const cellButton = document.createElement("button");
        const buttonText = document.createElement("p");
        cellButton.classList.add("cell");
        cellButton.dataset.column = columnIndex;
        cellButton.dataset.row = rowIndex;
        buttonText.textContent = cell.getValue();
        cellButton.appendChild(buttonText);
        boardDiv.appendChild(cellButton);
      })
    })

    updateScreen();
  };

  function clickHandlerBoard(e) {
    const selectedRow = e.target.dataset.row;
    const selectedColumn = e.target.dataset.column;
    const buttonText = e.target.children[0];
  
    if (!selectedColumn) return;
    
    gameController.playRound(selectedRow, selectedColumn);
    buttonText.classList.add("markerAnimation");

    updateScreen();
  }
  boardDiv.addEventListener("click", clickHandlerBoard);

  createScoreboard();
  createGrid();

})();

const players = gameController.getPlayers();
players.forEach(player => console.log(player.getName()));