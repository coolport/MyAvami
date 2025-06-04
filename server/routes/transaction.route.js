import express from 'express';
import { getTransactions, postTransactions, deleteTransaction } from '../controllers/transaction.controller.js';

const transactionRouter = express.Router();

transactionRouter.get("/", getTransactions);
transactionRouter.post("/", postTransactions);
transactionRouter.delete("/:id", deleteTransaction); // Add this line

// wip
// transactionRouter.put("/:id", );

export default transactionRouter;
