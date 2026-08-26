import type { RequestHandler } from "express";
import bcrypt from "bcrypt";
import User from "../../models/user.model.js";
import type { SessionUser } from "../../utils/types.js";

export const loginUser: RequestHandler = async (req, res) => {
  const { userUsername, userPassword } = req.body;

  if (!userUsername || !userPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Missing credentials" });
  }

  try {
    const user = await User.findOne({ userUsername });

    // Same response for unknown username and wrong password to avoid
    // revealing which usernames exist.
    if (!user || !(await bcrypt.compare(userPassword, user.userPassword))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const sessionUser: SessionUser = {
      id: user._id.toString(),
      username: user.userUsername,
      role: user.userRole,
    };
    req.session.user = sessionUser;

    res.status(200).json({ success: true, message: "Login successful", user: sessionUser });
  } catch (error) {
    console.error("Login error:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
