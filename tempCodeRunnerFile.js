const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

//  Load word list
const words = JSON.parse(fs.readFileSync("./words.json", "utf-8")).words;

//  Keep track of rooms and their state
const rooms = {}; // { roomId: [ { id, username } ] }
const currentWords = {}; // { roomId: "apple" }

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("joinRoom", ({ roomId, username }) => {
    if (!roomId) roomId = "public";
    if (!username || username.trim() === "")
      username = "Guest-" + Math.floor(Math.random() * 1000);

    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = [];

    rooms[roomId].push({ id: socket.id, username });

    console.log(`👥 ${username} joined room ${roomId}`);
    io.to(roomId).emit("updatePlayerList", rooms[roomId].map((p) => p.username));

    //  If first player, pick a word and assign as drawer
    if (rooms[roomId].length === 1) {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      currentWords[roomId] = randomWord;

      // send to the first player only
      socket.emit("yourWord", randomWord);
    } else {
      const drawer = rooms[roomId][0];
      io.to(roomId).emit("drawerInfo", drawer.username);
    }
  });

  //  Drawing sync
  socket.on("drawing", (data) => {
    const { roomId, ...drawData } = data;
    if (!roomId) return;
    socket.to(roomId).emit("drawing", drawData);
  });

  //  Chat system
  socket.on("chat message", ({ roomId, username, msg }) => {
    if (!roomId || !msg) return;

    const correctWord = currentWords[roomId];
    if (correctWord && msg.toLowerCase() === correctWord.toLowerCase()) {
      io.to(roomId).emit("correctGuess", { username, word: correctWord });

      // choose next word
      const newWord = words[Math.floor(Math.random() * words.length)];
      currentWords[roomId] = newWord;

      // choose next drawer randomly
      const players = rooms[roomId];
      const nextDrawer = players[Math.floor(Math.random() * players.length)];

      io.to(nextDrawer.id).emit("yourWord", newWord);
      io.to(roomId).emit("drawerInfo", nextDrawer.username);
    } else {
      io.to(roomId).emit("chat message", { username, msg });
    }
  });

  //  Disconnect cleanup
  socket.on("disconnect", () => {
    for (const [roomId, players] of Object.entries(rooms)) {
      const idx = players.findIndex((p) => p.id === socket.id);
      if (idx !== -1) {
        const leftUser = players[idx].username;
        players.splice(idx, 1);
        io.to(roomId).emit(
          "updatePlayerList",
          players.map((p) => p.username)
        );
        console.log(`❌ ${leftUser} left room ${roomId}`);
        break;
      }
    }
  });
});

const PORT = 3000;
server.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);