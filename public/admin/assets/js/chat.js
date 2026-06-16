// Khởi tạo SocketIO bên Admin
const socket = io();

// logic nhắn tin của admin
const formChat = document.querySelector("[form-chat]");
if (formChat) {
  const inputContent = formChat.querySelector("[input-content]");
  const buttonSend = formChat.querySelector("[button-send]");
  const chatBody = document.querySelector("#chat-body");

  buttonSend.addEventListener("click", () => {
    const content = inputContent.value;
    if (content) {
      // Gửi tin nhắn lên server
      socket.emit("CLIENT_SEND_MESSAGE", {
        content: content,
      });
      inputContent.value = "";
    }
  });

  // Nhận tin nhắn từ server
  socket.on("SERVER_SEND_MESSAGE", (data) => {
    const elementMessage = document.createElement("div");
    elementMessage.classList.add("message");
    elementMessage.classList.add(data.senderRole);
    elementMessage.innerHTML = `
      <div class="bubble">${data.content}</div>
    `;
    chatBody.appendChild(elementMessage);
  });
}
// Hết logic nhắn tin của admin
