import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import upload from "../middleware/upload.middleware.js";
import { requireLogin } from "../middleware/auth.middleware.js";

const uploadRouter = Router();

uploadRouter.use(requireLogin);

uploadRouter.post(
  "/image",
  upload.single("image"),
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
      },
    });
  }
);

// Multer errors need a 4-arg handler; anything else falls through as 500.
uploadRouter.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large. Maximum size is 5MB.",
    });
  }

  if (error instanceof Error && error.message === "Only image files are allowed!") {
    return res.status(400).json({
      success: false,
      message: "Only image files (jpg, jpeg, png, gif, webp) are allowed.",
    });
  }

  res.status(500).json({
    success: false,
    message: "Server error during upload",
  });
});

export default uploadRouter;
