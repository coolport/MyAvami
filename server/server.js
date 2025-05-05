// server.js : Entrypoint
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import router from "./routes/product.route.js";
import userRouter from "./routes/user.route.js";
import cors from "cors";

// const PORT = process.env.PORT;
const PORT = 5555;
const app = express();

app.use(cors());
app.use(express.json());

//pwede naman din ilagay actual routing dito
//but better if separated yung conerns like in this case
//where we have a routes dir and file
app.use("/", router)
app.use("/users", userRouter)

app.get('/test', (req, res) => {
  try {
  } catch {
    res.send("Serving /test. Server is up.");
    console.error("Failed with error:", error.message);
  };
})

app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on PORT:", PORT);
});

