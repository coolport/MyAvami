import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
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
  }, {
  timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;

