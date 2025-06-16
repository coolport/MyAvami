import User from "../models/user.model.js";
import mongoose from 'mongoose';


export const getUser = async (req, res) => {
  try {
    const users = await User.find({}); //returns all users, see docs for things u can {query}
    res.status(200).json({ success: true, data: users, string: "hi" });
    // res.status(200).json({ data: user });  trying this for json parse unexpected char at line 1 error in client


  } catch (error) {
    console.error("Error fetching users: ", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const postUser = async (req, res) => {
  const user = req.body; //Return Value: Object 
  // The req.body property is used to access the data sent by the client in POST requests. 

  if (!user.userUsername || !user.userPassword || !user.userFullName || !user.userRole) {
    return res.status(400).json({ success: false, message: "Please provide all fields" })
  }

  const newUser = new User(user)
  //create new instance of User model using data received from the user request.
  //aka a document. an instandce of a model is a document. aka record. see model file docs

  try {
    await newUser.save();
    console.log('REQPARAMS: ', req.params);
    res.status(201).json({ success: true, data: newUser });

  } catch (error) {
    console.error("Error in Create user: ", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
    //you can chain this because .status() method returns a response object.
    //Status Code: 500
    //Headers: Content-Type: application/json
    //Body: '{ "success": false, "message": "Server Error" }'
  }

}
