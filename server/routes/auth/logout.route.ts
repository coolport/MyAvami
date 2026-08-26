import { Router } from "express";
import { logoutUser } from "../../controllers/auth/logout.controller.js";

const logoutRouter = Router();

logoutRouter.post("/", logoutUser);

export default logoutRouter;
