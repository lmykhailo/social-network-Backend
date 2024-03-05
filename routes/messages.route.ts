import { Router } from "express";
import MessagesController from "../controller/messages.controller";

const router = Router();
const messagesController = new MessagesController();

router.post("/messages", messagesController.createMessage);
router.get("/messages/:chat_id", messagesController.getMessages);
router.get(
  "/messages/one-message/:message_uid",
  messagesController.getOneMessage
);

export default router;
