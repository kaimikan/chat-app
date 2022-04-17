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

// Options
//location.search provides url ?key=value query parameters
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.on("message", (messageCallback) => {
  console.log(messageCallback);
  const html = Mustache.render(messageTemplate, {
    message: messageCallback.text,
    createdAt: moment(messageCallback.createdAt).format("HH:mm"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (urlCallback) => {
  console.log(urlCallback);
  const html = Mustache.render(locationTemplate, {
    url: urlCallback.url,
    createdAt: moment(urlCallback.createdAt).format("HH:mm"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
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

socket.emit("join", { username, room });
