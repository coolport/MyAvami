export const getSessionUser = (req, res) => {
  if (req.session.user) {
    res.status(200).json({ user: req.session.user });
    console.log("Success USER: ", req.session.user)
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
};
