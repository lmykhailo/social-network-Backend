"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chats_controller_1 = __importDefault(require("../controller/chats.controller"));
const router = (0, express_1.Router)();
const chatsController = new chats_controller_1.default();
router.post("/chats", chatsController.createChat);
router.get("/chats/:uid", chatsController.getChats);
router.get("/chats/notifications/:uid", chatsController.getNotifications);
router.get("/one-chat/:chat_id", chatsController.getOneChat);
router.get("/chats-with-info/:uid", chatsController.getChatsWithUserInfo);
exports.default = router;
