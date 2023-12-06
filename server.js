import Gokume from './src/Gokume.js';
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "PUT"],
    },
});

const games = {};
const socketToRoom = {};

io.on("connection", (socket) => {
    console.log(`User ${socket.id} connected`);

    socket.on('disconnect', () => {
        io.in(socketToRoom[socket.id]).disconnectSockets();
        delete games[socketToRoom[socket.id]];
    });

    socket.on("join_room", (room) => {
        if (!room) {
            console.log("Invalid room name");
            return;
        }

        if (!games.hasOwnProperty(room)) {
            games[room] = new Gokume(10, 10);
            socket.emit("message", `Created room ${games[room]}`);
        }

        if (games[room].players.indexOf(socket.id) !== -1) {
            socket.emit("error_message", "You are already in the room.");
            return;
        }

        if (games[room].isFull()) {
            socket.emit("error_message", `Game room ${room} is full.`);
            return;
        }

        games[room].addPlayer(socket.id);

        socketToRoom[socket.id] = room;

        socket.join(room);

        const msg = `User ${socket.id} joined into ${room}.`
        console.log(msg);
        socket.emit("message", msg);

        io.to(room).emit("render_board", games[room].getBoardColors());

        if (games[room].canStart()) {
            games[room].state = 'playing';
            console.log(`Room ${room} game starts!`);
            io.to(room).emit("message", "Game starts!");
        }
    });

    socket.on("put_piece", (data) => {
        console.log(`received put piece data: ${JSON.stringify(data)}`);
        if (!games.hasOwnProperty(data.room)) {
            socket.emit("error_message", `${data.room} does not exist.`);
            return;
        }

        if(games[data.room].state !== 'playing') {
            socket.emit("error_message", `The game is ${games[data.room].state}.`);
            console.log(`The game is ${games[data.room].state}.`);
            return;
        }

        if (games[data.room].getCurrPlayer() !== socket.id) {
            socket.emit("error_message", "It's not your turn.");
            console.log(`It's not ${socket.id}'s turn.`);
            return;
        }

        const newX = parseInt(data.x);
        const newY = parseInt(data.y);

        if (games[data.room].board[newX][newY] !== null) {
            socket.emit("error_message", `Please choose another place.`);
            console.log(`(${newX}, ${newY}) is used.`);
            return;
        }

        try {
            games[data.room].putPiece(newX, newY, data.player, data.color);
        } catch (error) {
            socket.emit("error_message", error.message);
            console.log(`Failed to put piece. ${error.message}. payload: ${data}.`);
            return;
        }
        
        io.to(data.room).emit("render_board", games[data.room].getBoardColors());

        console.log("---board---");
        for (const row of games[data.room].board) {
            const buf = [];
            for (const state of row) {
                if (!state) {
                    buf.push(-1);
                    continue;
                }
                buf.push(games[data.room].players.indexOf(state.player));
            }
            console.log(JSON.stringify(buf));
        }

        const continueCells = games[data.room].getContinueCells(newX, newY);
        console.log(`continue cells: ${JSON.stringify(continueCells)}`);

        if (continueCells.length >= 5) {
            io.to(data.room).emit("message", `Winner is ${socket.id}`);
            games[data.room].state = 'game_over';
        }
    });

    socket.on("reset_game", (data) => {
        if (!games.hasOwnProperty(data.room)) {
            socket.emit("error_message", `${data.room} does not exist.`);
            return;
        }

        if (games[data.room].players.indexOf(data.player) === -1) {
            socket.emit("error_message", `${data.player} is not a player of game ${data.room}.`);
            return;
        }

        games[data.room].reset();

        io.to(data.room).emit("render_board", games[data.room].getBoardColors());

        const msg = `Room ${data.room} has been reset by ${data.player}`;
        console.log(msg);
        io.to(data.room).emit(msg);
    });
});

server.listen(9000, () => {
    console.log("Server Serving on http://localhost:9000...");
})
