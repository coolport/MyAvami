import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = "./public/uploads";

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_IMAGE_TYPES = /jpeg|jpg|png|gif|webp/;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const extOk = ALLOWED_IMAGE_TYPES.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeOk = ALLOWED_IMAGE_TYPES.test(file.mimetype);

  if (mimeOk && extOk) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

export default upload;
