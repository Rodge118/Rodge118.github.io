// INITIALIZATION & GLOBAL VARIABLES
let rows = 3;
let cols = 3;
let winCnd = 3; // in a row to win
let boxes = [];
let players = []; // to be set after the Player class is defined
let currentPlayer;
let prevPlayer; // used for take backs mode
let areSettingsCustom = true;
let takeBacks = true;
let randomOrder = false;
let admireMode = false; // if true, you can't change the board
//let moveCounter = 0;

const test = document.getElementById('test');
const game = document.querySelector('.game');

const settingsModal = document.getElementById('settingsModal');
const modalOpen = document.getElementById('openModal');
const modalCloseX = document.getElementsByClassName('modal-close')[0];
const modalCloseBtn = document.getElementsByClassName('modal-close')[1];
const allModalClosers = document.querySelectorAll('.modal-close');
const allSettingsInputs = document.querySelectorAll('.settings-input');

const winnerModal = document.getElementById('winnerModal');

modalOpen.onclick = function() {
    openSettings();
    updatePlayerCustomization.call(document.getElementById('setPlrs'));
}

allModalClosers.forEach(element => {
    element.addEventListener('click', (event) => {
        resetSettings();
        settingsModal.style.display = "none";
        winnerModal.style.display = "none";
    });
});

window.onclick = function(event) {
    if (event.target == settingsModal) {
        resetSettings();
        settingsModal.style.display = "none";
    } else if (event.target == winnerModal) {
        admireMode = true;
        winnerModal.style.display = "none";
    }
}

document.getElementById('setPlrs').addEventListener('input', updatePlayerCustomization);

document.getElementById('zoom').addEventListener('input', function() {
    const zoomVal = this.value / 50; // scales 1-100 to .02-2
    game.style.setProperty('--zoom', zoomVal);
    //console.log(zoomVal, game.style.getPropertyValue('--zoom'));
});

document.getElementById('setPreset').addEventListener('input', updatePresets);

allSettingsInputs.forEach(element => {
    if (element != document.getElementById('setPreset')) {
        element.addEventListener('input', () => {
            if (!(checkSettingsAre(3, 3, 3, 2) || checkSettingsAre(9, 9, 4, 4) || checkSettingsAre(6, 7, 4, 2) || checkSettingsAre(5, 5, 3, 2))) {
                document.getElementById('setPreset').value = "custom";
                areSettingsCustom = true;
            }
        });
    }
});

//document.getElementById("setRandomOrder").addEventListener('input', randomOrder = this.checked);
//document.getElementById("setTakeBack").addEventListener('input', takeBacks = this.checked);

// CLASSES AND METHODS
class Box {
    constructor(element, x, y) {
        this.x = x;
        this.y = y;
        this.text = "";
        this.element = element;
        this.element.addEventListener('click', this.clicked.bind(this));
        this.element.classList.add('box');
        this.element.setAttribute("title", currentPlayer + "'s turn");
        game.appendChild(this.element);
    }

    clicked() {
        if (admireMode) {
            return;
        }
        if (this.text == "") {
            this.text = "" + currentPlayer;
            prevPlayer = currentPlayer;
            nextPlayer();
            //moveCounter++;
        } else if (takeBacks && this.text == "" + prevPlayer) { // prev player because it is now technically the next players turn
            this.text = "";
            nextPlayer(true);
            //moveCounter--;
        }
        this.element.textContent = this.text;
        players.forEach((player) => {
            checkWin(player);
        });

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                boxes[i][j].element.setAttribute("title", currentPlayer + "'s turn");
            }
        }
    }

    toString() {
        return `Box(${this.x}, ${this.y}): ${this.text}`;
    }

}

class Player {
    constructor(symbol) {
        this.symbol = symbol;
        this.hasWon = false;
    }

    toString() {
        return this.symbol;
    }
}

players = [new Player('X'), new Player('O')];
currentPlayer = players[0];
prevPlayer = players[1];

function makeGrid(rows, cols) {
    boxes = [];
    game.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";
    game.style.gridTemplateRows = "repeat(" + rows + ", 1fr)";
    
    for (let i = 0; i < rows; i++) {
        boxes.push([]);
        for (let j = 0; j < cols; j++) {
            const box = new Box(document.createElement('button'), i, j);
            boxes[i].push(box);
        }
    }
    //alert("Grid was reset");
}

function checkWin(player) {
    // check for horizontal wins
    let isWin = false;
    let inARow = 0;
    let filledBoxes = 0; // to check for ties
    //console.log(winCnd);
    for (let i = 0; i < rows; i++) {
        inARow = 0;
        for (let j = 0; j < cols; j++) {
            
            if (getCharFromBox(i, j) == player) {
                inARow++;
                //console.log(`Checking Horizontally for ${player}, found ${getCharFromBox(i, j)} (${i}, ${j}). InARow = ${inARow}`);
                //console.log(`inARow incremented (${inARow}) at (${i}, ${j})`)
            } else {
                //console.log("Not in a row. inARow = " + inARow);
                inARow = 0;
            }

            if (getCharFromBox(i, j) != "") { // check for ties with the first one
                filledBoxes++; 
            }
            
            isWin = (inARow == winCnd);
            if (isWin) {
                break;
            }
        }
        if (isWin) {
            console.log(`player ${player} won horizontally`)
            break;
        }
    }

    if (filledBoxes == rows * cols) { // tie
        console.log("It's a tie");
        document.getElementById("winnerContent").innerHTML = `<h2>TIE! (${Math.ceil((rows * cols) / players.length)} moves)`;
        winnerModal.style.display = "block";
    }

    // Check for vertical wins
    if (!isWin) {
        for (let i = 0; i < cols; i++) {
            inARow = 0;
            for (let j = 0; j < rows; j++) {

                if (getCharFromBox(j, i) == player) {
                    inARow++;
                } else {
                    inARow = 0;
                }
                //console.log(`Checking Vertically for ${player} (${i}, ${j}). InARow = ${inARow}`);

                isWin = (inARow == winCnd);
                if (isWin) {
                    break;
                }
            }
            if (isWin) {
                console.log(`Player ${player} won vertically`)
                break;
            }
        }
    }

    // TODO: check for diags (/ and \) using a third for loop
    // TODO: add ability for >2 players

    // check diags (\)
    if (!isWin) {
        for (let i = 0; i < rows - winCnd + 1; i++) { // subtract winCnd for both to avoid out of bounds errors
            for (let j = 0; j < cols - winCnd + 1; j++) {
                inARow = 0;
                for (let k = 0; k < winCnd; k++) {
                    //console.log(`checking: (${i + k}, ${j + k})`);
                    if (getCharFromBox(i + k, j + k) == player) {
                        inARow++;
                    } else {
                        inARow = 0;
                    }

                    isWin = (inARow == winCnd);
                    if (isWin) {
                        console.log(`Player ${player} won diagonal (\\)`);
                        break;
                    }
                }
                if (isWin) {
                    break;
                }
            }
            if (isWin) {
                break;
            }
        }
    }

    // check diags (/)
    if (!isWin) {
        for (let i = winCnd - 1; i < rows; i++) { // start at winCnd for rows to avoid out of bounds errors
            for (let j = 0; j < cols - winCnd + 1; j++) { // end at winCnd for cols for the same reason
                inARow = 0;
                for (let k = 0; k < winCnd; k++) {
                    if (getCharFromBox(i - k, j + k) == player) {
                        inARow++;
                    } else {
                        inARow = 0;
                    }

                    isWin = (inARow == winCnd);
                    if (isWin) {
                        console.log(`Player ${player} won diagonal (\\)`);
                        break;
                    }
                }
                if (isWin) {
                    break;
                }
            }
            if (isWin) {
                break;
            }
        }
    }
    
    if (isWin) {
        player.hasWon = true;
        //alert("Player " + player + " has won!");
        //currentPlayer = players[0];
        //reset();
        displayWinner();
    }
    return isWin;
}

function reset(remakeGrid = true) {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            boxes[i][j].element.remove();
            //console.log(`Box at (${i}, ${j}) was removed`)
        }
    }
    boxes = [];
    
    if (remakeGrid) {
        makeGrid(rows, cols);
    }
    currentPlayer = players[0];
    console.log("GRID RESET");
    admireMode = false;
}

function getCharFromBox(x, y) {
    return boxes[x][y].text;
}

function nextPlayer(backwards = false) {
    let index = players.indexOf(currentPlayer);
    //console.log("Current player: " + currentPlayer + " index: "+ index);
    if (backwards) {
        if (index == 0) {
            currentPlayer = players[players.length - 1];
            
        } else {
            currentPlayer = players[index - 1];
        }
    } else {
        if (index < players.length - 1) {
            currentPlayer = players[index + 1];
        } else {
            currentPlayer = players[0];
        }
        //console.log("New player: " + currentPlayer + " index: " + players.indexOf(currentPlayer));
    }
}

function saveSettings() {
    if (checkInvalidSettings()) {
        openSettings();
        return;
    }

    let isCurrentGame = false;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (getCharFromBox(i, j) != "") {
                isCurrentGame = true;
                break;
            }
        }
        if (isCurrentGame) {
            break;
        }
    }

    let newRows = Number(document.getElementById("setRows").value);
    let newCols = Number(document.getElementById("setCols").value);
    let newWinCnd = Number(document.getElementById("setWinCnd").value);
    let newPlrNumber = Number(document.getElementById("setPlrs").value);

    //let settingsAreCurrent = newRows == rows && newCols == cols && newWinCnd == winCnd && newPlrNumber == players.length;

    if ((isCurrentGame && !admireMode) && !confirm("Are you sure? There is a game going on right now. Updating settings will restart it.")) {
        openSettings();
        return;
    }

    reset(false);

    if (!isNaN(newRows) && newRows > 0) {
        rows = newRows;
        game.style.setProperty('--rows', rows);
    } 
    if (!isNaN(newCols) && newCols > 0) {
        cols = newCols;
        game.style.setProperty('--cols', cols);
    }
    if (!isNaN(newWinCnd) && newWinCnd > 0) {
        winCnd = newWinCnd;
    }
    if (!isNaN(newPlrNumber) && newPlrNumber > 1) {
        const newPlayers = [];
        for (let i = 0; i < newPlrNumber; i++) {
            const inputSymbol = document.getElementById(`player${i + 1}Symbol`);
            const symbol = inputSymbol ? inputSymbol.value.trim() || String.fromCharCode(65 + i) : String.fromCharCode(65 + i);
            newPlayers.push(new Player(symbol));
        }
        players = newPlayers;
        
    }
    
    takeBacks = document.getElementById("setTakeBack").checked;
    randomOrder = document.getElementById("setRandomOrder").checked;

    if (randomOrder) {
        shuffle(players);
    }
    currentPlayer = players[0];

    console.log("SETTINGS UPDATED: rows: ", rows, ", cols: ", cols, ", winCnd: ", winCnd, ", num_players: ", players.length, ", take backs: ", takeBacks, ", random order: ", randomOrder);

    resetSettings();
    settingsModal.style.display = "none";

    makeGrid(rows, cols);
}

function resetSettings() {
    setSettingsFields("", "", "", "");
    document.getElementById("playerCustomization").innerHTML = "";
}

function updatePlayerCustomization() {
    const numPlayers = parseInt(this.value) || 0;
    const container = document.getElementById('playerCustomization');
    container.innerHTML = "";

    for (let i = 0; i < numPlayers; i++) {
        const div = document.createElement('div');
        const defaultSymbol = (i === 0) ? 'X' : (i === 1) ? 'O' : String.fromCharCode(65 + (i - 2));
        div.innerHTML = `<span>\tPlayer ${i + 1}: </span> <input class="settings-input" type="text" id="player${i + 1}Symbol" title="enter character/symbol for player ${i + 1}" maxlength="1" value="${defaultSymbol}"></input>`;
        container.appendChild(document.createElement('br'));
        container.appendChild(div);
        
    }
}

// returns true if settings are invalid
function checkInvalidSettings() {
    let newRows = Number(document.getElementById("setRows").value);
    let newCols = Number(document.getElementById("setCols").value);
    let newWinCnd = Number(document.getElementById("setWinCnd").value);
    let newPlrNumber = Number(document.getElementById("setPlrs").value);

    console.log(newRows == 0);
    if ((newRows != 0 && newRows < 3) || (newCols > 0 && newCols < 3)) {
        alert("Invalid: The minimum number of rows or columns is 3.");
        return true;
    }
    if (newCols != 0 && newWinCnd > Math.min(((newRows == 0) ? rows : newRows), (newCols == 0) ? cols : newCols)) {
        alert("Invalid: The win condition can't be longer than the shorter dimension (rows or columns).");
        return true;
    }
    if (newWinCnd != 0 && newWinCnd < 3) {
        alert("Invalid: The minimum win condition is 3.");
        return true;
    }
    if (newPlrNumber != 0 && newPlrNumber < 2) {
        alert("Invalid: There must be at least 2 players (no singleplayer or online multiplayer... yet :) )");
        return true;
    }

    return false;
}

function displayWinner() {
    for (const player of players) {
        if (player.hasWon) {
            let filledBoxes = 0;
            boxes.forEach(row => {
                row.forEach(box => {
                    if (box.text != "") {
                        filledBoxes++;
                    }
                });
            });
            console.log(filledBoxes);
            document.getElementById("winnerContent").innerHTML = `<h2>${String(player)} won! (${Math.floor((filledBoxes - 1) / players.length + 1)} moves)</h2>`;
            winnerModal.style.display = "block";
        }
    }
}

function updatePresets() {
    let preset = document.getElementById('setPreset').value;

    if (preset == "classic") {
        setSettingsFields(3, 3, 3, 2);
        areSettingsCustom = false;
    } else if (preset == "mega") {
        setSettingsFields(9, 9, 4, 4);
        areSettingsCustom = false;
    } else if (preset == "connect4") {
        setSettingsFields(6, 7, 4, 2);
        areSettingsCustom = false;
    } else if (preset == "fbf") {
        setSettingsFields(5, 5, 3, 2);
        areSettingsCustom = false;
    }
    
    if (areSettingsCustom) {
        document.getElementById('setPreset').value = "custom";
    }

    document.getElementById("setPlrs").dispatchEvent(new Event('input'));
}

function checkSettingsAre(rows, cols, winCnd, plrNum) {
    if (document.getElementById("setRows").value == rows && document.getElementById("setCols").value == cols && document.getElementById("setWinCnd").value == winCnd && document.getElementById("setPlrs").value == plrNum) {
        console.log("Is ", rows, cols, winCnd, plrNum, ": true");
        return true;
    } else {
        console.log("Is ", rows, cols, winCnd, plrNum, ": false");
        return false;
    }
}

function openSettings() {
    setSettingsFields(rows, cols, winCnd, players.length);
    document.getElementById("setTakeBack").checked = takeBacks;
    document.getElementById("setRandomOrder").checked = randomOrder;
    settingsModal.style.display = "grid";
}

function setSettingsFields(setRows, setCols, setWinCnd, setPlrNum) {
    document.getElementById("setRows").value = setRows;
    document.getElementById("setCols").value = setCols;
    document.getElementById("setWinCnd").value = setWinCnd;
    document.getElementById("setPlrs").value = setPlrNum;
}

// Thanks to Google Gemini for generating the shuffle algorithm
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    // Generate a random index between 0 and i
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements array[i] and array[j]
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// MAIN
function main() {
    document.getElementById("reset").addEventListener("click", () => {
        if (confirm("Are you sure you want to reset the game?")) {
            reset();
        }
    });
    document.querySelector('.game').style.setProperty('--cols', cols);
    document.querySelector('.game').style.setProperty('--rows', rows);
    makeGrid(rows, cols);
    //test.textContent = String(boxes[0][0]);

}

main();