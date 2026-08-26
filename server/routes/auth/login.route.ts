import { Router } from "express";
import { loginUser } from "../../controllers/auth/login.controller.js";

const loginRouter = Router();

loginRouter.post("/", loginUser);

export default loginRouter;
