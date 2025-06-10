import express from 'express';
import { getNotifications, postNotifactions, deleteNotification } from '../controllers/notification.controller.js';


const notificationRouter = express.Router();

notificationRouter.get("/", getNotifications);
notificationRouter.post("/", postNotifactions);
notificationRouter.delete("/:id", deleteNotification);

export default notificationRouter;
