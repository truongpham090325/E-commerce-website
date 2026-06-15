import { Server, Socket } from "socket.io";
import ChatRoom from "../models/chat-room.model";
import ChatMessage from "../models/chat-message.model";

export const chatSocket = async (io: Server, socket: Socket) => {
  try {
    const account = socket.data.account;
    if (!account) {
      return;
    }

    // Tạo phòng chat cho user nếu chưa có
    let chatRoom: any = null;
    if (account.role === "user") {
      chatRoom = await ChatRoom.findOne({
        userId: account.id,
      });

      if (!chatRoom) {
        // Tạo phòng chat cho user
        chatRoom = await ChatRoom.create({
          userId: account.id,
          adminId: "6a2f66cb056bc745ac90c34a",
          unreadCount: {
            user: 0,
            admin: 0,
          },
          status: "open",
        });
      }
    }

    // Lắng nghe sự kiện CLIENT_SEND_MESSAGE
    socket.on("CLIENT_SEND_MESSAGE", async (data) => {
      // Lưu tin nhắn vào CSDL
      const message = {
        roomId: chatRoom.id,
        senderId: account.id,
        senderRole: account.role,
        content: data.content,
        file: [],
      };
      const newMessage = new ChatMessage(message);
      await newMessage.save();

      // Cập nhập số lượng tin nhắn chưa đọc
      if (account.role === "user") {
        await ChatRoom.updateOne(
          {
            _id: chatRoom.id,
          },
          {
            $inc: {
              "unreadCount.user": 1,
            },
          },
        );
      }

      // Phản hồi về cho tất cả mọi người
      io.emit("SERVER_SEND_MESSAGE", data);
    });
  } catch (error) {
    console.log(error);
  }
};
