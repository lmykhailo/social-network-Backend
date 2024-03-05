"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db"));
class СhatsController {
    createChat(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user1_uid, user2_uid } = req.body;
            try {
                const existingChat = yield db_1.default.query("SELECT * FROM chats WHERE (user1_uid = $1 AND user2_uid = $2) OR (user1_uid = $2 AND user2_uid = $1)", [user1_uid, user2_uid]);
                if (existingChat.rows.length > 0) {
                    res.json(existingChat.rows[0]);
                }
                else {
                    const newChat = yield db_1.default.query("INSERT INTO chats (user1_uid, user2_uid) VALUES ($1, $2) RETURNING *", [user1_uid, user2_uid]);
                    res.json(newChat.rows[0]);
                }
            }
            catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });
    }
    getChats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { uid } = req.params;
            try {
                const chats = yield db_1.default.query("SELECT * FROM chats WHERE user1_uid = $1 OR user2_uid = $1 ORDER BY last_message_timestamp DESC", [uid]);
                res.json(chats.rows);
            }
            catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });
    }
    getNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { uid } = req.params;
            try {
                const unreadChats = yield db_1.default.query(`SELECT chat_id FROM chats 
      WHERE (user1_uid = $1 AND user1_read = FALSE) 
      OR (user2_uid = $1 AND user2_read = FALSE)`, [uid]);
                const chatIds = unreadChats.rows.map((row) => row.chat_id);
                const notificationsCount = chatIds.length;
                res.json({ notificationsCount, chatIds });
            }
            catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });
    }
    getOneChat(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chat_id } = req.params;
            try {
                const chats = yield db_1.default.query("SELECT * FROM chats WHERE chat_id = $1", [
                    chat_id,
                ]);
                res.json(chats.rows);
            }
            catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });
    }
    getChatsWithUserInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { uid } = req.params;
            try {
                const chatsResult = yield db_1.default.query("SELECT * FROM chats WHERE user1_uid = $1 OR user2_uid = $1", [uid]);
                const chatsWithUserDetails = [];
                for (const chat of chatsResult.rows) {
                    const otherUserUid = chat.user1_uid === uid ? chat.user2_uid : chat.user1_uid;
                    const userDetailsResult = yield db_1.default.query('SELECT username, "photoURL" FROM user_base WHERE uid = $1', [otherUserUid]);
                    if (userDetailsResult.rows.length > 0) {
                        const otherUserDetails = userDetailsResult.rows[0];
                        chatsWithUserDetails.push(Object.assign(Object.assign({}, chat), { other_user_details: otherUserDetails }));
                    }
                    else {
                        chatsWithUserDetails.push(chat);
                    }
                }
                console.log(chatsWithUserDetails);
                res.json(chatsWithUserDetails);
            }
            catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });
    }
}
exports.default = СhatsController;
