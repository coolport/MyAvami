import { Router } from "express";
import {
  getUser,
  postUser,
  putUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { requireLogin } from "../middleware/auth.middleware.js";

const userRouter = Router();

userRouter.use(requireLogin);
userRouter.get("/", getUser);
userRouter.post("/", postUser);
userRouter.put("/:id", putUser);
userRouter.delete("/:id", deleteUser);

export default userRouter;
