// server.js : Entrypoint
import express from 'express';

// dont forget to use for prod
// import dotenv from 'dotenv';

import { connectDB } from './config/db.js';

import productRouter from "./routes/product.route.js";
import userRouter from "./routes/user.route.js";
import transactionRouter from './routes/transaction.route.js';
import notificationRouter from './routes/notification.route.js';
import loginRouter from './routes/login.route.js';


import session from "express-session";
import cors from "cors";

// const PORT = process.env.PORT;
const PORT = 5555;
const app = express();


app.use(
  session({
    secret: "TEMPSECRET",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 1, // 1 hour
      sameSite: "lax"
    },
  })
);

// app.use(cors());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true               //  allow cookies to be sent
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  // TODO: move to middlewares as proper logger. +needs more info below etc
  // Random logging middleware to log timestamp on every request. 
  // without mount ('/endpoint', (reqresnext)) aka an endpoint, middlewares
  // just run everytime a request is made on the whole serv regardless of endpoint. 
  const reqEndpoint = req.originalUrl;
  const reqMethod = req.method;
  console.log();

  const datenow = Date.now();
  // New Request: 1748780063871
  const date = new Date(datenow)
  // New Request:  2025-06-01T12:15:18.405Z
  console.log(`New Request (${reqMethod}) to ${reqEndpoint}.`, date.toString());
  next();
});

// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
//   next();
// });

// Mount x routing to these endpoints
// signature is like ("endpoint", middleware/router)
app.use("/products", productRouter)
app.use("/users", userRouter)
app.use("/transactions", transactionRouter)
app.use("/notifications", notificationRouter)
app.use("/login", loginRouter)

app.get('/test', (req, res) => {
  try {
    res.send("Serving /test. Server is up.");
  } catch (error) {
    console.error("Failed with error:", error.message);
  };
})



// let visits = 0;
// app.get('/', (req, res) => {
//   console.log("loaded")
//   visits += 1;
//   console.log(visits);
//   try {
//     res.json({ success: true, visits });
//   } catch (error) {
//     console.error("Error fetching: ", error.message);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// })



app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on PORT:", PORT);
});

