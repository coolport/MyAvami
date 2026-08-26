import { Router } from "express";
import {
  getTransactions,
  postTransactions,
  deleteTransaction,
} from "../controllers/transaction.controller.js";
import { requireLogin } from "../middleware/auth.middleware.js";

const transactionRouter = Router();

transactionRouter.use(requireLogin);
transactionRouter.get("/", getTransactions);
transactionRouter.post("/", postTransactions);
transactionRouter.delete("/:id", deleteTransaction);

export default transactionRouter;
