import express from "express";
import session from "express-session";
import cors from "cors";

import { config } from "./config/env.js";
import { connectDB } from "./config/db.js";

import productRouter from "./routes/product.route.js";
import userRouter from "./routes/user.route.js";
import transactionRouter from "./routes/transaction.route.js";
import notificationRouter from "./routes/notification.route.js";
import loginRouter from "./routes/auth/login.route.js";
import logoutRouter from "./routes/auth/logout.route.js";
import helpRouter from "./routes/help.route.js";
import sessionRouter from "./routes/auth/session.route.js";
import supplierRouter from "./routes/supplier.route.js";
import uploadRouter from "./routes/upload.route.js";

const app = express();

app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use(cors({ credentials: true, origin: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("public/uploads"));

// Request logging
app.use((req, _res, next) => {
  console.log(
    `New Request (${req.method}) to ${req.originalUrl}.`,
    new Date().toString()
  );
  next();
});

app.use("/products", productRouter);
app.use("/users", userRouter);
app.use("/transactions", transactionRouter);
app.use("/notifications", notificationRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/help", helpRouter);
app.use("/auth", sessionRouter);
app.use("/supplier", supplierRouter);
app.use("/upload", uploadRouter);

app.get("/test", (_req, res) => {
  res.send("Serving /test. Server is up.");
});

app.listen(config.port, () => {
  connectDB();
  console.log("Server is running on PORT:", config.port);
});
