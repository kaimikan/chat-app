const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

const message = "Welcome!";

// when a client connects
io.on("connection", (socket) => {
  console.log("New WebSocket connection.");

  socket.emit("message", message);

  // sends to everyone except sender
  socket.broadcast.emit("message", "A new user has joined!");

  socket.on("sendMessage", (messageCallback, callback) => {
    const filter = new Filter();

    if (filter.isProfane(messageCallback)) {
      return callback("Profanity is not allowed!");
    }
    // emits to a single connection
    //socket.emit("sendMessage", messageCallback);

    // emits to all connections
    io.emit("message", messageCallback);
    callback();
  });

  socket.on("sendLocation", (coordinatesCallback, callback) => {
    io.emit(
      "locationMessage",
      `https://google.com/maps?q=${coordinatesCallback.latitude},${coordinatesCallback.longitude}`
    );
    callback();
  });

  // whenever a client disconnects
  socket.on("disconnect", () => {
    io.emit("message", "A user has left.");
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
