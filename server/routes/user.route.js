import express from 'express';
import { postUser, putUser, getUser, deleteUser } from '../controllers/user.controller.js';

const userRouter = express.Router();

//Create routes
//make sure to pass as reference. error msg for calling controllers is vague
userRouter.get("/", getUser);
userRouter.post("/", postUser);
userRouter.put("/:id", putUser);

userRouter.delete("/:id", deleteUser);

export default userRouter;
