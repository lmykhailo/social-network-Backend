import express, { Express } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import usersRouter from "./routes/users.route";
import followingRouter from "./routes/following.route";
import chatsRouter from "./routes/chats.route";
import messagesRouter from "./routes/messages.route";
import postsRouter from "./routes/posts.route";
import { registerSocketServer } from "./websocket";

const PORT: number | string = process.env.PORT || 8080;
const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/api", usersRouter);
app.use("/api", followingRouter);
app.use("/api", chatsRouter);
app.use("/api", messagesRouter);
app.use("/api", postsRouter);

registerSocketServer(io);

httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`));
