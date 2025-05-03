// server.js : Entrypoint
import express from 'express';
import dotenv from 'dotenv';
// import { connectDB } from './config/db.js';
// import router from "./routes/product.route.js";
import cors from "cors";

const PORT = process.env.PORT;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/", router)

app.get('/test', (req, res) => {
  try {
    res.send("Serving /test");
  } catch {
    console.error("Failed with error:", error.message);
  };
})

app.listen(PORT, () => {
  console.log("Server is running on PORT:", tempport);
});

