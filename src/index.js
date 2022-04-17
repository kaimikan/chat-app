const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");
const { addRoom, recountRoom, generateRooms } = require("./utils/rooms");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

// when a client connects
io.on("connection", (socket) => {
  console.log("New WebSocket connection.");

  io.emit("currentRooms", generateRooms());

  socket.on("join", ({ username, creator, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, creator, room });

    if (error) return callback(error);

    // only emit events to a specific room
    socket.join(user.room);

    socket.emit("message", generateMessage("Admin", "Welcome!"));

    // sends to everyone in room except sender
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    io.emit("currentRooms", addRoom({ room }));

    callback();
  });

  socket.on("sendMessage", (messageCallback, callback) => {
    const user = getUser(socket.id);

    const filter = new Filter();

    if (filter.isProfane(messageCallback)) {
      return callback("Profanity is not allowed!");
    }
    // emits to a single connection
    //socket.emit("sendMessage", messageCallback);

    // emits to all connections in room
    io.to(user.room).emit(
      "message",
      generateMessage(user.username, messageCallback)
    );
    callback();
  });

  socket.on("sendLocation", (coordinatesCallback, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${coordinatesCallback.latitude},${coordinatesCallback.longitude}`
      )
    );
    callback();
  });

  // whenever a client disconnects
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.emit("currentRooms", recountRoom(user.room));
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left.`)
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
