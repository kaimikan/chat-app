const rooms = [];

const addRoom = ({ room }) => {
  room = room.trim().toLowerCase();
  const findRoom = rooms.find((liveRoom) => liveRoom.name === room);

  if (findRoom) {
    findRoom.number++;
    return rooms;
  }

  rooms.push({ name: room, number: 1 });
  return rooms;
};

const recountRoom = (room) => {
  room = room.trim().toLowerCase();
  const findRoom = rooms.find((liveRoom) => liveRoom.name === room);

  if (findRoom) {
    findRoom.number--;
    if (findRoom.number === 0) {
      index = rooms.indexOf(findRoom);
      rooms.splice(index, 1);
    }
  }

  return rooms;
};

const generateRooms = () => {
  return rooms;
};

module.exports = {
  addRoom,
  recountRoom,
  generateRooms,
  rooms,
};
