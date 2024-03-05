import { Router } from "express";
import UsersController from "../controller/users.controller";

const router = Router();
const usersController = new UsersController();

router.post("/users", usersController.createUser);
router.get("/users/:id", usersController.getOneUser);
router.get("/users", usersController.getUsers);
router.get("/users/uid/:uid", usersController.getOneUserByUid);
router.get("/searchUsers", usersController.getUsersBySearch);
router.get("/users/username/:username", usersController.getOneUserByUsername);
router.get("/username-available/:username", usersController.checkUsername);
router.put("/users/:uid", usersController.updateUser);
router.delete("/users/:id", usersController.deleteUser);

export default router;
