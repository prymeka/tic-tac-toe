const Player = (symbol, type) => {
  let _symbol = symbol;
  let _type = type;

  const getSymbol = () => _symbol;
  const setSymbol = (newSymbol) => _symbol = newSymbol;

  const getType = () => _type;
  const setType = (newType) => _type = newType;

  const easyMode = (computerSelections, playerSelections) => {
    // select random field
    let unselected = [];
    for (let i=0; i<9; i++) {
      if (!computerSelections.includes(i) && !playerSelections.includes(i)) {
        unselected.push(i);
      }
    }
    return unselected[Math.floor(Math.random()*unselected.length)];
  };

  const hardMode = (computerSelections, playerSelections) => {
    if (computerSelections.length === 0 && playerSelections.length === 0) return 4;
    // to be implemented
    let unselected = [];
    for (let i=0; i<9; i++) {
      if (!computerSelections.includes(i) && !playerSelections.includes(i)) {
        unselected.push(i);
      }
    }
    return unselected[Math.floor(Math.random()*unselected.length)];
  };

  const select = (computerSelections, playerSelections) => {
    if (_type === "computer-easy") {
      return easyMode(computerSelections, playerSelections);
    } else if (_type === "computer-hard") {
      return hardMode(computerSelections, playerSelections);
    } else {
      return;
    }
  };

  return {
    getSymbol, setSymbol,
    getType, setType,
    select
  };
};

const Gameboard = () => {
  const _winningSelections = [
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [1, 4, 7],
    [2, 4, 6],
    [2, 5, 8],
    [3, 4, 5],
    [6, 7, 8]
  ];

  let _selectionsX = [];
  let _selectionsO = [];

  const _searchInsertIndex = function(array, target) {
    if (array.indexOf(target) !== -1) {
      return array.indexOf(target);
    } else if (target > array[array.length-1]) {
      return array.length;
    } else if (target < array[0]) {
      return 0;
    } else {
      left = 0
      right = array.length - 1
      while (left <= right) {
        mid = Math.floor((left+right)/2)
        if (array[mid] === target) { 
          return mid; 
        } else if (array[mid] < target) {
          left = mid+1;
        } else {
          right = mid-1;
        }
      }
      return left;
    }
  };

  const getSelections = marker => {
    if (marker.toLowerCase() === "x") {
      return _selectionsX;
    } else if (marker.toLowerCase() === "o") {
      return _selectionsO;
    } else {
      return undefined;
    }
  };

  const addNewSelection = (selection, marker) => {
    if (marker.toLowerCase() === "x") {
      const index = _searchInsertIndex(_selectionsX, selection);
      _selectionsX.splice(index, 0, parseInt(selection));
    } else if (marker.toLowerCase() === "o") {
      const index = _searchInsertIndex(_selectionsO, selection);
      _selectionsO.splice(index, 0, parseInt(selection));
    }
  };

  const removeLastSelection = (marker) => {
    if (marker.toLowerCase() === "x") {
      _selectionsX.pop();
    } else if (marker.toLowerCase() === "o") {
      _selectionsO.pop();
    }
  };
    
  const checkForWin = marker => {
    let selectedFields = getSelections(marker);
    if (selectedFields.length < 3) return false;
    // since selections are sorted we don't need to check the last two
    for (let i=0; i<selectedFields.length-2; i++) {
      let selection = selectedFields[i];
      // since selections are sorted and we check for the first selection 
      // in the winning combination, we can skip the 4 and 5
      if (selection === 4 || selection === 5) continue;
      for (let j=0; j<_winningSelections.length; j++) {
        // check if the selection is not equal to the first element of 
        // any winning combination
        if (selection !== _winningSelections[j][0]) continue;
        // since winning combinations are sorted we can skip the rest 
        // of the for loop if selection less than first element
        if (selection < _winningSelections[j][0]) break;
        // if selection is equal and the player won, the other two 
        // fields in the winning combination must be selected too
        if (selectedFields.includes(_winningSelections[j][1]) && selectedFields.includes(_winningSelections[j][2])) {
          return true;
        }
      }
    }
    return false;
  };

  const checkForDraw = currentTurn => currentTurn > 7;

  const reset = () => {
    _selectionsX = [];
    _selectionsO = [];
  }

  return {
    getSelections, addNewSelection, removeLastSelection,
    checkForWin, checkForDraw,
    reset
  };

};

const Game = (() => {
  // cache DOM
  const fields = document.querySelectorAll(".field");
  const undoBtn = document.getElementById("undo-btn");
  const resetBtn = document.getElementById("reset-btn");
  const markerBtns = document.querySelectorAll(".marker-btn");
  const radioBtns = document.querySelectorAll(".radio-level");
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modal-content");

  // initialise 
  let _currentTurn = 0;
  let _board = Gameboard();

  let player = Player("X", "player");
  let computer = Player("O", "computer-easy");

  const playComputer = () => {
    let marker = computer.getSymbol();
    let compSelection = computer.select(_board.getSelections(marker), _board.getSelections(player.getSymbol()));
    _board.addNewSelection(compSelection, marker);
    // mark selection no the board
    fields[compSelection].textContent = marker;
  };

  // marker buttons events
  markerBtns.forEach(btn => btn.addEventListener("click", e => {
    // toggle button class
    markerBtns.forEach(btn => btn.classList.remove("selected"));
    btn.classList.add("selected");
    // reset players and the game
    player = Player(btn.value, "player");
    computer = Player(btn.value === "X" ? "O" : "X", computer.getType());
    resetGame();
    // if computer playes first, make the move
    if (btn.value === "O") {
      playComputer();
      _currentTurn++;
    }
  }));

  // radio buttons events
  radioBtns.forEach(btn => btn.addEventListener("change", e => {
    computer = Player(computer.getSymbol(), `computer-${e.target.value}`);
  }));


  // fields events
  const onFieldClick = e => {
    // ignore populated field
    if (e.currentTarget.textContent !== "") {
      return;
    }

    // player's turn
    let marker = player.getSymbol();
    _board.addNewSelection(e.currentTarget.id, marker);
    // mark selection no the board
    e.currentTarget.textContent = marker;
    // check if someone won or game is drawn
    let isEnd = checkForEnd(marker);
    _currentTurn++;
    
    // computer's turn
    if (isEnd) return;
    if (_currentTurn < 9) {
      setTimeout(() => {
        playComputer();
        // check if someone won or game is drawn
        marker = computer.getSymbol();
        checkForEnd(marker);
        _currentTurn++;
      }, 200);
    }
  };

  fields.forEach(field => field.addEventListener("click", e => onFieldClick(e)));

  // modal events 
  modal.addEventListener("click", () => {
    closeModal();
    resetGame();
  });

  const checkForEnd = marker => {
    let other = marker === "X" ? "O" : "X";
    if (_board.checkForWin(marker)) {
      onWin(marker);
    } else if (_board.checkForWin(other)) {
      onWin(marker);
    } else if (_board.checkForDraw(_currentTurn)) {
      onDraw();
    } else {
      return false;
    }
    return true;
  };

  const showModal = () => {
    modal.classList.remove("modal-closed");
    modal.classList.add("modal-open");
  };

  const closeModal = () => {
    modal.classList.remove("modal-open");
    modal.classList.add("modal-closed");
    modal.addEventListener("animationend", () => {
      modal.classList.remove("modal-closed");
    }, {once: true});
  };

  const onWin = marker => {
    showModal();
    modalContent.textContent = `${marker} Has Won. Congratulations!`;
  };

  const onDraw = () => {
    showModal();
    modalContent.textContent = "Draw.";
  };

  const resetGame = () => {
    _board.reset();
    fields.forEach(field => field.textContent = "");
    _currentTurn = 0;
  };

  // buttons events
  const onUndo = () => {
    if (_currentTurn < 1) return;
    _currentTurn = _currentTurn - 2;
    let seleX = _board.getSelections("X");
    let lastX = seleX[seleX.length-1];
    let seleO = _board.getSelections("O");
    let lastO = seleO[seleO.length-1];
    fields[lastX].textContent = "";
    fields[lastO].textContent = "";
    _board.removeLastSelection("X");
    _board.removeLastSelection("O");
  };

  resetBtn.addEventListener("click", resetGame);
  undoBtn.addEventListener("click", onUndo);

})();
