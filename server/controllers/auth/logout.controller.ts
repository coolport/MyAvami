import type { RequestHandler } from "express";

export const logoutUser: RequestHandler = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Logout failed" });
    }

    res.clearCookie("connect.sid");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  });
};
