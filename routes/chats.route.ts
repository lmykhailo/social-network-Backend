import { Router } from "express";
import ChatsController from "../controller/chats.controller";

const router = Router();
const chatsController = new ChatsController();

router.post("/chats", chatsController.createChat);
router.get("/chats/:uid", chatsController.getChats);
router.get("/chats/notifications/:uid", chatsController.getNotifications);
router.get("/one-chat/:chat_id", chatsController.getOneChat);
router.get("/chats-with-info/:uid", chatsController.getChatsWithUserInfo);

export default router;
