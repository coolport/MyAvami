import express from 'express';
import { logoutUser } from '../../controllers/auth/logout.controller.js';

const logoutRouter = express.Router();

logoutRouter.post("/", logoutUser);

export default logoutRouter;
