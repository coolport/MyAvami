export const requireLogin = (req, res, next) => {
  console.log("Session at requireLogin:", req.session);
  if (!req.session.user) {
    // console.log(req.session)
    return res.status(401).json({ message: "Unauthorized" });
  }
  console.log("LOGGED IN USER: ", req.session.user)
  next();
};

export const requireRole = (role) => {
  console.log("Session at requireROLE:", req.session);
  return (req, res, next) => {
    if (!req.session.user || req.session.user.role !== role) {
      // console.log(req.session)
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }
    console.log("LOGGED IN USER: ", req.session.user)
    next();
  };
};
