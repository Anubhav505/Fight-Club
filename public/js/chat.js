document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  const form = document.getElementById("form");
  const input = document.getElementById("input");
  const messages = document.getElementById("messages");

  // Handle receiving messages
  socket.on("load messages", (msgs) => {
    msgs.forEach((msg) => {
      addMessageToList(msg);
    });
  });

  socket.on("chat message", (message) => {
    addMessageToList(message);
  });

  // Handle form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value.trim()) {
      const message = { text: input.value };
      socket.emit("chat message", message);
      input.value = ""; // Clear input field
    }
  });

  // Add message to the list and scroll to bottom
  function addMessageToList(message) {
    const li = document.createElement("li");
    li.textContent = `${message.text} - ${new Date(
      message.timestamp
    ).toLocaleTimeString()}`;
    messages.appendChild(li);

    // Scroll to bottom
    messages.scrollTop = messages.scrollHeight;
  }
});
