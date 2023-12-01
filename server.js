const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "PUT"],
    },
});

io.on("connection", (socket) => {
    console.log(`User ${socket.id} connected`);
})

server.listen(9000, () => {
    console.log("Server Serving on http://localhost:9000...");
})
