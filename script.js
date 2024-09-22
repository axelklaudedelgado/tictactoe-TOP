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

function createPlayer(name, marker)  {
  const getName = () => name;

  const getMarker = () => marker;

  return {getName, getMarker};
}

const gameController = (() => {

  let players = [];

  const getPlayers = () => players;

  let activePlayer;

  const setPlayers = (playerOneName, playerTwoName, marker) => {
    const playerOneMarker = marker;
    const playerTwoMarker = marker === "X" ? "O" : "X";

    players = [
      createPlayer(playerOneName, playerOneMarker),
      createPlayer(playerTwoName, playerTwoMarker)
    ];

    activePlayer = players.find(player => player.getMarker() === "X"); 
  };

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
  };

  const playRound = (row, column) => {
    if (isMoveValid(row, column)) {
      gameboard.placeMarker(row, column, getActivePlayer().getMarker());
      const winnerResult = checkWinner();
      if (winnerResult) {
        return ["win", winnerResult];
      } else if (!winnerResult && boardIsFull()) {
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
    setPlayers,
    switchPlayerTurn,
    playRound,
    setActivePlayer,
    getActivePlayer,
    getPlayers
  };
})();

const ScreenController = (() => {
  let roundActivePlayer;

  const playerCreation = document.querySelector(".createPlayers");
  const boardContainer = document.querySelector(".boardContainer");


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

  const playGameButton = document.querySelector(".playButton");
  const newGameButton = document.querySelector(".newGame");
  const playerOneInput = document.querySelector("#playerOneInput");
  const playerTwoInput = document.querySelector("#playerTwoInput");
  const inputForm = document.querySelector(".inputForm");

  playGameButton.addEventListener("click", (event) => {
    checkNameSimilar();

    let isFormValid = inputForm.checkValidity();
  
    if(!isFormValid) {
      inputForm.reportValidity();
    } else {
      event.preventDefault();
      const [playerOneName, playerTwoName, chosenMarker] = getPlayerValues();
      gameController.setPlayers(playerOneName, playerTwoName, chosenMarker);
      inputForm.reset(); 
      toggleContainerVisibility();
      createScoreboard();
      createGrid();
    }
  })

  const toggleContainerVisibility = () => {
    if (boardContainer.classList.contains("hidden")) {
      playerCreation.classList.replace("show", "hidden");
      boardContainer.classList.replace("hidden", "show");
    } else {
      playerCreation.classList.replace("hidden", "show");
      boardContainer.classList.replace("show", "hidden");
    }
  };
  newGameButton.addEventListener("click", () => {
    resetBoard();
    toggleContainerVisibility();
  });

  const resetTurnClasses = () => {
    const turnDivs = [playerOneDiv, playerTwoDiv, tieDiv];
    turnDivs.forEach(div => div.classList.replace("winTurn", "inactiveTurn"));
  };

  const getPlayerValues = () => {
    let playerOneName = playerOneInput.value;
    let playerTwoName = playerTwoInput.value;
    let chosenMarker = document.querySelector('input[name="marker"]:checked').value;

    return [playerOneName, playerTwoName, chosenMarker]
  };

  const checkNameSimilar = () => {
    if ((playerOneInput.value).toLowerCase() !== (playerTwoInput.value).toLowerCase()) {
      playerOneInput.setCustomValidity("");
    } else {
      playerOneInput.setCustomValidity("Player names can't be the same!");
    }
  }
  playerOneInput.addEventListener("input", checkNameSimilar);
  playerTwoInput.addEventListener("input", checkNameSimilar);

  const updateTurnColor = (activeMarker, playerOneDiv, playerTwoDiv) => {
    const players = gameController.getPlayers();
    if (activeMarker === players[0].getMarker()) {
      playerTwoDiv.classList.replace("activeTurn", "inactiveTurn");
      playerOneDiv.classList.replace("inactiveTurn", "activeTurn");
    } else {
      playerOneDiv.classList.replace("activeTurn", "inactiveTurn");
      playerTwoDiv.classList.replace("inactiveTurn", "activeTurn");
    }
  };
  
  const updateScreen = () => {
    const players = gameController.getPlayers(); 
    const activePlayer = gameController.getActivePlayer();
    playerTurnMarker.textContent = `${activePlayer.getMarker()}`;
  
    resetTurnClasses();
    updateTurnColor(activePlayer.getMarker(), playerOneDiv, playerTwoDiv);
  
    gameboard.getBoard().forEach((row, rowIndex) => {
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

    const players = gameController.getPlayers(); 
    const playerOne = players[0].getName();
    const playerTwo = players[1].getName();

    playerOneText.textContent = `${playerOne}`;
    playerTwoText.textContent = `${playerTwo}`;

    playerOneScore.textContent = "0";
    tieScore.textContent = "0";
    playerTwoScore.textContent = "0";
  };
  
  const incrementScore = (scoreElement) => {
    let currentScore = parseInt(scoreElement.textContent);
    scoreElement.textContent = currentScore + 1;
  };
  
  const updateScoreboard = (tie=false) => {
    const players = gameController.getPlayers();
    resetTurnClasses();
    
    if (tie) {
      if (playerOneDiv.classList.contains("activeTurn")) {
        playerOneDiv.classList.replace("activeTurn", "inactiveTurn");
      }
      if (playerTwoDiv.classList.contains("activeTurn")) {
        playerTwoDiv.classList.replace("activeTurn", "inactiveTurn");
      }
      tieDiv.classList.add("winTurn");
      incrementScore(tieScore);
    } else if (playerTurnMarker.textContent === players[0].getMarker()) {
      playerOneDiv.classList.replace("activeTurn", "winTurn");
      incrementScore(playerOneScore);
    } else {
      playerTwoDiv.classList.replace("activeTurn", "winTurn");
      incrementScore(playerTwoScore);
    }
  };

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
    let winnerCells = [];
  
    if (winType === "horizontal") {
      winnerCells = document.querySelectorAll(`[data-row="${indices}"]`);
    } else if (winType === "vertical") {
      winnerCells = document.querySelectorAll(`[data-column="${indices}"]`);
    } else if (winType === "diagonal") {
      indices.forEach((columnIndex, rowIndex) => 
        winnerCells.push(document.querySelector(`[data-row="${rowIndex}"][data-column="${columnIndex}"]`))
      );
    }
  
    applyWinAnimation(winnerCells);
  };

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
})();