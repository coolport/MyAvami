import { Router } from "express";
import {
  getNotifications,
  postNotification,
  deleteNotification,
} from "../controllers/notification.controller.js";
import { requireLogin } from "../middleware/auth.middleware.js";

const notificationRouter = Router();

notificationRouter.use(requireLogin);
notificationRouter.get("/", getNotifications);
notificationRouter.post("/", postNotification);
notificationRouter.delete("/:id", deleteNotification);

export default notificationRouter;
