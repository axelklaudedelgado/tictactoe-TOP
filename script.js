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
    if (isMoveValid(row, column)) {
      gameboard.placeMarker(row, column, getActivePlayer().getMarker());
      if (checkWinner()) {
        return "win";
      }
      switchPlayerTurn();
      printNewRound();
      return "valid";
    } else {
      return "invalid";
    }
  };
  
  const isMoveValid = (row, column) => {
    const board = gameboard.getBoard();
    return board[row][column].getValue() === undefined;
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
        cellButton.addEventListener("click", clickHandlerBoard);
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

  const deactivateBoard = () => {
    Array.from(boardDiv.children).forEach(button => button.removeEventListener("click", clickHandlerBoard));
  }

  function clickHandlerBoard(e) {
    const button = e.target.closest("button");
    const selectedRow = button.dataset.row;
    const selectedColumn = button.dataset.column;
    const buttonText = button.children[0];
    
    if (!selectedColumn) return;
    
    const moveResult = gameController.playRound(selectedRow, selectedColumn);
  
    buttonText.classList.add("markerAnimation");
  
    if (moveResult === "invalid") {
      buttonText.classList.remove("invalidAnimation");
      void buttonText.offsetWidth;
      buttonText.classList.add("invalidAnimation");
    }

    if (moveResult === "win") {
      deactivateBoard();
    }
  
    updateScreen();
  }

  createScoreboard();
  createGrid();

})();

const players = gameController.getPlayers();
players.forEach(player => console.log(player.getName()));