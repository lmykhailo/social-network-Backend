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
class PostsController {
    createPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { photo_url, description, uid } = req.body;
            try {
                const newPosts = yield db_1.default.query("INSERT INTO posts (photo_url, description, uid) VALUES ($1, $2, $3) RETURNING *", [photo_url, description, uid]);
                res.json(newPosts.rows[0]);
            }
            catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });
    }
    getPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { uid } = req.params;
            const limit = parseInt(req.query.limit) || 10;
            try {
                const posts = yield db_1.default.query(`SELECT p.post_id, p.photo_url, p.description, p.created_at, p.uid, u.username, u."photoURL"
        FROM posts p
        JOIN user_base u ON p.uid = u.uid
        WHERE p.uid = $1
        ORDER BY p.created_at DESC
        LIMIT $2;
        `, [uid, limit]);
                res.json(posts.rows);
            }
            catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });
    }
    getFollowedPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { uid } = req.params;
            const limit = parseInt(req.query.limit) || 2;
            try {
                const posts = yield db_1.default.query(`SELECT p.post_id, p.photo_url, p.description, p.created_at, p.uid, u.username, u."photoURL"
        FROM posts p
        JOIN user_base u ON p.uid = u.uid
        JOIN user_follows f ON p.uid = f.following_uid
        WHERE f.follower_uid = $1
        ORDER BY p.created_at DESC
        LIMIT $2;
        `, [uid, limit]);
                res.json(posts.rows);
            }
            catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });
    }
}
exports.default = PostsController;
