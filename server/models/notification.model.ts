import mongoose from "mongoose";

export interface INotification {
  notificationType: string;
  notificationTitle: string;
  notificationMessage: string;
  notificationUserInvolved?: string;
  notificationItemInvolved?: string;
}

const notificationSchema = new mongoose.Schema<INotification>(
  {
    notificationType: {
      type: String,
      required: true,
    },
    notificationTitle: {
      type: String,
      required: true,
    },
    notificationMessage: {
      type: String,
      required: true,
    },
    notificationUserInvolved: {
      type: String,
      required: false,
    },
    notificationItemInvolved: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);

export default Notification;
