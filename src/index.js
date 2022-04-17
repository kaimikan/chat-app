const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

// when a client connects
io.on("connection", (socket) => {
  console.log("New WebSocket connection.");

  socket.emit("message", generateMessage("Welcome!"));

  // sends to everyone except sender
  socket.broadcast.emit("message", generateMessage("A new user has joined!"));

  socket.on("sendMessage", (messageCallback, callback) => {
    const filter = new Filter();

    if (filter.isProfane(messageCallback)) {
      return callback("Profanity is not allowed!");
    }
    // emits to a single connection
    //socket.emit("sendMessage", messageCallback);

    // emits to all connections
    io.emit("message", generateMessage(messageCallback));
    callback();
  });

  socket.on("sendLocation", (coordinatesCallback, callback) => {
    io.emit(
      "locationMessage",
      generateLocationMessage(
        `https://google.com/maps?q=${coordinatesCallback.latitude},${coordinatesCallback.longitude}`
      )
    );
    callback();
  });

  // whenever a client disconnects
  socket.on("disconnect", () => {
    io.emit("message", generateMessage("A user has left."));
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
