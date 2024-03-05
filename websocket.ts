import { Server as SocketIOServer } from "socket.io";
import pool from "./db";

export const registerSocketServer = (io: SocketIOServer) => {
  const userSocketMap: { [key: string]: string } = {};
  const activeChats: { [key: string]: string } = {};

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("registerUser", (data) => {
      const { userId } = data;

      userSocketMap[userId] = socket.id;

      console.log(`User registered: ${userId} with socket ID: ${socket.id}`);
      console.log(`UserSocketMap:${JSON.stringify(userSocketMap)}`);
      console.log(`Active chats: ${JSON.stringify(activeChats)}`);
    });

    socket.on("unregisterUser", () => {
      const userId = Object.keys(userSocketMap).find(
        (key) => userSocketMap[key] === socket.id
      );
      if (userId) {
        delete userSocketMap[userId];
        delete activeChats[userId];
        console.log(`User disconnected: ${userId}`);
        console.log(`UserSocketMap:${JSON.stringify(userSocketMap)}`);
        console.log(`Active chats: ${JSON.stringify(activeChats)}`);
      }
    });
    socket.on("disconnect", () => {
      const userId = Object.keys(userSocketMap).find(
        (key) => userSocketMap[key] === socket.id
      );
      if (userId) {
        delete userSocketMap[userId];
        delete activeChats[userId];
        console.log(`User disconnected: ${userId}`);
        console.log(`UserSocketMap:${JSON.stringify(userSocketMap)}`);
        console.log(`Active chats: ${JSON.stringify(activeChats)}`);
      }
    });

    socket.on("joinChat", ({ chatId, userId }) => {
      socket.join(chatId);
      activeChats[userId] = chatId;
      console.log(
        `User ${
          socket.id
        } joined chat: ${chatId}, active chats: ${JSON.stringify(activeChats)}`
      );
    });

    socket.on("leaveChat", ({ chatId, userId }) => {
      socket.leave(chatId);
      delete activeChats[userId];
      console.log(`active chats: ${JSON.stringify(activeChats)}`);
    });

    socket.on("readChat", async (data) => {
      const { chat_id, user_uid } = data;

      try {
        const chat = await pool.query(
          "SELECT user1_uid, user2_uid FROM chats WHERE chat_id = $1",
          [chat_id]
        );

        const readColumn =
          chat.rows[0].user1_uid === user_uid ? "user1_read" : "user2_read";

        await pool.query(
          `UPDATE chats SET ${readColumn} = TRUE WHERE chat_id = $1`,
          [chat_id]
        );

        io.to(socket.id).emit("readNotificationCount");
        console.log(`Chat ${chat_id} marked as read by user ${user_uid}`);
      } catch (error) {
        console.error(error);
      }
    });

    socket.on("sendMessage", async (data) => {
      const { chat_id, sender_uid, reciever_uid, content } = data;

      try {
        await pool.query("BEGIN");
        const newMessage = await pool.query(
          "INSERT INTO messages (chat_id, sender_uid, reciever_uid, content) VALUES ($1, $2, $3, $4) RETURNING *",
          [chat_id, sender_uid, reciever_uid, content]
        );

        const chatParticipants = await pool.query(
          "SELECT user1_uid, user2_uid FROM chats WHERE chat_id = $1",
          [chat_id]
        );

        if (chatParticipants.rowCount) {
          const { user1_uid, user2_uid } = chatParticipants.rows[0];
          const isSenderUser1 = sender_uid === user1_uid;

          await pool.query(
            `UPDATE chats SET last_message_content = $1, last_message_timestamp = CURRENT_TIMESTAMP, 
         user1_read = $2, user2_read = $3 WHERE chat_id = $4`,
            [content, isSenderUser1, !isSenderUser1, chat_id]
          );
        }
        await pool.query("COMMIT");

        if (activeChats[reciever_uid] !== chat_id) {
          //console.log(activeChats[reciever_uid] !== chat_id);
          io.to(userSocketMap[sender_uid]).emit(
            "newMessage",
            newMessage.rows[0]
          );
          const recipientSocketId = userSocketMap[reciever_uid];
          if (recipientSocketId) {
            io.to(recipientSocketId).emit("newNotification");
            console.log(`User ${recipientSocketId} notified of new message`);
          }
        } else {
          io.to(chat_id).emit("newMessage", newMessage.rows[0]);
        }
        console.log(newMessage.rows[0]);
      } catch (error) {
        await pool.query("ROLLBACK");
        console.error(error);
      }
    });
  });
};
