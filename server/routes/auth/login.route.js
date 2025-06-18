
import express from 'express';
import { loginUser } from '../../controllers/auth/login.controller.js';

const loginRouter = express.Router();

loginRouter.post("/", loginUser);

export default loginRouter;
