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
class FollowingController {
    follow(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Request Body:", req.body);
            const { follower_uid, following_uid } = req.body;
            console.log("followerUid:", follower_uid, "followingUid:", following_uid);
            if (follower_uid === following_uid) {
                return res.status(400).send("A user cannot follow themselves.");
            }
            const result = yield db_1.default.query("SELECT * FROM user_follows WHERE follower_uid = $1 AND following_uid = $2", [follower_uid, following_uid]);
            if (result.rows.length > 0) {
                return res.status(400).send("User already followed.");
            }
            try {
                const insertResult = yield db_1.default.query("INSERT INTO user_follows (follower_uid, following_uid) VALUES ($1, $2) RETURNING *", [follower_uid, following_uid]);
                res.status(201).json(insertResult.rows[0]);
            }
            catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });
    }
    getFollowInformation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { follower_uid, following_uid } = req.query;
            try {
                const result = yield db_1.default.query("SELECT * FROM user_follows WHERE follower_uid = $1 AND following_uid = $2", [follower_uid, following_uid]);
                const isFollowing = result.rows.length > 0;
                res.json({ isFollowing });
            }
            catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });
    }
    unfollow(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { follower_uid, following_uid } = req.body;
            try {
                yield db_1.default.query("DELETE FROM user_follows WHERE follower_uid = $1 AND following_uid = $2", [follower_uid, following_uid]);
                res.status(200).send("Unfollowed successfully.");
            }
            catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });
    }
    getFollowCounts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { uid } = req.query;
            try {
                const followersResult = yield db_1.default.query("SELECT COUNT(*) FROM user_follows WHERE following_uid = $1", [uid]);
                const followingResult = yield db_1.default.query("SELECT COUNT(*) FROM user_follows WHERE follower_uid = $1", [uid]);
                const followerCount = parseInt(followersResult.rows[0].count, 10);
                const followingCount = parseInt(followingResult.rows[0].count, 10);
                res.json({ followerCount, followingCount });
            }
            catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });
    }
}
exports.default = FollowingController;
