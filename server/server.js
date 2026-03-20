const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // allow all for now
    methods: ["GET", "POST"],
  },
});

io.on("connection", (  ) => {
  console.log("Player connected:", socket.id);

  socket.on("createRoom", () => {
    const roomId = Math.random().toString(36).substring(7);
    socket.join(roomId);
    socket.room = roomId; // 👈 important
    socket.emit("-", roomId);
  });

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    socket.room = roomId;

    const clients = io.sockets.adapter.rooms.get(roomId);

    if (clients.size === 2) {
      const players = Array.from(clients);

      io.to(players[0]).emit("assignPlayer", "X");
      io.to(players[1]).emit("assignPlayer", "O");

      io.to(roomId).emit("startGame");
    }
  });

  socket.on("makeMove", (data) => {
    console.log("Move received:", data); // 👈 add this

    socket.to(socket.room).emit("opponentMove", data);
  });
  socket.on("restartGame", () => {
    io.to(socket.room).emit("restartGame");
  });
});

server.listen(3000, () => {
  console.log("Server started on 3000");
});
