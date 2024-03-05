"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const users_route_1 = __importDefault(require("./routes/users.route"));
const following_route_1 = __importDefault(require("./routes/following.route"));
const chats_route_1 = __importDefault(require("./routes/chats.route"));
const messages_route_1 = __importDefault(require("./routes/messages.route"));
const posts_route_1 = __importDefault(require("./routes/posts.route"));
const websocket_1 = require("./websocket");
const PORT = process.env.PORT || 8080;
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
    },
});
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api", users_route_1.default);
app.use("/api", following_route_1.default);
app.use("/api", chats_route_1.default);
app.use("/api", messages_route_1.default);
app.use("/api", posts_route_1.default);
(0, websocket_1.registerSocketServer)(io);
httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`));
