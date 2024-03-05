import pool from "../db";
import { Request, Response } from "express";

class UsersController {
  async createUser(req: Request, res: Response) {
    const { email, displayName, uid, photoURL, username } = req.body;

    try {
      const existingEntry = await pool.query(
        "SELECT * FROM user_base WHERE uid = $1",
        [uid]
      );

      if (existingEntry.rows.length === 0) {
        const newUser = await pool.query(
          'INSERT INTO user_base (email, "displayName", uid, "photoURL", username) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [email, displayName, uid, photoURL, username]
        );
        res.json(newUser.rows[0]);
      } else {
        res.status(400).send("User already exists");
      }
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send(err.message);
      } else {
        res.status(500).send("An unknown error occurred");
      }
    }
  }

  async getUsers(req: Request, res: Response) {
    try {
      const users = await pool.query("SELECT * FROM user_base");
      res.json(users.rows);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send(err.message);
      } else {
        res.status(500).send("An unknown error occurred");
      }
    }
  }
  async getUsersBySearch(req: Request, res: Response) {
    const { searchQuery } = req.query;
    const limit = parseInt(req.query.limit as string) || 6;
    try {
      const users = await pool.query(
        "SELECT * FROM user_base WHERE username ILIKE $1 LIMIT $2",
        [`%${searchQuery}%`, limit]
      );
      res.json(users.rows);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send(err.message);
      } else {
        res.status(500).send("An unknown error occurred");
      }
    }
  }

  async getOneUser(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const users = await pool.query("SELECT * FROM user_base WHERE id = $1", [
        id,
      ]);
      res.json(users.rows[0]);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send(err.message);
      } else {
        res.status(500).send("An unknown error occurred");
      }
    }
  }

  async getOneUserByUid(req: Request, res: Response) {
    const { uid } = req.params;
    try {
      const user = await pool.query("SELECT * FROM user_base WHERE uid = $1", [
        uid,
      ]);
      if (user.rows.length === 0) {
        return res.status(404).send("User not found");
      }
      res.json(user.rows[0]);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send(err.message);
      } else {
        res.status(500).send("An unknown error occurred");
      }
    }
  }
  async getOneUserByUsername(req: Request, res: Response) {
    const { username } = req.params;
    try {
      const user = await pool.query(
        "SELECT * FROM user_base WHERE username = $1",
        [username]
      );
      if (user.rows.length === 0) {
        return res.status(404).send("User not found");
      }
      res.json(user.rows[0]);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send(err.message);
      } else {
        res.status(500).send("An unknown error occurred");
      }
    }
  }

  async updateUser(req: Request, res: Response) {
    const { uid } = req.params;
    const { email, displayName, photoURL, username } = req.body;
    try {
      const updatedUser = await pool.query(
        'UPDATE user_base SET email = $1, "displayName" = $2,  "photoURL" = $4, username = $5 WHERE uid = $3 RETURNING *',
        [email, displayName, uid, photoURL, username]
      );
      res.json(updatedUser.rows[0]);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send(err.message);
      } else {
        res.status(500).send("An unknown error occurred");
      }
    }
  }
  async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await pool.query("DELETE FROM user_base WHERE id = $1", [id]);
      res.json({ message: "User deleted" });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send(err.message);
      } else {
        res.status(500).send("An unknown error occurred");
      }
    }
  }
  async checkUsername(req: Request, res: Response) {
    const { username } = req.params;
    try {
      const result = await pool.query(
        "SELECT COUNT(*) FROM user_base WHERE username = $1",
        [username]
      );
      const isAvailable = result.rows[0].count === "0";
      res.json({ isAvailable });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send(err.message);
      } else {
        res.status(500).send("An unknown error occurred");
      }
    }
  }
}

export default UsersController;
