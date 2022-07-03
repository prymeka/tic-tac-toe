const Player = (name, symbol) => {
    const getName = () => name;
    const getSymbol = () => symbol;

    let fields = [];
    const getFields = () => fields;
    const pushToFields = value => {
        if (fields.length === 0 || fields[fields.length-1] <= value) {
            fields.push(value);
        }

    };

    return {getName, getSymbol, getFields, pushToFields};
}

const Game = ((player1, player2) => {
    const players = [player1, player2]
    let currentTurn = 0;
    const boardFields = document.querySelectorAll(".field");

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
        if (selectedFields.length < 3) return false;

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

