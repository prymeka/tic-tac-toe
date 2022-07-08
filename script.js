
const Player = (name, type, symbol) => {
    const getType = () => type;
    
    const getName = () => name;
    const setName = (newName) => name = newName;

    const getSymbol = () => symbol;
    const setSymbol = (newSymbol) => symbol = newSymbol;

    let selections = [];
    const getSelections = () => selections;
    
    const _searchInsertIndex = function(array, target) {
        if (array.indexOf(target) !== -1) {
            return array.indexOf(target);
        } else if (target > array[array.length-1]) {
            return array.length;
        } else if (target < array[0]) {
            return 0;
        } else {
            left = 0
            right = len(array) - 1
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
    }

    const addNewSelections = value => {
        const index = _searchInsertIndex(selection, value);
        selections.splice(index, 0, value);
    };

    return {
        getType,
        getName, setName, 
        getSymbol, setSymbol, 
        getSelections, addNewSelections
    };
}

const Game = ((player1, player2) => {
    const players = [player1, player2]
    let currentTurn = 0;
    
    const initBoard = () => {
        const boardFields = [];
        for (const i=0; i<9; i++) boardFields.push(document.getElementById(`$i$`));
        return boardFields;
    };

    const winningSelections = [
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
        const numSelections = selectedFields.length;
        if (numSelections < 3) return false;
        // since selections are sorted we don't need to check the last two
        for (const i=0; i<numSelections-2; i++) {
            let selection = selectedFields[i];
            for (const j=0; j<winningSelections.length; j++) {
                // check if first element of any winning combination is present
                if (selection !== winningSelections[j][0]) continue;
                // if it is, check if the other two are too
                if (selectedFields.includes(winningSelections[j][1]) && selectedFields.includes(winningSelections[j][2])) {
                    return true;
                }
                break;
            }
        }
        return false;
    };

    const onSelection = e => {
        const index = e.currentTarget.id;
        let currentPlayer = players[currentTurn%2];
        boardFields[index].textContent = currentPlayer.getSymbol();
        currentPlayer.fields.push(index);
        checkForWin(currentPlayer.fields);
        currentTurn++;
    };
    
    boardFields.forEach(field => field.addEventListener("click", e => onSelection(e)));
})();


const player1Symbol = document.getElementById("player-1-symbol");
const player2Symbol = document.getElementById("player-2-symbol");
const switchButton = document.getElementById("switch-btn");
switchButton.addEventListener("click", e => {
    const temp = player1Symbol.textContent;
    player1Symbol.textContent = player2Symbol.textContent;
    player2Symbol.textContent = temp;
});
