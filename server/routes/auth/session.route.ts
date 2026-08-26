import { Router } from "express";
import { getSessionUser } from "../../controllers/auth/session.controller.js";

const sessionRouter = Router();

sessionRouter.get("/me", getSessionUser);

export default sessionRouter;
