import express from 'express';
import { postHelp, putHelp, deleteHelp, getHelp } from '../controllers/help.controller.js';
import { requireLogin, requireRole } from '../middleware/auth.middleware.js';

const helpRouter = express.Router();

// helpRouter.get("/", requireLogin, getHelp);
//eto yung nasa normal help
helpRouter.get("/", getHelp);

//eto uutilize ng maintenance
helpRouter.post("/", postHelp);
helpRouter.put("/:id", putHelp);
helpRouter.delete("/:id", deleteHelp);

export default helpRouter;
