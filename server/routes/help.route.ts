import { Router } from "express";
import {
  getHelp,
  postHelp,
  putHelp,
  deleteHelp,
} from "../controllers/help.controller.js";
import { requireLogin } from "../middleware/auth.middleware.js";

const helpRouter = Router();

helpRouter.use(requireLogin);
helpRouter.get("/", getHelp);
helpRouter.post("/", postHelp);
helpRouter.put("/:id", putHelp);
helpRouter.delete("/:id", deleteHelp);

export default helpRouter;
