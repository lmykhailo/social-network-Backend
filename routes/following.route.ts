import { Router } from "express";
import FollowingController from "../controller/following.controller";

const router = Router();
const followingController = new FollowingController();

router.post("/follow", followingController.follow);
router.get("/check-follow", followingController.getFollowInformation);
router.get("/check-follower-count", followingController.getFollowCounts);
router.delete("/unfollow", followingController.unfollow);

export default router;
