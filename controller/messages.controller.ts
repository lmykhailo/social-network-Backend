import pool from "../db";
import { Request, Response } from "express";

class MessagesController {
  async createMessage(req: Request, res: Response) {
    const { chat_id, sender_uid, reciever_uid, content } = req.body;

    try {
      await pool.query("BEGIN");
      const newMessage = await pool.query(
        "INSERT INTO messages (chat_id, sender_uid, reciever_uid, content) VALUES ($1, $2, $3, $4) RETURNING *",
        [chat_id, sender_uid, reciever_uid, content]
      );
      await pool.query(
        "UPDATE chats SET last_message_content = $1, last_message_timestamp = CURRENT_TIMESTAMP WHERE chat_id = $2",
        [content, chat_id]
      );
      await pool.query("COMMIT");

      res.json(newMessage.rows[0]);
    } catch (error) {
      await pool.query("ROLLBACK");
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }

  async getMessages(req: Request, res: Response) {
    const { chat_id } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;

    try {
      const messages = await pool.query(
        "SELECT * FROM messages WHERE chat_id = $1 ORDER BY timestamp DESC LIMIT $2 ",
        [chat_id, limit]
      );
      res.json(messages.rows);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send(err.message);
      } else {
        res.status(500).send("An unknown error occurred");
      }
    }
  }

  async getOneMessage(req: Request, res: Response) {
    const { message_uid } = req.params;
    try {
      const users = await pool.query(
        "SELECT * FROM messages WHERE message_uid = $1",
        [message_uid]
      );
      res.json(users.rows[0]);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send(err.message);
      } else {
        res.status(500).send("An unknown error occurred");
      }
    }
  }
}

export default MessagesController;
