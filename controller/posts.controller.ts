import { Request, Response } from "express";
import pool from "../db";

class PostsController {
  async createPost(req: Request, res: Response) {
    const { photo_url, description, uid } = req.body;

    try {
      const newPosts = await pool.query(
        "INSERT INTO posts (photo_url, description, uid) VALUES ($1, $2, $3) RETURNING *",
        [photo_url, description, uid]
      );
      res.json(newPosts.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }

  async getPosts(req: Request, res: Response) {
    const { uid } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    try {
      const posts = await pool.query(
        `SELECT p.post_id, p.photo_url, p.description, p.created_at, p.uid, u.username, u."photoURL"
        FROM posts p
        JOIN user_base u ON p.uid = u.uid
        WHERE p.uid = $1
        ORDER BY p.created_at DESC
        LIMIT $2;
        `,
        [uid, limit]
      );
      res.json(posts.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
  async getFollowedPosts(req: Request, res: Response) {
    const { uid } = req.params;
    const limit = parseInt(req.query.limit as string) || 2;

    try {
      const posts = await pool.query(
        `SELECT p.post_id, p.photo_url, p.description, p.created_at, p.uid, u.username, u."photoURL"
        FROM posts p
        JOIN user_base u ON p.uid = u.uid
        JOIN user_follows f ON p.uid = f.following_uid
        WHERE f.follower_uid = $1
        ORDER BY p.created_at DESC
        LIMIT $2;
        `,
        [uid, limit]
      );
      res.json(posts.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
}

export default PostsController;
