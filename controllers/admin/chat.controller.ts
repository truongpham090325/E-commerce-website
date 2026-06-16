import { Request, Response } from "express";
import ChatRoom from "../../models/chat-room.model";
import AccountUser from "../../models/account-user.model";
import { timeAgo } from "../../helpers/format.helper";
import ChatMessage from "../../models/chat-message.model";
import { pathAdmin } from "../../configs/variable.config";
import { getChatRoomList } from "../../helpers/chat.helper";

export const myChatList = async (req: Request, res: Response) => {
  const chatRoomList = await getChatRoomList(res.locals.accountAdmin.id);

  res.render("admin/pages/my-chat-list", {
    pageTitle: "Danh sách tin nhắn của bạn",
    chatRoomList: chatRoomList,
  });
};

export const detail = async (req: Request, res: Response) => {
  try {
    // Chi tiết phòng chat
    const id = req.params.id;
    const chatRoomDetail = await ChatRoom.findOne({
      _id: id,
    });

    if (!chatRoomDetail) {
      res.redirect(`/${pathAdmin}/dashboard`);
      return;
    }

    // Danh sách phòng chat
    const chatRoomList = await getChatRoomList(res.locals.accountAdmin.id);

    // Thông tin người dùng
    const infoUser = await AccountUser.findOne({
      _id: chatRoomDetail.userId,
    });

    // Danh sách tin nhắn
    const chatMessages: any = await ChatMessage.find({
      roomId: id,
    });

    for (const item of chatMessages) {
      item.createdAtFormat = timeAgo(item.createdAt);
    }

    res.render("admin/pages/chat-detail", {
      pageTitle: "Chi tiết tin nhắn",
      chatRoomDetail: chatRoomDetail,
      chatRoomList: chatRoomList,
      infoUser: infoUser,
      chatMessages: chatMessages,
    });
  } catch (error) {
    console.log(error);
    res.redirect(`/${pathAdmin}/dashboard`);
  }
};
