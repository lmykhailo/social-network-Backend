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
exports.registerSocketServer = void 0;
const db_1 = __importDefault(require("./db"));
const registerSocketServer = (io) => {
    const userSocketMap = {};
    const activeChats = {};
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);
        socket.on("registerUser", (data) => {
            const { userId } = data;
            userSocketMap[userId] = socket.id;
            console.log(`User registered: ${userId} with socket ID: ${socket.id}`);
            console.log(`UserSocketMap:${JSON.stringify(userSocketMap)}`);
            console.log(`Active chats: ${JSON.stringify(activeChats)}`);
        });
        socket.on("unregisterUser", () => {
            const userId = Object.keys(userSocketMap).find((key) => userSocketMap[key] === socket.id);
            if (userId) {
                delete userSocketMap[userId];
                delete activeChats[userId];
                console.log(`User disconnected: ${userId}`);
                console.log(`UserSocketMap:${JSON.stringify(userSocketMap)}`);
                console.log(`Active chats: ${JSON.stringify(activeChats)}`);
            }
        });
        socket.on("disconnect", () => {
            const userId = Object.keys(userSocketMap).find((key) => userSocketMap[key] === socket.id);
            if (userId) {
                delete userSocketMap[userId];
                delete activeChats[userId];
                console.log(`User disconnected: ${userId}`);
                console.log(`UserSocketMap:${JSON.stringify(userSocketMap)}`);
                console.log(`Active chats: ${JSON.stringify(activeChats)}`);
            }
        });
        socket.on("joinChat", ({ chatId, userId }) => {
            socket.join(chatId);
            activeChats[userId] = chatId;
            console.log(`User ${socket.id} joined chat: ${chatId}, active chats: ${JSON.stringify(activeChats)}`);
        });
        socket.on("leaveChat", ({ chatId, userId }) => {
            socket.leave(chatId);
            delete activeChats[userId];
            console.log(`active chats: ${JSON.stringify(activeChats)}`);
        });
        socket.on("readChat", (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { chat_id, user_uid } = data;
            try {
                const chat = yield db_1.default.query("SELECT user1_uid, user2_uid FROM chats WHERE chat_id = $1", [chat_id]);
                const readColumn = chat.rows[0].user1_uid === user_uid ? "user1_read" : "user2_read";
                yield db_1.default.query(`UPDATE chats SET ${readColumn} = TRUE WHERE chat_id = $1`, [chat_id]);
                io.to(socket.id).emit("readNotificationCount");
                console.log(`Chat ${chat_id} marked as read by user ${user_uid}`);
            }
            catch (error) {
                console.error(error);
            }
        }));
        socket.on("sendMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { chat_id, sender_uid, reciever_uid, content } = data;
            try {
                yield db_1.default.query("BEGIN");
                const newMessage = yield db_1.default.query("INSERT INTO messages (chat_id, sender_uid, reciever_uid, content) VALUES ($1, $2, $3, $4) RETURNING *", [chat_id, sender_uid, reciever_uid, content]);
                const chatParticipants = yield db_1.default.query("SELECT user1_uid, user2_uid FROM chats WHERE chat_id = $1", [chat_id]);
                if (chatParticipants.rowCount) {
                    const { user1_uid, user2_uid } = chatParticipants.rows[0];
                    const isSenderUser1 = sender_uid === user1_uid;
                    yield db_1.default.query(`UPDATE chats SET last_message_content = $1, last_message_timestamp = CURRENT_TIMESTAMP, 
         user1_read = $2, user2_read = $3 WHERE chat_id = $4`, [content, isSenderUser1, !isSenderUser1, chat_id]);
                }
                yield db_1.default.query("COMMIT");
                if (activeChats[reciever_uid] !== chat_id) {
                    //console.log(activeChats[reciever_uid] !== chat_id);
                    io.to(userSocketMap[sender_uid]).emit("newMessage", newMessage.rows[0]);
                    const recipientSocketId = userSocketMap[reciever_uid];
                    if (recipientSocketId) {
                        io.to(recipientSocketId).emit("newNotification");
                        console.log(`User ${recipientSocketId} notified of new message`);
                    }
                }
                else {
                    io.to(chat_id).emit("newMessage", newMessage.rows[0]);
                }
                console.log(newMessage.rows[0]);
            }
            catch (error) {
                yield db_1.default.query("ROLLBACK");
                console.error(error);
            }
        }));
    });
};
exports.registerSocketServer = registerSocketServer;
