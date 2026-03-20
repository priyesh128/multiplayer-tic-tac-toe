const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store simple room state (optional improvement)
const rooms = {};

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // 🎮 CREATE ROOM
  socket.on("createRoom", () => {
    const roomId = Math.random().toString(36).substring(7);

    socket.join(roomId);
    socket.room = roomId;

    rooms[roomId] = { players: [socket.id] };

    console.log("Room created:", roomId);

    socket.emit("roomCreated", roomId);
  });

  // 🎮 JOIN ROOM
  socket.on("joinRoom", (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);

    if (!room) {
      socket.emit("errorMessage", "Room not found");
      return;
    }

    if (room.size >= 2) {
      socket.emit("errorMessage", "Room is full");
      return;
    }

    socket.join(roomId);
    socket.room = roomId;

    rooms[roomId].players.push(socket.id);

    const players = rooms[roomId].players;

    console.log("Player joined room:", roomId);

    // Assign roles
    io.to(players[0]).emit("assignPlayer", "X");
    io.to(players[1]).emit("assignPlayer", "O");

    // Start game for both players
    io.to(roomId).emit("startGame");
  });

  // 🎮 MAKE MOVE
  socket.on("makeMove", (data) => {
    if (!socket.room) return;

    console.log("Move:", data);

    socket.to(socket.room).emit("opponentMove", data);
  });

  // 🔁 RESTART GAME
  socket.on("restartGame", () => {
    if (!socket.room) return;

    io.to(socket.room).emit("restartGame");
  });

  // ❌ DISCONNECT
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);

    if (socket.room && rooms[socket.room]) {
      delete rooms[socket.room]; // simple cleanup
    }
  });
});

// 🚀 START SERVER
server.listen(3000, () => {
  console.log("Server started on 3000");
});
