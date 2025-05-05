import express from 'express';
import { postUser, getUser } from '../controllers/user.controller.js';

const userRouter = express.Router();

//Create routes
userRouter.get("/", getUser);
userRouter.post("/", postUser);
// router.post("/", postProducts);
// router.put("/:id", putProduct);
// router.delete("/:id", deleteProduct);

export default userRouter;
