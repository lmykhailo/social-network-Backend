"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messages_controller_1 = __importDefault(require("../controller/messages.controller"));
const router = (0, express_1.Router)();
const messagesController = new messages_controller_1.default();
router.post("/messages", messagesController.createMessage);
router.get("/messages/:chat_id", messagesController.getMessages);
router.get("/messages/one-message/:message_uid", messagesController.getOneMessage);
exports.default = router;
