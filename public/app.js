const socket = io();

const boardElement = document.getElementById("board");
let currentPlayerElement = document.getElementById("currentPlayer");
let moveCountElement = document.getElementById("moveCount");
const createRoomBtn = document.getElementById("createRoomBtn");
let roomIdElement = document.getElementById("roomId");
let joinRoomBtn = document.getElementById("joinRoomBtn");
let leaveRoomBtn = document.getElementById("leaveRoomBtn");
let restartBtn = document.getElementById("restartBtn");
let messageElement = document.getElementById("message");

const rows = 15
const cols = 15
let board = Array.from({ length: rows }, () => Array(cols).fill(""));
let currentPlayer = "X";
let mePlayer = "";
let roomId = "";
let moveCount = 0;
let gameOver = false;
let winningCells = new Set();

currentPlayerElement.textContent = currentPlayer;
moveCountElement.textContent = moveCount;

function setRoomControls(inRoom) {
    createRoomBtn.disabled = inRoom;
    joinRoomBtn.disabled = inRoom;
    leaveRoomBtn.disabled = !inRoom;
}

function clearRoomState() {
    roomId = "";
    mePlayer = "";
    roomIdElement.textContent = "";
    setRoomControls(false);
    resetBoardState();
}

function resetBoardState() {
    board = Array.from({ length: rows }, () => Array(cols).fill(""));
    currentPlayer = "X";
    moveCount = 0;
    gameOver = false;
    winningCells.clear();
    currentPlayerElement.textContent = currentPlayer;
    moveCountElement.textContent = moveCount;
    messageElement.textContent = mePlayer ? `Bạn đang là ${mePlayer}` : "Sẵn sàng bắt đầu";
    renderBoard();
}

function renderBoard() {
    boardElement.innerHTML = "";
    for (let i = 0; i < rows; i++) {
        const rowElement = document.createElement("div");
        rowElement.classList.add("row");
        for (let j = 0; j < cols; j++) {
            const cellElement = document.createElement("div");
            cellElement.classList.add("cell");
            if (winningCells.has(`${i}-${j}`)) {
                cellElement.classList.add("win");
            }
            cellElement.dataset.row = i;
            cellElement.dataset.col = j;
            cellElement.textContent = board[i][j];
            cellElement.addEventListener("click", handleCellClick);
            rowElement.appendChild(cellElement);
        }
        boardElement.appendChild(rowElement);
    }
}

function handleCellClick(event) {
    if (!roomId) {
        Swal.fire("Chưa có phòng", "Hãy tạo hoặc tham gia phòng trước.", "warning");
        return;
    }

    if (gameOver) {
        return;
    }

    if (mePlayer !== currentPlayer) {
        Swal.fire("Chưa đến lượt bạn!", "Hãy chờ đối phương đánh.", "info");
        return;
    }
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    if (board[row][col] === "") {
        board[row][col] = currentPlayer;
        moveCount++;
        moveCountElement.textContent = moveCount;
        const nextPlayer = currentPlayer === "X" ? "O" : "X";
        const hasWinner = checkWin(row, col);
        renderBoard();
        socket.emit("makeMove", { 
            roomId, 
            row, 
            col, 
            player: board[row][col],
            currentPlayer: nextPlayer
        });
        if (hasWinner) {
            gameOver = true;
            currentPlayer = nextPlayer;
            currentPlayerElement.textContent = currentPlayer;
            socket.emit("gameOver", { roomId, winner: mePlayer });
            Swal.fire("Kết thúc", `Bạn đã thắng!`, "success");
            return;
        }
        currentPlayer = nextPlayer;
        currentPlayerElement.textContent = currentPlayer;
    }
}

socket.on("setup", (data) => {
    roomId = data.roomId;
    mePlayer = data.player;
    currentPlayer = "X";
    gameOver = false;
    messageElement.textContent = `Bạn đang là ${mePlayer}`;
    roomIdElement.textContent = roomId;
    currentPlayerElement.textContent = currentPlayer;
    setRoomControls(true);
});

socket.on("moveMade", (data) => {
    const { row, col, player, currentPlayer: nextPlayer } = data;
    board[row][col] = player;
    moveCount++;
    currentPlayer = nextPlayer;
    currentPlayerElement.textContent = currentPlayer;
    moveCountElement.textContent = moveCount;
    checkWin(row, col);
    renderBoard();
});

socket.on("gameOver", (data) => {
    gameOver = true;
    Swal.fire("Kết thúc", `Bạn đã thua!`, "error");
});

socket.on("gameRestarted", () => {
    resetBoardState();
});

socket.on("roomReady", () => {
    messageElement.textContent = `Bạn đang là ${mePlayer}`;
});

let dx = [0, 1, 1, 1];
let dy = [1, 0, 1, -1];

function checkWin(row, col) {
    winningCells.clear();

    for (let d = 0; d < 4; d++) {
        let line = [{ row, col }];

        for (let step = 1; step < 5; step++) {
            const newRow = row + step * dx[d];
            const newCol = col + step * dy[d];
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && board[newRow][newCol] === board[row][col]) {
                line.push({ row: newRow, col: newCol });
            } else {
                break;
            }
        }

        for (let step = 1; step < 5; step++) {
            const newRow = row - step * dx[d];
            const newCol = col - step * dy[d];
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && board[newRow][newCol] === board[row][col]) {
                line.push({ row: newRow, col: newCol });
            } else {
                break;
            }
        }

        if (line.length >= 5) {
            for (const cell of line) {
                winningCells.add(`${cell.row}-${cell.col}`);
            }

            return true;
        }
    }

    return false;
}

renderBoard();


function createRoomId() {
    return Math.random().toString(36).substr(2, 9);
}

createRoomBtn.addEventListener("click", () => {
    socket.emit("createRoom");
});

joinRoomBtn.addEventListener("click", () => {
    const inputRoomId = prompt("Nhập mã phòng:");
    if (inputRoomId) {
        socket.emit("joinRoom", inputRoomId.toUpperCase());
    }
});

leaveRoomBtn.addEventListener("click", () => {
    if (!roomId) {
        return;
    }

    socket.emit("leaveRoom", { roomId });
    clearRoomState();
    Swal.fire("Đã rời phòng", "Bạn đã rời phòng thành công.", "success");
});

restartBtn.addEventListener("click", () => {
    resetBoardState();

    if (roomId) {
        socket.emit("restartGame", { roomId });
    }
});

socket.on("roomError", (message) => {
    Swal.fire("Lỗi phòng", message, "error");
});

socket.on("opponentLeft", () => {
    resetBoardState();
    messageElement.textContent = "Đối thủ đã rời phòng. Đang chờ người chơi mới...";
    Swal.fire("Đối thủ đã rời phòng", "Bạn vẫn ở trong phòng, chờ người chơi mới tham gia.", "info");
});

setRoomControls(false);