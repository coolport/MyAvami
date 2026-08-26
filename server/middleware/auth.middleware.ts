import type { RequestHandler } from "express";
import type { SessionUser } from "../utils/types.js";

declare module "express-session" {
  interface SessionData {
    user?: SessionUser;
  }
}

export const requireLogin: RequestHandler = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export const requireRole =
  (role: SessionUser["role"]): RequestHandler =>
  (req, res, next) => {
    if (!req.session.user || req.session.user.role !== role) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }
    next();
  };
