"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const posts_controller_1 = __importDefault(require("../controller/posts.controller"));
const router = (0, express_1.Router)();
const postsContorller = new posts_controller_1.default();
router.post("/posts", postsContorller.createPost);
router.get("/posts/:uid", postsContorller.getPosts);
router.get("/followed-posts/:uid", postsContorller.getFollowedPosts);
exports.default = router;
