import { Router } from "express";
import PostsContorller from "../controller/posts.controller";

const router = Router();
const postsContorller = new PostsContorller();

router.post("/posts", postsContorller.createPost);
router.get("/posts/:uid", postsContorller.getPosts);
router.get("/followed-posts/:uid", postsContorller.getFollowedPosts);

export default router;
