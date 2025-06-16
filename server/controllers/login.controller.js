import User from "../models/user.model.js";
import bcrypt from "bcrypt";

export const loginUser = async (req, res) => {
  const { userUsername, userPassword } = req.body;

  if (!userUsername || !userPassword) {
    return res.status(400).json({ success: false, message: "Missing credentials" });
  }

  try {
    // 1st, find user by username
    const user = await User.findOne({ userUsername });
    if (!user) {
      return res.status(401).json({ success: false, message: "USERNAME NOT FOUND" });
    }

    // then, use bcrypt compare to compare entered pw with hashed pw
    const isMatch = await bcrypt.compare(userPassword, user.userPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "INCORRECT PASSWORD" });
    }

    //response object
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.userUsername,
        fullName: user.userFullName,
        role: user.userRole,
      },
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
