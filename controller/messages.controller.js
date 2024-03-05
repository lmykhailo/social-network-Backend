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
class MessagesController {
    createMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chat_id, sender_uid, reciever_uid, content } = req.body;
            try {
                yield db_1.default.query("BEGIN");
                const newMessage = yield db_1.default.query("INSERT INTO messages (chat_id, sender_uid, reciever_uid, content) VALUES ($1, $2, $3, $4) RETURNING *", [chat_id, sender_uid, reciever_uid, content]);
                yield db_1.default.query("UPDATE chats SET last_message_content = $1, last_message_timestamp = CURRENT_TIMESTAMP WHERE chat_id = $2", [content, chat_id]);
                yield db_1.default.query("COMMIT");
                res.json(newMessage.rows[0]);
            }
            catch (error) {
                yield db_1.default.query("ROLLBACK");
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });
    }
    getMessages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chat_id } = req.params;
            const limit = parseInt(req.query.limit) || 20;
            try {
                const messages = yield db_1.default.query("SELECT * FROM messages WHERE chat_id = $1 ORDER BY timestamp DESC LIMIT $2 ", [chat_id, limit]);
                res.json(messages.rows);
            }
            catch (err) {
                if (err instanceof Error) {
                    res.status(500).send(err.message);
                }
                else {
                    res.status(500).send("An unknown error occurred");
                }
            }
        });
    }
    getOneMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { message_uid } = req.params;
            try {
                const users = yield db_1.default.query("SELECT * FROM messages WHERE message_uid = $1", [message_uid]);
                res.json(users.rows[0]);
            }
            catch (err) {
                if (err instanceof Error) {
                    res.status(500).send(err.message);
                }
                else {
                    res.status(500).send("An unknown error occurred");
                }
            }
        });
    }
}
exports.default = MessagesController;
