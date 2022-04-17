const socket = io();

// Elements
// $ in front is a convention to signify it's an element from the DOM
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
//location.search provides url ?key=value query parameters
const { username, creator, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // new message element
  const $newMessage = $messages.lastElementChild;

  // get height of new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // visible height
  const visibleHeight = $messages.offsetHeight;

  // height of messages container
  const containerHeight = $messages.scrollHeight;

  // how far scrolled are we?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (messageCallback) => {
  console.log(messageCallback);
  const html = Mustache.render(messageTemplate, {
    username: messageCallback.username,
    message: messageCallback.text,
    isCurrentChatter:
      username.trim().toLowerCase() === messageCallback.username,
    createdAt: moment(messageCallback.createdAt).format("HH:mm"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (urlCallback) => {
  console.log(urlCallback);
  const html = Mustache.render(locationTemplate, {
    username: urlCallback.username,
    url: urlCallback.url,
    isCurrentChatter: username.trim().toLowerCase() === urlCallback.username,
    createdAt: moment(urlCallback.createdAt).format("HH:mm"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  // adding a b tag to current chatter so we can display it in the list
  const index = users.findIndex(
    (user) => user.username === username.trim().toLowerCase()
  );
  users[index].username = `<b>${username.trim().toLowerCase()}</b>`;
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message_input.value; //document.querySelector("input").value;
  socket.emit("sendMessage", message, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) return console.log(error);

    console.log("The message was delivered.");
  });
});

$sendLocationButton.addEventListener("click", () => {
  $sendLocationButton.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("Location shared!");
      }
    );
  });
});

socket.emit("join", { username, creator, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
