const socket = io();

socket.on("message", (messageCallback) => {
  console.log(messageCallback);
});

document.querySelector("#message-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const message = e.target.elements.message_input.value; //document.querySelector("input").value;
  socket.emit("sendMessage", message);
});
