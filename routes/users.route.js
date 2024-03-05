"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = __importDefault(require("../controller/users.controller"));
const router = (0, express_1.Router)();
const usersController = new users_controller_1.default();
router.post("/users", usersController.createUser);
router.get("/users/:id", usersController.getOneUser);
router.get("/users", usersController.getUsers);
router.get("/users/uid/:uid", usersController.getOneUserByUid);
router.get("/searchUsers", usersController.getUsersBySearch);
router.get("/users/username/:username", usersController.getOneUserByUsername);
router.get("/username-available/:username", usersController.checkUsername);
router.put("/users/:uid", usersController.updateUser);
router.delete("/users/:id", usersController.deleteUser);
exports.default = router;
