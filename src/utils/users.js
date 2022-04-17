const { rooms } = require("./rooms");

const users = [];

const addUser = ({ id, username, creator, room }) => {
  // clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // validate the data
  if (!username || !room) return { error: "Username and room are required." };

  // check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // validate username
  if (existingUser) return { error: "Username is in use." };

  // check for existing room
  const existingRoom = rooms.find((liveRoom) => {
    return liveRoom.name === room && creator === "true";
  });

  // validate room
  if (existingRoom) return { error: "Room is in use." };

  // store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
  /* const user = users.find((user) => user.id === id);
  if (user) return user;
  return { error: "User not found" }; */
};

const getUsersInRoom = (roomName) => {
  roomName = roomName.trim().toLowerCase();
  return users.filter((user) => user.room === roomName);

  /* const usersInRoom = users.filter((user) => user.room === roomName);
  if (usersInRoom) return usersInRoom;
  return { error: "No users found in that room" }; */
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};

/* addUser({
  id: 11,
  username: "Kai",
  room: "Deventer",
});

addUser({
  id: 22,
  username: "Jeff",
  room: "Deventer",
});

addUser({
  id: 33,
  username: "Mike",
  room: "Hunt",
});

console.log(getUser(22));
console.log(getUsersInRoom("DEventer")); */
