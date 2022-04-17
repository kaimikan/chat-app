const socket = io();

const $rooms = document.querySelector("#rooms");
const $roomsTemplate = document.querySelector("#rooms-template").innerHTML;
const $noRoomsTemplate = document.querySelector("#no-rooms-template").innerHTML;
const $roomButton = document.querySelector("#room");

socket.on("currentRooms", (rooms) => {
  let html = "<p>Something is wrong.</p>";
  if (rooms.length === 0) {
    rooms.push({
      text: "There are currently no live rooms. Create one!",
    });

    html = Mustache.render($noRoomsTemplate, {
      rooms,
    });
  } else {
    html = Mustache.render($roomsTemplate, {
      rooms,
    });
  }

  return ($rooms.innerHTML = html);
});
