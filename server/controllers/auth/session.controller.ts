import type { RequestHandler } from "express";
import type { SessionUser } from "../../utils/types.js";

export const getSessionUser: RequestHandler = (req, res) => {
  const user: SessionUser | undefined = req.session.user;
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  res.status(200).json({ user });
};
