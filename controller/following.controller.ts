import pool from "../db";
import { Request, Response } from "express";

class FollowingController {
  async follow(req: Request, res: Response) {
    console.log("Request Body:", req.body);

    const { follower_uid, following_uid } = req.body;

    console.log("followerUid:", follower_uid, "followingUid:", following_uid);

    if (follower_uid === following_uid) {
      return res.status(400).send("A user cannot follow themselves.");
    }

    const result = await pool.query(
      "SELECT * FROM user_follows WHERE follower_uid = $1 AND following_uid = $2",
      [follower_uid, following_uid]
    );

    if (result.rows.length > 0) {
      return res.status(400).send("User already followed.");
    }

    try {
      const insertResult = await pool.query(
        "INSERT INTO user_follows (follower_uid, following_uid) VALUES ($1, $2) RETURNING *",
        [follower_uid, following_uid]
      );
      res.status(201).json(insertResult.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }

  async getFollowInformation(req: Request, res: Response) {
    const { follower_uid, following_uid } = req.query;

    try {
      const result = await pool.query(
        "SELECT * FROM user_follows WHERE follower_uid = $1 AND following_uid = $2",
        [follower_uid, following_uid]
      );
      const isFollowing = result.rows.length > 0;
      res.json({ isFollowing });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }

  async unfollow(req: Request, res: Response) {
    const { follower_uid, following_uid } = req.body;

    try {
      await pool.query(
        "DELETE FROM user_follows WHERE follower_uid = $1 AND following_uid = $2",
        [follower_uid, following_uid]
      );
      res.status(200).send("Unfollowed successfully.");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
  async getFollowCounts(req: Request, res: Response) {
    const { uid } = req.query;

    try {
      const followersResult = await pool.query(
        "SELECT COUNT(*) FROM user_follows WHERE following_uid = $1",
        [uid]
      );
      const followingResult = await pool.query(
        "SELECT COUNT(*) FROM user_follows WHERE follower_uid = $1",
        [uid]
      );

      const followerCount = parseInt(followersResult.rows[0].count, 10);
      const followingCount = parseInt(followingResult.rows[0].count, 10);

      res.json({ followerCount, followingCount });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
}

export default FollowingController;
