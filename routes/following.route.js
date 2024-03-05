"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const following_controller_1 = __importDefault(require("../controller/following.controller"));
const router = (0, express_1.Router)();
const followingController = new following_controller_1.default();
router.post("/follow", followingController.follow);
router.get("/check-follow", followingController.getFollowInformation);
router.get("/check-follower-count", followingController.getFollowCounts);
router.delete("/unfollow", followingController.unfollow);
exports.default = router;
