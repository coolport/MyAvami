// server.js : Entrypoint
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import productRouter from "./routes/product.route.js";
import userRouter from "./routes/user.route.js";
import cors from "cors";

// const PORT = process.env.PORT;
const PORT = 5555;
const app = express();

app.use(cors());
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

//pwede naman din ilagay actual routing dito
//but better if separated yung conerns like in this case
//where we have a routes dir and file
app.use("/products", productRouter)
app.use("/users", userRouter)

app.get('/test', (req, res) => {
  try {
    res.send("Serving /test. Server is up.");
  } catch (error) {
    console.error("Failed with error:", error.message);
  };
})

app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on PORT:", PORT);
});

