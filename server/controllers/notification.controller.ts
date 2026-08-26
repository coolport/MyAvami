import type { RequestHandler } from "express";
import Notification from "../models/notification.model.js";
import { isValidObjectId } from "../utils/validation.js";

export const getNotifications: RequestHandler = async (_req, res) => {
  try {
    const notifications = await Notification.find({});
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const postNotification: RequestHandler = async (req, res) => {
  const notification = req.body;

  if (
    !notification.notificationType ||
    !notification.notificationTitle ||
    !notification.notificationMessage
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  try {
    const newNotification = new Notification(notification);
    await newNotification.save();
    res.status(201).json({ success: true, data: newNotification });
  } catch (error) {
    console.error("Error in Creating Notification:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteNotification: RequestHandler = async (req, res) => {
  const { id } = req.params as { id: string };

  if (!isValidObjectId(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Notification Id" });
  }

  try {
    const deletedNotification = await Notification.findByIdAndDelete(id);

    if (!deletedNotification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, message: "Notification Deleted" });
  } catch (error) {
    console.error("Error deleting notification:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
