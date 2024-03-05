import { Request, Response } from "express";
import pool from "../db";

class СhatsController {
  async createChat(req: Request, res: Response) {
    const { user1_uid, user2_uid } = req.body;

    try {
      const existingChat = await pool.query(
        "SELECT * FROM chats WHERE (user1_uid = $1 AND user2_uid = $2) OR (user1_uid = $2 AND user2_uid = $1)",
        [user1_uid, user2_uid]
      );

      if (existingChat.rows.length > 0) {
        res.json(existingChat.rows[0]);
      } else {
        const newChat = await pool.query(
          "INSERT INTO chats (user1_uid, user2_uid) VALUES ($1, $2) RETURNING *",
          [user1_uid, user2_uid]
        );
        res.json(newChat.rows[0]);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }

  async getChats(req: Request, res: Response) {
    const { uid } = req.params;

    try {
      const chats = await pool.query(
        "SELECT * FROM chats WHERE user1_uid = $1 OR user2_uid = $1 ORDER BY last_message_timestamp DESC",
        [uid]
      );
      res.json(chats.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
  async getNotifications(req: Request, res: Response) {
    const { uid } = req.params;

    try {
      const unreadChats = await pool.query(
        `SELECT chat_id FROM chats 
      WHERE (user1_uid = $1 AND user1_read = FALSE) 
      OR (user2_uid = $1 AND user2_read = FALSE)`,
        [uid]
      );

      const chatIds = unreadChats.rows.map((row) => row.chat_id);
      const notificationsCount = chatIds.length;

      res.json({ notificationsCount, chatIds });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }

  async getOneChat(req: Request, res: Response) {
    const { chat_id } = req.params;

    try {
      const chats = await pool.query("SELECT * FROM chats WHERE chat_id = $1", [
        chat_id,
      ]);
      res.json(chats.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
  async getChatsWithUserInfo(req: Request, res: Response) {
    const { uid } = req.params;

    try {
      const chatsResult = await pool.query(
        "SELECT * FROM chats WHERE user1_uid = $1 OR user2_uid = $1",
        [uid]
      );

      const chatsWithUserDetails = [];

      for (const chat of chatsResult.rows) {
        const otherUserUid =
          chat.user1_uid === uid ? chat.user2_uid : chat.user1_uid;

        const userDetailsResult = await pool.query(
          'SELECT username, "photoURL" FROM user_base WHERE uid = $1',
          [otherUserUid]
        );

        if (userDetailsResult.rows.length > 0) {
          const otherUserDetails = userDetailsResult.rows[0];
          chatsWithUserDetails.push({
            ...chat,
            other_user_details: otherUserDetails,
          });
        } else {
          chatsWithUserDetails.push(chat);
        }
      }
      console.log(chatsWithUserDetails);
      res.json(chatsWithUserDetails);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
}

export default СhatsController;
