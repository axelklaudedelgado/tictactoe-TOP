const gameboard = (() => {
  const rows = 3;
  const columns = 3;
  let board = [];

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

  const createBoard = () => {
    board = [];
    for (let i = 0; i < rows; i++) {
      board[i] = [];
      for (let j = 0; j < columns; j++) {
        board[i].push(Cell());
      }
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

  createBoard();

  return { createBoard, getBoard, getBoardValues, placeMarker, printBoard };
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

  const setActivePlayer = (player) => activePlayer = player;

  const getActivePlayer = () => activePlayer;

  const checkWinner = () => {
    const currentBoard = gameboard.getBoardValues();
    let winningIndex;

    const allEqual = array => array.every(value => (value === "X" || value === "O") && value === array[0]);

    const checkHorizontalWinner = () => currentBoard.some((row, index) => {
      if(allEqual(row)) return winningIndex = ["horizontal", index];
    });

    const checkVerticalWinner = () => {
      const [firstRow, secondRow, thirdRow] = currentBoard;
      firstRow.some((value, index) => {
        if(allEqual([value, secondRow[index], thirdRow[index]])) winningIndex = ["vertical", index];
      });
      
      return winningIndex;
    };

    const checkDiagonalWinner = () => {
      const getDiagonal = () => currentBoard.map((row, index) => row[index]);
      const getReverseDiagonal = () => currentBoard.map((row, index) => [...row].reverse()[index]);

      if(allEqual(getDiagonal())) {
        winningIndex = ["diagonal", [0, 1, 2]];
      } else if (allEqual(getReverseDiagonal())) {
        winningIndex = ["diagonal", [2, 1, 0]];
      }

      return winningIndex;
    };

    if( checkHorizontalWinner() || checkVerticalWinner() || checkDiagonalWinner() ) {
      console.log(`${getActivePlayer().getName()} wins!`);
      gameboard.printBoard();
      return winningIndex;
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
        return ["win", checkWinner()];
      } else if(!(checkWinner()) && boardIsFull()) {
        return "tie";
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

  const boardIsFull = () => {
    if((gameboard.getBoardValues()).every(row => row.every(cell => cell !== undefined))) {
      return true;
    }
  }

  printNewRound();

  return {
    switchPlayerTurn,
    playRound,
    setActivePlayer,
    getActivePlayer,
    getPlayers
  };
})();

const ScreenController = (() => {
  let players = gameController.getPlayers();

  const playerTurnDiv = document.querySelector(".turn");
  const playerTurnMarker = document.querySelector(".marker");

  const playerOneDiv = document.querySelector("#playerOneDiv");
  const tieDiv = document.querySelector("#tieDiv");
  const playerTwoDiv = document.querySelector("#playerTwoDiv");

  const boardDiv = document.querySelector(".board");
  
  const resetButton = document.querySelector(".reset");
  
  const playerOneScore = document.querySelector("#playerOneScore");
  const tieScore = document.querySelector("#tieScore");
  const playerTwoScore = document.querySelector("#playerTwoScore");

  let roundActivePlayer;

  const updateScreen = () => {
    const board = gameboard.getBoard();
    const activePlayer = gameController.getActivePlayer();

    playerTurnMarker.textContent = `${activePlayer.getMarker()}`;

    if (playerOneDiv.classList.contains("winTurn")) {
      playerOneDiv.classList.replace("winTurn", "inactiveTurn");
    } else if (playerTwoDiv.classList.contains("winTurn")) {
      playerTwoDiv.classList.replace("winTurn", "inactiveTurn");
    } else if (tieDiv.classList.contains("winTurn")) {
      tieDiv.classList.replace("winTurn", "inactiveTurn");
    }

    if(playerTurnMarker.textContent === players[0].getMarker()) {
      playerTwoDiv.classList.replace("activeTurn", "inactiveTurn");
      playerOneDiv.classList.replace("inactiveTurn", "activeTurn");
    } else if(playerTurnMarker.textContent === players[1].getMarker()) {
      playerOneDiv.classList.replace("activeTurn", "inactiveTurn");
      playerTwoDiv.classList.replace("inactiveTurn", "activeTurn");
    }

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
    const playerOneText = document.querySelector("#playerOneName");
    const playerTwoText = document.querySelector("#playerTwoName");

    const playerOne = players[0].getName();
    const playerTwo = players[1].getName();

    playerOneText.textContent = `${playerOne}`;
    playerTwoText.textContent = `${playerTwo}`;

    playerOneScore.textContent = "0";
    tieScore.textContent = "0";
    playerTwoScore.textContent = "0";
  };
  
  const updateScoreboard = (tie=false) => {
    if (tie === true) {
      let currentTieScore = parseInt(tieScore.textContent);
      playerOneDiv.classList.replace("activeTurn", "inactiveTurn");
      playerTwoDiv.classList.replace("activeTurn", "inactiveTurn");
      tieDiv.classList.add("winTurn");
      tieScore.textContent = currentTieScore + 1;
    } else if (playerTurnMarker.textContent === players[0].getMarker()) {
      let currentPlayerOneScore = parseInt(playerOneScore.textContent);
      playerOneDiv.classList.replace("activeTurn", "winTurn");
      playerOneScore.textContent = currentPlayerOneScore + 1;
    } else {
      let currentPlayerTwoScore = parseInt(playerTwoScore.textContent);
      playerTwoDiv.classList.replace("activeTurn", "winTurn");
      playerTwoScore.textContent = currentPlayerTwoScore + 1;
    } 
  }

  const createGrid = () => {
    boardDiv.textContent = "";
    resetButton.textContent = "Reset Round";

    roundActivePlayer = gameController.getActivePlayer();

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

  const highlightWinner = (winnerResult) => {
    const [winType, indices] = winnerResult;
    if(winType === "horizontal") {
      const winRow = indices;
      const winnerCells = document.querySelectorAll(`[data-row="${winRow}"`);
      applyWinAnimation(winnerCells);
    } else if(winType === "vertical") {
      const winColumn = indices;
      const winnerCells = document.querySelectorAll(`[data-column="${winColumn}"`);
      applyWinAnimation(winnerCells);
    } else if(winType === "diagonal") {
      const winnerCells = [];
      console.log(indices);
      indices.forEach((columnIndex, rowIndex) => winnerCells.push(document.querySelector(`[data-row="${rowIndex}"][data-column="${columnIndex}"]`)));
      applyWinAnimation(winnerCells);
    }
  }

  const applyWinAnimation = (cells) => {
    let delay = 0;
    cells.forEach(cell => {
      cell.classList.add("winAnimation");
      cell.style.animationDelay = `${delay}s`;
      delay += 0.15;
    });
  };

  const clickHandlerBoard = (e) => {
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
  
    updateScreen();

    if (moveResult[0] === "win") {
      playerTurnDiv.textContent = "";
      playerTurnDiv.appendChild(playerTurnMarker);
      playerTurnDiv.appendChild(document.createTextNode(" wins!"));
      resetButton.textContent = "Next Round"
      updateScoreboard();
      highlightWinner(moveResult[1]);
      deactivateBoard();
    } else if(moveResult === "tie") {
      playerTurnDiv.textContent = "";
      const span = document.createElement("span");
      span.style.fontSize = "2rem";
      span.textContent = "Tie";
      resetButton.textContent = "Next Round"
      playerTurnDiv.appendChild(span);
      updateScoreboard(true);
      deactivateBoard();
    }
  }

  const resetBoard = () => {
    gameboard.createBoard();
    resetButton.textContent === "Next Round" && (playerTurnDiv.children[0].textContent !== "Tie") ? gameController.switchPlayerTurn() : gameController.setActivePlayer(roundActivePlayer);
    createGrid();
    playerTurnDiv.textContent = "";
    playerTurnDiv.appendChild(playerTurnMarker);
    playerTurnDiv.appendChild(document.createTextNode(" turn"));
  }
  resetButton.addEventListener("click", resetBoard);

  createScoreboard();
  createGrid();

})();

const players = gameController.getPlayers();
players.forEach(player => console.log(player.getName()));