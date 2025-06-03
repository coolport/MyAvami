import express from 'express';
// import { getProducts, postProducts, deleteProduct, putProduct } from '../controllers/product.controller.js';
import { getTransactions, postTransactions } from '../controllers/transaction.controller.js';

const transactionRouter = express.Router();

//Create routes
transactionRouter.get("/", getTransactions);
transactionRouter.post("/", postTransactions);
// transactionRouter.put("/:id", );
// transactionRouter.delete("/:id", );

export default transactionRouter;
