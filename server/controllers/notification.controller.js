import Notification from '../models/notification.model.js';
import mongoose from 'mongoose';


export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({}); //returns all products, see docs for things u can {query}
    res.status(200).json({ success: true, data: notifications, string: "hi" });


  } catch (error) {
    console.error("Error fetching notifications: ", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const postNotifactions = async (req, res) => {
  const notification = req.body; //Return Value: Object 

  if (!notification.notificationType || !notification.notificationTitle || !notification.notificationMessage) {
    return res.status(400).json({ success: false, message: "Please provide all required fields" })
  }

  const newNotification = new Notification(notification)

  try {
    await newNotification.save();
    console.log('REQPARAMS: ', req.body);
    res.status(201).json({ success: true, data: newNotification });

  } catch (error) {
    console.error("Error in Creating Notification : ", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
    //you can chain this because .status() method returns a response object.
    //Status Code: 500
    //Headers: Content-Type: application/json
    //Body: '{ "success": false, "message": "Server Error" }'
  }

}

export const deleteNotification = async (req, res) => {
  const { id } = req.params; //get "dynamic" id via deconstruction
  console.log(req.params);
  console.log("id:", id);

  try {
    await Notification.findByIdAndDelete(id)
    console.log('REQPARAMS: ', req.params);
    res.status(200).json({ success: true, message: "Notification Deleted" });

  } catch (error) {
    console.error("Error: ", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
