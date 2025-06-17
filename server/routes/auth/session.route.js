import express from 'express';
import { getSessionUser } from '../../controllers/auth/session.controller.js';

const userSessionRouter = express.Router();

userSessionRouter.get("/me", getSessionUser);

export default userSessionRouter;
