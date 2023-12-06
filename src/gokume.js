class CellState {
    constructor(player, color) {
        this.player = player;
        this.color = color;
    }
}

const GameState = {
    WAITING: 'waiting',
    PLAYING: 'playing',
    GAME_OVER: 'game_over'
};

const Color = {
    BLACK: '#000000',
    WHITE: '#FFFFFF',
    GREY: '#808080'
};

export default class Gokume {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.players = [];
        this.currPlayerIdx = 0;
        this.winner = -1;
        this.board = this.initializeArray(width, height, null);
        this.state = GameState.WAITING;
    }

    initializeArray(width, height, initialValue) {
        const newArray = [];

        for (let x = 0; x < height; x++) {
            const row = [];
            for (let y = 0; y < width; y++) {
                row.push(initialValue);
            }
            newArray.push(row);
        }

        return newArray;
    }

    checkBounds(x, y) {
        return x >= 0 && x < this.height && y >= 0 && y < this.width;
    }

    setCell(x, y, cellState) {
        if (!this.checkBounds(x, y)) {
            throw RangeError("x or y is out of range.");
        }
        this.board[x][y] = cellState;
    }

    putPiece(x, y, player, color) {
        if (this.players[this.currPlayerIdx] !== player) {
            throw Error(`Fail to set cell (${x}, ${y}) since it is not ${cellState.player}'s turn`);
        }

        const cellState = new CellState(player, color);
        this.setCell(x, y, cellState);

        this.rotatePlayer();
    }

    reset() {
        this.board = this.initializeArray(this.width, this.height, null);
        this.currPlayerIdx = 0;
        this.winner = -1;
        this.state = this.canStart() ? GameState.PLAYING : GameState.WAITING;
    }

    canStart() {
        return this.players.length === 2;
    }

    addPlayer(playerId) {
        if (this.isFull()) {
            throw Error("Game room is full.");
        }
        this.players.push(playerId);
    }

    removePlayer(playerId) {
        const toRemove = this.players.indexOf(playerId);
        if (toRemove === -1) {
            throw Error(`Player ${playerId} does not exist.`);
        }
        
        if (this.currPlayerIdx === toRemove) {
            this.rotatePlayer();
        }

        this.players.splice(toRemove, 1);

        this.state = GameState.GAME_OVER;
    }

    getCurrPlayer() {
        return this.players[this.currPlayerIdx];
    }

    isFull() {
        return this.players.length === 2;
    }

    rotatePlayer() {
        this.currPlayerIdx = (this.currPlayerIdx + 1) % this.players.length;
    }

    hasWinner() {
        return this.winner === 0 || this.winner === 1;
    }

    getContinueCells(x, y) {
        if (this.board[x][y] === null) {
            throw Error(`Board (${x}, ${y}) is unoccupied.`);
        }

        const isValidCell = (newX, newY, player) =>
            this.checkBounds(newX, newY) && this.board[newX][newY] !== null && this.board[newX][newY].player === player;

        const getCellsInDirection = (dirX, dirY) => {
            const buff = [[x, y]];

            for (let i = 1; i < 5; i++) {
                const newX = x + i * dirX;
                const newY = y + i * dirY;

                if (isValidCell(newX, newY, this.board[x][y].player)) {
                    buff.push([newX, newY]);
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

    getBoardColors() {
        return this.board.map(row => row.map(cell => (cell && cell.color ? cell.color : Color.GREY)));
    }
}
