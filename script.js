const Player = (name, symbol, type) => {
    let _name = name;
    let _symbol = symbol;
    let _type = type;

    const getName = () => _name;
    const setName = (newName) => _name = newName;
    const getSymbol = () => _symbol;
    const setSymbol = (newSymbol) => _symbol = newSymbol;
    const getType = () => _type;
    const setType = (newType) => _type = newType;

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
            return left
        }
    };

    let _selections = [];
    const getSelections = () => _selections;
    const addNewSelection = selection => {
        const index = _searchInsertIndex(_selections, selection);
        _selections.splice(index, 0, parseInt(selection));
    };
    const resetSelections = () => _selections = [];
    
    return {
        getName, setName,
        getSymbol, setSymbol,
        getType, setType,
        getSelections, addNewSelection, resetSelections
    };
};

const Game = (() => {
    let currentTurn = 0;

    // cache DOM
    const fields = document.querySelectorAll(".field");

    const player1Type = document.querySelector(".player-type[name=player-1-type]");
    const player1Name = document.querySelector(".player-name[name=player-1-name]");
    const player1Symbol = document.getElementById("player-1-symbol");
    const player1NameInfo = document.getElementById("player-1-name-info")
    const player1SymbolInfo = document.getElementById("player-1-symbol-info")
    
    const player2Type = document.querySelector(".player-type[name=player-2-type]");
    const player2Name = document.querySelector(".player-name[name=player-2-name]");
    const player2Symbol = document.getElementById("player-2-symbol");
    const player2NameInfo = document.getElementById("player-2-name-info")
    const player2SymbolInfo = document.getElementById("player-2-symbol-info")

    const winnerLabel = document.getElementById("winner-label");

    const nextBtn = document.getElementById("next-btn");
    const switchBtn = document.getElementById("switch-btn");
    const undoBtn = document.getElementById("undo-btn");
    const resetRoundBtn = document.getElementById("reset-round-btn");
    const resetGameBtn = document.getElementById("reset-game-btn");

    const score = [document.getElementById("score-1"), document.getElementById("score-2")];

    // create players
    const players = {
        player1: Player(player1Name.value, player1Symbol.textContent, player1Type.value),
        player2: Player(player2Name.value, player2Symbol.textContent, player2Type.value),
        getPlayer: function(string) {
            string = String(string);
            if (string.startsWith("player-1") || string === "1") {
                return this.player1;
            } else if (string.startsWith("player-2") || string === "2") {
                return this.player2;
            } else {
                return undefined;
            }
        },
        resetSelections: function() {
            this.player1.resetSelections();
            this.player2.resetSelections();
        }
    };
    
    // add events
    [player1Type, player2Type].forEach(p => p.addEventListener("change", e => {
        players.getPlayer(e.currentTarget.name).setType(e.currentTarget.value);
        resetGame();
    }));
    [player1Name, player2Name].forEach(p => p.addEventListener("change", e => {
        const newName = e.currentTarget.value;
        const playerInfo = p === player1Name ? player1NameInfo : player2NameInfo;
        playerInfo.textContent = newName;
        players.getPlayer(e.currentTarget.name).setName(newName);
    }));

    switchBtn.addEventListener("click", () => {
        const oldP1Symbol = player1Symbol.textContent;
        const oldP2Symbol = player2Symbol.textContent;

        player1Symbol.textContent = oldP2Symbol;
        player1SymbolInfo.textContent = oldP2Symbol;
        players.player1.setSymbol(oldP2Symbol);

        player2Symbol.textContent = oldP1Symbol;
        player2SymbolInfo.textContent = oldP1Symbol;
        players.player2.setSymbol(oldP1Symbol);

        resetGame();
    });

    nextBtn.addEventListener("click", () => {
        nextBtn.style.visibility = "hidden";
        winnerLabel.textContent = "";
        players.resetSelections();
        currentTurn = 0;
        initBoard();
    });

    undoBtn.addEventListener("click", () => {
        
        currentTurn--;
    });

    // add events to fields
    const onFieldClick = e => {
        if (e.currentTarget.textContent !== "") {
            return;
        }
        // add selection to the player
        const currentPlayer = players.getPlayer(1+currentTurn%2);
        currentPlayer.addNewSelection(e.currentTarget.id);
        // mark selection no the board
        e.currentTarget.textContent = currentPlayer.getSymbol();
        // check if someone won
        if (checkForWin(currentPlayer.getSelections())) {
            onWin(currentTurn);
        }
        currentTurn++;
    };

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

    const checkForWin = selectedFields => {
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
                    _winningSelections[j].forEach(idx => fields[idx].style.color = "green");
                    nextBtn.style.visibility = "visible";
                    let winnersName = players.getPlayer(1+currentTurn%2).getName();
                    if (winnersName === "") {
                        winnersName = currentTurn%2 === 0 ? "Tom" : "Jerry";
                    }
                    winnerLabel.textContent = `${winnersName} has won!`;
                    return true;
                }
            }
        }
        return false;
    };
    
    const onWin = () => {
        // update score
        let currentPlayersScore = Number(score[currentTurn%2].textContent);
        score[currentTurn%2].textContent = String(currentPlayersScore+1);
        // remove event listeners from empty fields
        fields.forEach(f => f.removeEventListener("click", onFieldClick));
    };

    const initBoard = () => {
        fields.forEach(f => {
            f.textContent = "";
            f.style.color = "white";
            f.addEventListener("click", onFieldClick, {"once": true});
        });
    };

    const resetGame = () => {
        nextBtn.style.visibility = "hidden";
        winnerLabel.textContent = "";
        initBoard();
    };

    initBoard();
})();