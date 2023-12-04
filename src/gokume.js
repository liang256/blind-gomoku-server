class CellState {
    constructor(player, color) {
        this.player = player;
        this.color = color;
    }
}

class Gokume {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.players = [];
        this.currPlayerIdx = 0;
        this.winner = -1;
        this.board = this.initializeArray(width, height, null);
    }

    initializeArray(width, height, initialValue) {
        const newArray = [];
    
        for (let i = 0; i < height; i++) {
            const row = [];
            for (let j = 0; j < width; j++) {
                row.push(initialValue);
            }
            newArray.push(row);
        }
    
        return newArray;
    }

    checkBounds(row, col) {
        return row >= 0 && row < this.height && col >= 0 && col < this.width;
    }

    setCell(x, y, cellState) {
        if (! this.checkBounds(x, y)) {
            throw RangeError("x or y is out of range.");
        }
        this.board[x][y] = cellState;
    }

    putPiece(x, y, player) {
        if (this.players[this.currPlayerIdx] !== player) {
            throw Error(`Fail to set cell (${x}, ${y}) since it is not ${cellState.player}'s turn`);
        }

        const color = this.currPlayerIdx === 0 ? "#000000" : "#FFFFFF";
        cellstate = new CellState(player, color);
        this.setCell(x, y, cellState);
    }

    reset() {
        this.board = this.initializeArray(this.width, this.height, null)
    }

    canStart() {
        return this.players.length === 2;
    }

    addPlayer(playerId) {
        if (this.players.length === 2) {
            throw Error("Game room is full.");
        }
        this.players.push(playerId);
    }

    rotatePlayer() {
        this.currPlayerIdx = this.currPlayerIdx === 0 ? 1 : 0;
    }

    hasWinner() {
        return this.winner == 0 || this.winner == 1;
    }

    getContinueCells(x, y) {
        if (this.board[x][y] === null) {
            throw Error(`Board (${x}, ${y}) is unoccupied.`)
        }

        const isValidCell = (row, col, player) =>
            this.checkBounds(row, col) && this.board[row][col] !== null && this.board[row][col].player === player;

        const getCellsInDirection = (dirX, dirY) => {
            const buff = [[x, y]];

            for (let i = 1; i < 5; i++) {
                const newRow = x + i * dirX;
                const newCol = y + i * dirY;

                if (isValidCell(newRow, newCol, this.board[x][y].player)) {
                    buff.push([newRow, newCol]);
                } else {
                    break;
                }
            }

            return buff;
        };

        const res = [];

        const dirs = [
            [0, 1],
            [1, 1],
            [1, 0],
            [1, -1],
        ];

        for (const [dirX, dirY] of dirs) {
            const buff = getCellsInDirection(dirX, dirY);
            const reverseBuff = getCellsInDirection(-dirX, -dirY);

            if (buff.length + reverseBuff.length - 1 >= 5) {
                res.push(...buff, ...reverseBuff.slice(1));
            }
        }

        return res;
    }
}
