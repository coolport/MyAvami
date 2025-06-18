export const logoutUser = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ success: false, message: "Logout failed" });
    }

    res.clearCookie("connect.sid"); // Clear the session cookie
    res.status(200).json({ success: true, message: "Logged out successfully" });
  });
};
