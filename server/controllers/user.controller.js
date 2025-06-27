import User from "../models/user.model.js";
import bcrypt from "bcrypt";

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
  const { userUsername, userPassword, userFullName, userRole } = user;

  if (!user.userUsername || !user.userPassword || !user.userFullName || !user.userRole) {
    return res.status(400).json({ success: false, message: "Please provide all fields" })
  }


  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userPassword, saltRounds);
    console.log("HASH: ", hashedPassword);

    //create new instance of User model using data received from the user request.
    //aka a document. an instandce of a model is a document. aka record. see model file docs
    //set new user but pass hashedPassword for usePassword.
    const newUser = new User(
      {
        userUsername,
        userPassword: hashedPassword,
        userFullName,
        userRole
      }
    );

    //not sure if this is needed kept it anyway
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

export const putUser = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: "Invalid user ID format" });
  }

  //if no errors hash pw before PUTting
  try {
    if (updateData.userPassword) {
      const saltRounds = 10;
      updateData.userPassword = await bcrypt.hash(updateData.userPassword, saltRounds);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log('Updated user:', updatedUser);
    res.status(200).json({ success: true, data: updatedUser });

  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  // Validate the ID format
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: "Invalid user ID format" });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log('Deleted user:', deletedUser);
    res.status(200).json({ success: true, message: "User deleted successfully", data: deletedUser });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
