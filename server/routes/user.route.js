import express from 'express';
import { postUser, putUser, getUser } from '../controllers/user.controller.js';

const userRouter = express.Router();

//Create routes
//make sure to pass as reference. error msg for calling controllers is vague
userRouter.get("/", getUser);
userRouter.post("/", postUser);
userRouter.put("/:id", putUser);

// router.delete("/:id", deleteProduct);

export default userRouter;
