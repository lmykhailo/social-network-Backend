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
class UsersController {
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, displayName, uid, photoURL, username } = req.body;
            try {
                const existingEntry = yield db_1.default.query("SELECT * FROM user_base WHERE uid = $1", [uid]);
                if (existingEntry.rows.length === 0) {
                    const newUser = yield db_1.default.query('INSERT INTO user_base (email, "displayName", uid, "photoURL", username) VALUES ($1, $2, $3, $4, $5) RETURNING *', [email, displayName, uid, photoURL, username]);
                    res.json(newUser.rows[0]);
                }
                else {
                    res.status(400).send("User already exists");
                }
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
    getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield db_1.default.query("SELECT * FROM user_base");
                res.json(users.rows);
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
    getUsersBySearch(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { searchQuery } = req.query;
            const limit = parseInt(req.query.limit) || 6;
            try {
                const users = yield db_1.default.query("SELECT * FROM user_base WHERE username ILIKE $1 LIMIT $2", [`%${searchQuery}%`, limit]);
                res.json(users.rows);
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
    getOneUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const users = yield db_1.default.query("SELECT * FROM user_base WHERE id = $1", [
                    id,
                ]);
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
    getOneUserByUid(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { uid } = req.params;
            try {
                const user = yield db_1.default.query("SELECT * FROM user_base WHERE uid = $1", [
                    uid,
                ]);
                if (user.rows.length === 0) {
                    return res.status(404).send("User not found");
                }
                res.json(user.rows[0]);
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
    getOneUserByUsername(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username } = req.params;
            try {
                const user = yield db_1.default.query("SELECT * FROM user_base WHERE username = $1", [username]);
                if (user.rows.length === 0) {
                    return res.status(404).send("User not found");
                }
                res.json(user.rows[0]);
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
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { uid } = req.params;
            const { email, displayName, photoURL, username } = req.body;
            try {
                const updatedUser = yield db_1.default.query('UPDATE user_base SET email = $1, "displayName" = $2,  "photoURL" = $4, username = $5 WHERE uid = $3 RETURNING *', [email, displayName, uid, photoURL, username]);
                res.json(updatedUser.rows[0]);
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
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                yield db_1.default.query("DELETE FROM user_base WHERE id = $1", [id]);
                res.json({ message: "User deleted" });
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
    checkUsername(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username } = req.params;
            try {
                const result = yield db_1.default.query("SELECT COUNT(*) FROM user_base WHERE username = $1", [username]);
                const isAvailable = result.rows[0].count === "0";
                res.json({ isAvailable });
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
exports.default = UsersController;
