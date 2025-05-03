// server.js : Entrypoint
import express from 'express';
import dotenv from 'dotenv';
// import { connectDB } from './config/db.js';
// import router from "./routes/product.route.js";
import cors from "cors";

const app = express();
const tempport = 5001;


app.get('/', (req, res) => {
  res.send("Hello World")
});

app.listen(tempport, () => {
  console.log("Server is running on PORT:", tempport);
});

